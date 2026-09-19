const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ARTIFACT_DIR = '/Users/robin/.gemini/antigravity/brain/ed3e3e05-78e4-4a3d-a976-95ab3a3b8f2a';
const PROJECT_DIR = '/Users/robin/.gemini/antigravity/scratch/daily-wisdom';

async function runMasterQASuite() {
  console.log('================================================================');
  console.log('🛡️  DAILY WISDOM MASTER QA & ACCUMULATED CHECKLIST TEST SUITE');
  console.log('================================================================');

  let passCount = 0;
  let failCount = 0;

  function assert(condition, testId, message) {
    if (condition) {
      console.log(`✅ [PASS] [${testId}] ${message}`);
      passCount++;
    } else {
      console.error(`❌ [FAIL] [${testId}] ${message}`);
      failCount++;
    }
  }

  // ----------------------------------------------------
  // QA-01: iOS AppIcon Resolution & Asset Check
  // ----------------------------------------------------
  console.log('\n--- [QA-01] iOS AppIcon 1024x1024 High-Res Asset Verification ---');
  const iconPath = path.join(PROJECT_DIR, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
  const iconExists = fs.existsSync(iconPath);
  assert(iconExists, 'QA-01.1', 'AppIcon-512@2x.png exists in Assets.xcassets');

  if (iconExists) {
    const dims = execSync(`sips -g pixelWidth -g pixelHeight "${iconPath}"`).toString();
    const widthMatch = dims.includes('pixelWidth: 1024');
    const heightMatch = dims.includes('pixelHeight: 1024');
    assert(widthMatch && heightMatch, 'QA-01.2', `AppIcon pixel resolution is EXACTLY 1024x1024 (${dims.trim().replace(/\s+/g, ' ')})`);
    
    const size = fs.statSync(iconPath).size;
    assert(size !== 41273, 'QA-01.3', 'AppIcon is NOT the 41KB default Capacitor grid placeholder logo');
  }

  // ----------------------------------------------------
  // QA-02: iOS Bundle Public Folder Code Sync Verification
  // ----------------------------------------------------
  console.log('\n--- [QA-02] iOS App Native Public Bundle Synchronization Check ---');
  const publicDir = path.join(PROJECT_DIR, 'ios/App/App/public');
  const notFoundHtml = fs.readFileSync(path.join(publicDir, '_not-found.html'), 'utf-8');
  
  const hasFloatingPillInBundle = notFoundHtml.includes('rounded-full') && 
                                  notFoundHtml.includes('bottom-[calc(1.25rem+env(safe-area-inset-bottom))]') &&
                                  notFoundHtml.includes('backdrop-blur-md');
  assert(hasFloatingPillInBundle, 'QA-02.1', 'ios/App/App/public HTML contains Floating Pill Bar Tailwind classes (rounded-full, bottom-1.25rem)');

  // ----------------------------------------------------
  // QA-03: Seeded Quote Shuffle Algorithm (REQ-01)
  // ----------------------------------------------------
  console.log('\n--- [QA-03] Seeded Quote Shuffle Algorithm (REQ-01) ---');
  const quotesTs = fs.readFileSync(path.join(PROJECT_DIR, 'lib/quotes.ts'), 'utf-8');
  assert(quotesTs.includes('getYearPermutation'), 'QA-03.1', 'lib/quotes.ts includes getYearPermutation annual shuffle algorithm');
  assert(quotesTs.includes('getQuoteForDate'), 'QA-03.2', 'lib/quotes.ts includes getQuoteForDate function');

  // ----------------------------------------------------
  // QA-04: Share Button & App Store URL Verification (REQ-CHANGE-02)
  // ----------------------------------------------------
  console.log('\n--- [QA-04] Share Button & App Store URL (REQ-CHANGE-02) ---');
  const shareTsx = fs.readFileSync(path.join(PROJECT_DIR, 'app/components/ShareButton.tsx'), 'utf-8');
  assert(shareTsx.includes('https://apps.apple.com/app/id6759272132'), 'QA-04.1', 'ShareButton.tsx includes App Store URL (id6759272132)');
  assert(!shareTsx.includes('url: appStoreUrl'), 'QA-04.2', 'ShareButton.tsx does NOT pass duplicate url parameter');
  assert(!shareTsx.includes('Daily Wisdom Card Watermark'), 'QA-04.3', 'Quote card DOM contains NO intrusive text/logo watermarks');

  // ----------------------------------------------------
  // QA-05: Xcode Project & Versioning & Config Check (REQ-CHANGE-01, REQ-CHANGE-04, REQ-CHANGE-05)
  // ----------------------------------------------------
  console.log('\n--- [QA-05] Xcode Project Versioning & Settings & Central Version Check ---');
  const pbxproj = fs.readFileSync(path.join(PROJECT_DIR, 'ios/App/App.xcodeproj/project.pbxproj'), 'utf-8');
  assert(pbxproj.includes('MARKETING_VERSION = 1.1.4;'), 'QA-05.1', 'pbxproj MARKETING_VERSION is 1.1.4');
  assert(pbxproj.includes('CURRENT_PROJECT_VERSION = 6;'), 'QA-05.2', 'pbxproj CURRENT_PROJECT_VERSION is 6');
  assert(pbxproj.includes('PRODUCT_BUNDLE_IDENTIFIER = com.leejaefun.dailywisdom;'), 'QA-05.3', 'PRODUCT_BUNDLE_IDENTIFIER matches com.leejaefun.dailywisdom');

  const versionTs = fs.readFileSync(path.join(PROJECT_DIR, 'app/constants/version.ts'), 'utf-8');
  assert(versionTs.includes('APP_VERSION = "1.1.4"'), 'QA-05.4', 'app/constants/version.ts exports APP_VERSION "1.1.4"');

  const capConfig = fs.readFileSync(path.join(PROJECT_DIR, 'capacitor.config.ts'), 'utf-8');
  assert(capConfig.includes('smallIcon: \'ic_stat_icon\''), 'QA-05.5', 'capacitor.config.ts configures LocalNotifications smallIcon');

  const homeTsx = fs.readFileSync(path.join(PROJECT_DIR, 'app/page.tsx'), 'utf-8');
  assert(homeTsx.includes('notification_refreshed_version'), 'QA-05.6', 'app/page.tsx includes notification_refreshed_version one-time migration flag');

  // ----------------------------------------------------
  // QA-06: Puppeteer UI Floating Pill & Layout Verification (iPhone 12 Mini)
  // ----------------------------------------------------
  console.log('\n--- [QA-06] E2E Floating Pill Layout Verification (iPhone 12 Mini Viewport) ---');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.goto('https://daily-wisdom.vercel.app', { waitUntil: 'networkidle2' });
    await page.evaluate(() => new Promise(r => setTimeout(r, 800)));

    const pillStyle = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return null;
      const rect = nav.getBoundingClientRect();
      const outerDiv = nav.parentElement;
      return {
        className: nav.className,
        outerClassName: outerDiv ? outerDiv.className : '',
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
        width: rect.width,
        viewportHeight: window.innerHeight
      };
    });

    assert(pillStyle !== null, 'QA-06.1', 'NavBar DOM element exists');
    if (pillStyle) {
      assert(pillStyle.className.includes('rounded-full'), 'QA-06.2', 'Nav element has rounded-full class');
      assert(pillStyle.outerClassName.includes('bottom-[calc(1.25rem'), 'QA-06.3', 'Outer div has bottom-[calc(1.25rem+env(safe-area-inset-bottom))] class');
      
      const bottomSpace = pillStyle.viewportHeight - pillStyle.bottom;
      console.log(`ℹ️ [INFO] Pill Bar bottom offset from viewport bottom: ${bottomSpace}px (width: ${Math.round(pillStyle.width)}px)`);
      assert(bottomSpace >= 15, 'QA-06.4', `Pill Bar is floating comfortably above viewport bottom (${bottomSpace}px offset)`);
    }

    const proofScreenshot = path.join(ARTIFACT_DIR, 'master_qa_iphone12mini_proof.png');
    await page.screenshot({ path: proofScreenshot });
    assert(fs.existsSync(proofScreenshot), 'QA-06.5', 'iPhone 12 Mini proof screenshot saved (master_qa_iphone12mini_proof.png)');

  } catch (err) {
    console.error('QA-06 Error:', err);
    failCount++;
  } finally {
    await browser.close();
  }

  console.log('\n================================================================');
  console.log(`🏁 MASTER QA SUITE RESULT: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('================================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runMasterQASuite();
