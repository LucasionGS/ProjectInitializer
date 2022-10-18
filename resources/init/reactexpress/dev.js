const cp = require("child_process");
const Path = require("path");
const readline = require("readline");

/**
 * @type {cp.ChildProcess}
 */
let server = null;
/**
 * @type {cp.ChildProcess}
 */
let serverCompiler = null;
/**
 * @type {cp.ChildProcess}
 */
let client = null;

process.env.NODE_ENV = "development";

function startServer() {
  // Kill if already running
  if (server) {
    try {
      process.kill(server.pid, "SIGINT");
    } catch (error) { }
  }

  console.log("Starting server...");
  server = cp.spawn("node", ["dist/index.js"], {
    stdio: "inherit",
    cwd: Path.resolve(__dirname, "server"),
    env: process.env
  });
}

function startServerCompiler(watch, onFinish) {
  // Kill if already running
  if (serverCompiler) {
    try {
      process.kill(serverCompiler.pid, "SIGINT");
    } catch (error) { }
  }

  console.log("Starting server compiler...");
  serverCompiler = cp.spawn("node", ["../node_modules/.bin/tsc", watch ? "-w" : null].filter(Boolean), {
    stdio: "inherit",
    cwd: Path.resolve(__dirname, "server"),
  });

  serverCompiler.on("close", (code) => {
    if (!watch && onFinish) {
      onFinish();
    }
  });
}

function startClient() {
  // Kill if already running
  if (client) {
    try {
      process.kill(client.pid, "SIGINT");
    } catch (error) { }
  }

  console.log("Starting client...");
  client = cp.spawn("node", ["node_modules/react-scripts/scripts/start.js"], {
    stdio: "inherit",
    cwd: Path.resolve(__dirname, "client"),
  });
}

function killAll(exit) {
  console.log("Killing all processes...");
  if (server) {
    try {
      if (process.kill(server.pid, "SIGINT")) {
        console.log("Server killed");
      }
    }
    catch (error) { }
  }
  if (serverCompiler) {
    try {
      if (process.kill(serverCompiler.pid, "SIGINT")) {
        console.log("ServerCompiler killed");
      }
    }
    catch (error) { }
  }
  if (client) {
    try {
      if (process.kill(client.pid, "SIGINT")) {
        console.log("Client killed");
      }
    }
    catch (error) { }
  }

  if (exit) {
    process.exit(0);
  }
}

// On exit, kill all child processes
process.on("exit", killAll);

// On SIGINT, kill all child processes
process.on("SIGINT", killAll);

// On SIGTERM, kill all child processes
process.on("SIGTERM", killAll);

function init() {
  startServerCompiler(false, () => {
    startServer();
    startServerCompiler(true);
    startClient();
  });
}

init();

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on("keypress", (str, key) => {
  // console.log(key);
  if (key.name === "r") { // Restart server
    if (key.ctrl) {
      // On press lowercase R
      killAll();
      init();
    }
    else {
      // On press lowercase r
      startServer();
    }
  }
  // On press lowercase q
  else if (key.name === "q") { // Quit
    process.stdin.setRawMode(false);
    console.log("Raw mode off - Press Ctrl + C to exit");
    killAll(true);
  }
  else if (key.name === "c" && key.ctrl) { // Ctrl + C
    process.stdin.setRawMode(false);
    console.log("Raw mode off - Press Ctrl + C to exit");
    killAll(true);
  }
  else {
    // Insert in stdin
    process.stdin.write(str);
  }
});
