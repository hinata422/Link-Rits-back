import { Injectable, Logger } from '@nestjs/common';
import { ScraperFactory } from './scraper.factory'; // 作成したFactory
import { EventsService } from '../events/events.service'; // DB保存用Service

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    private readonly scraperFactory: ScraperFactory, // Factoryを注入
    private readonly eventsService: EventsService, // DB機能を注入
  ) {}

  /**
   * URLからスクレイピングを行い、結果をDBに保存する
   */
  async scrapeAndSave(url: string): Promise<void> {
    this.logger.log(`Processing URL: ${url}`);

    // 1. Factoryを使って、適切なStrategy（担当者）を取得
    // (元のコードにあった .find のロジックはFactory内に移動した)
    const strategy = this.scraperFactory.getStrategy(url);

    // 2. スクレイピング実行
    const eventDtos = await strategy.scrape(url);
    this.logger.log(`Scraped ${eventDtos.length} events.`);

    // 3. DBへ保存 (EventsServiceに任せる)
    if (eventDtos.length > 0) {
      await this.eventsService.saveEvents(eventDtos);
    }
  }
}