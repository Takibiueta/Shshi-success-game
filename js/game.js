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
      exp: 0,               // 経験点（能力アップで振り分け）
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

  function clamp100(v) { return Math.max(0, Math.min(100, v)); }

  // 効果（イベント / アイテム共通）を適用
  function applyEffects(eff) {
    for (const [k, v] of Object.entries(eff)) {
      if (k === "all") {
        for (const t of TRAINABLE) player.stats[t] = clamp100(player.stats[t] + v);
      } else if (k === "stamina") {
        player.stats.stamina = Math.max(0, Math.min(player.stats.maxStamina, player.stats.stamina + v));
      } else if (player.stats[k] != null) {
        player.stats[k] = clamp100(player.stats[k] + v);
      }
    }
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
  function gainExp(n) { player.exp = (player.exp || 0) + n; }

  function allocCostFor(k, v) {
    const p = POSITIONS[player.position];
    let c = allocCostAt(v);
    if (k === p.main) c = Math.max(1, Math.round(c * 0.7)); // 得意能力は割引
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

    // 通常週：訓練コマンド（経験点を稼ぐ）
    const p = POSITIONS[player.position];
    const mainStat = STATS[p.main];
    const specialty = {
      id: "specialty", icon: mainStat.icon, name: `${mainStat.name}修練★`,
      exp: [16, 22], cost: 20, kindColor: p.main,
      note: `得意の${mainStat.name}を磨く。経験点+16〜22 / 体力-20`,
    };
    const list = TRAININGS.concat([specialty]);
    for (const t of list) {
      const el = document.createElement("button");
      el.className = "cmd";
      el.dataset.kind = t.kindColor || t.id;
      el.disabled = player.stats.stamina < t.cost;
      el.innerHTML = `
        <span class="ci">${t.icon}</span>
        <span class="ct">${t.name}</span>
        <span class="cd">経験点+${t.exp[0]}〜${t.exp[1]} / 体力-${t.cost}</span>`;
      el.onclick = () => doTrain(t);
      el.onpointerenter = () => previewCmd(`${t.icon}${t.name}：${t.note || "経験点を稼ぐ"}`);
      el.onpointerleave = () => clearPreview();
      grid.appendChild(el);
    }
    // 休養
    const rest = document.createElement("button");
    rest.className = "cmd rest";
    rest.dataset.kind = "rest";
    rest.innerHTML = `<span class="ci">😴</span><span class="ct">休養</span><span class="cd">体力+45 回復</span>`;
    rest.onclick = () => doRest();
    rest.onpointerenter = () => previewCmd("😴休養：体力を+45回復する（経験点は入らない）");
    rest.onpointerleave = () => clearPreview();
    grid.appendChild(rest);

    // 食べ歩き（経験点少＋アイテム発見チャンス）
    const study = document.createElement("button");
    study.className = "cmd";
    study.dataset.kind = "study";
    study.disabled = player.stats.stamina < 12;
    study.innerHTML = `<span class="ci">🍱</span><span class="ct">食べ歩き</span><span class="cd">経験点+少 / 体力-12</span>`;
    study.onclick = () => doStudy();
    study.onpointerenter = () => previewCmd("🍱食べ歩き：経験点+6〜12。たまにアイテムを発見（体力-12）");
    study.onpointerleave = () => clearPreview();
    grid.appendChild(study);
  }

  function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function doTrain(t) {
    if (player.stats.stamina < t.cost) return;
    player.stats.stamina -= t.cost;
    let gain = rand(t.exp[0], t.exp[1]);
    let failed = false;
    // 猛特訓は疲労時に失敗しやすい
    if (t.risk && player.stats.stamina < 22 && Math.random() < 0.4) {
      failed = true;
      gain = Math.max(2, Math.floor(gain * 0.35));
    }
    gainExp(gain);
    if (failed) { log(`😣 疲労で身が入らず…経験点+${gain}`, "bad"); pendingReact = { type: "train_fail" }; }
    else { log(`${t.icon} ${t.name}！ 経験点+${gain}`, "good"); pendingReact = { type: "train_good", ctx: { stat: "経験点" } }; }
    clearPreview();
    advanceWeek();
    if (!failed && document.getElementById("success").classList.contains("active")) {
      fxSparkle();
      fxGain(`経験点 +${gain}`);
    }
  }

  function doRest() {
    player.stats.stamina = Math.min(player.stats.maxStamina, player.stats.stamina + 45);
    log(`😴 ゆっくり休んだ。体力が回復した。`, "sys");
    pendingReact = { type: "rest" };
    advanceWeek();
  }

  function doStudy() {
    if (player.stats.stamina < 12) return;
    player.stats.stamina -= 12;
    const g = rand(6, 12);
    gainExp(g);
    let extra = "";
    if (Math.random() < 0.3) {
      const ids = Object.keys(ITEMS);
      const id = ids[rand(0, ids.length - 1)];
      addItem(id);
      extra = ` ${ITEMS[id].icon}${ITEMS[id].name}を見つけた！`;
    }
    log(`🍱 食べ歩きで見聞を広めた。経験点+${g}${extra}`, "good");
    pendingReact = { type: "study" };
    advanceWeek();
  }

  // 週を進める：イベント抽選 → 次の描画
  function advanceWeek() {
    player.week++;
    if (player.week > TOTAL_WEEKS) {
      finishGame();
      return;
    }
    // 営業日でなければ一定確率でイベント（共通＋ポジション専用）
    const isServiceDay = SERVICE_STAGES.some(s => s.day === player.week);
    if (!isServiceDay && Math.random() < 0.5) {
      const pool = EVENTS.filter(e => !e.pos || e.pos === player.position);
      const ev = pool[rand(0, pool.length - 1)];
      showEvent(ev);
    } else {
      renderSuccess();
    }
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
      b.textContent = c.label;
      b.onclick = () => resolveEvent(c);
      wrap.appendChild(b);
    });
  }

  function resolveEvent(choice) {
    if (choice.effects) applyEffects(choice.effects);
    if (choice.exp) gainExp(choice.exp);
    if (choice.item) addItem(choice.item);
    log(`📖 ${choice.msg}`, "good");
    pendingReact = { type: "event_done", ctx: { msg: choice.msg } };
    show("success");
    renderSuccess();
  }

  /* ---------- 営業（試合）へ ---------- */
  function startService(stage) {
    if (player.position === "manager" && typeof ManagerService !== "undefined") {
      show("cooking-mgr");
      ManagerService.start(stage, player, (result) => onServiceFinish(stage, result));
    } else {
      show("cooking");
      document.getElementById("svc-msg").textContent = "";
      Cooking.start(stage, player, (result) => onServiceFinish(stage, result));
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
