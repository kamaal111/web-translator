import type { ProjectsRepository } from '../projects/repositories/projects';
import type { SnapshotsRepository } from '../strings/repositories/snapshots';
import type { StringsRepository } from '../strings/repositories/strings';

export interface Database {
  projects: ProjectsRepository;
  strings: StringsRepository;
  snapshots: SnapshotsRepository;
}
