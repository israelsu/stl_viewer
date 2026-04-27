Units: mmUnits: mm// No imports needed, using global THREE

let scene, camera, renderer, mesh, controls;
let sliceLines = []; // Store slice line segments for visualization

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

  // Slice button
  document.getElementById('slice-btn').addEventListener('click', sliceModel);

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

function sliceModel() {
  const layerHeight = parseFloat(document.getElementById('layer-height').value);
  console.log('Slicing with layer height:', layerHeight, 'mm');
  
  if (!mesh) {
    alert('Please load an STL file first');
    return;
  }
  
  // Clear previous slice lines
  clearSliceLines();
  
  // Get mesh bounds
  const box = new THREE.Box3().setFromObject(mesh);
  const minZ = box.min.z;
  const maxZ = box.max.z;
  const totalHeight = maxZ - minZ;
  const numLayers = Math.ceil(totalHeight / layerHeight);
  
  console.log('Model height:', totalHeight.toFixed(2), 'mm');
  console.log('Number of layers:', numLayers);
  
  // Slice at each layer
  for (let i = 0; i <= numLayers; i++) {
    const sliceZ = minZ + i * layerHeight;
    const intersections = computeSliceAtZ(sliceZ);
    
    if (intersections.length > 0) {
      createSliceLineVisual(intersections, sliceZ);
    }
  }
  
  alert(`Slicing complete!\nLayer height: ${layerHeight}mm\nTotal layers: ${numLayers}`);
}

/**
 * Compute intersection lines at a specific Z height (horizontal plane)
 * @param {number} z - The Z height of the slicing plane
 * @returns {Array} - Array of line segments [[x1,y1,z1,x2,y2,z2], ...]
 */
function computeSliceAtZ(z) {
  const intersections = [];
  const geometry = mesh.geometry;
  const positionAttr = geometry.getAttribute('position');
  const indexAttr = geometry.getIndex();
  
  if (!positionAttr) return intersections;
  
  const vertices = positionAttr.array;
  const indices = indexAttr ? indexAttr.array : null;
  
  // Process each triangle
  const triangleCount = indices ? indices.length / 3 : vertices.length / 9;
  
  for (let t = 0; t < triangleCount; t++) {
    // Get the 3 vertices of this triangle
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
    
    // Check if the slicing plane intersects this triangle
    const intersection = computeTrianglePlaneIntersection(v0, v1, v2, z);
    
    if (intersection) {
      intersections.push(intersection);
    }
  }
  
  return intersections;
}

/**
 * Get vertex coordinates from the position array
 */
function getVertex(vertices, index) {
  return {
    x: vertices[index * 3],
    y: vertices[index * 3 + 1],
    z: vertices[index * 3 + 2]
  };
}

/**
 * Compute where a horizontal plane at height Z intersects a triangle
 * Returns null if no intersection, or [x1,y1,z,x2,y2,z] line segment
 */
function computeTrianglePlaneIntersection(v0, v1, v2, z) {
  // Check which vertices are above and below the plane
  const above = [];
  const below = [];
  
  if (v0.z > z) above.push(v0);
  else below.push(v0);
  
  if (v1.z > z) above.push(v1);
  else below.push(v1);
  
  if (v2.z > z) above.push(v2);
  else below.push(v2);
  
  // No intersection if all vertices on same side
  if (above.length === 0 || below.length === 0) {
    return null;
  }
  
  // Line segment from intersection of plane with triangle edges
  let intersectionPoints = [];
  
  if (above.length === 1) {
    // One vertex above, two below
    const top = above[0];
    const bot1 = below[0];
    const bot2 = below[1];
    
    const p1 = linePlaneIntersection(top, bot1, z);
    const p2 = linePlaneIntersection(top, bot2, z);
    
    if (p1 && p2) {
      intersectionPoints = [p1, p2];
    }
  } else if (below.length === 1) {
    // Two vertices above, one below
    const bot = below[0];
    const top1 = above[0];
    const top2 = above[1];
    
    const p1 = linePlaneIntersection(top1, bot, z);
    const p2 = linePlaneIntersection(top2, bot, z);
    
    if (p1 && p2) {
      intersectionPoints = [p1, p2];
    }
  }
  
  if (intersectionPoints.length === 2) {
    return [
      intersectionPoints[0].x, intersectionPoints[0].y, z,
      intersectionPoints[1].x, intersectionPoints[1].y, z
    ];
  }
  
  return null;
}

/**
 * Compute intersection of a line segment with a horizontal plane at height Z
 */
function linePlaneIntersection(v1, v2, z) {
  const dz = v2.z - v1.z;
  
  if (Math.abs(dz) < 0.0001) return null; // Parallel to plane
  
  const t = (z - v1.z) / dz;
  
  if (t < 0 || t > 1) return null; // Intersection outside segment
  
  return {
    x: v1.x + t * (v2.x - v1.x),
    y: v1.y + t * (v2.y - v1.y),
    z: z
  };
}

/**
 * Create visual representation of slice lines
 */
function createSliceLineVisual(intersections, z) {
  const material = new THREE.LineBasicMaterial({ 
    color: 0x00ff00,
    linewidth: 2
  });
  
  intersections.forEach(line => {
    const geometry = new THREE.BufferGeometry();
    const points = [
      new THREE.Vector3(line[0], line[1], line[2]),
      new THREE.Vector3(line[3], line[4], line[5])
    ];
    
    geometry.setFromPoints(points);
    
    const lineObj = new THREE.Line(geometry, material);
    scene.add(lineObj);
    sliceLines.push(lineObj);
  });
}

/**
 * Clear all slice line visualizations
 */
function clearSliceLines() {
  sliceLines.forEach(line => {
    scene.remove(line);
    line.geometry.dispose();
    line.material.dispose();
  });
  sliceLines = [];
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