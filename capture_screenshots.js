
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Enable console logging from the browser
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

    const url = 'https://daily-wisdom.vercel.app';

    const devices = [
        {
            name: '6_5_inch',
            width: 414,
            height: 896,
            scale: 3
        },
        {
            name: '5_5_inch',
            width: 414,
            height: 736,
            scale: 3
        }
    ];

    for (const device of devices) {
        console.log(`\n--- Capturing ${device.name} ---`);

        // 1. Set Viewport first
        await page.setViewport({
            width: device.width,
            height: device.height,
            deviceScaleFactor: device.scale,
            isMobile: true,
            hasTouch: true
        });

        // 2. Navigate (Reload for each device to ensure layout adapts)
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle0' });

        // 3. Wait for content
        console.log('Waiting for visibility...');
        try {
            await page.waitForSelector('#quote-card.opacity-100', { timeout: 15000 });

            // Check content
            const text = await page.$eval('#quote-card', el => el.innerText);
            console.log(`Content detected: "${text.substring(0, 50).replace(/\n/g, ' ')}..."`);

            if (!text.trim()) {
                console.error('WARNING: Quote card text is empty!');
            }

            // Extra buffer for fonts and transitions
            await new Promise(r => setTimeout(r, 2000));

            await page.screenshot({ path: `screenshot_${device.name}.png` });
            console.log(`Saved screenshot_${device.name}.png`);
        } catch (e) {
            console.error(`Error capturing ${device.name}:`, e);
            // Capture debug screenshot
            await page.screenshot({ path: `debug_${device.name}.png` });
        }
    }

    await browser.close();
    console.log('\nDone!');
})();
