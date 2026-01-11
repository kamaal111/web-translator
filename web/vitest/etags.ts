import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import type { Dirent } from 'node:fs';

import type { PluginOption } from 'vite';

const NAME = 'etags';
const DEFAULT_OUT_DIR = 'dist';
const HASH_ALGORITHM = 'sha1';
const HASH_ENCODING: BufferEncoding = 'hex';

type EtagsOptions = { outDir?: string } | undefined;

function etags(options?: EtagsOptions): PluginOption {
  return { name: NAME, closeBundle: closeBundle(options) };
}

function closeBundle(options: EtagsOptions) {
  const outDir = options?.outDir ?? DEFAULT_OUT_DIR;

  return async () => {
    const content = await fs.readdir(outDir, { recursive: true, withFileTypes: true });
    const etagsEntries = await Promise.all(content.map(mapDirentToEtagEntry(outDir)));
    const etags = Object.fromEntries(etagsEntries.filter(entry => entry != null));
    const etagPath = path.join(outDir, 'etags.json');

    await fs.writeFile(etagPath, JSON.stringify(etags, null, 2));
    console.log('✅ Generated etags at', etagPath);
  };
}

function mapDirentToEtagEntry(outDir: string) {
  return async (dirent: Dirent<string>) => {
    if (!dirent.isFile()) {
      return null;
    }

    const fullPath = path.join(dirent.parentPath, dirent.name);
    const filepath = `/${path.relative(outDir, fullPath)}`;

    const fileContent = await fs.readFile(fullPath, { encoding: 'utf-8' });
    const etag = generateETAG(fileContent);

    return [filepath, etag];
  };
}

function generateETAG(data: string): string {
  return crypto.createHash(HASH_ALGORITHM).update(data).digest().toString(HASH_ENCODING);
}

export default etags;
