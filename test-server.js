const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Test server running" });
});

app.get("/v1/upload/store-icon", (req, res) => {
  res.json({ message: "Upload endpoint test" });
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
