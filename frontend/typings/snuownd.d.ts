declare module 'snuownd' {
  type SnuOwndParser = {
    readonly render(markdown: string): string;
  };

  type SnuOwnd = {
    readonly getParser(): SnuOwndParser;
  };

  const value: SnuOwnd;
  export = value;
}
