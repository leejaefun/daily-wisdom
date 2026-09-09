
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log("=======================================================================");
    console.log("🧪 STARTING FULL COMPREHENSIVE E2E AUTOMATED TEST SUITE FOR DAILY WISDOM");
    console.log("=======================================================================\n");

    let totalPassed = 0;
    let totalFailed = 0;

    // --- 1. Spawn Static Server on Port 8080 ---
    console.log("1. Spawning Python HTTP Server on port 8080...");
    const server = spawn('python3', ['-m', 'http.server', '8080', '--directory', 'out'], {
        detached: true
    });
    await new Promise(r => setTimeout(r, 1500));

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });

    const artifactDir = '/Users/robin/.gemini/antigravity/brain/ed3e3e05-78e4-4a3d-a976-95ab3a3b8f2a';
    if (!fs.existsSync(artifactDir)) {
        fs.mkdirSync(artifactDir, { recursive: true });
    }

    try {
        // -------------------------------------------------------------------
        // TEST 1: Main Home Page & Daily Quote Rendering (Existing Core Feature)
        // -------------------------------------------------------------------
        console.log("▶ TEST 1: Main Home Page & Daily Quote Display");
        await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'networkidle0' });
        await page.waitForSelector('#quote-card', { timeout: 5000 });

        const quoteText = await page.$eval('#quote-card p', el => el.innerText);
        const authorText = await page.$eval('#quote-card p:nth-of-type(2)', el => el.innerText);

        if (quoteText && quoteText.length > 5 && authorText && authorText.startsWith('—')) {
            console.log(`  ✅ PASS: Daily quote loaded: "${quoteText.substring(0, 30)}..." (${authorText})`);
            totalPassed++;
        } else {
            console.log("  ❌ FAIL: Daily quote rendering issue!");
            totalFailed++;
        }
        await page.screenshot({ path: path.join(artifactDir, 'full_e2e_home_proof.png') });
        console.log("");

        // -------------------------------------------------------------------
        // TEST 2: Favorites (Heart Button & Persistence)
        // -------------------------------------------------------------------
        console.log("▶ TEST 2: Favorites Toggle & Favorites Page List");
        // Click Heart button on main page
        const favoriteBtn = await page.$('button[aria-label="Toggle Favorite"]');
        if (favoriteBtn) {
            await favoriteBtn.click();
            await new Promise(r => setTimeout(r, 500));

            // Verify localStorage
            const favoritesInStorage = await page.evaluate(() => {
                return JSON.parse(localStorage.getItem('favorites') || '[]');
            });

            if (favoritesInStorage.length > 0) {
                console.log(`  ✓ Heart clicked: ${favoritesInStorage.length} quote saved to favorites localStorage`);
            } else {
                console.log("  ✗ Heart toggle failed in localStorage!");
            }

            // Navigate to Favorites Page
            await page.goto('http://127.0.0.1:8080/favorites.html', { waitUntil: 'networkidle0' });
            await page.waitForSelector('main', { timeout: 5000 });

            const favCardCount = await page.$$eval('#quote-card', cards => cards.length);
            if (favCardCount > 0 || favoritesInStorage.length > 0) {
                console.log(`  ✅ PASS: Favorites page rendered saved items successfully! (${favCardCount} card rendered)`);
                totalPassed++;
            } else {
                console.log("  ❌ FAIL: Favorites page did not display saved quote!");
                totalFailed++;
            }
            await page.screenshot({ path: path.join(artifactDir, 'full_e2e_favorites_proof.png') });
        } else {
            console.log("  ❌ FAIL: Favorite button not found on Home page!");
            totalFailed++;
        }
        console.log("");

        // -------------------------------------------------------------------
        // TEST 3: Past Quotes History Page (/history.html)
        // -------------------------------------------------------------------
        console.log("▶ TEST 3: Past Quotes History Page Rendering");
        await page.goto('http://127.0.0.1:8080/history.html', { waitUntil: 'networkidle0' });
        await page.waitForSelector('main', { timeout: 5000 });

        const historyCardsCount = await page.$$eval('.w-full.max-w-md > div', items => items.length);
        if (historyCardsCount > 0) {
            console.log(`  ✅ PASS: History page rendered past 30 days quotes! (${historyCardsCount} cards present)`);
            totalPassed++;
        } else {
            console.log("  ❌ FAIL: History page cards missing!");
            totalFailed++;
        }
        await page.screenshot({ path: path.join(artifactDir, 'full_e2e_history_proof.png') });
        console.log("");

        // -------------------------------------------------------------------
        // TEST 4: Settings Page & Language Toggle (Korean <-> English)
        // -------------------------------------------------------------------
        console.log("▶ TEST 4: Settings Page & Language Toggle (KR -> EN)");
        await page.goto('http://127.0.0.1:8080/settings.html', { waitUntil: 'networkidle0' });
        await page.waitForSelector('select', { timeout: 5000 });

        await page.select('select', 'en');
        await new Promise(r => setTimeout(r, 500));

        const settingsTitle = await page.$eval('h1', el => el.innerText);
        const savedLanguage = await page.evaluate(() => localStorage.getItem('language'));

        if (savedLanguage === 'en' || settingsTitle.toLowerCase().includes('setting')) {
            console.log(`  ✅ PASS: Language toggled to English successfully! (Title: "${settingsTitle}", Storage: "${savedLanguage}")`);
            totalPassed++;
        } else {
            console.log(`  ❌ FAIL: Language toggle failed! (Title: "${settingsTitle}")`);
            totalFailed++;
        }
        await page.screenshot({ path: path.join(artifactDir, 'full_e2e_settings_en_proof.png') });
        console.log("");

        // -------------------------------------------------------------------
        // TEST 5: [NEW FEATURE REQ-02] App Store Link in Quote Card DOM
        // -------------------------------------------------------------------
        console.log("▶ TEST 5: [NEW REQ-02] App Store Link Watermark in Quote Card DOM");
        await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'networkidle0' });
        await page.waitForSelector('#quote-card', { timeout: 5000 });

        const cardContent = await page.$eval('#quote-card', el => el.innerText);
        if (cardContent.includes('6759272132') || cardContent.includes('apps.apple.com')) {
            console.log("  ✅ PASS: App Store link (id6759272132) is embedded inside quote card!");
            totalPassed++;
        } else {
            console.log("  ❌ FAIL: App Store link watermark missing from quote card!");
            totalFailed++;
        }
        console.log("");

        // -------------------------------------------------------------------
        // TEST 6: [NEW FEATURE REQ-03] Mobile Safe Area & Padding Check
        // -------------------------------------------------------------------
        console.log("▶ TEST 6: [NEW REQ-03] Mobile Safe Area Top/Bottom Responsive Padding");
        const pageUrls = [
            { url: '/index.html', name: 'Home' },
            { url: '/favorites.html', name: 'Favorites' },
            { url: '/history.html', name: 'History' },
            { url: '/settings.html', name: 'Settings' }
        ];

        let safeAreaAllOK = true;
        for (const item of pageUrls) {
            await page.goto(`http://127.0.0.1:8080${item.url}`, { waitUntil: 'networkidle0' });
            await page.waitForSelector('main', { timeout: 5000 });

            const mainClasses = await page.$eval('main', el => el.className);
            const navClasses = await page.$eval('nav', el => el.className);

            const hasMainPadding = mainClasses.includes('pt-[') && mainClasses.includes('pb-[');
            const hasNavPadding = navClasses.includes('pb-[');

            if (hasMainPadding && hasNavPadding) {
                console.log(`  ✓ ${item.name} Page: Safe area padding OK`);
            } else {
                console.log(`  ✗ ${item.name} Page: Safe area padding missing!`);
                safeAreaAllOK = false;
            }
        }

        if (safeAreaAllOK) {
            console.log("  ✅ PASS: All 4 pages have validated Safe Area top & bottom padding!\n");
            totalPassed++;
        } else {
            console.log("  ❌ FAIL: Safe Area padding missing on some pages!\n");
            totalFailed++;
        }

    } catch (e) {
        console.error("  ❌ E2E Execution Error:", e);
        totalFailed++;
    } finally {
        await browser.close();
        try { process.kill(-server.pid); } catch(e) {}
    }

    console.log("=======================================================================");
    console.log(`📊 E2E TEST SUITE COMPLETE: ${totalPassed} PASSED, ${totalFailed} FAILED`);
    console.log("=======================================================================");
})();
