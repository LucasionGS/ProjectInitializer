import fs from "fs";
import Path from "path";

class Config {
  constructor(data: Config.IConfig, rootDirectory: string) {
    this.data = data;
    this.dir = rootDirectory;
  }

  public data: Config.IConfig = {};

  public readonly dir: string;

  public save(): void {
    const ionPath = Config.findIon(this.dir);
    if (!fs.existsSync(ionPath)) fs.mkdirSync(ionPath, { recursive: true });
    for (const key in this.data) {
      if (key in this.data) {
        const element = this.data[key as (keyof Config.IConfig)];
        fs.writeFileSync(Path.join(ionPath, key + ".json"), JSON.stringify(element, null, 2));
      }
    }
  }

  public static fromDir(dir: string): Config {
    const data: Config.IConfig = {};
    const dirPath = Config.findIon(dir);
    if (!fs.existsSync(dirPath)) return new Config({}, Path.dirname(dirPath));
    const files = fs.existsSync(dirPath) ? fs.readdirSync(dirPath) : [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const filePath = Path.join(dirPath, file);
      const fileData = fs.readFileSync(filePath, "utf8");
      data[Path.basename(file, Path.extname(file))] = JSON.parse(fileData);
    }
    return new Config(data, dirPath);
  }
}

namespace Config {
  export function getIon(dir: string): string {
    return Path.resolve(dir, ".ion");
  }

  export function findIon(dir: string) {
    const initial = Path.resolve(dir);
    let last: string;
    while (dir = Path.resolve(dir)) {
      if (last == dir) {
        return Config.getIon(initial);
      }
      last = dir;
      if (fs.existsSync(Config.getIon(dir))) {
        return Config.getIon(dir);
      }

      dir = Path.dirname(dir);

    }
  }

  interface IConfigReactComponent {
    components?: string;
    styleFlavor?: "css" | "sass" | "scss";
    jsFlavor?: "js" | "ts";
  }

  export interface IConfig {
    reactComponent?: IConfigReactComponent;
  }
}

export default Config;