import http from "http";
import fs from "fs";
import path from "path";

const PORT = 3000;

const server = http.createServer((req, res) =>
{
  let filePath = "." + req.url;
  if (filePath === "./") filePath = "./index.html";

  const ext = path.extname(filePath);

  const contentTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
  };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("404");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "text/plain",
    });

    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});