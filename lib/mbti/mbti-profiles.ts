/**
 * 16種類のMBTIタイプとその特性
 */
export const MBTI_PROFILES = {
    INTJ: {
        type: 'INTJ',
        name: '建築家',
        traits: '戦略的思考、独立性、計画性を重視。深い分析と長期的視点を好む。',
        eventPreference: '知的刺激のあるイベント、専門的なワークショップ、戦略的思考を要する活動',
    },
    INTP: {
        type: 'INTP',
        name: '論理学者',
        traits: '論理的思考、好奇心旺盛、理論的探求を好む。独創的なアイデアに魅力を感じる。',
        eventPreference: '技術的な勉強会、理論的ディスカッション、新しいアイデアの探求',
    },
    ENTJ: {
        type: 'ENTJ',
        name: '指揮官',
        traits: 'リーダーシップ、効率性、目標達成志向。大規模なプロジェクトを好む。',
        eventPreference: 'ビジネスセミナー、リーダーシップ研修、ネットワーキングイベント',
    },
    ENTP: {
        type: 'ENTP',
        name: '討論者',
        traits: '革新的、議論好き、柔軟な思考。新しい可能性を探ることを楽しむ。',
        eventPreference: 'ディベート、ブレインストーミング、イノベーション関連イベント',
    },
    INFJ: {
        type: 'INFJ',
        name: '提唱者',
        traits: '理想主義、共感性、深い洞察力。意味のある活動を求める。',
        eventPreference: '社会貢献活動、カウンセリング、深いつながりを作るイベント',
    },
    INFP: {
        type: 'INFP',
        name: '仲介者',
        traits: '創造性、理想主義、個人の価値観を重視。芸術的表現を好む。',
        eventPreference: 'アート展示、クリエイティブワークショップ、自己表現の場',
    },
    ENFJ: {
        type: 'ENFJ',
        name: '主人公',
        traits: 'カリスマ性、共感力、人を励ますことを好む。コミュニティ形成を重視。',
        eventPreference: 'コミュニティイベント、ボランティア、モチベーショナルセミナー',
    },
    ENFP: {
        type: 'ENFP',
        name: '運動家',
        traits: '熱意、創造性、人とのつながりを大切にする。新しい経験を求める。',
        eventPreference: 'フェスティバル、交流会、クリエイティブな集まり',
    },
    ISTJ: {
        type: 'ISTJ',
        name: '管理者',
        traits: '責任感、実用性、伝統を重んじる。構造化された活動を好む。',
        eventPreference: '実務的なセミナー、伝統的なイベント、スキルアップ研修',
    },
    ISFJ: {
        type: 'ISFJ',
        name: '擁護者',
        traits: '献身的、思いやり、安定性を求める。他者をサポートすることを好む。',
        eventPreference: 'ボランティア活動、地域イベント、サポートグループ',
    },
    ESTJ: {
        type: 'ESTJ',
        name: '幹部',
        traits: '組織力、実行力、秩序を重視。リーダーシップを発揮することを好む。',
        eventPreference: 'ビジネスミーティング、組織運営セミナー、リーダーシップイベント',
    },
    ESFJ: {
        type: 'ESFJ',
        name: '領事官',
        traits: '社交性、協調性、他者への配慮。コミュニティの調和を大切にする。',
        eventPreference: 'social gathering、地域活動、チームビルディングイベント',
    },
    ISTP: {
        type: 'ISTP',
        name: '巨匠',
        traits: '実践的、柔軟性、問題解決能力。手を動かすことを好む。',
        eventPreference: 'ハンズオンワークショップ、技術系イベント、実践的活動',
    },
    ISFP: {
        type: 'ISFP',
        name: '冒険家',
        traits: '芸術的、柔軟性、現在を楽しむ。美的体験を重視。',
        eventPreference: 'アート体験、音楽イベント、自然体験活動',
    },
    ESTP: {
        type: 'ESTP',
        name: '起業家',
        traits: '行動力、適応力、リスクを恐れない。エネルギッシュな活動を好む。',
        eventPreference: 'アクティビティ、スポーツイベント、ビジネスチャレンジ',
    },
    ESFP: {
        type: 'ESFP',
        name: 'エンターテイナー',
        traits: '社交的、楽しさ重視、エンターテイメントを好む。人を楽しませることが好き。',
        eventPreference: 'パーティー、エンターテイメントイベント、ソーシャル活動',
    },
};

export const MBTI_TYPES = Object.keys(MBTI_PROFILES) as Array<keyof typeof MBTI_PROFILES>;
