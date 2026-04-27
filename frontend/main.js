let currentSTLFile = null;

let scene, camera, renderer, mesh, controls;
let sliceLines = [];

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x001f3f);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 100);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("viewer").appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0x404040, 0.6));

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Grid
  scene.add(new THREE.GridHelper(200, 20, 0xff6600, 0xff6600));

  // Axes
  scene.add(new THREE.AxesHelper(50));

  // File input
  document.getElementById("file-input").addEventListener("change", loadSTL);

  // Slice button
  document.getElementById("slice-btn").addEventListener("click", () => {
    sliceModelLocal();
    sliceModelServer();
  });

  animate();
}

function loadSTL(event) {
  const file = event.target.files[0];
  if (!file) return;

  currentSTLFile = file;
  document.getElementById("file-name").textContent = file.name;

  const reader = new FileReader();

  reader.onload = function (e) {
    const loader = new THREE.STLLoader();
    const geometry = loader.parse(e.target.result);

    if (mesh) {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }

    const material = new THREE.MeshLambertMaterial({ color: 0x888888 });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    geometry.computeBoundingBox();

    const center = geometry.boundingBox.getCenter(new THREE.Vector3());
    mesh.position.sub(center);

    const size = geometry.boundingBox.getSize(new THREE.Vector3());
    camera.position.z = Math.max(size.x, size.y, size.z) * 1.5;
  };

  reader.readAsArrayBuffer(file);
}

function sliceModelLocal() {
  const layerHeight = parseFloat(
    document.getElementById("layer-height").value
  );

  if (!mesh) {
    alert("Please load an STL file first");
    return;
  }

  clearSliceLines();

  const box = new THREE.Box3().setFromObject(mesh);
  const minZ = box.min.z;
  const maxZ = box.max.z;

  const totalHeight = maxZ - minZ;
  const numLayers = Math.ceil(totalHeight / layerHeight);

  for (let i = 0; i <= numLayers; i++) {
    const z = minZ + i * layerHeight;
    const intersections = computeSliceAtZ(z);

    if (intersections.length > 0) {
      createSliceLineVisual(intersections, z);
    }
  }

  alert(`Slicing complete!\nLayers: ${numLayers}`);
}

function computeSliceAtZ(z) {
  const intersections = [];
  const geometry = mesh.geometry;

  const pos = geometry.getAttribute("position");
  const index = geometry.getIndex();

  if (!pos) return intersections;

  const vertices = pos.array;
  const indices = index ? index.array : null;

  const triCount = indices ? indices.length / 3 : vertices.length / 9;

  for (let t = 0; t < triCount; t++) {
    let v0, v1, v2;

    if (indices) {
      v0 = getVertex(vertices, indices[t * 3]);
      v1 = getVertex(vertices, indices[t * 3 + 1]);
      v2 = getVertex(vertices, indices[t * 3 + 2]);
    } else {
      v0 = getVertex(vertices, t * 3);
      v1 = getVertex(vertices, t * 3 + 1);
      v2 = getVertex(vertices, t * 3 + 2);
    }

    const seg = computeTrianglePlaneIntersection(v0, v1, v2, z);
    if (seg) intersections.push(seg);
  }

  return intersections;
}

function getVertex(arr, i) {
  return {
    x: arr[i * 3],
    y: arr[i * 3 + 1],
    z: arr[i * 3 + 2],
  };
}

function computeTrianglePlaneIntersection(v0, v1, v2, z) {
  const above = [];
  const below = [];

  [v0, v1, v2].forEach((v) => (v.z > z ? above.push(v) : below.push(v)));

  if (above.length === 0 || below.length === 0) return null;

  const pts = [];

  const add = (a, b) => {
    const p = linePlaneIntersection(a, b, z);
    if (p) pts.push(p);
  };

  if (above.length === 1) {
    add(above[0], below[0]);
    add(above[0], below[1]);
  } else {
    add(below[0], above[0]);
    add(below[0], above[1]);
  }

  if (pts.length === 2) {
    return [
      pts[0].x,
      pts[0].y,
      z,
      pts[1].x,
      pts[1].y,
      z,
    ];
  }

  return null;
}

function linePlaneIntersection(v1, v2, z) {
  const dz = v2.z - v1.z;
  if (Math.abs(dz) < 1e-6) return null;

  const t = (z - v1.z) / dz;
  if (t < 0 || t > 1) return null;

  return {
    x: v1.x + t * (v2.x - v1.x),
    y: v1.y + t * (v2.y - v1.y),
    z,
  };
}

function createSliceLineVisual(intersections, z) {
  const material = new THREE.LineBasicMaterial({
    color: 0x00ff00,
  });

  const offset = 0.2; // prevents flicker

  intersections.forEach((line) => {
    const geometry = new THREE.BufferGeometry();

    const p1 = new THREE.Vector3(line[0], line[1], z + offset);
    const p2 = new THREE.Vector3(line[3], line[4], z + offset);

    geometry.setFromPoints([p1, p2]);

    const lineObj = new THREE.Line(geometry, material);
    scene.add(lineObj);

    sliceLines.push(lineObj);
  });
}

function clearSliceLines() {
  sliceLines.forEach((l) => {
    scene.remove(l);
    l.geometry.dispose();
    l.material.dispose();
  });

  sliceLines = [];
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

async function sliceModelServer() {
  const layerHeight = parseFloat(
    document.getElementById("layer-height").value
  );

  if (!currentSTLFile) return;

  const formData = new FormData();
  formData.append("model", currentSTLFile);
  formData.append("layerHeight", layerHeight);

  try {
    const res = await fetch("http://localhost:3001/slice", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Slicing failed");

    const blob = await res.blob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.gcode";
    a.click();
  } catch (e) {
    console.error(e);
    alert("Server slicing failed");
  }
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();