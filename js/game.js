/* =========================================================================
 * 鮨サクセス — メインコントローラ
 * 画面遷移 / 育成パート（サクセス）/ 評価集計
 * ========================================================================= */

const Game = (() => {
  const TOTAL_WEEKS = 12;

  let player = null;        // 育成中のプレイヤー
  let logLines = [];
  let pendingPos = null;    // ポジション選択中

  /* ---------- 画面管理 ---------- */
  function show(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    window.scrollTo(0, 0);
  }

  /* ---------- ログ ---------- */
  function log(text, kind = "sys") {
    logLines.unshift({ text, kind });
    if (logLines.length > 40) logLines.pop();
    renderLog();
  }
  function renderLog() {
    const el = document.getElementById("log");
    if (!el) return;
    el.innerHTML = logLines.map(l => `<div class="l-${l.kind}">${l.text}</div>`).join("");
  }

  /* ---------- タイトル ---------- */
  function initTitle() {
    document.getElementById("btn-start").onclick = () => { show("position"); renderPositionSelect(); };
  }

  /* ---------- ポジション選択 ---------- */
  function renderPositionSelect() {
    const grid = document.getElementById("pos-grid");
    grid.innerHTML = "";
    pendingPos = null;
    for (const key of Object.keys(POSITIONS)) {
      const p = POSITIONS[key];
      const main = STATS[p.main];
      const el = document.createElement("button");
      el.className = "pos-card";
      el.dataset.pos = key;
      el.innerHTML = `
        <div class="pi">${p.icon}</div>
        <div class="pn">${p.name}</div>
        <div class="pc">「${p.catch}」</div>
        <div class="pd">${p.desc}</div>
        <div class="pbonus">得意：${main.icon}${main.name}　／　${p.bonus.info}</div>`;
      el.onclick = () => {
        pendingPos = key;
        document.querySelectorAll(".pos-card").forEach(c => c.classList.remove("selected"));
        el.classList.add("selected");
        document.getElementById("btn-pos-decide").disabled = false;
      };
      grid.appendChild(el);
    }
    document.getElementById("btn-pos-decide").disabled = true;
  }

  function decidePosition() {
    if (!pendingPos) return;
    const p = POSITIONS[pendingPos];
    player = {
      position: pendingPos,
      name: "あなた",
      week: 1,
      stats: Object.assign({ stamina: 100, maxStamina: 100 }, p.base),
      storeScore: 0,        // 営業の累積（店の評価に直結）
      serviceCount: 0,
    };
    logLines = [];
    log(`${p.icon} 「${p.name}」として修行開始！ 目指せミシュラン三つ星！`, "good");
    show("success");
    renderSuccess();
  }

  /* ---------- 育成パート ---------- */
  function statTotal() {
    return TRAINABLE.reduce((s, k) => s + player.stats[k], 0);
  }

  function renderSuccess() {
    const p = POSITIONS[player.position];
    // HUD
    document.getElementById("succ-who").innerHTML =
      `${p.icon} ${p.name} <small>「${p.catch}」</small>`;
    document.getElementById("succ-week").textContent = `${player.week}週目 / ${TOTAL_WEEKS}`;
    document.getElementById("succ-store").innerHTML =
      `店の評価 <b style="color:var(--accent2)">${storeStarLabel(player.storeScore)}</b>`;

    // ステータスバー
    const sw = document.getElementById("stat-bars");
    sw.innerHTML = "";
    for (const k of TRAINABLE) {
      const s = STATS[k];
      const v = player.stats[k];
      sw.innerHTML += `
        <div class="stat-row">
          <span class="sn">${s.icon}${s.name}</span>
          <span class="bar"><i style="width:${Math.min(100,v)}%"></i></span>
          <span class="sv">${v}</span>
        </div>`;
    }
    // 体力
    const st = player.stats.stamina;
    sw.innerHTML += `
      <div class="stat-row">
        <span class="sn">${STATS.stamina.icon}${STATS.stamina.name}</span>
        <span class="bar sta"><i style="width:${st}%"></i></span>
        <span class="sv">${st}</span>
      </div>`;

    // 次の営業日告知
    const nextStage = SERVICE_STAGES.find(s => s.day >= player.week);
    const notice = document.getElementById("succ-notice");
    const stageToday = SERVICE_STAGES.find(s => s.day === player.week);
    if (stageToday) {
      notice.innerHTML = `🔴 <b>本日は営業日！</b>「${stageToday.name}」 お客さんを捌こう！`;
    } else if (nextStage) {
      notice.innerHTML = `次の営業日：<b>${nextStage.day}週目</b>「${nextStage.name}」（あと${nextStage.day - player.week}週）`;
    } else {
      notice.innerHTML = `すべての営業を終えた。修行の総仕上げだ。`;
    }

    renderCommands(stageToday);
    renderLog();
  }

  function renderCommands(stageToday) {
    const grid = document.getElementById("cmd-grid");
    grid.innerHTML = "";

    if (stageToday) {
      // 営業日：営業コマンドのみ
      const el = document.createElement("button");
      el.className = "cmd service";
      el.innerHTML = `<span class="ci">🍣</span><span class="ct">営業開始！</span>
        <span class="cd">「${stageToday.name}」のお客さんを捌く</span>`;
      el.onclick = () => startService(stageToday);
      grid.appendChild(el);
      return;
    }

    // 通常週：練習コマンド
    const p = POSITIONS[player.position];
    for (const k of TRAINABLE) {
      const s = STATS[k];
      const isMain = k === p.main;
      const gain = trainGain(k);
      const cost = 28;
      const el = document.createElement("button");
      el.className = "cmd";
      el.disabled = player.stats.stamina < cost;
      el.innerHTML = `
        <span class="ci">${s.icon}</span>
        <span class="ct">${s.name}の練習${isMain ? " ★" : ""}</span>
        <span class="cd">+${gain.min}〜${gain.max} / 体力-${cost}</span>`;
      el.onclick = () => doTrain(k, cost);
      grid.appendChild(el);
    }
    // 休養
    const rest = document.createElement("button");
    rest.className = "cmd rest";
    rest.innerHTML = `<span class="ci">😴</span><span class="ct">休養</span><span class="cd">体力+45 回復</span>`;
    rest.onclick = () => doRest();
    grid.appendChild(rest);

    // 食べ歩き（知識寄りのバランス）
    const study = document.createElement("button");
    study.className = "cmd";
    study.disabled = player.stats.stamina < 15;
    study.innerHTML = `<span class="ci">🍱</span><span class="ct">食べ歩き</span><span class="cd">知識+少 / 体力-15</span>`;
    study.onclick = () => doStudy();
    grid.appendChild(study);
  }

  function trainGain(k) {
    const p = POSITIONS[player.position];
    const isMain = k === p.main;
    const base = isMain ? 9 : 6;
    return { min: base, max: base + 6 };
  }

  function rand(min, max) {
    // Date/Math.random はメインプロセスでは利用可（ワークフロー制約は無関係）
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function doTrain(k, cost) {
    if (player.stats.stamina < cost) return;
    player.stats.stamina -= cost;
    const g = trainGain(k);
    let gain = rand(g.min, g.max);
    // 体力が低いと効率ダウン or 軽い失敗
    let failed = false;
    if (player.stats.stamina < 20 && Math.random() < 0.35) {
      failed = true;
      gain = Math.max(1, Math.floor(gain * 0.3));
    }
    player.stats[k] = Math.min(100, player.stats[k] + gain);
    const s = STATS[k];
    if (failed) log(`😣 疲労で練習に身が入らず…「${s.name}」+${gain}`, "bad");
    else log(`💪 ${s.name}の練習！ +${gain}`, "good");
    advanceWeek();
  }

  function doRest() {
    player.stats.stamina = Math.min(player.stats.maxStamina, player.stats.stamina + 45);
    log(`😴 ゆっくり休んだ。体力が回復した。`, "sys");
    advanceWeek();
  }

  function doStudy() {
    if (player.stats.stamina < 15) return;
    player.stats.stamina -= 15;
    const g = rand(3, 7);
    player.stats.knowledge = Math.min(100, player.stats.knowledge + g);
    const extra = TRAINABLE[rand(0, TRAINABLE.length - 1)];
    const e2 = rand(1, 3);
    player.stats[extra] = Math.min(100, player.stats[extra] + e2);
    log(`🍱 食べ歩きで見聞を広めた。知識+${g} ${STATS[extra].name}+${e2}`, "good");
    advanceWeek();
  }

  // 週を進める：イベント抽選 → 次の描画
  function advanceWeek() {
    player.week++;
    if (player.week > TOTAL_WEEKS) {
      finishGame();
      return;
    }
    // 営業日でなければ一定確率でイベント
    const isServiceDay = SERVICE_STAGES.some(s => s.day === player.week);
    if (!isServiceDay && Math.random() < 0.45) {
      const ev = EVENTS[rand(0, EVENTS.length - 1)];
      showEvent(ev);
    } else {
      renderSuccess();
    }
  }

  /* ---------- イベント ---------- */
  function showEvent(ev) {
    show("event");
    document.getElementById("ev-title").textContent = ev.title;
    document.getElementById("ev-text").textContent = ev.text;
    const wrap = document.getElementById("ev-choices");
    wrap.innerHTML = "";
    ev.choices.forEach(c => {
      const b = document.createElement("button");
      b.className = "btn ghost";
      b.style.width = "100%";
      b.style.marginBottom = "10px";
      b.textContent = c.label;
      b.onclick = () => resolveEvent(c);
      wrap.appendChild(b);
    });
  }

  function resolveEvent(choice) {
    for (const [k, v] of Object.entries(choice.effects)) {
      if (k === "stamina") {
        player.stats.stamina = Math.max(0, Math.min(player.stats.maxStamina, player.stats.stamina + v));
      } else {
        player.stats[k] = Math.max(0, Math.min(100, player.stats[k] + v));
      }
    }
    log(`📖 ${choice.msg}`, "good");
    show("success");
    renderSuccess();
  }

  /* ---------- 営業（試合）へ ---------- */
  function startService(stage) {
    show("cooking");
    document.getElementById("svc-msg").textContent = "";
    Cooking.start(stage, player, (result) => onServiceFinish(stage, result));
  }

  function onServiceFinish(stage, result) {
    const p = POSITIONS[player.position];
    const ratingMult = (p.bonus.ratingMult || 1);
    const gainedStore = Math.round(result.score * ratingMult);
    player.storeScore += gainedStore;
    player.serviceCount++;

    log(`🏁 営業終了「${stage.name}」 ${result.score}点 → 店評価 +${gainedStore}`, "good");

    // 結果画面
    show("service-result");
    const rate = result.total ? Math.round((result.served / result.total) * 100) : 100;
    document.getElementById("svcres-body").innerHTML = `
      <h2>${stage.name} 営業結果</h2>
      <div class="big-stars">${result.score}<span style="font-size:20px;color:var(--ink-dim)"> 点</span></div>
      <div class="muted mt">
        提供 <b>${result.served}</b> / 来客 ${result.total}（提供率 ${rate}%）<br>
        逃した客 ${result.lost}　ミス ${result.mistakes}　最大コンボ ${result.maxCombo}
      </div>
      <div class="divider"></div>
      <div class="row"><span>店の評価アップ</span><b style="color:var(--accent2)">+${gainedStore}</b></div>
      <div class="row"><span>現在の店評価</span><b style="color:var(--accent2)">${storeStarLabel(player.storeScore)}</b></div>
    `;
    document.getElementById("btn-svc-continue").onclick = () => {
      show("success");
      advanceWeek();
    };
  }

  /* ---------- 最終評価 ---------- */
  function finishGame() {
    // 総合スコア = ステータス合計 * 係数 + 店評価 / 5
    const stats = statTotal();
    const overall = Math.round(stats * 0.7 + player.storeScore / 6);
    let tier = MICHELIN[0];
    for (const m of MICHELIN) if (overall >= m.min) tier = m;

    show("result");
    const p = POSITIONS[player.position];
    const starStr = tier.stars > 0 ? "★".repeat(tier.stars) : (tier.min >= 180 ? "🏅" : "—");

    document.getElementById("result-body").innerHTML = `
      <div class="muted">${p.icon} ${p.name}としての修行を終えた</div>
      <div class="big-stars">${starStr}</div>
      <div class="michelin-title">${tier.title}</div>
      <div class="result-comment">${tier.comment}</div>
      <div class="divider"></div>
      <div style="max-width:420px;margin:0 auto;text-align:left;">
        ${TRAINABLE.map(k => `<div class="row"><span>${STATS[k].icon}${STATS[k].name}</span><b>${player.stats[k]}</b></div>`).join("")}
        <div class="divider"></div>
        <div class="row"><span>ステータス合計</span><b>${stats}</b></div>
        <div class="row"><span>店の評価</span><b style="color:var(--accent2)">${storeStarLabel(player.storeScore)}</b>（${player.storeScore}）</div>
        <div class="row"><span>総合スコア</span><b style="color:var(--accent)">${overall}</b></div>
      </div>
    `;
    document.getElementById("btn-replay").onclick = () => { show("title"); };
  }

  /* ---------- 初期化 ---------- */
  function init() {
    initTitle();
    document.getElementById("btn-pos-back").onclick = () => show("title");
    document.getElementById("btn-pos-decide").onclick = decidePosition;
    show("title");
  }

  return { init, log, show };
})();

window.addEventListener("DOMContentLoaded", Game.init);
