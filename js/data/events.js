/* =========================================================================
 * 鮨サクセス — 会話イベント定義（ADV形式）
 *
 * 構造は types/types.js の AdvEvent を参照。
 * - trigger.type: week（指定週に必ず）/ after（コマンド直後に確率）/ random（週次抽選）
 * - lines: 導入会話（クリック送り）。choices: トレードオフ選択肢。
 * - 選択肢の結果にも lines（結果会話）を付けられる。effects はその後に反映。
 * - 大将評価と同僚評価の対立軸・判定（成功率表示）は従来どおり。
 * ========================================================================= */

const EVENTS = [

  /* ===== 固定週イベント（物語の節目） ===== */
  {
    id: "w2_orientation", title: "大将の心得", bg: "kitchen",
    trigger: { type: "week", week: 2 },
    lines: [
      { who: "oyakata", expr: "normal", text: "おう、少しは店に慣れたか。ひとつだけ言っておく。" },
      { who: "oyakata", expr: "fired",  text: "腕・人・客。どれを取るかはお前の生き方だ。全部取れるほど、この世界は甘くねえ。" },
      { who: "me", expr: "surprised", text: "（腕を磨くか、仲間と繋がるか、お客さんに尽くすか…ってことか）" },
    ],
    choices: [
      { label: "「全部、追いかけてみせます！」",
        effects: { exp: 10, motivation: 8, stress: 4 },
        msg: "大将は鼻で笑ったが、目は笑っていた。",
        lines: [{ who: "oyakata", expr: "happy", text: "ハッ、言うじゃねえか。なら見せてもらおうか。" }] },
      { label: "「まずは目の前の仕事からやります」",
        effects: { exp: 8, boss: 4 },
        msg: "地に足のついた答えに、大将は静かに頷いた。",
        lines: [{ who: "oyakata", expr: "normal", text: "…それでいい。背伸びした奴から潰れていくんだ。" }] },
    ],
  },
  {
    id: "w9_midterm", title: "中間評価", bg: "kitchen",
    trigger: { type: "week", week: 9 },
    lines: [
      { who: "oyakata", expr: "normal", text: "折り返しだ。お前の働き、ずっと見てたぞ。" },
      { who: "me", expr: "worried", text: "（ご、ごくり…）" },
      { who: "oyakata", expr: "normal", text: "ここから先は、自分の「武器」を決めて磨け。器用貧乏が一番半端だ。" },
    ],
    choices: [
      { label: "腕（作業力）で勝負します", effects: { exp: 14, work: 2 },
        msg: "腕に磨きをかける決意をした。",
        lines: [{ who: "oyakata", expr: "happy", text: "職人の答えだ。なら、誰よりも早く正確にな。" }] },
      { label: "人（接客・コミュ）で勝負します", effects: { exp: 14, service: 1, comm: 1 },
        msg: "人で勝負する決意をした。",
        lines: [{ who: "oyakata", expr: "happy", text: "店は人で回る。いい目の付け所だ。" }] },
      { label: "頭（判断力）で勝負します", effects: { exp: 14, judgment: 2 },
        msg: "頭で勝負する決意をした。",
        lines: [{ who: "oyakata", expr: "happy", text: "目利きと決断か。大将向きだな、お前。" }] },
    ],
  },
  {
    id: "w17_eve", title: "決戦前夜", bg: "street",
    trigger: { type: "week", week: 17 },
    lines: [
      { who: "heroine", expr: "normal", text: "聞いたよ。20週目、ミシュランの調査員が来るんだって？" },
      { who: "me", expr: "worried", text: "ああ…正直、緊張してる。ここまでやってきたことが全部試される。" },
      { who: "heroine", expr: "happy", text: "大丈夫。あなたがどれだけ頑張ってきたか、わたしが一番知ってるもん。" },
    ],
    choices: [
      { label: "「ありがとう。全力でやるよ」", effects: { stress: -15, motivation: 15 },
        msg: "心が軽くなった。",
        lines: [{ who: "me", expr: "fired", text: "（よし…最高の寿司で迎えてやる！）" }] },
      { label: "「終わったら、お祝いしような」", effects: { stress: -10, motivation: 10, comm: 1 },
        msg: "約束ができた。負けられない理由がまた増えた。",
        lines: [{ who: "heroine", expr: "happy", text: "うん！約束ね。…ふふ、楽しみにしてる。" }] },
    ],
  },

  /* ===== コマンド直後イベント ===== */
  {
    id: "heroine_date", title: "休日のお誘い", bg: "street",
    trigger: { type: "after", command: "play", chance: 0.45 },
    lines: [
      { who: "heroine", expr: "happy", text: "あ、ちょうどよかった！ねえ、今日このあと空いてる？" },
      { who: "heroine", expr: "normal", text: "新しくできた甘味処、行ってみたくて。…たまには息抜きも大事でしょ？" },
    ],
    choices: [
      { label: "一緒に行く", effects: { stress: -20, motivation: 20, stamina: 10, comm: 1 },
        msg: "最高の休日。心が満たされた。",
        lines: [
          { who: "sys", text: "あんみつを頬張るさくらの横顔に、日々の疲れが溶けていく——。" },
          { who: "heroine", expr: "happy", text: "また誘うね！次は断っちゃダメだよ？" },
        ] },
      { label: "店の仕込みを優先する", effects: { exp: 14, boss: 3, stress: 6 }, item: "tea",
        msg: "真面目に仕込み。さくらは高級茶葉を置いていってくれた…",
        lines: [
          { who: "heroine", expr: "worried", text: "…そっか。お仕事だもんね。じゃあこれ、差し入れ！無理しないでよ？" },
          { who: "me", expr: "tired", text: "（ごめんな…この埋め合わせは必ず）" },
        ] },
    ],
  },
  {
    id: "rival_recipe", title: "ライバルの新作", bg: "street",
    trigger: { type: "after", command: "menu", chance: 0.35 },
    lines: [
      { who: "rival", expr: "smug", text: "よう、勉強熱心だな。だが知ってるか？うちの新作、行列ができてるぜ。" },
      { who: "me", expr: "surprised", text: "なっ…！（くそ、悔しいけど本当に旨そうだ…）" },
      { who: "rival", expr: "smug", text: "本で覚えた味で、俺に勝てるかな？" },
    ],
    choices: [
      { label: "対抗して新作を作る", effects: { exp: 20, stress: 10, motivation: 10 }, item: "charm",
        msg: "負けじと新作開発！",
        lines: [{ who: "me", expr: "fired", text: "「知識は使ってこそだ。見てろよ、龍二…！」" }] },
      { label: "基礎を固める", effects: { exp: 14, work: 1 }, item: "whetstone",
        msg: "挑発に乗らず、地に足つけて鍛錬。",
        lines: [{ who: "rival", expr: "normal", text: "…ちっ、動じねえか。つまんねえ奴。（だが、そういう奴が一番怖え）" }] },
    ],
  },

  /* ===== 対立軸イベント（大将 vs 同僚） ===== */
  {
    id: "boss_order", title: "大将の無茶な指示", bg: "kitchen",
    trigger: { type: "random", weight: 1.4 },
    lines: [
      { who: "oyakata", expr: "fired", text: "明日から品書きを一新する。今夜中に全部仕込み直せ！" },
      { who: "me", expr: "surprised", text: "（今夜中に！？ 現場はもうクタクタなのに…）" },
      { who: "sys", text: "同僚たちの疲れ切った視線がこちらに集まる。どうする？" },
    ],
    choices: [
      { label: "大将に従う", effects: { exp: 10, boss: 8, coworker: -6, stress: 10 },
        msg: "夜通し仕込んだ。大将は満足げだが、同僚の視線が冷たい…",
        lines: [{ who: "oyakata", expr: "happy", text: "やればできるじゃねえか。…おい、誰だ文句言ってる奴は。" }] },
      { label: "現場を守る", effects: { exp: 8, coworker: 8, boss: -7 },
        msg: "「今夜は無理です」と進言。同僚は感謝してくれたが、大将は不機嫌だ。",
        lines: [{ who: "oyakata", expr: "fired", text: "…チッ。明日の朝までだ。それ以上は待たねえ。" }] },
      { label: "落としどころを探る", check: { stats: ["judgment"] },
        success: { effects: { exp: 12, boss: 5, coworker: 5, judgment: 1, stress: 4 },
          msg: "「主力の品だけ今夜、残りは段階的に」と提案。双方が納得した！",
          lines: [{ who: "oyakata", expr: "happy", text: "ほう…段取りを考えたか。いいだろう、それでいく。" }] },
        fail: { effects: { exp: 4, boss: -4, coworker: -4, stress: 8 },
          msg: "中途半端な提案は両方の不興を買ってしまった…",
          lines: [{ who: "oyakata", expr: "fired", text: "どっちつかずが一番ダメだと言ったろうが！" }] } },
    ],
  },
  {
    id: "busy_rush", title: "突然の団体客", bg: "kitchen",
    trigger: { type: "random", weight: 1.4 },
    lines: [
      { who: "sys", text: "ガラガラガラ！ 予約なしで15名の団体客が入ってきた。" },
      { who: "me", expr: "surprised", text: "じゅ、15名！？ 店が一気に戦場になるぞ…！" },
    ],
    choices: [
      { label: "先頭に立って回す", check: { stats: ["work"] },
        success: { effects: { exp: 20, coworker: 5, boss: 4, customer: 3, stress: 6 },
          msg: "見事な仕事ぶりで店を回しきった！皆の信頼が上がった。",
          lines: [{ who: "sys", text: "気づけば、店中の動きの中心に自分がいた。「ナイス！」と同僚の声が飛ぶ。" }] },
        fail: { effects: { exp: 6, stress: 14, customer: -3 },
          msg: "手が追いつかず大混乱…提供が遅れてしまった。",
          lines: [{ who: "me", expr: "tired", text: "（だめだ、腕が追いつかない…悔しい…！）" }] } },
      { label: "無理せず確実に", effects: { exp: 8, stress: 4, customer: 1 },
        msg: "自分の持ち場を確実にこなした。大過なし、だが評価もそこそこ。" },
    ],
  },
  {
    id: "tough_customer", title: "気難しい常連", bg: "storefront",
    trigger: { type: "random", weight: 1.4 },
    lines: [
      { who: "sys", text: "「…今日のシャリは硬いな」カウンターの常連が、ぼそりと呟いた。" },
      { who: "me", expr: "worried", text: "（周りのお客さんも聞き耳を立ててる…ここの対応で店の印象が決まるぞ）" },
    ],
    choices: [
      { label: "真正面から応対する", check: { stats: ["service"] },
        success: { effects: { exp: 14, customer: 6, service: 1, stress: 4 },
          msg: "丁寧な応対に常連さんも満足。",
          lines: [{ who: "sys", text: "「兄ちゃん、良くなったな」——帰り際の一言が、何より効いた。" }] },
        fail: { effects: { exp: 4, customer: -4, stress: 14 },
          msg: "応対がぎこちなく、気まずい空気に…",
          lines: [{ who: "me", expr: "tired", text: "（言葉が出てこなかった…接客って難しい）" }] } },
      { label: "先輩に任せる", effects: { exp: 2, coworker: -3, stress: 1 },
        msg: "先輩が収めてくれた。ただ「またか」という顔をされた。" },
    ],
  },
  {
    id: "daily_special", title: "日替わりの判断", bg: "kitchen",
    trigger: { type: "random", weight: 1.4 },
    lines: [
      { who: "sys", text: "仕入れで余った鯵。今日の日替わりは自分に任された。" },
      { who: "me", expr: "normal", text: "（無難に塩焼きか…それとも、攻めるか…）" },
    ],
    choices: [
      { label: "攻めた創作で出す", check: { stats: ["judgment"] },
        success: { effects: { exp: 16, customer: 5, judgment: 1, boss: 3 },
          msg: "炙りと薬味の一工夫が大当たり！完売した。",
          lines: [{ who: "oyakata", expr: "happy", text: "ほう、鯵をこう使うか。…覚えておこう。" }] },
        fail: { effects: { exp: 5, customer: -4, boss: -3, stress: 8 },
          msg: "狙いすぎて客の反応はいまひとつ…",
          lines: [{ who: "me", expr: "tired", text: "（攻めるなら、根拠が要る。勉強不足だ…）" }] } },
      { label: "無難な塩焼きで出す", effects: { exp: 6, customer: 1 },
        msg: "手堅くさばいた。悪くない、でも記憶にも残らない。" },
    ],
  },

  /* ===== 関係性イベント（評価で発生が変わる） ===== */
  {
    id: "support_help", title: "同僚の助け舟", bg: "kitchen",
    trigger: { type: "random", weight: 2.5, cond: { coworkerMin: 60 } },
    lines: [
      { who: "sys", text: "仕込みの山を前に腕まくりをしたら、横からひょいと笊を取られた。" },
      { who: "sys", text: "「お前最近頑張ってるからさ。ここは俺らがやっとくよ」" },
      { who: "me", expr: "surprised", text: "えっ、いいんですか…！？" },
    ],
    choices: [
      { label: "甘えて休ませてもらう", effects: { stamina: 25, stress: -10, motivation: 8 },
        msg: "持つべきものは仲間。心も体も軽くなった。" },
      { label: "一緒に仕込みをする", effects: { exp: 14, coworker: 4, stress: 4 },
        msg: "並んで仕込み。腕も絆も深まった。",
        lines: [{ who: "sys", text: "くだらない話で笑いながら手を動かす。仕事が、少しだけ好きになる夜。" }] },
    ],
  },
  {
    id: "isolation", title: "輪に入れない", bg: "room",
    trigger: { type: "random", weight: 2.5, cond: { coworkerMax: 30 } },
    lines: [
      { who: "sys", text: "休憩室から笑い声が漏れている。扉を開けると——少しだけ、空気が変わった気がした。" },
      { who: "me", expr: "tired", text: "（…気のせいだ。気のせいだと思いたい）" },
    ],
    choices: [
      { label: "一人で黙々とやる", effects: { exp: 8, stress: 12, motivation: -6 },
        msg: "仕事に逃げた。腕は鈍らないが、心は重い。" },
      { label: "勇気を出して話しかける", check: { stats: ["comm"] },
        success: { effects: { exp: 6, coworker: 8, comm: 1, stress: -4 },
          msg: "意外なほど普通に受け入れてくれた。一歩前進！",
          lines: [{ who: "sys", text: "「お、来た来た。お前もこれ食う？」——なんだ、考えすぎだったのか。" }] },
        fail: { effects: { exp: 2, stress: 10, motivation: -4 },
          msg: "会話が続かず、余計に気まずくなってしまった…",
          lines: [{ who: "me", expr: "tired", text: "（うう…明日からどんな顔すればいいんだ…）" }] } },
    ],
  },
  {
    id: "boss_favor", title: "大将の計らい", bg: "kitchen",
    trigger: { type: "random", weight: 2.5, cond: { bossMin: 60 } },
    lines: [
      { who: "oyakata", expr: "happy", text: "おい、こっち来い。…ほら、大トロの賄いだ。お前は見込みがある。" },
      { who: "me", expr: "surprised", text: "（お、大トロ…！でも、みんなの視線が…）" },
    ],
    choices: [
      { label: "ありがたく頂く", effects: { stamina: 18, motivation: 10, exp: 8, coworker: -2 },
        msg: "美味い…！ただ、同僚のやっかみが少し聞こえた気もする。" },
      { label: "皆に分ける", effects: { exp: 6, coworker: 6, boss: 1 },
        msg: "賄いを切り分けた。「気が利くな」と場が和んだ。",
        lines: [{ who: "oyakata", expr: "normal", text: "…ふん、そういう奴か。悪くねえ。" }] },
    ],
  },
  {
    id: "unreasonable", title: "理不尽な叱責", bg: "kitchen",
    trigger: { type: "random", weight: 2.5, cond: { bossMax: 30 } },
    lines: [
      { who: "oyakata", expr: "fired", text: "おい！この発注ミスはなんだ！お前がやったんだろう！" },
      { who: "me", expr: "surprised", text: "（違う…これは自分のミスじゃない。でも、評価が低い今、誰も庇ってくれない…）" },
    ],
    choices: [
      { label: "ぐっとこらえる", effects: { exp: 4, stress: 18, motivation: -8 },
        msg: "黙って頭を下げた。胸の奥に何かが溜まっていく…（メンタルが高ければ軽く流せる）" },
      { label: "筋を通して言い返す", effects: { exp: 6, boss: -6, coworker: 4, stress: 8 },
        msg: "事実を伝えた。大将はさらに不機嫌だが、同僚は内心スッとしたようだ。",
        lines: [{ who: "oyakata", expr: "fired", text: "…口答えする暇があったら手を動かせ！" }] },
    ],
  },
  {
    id: "shift_hole", title: "シフトの穴埋め", bg: "room",
    trigger: { type: "random", weight: 1.2 },
    lines: [
      { who: "sys", text: "「急で悪いんだけど…明日も出られない？」急病の同僚の代わりを頼まれた。" },
      { who: "me", expr: "worried", text: "（連勤はキツい…でも、ここで貸しを作っておくのも…）" },
    ],
    choices: [
      { label: "引き受ける", effects: { exp: 10, boss: 4, coworker: 3, stamina: -18, stress: 8 },
        msg: "連勤はキツい。でも貸しひとつ、信頼ふたつ。" },
      { label: "今回は断る", effects: { boss: -3, motivation: 4, stress: -2 },
        msg: "自分を守った。少しの罪悪感と、確かな休息。" },
    ],
  },

  /* ===== 汎用イベント ===== */
  {
    id: "morning_market", title: "豊洲市場へ早朝買い出し", bg: "street",
    trigger: { type: "random" },
    lines: [
      { who: "sys", text: "夜明け前。兄弟子からの連絡——「いい本マグロが入ってる。来るか？」" },
      { who: "me", expr: "tired", text: "（眠い…でも、本物を見るチャンスだ…）" },
    ],
    choices: [
      { label: "気合いで行く！", effects: { exp: 22, judgment: 1, stamina: -20, stress: 6 },
        msg: "最高のネタを見極めた！目利きの経験は財産だ。",
        lines: [{ who: "sys", text: "セリ場の熱気、職人たちの目。教科書では学べないものが、そこにあった。" }] },
      { label: "睡眠を優先", effects: { stamina: 10, stress: -4 },
        msg: "しっかり休んだ。それも仕事のうち。" },
    ],
  },
  {
    id: "knife_training", title: "深夜の包丁研ぎ", bg: "kitchen",
    trigger: { type: "random" },
    lines: [
      { who: "sys", text: "閉店後の厨房。静寂の中、砥石と包丁だけが残っている。" },
      { who: "me", expr: "normal", text: "（今日の切れ味、少し納得がいかなかったな…）" },
    ],
    choices: [
      { label: "納得いくまで研ぐ", effects: { exp: 20, work: 1, stamina: -15, stress: 6 },
        msg: "切れ味が冴えた。明日の仕事が楽しみだ。" },
      { label: "今日はもう帰る", effects: { stamina: 8, stress: -3 },
        msg: "英気を養った。" },
    ],
  },
  {
    id: "food_show", title: "グルメ番組の取材", bg: "storefront",
    trigger: { type: "random" },
    lines: [
      { who: "sys", text: "「テレビ局の者ですが、お店を取材させていただけませんか」" },
      { who: "me", expr: "surprised", text: "（テレビ！？ 緊張で手が震えてきた…）" },
    ],
    choices: [
      { label: "堂々と対応する", effects: { exp: 18, customer: 5, boss: 4, stress: 8 },
        msg: "店の看板として喋り切った！放送が楽しみだ。" },
      { label: "裏方に徹する", effects: { exp: 12, work: 1, coworker: 2 },
        msg: "黙々と現場を支えた。同僚は見ていてくれた。" },
    ],
  },
  {
    id: "slump", title: "スランプ…", bg: "room",
    trigger: { type: "random" },
    lines: [
      { who: "me", expr: "tired", text: "（最近どうも、握りがしっくりこない…）" },
      { who: "sys", text: "基本に立ち返るべきか、それとも一度離れてみるべきか。" },
    ],
    choices: [
      { label: "ひたすら反復練習", effects: { exp: 12, work: 1, stamina: -10, stress: 8 },
        msg: "地道に克服。遠回りが一番の近道。" },
      { label: "思い切ってリフレッシュ", effects: { stamina: 20, stress: -12, motivation: 8 },
        msg: "気分一新！肩の力が抜けた。" },
    ],
  },
  {
    id: "heroine_visit", title: "さくらの差し入れ", bg: "storefront",
    trigger: { type: "random" },
    lines: [
      { who: "heroine", expr: "happy", text: "おつかれさま！はい、これ作ってきたよ。…ちゃんと食べてる？" },
      { who: "me", expr: "happy", text: "さくら！わざわざ来てくれたのか。" },
    ],
    choices: [
      { label: "ありがたく受け取る", effects: { stamina: 20, stress: -10, motivation: 8 }, item: "bento",
        msg: "差し入れに元気百倍！（特製まかない を入手）" },
      { label: "少し一緒に休む", effects: { stamina: 25, stress: -14, motivation: 12 },
        msg: "たわいない話で笑った。こういう時間が明日の力になる。",
        lines: [{ who: "heroine", expr: "happy", text: "ふふ、その顔。ちょっとは元気出たみたいだね。" }] },
    ],
  },
  {
    id: "rival_challenge", title: "ライバル登場", bg: "street",
    trigger: { type: "random" },
    lines: [
      { who: "rival", expr: "smug", text: "お前が向かいの店の新入りか。…ふうん、大した面構えじゃねえな。" },
      { who: "me", expr: "surprised", text: "（向かいの店の若大将、龍二…！）" },
      { who: "rival", expr: "smug", text: "お前の握り、見せてもらおうか。それとも、逃げるか？" },
    ],
    choices: [
      { label: "勝負を受ける！", effects: { exp: 24, work: 1, stress: 8, motivation: 8 },
        msg: "火花散る対決！負けられない戦いが人を伸ばす。",
        lines: [{ who: "rival", expr: "normal", text: "…へえ。思ったよりやるじゃねえか。次は負けねえぞ。" }] },
      { label: "技を盗む", effects: { exp: 16, judgment: 1 },
        msg: "冷静に観察した。悔しいが、奴の仕事は確かだ。" },
    ],
  },

  /* ===== ポジション専用イベント ===== */
  {
    id: "shok_oyakata", title: "大将直伝・握りの極意", bg: "kitchen",
    trigger: { type: "random", pos: "shokunin" },
    lines: [
      { who: "oyakata", expr: "normal", text: "ええか、シャリは赤子を包むように握れ。力じゃねえ、呼吸だ。" },
      { who: "me", expr: "fired", text: "（大将が直々に…！一言も聞き逃せない）" },
    ],
    choices: [
      { label: "とことん教わる", effects: { exp: 30, stamina: -12, boss: 4, stress: 6 },
        msg: "握りの極意を会得！大将との距離も縮まった。" },
      { label: "見て盗む", effects: { exp: 16, judgment: 1 },
        msg: "目で盗んだ。考える力がついた。" },
    ],
  },
  {
    id: "shok_creative", title: "創作寿司の構想", bg: "room",
    trigger: { type: "random", pos: "shokunin" },
    lines: [
      { who: "me", expr: "fired", text: "（…ひらめいた！この組み合わせ、絶対に旨い…！）" },
      { who: "sys", text: "深夜。新しい握りのアイデアが頭から離れない。" },
    ],
    choices: [
      { label: "朝まで試作する", effects: { exp: 26, stamina: -18, stress: 8, customer: 3 }, item: "charm",
        msg: "新作が完成！（お守り を入手）" },
      { label: "メモして寝る", effects: { exp: 10, stamina: 8 },
        msg: "アイデアは温存。健康も大事。" },
    ],
  },
  {
    id: "kit_rush", title: "仕込みの山", bg: "kitchen",
    trigger: { type: "random", pos: "kitchen" },
    lines: [
      { who: "sys", text: "明日の仕込みリストを見て、思わず天を仰いだ。多い。多すぎる。" },
      { who: "me", expr: "tired", text: "（徹夜コースか…？いや、やり方次第か…）" },
    ],
    choices: [
      { label: "一気に片付ける", effects: { exp: 28, stamina: -20, stress: 10, coworker: 5 },
        msg: "全部やり切った！朝、同僚が驚いていた。" },
      { label: "要点だけ手早く", effects: { exp: 15, stamina: -6 },
        msg: "効率重視で切り上げた。" },
    ],
  },
  {
    id: "kit_fry", title: "揚げ場の極意", bg: "kitchen",
    trigger: { type: "random", pos: "kitchen" },
    lines: [
      { who: "oyakata", expr: "happy", text: "天ぷらってのは、音で揚げるんだ。耳を澄ませてみろ。" },
      { who: "me", expr: "surprised", text: "（音…！たしかに、泡の音が変わる瞬間がある…）" },
    ],
    choices: [
      { label: "火加減を体で覚える", effects: { exp: 26, stamina: -10, work: 1, boss: 3 }, item: "whetstone",
        msg: "揚げの感覚を掴んだ！（砥石 を入手）" },
      { label: "レシピで覚える", effects: { exp: 15, judgment: 1 },
        msg: "理屈で理解した。" },
    ],
  },
  {
    id: "flo_regular", title: "常連さんとの会話", bg: "storefront",
    trigger: { type: "random", pos: "floor" },
    lines: [
      { who: "sys", text: "「姉ちゃん、ちょっと聞いてよ」常連の旦那衆が上機嫌で手招きしている。" },
      { who: "me", expr: "happy", text: "（よし、ここは聞き上手の見せ場…！）" },
    ],
    choices: [
      { label: "笑顔で聞き役に", effects: { exp: 24, stamina: -6, customer: 5, comm: 1 },
        msg: "場が和んだ！「あんたがいると楽しいよ」" },
      { label: "さりげなく注文を促す", effects: { exp: 14, customer: 2, boss: 2 }, item: "tea",
        msg: "商売上手。（高級茶葉 を入手）" },
    ],
  },
  {
    id: "flo_complaint", title: "本物のクレーム", bg: "storefront",
    trigger: { type: "random", pos: "floor" },
    lines: [
      { who: "sys", text: "「いつまで待たせるんだ！」——お客さんの声が店内に響いた。" },
      { who: "me", expr: "worried", text: "（来た…訓練の成果を見せるとき…！）" },
    ],
    choices: [
      { label: "誠心誠意あやまる", check: { stats: ["service", "mental"], statDiv: 220 },
        success: { effects: { exp: 22, customer: 5, mental: 1 },
          msg: "落ち着いた応対で、最後は笑顔で帰っていただけた。",
          lines: [{ who: "sys", text: "「…まあ、あんたの顔に免じて許すよ」良かった、伝わった。" }] },
        fail: { effects: { exp: 6, customer: -3, stress: 12 },
          msg: "声が震えてしまった…悔しい。" } },
      { label: "一品サービスする", effects: { exp: 12, customer: 3, boss: -2 },
        msg: "機転で収めた。原価には大将が渋い顔。" },
    ],
  },
  {
    id: "mgr_books", title: "帳簿とにらめっこ", bg: "room",
    trigger: { type: "random", pos: "manager" },
    lines: [
      { who: "me", expr: "normal", text: "（今月の売上と原価…ふむ、この曜日だけ廃棄が多いな…）" },
      { who: "sys", text: "数字の向こうに、店の姿が見えてくる。" },
    ],
    choices: [
      { label: "徹底的に分析する", effects: { exp: 28, stamina: -10, judgment: 1, boss: 4, stress: 8 },
        msg: "経営感覚が磨かれた！大将も数字に唸った。" },
      { label: "要点だけ確認", effects: { exp: 15 },
        msg: "効率よく把握。" },
    ],
  },
  {
    id: "mgr_staff", title: "スタッフ面談", bg: "room",
    trigger: { type: "random", pos: "manager" },
    lines: [
      { who: "sys", text: "若いスタッフが、最近ずっと浮かない顔をしている。" },
      { who: "me", expr: "worried", text: "（声をかけるべきか…でも踏み込みすぎるのも…）" },
    ],
    choices: [
      { label: "じっくり向き合う", effects: { exp: 24, stamina: -6, coworker: 6, comm: 1 }, item: "charm",
        msg: "信頼が深まった。（お守り を入手）" },
      { label: "励まして送り出す", effects: { exp: 13, coworker: 3 },
        msg: "前向きに送り出した。" },
    ],
  },
];
