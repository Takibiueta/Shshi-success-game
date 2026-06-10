/* =========================================================================
 * 鮨サクセス — 育成コマンド定義
 * 各コマンドは「得るもの」と「失うもの」を必ず両方持つ（毎ターン悩ませる）。
 * effects の値は number か [min,max]。exp はやる気倍率がかかる。
 * 「能力アップ」（経験点→能力変換）は画面左下の常設ボタン（コマンド枠外）。
 * ========================================================================= */

const COMMANDS = [
  {
    id: "hall", icon: "🍵", name: "ホール練習", kind: "service",
    cost: { stamina: 18 },
    effects: { exp: [10, 14], service: 1, customer: [3, 5], stress: 6 },
    note: "接客力+1・客評価UP・経験点。代わりにストレス+6",
  },
  {
    id: "kitchen", icon: "🔪", name: "キッチン補助", kind: "work",
    cost: { stamina: 20 },
    effects: { exp: [10, 14], work: 1, coworker: [3, 5], stress: 6 },
    note: "作業力+1・同僚評価UP・経験点。代わりにストレス+6",
  },
  {
    id: "menu", icon: "📖", name: "メニュー暗記", kind: "judgment",
    cost: { stamina: 12 },
    effects: { exp: [14, 20], judgment: 1, stress: 12 },
    note: "経験点が大きく判断力+1。ただしストレス+12（メンタルで軽減）",
  },
  {
    id: "claim", icon: "📞", name: "クレーム対応訓練", kind: "mental",
    cost: { stamina: 16 },
    check: { stats: ["mental", "service"], base: 0.35, statDiv: 250 },
    success: {
      effects: { exp: [12, 18], mental: 2, service: 1, customer: 2 },
      msg: "難しい応対をやり切った！",
    },
    fail: {
      effects: { exp: [4, 6], stress: 16, customer: -2 },
      msg: "言葉に詰まってしまった…",
    },
    note: "成功でメンタル+2・接客力+1。失敗するとストレス大（成功率はメンタル＋接客力）",
  },
  {
    id: "rest", icon: "😴", name: "休む", kind: "rest",
    cost: {},
    effects: { stamina: 45, stress: -6 },
    note: "体力+45・ストレス-6。経験点は入らない",
  },
  {
    id: "play", icon: "🎮", name: "遊ぶ", kind: "play",
    cost: {},
    effects: { motivation: 25, stress: -18, stamina: 5 },
    note: "やる気+25・ストレス-18。経験点は入らない（やる気は経験点効率に直結）",
  },
  {
    id: "talk", icon: "💬", name: "同僚と話す", kind: "comm",
    cost: { stamina: 8 },
    effects: { exp: [4, 7], comm: 1, coworker: [4, 6], stress: -4 },
    note: "同僚評価UP・コミュ力+1・ストレス-4。経験点は控えめ",
  },
];
