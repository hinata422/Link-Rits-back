import { Injectable, NotFoundException } from '@nestjs/common';
import { IScraperStrategy } from './interfaces/scraper-strategy.interface';
import { RitsumeikanStrategy } from './strategies/ritsumeikan.strategy';

@Injectable()
export class ScraperFactory {
  private strategies: IScraperStrategy[] = [];

  constructor(
    // 将来Strategyが増えたらここにDIしていく
    private readonly ritsumeikanStrategy: RitsumeikanStrategy,
  ) {
    this.strategies.push(ritsumeikanStrategy);
  }

  /**
   * URLに対応するStrategyを探して返す
   */
  getStrategy(url: string): IScraperStrategy {
    const strategy = this.strategies.find((s) => s.canScrape(url));

    if (!strategy) {
      throw new NotFoundException(`No scraper strategy found for URL: ${url}`);
    }

    return strategy;
  }
}
