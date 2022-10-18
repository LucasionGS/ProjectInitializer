const cp = require("child_process");
const Path = require("path");
const fs = require("fs");

const server = cp.spawn("node", ["../node_modules/.bin/tsc"], {
  stdio: "inherit",
  cwd: Path.resolve(__dirname, "server"),
});

server.on("close", (code) => {
  if (code === 0) {
    const buildPath = Path.resolve(__dirname, "build");
    if (fs.existsSync(buildPath)) {
      fs.rmdirSync(buildPath, { recursive: true });
    }

    fs.mkdirSync(buildPath, { recursive: true });
    // Copy everything recursively from server/dist to build
    copyDir(Path.resolve(__dirname, "server/dist"), buildPath);
    copyDir(Path.resolve(__dirname, "node_modules"), buildPath + "/node_modules");

    // Build client
    const react = cp.spawn("npm", ["run", "build"], {
      stdio: "inherit",
      cwd: Path.resolve(__dirname, "client"),
    });

    react.on("close", (code) => {
      if (code === 0) {
        // Copy everything recursively from client/build to build
        const publicPath = Path.resolve(__dirname, "build/public");
        if (fs.existsSync(publicPath)) {
          fs.rmdirSync(publicPath, { recursive: true });
        }
        fs.mkdirSync(publicPath, { recursive: true });
        copyDir(Path.resolve(__dirname, "client/build"), publicPath);
      }
    });
  }
});


function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }
  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcPath = Path.resolve(src, file);
    const destPath = Path.resolve(dest, file);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}