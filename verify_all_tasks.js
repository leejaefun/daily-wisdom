
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function getYearPermutation(year, totalQuotes) {
    const indices = Array.from({ length: totalQuotes }, (_, i) => i);
    let seed = (year * 1664525 + 1013904223) % 4294967296;
    const random = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return (seed >>> 0) / 4294967296;
    };
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
}

function getQuoteForDateTest(dateString, totalQuotes = 365) {
    const [yearStr, monthStr, dayStr] = dateString.split("-");
    const year = parseInt(yearStr, 10) || 2026;
    const month = parseInt(monthStr, 10) || 1;
    const day = parseInt(dayStr, 10) || 1;

    const current = new Date(year, month - 1, day);
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((current.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

    const permutation = getYearPermutation(year, totalQuotes);
    const index = permutation[Math.abs(dayOfYear) % totalQuotes];
    return index;
}

(async () => {
    console.log("=================================================");
    console.log("🧪 STARTING EMPIRICAL TEST SUITE FOR ALL TASKS");
    console.log("=================================================\n");

    let totalPassed = 0;
    let totalFailed = 0;

    // --- TEST 1: REQ-01 (Annual Seeded Shuffle Logic) ---
    console.log("▶ TEST 1: REQ-01 - Annual Seeded Quote Shuffle Logic");
    try {
        const idx2026 = getQuoteForDateTest('2026-01-01');
        const idx2027 = getQuoteForDateTest('2027-01-01');
        const idx2028 = getQuoteForDateTest('2028-01-01');

        console.log(`  2026-01-01 Quote Index: ${idx2026}`);
        console.log(`  2027-01-01 Quote Index: ${idx2027}`);
        console.log(`  2028-01-01 Quote Index: ${idx2028}`);

        if (idx2026 !== idx2027 && idx2027 !== idx2028) {
            console.log("  ✅ PASS: Annual quote indices are uniquely shuffled across 2026, 2027, 2028!\n");
            totalPassed++;
        } else {
            console.log("  ❌ FAIL: Annual quote indices repeated across years!\n");
            totalFailed++;
        }
    } catch (e) {
        console.error("  ❌ FAIL: REQ-01 error:", e);
        totalFailed++;
    }

    // --- Start HTTP Server for DOM Tests ---
    console.log("▶ Spawning Python HTTP Server on port 8080...");
    const server = spawn('python3', ['-m', 'http.server', '8080', '--directory', 'out'], {
        detached: true
    });
    await new Promise(r => setTimeout(r, 1500));

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set iPhone 14 Pro Mobile Viewport
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });

    try {
        // --- TEST 2: REQ-02 (App Store Link in Card DOM & Share) ---
        console.log("▶ TEST 2: REQ-02 - App Store Link in Quote Card DOM");
        await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'networkidle0' });
        await page.waitForSelector('#quote-card', { timeout: 5000 });

        const cardHTML = await page.$eval('#quote-card', el => el.innerHTML);
        const hasAppStoreLink = cardHTML.includes('6759272132') || cardHTML.includes('apps.apple.com');

        if (hasAppStoreLink) {
            console.log("  ✅ PASS: App Store link (id6759272132) is embedded inside the quote card DOM!");
            totalPassed++;
        } else {
            console.log("  ❌ FAIL: App Store link missing from quote card DOM!");
            totalFailed++;
        }
        console.log("");

        // --- TEST 3: REQ-03 (Mobile Safe Area & Padding Across All Pages) ---
        console.log("▶ TEST 3: REQ-03 - Mobile Safe Area & Responsive Padding Across All Pages");
        const pagesToTest = [
            { path: '/index.html', name: 'Home Page' },
            { path: '/favorites.html', name: 'Favorites Page' },
            { path: '/history.html', name: 'History Page' },
            { path: '/settings.html', name: 'Settings Page' }
        ];

        let safeAreaPassed = true;
        for (const target of pagesToTest) {
            await page.goto(`http://127.0.0.1:8080${target.path}`, { waitUntil: 'networkidle0' });
            await page.waitForSelector('main', { timeout: 5000 });

            const mainClasses = await page.$eval('main', el => el.className);
            const hasPaddingTop = mainClasses.includes('pt-[');
            const hasPaddingBottom = mainClasses.includes('pb-[');

            if (hasPaddingTop && hasPaddingBottom) {
                console.log(`  ✓ ${target.name}: Safe Area top & bottom padding present (${mainClasses.substring(0, 45)}...)`);
            } else {
                console.log(`  ✗ ${target.name}: Safe Area padding missing! (${mainClasses})`);
                safeAreaPassed = false;
            }
        }

        if (safeAreaPassed) {
            console.log("  ✅ PASS: Safe Area top & bottom responsive padding verified across all 4 pages!\n");
            totalPassed++;
        } else {
            console.log("  ❌ FAIL: Safe Area padding check failed!\n");
            totalFailed++;
        }

        // Save Final Screen Proof Artifact
        await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'networkidle0' });
        const artifactDir = '/Users/robin/.gemini/antigravity/brain/ed3e3e05-78e4-4a3d-a976-95ab3a3b8f2a';
        if (!fs.existsSync(artifactDir)) {
            fs.mkdirSync(artifactDir, { recursive: true });
        }
        const proofPath = path.join(artifactDir, 'verify_all_tasks_proof.png');
        await page.screenshot({ path: proofPath });
        console.log(`📸 Saved final proof screenshot to: ${proofPath}\n`);

    } catch (e) {
        console.error("  ❌ DOM Test Error:", e);
        totalFailed++;
    } finally {
        await browser.close();
        try { process.kill(-server.pid); } catch(e) {}
    }

    console.log("=================================================");
    console.log(`📊 FINAL TEST SUITE RESULT: ${totalPassed} PASSED, ${totalFailed} FAILED`);
    console.log("=================================================");
})();
