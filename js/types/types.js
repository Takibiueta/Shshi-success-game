/* =========================================================================
 * 鮨サクセス — 型定義（JSDoc）
 * ビルドなしの素のJSなので、型は JSDoc typedef として一元管理する。
 * エディタ補完・レビュー用。ランタイムコードは置かない。
 * ========================================================================= */

/**
 * 効果セット。コマンド/イベント/アイテムの結果はすべてこの形で表す。
 * 値は number か [min, max]（実行時に乱数で確定）。
 * @typedef {Object} EffectSet
 * @property {number|[number,number]} [exp]        経験点（やる気倍率がかかる）
 * @property {number|[number,number]} [work]       作業力
 * @property {number|[number,number]} [service]    接客力
 * @property {number|[number,number]} [judgment]   判断力
 * @property {number|[number,number]} [mental]     メンタル
 * @property {number|[number,number]} [comm]       コミュ力
 * @property {number|[number,number]} [stamina]    体力
 * @property {number|[number,number]} [stress]     ストレス（+はメンタルで軽減される）
 * @property {number|[number,number]} [motivation] やる気
 * @property {number|[number,number]} [boss]       大将評価（+はコミュ力で増幅）
 * @property {number|[number,number]} [coworker]   同僚評価（+はコミュ力で増幅）
 * @property {number|[number,number]} [customer]   客評価
 * @property {number} [all]                        全能力に加算
 */

/**
 * 成功判定。chance = base + (対象ステータス合計) / statDiv（min/max でクランプ）。
 * @typedef {Object} CheckDef
 * @property {string[]} stats   判定に使うステータスキー（複数なら合計）
 * @property {number} [base]    基礎成功率（省略時 BALANCE.checks.base）
 * @property {number} [statDiv] ステータス→確率の係数（省略時 BALANCE.checks.statDiv）
 */

/**
 * 育成コマンド定義（data/commands.js）。
 * check がある場合は success / fail のどちらかが適用される。
 * @typedef {Object} CommandDef
 * @property {string} id
 * @property {string} icon
 * @property {string} name
 * @property {string} kind            ボタン色のキー（CSS data-kind）
 * @property {{stamina?: number}} [cost]
 * @property {EffectSet} [effects]    check なしの場合の効果
 * @property {CheckDef} [check]
 * @property {{effects: EffectSet, msg?: string}} [success]
 * @property {{effects: EffectSet, msg?: string}} [fail]
 * @property {string} note            ホバー時の説明
 */

/**
 * イベントの選択肢。check があると判定後 success / fail を適用。
 * @typedef {Object} EventChoice
 * @property {string} label
 * @property {EffectSet} [effects]
 * @property {string} [msg]
 * @property {string} [item]   入手アイテムID
 * @property {CheckDef} [check]
 * @property {{effects: EffectSet, msg: string, item?: string}} [success]
 * @property {{effects: EffectSet, msg: string}} [fail]
 */

/**
 * 発生条件。すべて満たすと候補に入る（省略 = 無条件）。
 * @typedef {Object} EventCond
 * @property {number} [bossMin]     大将評価がこれ以上
 * @property {number} [bossMax]     大将評価がこれ以下
 * @property {number} [coworkerMin]
 * @property {number} [coworkerMax]
 * @property {number} [stressMin]
 *
 * @typedef {Object} GameEvent
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {string} [chara]   立ち絵の話者（me/oyakata/heroine/rival）
 * @property {string} [expr]    表情
 * @property {string} [pos]     ポジション専用なら職種ID
 * @property {EventCond} [cond]
 * @property {number} [weight]  抽選の重み（省略 1）
 * @property {EventChoice[]} choices
 */

/**
 * エンディング定義（data/endings.js）。配列の先頭から条件を満たした最初のものが採用される。
 * @typedef {Object} EndingDef
 * @property {string} id
 * @property {string} title
 * @property {string} icon
 * @property {string} comment
 * @property {Object} cond  stressMin/judgmentMin/mentalMin/coworkerMin/coworkerMax/bossMin/bossMax/customerMin/totalMin
 */

/* ========================================================================
 * 会話イベント（ADV）システムの型
 * ======================================================================== */

/**
 * イベントの発生トリガー。
 * - week   … 指定週の頭に必ず発生（1回限り）
 * - after  … 指定コマンドの直後に確率で発生
 * - random … 週次のランダム抽選（weight で重み付け）
 * @typedef {Object} AdvTrigger
 * @property {"week"|"after"|"random"} type
 * @property {number} [week]      type=week：発生する週
 * @property {string} [command]   type=after：直前のコマンドID（hall/kitchen/menu/claim/rest/play/talk）
 * @property {number} [chance]    type=after：発生確率 0-1（省略時 BALANCE.events.afterChance）
 * @property {number} [weight]    type=random：抽選の重み（省略 1）
 * @property {string} [pos]       ポジション限定（shokunin/kitchen/floor/manager）
 * @property {EventCond} [cond]   評価・ストレス条件（logic/events.js が判定）
 * @property {boolean} [once]     一度きり（type=week は自動で once 扱い）
 */

/**
 * 会話の1行。
 * @typedef {Object} AdvLine
 * @property {"me"|"oyakata"|"heroine"|"rival"|"sys"} who  sys=ナレーション（立ち絵は前のまま・名前なし）
 * @property {string} [expr]  表情（normal/happy/tired/surprised/worried/fired/smug）
 * @property {string} text
 */

/**
 * 選択肢。check があれば判定して success / fail の分岐へ。
 * 分岐先の lines は選択後に続けて再生され、effects が反映される。
 * @typedef {Object} AdvChoice
 * @property {string} label
 * @property {EffectSet} [effects]
 * @property {string} [msg]      ログ用一行（lines 省略時は結果セリフとしても使う）
 * @property {AdvLine[]} [lines] 結果の会話
 * @property {string} [item]
 * @property {CheckDef} [check]
 * @property {{effects: EffectSet, msg: string, lines?: AdvLine[], item?: string}} [success]
 * @property {{effects: EffectSet, msg: string, lines?: AdvLine[]}} [fail]
 */

/**
 * 会話イベント本体（data/events.js）。
 * @typedef {Object} AdvEvent
 * @property {string} id
 * @property {string} title
 * @property {"storefront"|"kitchen"|"street"|"room"} [bg]  背景（省略 storefront）
 * @property {AdvTrigger} trigger
 * @property {AdvLine[]} lines    導入会話（クリックで送る）
 * @property {AdvChoice[]} [choices]  省略時は読み終わったら閉じる
 */

/**
 * プレイヤー状態（game.js が生成・所有）。
 * @typedef {Object} PlayerState
 * @property {string} position
 * @property {number} week
 * @property {Object} stats    work/service/judgment/mental/comm/stamina/maxStamina
 * @property {number} exp
 * @property {{stress:number, motivation:number}} meters
 * @property {{boss:number, coworker:number, customer:number}} evals
 * @property {number} storeScore
 * @property {Object} items
 */
