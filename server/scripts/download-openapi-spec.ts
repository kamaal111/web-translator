import assert from 'node:assert';

import z from 'zod';
import { generateSpecs } from 'hono-openapi';

import app from '../src';
import { jsonSpecToYaml } from '../src/docs/handlers/yaml-spec';

const ArgsSchema = z.tuple([
  z
    .string()
    .nonempty()
    .refine(path => path.endsWith('.yaml'), 'Output file must have .yaml extension'),
]);

let outputFile: string;
try {
  [outputFile] = ArgsSchema.parse(process.argv.slice(2));
} catch (error) {
  console.log('🐸🐸🐸 error', error);
  assert(error instanceof z.ZodError);

  console.error('❌ Invalid arguments:');
  error.issues.forEach(issue => {
    const argName = issue.path.length > 0 ? `Argument ${Number(issue.path[0]) + 1}` : 'Arguments';
    console.error(`   ${argName}: ${issue.message}`);
  });
  console.error('Usage: tsx scripts/download-openapi-spec.ts <outputFile> <serverUrl>');
  process.exit(1);
}

const specs = await generateSpecs(app, {});
const yamlSpec = jsonSpecToYaml(specs);
const file = Bun.file(outputFile);
await file.write(yamlSpec);
console.log(`✅ OpenAPI spec successfully downloaded to: ${outputFile}`);
