import type { DataAdapter } from 'obsidian';

export type DesktopVaultAdapter = DataAdapter & { basePath: string };
