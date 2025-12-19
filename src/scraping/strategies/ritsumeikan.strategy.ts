import { Injectable, Logger } from '@nestjs/common';
import { IScraperStrategy } from '../interfaces/scraper-strategy.interface';
import { CreateEventPostDto } from '../dto/event-post.dto';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RitsumeikanStrategy implements IScraperStrategy {
  private readonly logger = new Logger(RitsumeikanStrategy.name);
  private readonly SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

  canScrape(url: string): boolean {
    return url.includes('ritsumei.ac.jp');
  }

  async scrape(url: string): Promise<CreateEventPostDto[]> {
    this.logger.log(`Start scraping: ${url}`);

    try {
      // 1. HTMLを取得
      // User-Agentを指定しないと弾かれることがあるため設定
      const { data } = await axios.get<string>(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      const $ = cheerio.load(data);
      const events: CreateEventPostDto[] = [];
      const now = new Date();

      // 2. 抽出ロジックの修正
      // 立命館のイベントページでよくある構造を広範囲に探す
      // (ul.list-news > li, .news-list > li など)
      $('a').each((_index, element) => {
        const linkElement = $(element);
        const title = linkElement.text().trim();
        const href = linkElement.attr('href');

        // タイトルが短すぎる、またはリンクがない場合はスキップ
        if (!title || title.length < 5 || !href) return;

        // イベント詳細ページへのリンクか判定 (URLに 'event' や 'news' が含まれるか)
        if (!href.includes('event') && !href.includes('news')) return;

        // PDFファイルは除外（解析が難しいため）
        if (href.endsWith('.pdf')) return;

        // URLの補完
        const fullLink = href.startsWith('http')
          ? href
          : href.startsWith('/')
            ? `https://www.ritsumei.ac.jp${href}`
            : `https://www.ritsumei.ac.jp/${href}`; // 相対パスの調整

        // 日付情報の抽出（近くにある .date 要素を探す）
        // 構造: <li> <span class="date">2024.12.20</span> <a ...>Title</a> </li>
        const parentLi = linkElement.closest('li');
        const dateText = parentLi.find('.date, time').text().trim(); // クラス名はサイトによる

        // 日付パース (YYYY.MM.DD 形式を想定)
        let eventDate = now;
        if (dateText) {
          const dateMatch = dateText.match(
            /(\d{4})[./-](\d{1,2})[./-](\d{1,2})/,
          );
          if (dateMatch) {
            eventDate = new Date(
              parseInt(dateMatch[1]),
              parseInt(dateMatch[2]) - 1,
              parseInt(dateMatch[3]),
            );
          }
        }

        const postLimitDate = new Date(eventDate);
        postLimitDate.setDate(postLimitDate.getDate() + 30);

        const eventDto: CreateEventPostDto = {
          id: uuidv4(),
          uid: this.SYSTEM_USER_ID,
          title: title.substring(0, 100), // 長すぎるとDBエラーになるのでカット
          category: 'University Event',
          postTime: eventDate,
          postLimit: postLimitDate,
          place: '立命館大学 (詳細はリンク参照)',
          detail: `イベント情報を見つけました。\n\n📅 日付: ${dateText || '不明'}\n🔗 詳細: ${fullLink}`,
          chatRoomId: uuidv4(),
        };

        events.push(eventDto);
      });

      // 重複排除 (同じURLのイベントは1つにする)
      const uniqueEvents = Array.from(
        new Map(events.map((e) => [e.title, e])).values(),
      );

      this.logger.log(`Found ${uniqueEvents.length} events.`);
      return uniqueEvents;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Scraping failed: ${error.message}`);
      }
      throw error;
    }
  }
}
