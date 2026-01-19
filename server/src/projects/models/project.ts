type ReplaceValue<OriginalObject, KeyToReplace extends keyof OriginalObject, Replacement> = Omit<
  OriginalObject,
  KeyToReplace
> & {
  [ReplacementKey in KeyToReplace]: Replacement;
};

export type IProject = {
  id: string;
  name: string;
  defaultLocale: string;
  enabledLocales: string[];
  publicKey: string;
  userId: string;
};

class Project implements IProject {
  id: string;
  name: string;
  defaultLocale: string;
  enabledLocales: string[];
  publicKey: string;
  userId: string;

  constructor(params: ReplaceValue<IProject, 'id', string | null | undefined>) {
    this.id = params.id || Bun.randomUUIDv7();
    this.name = params.name;
    this.defaultLocale = params.defaultLocale;
    this.enabledLocales = params.enabledLocales;
    this.publicKey = params.publicKey;
    this.userId = params.userId;
  }
}

export default Project;
