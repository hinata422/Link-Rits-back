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
    this.logger.log(`Start scraping list page: ${url}`);

    try {
      // Step 1: 一覧ページから詳細ページのURLを収集する
      const { data } = await axios.get<string>(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      const $ = cheerio.load(data);
      const candidateUrls = new Set<string>();

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
        ];
        if (ignoreWords.some((word) => title.includes(word))) return;
        if (
          link.includes('tag=') ||
          link.includes('year=') ||
          link.includes('cat=') ||
          link.endsWith('.pdf')
        )
          return;

        // 詳細ページっぽいURLのみ
        if (
          link.includes('event') ||
          link.includes('news') ||
          link.includes('article')
        ) {
          const fullLink = link.startsWith('http')
            ? link
            : link.startsWith('/')
              ? `https://www.ritsumei.ac.jp${link}`
              : `https://www.ritsumei.ac.jp/${link}`;
          candidateUrls.add(fullLink);
        }
      });

      const uniqueUrls = Array.from(candidateUrls);
      this.logger.log(
        `Found ${uniqueUrls.length} candidate URLs. Starting detail scraping...`,
      );

      // Step 2: 各詳細ページにアクセスして情報を取得 (サーバー負荷軽減のため直列実行)
      const events: CreateEventPostDto[] = [];

      // テスト用に最大10件程度に制限しても良いですが、ここでは全件回します
      for (const detailUrl of uniqueUrls) {
        try {
          // 少し待機（マナーとして）
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const eventData = await this.scrapeDetail(detailUrl);
          if (eventData) {
            events.push(eventData);
          }
        } catch (e) {
          this.logger.warn(`Failed to scrape detail: ${detailUrl} - ${e}`);
        }
      }

      this.logger.log(`Successfully scraped ${events.length} events.`);
      return events;
    } catch (error) {
      this.logger.error(
        `Scraping failed: ${error instanceof Error ? error.message : error}`,
      );
      throw error;
    }
  }

  // 詳細ページを解析する関数
  private async scrapeDetail(url: string): Promise<CreateEventPostDto | null> {
    const { data } = await axios.get<string>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...',
      },
    });
    const $ = cheerio.load(data);

    // タイトルの取得 (h1やtitleタグから)
    const title =
      $('h1').text().trim() ||
      $('title').text().replace(' | 立命館大学', '').trim();
    if (!title) return null;

    // 本文の取得
    const bodyText = $('body').text().replace(/\s+/g, ' '); // 改行などをスペースに置換して検索しやすくする

    // 日付の抽出 (強力な正規表現)
    // パターン: 2025年12月20日, 2025/12/20, 12月20日
    const dateMatch = bodyText.match(
      /(\d{4}年\d{1,2}月\d{1,2}日)|(\d{4}[./-]\d{1,2}[./-]\d{1,2})/,
    );
    let eventDate = new Date();
    let dateStr = '不明';

    if (dateMatch) {
      dateStr = dateMatch[0];
      // 年月日を解析
      const dateString = dateStr.replace(/年|月/g, '/').replace(/日/g, '');
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        eventDate = parsedDate;
      }
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
      place: '立命館大学',
      detail: `【詳細情報】\n📅 開催日: ${dateStr}\n🔗 元記事: ${url}\n\n${bodyText.substring(0, 200)}...`, // 本文の冒頭を少し入れる
      chatRoomId: uuidv4(),
    };
  }
}
