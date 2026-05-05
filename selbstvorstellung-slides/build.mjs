import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const root = path.dirname(url.fileURLToPath(import.meta.url));
const srcDir = path.join(root, "src");
const slidesDir = path.join(srcDir, "slides");
const outFile = path.join(root, "index.html");

const slideFiles = fs
  .readdirSync(slidesDir)
  .filter((file) => file.endsWith(".html"))
  .sort((a, b) => a.localeCompare(b));

const slides = slideFiles.map((file) =>
  fs.readFileSync(path.join(slidesDir, file), "utf8").trim(),
);

const inlineScript = (assetPath) => {
  const body = fs
    .readFileSync(path.join(root, assetPath), "utf8")
    .replaceAll("</script>", "<\\/script>");
  return `    <script type="text/babel">\n${body}\n    </script>`;
};

const html = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <title>Selbstvorstellung — Thorben Wölk</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link rel="icon" href="data:,">
    <link rel="stylesheet" href="assets/styles.css">
  </head>
  <body>
    <deck-stage width="1920" height="1080">
${slides.map((slide) => indent(slide, 6)).join("\n")}
    </deck-stage>
    <!-- React + Babel for the tweak panel + word cloud -->
    <script src="assets/react.development.js"></script>
    <script src="assets/react-dom.development.js"></script>
    <script src="assets/babel-standalone.js"></script>
    <script src="assets/deck-stage.js"></script>
    <script src="assets/role-carousel.js"></script>
${inlineScript("assets/tweaks-panel.jsx")}
${inlineScript("assets/word-cloud.jsx")}
${inlineScript("assets/architecture-sketch.jsx")}
  </body>
</html>
`;

fs.writeFileSync(outFile, html);
console.log(`Built ${path.relative(process.cwd(), outFile)} from ${slides.length} slides.`);

function indent(text, spaces) {
  const prefix = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}
