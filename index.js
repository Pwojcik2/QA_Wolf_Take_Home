const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://news.ycombinator.com/newest");

  // Collect timestamps for the first 100 articles
  const timestamps = [];
  for (let i = 0; i < 5; i++) {
    // Each page contains 30 articles
    const times = await page.$$eval(".subtext span.age a", (elements) =>
      elements.map((el) => el.getAttribute("title"))
    );
    timestamps.push(...times);

    // 100 articles collected
    if (timestamps.length >= 100) break;

    // Check next page
    const nextButton = await page.$("a.morelink");
    if (nextButton) {
      await nextButton.click();
      await page.waitForLoadState("domcontentloaded");
    } else {
      break;
    }
  }

  // Make sure we have 100 timestamps
  const first100Timestamps = timestamps.slice(0, 100);

  // Converting timestamps to date objects
  const dates = first100Timestamps.map((timestamp) => new Date(timestamp));

  // Validation if the dates have sorted from newest to oldest
  const isSorted = dates.every((date, i, arr) => i === 0 || arr[i - 1] >= date);

  // Validation results
  if (isSorted) {
    console.log("The first 100 articles are sorted from newest to oldest.");
  } else {
    console.log("The first 100 articles are COULD NOT be sorted.");
  }

  console.log("Validation completed.");
}

(async () => {
  await sortHackerNewsArticles();
})();
