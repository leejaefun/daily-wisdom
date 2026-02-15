const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeContent() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Load URLs
    const rawData = fs.readFileSync('brunch_urls.json');
    const urls = JSON.parse(rawData);

    console.log(`Found ${urls.length} articles to scrape.`);

    const outputFile = 'brunch_all_articles.txt';
    fs.writeFileSync(outputFile, ''); // Clear file

    // Helper delay
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Scrape chunks to avoid memory issues or detection
    // Let's do first 10 for test, usually user wants ALL but 495 is a lot for one go without robust error handling.
    // I will try to scrape them all but save progress every 10.

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`[${i + 1}/${urls.length}] Scraping: ${url}`);

        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Extract Title and Body
            const data = await page.evaluate(() => {
                const title = document.querySelector('.cover_title')?.innerText || document.querySelector('.wrap_cover .title')?.innerText || 'No Title';
                // Brunch articles usually use .wrap_body or similar
                // Let's try to get all text from the main article container
                const bodyContainer = document.querySelector('.wrap_body');
                const bodyText = bodyContainer ? bodyContainer.innerText : 'No Content';
                return { title, bodyText };
            });

            const articleContent = `
================================================================================
TITLE: ${data.title}
URL: ${url}
================================================================================
${data.bodyText}

`;
            fs.appendFileSync(outputFile, articleContent);

            // Random delay 1-3 seconds
            await delay(1000 + Math.random() * 2000);

        } catch (error) {
            console.error(`Failed to scrape ${url}: ${error.message}`);
            fs.appendFileSync(outputFile, `\n[FAILED TO SCRAPE: ${url}]\n`);
        }
    }

    await browser.close();
    console.log('Done! All articles saved to ' + outputFile);
}

scrapeContent();
