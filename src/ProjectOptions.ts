import { GeneratorFunction } from "./Projects";

namespace ProjectOptions {
  /**
   * Asks for a yes or no answer. Yes is `true`, No is `false`.
   */
  export const BOOL: [{ "No": false },{ "Yes": true }] = [
    { "No": false },
    { "Yes": true }
  ];

  /**
   * Used to make sure the a certain number of arguments exists and strips off all others.
   */
  export const requireInitialArgs = (startIndex: number,  ...failMessages: string[]): GeneratorFunction => {
    return args => {
      const missingArgs: string[] = [];
      for (let i = 0; i < failMessages.length; i++) {
        const failMsg = failMessages[i];
        if (!args[i + startIndex]) {
          missingArgs.push(`Missing argument ${startIndex + i + 1}: ${failMsg}`);
        }
      }
      if (missingArgs.length === 0) {
        args.splice(startIndex + failMessages.length);
        return;
      }
      else return missingArgs.join("\n");
    }
  };

  // Reset args to empty array
  export const resetArgs = (): GeneratorFunction => {
    return args => {
      args.splice(0);
    }
  };
}
export default ProjectOptions;