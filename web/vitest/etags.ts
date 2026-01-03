import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';

import type { PluginOption } from 'vite';

const DEFAULT_OUT_DIR = 'dist';

type EtagsOptions = { outDir?: string } | undefined;

function etags(options?: EtagsOptions): PluginOption {
  return {
    name: 'generate-etags',
    closeBundle: async () => {
      const outDir = options?.outDir ?? DEFAULT_OUT_DIR;
      const content = await fs.readdir(outDir, { recursive: true, withFileTypes: true });
      const etags = content.reduce<Record<string, string>>((acc, dirent) => {
        if (!dirent.isFile()) {
          return acc;
        }

        const fullPath = path.join(dirent.parentPath, dirent.name);
        const filepath = `/${path.relative(outDir, fullPath)}`;

        return { ...acc, [filepath]: generateETAG(filepath) };
      }, {});
      const etagPath = path.join(outDir, 'etags.json');

      await fs.writeFile(etagPath, JSON.stringify(etags, null, 2));
      console.log('Generated etags at', etagPath);
    },
  };
}

function generateETAG(data: string) {
  return crypto.createHash('sha256').update(data).digest().toString('hex');
}

export default etags;
