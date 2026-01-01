import type { IProject } from '../../models/project';
import Project from '../../models/project';
import type { ProjectsRepository } from './types';

class ProjectsFileStorageRepository implements ProjectsRepository {
  private readonly filepath: string;

  constructor(filepath: string) {
    this.filepath = filepath;
  }

  async createProject() {
    const file = await this.getFile();
    const projects: IProject[] = await file.json();
    const createdProject = new Project();
    projects.push(createdProject);
    await file.write(JSON.stringify(projects));

    return createdProject;
  }

  private async getFile(): Promise<Bun.BunFile> {
    const file = Bun.file(this.filepath);
    const fileExists = await file.exists();
    if (!fileExists) {
      await Bun.write(file, '[]');
    }
    return file;
  }
}

export default ProjectsFileStorageRepository;
