import { App } from 'obsidian';
import { DesktopVaultAdapter } from '@/modules/plugin-core/settings/DesktopVaultAdapter';

export function getVaultDirectory(app: App): string {
  return (app.vault.adapter as DesktopVaultAdapter).basePath;
}
