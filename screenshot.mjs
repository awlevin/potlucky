import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3002';
const name = process.argv[3] || 'screenshot';
const dark = process.argv[4] === 'dark';

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  colorScheme: dark ? 'dark' : 'light',
});

await page.goto(url, { waitUntil: 'load', timeout: 15000 });
await page.waitForTimeout(5000); // wait longer for client-side hydration + animations

// Log any console errors
page.on('console', msg => {
  if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
});

await page.screenshot({ path: `/tmp/${name}.png`, fullPage: true });
console.log(`Screenshot saved to /tmp/${name}.png (${dark ? 'dark' : 'light'} mode)`);

// Check if hero content is visible
const heroText = await page.$eval('.hero-heading', el => el.textContent).catch(() => 'NOT FOUND');
console.log(`Hero heading: ${heroText}`);

const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
console.log(`Body bg: ${bodyBg}`);

const heroEl = await page.$('.hero');
if (heroEl) {
  const heroBg = await heroEl.evaluate(el => getComputedStyle(el).background);
  console.log(`Hero bg: ${heroBg}`);
}

// If asked to navigate to room, click the button
if (process.argv[5] === 'click-cta') {
  const btn = await page.$('button.btn-lg, button.btn');
  if (btn) {
    await btn.click();
    await page.waitForURL('**/potlucks/**', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `/tmp/${name}-room.png`, fullPage: true });
    console.log(`Room screenshot saved to /tmp/${name}-room.png`);
  } else {
    console.log('No CTA button found');
  }
}

await browser.close();
