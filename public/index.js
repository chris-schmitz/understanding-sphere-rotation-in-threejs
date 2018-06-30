// TODO: Clean this all up.
// ! This should be rewritten so it's all self contained and can be detached
// ! from the window. Right now functions like `animate` rely on the global
// ! instance of the objects. Once you have this functional, come back and
// ! clean it up

const ROTATION_OFFSET = 0

function init() {
  const raycaster = new THREE.Raycaster()

  const camera = (window.camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1100
  ))

  const controls = (window.controls = addControls(camera))

  const scene = (window.scene = new THREE.Scene())

  const geometry = new THREE.SphereBufferGeometry(500, 60, 40)
  geometry.scale(-1, 1, 1)

  const material = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(
      "js/three/examples/textures/2294472375_24a3b8ef46_o.jpg"
    )
  })

  const sphere = (window.sphere = new THREE.Mesh(geometry, material))
  scene.add(sphere)

  const helperGeometry = new THREE.BoxBufferGeometry(100, 100, 100, 4, 4, 4)
  const helperMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    wireframe: true
  })
  const helper = new THREE.Mesh(helperGeometry, helperMaterial)
  scene.add(helper)

  const renderer = (window.renderer = new THREE.WebGLRenderer({
    antialias: true
  }))
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  document.body.appendChild(renderer.domElement)

  window.addEventListener("resize", onWindowResize, false)
}

function animate() {
  window.requestAnimationFrame(animate)
  controls.update()
  //   sphere.rotateY(0.01)
  renderer.render(scene, camera)
}

function addControls(camera) {
  if (onMobile()) {
    controls = new THREE.DeviceOrientationControls(camera)
  } else {
    controls = new THREE.OrbitControls(camera)

    // ? I still don't really understand why I need to add this 0.1. I get that it's the
    // ? step size when we're rotating, but _why is it needed?!?!?!_
    const stepSize = 0.1

    // * Note that if you're wanting a "I'm in the center of the sphere looking around"
    // * setup you have to set the controls target to the position of the camera. Check the
    // * docs here: https://threejs.org/docs/#examples/controls/OrbitControls.target
    controls.target.set(
      camera.position.x + stepSize,
      camera.position.y,
      camera.position.z
    )
    controls.update()
  }
  return controls
}

function determineCurrentCameraDirection(camera) {
  // * Algorithm figured out by Andy Wise

  // * Create a new vector that we can use to calculate the desired angle
  // ? Why do we need the negative one?!?!?!?!?!?
  const vector = new THREE.Vector3(0, 0, -1)

  // * Use the camera's current rotation quaternion to update the rotation of the vector
  vector.applyQuaternion(camera.quaternion)

  // * Calculate an angle using spherical math (radius, phi and theta).
  var angle = new THREE.Spherical()
    .setFromVector3(vector) // * use the vector loaded with the camera's rotation cooridinates in quaternion form (we may be able to cut lines by converting directly from camera here)
    .makeSafe().theta // ? Make safe "Restricts the polar angle phi to be between 0.000001 and pi - 0.000001". I still don't grok why this is needed exactly //* use the theta degree (the angle of rotation in radians from the x axis to the desired point). right now we only care about theta, but if we want full rotation we may want to account for phi too

  // * Convert the angle from polar(spherical: phi, theta, rho) mesurements to degrees
  var angleDeg = 90 - THREE.Math.radToDeg(angle)

  // * Our angle mapped to 360 degrees
  const currentCameraDirectionInDegrees = normalizeAngle(angleDeg)

  return currentCameraDirectionInDegrees
}

/**
 * normalizeAngle Maps a particular angle to a specific scale. In this case
 * we're dealing with a sphere so our scale is hard coded to 360 degrees. This
 * function takes an angle (which could extend beyond the scale) and maps it within
 * that scale range.
 *
 * E.g. if we had an angle of 540 degrees (360 + 180, i.e. turning a full circle and a half)
 * we wouldn't necessarily want to have our sphere roate a full time and a half, we just need
 * to know where we would be pointing after rotating within our scale (360).
 *
 * @param {*} angle: The angle in degrees to map
 * @return float: the angle in degrees mapped to our scale
 */
function normalizeAngle(angle) {
  const scale = 360
  return ((angle % scale) + scale) % scale
}

function rotateToTarget(
  sphere = null,
  currentCameraDirection = null,
  x = null
) {
  const newY =
    -THREE.Math.degToRad(currentCameraDirection) +
    THREE.Math.degToRad(x) +
    ROTATION_OFFSET

  console.group(`Rotating sphere Target`)
  console.log("currentCameraDirectionInDegrees: " + currentCameraDirection)
  console.log("x: " + x)
  console.log("current Sphere Y: " + sphere.rotation.y)
  console.log("newY: " + newY)
  console.groupEnd()

  sphere.rotation.y = newY
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onMobile() {
  var check = false
  ;(function(a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true
  })(navigator.userAgent || navigator.vendor || window.opera)
  return check
}

init()
animate()

let currentX = 0

/**
 * Now that we have everything set up, let's test our targeted rotation.
 * We have a set of `xValues` which are degrees that we want to rotate the sphere
 * around relative to its start (0)
 *
 * We can set any number of different degree angles in the array, but we'll start
 * out by trying to rotate around 90 degree increments of the sphere, i.e.:
 * `const xValues = [0, 90, 180, 270]`
 */
setInterval(() => {
  const currentCameraDirection = determineCurrentCameraDirection(window.camera)
  const xValues = [0, 90, 180, 270]

  console.group("Calling Rotate to target")
  console.log("rotate to: " + xValues[currentX])
  console.log("current camera direction: " + currentCameraDirection)
  console.groupEnd()
  rotateToTarget(window.sphere, currentCameraDirection, currentX)

  currentX = currentX < xValues.length - 1 ? currentX + 1 : 0
}, 1000)
