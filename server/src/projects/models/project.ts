export type IProject = { id: string; name: string; defaultLocale: string; enabledLocales: string[]; publicKey: string };

class Project implements IProject {
  id: string;
  name: string;
  defaultLocale: string;
  enabledLocales: string[];
  publicKey: string;

  constructor(params: IProject) {
    this.id = params.id;
    this.name = params.name;
    this.defaultLocale = params.defaultLocale;
    this.enabledLocales = params.enabledLocales;
    this.publicKey = params.publicKey;
  }
}

export default Project;
