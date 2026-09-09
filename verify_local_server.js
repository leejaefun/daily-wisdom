
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const http = require('http');

function checkServer(url) {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => {
            resolve(false);
        });
    });
}

(async () => {
    console.log("1. Starting local static server for Daily Wisdom out/ directory...");
    const server = spawn('python3', ['-m', 'http.server', '3000', '--directory', 'out'], {
        stdio: 'inherit'
    });

    // Wait for server to start
    let attempts = 0;
    while (attempts < 10) {
        await new Promise(r => setTimeout(r, 500));
        const ready = await checkServer('http://127.0.0.1:3000');
        if (ready) {
            console.log("2. Local server is UP and responding with HTTP 200 OK!");
            break;
        }
        attempts++;
    }

    console.log("3. Launching Puppeteer browser to verify page rendering...");
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });
        console.log("4. Page loaded successfully!");

        const title = await page.title();
        console.log(`Page Title: "${title}"`);

        await page.waitForSelector('#quote-card', { timeout: 5000 });
        const quoteText = await page.$eval('#quote-card p', el => el.innerText);
        console.log(`VERIFIED QUOTE TEXT: "${quoteText.substring(0, 40)}..."`);

        await page.screenshot({ path: 'verify_test_result.png' });
        console.log("5. Saved verify_test_result.png - Verification Complete & PASSED!");
    } catch (err) {
        console.error("Verification failed:", err);
    } finally {
        await browser.close();
        server.kill();
    }
})();
