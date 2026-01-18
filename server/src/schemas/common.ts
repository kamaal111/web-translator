import assert from 'node:assert';

import z from 'zod';

export const ApiCommonDatetimeShape = z.iso.datetime({ offset: true });
export const LocaleShape = z
  .string()
  .refine(val => {
    let canonicals: Array<string> = [];
    try {
      canonicals = Intl.getCanonicalLocales(val);
    } catch {
      return false;
    }

    return canonicals[0] != null;
  })
  .transform(val => {
    const canonical = Intl.getCanonicalLocales(val)[0];
    assert(canonical, 'Already validated, so at this point we know there is a value here');

    return canonical;
  });
