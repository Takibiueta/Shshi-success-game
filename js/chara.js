/* =========================================================================
 * 鮨サクセス — キャラクター演出（パワプロ風の立ち絵＋セリフ）
 *
 * SVG で描いたチビキャラ（主人公 / 大将）を表示し、状況に応じて
 * 表情とセリフを切り替える。セリフはタイプライター表示。
 * ========================================================================= */

const Chara = (() => {
  const SKIN = "#f4d3ad";
  // ポジション別の前掛け色（主人公の見た目）
  const POS_COLOR = {
    shokunin: "#d94f3d", kitchen: "#e0913c",
    floor: "#5aa0c4", manager: "#7c6cb0",
  };

  /* ---------- 表情（目・口・追加パーツ） ---------- */
  function face(expr) {
    switch (expr) {
      case "happy":
        return `
          <path d="M68 104 Q78 92 88 104" fill="none" stroke="#2b2b2b" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M112 104 Q122 92 132 104" fill="none" stroke="#2b2b2b" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M84 118 Q100 137 116 118 Z" fill="#9c3a28"/>
          <path d="M88 120 H112" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
      case "tired":
        return `
          <path d="M70 95 L86 103 L70 109" fill="none" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M130 95 L114 103 L130 109" fill="none" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M86 126 q6 -7 12 0 q6 7 12 0" fill="none" stroke="#7a4a3a" stroke-width="3.2" stroke-linecap="round"/>
          <path d="M152 66 q-7 11 0 18 q7 -7 0 -18 Z" fill="#7fc4e8"/>`;
      case "surprised":
        return `
          <circle cx="78" cy="101" r="10" fill="#fff" stroke="#2b2b2b" stroke-width="3"/>
          <circle cx="122" cy="101" r="10" fill="#fff" stroke="#2b2b2b" stroke-width="3"/>
          <circle cx="78" cy="102" r="4.5" fill="#2b2b2b"/>
          <circle cx="122" cy="102" r="4.5" fill="#2b2b2b"/>
          <ellipse cx="100" cy="127" rx="8" ry="10" fill="#7a3a2e"/>`;
      case "worried":
        return `
          <path d="M66 90 L88 97" stroke="#2b2b2b" stroke-width="3.2" stroke-linecap="round"/>
          <path d="M134 90 L112 97" stroke="#2b2b2b" stroke-width="3.2" stroke-linecap="round"/>
          <ellipse cx="78" cy="105" rx="5.5" ry="7.5" fill="#2b2b2b"/>
          <ellipse cx="122" cy="105" rx="5.5" ry="7.5" fill="#2b2b2b"/>
          <path d="M88 130 q12 -7 24 0" fill="none" stroke="#7a4a3a" stroke-width="3" stroke-linecap="round"/>`;
      case "fired":
        return `
          <path d="M68 96 L88 104 L68 108 Z" fill="#2b2b2b"/>
          <path d="M132 96 L112 104 L132 108 Z" fill="#2b2b2b"/>
          <path d="M84 119 Q100 141 116 119 Q100 129 84 119 Z" fill="#9c3a28"/>
          <path d="M150 56 q9 11 1 24 q-5 -6 -2 -13 q-7 5 -4 14 q-9 -11 5 -25 Z" fill="#e8923d"/>
          <path d="M153 62 q5 7 1 15 q-3 -4 -1 -8 q-4 3 -2 8 q-5 -7 3 -15 Z" fill="#f4c542"/>`;
      case "smug":
        return `
          <path d="M68 103 q9 -7 18 -1" fill="none" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round"/>
          <path d="M114 102 q9 -6 18 1" fill="none" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round"/>
          <path d="M88 124 q11 9 24 -3" fill="none" stroke="#7a4a3a" stroke-width="3.2" stroke-linecap="round"/>`;
      default: // normal
        return `
          <ellipse cx="78" cy="102" rx="6.5" ry="9" fill="#2b2b2b"/>
          <ellipse cx="122" cy="102" rx="6.5" ry="9" fill="#2b2b2b"/>
          <circle cx="80.5" cy="99" r="2" fill="#fff"/>
          <circle cx="124.5" cy="99" r="2" fill="#fff"/>
          <path d="M88 122 Q100 130 112 122" fill="none" stroke="#7a4a3a" stroke-width="3" stroke-linecap="round"/>`;
    }
  }

  function blush() {
    return `
      <ellipse cx="64" cy="116" rx="9" ry="5.5" fill="#f3a6a0" opacity="0.65"/>
      <ellipse cx="136" cy="116" rx="9" ry="5.5" fill="#f3a6a0" opacity="0.65"/>`;
  }

  /* ---------- 立ち絵 SVG ---------- */
  function svg(who, expr, accent) {
    const body = `
      <ellipse cx="50" cy="202" rx="15" ry="22" fill="${accent}"/>
      <ellipse cx="150" cy="202" rx="15" ry="22" fill="${accent}"/>
      <circle cx="48" cy="218" r="9" fill="${SKIN}"/>
      <circle cx="152" cy="218" r="9" fill="${SKIN}"/>
      <path d="M54 232 Q54 164 100 159 Q146 164 146 232 Z" fill="${accent}"/>
      <rect x="86" y="148" width="28" height="20" rx="6" fill="${SKIN}"/>
      <circle cx="100" cy="100" r="58" fill="${SKIN}"/>`;

    let head;
    if (who === "heroine") {
      // 彼女「さくら」：長い髪＋前髪＋花の髪飾り
      head = `
        <path d="M40 110 Q40 172 60 206 L73 200 Q56 166 62 120 Z" fill="#5a3e30"/>
        <path d="M160 110 Q160 172 140 206 L127 200 Q144 166 138 120 Z" fill="#5a3e30"/>
        ${blush()}
        ${face(expr)}
        <path d="M46 88 Q56 50 100 47 Q144 50 154 88 Q150 66 138 64 Q118 57 100 60 Q82 57 62 64 Q50 66 46 88 Z" fill="#5a3e30"/>
        <g transform="translate(150,70)">
          <circle cx="-8" cy="0" r="6" fill="#ff8fb0"/><circle cx="8" cy="0" r="6" fill="#ff8fb0"/>
          <circle cx="0" cy="-8" r="6" fill="#ff8fb0"/><circle cx="0" cy="8" r="6" fill="#ff8fb0"/>
          <circle cx="0" cy="0" r="5" fill="#ffd24a"/>
        </g>`;
    } else if (who === "rival") {
      // ライバル「龍二」：逆立てた髪＋青い鉢巻
      head = `
        ${face(expr)}
        <path d="M46 80 L38 38 L62 64 L70 30 L90 62 L100 26 L110 62 L130 32 L140 64 L162 42 L154 82 Z" fill="#23211f"/>
        <rect x="44" y="74" width="112" height="14" rx="3" fill="#2f7a8a"/>
        <path d="M154 81 l18 -8 l-2 17 Z" fill="#2f7a8a"/>
        <path d="M154 81 l18 8 l-2 -17 Z" fill="#256472"/>`;
    } else if (who === "oyakata") {
      // 大将：白髪＋鉢巻＋口ひげ
      head = `
        <path d="M50 72 Q100 30 150 72 Q152 50 100 40 Q48 50 50 72 Z" fill="#d3cec3"/>
        <rect x="42" y="62" width="116" height="16" rx="4" fill="#c0392b"/>
        <path d="M154 70 l18 -9 l-2 18 Z" fill="#c0392b"/>
        <path d="M154 70 l18 9 l-2 -18 Z" fill="#a93226"/>
        ${face(expr)}
        <path d="M78 132 Q100 142 122 132 Q112 126 100 128 Q88 126 78 132 Z" fill="#cfc9bd"/>`;
    } else {
      // 主人公：コック帽
      head = `
        <path d="M52 122 Q44 100 54 82 L62 94 Q58 110 66 126 Z" fill="#3a2a22"/>
        <path d="M148 122 Q156 100 146 82 L138 94 Q142 110 134 126 Z" fill="#3a2a22"/>
        ${blush()}
        ${face(expr)}
        <ellipse cx="72" cy="48" rx="21" ry="20" fill="#fff"/>
        <ellipse cx="100" cy="38" rx="25" ry="23" fill="#fff"/>
        <ellipse cx="128" cy="48" rx="21" ry="20" fill="#fff"/>
        <rect x="58" y="50" width="84" height="24" rx="10" fill="#fff" stroke="#e6ddcc" stroke-width="2"/>`;
    }

    return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" class="chara-svg">
      <ellipse cx="100" cy="232" rx="60" ry="9" fill="#000" opacity="0.18"/>
      ${body}
      ${head}
    </svg>`;
  }

  const NAMES = { me: "あなた", oyakata: "大将", heroine: "さくら", rival: "龍二" };
  const ACCENT = { oyakata: "#6b5a47", heroine: "#e87aa0", rival: "#2f7a8a" };

  /* ---------- セリフ集 ---------- */
  // {who, expr, lines:[...]} ／ {stat} は置換される
  const LINES = {
    start: [
      { who: "me", expr: "fired", lines: ["よし、今日からここで修行だ！目指すはミシュラン三つ星！"] },
      { who: "oyakata", expr: "normal", lines: ["ようこそ、うちの暖簾へ。みっちり鍛えてやる、覚悟しな。"] },
    ],
    idle: [
      { who: "me", expr: "normal", lines: ["さて、今週はどの練習をしようかな…", "コツコツ腕を磨くぞ。", "一品入魂、ってな。"] },
      { who: "oyakata", expr: "normal", lines: ["焦るな。基本の繰り返しが一流への近道だ。", "得意分野（★）は伸びやすい。意識して伸ばしな。", "体力と相談しながら進めるんだぞ。"] },
    ],
    train_good: [
      { who: "me", expr: "happy", lines: ["{stat}、いい感じに伸びてきた！", "うん、手応えあり！", "この調子この調子！"] },
    ],
    train_fail: [
      { who: "me", expr: "tired", lines: ["うっ…体が重い。少し休んだ方がいいかも…", "ふらふらだ…集中できない…"] },
    ],
    rest: [
      { who: "me", expr: "happy", lines: ["ふぅ〜、生き返る〜。", "しっかり休んで、また頑張るぞ。"] },
    ],
    study: [
      { who: "me", expr: "happy", lines: ["食べ歩きは舌の勉強だ。うまい！", "なるほど、この味付けは盗めるな…！"] },
    ],
    low_stamina: [
      { who: "oyakata", expr: "worried", lines: ["おい、無理は禁物だ。今日は休め。", "ヘトヘトじゃ良い仕事はできん。休養も修行のうちだ。"] },
    ],
    service_day: [
      { who: "me", expr: "fired", lines: ["いよいよ営業日だ！全力でお客さんを捌くぞ！！", "腕の見せ所…！いくぞ！"] },
      { who: "oyakata", expr: "fired", lines: ["本番だ。ここまでの修行、全部出し切ってこい！"] },
    ],
    service_good: [
      { who: "oyakata", expr: "happy", lines: ["お見事！客足が戻ってきたな。", "上出来だ。この調子で星を狙え。"] },
      { who: "me", expr: "happy", lines: ["やった、たくさん捌けた！手応えあり！"] },
    ],
    service_bad: [
      { who: "me", expr: "tired", lines: ["うぅ…捌ききれなかった…次こそは…！"] },
      { who: "oyakata", expr: "normal", lines: ["落ち込むな。次に活かせばいい。腕を磨き直せ。"] },
    ],
    event_done: [
      { who: "me", expr: "happy", lines: ["{msg}"] },
    ],
    item_used: [
      { who: "me", expr: "happy", lines: ["{msg}", "これは効くぞ…！", "ありがたく使わせてもらう！"] },
    ],
    hint: [
      { who: "oyakata", expr: "normal", lines: [
        "得意（★）の練習は伸びやすい。集中して伸ばすのも手だ。",
        "体力が低いと練習をしくじる。早めに休養を取れ。",
        "知識を上げると、営業で高得点メニューが解放されるぞ。",
        "営業日までに、いろんな能力をまんべんなく上げておけ。",
        "食べ歩きは知識＋αが手に入る。気分転換にもいい。",
      ] },
    ],
    finish_great: [
      { who: "oyakata", expr: "happy", lines: ["見事な腕前になったな。お前はもう立派な鮨職人だ。"] },
    ],
    finish_ok: [
      { who: "me", expr: "normal", lines: ["ここまでよく頑張った。修行はまだまだ続く…！"] },
    ],
  };

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function fill(text, ctx) {
    return text.replace(/\{(\w+)\}/g, (_, k) => (ctx && ctx[k] != null ? ctx[k] : ""));
  }

  /* ---------- 表示 ---------- */
  let typer = null;

  function els(target) {
    const pre = target === "event" ? "ev-" : "";
    return {
      art: document.getElementById(pre + "chara-art"),
      name: document.getElementById(pre + "chara-name"),
      text: document.getElementById(pre + "chara-text"),
    };
  }

  function say(opts) {
    const target = opts.target || "success";
    const e = els(target);
    if (!e.art) return;
    const who = opts.who || "me";
    const expr = opts.expr || "normal";
    const accent = ACCENT[who] || POS_COLOR[opts.position] || "#d94f3d";
    e.art.innerHTML = svg(who, expr, accent);
    e.art.className = "chara-art pop";
    void e.art.offsetWidth;
    e.art.classList.add("show");
    if (e.name) e.name.textContent = NAMES[who] || "";

    // タイプライター
    const full = opts.text || "";
    e.text.dataset.full = full;
    e.text.textContent = "";
    if (typer) clearInterval(typer);
    let i = 0;
    typer = setInterval(() => {
      i++;
      e.text.textContent = full.slice(0, i);
      if (i >= full.length) { clearInterval(typer); typer = null; }
    }, 30);
  }

  // 状況タイプからセリフを選んで表示
  function react(type, ctx = {}) {
    const set = LINES[type] || LINES.idle;
    const entry = pick(set);
    const text = fill(pick(entry.lines), ctx);
    say({
      who: entry.who, expr: entry.expr, text,
      target: ctx.target || "success",
      position: ctx.position,
    });
  }

  return { say, react, svg };
})();
