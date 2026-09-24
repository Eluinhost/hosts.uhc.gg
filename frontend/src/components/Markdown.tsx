import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Intent,
  Link,
  Blockquote,
  Code,
  Divider,
  UL,
  OL,
  Pre,
  HTMLTable,
} from '@blueprintjs/core';
import { Markdown as TanstackMarkdown, type MarkdownComponents } from '@tanstack/markdown/react';

import './Markdown.sass';

export interface MarkdownProps {
  markdown: string;
}

const components: MarkdownComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  a: props => <Link {...props} color={Intent.PRIMARY} />,
  blockquote: Blockquote,
  code: Code,
  hr: Divider,
  ul: UL,
  ol: OL,
  pre: Pre,
  table: props => <HTMLTable {...props} compact striped />,
  // explicitly deny images
  img: () => null,
  image: () => null,
};

export const Markdown = ({ markdown }: MarkdownProps) => {
  return (
    <div className="rendered-markdown">
      <TanstackMarkdown components={components} allowHtml={false}>
        {markdown}
      </TanstackMarkdown>
    </div>
  );
};
