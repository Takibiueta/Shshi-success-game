/* =========================================================================
 * 鮨サクセス — イベント定義
 *
 * 設計方針：
 * - 選択肢は「単純な正解」を作らず、必ずトレードオフにする。
 * - check 付きの選択肢は判断力などで成功率が変わる（成功率はUIに表示）。
 * - cond（評価のしきい値）で発生条件を縛り、大将評価と同僚評価を対立軸にする。
 *   支援/孤立/引き立て/理不尽イベントは weight を上げて「評価の結果」を体感させる。
 * - pos 付きはそのポジション専用。
 * ========================================================================= */

const EVENTS = [

  /* ===== 対立軸イベント（大将 vs 同僚） ===== */
  {
    id: "boss_order", title: "大将の無茶な指示", chara: "oyakata", expr: "normal", weight: 1.4,
    text: "「明日から品書きを一新する。今夜中に全部仕込み直せ」。現場は明らかに疲れ切っている…",
    choices: [
      { label: "大将に従う", effects: { exp: 10, boss: 8, coworker: -6, stress: 10 },
        msg: "夜通し仕込んだ。大将は満足げだが、同僚の視線が冷たい…" },
      { label: "現場を守る", effects: { exp: 8, coworker: 8, boss: -7 },
        msg: "「今夜は無理です」と進言。同僚は感謝してくれたが、大将は不機嫌だ。" },
      { label: "落としどころを探る", check: { stats: ["judgment"] },
        success: { effects: { exp: 12, boss: 5, coworker: 5, judgment: 1, stress: 4 },
          msg: "「主力の品だけ今夜、残りは段階的に」と提案。双方が納得した！" },
        fail: { effects: { exp: 4, boss: -4, coworker: -4, stress: 8 },
          msg: "中途半端な提案は両方の不興を買ってしまった…" } },
    ],
  },
  {
    id: "busy_rush", title: "突然の団体客", chara: "me", expr: "surprised", weight: 1.4,
    text: "予約なしで15名の団体客！ 店は一気に戦場と化した。",
    choices: [
      { label: "先頭に立って回す", check: { stats: ["work"] },
        success: { effects: { exp: 20, coworker: 5, boss: 4, customer: 3, stress: 6 },
          msg: "見事な仕事ぶりで店を回しきった！皆の信頼が上がった。" },
        fail: { effects: { exp: 6, stress: 14, customer: -3 },
          msg: "手が追いつかず大混乱…提供が遅れてしまった。" } },
      { label: "無理せず確実に", effects: { exp: 8, stress: 4, customer: 1 },
        msg: "自分の持ち場を確実にこなした。大過なし、だが評価もそこそこ。" },
    ],
  },
  {
    id: "tough_customer", title: "気難しい常連", chara: "me", expr: "worried", weight: 1.4,
    text: "「今日のシャリは硬い」と常連さん。周りのお客さんも聞き耳を立てている…",
    choices: [
      { label: "真正面から応対する", check: { stats: ["service"] },
        success: { effects: { exp: 14, customer: 6, service: 1, stress: 4 },
          msg: "丁寧な応対に常連さんも満足。「兄ちゃん、良くなったな」" },
        fail: { effects: { exp: 4, customer: -4, stress: 14 },
          msg: "応対がぎこちなく、気まずい空気に…" } },
      { label: "先輩に任せる", effects: { exp: 2, coworker: -3, stress: 1 },
        msg: "先輩が収めてくれた。ただ「またか」という顔をされた。" },
    ],
  },
  {
    id: "daily_special", title: "日替わりの判断", chara: "me", expr: "normal", weight: 1.4,
    text: "仕入れで余った鯵。日替わりをどう打ち出すかは自分に任された。",
    choices: [
      { label: "攻めた創作で出す", check: { stats: ["judgment"] },
        success: { effects: { exp: 16, customer: 5, judgment: 1, boss: 3 },
          msg: "炙りと薬味の一工夫が大当たり！完売した。" },
        fail: { effects: { exp: 5, customer: -4, boss: -3, stress: 8 },
          msg: "狙いすぎて客の反応はいまひとつ…" } },
      { label: "無難な塩焼きで出す", effects: { exp: 6, customer: 1 },
        msg: "手堅くさばいた。悪くない、でも記憶にも残らない。" },
    ],
  },

  /* ===== 関係性イベント（評価で発生が変わる） ===== */
  {
    id: "support_help", title: "同僚の助け舟", chara: "me", expr: "happy",
    cond: { coworkerMin: 60 }, weight: 2.5,
    text: "「お前最近頑張ってるからさ」と同僚が仕込みを代わってくれた。",
    choices: [
      { label: "甘えて休ませてもらう", effects: { stamina: 25, stress: -10, motivation: 8 },
        msg: "持つべきものは仲間。心も体も軽くなった。" },
      { label: "一緒に仕込みをする", effects: { exp: 14, coworker: 4, stress: 4 },
        msg: "並んで仕込み。腕も絆も深まった。" },
    ],
  },
  {
    id: "isolation", title: "輪に入れない", chara: "me", expr: "tired",
    cond: { coworkerMax: 30 }, weight: 2.5,
    text: "休憩室の笑い声。自分が入ると、少しだけ空気が変わる気がする…",
    choices: [
      { label: "一人で黙々とやる", effects: { exp: 8, stress: 12, motivation: -6 },
        msg: "仕事に逃げた。腕は鈍らないが、心は重い。" },
      { label: "勇気を出して話しかける", check: { stats: ["comm"] },
        success: { effects: { exp: 6, coworker: 8, comm: 1, stress: -4 },
          msg: "意外なほど普通に受け入れてくれた。一歩前進！" },
        fail: { effects: { exp: 2, stress: 10, motivation: -4 },
          msg: "会話が続かず、余計に気まずくなってしまった…" } },
    ],
  },
  {
    id: "boss_favor", title: "大将の計らい", chara: "oyakata", expr: "happy",
    cond: { bossMin: 60 }, weight: 2.5,
    text: "「お前は見込みがある」。大将が大トロの賄いを握ってくれた。",
    choices: [
      { label: "ありがたく頂く", effects: { stamina: 18, motivation: 10, exp: 8, coworker: -2 },
        msg: "美味い…！ただ、同僚のやっかみが少し聞こえた気もする。" },
      { label: "皆に分ける", effects: { exp: 6, coworker: 6, boss: 1 },
        msg: "賄いを切り分けた。「気が利くな」と場が和んだ。" },
    ],
  },
  {
    id: "unreasonable", title: "理不尽な叱責", chara: "oyakata", expr: "fired",
    cond: { bossMax: 30 }, weight: 2.5,
    text: "自分のせいではないミスで、大将の雷が落ちた。評価が低い今、矢面に立たされやすい…",
    choices: [
      { label: "ぐっとこらえる", effects: { exp: 4, stress: 18, motivation: -8 },
        msg: "黙って頭を下げた。胸の奥に何かが溜まっていく…（メンタルが高ければ軽く流せる）" },
      { label: "筋を通して言い返す", effects: { exp: 6, boss: -6, coworker: 4, stress: 8 },
        msg: "事実を伝えた。大将はさらに不機嫌だが、同僚は内心スッとしたようだ。" },
    ],
  },
  {
    id: "shift_hole", title: "シフトの穴埋め", chara: "me", expr: "normal", weight: 1.2,
    text: "急病の同僚の代わりに、明日も出てほしいと頼まれた。",
    choices: [
      { label: "引き受ける", effects: { exp: 10, boss: 4, coworker: 3, stamina: -18, stress: 8 },
        msg: "連勤はキツい。でも貸しひとつ、信頼ふたつ。" },
      { label: "今回は断る", effects: { boss: -3, motivation: 4, stress: -2 },
        msg: "自分を守った。少しの罪悪感と、確かな休息。" },
    ],
  },

  /* ===== 汎用イベント ===== */
  {
    id: "morning_market", title: "豊洲市場へ早朝買い出し", chara: "me", expr: "normal",
    text: "兄弟子に「いい本マグロが入ってる」と誘われた。寝不足だが…？",
    choices: [
      { label: "気合いで行く！", effects: { exp: 22, judgment: 1, stamina: -20, stress: 6 },
        msg: "最高のネタを見極めた！目利きの経験は財産だ。" },
      { label: "睡眠を優先", effects: { stamina: 10, stress: -4 },
        msg: "しっかり休んだ。それも仕事のうち。" },
    ],
  },
  {
    id: "knife_training", title: "深夜の包丁研ぎ", chara: "me", expr: "normal",
    text: "閉店後、ひとり厨房に残って包丁を研ぐか迷っている。",
    choices: [
      { label: "納得いくまで研ぐ", effects: { exp: 20, work: 1, stamina: -15, stress: 6 },
        msg: "切れ味が冴えた。明日の仕事が楽しみだ。" },
      { label: "今日はもう帰る", effects: { stamina: 8, stress: -3 },
        msg: "英気を養った。" },
    ],
  },
  {
    id: "food_show", title: "グルメ番組の取材", chara: "me", expr: "surprised",
    text: "テレビ局から「お店を取材したい」と連絡が。緊張で手が震える。",
    choices: [
      { label: "堂々と対応する", effects: { exp: 18, customer: 5, boss: 4, stress: 8 },
        msg: "店の看板として喋り切った！放送が楽しみだ。" },
      { label: "裏方に徹する", effects: { exp: 12, work: 1, coworker: 2 },
        msg: "黙々と現場を支えた。同僚は見ていてくれた。" },
    ],
  },
  {
    id: "slump", title: "スランプ…", chara: "me", expr: "tired",
    text: "最近どうも握りがしっくりこない。基本に立ち返るべきか。",
    choices: [
      { label: "ひたすら反復練習", effects: { exp: 12, work: 1, stamina: -10, stress: 8 },
        msg: "地道に克服。遠回りが一番の近道。" },
      { label: "思い切ってリフレッシュ", effects: { stamina: 20, stress: -12, motivation: 8 },
        msg: "気分一新！肩の力が抜けた。" },
    ],
  },

  /* ===== 彼女「さくら」／ライバル「龍二」 ===== */
  {
    id: "heroine_visit", chara: "heroine", expr: "happy",
    title: "さくらの差し入れ",
    text: "幼なじみの「さくら」が店に来てくれた。「無理してない？ はい、これ作ってきたよ！」",
    choices: [
      { label: "ありがたく受け取る", effects: { stamina: 20, stress: -10, motivation: 8 }, item: "bento",
        msg: "差し入れに元気百倍！（特製まかない を入手）" },
      { label: "少し一緒に休む", effects: { stamina: 25, stress: -14, motivation: 12 },
        msg: "たわいない話で笑った。こういう時間が明日の力になる。" },
    ],
  },
  {
    id: "heroine_date", chara: "heroine", expr: "normal",
    title: "休日のお誘い",
    text: "「たまには息抜きしよ？」とさくらに誘われた。どうする？",
    choices: [
      { label: "デートする", effects: { stress: -20, motivation: 20, stamina: 10, comm: 1 },
        msg: "最高の休日。心が満たされた。" },
      { label: "店の仕込みを優先", effects: { exp: 14, boss: 3, stress: 6 }, item: "tea",
        msg: "真面目に仕込み。さくらは高級茶葉を置いていってくれた…" },
    ],
  },
  {
    id: "rival_challenge", chara: "rival", expr: "smug",
    title: "ライバル登場",
    text: "向かいの店の若大将「龍二」が挑発してきた。「お前の握り、見せてもらおうか」",
    choices: [
      { label: "勝負を受ける！", effects: { exp: 24, work: 1, stress: 8, motivation: 8 },
        msg: "火花散る対決！負けられない戦いが人を伸ばす。" },
      { label: "技を盗む", effects: { exp: 16, judgment: 1 },
        msg: "冷静に観察した。悔しいが、奴の仕事は確かだ。" },
    ],
  },
  {
    id: "rival_recipe", chara: "rival", expr: "smug",
    title: "ライバルの新作",
    text: "龍二の新作が話題をさらっているらしい。悔しさで燃えてきた…！",
    choices: [
      { label: "対抗して創作する", effects: { exp: 20, stress: 10, motivation: 10 }, item: "charm",
        msg: "負けじと新作開発！（お守り を入手）" },
      { label: "基礎を固める", effects: { exp: 14, work: 1 }, item: "whetstone",
        msg: "地に足つけて鍛錬。（砥石 を入手）" },
    ],
  },

  /* ===== ポジション専用 ===== */
  {
    id: "shok_oyakata", pos: "shokunin", chara: "oyakata", expr: "normal",
    title: "大将直伝・握りの極意",
    text: "「ええか、シャリは赤子を包むように握れ」。大将がつきっきりで教えてくれる。",
    choices: [
      { label: "とことん教わる", effects: { exp: 30, stamina: -12, boss: 4, stress: 6 },
        msg: "握りの極意を会得！大将との距離も縮まった。" },
      { label: "見て盗む", effects: { exp: 16, judgment: 1 },
        msg: "目で盗んだ。考える力がついた。" },
    ],
  },
  {
    id: "shok_creative", pos: "shokunin", chara: "me", expr: "fired",
    title: "創作寿司の構想",
    text: "夜中、ふと新しい握りのアイデアが浮かんだ。試作してみるか？",
    choices: [
      { label: "朝まで試作する", effects: { exp: 26, stamina: -18, stress: 8, customer: 3 }, item: "charm",
        msg: "新作が完成！（お守り を入手）" },
      { label: "メモして寝る", effects: { exp: 10, stamina: 8 },
        msg: "アイデアは温存。健康も大事。" },
    ],
  },
  {
    id: "kit_rush", pos: "kitchen", chara: "me", expr: "tired",
    title: "仕込みの山",
    text: "明日の仕込みが大量に残っている。徹夜で片付けるか？",
    choices: [
      { label: "一気に片付ける", effects: { exp: 28, stamina: -20, stress: 10, coworker: 5 },
        msg: "全部やり切った！朝、同僚が驚いていた。" },
      { label: "要点だけ手早く", effects: { exp: 15, stamina: -6 },
        msg: "効率重視で切り上げた。" },
    ],
  },
  {
    id: "kit_fry", pos: "kitchen", chara: "oyakata", expr: "happy",
    title: "揚げ場の極意",
    text: "大将が天ぷらの揚げ加減を伝授してくれるという。",
    choices: [
      { label: "火加減を体で覚える", effects: { exp: 26, stamina: -10, work: 1, boss: 3 }, item: "whetstone",
        msg: "揚げの感覚を掴んだ！（砥石 を入手）" },
      { label: "レシピで覚える", effects: { exp: 15, judgment: 1 },
        msg: "理屈で理解した。" },
    ],
  },
  {
    id: "flo_regular", pos: "floor", chara: "me", expr: "happy",
    title: "常連さんとの会話",
    text: "常連の旦那衆が「姉ちゃん、話聞いてよ」と上機嫌だ。",
    choices: [
      { label: "笑顔で聞き役に", effects: { exp: 24, stamina: -6, customer: 5, comm: 1 },
        msg: "場が和んだ！「あんたがいると楽しいよ」" },
      { label: "さりげなく注文を促す", effects: { exp: 14, customer: 2, boss: 2 }, item: "tea",
        msg: "商売上手。（高級茶葉 を入手）" },
    ],
  },
  {
    id: "flo_complaint", pos: "floor", chara: "oyakata", expr: "worried",
    title: "本物のクレーム",
    text: "提供が遅いとお客さんがご立腹。訓練の成果を見せるときだ。",
    choices: [
      { label: "誠心誠意あやまる", check: { stats: ["service", "mental"], statDiv: 220 },
        success: { effects: { exp: 22, customer: 5, mental: 1 },
          msg: "落ち着いた応対で、最後は笑顔で帰っていただけた。" },
        fail: { effects: { exp: 6, customer: -3, stress: 12 },
          msg: "声が震えてしまった…悔しい。" } },
      { label: "一品サービスする", effects: { exp: 12, customer: 3, boss: -2 },
        msg: "機転で収めた。原価には大将が渋い顔。" },
    ],
  },
  {
    id: "mgr_books", pos: "manager", chara: "me", expr: "normal",
    title: "帳簿とにらめっこ",
    text: "今月の売上と原価を見直す。改善点が見えてきた。",
    choices: [
      { label: "徹底的に分析する", effects: { exp: 28, stamina: -10, judgment: 1, boss: 4, stress: 8 },
        msg: "経営感覚が磨かれた！大将も数字に唸った。" },
      { label: "要点だけ確認", effects: { exp: 15 },
        msg: "効率よく把握。" },
    ],
  },
  {
    id: "mgr_staff", pos: "manager", chara: "oyakata", expr: "normal",
    title: "スタッフ面談",
    text: "若いスタッフが何か悩んでいるようだ。話を聞くか？",
    choices: [
      { label: "じっくり向き合う", effects: { exp: 24, stamina: -6, coworker: 6, comm: 1 }, item: "charm",
        msg: "信頼が深まった。（お守り を入手）" },
      { label: "励まして送り出す", effects: { exp: 13, coworker: 3 },
        msg: "前向きに送り出した。" },
    ],
  },
];
