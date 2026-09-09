declare module 'tiddlywiki' {
  export function TiddlyWiki(): {
    boot: {
      argv: string[];
      disabledStartupModules: string[];
      boot: (callback: () => void) => void;
    };
    wiki: {
      renderText: (
        outputType: string,
        inputType: string,
        source: string,
      ) => string;
    };
  };
}
