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
    this.logger.log(`🚀 Start scraping list page: ${url}`);

    try {
      const { data } = await axios.get<string>(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const $ = cheerio.load(data);
      const candidateUrls = new Set<string>();

      // URL収集
      $('a').each((_index, element) => {
        const link = $(element).attr('href');
        const title = $(element).text().trim();

        if (!link || !title || title.length < 5) return;

        // 除外フィルタ
        const ignoreWords = [
          '一覧',
          '検索',
          'カテゴリ',
          'アーカイブ',
          'HOME',
          'Top',
          '講義・講座',
          'すべての',
          'キャンパス',
          'お問合せ',
          'アクセス',
          'EVENTS',
        ];
        if (ignoreWords.some((word) => title.includes(word))) return;

        if (
          link.includes('tag=') ||
          link.includes('year=') ||
          link.includes('cat=') ||
          link.endsWith('.pdf')
        ) {
          return;
        }

        // 詳細ページと思われるURLのみ収集
        if (link.match(/(event|news|article|detail)/i)) {
          let fullLink = link.startsWith('http')
            ? link
            : link.startsWith('/')
              ? `https://www.ritsumei.ac.jp${link}`
              : `https://www.ritsumei.ac.jp/${link}`;

          // 二重スラッシュの修正 (http://...//... となるのを防ぐ)
          fullLink = fullLink.replace(/([^:]\/)\/+/g, '$1');

          // 自分自身（一覧ページ）は除外
          if (
            fullLink === url ||
            fullLink === 'https://www.ritsumei.ac.jp/events/'
          ) {
            return;
          }

          candidateUrls.add(fullLink);
        }
      });

      const uniqueUrls = Array.from(candidateUrls);
      this.logger.log(
        `📋 Found ${uniqueUrls.length} candidate URLs. Starting detail crawling...`,
      );

      const events: CreateEventPostDto[] = [];
      // 負荷対策: 最新15件
      const targetUrls = uniqueUrls.slice(0, 15);

      for (const detailUrl of targetUrls) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const eventData = await this.scrapeDetail(detailUrl);
          if (eventData) {
            events.push(eventData);
            this.logger.log(`✅ Scraped: ${eventData.title}`);
          }
        } catch (error) {
          this.logger.warn(
            `⚠️ Failed to scrape detail: ${detailUrl} - ${error}`,
          );
        }
      }

      this.logger.log(`🎉 Successfully scraped ${events.length} events.`);
      return events;
    } catch (error) {
      this.logger.error(
        `❌ Scraping failed: ${error instanceof Error ? error.message : error}`,
      );
      throw error;
    }
  }

  private async scrapeDetail(url: string): Promise<CreateEventPostDto | null> {
    const { data } = await axios.get<string>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...',
      },
    });
    const $ = cheerio.load(data);

    // ▼▼▼ クリーニング処理 ▼▼▼
    $('script, style, iframe, noscript, header, footer, nav').remove();

    let title = $('h1').first().text().trim();
    if (!title) {
      title = $('title').text().split('|')[0].trim();
    }
    if (!title) return null;

    // 本文取得 (余分な空白を除去)
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

    // 日付抽出
    const dateRegex = /(\d{4})[\s./-年](\d{1,2})[\s./-月](\d{1,2})/;
    const dateMatch = bodyText.match(dateRegex);

    let eventDate = new Date();
    let dateStr = '日時情報なし';

    if (dateMatch) {
      dateStr = dateMatch[0];
      const year = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1;
      const day = parseInt(dateMatch[3]);

      const parsedDate = new Date(year, month, day);
      if (!isNaN(parsedDate.getTime())) {
        eventDate = parsedDate;
      }
    }

    // 場所抽出
    let place = '立命館大学';
    if (bodyText.includes('大阪いばらき') || bodyText.includes('OIC')) {
      place = '大阪いばらきキャンパス (OIC)';
    }
    if (bodyText.includes('衣笠')) {
      place = '衣笠キャンパス';
    }
    if (bodyText.includes('びわこ・くさつ') || bodyText.includes('BKC')) {
      place = 'びわこ・くさつキャンパス (BKC)';
    }
    if (bodyText.includes('朱雀')) {
      place = '朱雀キャンパス';
    }

    return {
      id: uuidv4(),
      uid: this.SYSTEM_USER_ID,
      title: title.substring(0, 100),
      category: 'University Event',
      postTime: eventDate,
      postLimit: new Date(
        new Date(eventDate).setDate(eventDate.getDate() + 30),
      ),
      place: place,
      detail: `【詳細情報】\n📅 日時: ${dateStr}\n🔗 元記事: ${url}\n\n${bodyText.substring(
        0,
        300,
      )}...`,
      chatRoomId: uuidv4(),
    };
  }
}
