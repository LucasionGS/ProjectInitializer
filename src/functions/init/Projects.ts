import os from "os";
import fs from "fs";
import Path from "path";
import { RESOURCES } from "../..";
import { ArgumentObject, ArgumentOption } from "../../Select";
import { createEqualCondition, FileSystem, createRunCommandFrom, createRunAsyncCommandFrom } from "../../Tools";
import ProjectOptions from "./ProjectOptions";
import commandExists from "command-exists";


type GeneratorValue = void | string | boolean;
export type GeneratorFunction = (args: any[], getArg: <T = string>(index: number) => T) => Promise<GeneratorValue> | GeneratorValue;

const CWD = process.cwd();
const fromCWD = FileSystem.createFromFolder(CWD);

namespace Projects {
  export function createGetArg(args: any[]) {
    return <T = string>(index: number): T => args[index];
  }
  export const Generators: { [identifier: string]: (ArgumentObject | GeneratorFunction)[] } = {
    node: [
      ProjectOptions.requireInitialArgs(0, "Location required"),
      {
        title: "Programming Language",
        options: [
          "TypeScript",
          "JavaScript",
        ]
      },
      {
        title: "Install modules?",
        options: [
          ...ProjectOptions.BOOL
        ]
      },
      // Install modules
      {
        if: args => args[2],
        title: "Install Express?",
        options: [
          ...ProjectOptions.BOOL
        ]
      },
      {
        if: args => args[2],
        title: "Install MySQL?",
        options: [
          ...ProjectOptions.BOOL
        ]
      },
      {
        if: args => args[2],
        title: "Install Discord.js?",
        options: [
          ...ProjectOptions.BOOL
        ]
      },

      async (args, getArg) => {
        const dist = fromCWD(getArg(0));
        const language = getArg(1);
        const installExtensions = getArg<boolean>(2);

        // Modules
        const installedExpress = getArg<boolean>(3);
        const installMysql = getArg<boolean>(4);
        const installDiscordJs = getArg<boolean>(5);

        const run = createRunAsyncCommandFrom(dist);

        const nodePath = Path.resolve(RESOURCES.INIT, `node/${language}`);
        const name = Path.basename(dist).replace(/\s/g, "-").toLowerCase();

        const isLanguage = createEqualCondition(language);
        // const isTemplate = createEqualCondition(template);

        const packageJson = {
          "name": name,
          "version": "1.0.0",
          "description": "",
          "main": "dist/index.js",
          "bin": {
            [name]: "dist/index.js"
          },
          "scripts": {
            "watch": isLanguage("TypeScript") ? "tsc -w" : "echo 'No compile created'",
            "start": "node ."
          },
          "keywords": [],
          "author": os.userInfo().username,
          "license": "ISC",
          "devDependencies": {},
          "dependencies": {}
        };

        const fromNode = FileSystem.createFromFolder(nodePath);
        const fromDist = FileSystem.createFromFolder(dist);

        const files = [
          await FileSystem.copyDirectory(fromNode(), fromDist()),
          fs.promises.writeFile(fromDist("package.json"), JSON.stringify(packageJson, null, 2)),
        ];

        await Promise.all(files);

        switch (language) {
          case "TypeScript":
            console.log(`Installing ${language} essentials...`);
            await run("npm i -D typescript", "Installing TypeScript", "Installed TypeScript");
            await run("npm i -D @types/node", "Installing @types/node", "Installed @types/node");
            break;
        }

        if (installExtensions) {
          // If express is selected then add the module
          if (installedExpress) {
            console.log(`Installing module: Express`);
            await run("npm i express", "Installing Express", "Installed Express");
            await run("npm i -D @types/express", "Installing @types/express", "Installed @types/express");
          }
          // If mysql is selected then add the module
          if (installMysql) {
            console.log(`Installing module: MySQL`);
            await run("npm i mysql", "Installing MySQL", "Installed MySQL");
            await run("npm i -D @types/mysql", "Installing @types/mysql", "Installed @types/mysql");
          }
          // If discord.js is selected then add the module
          if (installDiscordJs) {
            console.log(`Installing module: Discord.js`);
            await run("npm i discord.js", "Installing Discord.js", "Installed Discord.js");
          }
        }

      },
      // Finish
      () => console.log("Project created successfully!")
    ],
    website: [
      ProjectOptions.requireInitialArgs(0, "Location required"),
      {
        title: "Programming Language",
        options: [
          "TypeScript",
          "JavaScript",
        ]
      },
      {
        title: "Use Serve to test the website?",
        options: [
          ...ProjectOptions.BOOL
        ]
      },

      async (args, getArg) => {
        const dist = fromCWD(getArg(0));
        const language = getArg(1);
        const useServe = getArg<boolean>(1);

        const run = createRunAsyncCommandFrom(dist);

        const websitePath = Path.resolve(RESOURCES.INIT, `website/${language}`);
        const name = Path.basename(dist).replace(/\s/g, "-").toLowerCase();

        const isLanguage = createEqualCondition(language);
        // const isTemplate = createEqualCondition(template);

        const packageJson = {
          "name": name,
          "version": "1.0.0",
          "description": "",
          "scripts": {
            "watch": isLanguage("TypeScript") ? "tsc -w" : "echo 'No compile created'",
            "start": useServe ? "serve public" : "echo 'No test created'",
          },
          "keywords": [],
          "author": os.userInfo().username,
          "license": "ISC",
          "devDependencies": {},
          "dependencies": {}
        };

        const fromWebsite = FileSystem.createFromFolder(websitePath);
        const fromDist = FileSystem.createFromFolder(dist);

        const files = [
          await FileSystem.copyDirectory(fromWebsite(), fromDist()),
          fs.promises.writeFile(fromDist("package.json"), JSON.stringify(packageJson, null, 2)),
        ];

        await Promise.all(files);

        switch (language) {
          case "TypeScript":
            console.log(`Installing ${language} essentials...`);
            await run("npm i -D typescript", "Installing TypeScript", "Installed TypeScript");
            break;
        }

        if (useServe) {
          console.log(`Installing module: Serve`);
          await run("npm i -D serve", "Installing Serve", "Installed Serve");
        }

      },
      // Finish
      () => console.log("Project created successfully!")
    ],
    electron: [
      ProjectOptions.requireInitialArgs(0, "Location required"),
      () => !commandExists.sync("yarn") ? "yarn is required to install electron" : void 0,

      async (args, getArg) => {
        const dist = fromCWD(getArg(0));

        const run = createRunAsyncCommandFrom(dist, true);
        if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

        // const fromDist = FileSystem.createFromFolder(dist);

        console.log(`Installing Electron...`);
        await run(`yarn create electron-app . --template=typescript-webpack`, "Downloading Electron", "Downloaded Electron");

      },
      // Finish
      () => console.log("Project created successfully!")
    ],
    react: [
      ProjectOptions.requireInitialArgs(0, "Location required"),
      {
        title: "Use SASS?",
        options: ProjectOptions.BOOL,
      },

      async (args, getArg) => {
        const name = getArg(0);
        const dist = fromCWD(name);
        const useSass = getArg<boolean>(1);
        const useYarn = commandExists.sync("yarn");

        const run = createRunAsyncCommandFrom(dist, true);
        if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

        // const fromDist = FileSystem.createFromFolder(dist);

        console.log(`Installing React in path ${dist}...`);
        if (useYarn) {
          await run(`yarn create react-app "${dist}" --template typescript`, "Downloading React", "Downloaded React");
        }
        else {
          await run(`npx create-react-app "${dist}" --template typescript`, "Downloading React", "Downloaded React");
        }

        if (useSass) {
          console.log(`Installing module: Sass`);

          if (useYarn) {
            await run(`yarn add sass`, "Installing Sass", "Installed Sass");
          }
          else {
            await run(`npm i -D sass`, "Installing Sass", "Installed Sass");
          }

          const srcDir = Path.resolve(dist, "src");
          await fs.promises.readdir(srcDir).then(async (files) => {
            for (const file of files) {
              if (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".ts") || file.endsWith(".tsx")) {
                const filePath = Path.resolve(srcDir, file);
                const content = await fs.promises.readFile(filePath, "utf-8");
                await fs.promises.writeFile(filePath, content.replace(/\.css/g, ".scss"));
              }

              if (file.endsWith(".css")) {
                const filePathCss = Path.resolve(srcDir, file);
                const filePathScss = Path.resolve(srcDir, Path.basename(file, ".css") + ".scss");
                await fs.promises.rename(filePathCss, filePathScss);
              }
            }
          });
        }

      },
      // Finish
      () => console.log("Project created successfully!")
    ],
    "react-express": [
      ProjectOptions.requireInitialArgs(0, "Location required"),
      async (args, getArg) => {
        const name = getArg(0);
        const dist = fromCWD(name);
        const useGit = commandExists.sync("git");

        const run = createRunAsyncCommandFrom(dist, true);
        if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

        // const fromDist = FileSystem.createFromFolder(dist);

        console.log(`Installing React Express in path ${dist}...`);
        if (useGit) {
          await run(`git clone https://github.com/LucasionGS/react-fullstack.git "${dist}"`, "Cloning React Express", "Downloaded React Express");
          await run(`npm i`, "Installing modules", "Installed modules");
        }
        else {
          throw new Error("Git is required to install React Express");
        }

        // Clean up
        await fs.promises.rm(Path.resolve(dist, ".git"), { recursive: true });
      },
      // Finish
      () => console.log("Project created successfully!")
    ],
  }
}

export default Projects;