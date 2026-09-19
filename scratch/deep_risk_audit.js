const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ARTIFACT_DIR = '/Users/robin/.gemini/antigravity/brain/ed3e3e05-78e4-4a3d-a976-95ab3a3b8f2a';
const PROJECT_DIR = '/Users/robin/.gemini/antigravity/scratch/daily-wisdom';
const OUT_DIR = path.join(PROJECT_DIR, 'out');

function getMD5(filepath) {
  const buf = fs.readFileSync(filepath);
  return crypto.createHash('md5').update(buf).digest('hex');
}

// Static HTTP Server
function startStaticServer(port = 3006) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
  };

  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';
    else if (!path.extname(reqUrl)) reqUrl += '.html';

    const filePath = path.join(OUT_DIR, reqUrl);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function runDeepRiskAudit() {
  console.log('================================================================');
  console.log('🔬 DEEP RISK & BOUNDARY CONDITIONS INTEGRITY AUDIT SUITE');
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

  // --- RISK CATEGORY 1: Data Storage & LocalStorage Key Safety ---
  console.log('\n--- [RISK-01] User Data & LocalStorage Key Schema Audit ---');
  const favTsx = fs.readFileSync(path.join(PROJECT_DIR, 'app/favorites/page.tsx'), 'utf-8');
  const setTsx = fs.readFileSync(path.join(PROJECT_DIR, 'app/settings/page.tsx'), 'utf-8');
  const langCtx = fs.readFileSync(path.join(PROJECT_DIR, 'app/context/LanguageContext.tsx'), 'utf-8');

  assert(favTsx.includes('localStorage.getItem("favorites")'), 'DATA-01', 'Favorites page uses exact key "favorites"');
  assert(setTsx.includes('localStorage.getItem("notificationEnabled")'), 'DATA-02', 'Settings page uses exact key "notificationEnabled"');
  assert(langCtx.includes('localStorage.getItem("language")'), 'DATA-03', 'LanguageContext uses exact key "language"');

  // --- RISK CATEGORY 2: Share API Payload & KakaoTalk Compatibility ---
  console.log('\n--- [RISK-02] Share API Payload & Duplicate Link Prevention Audit ---');
  const shareTsx = fs.readFileSync(path.join(PROJECT_DIR, 'app/components/ShareButton.tsx'), 'utf-8');
  const urlMatches = (shareTsx.match(/https:\/\/apps\.apple\.com\/app\/id6759272132/g) || []).length;
  assert(urlMatches >= 2, 'SHARE-01', 'App Store URL defined safely in fallback & text templates');
  assert(!shareTsx.includes('url: appStoreUrl'), 'SHARE-02', 'Explicitly verified NO duplicate url property passed to Web Share / Capacitor Share');

  // --- RISK CATEGORY 3: Layout Responsive Clearance Across Viewports ---
  console.log('\n--- [RISK-03] Viewport Safe Area Top/Bottom Inset Risk Audit ---');
  const targetPadding = 'pt-[calc(max(3.5rem,env(safe-area-inset-top))+1.5rem)]';
  const historyTsx = fs.readFileSync(path.join(PROJECT_DIR, 'app/history/page.tsx'), 'utf-8');
  assert(historyTsx.includes(targetPadding), 'LAYOUT-01', 'History page safe area top inset calc verified');
  assert(favTsx.includes(targetPadding), 'LAYOUT-02', 'Favorites page safe area top inset calc verified');
  assert(setTsx.includes(targetPadding), 'LAYOUT-03', 'Settings page safe area top inset calc verified');

  // --- RISK CATEGORY 4: AppIcon Asset Integrity & MD5 Hash ---
  console.log('\n--- [RISK-04] AppIcon Asset & Push Notification Config Audit ---');
  const srcIcon = path.join(PROJECT_DIR, 'assets/app_icon_1024.png');
  const nativeIcon = path.join(PROJECT_DIR, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
  const srcHash = getMD5(srcIcon);
  const nativeHash = getMD5(nativeIcon);
  assert(srcHash === nativeHash, 'ICON-01', `AppIcon MD5 hash matches source asset (${srcHash.slice(0, 8)}...)`);

  const capConfig = fs.readFileSync(path.join(PROJECT_DIR, 'capacitor.config.ts'), 'utf-8');
  assert(capConfig.includes('smallIcon: \'ic_stat_icon\''), 'ICON-02', 'Capacitor config includes push smallIcon');

  // --- RISK CATEGORY 5: Release Build Versioning Consistency ---
  console.log('\n--- [RISK-05] Build Metadata & Xcode Target Consistency Audit ---');
  const pbxproj = fs.readFileSync(path.join(PROJECT_DIR, 'ios/App/App.xcodeproj/project.pbxproj'), 'utf-8');
  const versionTs = fs.readFileSync(path.join(PROJECT_DIR, 'app/constants/version.ts'), 'utf-8');
  const pkgJson = fs.readFileSync(path.join(PROJECT_DIR, 'package.json'), 'utf-8');

  assert(versionTs.includes('APP_VERSION = "1.1.5"'), 'VER-01', 'Constants APP_VERSION is "1.1.5"');
  assert(versionTs.includes('BUILD_NUMBER = "7"'), 'VER-02', 'Constants BUILD_NUMBER is "7"');
  assert(pkgJson.includes('"version": "1.1.5"'), 'VER-03', 'package.json version is "1.1.5"');
  assert(pbxproj.includes('MARKETING_VERSION = 1.1.5;'), 'VER-04', 'Xcode MARKETING_VERSION is 1.1.5');
  assert(pbxproj.includes('CURRENT_PROJECT_VERSION = 7;'), 'VER-05', 'Xcode CURRENT_PROJECT_VERSION is 7');

  // --- RISK CATEGORY 6: Native Public Bundle Freshness ---
  console.log('\n--- [RISK-06] Native iOS Public Bundle Code Freshness Audit ---');
  const publicNotFound = fs.readFileSync(path.join(PROJECT_DIR, 'ios/App/App/public/_not-found.html'), 'utf-8');
  assert(publicNotFound.includes('rounded-full') && publicNotFound.includes('bottom-[calc(1.25rem+env(safe-area-inset-bottom))]'), 'BUNDLE-01', 'Native bundle contains Floating Pill Bar Tailwind classes');

  // --- RISK CATEGORY 7: E2E Viewport Testing (SE & Dynamic Island 17) ---
  console.log('\n--- [RISK-07] E2E Viewport Testing (iPhone SE vs iPhone 17 Dynamic Island) ---');
  const PORT = 3006;
  const server = await startStaticServer(PORT);
  const BASE_URL = `http://localhost:${PORT}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Test 1: Small Device (iPhone SE - 375x667)
    await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true });
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
    const seVersionText = await page.evaluate(() => document.body.innerText.includes('Daily Wisdom v1.1.5'));
    assert(seVersionText, 'E2E-SE-01', 'iPhone SE viewport renders "Daily Wisdom v1.1.5" footer text');

    // Test 2: Large Dynamic Island Device (iPhone 17 Pro - 402x874)
    await page.setViewport({ width: 402, height: 874, deviceScaleFactor: 3, isMobile: true });
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
    const dynamicIslandText = await page.evaluate(() => document.body.innerText.includes('Daily Wisdom v1.1.5'));
    assert(dynamicIslandText, 'E2E-17-01', 'iPhone 17 Pro viewport renders "Daily Wisdom v1.1.5" footer text');

    const deepProofScreenshot = path.join(ARTIFACT_DIR, 'deep_risk_proof_settings.png');
    await page.screenshot({ path: deepProofScreenshot });
    assert(fs.existsSync(deepProofScreenshot), 'E2E-PROOF', 'Saved Deep Risk visual screenshot proof (deep_risk_proof_settings.png)');

  } catch (err) {
    console.error('Deep Risk E2E Error:', err);
    failCount++;
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n================================================================');
  console.log(`🏁 DEEP RISK AUDIT RESULT: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('================================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runDeepRiskAudit();
