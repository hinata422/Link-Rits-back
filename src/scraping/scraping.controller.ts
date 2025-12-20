import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ScrapingService } from './scraping.service';

@Controller('api/batch')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) { }

  @Post('public-event-pre-processor')
  @HttpCode(HttpStatus.OK)
  async executeScraping(@Body('target') target: string) {
    console.log(`📡 API Request received: Scraping for target=${target}`);
    // デフォルトURL（指定がなければ立命館のイベントページ）
    const targetUrl = target || 'https://www.ritsumei.ac.jp/events/';

    await this.scrapingService.scrapeAndSave(targetUrl);

    return {
      message: 'Scraping and saving completed successfully.',
      targetUrl: targetUrl,
      timestamp: new Date(),
    };
  }
}
