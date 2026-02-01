import type Project from '../../../projects/models/project';
import type StringModel from '../../models/string';
import type TranslationSnapshot from '../../models/translation-snapshot';

/**
 * Version history item with author information from snapshots
 */
interface SnapshotVersionItem {
  version: number;
  value: string;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
}

/**
 * Paginated snapshot versions result
 */
export interface PaginatedSnapshotVersions {
  versions: SnapshotVersionItem[];
  totalVersions: number;
  hasMore: boolean;
}

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

  /**
   * Get all locales that have snapshots for a project.
   */
  getLocalesWithSnapshots(project: Project): Promise<Set<string>>;

  /**
   * Get version history for a specific string key across multiple locales.
   * Returns a map of locale -> PaginatedSnapshotVersions.
   */
  getVersionsForStringAcrossLocales(
    project: Project,
    locales: string[],
    str: StringModel,
    page: number,
    pageSize: number,
  ): Promise<Map<string, PaginatedSnapshotVersions>>;
}
