import { RitsumeikanStrategy } from '../src/scraping/strategies/ritsumeikan.strategy';

async function main() {
  const strategy = new RitsumeikanStrategy();
  const url = 'https://www.ritsumei.ac.jp/events/';

  console.log('Starting manual scraping verification...');
  console.log(`Target URL: ${url}`);

  try {
    const events = await strategy.scrape(url);
    console.log(`\nSuccessfully scraped ${events.length} events!`);

    if (events.length > 0) {
      console.log('\n--- First 3 Events ---');
      events.slice(0, 3).forEach((event, index) => {
        console.log(`\nEvent #${index + 1}`);
        console.log(`Title: ${event.title}`);
        console.log(`Date: ${event.postTime}`);
        console.log(`Place: ${event.place}`);
        console.log(`Detail Preview: ${event.detail.substring(0, 100).replace(/\n/g, ' ')}...`);
      });
    } else {
      console.log('No events found. Check if the selector logic is correct or if the page structure has changed.');
    }
  } catch (error) {
    console.error('Error during scraping:', error);
  }
}

main();
