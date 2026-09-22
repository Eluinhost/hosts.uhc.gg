// eslint rule to require an explicit `getOnInit` on atomWithStorage (jotai v3)
//
// fixes issues with race conditions and mounting

const JOTAI_PACKAGE_REGEX = /^jotai(\/.*)?$/;

const hasGetOnInit = objectExpression =>
  objectExpression.properties.some(
    property =>
      property.type === 'Property' &&
      !property.computed &&
      ((property.key.type === 'Identifier' && property.key.name === 'getOnInit') ||
        (property.key.type === 'Literal' && property.value === 'getOnInit')),
  );

export default {
  meta: {
    name: 'require-atom-with-storage-getoninit',
    type: 'problem',
    docs: {
      description: 'Require an explicit `getOnInit` option on atomWithStorage calls',
    },
    messages: {
      missingArgument: 'atomWithStorage must pass an explicit `getOnInit` option as the 4th argument',
      missingOption: 'The atomWithStorage options object must explicitly set `getOnInit` (true or false).',
    },
    schema: [],
  },
  create(context) {
    const namedLocals = new Set();
    const namespaceLocals = new Set();

    return {
      ImportDeclaration(node) {
        if (!JOTAI_PACKAGE_REGEX.test(node.source.value)) {
          return;
        }
        for (const spec of node.specifiers) {
          if (spec.type === 'ImportSpecifier' && spec.imported?.name === 'atomWithStorage') {
            namedLocals.add(spec.local.name);
          } else if (spec.type === 'NamespaceImport') {
            namespaceLocals.add(spec.local.name);
          }
        }
      },
      CallExpression(node) {
        const callee = node.callee;
        const isJotaiCall =
          (callee.type === 'Identifier' && namedLocals.has(callee.name)) ||
          (callee.type === 'MemberExpression' &&
            !callee.computed &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'atomWithStorage' &&
            callee.object.type === 'Identifier' &&
            namespaceLocals.has(callee.object.name));

        if (!isJotaiCall) {
          return;
        }

        const [, , , options] = node.arguments;

        if (!options) {
          context.report({ node, messageId: 'missingArgument' });
          return;
        }

        if (options.type === 'ObjectExpression') {
          if (!hasGetOnInit(options)) {
            context.report({ node: options, messageId: 'missingOption' });
          }
          return;
        }

        if (options.type === 'Identifier') {
          let scope = context.sourceCode.getScope(options);
          while (scope) {
            const variable = scope.set.get(options.name);
            if (variable) {
              const def = variable.defs.find(d => d.type === 'Variable');
              if (def?.parent?.init?.type === 'ObjectExpression') {
                if (!hasGetOnInit(def.parent.init)) {
                  context.report({ node: options, messageId: 'missingOption' });
                }
              }
              return;
            }
            scope = scope.upper;
          }
        }
      },
    };
  },
};
