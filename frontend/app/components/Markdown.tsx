import * as React from 'react';
import * as snuownd from 'snuownd';

const parser = snuownd.getParser();

export type MarkdownProps = {
  readonly markdown: string;
};

export const Markdown: React.SFC<MarkdownProps> = ({ markdown }) => (
  <div className="rendered-markdown" dangerouslySetInnerHTML={{ __html: parser.render(markdown) }}/>
);
