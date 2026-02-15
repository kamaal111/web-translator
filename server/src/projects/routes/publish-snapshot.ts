import z from 'zod';
import { describeRoute, resolver, validator } from 'hono-openapi';
import { ErrorResponseSchema } from '@wt/schemas';
import { arrays } from '@kamaalio/kamaal';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { getLogger } from '../../context/logging';
import { OPENAPI_TAG } from '../constants';
import {
  ProjectIdShape,
  PublishSnapshotBodySchema,
  PublishSnapshotResponseSchema,
  type PublishSnapshotBody,
  type PublishSnapshotResponse,
} from '../schemas';
import { getValidatedProject } from '../utils';
import { PartialAuthenticationHeadersSchema, type PartialAuthenticationHeaders } from '../../schemas/headers';
import { BadRequestException, Conflict } from '../../exceptions';
import { toISO8601String } from '../../utils/dates';
import { verifySessionIsSet } from '../../auth/utils/session';
import type Project from '../models/project';
import type { Optional } from '../../utils/typing';
import type TranslationSnapshot from '../../strings/models/translation-snapshot';

type PublishSnapshotParams = z.infer<typeof PublishSnapshotParamsSchema>;

type PublishSnapshotInput = {
  out: { param: PublishSnapshotParams; json: PublishSnapshotBody; header: PartialAuthenticationHeaders };
};

const PublishSnapshotParamsSchema = z.object({
  projectId: ProjectIdShape,
});

function publishSnapshotRoute() {
  return [
    '/:projectId/publish',
    describeRoute({
      description:
        'Publish all current draft translations to create new immutable snapshots for selected locales. This captures the current state of all draft strings at a specific point in time.',
      tags: [OPENAPI_TAG],
      responses: {
        200: {
          description: 'Snapshots published successfully',
          content: {
            'application/json': { schema: resolver(PublishSnapshotResponseSchema) },
          },
        },
        400: {
          description: 'Invalid request parameters or no draft translations',
          content: {
            'application/json': { schema: resolver(ErrorResponseSchema) },
          },
        },
        404: {
          description: 'Project not found',
          content: {
            'application/json': { schema: resolver(ErrorResponseSchema) },
          },
        },
        409: {
          description: 'No changes detected (draft matches latest snapshot)',
          content: {
            'application/json': { schema: resolver(ErrorResponseSchema) },
          },
        },
      },
    }),
    validator('header', PartialAuthenticationHeadersSchema),
    validator('param', PublishSnapshotParamsSchema),
    validator('json', PublishSnapshotBodySchema),
    async (c: HonoContext<PublishSnapshotInput>) => {
      const session = await verifySessionIsSet(c);

      const { projectId } = c.req.valid('param');
      const project = await getValidatedProject(c, projectId);

      const { locales: requestedLocales, force } = c.req.valid('json');
      const localesToPublish = resolveLocales(c, { requestedLocales, enabledLocales: project.enabledLocales });
      const draftDataByLocale = await getDatabase(c).snapshots.getDraftDataForLocales(project, localesToPublish);
      const localesWithData = new Map(
        Array.from(draftDataByLocale.entries()).filter(([, data]) => Object.keys(data).length > 0),
      );
      if (localesWithData.size === 0) {
        getLogger(c).error('No draft translations found for publishing', {
          project_id: project.id,
          requested_locales: requestedLocales,
          enabled_locales: project.enabledLocales,
          operation: 'publish_snapshot',
        });

        throw new BadRequestException(c, {
          message: 'No draft translations found to publish',
        });
      }

      const localesToCreate = await collectLocalesToPublish(c, { project, force, localesWithData });
      const createdSnapshots = await getDatabase(c).snapshots.createSnapshots(project, localesToCreate);
      const published: PublishSnapshotResponse['published'] = Array.from(createdSnapshots.entries()).map(
        ([locale, snapshot]) => ({
          locale,
          version: snapshot.version,
          snapshotId: snapshot.id,
          stringCount: Object.keys(snapshot.data).length,
          createdAt: toISO8601String(new Date()),
        }),
      );
      const response: PublishSnapshotResponse = {
        published,
        createdBy: { id: session.user.id, name: session.user.name },
      };

      getLogger(c).info('Snapshots published successfully', {
        project_id: projectId,
        locales_published: published.length.toString(),
        total_strings: published.reduce((sum, p) => sum + p.stringCount, 0).toString(),
        user_id: session.user.id,
      });

      return c.json(response, 200);
    },
  ] as const;
}

async function collectLocalesToPublish(
  c: HonoContext,
  {
    localesWithData,
    force,
    project,
  }: { localesWithData: Map<string, Record<string, string>>; force: boolean; project: Project },
): Promise<string[]> {
  const localesWithDataEntries = Array.from(localesWithData.entries());
  const localesToCreate = localesWithDataEntries.map(([locale]) => locale);
  if (force) {
    return localesToCreate;
  }

  const latestSnapshots = await getDatabase(c).snapshots.getLatestSnapshots(project, localesToCreate);
  const noChangeLocales = arrays.compactMap(localesWithDataEntries, ([locale, draftData]) => {
    const latestSnapshot = latestSnapshots.get(locale);
    if (!latestSnapshot || !areDatasEqual(draftData, latestSnapshot)) {
      return null;
    }
    return locale;
  });

  if (noChangeLocales.length === localesWithData.size) {
    getLogger(c).error('No changes detected for publish', {
      project_id: project.id,
      locales: noChangeLocales.join(','),
      operation: 'publish_snapshot',
      force_flag: force.toString(),
    });

    throw new Conflict(c, {
      message: 'Draft translations are identical to the latest snapshot. Use force=true to publish anyway.',
      code: 'NO_CHANGES_DETECTED',
    });
  }

  return localesToCreate.filter(locale => !noChangeLocales.includes(locale));
}

function resolveLocales(
  c: HonoContext,
  { requestedLocales, enabledLocales }: { requestedLocales: Optional<string[]>; enabledLocales: string[] },
): string[] {
  if (requestedLocales == null || requestedLocales.length === 0) {
    return enabledLocales;
  }

  const enabledSet = new Set(enabledLocales);
  const invalidLocales = requestedLocales.filter(locale => !enabledSet.has(locale));
  if (invalidLocales.length > 0) {
    getLogger(c).error('Publish requested for non-enabled locales', {
      invalid_locales: invalidLocales.join(','),
      enabled_locales: enabledLocales.join(','),
      operation: 'publish_snapshot',
    });

    throw new BadRequestException(c, {
      message: `Locale(s) not enabled for this project: ${invalidLocales.join(', ')}`,
    });
  }

  return requestedLocales;
}

function areDatasEqual(draft: Record<string, string>, snapshot: TranslationSnapshot): boolean {
  const draftKeys = Object.keys(draft).sort();
  const snapshotKeys = snapshot.sortedDataKeys;
  if (draftKeys.length !== snapshotKeys.length) {
    return false;
  }

  return draftKeys.every((draftKey, i) => {
    const snapshotKey = snapshotKeys[i];
    if (draftKey !== snapshotKey) {
      return false;
    }

    if (draft[draftKey] !== snapshot.data[draftKey]) {
      return false;
    }

    return true;
  });
}

export default publishSnapshotRoute;
