/* =========================================================================
 * 鮨サクセス — 営業パート（マネージャー専用・采配/配置型）
 *
 * 店全体を上から見て、テーブルに来た客を「スタッフ配置」で捌く。
 * テーブルをタップ → 手の空いたスタッフを割り当て（再タップで外す）。
 * 「急がせる/丁寧に/檄」の采配で店を回す。育成ステータスが効率・満足度・
 * 売上・名物率に影響。結果は Cooking と同じ形（score/served/lost…）で返す。
 * ========================================================================= */

const ManagerService = (() => {
  let state = null;
  let rafId = null;
  let lastTs = 0;

  const TABLES = 4;
  const STAFF = [
    { id: 0, name: "職人", icon: "🍣" },
    { id: 1, name: "キッチン", icon: "🍳" },
    { id: 2, name: "フロア", icon: "🍵" },
  ];
  // 注文の種（軽い→重い）
  const ORDERS = [
    { name: "にぎり", icon: "🍣", work: 90,  value: 90 },
    { name: "軍艦",   icon: "🍙", work: 110, value: 120 },
    { name: "天ぷら", icon: "🍤", work: 120, value: 130 },
    { name: "おまかせ", icon: "👑", work: 170, value: 230 },
  ];

  function start(stage, player, onFinish) {
    const s = player.stats;
    const timeLimit = stage.time + Math.round(s.speed * 0.2);
    // ステータス影響
    const rate = 14 + s.knowledge * 0.14 + s.speed * 0.10;   // スタッフ1人の処理速度
    const quality = 1 + s.tech / 280;                         // 技術：品質（売上）＆急がせ耐性
    const tipMul = 1 + s.hospitality / 120;                  // 接客：チップ
    const patience = (stage.patience + 8) * (1 + s.hospitality / 150);
    const meibutsu = Math.min(0.4, s.creativity / 260);       // 創作：名物テーブル率
    const b = (POSITIONS[player.position].bonus) || {};

    state = {
      stage, player, onFinish,
      timeLimit, timeLeft: timeLimit,
      rate, quality, tipMul, patience, meibutsu,
      score: 0, served: 0, lost: 0,
      tables: Array.from({ length: TABLES }, (_, i) => ({ id: i, occupied: false })),
      staff: STAFF.map(s => ({ ...s, busy: false, tableId: null })),
      spawnTimer: 0.6, spawnedCount: 0, customers: stage.customers, nextId: 1,
      globalMul: 1, rushT: 0, cheerT: 0,
      cdRush: 0, cdCare: 0, cdCheer: 0,
      running: true,
    };

    document.getElementById("mgr-stage-name").textContent = `${stage.name}（マネージャー）`;
    document.getElementById("mgr-msg").textContent = "";
    document.getElementById("mgr-hint").textContent =
      "テーブルをタップして空きスタッフを配置。客の我慢（下バー）が尽きる前に提供しよう。";
    bindDirectives();
    renderTables();
    renderStaff();
    lastTs = 0;
    rafId = requestAnimationFrame(loop);
  }

  function loop(ts) {
    if (!state || !state.running) return;
    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.1);
    lastTs = ts;
    update(dt);
    renderDynamic();
    rafId = requestAnimationFrame(loop);
  }

  function update(dt) {
    state.timeLeft -= dt;
    // 采配の効果時間／クールダウン
    state.rushT = Math.max(0, state.rushT - dt);
    state.cheerT = Math.max(0, state.cheerT - dt);
    state.cdRush = Math.max(0, state.cdRush - dt);
    state.cdCare = Math.max(0, state.cdCare - dt);
    state.cdCheer = Math.max(0, state.cdCheer - dt);
    state.globalMul = 1 * (state.rushT > 0 ? 1.8 : 1) * (state.cheerT > 0 ? 2.4 : 1);
    const drain = (state.rushT > 0 ? 1.5 : 1);

    // 来店（空きテーブルを埋める）
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0 && state.spawnedCount < state.customers) {
      const empty = state.tables.find(t => !t.occupied);
      if (empty) {
        spawnAt(empty);
        state.spawnTimer = state.stage.interval * (0.8 + Math.random() * 0.4);
      } else {
        state.spawnTimer = 0.5;
      }
    }

    // テーブル進行
    let changed = false;
    for (const t of state.tables) {
      if (!t.occupied) continue;
      t.patience -= dt * drain;
      const staff = state.staff.find(st => st.tableId === t.id);
      if (staff) t.progress += state.rate * state.globalMul * dt;
      if (t.progress >= t.work) { serveTable(t); changed = true; }
      else if (t.patience <= 0) { leaveTable(t); changed = true; }
    }
    if (changed) { renderTables(); renderStaff(); }

    // 終了
    if (state.timeLeft <= 0) {
      const anyActive = state.tables.some(t => t.occupied);
      if (!anyActive || state.timeLeft <= -6) { finish(); return; }
    }
  }

  function spawnAt(t) {
    const isMei = Math.random() < state.meibutsu;
    const base = isMei ? ORDERS[3] : ORDERS[Math.floor(Math.random() * 3)];
    t.occupied = true;
    t.order = base;
    t.meibutsu = isMei;
    t.work = base.work;
    t.progress = 0;
    t.maxPatience = state.patience * (isMei ? 1.2 : 1);
    t.patience = t.maxPatience;
    t.uid = state.nextId++;
    state.spawnedCount++;
    renderTables();
  }

  function serveTable(t) {
    const staff = state.staff.find(st => st.tableId === t.id);
    if (staff) { staff.busy = false; staff.tableId = null; }
    const speedRatio = Math.max(0, t.patience / t.maxPatience);
    let gained = t.order.value * state.quality * (0.7 + speedRatio * 0.5);
    gained += (speedRatio > 0.5 ? 18 : 0) * state.tipMul;     // チップ
    if (t.meibutsu) gained *= 1.6;
    gained = Math.round(gained);
    state.score += gained;
    state.served++;
    flashMsg(`${t.meibutsu ? "👑名物" : t.order.icon}提供！ +${gained}`, false);
    resetTable(t);
  }

  function leaveTable(t) {
    const staff = state.staff.find(st => st.tableId === t.id);
    if (staff) { staff.busy = false; staff.tableId = null; }
    state.lost++;
    flashMsg("お客さんが帰ってしまった…", true);
    resetTable(t);
  }

  function resetTable(t) {
    t.occupied = false; t.order = null; t.progress = 0; t.patience = 0; t.meibutsu = false;
  }

  /* ---------- 操作 ---------- */
  function tapTable(id) {
    if (!state || !state.running) return;
    const t = state.tables[id];
    if (!t.occupied) return;
    const assigned = state.staff.find(st => st.tableId === id);
    if (assigned) {
      // 外す
      assigned.busy = false; assigned.tableId = null;
    } else {
      const idle = state.staff.find(st => !st.busy);
      if (!idle) { flashMsg("空いているスタッフがいない！", true); return; }
      idle.busy = true; idle.tableId = id;
    }
    renderTables(); renderStaff();
  }

  function bindDirectives() {
    const rush = document.getElementById("mgr-rush");
    const care = document.getElementById("mgr-care");
    const cheer = document.getElementById("mgr-cheer");
    rush.onclick = () => { if (state.cdRush <= 0) { state.rushT = 5; state.cdRush = 12; flashMsg("⚡急がせる！", false); } };
    care.onclick = () => {
      if (state.cdCare <= 0) {
        for (const t of state.tables) if (t.occupied) t.patience = Math.min(t.maxPatience, t.patience + t.maxPatience * 0.45);
        state.cdCare = 10; flashMsg("🙇 丁寧に対応、満足度UP", false);
      }
    };
    cheer.onclick = () => { if (state.cdCheer <= 0) { state.cheerT = 4; state.cdCheer = 18; flashMsg("📣 檄！全員ギアアップ！", false); } };
  }

  /* ---------- 終了 ---------- */
  function finish() {
    state.running = false;
    cancelAnimationFrame(rafId);
    rafId = null;
    state.onFinish({
      score: state.score,
      served: state.served,
      lost: state.lost,
      mistakes: 0,
      maxCombo: 0,
      total: state.spawnedCount,
    });
  }
  function abort() { if (rafId) cancelAnimationFrame(rafId); rafId = null; if (state) state.running = false; }

  /* ---------- 描画 ---------- */
  function renderTables() {
    const wrap = document.getElementById("mgr-tables");
    wrap.innerHTML = "";
    for (const t of state.tables) {
      const el = document.createElement("div");
      el.className = "mgr-table" + (t.occupied ? " on" : "") + (t.meibutsu ? " mei" : "");
      el.dataset.id = t.id;
      if (t.occupied) {
        const staff = state.staff.find(st => st.tableId === t.id);
        el.innerHTML = `
          <div class="mt-top">${t.meibutsu ? "👑" : "🪑"} <span class="mt-order">${t.order.icon}${t.order.name}</span></div>
          <div class="mt-assign">${staff ? staff.icon + staff.name : "<span class='muted'>未配置</span>"}</div>
          <div class="mt-prog"><i style="width:${Math.min(100, (t.progress / t.work) * 100)}%"></i></div>
          <div class="mt-pat"><i style="width:${Math.max(0, (t.patience / t.maxPatience) * 100)}%"></i></div>`;
      } else {
        el.innerHTML = `<div class="mt-empty">空席</div>`;
      }
      el.onclick = () => tapTable(t.id);
      wrap.appendChild(el);
    }
  }

  function renderStaff() {
    const wrap = document.getElementById("mgr-staff");
    wrap.innerHTML = "";
    for (const st of state.staff) {
      const el = document.createElement("div");
      el.className = "mgr-staff-chip" + (st.busy ? " busy" : " idle");
      el.innerHTML = `${st.icon}<span>${st.name}</span><small>${st.busy ? "対応中" : "待機"}</small>`;
      wrap.appendChild(el);
    }
  }

  function renderDynamic() {
    document.getElementById("mgr-time").textContent = Math.ceil(Math.max(0, state.timeLeft));
    const pct = Math.max(0, Math.min(100, (state.timeLeft / state.timeLimit) * 100));
    document.getElementById("mgr-timer-fill").style.width = pct + "%";
    document.getElementById("mgr-score").textContent = state.score;
    document.getElementById("mgr-served").textContent =
      `提供 ${state.served} / 来客 ${state.spawnedCount}（逃し ${state.lost}）`;
    // バーだけ毎フレーム更新
    for (const t of state.tables) {
      const el = document.querySelector(`.mgr-table[data-id="${t.id}"]`);
      if (!el || !t.occupied) continue;
      const pf = el.querySelector(".mt-prog > i");
      const pa = el.querySelector(".mt-pat > i");
      if (pf) pf.style.width = Math.min(100, (t.progress / t.work) * 100) + "%";
      if (pa) {
        const p = Math.max(0, t.patience / t.maxPatience);
        pa.style.width = (p * 100) + "%";
        el.classList.toggle("warn", p < 0.5 && p >= 0.25);
        el.classList.toggle("danger", p < 0.25);
      }
    }
    // 采配ボタンのクールダウン表示
    setCd("mgr-rush", state.cdRush);
    setCd("mgr-care", state.cdCare);
    setCd("mgr-cheer", state.cdCheer);
  }
  function setCd(id, cd) {
    const el = document.getElementById(id);
    if (!el) return;
    el.disabled = cd > 0;
    const sub = el.querySelector(".cd");
    if (sub) sub.dataset.cd = cd > 0 ? Math.ceil(cd) : "";
  }

  let msgTimer = null;
  function flashMsg(text, bad) {
    const el = document.getElementById("mgr-msg");
    if (!el) return;
    el.textContent = text;
    el.style.color = bad ? "#e88" : "#6fae5a";
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => { el.textContent = ""; }, 1100);
  }

  return { start, abort };
})();
