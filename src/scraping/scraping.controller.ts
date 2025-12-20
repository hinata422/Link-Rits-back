import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ScrapingService } from './scraping.service';

@Controller('api/batch')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) { }

  @Post('public-event-pre-processor')
  @HttpCode(HttpStatus.OK)
  async executeScrapingPost(@Body('target') target: string) {
    return this.runScraping(target);
  }

  @Get('public-event-pre-processor')
  async executeScrapingGet(@Query('target') target: string) {
    return this.runScraping(target);
  }

  private async runScraping(target: string) {
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
