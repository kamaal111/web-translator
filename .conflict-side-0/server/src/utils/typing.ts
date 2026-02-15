export type ReplaceValue<OriginalObject, KeyToReplace extends keyof OriginalObject, Replacement> = Omit<
  OriginalObject,
  KeyToReplace
> & {
  [ReplacementKey in KeyToReplace]: Replacement;
};

export type ReplaceValues<OriginalObject, Replacements extends Record<string, unknown>> = Omit<
  OriginalObject,
  keyof Replacements
> &
  Replacements;

export type Optional<Wrapped> = Wrapped | null | undefined;

export function unsafeCast<T>(value: unknown) {
  return value as T;
}
