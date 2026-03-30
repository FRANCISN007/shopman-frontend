const express = require("express");
const path = require("path");

const app = express();

// Serve static files from React build
app.use(express.static(path.join(__dirname, "build")));

// Catch all routes and return React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
