import { exec, execSync } from "child_process";
import fs, { fdatasyncSync } from "fs";
import Path from "path";


export namespace FileSystem {
  export function createFromFolder(path: string) {
    return (...segments: string[]) => {
      return Path.resolve(path, ...segments);
    }
  }

  export function createToFolder(path: string) {
    return (...segments: string[]) => {
      return Path.relative(path, Path.resolve(...segments));
    }
  }

  export async function copyDirectory(src: string, dist: string) {
    let files = await scanDirectoryRecursively(src);
    const fromDist = createFromFolder(dist);

    await Promise.all(
      files.map(async f => {
        let fileDist = fromDist(f.relativePath);
        if (await fs.promises.stat(Path.dirname(fileDist)).then(() => false).catch(() => true))
          await fs.promises.mkdir(Path.dirname(fileDist), { recursive: true });
        
        if (f.isDirectory() && await fs.promises.stat(fileDist).then(() => false).catch(() => true))
          await fs.promises.mkdir(fileDist, { recursive: true });

        return f.isFile() ? fs.promises.copyFile(f.path, fileDist) : null;
      })
    );
  }

  const toCWD = createToFolder(process.cwd());

  interface DirectoryEntry extends fs.Dirent {
    /**
     * Full path of the entry.
     */
    path: string;

    /**
     * Relative path of the entry.
     */
    relativePath: string;
  }

  export async function scanDirectoryRecursively(path: string, originalPath?: string): Promise<DirectoryEntry[]> {
    originalPath ?? (originalPath = path);
    // console.log("Scanning path:", toCWD(path));
    try {
      var files = (await fs.promises.readdir(path, { withFileTypes: true })).map(f => {
        const ent = f as DirectoryEntry;
        ent.path = Path.resolve(path, f.name);
        ent.relativePath = Path.relative(originalPath ?? path, ent.path);
        return ent;
      });
    } catch (error) {
      console.error("Error for path: " + path);
      console.error(error);
      return [];
    }

    let subFiles: Promise<DirectoryEntry[]>[] = files.map((async f => f.isDirectory() ? await scanDirectoryRecursively(f.path, originalPath) : [] as DirectoryEntry[]));

    return Promise.all(subFiles).then(subFiles => {
      return files.concat(...subFiles);
    });
  }

  export async function scanDirectoryRecursivelySorted(path: string): Promise<DirectoryEntry[]> {
    let files = await scanDirectoryRecursively(path);
    return files
      .sort((a, b) => a.path > b.path ? 1 : -1)
      .sort((a, b) => a.path.split(Path.sep).length - b.path.split(Path.sep).length);
  }
}

export function createEqualCondition<T>(value: T) {
  return (compareToValue: T, callbackOnTrue?: () => void, callbackOnFalse?: () => void) => {
    const isTrue = value === compareToValue;
    if (isTrue) {
      if (callbackOnTrue) callbackOnTrue();
    } else {
      if (callbackOnFalse) callbackOnFalse();
    }

    return isTrue;
  }
}

export function createRunCommandFrom(cwd: string = process.cwd()) {
  return (command: string) => {
    execSync(command, { cwd });
  }
}

export function createRunAsyncCommandFrom(cwd: string = process.cwd()) {
  return async (command: string, commentWhileRunning?: string, commentOnFinish?: string) => {
    return new Promise<string>((resolve, reject) => {
      process.stdout.moveCursor(0, 1);
      process.stdout.cursorTo(0);
      process.stdout.clearLine(1);

      let isRunning = true;
      exec(command, { cwd }, (error, stdout, stderr) => {
        isRunning = false;
        process.stdout.cursorTo(0);
        process.stdout.clearLine(1);
        process.stdout.write((commentOnFinish ?? "Finished!") + "\n");
        if (error != null) {
          console.error(`exec error: ${error}`);
          return reject(error);
        }
        resolve(stdout);
      });

      let index = 0;
      let spinner = [
        "|",
        "/",
        "-",
        "\\",
      ];
      spin();
      function spin() {
        process.stdout.cursorTo(0);
        process.stdout.write((commentWhileRunning ?? "Running...") + " " + spinner[index++ % spinner.length] + "          ");
        if (isRunning) setTimeout(spin, 500);
        process.stdout.moveCursor(1, 0);
      }
    });
  }
}