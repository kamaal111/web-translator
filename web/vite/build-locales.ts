import path from 'node:path';
import fs from 'node:fs/promises';

import { extract } from '@formatjs/cli-lib';
import { arrays, objects } from '@kamaalio/kamaal';
import type { MessageDescriptor } from 'react-intl';
import type { PluginOption } from 'vite';

type ExtractedMessages = Record<string, MessageDescriptor>;

const NAME = 'build-locales';
const ROOT = 'src';
const MESSAGES_FILES_PATTERN = '**/messages.ts';
const GENERATED_CONSTANTS_FILE_PATH = 'src/translations/messages/constants.ts';

function buildLocales(): PluginOption {
  return { name: NAME, config };
}

async function config() {
  console.log('🌍 Building locales...');

  const messagesFilesPaths = await getMessageFilePaths();
  const extractedMessagesJSON = await extract(messagesFilesPaths, {});
  const extractedMessages: ExtractedMessages = JSON.parse(extractedMessagesJSON);
  const messagesWithJustDefaults = Object.fromEntries(
    arrays.compactMap(objects.toEntries(extractedMessages), ([key, value]) => {
      if (value.defaultMessage == null) return null;
      return [key, value.defaultMessage];
    }),
  );
  const unflattenMessages = objects.unflatten(messagesWithJustDefaults, '.');
  const messagesKeys = Object.keys(messagesWithJustDefaults).reduce(
    (acc, key) => ({ ...acc, [key.split('.').join('_').toUpperCase()]: key }),
    {},
  );
  const messagesConstants = `export const MESSAGES_KEYS = ${JSON.stringify(messagesKeys, null, 2)} as const`;
  await Promise.all(
    [
      {
        destination: GENERATED_CONSTANTS_FILE_PATH,
        data: messagesConstants,
      },
      {
        destination: path.join(ROOT, 'translations/messages/en.json'),
        data: `${JSON.stringify(unflattenMessages, null, 2)}\n`,
      },
    ].map(async ({ destination, data }) => fs.writeFile(destination, data, 'utf-8')),
  );

  console.log('✅ Built locales successfully');
}

async function getMessageFilePaths() {
  const messagesFilesPaths: string[] = [];
  for await (const file of fs.glob(MESSAGES_FILES_PATTERN, { cwd: ROOT })) {
    messagesFilesPaths.push(path.join(ROOT, file));
  }

  return messagesFilesPaths;
}

export default buildLocales;
