const isVanillaPlus = (item: string): boolean => item.toLowerCase() === 'vanilla+';

/**
 * Applies the vanilla+ scenario rules: an empty scenario list defaults to
 * ['Vanilla+'] and vanilla+ is stripped as soon as any other scenario is present.
 */
export const applyScenarioRules = (items: string[]): string[] => {
  if (items.length === 0) {
    return ['Vanilla+'];
  }

  if (items.length > 1 && items.some(isVanillaPlus)) {
    return items.filter(item => !isVanillaPlus(item));
  }

  return items;
};
