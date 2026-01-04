import path from 'node:path';
import fs from 'node:fs/promises';

import type { PluginOption } from 'vite';

const DEFAULT_OUT_DIR = 'dist';

type RenameOutputOptions = { outDir?: string; renames: Record<string, string> };

function renameOutput(options: RenameOutputOptions): PluginOption {
  const outDir = options.outDir ?? DEFAULT_OUT_DIR;

  return {
    name: 'rename-html',
    closeBundle: async () => {
      await Promise.all(
        Object.entries(options.renames).map(async ([initial, rename]) => {
          const initialPath = path.join(outDir, initial);
          const renamePath = path.join(outDir, rename);
          await fs.rename(initialPath, renamePath);
          console.log(`Renamed ${initialPath} -> ${renamePath}`);
        }),
      );
    },
  };
}

export default renameOutput;
