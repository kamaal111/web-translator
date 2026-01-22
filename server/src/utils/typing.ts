export type ReplaceValue<OriginalObject, KeyToReplace extends keyof OriginalObject, Replacement> = Omit<
  OriginalObject,
  KeyToReplace
> & {
  [ReplacementKey in KeyToReplace]: Replacement;
};

export function unsafeCast<T>(value: unknown) {
  return value as T;
}
