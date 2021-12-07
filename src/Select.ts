import "colors";

export type ArgumentOption = { [displayName: string]: any } | string;
export interface ArgumentObject {
  title?: string;
  options: ArgumentOption[];
  if?: (args: any[]) => boolean;
};

export default class Select {
  constructor(private stdin: NodeJS.ReadStream, private stdout: NodeJS.WriteStream) { }

  public async choose(selection: ArgumentObject): Promise<string> {
    const cin = this.stdin;
    const cout = this.stdout;

    cin.setRawMode(true);
    cin.resume();

    let resolve: (value: string) => void,
      reject: () => void,
      promise = new Promise<string>((res, rej) => { resolve = res; reject = rej });

    const finish = (value: string) => {
      cin.setRawMode(false);
      cin.off("keypress", inputHandler);
      resolve(value);
    }

    const { title, options } = selection;

    cout.cursorTo(0);
    cout.moveCursor(0, 1);
    cout.clearScreenDown();
    cout.write((title ?? "Select an option") + ":");

    const initial = 1;
    cout.moveCursor(0, 1);
    cout.cursorTo(0);

    function writeOption(opt: ArgumentOption, selected: boolean = false) {
      cout.cursorTo(0);
      cout.clearLine(1);
      if (typeof opt === "string") cout.write(" " + (selected ? (("< "+opt+" >")/*.black.bgWhite*/) : opt));
      if (typeof opt === "object") {
        for (const key in opt) {
          if (key in opt) {
            cout.write(" " + (selected ? ("< "+key+" >")/*.black.bgWhite*/ : key));
            break; // Only get first one.
          }
        }
      }
      cout.cursorTo(0);
      // cout.moveCursor(2, 0);
    }

    options.forEach((opt, i) => {
      cout.cursorTo(0);
      cout.moveCursor(0, 1);
      writeOption(opt, i === 0);
    });

    cout.moveCursor(0, 0 - options.length + 1);

    let selectedIndex = 0;

    const inputHandler = (chk: Buffer, key: KeyPress) => {
      if (key.name === "up" || key.name === "left") {
        if (selectedIndex <= 0) return;
        
        writeOption(options[selectedIndex], false);
        cout.moveCursor(0, -1);
        writeOption(options[--selectedIndex], true);
      }
      else if (key.name === "down" || key.name === "right") {
        if (selectedIndex >= options.length - 1) return;
        writeOption(options[selectedIndex], false);
        cout.moveCursor(0, 1);
        writeOption(options[++selectedIndex], true);
      }
      else if (key.name === "return") {
        cout.cursorTo(0, 1);
        cout.clearScreenDown();
        let chosen = options[selectedIndex];
        finish(typeof chosen === "string" ? chosen : (() => {
          if (typeof chosen === "object") {
            for (const key in chosen) {
              if (key in chosen) {
                return chosen[key];
              }
            }
          }
        })());
      }
      else if (key.name === "c" || key.ctrl) {
        console.log(); // New line.
        console.log("Quitting...".red);
        process.exit(1);
      }
    }

    this.stdin.on("keypress", inputHandler);

    return promise;
  }
}


interface KeyPress {
  name: string,
  ctrl: boolean,
  /**
   * The alt key
   */
  meta: boolean,
  shift: boolean,
  sequence: string
}