import cp from "child_process";
import os from "os";
import fs from "fs";
import Path from "path";
import { Readable } from "stream";
import { RESOURCES } from ".";
import { ArgumentObject, ArgumentOption } from "./Select";
import { createEqualCondition, FileSystem, createRunCommandFrom, createRunAsyncCommandFrom } from "./Tools";
import ProjectOptions from "./ProjectOptions";

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

        const nodePath = Path.resolve(RESOURCES, `node/${language}`);
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
            "test": "node ."
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

        const websitePath = Path.resolve(RESOURCES, `website/${language}`);
        const name = Path.basename(dist).replace(/\s/g, "-").toLowerCase();

        const isLanguage = createEqualCondition(language);
        // const isTemplate = createEqualCondition(template);

        const packageJson = {
          "name": name,
          "version": "1.0.0",
          "description": "",
          "scripts": {
            "watch": isLanguage("TypeScript") ? "tsc -w" : "echo 'No compile created'",
            "test": useServe ? "serve public" : "echo 'No test created'",
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
  }
}

export default Projects;