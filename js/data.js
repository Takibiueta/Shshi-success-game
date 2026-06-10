/* =========================================================================
 * 鮨サクセス — ゲームデータ定義
 * ポジション / ステータス / レシピ / イベント / ミシュラン評価
 * ========================================================================= */

/* ステータスのキーと表示名 ------------------------------------------------
 * それぞれプレイ中の明確な役割を持つ（logic/effects.js が実装）。 */
const STATS = {
  work:     { name: "作業力",   icon: "🔪", desc: "調理・仕込みの腕。繁忙イベントの成功率と営業の腕前に影響。" },
  service:  { name: "接客力",   icon: "🙇", desc: "おもてなし。客イベントの成功率、営業の我慢・チップに影響。" },
  judgment: { name: "判断力",   icon: "🧠", desc: "目利きと決断。選択イベントの成功率、高得点メニュー解放に影響。" },
  mental:   { name: "メンタル", icon: "🛡️", desc: "心の強さ。ストレスの増加量を軽減する。" },
  comm:     { name: "コミュ力", icon: "💬", desc: "人付き合い。大将・同僚評価の上がりやすさに影響。" },
  stamina:  { name: "体力",     icon: "💪", desc: "現在の体力。コマンドで消費する。" },
};

/* 育成可能なステータス（体力は別管理） */
const TRAINABLE = ["work", "service", "judgment", "mental", "comm"];

/* メーター（0-100）と評価（0-100）の表示メタ */
const METERS = {
  stress:     { name: "ストレス", icon: "🔥", desc: "溜まると効率低下、100で倒れる。エンディングにも影響。" },
  motivation: { name: "やる気",   icon: "🎵", desc: "経験点の獲得倍率に直結。毎週少しずつ下がる。" },
};
const EVALS = {
  boss:     { name: "大将評価", icon: "👔", desc: "高いと引き立てイベント。低いと理不尽の矢面に。" },
  coworker: { name: "同僚評価", icon: "🤝", desc: "高いと支援イベント。低いと孤立イベント。" },
  customer: { name: "客評価",   icon: "⭐", desc: "お客さんからの人気。営業結果で変動。" },
};

/* ポジション定義 --------------------------------------------------------- */
const POSITIONS = {
  shokunin: {
    id: "shokunin",
    name: "寿司職人",
    icon: "🍣",
    catch: "握り一筋。腕こそ全て。",
    desc: "カウンターで握る花形。作業力が伸びやすく、寿司メニューで高得点を狙える。",
    main: "work",
    base: { work: 28, service: 14, judgment: 22, mental: 20, comm: 14 },
    // 営業時のボーナス
    bonus: { scoreMult: 1.15, info: "寿司系メニューのスコア +15%" },
  },
  kitchen: {
    id: "kitchen",
    name: "キッチン担当",
    icon: "🍳",
    catch: "厨房を回す縁の下の力持ち。",
    desc: "汁物・焼き物・揚げ物を担当。メンタルが伸びやすく、タフに働ける。",
    main: "mental",
    base: { work: 24, service: 14, judgment: 18, mental: 26, comm: 16 },
    bonus: { timeBonus: 8, info: "営業の制限時間 +8秒" },
  },
  floor: {
    id: "floor",
    name: "フロアスタッフ",
    icon: "🍵",
    catch: "笑顔でお客様を捌く。",
    desc: "接客と配膳の要。接客力が伸びやすく、チップと客の我慢強さが上がる。",
    main: "service",
    base: { work: 14, service: 28, judgment: 18, mental: 16, comm: 24 },
    bonus: { patience: 1.25, tip: 1.3, info: "客の我慢 +25% / チップ +30%" },
  },
  manager: {
    id: "manager",
    name: "マネージャー",
    icon: "📋",
    catch: "店全体を見渡す司令塔。",
    desc: "経営とマネジメント。判断力が伸びやすく、店の評価が上がりやすい。",
    main: "judgment",
    base: { work: 16, service: 20, judgment: 26, mental: 18, comm: 22 },
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

/* cat: メニュー分類。shokunin=寿司、kitchen=厨房（汁/揚げ）。ポジションで出る品が変わる */
const RECIPES = [
  { id: "maguro_nigiri", name: "マグロ握り",   icon: "🍣", cat: "sushi",   steps: ["rice","maguro","serve"], score: 100, req: 0 },
  { id: "salmon_nigiri", name: "サーモン握り", icon: "🍣", cat: "sushi",   steps: ["rice","salmon","serve"], score: 100, req: 0 },
  { id: "tamago",        name: "玉子",         icon: "🟨", cat: "sushi",   steps: ["rice","tamago","serve"], score: 90,  req: 0 },
  { id: "ebi_nigiri",    name: "えび握り",     icon: "🍣", cat: "sushi",   steps: ["rice","ebi","serve"],    score: 110, req: 0 },
  { id: "maguro_cut",    name: "中トロ（柵切り）", icon: "🍣", cat: "sushi", steps: ["cut","rice","maguro","serve"], score: 150, req: 15 },
  { id: "ikura_gunkan",  name: "いくら軍艦",   icon: "🍙", cat: "sushi",   steps: ["rice","nori","ikura","serve"], score: 160, req: 20 },
  { id: "uni_gunkan",    name: "うに軍艦",     icon: "🍙", cat: "sushi",   steps: ["rice","nori","uni","serve"], score: 180, req: 30 },
  { id: "deluxe_maguro", name: "本マグロ特上", icon: "🌟", cat: "sushi",   steps: ["cut","rice","wasabi","maguro","serve"], score: 220, req: 40 },
  { id: "miso_soup",     name: "味噌汁",       icon: "🥣", cat: "kitchen", steps: ["soup","serve"], score: 70, req: 0 },
  { id: "tamago_yaki",   name: "出汁巻き玉子", icon: "🍳", cat: "kitchen", steps: ["fry","tamago","serve"], score: 110, req: 10 },
  { id: "ebi_fry",       name: "海老天",       icon: "🍤", cat: "kitchen", steps: ["fry","ebi","serve"], score: 130, req: 25 },
  { id: "soup_set",      name: "あら汁定食",   icon: "🍲", cat: "kitchen", steps: ["soup","rice","serve"], score: 140, req: 20 },
  { id: "deluxe_set",    name: "おまかせ握り", icon: "👑", cat: "sushi",   steps: ["cut","rice","maguro","rice","salmon","serve"], score: 300, req: 50 },
];

/* 営業日のステージ設定（全20週・営業4回／5・10・15・20週目） */
const SERVICE_STAGES = [
  { day: 5,  name: "オープン初日",       time: 45, customers: 6,  interval: 4.0, patience: 16 },
  { day: 10, name: "週末ランチ",         time: 50, customers: 9,  interval: 3.4, patience: 14 },
  { day: 15, name: "常連感謝デー",       time: 55, customers: 11, interval: 3.0, patience: 13 },
  { day: 20, name: "ミシュラン調査員来店", time: 62, customers: 14, interval: 2.6, patience: 12 },
];

/* アイテム ---------------------------------------------------------------
 * イベントの差し入れ等で入手。使うと即時に能力/体力が上がる（週は進まない）。
 * effect の "all" は育成可能な全能力に加算。
 * ------------------------------------------------------------------------ */
const ITEMS = {
  energy:    { id: "energy",    name: "栄養ドリンク",   icon: "🧃", desc: "体力 +40",                    effect: { stamina: 40 } },
  knife:     { id: "knife",     name: "上等な包丁",     icon: "🔪", desc: "作業力 +8",                   effect: { work: 8 } },
  recipe:    { id: "recipe",    name: "秘伝のレシピ書", icon: "📕", desc: "判断力 +8",                   effect: { judgment: 8 } },
  tea:       { id: "tea",       name: "高級茶葉",       icon: "🍵", desc: "接客力 +8",                   effect: { service: 8 } },
  whetstone: { id: "whetstone", name: "名工の砥石",     icon: "🪨", desc: "作業力 +5 / ストレス -5",     effect: { work: 5, stress: -5 } },
  charm:     { id: "charm",     name: "商売繁盛のお守り", icon: "🧧", desc: "コミュ力 +6 / ストレス -5", effect: { comm: 6, stress: -5 } },
  bento:     { id: "bento",     name: "特製まかない",   icon: "🍱", desc: "体力 +25 / やる気 +10 / ストレス -10", effect: { stamina: 25, motivation: 10, stress: -10 } },
};

/* イベント・訓練コマンド・バランス値は js/data/ 配下へ移動した。
 *   js/data/events.js   … ランダムイベント（対立軸・関係性・ポジション専用）
 *   js/data/commands.js … 育成コマンド
 *   js/data/balance.js  … 調整値（初期値・倍率・しきい値・能力アップコスト）
 *   js/data/endings.js  … エンディング分岐
 * ------------------------------------------------------------------------ */

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
