const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
  
  await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/Users/armandosilva/.gemini/antigravity/brain/a4040684-31d7-4925-b9e9-2387ad1567b7/scratch/screenshot_final.png', fullPage: true });
  
  await browser.close();
  console.log('Screenshot saved');
})();
