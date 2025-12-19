import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { MBTI_PROFILES } from '../../lib/mbti/mbti-profiles';

@Injectable()
export class PlainTextToMbtiLikeConverter {
    private llm: ChatOpenAI;

    constructor() {
        this.llm = new ChatOpenAI({
            modelName: 'gpt-4o-mini',
            temperature: 0.7,
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
    }

    /**
     * イベント詳細をMBTIタイプに合わせて書き換える
     */
    async convert(
        eventTitle: string,
        eventDetail: string,
        mbtiType: keyof typeof MBTI_PROFILES,
    ): Promise<string> {
        const mbtiProfile = MBTI_PROFILES[mbtiType];

        const prompt = `あなたはMBTIタイプ別にイベント説明を最適化する専門家です。

【MBTI情報】
タイプ: ${mbtiProfile.type} (${mbtiProfile.name})
特性: ${mbtiProfile.traits}
好むイベント: ${mbtiProfile.eventPreference}

【イベント情報】
タイトル: ${eventTitle}
詳細: ${eventDetail}

【タスク】
このイベントを${mbtiProfile.type}タイプの人が魅力的に感じるように説明を書き換えてください。
以下の点を意識してください：
1. ${mbtiProfile.type}の特性に響く表現を使う
2. このイベントが${mbtiProfile.type}にとってどんな価値があるか明確にする
3. フレンドリーで親しみやすいトーンで書く
4. 250文字以内で簡潔にまとめる

書き換えた説明のみを出力してください。`;

        const response = await this.llm.invoke(prompt);
        return response.content.toString();
    }

    /**
     * 1つのイベントについて全16種類のMBTI向け説明を生成
     */
    async convertAll(eventTitle: string, eventDetail: string) {
        const results: Record<string, string> = {};

        for (const mbtiType of Object.keys(MBTI_PROFILES)) {
            const description = await this.convert(
                eventTitle,
                eventDetail,
                mbtiType as keyof typeof MBTI_PROFILES,
            );
            results[mbtiType] = description;
        }

        return results;
    }
}
