
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

(async () => {
    console.log("=== STARTING DIRECT VERIFICATION ===");
    
    // Start Python HTTP server on port 8080
    const server = spawn('python3', ['-m', 'http.server', '8080', '--directory', 'out']);

    await new Promise(r => setTimeout(r, 1000));

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 }); // iPhone 14 dimensions

    try {
        console.log("Navigating to http://127.0.0.1:8080...");
        await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle0' });
        console.log("Page loaded!");

        await page.waitForSelector('#quote-card', { timeout: 5000 });
        const quoteText = await page.$eval('#quote-card p', el => el.innerText);
        console.log("----------------------------------------");
        console.log("SUCCESS: Rendered Live Quote Text:");
        console.log(quoteText);
        console.log("----------------------------------------");

        const targetPath = '/Users/robin/.gemini/antigravity/brain/ed3e3e05-78e4-4a3d-a976-95ab3a3b8f2a/verify_live_app.png';
        await page.screenshot({ path: targetPath });
        console.log(`Saved empirical screenshot to: ${targetPath}`);

    } catch (e) {
        console.error("Verification error:", e);
    } finally {
        await browser.close();
        server.kill();
        console.log("=== VERIFICATION COMPLETE ===");
    }
})();
