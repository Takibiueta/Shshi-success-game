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
  energy:    { id: "energy",    name: "栄養ドリンク",   icon: "🧃", desc: "体力 +40",          effect: { stamina: 40 } },
  knife:     { id: "knife",     name: "上等な包丁",     icon: "🔪", desc: "技術 +8",           effect: { tech: 8 } },
  recipe:    { id: "recipe",    name: "秘伝のレシピ書", icon: "📕", desc: "知識 +8",           effect: { knowledge: 8 } },
  tea:       { id: "tea",       name: "高級茶葉",       icon: "🍵", desc: "接客 +8",           effect: { hospitality: 8 } },
  whetstone: { id: "whetstone", name: "名工の砥石",     icon: "🪨", desc: "技術 +5 / スピード +5", effect: { tech: 5, speed: 5 } },
  charm:     { id: "charm",     name: "商売繁盛のお守り", icon: "🧧", desc: "創作 +6 / 接客 +4",  effect: { creativity: 6, hospitality: 4 } },
  bento:     { id: "bento",     name: "特製まかない",   icon: "🍱", desc: "体力 +25 / 全能力 +2", effect: { stamina: 25, all: 2 } },
};

/* ランダムイベント -------------------------------------------------------
 * 育成パートで一定確率で発生。選択肢で結果が変わる。
 * chara: 立ち絵の話者（me / oyakata / heroine / rival）。省略時は me。
 * choices[].item: 選ぶと入手するアイテムID。
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

  /* --- 彼女「さくら」イベント --- */
  {
    id: "heroine_visit", chara: "heroine", expr: "happy",
    title: "さくらの差し入れ",
    text: "幼なじみの「さくら」が店に来てくれた。「無理してない？ はい、これ作ってきたよ！」",
    choices: [
      { label: "ありがたく受け取る", effects: { stamina: 20, hospitality: 4 }, item: "bento", msg: "差し入れに元気百倍！ 体力+20 接客+4（特製まかない を入手）" },
      { label: "少し一緒に休む",     effects: { stamina: 30, creativity: 5 }, msg: "楽しいひととき。体力+30 創作+5" },
    ],
  },
  {
    id: "heroine_date", chara: "heroine", expr: "normal",
    title: "休日のお誘い",
    text: "「たまには息抜きしよ？」とさくらに誘われた。どうする？",
    choices: [
      { label: "デートする",         effects: { stamina: 25, hospitality: 8, creativity: 4 }, msg: "心が満たされた。体力+25 接客+8 創作+4" },
      { label: "店の仕込みを優先",   effects: { tech: 7 }, item: "tea", msg: "真面目に仕込み。技術+7（さくらが高級茶葉を置いていった）" },
    ],
  },

  /* --- ライバル「龍二」イベント --- */
  {
    id: "rival_challenge", chara: "rival", expr: "smug",
    title: "ライバル登場",
    text: "向かいの店の若大将「龍二」が挑発してきた。「お前の握り、見せてもらおうか」",
    choices: [
      { label: "勝負を受ける！",     effects: { tech: 10, speed: 6, stamina: -10 }, msg: "火花散る対決！ 技術+10 スピード+6（体力-10）" },
      { label: "技を盗む",           effects: { knowledge: 8, creativity: 6 }, msg: "観察に徹した。知識+8 創作+6" },
    ],
  },
  {
    id: "rival_recipe", chara: "rival", expr: "smug",
    title: "ライバルの新作",
    text: "龍二の新作が話題をさらっているらしい。悔しさで燃えてきた…！",
    choices: [
      { label: "対抗して創作する",   effects: { creativity: 11, stamina: -8 }, item: "charm", msg: "負けじと新作開発！ 創作+11（体力-8）（お守り を入手）" },
      { label: "基礎を固める",       effects: { tech: 6, speed: 6 }, item: "whetstone", msg: "地に足つけて鍛錬。技術+6 スピード+6（砥石を入手）" },
    ],
  },

  /* ===== ポジション専用イベント（pos が一致する職種だけ発生） ===== */
  /* --- 寿司職人 --- */
  {
    id: "shok_oyakata", pos: "shokunin", chara: "oyakata", expr: "normal",
    title: "大将直伝・握りの極意",
    text: "「ええか、シャリは赤子を包むように握れ」。大将がつきっきりで教えてくれる。",
    choices: [
      { label: "とことん教わる", effects: { stamina: -12 }, exp: 34, msg: "握りの極意を会得！ 経験点+34（体力-12）" },
      { label: "見て盗む",       exp: 18, msg: "目で盗んだ。経験点+18" },
    ],
  },
  {
    id: "shok_creative", pos: "shokunin", chara: "me", expr: "fired",
    title: "創作寿司の構想",
    text: "夜中、ふと新しい握りのアイデアが浮かんだ。試作してみるか？",
    choices: [
      { label: "朝まで試作する", effects: { stamina: -18 }, exp: 28, item: "charm", msg: "新作が完成！ 経験点+28（体力-18）お守り入手" },
      { label: "メモして寝る",   effects: { stamina: 8 }, exp: 12, msg: "アイデアは温存。経験点+12 体力+8" },
    ],
  },
  /* --- キッチン担当 --- */
  {
    id: "kit_rush", pos: "kitchen", chara: "me", expr: "tired",
    title: "仕込みの山",
    text: "明日の仕込みが大量に残っている。徹夜で片付けるか？",
    choices: [
      { label: "一気に片付ける", effects: { stamina: -20 }, exp: 32, msg: "猛スピードで完了！ 経験点+32（体力-20）" },
      { label: "要点だけ手早く", effects: { stamina: -6 }, exp: 17, msg: "効率重視。経験点+17（体力-6）" },
    ],
  },
  {
    id: "kit_fry", pos: "kitchen", chara: "oyakata", expr: "happy",
    title: "揚げ場の極意",
    text: "大将が天ぷらの揚げ加減を伝授してくれるという。",
    choices: [
      { label: "火加減を体で覚える", effects: { stamina: -10 }, exp: 30, item: "whetstone", msg: "揚げの達人へ！ 経験点+30（体力-10）砥石入手" },
      { label: "レシピで覚える",     exp: 17, msg: "理屈で理解。経験点+17" },
    ],
  },
  /* --- フロアスタッフ --- */
  {
    id: "flo_regular", pos: "floor", chara: "me", expr: "happy",
    title: "常連さんとの会話",
    text: "常連の旦那衆が「姉ちゃん、話聞いてよ」と上機嫌だ。",
    choices: [
      { label: "笑顔で聞き役に",       effects: { stamina: -6 }, exp: 28, msg: "場が和んだ！ 経験点+28（体力-6）" },
      { label: "さりげなく注文を促す", exp: 17, item: "tea", msg: "商売上手。経験点+17 高級茶葉入手" },
    ],
  },
  {
    id: "flo_complaint", pos: "floor", chara: "oyakata", expr: "worried",
    title: "クレーム対応",
    text: "提供が遅いとお客さんがご立腹。どう収める？",
    choices: [
      { label: "誠心誠意あやまる", effects: { stamina: -8 }, exp: 26, msg: "丁寧な対応で納得してもらえた。経験点+26（体力-8）" },
      { label: "一品サービスする", effects: { stamina: -2 }, exp: 15, msg: "機転で解決。経験点+15" },
    ],
  },
  /* --- マネージャー --- */
  {
    id: "mgr_books", pos: "manager", chara: "me", expr: "normal",
    title: "帳簿とにらめっこ",
    text: "今月の売上と原価を見直す。改善点が見えてきた。",
    choices: [
      { label: "徹底的に分析する", effects: { stamina: -10 }, exp: 32, msg: "経営感覚が磨かれた！ 経験点+32（体力-10）" },
      { label: "要点だけ確認",     exp: 17, msg: "効率よく把握。経験点+17" },
    ],
  },
  {
    id: "mgr_staff", pos: "manager", chara: "oyakata", expr: "normal",
    title: "スタッフ面談",
    text: "若いスタッフが何か悩んでいるようだ。話を聞くか？",
    choices: [
      { label: "じっくり向き合う", effects: { stamina: -6 }, exp: 28, item: "charm", msg: "信頼が深まった。経験点+28（体力-6）お守り入手" },
      { label: "励まして送り出す", exp: 16, msg: "前向きに送り出した。経験点+16" },
    ],
  },
];

/* 訓練コマンド（経験点を稼ぐ）。得意稽古はポジションで内容が変わる。 */
const TRAININGS = [
  { id: "hard",   icon: "🔥", name: "猛特訓",   exp: [18, 26], cost: 32, risk: true,  note: "経験点 大／体力 大・疲労注意" },
  { id: "normal", icon: "💪", name: "通常稽古", exp: [10, 15], cost: 22, note: "経験点 中／体力 中" },
  { id: "light",  icon: "🍵", name: "軽い稽古", exp: [5, 8],   cost: 8,  note: "経験点 小／体力 小" },
];

/* 能力アップ：現在値に応じた「+1あたりの経験点コスト」 */
function allocCostAt(v) {
  if (v >= 90) return 12;
  if (v >= 80) return 8;
  if (v >= 70) return 5;
  if (v >= 60) return 3;
  if (v >= 40) return 2;
  return 1;
}

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
