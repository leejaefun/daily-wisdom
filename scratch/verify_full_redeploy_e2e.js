const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/robin/.gemini/antigravity/brain/ed3e3e05-78e4-4a3d-a976-95ab3a3b8f2a';
const PROJECT_DIR = '/Users/robin/.gemini/antigravity/scratch/daily-wisdom';

async function runTests() {
  console.log('==================================================');
  console.log('🔍 DAILY WISDOM FULL E2E RE-TEST SUITE');
  console.log('==================================================');

  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passCount++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failCount++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: AppIcon Asset Verification
  // ----------------------------------------------------
  console.log('\n--- TEST 1: iOS AppIcon Asset Check ---');
  const iconPath = path.join(PROJECT_DIR, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
  const originalIconPath = path.join(PROJECT_DIR, 'assets/app_icon_1024.png');

  const iconExists = fs.existsSync(iconPath);
  assert(iconExists, 'AppIcon file exists in Assets.xcassets');

  if (iconExists) {
    const iconSize = fs.statSync(iconPath).size;
    const origSize = fs.statSync(originalIconPath).size;
    assert(iconSize === origSize, `AppIcon size matches official asset (${iconSize} bytes)`);
    assert(iconSize !== 41273, 'AppIcon is NOT the default Capacitor grid placeholder logo (41273 bytes)');
  }

  // ----------------------------------------------------
  // TEST 2: Quote Seeded Shuffle Logic (REQ-01)
  // ----------------------------------------------------
  console.log('\n--- TEST 2: Seeded Quote Shuffle Algorithm ---');
  const quotesFile = fs.readFileSync(path.join(PROJECT_DIR, 'lib/quotes.ts'), 'utf-8');
  assert(quotesFile.includes('getYearPermutation'), 'lib/quotes.ts contains getYearPermutation function');
  assert(quotesFile.includes('getQuoteForDate'), 'lib/quotes.ts contains getQuoteForDate function');

  // ----------------------------------------------------
  // TEST 3: Share Text & App Store URL (REQ-02)
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Share Button & App Store URL ---');
  const shareBtnFile = fs.readFileSync(path.join(PROJECT_DIR, 'app/components/ShareButton.tsx'), 'utf-8');
  assert(shareBtnFile.includes('https://apps.apple.com/app/id6759272132'), 'ShareButton.tsx includes App Store URL (id6759272132)');
  assert(!shareBtnFile.includes('Daily Wisdom Card Watermark'), 'No unwanted watermark div in quote card');

  // ----------------------------------------------------
  // TEST 4: E2E Puppeteer UI Tests on iPhone 12 Mini
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Puppeteer E2E Mobile UI Verification (iPhone 12 Mini) ---');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set iPhone 12 Mini viewport (375x812)
    await page.setViewport({
      width: 375,
      height: 812,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });

    await page.goto('https://daily-wisdom.vercel.app', { waitUntil: 'networkidle2' });
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 800)));

    // 4a. Floating Pill Bar Verification
    const navPillExists = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return false;
      const classes = nav.className;
      return classes.includes('rounded-full') && classes.includes('backdrop-blur') && classes.includes('shadow-md');
    });
    assert(navPillExists, 'NavBar renders as a rounded Floating Pill with backdrop-blur and shadow');

    // 4b. Home Screen Screenshot
    const homeScreenshotPath = path.join(ARTIFACT_DIR, 'verify_redeploy_home.png');
    await page.screenshot({ path: homeScreenshotPath });
    assert(fs.existsSync(homeScreenshotPath), 'Home screen screenshot saved (verify_redeploy_home.png)');

    // 4c. Navigation to History tab
    await page.click('a[href="/history"]');
    await page.evaluate(() => new Promise(r => setTimeout(r, 500)));
    const historyUrl = page.url();
    assert(historyUrl.endsWith('/history'), `Navigated to History page (${historyUrl})`);
    const historyScreenshotPath = path.join(ARTIFACT_DIR, 'verify_redeploy_history.png');
    await page.screenshot({ path: historyScreenshotPath });

    // 4d. Navigation to Favorites tab
    await page.click('a[href="/favorites"]');
    await page.evaluate(() => new Promise(r => setTimeout(r, 500)));
    const favUrl = page.url();
    assert(favUrl.endsWith('/favorites'), `Navigated to Favorites page (${favUrl})`);
    const favScreenshotPath = path.join(ARTIFACT_DIR, 'verify_redeploy_favorites.png');
    await page.screenshot({ path: favScreenshotPath });

    // 4e. Navigation to Settings tab & Language switch
    await page.click('a[href="/settings"]');
    await page.evaluate(() => new Promise(r => setTimeout(r, 500)));
    const settingsUrl = page.url();
    assert(settingsUrl.endsWith('/settings'), `Navigated to Settings page (${settingsUrl})`);
    const settingsScreenshotPath = path.join(ARTIFACT_DIR, 'verify_redeploy_settings.png');
    await page.screenshot({ path: settingsScreenshotPath });

  } catch (err) {
    console.error('Puppeteer test error:', err);
    failCount++;
  } finally {
    await browser.close();
  }

  console.log('\n==================================================');
  console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('==================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
