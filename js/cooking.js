/* =========================================================================
 * 鮨サクセス — 営業パート（3D / Overcookedスタイル）
 *
 * Three.js で立体的なキッチンを描画。シェフ🧑‍🍳を奥行きのある床で操作する。
 * まずお皿を取り（1皿ずつ）、食材台・調理台を手順どおり回って組み立て、
 * 提供口へ運んで提供する。間違えたら片付け台でやり直し。
 * 育成ステータスが移動速度・制限時間・我慢・チップ・スコアに影響。
 * ========================================================================= */

const Cooking = (() => {
  const THREE = window.THREE;

  let state = null;
  let rafId = null;
  let lastTs = 0;

  // ステーションの配置（奥列＝食材、手前列＝皿/加工/提供/ゴミ箱）
  const LAYOUT = {
    far:  ["rice", "maguro", "salmon", "tamago", "ebi", "ikura", "uni"],
    near: ["plate", "nori", "wasabi", "cut", "soup", "fry", "serve", "trash"],
  };
  const EXTRA = {
    plate: { icon: "🍽️", label: "お皿" },
    serve: { icon: "🛎️", label: "提供口" },
    trash: { icon: "🗑️", label: "片付け" },
  };
  // 台の色（16進）
  const COLORS = {
    plate: 0x3c6a8a, serve: 0x4c8a3c, trash: 0x6a4a40, cut: 0x6a5aa0,
    soup: 0x9a7440, fry: 0xb06438,
    rice: 0xcfc4b0, nori: 0x2c2c34, wasabi: 0x5a8a4c,
    maguro: 0xb0463c, salmon: 0xc9764a, tamago: 0xd8b84b,
    ebi: 0xc97a6a, ikura: 0xd87a3c, uni: 0xd8b84b,
  };

  // ワールド寸法
  const FAR_Z = -5.4, NEAR_Z = 5.4;      // 奥/手前カウンターの z
  const SPREAD = 7.6;                      // 台を並べる x の範囲（±）
  const REACH = 2.7;                       // 作業できる距離（xz平面）
  const BOUND_X = 7.6, BOUND_Z = 3.4;      // プレイヤー移動範囲

  // 3D オブジェクト（モジュール内で保持）
  let renderer = null, scene = null, camera = null;
  let chef = null, plateMesh = null, plateLabel = null, ring = null;
  let flashMap = {};
  let resizeFn = null;

  // ポジション別の営業モード（出る品・ペース・特性が変わる）
  const MODES = {
    shokunin: { cats: ["sushi"], time: 1.0, cust: 1.0, interval: 1.0,
      note: "寿司中心。技術で“早業”・創作で高得点" },
    kitchen:  { cats: ["sushi", "kitchen"], time: 1.1, cust: 1.15, interval: 0.85,
      note: "汁物・揚げ物も。手数とスピードで稼ぐ" },
    floor:    { cats: ["sushi", "kitchen"], time: 1.0, cust: 1.25, interval: 0.8,
      note: "客が多い！接客で我慢＆チップが大きく伸びる" },
  };

  /* ---------- 開始 ---------- */
  function start(stage, player, onFinish) {
    const pos = POSITIONS[player.position];
    const b = pos.bonus || {};
    const mode = MODES[player.position] || MODES.shokunin;
    const s = player.stats;

    // 全ステータスが効く
    const timeLimit = Math.round((stage.time + s.speed * 0.25 + s.tech * 0.15 + (b.timeBonus || 0)) * mode.time);
    const patienceMult = (1 + s.hospitality / 160) * (b.patience || 1);
    const tipMult = (b.tip || 1) * (1 + s.hospitality / 130);
    const techMissResist = s.tech;
    const techAutoStep = Math.min(0.5, s.tech / 260);     // 技術：たまに次の工程を自動でこなす“早業”
    const knowScore = 1 + s.knowledge / 400;              // 知識：目利きで少し高得点
    const hirameki = Math.min(0.35, s.creativity / 320);  // 創作：ひらめきで“神握り”二倍点
    const scoreMult = (1 + s.creativity / 120) * (b.scoreMult || 1) * knowScore;
    const moveSpeed = 4.2 + s.speed * 0.045;
    const customers = Math.max(4, Math.round(stage.customers * mode.cust));
    const interval = stage.interval * mode.interval;
    let pool = RECIPES.filter(r => r.req <= s.knowledge && mode.cats.includes(r.cat));
    if (pool.length === 0) pool = RECIPES.filter(r => r.req <= s.knowledge); // 念のため

    state = {
      stage, player, pos, onFinish, mode,
      timeLimit, timeLeft: timeLimit, customers, interval,
      patienceMult, tipMult, techMissResist, techAutoStep, hirameki, scoreMult, moveSpeed, pool,
      score: 0, served: 0, lost: 0, mistakes: 0, combo: 0, maxCombo: 0,
      orders: [],
      hasPlate: false,
      tray: [],
      spawnTimer: 1.0,
      spawnedCount: 0,
      nextOrderId: 1,
      running: true,
      finished: false,
      // プレイヤー & 入力（x:左右, z:奥行き）
      x: 0, z: 2.2, facing: 0,
      input: { up: false, down: false, left: false, right: false },
      pressed: new Set(),
      actionCd: 0,
      nearId: null,
      stations: [],
      pops: [],
    };

    if (!THREE) {
      flashMsg("3Dライブラリの読み込みに失敗しました（ネット接続が必要です）", true);
      console.error("[Cooking] THREE.js が読み込まれていません。");
      return;
    }

    buildScene();
    bindInput();
    document.getElementById("svc-stage-name").textContent = `${stage.name}（${pos.name}）`;
    flashMsg(mode.note);
    lastTs = 0;
    rafId = requestAnimationFrame(loop);
    render();
  }

  /* ---------- シーン構築 ---------- */
  function buildScene() {
    const canvas = document.getElementById("kitchen");
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1410);
    scene.fog = new THREE.Fog(0x1a1410, 22, 40);

    camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.1, 100);
    camera.position.set(0, 12.5, 13.5);
    camera.lookAt(0, 0.8, -0.5);

    // ライト
    const hemi = new THREE.HemisphereLight(0xfff0dd, 0x2a211a, 0.85);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xfff2e0, 0.9);
    dir.position.set(6, 14, 8);
    scene.add(dir);
    const dir2 = new THREE.DirectionalLight(0xffd9a0, 0.25);
    dir2.position.set(-8, 6, 4);
    scene.add(dir2);

    // 床
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 20),
      new THREE.MeshStandardMaterial({ color: 0x35291d, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    // 床のタイル目地
    const grid = new THREE.GridHelper(24, 24, 0x4a3c2e, 0x2a2017);
    grid.position.y = 0.01;
    scene.add(grid);

    // 奥の壁（暖簾風）
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 9),
      new THREE.MeshStandardMaterial({ color: 0x2a211a, roughness: 1 })
    );
    wall.position.set(0, 4.5, -8.5);
    scene.add(wall);
    const noren = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xd94f3d, roughness: 0.9 })
    );
    noren.position.set(0, 6.6, -8.4);
    scene.add(noren);
    noren.add(makeLabelSprite("", "鮨", { big: 120, sx: 2.2, sy: 2.2, y: 0 }));

    // ステーション
    buildStations();

    // 作業できる位置のリング
    ring = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 1.0, 28),
      new THREE.MeshBasicMaterial({ color: 0xe8b84b, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    ring.visible = false;
    scene.add(ring);

    // シェフ
    chef = buildChef();
    scene.add(chef);

    // 持っているお皿の中身ラベル（頭上・常にカメラを向く）
    plateLabel = makePlateLabel([]);
    plateLabel.visible = false;
    scene.add(plateLabel);

    // リサイズ
    resizeFn = () => resize();
    window.addEventListener("resize", resizeFn);
    resize();
  }

  function buildStations() {
    const kindOf = id =>
      id === "serve" ? "serve" : id === "trash" ? "trash" :
      id === "plate" ? "plate" : "step";

    const place = (ids, z) => {
      const n = ids.length;
      ids.forEach((id, i) => {
        const x = n === 1 ? 0 : -SPREAD + (i * (SPREAD * 2)) / (n - 1);
        const meta = EXTRA[id] || ACTIONS[id];
        const color = COLORS[id] != null ? COLORS[id] : 0x3a2e23;

        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // カウンター土台
        const base = new THREE.Mesh(
          new THREE.BoxGeometry(1.9, 0.6, 1.5),
          new THREE.MeshStandardMaterial({ color: 0x3a2e23, roughness: 0.8 })
        );
        base.position.y = 0.3;
        group.add(base);

        // 天板（台の色 / ハイライト用）
        const top = new THREE.Mesh(
          new THREE.BoxGeometry(1.7, 0.35, 1.3),
          new THREE.MeshStandardMaterial({ color, roughness: 0.6, emissive: 0x000000 })
        );
        top.position.y = 0.78;
        group.add(top);

        // アイコン＋名前のラベル
        const label = makeLabelSprite(meta.icon, meta.label, { y: 1.9 });
        group.add(label);

        scene.add(group);
        state.stations.push({ id, x, z, kind: kindOf(id), group, top });
      });
    };

    place(LAYOUT.far, FAR_Z);
    place(LAYOUT.near, NEAR_Z);
  }

  function buildChef() {
    const g = new THREE.Group();
    const skin = 0xf0c89a, coat = 0xf5ead6, pants = 0x2e4663, hat = 0xffffff;

    const legs = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.46, 0.5, 16),
      new THREE.MeshStandardMaterial({ color: pants, roughness: 0.8 })
    );
    legs.position.y = 0.25; g.add(legs);

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.46, 0.75, 16),
      new THREE.MeshStandardMaterial({ color: coat, roughness: 0.7 })
    );
    body.position.y = 0.88; g.add(body);

    // 帯（前掛け）
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.47, 0.47, 0.16, 16),
      new THREE.MeshStandardMaterial({ color: 0xd94f3d, roughness: 0.7 })
    );
    belt.position.y = 0.62; g.add(belt);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 20, 16),
      new THREE.MeshStandardMaterial({ color: skin, roughness: 0.6 })
    );
    head.position.y = 1.52; g.add(head);

    const hatBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.32, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: hat, roughness: 0.9 })
    );
    hatBase.position.y = 1.92; g.add(hatBase);
    const hatPuff = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 16, 12),
      new THREE.MeshStandardMaterial({ color: hat, roughness: 0.9 })
    );
    hatPuff.position.y = 2.18; g.add(hatPuff);

    // 鼻先の向き目印（小さな前髪/正面マーク）— 正面 +z
    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    nose.position.set(-0.12, 1.55, 0.31); g.add(nose);
    const nose2 = nose.clone(); nose2.position.x = 0.12; g.add(nose2);

    // 手に持つお皿（正面 +z 側）
    plateMesh = new THREE.Group();
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.34, 0.06, 20),
      new THREE.MeshStandardMaterial({ color: 0xfaf6ee, roughness: 0.4 })
    );
    plateMesh.add(plate);
    plateMesh.position.set(0, 1.0, 0.62);
    plateMesh.visible = false;
    g.add(plateMesh);

    // 接地影
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02; g.add(shadow);

    return g;
  }

  /* ---------- スプライト（絵文字ラベル） ---------- */
  function makeCanvasTexture(draw, w, h) {
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const c = cv.getContext("2d");
    draw(c, w, h);
    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = 4;
    return tex;
  }

  function makeLabelSprite(emoji, label, opts = {}) {
    const big = opts.big || 96;
    const tex = makeCanvasTexture((c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.textAlign = "center"; c.textBaseline = "middle";
      if (emoji) {
        c.font = big + "px serif";
        c.fillText(emoji, w / 2, label ? h * 0.40 : h * 0.5);
      }
      if (label) {
        c.font = "bold 38px sans-serif";
        c.lineWidth = 6; c.strokeStyle = "rgba(0,0,0,.6)";
        c.fillStyle = "#f5ead6";
        c.strokeText(label, w / 2, h * 0.82);
        c.fillText(label, w / 2, h * 0.82);
      }
    }, 256, 256);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(opts.sx || 2.3, opts.sy || 2.3, 1);
    sp.position.y = opts.y != null ? opts.y : 0;
    return sp;
  }

  function makePlateLabel(tray) {
    const icons = ["🍽️", ...tray.map(id => ACTIONS[id].icon)];
    const tex = makeCanvasTexture((c, w, h) => {
      c.clearRect(0, 0, w, h);
      // 吹き出し
      c.fillStyle = "rgba(20,16,12,.92)";
      c.strokeStyle = "#e8b84b"; c.lineWidth = 5;
      roundRectPath(c, 8, 8, w - 16, h - 16, 24);
      c.fill(); c.stroke();
      c.textAlign = "center"; c.textBaseline = "middle";
      c.font = "60px serif";
      const step = Math.min(72, (w - 60) / icons.length);
      const startX = w / 2 - (step * (icons.length - 1)) / 2;
      icons.forEach((ic, i) => c.fillText(ic, startX + i * step, h / 2));
    }, 512, 128);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(3.4, 0.85, 1);
    sp.renderOrder = 999;
    return sp;
  }

  function updatePlateLabel() {
    if (plateLabel) {
      if (plateLabel.material.map) plateLabel.material.map.dispose();
      const next = makePlateLabel(state.tray);
      plateLabel.material.map = next.material.map;
      plateLabel.material.needsUpdate = true;
    }
  }

  function roundRectPath(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function resize() {
    if (!renderer || !camera) return;
    const wrap = document.querySelector(".kitchen-wrap");
    const w = (wrap && wrap.clientWidth) || 760;
    const h = Math.round(w * 9 / 16);
    renderer.setSize(w, h, true);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* ---------- ループ ---------- */
  function loop(ts) {
    if (!state || !state.running) return;
    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.1);
    lastTs = ts;

    update(dt);
    render3D();
    renderDynamic();

    rafId = requestAnimationFrame(loop);
  }

  function update(dt) {
    state.timeLeft -= dt;
    if (state.actionCd > 0) state.actionCd -= dt;

    // 移動（up=奥へ -z / down=手前へ +z）
    const dx = (state.input.right ? 1 : 0) - (state.input.left ? 1 : 0);
    const dz = (state.input.down ? 1 : 0) - (state.input.up ? 1 : 0);
    if (dx || dz) {
      const len = Math.hypot(dx, dz) || 1;
      state.x += (dx / len) * state.moveSpeed * dt;
      state.z += (dz / len) * state.moveSpeed * dt;
      state.facing = Math.atan2(dx, dz);
    }
    state.x = Math.max(-BOUND_X, Math.min(BOUND_X, state.x));
    state.z = Math.max(-BOUND_Z, Math.min(BOUND_Z, state.z));

    // 近くの台
    let best = null, bestD = REACH;
    for (const s of state.stations) {
      const d = Math.hypot(state.x - s.x, state.z - s.z);
      if (d < bestD) { bestD = d; best = s; }
    }
    state.nearId = best ? best.id : null;

    // 客の出現
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0 && state.spawnedCount < state.customers) {
      spawnOrder();
      state.spawnTimer = state.interval * (0.8 + Math.random() * 0.4);
    }

    // 我慢ゲージ
    for (const o of state.orders) {
      o.patience -= dt;
      if (o.patience <= 0) o.leaving = true;
    }
    const leaving = state.orders.filter(o => o.leaving);
    if (leaving.length) {
      for (const o of leaving) {
        state.lost++;
        state.combo = 0;
        addPop(0, 3, FAR_Z + 2, "🏃 退店…", "#e88");
        log(`💢 ${o.recipe.name} のお客さんが帰ってしまった…`, "bad");
      }
      state.orders = state.orders.filter(o => !o.leaving);
      renderOrders();
    }

    // 演出
    for (const p of state.pops) p.life -= dt;
    const dead = state.pops.filter(p => p.life <= 0);
    for (const p of dead) { scene.remove(p.sprite); if (p.sprite.material.map) p.sprite.material.map.dispose(); p.sprite.material.dispose(); }
    state.pops = state.pops.filter(p => p.life > 0);

    // 終了判定
    if (state.timeLeft <= 0 && state.spawnedCount >= state.customers) {
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

    if (s.kind === "plate") {
      if (state.hasPlate) { flashMsg("もうお皿を持っているよ"); return; }
      state.hasPlate = true;
      state.tray = [];
      markStation(id);
      updatePlateLabel();
      addPop(s.x, 2.2, s.z, "🍽️ お皿GET", "#6fb0d8");
      renderOrders();
      return;
    }

    if (s.kind === "serve") { tryServe(); return; }

    if (s.kind === "trash") {
      if (!state.hasPlate) { flashMsg("片付けるお皿がない"); return; }
      state.hasPlate = false;
      state.tray = [];
      updatePlateLabel();
      addPop(state.x, 2.6, state.z, "片付けた", "#b6a489");
      flashMsg("お皿を片付けた");
      renderOrders();
      return;
    }

    // 食材/加工台 → お皿に工程を積む（お皿が必要）
    if (!state.hasPlate) { flashMsg("先にお皿を取ろう！", true); return; }
    state.tray.push(id);
    markStation(id);
    addPop(s.x, 2.0, s.z, `+${ACTIONS[id].icon}`, "#6fae5a");
    // 技術：早業（次の工程を自動でこなすことがある）
    if (Math.random() < state.techAutoStep) {
      const trayKey = state.tray.join(",");
      const cand = state.orders.find(o => {
        const ns = o.recipe.steps.slice(0, -1);
        return ns.length > state.tray.length && ns.slice(0, state.tray.length).join(",") === trayKey;
      });
      if (cand) {
        const next = cand.recipe.steps[state.tray.length];
        if (next && next !== "serve") {
          state.tray.push(next);
          addPop(state.x, 2.5, state.z, "⚡早業！", "#ffd24a");
        }
      }
    }
    updatePlateLabel();
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
      state.mistakes++;
      state.combo = 0;
      const penalty = Math.max(0.4, 2.0 - state.techMissResist / 60);
      const urgent = state.orders.slice().sort((a, b) => a.patience - b.patience)[0];
      if (urgent) urgent.patience = Math.max(0, urgent.patience - penalty);
      addPop(state.x, 2.6, state.z, "×注文と違う", "#e88");
      flashMsg("どの注文とも違う！ 片付けでやり直し", true);
      return;
    }
    matches.sort((a, b) => a.patience - b.patience);
    completeOrder(matches[0]);
    state.tray = [];
    state.hasPlate = false;
    updatePlateLabel();
    renderOrders();
  }

  function completeOrder(o) {
    const speedRatio = o.patience / o.maxPatience;
    const comboBonus = 1 + Math.min(state.combo, 10) * 0.04;
    let gained = o.recipe.score * state.scoreMult * (0.7 + speedRatio * 0.5) * comboBonus;
    const tip = (speedRatio > 0.5 ? 1 : 0) * 20 * state.tipMult;
    gained = Math.round(gained + tip);
    // 創作：ひらめきで“神握り”二倍点
    let hira = false;
    if (Math.random() < state.hirameki) { gained *= 2; hira = true; }

    state.score += gained;
    state.served++;
    state.combo++;
    state.maxCombo = Math.max(state.maxCombo, state.combo);

    state.orders = state.orders.filter(x => x.id !== o.id);
    const star = speedRatio > 0.6 ? "✨" : "";
    addPop(state.x, 2.8, state.z, hira ? `✨神握り +${gained}` : `+${gained}`, "#e8b84b");
    if (hira) log(`✨ ひらめき！「${o.recipe.name}」が神握りに！ +${gained}点`, "good");
    else log(`🍣 提供！「${o.recipe.name}」 +${gained}点 ${star}${state.combo > 1 ? ` (${state.combo}コンボ)` : ""}`, "good");
  }

  /* ---------- 終了 ---------- */
  function finish() {
    state.running = false;
    state.finished = true;
    cancelAnimationFrame(rafId);
    rafId = null;
    teardown();
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
    teardown();
  }

  function teardown() {
    unbindInput();
    if (resizeFn) { window.removeEventListener("resize", resizeFn); resizeFn = null; }
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

  /* ---------- 3D描画 ---------- */
  function markStation(id) { flashMap[id] = 0.3; }

  function addPop(x, y, z, text, color) {
    const tex = makeCanvasTexture((c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.textAlign = "center"; c.textBaseline = "middle";
      c.font = "bold 64px sans-serif";
      c.lineWidth = 8; c.strokeStyle = "rgba(0,0,0,.7)";
      c.strokeText(text, w / 2, h / 2);
      c.fillStyle = color;
      c.fillText(text, w / 2, h / 2);
    }, 320, 128);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
    sp.scale.set(3.2, 1.3, 1);
    sp.position.set(x, y, z);
    sp.renderOrder = 1000;
    scene.add(sp);
    state.pops.push({ sprite: sp, life: 0.9, y0: y });
  }

  function render3D() {
    if (!renderer) return;
    // シェフ
    chef.position.set(state.x, 0, state.z);
    chef.rotation.y = state.facing;
    plateMesh.visible = state.hasPlate;
    // お皿ラベル
    if (state.hasPlate) {
      plateLabel.visible = true;
      plateLabel.position.set(state.x, 2.95, state.z);
    } else {
      plateLabel.visible = false;
    }

    // ステーションのハイライト
    for (const s of state.stations) {
      const near = state.nearId === s.id;
      let fl = flashMap[s.id] || 0;
      if (fl > 0) { fl -= 0.018; flashMap[s.id] = fl; }
      const m = s.top.material;
      if (fl > 0) { m.emissive.setHex(0xffffff); m.emissiveIntensity = 0.9; }
      else if (near) { m.emissive.setHex(0xe8b84b); m.emissiveIntensity = 0.55; }
      else { m.emissive.setHex(0x000000); m.emissiveIntensity = 0; }
      // 近くの台は少し浮く
      s.group.position.y = near ? 0.06 + Math.sin(performance.now() / 200) * 0.03 : 0;
    }

    // 作業リング
    if (state.nearId) {
      const s = state.stations.find(x => x.id === state.nearId);
      ring.visible = true;
      ring.position.set(s.x, 0.05, s.z + (s.z < 0 ? 1.0 : -1.0));
    } else {
      ring.visible = false;
    }

    // 演出ポップ
    for (const p of state.pops) {
      p.sprite.position.y = p.y0 + (0.9 - p.life) * 1.6;
      p.sprite.material.opacity = Math.max(0, Math.min(1, p.life * 1.4));
    }

    renderer.render(scene, camera);
  }

  /* ---------- DOM（注文/HUD） ---------- */
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
