/* =========================================================================
 * 鮨サクセス — 会話イベント定義（ADV形式）
 *
 * 構造は types/types.js の AdvEvent を参照。
 * - trigger.type: week（指定週に必ず）/ after（コマンド直後に確率）/ random（週次抽選）
 * - lines: 導入会話（クリック送り）。choices: トレードオフ選択肢。
 * - 選択肢の結果にも lines（結果会話）を付けられる。effects はその後に反映。
 * - 大将評価と同僚評価の対立軸・判定（成功率表示）は従来どおり。
 *
 * 【演出方針】パワプロ風の「小芝居」。
 *   導入 = 状況提示→主人公の心の声で引き込む。
 *   結果 = 選択→周囲のリアクション→感情の起伏→主人公の心の声で締め（時に伏線）。
 *   ※ effects/check/item/trigger/msg 等のゲーム数値は演出強化の前後で不変。
 * ========================================================================= */

const EVENTS = [

  /* ===== 固定週イベント（物語の節目） ===== */
  {
    id: "w2_orientation", title: "大将の心得", bg: "kitchen",
    trigger: { type: "week", week: 2 },
    lines: [
      { who: "oyakata", expr: "normal", text: "おう、少しは店に慣れたか。…手だけは動くようになってきたな。" },
      { who: "me", expr: "normal", text: "（は、はい。まだ皿洗いと仕込みばかりですけど…）" },
      { who: "oyakata", expr: "normal", text: "ひとつだけ言っておく。よく聞け。" },
      { who: "oyakata", expr: "fired",  text: "腕・人・客。どれを取るかはお前の生き方だ。全部取れるほど、この世界は甘くねえ。" },
      { who: "me", expr: "surprised", text: "（腕を磨くか、仲間と繋がるか、お客さんに尽くすか…ってことか）" },
      { who: "me", expr: "worried", text: "（でも、ここで答えを口にしたら…もう後戻りできない気がする）" },
    ],
    choices: [
      { label: "「全部、追いかけてみせます！」",
        effects: { exp: 10, motivation: 8, stress: 4 },
        msg: "大将は鼻で笑ったが、目は笑っていた。",
        lines: [
          { who: "oyakata", expr: "surprised", text: "…ハッ。" },
          { who: "oyakata", expr: "happy", text: "言うじゃねえか。青臭え。だが、嫌いじゃねえ答えだ。" },
          { who: "sys", text: "大将は鼻で笑った。でも、その目だけは笑っていなかった——まるで、昔の誰かを見るように。" },
          { who: "me", expr: "fired", text: "（見ててください。欲張りだって、貫き通せば本物になる）" },
        ] },
      { label: "「まずは目の前の仕事からやります」",
        effects: { exp: 8, boss: 4 },
        msg: "地に足のついた答えに、大将は静かに頷いた。",
        lines: [
          { who: "oyakata", expr: "normal", text: "…それでいい。背伸びした奴から潰れていくんだ。" },
          { who: "oyakata", expr: "normal", text: "足元の一皿を、毎日きっちり積み上げろ。気づいたら遠くまで来てる。それが仕事だ。" },
          { who: "me", expr: "normal", text: "（地味だ。でも、この人が言うと不思議と重い。…まずは一歩ずつ、だな）" },
        ] },
    ],
  },
  {
    id: "w9_midterm", title: "中間評価", bg: "kitchen",
    trigger: { type: "week", week: 9 },
    lines: [
      { who: "oyakata", expr: "normal", text: "折り返しだ。お前の働き、ずっと見てたぞ。" },
      { who: "me", expr: "worried", text: "（ご、ごくり…半分が過ぎた。自分はちゃんと、前に進めてるんだろうか）" },
      { who: "oyakata", expr: "normal", text: "悪かねえ。だが、このままじゃ「そこそこ」止まりだ。" },
      { who: "oyakata", expr: "fired", text: "ここから先は、自分の「武器」を決めて磨け。器用貧乏が一番半端だ。" },
      { who: "me", expr: "surprised", text: "（武器…自分の、一番の強み。…何で勝負する？）" },
    ],
    choices: [
      { label: "腕（作業力）で勝負します", effects: { exp: 14, work: 2 },
        msg: "腕に磨きをかける決意をした。",
        lines: [
          { who: "oyakata", expr: "happy", text: "職人の答えだ。なら、誰よりも早く正確にな。" },
          { who: "oyakata", expr: "normal", text: "腕は裏切らねえ。お前が寝てる間も、積んだ分だけ確かに残る。" },
          { who: "me", expr: "fired", text: "（この手を、誰にも文句を言わせない武器にする。…やってやる）" },
        ] },
      { label: "人（接客・コミュ）で勝負します", effects: { exp: 14, service: 1, comm: 1 },
        msg: "人で勝負する決意をした。",
        lines: [
          { who: "oyakata", expr: "happy", text: "店は人で回る。いい目の付け所だ。" },
          { who: "oyakata", expr: "normal", text: "客も仲間も、結局は「また会いてえ」と思わせた奴が勝つ。…難しいぞ、それは。" },
          { who: "me", expr: "happy", text: "（人の心は数字にならない。でも、そこでなら自分は戦える気がする）" },
        ] },
      { label: "頭（判断力）で勝負します", effects: { exp: 14, judgment: 2 },
        msg: "頭で勝負する決意をした。",
        lines: [
          { who: "oyakata", expr: "happy", text: "目利きと決断か。大将向きだな、お前。" },
          { who: "oyakata", expr: "normal", text: "現場で一番偉えのは、声のでかい奴じゃねえ。正しく決められる奴だ。" },
          { who: "me", expr: "normal", text: "（一手先を読む。…地味だけど、この店を一番遠くから見られる武器だ）" },
        ] },
    ],
  },
  {
    id: "w17_eve", title: "決戦前夜", bg: "street",
    trigger: { type: "week", week: 17 },
    lines: [
      { who: "heroine", expr: "normal", text: "聞いたよ。20週目、ミシュランの調査員が来るんだって？" },
      { who: "me", expr: "worried", text: "ああ…正直、緊張してる。ここまでやってきたことが全部試される。" },
      { who: "me", expr: "tired", text: "もし、ダメだったら…って考えると、夜もうまく眠れなくてさ。" },
      { who: "heroine", expr: "normal", text: "…ねえ。覚えてる？ あなたがこの店に入った日のこと。" },
      { who: "heroine", expr: "happy", text: "大丈夫。あなたがどれだけ頑張ってきたか、わたしが一番知ってるもん。" },
    ],
    choices: [
      { label: "「ありがとう。全力でやるよ」", effects: { stress: -15, motivation: 15 },
        msg: "心が軽くなった。",
        lines: [
          { who: "me", expr: "happy", text: "…そうだな。お前がそう言ってくれるなら、もう迷わない。" },
          { who: "heroine", expr: "happy", text: "うん。あなたの握り、世界で一番だってこと、その調査員に教えてあげなよ。" },
          { who: "sys", text: "夜風が、二人の間を静かに抜けていく。重かった肩の力が、ふっと抜けた。" },
          { who: "me", expr: "fired", text: "（よし…最高の寿司で迎えてやる！）" },
        ] },
      { label: "「終わったら、お祝いしような」", effects: { stress: -10, motivation: 10, comm: 1 },
        msg: "約束ができた。負けられない理由がまた増えた。",
        lines: [
          { who: "me", expr: "normal", text: "全部終わったら…二人でうまいもん食いに行こう。寿司以外な。" },
          { who: "heroine", expr: "surprised", text: "ふふっ、職人さんがそれ言う？" },
          { who: "heroine", expr: "happy", text: "うん！約束ね。…ふふ、楽しみにしてる。" },
          { who: "me", expr: "fired", text: "（約束しちまった。…負けられない理由が、また一つ増えた）" },
        ] },
    ],
  },

  /* ===== コマンド直後イベント ===== */
  {
    id: "heroine_date", title: "休日のお誘い", bg: "street",
    trigger: { type: "after", command: "play", chance: 0.45 },
    lines: [
      { who: "heroine", expr: "happy", text: "あ、ちょうどよかった！ねえ、今日このあと空いてる？" },
      { who: "me", expr: "surprised", text: "（さくら…！ 今日は店も休みだし、予定もないけど…）" },
      { who: "heroine", expr: "normal", text: "新しくできた甘味処、行ってみたくて。…たまには息抜きも大事でしょ？" },
      { who: "heroine", expr: "worried", text: "あ、でも、疲れてたら無理しないでね。最近ずっと根詰めてたみたいだから…。" },
    ],
    choices: [
      { label: "一緒に行く", effects: { stress: -20, motivation: 20, stamina: 10, comm: 1 },
        msg: "最高の休日。心が満たされた。",
        lines: [
          { who: "sys", text: "暖簾をくぐった小さな甘味処。あんみつを頬張るさくらの横顔に、日々の疲れが溶けていく——。" },
          { who: "me", expr: "happy", text: "（仕事の話を、一つもしなかったな。…こういう時間が、必要だったんだ）" },
          { who: "heroine", expr: "happy", text: "ね、楽しかったでしょ？ また誘うね！次は断っちゃダメだよ？" },
          { who: "me", expr: "happy", text: "（ああ。…次は、こっちから誘うよ）" },
        ] },
      { label: "店の仕込みを優先する", effects: { exp: 14, boss: 3, stress: 6 }, item: "tea",
        msg: "真面目に仕込み。さくらは高級茶葉を置いていってくれた…",
        lines: [
          { who: "me", expr: "worried", text: "ごめん…明日の仕込み、まだ残ってて。今行かないと、店に迷惑が…。" },
          { who: "heroine", expr: "worried", text: "…そっか。お仕事だもんね。" },
          { who: "sys", text: "さくらは少しだけ寂しそうに笑って、小さな包みを差し出した。" },
          { who: "heroine", expr: "normal", text: "じゃあこれ、差し入れ！いいお茶だよ。…無理しないでよ？" },
          { who: "me", expr: "tired", text: "（ごめんな…この埋め合わせは、必ず）" },
        ] },
    ],
  },
  {
    id: "rival_recipe", title: "ライバルの新作", bg: "street",
    trigger: { type: "after", command: "menu", chance: 0.35 },
    lines: [
      { who: "rival", expr: "smug", text: "よう、勉強熱心だな。本とにらめっこか？" },
      { who: "me", expr: "surprised", text: "（龍二…！ 向かいの店の若大将だ）" },
      { who: "rival", expr: "smug", text: "だが知ってるか？うちの新作、行列ができてるぜ。" },
      { who: "me", expr: "worried", text: "なっ…！（くそ、悔しいけど…匂いだけで分かる。本当に旨そうだ）" },
      { who: "rival", expr: "smug", text: "本で覚えた味で、俺に勝てるかな？" },
    ],
    choices: [
      { label: "対抗して新作を作る", effects: { exp: 20, stress: 10, motivation: 10 }, item: "charm",
        msg: "負けじと新作開発！",
        lines: [
          { who: "me", expr: "fired", text: "「知識は使ってこそだ。…見てろよ、龍二」" },
          { who: "sys", text: "その夜、店の灯りは遅くまで消えなかった。試作、廃棄、また試作。気づけば窓の外が白んでいた。" },
          { who: "me", expr: "happy", text: "（できた…！ これなら、あいつの行列に割って入れる）" },
          { who: "sys", text: "ふと、ポケットの中のお守りに手が触れた。…誰かが、そっと忍ばせてくれていたらしい。" },
        ] },
      { label: "基礎を固める", effects: { exp: 14, work: 1 }, item: "whetstone",
        msg: "挑発に乗らず、地に足つけて鍛錬。",
        lines: [
          { who: "me", expr: "normal", text: "（…乗らない。今のおれが勝負すべきは、龍二じゃなくて昨日の自分だ）" },
          { who: "sys", text: "黙々と包丁を研ぎ、基本の一手を繰り返す。派手さはない。だが、確かな手応えが指に残る。" },
          { who: "rival", expr: "normal", text: "…ちっ、動じねえか。つまんねえ奴。" },
          { who: "rival", expr: "smug", text: "（だが…そういう奴が、一番怖えんだよな）" },
        ] },
    ],
  },

  /* ===== 対立軸イベント（大将 vs 同僚） ===== */
  {
    id: "boss_order", title: "大将の無茶な指示", bg: "kitchen",
    trigger: { type: "random", weight: 1.4 },
    lines: [
      { who: "oyakata", expr: "fired", text: "明日から品書きを一新する。今夜中に全部仕込み直せ！" },
      { who: "me", expr: "surprised", text: "（今夜中に！？ 現場はもうクタクタなのに…）" },
      { who: "sys", text: "壁の時計はもう夜の十時を回っている。同僚たちの疲れ切った視線が、こちらに集まる。" },
      { who: "sys", text: "「…どうする？」誰かの押し殺した声が聞こえた気がした。この一言で、明日からの空気が決まる。" },
    ],
    choices: [
      { label: "大将に従う", effects: { exp: 10, boss: 8, coworker: -6, stress: 10 },
        msg: "夜通し仕込んだ。大将は満足げだが、同僚の視線が冷たい…",
        lines: [
          { who: "sys", text: "仲間が一人、また一人と帰っていく。厨房に残ったのは、自分と山のような仕込みだけ。" },
          { who: "me", expr: "tired", text: "（腕が鉛みたいだ…でも、ここでやめたら、今までの何が残る）" },
          { who: "oyakata", expr: "happy", text: "…まだやってたのか。やればできるじゃねえか。おい、誰だ文句言ってる奴は。" },
          { who: "me", expr: "worried", text: "（認められた。…でも、背中に刺さる仲間の視線も、本物だ）" },
        ] },
      { label: "現場を守る", effects: { exp: 8, coworker: 8, boss: -7 },
        msg: "「今夜は無理です」と進言。同僚は感謝してくれたが、大将は不機嫌だ。",
        lines: [
          { who: "me", expr: "fired", text: "「大将。今夜は無理です。みんな限界だ。…明日、必ず仕上げます」" },
          { who: "oyakata", expr: "fired", text: "…チッ。明日の朝までだ。それ以上は待たねえ。" },
          { who: "sys", text: "大将が奥へ消えると、隣の先輩がそっと肩を叩いた。「…助かった。お前、見直したよ」" },
          { who: "me", expr: "normal", text: "（大将には睨まれた。でも、守るべきものを守れた。…後悔はしてない）" },
        ] },
      { label: "落としどころを探る", check: { stats: ["judgment"] },
        success: { effects: { exp: 12, boss: 5, coworker: 5, judgment: 1, stress: 4 },
          msg: "「主力の品だけ今夜、残りは段階的に」と提案。双方が納得した！",
          lines: [
            { who: "me", expr: "normal", text: "「大将。看板の品だけ今夜仕上げます。残りは三日かけて段階的に。…それなら、質も落ちません」" },
            { who: "oyakata", expr: "surprised", text: "ほう…?" },
            { who: "oyakata", expr: "happy", text: "段取りを考えたか。いいだろう、それでいく。" },
            { who: "sys", text: "同僚たちの強張った肩から、力が抜けるのが分かった。「…お前、頭いいな」と誰かが笑う。" },
            { who: "me", expr: "happy", text: "（両方を立てる道は、ちゃんとあった。…見つけられて、よかった）" },
          ] },
        fail: { effects: { exp: 4, boss: -4, coworker: -4, stress: 8 },
          msg: "中途半端な提案は両方の不興を買ってしまった…",
          lines: [
            { who: "me", expr: "worried", text: "「えっと…半分くらい、今夜やる、とか…？」" },
            { who: "oyakata", expr: "fired", text: "どっちつかずが一番ダメだと言ったろうが！" },
            { who: "sys", text: "仲間たちも気まずそうに目を逸らす。誰も得をしない、宙ぶらりんの空気だけが残った。" },
            { who: "me", expr: "tired", text: "（中途半端だった…。落としどころには、根拠がいる。勉強し直しだ）" },
          ] } },
    ],
  },
  {
    id: "busy_rush", title: "突然の団体客", bg: "kitchen",
    trigger: { type: "random", weight: 1.4 },
    lines: [
      { who: "sys", text: "ガラガラガラ！ 予約なしで15名の団体客が、どっと店になだれ込んできた。" },
      { who: "me", expr: "surprised", text: "じゅ、15名！？ 店が一気に戦場になるぞ…！" },
      { who: "sys", text: "厨房に緊張が走る。注文票が次々と突き刺さっていく。誰かが動かなければ、店が止まる。" },
    ],
    choices: [
      { label: "先頭に立って回す", check: { stats: ["work"] },
        success: { effects: { exp: 20, coworker: 5, boss: 4, customer: 3, stress: 6 },
          msg: "見事な仕事ぶりで店を回しきった！皆の信頼が上がった。",
          lines: [
            { who: "me", expr: "fired", text: "「おれが捌く！ シャリ追加、ネタ切らさないで！ いける、いけるぞ…！」" },
            { who: "sys", text: "手が、考えるより先に動いていた。注文票が一枚、また一枚と消えていく。気づけば、店中の動きの中心に自分がいた。" },
            { who: "sys", text: "嵐が去り、最後の客を見送ると——「ナイス！」と同僚の声が飛んだ。誰からともなく、小さな拍手が起きる。" },
            { who: "me", expr: "happy", text: "（…やれた。修行は、ちゃんと身になってた）" },
          ] },
        fail: { effects: { exp: 6, stress: 14, customer: -3 },
          msg: "手が追いつかず大混乱…提供が遅れてしまった。",
          lines: [
            { who: "me", expr: "surprised", text: "「ま、待って、今やります…！ えっと、どの注文から…！？」" },
            { who: "sys", text: "焦るほど手元が狂う。注文票が溜まり、客席から「まだか」の声。厨房の空気が、じりじりと焦げついていく。" },
            { who: "me", expr: "tired", text: "（だめだ、腕が追いつかない…悔しい…！）" },
            { who: "me", expr: "tired", text: "（実力が、足りなかった。…この悔しさ、忘れるな）" },
          ] } },
      { label: "無理せず確実に", effects: { exp: 8, stress: 4, customer: 1 },
        msg: "自分の持ち場を確実にこなした。大過なし、だが評価もそこそこ。",
        lines: [
          { who: "me", expr: "normal", text: "（背伸びはしない。自分の持ち場を、一つずつ確実に）" },
          { who: "sys", text: "派手な活躍はなかった。だが、自分の担当だけは一つもミスらず捌き切った。" },
          { who: "me", expr: "normal", text: "（無難。…でも、いつか先頭で回せる日まで、確実に積み上げるしかない）" },
        ] },
    ],
  },
  {
    id: "tough_customer", title: "気難しい常連", bg: "storefront",
    trigger: { type: "random", weight: 1.4 },
    lines: [
      { who: "sys", text: "「…今日のシャリは硬いな」カウンターの常連が、箸を置いてぼそりと呟いた。" },
      { who: "me", expr: "worried", text: "（うっ…この人、味にうるさいので有名な…！）" },
      { who: "sys", text: "周りの客もそっと聞き耳を立てている。空気が、ぴりっと張りつめた。ここの対応で、店の印象が決まる。" },
    ],
    choices: [
      { label: "真正面から応対する", check: { stats: ["service"] },
        success: { effects: { exp: 14, customer: 6, service: 1, stress: 4 },
          msg: "丁寧な応対に常連さんも満足。",
          lines: [
            { who: "me", expr: "normal", text: "「申し訳ありません。…今日は少し気温が高くて、米の締め加減を迷いました。次は必ず」" },
            { who: "sys", text: "言い訳ではなく、まっすぐな言葉。常連は少し驚いたように顔を上げ、ふっと表情を緩めた。" },
            { who: "sys", text: "「兄ちゃん、良くなったな」——帰り際の、ぶっきらぼうな一言が、何より効いた。" },
            { who: "me", expr: "happy", text: "（逃げなくて、よかった。…厳しい人ほど、見ててくれてるんだ）" },
          ] },
        fail: { effects: { exp: 4, customer: -4, stress: 14 },
          msg: "応対がぎこちなく、気まずい空気に…",
          lines: [
            { who: "me", expr: "worried", text: "「あっ、えっと、その、すみません…！ 次は、その…」" },
            { who: "sys", text: "うまく言葉が出てこない。常連は小さくため息をつき、黙って勘定を済ませて店を出ていった。" },
            { who: "me", expr: "tired", text: "（言葉が出てこなかった…接客って、こんなに難しいのか）" },
          ] } },
      { label: "先輩に任せる", effects: { exp: 2, coworker: -3, stress: 1 },
        msg: "先輩が収めてくれた。ただ「またか」という顔をされた。",
        lines: [
          { who: "me", expr: "worried", text: "（…自分には荷が重い。先輩、お願いします）" },
          { who: "sys", text: "先輩がさっと割って入り、慣れた様子で常連をなだめていく。さすがの手際だ。" },
          { who: "sys", text: "事が済んだあと、先輩は何も言わなかった。ただ「またか」という顔だけが、胸に残った。" },
          { who: "me", expr: "tired", text: "（…いつまで、人に頼るんだ。自分は）" },
        ] },
    ],
  },
  {
    id: "daily_special", title: "日替わりの判断", bg: "kitchen",
    trigger: { type: "random", weight: 1.4 },
    lines: [
      { who: "sys", text: "仕入れで余った、活きのいい鯵が数尾。今日の日替わりは、自分に任された。" },
      { who: "me", expr: "normal", text: "（任された…！ 無難に塩焼きか…それとも、攻めるか…）" },
      { who: "sys", text: "厨房の隅で、大将がちらりとこちらを見た。試されている。" },
    ],
    choices: [
      { label: "攻めた創作で出す", check: { stats: ["judgment"] },
        success: { effects: { exp: 16, customer: 5, judgment: 1, boss: 3 },
          msg: "炙りと薬味の一工夫が大当たり！完売した。",
          lines: [
            { who: "me", expr: "fired", text: "（炙って、薬味で香りを立てる。…この鯵なら、絶対にいける）" },
            { who: "sys", text: "出した一皿は、瞬く間に客の話題をさらった。「これ旨いね、毎日出してよ」——気づけば、完売。" },
            { who: "oyakata", expr: "happy", text: "ほう、鯵をこう使うか。…覚えておこう。" },
            { who: "me", expr: "happy", text: "（大将が、おれの仕事を「覚えておく」って言った。…最高の褒め言葉だ）" },
          ] },
        fail: { effects: { exp: 5, customer: -4, boss: -3, stress: 8 },
          msg: "狙いすぎて客の反応はいまひとつ…",
          lines: [
            { who: "me", expr: "normal", text: "（ここで攻めて、自分を見せる…！）" },
            { who: "sys", text: "凝りすぎた一皿は、客を戸惑わせた。半分以上が手つかずで戻ってくる。大将が無言で皿を見ている。" },
            { who: "me", expr: "tired", text: "（攻めるなら、根拠が要る。…ただ目立ちたかっただけだ。勉強不足だった）" },
          ] } },
      { label: "無難な塩焼きで出す", effects: { exp: 6, customer: 1 },
        msg: "手堅くさばいた。悪くない、でも記憶にも残らない。",
        lines: [
          { who: "me", expr: "normal", text: "（…冒険はしない。塩焼きなら、失敗はない）" },
          { who: "sys", text: "出した塩焼きは、過不足なく平らげられた。クレームもなければ、感嘆もない。" },
          { who: "me", expr: "worried", text: "（悪くない。でも…誰の記憶にも残らない。これでいいのか、おれ）" },
        ] },
    ],
  },

  /* ===== 関係性イベント（評価で発生が変わる） ===== */
  {
    id: "support_help", title: "同僚の助け舟", bg: "kitchen",
    trigger: { type: "random", weight: 2.5, cond: { coworkerMin: 60 } },
    lines: [
      { who: "sys", text: "目の前には、見上げるような仕込みの山。覚悟を決めて腕まくりをした、その時——" },
      { who: "sys", text: "横から、ひょいと笊を取られた。「お前最近頑張ってるからさ。ここは俺らがやっとくよ」" },
      { who: "me", expr: "surprised", text: "えっ、いいんですか…！？" },
      { who: "sys", text: "見れば、何人かの同僚が当たり前みたいに袖をまくっている。…いつの間にか、輪の中にいたんだ。" },
    ],
    choices: [
      { label: "甘えて休ませてもらう", effects: { stamina: 25, stress: -10, motivation: 8 },
        msg: "持つべきものは仲間。心も体も軽くなった。",
        lines: [
          { who: "me", expr: "happy", text: "「…じゃあ、お言葉に甘えます。ありがとうございます！」" },
          { who: "sys", text: "裏で一息つくと、張りつめていたものが緩んだ。仲間の笑い声が、厨房から漏れ聞こえてくる。" },
          { who: "me", expr: "happy", text: "（持つべきものは、仲間だな。…この恩は、必ず返す）" },
        ] },
      { label: "一緒に仕込みをする", effects: { exp: 14, coworker: 4, stress: 4 },
        msg: "並んで仕込み。腕も絆も深まった。",
        lines: [
          { who: "me", expr: "fired", text: "「いや、せっかくなら一緒にやらせてください！ 倍速で終わらせましょう！」" },
          { who: "sys", text: "くだらない話で笑いながら手を動かす。くだらないからこそ、心がほどけていく。" },
          { who: "sys", text: "気づけば山だった仕込みが、あっという間に片付いていた。…仕事が、少しだけ好きになる夜。" },
          { who: "me", expr: "happy", text: "（一人なら苦行。みんなとなら、ただの楽しい時間だ）" },
        ] },
    ],
  },
  {
    id: "isolation", title: "輪に入れない", bg: "room",
    trigger: { type: "random", weight: 2.5, cond: { coworkerMax: 30 } },
    lines: [
      { who: "sys", text: "休憩室から、賑やかな笑い声が漏れている。" },
      { who: "sys", text: "扉を開けると——ほんの一瞬、声が止んで、空気が変わった気がした。すぐにまた、何事もなく談笑が続く。" },
      { who: "me", expr: "tired", text: "（…気のせいだ。気のせいだと、思いたい）" },
    ],
    choices: [
      { label: "一人で黙々とやる", effects: { exp: 8, stress: 12, motivation: -6 },
        msg: "仕事に逃げた。腕は鈍らないが、心は重い。",
        lines: [
          { who: "me", expr: "normal", text: "（…いい。どうせ、おれには仕事しかない）" },
          { who: "sys", text: "黙って厨房に戻り、ひたすら手を動かす。包丁の音だけが、やけに大きく響いた。" },
          { who: "me", expr: "tired", text: "（腕は鈍らない。…でも、この重さは、いつまで続くんだろう）" },
        ] },
      { label: "勇気を出して話しかける", check: { stats: ["comm"] },
        success: { effects: { exp: 6, coworker: 8, comm: 1, stress: -4 },
          msg: "意外なほど普通に受け入れてくれた。一歩前進！",
          lines: [
            { who: "me", expr: "worried", text: "「あ、あの…その話、おれも混ぜてもらっても…いいですか」" },
            { who: "sys", text: "一瞬の間。それから——「お、来た来た。お前もこれ食う？」と、あっさり席を詰めてくれた。" },
            { who: "me", expr: "surprised", text: "（…なんだ。考えすぎ、だったのか）" },
            { who: "me", expr: "happy", text: "（壁を作ってたのは、もしかして…おれの方だったのかもな）" },
          ] },
        fail: { effects: { exp: 2, stress: 10, motivation: -4 },
          msg: "会話が続かず、余計に気まずくなってしまった…",
          lines: [
            { who: "me", expr: "worried", text: "「え、えっと…今日、寒いですね、はは…」" },
            { who: "sys", text: "ぎこちない一言は、宙に浮いたまま消えた。「お、おう…」気まずい沈黙だけが残る。" },
            { who: "me", expr: "tired", text: "（うう…明日から、どんな顔すればいいんだ…）" },
          ] } },
    ],
  },
  {
    id: "boss_favor", title: "大将の計らい", bg: "kitchen",
    trigger: { type: "random", weight: 2.5, cond: { bossMin: 60 } },
    lines: [
      { who: "oyakata", expr: "happy", text: "おい、こっち来い。…ほら、大トロの賄いだ。お前は見込みがある。" },
      { who: "me", expr: "surprised", text: "（お、大トロ…！ 滅多に出ない最高のネタを、おれに…！）" },
      { who: "sys", text: "だが、厨房の隅で手を動かす同僚たちの視線が、ちくりと背中に刺さる。" },
    ],
    choices: [
      { label: "ありがたく頂く", effects: { stamina: 18, motivation: 10, exp: 8, coworker: -2 },
        msg: "美味い…！ただ、同僚のやっかみが少し聞こえた気もする。",
        lines: [
          { who: "me", expr: "happy", text: "「…いただきます！」（う、うまい…！ 脂が、舌の上で溶けていく…！）" },
          { who: "sys", text: "口の中に広がる至福。だが、背後で「…えこひいきかよ」と、誰かが小さく呟いたのが聞こえた。" },
          { who: "me", expr: "worried", text: "（うまい。…でも、この味、少しだけ後ろめたい）" },
        ] },
      { label: "皆に分ける", effects: { exp: 6, coworker: 6, boss: 1 },
        msg: "賄いを切り分けた。「気が利くな」と場が和んだ。",
        lines: [
          { who: "me", expr: "normal", text: "「大将、ありがとうございます。…せっかくなんで、みんなで食べていいですか？」" },
          { who: "sys", text: "切り分けた大トロを回すと、強張っていた同僚たちの顔がほころんだ。「お前、気が利くな」と場が和む。" },
          { who: "oyakata", expr: "normal", text: "…ふん、そういう奴か。悪くねえ。" },
          { who: "me", expr: "happy", text: "（一人で食う最高より、みんなで食う最高の方が…おれは好きだ）" },
        ] },
    ],
  },
  {
    id: "unreasonable", title: "理不尽な叱責", bg: "kitchen",
    trigger: { type: "random", weight: 2.5, cond: { bossMax: 30 } },
    lines: [
      { who: "oyakata", expr: "fired", text: "おい！この発注ミスはなんだ！お前がやったんだろう！" },
      { who: "me", expr: "surprised", text: "（違う…これは自分のミスじゃない。発注表を見れば、すぐ分かるはずなのに…）" },
      { who: "sys", text: "周りの同僚は、気まずそうに目を伏せて手を動かしている。評価の低い今、誰も庇ってはくれない。" },
    ],
    choices: [
      { label: "ぐっとこらえる", effects: { exp: 4, stress: 18, motivation: -8 },
        msg: "黙って頭を下げた。胸の奥に何かが溜まっていく…（メンタルが高ければ軽く流せる）",
        lines: [
          { who: "me", expr: "tired", text: "「…申し訳ありませんでした」" },
          { who: "sys", text: "言いたいことを、ぜんぶ飲み込んだ。喉の奥が熱い。胸の底に、黒いものがまた一つ沈んでいく。" },
          { who: "me", expr: "tired", text: "（こういうの、メンタルが強ければ受け流せるんだろうな…。おれは、まだ弱い）" },
        ] },
      { label: "筋を通して言い返す", effects: { exp: 6, boss: -6, coworker: 4, stress: 8 },
        msg: "事実を伝えた。大将はさらに不機嫌だが、同僚は内心スッとしたようだ。",
        lines: [
          { who: "me", expr: "fired", text: "「…大将。これはおれの発注じゃありません。表に、別の名前が残ってます」" },
          { who: "oyakata", expr: "fired", text: "…口答えする暇があったら手を動かせ！" },
          { who: "sys", text: "大将は鼻を鳴らして奥へ消えた。だが、同僚たちの目が、ほんの少しこちらに向いた。「…よく言った」と聞こえた気がした。" },
          { who: "me", expr: "normal", text: "（評価は下がった。…でも、間違ってることは、間違ってると言いたかった）" },
        ] },
    ],
  },
  {
    id: "shift_hole", title: "シフトの穴埋め", bg: "room",
    trigger: { type: "random", weight: 1.2 },
    lines: [
      { who: "sys", text: "スマホが鳴った。先輩からだ。「急で悪いんだけど…明日も出られない？ あいつが急病でさ」" },
      { who: "me", expr: "worried", text: "（明日も…？ 今週はもう連勤続きで、体はくたくたなのに…）" },
      { who: "me", expr: "normal", text: "（でも、ここで貸しを作っておくのも、悪くない…のか…？）" },
    ],
    choices: [
      { label: "引き受ける", effects: { exp: 10, boss: 4, coworker: 3, stamina: -18, stress: 8 },
        msg: "連勤はキツい。でも貸しひとつ、信頼ふたつ。",
        lines: [
          { who: "me", expr: "tired", text: "「…分かりました。おれ、出ます」" },
          { who: "sys", text: "電話の向こうで、心底ほっとした声がした。「助かる…！ この借りは絶対返すから！」" },
          { who: "me", expr: "normal", text: "（体はキツい。でも、貸しひとつ。信頼ふたつ。…困った時はお互いさま、だ）" },
        ] },
      { label: "今回は断る", effects: { boss: -3, motivation: 4, stress: -2 },
        msg: "自分を守った。少しの罪悪感と、確かな休息。",
        lines: [
          { who: "me", expr: "worried", text: "「すみません…明日は、さすがに体がもたなくて…」" },
          { who: "sys", text: "「…そっか。いや、無理言って悪かったな」電話は、少しだけ気まずく切れた。" },
          { who: "me", expr: "normal", text: "（少しの罪悪感。…でも、潰れてからじゃ、誰も助けられない。今日は、自分を守る）" },
        ] },
    ],
  },

  /* ===== 汎用イベント ===== */
  {
    id: "morning_market", title: "豊洲市場へ早朝買い出し", bg: "street",
    trigger: { type: "random" },
    lines: [
      { who: "sys", text: "夜明け前、枕元のスマホが震えた。兄弟子からだ。" },
      { who: "sys", text: "「いい本マグロが入ってる。目利きの勉強したいなら来い。…ただし、今すぐだ」" },
      { who: "me", expr: "tired", text: "（うう、眠い…まだ外は真っ暗だ…。でも、本物を見られるチャンスなんて、そうない…）" },
    ],
    choices: [
      { label: "気合いで行く！", effects: { exp: 22, judgment: 1, stamina: -20, stress: 6 },
        msg: "最高のネタを見極めた！目利きの経験は財産だ。",
        lines: [
          { who: "me", expr: "fired", text: "（…行く！ 寝てる場合じゃない！）" },
          { who: "sys", text: "セリ場の熱気、飛び交う符丁、本物を見抜く職人たちの鋭い目。眠気なんて、一瞬で吹き飛んだ。" },
          { who: "sys", text: "兄弟子が一尾のマグロを指す。「これだ。尾の断面を見ろ。…分かるか?」教科書には、決して載っていない景色。" },
          { who: "me", expr: "happy", text: "（来てよかった…！ この目で見たものは、一生、おれの財産になる）" },
        ] },
      { label: "睡眠を優先", effects: { stamina: 10, stress: -4 },
        msg: "しっかり休んだ。それも仕事のうち。",
        lines: [
          { who: "me", expr: "tired", text: "（…ごめん、兄さん。今日は、体を立て直す方が大事だ）" },
          { who: "sys", text: "スマホを置き、もう一度目を閉じる。窓の外が明るくなる頃、体はずいぶん軽くなっていた。" },
          { who: "me", expr: "normal", text: "（しっかり休むのも、仕事のうち。…次は、必ず行く）" },
        ] },
    ],
  },
  {
    id: "knife_training", title: "深夜の包丁研ぎ", bg: "kitchen",
    trigger: { type: "random" },
    lines: [
      { who: "sys", text: "閉店後の厨房。みんなが帰り、静寂の中、砥石と包丁だけが手元に残っている。" },
      { who: "me", expr: "normal", text: "（今日の切れ味…少し、納得がいかなかったな…）" },
      { who: "sys", text: "誰も見ていない。今日はもう、帰ってもいい。…でも。" },
    ],
    choices: [
      { label: "納得いくまで研ぐ", effects: { exp: 20, work: 1, stamina: -15, stress: 6 },
        msg: "切れ味が冴えた。明日の仕事が楽しみだ。",
        lines: [
          { who: "sys", text: "しゃり、しゃり——静かな厨房に、刃と砥石のこすれる音だけが続く。指先に神経を集中させる。" },
          { who: "me", expr: "fired", text: "（…来た。この感触だ。刃が、生き返った）" },
          { who: "me", expr: "happy", text: "（誰も見てない夜の一手が、明日の自分を作る。…明日の仕事が、楽しみだ）" },
        ] },
      { label: "今日はもう帰る", effects: { stamina: 8, stress: -3 },
        msg: "英気を養った。",
        lines: [
          { who: "me", expr: "tired", text: "（…今日はよくやった。無理して研いでも、雑になるだけだ）" },
          { who: "sys", text: "包丁を布で包み、灯りを落とす。冷たい夜風が、火照った頭を冷ましてくれた。" },
          { who: "me", expr: "normal", text: "（しっかり休んで、明日また冴えた手で握る。…それでいい）" },
        ] },
    ],
  },
  {
    id: "food_show", title: "グルメ番組の取材", bg: "storefront",
    trigger: { type: "random" },
    lines: [
      { who: "sys", text: "営業中の店に、大きなカメラを抱えた一団が現れた。「テレビ局の者ですが、お店を取材させていただけませんか」" },
      { who: "me", expr: "surprised", text: "（テレビ！？ う、嘘だろ…緊張で、もう手が震えてきた…）" },
      { who: "sys", text: "大将が顎で「お前がやれ」と促す。店の顔として、自分が前に出る場面だ。" },
    ],
    choices: [
      { label: "堂々と対応する", effects: { exp: 18, customer: 5, boss: 4, stress: 8 },
        msg: "店の看板として喋り切った！放送が楽しみだ。",
        lines: [
          { who: "me", expr: "fired", text: "「うちの自慢は、毎朝仕入れる旬のネタです。…ぜひ、カウンターで召し上がってください！」" },
          { who: "sys", text: "最初は震えていた声も、店のことを語るうちに熱を帯びていく。リポーターも思わず引き込まれていた。" },
          { who: "oyakata", expr: "happy", text: "（…ほう。いっちょ前の面構えになりやがって）" },
          { who: "me", expr: "happy", text: "（言い切った…！ 放送、楽しみにしててください、お客さん）" },
        ] },
      { label: "裏方に徹する", effects: { exp: 12, work: 1, coworker: 2 },
        msg: "黙々と現場を支えた。同僚は見ていてくれた。",
        lines: [
          { who: "me", expr: "worried", text: "（カメラの前は、まだ無理だ…。おれは、おれの持ち場で店を支える）" },
          { who: "sys", text: "表が華やぐ裏で、黙々と仕込みを回し続けた。注文が滞らないのは、この働きがあってこそだ。" },
          { who: "sys", text: "撤収後、先輩がぽつりと言った。「お前が裏を締めてくれたから、回ったよ。…ありがとな」" },
          { who: "me", expr: "happy", text: "（目立たなくていい。見ててくれる人は、ちゃんといる）" },
        ] },
    ],
  },
  {
    id: "slump", title: "スランプ…", bg: "room",
    trigger: { type: "random" },
    lines: [
      { who: "me", expr: "tired", text: "（最近どうも、握りがしっくりこない…。昨日まで普通にできてたことが、できない）" },
      { who: "sys", text: "手元を見つめる。指は同じように動いているはずなのに、何かが噛み合わない。職人なら誰もが通る、出口の見えないトンネル。" },
      { who: "me", expr: "worried", text: "（基本に立ち返るべきか…それとも、一度すべて忘れて離れるべきか…）" },
    ],
    choices: [
      { label: "ひたすら反復練習", effects: { exp: 12, work: 1, stamina: -10, stress: 8 },
        msg: "地道に克服。遠回りが一番の近道。",
        lines: [
          { who: "me", expr: "normal", text: "（逃げない。…崩れた時こそ、基本だ）" },
          { who: "sys", text: "シャリを握っては崩し、また握る。何百回。指が覚えるまで、ただ繰り返す。手が、痺れて感覚がなくなってきた頃——" },
          { who: "me", expr: "fired", text: "（…あ。戻った。この感覚だ。やっと、掴んだ）" },
          { who: "me", expr: "happy", text: "（遠回りに見えて、これが一番の近道だったんだ）" },
        ] },
      { label: "思い切ってリフレッシュ", effects: { stamina: 20, stress: -12, motivation: 8 },
        msg: "気分一新！肩の力が抜けた。",
        lines: [
          { who: "me", expr: "tired", text: "（…考えすぎてたのかもな。一回、ぜんぶ忘れよう）" },
          { who: "sys", text: "店を出て、あてもなく街を歩く。うまい飯を食い、ぼんやり空を見上げた。気づけば、ガチガチだった肩の力が抜けていた。" },
          { who: "me", expr: "happy", text: "（焦ってたな、おれ。…明日、まっさらな気持ちで握り直そう）" },
        ] },
    ],
  },
  {
    id: "heroine_visit", title: "さくらの差し入れ", bg: "storefront",
    trigger: { type: "random" },
    lines: [
      { who: "heroine", expr: "happy", text: "おつかれさま！はい、これ作ってきたよ。" },
      { who: "me", expr: "surprised", text: "さくら！？ わざわざ店まで来てくれたのか。" },
      { who: "heroine", expr: "worried", text: "うん。…あなた最近、痩せたんじゃない？ ちゃんと、食べてる？" },
    ],
    choices: [
      { label: "ありがたく受け取る", effects: { stamina: 20, stress: -10, motivation: 8 }, item: "bento",
        msg: "差し入れに元気百倍！（特製まかない を入手）",
        lines: [
          { who: "me", expr: "happy", text: "「うわ、うまそう…！ ありがとう、助かるよ。あとで絶対食べる」" },
          { who: "heroine", expr: "happy", text: "ふふ、ちゃんと残さず食べてよ？ また作ってくるから。" },
          { who: "me", expr: "happy", text: "（重箱の中身を想像するだけで、元気が湧いてくる。…現金なもんだな、おれ）" },
        ] },
      { label: "少し一緒に休む", effects: { stamina: 25, stress: -14, motivation: 12 },
        msg: "たわいない話で笑った。こういう時間が明日の力になる。",
        lines: [
          { who: "me", expr: "normal", text: "「ちょうど休憩なんだ。…少しだけ、座ってくか？」" },
          { who: "sys", text: "店の裏口に二人並んで腰かけ、とりとめのない話で笑い合う。仕事のことなんて、すっかり忘れていた。" },
          { who: "heroine", expr: "happy", text: "ふふ、その顔。ちょっとは元気出たみたいだね。" },
          { who: "me", expr: "happy", text: "（こういう、なんでもない時間が…明日の力になるんだ）" },
        ] },
    ],
  },
  {
    id: "rival_challenge", title: "ライバル登場", bg: "street",
    trigger: { type: "random" },
    lines: [
      { who: "rival", expr: "smug", text: "お前が向かいの店の新入りか。…ふうん、大した面構えじゃねえな。" },
      { who: "me", expr: "surprised", text: "（こいつ…向かいの店の若大将、龍二…！ 噂は聞いてる）" },
      { who: "rival", expr: "smug", text: "お前の握り、見せてもらおうか。それとも——尻尾巻いて逃げるか？" },
    ],
    choices: [
      { label: "勝負を受ける！", effects: { exp: 24, work: 1, stress: 8, motivation: 8 },
        msg: "火花散る対決！負けられない戦いが人を伸ばす。",
        lines: [
          { who: "me", expr: "fired", text: "「…上等だ。おれの握り、目に焼き付けとけ」" },
          { who: "sys", text: "言葉はいらなかった。互いに無言で握り、互いの一貫を口に運ぶ。張りつめた空気に、火花が散る。" },
          { who: "rival", expr: "normal", text: "…へえ。思ったよりやるじゃねえか。次は負けねえぞ。" },
          { who: "me", expr: "fired", text: "（こいつがいるから、おれはもっと強くなれる。…ライバルってのは、案外ありがたい）" },
        ] },
      { label: "技を盗む", effects: { exp: 16, judgment: 1 },
        msg: "冷静に観察した。悔しいが、奴の仕事は確かだ。",
        lines: [
          { who: "me", expr: "normal", text: "（…挑発には乗らない。それより、こいつの手元を見せてもらう）" },
          { who: "sys", text: "龍二の包丁さばきを、一手も逃さず目で追う。無駄のない所作、計算された盛り。…悔しいが、本物だ。" },
          { who: "me", expr: "fired", text: "（盗めるものは、全部盗む。プライドより、上達が先だ）" },
        ] },
    ],
  },

  /* ===== ポジション専用イベント ===== */
  {
    id: "shok_oyakata", title: "大将直伝・握りの極意", bg: "kitchen",
    trigger: { type: "random", pos: "shokunin" },
    lines: [
      { who: "oyakata", expr: "normal", text: "おい、手を止めろ。…ええか、シャリは赤子を包むように握れ。力じゃねえ、呼吸だ。" },
      { who: "me", expr: "surprised", text: "（大将が、直々に…！ こんな機会、滅多にない。一言も聞き逃せない）" },
      { who: "oyakata", expr: "normal", text: "見てろ。…ほら、米の一粒一粒が立ってるだろう。これが、口の中でほどける握りだ。" },
    ],
    choices: [
      { label: "とことん教わる", effects: { exp: 30, stamina: -12, boss: 4, stress: 6 },
        msg: "握りの極意を会得！大将との距離も縮まった。",
        lines: [
          { who: "me", expr: "fired", text: "「大将、もう一度…！ いえ、納得いくまで見てください！」" },
          { who: "sys", text: "何度も握り、何度もやり直す。大将は無言で、時に頷き、時に手の角度を直す。額に汗が滲む。" },
          { who: "oyakata", expr: "happy", text: "…ああ、それだ。今のを、体で覚えとけ。" },
          { who: "me", expr: "happy", text: "（掴んだ…！ 大将が「それだ」って言った。この感覚、絶対に離さない）" },
        ] },
      { label: "見て盗む", effects: { exp: 16, judgment: 1 },
        msg: "目で盗んだ。考える力がついた。",
        lines: [
          { who: "me", expr: "normal", text: "（口で聞くより、目で盗む。…大将の指の動き、力の抜き方、ぜんぶ覚える）" },
          { who: "sys", text: "一歩引いて、大将の所作を頭に焼き付ける。「なぜそう握るのか」を、自分の頭で考える。" },
          { who: "me", expr: "normal", text: "（教わるだけじゃ、自分のものにならない。…考えて掴んだ技は、裏切らない）" },
        ] },
    ],
  },
  {
    id: "shok_creative", title: "創作寿司の構想", bg: "room",
    trigger: { type: "random", pos: "shokunin" },
    lines: [
      { who: "sys", text: "深夜の自室。布団に入っても、新しい握りのアイデアが頭から離れない。" },
      { who: "me", expr: "surprised", text: "（…待てよ。あのネタと、あの薬味を合わせたら…）" },
      { who: "me", expr: "fired", text: "（ひらめいた！この組み合わせ、絶対に旨い…！ 今すぐ試したい…！）" },
    ],
    choices: [
      { label: "朝まで試作する", effects: { exp: 26, stamina: -18, stress: 8, customer: 3 }, item: "charm",
        msg: "新作が完成！（お守り を入手）",
        lines: [
          { who: "me", expr: "fired", text: "（こうなったら止まらない。朝までに、必ず形にする…！）" },
          { who: "sys", text: "厨房に戻り、ネタを切り、合わせ、味を見る。失敗、また失敗。窓の外が白み始めた頃——一貫の傑作が、皿の上にあった。" },
          { who: "me", expr: "happy", text: "（…完成だ。これは、おれにしか作れない一貫だ）" },
          { who: "sys", text: "ふと、作業台の隅に小さなお守りが置いてあるのに気づいた。…誰かが、応援してくれているらしい。" },
        ] },
      { label: "メモして寝る", effects: { exp: 10, stamina: 8 },
        msg: "アイデアは温存。健康も大事。",
        lines: [
          { who: "me", expr: "normal", text: "（…逸る気持ちはわかる。でも、寝不足の手で作っても、ろくなものにならない）" },
          { who: "sys", text: "枕元のメモに、思いついた組み合わせを書き留める。明日のおれに、託すことにした。" },
          { who: "me", expr: "happy", text: "（アイデアは逃げない。万全の体で、最高の一貫を作ろう）" },
        ] },
    ],
  },
  {
    id: "kit_rush", title: "仕込みの山", bg: "kitchen",
    trigger: { type: "random", pos: "kitchen" },
    lines: [
      { who: "sys", text: "明日の仕込みリストを手に取り、思わず天を仰いだ。…多い。多すぎる。" },
      { who: "me", expr: "tired", text: "（これ全部、おれ一人で…？ 徹夜コースか…？）" },
      { who: "me", expr: "normal", text: "（いや…やり方次第か。段取り次第で、まだ間に合う、かも…）" },
    ],
    choices: [
      { label: "一気に片付ける", effects: { exp: 28, stamina: -20, stress: 10, coworker: 5 },
        msg: "全部やり切った！朝、同僚が驚いていた。",
        lines: [
          { who: "me", expr: "fired", text: "（やるしかない。…手順を組んで、一気にいく！）" },
          { who: "sys", text: "鍋を仕掛けながら次を切り、その間に出汁を引く。無駄のない動きで、山が少しずつ崩れていく。気づけば、外は明るい。" },
          { who: "sys", text: "翌朝、出勤してきた同僚が仕込み場を見て絶句した。「…これ、まさか一人で？ お前、すげえな…」" },
          { who: "me", expr: "happy", text: "（体はボロボロ。…でも、やり切った達成感は、何物にも代えがたい）" },
        ] },
      { label: "要点だけ手早く", effects: { exp: 15, stamina: -6 },
        msg: "効率重視で切り上げた。",
        lines: [
          { who: "me", expr: "normal", text: "（全部は無理だ。…明日、本当に要るものだけ、手早く片付ける）" },
          { who: "sys", text: "優先順位を見極め、必要な分だけを的確に仕込む。残りは明日の自分に回す。…これも一つの判断だ。" },
          { who: "me", expr: "normal", text: "（無理して潰れたら、元も子もない。引き際を見極めるのも、腕のうちだ）" },
        ] },
    ],
  },
  {
    id: "kit_fry", title: "揚げ場の極意", bg: "kitchen",
    trigger: { type: "random", pos: "kitchen" },
    lines: [
      { who: "oyakata", expr: "normal", text: "おい、揚げ場に立て。…天ぷらってのはな、目で揚げるんじゃねえ。" },
      { who: "oyakata", expr: "happy", text: "音で揚げるんだ。耳を澄ませてみろ。" },
      { who: "me", expr: "surprised", text: "（音…！ ……たしかに、泡の弾ける音が、変わる瞬間がある…！）" },
    ],
    choices: [
      { label: "火加減を体で覚える", effects: { exp: 26, stamina: -10, work: 1, boss: 3 }, item: "whetstone",
        msg: "揚げの感覚を掴んだ！（砥石 を入手）",
        lines: [
          { who: "me", expr: "fired", text: "（音に集中する。…じゅわ、じゅわ…今だ！ この音で、引き上げる…！）" },
          { who: "sys", text: "何度も揚げ、何度も大将に見てもらう。やがて、目をつぶっていても揚がり具合が「聞こえる」ようになってきた。" },
          { who: "oyakata", expr: "happy", text: "…そうだ。お前、いい耳してるじゃねえか。これ、やるよ。", },
          { who: "me", expr: "happy", text: "（大将が砥石を…！ 体で覚えた感覚は、もう一生忘れない）" },
        ] },
      { label: "レシピで覚える", effects: { exp: 15, judgment: 1 },
        msg: "理屈で理解した。",
        lines: [
          { who: "me", expr: "normal", text: "（音も大事。でも、温度と時間を数字で押さえておけば、再現できる）" },
          { who: "sys", text: "油温計を片手に、素材ごとの最適な温度と時間をノートに書き留めていく。感覚を、理屈で裏打ちする。" },
          { who: "me", expr: "normal", text: "（職人の勘も、突き詰めれば理屈がある。…どっちも、おれの武器にする）" },
        ] },
    ],
  },
  {
    id: "flo_regular", title: "常連さんとの会話", bg: "storefront",
    trigger: { type: "random", pos: "floor" },
    lines: [
      { who: "sys", text: "「姉ちゃん…じゃねえ、兄ちゃん、ちょっと聞いてよ」常連の旦那衆が、上機嫌で手招きしている。" },
      { who: "me", expr: "happy", text: "（お、いつもの旦那衆だ。今日は一杯入って、機嫌がいいな）" },
      { who: "me", expr: "normal", text: "（よし…ここは、聞き上手の見せ場だ）" },
    ],
    choices: [
      { label: "笑顔で聞き役に", effects: { exp: 24, stamina: -6, customer: 5, comm: 1 },
        msg: "場が和んだ！「あんたがいると楽しいよ」",
        lines: [
          { who: "me", expr: "happy", text: "「へえ、それでどうなったんです？」「いやあ、それは大変でしたね！」" },
          { who: "sys", text: "相槌一つで、旦那衆の話はどんどん弾む。カウンター全体が、いつの間にか笑い声に包まれていた。" },
          { who: "sys", text: "帰り際、旦那の一人が肩を叩いた。「あんたがいると、楽しいよ。また来るわ」" },
          { who: "me", expr: "happy", text: "（料理だけが、店の味じゃない。…この空気も、おれが作る一品だ）" },
        ] },
      { label: "さりげなく注文を促す", effects: { exp: 14, customer: 2, boss: 2 }, item: "tea",
        msg: "商売上手。（高級茶葉 を入手）",
        lines: [
          { who: "me", expr: "normal", text: "「その話に合ういいネタ、入ってますよ。…もう一貫、いかがです？」" },
          { who: "sys", text: "会話の流れに、さりげなく一品を乗せる。旦那衆は気持ちよく追加注文。売上も、場も、どちらも立った。" },
          { who: "sys", text: "厨房から大将が「気が利くな」と顎をしゃくり、いいお茶を一袋、こっそり握らせてくれた。" },
          { who: "me", expr: "happy", text: "（楽しませて、売上も作る。…接客って、奥が深い）" },
        ] },
    ],
  },
  {
    id: "flo_complaint", title: "本物のクレーム", bg: "storefront",
    trigger: { type: "random", pos: "floor" },
    lines: [
      { who: "sys", text: "「いつまで待たせるんだ！」——苛立った客の声が、店内に響き渡った。" },
      { who: "sys", text: "一瞬で、店の空気が凍りつく。他の客の視線も、こちらに集まった。" },
      { who: "me", expr: "worried", text: "（来た…！ 訓練じゃない、本物のクレームだ。…ここで、成果を見せるとき）" },
    ],
    choices: [
      { label: "誠心誠意あやまる", check: { stats: ["service", "mental"], statDiv: 220 },
        success: { effects: { exp: 22, customer: 5, mental: 1 },
          msg: "落ち着いた応対で、最後は笑顔で帰っていただけた。",
          lines: [
            { who: "me", expr: "normal", text: "「大変お待たせして、申し訳ございません。すぐにお持ちします。…本日のお代は、結構ですので」" },
            { who: "sys", text: "声を荒げず、目を見て、まっすぐ詫びる。客の苛立ちが、少しずつ和らいでいくのが分かった。" },
            { who: "sys", text: "「…まあ、あんたの顔に免じて許すよ」帰り際、客はそう言って、ふっと笑った。" },
            { who: "me", expr: "happy", text: "（怖かった。…でも、逃げずに向き合えば、ちゃんと伝わるんだ）" },
          ] },
        fail: { effects: { exp: 6, customer: -3, stress: 12 },
          msg: "声が震えてしまった…悔しい。",
          lines: [
            { who: "me", expr: "worried", text: "「も、申し訳…っ、その、すぐに…っ」" },
            { who: "sys", text: "頭が真っ白になり、声が震える。客は「もういい」と吐き捨てて、料理も待たずに席を立ってしまった。" },
            { who: "me", expr: "tired", text: "（…ダメだった。本番に、心が追いつかなかった。悔しい）" },
          ] } },
      { label: "一品サービスする", effects: { exp: 12, customer: 3, boss: -2 },
        msg: "機転で収めた。原価には大将が渋い顔。",
        lines: [
          { who: "me", expr: "normal", text: "「お詫びに、こちら一品サービスさせてください…！」" },
          { who: "sys", text: "とっさの機転で、その場はなんとか収まった。客も機嫌を直してくれた。…が。" },
          { who: "oyakata", expr: "worried", text: "（…おい。気持ちは分かるが、なんでもタダで出しゃいいってもんじゃねえぞ）" },
          { who: "me", expr: "worried", text: "（収めた。でも、原価で逃げた感は否めない。…言葉で収められるように、なりたい）" },
        ] },
    ],
  },
  {
    id: "mgr_books", title: "帳簿とにらめっこ", bg: "room",
    trigger: { type: "random", pos: "manager" },
    lines: [
      { who: "sys", text: "事務室の机に、今月の売上と原価の帳簿が広げられている。" },
      { who: "me", expr: "normal", text: "（ふむ…売上は悪くない。でも、この曜日だけ、やけに廃棄が多いな…）" },
      { who: "sys", text: "ずらりと並んだ数字の向こうに、店の本当の姿が、うっすらと見えてくる。" },
    ],
    choices: [
      { label: "徹底的に分析する", effects: { exp: 28, stamina: -10, judgment: 1, boss: 4, stress: 8 },
        msg: "経営感覚が磨かれた！大将も数字に唸った。",
        lines: [
          { who: "me", expr: "fired", text: "（とことん洗い出す。…曜日別、時間別、メニュー別。原因が、必ずどこかにある）" },
          { who: "sys", text: "電卓を叩き、グラフを描く。深夜まで数字と格闘した末、ついに廃棄の原因と、利益を改善する一手を突き止めた。" },
          { who: "oyakata", expr: "surprised", text: "…おいおい。お前、こんなとこまで見てたのか。…大将より、店のこと分かってるじゃねえか。" },
          { who: "me", expr: "happy", text: "（数字は嘘をつかない。この店を、誰よりも遠くから見られる目が、おれの武器だ）" },
        ] },
      { label: "要点だけ確認", effects: { exp: 15 },
        msg: "効率よく把握。",
        lines: [
          { who: "me", expr: "normal", text: "（全部を深掘りする時間はない。…まずは、大事な数字だけ押さえておこう）" },
          { who: "sys", text: "売上と原価の要点に絞って、ざっと目を通す。大きな流れだけは、きちんと頭に入れた。" },
          { who: "me", expr: "normal", text: "（深追いは、また今度。…でも、店の体温を知っておくのは、悪くない）" },
        ] },
    ],
  },
  {
    id: "mgr_staff", title: "スタッフ面談", bg: "room",
    trigger: { type: "random", pos: "manager" },
    lines: [
      { who: "sys", text: "若いスタッフが、ここ最近ずっと浮かない顔をしている。仕事のミスも、少し増えてきた。" },
      { who: "me", expr: "worried", text: "（…何か、抱えてるな。声をかけるべきか…でも、踏み込みすぎるのも、どうか…）" },
      { who: "sys", text: "見て見ぬふりは、簡単だ。でも——マネージャーとして、それでいいのか。" },
    ],
    choices: [
      { label: "じっくり向き合う", effects: { exp: 24, stamina: -6, coworker: 6, comm: 1 }, item: "charm",
        msg: "信頼が深まった。（お守り を入手）",
        lines: [
          { who: "me", expr: "normal", text: "「最近、無理してないか？ …よかったら、話、聞くよ」" },
          { who: "sys", text: "最初は口の重かったスタッフも、ぽつり、ぽつりと胸の内を話し始めた。ただ黙って、最後まで耳を傾ける。" },
          { who: "sys", text: "話し終えたスタッフの顔は、来た時よりずっと軽くなっていた。「…聞いてもらえて、よかったです」" },
          { who: "me", expr: "happy", text: "（人を動かすのは、命令じゃない。…まず、聞くことなんだな）" },
        ] },
      { label: "励まして送り出す", effects: { exp: 13, coworker: 3 },
        msg: "前向きに送り出した。",
        lines: [
          { who: "me", expr: "happy", text: "「お前ならできる。あんまり気負うなよ。…困ったら、いつでも言えよ」" },
          { who: "sys", text: "ぽん、と肩を叩いて送り出す。スタッフは少しだけ照れたように笑って、持ち場へ戻っていった。" },
          { who: "me", expr: "normal", text: "（深くは踏み込まない。…でも、「見てるぞ」って伝われば、それでいい）" },
        ] },
    ],
  },
];
