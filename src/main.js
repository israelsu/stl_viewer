Units: mmUnits: mm// No imports needed, using global THREE

let scene, camera, renderer, mesh, controls;

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x001f3f); // dark blue

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 100);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('viewer').appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Grid
  const gridHelper = new THREE.GridHelper(200, 20, 0xff6600, 0xff6600);
  scene.add(gridHelper);

  // Axes
  const axesHelper = new THREE.AxesHelper(50);
  scene.add(axesHelper);

  // File input
  document.getElementById('file-input').addEventListener('change', loadSTL);

  animate();
}

function loadSTL(event) {
  const file = event.target.files[0];
  if (!file) return;

  document.getElementById('file-name').textContent = file.name;

  const reader = new FileReader();
  reader.onload = function(e) {
    const loader = new THREE.STLLoader();
    const geometry = loader.parse(e.target.result);

    // Remove previous mesh
    if (mesh) {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }

    // Create material
    const material = new THREE.MeshLambertMaterial({ color: 0x888888 });

    // Create mesh
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Center the mesh
    geometry.computeBoundingBox();
    const center = geometry.boundingBox.getCenter(new THREE.Vector3());
    mesh.position.sub(center);

    // Adjust camera to fit
    const size = geometry.boundingBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = maxDim * 1.5;
  };
  reader.readAsArrayBuffer(file);
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();