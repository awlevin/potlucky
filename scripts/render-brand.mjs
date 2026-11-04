// Renders docs/banner.png (README header) and docs/social-preview.png
// (GitHub social preview, 1280x640) from scripts/brand/brand.html.
//   yarn brand-images
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const src = new URL("./brand/brand.html", import.meta.url).href;
const docs = new URL("../docs/", import.meta.url).pathname;

const targets = [
  { variant: "banner", width: 1280, height: 400, scale: 2, out: "banner.png" },
  { variant: "social", width: 1280, height: 640, scale: 1, out: "social-preview.png" },
];

await mkdir(docs, { recursive: true });
const browser = await chromium.launch();
for (const t of targets) {
  const page = await browser.newPage({
    viewport: { width: t.width, height: t.height },
    deviceScaleFactor: t.scale,
  });
  await page.goto(`${src}?variant=${t.variant}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${docs}${t.out}`, clip: { x: 0, y: 0, width: t.width, height: t.height } });
  await page.close();
  console.log(`wrote docs/${t.out}`);
}
await browser.close();
