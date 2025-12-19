import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ScrapingService } from './scraping.service';

@Controller('scraping') // パス: http://localhost:3000/scraping
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async executeScraping(@Body('url') url: string) {
    console.log(`📡 API Request received: Scraping for ${url}`);
    // デフォルトURL（指定がなければ立命館のイベントページ）
    const targetUrl = url || 'https://www.ritsumei.ac.jp/events/';

    await this.scrapingService.scrapeAndSave(targetUrl);

    return {
      message: 'Scraping and saving completed successfully.',
      targetUrl: targetUrl,
      timestamp: new Date(),
    };
  }
}
