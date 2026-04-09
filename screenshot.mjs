import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3006';
const name = process.argv[3] || 'screenshot';
const dark = process.argv[4] === 'dark';

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  colorScheme: dark ? 'dark' : 'light',
});

await page.goto(url, { waitUntil: 'load', timeout: 15000 });
await page.waitForTimeout(3000);

// If click-cta, create a room
if (process.argv[5] === 'click-cta') {
  const btn = await page.$('button.btn-lg, button.btn');
  if (btn) {
    await btn.click();
    await page.waitForURL('**/potlucks/**', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Pick identity (click "I'm someone new", type name, submit)
    const newBtn = await page.$('button:has-text("someone new")');
    if (newBtn) {
      await newBtn.click();
      await page.waitForTimeout(500);
      const nameInput = await page.$('.identity-card input');
      if (nameInput) {
        await nameInput.fill('Aaron');
        const joinBtn = await page.$('.identity-card button.btn:not(.btn-ghost)');
        if (joinBtn) await joinBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Type something in the food input to show options
    if (process.argv[6] === 'type-food') {
      const foodInput = await page.$('input[placeholder*="dish"]');
      if (foodInput) {
        await foodInput.fill('Mac & Cheese');
        await page.waitForTimeout(500);
      }
    }

    await page.screenshot({ path: `/tmp/${name}-room.png`, fullPage: true });
    console.log(`Room screenshot: /tmp/${name}-room.png`);
    console.log(`URL: ${page.url()}`);
  }
}

await page.screenshot({ path: `/tmp/${name}.png`, fullPage: true });
console.log(`Screenshot: /tmp/${name}.png`);
await browser.close();
