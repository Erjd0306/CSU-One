import type { Plugin } from 'vite'

/** Vite plugin that compiles src/pages/**\/*.html templates into src/generated/views. */
export function csuTemplates(): Plugin
export function compileAll(root?: string): { count: number }
export function compileFile(root: string, file: string): boolean
