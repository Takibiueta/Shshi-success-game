/* =========================================================================
 * 鮨サクセス — ゲームデータ定義
 * ポジション / ステータス / レシピ / イベント / ミシュラン評価
 * ========================================================================= */

/* ステータスのキーと表示名 ------------------------------------------------ */
const STATS = {
  tech:    { name: "技術",   icon: "🔪", desc: "包丁さばき・握りの精度。調理ミスを減らす。" },
  speed:   { name: "スピード", icon: "⚡", desc: "手の速さ。営業の制限時間が伸びる。" },
  knowledge:{ name: "知識",  icon: "📖", desc: "目利き・レシピ。高得点メニューが解放。" },
  hospitality:{ name:"接客", icon: "🙇", desc: "おもてなし。チップと満足度が上がる。" },
  creativity:{ name:"創作",  icon: "✨", desc: "創作力。スコア倍率と特別メニュー。" },
  stamina: { name: "体力",   icon: "💪", desc: "現在の体力。練習で消費する。" },
};

/* 育成可能なステータス（体力は別管理） */
const TRAINABLE = ["tech", "speed", "knowledge", "hospitality", "creativity"];

/* ポジション定義 --------------------------------------------------------- */
const POSITIONS = {
  shokunin: {
    id: "shokunin",
    name: "寿司職人",
    icon: "🍣",
    catch: "握り一筋。技術こそ全て。",
    desc: "カウンターで握る花形。技術が伸びやすく、寿司メニューで高得点を狙える。",
    main: "tech",
    base: { tech: 28, speed: 22, knowledge: 20, hospitality: 14, creativity: 18 },
    // 営業時のボーナス
    bonus: { scoreMult: 1.15, info: "寿司系メニューのスコア +15%" },
  },
  kitchen: {
    id: "kitchen",
    name: "キッチン担当",
    icon: "🍳",
    catch: "厨房を回す縁の下の力持ち。",
    desc: "汁物・焼き物・揚げ物を担当。スピードが伸びやすく、手数で稼ぐ。",
    main: "speed",
    base: { tech: 22, speed: 28, knowledge: 18, hospitality: 16, creativity: 16 },
    bonus: { timeBonus: 8, info: "営業の制限時間 +8秒" },
  },
  floor: {
    id: "floor",
    name: "フロアスタッフ",
    icon: "🍵",
    catch: "笑顔でお客様を捌く。",
    desc: "接客と配膳の要。接客が伸びやすく、チップと客の我慢強さが上がる。",
    main: "hospitality",
    base: { tech: 16, speed: 24, knowledge: 18, hospitality: 28, creativity: 14 },
    bonus: { patience: 1.25, tip: 1.3, info: "客の我慢 +25% / チップ +30%" },
  },
  manager: {
    id: "manager",
    name: "マネージャー",
    icon: "📋",
    catch: "店全体を見渡す司令塔。",
    desc: "経営とマネジメント。知識が伸びやすく、店の評価が上がりやすい。",
    main: "knowledge",
    base: { tech: 18, speed: 20, knowledge: 26, hospitality: 22, creativity: 18 },
    bonus: { ratingMult: 1.2, info: "営業後の店評価アップ +20%" },
  },
};

/* レシピ（注文メニュー） -------------------------------------------------
 * steps: プレイヤーが順番に押す「アクションID」の列。最後は必ず "serve"。
 * カット工程(cut)が入るメニューは難度が上がる。
 * req: そのメニューが出現する最低「知識」値。
 * ------------------------------------------------------------------------ */
const ACTIONS = {
  rice:   { id: "rice",   label: "シャリ", icon: "🍚" },
  nori:   { id: "nori",   label: "のり",   icon: "⬛" },
  cut:    { id: "cut",    label: "包丁",   icon: "🔪" },
  maguro: { id: "maguro", label: "マグロ", icon: "🟥" },
  salmon: { id: "salmon", label: "サーモン", icon: "🟧" },
  tamago: { id: "tamago", label: "玉子",   icon: "🟨" },
  ebi:    { id: "ebi",    label: "えび",   icon: "🦐" },
  ikura:  { id: "ikura",  label: "いくら", icon: "🟠" },
  uni:    { id: "uni",    label: "うに",   icon: "🟡" },
  wasabi: { id: "wasabi", label: "わさび", icon: "🟢" },
  soup:   { id: "soup",   label: "出汁",   icon: "🥣" },
  fry:    { id: "fry",    label: "揚げ",   icon: "🍤" },
  serve:  { id: "serve",  label: "提供",   icon: "✅" },
};

const RECIPES = [
  { id: "maguro_nigiri", name: "マグロ握り",   icon: "🍣", steps: ["rice","maguro","serve"], score: 100, req: 0 },
  { id: "salmon_nigiri", name: "サーモン握り", icon: "🍣", steps: ["rice","salmon","serve"], score: 100, req: 0 },
  { id: "tamago",        name: "玉子",         icon: "🟨", steps: ["rice","tamago","serve"], score: 90,  req: 0 },
  { id: "ebi_nigiri",    name: "えび握り",     icon: "🍣", steps: ["rice","ebi","serve"],    score: 110, req: 0 },
  { id: "maguro_cut",    name: "中トロ（柵切り）", icon: "🍣", steps: ["cut","rice","maguro","serve"], score: 150, req: 15 },
  { id: "ikura_gunkan",  name: "いくら軍艦",   icon: "🍙", steps: ["rice","nori","ikura","serve"], score: 160, req: 20 },
  { id: "uni_gunkan",    name: "うに軍艦",     icon: "🍙", steps: ["rice","nori","uni","serve"], score: 180, req: 30 },
  { id: "deluxe_maguro", name: "本マグロ特上", icon: "🌟", steps: ["cut","rice","wasabi","maguro","serve"], score: 220, req: 40 },
  { id: "miso_soup",     name: "味噌汁",       icon: "🥣", steps: ["soup","serve"], score: 70, req: 0 },
  { id: "ebi_fry",       name: "海老天",       icon: "🍤", steps: ["fry","ebi","serve"], score: 130, req: 25 },
  { id: "deluxe_set",    name: "おまかせ握り", icon: "👑", steps: ["cut","rice","maguro","rice","salmon","serve"], score: 300, req: 50 },
];

/* 営業日のステージ設定（章ごとに難しくなる） */
const SERVICE_STAGES = [
  { day: 4,  name: "オープン初日",     time: 45, customers: 6,  interval: 4.0, patience: 16 },
  { day: 8,  name: "週末ランチ",       time: 50, customers: 9,  interval: 3.2, patience: 14 },
  { day: 12, name: "ミシュラン調査員来店", time: 60, customers: 12, interval: 2.6, patience: 13 },
];

/* ランダムイベント -------------------------------------------------------
 * 育成パートで一定確率で発生。選択肢で結果が変わる。
 * ------------------------------------------------------------------------ */
const EVENTS = [
  {
    id: "morning_market",
    title: "豊洲市場へ早朝買い出し",
    text: "兄弟子に「いい本マグロが入ってる」と誘われた。寝不足だが…？",
    choices: [
      { label: "気合いで行く！", effects: { knowledge: 8, stamina: -20 }, msg: "最高のネタを見極めた！ 知識+8（体力-20）" },
      { label: "睡眠を優先",     effects: { stamina: 10 }, msg: "しっかり休んだ。体力+10" },
    ],
  },
  {
    id: "regular_customer",
    title: "常連さんの無茶ぶり",
    text: "「大将、今日のおすすめで一品作ってよ」と常連さん。腕の見せ所だ。",
    choices: [
      { label: "創作寿司に挑戦", effects: { creativity: 10, hospitality: 4 }, msg: "新作が大ウケ！ 創作+10 接客+4" },
      { label: "無難に定番を",   effects: { hospitality: 6 }, msg: "安定の旨さ。接客+6" },
    ],
  },
  {
    id: "knife_training",
    title: "深夜の包丁研ぎ",
    text: "閉店後、ひとり厨房に残って包丁を研ぐか迷っている。",
    choices: [
      { label: "納得いくまで研ぐ", effects: { tech: 12, stamina: -15 }, msg: "切れ味が冴えた。技術+12（体力-15）" },
      { label: "今日はもう帰る",   effects: { stamina: 8 }, msg: "英気を養った。体力+8" },
    ],
  },
  {
    id: "food_show",
    title: "グルメ番組の取材",
    text: "テレビ局から「お店を取材したい」と連絡が。緊張で手が震える。",
    choices: [
      { label: "堂々と対応する",   effects: { hospitality: 10, knowledge: 4 }, msg: "落ち着いて受け答え。接客+10 知識+4" },
      { label: "断って練習する",   effects: { tech: 6, speed: 6 }, msg: "黙々と練習。技術+6 スピード+6" },
    ],
  },
  {
    id: "rival",
    title: "ライバル店の偵察",
    text: "向かいに出来た話題の寿司店。視察に行くか？",
    choices: [
      { label: "客として食べに行く", effects: { knowledge: 9, creativity: 5 }, msg: "盗めるものは盗んだ。知識+9 創作+5" },
      { label: "自分の道を磨く",     effects: { tech: 8 }, msg: "我が道を行く。技術+8" },
    ],
  },
  {
    id: "slump",
    title: "スランプ…",
    text: "最近どうも握りがしっくりこない。基本に立ち返るべきか。",
    choices: [
      { label: "ひたすら反復練習",   effects: { tech: 5, speed: 5, stamina: -10 }, msg: "地道に克服。技術+5 スピード+5（体力-10）" },
      { label: "思い切ってリフレッシュ", effects: { stamina: 25, creativity: 3 }, msg: "気分一新！ 体力+25 創作+3" },
    ],
  },
];

/* ミシュラン評価のしきい値（総合スコアから判定） ------------------------- */
const MICHELIN = [
  { min: 0,    stars: 0, title: "無星",        rank: "見習い", comment: "まだまだ修行が足りない。基礎から鍛え直そう。" },
  { min: 180,  stars: 0, title: "ビブグルマン", rank: "good", comment: "コスパ良好。地元で愛される店になった。" },
  { min: 320,  stars: 1, title: "ミシュラン一つ星", rank: "★", comment: "わざわざ訪れる価値のある店。立派な大将だ。" },
  { min: 460,  stars: 2, title: "ミシュラン二つ星", rank: "★★", comment: "遠回りしてでも訪れたい名店。職人技が光る。" },
  { min: 600,  stars: 3, title: "ミシュラン三つ星", rank: "★★★", comment: "そのために旅行する価値がある。伝説の鮨職人誕生！" },
];

/* 店評価の★（営業の累積スコアから） */
function storeStarLabel(score) {
  if (score >= 2400) return "★★★★★";
  if (score >= 1800) return "★★★★";
  if (score >= 1200) return "★★★";
  if (score >= 600)  return "★★";
  if (score >= 200)  return "★";
  return "☆";
}
