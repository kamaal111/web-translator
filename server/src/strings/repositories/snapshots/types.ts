import type Project from '../../../projects/models/project';
import type TranslationSnapshot from './models';

export interface SnapshotsRepository {
  /**
   * Get a specific version snapshot for a project/locale.
   * Returns null if the version doesn't exist.
   */
  getSnapshot(projectId: string, locale: string, version: number): Promise<TranslationSnapshot | null>;

  /**
   * Get the latest (highest version) snapshot for a project/locale.
   * Returns null if no snapshots exist.
   */
  getLatestSnapshot(projectId: string, locale: string): Promise<TranslationSnapshot | null>;

  /**
   * Create a new snapshot from the current translations.
   * Auto-increments version number.
   * Returns the created snapshot.
   */
  createSnapshot(project: Project, locale: string): Promise<TranslationSnapshot>;
}
