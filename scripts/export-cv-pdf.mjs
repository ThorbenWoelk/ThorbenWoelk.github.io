import { access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const [, , inputPathArg, outputPathArg] = process.argv;
const repoRoot = process.cwd();
const inputPath = path.resolve(repoRoot, inputPathArg ?? "single-page-cv/index.html");
const outputPath = path.resolve(repoRoot, outputPathArg ?? "assets/Thorben_Woelk_CV_2026.pdf");

await access(inputPath);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 2048 },
});

await page.goto(pathToFileURL(inputPath).href, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  await document.fonts.ready;
});
await page.waitForTimeout(300);

await page.pdf({
  path: outputPath,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  margin: {
    top: "0",
    right: "0",
    bottom: "0",
    left: "0",
  },
});

await browser.close();
