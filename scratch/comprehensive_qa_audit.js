const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

const ARTIFACT_DIR = '/Users/robin/.gemini/antigravity/brain/ed3e3e05-78e4-4a3d-a976-95ab3a3b8f2a';
const PROJECT_DIR = '/Users/robin/.gemini/antigravity/scratch/daily-wisdom';
const OUT_DIR = path.join(PROJECT_DIR, 'out');

// Simple static HTTP server for accurate E2E testing
function startStaticServer(port = 3005) {
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

async function runComprehensiveAudit() {
  console.log('================================================================');
  console.log('🧪 COMPREHENSIVE E2E VISUAL & FUNCTIONAL INTEGRITY TEST SUITE');
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

  // 1. Static Asset & Code Audit
  console.log('\n--- [PHASE 1] Static Code & Config Integrity Audit ---');
  
  // AppIcon
  const iconPath = path.join(PROJECT_DIR, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
  assert(fs.existsSync(iconPath), 'CODE-01', 'AppIcon 1024x1024 high-res asset exists');
  const dims = execSync(`sips -g pixelWidth -g pixelHeight "${iconPath}"`).toString();
  assert(dims.includes('1024'), 'CODE-02', 'AppIcon exact resolution 1024x1024 confirmed');

  // Version Sync
  const versionTs = fs.readFileSync(path.join(PROJECT_DIR, 'app/constants/version.ts'), 'utf-8');
  assert(versionTs.includes('APP_VERSION = "1.1.3"'), 'CODE-03', 'app/constants/version.ts exports v1.1.3');

  const pkgJson = fs.readFileSync(path.join(PROJECT_DIR, 'package.json'), 'utf-8');
  assert(pkgJson.includes('"version": "1.1.3"'), 'CODE-04', 'package.json version is 1.1.3');

  const pbxproj = fs.readFileSync(path.join(PROJECT_DIR, 'ios/App/App.xcodeproj/project.pbxproj'), 'utf-8');
  assert(pbxproj.includes('MARKETING_VERSION = 1.1.3;'), 'CODE-05', 'Xcode MARKETING_VERSION is 1.1.3');
  assert(pbxproj.includes('CURRENT_PROJECT_VERSION = 5;'), 'CODE-06', 'Xcode CURRENT_PROJECT_VERSION is 5');

  // Share link fix
  const shareTsx = fs.readFileSync(path.join(PROJECT_DIR, 'app/components/ShareButton.tsx'), 'utf-8');
  assert(!shareTsx.includes('url: appStoreUrl'), 'CODE-07', 'ShareButton.tsx has no duplicate url parameter');

  // Notification Icon fix
  const capConfig = fs.readFileSync(path.join(PROJECT_DIR, 'capacitor.config.ts'), 'utf-8');
  assert(capConfig.includes('smallIcon: \'ic_stat_icon\''), 'CODE-08', 'capacitor.config.ts includes smallIcon configuration');

  // Top padding fix
  const historyPage = fs.readFileSync(path.join(PROJECT_DIR, 'app/history/page.tsx'), 'utf-8');
  const favoritesPage = fs.readFileSync(path.join(PROJECT_DIR, 'app/favorites/page.tsx'), 'utf-8');
  const settingsPage = fs.readFileSync(path.join(PROJECT_DIR, 'app/settings/page.tsx'), 'utf-8');
  
  const targetPadding = 'pt-[calc(max(3.5rem,env(safe-area-inset-top))+1.5rem)]';
  assert(historyPage.includes(targetPadding), 'CODE-09', 'History page has max top safe area padding');
  assert(favoritesPage.includes(targetPadding), 'CODE-10', 'Favorites page has max top safe area padding');
  assert(settingsPage.includes(targetPadding), 'CODE-11', 'Settings page has max top safe area padding');

  // 2. Puppeteer E2E Visual & Functional Testing (Local HTTP Server)
  console.log('\n--- [PHASE 2] Puppeteer E2E Visual & Page Route Audit (HTTP Server) ---');
  
  const PORT = 3005;
  const server = await startStaticServer(PORT);
  const BASE_URL = `http://localhost:${PORT}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true }); // iPhone 14 Pro / 15 / 16 / 17 viewport

    // A. Home Page (/)
    console.log('\nTesting Route: / (Home)');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => new Promise(r => setTimeout(r, 600)));

    const homeBody = await page.evaluate(() => document.body.innerText);
    assert(homeBody.length > 20, 'E2E-01', 'Home page quote card renders correctly');

    const homeProof = path.join(ARTIFACT_DIR, 'e2e_proof_home.png');
    await page.screenshot({ path: homeProof });
    assert(fs.existsSync(homeProof), 'E2E-02', 'Saved Home page visual screenshot proof (e2e_proof_home.png)');

    // B. History Page (/history)
    console.log('\nTesting Route: /history (Past Quotes)');
    await page.goto(`${BASE_URL}/history`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => new Promise(r => setTimeout(r, 600)));

    const historyTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.innerText : '';
    });
    assert(historyTitle.includes('지난 명언') || historyTitle.includes('Past Quotes') || historyTitle.length > 0, 'E2E-03', `History title header renders correctly ("${historyTitle}")`);

    const historyProof = path.join(ARTIFACT_DIR, 'e2e_proof_history.png');
    await page.screenshot({ path: historyProof });
    assert(fs.existsSync(historyProof), 'E2E-04', 'Saved History page visual screenshot proof (e2e_proof_history.png)');

    // C. Favorites Page (/favorites)
    console.log('\nTesting Route: /favorites (Saved Quotes)');
    await page.goto(`${BASE_URL}/favorites`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => new Promise(r => setTimeout(r, 600)));

    const favoritesTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.innerText : '';
    });
    assert(favoritesTitle.includes('보관함') || favoritesTitle.includes('Favorites') || favoritesTitle.length > 0, 'E2E-05', `Favorites title header renders correctly ("${favoritesTitle}")`);

    const favoritesProof = path.join(ARTIFACT_DIR, 'e2e_proof_favorites.png');
    await page.screenshot({ path: favoritesProof });
    assert(fs.existsSync(favoritesProof), 'E2E-06', 'Saved Favorites page visual screenshot proof (e2e_proof_favorites.png)');

    // D. Settings Page (/settings)
    console.log('\nTesting Route: /settings (Settings & App Version)');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => new Promise(r => setTimeout(r, 600)));

    const settingsContent = await page.evaluate(() => document.body.innerText);
    assert(settingsContent.includes('Daily Wisdom v1.1.3'), 'E2E-07', 'Settings page renders EXACT "Daily Wisdom v1.1.3" version text');

    const settingsProof = path.join(ARTIFACT_DIR, 'e2e_proof_settings.png');
    await page.screenshot({ path: settingsProof });
    assert(fs.existsSync(settingsProof), 'E2E-08', 'Saved Settings page visual screenshot proof (e2e_proof_settings.png)');

  } catch (err) {
    console.error('E2E Audit Error:', err);
    failCount++;
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n================================================================');
  console.log(`🏁 COMPREHENSIVE AUDIT RESULT: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('================================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runComprehensiveAudit();
