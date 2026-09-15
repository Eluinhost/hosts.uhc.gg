// eslint rule to check for string icons and point to import components instead
const ICON_ATTR_RE = /icon$/i;

const pascalCase = s => s.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
const componentFor = name => `${pascalCase(name)}Icon`;

export default {
  meta: {
    name: 'no-string-icons',
    type: 'suggestion',
    docs: {
      description:
        'Disallow string-literal Blueprint icons. The icon fonts are not bundled, so `icon="tick"` renders blank — use the named <TickIcon /> component (imported from @blueprintjs/icons) instead.',
    },
    messages: {
      jsx: "Use <{{ component }} /> instead of '{{ name }}' — string icons render blank. Import {{ component }} from '@blueprintjs/icons'.",
      object:
        "Use createElement({{ component }}) instead of '{{ name }}' — string icons render blank. Import {{ component }} from '@blueprintjs/icons'.",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        const attrName = node.name?.name;
        // Ignore hyphenated attributes (e.g. data-icon) which are not Blueprint icon props.
        if (!attrName || attrName.includes('-') || !ICON_ATTR_RE.test(attrName)) {
          return;
        }

        // icon="tick"
        if (node.value?.type === 'Literal' && typeof node.value.value === 'string') {
          context.report({
            node,
            messageId: 'jsx',
            data: { name: node.value.value, component: componentFor(node.value.value) },
          });
          return;
        }

        // icon={"tick"}
        const expr = node.value?.type === 'JSXExpressionContainer' ? node.value.expression : null;
        if (expr?.type === 'Literal' && typeof expr.value === 'string') {
          context.report({
            node,
            messageId: 'jsx',
            data: { name: expr.value, component: componentFor(expr.value) },
          });
        }
      },
      Property(node) {
        // Object literals only — not destructuring patterns or class properties.
        if (node.parent?.type !== 'ObjectExpression') {
          return;
        }
        if (node.method || node.kind !== 'init') {
          return;
        }
        if (node.key?.type !== 'Identifier' || node.key.name !== 'icon') {
          return;
        }
        if (node.value?.type === 'Literal' && typeof node.value.value === 'string') {
          context.report({
            node,
            messageId: 'object',
            data: { name: node.value.value, component: componentFor(node.value.value) },
          });
        }
      },
    };
  },
};
