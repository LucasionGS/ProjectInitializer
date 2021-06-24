import Projects from "./Projects";
import * as Path from "path";
import Select from "./Select";
const keypress = require("keypress");

const args = process.argv.slice(2);
const ROOT = Path.resolve(__dirname, "..");
const RESOURCES = Path.resolve(ROOT, "resources");

// Prep
keypress(process.stdin);

const select = new Select(process.stdin, process.stdout);

// Main body
( async() => {
  if (!args[0]) return;
  const genCmd = args.splice(0, 1)[0];
  const gen = Projects.Generators[genCmd];

  process.stdout.cursorTo(0, 0);
  process.stdout.clearScreenDown();
  const localArgs: string[] = [];
  for (let i = 0; i < gen.length; i++) {
    const opt = gen[i];
    try {
      if (typeof opt === "function") await opt(localArgs);
      if (typeof opt === "object") {
        const choice = await select.choose(opt);
        localArgs.push(choice);
        console.log("You chose:" + choice);
      }
    } catch (error) {
      return console.error(error);
    }

  }
  process.exit();
})();