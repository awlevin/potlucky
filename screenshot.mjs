import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3002';
const name = process.argv[3] || 'screenshot';
const dark = process.argv[4] === 'dark';

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  colorScheme: dark ? 'dark' : 'light',
});

// Use 'domcontentloaded' instead of 'networkidle' to avoid Firebase timeout
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
await page.waitForTimeout(3000);

await page.screenshot({ path: `/tmp/${name}.png`, fullPage: true });
console.log(`Screenshot saved to /tmp/${name}.png (${dark ? 'dark' : 'light'} mode)`);

// If asked to navigate to room, click the button and wait
if (process.argv[5] === 'click-cta') {
  const btn = await page.$('button:has-text("Start a Potluck")');
  if (btn) {
    await btn.click();
    await page.waitForURL('**/potlucks/**', { timeout: 10000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `/tmp/${name}-room.png`, fullPage: true });
    console.log(`Room screenshot saved to /tmp/${name}-room.png`);
    console.log(`Room URL: ${page.url()}`);
  }
}

await browser.close();
