/* =========================================================================
 * 鮨サクセス — メインコントローラ
 * 画面遷移 / 育成パート（サクセス）/ 評価集計
 * ========================================================================= */

const Game = (() => {
  const TOTAL_WEEKS = 20;

  let player = null;        // 育成中のプレイヤー
  let logLines = [];
  let pendingPos = null;    // ポジション選択中
  let pendingReact = null;  // 次の育成画面で出すキャラのセリフ

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
      exp: 0,                                   // 経験点（能力アップで振り分け）
      meters: Object.assign({}, BALANCE.startMeters), // ストレス / やる気
      evals: Object.assign({}, BALANCE.startEvals),   // 大将 / 同僚 / 客 評価
      storeScore: 0,        // 営業の累積（店の評価に直結）
      serviceCount: 0,
      items: { energy: 1, recipe: 1 },   // 初期アイテム
    };
    logLines = [];
    log(`${p.icon} 「${p.name}」として修行開始！ 目指せミシュラン三つ星！`, "good");
    pendingReact = { type: "start" };
    show("success");
    renderSuccess();
  }

  /* ---------- 育成パート ---------- */
  function statTotal() {
    return TRAINABLE.reduce((s, k) => s + player.stats[k], 0);
  }

  // パワプロ風のランク文字（0-100 → G〜S）
  function gradeLetter(v) {
    if (v >= 90) return "S";
    if (v >= 80) return "A";
    if (v >= 70) return "B";
    if (v >= 60) return "C";
    if (v >= 50) return "D";
    if (v >= 35) return "E";
    if (v >= 20) return "F";
    return "G";
  }

  // 今のステータスから見込みのミシュラン評価
  function projectedTier() {
    const overall = Math.round(statTotal() * 0.7 + player.storeScore / 6);
    let tier = MICHELIN[0];
    for (const m of MICHELIN) if (overall >= m.min) tier = m;
    return tier;
  }

  // 効果（コマンド / イベント / アイテム共通）を適用し、サマリ文字列を返す
  // 実体は logic/effects.js（メンタル軽減・コミュ増幅・やる気倍率もそこで処理）
  function applyEffects(eff) {
    return Logic.applyEffects(player, eff);
  }

  /* ---------- 背景の時間帯・行列 ---------- */
  function updateScene() {
    const scene = document.querySelector(".pawa-scene");
    if (!scene) return;
    // 週の進行で 朝→昼→夕→夜 に変化
    const tods = ["tod-morning", "tod-day", "tod-evening", "tod-night"];
    scene.classList.remove(...tods);
    const phase = Math.min(3, Math.floor((player.week - 1) / 5)); // 全20週を4分割（朝→昼→夕→夜）
    scene.classList.add(tods[phase]);
    // 営業日が近い（当日 or 直前週）と行列＆点灯
    const near = SERVICE_STAGES.some(s => s.day === player.week || s.day === player.week + 1);
    scene.classList.toggle("svc-near", near);
  }

  /* ---------- アイテム ---------- */
  function itemTotal() {
    return Object.values(player.items || {}).reduce((a, b) => a + b, 0);
  }
  function addItem(id) {
    if (!ITEMS[id]) return;
    player.items[id] = (player.items[id] || 0) + 1;
  }
  function openItems() {
    const list = document.getElementById("item-list");
    list.innerHTML = "";
    const owned = Object.keys(player.items).filter(id => player.items[id] > 0);
    if (owned.length === 0) {
      list.innerHTML = `<div class="muted" style="text-align:center;padding:20px;">アイテムを持っていない。<br>イベントの差し入れなどで手に入る。</div>`;
    } else {
      for (const id of owned) {
        const it = ITEMS[id];
        const el = document.createElement("div");
        el.className = "item-card";
        el.innerHTML = `
          <span class="it-icon">${it.icon}</span>
          <span class="it-body"><b>${it.name}</b> <small>×${player.items[id]}</small><br><span class="muted">${it.desc}</span></span>
          <button class="btn it-use">使う</button>`;
        el.querySelector(".it-use").onclick = () => useItem(id);
        list.appendChild(el);
      }
    }
    document.getElementById("item-modal").hidden = false;
  }
  function closeItems() { document.getElementById("item-modal").hidden = true; }
  function useItem(id) {
    if (!player.items[id]) return;
    const it = ITEMS[id];
    applyEffects(it.effect);
    player.items[id]--;
    if (player.items[id] <= 0) delete player.items[id];
    log(`🎒 「${it.name}」を使った！ ${it.desc}`, "good");
    pendingReact = { type: "item_used", ctx: { msg: `「${it.name}」、効いてきた！` } };
    renderSuccess();
    fxSparkle();
    fxGain(`${it.icon} ${it.name}`);
    openItems(); // リストを更新（空なら閉じる）
    if (itemTotal() === 0) closeItems();
  }

  /* ---------- 演出（キラキラ・効果プレビュー） ---------- */
  function fxSparkle() {
    const layer = document.getElementById("fx-layer");
    if (!layer) return;
    for (let i = 0; i < 10; i++) {
      const s = document.createElement("span");
      s.className = "spark";
      s.textContent = ["✨", "⭐", "💫"][i % 3];
      s.style.left = (38 + Math.random() * 24) + "%";
      s.style.top = (45 + Math.random() * 30) + "%";
      s.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
      s.style.setProperty("--dy", (-40 - Math.random() * 90) + "px");
      s.style.animationDelay = (Math.random() * 0.12) + "s";
      layer.appendChild(s);
      setTimeout(() => s.remove(), 1000);
    }
  }
  function fxGain(text) {
    const layer = document.getElementById("fx-layer");
    if (!layer) return;
    const el = document.createElement("div");
    el.className = "fx-gain";
    el.textContent = text;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
  function previewCmd(text) {
    const h = document.getElementById("cmd-hint");
    if (h) h.textContent = text;
  }
  function clearPreview() {
    const h = document.getElementById("cmd-hint");
    if (h) h.textContent = "";
  }

  /* ---------- 経験点・能力アップ（パワプロ式の振り分け） ---------- */
  function allocCostFor(k, v) {
    const p = POSITIONS[player.position];
    let c = allocCostAt(v);
    if (k === p.main) c = Math.max(1, Math.round(c * BALANCE.mainDiscount)); // 得意能力は割引
    return c;
  }
  function openAlloc() { renderAlloc(); document.getElementById("alloc-modal").hidden = false; }
  function closeAlloc() { document.getElementById("alloc-modal").hidden = true; }
  function renderAlloc() {
    document.getElementById("alloc-exp").textContent = player.exp;
    const p = POSITIONS[player.position];
    const list = document.getElementById("alloc-list");
    list.innerHTML = "";
    for (const k of TRAINABLE) {
      const s = STATS[k], v = player.stats[k], g = gradeLetter(v);
      const isMain = k === p.main;
      const maxed = v >= 100;
      const cost1 = allocCostFor(k, v);
      const el = document.createElement("div");
      el.className = "alloc-row";
      el.innerHTML = `
        <span class="ar-name">${s.icon}${s.name}${isMain ? "★" : ""}</span>
        <span class="ar-grade g-${g}">${g}</span>
        <span class="ar-val">${v}</span>
        <span class="ar-cost">${maxed ? "MAX" : cost1 + "pt"}</span>`;
      const btns = document.createElement("span");
      btns.className = "ar-btns";
      const mk = (label, amount) => {
        const b = document.createElement("button");
        b.className = "btn alloc-up";
        b.textContent = label;
        b.disabled = maxed || player.exp < cost1;
        b.onclick = () => allocStat(k, amount);
        return b;
      };
      btns.appendChild(mk("+1", 1));
      btns.appendChild(mk("+5", 5));
      el.appendChild(btns);
      list.appendChild(el);
    }
  }
  function allocStat(k, amount) {
    let raised = 0, spent = 0;
    for (let i = 0; i < amount; i++) {
      const v = player.stats[k];
      if (v >= 100) break;
      const c = allocCostFor(k, v);
      if (player.exp < c) break;
      player.exp -= c; player.stats[k] = v + 1; raised++; spent += c;
    }
    if (raised > 0) {
      log(`⬆️ ${STATS[k].name} を +${raised}（経験点-${spent}）`, "good");
      renderSuccess();
      renderAlloc();
    }
  }

  function renderSuccess() {
    const p = POSITIONS[player.position];
    // 上部ステータスバー
    document.getElementById("succ-turns").textContent = Math.max(0, TOTAL_WEEKS - player.week + 1);
    document.getElementById("succ-week").textContent = `${player.week} / ${TOTAL_WEEKS} 週目`;
    document.getElementById("succ-store").innerHTML =
      `店 <b style="color:var(--accent2)">${storeStarLabel(player.storeScore)}</b>`;
    const st = player.stats.stamina;
    document.getElementById("succ-sta-fill").style.width = st + "%";
    document.getElementById("succ-sta-num").textContent = st;

    // ステータスカード
    document.getElementById("succ-who-icon").textContent = p.icon;
    document.getElementById("succ-name").textContent = p.name;
    const tier = projectedTier();
    document.getElementById("succ-rank").textContent =
      tier.stars > 0 ? "★".repeat(tier.stars) : (tier.min >= 180 ? "🏅" : "☆");

    // ステータス（ランク文字＋数値）
    const sw = document.getElementById("stat-bars");
    sw.innerHTML = "";
    for (const k of TRAINABLE) {
      const s = STATS[k];
      const v = player.stats[k];
      const g = gradeLetter(v);
      sw.innerHTML += `
        <div class="sc-stat" data-stat="${k}">
          <span class="ss-name">${s.icon}${s.name}</span>
          <span class="ss-grade g-${g}">${g}</span>
          <span class="ss-val">${v}</span>
        </div>`;
    }
    // メーター＆評価（対立軸を常に見せる）
    const m = player.meters, e = player.evals;
    const stressCls = m.stress >= 80 ? "val-danger" : m.stress >= 50 ? "val-warn" : "";
    const evalCls = v => v >= BALANCE.evalBands.high ? "val-good" : v <= BALANCE.evalBands.low ? "val-danger" : "";
    sw.innerHTML += `
      <div class="sc-divider"></div>
      <div class="sc-stat"><span class="ss-name">${METERS.stress.icon}${METERS.stress.name}</span><span class="ss-val ${stressCls}">${m.stress}</span></div>
      <div class="sc-stat"><span class="ss-name">${METERS.motivation.icon}${METERS.motivation.name}</span><span class="ss-val ${m.motivation <= 30 ? "val-warn" : ""}">${m.motivation}</span></div>
      <div class="sc-divider"></div>
      <div class="sc-stat"><span class="ss-name">${EVALS.boss.icon}${EVALS.boss.name}</span><span class="ss-val ${evalCls(e.boss)}">${e.boss}</span></div>
      <div class="sc-stat"><span class="ss-name">${EVALS.coworker.icon}${EVALS.coworker.name}</span><span class="ss-val ${evalCls(e.coworker)}">${e.coworker}</span></div>
      <div class="sc-stat"><span class="ss-name">${EVALS.customer.icon}${EVALS.customer.name}</span><span class="ss-val ${evalCls(e.customer)}">${e.customer}</span></div>`;

    // 背景の時間帯＆営業日が近いと行列
    updateScene();
    // アイテム数・経験点バッジ
    const ic = document.getElementById("item-count");
    if (ic) ic.textContent = itemTotal();
    const ec = document.getElementById("exp-count");
    if (ec) ec.textContent = player.exp;

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

    // キャラのセリフ（状況に応じて表情・話者・内容が変化）
    let rtype, rctx = { position: player.position, target: "success" };
    if (stageToday) rtype = "service_day";
    else if (pendingReact) { rtype = pendingReact.type; Object.assign(rctx, pendingReact.ctx); }
    else if (player.meters.stress >= BALANCE.stress.tiredThreshold) rtype = "stress_high";
    else if (player.stats.stamina < 25) rtype = "low_stamina";
    else rtype = "idle";
    pendingReact = null;
    if (typeof Chara !== "undefined") Chara.react(rtype, rctx);
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

    // 通常週：コマンド（data/commands.js から生成。各コマンドは得るものと失うものを持つ）
    for (const cmd of COMMANDS) {
      const cost = (cmd.cost && cmd.cost.stamina) || 0;
      const el = document.createElement("button");
      el.className = "cmd" + (cmd.id === "rest" ? " rest" : "");
      el.dataset.kind = cmd.kind;
      el.disabled = player.stats.stamina < cost;
      const costTxt = cost ? `体力-${cost}` : "体力消費なし";
      el.innerHTML = `
        <span class="ci">${cmd.icon}</span>
        <span class="ct">${cmd.name}</span>
        <span class="cd">${costTxt}</span>`;
      el.onclick = () => doCommand(cmd);
      el.onpointerenter = () => {
        let hint = `${cmd.icon}${cmd.name}：${cmd.note}`;
        if (cmd.check) hint += `（今の成功率 ${Math.round(Logic.checkChance(player, cmd.check) * 100)}%）`;
        previewCmd(hint);
      };
      el.onpointerleave = () => clearPreview();
      grid.appendChild(el);
    }
  }

  function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  /* コマンド実行：check があれば成功判定 → success/fail の効果を適用 */
  function doCommand(cmd) {
    const cost = (cmd.cost && cmd.cost.stamina) || 0;
    if (player.stats.stamina < cost) return;
    if (cost) player.stats.stamina -= cost;

    let outcome = cmd, ok = true;
    if (cmd.check) {
      ok = Logic.statCheck(player, cmd.check).ok;
      outcome = ok ? cmd.success : cmd.fail;
    }
    const expBefore = player.exp;
    const summary = applyEffects(outcome.effects);
    const expGained = player.exp - expBefore;

    if (cmd.check && !ok) {
      log(`😣 ${cmd.name}：${outcome.msg || "うまくいかなかった…"} ${summary}`, "bad");
      pendingReact = { type: "train_fail" };
    } else {
      const head = outcome.msg ? `${cmd.name}：${outcome.msg}` : `${cmd.name}！`;
      log(`${cmd.icon} ${head} ${summary}`, "good");
      pendingReact = {
        type: cmd.id === "rest" ? "rest" : cmd.id === "play" ? "play" : cmd.id === "talk" ? "talk" : "train_good",
        ctx: { stat: cmd.name },
      };
    }
    clearPreview();
    advanceWeek();
    if (ok && document.getElementById("success").classList.contains("active")) {
      fxSparkle();
      if (expGained > 0) fxGain(`経験点 +${expGained}`);
    }
  }

  // 週を進める：やる気減衰 → ストレス限界チェック → イベント抽選 → 描画
  function advanceWeek() {
    player.week++;
    if (player.week > TOTAL_WEEKS) {
      finishGame();
      return;
    }
    // やる気は放っておくと下がる（「遊ぶ」の価値）
    player.meters.motivation = Math.max(0, player.meters.motivation - BALANCE.weekly.motivationDecay);

    // ストレス限界 → 強制ダウン（その週のイベントは起きない）
    if (player.meters.stress >= BALANCE.stress.collapseAt) {
      const summary = applyEffects(BALANCE.stress.collapse);
      log(`🚨 ストレスが限界に…数日寝込んでしまった。 ${summary}`, "bad");
      pendingReact = { type: "train_fail" };
      renderSuccess();
      return;
    }

    // 営業日でなければ確率でイベント（評価の状態で発生イベントが変わる）
    const isServiceDay = SERVICE_STAGES.some(s => s.day === player.week);
    if (!isServiceDay && Math.random() < BALANCE.events.chance) {
      const ev = EventLogic.pick(player);
      if (ev) { showEvent(ev); return; }
    }
    renderSuccess();
  }

  /* ---------- イベント ---------- */
  function showEvent(ev) {
    show("event");
    document.getElementById("ev-title").textContent = ev.title;
    if (typeof Chara !== "undefined") {
      Chara.say({
        who: ev.chara || "me",
        expr: ev.expr || "surprised",
        text: ev.text, target: "event", position: player.position,
      });
    }
    const wrap = document.getElementById("ev-choices");
    wrap.innerHTML = "";
    ev.choices.forEach(c => {
      const b = document.createElement("button");
      b.className = "btn ghost";
      b.style.width = "100%";
      b.style.marginBottom = "10px";
      if (c.check) {
        // 判定つき選択肢は使うステータスと現在の成功率を見せる（賭けの判断材料）
        const names = (c.check.stats || []).map(k => STATS[k] ? STATS[k].name : k).join("＋");
        const pct = Math.round(Logic.checkChance(player, c.check) * 100);
        b.innerHTML = `${c.label}　<small style="color:var(--accent2)">（${names}判定 ${pct}%）</small>`;
      } else {
        b.textContent = c.label;
      }
      b.onclick = () => resolveEvent(c);
      wrap.appendChild(b);
    });
  }

  function resolveEvent(choice) {
    let outcome = choice, ok = true;
    if (choice.check) {
      ok = Logic.statCheck(player, choice.check).ok;
      outcome = ok ? choice.success : choice.fail;
    }
    const summary = applyEffects(outcome.effects);
    const itemId = choice.check ? outcome.item : choice.item; // 判定失敗時はアイテムなし
    if (itemId) addItem(itemId);
    const msg = outcome.msg || choice.msg || "";
    log(`📖 ${msg} ${summary}`, ok ? "good" : "bad");
    pendingReact = { type: "event_done", ctx: { msg } };
    show("success");
    renderSuccess();
  }

  /* ---------- 営業（試合）へ ---------- */

  // 新ステータス → 営業ミニゲームの旧ステータスへの変換アダプタ。
  // cooking.js / manager.js は旧キー（tech/speed/knowledge/hospitality/creativity）の
  // ままなので、ここで橋渡しする（ミニゲーム側は無改修）。
  function toMinigamePlayer() {
    const s = player.stats;
    return {
      position: player.position,
      stats: {
        tech: s.work,                                   // 作業力 → 技術
        speed: Math.round((s.work + s.mental) / 2),     // 作業力＋冷静さ → 速さ
        knowledge: s.judgment,                          // 判断力 → 知識（メニュー解放）
        hospitality: s.service,                         // 接客力 → 接客
        creativity: Math.round((s.judgment + s.comm) / 2), // 発想 → 創作
        stamina: s.stamina, maxStamina: s.maxStamina,
      },
    };
  }

  function startService(stage) {
    const mp = toMinigamePlayer();
    if (player.position === "manager" && typeof ManagerService !== "undefined") {
      show("cooking-mgr");
      ManagerService.start(stage, mp, (result) => onServiceFinish(stage, result));
    } else {
      show("cooking");
      document.getElementById("svc-msg").textContent = "";
      Cooking.start(stage, mp, (result) => onServiceFinish(stage, result));
    }
  }

  function onServiceFinish(stage, result) {
    const p = POSITIONS[player.position];
    const ratingMult = (p.bonus.ratingMult || 1);
    const gainedStore = Math.round(result.score * ratingMult);
    player.storeScore += gainedStore;
    player.serviceCount++;

    log(`🏁 営業終了「${stage.name}」 ${result.score}点 → 店評価 +${gainedStore}`, "good");
    const rateForReact = result.total ? result.served / result.total : 1;
    pendingReact = { type: rateForReact >= 0.6 ? "service_good" : "service_bad" };

    // 営業結果を評価に反映（客評価＝提供率、大将＝スコア、同僚＝逃しの少なさ）
    const sv = BALANCE.service;
    const evalSummary = applyEffects({
      customer: Math.round((rateForReact - 0.55) * sv.customerRateMul),
      boss: Math.min(sv.bossGainMax, Math.round(result.score / sv.bossScoreDiv)),
      coworker: result.lost === 0 ? sv.coworkerNoLost : (rateForReact < 0.5 ? -2 : 1),
    });
    if (evalSummary) log(`📊 評価の変化：${evalSummary}`, "sys");

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

  /* ---------- 最終評価（エンディング分岐＋店の格） ---------- */
  function finishGame() {
    const stats = statTotal();
    // エンディング：能力・評価・ストレスの組み合わせで分岐（data/endings.js）
    const ending = EndingLogic.decide(player, stats);
    // 店の格（ミシュラン）はサブ評価として残す
    const overall = Math.round(stats * 0.7 + player.storeScore / 6);
    let tier = MICHELIN[0];
    for (const m of MICHELIN) if (overall >= m.min) tier = m;

    show("result");
    const p = POSITIONS[player.position];
    const e = player.evals;

    document.getElementById("result-body").innerHTML = `
      <div class="muted">${p.icon} ${p.name}としての${TOTAL_WEEKS}週間が終わった</div>
      <div class="big-stars">${ending.icon}</div>
      <div class="michelin-title">${ending.title}</div>
      <div class="result-comment">${ending.comment}</div>
      <div class="divider"></div>
      <div style="max-width:420px;margin:0 auto;text-align:left;">
        ${TRAINABLE.map(k => `<div class="row"><span>${STATS[k].icon}${STATS[k].name}</span><b>${player.stats[k]}</b></div>`).join("")}
        <div class="divider"></div>
        <div class="row"><span>${EVALS.boss.icon}${EVALS.boss.name}</span><b>${e.boss}</b></div>
        <div class="row"><span>${EVALS.coworker.icon}${EVALS.coworker.name}</span><b>${e.coworker}</b></div>
        <div class="row"><span>${EVALS.customer.icon}${EVALS.customer.name}</span><b>${e.customer}</b></div>
        <div class="row"><span>${METERS.stress.icon}${METERS.stress.name}</span><b>${player.meters.stress}</b></div>
        <div class="divider"></div>
        <div class="row"><span>ステータス合計</span><b>${stats}</b></div>
        <div class="row"><span>店の格</span><b style="color:var(--accent2)">${tier.title}</b>（${storeStarLabel(player.storeScore)}）</div>
      </div>
    `;
    document.getElementById("btn-replay").onclick = () => { show("title"); };
  }

  /* ---------- 初期化 ---------- */
  function init() {
    initTitle();
    document.getElementById("btn-pos-back").onclick = () => show("title");
    document.getElementById("btn-pos-decide").onclick = decidePosition;
    const hint = document.getElementById("btn-hint");
    if (hint) hint.onclick = () => {
      if (typeof Chara !== "undefined") Chara.react("hint", { position: player.position, target: "success" });
    };
    const itemBtn = document.getElementById("btn-items");
    if (itemBtn) itemBtn.onclick = openItems;
    const itemClose = document.getElementById("btn-items-close");
    if (itemClose) itemClose.onclick = closeItems;
    const itemModal = document.getElementById("item-modal");
    if (itemModal) itemModal.onclick = (e) => { if (e.target === itemModal) closeItems(); };
    const allocBtn = document.getElementById("btn-alloc");
    if (allocBtn) allocBtn.onclick = openAlloc;
    const allocClose = document.getElementById("btn-alloc-close");
    if (allocClose) allocClose.onclick = closeAlloc;
    const allocModal = document.getElementById("alloc-modal");
    if (allocModal) allocModal.onclick = (e) => { if (e.target === allocModal) closeAlloc(); };
    show("title");
  }

  return { init, log, show };
})();

window.addEventListener("DOMContentLoaded", Game.init);
