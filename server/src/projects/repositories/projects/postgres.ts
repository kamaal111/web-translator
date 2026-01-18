import type { DrizzleDatabase } from '../../../db';
import Project, { type IProject } from '../../models/project';
import type { ProjectsRepository } from './types';

class ProjectsPostgresRepository implements ProjectsRepository {
  private readonly drizzle: DrizzleDatabase;

  constructor(drizzle: DrizzleDatabase) {
    this.drizzle = drizzle;
  }

  createProject = async (payload: Omit<IProject, 'id'>): Promise<Project> => {
    console.log('payload', payload);
    throw new Error('Not implemented');
  };
}

export default ProjectsPostgresRepository;
