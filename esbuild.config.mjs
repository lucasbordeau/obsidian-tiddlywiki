import dotenv from 'dotenv';
import process from 'process';
import { createPluginBuildContext } from './scripts/build/create-plugin-build-context.mjs';

// Load .env file
dotenv.config();

const DEV_VAULT_PLUGIN_FOLDER = process.env.DEV_VAULT_PLUGIN_FOLDER;
const prod = process.argv[2] === 'production';

if (!prod && !DEV_VAULT_PLUGIN_FOLDER) {
  console.error('Error: DEV_VAULT_PLUGIN_FOLDER is not defined in .env');
  process.exit(1);
}

const context = await createPluginBuildContext({
  production: prod,
  pluginFolder: DEV_VAULT_PLUGIN_FOLDER,
});

if (prod) {
  try {
    await context.rebuild();
  } finally {
    await context.dispose();
  }
} else {
  await context.watch();
}
