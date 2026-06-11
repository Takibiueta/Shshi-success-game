/* =========================================================================
 * 鮨サクセス — ADV会話イベント画面（UIコンポーネント）
 *
 * メイン画面の上にオーバーレイ表示する、アドベンチャーゲーム風の会話画面。
 *   背景レイヤー / キャラ立ち絵 / メッセージウィンドウ（名前＋本文＋▼）/ 選択肢
 * - クリック（タップ）で読み進める。タイプ中のクリックは全文表示。
 * - 選択肢の check は使用ステータスと成功率を表示。
 * - 純UI層：効果の適用は opts.resolve（game.js 側）に委譲する。
 *
 * 使い方:
 *   Adv.play(event, {
 *     position: "shokunin",                 // 主人公立ち絵の色
 *     chance:  (check) => 0.62,             // 成功率の表示用
 *     resolve: (choice) => ({ ok, lines }), // 効果適用＋結果会話を返す
 *     done:    () => {},                    // すべて終わったら
 *   });
 * ========================================================================= */

const Adv = (() => {
  let ev = null, opts = null;
  let queue = [], idx = 0;
  let phase = "lines";          // "lines"（導入） | "result"（選択肢の結果）
  let typing = false, typer = null, fullText = "";
  let bound = false;
  let lastWho = null;   // 話者が変わったときだけ立ち絵をポップさせる

  const $ = id => document.getElementById(id);

  /* ---------- 公開API ---------- */
  function play(event, options) {
    ev = event;
    opts = options || {};
    queue = (event.lines || []).slice();
    idx = 0;
    phase = "lines";

    bindOnce();
    lastWho = null;
    const overlay = $("adv-overlay");
    overlay.querySelector(".adv-bg").className = "adv-bg bg-" + (event.bg || "storefront");
    $("adv-title").textContent = event.title || "";
    $("adv-choices").hidden = true;
    $("adv-chara").innerHTML = "";
    overlay.hidden = false;

    if (queue.length === 0) { endQueue(); return; }
    showLine();
  }

  function isOpen() { return ev !== null; }

  /* ---------- 進行 ---------- */
  function bindOnce() {
    if (bound) return;
    bound = true;
    $("adv-overlay").addEventListener("pointerdown", (e) => {
      // 選択肢表示中はボタンに任せる
      if (!ev || !$("adv-choices").hidden) return;
      e.preventDefault();
      if (typing) finishTyping();
      else next();
    });
  }

  function showLine() {
    const line = queue[idx];
    const charaEl = $("adv-chara");
    const nameEl = $("adv-name");
    const textEl = $("adv-text");

    if (line.who && line.who !== "sys") {
      charaEl.innerHTML = Chara.sprite(line.who, line.expr, opts.position);
      if (line.who !== lastWho) {
        charaEl.classList.remove("pop"); void charaEl.offsetWidth; charaEl.classList.add("pop");
      }
      lastWho = line.who;
      nameEl.textContent = Chara.NAMES[line.who] || "";
      nameEl.hidden = false;
      textEl.classList.remove("narration");
    } else {
      // ナレーション：立ち絵は前のまま薄く、名前なし・斜体
      nameEl.hidden = true;
      textEl.classList.add("narration");
    }
    charaEl.classList.toggle("dim", !line.who || line.who === "sys");

    // タイプライター表示
    fullText = line.text;
    textEl.textContent = "";
    $("adv-next").hidden = true;
    typing = true;
    if (typer) clearInterval(typer);
    let i = 0;
    typer = setInterval(() => {
      i++;
      textEl.textContent = fullText.slice(0, i);
      if (i >= fullText.length) finishTyping();
    }, 28);
  }

  function finishTyping() {
    if (typer) { clearInterval(typer); typer = null; }
    typing = false;
    $("adv-text").textContent = fullText;
    $("adv-next").hidden = false;
  }

  function next() {
    idx++;
    if (idx < queue.length) showLine();
    else endQueue();
  }

  function endQueue() {
    if (phase === "lines" && ev.choices && ev.choices.length) {
      showChoices();
    } else {
      close();
    }
  }

  /* ---------- 選択肢 ---------- */
  function showChoices() {
    const wrap = $("adv-choices");
    wrap.innerHTML = "";
    for (const c of ev.choices) {
      const b = document.createElement("button");
      b.className = "adv-choice";
      if (c.check && opts.chance) {
        const names = (c.check.stats || []).map(k => (typeof STATS !== "undefined" && STATS[k]) ? STATS[k].name : k).join("＋");
        const pct = Math.round(opts.chance(c.check) * 100);
        b.innerHTML = `${c.label} <small>（${names}判定 ${pct}%）</small>`;
      } else {
        b.textContent = c.label;
      }
      b.onpointerdown = (e) => { e.stopPropagation(); };
      b.onclick = (e) => { e.stopPropagation(); pick(c); };
      wrap.appendChild(b);
    }
    wrap.hidden = false;
    $("adv-next").hidden = true;
  }

  function pick(choice) {
    $("adv-choices").hidden = true;
    const res = opts.resolve ? opts.resolve(choice) : { lines: [] };
    if (res && res.lines && res.lines.length) {
      phase = "result";
      queue = res.lines.slice();
      idx = 0;
      showLine();
    } else {
      close();
    }
  }

  /* ---------- 終了 ---------- */
  function close() {
    if (typer) { clearInterval(typer); typer = null; }
    typing = false;
    $("adv-overlay").hidden = true;
    const done = opts && opts.done;
    ev = null; opts = null; queue = [];
    if (done) done();
  }

  return { play, isOpen };
})();
