#!/usr/bin/env node

import Projects from "./Projects";
import Path from "path";
import Select from "./Select";
const keypress = require("keypress");

const args = process.argv.slice(2);
export const ROOT = Path.resolve(__dirname, "..");
export const RESOURCES = Path.resolve(ROOT, "resources");

// Prep
keypress(process.stdin);

const select = new Select(process.stdin, process.stdout);

// Main body
( async() => {
  if (!args[0]) {
console.log(
`projectinit:
${(() => {
  let keys: string[] = [];
  for (const key in Projects.Generators) {
    if (Object.prototype.hasOwnProperty.call(Projects.Generators, key)) {
      keys.push(key);
    }
  }

  return "\t"+ keys.join("\n\t");
})()}`
);
    // return console.error("Missing argument");
    return;
  }
  const genCmd = args.splice(0, 1)[0];
  const gen = Projects.Generators[genCmd];

  process.stdout.cursorTo(0, 0);
  process.stdout.clearScreenDown();
  const localArgs: string[] = [...args];
  for (let i = 0; i < gen.length; i++) {
    const opt = gen[i];
    try {
      if (typeof opt === "function") {
        let response = await opt(localArgs, Projects.createGetArg(localArgs));
        if (typeof response === "string" || response === false) {
          if (typeof response === "string") console.error(response);
          process.exit();
        }
      }
      if (typeof opt === "object") {
        if (typeof opt.if === "function" && !opt.if(localArgs)) continue;
        const choice = await select.choose(opt);
        localArgs.push(choice);
        console.log("You chose:" + choice);
      }
    } catch (error) {
      console.error(error);
      process.exit();
    }

  }
  process.exit();
})();