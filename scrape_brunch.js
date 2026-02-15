const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log('Navigating to profile...');
    await page.goto('https://brunch.co.kr/@dontgiveup', { waitUntil: 'networkidle2' });

    // Click '글' tab just in case
    try {
        await page.waitForSelector('a[href*="/@dontgiveup?tab=articles"]', { timeout: 5000 });
        // Tab click usually works by navigating to the href
        // Or we can just extract from current if visible.
    } catch (e) {
        console.log('Tab selector not found or already there.');
    }

    let previousHeight = 0;
    let scrollAttempts = 0;
    const maxScrolls = 200; // Safety limit

    console.log('Starting infinite scroll...');

    for (let i = 0; i < maxScrolls; i++) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');

        // Wait for load - adjust if slow
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newHeight = await page.evaluate('document.body.scrollHeight');

        if (newHeight === previousHeight) {
            if (scrollAttempts > 2) {
                console.log('Reached bottom of page.');
                break;
            }
            scrollAttempts++;
            // Wait a bit longer just in case
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            scrollAttempts = 0;
            process.stdout.write('.'); // Progress indicator
        }
    }

    console.log('\nExtracting links...');
    const links = await page.evaluate(() => {
        // Select all links that look like articles
        // Pattern: /@dontgiveup/[number]
        const anchors = Array.from(document.querySelectorAll('a[href*="/@dontgiveup/"]'));
        return anchors
            .map(a => a.href)
            .filter(href => href.match(/\/@dontgiveup\/\d+$/)) // Ensure it ends with digits
            .filter((v, i, a) => a.indexOf(v) === i); // Unique
    });

    console.log(`Found ${links.length} articles.`);
    fs.writeFileSync('brunch_urls.json', JSON.stringify(links, null, 2));

    await browser.close();
})();
