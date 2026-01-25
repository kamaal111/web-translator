import type { HonoContext } from '../context';
import { ProjectsRepositoryImpl, type ProjectsRepository } from '../projects/repositories/projects';
import { SnapshotsRepositoryImpl, type SnapshotsRepository } from '../strings/repositories/snapshots';
import { StringsRepositoryImpl, type StringsRepository } from '../strings/repositories/strings';
import type { Database } from './types';

class DrizzleClient implements Database {
  readonly projects: ProjectsRepository;
  readonly strings: StringsRepository;
  readonly snapshots: SnapshotsRepository;

  constructor(params: { context: HonoContext }) {
    this.projects = new ProjectsRepositoryImpl(params);
    this.strings = new StringsRepositoryImpl(params);
    this.snapshots = new SnapshotsRepositoryImpl(params);
  }
}

export default DrizzleClient;
