
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log("1. Spawning python3 http.server on port 8080...");
    const server = spawn('python3', ['-m', 'http.server', '8080', '--directory', 'out'], {
        detached: true
    });

    await new Promise(r => setTimeout(r, 1500));

    console.log("2. Launching Puppeteer...");
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });

    try {
        console.log("3. Navigating to http://127.0.0.1:8080...");
        await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle0' });
        
        console.log("4. Waiting for #quote-card...");
        await page.waitForSelector('#quote-card', { timeout: 10000 });
        
        const quoteText = await page.$eval('#quote-card', el => el.innerText);
        
        console.log("========================================");
        console.log("EMPIRICALLY VERIFIED LIVE APP CONTENT:");
        console.log(quoteText.substring(0, 100).replace(/\n/g, ' '));
        console.log("========================================");

        const artifactDir = '/Users/robin/.gemini/antigravity/brain/ed3e3e05-78e4-4a3d-a976-95ab3a3b8f2a';
        const savePath = path.join(artifactDir, 'live_verification_proof.png');
        await page.screenshot({ path: savePath });
        console.log(`PROOFSAVER: Screenshot successfully written to ${savePath}`);

    } catch (e) {
        console.error("Verification error:", e);
    } finally {
        await browser.close();
        try { process.kill(-server.pid); } catch(e) {}
    }
})();
