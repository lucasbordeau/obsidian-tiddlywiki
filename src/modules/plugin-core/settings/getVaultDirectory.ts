import type { App } from 'obsidian';
import type { DesktopVaultAdapter } from './DesktopVaultAdapter';

export function getVaultDirectory(app: App): string {
  return (app.vault.adapter as DesktopVaultAdapter).basePath;
}
