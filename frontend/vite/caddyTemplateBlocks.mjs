export const caddyTemplateBlocks = () => {
  let command;

  return {
    name: 'caddy-template-blocks',
    configResolved(config) {
      command = config.command;
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const devBlock =
          /^[ \t]*<!-- caddy-template:dev:start -->[\s\S]*?^[ \t]*<!-- caddy-template:dev:end -->[ \t]*\r?\n?/gm;
        const prodBlock =
          /^[ \t]*<!-- caddy-template:start -->[\s\S]*?^[ \t]*<!-- caddy-template:end -->[ \t]*\r?\n?/gm;
        const devDelimiters = /^[ \t]*<!-- caddy-template:dev:(?:start|end) -->[ \t]*\r?\n?/gm;
        const prodDelimiters = /^[ \t]*<!-- caddy-template:(?:start|end) -->[ \t]*\r?\n?/gm;

        const next =
          command === 'serve'
            ? html.replace(prodBlock, '').replace(devDelimiters, '')
            : html.replace(devBlock, '').replace(prodDelimiters, '');

        return next.replace(/\n{3,}/g, '\n\n');
      },
    },
  };
};
