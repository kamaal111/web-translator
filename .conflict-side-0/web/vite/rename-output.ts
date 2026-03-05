import path from 'node:path';
import fs from 'node:fs/promises';

import type { PluginOption } from 'vite';

const NAME = 'rename-output';
const DEFAULT_OUT_DIR = 'dist';

type RenameOutputOptions = { outDir?: string; renames: Record<string, string> };

function renameOutput(options: RenameOutputOptions): PluginOption {
  return { name: NAME, closeBundle: closeBundle(options) };
}

function closeBundle(options: RenameOutputOptions) {
  const outDir = options.outDir ?? DEFAULT_OUT_DIR;

  return async () => {
    await Promise.all(Object.entries(options.renames).map(rename(outDir)));
  };
}

function rename(outDir: string) {
  return async ([initial, rename]: [initialName: string, renameName: string]) => {
    const initialPath = path.join(outDir, initial);
    const initialPathExists = await fileExists(initialPath);
    if (!initialPathExists) {
      console.warn(`⚠️ ${initialPath} does not exist`);
      return;
    }
    const renamePath = path.join(outDir, rename);

    try {
      await fs.rename(initialPath, renamePath);
      console.log(`✅ Renamed ${initialPath} -> ${renamePath}`);
    } catch (error) {
      console.error(
        `❌ Failed to rename ${initialPath}; error=${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  };
}

async function fileExists(filepath: string) {
  try {
    await fs.access(filepath);
  } catch {
    return false;
  }
  return true;
}

export default renameOutput;
