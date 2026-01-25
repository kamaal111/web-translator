export function isWithinRange(value: number, options: { min: number; max: number }): boolean {
  if (options.min > options.max) {
    return false;
  }

  return value >= options.min && value <= options.max;
}
