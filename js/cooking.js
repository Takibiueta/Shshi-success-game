/* =========================================================================
 * 鮨サクセス — 営業パート（Overcookedスタイルのアクション）
 *
 * 上から見たキッチンでシェフ🧑‍🍳を自分で操作する。
 * 食材台・調理台に近づいて作業ボタンを押すと「トレイ」に工程が積まれる。
 * 注文どおりの手順で組み立て、提供口まで運んで提供する。
 * 間違えたらゴミ箱で片付けてやり直し。
 * 育成ステータスが移動速度・制限時間・我慢・チップ・スコアに影響。
 * ========================================================================= */

const Cooking = (() => {
  let state = null;
  let rafId = null;
  let lastTs = 0;

  // キャンバスの論理サイズ（CSSで画面幅に合わせて拡縮）
  const W = 760, H = 440;
  const TILE_W = 98, TILE_H = 68;
  const REACH = 82;            // 台に作業できる距離

  // ステーションの配置（上段＝食材、下段＝皿/加工/提供/ゴミ箱）
  const LAYOUT = {
    top:    ["rice", "maguro", "salmon", "tamago", "ebi", "ikura", "uni"],
    bottom: ["plate", "nori", "wasabi", "cut", "soup", "fry", "serve", "trash"],
  };
  // ACTIONS に無い台の見た目
  const EXTRA = {
    plate: { icon: "🍽️", label: "お皿" },
    serve: { icon: "🛎️", label: "提供口" },
    trash: { icon: "🗑️", label: "片付け" },
  };
  // 台ごとの色
  const COLORS = {
    plate: "#3c6a8a", serve: "#4c8a3c", trash: "#5a4038", cut: "#5a4c8a",
    soup: "#8a6a3c", fry: "#a05a30",
  };

  /* ---------- 開始 ---------- */
  function start(stage, player, onFinish) {
    const pos = POSITIONS[player.position];
    const b = pos.bonus || {};

    const timeLimit = stage.time + Math.floor(player.stats.speed * 0.25) + (b.timeBonus || 0);
    const patienceMult = (1 + player.stats.hospitality / 200) * (b.patience || 1);
    const tipMult = (b.tip || 1) * (1 + player.stats.hospitality / 150);
    const techMissResist = player.stats.tech;
    const scoreMult = (1 + player.stats.creativity / 120) * (b.scoreMult || 1);
    const moveSpeed = 150 + player.stats.speed * 1.6;   // スピードで移動が速くなる
    const pool = RECIPES.filter(r => r.req <= player.stats.knowledge);

    state = {
      stage, player, pos, onFinish,
      timeLimit, timeLeft: timeLimit,
      patienceMult, tipMult, techMissResist, scoreMult, moveSpeed, pool,
      score: 0, served: 0, lost: 0, mistakes: 0, combo: 0, maxCombo: 0,
      orders: [],
      hasPlate: false,          // お皿を持っているか（持っていないと組み立て不可）
      tray: [],                 // 今のお皿に乗っている工程の列
      spawnTimer: 1.0,
      spawnedCount: 0,
      nextOrderId: 1,
      running: true,
      finished: false,
      // プレイヤー & 入力
      px: W / 2, py: H / 2, facing: 1,
      input: { up: false, down: false, left: false, right: false },
      pressed: new Set(),
      actionCd: 0,
      nearId: null,             // 今作業できる台
      stations: [],
      pops: [],                 // canvas上の演出
    };

    buildStations();
    setupCanvas();
    bindInput();
    document.getElementById("svc-stage-name").textContent = stage.name;
    lastTs = 0;
    rafId = requestAnimationFrame(loop);
    render();
  }

  function buildStations() {
    const pad = 14, gap = 7;
    const kindOf = id =>
      id === "serve" ? "serve" : id === "trash" ? "trash" :
      id === "plate" ? "plate" : "step";
    const place = (ids, y) => {
      const n = ids.length;
      const tw = (W - 2 * pad - (n - 1) * gap) / n;   // 段の数に合わせて幅を調整
      return ids.map((id, i) => {
        const x = pad + i * (tw + gap);
        return {
          id, x, y, w: tw, h: TILE_H,
          cx: x + tw / 2, cy: y + TILE_H / 2, kind: kindOf(id),
        };
      });
    };
    state.stations = [
      ...place(LAYOUT.top, 14),
      ...place(LAYOUT.bottom, H - 14 - TILE_H),
    ];
  }

  /* ---------- ループ ---------- */
  function loop(ts) {
    if (!state || !state.running) return;
    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.1);
    lastTs = ts;

    update(dt);
    draw();
    renderDynamic();

    rafId = requestAnimationFrame(loop);
  }

  function update(dt) {
    state.timeLeft -= dt;
    if (state.actionCd > 0) state.actionCd -= dt;

    // 移動
    let dx = (state.input.right ? 1 : 0) - (state.input.left ? 1 : 0);
    let dy = (state.input.down ? 1 : 0) - (state.input.up ? 1 : 0);
    if (dx || dy) {
      const len = Math.hypot(dx, dy) || 1;
      state.px += (dx / len) * state.moveSpeed * dt;
      state.py += (dy / len) * state.moveSpeed * dt;
      if (dx) state.facing = dx > 0 ? 1 : -1;
    }
    // 移動範囲（上下の台に手が届く通路）
    const r = 18;
    state.px = Math.max(25, Math.min(W - 25, state.px));
    state.py = Math.max(14 + TILE_H + r, Math.min(H - 14 - TILE_H - r, state.py));

    // 近くの台を判定
    let best = null, bestD = REACH;
    for (const s of state.stations) {
      const d = Math.hypot(state.px - s.cx, state.py - s.cy);
      if (d < bestD) { bestD = d; best = s; }
    }
    state.nearId = best ? best.id : null;

    // 客の出現
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0 && state.spawnedCount < state.stage.customers) {
      spawnOrder();
      state.spawnTimer = state.stage.interval * (0.8 + Math.random() * 0.4);
    }

    // 我慢ゲージ
    let anyLeft = false;
    for (const o of state.orders) {
      o.patience -= dt;
      if (o.patience <= 0) o.leaving = true;
    }
    const leaving = state.orders.filter(o => o.leaving);
    if (leaving.length) {
      for (const o of leaving) {
        state.lost++;
        state.combo = 0;
        addPop(W / 2, 130, "🏃 退店…", "#e88");
        log(`💢 ${o.recipe.name} のお客さんが帰ってしまった…`, "bad");
      }
      state.orders = state.orders.filter(o => !o.leaving);
      anyLeft = true;
    }
    if (anyLeft) renderOrders();

    // 演出の寿命
    for (const p of state.pops) p.life -= dt;
    state.pops = state.pops.filter(p => p.life > 0);

    // 終了判定
    if (state.timeLeft <= 0 && state.spawnedCount >= state.stage.customers) {
      if (state.orders.length === 0 || state.timeLeft <= -5) { finish(); return; }
    }
    if (state.timeLeft <= -8) { finish(); return; }
  }

  function spawnOrder() {
    const recipe = state.pool[Math.floor(Math.random() * state.pool.length)];
    const basePatience = state.stage.patience * state.patienceMult
      * (1 + recipe.steps.length * 0.15);
    state.orders.push({
      id: state.nextOrderId++,
      recipe,
      maxPatience: basePatience,
      patience: basePatience,
      leaving: false,
    });
    state.spawnedCount++;
    log(`🔔 ご来店：「${recipe.name}」`, "sys");
    renderOrders();
  }

  /* ---------- 作業（アクションボタン） ---------- */
  function doAction() {
    if (!state || !state.running) return;
    if (state.actionCd > 0) return;
    state.actionCd = 0.12;

    const id = state.nearId;
    if (!id) { flashMsg("近くに台がないよ", true); return; }
    const s = state.stations.find(x => x.id === id);

    // お皿を取る
    if (s.kind === "plate") {
      if (state.hasPlate) { flashMsg("もうお皿を持っているよ"); return; }
      state.hasPlate = true;
      state.tray = [];
      markStation(id);
      addPop(s.cx, s.cy, "🍽️ お皿GET", "#6fb0d8");
      renderOrders();
      return;
    }

    if (s.kind === "serve") { tryServe(); return; }

    if (s.kind === "trash") {
      if (!state.hasPlate) { flashMsg("片付けるお皿がない"); return; }
      state.hasPlate = false;
      state.tray = [];
      addPop(state.px, state.py - 28, "片付けた", "#b6a489");
      flashMsg("お皿を片付けた");
      renderOrders();
      return;
    }

    // 食材/加工台 → お皿に工程を積む（お皿が必要）
    if (!state.hasPlate) { flashMsg("先にお皿を取ろう！", true); return; }
    state.tray.push(id);
    markStation(id);
    addPop(s.cx, s.cy, `+${ACTIONS[id].icon}`, "#6fae5a");
    renderOrders();
  }

  function tryServe() {
    if (!state.hasPlate) { flashMsg("お皿を持っていないよ", true); return; }
    if (state.tray.length === 0) { flashMsg("まず料理を組み立てよう", true); return; }
    const trayKey = state.tray.join(",");
    const matches = state.orders.filter(
      o => o.recipe.steps.slice(0, -1).join(",") === trayKey
    );
    if (matches.length === 0) {
      // 注文と一致しない
      state.mistakes++;
      state.combo = 0;
      const penalty = Math.max(0.4, 2.0 - state.techMissResist / 60);
      // 一番急いでいる客がさらに不機嫌に
      const urgent = state.orders.slice().sort((a, b) => a.patience - b.patience)[0];
      if (urgent) urgent.patience = Math.max(0, urgent.patience - penalty);
      addPop(state.px, state.py - 28, "×注文と違う", "#e88");
      flashMsg("どの注文とも違う！ ゴミ箱でやり直し", true);
      return;
    }
    matches.sort((a, b) => a.patience - b.patience); // 急ぎの客から
    completeOrder(matches[0]);
    state.tray = [];
    state.hasPlate = false;     // お皿は提供で出ていく → 取り直し
    renderOrders();
  }

  function completeOrder(o) {
    const speedRatio = o.patience / o.maxPatience;
    const comboBonus = 1 + Math.min(state.combo, 10) * 0.04;
    let gained = o.recipe.score * state.scoreMult * (0.7 + speedRatio * 0.5) * comboBonus;
    const tip = (speedRatio > 0.5 ? 1 : 0) * 20 * state.tipMult;
    gained = Math.round(gained + tip);

    state.score += gained;
    state.served++;
    state.combo++;
    state.maxCombo = Math.max(state.maxCombo, state.combo);

    state.orders = state.orders.filter(x => x.id !== o.id);
    const star = speedRatio > 0.6 ? "✨" : "";
    addPop(state.px, state.py - 30, `+${gained}`, "#e8b84b");
    log(`🍣 提供！「${o.recipe.name}」 +${gained}点 ${star}${state.combo > 1 ? ` (${state.combo}コンボ)` : ""}`, "good");
  }

  /* ---------- 終了 ---------- */
  function finish() {
    state.running = false;
    state.finished = true;
    cancelAnimationFrame(rafId);
    rafId = null;
    unbindInput();
    state.onFinish({
      score: state.score,
      served: state.served,
      lost: state.lost,
      mistakes: state.mistakes,
      maxCombo: state.maxCombo,
      total: state.spawnedCount,
    });
  }

  function abort() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (state) state.running = false;
    unbindInput();
  }

  /* ---------- 入力 ---------- */
  let keyDown = null, keyUp = null, touchHandlers = [];

  function bindInput() {
    const map = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", s: "down", a: "left", d: "right",
      W: "up", S: "down", A: "left", D: "right",
    };
    keyDown = (e) => {
      if (!state || !state.running) return;
      if (map[e.key]) { state.input[map[e.key]] = true; e.preventDefault(); }
      else if (e.key === " " || e.key === "Enter" || e.key === "j" || e.key === "k") {
        if (!e.repeat) doAction();
        e.preventDefault();
      }
    };
    keyUp = (e) => {
      if (!state) return;
      if (map[e.key]) { state.input[map[e.key]] = false; e.preventDefault(); }
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    // 画面上の十字キー / ボタン（スマホ用）
    const bindHold = (sel, dir) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const on = (e) => { e.preventDefault(); if (state) state.input[dir] = true; };
      const off = (e) => { e.preventDefault(); if (state) state.input[dir] = false; };
      el.addEventListener("pointerdown", on);
      el.addEventListener("pointerup", off);
      el.addEventListener("pointerleave", off);
      el.addEventListener("pointercancel", off);
      touchHandlers.push([el, "pointerdown", on], [el, "pointerup", off],
        [el, "pointerleave", off], [el, "pointercancel", off]);
    };
    bindHold("#pad-up", "up");
    bindHold("#pad-down", "down");
    bindHold("#pad-left", "left");
    bindHold("#pad-right", "right");

    const act = document.querySelector("#btn-action");
    if (act) {
      const onAct = (e) => { e.preventDefault(); doAction(); };
      act.addEventListener("pointerdown", onAct);
      touchHandlers.push([act, "pointerdown", onAct]);
    }
  }

  function unbindInput() {
    if (keyDown) window.removeEventListener("keydown", keyDown);
    if (keyUp) window.removeEventListener("keyup", keyUp);
    keyDown = keyUp = null;
    for (const [el, ev, fn] of touchHandlers) el.removeEventListener(ev, fn);
    touchHandlers = [];
  }

  /* ---------- 描画（canvas） ---------- */
  let ctx = null, canvas = null, flashMap = {};

  function setupCanvas() {
    canvas = document.getElementById("kitchen");
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext("2d");
    flashMap = {};
  }

  function markStation(id) { flashMap[id] = 0.25; }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    if (!ctx) return;
    // 床
    ctx.fillStyle = "#241c14";
    ctx.fillRect(0, 0, W, H);
    // 通路のタイル模様
    ctx.fillStyle = "#2a2017";
    for (let x = 0; x < W; x += 40) {
      for (let y = TILE_H + 20; y < H - TILE_H - 20; y += 40) {
        if (((x + y) / 40) % 2 === 0) ctx.fillRect(x, y, 40, 40);
      }
    }

    // ステーション
    for (const s of state.stations) {
      const near = state.nearId === s.id;
      const fl = flashMap[s.id] || 0;
      if (fl > 0) flashMap[s.id] = fl - 0.016;
      const meta = ACTIONS[s.id] || EXTRA[s.id];

      ctx.save();
      roundRect(s.x, s.y, s.w, s.h, 12);
      ctx.fillStyle = COLORS[s.id] || "#3a2e23";
      ctx.fill();
      // ハイライト枠
      ctx.lineWidth = near ? 4 : 1.5;
      ctx.strokeStyle = near ? "#e8b84b" : "#4a3c2e";
      if (fl > 0) ctx.strokeStyle = "#fff";
      ctx.stroke();
      ctx.restore();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "28px serif";
      ctx.fillText(meta.icon, s.cx, s.cy - 8);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#f5ead6";
      ctx.fillText(meta.label, s.cx, s.cy + 20);

      if (near) {
        ctx.font = "11px sans-serif";
        ctx.fillStyle = "#e8b84b";
        ctx.fillText("◉ 作業できる", s.cx, s.y - 8);
      }
    }

    // プレイヤー
    const { px, py } = state;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.5)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(px, py, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#e8b84b";
    ctx.fill();
    ctx.restore();
    ctx.font = "26px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🧑‍🍳", px, py + 1);

    // お皿（頭上の吹き出し）— お皿を持っているときだけ表示
    if (state.hasPlate) {
      const icons = ["🍽️", ...state.tray.map(id => ACTIONS[id].icon)];
      const bw = 22 * icons.length + 14;
      const bx = px - bw / 2, by = py - 52;
      ctx.save();
      roundRect(bx, by, bw, 30, 8);
      ctx.fillStyle = "rgba(20,16,12,.92)";
      ctx.fill();
      ctx.strokeStyle = "#e8b84b";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      ctx.font = "18px serif";
      icons.forEach((ic, i) => ctx.fillText(ic, bx + 18 + i * 22, by + 16));
    }

    // 演出ポップ
    for (const p of state.pops) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
      ctx.font = "bold 18px sans-serif";
      ctx.fillStyle = p.color;
      ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y - (1 - p.life) * 30);
      ctx.restore();
    }
  }

  function addPop(x, y, text, color) {
    state.pops.push({ x, y, text, color, life: 0.9 });
  }

  /* ---------- 描画（DOM：注文/HUD） ---------- */
  function render() { renderOrders(); renderDynamic(); }

  function renderDynamic() {
    if (!state) return;
    const t = Math.max(0, state.timeLeft);
    document.getElementById("svc-time").textContent = Math.ceil(t);
    const pct = Math.max(0, Math.min(100, (state.timeLeft / state.timeLimit) * 100));
    document.getElementById("svc-timer-fill").style.width = pct + "%";
    document.getElementById("svc-score").textContent = state.score;
    document.getElementById("svc-served").textContent =
      `提供 ${state.served} / 来客 ${state.spawnedCount}（逃し ${state.lost}）`;
    for (const o of state.orders) {
      const el = document.querySelector(`.order[data-id="${o.id}"]`);
      if (!el) continue;
      const p = Math.max(0, o.patience / o.maxPatience);
      const fill = el.querySelector(".o-pat > i");
      if (fill) fill.style.width = (p * 100) + "%";
      el.classList.toggle("warn", p < 0.5 && p >= 0.25);
      el.classList.toggle("danger", p < 0.25);
    }
  }

  function renderOrders() {
    const wrap = document.getElementById("orders");
    wrap.innerHTML = "";
    if (state.orders.length === 0) {
      wrap.innerHTML = `<div class="muted" style="align-self:center;padding:20px;">お客さんを待っています…</div>`;
      return;
    }
    const trayKey = state.tray.join(",");
    for (const o of state.orders) {
      const stepsNoServe = o.recipe.steps.slice(0, -1);
      // 今のトレイがこの注文の「途中まで」一致しているか
      let matchLen = 0;
      let isPrefix = state.tray.length <= stepsNoServe.length;
      if (isPrefix) {
        for (let i = 0; i < state.tray.length; i++) {
          if (state.tray[i] !== stepsNoServe[i]) { isPrefix = false; break; }
        }
        if (isPrefix) matchLen = state.tray.length;
      }
      const exact = trayKey.length && stepsNoServe.join(",") === trayKey;

      const el = document.createElement("div");
      el.className = "order" + (exact ? " active" : "");
      el.dataset.id = o.id;
      const steps = o.recipe.steps.map((s, i) => {
        const a = ACTIONS[s];
        let cls = "";
        if (i < matchLen) cls = "done";
        else if (i === matchLen && matchLen > 0) cls = "next";
        return `<span class="${cls}">${a.icon}</span>`;
      }).join("");
      el.innerHTML = `
        <div class="o-icon">${o.recipe.icon}</div>
        <div class="o-name">${o.recipe.name}</div>
        <div class="o-steps">${steps}</div>
        <div class="o-pat"><i style="width:${(o.patience / o.maxPatience) * 100}%"></i></div>`;
      wrap.appendChild(el);
    }
  }

  /* ---------- メッセージ ---------- */
  let msgTimer = null;
  function flashMsg(text, bad) {
    const el = document.getElementById("svc-msg");
    el.textContent = text;
    el.style.color = bad ? "#e88" : "#6fae5a";
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => { el.textContent = ""; }, 1100);
  }

  function log(text, kind) {
    if (window.Game) Game.log(text, kind);
  }

  return { start, abort };
})();
