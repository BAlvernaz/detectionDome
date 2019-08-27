const video = document.getElementById("video");
const testDiv = document.getElementById("test");
// Face Detection

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models/"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models/"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models/"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models/"),
  faceapi.nets.ageGenderNet.loadFromUri("./models/")
]).then(initVideo);

// Face Detection and Emotion Detect

video.addEventListener("play", () => {
  setInterval(async () => {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
			.withAgeAndGender();
			console.log(detections)
    if (detections) {
			const startingModel = scene.getObjectByName('header')
			const startingtext = "Your Results"
			const startingname = "header"
			const startingxloc = -670
			const startingyloc = 350
			if (startingModel) {
				scene.remove(startingModel)
				animate()
			}
			initText(startingtext, startingname, startingxloc, startingyloc )
      if (detections.age) {
				const xloc = -670
				const yloc = -50
   			const name = "ageModel";
				const text = `Age: ${Math.floor(detections.age)}`
        const existingModel = scene.getObjectByName(name);
        if (existingModel) {
          scene.remove(existingModel);
          animate();
        }
        initText(text, name, xloc, yloc);
			}
			if(detections.gender) {
				const xloc = 0
				const yloc = -50
				const name = "genderModel"
				const text = `Gender: ${detections.gender}`
				const existingModel = scene.getObjectByName(name)
				if(existingModel) {
					scene.remove(existingModel)
					animate()
				}
				initText(text, name, xloc, yloc)
			}
			if(detections.expressions) {
				const keyArr = Object.keys(detections.expressions)
				const emotion = keyArr.find(key => detections.expressions[key] * 100 > 90 )
				const xloc = -670
				const yloc = -400
				const name = "emotion"
				const text = `Feeling: ${emotion}`
				const existingModel = scene.getObjectByName(name)
				if(existingModel) {
					scene.remove(existingModel)
					animate()
				}
				initText(text, name, xloc, yloc)
			}
    } else {
			const text = "Gathering Results"
			const name = "header"
			const xloc = -670
			const yloc = 350
			const existingModel = scene.getObjectByName(name)
				if(existingModel) {
					scene.remove(existingModel)
					animate()
				}
			initText(text,name, xloc, yloc)
		}
  }, 10000);
});

// AR Setup

// initVideo();
// animateVideo();

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1500
);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function initVideo() {
  const texture = new THREE.VideoTexture(video);
  const geometry = new THREE.PlaneBufferGeometry(16, 9);
  geometry.scale(0.5, 0.5, 0.5);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const count = 128;
  const radius = 32;

  for (var i = 1, l = count; i <= l; i++) {
    const phi = Math.acos(-1 + (2 * i) / l);
    const theta = Math.sqrt(l * Math.PI) * phi;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.setFromSphericalCoords(radius, phi, theta);
    mesh.lookAt(camera.position);
    scene.add(mesh);
  }

  window.addEventListener("resize", onWindowResize, false);
  //
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const constraints = {
      video: { width: 1280, height: 720, facingMode: "user" }
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function(stream) {
        // apply the stream to the video element used in the texture
        video.srcObject = stream;
        video.play();
      })
      .catch(function(error) {
        console.error("Unable to access the camera/webcam.", error);
      });
  } else {
    console.error("MediaDevices interface not available.");
  }
  animate();
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
	requestAnimationFrame(animate);
	const header = scene.getObjectByName('header')
	if(header) {
	header.rotation.x += .07
	}
  render();
}
function render() {
  renderer.render(scene, camera);
}

function initText(values, name, xloc, yloc) {
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
  dirLight.position.set(0, 0, 1).normalize();
  scene.add(dirLight);

  var pointLight = new THREE.PointLight(0xffffff, 1.5);
  pointLight.position.set(0, 100, 90);
  scene.add(pointLight);
  pointLight.color.setHSL(Math.random(), 1, 0.5);
  const loader = new THREE.FontLoader();
  loader.load("fonts/optimer_regular.typface.json", font => {
    var geometry = new THREE.TextGeometry(values, {
      font: font,
      size: 100,
      height: 5,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 10,
      bevelSize: 8,
      bevelOffset: 0,
      bevelSegments: 5
    });
    geometry.computeBoundingBox();
    geometry.computeVertexNormals();

    const materials = [
      new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    ];

    var text = new THREE.Mesh(geometry, materials);
		text.position.set(xloc, yloc, -1050);
		text.rotation.x += .1
    text.name = name;

    scene.add(text);
    animate();
  });
}
