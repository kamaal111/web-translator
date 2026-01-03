export function objectKeys<T extends Record<string | number | symbol, unknown>>(object: T): { [Key in keyof T]: Key } {
  return Object.keys(object).reduce((acc, key) => ({ ...acc, [key]: key }), {}) as { [Key in keyof T]: Key };
}
