/*
 * Copyright (c) 2024, SkillerRaptor
 *
 * SPDX-License-Identifier: MIT
 */

import builtins from "builtin-modules";
import console from "console";
import esbuild from "esbuild";
import process from "process";

import esbuildSvelte from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";

const prod = process.argv[2] === "production";

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
    ...builtins,
  ],
  format: "cjs",
  target: "es2018",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
  plugins: [
    esbuildSvelte({
      preprocess: sveltePreprocess(),
    }),
  ],
});

if (prod) {
  console.log("Building for production");
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
