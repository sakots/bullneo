import { copyFile } from "node:fs/promises";

await copyFile(
  new URL("../.build/bullneo.js", import.meta.url),
  new URL("../bullneo.js", import.meta.url),
);
