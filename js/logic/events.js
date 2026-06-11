/* =========================================================================
 * 鮨サクセス — イベント抽選ロジック（DOM非依存）
 *
 * 優先順位：
 *   1. week  … 指定週なら必ず発生（1回限り。player.seenEvents で管理）
 *   2. after … 直前のコマンドIDに紐づくイベントを確率で
 *   3. random… BALANCE.events.chance を通ったら重み付き抽選
 * cond（評価しきい値）で「大将 vs 同僚」の対立軸イベントの発生が変わる。
 * ========================================================================= */

const EventLogic = (() => {

  /* 発生条件チェック（評価・ストレス） */
  function condOk(player, cond) {
    if (!cond) return true;
    const e = player.evals, m = player.meters;
    if (cond.bossMin != null && e.boss < cond.bossMin) return false;
    if (cond.bossMax != null && e.boss > cond.bossMax) return false;
    if (cond.coworkerMin != null && e.coworker < cond.coworkerMin) return false;
    if (cond.coworkerMax != null && e.coworker > cond.coworkerMax) return false;
    if (cond.stressMin != null && m.stress < cond.stressMin) return false;
    return true;
  }

  /* ポジション・既読・条件をまとめて判定 */
  function eligible(player, ev) {
    const t = ev.trigger || {};
    if (t.pos && t.pos !== player.position) return false;
    if ((t.once || t.type === "week") && player.seenEvents && player.seenEvents[ev.id]) return false;
    return condOk(player, t.cond);
  }

  /**
   * 今週のイベントを決める。
   * @param {Object} player
   * @param {string|null} lastCommandId 直前に実行したコマンドID（after判定用）
   * @returns {Object|null} AdvEvent
   */
  function pick(player, lastCommandId) {
    // 1) 固定週イベント
    const wk = EVENTS.find(ev =>
      ev.trigger.type === "week" && ev.trigger.week === player.week && eligible(player, ev)
    );
    if (wk) return wk;

    // 2) コマンド直後イベント
    if (lastCommandId) {
      const cands = EVENTS.filter(ev =>
        ev.trigger.type === "after" && ev.trigger.command === lastCommandId && eligible(player, ev)
      );
      for (const ev of cands) {
        const chance = ev.trigger.chance != null ? ev.trigger.chance : BALANCE.events.afterChance;
        if (Math.random() < chance) return ev;
      }
    }

    // 3) 週次ランダム抽選
    if (Math.random() >= BALANCE.events.chance) return null;
    const pool = EVENTS.filter(ev => ev.trigger.type === "random" && eligible(player, ev));
    if (pool.length === 0) return null;
    const weights = pool.map(ev => ev.trigger.weight || 1);
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  /* 一度きりイベントを既読にする */
  function markSeen(player, ev) {
    if (!player.seenEvents) player.seenEvents = {};
    if (ev.trigger.once || ev.trigger.type === "week") player.seenEvents[ev.id] = true;
  }

  return { condOk, eligible, pick, markSeen };
})();
