import { CreateEventPostDto } from '../dto/event-post.dto';

export interface IScraperStrategy {
  canScrape(url: string): boolean;

  scrape(url: string): Promise<CreateEventPostDto[]>;
}
