const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setViewport({
    width: 375,
    height: 812,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });

  await page.goto('https://daily-wisdom.vercel.app', { waitUntil: 'networkidle2' });
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

  const screenshotPath = '/Users/robin/.gemini/antigravity/brain/ed3e3e05-78e4-4a3d-a976-95ab3a3b8f2a/vercel_iphone12mini_proof.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Screenshot saved to', screenshotPath);

  await browser.close();
})();
