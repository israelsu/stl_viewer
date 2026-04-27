const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// ----------------------
// 📁 Serve FRONTEND
// ----------------------
app.use(
  express.static(path.join(__dirname, "../frontend"))
);

// force root -> index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ----------------------
// 📤 upload handler
// ----------------------
const upload = multer({ dest: "uploads/" });

app.post("/slice", upload.single("model"), (req, res) => {
  console.log("Received file:", req.file);
  console.log("Layer height:", req.body.layerHeight);

  // TODO: call Cura Engine here

  res.send("OK (replace with G-code later)");
});

// ----------------------
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});