import { select } from "../index";
import fs from "fs";
import Path from "path";
import Config from "../Config";

export default async function reactComponent(args: string[]) {
  if (!args[0]) {
    console.log(
      [
        "Create React component:",
        "\tion rc <componentName>",
        "\tion rc -c <...parameters>",
      ].join("\n")
    );
    // return console.error("Missing argument");
    return;
  }
  const cwd = process.cwd();

  const config = Config.fromDir(cwd);

  if (args[0] === "-c") {
    if (!args[1]) {
      console.log(
        [
          "Create React component:",
          "\tion rc -c <...parameters>",
          "\t\tinit - Creates a config file in current directory.",
          "\t\tset",
          "\t\t\t<option> <value>",
        ].join("\n")
      );
    }
    if (args[1] === "init") {
      config.data.reactComponent = {
        components: null,
      };
      config.save();
    }
    return;
  }

  function findPackageJson(dir: string) {
    let packageJson: {
      devDependencies: { [key: string]: string };
      dependencies: { [key: string]: string };
    };
    if (fs.existsSync(`${dir}/package.json`)) {
      packageJson = JSON.parse(
        fs.readFileSync(`${dir}/package.json`, "utf8")
      );
    } else {
      let newDir = Path.dirname(dir);
      if (newDir === dir) {
        return null;
      }
      packageJson = findPackageJson(newDir)?.packageJson;
    }
    return {
      packageJson,
      dir
    };
  }

  const info = findPackageJson(cwd);
  if (!info || !info.packageJson) {
    return console.error("No package.json found");
  }

  const { packageJson, dir } = info;

  let componentType: "class" | "function" = "function";

  if (args[1] === "function" || args[1] === "f") {
    componentType = "function";
  }
  else if (args[1] === "class" || args[1] === "c") {
    componentType = "class";
  }

  let css = "css";
  if (
    !config.data.reactComponent?.styleFlavor && 
    (packageJson?.dependencies && packageJson.dependencies["sass"])
    || (packageJson?.devDependencies && packageJson.devDependencies["sass"])
    || (packageJson?.dependencies && packageJson.dependencies["node-sass"])
    || (packageJson?.devDependencies && packageJson.devDependencies["node-sass"])
  ) {
    css = "scss";
  }
  else if (config.data.reactComponent?.styleFlavor) {
    css = config.data.reactComponent.styleFlavor;
  }

  let jsx = "jsx";
  if (!config.data.reactComponent?.jsFlavor &&
    (packageJson?.dependencies && packageJson.dependencies["typescript"])
    || (packageJson?.devDependencies && packageJson.devDependencies["typescript"])
  ) {
    jsx = "tsx";
  }
  else if (config.data.reactComponent?.jsFlavor) {
    jsx = config.data.reactComponent.jsFlavor;
  }

  const parts = args[0].split(/[\/\\]/g);
  const name = parts.pop();
  const componentNameU = name.charAt(0).toUpperCase() + name.slice(1);
  const componentNameL = name.charAt(0).toLowerCase() + name.slice(1);
  parts.push(componentNameU);
  const componentNameUPath = parts.join("/");

  const componentPath = Path.resolve((
    config.data.reactComponent?.components ?
      Path.resolve(dir, config.data.reactComponent.components)
      : dir + "/src/components"
  ), componentNameUPath);
  const componentFile = `${componentPath}/${componentNameU}.${jsx}`;
  const componentStyleFile = `${componentPath}/${componentNameU}.${css}`;

  if (fs.existsSync(componentPath)) {
    return console.error(`Component ${componentPath} already exists`);
  }

  fs.mkdirSync(componentPath, { recursive: true });

  if (componentType == "class") fs.writeFileSync(
    componentFile,
    `import React, { Component } from "react";
import "./${componentNameU}.${css}";

interface ${componentNameU}Props { }
interface ${componentNameU}State { }

export default class ${componentNameU} extends Component<${componentNameU}Props, ${componentNameU}State> {
  constructor(props: ${componentNameU}Props) {
    super(props);
    this.state = {};
  }
  
  render() {
    return (
      <div className="${componentNameL}">
        
      </div>
    )
  }
}
`
  );
  else fs.writeFileSync(
    componentFile,
    `import React from "react";
import "./${componentNameU}.${css}";

interface ${componentNameU}Props { }

export default function ${componentNameU}(props: ${componentNameU}Props) {
  return (
    <div className="${componentNameL}">
      
    </div>
  )
}
`);

  fs.writeFileSync(componentStyleFile, `.${componentNameL} {\n  \n}`);

  console.log(`Created ${componentType} component ${componentNameU} in ${componentPath}`);

  return process.exit();
}
