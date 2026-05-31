/* =========================================================================
 * 鮨サクセス — 営業パート（試合に相当するアクションミニゲーム）
 *
 * お客さんが時間差でやってきて注文する。プレイヤーは「ステーション」を
 * 順番にタップして、注文どおりの手順で料理を組み立て、提供する。
 * 制限時間 / 客の我慢ゲージ管理がある。育成ステータスが各パラメータに影響。
 * ========================================================================= */

const Cooking = (() => {
  let state = null;
  let rafId = null;
  let lastTs = 0;

  // 営業開始。stage = SERVICE_STAGES の1つ。player = Success のプレイヤー。
  function start(stage, player, onFinish) {
    const pos = POSITIONS[player.position];
    const b = pos.bonus || {};

    // ステータス影響の計算
    const timeLimit = stage.time + Math.floor(player.stats.speed * 0.25) + (b.timeBonus || 0);
    const patienceMult = (1 + player.stats.hospitality / 200) * (b.patience || 1);
    const tipMult = (b.tip || 1) * (1 + player.stats.hospitality / 150);
    const techMissResist = player.stats.tech; // ミス時のペナルティ軽減
    const scoreMult = (1 + player.stats.creativity / 120) * (b.scoreMult || 1);

    // 知識で解放されるレシピ
    const pool = RECIPES.filter(r => r.req <= player.stats.knowledge);

    state = {
      stage, player, pos, onFinish,
      timeLimit, timeLeft: timeLimit,
      patienceMult, tipMult, techMissResist, scoreMult, pool,
      score: 0, served: 0, lost: 0, mistakes: 0, combo: 0, maxCombo: 0,
      orders: [],            // 現在テーブルにある注文
      activeId: null,        // 選択中の注文
      build: [],             // 組み立て中の手順（actionId列）
      spawnTimer: 1.0,       // 次の客までの秒
      spawnedCount: 0,
      nextOrderId: 1,
      running: true,
      finished: false,
    };

    renderStations();
    bindStations();
    document.getElementById("svc-stage-name").textContent = stage.name;
    lastTs = 0;
    rafId = requestAnimationFrame(loop);
    render();
  }

  function loop(ts) {
    if (!state || !state.running) return;
    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.1);
    lastTs = ts;

    state.timeLeft -= dt;

    // 客の出現
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0 && state.spawnedCount < state.stage.customers) {
      spawnOrder();
      state.spawnTimer = state.stage.interval * (0.8 + Math.random() * 0.4);
    }

    // 我慢ゲージ
    for (const o of state.orders) {
      o.patience -= dt;
      if (o.patience <= 0) {
        // 客が帰る
        o.leaving = true;
      }
    }
    const leaving = state.orders.filter(o => o.leaving);
    if (leaving.length) {
      for (const o of leaving) {
        state.lost++;
        state.combo = 0;
        log(`💢 ${o.recipe.name} のお客さんが帰ってしまった…`, "bad");
      }
      state.orders = state.orders.filter(o => !o.leaving);
      if (state.activeId && !state.orders.find(o => o.id === state.activeId)) state.activeId = null;
      renderOrders();
    }

    // 終了判定
    if (state.timeLeft <= 0 &&
        state.spawnedCount >= state.stage.customers) {
      // 残っている注文を捌き切るか、時間切れで終了
      if (state.orders.length === 0 || state.timeLeft <= -5) {
        finish();
        return;
      }
    }
    if (state.timeLeft <= -8) { finish(); return; }

    renderDynamic();
    rafId = requestAnimationFrame(loop);
  }

  function spawnOrder() {
    const recipe = state.pool[Math.floor(Math.random() * state.pool.length)];
    const basePatience = state.stage.patience * state.patienceMult
      * (1 + recipe.steps.length * 0.15);
    const o = {
      id: state.nextOrderId++,
      recipe,
      maxPatience: basePatience,
      patience: basePatience,
      progress: 0,    // 何手目まで合っているか
      leaving: false,
    };
    state.orders.push(o);
    state.spawnedCount++;
    if (!state.activeId) state.activeId = o.id;
    log(`🔔 ご来店：「${recipe.name}」`, "sys");
    renderOrders();
  }

  // ステーションがクリックされた
  function tapStation(actionId) {
    if (!state || !state.running) return;
    if (state.activeId == null) {
      flashMsg("注文を選んでね", true);
      return;
    }
    const o = state.orders.find(x => x.id === state.activeId);
    if (!o) return;

    const expected = o.recipe.steps[o.progress];
    if (actionId === expected) {
      o.progress++;
      pop(`+`, "#6fae5a");
      // 提供完了
      if (o.recipe.steps[o.progress - 1] === "serve" || o.progress >= o.recipe.steps.length) {
        completeOrder(o);
      } else {
        markStation(actionId, true);
      }
    } else {
      // ミス
      state.mistakes++;
      state.combo = 0;
      // 技術が高いほど我慢の減りが小さい
      const penalty = Math.max(0.4, 2.0 - state.techMissResist / 60);
      o.patience = Math.max(0, o.patience - penalty);
      markStation(actionId, false);
      pop("×", "#e88");
      flashMsg("手順が違う！", true);
    }
    renderOrders();
  }

  function completeOrder(o) {
    const speedRatio = o.patience / o.maxPatience;     // 早いほど高評価
    const comboBonus = 1 + Math.min(state.combo, 10) * 0.04;
    let gained = o.recipe.score * state.scoreMult * (0.7 + speedRatio * 0.5) * comboBonus;
    // チップ
    const tip = (speedRatio > 0.5 ? 1 : 0) * 20 * state.tipMult;
    gained = Math.round(gained + tip);

    state.score += gained;
    state.served++;
    state.combo++;
    state.maxCombo = Math.max(state.maxCombo, state.combo);

    state.orders = state.orders.filter(x => x.id !== o.id);
    if (state.activeId === o.id) {
      state.activeId = state.orders.length ? state.orders[0].id : null;
    }
    pop(`+${gained}`, "#e8b84b");
    const star = speedRatio > 0.6 ? "✨" : "";
    log(`🍣 提供！「${o.recipe.name}」 +${gained}点 ${star}${state.combo > 1 ? ` (${state.combo}コンボ)` : ""}`, "good");
  }

  function finish() {
    state.running = false;
    state.finished = true;
    cancelAnimationFrame(rafId);
    rafId = null;
    const result = {
      score: state.score,
      served: state.served,
      lost: state.lost,
      mistakes: state.mistakes,
      maxCombo: state.maxCombo,
      total: state.spawnedCount,
    };
    state.onFinish(result);
  }

  function abort() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (state) state.running = false;
  }

  /* ---------- 描画 ---------- */
  function renderStations() {
    const wrap = document.getElementById("stations");
    // 営業で使う食材/工程ステーション
    const ids = ["rice","nori","cut","maguro","salmon","tamago","ebi","ikura","uni","wasabi","soup","fry","serve"];
    wrap.innerHTML = "";
    for (const id of ids) {
      const a = ACTIONS[id];
      const el = document.createElement("button");
      el.className = "station" + (id === "serve" ? " serve" : "") + (id === "cut" ? " cut" : "");
      el.dataset.id = id;
      el.innerHTML = `<span class="st-i">${a.icon}</span><span class="st-l">${a.label}</span>`;
      wrap.appendChild(el);
    }
  }

  function bindStations() {
    const wrap = document.getElementById("stations");
    wrap.onclick = (e) => {
      const btn = e.target.closest(".station");
      if (btn) tapStation(btn.dataset.id);
    };
  }

  function markStation(id, ok) {
    const el = document.querySelector(`.station[data-id="${id}"]`);
    if (!el) return;
    el.classList.remove("flash", "shake");
    void el.offsetWidth;
    el.classList.add(ok ? "flash" : "shake");
  }

  function render() { renderOrders(); renderDynamic(); }

  function renderDynamic() {
    const t = Math.max(0, state.timeLeft);
    document.getElementById("svc-time").textContent = Math.ceil(t);
    const pct = Math.max(0, Math.min(100, (state.timeLeft / state.timeLimit) * 100));
    document.getElementById("svc-timer-fill").style.width = pct + "%";
    document.getElementById("svc-score").textContent = state.score;
    document.getElementById("svc-served").textContent =
      `提供 ${state.served} / 来客 ${state.spawnedCount}（逃し ${state.lost}）`;
    // 我慢ゲージのみ毎フレーム更新
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
    for (const o of state.orders) {
      const el = document.createElement("div");
      el.className = "order" + (o.id === state.activeId ? " active" : "");
      el.dataset.id = o.id;
      const steps = o.recipe.steps.map((s, i) => {
        const a = ACTIONS[s];
        let cls = "";
        if (i < o.progress) cls = "done";
        else if (i === o.progress && o.id === state.activeId) cls = "next";
        return `<span class="${cls}">${a.icon}</span>`;
      }).join("");
      el.innerHTML = `
        <div class="o-icon">${o.recipe.icon}</div>
        <div class="o-name">${o.recipe.name}</div>
        <div class="o-steps">${steps}</div>
        <div class="o-pat"><i style="width:${(o.patience/o.maxPatience)*100}%"></i></div>`;
      el.onclick = () => { state.activeId = o.id; renderOrders(); };
      wrap.appendChild(el);
    }
  }

  /* ---------- 演出 ---------- */
  function pop(text, color) {
    const active = document.querySelector(".order.active") || document.getElementById("svc-score");
    const r = active.getBoundingClientRect();
    const el = document.createElement("div");
    el.className = "float-pop";
    el.textContent = text;
    el.style.color = color;
    el.style.left = (r.left + r.width / 2) + "px";
    el.style.top = (r.top) + "px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  let msgTimer = null;
  function flashMsg(text, bad) {
    const el = document.getElementById("svc-msg");
    el.textContent = text;
    el.style.color = bad ? "#e88" : "#6fae5a";
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => { el.textContent = ""; }, 900);
  }

  function log(text, kind) {
    if (window.Game) Game.log(text, kind);
  }

  return { start, abort };
})();
