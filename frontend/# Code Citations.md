# Code Citations

## License: unknown
https://github.com/mozilla/gecko-dev/blob/c76a5a14048507dbdea07eafb56deefc05befe55/browser/components/backup/content/debug.html

```
To create a fresh application that reads STL files and displays the G-code in 3D, here's a complete setup:

### `index.html`
```html
<!-- filepath: f:\lior\GIT\stl_viewer-1\index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>STL to G-Code Viewer</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        color: #333;
      }
      #app {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
      }
      #controls {
        padding: 15px;
        background-color: #ff6600;
        color: white;
        display: flex;
        align-items: center;
        gap: 15px;
      }
      #file-input {
        background-color: white;
        color: #333;
        padding: 8px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      #generate-btn {
        background-color: white;
        color: #ff6600;
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      }
      #generate-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      #viewer {
        flex: 1;
        position: relative;
        border: 5px solid black;
      }
      #info {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: rgba(255, 102, 0, 0.9);
        color: white;
        padding: 10px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div id="app">
      <div id="controls">
        <label for="file-input">Upload STL File:</label>
        <input type="file" id="file-input" accept=".stl" />
        <button id="generate-btn" disabled>Generate G-Code</button>
        <span id="file-name" style="font-weight: bold;"></span>
      </div>
      <div id="viewer"></div>
      <div id="info">Units: mm</div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r162/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.162.0/examples/js/loaders/STLLoader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.162.0/examples/js/controls/OrbitControls.js"></script>
    <script src="/src/main.js"></script>
  </body>
</html>
```

### `/src/main.js`
```javascript
// filepath: f:\lior\GIT\stl_viewer-1\src/main.js
let scene, camera, renderer, mesh, controls, gcodeMesh;
let selectedFile = null;

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4f4f4);

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
```


## License: unknown
https://github.com/mozilla/gecko-dev/blob/c76a5a14048507dbdea07eafb56deefc05befe55/browser/components/backup/content/debug.html

```
To create a fresh application that reads STL files and displays the G-code in 3D, here's a complete setup:

### `index.html`
```html
<!-- filepath: f:\lior\GIT\stl_viewer-1\index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>STL to G-Code Viewer</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        color: #333;
      }
      #app {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
      }
      #controls {
        padding: 15px;
        background-color: #ff6600;
        color: white;
        display: flex;
        align-items: center;
        gap: 15px;
      }
      #file-input {
        background-color: white;
        color: #333;
        padding: 8px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      #generate-btn {
        background-color: white;
        color: #ff6600;
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      }
      #generate-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      #viewer {
        flex: 1;
        position: relative;
        border: 5px solid black;
      }
      #info {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: rgba(255, 102, 0, 0.9);
        color: white;
        padding: 10px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div id="app">
      <div id="controls">
        <label for="file-input">Upload STL File:</label>
        <input type="file" id="file-input" accept=".stl" />
        <button id="generate-btn" disabled>Generate G-Code</button>
        <span id="file-name" style="font-weight: bold;"></span>
      </div>
      <div id="viewer"></div>
      <div id="info">Units: mm</div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r162/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.162.0/examples/js/loaders/STLLoader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.162.0/examples/js/controls/OrbitControls.js"></script>
    <script src="/src/main.js"></script>
  </body>
</html>
```

### `/src/main.js`
```javascript
// filepath: f:\lior\GIT\stl_viewer-1\src/main.js
let scene, camera, renderer, mesh, controls, gcodeMesh;
let selectedFile = null;

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4f4f4);

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
```

