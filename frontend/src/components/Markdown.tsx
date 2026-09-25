import { Title, Anchor, Blockquote, Code, Divider, List, Table } from '@mantine/core';
import { Markdown as TanstackMarkdown, type MarkdownComponents } from '@tanstack/markdown/react';

import styles from './Markdown.module.css';

export interface MarkdownProps {
  markdown: string;
}

const components: MarkdownComponents = {
  h1: props => <Title order={1} {...props} />,
  h2: props => <Title order={2} {...props} />,
  h3: props => <Title order={3} {...props} />,
  h4: props => <Title order={4} {...props} />,
  h5: props => <Title order={5} {...props} />,
  h6: props => <Title order={6} {...props} />,
  a: Anchor,
  blockquote: Blockquote,
  code: Code,
  hr: props => <Divider {...props} mt="sm" mb="sm" />,
  ul: List,
  ol: props => <List {...props} type="ordered" />,
  pre: props => <Code {...props} block />,
  table: props => <Table {...props} striped />,
  thead: Table.Thead,
  tbody: Table.Tbody,
  tr: Table.Tr,
  td: Table.Td,
  th: Table.Th,
  // explicitly deny images
  img: () => null,
  image: () => null,
};

export const Markdown = ({ markdown }: MarkdownProps) => {
  return (
    <div className={styles.markdown}>
      <TanstackMarkdown components={components} allowHtml={false}>
        {markdown}
      </TanstackMarkdown>
    </div>
  );
};
