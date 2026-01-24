import type { ReplaceValue } from '../../utils/typing';

export type IProject = {
  id: string;
  name: string;
  defaultLocale: string;
  enabledLocales: string[];
  publicKey: string;
  userId: string;
};

type ProjectArguments = ReplaceValue<IProject, 'id', string | null | undefined>;

class Project implements IProject {
  id: string;
  name: string;
  defaultLocale: string;
  enabledLocales: string[];
  publicKey: string;
  userId: string;

  constructor(params: ProjectArguments) {
    this.id = params.id || Bun.randomUUIDv7();
    this.name = params.name;
    this.defaultLocale = params.defaultLocale;
    this.enabledLocales = params.enabledLocales;
    this.publicKey = params.publicKey;
    this.userId = params.userId;
  }
}

export function newProject(args: ProjectArguments) {
  return new Project(args);
}

export default Project;
