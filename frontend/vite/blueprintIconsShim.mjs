// Re-exports the real @blueprintjs/icons entry but replaces `Icons` (the string icon path loader) with a no-op stub.
// Blueprint's <Icon> always imports `Icons` for its string-icon code path, so the lazy loader are  emitted as chunks
// even though nothing in this app _should_ render a string icon, they should all be component-based. This lets it
// tree shake correctly to drop the lazy loader chunks. (though the chunks would never load I don't think, just keeps it clean)
const warnMissingIcon = (icons, size) => {
  const names = Array.isArray(icons) ? icons : [icons];
  console.warn(
    `[blueprint-icons shim] string icon${names.length > 1 ? 's' : ''} ${names.join(', ')} (${size}px) cannot be loaded. Icon fonts are not bundled. Use a named icon component from @blueprintjs/icons instead (e.g. icon={<WarningSignIcon />}).`,
  );
};

export const Icons = {
  defaultLoader: 'split-by-size',
  loadedIconPaths16: new Map(),
  loadedIconPaths20: new Map(),
  setLoaderOptions: () => undefined,
  load: (icons, size) => {
    warnMissingIcon(icons, size);
    return Promise.resolve();
  },
  loadAll: () => Promise.resolve(),
  getPaths: icon => {
    warnMissingIcon(icon, undefined);
    return undefined;
  },
  loadImpl: (icon, size) => {
    warnMissingIcon(icon, size);
    return Promise.resolve();
  },
  isValidIconName: () => false,
};

export * from '@blueprintjs/icons/lib/esm/generated/index.js';
