import { select } from "../index";
import fs from "fs";
import Path from "path";

export default async function reactComponent(args: string[]) {
  if (!args[0]) {
    console.log(
      `Create React component:\n\tion rc <componentName>`
    );
    // return console.error("Missing argument");
    return;
  }
  const cwd = process.cwd();
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
  if (!info) {
    return console.error("No package.json found");
  }

  const { packageJson, dir } = info;

  let componentType: "class" | "function" = "class";

  if (args[1] === "function" || args[1] === "f") {
    componentType = "function";
  }

  let css = "css";
  if (
    packageJson?.dependencies["sass"]
    || packageJson?.devDependencies["sass"]
    || packageJson?.dependencies["node-sass"]
    || packageJson?.devDependencies["node-sass"]
  ) {
    css = "scss";
  }

  let jsx = "jsx";
  if (
    packageJson?.dependencies["typescript"]
    || packageJson?.devDependencies["typescript"]
  ) {
    jsx = "tsx";
  }

  const name = args[0];
  const componentNameU = name.charAt(0).toUpperCase() + name.slice(1);
  const componentNameL = name.charAt(0).toLowerCase() + name.slice(1);

  const componentPath = `${dir}/src/components/${componentNameU}`;
  const componentFile = `${componentPath}/${componentNameU}.${jsx}`;
  const componentStyleFile = `${componentPath}/${componentNameU}.${css}`;

  if (fs.existsSync(componentPath)) {
    return console.error(`Component ${componentNameU} already exists`);
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

  console.log(`Created component ${componentNameU} in ${componentPath}`);

  return process.exit();
}
