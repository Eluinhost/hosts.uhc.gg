declare module 'markup-js' {
  type MarkConfiguration = {
    readonly includes: {
      [key: string]: string;
    },
    readonly globals: {
      [key: string]: any;
    },
    delimiter: string;
    compact: boolean;
    readonly pipes: {
      [key: string]: Function;
    };
  };

  type Mark = {
    readonly includes: {
      [key: string]: string;
    },
    readonly globals: {
      [key: string]: any;
    },
    delimiter: string;
    compact: boolean;
    up(template: string, context: object, options?: Partial<MarkConfiguration>): string;
  };

  const value: Mark;
  export = value;
}
