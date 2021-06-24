import { ArgumentObject } from "./Select";

export type GeneratorFunction = (args: string[]) => Promise<void> | void;

namespace Projects {
  export const Generators: { [identifier: string]: (ArgumentObject | GeneratorFunction)[] } = {
    cli: [
      {
        title: "Coding Language?",
        options: [
          "TypeScript",
          "JavaScript",
          "C#",
        ]
      },
      {
        title: "Soda tho?",
        options: [
          "Faxe",
          "Cola",
        ]
      },
      (args) => console.log(args),
      {
        title: "Any more?",
        options: [
          "Yes",
          "No",
        ]
      },
      (args) => console.log(args)
    ]
  }
}

export default Projects;