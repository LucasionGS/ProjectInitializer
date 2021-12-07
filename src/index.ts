#!/usr/bin/env node

import Select from "./Select";
import Path from "path";
const keypress = require("keypress");

const pArgs = process.argv.slice(2);
export const ROOT = Path.resolve(__dirname, "..");
export namespace RESOURCES {
  export const BASE = Path.resolve(ROOT, "resources");
  export const INIT = Path.resolve(ROOT, "resources/init");
};

// Prep
keypress(process.stdin);
export const select = new Select(process.stdin, process.stdout);

// Main body
(async () => {
  switch (pArgs[0]) {
    case "init": {
      const init = (await import("./functions/init")).default;
      await init(pArgs.slice(1));
      break;
    }

    case "react-component":
    case "rc": {
      const rc = (await import("./functions/reactComponent")).default;
      await rc(pArgs.slice(1));
      break;
    }

    default: {
      const commands = {
        "init": "Initialize a new project",
        "rc, react-component": "Create a new React component",
      }
      const longestCommand = Object.keys(commands).reduce((longest, command) => {
        return command.length > longest ? command.length : longest;
      }, 0);
      console.log("No command found");
      console.log("Commands:");
      for (const cmd in commands) {
        if (Object.prototype.hasOwnProperty.call(commands, cmd)) {
          const desc = commands[cmd];
          console.log(`  ${cmd.padEnd(longestCommand)} - ${desc}`);
        }
      }

      break; // End of no command found
    }
  }
})();