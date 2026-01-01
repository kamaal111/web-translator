import path from 'node:path';
import fs from 'node:fs/promises';

import { ProjectsFileStorageRepository, type ProjectsRepository } from '../projects/repositories/projects';
import type { Database } from './types';

class FileStorageDatabase implements Database {
  readonly projects: ProjectsRepository;

  constructor(filepath: string) {
    this.projects = new ProjectsFileStorageRepository(path.join(filepath, 'projects.json'));
  }

  static async setup(filepath: string): Promise<FileStorageDatabase> {
    const directoryExists = await fs.exists(filepath);
    if (!directoryExists) {
      await fs.mkdir(filepath);
    }

    return new FileStorageDatabase(filepath);
  }
}

export default FileStorageDatabase;
