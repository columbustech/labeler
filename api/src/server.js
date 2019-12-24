const express = require('express');
const server = express();
const port = 8001;

server.get("/api/json", (req, res) => {
  res.json({message: "Hello world" });
});

server.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
