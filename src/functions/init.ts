import Projects from "./init/Projects";
import { select } from "../index";
import { ArgumentObject, CheckedArgumentObject, CheckedArgumentsValues } from "../Select";

export default async function init(args: string[]) {
  if (!args[0]) {
    console.log(
      `ion init:\n${(() => {
        let keys: string[] = [];
        for (const key in Projects.Generators) {
          if (Object.prototype.hasOwnProperty.call(Projects.Generators, key)) {
            keys.push(key);
          }
        }

        return "\t" + keys.join("\n\t");
      })()}`
    );
    // return console.error("Missing argument");
    return;
  }
  const genCmd = args.splice(0, 1)[0];
  const gen = Projects.Generators[genCmd];

  process.stdout.cursorTo(0, 0);
  process.stdout.clearScreenDown();
  const localArgs: (string | CheckedArgumentsValues)[] = [...args];
  for (let i = 0; i < gen.length; i++) {
    const opt = gen[i];
    try {
      if (typeof opt === "function") {
        let response = await opt(localArgs, Projects.createGetArg(localArgs));
        if (typeof response === "string" || response === false) {
          if (typeof response === "string")
            console.error(response);
          process.exit();
        }
      }
      if (typeof opt === "object") {
        if (typeof opt.if === "function" && !opt.if(localArgs))
          continue;

        function isCheckedArguments(opt: CheckedArgumentObject<string[]> | ArgumentObject): opt is CheckedArgumentObject<string[]> {
          return (opt as CheckedArgumentObject<string[]>).items !== undefined;
        }

        if (isCheckedArguments(opt)) {
          const choice = await select.chooseMultiple(opt);
          const data: CheckedArgumentsValues = {};
          opt.items.forEach((item, i) => {
            data[item] = choice.includes(item);
          });
          localArgs.push(data);
        }
        else {
          const choice = await select.choose(opt);
          localArgs.push(choice);
          console.log("You chose:" + choice);
        }
      }
    } catch (error) {
      console.error(error);
      process.exit();
    }

  }
  return process.exit();
}
