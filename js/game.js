(() => {
  'use strict';

  const SAVE_KEY = 'tk_strategy_save_v1';

  /* ================= SOUND ENGINE (Web Audio API) ================= */
  let audioCtx = null;
  let soundEnabled = true;
  let bgmEnabled = false;
  let bgmTimer = null;
  const BGM_NOTES = [293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 440.00, 392.00, 329.63];
  let bgmStep = 0;

  function startBgm() {
    if (bgmTimer) return;
    ensureAudio();
    bgmTimer = setInterval(() => {
      if (!bgmEnabled || !audioCtx) return;
      try {
        const now = audioCtx.currentTime;
        const freq = BGM_NOTES[bgmStep % BGM_NOTES.length];
        bgmStep++;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.032, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      } catch (e) {}
    }, 950);
  }

  function stopBgm() {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
  }

  function ensureAudio() {
    if (!audioCtx && soundEnabled) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      } catch (e) {}
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function playSfx(type) {
    if (!soundEnabled) return;
    ensureAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now); osc.stop(now + 0.065);
      } else if (type === 'assign') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(587, now + 0.05);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now); osc.stop(now + 0.15);
      } else if (type === 'turn') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.25);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc.start(now); osc.stop(now + 0.28);
      } else if (type === 'fanfare') {
        [523, 659, 784, 1046].forEach((f, i) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(f, now + i * 0.08);
          g.gain.setValueAtTime(0.09, now + i * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.22);
          o.connect(g); g.connect(audioCtx.destination);
          o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.23);
        });
      } else if (type === 'battle' || type === 'drum') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(135, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.32);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        osc.start(now); osc.stop(now + 0.35);
      } else if (type === 'clash') {
        [680, 920, 1240].forEach((f, idx) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(f, now + idx * 0.04);
          o.frequency.exponentialRampToValueAtTime(f * 0.4, now + idx * 0.04 + 0.12);
          g.gain.setValueAtTime(0.08, now + idx * 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.13);
          o.connect(g); g.connect(audioCtx.destination);
          o.start(now + idx * 0.04); o.stop(now + idx * 0.04 + 0.14);
        });
      } else if (type === 'fire') {
        const bufSize = audioCtx.sampleRate * 0.38;
        const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
        const noise = audioCtx.createBufferSource();
        noise.buffer = buf;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);
        filter.frequency.exponentialRampToValueAtTime(160, now + 0.36);
        const ng = audioCtx.createGain();
        ng.gain.setValueAtTime(0.22, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        noise.connect(filter); filter.connect(ng); ng.connect(audioCtx.destination);
        noise.start(now);
      } else if (type === 'volley') {
        for (let i = 0; i < 6; i++) {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(980 + i * 70, now + i * 0.045);
          o.frequency.exponentialRampToValueAtTime(280, now + i * 0.045 + 0.14);
          g.gain.setValueAtTime(0.05, now + i * 0.045);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.15);
          o.connect(g); g.connect(audioCtx.destination);
          o.start(now + i * 0.045); o.stop(now + i * 0.045 + 0.16);
        }
      } else if (type === 'skill') {
        [220, 330, 440, 660].forEach((f, idx) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(f, now + idx * 0.05);
          g.gain.setValueAtTime(0.09, now + idx * 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.45);
          o.connect(g); g.connect(audioCtx.destination);
          o.start(now + idx * 0.05); o.stop(now + idx * 0.05 + 0.46);
        });
      }
    } catch (e) {}
  }

  /* ================= CHARACTER & 3D NPC PORTRAIT RENDERER ================= */
  const CITY_THEME_SRCS = {
    xinye:    "assets/images/city_xinye.jpg",
    capital:  "assets/images/city_capital.jpg",
    jiangnan: "assets/images/city_jiangnan.jpg",
    jingzhou: "assets/images/city_jingzhou.jpg",
    shu:      "assets/images/city_shu.jpg",
    wan:      "assets/images/city_wan.png",
    luoyang:  "assets/images/city_luoyang.png",
    changan:  "assets/images/city_changan.png",
    ye:       "assets/images/city_ye.png",
    chaisang: "assets/images/city_chaisang.png",
    jiangxia: "assets/images/city_jiangxia.png",
    jiangling:"assets/images/city_jiangling.png",
    hanzhong: "assets/images/city_hanzhong.png"
  };

  const CITY_THEME_MAP = {
    xinye: 'xinye', wan: 'xinye',
    xuchang: 'capital', luoyang: 'capital', changan: 'capital', ye: 'capital',
    jianye: 'jiangnan', chaisang: 'jiangnan', jiangxia: 'jiangnan',
    xiangyang: 'jingzhou', jiangling: 'jingzhou',
    chengdu: 'shu', hanzhong: 'shu'
  };

  // Subtle per-city atmospheric tint so every single city feels distinct!
  const CITY_TINTS = {
    wan: 'rgba(180, 120, 60, 0.08)',
    luoyang: 'rgba(235, 130, 50, 0.09)',
    changan: 'rgba(160, 130, 90, 0.10)',
    ye: 'rgba(130, 180, 235, 0.10)',
    chaisang: 'rgba(220, 110, 60, 0.07)',
    jiangxia: 'rgba(60, 160, 190, 0.08)',
    jiangling: 'rgba(90, 165, 130, 0.08)',
    hanzhong: 'rgba(120, 175, 200, 0.10)'
  };

  const BATTLE_THEME_SRCS = {
    plains:   "assets/images/battle_plains.jpg",
    river:    "assets/images/battle_river.jpg",
    mountain: "assets/images/battle_mountain.jpg"
  };

  const BATTLE_THEME_MAP = {
    xinye: 'plains', wan: 'plains', xuchang: 'plains', luoyang: 'plains', ye: 'plains',
    jianye: 'river', chaisang: 'river', jiangxia: 'river', xiangyang: 'river', jiangling: 'river',
    chengdu: 'mountain', hanzhong: 'mountain', changan: 'mountain'
  };

  const WORLD_MAP_3D_SRC = "assets/images/world_map_3d.jpg";

  const NPC_ARCHETYPES = {
    scholar:  "assets/images/npc_scholar.jpg",
    merchant: "assets/images/npc_merchant.jpg",
    warrior:  "assets/images/npc_warrior.jpg",
    young:    "assets/images/npc_young.jpg",
    elder:    "assets/images/npc_elder.jpg",
    villager: "assets/images/npc_villager.jpg"
  };

  const PORTRAIT_IMAGES = {
    // Hero Portraits
    liubei:     "assets/images/liubei.jpg",
    guanyu:     "assets/images/guanyu.jpg",
    zhangfei:   "assets/images/zhangfei.jpg",
    zhaoyun:    "assets/images/zhaoyun.jpg",
    zhugeliang: "assets/images/zhugeliang.jpg",
    caocao:     "assets/images/caocao.jpg",
    sunquan:    "assets/images/sunquan.jpg",
    zhouyu:     "assets/images/zhouyu.jpg",
    // 3D Modeled NPC Officers
    jianyong:   NPC_ARCHETYPES.scholar,
    sunqian:    NPC_ARCHETYPES.scholar,
    xushu:      NPC_ARCHETYPES.scholar,
    pangtong:   NPC_ARCHETYPES.scholar,
    xunyu:      NPC_ARCHETYPES.scholar,
    lusu:       NPC_ARCHETYPES.scholar,
    mizhu:      NPC_ARCHETYPES.merchant,
    mifang:     NPC_ARCHETYPES.merchant,
    zhoucang:   NPC_ARCHETYPES.warrior,
    weiyan:     NPC_ARCHETYPES.warrior,
    xiahoudun:  NPC_ARCHETYPES.warrior,
    zhangliao:  NPC_ARCHETYPES.warrior,
    xuzhu:      NPC_ARCHETYPES.warrior,
    caoren:     NPC_ARCHETYPES.warrior,
    caimao:     NPC_ARCHETYPES.warrior,
    wenpin:     NPC_ARCHETYPES.warrior,
    guanping:   NPC_ARCHETYPES.young,
    liufeng:    NPC_ARCHETYPES.young,
    ganning:    NPC_ARCHETYPES.young,
    zhangren:   NPC_ARCHETYPES.young,
    huangzhong: NPC_ARCHETYPES.elder,
    liubiao:    NPC_ARCHETYPES.elder,
    liuzhang:   NPC_ARCHETYPES.elder,
    zhanglu:    NPC_ARCHETYPES.elder
  };

  const cityThemeImgs = {};
  Object.entries(CITY_THEME_SRCS).forEach(([k, u]) => {
    const im = new Image();
    im.src = u;
    cityThemeImgs[k] = im;
  });

  const battleThemeImgs = {};
  Object.entries(BATTLE_THEME_SRCS).forEach(([k, u]) => {
    const im = new Image();
    im.src = u;
    battleThemeImgs[k] = im;
  });

  const worldMap3DImg = new Image();
  let worldMap3DLoaded = false;
  worldMap3DImg.onload = () => { worldMap3DLoaded = true; if (state && state.mapMode) drawWorldMap(); };
  worldMap3DImg.src = WORLD_MAP_3D_SRC;

  const NPC_SPRITE_SRCS = {
    villager: "assets/images/sprite_villager.png",
    traveler: "assets/images/sprite_villager.png",
    merchant: "assets/images/sprite_merchant.png",
    soldier:  "assets/images/sprite_soldier.png",
    infantry: "assets/images/sprite_soldier.png",
    cavalry:  "assets/images/sprite_cavalry.png",
    archer:   "assets/images/sprite_archer.png",
    farmer:   "assets/images/sprite_farmer.png",
    castle:   "assets/images/sprite_castle.png"
  };
  const NPC_SPRITE_DEFAULT_DIR = { villager: 1, traveler: 1, merchant: 1, soldier: -1, infantry: -1, cavalry: -1, archer: 1, farmer: -1 };
  const npcSprites = {};
  Object.entries(NPC_SPRITE_SRCS).forEach(([k, u]) => {
    const img = new Image();
    img.src = u;
    npcSprites[k] = img;
  });

  function makePortraitSVG(off) {
    const src = (off && PORTRAIT_IMAGES[off.id]) || NPC_ARCHETYPES.villager;
    const alt = (off && off.name) || '장수';
    return `<img src="${src}" alt="${alt}" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block;">`;
  }

  /* ================= INITIAL GAME DATA ================= */
  function createInitialState(playerFactionId = "liubei", difficulty = "normal") {
    const factions = {
      liubei: { id: 'liubei', name: '유비군', leader: '유비', color: '#22c55e', player: true, relations: { cao: 15, sun: 65, liubiao: 78, liuzhang: 60, zhanglu: 45 }, allies: {} },
      cao:    { id: 'cao',    name: '조조군', leader: '조조', color: '#3b82f6', player: false, relations: { liubei: 15, sun: 25, liubiao: 20, liuzhang: 35, zhanglu: 30 }, allies: {} },
      sun:    { id: 'sun',    name: '손권군', leader: '손권', color: '#ef4444', player: false, relations: { liubei: 65, cao: 25, liubiao: 20, liuzhang: 45, zhanglu: 40 }, allies: {} },
      liubiao:{ id: 'liubiao',name: '유표군', leader: '유표', color: '#eab308', player: false, relations: { liubei: 78, cao: 20, sun: 20, liuzhang: 50, zhanglu: 45 }, allies: {} },
      liuzhang:{id: 'liuzhang',name:'유장군', leader: '유장', color: '#a855f7', player: false, relations: { liubei: 60, cao: 35, sun: 45, liubiao: 50, zhanglu: 25 }, allies: {} },
      zhanglu:{ id: 'zhanglu',name: '장로군', leader: '장로', color: '#14b8a6', player: false, relations: { liubei: 45, cao: 30, sun: 40, liubiao: 45, liuzhang: 25 }, allies: {} },
    };

    const cities = [
      { id: 'xinye',   name: '신야', tier: '중성', faction: 'liubei', x: 0.50, y: 0.50, gold: 12480, food: 76000, pop: 216000, maxPop: 300000, agri: 72, comm: 68, order: 78, barracks: 40, troops: 3600, train: 72, salary: 1, neighbors: ['wan', 'xuchang', 'xiangyang', 'jiangxia'], assignments: { agri: null, comm: null, order: null, train: null, recruit: null } },
      { id: 'jiangxia',name: '강하', tier: '소성', faction: 'liubei', x: 0.62, y: 0.61, gold: 5800,  food: 38000, pop: 138000, maxPop: 240000, agri: 52, comm: 49, order: 70, barracks: 28, troops: 2400, train: 65, salary: 1, neighbors: ['xinye', 'xiangyang', 'chaisang'], assignments: { agri: null, comm: null, order: null, train: null, recruit: null } },
      { id: 'wan',     name: '완',   tier: '중성', faction: 'cao',    x: 0.45, y: 0.40, gold: 9200,  food: 62000, pop: 190000, maxPop: 300000, agri: 65, comm: 60, order: 75, barracks: 42, troops: 5200, train: 74, salary: 1, neighbors: ['xinye', 'luoyang', 'xuchang', 'changan'], assignments: {} },
      { id: 'xuchang', name: '허창', tier: '대성', faction: 'cao',    x: 0.58, y: 0.37, gold: 24000, food: 140000,pop: 340000, maxPop: 450000, agri: 84, comm: 86, order: 85, barracks: 55, troops: 9800, train: 82, salary: 1, neighbors: ['xinye', 'wan', 'luoyang', 'ye', 'jianye'], assignments: {} },
      { id: 'luoyang', name: '낙양', tier: '대성', faction: 'cao',    x: 0.46, y: 0.28, gold: 18500, food: 110000,pop: 290000, maxPop: 420000, agri: 78, comm: 80, order: 80, barracks: 50, troops: 7400, train: 78, salary: 1, neighbors: ['wan', 'xuchang', 'changan', 'ye'], assignments: {} },
      { id: 'ye',      name: '업',   tier: '대성', faction: 'cao',    x: 0.57, y: 0.18, gold: 21000, food: 125000,pop: 310000, maxPop: 420000, agri: 82, comm: 79, order: 82, barracks: 52, troops: 8200, train: 80, salary: 1, neighbors: ['luoyang', 'xuchang'], assignments: {} },
      { id: 'changan', name: '장안', tier: '대성', faction: 'cao',    x: 0.28, y: 0.31, gold: 16200, food: 95000, pop: 270000, maxPop: 400000, agri: 74, comm: 75, order: 76, barracks: 48, troops: 6800, train: 76, salary: 1, neighbors: ['luoyang', 'wan', 'hanzhong'], assignments: {} },
      { id: 'xiangyang',name:'양양', tier: '대성', faction: 'liubiao',x: 0.43, y: 0.58, gold: 15800, food: 98000, pop: 265000, maxPop: 360000, agri: 76, comm: 74, order: 82, barracks: 44, troops: 6100, train: 70, salary: 1, neighbors: ['xinye', 'jiangxia', 'jiangling', 'hanzhong'], assignments: {} },
      { id: 'jiangling',name:'강릉', tier: '중성', faction: 'liubiao',x: 0.45, y: 0.72, gold: 11200, food: 74000, pop: 210000, maxPop: 320000, agri: 70, comm: 66, order: 76, barracks: 38, troops: 4800, train: 68, salary: 1, neighbors: ['xiangyang', 'chaisang', 'chengdu'], assignments: {} },
      { id: 'chaisang',name: '시상', tier: '중성', faction: 'sun',    x: 0.67, y: 0.71, gold: 14500, food: 86000, pop: 225000, maxPop: 320000, agri: 71, comm: 76, order: 80, barracks: 46, troops: 6500, train: 79, salary: 1, neighbors: ['jiangxia', 'jiangling', 'jianye'], assignments: {} },
      { id: 'jianye',  name: '건업', tier: '대성', faction: 'sun',    x: 0.80, y: 0.58, gold: 22500, food: 120000,pop: 325000, maxPop: 420000, agri: 80, comm: 88, order: 86, barracks: 52, troops: 8800, train: 81, salary: 1, neighbors: ['chaisang', 'xuchang'], assignments: {} },
      { id: 'hanzhong',name: '한중', tier: '중성', faction: 'zhanglu',x: 0.25, y: 0.48, gold: 10500, food: 82000, pop: 185000, maxPop: 280000, agri: 75, comm: 58, order: 84, barracks: 36, troops: 4600, train: 66, salary: 1, neighbors: ['changan', 'xiangyang', 'chengdu'], assignments: {} },
      { id: 'chengdu', name: '성도', tier: '대성', faction: 'liuzhang',x:0.18, y: 0.69, gold: 19800, food: 130000,pop: 315000, maxPop: 420000, agri: 88, comm: 82, order: 80, barracks: 42, troops: 7200, train: 67, salary: 1, neighbors: ['hanzhong', 'jiangling'], assignments: {} },
    ];

    const officers = [
      // Liu Bei - Xinye (8 officers matching screenshot!)
      { id: 'liubei',  name: '유비', faction: 'liubei', city: 'xinye', ldr: 80, war: 74, int: 76, pol: 82, chr: 99, loy: 100, trait: '인의군주', skill: '고무격려', bg:'#1a4731', robe:'#166534', hat:'crown', beard:'short', accent:'#facc15' },
      { id: 'guanyu',  name: '관우', faction: 'liubei', city: 'xinye', ldr: 96, war: 97, int: 76, pol: 64, chr: 93, loy: 100, trait: '의형제',   skill: '청룡언월도', bg:'#451a1a', robe:'#15803d', skin:'#e89a78', hat:'hood', beard:'long', accent:'#fbbf24' },
      { id: 'zhangfei',name: '장비', faction: 'liubei', city: 'xinye', ldr: 86, war: 98, int: 38, pol: 28, chr: 58, loy: 100, trait: '의형제',   skill: '장판파 포효', bg:'#3b1d14', robe:'#1e293b', skin:'#d49a74', hat:'helmet', beard:'wild', accent:'#ef4444' },
      { id: 'zhaoyun', name: '조운', faction: 'liubei', city: 'xinye', ldr: 92, war: 96, int: 76, pol: 65, chr: 88, loy: 99,  trait: '상산자룡', skill: '단기구주', bg:'#1e3a5f', robe:'#e2e8f0', hat:'helmet', beard:'none', accent:'#38bdf8' },
      { id: 'jianyong',name: '간옹', faction: 'liubei', city: 'xinye', ldr: 42, war: 36, int: 75, pol: 77, chr: 78, loy: 96,  trait: '언변가',   skill: '설득',     bg:'#2e2447', robe:'#334155', hat:'scholar', beard:'short', accent:'#cbd5e1' },
      { id: 'mizhu',   name: '미축', faction: 'liubei', city: 'xinye', ldr: 45, war: 32, int: 73, pol: 84, chr: 79, loy: 98,  trait: '상업가',   skill: '군자금 조달', bg:'#3b2f16', robe:'#78350f', hat:'scholar', beard:'short', accent:'#fbbf24' },
      { id: 'sunqian', name: '손건', faction: 'liubei', city: 'xinye', ldr: 48, war: 38, int: 78, pol: 81, chr: 82, loy: 97,  trait: '외교관',   skill: '친선사절', bg:'#173742', robe:'#1e3a5f', hat:'scholar', beard:'short', accent:'#93c5fd' },
      { id: 'zhoucang',name: '주창', faction: 'liubei', city: 'xinye', ldr: 72, war: 84, int: 46, pol: 40, chr: 66, loy: 98,  trait: '호위무사', skill: '맹돌격',   bg:'#2b2118', robe:'#3f3f46', hat:'helmet', beard:'wild', accent:'#d97706' },

      // Liu Bei - Jiangxia
      { id: 'guanping',name: '관평', faction: 'liubei', city: 'jiangxia', ldr: 79, war: 83, int: 72, pol: 68, chr: 77, loy: 98, trait: '충효장', skill: '연격', bg:'#193829', robe:'#166534', hat:'helmet', beard:'none', accent:'#fbbf24' },
      { id: 'liufeng', name: '유봉', faction: 'liubei', city: 'jiangxia', ldr: 75, war: 79, int: 60, pol: 55, chr: 68, loy: 92, trait: '선봉장', skill: '돌파', bg:'#1e334a', robe:'#1e40af', hat:'helmet', beard:'none', accent:'#93c5fd' },
      { id: 'mifang',  name: '미방', faction: 'liubei', city: 'jiangxia', ldr: 55, war: 61, int: 56, pol: 66, chr: 58, loy: 80, trait: '보급관', skill: '수비', bg:'#2d2538', robe:'#475569', hat:'scholar', beard:'short', accent:'#cbd5e1' },

      // Free / Hidden Officers (Discoverable!)
      { id: 'zhugeliang', name: '제갈량', faction: null, city: 'xinye',    ldr: 93, war: 38, int: 100,pol: 98, chr: 95, loy: 95, trait: '와룡선생', skill: '팔진도 화계', bg:'#133642', robe:'#f8fafc', hat:'scholar', beard:'short', accent:'#38bdf8' },
      { id: 'xushu',      name: '서서',   faction: null, city: 'xinye',    ldr: 82, war: 66, int: 93, pol: 84, chr: 85, loy: 90, trait: '단복',     skill: '기습계략', bg:'#1c3638', robe:'#334155', hat:'scholar', beard:'short', accent:'#6ee7b7' },
      { id: 'pangtong',   name: '방통',   faction: null, city: 'xiangyang',ldr: 80, war: 34, int: 97, pol: 88, chr: 78, loy: 90, trait: '봉추',     skill: '연환계',   bg:'#38233a', robe:'#4c1d95', hat:'scholar', beard:'short', accent:'#f472b6' },
      { id: 'weiyan',     name: '위연',   faction: null, city: 'jiangxia', ldr: 86, war: 92, int: 69, pol: 52, chr: 55, loy: 82, trait: '맹장',     skill: '기습돌격', bg:'#3d1a1a', robe:'#7f1d1d', hat:'helmet', beard:'short', accent:'#f87171' },
      { id: 'huangzhong', name: '황충',   faction: null, city: 'jiangling',ldr: 86, war: 93, int: 64, pol: 54, chr: 76, loy: 92, trait: '노익장',   skill: '백보천양', bg:'#3f2e15', robe:'#854d0e', hat:'helmet', beard:'white', accent:'#facc15' },

      // Cao Cao Officers
      { id: 'caocao',  name: '조조',   faction: 'cao', city: 'xuchang', ldr: 97, war: 72, int: 92, pol: 95, chr: 96, loy: 100, trait: '난세간웅', skill: '위무의 호령', bg:'#172554', robe:'#1d4ed8', hat:'crown', beard:'short', accent:'#fbbf24' },
      { id: 'xiahoudun',name:'하후돈', faction: 'cao', city: 'wan',     ldr: 88, war: 90, int: 62, pol: 70, chr: 82, loy: 99,  trait: '독안장군', skill: '맹진', bg:'#1e293b', robe:'#1e3a8a', hat:'helmet', beard:'short', accent:'#93c5fd' },
      { id: 'zhangliao',name:'장료',   faction: 'cao', city: 'luoyang', ldr: 94, war: 92, int: 78, pol: 64, chr: 84, loy: 95,  trait: '합비의 귀신', skill: '요래래', bg:'#172554', robe:'#1e40af', hat:'helmet', beard:'short', accent:'#60a5fa' },
      { id: 'xuzhu',   name: '허저',   faction: 'cao', city: 'ye',      ldr: 76, war: 96, int: 36, pol: 24, chr: 58, loy: 98,  trait: '호치',     skill: '괴력난타', bg:'#1f2937', robe:'#334155', hat:'helmet', beard:'wild', accent:'#cbd5e1' },
      { id: 'xunyu',   name: '순욱',   faction: 'cao', city: 'xuchang', ldr: 62, war: 25, int: 95, pol: 98, chr: 92, loy: 96,  trait: '왕좌지재', skill: '구호계', bg:'#1e293b', robe:'#0f172a', hat:'scholar', beard:'short', accent:'#e2e8f0' },
      { id: 'caoren',  name: '조인',   faction: 'cao', city: 'changan', ldr: 90, war: 86, int: 68, pol: 62, chr: 78, loy: 99,  trait: '철벽수비', skill: '팔문금쇄진', bg:'#1e3a5f', robe:'#1d4ed8', hat:'helmet', beard:'short', accent:'#fbbf24' },

      // Sun Quan Officers
      { id: 'sunquan', name: '손권',   faction: 'sun', city: 'jianye',  ldr: 82, war: 68, int: 82, pol: 89, chr: 94, loy: 100, trait: '강동의 호랑이', skill: '수군총령', bg:'#450a0a', robe:'#991b1b', hat:'crown', beard:'short', accent:'#facc15' },
      { id: 'zhouyu',  name: '주유',   faction: 'sun', city: 'chaisang',ldr: 95, war: 72, int: 96, pol: 86, chr: 93, loy: 99,  trait: '미주랑',   skill: '적벽화공', bg:'#5c1212', robe:'#b91c1c', hat:'helmet', beard:'none', accent:'#fde047' },
      { id: 'ganning', name: '감녕',   faction: 'sun', city: 'chaisang',ldr: 86, war: 94, int: 74, pol: 42, chr: 71, loy: 90,  trait: '금범적',   skill: '야습', bg:'#4c1d24', robe:'#7f1d1d', hat:'hood', beard:'none', accent:'#fb923c' },
      { id: 'lusu',    name: '노숙',   faction: 'sun', city: 'jianye',  ldr: 80, war: 56, int: 92, pol: 91, chr: 90, loy: 97,  trait: '대도독',   skill: '동맹설득', bg:'#3b1a1a', robe:'#7f1d1d', hat:'scholar', beard:'short', accent:'#facc15' },

      // Liu Biao Officers
      { id: 'liubiao', name: '유표',   faction: 'liubiao', city: 'xiangyang', ldr: 68, war: 42, int: 75, pol: 82, chr: 84, loy: 100, trait: '형주목', skill: '성수비', bg:'#3f300f', robe:'#a16207', hat:'crown', beard:'white', accent:'#fde047' },
      { id: 'caimao',  name: '채모',   faction: 'liubiao', city: 'xiangyang', ldr: 74, war: 70, int: 68, pol: 64, chr: 58, loy: 86,  trait: '수군도독', skill: '수전', bg:'#3b2e13', robe:'#854d0e', hat:'helmet', beard:'short', accent:'#fcd34d' },
      { id: 'wenpin',  name: '문빙',   faction: 'liubiao', city: 'jiangling', ldr: 84, war: 82, int: 66, pol: 58, chr: 74, loy: 92,  trait: '명장',   skill: '철벽방어', bg:'#3b2e13', robe:'#713f12', hat:'helmet', beard:'short', accent:'#fbbf24' },

      // Liu Zhang & Zhang Lu
      { id: 'liuzhang',name: '유장',   faction: 'liuzhang', city: 'chengdu',  ldr: 48, war: 28, int: 54, pol: 66, chr: 72, loy: 100, trait: '익주목', skill: '수성', bg:'#311847', robe:'#6b21a8', hat:'crown', beard:'short', accent:'#e9d5ff' },
      { id: 'zhangren',name: '장임',   faction: 'liuzhang', city: 'chengdu',  ldr: 85, war: 84, int: 76, pol: 62, chr: 74, loy: 96,  trait: '낙봉파', skill: '매복사격', bg:'#311847', robe:'#581c87', hat:'helmet', beard:'short', accent:'#d8b4fe' },
      { id: 'zhanglu', name: '장로',   faction: 'zhanglu',  city: 'hanzhong', ldr: 68, war: 52, int: 72, pol: 78, chr: 82, loy: 100, trait: '오두미도', skill: '민심안정', bg:'#133b38', robe:'#0f766e', hat:'scholar', beard:'short', accent:'#5eead4' },
    ];

    Object.values(factions).forEach(f => { f.player = (f.id === playerFactionId); });
    officers.forEach(o => { o.lv = 1; o.exp = 0; });
    const startCity = cities.find(c => c.faction === playerFactionId) || cities[0];
    if (difficulty === 'easy') {
      cities.filter(c => c.faction === playerFactionId).forEach(c => { c.gold += 4000; c.food += 25000; c.troops += 1200; });
    } else if (difficulty === 'hard') {
      cities.filter(c => c.faction !== playerFactionId).forEach(c => { c.troops = Math.round(c.troops * 1.25); c.gold += 3000; });
    }
    const pName = factions[playerFactionId].name;
    return {
      year: 207,
      month: 1,
      turn: 1,
      difficulty,
      stats: { battlesWon: 0, citiesCaptured: 0, officersRecruited: 0, duelsWon: 0 },
      techs: {},
      relics: [
        { id: 'qinglong', name: '청룡언월도', icon: '🐉', stat: 'war', bonus: 5, owner: playerFactionId === 'liubei' ? 'guanyu' : null, owned: playerFactionId === 'liubei' },
        { id: 'chitu',    name: '적토마',     icon: '🐎', stat: 'ldr', bonus: 5, owner: null, owned: false },
        { id: 'sunzi',    name: '손자병법',   icon: '📜', stat: 'int', bonus: 5, owner: null, owned: false },
        { id: 'yuxi',     name: '전국의 옥새',icon: '👑', stat: 'chr', bonus: 6, owner: null, owned: false },
        { id: 'zhangba',  name: '장팔사모',   icon: '⚔️', stat: 'war', bonus: 4, owner: null, owned: false },
        { id: 'yushan',   name: '백학우선',   icon: '🪶', stat: 'int', bonus: 4, owner: null, owned: false }
      ],
      questStep: 0,
      achievements: {},
      playerFaction: playerFactionId,
      selectedCityId: startCity.id,
      activeTab: 'domestic',
      mapMode: false,
      selectedMapCityId: null,
      foodRate: 10, // 1 gold = 10 food
      factions,
      cities,
      officers,
      eventsTriggered: { taoyuan: true },
      gameOver: null,
      logs: [
        { type: 'hist', text: '[역사] 도원결의 — 관우·장비: "형님과 함께라면 어디든!" — 충성 100, 의형제' },
        { type: 'hist', text: '[역사] 207년 신야성 — 유비군 천하통일의 서막이 열렸습니다. 장수를 배치하고 턴을 종료하세요.' }
      ]
    };
  }

  let state = loadState() || createInitialState();

  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.cities && parsed.officers && parsed.factions) return parsed;
    } catch (e) {}
    return null;
  }

  function saveState(silent = true) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      if (!silent) showToast('게임이 브라우저에 저장되었습니다.');
    } catch (e) {
      if (!silent) showToast('저장 공간을 사용할 수 없습니다.');
    }
  }

  /* ================= HELPER COMPUTATIONS ================= */
  const $ = (id) => document.getElementById(id);

  function getPlayerCities() {
    return state.cities.filter(c => c.faction === state.playerFaction);
  }

  function getCity(id) {
    return state.cities.find(c => c.id === id);
  }

  function getCurrentCity() {
    let c = getCity(state.selectedCityId);
    if (!c || c.faction !== state.playerFaction) {
      const pcs = getPlayerCities();
      if (pcs.length > 0) {
        state.selectedCityId = pcs[0].id;
        c = pcs[0];
      }
    }
    return c;
  }

  function getCityOfficers(cityId, factionId = null) {
    const city = getCity(cityId);
    const fac = factionId !== null ? factionId : (city ? city.faction : null);
    return state.officers.filter(o => o.city === cityId && o.faction === fac);
  }

  function getFreeOfficers(cityId) {
    return state.officers.filter(o => o.city === cityId && o.faction === null);
  }

  function getOfficer(id) {
    return state.officers.find(o => o.id === id);
  }

  function getOfficerAssignment(city, offId) {
    if (!city || !city.assignments) return null;
    for (const [k, v] of Object.entries(city.assignments)) {
      if (v === offId) return k;
    }
    return null;
  }

  function getIdleOfficers(city) {
    return getCityOfficers(city.id).filter(o => !getOfficerAssignment(city, o.id));
  }

  function getLevel(val, max = 100) {
    const ratio = val / max;
    if (ratio >= 0.85) return 5;
    if (ratio >= 0.65) return 4;
    if (ratio >= 0.45) return 3;
    if (ratio >= 0.25) return 2;
    return 1;
  }

  function getSeasonInfo(month) {
    if (month >= 3 && month <= 5)  return { id: 'spring', icon: '🌸', name: '봄',   bonus: '인구 성장 +30%', particle: 'rgba(255, 205, 228, 0.90)' };
    if (month >= 6 && month <= 8)  return { id: 'summer', icon: '☀️', name: '여름', bonus: '화계 성공률 상승', particle: 'rgba(253, 224, 71, 0.55)' };
    if (month >= 9 && month <= 11) return { id: 'autumn', icon: '🍁', name: '가을', bonus: '수확철 군량 +40%', particle: 'rgba(249, 115, 22, 0.88)' };
    return                                { id: 'winter', icon: '❄️', name: '겨울', bonus: '수성 방어력 +15%', particle: 'rgba(224, 242, 254, 0.90)' };
  }

  function grantOfficerExp(off, amount, focusStat = 'ldr') {
    if (!off) return;
    off.lv = off.lv || 1;
    off.exp = (off.exp || 0) + amount;
    while (off.exp >= 100) {
      off.exp -= 100;
      off.lv++;
      off[focusStat] = Math.min(100, off[focusStat] + 2);
      off.ldr = Math.min(100, off.ldr + 1);
      addLog('per', `[성장] ${off.name}이(가) Lv${off.lv}(으)로 승급! 능력치가 상승했습니다.`);
      showToast(`⭐ ${off.name} Lv${off.lv} 승급!`);
    }
  }

  /* ================= HIT SYSTEMS: TECH TREE, RELICS, QUESTS, ACHIEVEMENTS ================= */
  const TECH_TREE = [
    { id: 'tuntian',  branch: '내정', icon: '🌾', name: '둔전제 시행',    cost: 2200, desc: '모든 아군 성의 군량 수입이 영구적으로 +20% 증가합니다.' },
    { id: 'guild',    branch: '내정', icon: '🪙', name: '대상단 길드',    cost: 2200, desc: '모든 아군 성의 금 수입이 영구적으로 +20% 증가합니다.' },
    { id: 'crossbow', branch: '군사', icon: '🏹', name: '연노병 개량',    cost: 2600, desc: '일제사격 및 궁병 부대의 전투 위력이 +20% 증가합니다.' },
    { id: 'cavalry',  branch: '군사', icon: '🐎', name: '정예 기마대',    cost: 2600, desc: '맹돌격 및 기병 부대의 전투 위력이 +20% 증가합니다.' },
    { id: 'firebook', branch: '계략', icon: '🔥', name: '화공 전술서',    cost: 2400, desc: '화계 성공 판정 +5, 피해 +25%.' },
    { id: 'prestige', branch: '외교', icon: '👑', name: '천하 명성 선포', cost: 2800, desc: '재야 인재 등용 확률 +25%p, 모든 아군 장수 매달 충성 +1.' },
    { id: 'tuntian2', branch: '내정', icon: '🌾', name: '관개 시설 확충', cost: 4200, requires: 'tuntian', desc: '군량 총수입 추가 +10% (기본 수입 기준).' },
    { id: 'guild2', branch: '내정', icon: '🪙', name: '교역로 개척', cost: 4200, requires: 'guild', desc: '금 총수입 추가 +10% (기본 수입 기준).' },
    { id: 'crossbow2', branch: '군사', icon: '🏹', name: '궁병 진형 훈련', cost: 4800, requires: 'crossbow', desc: '일제사격 또는 궁병의 피해 추가 +10% (기본 피해 기준).' },
    { id: 'cavalry2', branch: '군사', icon: '🐎', name: '기병 진형 훈련', cost: 4800, requires: 'cavalry', desc: '맹돌격 또는 기병의 피해 추가 +10% (기본 피해 기준).' },
    { id: 'firebook2', branch: '계략', icon: '🔥', name: '화공 병법 연구', cost: 4600, requires: 'firebook', desc: '화계 성공 판정 추가 +5, 피해 추가 +10% (기본 피해 기준).' },
    { id: 'prestige2', branch: '외교', icon: '👑', name: '인재 우대 정책', cost: 5000, requires: 'prestige', desc: '재야 인재 등용 확률 추가 +10%p, 아군 장수 매달 충성 추가 +1.' }
  ];

  const ACHIEVEMENT_LIST = [
    { id: 'first_win',  icon: '⚔️', name: '첫 승전보',    desc: '첫 번째 전투에서 승리' },
    { id: 'duel_king',  icon: '🥊', name: '일기토 무쌍',  desc: '일기토에서 적장 제압' },
    { id: 'zhuge',      icon: '🪶', name: '와룡을 얻다',  desc: '제갈량을 아군으로 영입' },
    { id: 'five_city',  icon: '🏯', name: '중원의 패자',  desc: '보유 성 5개 이상 달성' },
    { id: 'ten_k',      icon: '🛡️', name: '부국강병',     desc: '한 성의 병력 10,000명 돌파' },
    { id: 'tech_3',     icon: '📜', name: '선진 국가',    desc: '국가 기술 3종 이상 연구 완료' },
    { id: 'unify',      icon: '👑', name: '천하통일',     desc: '중원 13개 성 모두 평정' }
  ];

  const QUEST_LIST = [
    {
      title: '내정의 기초',
      desc: '현재 성에서 장수 3명 이상을 내정 임무에 배치하세요. (좌측 추천 맡기기 활용)',
      rewardTxt: '금 +1,200',
      check: () => {
        const c = getCurrentCity();
        return c && Object.values(c.assignments || {}).filter(Boolean).length >= 3;
      },
      grant: () => {
        const c = getCurrentCity();
        if (c) c.gold += 1200;
        addLog('hist', '[목표] "내정의 기초" 달성! 보상 금 +1,200 획득.');
      }
    },
    {
      title: '첫 번째 정복',
      desc: '군사 탭 또는 천하 지도에서 인접 적 성을 1곳 이상 점령하세요.',
      rewardTxt: '보물 [적토마]',
      check: () => (state.stats && state.stats.citiesCaptured >= 1),
      grant: () => {
        unlockRelic('chitu');
        addLog('hist', '[목표] "첫 번째 정복" 달성! 전설의 명마 [적토마](통솔+5)를 획득했습니다!');
      }
    },
    {
      title: '국가 기술 혁신',
      desc: '[연구] 탭에서 국가 기술을 1종 이상 연구 완료하세요.',
      rewardTxt: '군량 +18,000',
      check: () => Object.keys(state.techs || {}).length >= 1,
      grant: () => {
        const c = getCurrentCity();
        if (c) c.food += 18000;
        addLog('hist', '[목표] "국가 기술 혁신" 달성! 보상 군량 +18,000 획득.');
      }
    },
    {
      title: '중원의 패권',
      desc: '아군 보유 성을 5개 이상으로 확장하세요.',
      rewardTxt: '보물 [손자병법]',
      check: () => getPlayerCities().length >= 5,
      grant: () => {
        unlockRelic('sunzi');
        addLog('hist', '[목표] "중원의 패권" 달성! [손자병법](지력+5)을 획득했습니다!');
      }
    },
    {
      title: '천하통일',
      desc: '중원의 모든 13개 성을 통일하여 난세를 종결하세요!',
      rewardTxt: '전국의 옥새',
      check: () => getPlayerCities().length >= state.cities.length,
      grant: () => { unlockRelic('yuxi'); }
    }
  ];

  function unlockAchievement(id) {
    state.achievements = state.achievements || {};
    if (state.achievements[id]) return;
    state.achievements[id] = true;
    const item = ACHIEVEMENT_LIST.find(a => a.id === id);
    if (item) {
      playSfx('fanfare');
      showToast(`🏆 업적 달성: ${item.icon} ${item.name}!`);
      addLog('hist', `[업적] ${item.icon} ${item.name} — ${item.desc}`);
    }
  }

  function unlockRelic(id) {
    state.relics = state.relics || [];
    const r = state.relics.find(x => x.id === id);
    if (r && !r.owned) {
      r.owned = true;
      showToast(`🎁 전설 보물 획득: ${r.icon} ${r.name}!`);
    }
  }

  function checkQuestsAndAchievements() {
    state.achievements = state.achievements || {};
    state.techs = state.techs || {};
    state.questStep = state.questStep || 0;

    // Quest progression
    if (state.questStep < QUEST_LIST.length) {
      const q = QUEST_LIST[state.questStep];
      if (q.check()) {
        q.grant();
        playSfx('fanfare');
        showToast(`🎯 목표 달성: ${q.title} (${q.rewardTxt})`);
        state.questStep++;
      }
    }

    // Achievements check
    if (state.stats && state.stats.battlesWon >= 1) unlockAchievement('first_win');
    if (state.stats && state.stats.duelsWon >= 1) unlockAchievement('duel_king');
    const zg = getOfficer('zhugeliang');
    if (zg && zg.faction === state.playerFaction) unlockAchievement('zhuge');
    if (getPlayerCities().length >= 5) unlockAchievement('five_city');
    if (getPlayerCities().some(c => c.troops >= 10000)) unlockAchievement('ten_k');
    if (Object.keys(state.techs).length >= 3) unlockAchievement('tech_3');
    if (getPlayerCities().length >= state.cities.length) unlockAchievement('unify');
  }

  function openAchievementsModal() {
    playSfx('click');
    const achs = state.achievements || {};
    const relics = (state.relics || []).filter(r => r.owned);
    const unlockedCnt = Object.keys(achs).length;
    const html = `
      <div style="font-size:13px;font-weight:800;color:var(--gold-bright);margin-bottom:8px;">
        🏆 달성 업적 (${unlockedCnt} / ${ACHIEVEMENT_LIST.length})
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">
        ${ACHIEVEMENT_LIST.map(a => `
          <div class="ach-badge ${achs[a.id] ? 'unlocked' : ''}" title="${a.desc}">
            <span>${a.icon}</span> <b>${a.name}</b>
          </div>`).join('')}
      </div>
      <div style="font-size:13px;font-weight:800;color:var(--gold-bright);margin-bottom:8px;">
        🎁 보유 보물함 (${relics.length}개) — 장수 상세 창에서 장착 가능
      </div>
      ${relics.length === 0
        ? '<div style="font-size:12px;color:var(--text-sub);">아직 획득한 보물이 없습니다. 목표 달성 및 성 점령으로 보물을 얻으세요!</div>'
        : `<div style="display:flex;flex-direction:column;gap:6px;">${relics.map(r => {
            const owner = r.owner ? getOfficer(r.owner) : null;
            return `<div class="panel-card" style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;">
              <div><span class="relic-pill">${r.icon} ${r.name}</span> <span style="font-size:11px;color:var(--green);margin-left:6px;">+${r.bonus} (${r.stat.toUpperCase()})</span></div>
              <span style="font-size:11px;color:var(--text-sub);">${owner ? `${owner.name} 장착 중` : '미장착'}</span>
            </div>`;
          }).join('')}</div>`}
    `;
    openModal('🏆 군주 업적 & 전설 보물함', html);
  }

  function renderTechTab() {
    const city = getCurrentCity();
    if (!city) return;
    state.techs = state.techs || {};
    const doneCnt = TECH_TREE.filter(t => state.techs[t.id]).length;

    let html = `
      <div class="section-h">
        <span>📜 국가 기술 연구 (${doneCnt} / ${TECH_TREE.length} 완료)</span>
        <span style="font-size:11.5px;color:var(--text-sub);">연구 자금: ${city.name} 금 ${city.gold.toLocaleString()}</span>
      </div>
      <p style="font-size:11.5px;color:var(--text-sub);">각 연구를 완료하면 같은 분야의 다음 단계가 즉시 열립니다. 현재 마지막 단계는 2단계입니다.</p>
      <div class="grid-cards">
    `;
    TECH_TREE.forEach(t => {
      const done = !!state.techs[t.id];
      const prerequisite = t.requires && TECH_TREE.find(x => x.id === t.requires);
      const locked = prerequisite && !state.techs[t.requires];
      html += `
        <div class="tech-card ${done ? 'done' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:800;font-size:14px;color:${done ? 'var(--green)' : 'var(--gold-bright)'};">${t.icon} ${t.name}</span>
            <span style="font-size:10.5px;color:var(--cyan);background:#0c1528;padding:2px 6px;border-radius:3px;">${t.branch}</span>
          </div>
          <div style="font-size:11.5px;color:#cbd5e1;line-height:1.45;flex:1;">${t.desc}${locked ? `<br>🔒 선행 연구: ${prerequisite.name}` : ''}</div>
          <button class="btn-sm ${done ? 'btn-success' : ''} act-research" data-tid="${t.id}" ${done || locked ? 'disabled' : ''}>
            ${done ? '✅ 연구 완료' : locked ? '🔒 선행 연구 필요' : `📜 연구 실행 (금 ${t.cost.toLocaleString()})`}
          </button>
        </div>`;
    });
    html += `</div>`;
    $('viewTech').innerHTML = html;

    document.querySelectorAll('.act-research').forEach(b => {
      b.addEventListener('click', () => {
        const t = TECH_TREE.find(x => x.id === b.dataset.tid);
        if (!t || state.techs[t.id] || (t.requires && !state.techs[t.requires])) return;
        if (city.gold < t.cost) return showToast(`연구에 금 ${t.cost.toLocaleString()}이 필요합니다.`);
        city.gold -= t.cost;
        state.techs[t.id] = true;
        playSfx('fanfare');
        addLog('hist', `[연구] 국가 기술 【${t.name}】 연구를 완료했습니다!`);
        showToast(`📜 【${t.name}】 연구 완료!`);
        checkQuestsAndAchievements();
        renderAll();
        saveState(true);
      });
    });
  }

  function calcMonthlyEconomy(city) {
    const farmLv = getLevel(city.agri, 100);
    const mktLv = getLevel(city.comm, 100);
    const farmBonus = 1 + (farmLv - 1) * 0.05;
    const mktBonus = 1 + (mktLv - 1) * 0.05;
    const orderFactor = 0.55 + (city.order / 100) * 0.45;
    const popFactor = Math.max(0.4, city.pop / 200000);

    const guildMult = (city.faction === state.playerFaction && state.techs && state.techs.guild) ? 1.2 + (state.techs.guild2 ? 0.1 : 0) : 1.0;
    const tuntianMult = (city.faction === state.playerFaction && state.techs && state.techs.tuntian) ? 1.2 + (state.techs.tuntian2 ? 0.1 : 0) : 1.0;
    const goldGross = Math.round((260 + city.comm * 7.2) * mktBonus * orderFactor * popFactor * guildMult);
    const seasonMult = (state.month >= 9 && state.month <= 11) ? 1.4 : 1.0;
    const foodGross = Math.round((850 + city.agri * 24) * farmBonus * orderFactor * popFactor * seasonMult * tuntianMult);

    const offs = getCityOfficers(city.id);
    const salMult = city.salary === 0 ? 35 : city.salary === 1 ? 60 : 95;
    const salaryCost = offs.length * salMult;
    const troopGoldCost = Math.round(city.troops * 0.04);
    const troopFoodCost = Math.round(city.troops * 0.22);

    return {
      goldNet: goldGross - salaryCost - troopGoldCost,
      goldGross,
      foodNet: foodGross - troopFoodCost,
      foodGross,
      salaryCost,
      farmLv,
      mktLv,
      barLv: getLevel(city.barracks, 60)
    };
  }

  function addLog(type, text) {
    state.logs.unshift({ type, text });
    if (state.logs.length > 60) state.logs.pop();
  }

  let toastTimer = null;
  function showToast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ================= MODAL SYSTEM ================= */
  function openModal(title, bodyHtml, footerButtons = []) {
    $('modalTitle').textContent = title;
    $('modalBody').innerHTML = bodyHtml;
    const f = $('modalFooter');
    f.innerHTML = '';
    footerButtons.forEach(btn => {
      const el = document.createElement('button');
      el.className = btn.cls || 'btn-gold';
      el.textContent = btn.label;
      el.addEventListener('click', () => btn.onClick());
      f.appendChild(el);
    });
    if (footerButtons.length === 0) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'btn-gold';
      closeBtn.textContent = '닫기';
      closeBtn.addEventListener('click', closeModal);
      f.appendChild(closeBtn);
    }
    $('modalBackdrop').classList.add('open');
  }

  function closeModal() {
    $('modalBackdrop').classList.remove('open');
    const mb = document.querySelector('.modal-box');
    if (mb) mb.classList.remove('battle-mode');
  }

  /* ================= TASK ASSIGNMENT ================= */
  const TASK_META = {
    agri:    { name: '농업 개발', stat: 'pol', statLabel: '정치', costGold: 200, desc: '농업 수치와 군량 수입을 높입니다.' },
    comm:    { name: '상업 투자', stat: 'pol', statLabel: '정치', costGold: 200, desc: '상업 수치와 금 수입을 높입니다.' },
    order:   { name: '치안 순찰', stat: 'chr', statLabel: '매력', costGold: 120, desc: '치안을 회복하고 반란을 예방합니다.' },
    train:   { name: '훈련',      stat: 'ldr', statLabel: '통솔', costGold: 150, desc: '병사의 훈련도와 전투력을 높입니다.' },
    recruit: { name: '징병',      stat: 'chr', statLabel: '매력', costGold: 350, desc: '인구에서 신규 병력을 모집합니다.' }
  };

  function openAssignModal(taskKey) {
    const city = getCurrentCity();
    if (!city) return;
    playSfx('click');
    const meta = TASK_META[taskKey];
    const currentId = city.assignments[taskKey];
    const offs = getCityOfficers(city.id).slice().sort((a, b) => b[meta.stat] - a[meta.stat]);

    let html = `<p style="color:var(--text-sub);margin-bottom:10px;font-size:12px;">
      ${meta.desc} (턴 종료 시 금 <b>${meta.costGold}</b> 소모 · 추천 능력: <b style="color:var(--gold-bright);">${meta.statLabel}</b>)
    </p>`;

    if (currentId) {
      const cur = getOfficer(currentId);
      html += `<div style="display:flex;justify-content:space-between;align-items:center;background:#132a24;border:1px solid #2e7d57;padding:7px 10px;border-radius:5px;margin-bottom:10px;">
        <span>현재 담당: <b style="color:var(--green);">${cur ? cur.name : ''}</b></span>
        <button class="btn-sm btn-danger" id="btnUnassignCur">배치 해제</button>
      </div>`;
    }

    html += `<div style="display:flex;flex-direction:column;gap:6px;">`;
    offs.forEach(o => {
      const curTask = getOfficerAssignment(city, o.id);
      const isHere = curTask === taskKey;
      const statusTxt = isHere ? '현재 담당 중' : curTask ? `${TASK_META[curTask].name} 담당 중` : '쉬는 중';
      html += `<div class="panel-card" style="display:flex;align-items:center;gap:10px;padding:7px 9px;">
        <div class="off-ava" style="width:36px;height:36px;">${makePortraitSVG(o)}</div>
        <div style="flex:1;">
          <div style="font-weight:700;color:var(--gold-bright);">${o.name} <span style="font-size:10.5px;color:var(--text-sub);font-weight:400;">(${o.trait})</span></div>
          <div style="font-size:11px;color:var(--text-sub);">통솔 ${o.ldr} · 무력 ${o.war} · 지력 ${o.int} · 정치 <b style="color:var(--text-main);">${o.pol}</b> · 매력 <b style="color:var(--text-main);">${o.chr}</b></div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:10px;color:${curTask ? 'var(--green)' : 'var(--text-dim)'};margin-bottom:3px;">${statusTxt}</div>
          <button class="btn-sm pick-off-btn" data-oid="${o.id}">${isHere ? '유지' : '배치'}</button>
        </div>
      </div>`;
    });
    html += `</div>`;

    openModal(`${city.name} — ${meta.name} 담당 장수 선택`, html);

    const unBtn = $('btnUnassignCur');
    if (unBtn) {
      unBtn.addEventListener('click', () => {
        city.assignments[taskKey] = null;
        playSfx('click');
        closeModal();
        renderAll();
      });
    }

    document.querySelectorAll('.pick-off-btn').forEach(b => {
      b.addEventListener('click', () => {
        const oid = b.dataset.oid;
        // remove from any previous task in this city
        for (const k of Object.keys(city.assignments)) {
          if (city.assignments[k] === oid) city.assignments[k] = null;
        }
        city.assignments[taskKey] = oid;
        playSfx('assign');
        showToast(`${getOfficer(oid).name}에게 ${meta.name}을(를) 맡겼습니다.`);
        closeModal();
        renderAll();
      });
    });
  }

  function autoAssignAll() {
    const city = getCurrentCity();
    if (!city) return;
    const idle = getIdleOfficers(city);
    if (idle.length === 0) {
      showToast('배치할 수 있는 쉬는 장수가 없습니다.');
      return;
    }
    const order = ['agri', 'comm', 'order', 'train', 'recruit'];
    let count = 0;
    const pool = [...idle];
    order.forEach(taskKey => {
      if (city.assignments[taskKey]) return;
      if (pool.length === 0) return;
      const stat = TASK_META[taskKey].stat;
      pool.sort((a, b) => b[stat] - a[stat]);
      const chosen = pool.shift();
      city.assignments[taskKey] = chosen.id;
      count++;
    });
    if (count > 0) {
      playSfx('assign');
      showToast(`${count}명의 장수를 최적 내정에 자동 배치했습니다.`);
      renderAll();
    } else {
      showToast('모든 내정 부서에 이미 장수가 배치되어 있습니다.');
    }
  }

  /* ================= MERCHANT & SALARY ================= */
  function openMerchantModal() {
    const city = getCurrentCity();
    if (!city) return;
    playSfx('click');
    const rate = state.foodRate;
    const html = `
      <div style="display:flex;align-items:center;gap:10px;background:#0e172c;border:1px solid var(--border-dim);border-radius:6px;padding:8px 10px;margin-bottom:10px;">
        <div class="off-ava" style="width:48px;height:48px;"><img src="${NPC_ARCHETYPES.merchant}" alt="상인" style="width:100%;height:100%;object-fit:cover;display:block;"></div>
        <div style="font-size:12px;color:var(--text-sub);line-height:1.45;">
          <b style="color:var(--gold-bright);">성내 대상인</b>: "어서 오시오, 태수님! 오늘 시세는 <b style="color:var(--green);">금 1 = 군량 ${rate}</b>이오."
        </div>
      </div>
      <div class="info-grid" style="margin-bottom:12px;">
        <div class="info-cell"><div class="info-cell-lbl">보유 금</div><div class="info-cell-val" id="mGold">${city.gold.toLocaleString()}</div></div>
        <div class="info-cell"><div class="info-cell-lbl">보유 군량</div><div class="info-cell-val" id="mFood">${city.food.toLocaleString()}</div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div class="panel-card" style="display:flex;justify-content:space-between;align-items:center;">
          <div><b>군량 구매</b><div style="font-size:11px;color:var(--text-sub);">금 500 → 군량 ${(500 * rate).toLocaleString()}</div></div>
          <button class="btn-sm btn-success" id="btnBuyFood">구매</button>
        </div>
        <div class="panel-card" style="display:flex;justify-content:space-between;align-items:center;">
          <div><b>군량 대량 구매</b><div style="font-size:11px;color:var(--text-sub);">금 2,000 → 군량 ${(2000 * rate).toLocaleString()}</div></div>
          <button class="btn-sm btn-success" id="btnBuyFoodBig">구매</button>
        </div>
        <div class="panel-card" style="display:flex;justify-content:space-between;align-items:center;">
          <div><b>군량 매각</b><div style="font-size:11px;color:var(--text-sub);">군량 ${(500 * rate).toLocaleString()} → 금 500</div></div>
          <button class="btn-sm" id="btnSellFood">매각</button>
        </div>
      </div>
    `;
    openModal(`${city.name} 상인 거래`, html);

    const refresh = () => {
      const mg = $('mGold'), mf = $('mFood');
      if (mg) mg.textContent = city.gold.toLocaleString();
      if (mf) mf.textContent = city.food.toLocaleString();
      renderAll();
    };

    $('btnBuyFood').addEventListener('click', () => {
      if (city.gold < 500) return showToast('금이 부족합니다.');
      city.gold -= 500; city.food += 500 * rate;
      playSfx('assign'); showToast(`군량 ${(500 * rate).toLocaleString()} 구매 완료!`);
      refresh();
    });
    $('btnBuyFoodBig').addEventListener('click', () => {
      if (city.gold < 2000) return showToast('금이 부족합니다.');
      city.gold -= 2000; city.food += 2000 * rate;
      playSfx('assign'); showToast(`군량 ${(2000 * rate).toLocaleString()} 구매 완료!`);
      refresh();
    });
    $('btnSellFood').addEventListener('click', () => {
      const need = 500 * rate;
      if (city.food < need) return showToast('군량이 부족합니다.');
      city.food -= need; city.gold += 500;
      playSfx('assign'); showToast(`군량 매각으로 금 500 확보!`);
      refresh();
    });
  }

  function cycleSalary() {
    const city = getCurrentCity();
    if (!city) return;
    city.salary = (city.salary + 1) % 3;
    const labels = ['절약 (충성 소폭 하락)', '보통 (충성 유지)', '후함 (매달 충성 상승)'];
    playSfx('click');
    showToast(`${city.name} 급여 수준: ${labels[city.salary]}`);
    renderAll();
  }

  /* ================= OFFICER DETAIL MODAL ================= */
  function openOfficerModal(offId) {
    const o = getOfficer(offId);
    if (!o) return;
    playSfx('click');
    const city = getCity(o.city);
    const task = city && city.faction === state.playerFaction ? getOfficerAssignment(city, o.id) : null;
    const html = `
      <div style="display:flex;gap:14px;align-items:center;margin-bottom:12px;">
        <div class="off-ava" style="width:68px;height:68px;">${makePortraitSVG(o)}</div>
        <div>
          <div style="font-size:17px;font-weight:800;color:var(--gold-bright);">${o.name} <span style="font-size:12px;color:var(--green);">Lv.${o.lv || 1}</span> <span style="font-size:10.5px;color:var(--text-dim);">(공적 ${o.exp || 0}/100)</span></div>
          <div style="font-size:12px;color:var(--text-sub);margin-top:2px;">특기: <b style="color:var(--cyan);">${o.trait}</b> · 전법: <b style="color:var(--amber);">${o.skill}</b></div>
          <div style="font-size:12px;color:var(--text-sub);margin-top:2px;">소속: ${o.faction ? state.factions[o.faction].name : '재야'} · 소재: ${city ? city.name : '-'} · 충성: <b style="color:var(--green);">${o.loy}</b></div>
        </div>
      </div>
      <div class="info-grid" style="grid-template-columns:repeat(5,1fr);text-align:center;">
        <div class="info-cell"><div class="info-cell-lbl">통솔</div><div class="info-cell-val">${o.ldr}</div></div>
        <div class="info-cell"><div class="info-cell-lbl">무력</div><div class="info-cell-val">${o.war}</div></div>
        <div class="info-cell"><div class="info-cell-lbl">지력</div><div class="info-cell-val">${o.int}</div></div>
        <div class="info-cell"><div class="info-cell-lbl">정치</div><div class="info-cell-val">${o.pol}</div></div>
        <div class="info-cell"><div class="info-cell-lbl">매력</div><div class="info-cell-val">${o.chr}</div></div>
      </div>
      ${o.faction === state.playerFaction ? `<div style="margin-top:10px;font-size:12px;color:var(--text-sub);">현재 임무: <b style="color:var(--green);">${task ? TASK_META[task].name : '쉬는 중'}</b></div>` : ''}
      ${o.faction === state.playerFaction ? (() => {
        const ownedRelics = (state.relics || []).filter(r => r.owned);
        if (ownedRelics.length === 0) return '';
        return `<div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border-dim);">
          <div style="font-size:11.5px;color:var(--gold);margin-bottom:5px;">🎁 보물 장착 (클릭하여 장착/해제)</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${ownedRelics.map(r => {
              const eqHere = r.owner === o.id;
              return `<button class="btn-sm ${eqHere ? 'btn-success' : ''} act-equip-relic" data-rid="${r.id}">${r.icon} ${r.name} (+${r.bonus} ${r.stat.toUpperCase()}) ${eqHere ? '✓' : ''}</button>`;
            }).join('')}
          </div>
        </div>`;
      })() : ''}
    `;
    const btns = [];
    if (o.faction === state.playerFaction && o.loy < 100) {
      btns.push({
        label: '포상하기 (금 300, 충성+12)',
        cls: 'btn-sm btn-success',
        onClick: () => {
          const c = getCity(o.city);
          if (c.gold < 300) return showToast('금이 부족합니다.');
          c.gold -= 300;
          o.loy = Math.min(100, o.loy + 12);
          playSfx('assign');
          addLog('per', `[인재] ${o.name}에게 포상하여 충성도가 ${o.loy}(으)로 올랐습니다.`);
          showToast(`${o.name} 충성도 +12!`);
          closeModal(); renderAll();
        }
      });
    }
    btns.push({ label: '닫기', cls: 'btn-gold', onClick: closeModal });
    openModal(`장수 정보 — ${o.name}`, html, btns);
    document.querySelectorAll('.act-equip-relic').forEach(b => {
      b.addEventListener('click', () => {
        const r = (state.relics || []).find(x => x.id === b.dataset.rid);
        if (!r) return;
        if (r.owner === o.id) {
          o[r.stat] = Math.max(1, o[r.stat] - r.bonus);
          r.owner = null;
          showToast(`${r.name} 장착 해제`);
        } else {
          if (r.owner) {
            const prev = getOfficer(r.owner);
            if (prev) prev[r.stat] = Math.max(1, prev[r.stat] - r.bonus);
          }
          r.owner = o.id;
          o[r.stat] = Math.min(105, o[r.stat] + r.bonus);
          playSfx('assign');
          showToast(`${o.name}에게 ${r.name} 장착! (${r.stat.toUpperCase()} +${r.bonus})`);
        }
        closeModal(); renderAll(); openOfficerModal(o.id);
      });
    });
  }

  /* ================= INTERACTIVE ANIMATED 3D TACTICAL BATTLE ================= */
  let activeBattle = null;

  function startBattle(attCityId, defCityId, attOfficerIds, attTroops, attFood, isPlayerAttacking, attUnit = "infantry") {
    const attCity = getCity(attCityId);
    const defCity = getCity(defCityId);
    const defOffs = getCityOfficers(defCityId).sort((a, b) => (b.ldr + b.war) - (a.ldr + a.war)).slice(0, 3);
    const attOffs = attOfficerIds.map(id => getOfficer(id)).filter(Boolean);

    const attLead = attOffs[0] || { id: 'warrior', name: '장수', ldr: 70, war: 70, int: 65, skill: '돌격' };
    const defLead = defOffs[0] || { id: 'warrior', name: '수비대장', ldr: 65, war: 65, int: 60, skill: '수성' };

    activeBattle = {
      attCityId, defCityId,
      attFaction: attCity.faction,
      defFaction: defCity.faction,
      attOffs, defOffs,
      attLead, defLead,
      attTroops, attMax: attTroops,
      defTroops: defCity.troops, defMax: Math.max(1, defCity.troops),
      attMorale: Math.min(100, 68 + Math.round(attCity.train * 0.32)),
      defMorale: Math.min(100, 70 + Math.round(defCity.train * 0.3)),
      attFood,
      isPlayerAttacking,
      round: 1,
      busy: false,
      skillUsed: false,
      duelUsed: false,
      shake: 0,
      chargeOffset: 0,
      chargeDir: 0,
      particles: [],
      arrows: [],
      floatTexts: [],
      attUnit,
      defUnit: ['infantry', 'cavalry', 'archer'][Math.floor(Math.random() * 3)],
      log: [`⚔️ ${attCity.name}의 ${attLead.name}군(${attTroops.toLocaleString()}명)이 ${defCity.name}(${defCity.troops.toLocaleString()}명) 성문 앞에 포진했습니다!`],
      ended: false
    };

    playSfx('drum');
    renderBattleModal(true);
  }

  function spawnBattleVfx(type, targetSide) {
    const b = activeBattle;
    if (!b) return;
    const tx = targetSide === 'right' ? 0.72 : 0.28;
    const sx = targetSide === 'right' ? 0.26 : 0.74;

    if (type === 'charge' || type === 'duel') {
      b.chargeDir = targetSide === 'right' ? 1 : -1;
      b.chargeOffset = 1.0;
      b.shake = type === 'duel' ? 14 : 10;
      for (let i = 0; i < 36; i++) {
        b.particles.push({
          x: (type === 'duel' ? 0.50 : tx) + (Math.random() - 0.5) * 0.16,
          y: 0.56 + (Math.random() - 0.5) * 0.24,
          vx: (Math.random() - 0.5) * 0.014,
          vy: -0.004 - Math.random() * 0.012,
          life: 1.0,
          size: 3 + Math.random() * 4,
          color: i % 2 === 0 ? '#fde047' : '#f97316'
        });
      }
    } else if (type === 'fire') {
      b.shake = 13;
      for (let i = 0; i < 65; i++) {
        b.particles.push({
          x: tx + (Math.random() - 0.5) * 0.28,
          y: 0.45 + Math.random() * 0.34,
          vx: (Math.random() - 0.5) * 0.005,
          vy: -0.008 - Math.random() * 0.014,
          life: 1.2 + Math.random() * 0.5,
          size: 5 + Math.random() * 9,
          color: i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#f97316' : '#facc15'
        });
      }
    } else if (type === 'volley') {
      b.shake = 6;
      for (let i = 0; i < 28; i++) {
        b.arrows.push({
          t: -Math.random() * 0.35,
          sx: sx + (Math.random() - 0.5) * 0.12,
          sy: 0.56 + (Math.random() - 0.5) * 0.20,
          tx: tx + (Math.random() - 0.5) * 0.22,
          ty: 0.56 + (Math.random() - 0.5) * 0.24
        });
      }
    } else if (type === 'skill') {
      b.shake = 18;
      b.chargeDir = targetSide === 'right' ? 1 : -1;
      b.chargeOffset = 1.2;
      for (let i = 0; i < 75; i++) {
        const ang = (Math.PI * 2 * i) / 75;
        b.particles.push({
          x: tx,
          y: 0.56,
          vx: Math.cos(ang) * (0.008 + Math.random() * 0.012),
          vy: Math.sin(ang) * (0.008 + Math.random() * 0.012),
          life: 1.3,
          size: 4 + Math.random() * 6,
          color: i % 2 === 0 ? '#ffd97d' : '#38bdf8'
        });
      }
    }
  }

  function addBattleFloatText(text, side, color) {
    if (!activeBattle) return;
    activeBattle.floatTexts.push({
      text,
      x: side === 'right' ? 0.72 : side === 'left' ? 0.28 : 0.50,
      y: 0.38,
      life: 1.3,
      color: color || '#ff5555'
    });
  }

  function showBattleCutIn(officer, labelText) {
    const el = $('battleCutIn');
    if (!el) return;
    el.innerHTML = `
      <div class="cutin-ava">${makePortraitSVG(officer)}</div>
      <div class="cutin-text">
        <div class="cutin-name">${officer.name} (${officer.trait || '맹장'})</div>
        <div class="cutin-skill">【${labelText}】</div>
      </div>
    `;
    el.classList.add('show');
    setTimeout(() => {
      const c = $('battleCutIn');
      if (c) c.classList.remove('show');
    }, 950);
  }

  function drawBattleCanvas() {
    const b = activeBattle;
    const canvas = $('battleCanvas');
    if (!b || !canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w <= 0 || h <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.save();
    if (b.shake > 0.2) {
      const sx = (Math.random() - 0.5) * b.shake;
      const sy = (Math.random() - 0.5) * b.shake;
      ctx.translate(sx, sy);
      b.shake *= 0.86;
    }

    // Regional 3D Battlefield Background (Plains / Yangtze River / Sichuan Mountain Pass)
    const bTheme = BATTLE_THEME_MAP[b.defCityId] || 'plains';
    const bImg = battleThemeImgs[bTheme];
    if (bImg && bImg.complete && bImg.naturalWidth > 0) {
      const ir = bImg.naturalWidth / bImg.naturalHeight;
      const br = w / h;
      let dw = w, dh = h, dx = 0, dy = 0;
      if (br > ir) { dh = w / ir; dy = (h - dh) * 0.5; }
      else { dw = h * ir; dx = (w - dw) * 0.5; }
      ctx.drawImage(bImg, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = '#1a1510';
      ctx.fillRect(0, 0, w, h);
    }

    // Subtle dark gradient for readability
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(9,14,26,0.22)');
    grad.addColorStop(1, 'rgba(9,14,26,0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Decay charge surge
    if (b.chargeOffset > 0.01) b.chargeOffset *= 0.90;
    else b.chargeOffset = 0;

    const attFac = state.factions[b.attFaction];
    const defFac = state.factions[b.defFaction];

    // Draw Left Army (Attacker) — soldier count reflects remaining troops
    const attCount = Math.max(0, Math.min(20, Math.ceil((b.attTroops / b.attMax) * 20)));
    const attPush = b.chargeDir > 0 ? b.chargeOffset * w * 0.16 : 0;
    for (let i = 0; i < attCount; i++) {
      const col = Math.floor(i / 5);
      const row = i % 5;
      const bob = Math.abs(Math.sin(animTick * 0.18 + i)) * 3;
      const ux = w * (0.14 + col * 0.048) + attPush;
      const uy = h * (0.43 + row * 0.095) - bob;
      drawBattleSoldier(ctx, ux, uy, attFac.color, 1, i === 0, b.attUnit || 'infantry');
    }

    // Draw Right Army (Defender)
    const defCount = Math.max(0, Math.min(20, Math.ceil((b.defTroops / b.defMax) * 20)));
    const defPush = b.chargeDir < 0 ? -b.chargeOffset * w * 0.16 : 0;
    for (let i = 0; i < defCount; i++) {
      const col = Math.floor(i / 5);
      const row = i % 5;
      const bob = Math.abs(Math.sin(animTick * 0.18 + i + 2)) * 3;
      const ux = w * (0.86 - col * 0.048) + defPush;
      const uy = h * (0.43 + row * 0.095) - bob;
      drawBattleSoldier(ctx, ux, uy, defFac.color, -1, i === 0, b.defUnit || 'infantry');
    }

    // Draw Arrows (Volley)
    b.arrows = b.arrows.filter(a => {
      a.t += 0.045;
      if (a.t < 0) return true;
      if (a.t > 1) return false;
      const ax = (a.sx + (a.tx - a.sx) * a.t) * w;
      const arc = Math.sin(a.t * Math.PI) * h * 0.38;
      const ay = (a.sy + (a.ty - a.sy) * a.t) * h - arc;
      const dir = a.tx > a.sx ? 1 : -1;
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ax - dir * 10, ay + (a.t - 0.5) * 6);
      ctx.lineTo(ax + dir * 4, ay - (a.t - 0.5) * 6);
      ctx.stroke();
      return true;
    });

    // Draw Particles (Fire / Sparks / Skill Shockwave)
    b.particles = b.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.032;
      if (p.life <= 0) return false;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.size * Math.min(1, p.life + 0.3), 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
    ctx.globalAlpha = 1;

    // Draw Floating Damage / Status Numbers
    b.floatTexts = b.floatTexts.filter(ft => {
      ft.y -= 0.006;
      ft.life -= 0.022;
      if (ft.life <= 0) return false;
      ctx.globalAlpha = Math.max(0, Math.min(1, ft.life));
      ctx.font = '900 18px "Malgun Gothic", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#090e1a';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x * w, ft.y * h);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x * w, ft.y * h);
      return true;
    });
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawBattleSoldier(ctx, x, y, color, dir, hasBanner, unitType = 'infantry') {
    // Faction ground ring & shadow
    const ringW = unitType === 'cavalry' ? 14 : 10;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 8, ringW, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y + 8, ringW, 4.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Exact 3D unit sprite (infantry / cavalry / archer) facing the enemy!
    const sp = npcSprites[unitType] || npcSprites.soldier;
    if (sp && sp.complete && sp.naturalWidth > 0) {
      const sh = unitType === 'cavalry' ? 42 : 36;
      const sw = sh * (sp.naturalWidth / sp.naturalHeight);
      const defDir = NPC_SPRITE_DEFAULT_DIR[unitType] || -1;
      const flip = dir === defDir ? 1 : -1;
      ctx.save();
      ctx.translate(x, y + 9);
      ctx.scale(flip, 1);
      ctx.drawImage(sp, -sw / 2, -sh, sw, sh);
      ctx.restore();
    }
    // Faction Banner on lead unit
    if (hasBanner) {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - dir * 5, y + 6); ctx.lineTo(x - dir * 5, y - 26); ctx.stroke();
      const wave = Math.sin(animTick * 0.16) * 2.5;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x - dir * 5, y - 26);
      ctx.lineTo(x - dir * 21, y - 22 + wave);
      ctx.lineTo(x - dir * 5, y - 14);
      ctx.closePath();
      ctx.fill();
    }
  }

  function renderBattleModal(initial = false) {
    const b = activeBattle;
    if (!b) return;
    const attFac = state.factions[b.attFaction];
    const defFac = state.factions[b.defFaction];
    const attPct = Math.max(0, Math.round((b.attTroops / b.attMax) * 100));
    const defPct = Math.max(0, Math.round((b.defTroops / b.defMax) * 100));
    const playerLead = b.isPlayerAttacking ? b.attLead : b.defLead;

    if (initial || !$('battleCanvas')) {
      const html = `
        <div class="battle-stage-wrap">
          <canvas id="battleCanvas"></canvas>
          <div class="battle-cutin" id="battleCutIn"></div>
        </div>
        <div class="battle-hud-strip" id="battleHudStrip"></div>
        <div class="battle-log" id="bLogBox"></div>
        <div id="battleControls"></div>
      `;
      openModal(`⚔️ ${getCity(b.defCityId).name} 공방전`, html, []);
      const mb = document.querySelector('.modal-box');
      if (mb) mb.classList.add('battle-mode');
    }

    // Update HUD strip without recreating canvas (preserves live 60fps particles!)
    $('battleHudStrip').innerHTML = `
      <div class="battle-side" style="display:flex;align-items:center;gap:8px;text-align:left;">
        <div class="off-ava" style="width:46px;height:46px;">${makePortraitSVG(b.attLead)}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:800;font-size:12px;color:${attFac.color};">${attFac.name} · ${b.attLead.name}</div>
          <div class="battle-bar-wrap" style="margin:3px 0;"><div class="battle-bar-fill" style="width:${attPct}%;background:${attFac.color};"></div></div>
          <div style="font-size:11.5px;font-weight:800;">${b.attTroops.toLocaleString()}명 <span style="font-weight:400;color:var(--text-sub);">사기 ${b.attMorale}</span></div>
        </div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:10px;color:var(--gold);">제 ${b.round} 합</div>
        <div class="battle-vs" style="font-size:15px;">VS</div>
      </div>
      <div class="battle-side" style="display:flex;align-items:center;gap:8px;text-align:right;flex-direction:row-reverse;">
        <div class="off-ava" style="width:46px;height:46px;">${makePortraitSVG(b.defLead)}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:800;font-size:12px;color:${defFac.color};">${defFac.name} · ${b.defLead.name}</div>
          <div class="battle-bar-wrap" style="margin:3px 0;"><div class="battle-bar-fill" style="width:${defPct}%;background:${defFac.color};"></div></div>
          <div style="font-size:11.5px;font-weight:800;">${b.defTroops.toLocaleString()}명 <span style="font-weight:400;color:var(--text-sub);">사기 ${b.defMorale}</span></div>
        </div>
      </div>
    `;

    const logEl = $('bLogBox');
    logEl.innerHTML = b.log.map(l => `<div>${l}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;

    const ctrl = $('battleControls');
    if (b.ended) {
      ctrl.innerHTML = `<div style="text-align:center;font-weight:800;color:var(--gold-bright);padding:4px;">전투가 종료되었습니다!</div>`;
      const f = $('modalFooter');
      f.innerHTML = '';
      const doneBtn = document.createElement('button');
      doneBtn.className = 'btn-gold';
      doneBtn.textContent = '전투 결과 확인';
      doneBtn.addEventListener('click', () => { closeModal(); activeBattle = null; renderAll(); });
      f.appendChild(doneBtn);
    } else {
      ctrl.innerHTML = `
        <div class="tactic-grid" style="grid-template-columns:repeat(3,1fr);">
          <button class="btn-sm" id="tacCharge" ${b.busy ? 'disabled' : ''}>🐎 맹돌격</button>
          <button class="btn-sm" id="tacVolley" ${b.busy ? 'disabled' : ''}>🏹 일제사격</button>
          <button class="btn-sm" id="tacFire" ${b.busy ? 'disabled' : ''}>🔥 화계</button>
          <button class="btn-sm btn-success" id="tacDuel" ${b.busy || b.duelUsed ? 'disabled' : ''}>⚔️ 일기토 ${b.duelUsed ? '(완료)' : ''}</button>
          <button class="btn-gold" id="tacSkill" ${b.busy || b.skillUsed ? 'disabled' : ''}>✨ ${playerLead.skill}</button>
          <button class="btn-sm btn-danger" id="tacRetreat" ${b.busy ? 'disabled' : ''}>🏳️ 철수</button>
        </div>
      `;
      $('tacCharge').addEventListener('click', () => executeBattleRound('charge'));
      $('tacVolley').addEventListener('click', () => executeBattleRound('volley'));
      $('tacFire').addEventListener('click', () => executeBattleRound('fire'));
      $('tacDuel').addEventListener('click', () => executeBattleRound('duel'));
      $('tacSkill').addEventListener('click', () => executeBattleRound('skill'));
      $('tacRetreat').addEventListener('click', () => executeBattleRound('retreat'));
    }
  }

  function executeBattleRound(tactic) {
    const b = activeBattle;
    if (!b || b.ended || b.busy) return;

    if (tactic === 'retreat') {
      if (b.isPlayerAttacking) {
        const home = getCity(b.attCityId);
        const survived = Math.round(b.attTroops * 0.85);
        home.troops += survived;
        home.food += Math.round(b.attFood * 0.5);
        getCity(b.defCityId).troops = b.defTroops;
        b.log.push(`🏳️ 아군이 철수했습니다. 생존 병력 ${survived.toLocaleString()}명이 ${home.name}(으)로 귀환했습니다.`);
        addLog('mil', `[군사] ${getCity(b.defCityId).name} 공격에서 철수했습니다.`);
      } else {
        b.defTroops = 0;
        finishBattle(true);
        return;
      }
      b.ended = true;
      saveState(true);
      renderBattleModal();
      return;
    }

    b.busy = true;
    renderBattleModal();

    const pLead = b.isPlayerAttacking ? b.attLead : b.defLead;
    const eLead = b.isPlayerAttacking ? b.defLead : b.attLead;
    const targetSide = b.isPlayerAttacking ? 'right' : 'left';
    const playerSide = b.isPlayerAttacking ? 'left' : 'right';

    if (tactic === 'charge') {
      playSfx('clash');
      spawnBattleVfx('charge', targetSide);
    } else if (tactic === 'volley') {
      playSfx('volley');
      spawnBattleVfx('volley', targetSide);
    } else if (tactic === 'fire') {
      playSfx('fire');
      spawnBattleVfx('fire', targetSide);
    } else if (tactic === 'duel') {
      b.duelUsed = true;
      playSfx('clash');
      showBattleCutIn(pLead, `일기토! ${pLead.name} VS ${eLead.name}`);
      spawnBattleVfx('duel', targetSide);
    } else if (tactic === 'skill') {
      b.skillUsed = true;
      playSfx('skill');
      showBattleCutIn(pLead, pLead.skill);
      spawnBattleVfx('skill', targetSide);
    }

    setTimeout(() => {
      if (!activeBattle || activeBattle.ended) return;
      const pTroops = b.isPlayerAttacking ? b.attTroops : b.defTroops;
      const eTroops = b.isPlayerAttacking ? b.defTroops : b.attTroops;

      let pMult = 1.0, eMult = 1.0, moraleHit = 7;
      if (tactic === 'charge') {
        pMult = 1.18 + (pLead.war - eLead.ldr) * 0.008;
        eMult = 1.08;
        b.log.push(`🐎 ${pLead.name}의 기병대가 적진으로 맹돌격했습니다!`);
      } else if (tactic === 'volley') {
        pMult = 1.05 + (pLead.ldr * 0.004);
        eMult = 0.62;
        moraleHit = 9;
        b.log.push(`🏹 하늘을 뒤덮는 일제사격! 아군 피해를 최소화하며 적진을 압박했습니다.`);
      } else if (tactic === 'fire') {
        const success = (pLead.int + Math.random() * 28 + (state.techs && state.techs.firebook ? 5 : 0) + (state.techs && state.techs.firebook2 ? 5 : 0)) > (eLead.int + 10);
        if (success) {
          pMult = 1.42; eMult = 0.70; moraleHit = 18;
          b.log.push(`🔥 ${pLead.name}의 화계 대성공! 화염이 적 진영을 집어삼켰습니다!`);
          addBattleFloatText('🔥 화계 대성공!', targetSide, '#fb923c');
        } else {
          pMult = 0.78; eMult = 1.02;
          b.log.push(`💨 바람 방향이 바뀌어 화계가 일부만 적중했습니다.`);
        }
      } else if (tactic === 'duel') {
        const winDuel = (pLead.war + Math.random() * 18) >= (eLead.war + Math.random() * 14);
        if (winDuel) {
          state.stats = state.stats || { battlesWon: 0, citiesCaptured: 0, officersRecruited: 0, duelsWon: 0 };
          state.stats.duelsWon = (state.stats.duelsWon || 0) + 1;
          pMult = 1.55; eMult = 0.45; moraleHit = 30;
          b.log.push(`⚔️ 일기토 승리! ${pLead.name}이(가) ${eLead.name}을(를) 제압해 적 사기가 크게 꺾였습니다!`);
          addBattleFloatText('⚔️ 일기토 승리!', 'center', '#fde047');
        } else {
          pMult = 0.75; eMult = 1.18; moraleHit = 4;
          b.log.push(`⚔️ 치열한 일기토 끝에 ${eLead.name}의 반격을 허용했습니다!`);
          addBattleFloatText('일기토 고전!', 'center', '#f87171');
        }
      } else if (tactic === 'skill') {
        pMult = 1.65 + (pLead.ldr + pLead.war) * 0.0025;
        eMult = 0.65; moraleHit = 22;
        b.log.push(`✨ ${pLead.name} 필살 전법 【${pLead.skill}】 작렬! 전장이 뒤흔들립니다!`);
      }

      const beats = { cavalry: 'archer', archer: 'infantry', infantry: 'cavalry' };
      const pUnit = b.isPlayerAttacking ? b.attUnit : b.defUnit;
      const eUnit = b.isPlayerAttacking ? b.defUnit : b.attUnit;
      const unitMod = beats[pUnit] === eUnit ? 1.18 : beats[eUnit] === pUnit ? 0.86 : 1.0;
      const winterDefMod = (!b.isPlayerAttacking && (state.month === 12 || state.month <= 2)) ? 0.85 : 1.0;
      let techMult = 1.0;
      if (state.techs) {
        if (state.techs.cavalry && (tactic === 'charge' || pUnit === 'cavalry')) techMult *= 1.2 + (state.techs.cavalry2 ? 0.1 : 0);
        if (state.techs.crossbow && (tactic === 'volley' || pUnit === 'archer')) techMult *= 1.2 + (state.techs.crossbow2 ? 0.1 : 0);
        if (state.techs.firebook && tactic === 'fire') techMult *= 1.25 + (state.techs.firebook2 ? 0.1 : 0);
      }
      pMult *= techMult;
      const dmgToEnemy = Math.max(220, Math.round((pTroops * 0.21 + pLead.war * 6.5) * pMult * unitMod * (0.9 + Math.random() * 0.24)));
      const dmgToPlayer = Math.max(110, Math.round((eTroops * 0.15 + eLead.war * 4.8) * eMult * winterDefMod * (0.9 + Math.random() * 0.24)));

      if (b.isPlayerAttacking) {
        b.defTroops = Math.max(0, b.defTroops - dmgToEnemy);
        b.attTroops = Math.max(0, b.attTroops - dmgToPlayer);
        b.defMorale = Math.max(0, b.defMorale - moraleHit);
        b.attMorale = Math.max(0, b.attMorale - 5);
      } else {
        b.attTroops = Math.max(0, b.attTroops - dmgToEnemy);
        b.defTroops = Math.max(0, b.defTroops - dmgToPlayer);
        b.attMorale = Math.max(0, b.attMorale - moraleHit);
        b.defMorale = Math.max(0, b.defMorale - 5);
      }

      addBattleFloatText(`-${dmgToEnemy.toLocaleString()}`, targetSide, '#ff5555');
      setTimeout(() => addBattleFloatText(`-${dmgToPlayer.toLocaleString()}`, playerSide, '#fbbf24'), 160);

      b.log.push(`💥 교전 결과: 적 피해 ${dmgToEnemy.toLocaleString()}명 / 아군 피해 ${dmgToPlayer.toLocaleString()}명`);
      b.round++;
      b.busy = false;

      if (b.defTroops <= 0 || b.defMorale <= 0) {
        finishBattle(true);
      } else if (b.attTroops <= 0 || b.attMorale <= 0) {
        finishBattle(false);
      } else {
        renderBattleModal();
      }
    }, 520);
  }

  function finishBattle(attackerWon) {
    const b = activeBattle;
    b.ended = true;
    b.busy = false;
    const defCity = getCity(b.defCityId);
    const attCity = getCity(b.attCityId);

    if (attackerWon) {
      playSfx('fanfare');
      const oldFaction = defCity.faction;
      defCity.faction = b.attFaction;
      defCity.troops = Math.max(400, b.attTroops);
      defCity.order = Math.max(35, defCity.order - 22);
      defCity.assignments = { agri: null, comm: null, order: null, train: null, recruit: null };

      b.attOffs.forEach(o => {
        if (attCity.assignments) {
          for (const k of Object.keys(attCity.assignments)) {
            if (attCity.assignments[k] === o.id) attCity.assignments[k] = null;
          }
        }
        o.city = defCity.id;
      });

      const otherCities = state.cities.filter(c => c.faction === oldFaction && c.id !== defCity.id);
      b.defOffs.forEach(o => {
        if (otherCities.length > 0 && Math.random() < 0.7) {
          o.city = otherCities[0].id;
        } else {
          o.faction = null;
          o.city = defCity.id;
          o.loy = 75;
        }
      });

      addBattleFloatText(`🏆 ${defCity.name} 함락!`, 'center', '#4ade80');
      b.log.push(`🏆 ${state.factions[b.attFaction].name}이(가) ${defCity.name}을(를) 점령했습니다!`);
      addLog('mil', `[군사] ${state.factions[b.attFaction].name}이(가) ${defCity.name}을(를) 함락했습니다!`);
      if (b.attFaction === state.playerFaction) {
        state.selectedCityId = defCity.id;
        state.stats = state.stats || { battlesWon: 0, citiesCaptured: 0, officersRecruited: 0 };
        state.stats.battlesWon++;
        state.stats.citiesCaptured++;
        b.attOffs.forEach(o => grantOfficerExp(o, 45, 'war'));
        const unownedRelic = (state.relics || []).find(r => !r.owned && r.id !== 'yuxi');
        if (unownedRelic && Math.random() < 0.45) unlockRelic(unownedRelic.id);
        checkQuestsAndAchievements();
      }
      checkVictoryDefeat();
    } else {
      defCity.troops = Math.max(200, b.defTroops);
      addBattleFloatText('🛡️ 수성 성공!', 'center', '#38bdf8');
      b.log.push(`🛡️ ${defCity.name} 수비군이 공격을 격퇴했습니다!`);
      addLog('mil', `[군사] ${defCity.name} 공방전에서 수비군이 승리했습니다.`);
    }

    renderBattleModal();
    saveState(true);
  }

  function checkVictoryDefeat() {
    const playerCities = getPlayerCities();
    if (playerCities.length === state.cities.length) {
      state.gameOver = 'victory';
      unlockAchievement('unify');
      const rank = state.turn <= 25 ? 'S (전설의 패왕)' : state.turn <= 45 ? 'A (명군)' : 'B (난세의 영웅)';
      const st = state.stats || { battlesWon: 0, citiesCaptured: 0, officersRecruited: 0, duelsWon: 0 };
      const fName = state.factions[state.playerFaction].name;
      openModal('👑 천하통일 달성!', `
        <div style="text-align:center;margin-bottom:12px;">
          <div style="font-size:26px;font-weight:900;color:var(--gold-bright);">최종 평가: ${rank}</div>
          <div style="font-size:13px;color:#dbe7fa;margin-top:4px;">${state.year}년 ${state.month}월, <b>${fName}</b>이(가) 중원 ${state.cities.length}개 성을 모두 통일했습니다!</div>
        </div>
        <div class="info-grid">
          <div class="info-cell"><div class="info-cell-lbl">소요 턴</div><div class="info-cell-val">${state.turn}턴</div></div>
          <div class="info-cell"><div class="info-cell-lbl">전투 승리</div><div class="info-cell-val">${st.battlesWon}회</div></div>
          <div class="info-cell"><div class="info-cell-lbl">일기토 승리</div><div class="info-cell-val">${st.duelsWon || 0}회</div></div>
          <div class="info-cell"><div class="info-cell-lbl">달성 업적</div><div class="info-cell-val">${Object.keys(state.achievements || {}).length}/${ACHIEVEMENT_LIST.length}</div></div>
        </div>
      `, [{ label: '타이틀 화면으로', cls: 'btn-gold', onClick: () => { closeModal(); openTitleScreen(); } }]);
    } else if (playerCities.length === 0) {
      state.gameOver = 'defeat';
      openModal('💔 세력 멸망', `
        <p style="font-size:13.5px;line-height:1.6;color:var(--red);">
          모든 거점을 잃어 유비군이 멸망했습니다. 다시 도전해 천하통일을 이뤄보세요!
        </p>
      `, [{ label: '다시 시작', cls: 'btn-gold', onClick: resetGame }]);
    }
  }

  /* ================= END TURN ENGINE ================= */
  function endTurn() {
    if (state.gameOver) return;
    playSfx('turn');

    // 1. Process player cities
    getPlayerCities().forEach(city => {
      const econ = calcMonthlyEconomy(city);
      city.gold = Math.max(0, city.gold + econ.goldNet);
      city.food = Math.max(0, city.food + econ.foodNet);

      // Population growth
      if (city.order >= 60 && city.food > 0) {
        const springBonus = (state.month >= 3 && state.month <= 5) ? 1.3 : 1.0;
        const growth = Math.round(city.pop * 0.008 * (city.order / 100) * springBonus);
        city.pop = Math.min(city.maxPop, city.pop + growth);
      }

      // Loyalty change from salary
      getCityOfficers(city.id).forEach(o => {
        if (city.salary === 0 && o.loy > 60) o.loy = Math.max(50, o.loy - 1);
        if (city.salary === 2 && o.loy < 100) o.loy = Math.min(100, o.loy + 2);
        if (state.techs && state.techs.prestige) o.loy = Math.min(100, o.loy + 1 + (state.techs.prestige2 ? 1 : 0));
      });

      // Domestic task execution
      const asg = city.assignments || {};
      if (asg.agri) {
        const o = getOfficer(asg.agri);
        if (o && city.gold >= TASK_META.agri.costGold) {
          city.gold -= TASK_META.agri.costGold;
          const gain = Math.max(1, Math.round(o.pol / 24));
          city.agri = Math.min(100, city.agri + gain);
          grantOfficerExp(o, 22, 'pol');
          addLog('dom', `[내정] ${city.name} ${o.name} 농업 개발 → 농업 +${gain} (${city.agri})`);
        }
      }
      if (asg.comm) {
        const o = getOfficer(asg.comm);
        if (o && city.gold >= TASK_META.comm.costGold) {
          city.gold -= TASK_META.comm.costGold;
          const gain = Math.max(1, Math.round(o.pol / 24));
          city.comm = Math.min(100, city.comm + gain);
          grantOfficerExp(o, 22, 'pol');
          addLog('dom', `[내정] ${city.name} ${o.name} 상업 투자 → 상업 +${gain} (${city.comm})`);
        }
      }
      if (asg.order) {
        const o = getOfficer(asg.order);
        if (o && city.gold >= TASK_META.order.costGold) {
          city.gold -= TASK_META.order.costGold;
          const gain = Math.max(2, Math.round((o.chr + o.ldr) / 36));
          city.order = Math.min(100, city.order + gain);
          addLog('dom', `[내정] ${city.name} ${o.name} 치안 순찰 → 치안 +${gain} (${city.order})`);
        }
      }
      if (asg.train) {
        const o = getOfficer(asg.train);
        if (o && city.gold >= TASK_META.train.costGold) {
          city.gold -= TASK_META.train.costGold;
          const gain = Math.max(2, Math.round((o.ldr + o.war) / 34));
          city.train = Math.min(100, city.train + gain);
          city.barracks = Math.min(60, city.barracks + 1);
          grantOfficerExp(o, 24, 'ldr');
          addLog('dom', `[내정] ${city.name} ${o.name} 병사 훈련 → 훈련도 ${city.train}%`);
        }
      }
      if (asg.recruit) {
        const o = getOfficer(asg.recruit);
        if (o && city.gold >= TASK_META.recruit.costGold && city.pop > 20000) {
          city.gold -= TASK_META.recruit.costGold;
          const barBonus = 1 + (getLevel(city.barracks, 60) - 1) * 0.1;
          const added = Math.round((260 + o.chr * 4.5) * barBonus);
          city.troops += added;
          city.pop = Math.max(10000, city.pop - added);
          city.order = Math.max(20, city.order - 2);
          city.train = Math.max(30, city.train - 3);
          addLog('dom', `[내정] ${city.name} ${o.name} 징병 완료 → 병력 +${added.toLocaleString()}명`);
        }
      }
    });

    // 2. AI Factions growth & occasional skirmish
    state.cities.filter(c => c.faction !== state.playerFaction).forEach(c => {
      c.gold += Math.round(350 + c.comm * 6);
      c.food += Math.round(1200 + c.agri * 20);
      if (c.troops < 11000 && Math.random() < 0.45) {
        c.troops += Math.round(220 + Math.random() * 260);
      }
      c.agri = Math.min(100, c.agri + (Math.random() < 0.25 ? 1 : 0));
      c.comm = Math.min(100, c.comm + (Math.random() < 0.25 ? 1 : 0));
    });

    // Advance Date & Market Rate
    state.turn++;
    state.month++;
    if (state.month > 12) { state.month = 1; state.year++; }
    state.foodRate = Math.max(6, Math.min(15, state.foodRate + Math.floor(Math.random() * 5) - 2));

    // Decrement alliance timers
    Object.values(state.factions).forEach(fac => {
      Object.keys(fac.allies).forEach(k => {
        fac.allies[k]--;
        if (fac.allies[k] <= 0) {
          delete fac.allies[k];
          if (fac.id === state.playerFaction) {
            addLog('dip', `[외교] ${state.factions[k].name}과의 동맹 기간이 만료되었습니다.`);
          }
        }
      });
    });

    // 3. Historical Events
    triggerHistoricalEvents();

    // 4. AI Attack Check (after turn 4, small chance if strong enemy borders weak player city)
    if (state.turn >= 5 && !activeBattle && Math.random() < 0.16) {
      const pCities = getPlayerCities();
      for (const pc of pCities) {
        const enemyNeighbor = pc.neighbors
          .map(nid => getCity(nid))
          .find(nc => nc && nc.faction !== state.playerFaction &&
                !state.factions[state.playerFaction].allies[nc.faction] &&
                nc.troops > pc.troops * 1.45 && nc.troops >= 4500);
        if (enemyNeighbor) {
          const sendTroops = Math.round(enemyNeighbor.troops * 0.55);
          enemyNeighbor.troops -= sendTroops;
          const eOffs = getCityOfficers(enemyNeighbor.id).slice(0, 2).map(o => o.id);
          addLog('mil', `[군사] 긴급! ${state.factions[enemyNeighbor.faction].name}이(가) ${enemyNeighbor.name}에서 ${pc.name}(으)로 침공했습니다!`);
          renderAll();
          saveState(true);
          startBattle(enemyNeighbor.id, pc.id, eOffs, sendTroops, 5000, false);
          return;
        }
      }
    }

    renderAll();
    saveState(true);
  }

  function triggerHistoricalEvents() {
    const city = getCurrentCity();
    if (!city) return;

    // Living World: AI-vs-AI occasional skirmish (keeps the China map alive!)
    if (state.turn >= 4 && Math.random() < 0.28) {
      const aiCities = state.cities.filter(c => c.faction !== state.playerFaction && c.troops >= 5500);
      if (aiCities.length > 0) {
        const att = aiCities[Math.floor(Math.random() * aiCities.length)];
        const targets = att.neighbors.map(id => getCity(id)).filter(t => t && t.faction !== att.faction && t.faction !== state.playerFaction);
        if (targets.length > 0) {
          const def = targets[Math.floor(Math.random() * targets.length)];
          const attPow = att.troops * (0.85 + Math.random() * 0.3);
          const defPow = def.troops * (0.95 + Math.random() * 0.3);
          if (attPow > defPow * 1.15) {
            const oldFaction = def.faction;
            const oldFac = state.factions[oldFaction].name;
            const otherCity = state.cities.find(c => c.faction === oldFaction && c.id !== def.id);
            state.officers.filter(o => o.city === def.id && o.faction === oldFaction).forEach(o => {
              if (otherCity) o.city = otherCity.id;
              else { o.faction = null; o.loy = 75; }
            });
            def.assignments = { agri: null, comm: null, order: null, train: null, recruit: null };
            def.faction = att.faction;
            def.troops = Math.max(1500, Math.round(att.troops * 0.4));
            att.troops = Math.round(att.troops * 0.55);
            addLog('mil', `[천하] ${state.factions[att.faction].name}이(가) ${oldFac}의 ${def.name}을(를) 점령했습니다!`);
          } else {
            att.troops = Math.max(1800, Math.round(att.troops * 0.78));
            def.troops = Math.max(1500, Math.round(def.troops * 0.82));
            addLog('mil', `[천하] ${state.factions[att.faction].name}과 ${state.factions[def.faction].name}이(가) ${def.name}에서 격전을 벌였습니다.`);
          }
        }
      }
    }

    // Event 1: 삼고초려 (Turn 3 for Liu Bei, or special strategist rumor)
    if (state.turn === 3 && !state.eventsTriggered.sangu) {
      state.eventsTriggered.sangu = true;
      const zg = getOfficer('zhugeliang');
      if (zg && zg.faction === null && state.playerFaction === 'liubei') {
        openModal('📜 역사 이벤트 — 삼고초려(三顧草廬)', `
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px;">
            <div class="off-ava" style="width:64px;height:64px;">${makePortraitSVG(zg)}</div>
            <div style="font-size:12.5px;line-height:1.5;color:#dbe7fa;">
              융중의 초가집에 은거 중인 <b>와룡 제갈량</b>(지력 100 · 정치 98)의 명성이 자자합니다. 직접 예를 갖추어 모시러 가시겠습니까?
            </div>
          </div>
          <button class="event-choice-btn" id="evSangu1"><b>1. 삼고초려로 직접 방문한다</b><div style="font-size:11px;color:var(--green);margin-top:2px;">금 1,000 소모 · 제갈량 즉시 등용!</div></button>
          <button class="event-choice-btn" id="evSangu2"><b>2. 일단 서신을 보내 거처만 파악한다</b><div style="font-size:11px;color:var(--text-sub);margin-top:2px;">비용 없음 · 추후 [인재] 탭에서 등용 가능</div></button>
        `, []);
        $('evSangu1').addEventListener('click', () => {
          if (city.gold >= 1000) {
            city.gold -= 1000;
            zg.faction = state.playerFaction;
            zg.city = city.id;
            zg.loy = 100;
            state.stats.officersRecruited++;
            playSfx('fanfare');
            addLog('hist', `[역사] 삼고초려 대성공! 와룡 제갈량이 ${city.name}에 합류했습니다!`);
            showToast('🎉 와룡 제갈량 영입 성공!');
          } else {
            showToast('금이 부족해 서신만 보냈습니다. [인재] 탭에서 등용하세요.');
          }
          closeModal(); renderAll(); saveState(true);
        });
        $('evSangu2').addEventListener('click', () => {
          addLog('hist', `[역사] 제갈량이 신야 인근에 은거 중입니다. [인재] 탭에서 등용할 수 있습니다.`);
          closeModal(); renderAll(); saveState(true);
        });
        return;
      }
    }

    // Event 2: 호족의 군자금 헌납 / 민심 행사 (Random 12% per turn after turn 4)
    if (state.turn >= 5 && Math.random() < 0.14 && !$('modalBackdrop').classList.contains('open')) {
      const roll = Math.random();
      if (roll < 0.5) {
        openModal('📜 돌발 이벤트 — 지역 호족의 제안', `
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px;">
            <div class="off-ava" style="width:56px;height:56px;"><img src="${NPC_ARCHETYPES.merchant}" alt="호족" style="width:100%;height:100%;object-fit:cover;"></div>
            <div style="font-size:12.5px;line-height:1.5;color:#dbe7fa;">
              ${city.name}의 유력 호족이 군자금 <b>2,500금</b>을 헌납하는 대신 세금 감면(상업 특혜)을 요청해 왔습니다.
            </div>
          </div>
          <button class="event-choice-btn" id="evCh1"><b>1. 군자금을 받는다</b><div style="font-size:11px;color:var(--gold-bright);">금 +2,500 · 치안 -6</div></button>
          <button class="event-choice-btn" id="evCh2"><b>2. 정중히 거절하고 공정 과세를 유지한다</b><div style="font-size:11px;color:var(--green);">치안 +8 · 인구 +6,000</div></button>
        `, []);
        $('evCh1').addEventListener('click', () => {
          city.gold += 2500; city.order = Math.max(20, city.order - 6);
          playSfx('assign'); addLog('hist', `[이벤트] ${city.name} 호족으로부터 군자금 2,500을 확보했습니다.`);
          closeModal(); renderAll(); saveState(true);
        });
        $('evCh2').addEventListener('click', () => {
          city.order = Math.min(100, city.order + 8); city.pop = Math.min(city.maxPop, city.pop + 6000);
          playSfx('fanfare'); addLog('hist', `[이벤트] 공정한 행정으로 ${city.name} 민심과 인구가 크게 올랐습니다.`);
          closeModal(); renderAll(); saveState(true);
        });
        return;
      } else {
        openModal('📜 돌발 이벤트 — 서역 명마 상단 방문', `
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px;">
            <div class="off-ava" style="width:56px;height:56px;"><img src="${NPC_ARCHETYPES.villager}" alt="상단" style="width:100%;height:100%;object-fit:cover;"></div>
            <div style="font-size:12.5px;line-height:1.5;color:#dbe7fa;">
              서역 상단이 ${city.name} 성문에 도착해 준마와 무기를 팔고 있습니다.
            </div>
          </div>
          <button class="event-choice-btn" id="evCh1"><b>1. 군마와 장비를 대량 매입한다 (금 1,200)</b><div style="font-size:11px;color:var(--green);">훈련도 +12% · 병력 +800</div></button>
          <button class="event-choice-btn" id="evCh2"><b>2. 상단의 안전만 보장하고 통행세를 받는다</b><div style="font-size:11px;color:var(--gold-bright);">금 +900 · 상업 +3</div></button>
        `, []);
        $('evCh1').addEventListener('click', () => {
          if (city.gold >= 1200) {
            city.gold -= 1200; city.train = Math.min(100, city.train + 12); city.troops += 800;
            playSfx('assign'); addLog('hist', `[이벤트] 서역 군마 매입으로 ${city.name} 군세가 크게 강화되었습니다!`);
          } else showToast('금이 부족해 거래가 무산되었습니다.');
          closeModal(); renderAll(); saveState(true);
        });
        $('evCh2').addEventListener('click', () => {
          city.gold += 900; city.comm = Math.min(100, city.comm + 3);
          playSfx('assign'); addLog('hist', `[이벤트] 서역 상단 통행세로 금 900과 상업 +3을 얻었습니다.`);
          closeModal(); renderAll(); saveState(true);
        });
        return;
      }
    }

    // Autumn Harvest Notice
    if (state.month === 9 && Math.random() < 0.5) {
      getPlayerCities().forEach(c => { c.food += 10000; });
      addLog('hist', `[계절] 가을 대풍년! 아군 모든 성에 수확 군량 +10,000이 입고되었습니다.`);
      showToast('🍁 가을 대풍년! 군량 +10,000');
    }
  }

  /* ================= RENDER SUB-TABS ================= */
  function renderPersonnelTab() {
    const city = getCurrentCity();
    if (!city) return;
    const myOffs = getCityOfficers(city.id);
    const freeOffs = getFreeOfficers(city.id);
    const otherCities = getPlayerCities().filter(c => c.id !== city.id);

    let html = `
      <div class="section-h">
        <span>👤 ${city.name} 소속 장수 (${myOffs.length}명)</span>
        <button class="btn-gold" id="btnSearchTalent">🔍 인재 탐색 (금 200)</button>
      </div>
      <div class="grid-cards" style="margin-bottom:16px;">
    `;

    myOffs.forEach(o => {
      const task = getOfficerAssignment(city, o.id);
      html += `
        <div class="panel-card">
          <div style="display:flex;gap:9px;align-items:center;">
            <div class="off-ava" style="width:44px;height:44px;">${makePortraitSVG(o)}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-weight:800;color:var(--gold-bright);">${o.name} <span style="font-size:10.5px;color:var(--cyan);font-weight:400;">${o.trait}</span></div>
              <div style="font-size:11px;color:var(--text-sub);">충성 <b style="color:${o.loy >= 90 ? 'var(--green)' : 'var(--amber)'};">${o.loy}</b> · ${task ? TASK_META[task].name : '쉬는 중'}</div>
            </div>
          </div>
          <div class="stat-row">
            <span class="stat-pill">통<b>${o.ldr}</b></span>
            <span class="stat-pill">무<b>${o.war}</b></span>
            <span class="stat-pill">지<b>${o.int}</b></span>
            <span class="stat-pill">정<b>${o.pol}</b></span>
            <span class="stat-pill">매<b>${o.chr}</b></span>
          </div>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <button class="btn-sm btn-success act-reward" data-oid="${o.id}" ${o.loy >= 100 ? 'disabled' : ''}>포상 (300금)</button>
            ${otherCities.length > 0 ? `<button class="btn-sm act-move" data-oid="${o.id}">이동</button>` : ''}
          </div>
        </div>`;
    });

    html += `</div><div class="section-h"><span>🌟 ${city.name} 인근 재야 인재 (${freeOffs.length}명)</span></div>`;

    if (freeOffs.length === 0) {
      html += `<div class="panel-card" style="color:var(--text-sub);">현재 ${city.name}에서 발견된 재야 장수가 없습니다. 다른 성을 점령하거나 인재 탐색을 시도해 보세요.</div>`;
    } else {
      html += `<div class="grid-cards">`;
      freeOffs.forEach(o => {
        html += `
          <div class="panel-card" style="border-color:var(--gold);">
            <div style="display:flex;gap:9px;align-items:center;">
              <div class="off-ava" style="width:44px;height:44px;">${makePortraitSVG(o)}</div>
              <div>
                <div style="font-weight:800;color:var(--gold-bright);">${o.name} <span style="font-size:10.5px;color:var(--amber);">${o.trait}</span></div>
                <div style="font-size:11px;color:var(--text-sub);">전법: ${o.skill}</div>
              </div>
            </div>
            <div class="stat-row">
              <span class="stat-pill">통<b>${o.ldr}</b></span>
              <span class="stat-pill">무<b>${o.war}</b></span>
              <span class="stat-pill">지<b>${o.int}</b></span>
              <span class="stat-pill">정<b>${o.pol}</b></span>
              <span class="stat-pill">매<b>${o.chr}</b></span>
            </div>
            <button class="btn-sm btn-success act-recruit-off" data-oid="${o.id}" style="width:100%;margin-top:4px;">등용 시도 (금 400)</button>
          </div>`;
      });
      html += `</div>`;
    }

    $('viewPersonnel').innerHTML = html;

    $('btnSearchTalent').addEventListener('click', () => {
      if (city.gold < 200) return showToast('금이 부족합니다.');
      city.gold -= 200;
      playSfx('click');
      const freeHere = getFreeOfficers(city.id);
      if (freeHere.length > 0) {
        showToast(`🌟 재야 명장 ${freeHere[0].name}의 거처를 확인했습니다! 아래에서 등용하세요.`);
        addLog('per', `[인재] ${city.name} 탐색 중 ${freeHere[0].name}의 소재를 파악했습니다.`);
      } else {
        const bonusGold = 150 + Math.floor(Math.random() * 250);
        city.gold += bonusGold;
        showToast(`재야 인재는 없었으나 지역 호족의 기부로 금 ${bonusGold}을 얻었습니다.`);
      }
      renderAll();
    });

    document.querySelectorAll('.act-reward').forEach(b => {
      b.addEventListener('click', () => {
        const o = getOfficer(b.dataset.oid);
        if (city.gold < 300) return showToast('금이 부족합니다.');
        city.gold -= 300;
        o.loy = Math.min(100, o.loy + 12);
        playSfx('assign');
        addLog('per', `[인재] ${o.name}에게 포상 → 충성 ${o.loy}`);
        showToast(`${o.name} 충성도 +12!`);
        renderAll();
      });
    });

    document.querySelectorAll('.act-move').forEach(b => {
      b.addEventListener('click', () => {
        const o = getOfficer(b.dataset.oid);
        const opts = otherCities.map(c => `<button class="btn-sm pick-dest" data-cid="${c.id}" style="width:100%;margin-bottom:6px;">${c.name} (현재 장수 ${getCityOfficers(c.id).length}명)</button>`).join('');
        openModal(`${o.name} 이동할 성 선택`, opts);
        document.querySelectorAll('.pick-dest').forEach(db => {
          db.addEventListener('click', () => {
            for (const k of Object.keys(city.assignments)) {
              if (city.assignments[k] === o.id) city.assignments[k] = null;
            }
            o.city = db.dataset.cid;
            playSfx('assign');
            addLog('per', `[인재] ${o.name}이(가) ${getCity(db.dataset.cid).name}(으)로 이동했습니다.`);
            showToast(`${o.name} 이동 완료!`);
            closeModal(); renderAll();
          });
        });
      });
    });

    document.querySelectorAll('.act-recruit-off').forEach(b => {
      b.addEventListener('click', () => {
        const o = getOfficer(b.dataset.oid);
        if (city.gold < 400) return showToast('금이 부족합니다.');
        city.gold -= 400;
        const bestChr = Math.max(...getCityOfficers(city.id).map(x => x.chr), 70);
        const chance = Math.min(0.95, 0.45 + (bestChr - 60) * 0.012 + (state.techs && state.techs.prestige ? 0.25 : 0) + (state.techs && state.techs.prestige2 ? 0.10 : 0));
        if (Math.random() < chance) {
          o.faction = state.playerFaction;
          o.loy = 95;
          playSfx('fanfare');
          addLog('per', `[인재] 대성공! ${o.name}(이)가 유비군에 합류했습니다!`);
          showToast(`🎉 ${o.name} 등용 성공!`);
        } else {
          playSfx('click');
          addLog('per', `[인재] ${o.name} 등용에 실패했습니다. 다시 설득해 보십시오.`);
          showToast(`${o.name}이(가) 정중히 사양했습니다. 다시 시도해 보세요.`);
        }
        renderAll();
      });
    });
  }

  function renderDiplomacyTab() {
    const pFac = state.factions[state.playerFaction];
    const city = getCurrentCity();
    const others = Object.values(state.factions).filter(f => f.id !== state.playerFaction);

    let html = `<div class="section-h"><span>🤝 천하 외교 현황</span><span style="font-size:11.5px;color:var(--text-sub);">현재 외교 자금: ${city.name} 금 ${city.gold.toLocaleString()}</span></div>
      <div class="grid-cards">`;

    others.forEach(f => {
      const fCities = state.cities.filter(c => c.faction === f.id);
      if (fCities.length === 0) return;
      const totalTroops = fCities.reduce((s, c) => s + c.troops, 0);
      const rel = pFac.relations[f.id] ?? 50;
      const allyTurns = pFac.allies[f.id] || 0;
      const statusBadge = allyTurns > 0
        ? `<span style="color:var(--green);font-weight:700;">동맹 (${allyTurns}개월)</span>`
        : rel >= 65 ? `<span style="color:var(--cyan);">우호</span>`
        : rel <= 30 ? `<span style="color:var(--red);">적대</span>`
        : `<span style="color:var(--text-sub);">중립</span>`;

      html += `
        <div class="panel-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:14px;font-weight:800;color:${f.color};">● ${f.name}</span>
            ${statusBadge}
          </div>
          <div style="font-size:11.5px;color:var(--text-sub);margin-bottom:6px;">
            군주: <b>${f.leader}</b> · 성 ${fCities.length}개 · 총 병력 ${totalTroops.toLocaleString()}
          </div>
          <div class="prog-row" style="margin-bottom:8px;">
            <div class="prog-head"><span style="color:var(--text-sub);">우호도</span><span>${rel}/100</span></div>
            <div class="prog-bar"><div class="prog-fill fill-ord" style="width:${rel}%;"></div></div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="btn-sm act-gift" data-fid="${f.id}">🎁 친선 (금 800)</button>
            ${allyTurns > 0
              ? `<button class="btn-sm btn-danger act-break" data-fid="${f.id}">동맹 파기</button>`
              : `<button class="btn-sm btn-success act-ally" data-fid="${f.id}">📜 동맹 제안</button>`}
          </div>
        </div>`;
    });
    html += `</div>`;
    $('viewDiplomacy').innerHTML = html;

    document.querySelectorAll('.act-gift').forEach(b => {
      b.addEventListener('click', () => {
        const fid = b.dataset.fid;
        if (city.gold < 800) return showToast('금이 부족합니다.');
        city.gold -= 800;
        pFac.relations[fid] = Math.min(100, (pFac.relations[fid] || 50) + 18);
        playSfx('assign');
        addLog('dip', `[외교] ${state.factions[fid].name}에 사절을 보내 우호도가 ${pFac.relations[fid]}(으)로 상승했습니다.`);
        showToast(`${state.factions[fid].name} 우호도 +18!`);
        renderAll();
      });
    });

    document.querySelectorAll('.act-ally').forEach(b => {
      b.addEventListener('click', () => {
        const fid = b.dataset.fid;
        const rel = pFac.relations[fid] || 50;
        if (city.gold < 1200) return showToast('동맹 체결에 금 1,200이 필요합니다.');
        if (rel < 60) return showToast('우호도가 60 이상이어야 동맹을 제안할 수 있습니다.');
        city.gold -= 1200;
        pFac.allies[fid] = 12;
        state.factions[fid].allies[state.playerFaction] = 12;
        playSfx('fanfare');
        addLog('dip', `[외교] ${state.factions[fid].name}과 12개월 동맹을 체결했습니다!`);
        showToast(`🤝 ${state.factions[fid].name}과 동맹 체결!`);
        renderAll();
      });
    });

    document.querySelectorAll('.act-break').forEach(b => {
      b.addEventListener('click', () => {
        const fid = b.dataset.fid;
        delete pFac.allies[fid];
        delete state.factions[fid].allies[state.playerFaction];
        pFac.relations[fid] = Math.max(0, (pFac.relations[fid] || 50) - 35);
        playSfx('click');
        addLog('dip', `[외교] ${state.factions[fid].name}과의 동맹을 파기했습니다.`);
        showToast('동맹이 파기되었습니다.');
        renderAll();
      });
    });
  }

  function renderMilitaryTab() {
    const city = getCurrentCity();
    if (!city) return;
    const neighbors = city.neighbors.map(id => getCity(id)).filter(Boolean);
    const enemyNeighbors = neighbors.filter(c => c.faction !== state.playerFaction);
    const allyNeighbors = neighbors.filter(c => c.faction === state.playerFaction);

    let html = `<div class="section-h"><span>⚔️ ${city.name} 출진 및 군사 작전</span><span style="font-size:11.5px;color:var(--text-sub);">가용 병력: ${city.troops.toLocaleString()}명 · 훈련도 ${city.train}%</span></div>`;

    if (enemyNeighbors.length === 0) {
      html += `<div class="panel-card" style="color:var(--text-sub);margin-bottom:14px;">인접한 적 성이 없습니다. 전방 성으로 병력과 장수를 수송하세요.</div>`;
    } else {
      html += `<div class="grid-cards" style="margin-bottom:16px;">`;
      enemyNeighbors.forEach(ec => {
        const fac = state.factions[ec.faction];
        const isAlly = !!state.factions[state.playerFaction].allies[ec.faction];
        const eOffs = getCityOfficers(ec.id);
        html += `
          <div class="panel-card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:14px;font-weight:800;color:var(--gold-bright);">🏯 ${ec.name} (${ec.tier})</span>
              <span style="font-size:11px;font-weight:700;color:${fac.color};">${fac.name}</span>
            </div>
            <div style="font-size:11.5px;color:var(--text-sub);margin:6px 0;">
              수비 병력: <b style="color:var(--red);">${ec.troops.toLocaleString()}명</b> · 장수 ${eOffs.length}명
            </div>
            <button class="btn-sm btn-danger act-march" data-cid="${ec.id}" style="width:100%;" ${isAlly ? 'disabled' : ''}>
              ${isAlly ? '동맹 세력 (공격 불가)' : '⚔️ 출진 준비'}
            </button>
          </div>`;
      });
      html += `</div>`;
    }

    if (allyNeighbors.length > 0) {
      html += `<div class="section-h"><span>📦 인접 아군 성으로 수송</span></div><div class="grid-cards">`;
      allyNeighbors.forEach(ac => {
        html += `
          <div class="panel-card">
            <div style="font-weight:800;color:var(--green);margin-bottom:4px;">🏯 ${ac.name}</div>
            <div style="font-size:11.5px;color:var(--text-sub);margin-bottom:8px;">병력 ${ac.troops.toLocaleString()} · 금 ${ac.gold.toLocaleString()} · 군량 ${ac.food.toLocaleString()}</div>
            <button class="btn-sm act-supply" data-cid="${ac.id}" style="width:100%;">병력 1,000 + 군량 5,000 수송</button>
          </div>`;
      });
      html += `</div>`;
    }

    $('viewMilitary').innerHTML = html;

    document.querySelectorAll('.act-march').forEach(b => {
      b.addEventListener('click', () => openMarchModal(city.id, b.dataset.cid));
    });

    document.querySelectorAll('.act-supply').forEach(b => {
      b.addEventListener('click', () => {
        const dest = getCity(b.dataset.cid);
        if (city.troops < 1500) return showToast('최소 수비 병력(500명)을 남겨두어야 합니다.');
        if (city.food < 5000) return showToast('군량이 부족합니다.');
        city.troops -= 1000; city.food -= 5000;
        dest.troops += 1000; dest.food += 5000;
        playSfx('assign');
        addLog('mil', `[군사] ${city.name} → ${dest.name} 병력 1,000명, 군량 5,000 수송 완료.`);
        showToast(`${dest.name}(으)로 수송 완료!`);
        renderAll();
      });
    });
  }

  function openMarchModal(fromId, targetId) {
    const from = getCity(fromId);
    const target = getCity(targetId);
    const offs = getCityOfficers(fromId).sort((a, b) => (b.ldr + b.war) - (a.ldr + a.war));
    if (offs.length === 0) return showToast('출진할 장수가 없습니다.');
    if (from.troops < 800) return showToast('출진하려면 최소 800명 이상의 병력이 필요합니다.');

    const maxSend = Math.max(500, from.troops - 300);
    const defaultSend = Math.min(maxSend, Math.round(from.troops * 0.75));
    const defaultFood = Math.min(from.food, defaultSend * 2);

    const html = `
      <p style="font-size:12px;color:var(--text-sub);margin-bottom:10px;">
        <b>${from.name}</b> → <b style="color:var(--red);">${target.name}</b> (적 수비 병력: ${target.troops.toLocaleString()}명)
      </p>
      <div style="margin-bottom:10px;">
        <label style="font-size:12px;color:var(--gold);display:block;margin-bottom:4px;">출진 장수 선택 (최대 3명)</label>
        <div style="display:flex;flex-wrap:wrap;gap:6px;" id="marchOffList">
          ${offs.map((o, idx) => `
            <label style="display:flex;align-items:center;gap:5px;background:#101a30;border:1px solid var(--border-dim);padding:5px 8px;border-radius:4px;cursor:pointer;font-size:11.5px;">
              <input type="checkbox" class="march-chk" value="${o.id}" ${idx < 2 ? 'checked' : ''}>
              <b>${o.name}</b> (통${o.ldr}/무${o.war})
            </label>`).join('')}
        </div>
      </div>
      <div style="margin-bottom:10px;">
        <label style="font-size:12px;color:var(--gold);display:block;margin-bottom:5px;">병종 편성 (상성: 기병 > 궁병 > 보병 > 기병)</label>
        <div class="unit-pick-row" id="unitPickRow">
          <button type="button" class="unit-pill active" data-unit="infantry">🛡️ 보병<div style="font-size:10px;color:var(--text-dim);">기병에 강함</div></button>
          <button type="button" class="unit-pill" data-unit="cavalry">🐎 기병<div style="font-size:10px;color:var(--text-dim);">궁병에 강함</div></button>
          <button type="button" class="unit-pill" data-unit="archer">🏹 궁병<div style="font-size:10px;color:var(--text-dim);">보병에 강함</div></button>
        </div>
      </div>
      <div style="margin-bottom:10px;">
        <label style="font-size:12px;color:var(--gold);display:flex;justify-content:space-between;">
          <span>출진 병력</span>
          <b id="marchTroopVal">${defaultSend.toLocaleString()}명</b>
        </label>
        <input type="range" id="marchTroopRange" min="500" max="${maxSend}" step="100" value="${defaultSend}" style="width:100%;margin-top:4px;">
      </div>
      <div style="font-size:11.5px;color:var(--text-sub);">필요 군량: <b id="marchFoodVal">${defaultFood.toLocaleString()}</b> (보유: ${from.food.toLocaleString()})</div>
    `;

    openModal(`⚔️ ${target.name} 출진 편성`, html, [
      { label: '취소', cls: 'btn-sm', onClick: closeModal },
      {
        label: '출진 개시!',
        cls: 'btn-sm btn-danger',
        onClick: () => {
          const picked = Array.from(document.querySelectorAll('.march-chk:checked')).map(i => i.value).slice(0, 3);
          if (picked.length === 0) return showToast('최소 1명의 장수를 선택하세요.');
          const sendTroops = parseInt($('marchTroopRange').value, 10);
          const needFood = sendTroops * 2;
          if (from.food < needFood) return showToast('군량이 부족합니다.');
          const activeUnitEl = document.querySelector('#unitPickRow .unit-pill.active');
          const unitType = activeUnitEl ? activeUnitEl.dataset.unit : 'infantry';
          from.troops -= sendTroops;
          from.food -= needFood;
          closeModal();
          startBattle(fromId, targetId, picked, sendTroops, needFood, true, unitType);
        }
      }
    ]);

    document.querySelectorAll('#unitPickRow .unit-pill').forEach(p => {
      p.addEventListener('click', () => {
        document.querySelectorAll('#unitPickRow .unit-pill').forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        playSfx('click');
      });
    });
    $('marchTroopRange').addEventListener('input', (e) => {
      const v = parseInt(e.target.value, 10);
      $('marchTroopVal').textContent = v.toLocaleString() + '명';
      $('marchFoodVal').textContent = (v * 2).toLocaleString();
    });
  }

  function renderInfoTab() {
    const facRows = Object.values(state.factions).map(f => {
      const cs = state.cities.filter(c => c.faction === f.id);
      const os = state.officers.filter(o => o.faction === f.id);
      return {
        f,
        cities: cs.length,
        officers: os.length,
        troops: cs.reduce((s, c) => s + c.troops, 0),
        gold: cs.reduce((s, c) => s + c.gold, 0)
      };
    }).filter(r => r.cities > 0).sort((a, b) => b.cities - a.cities || b.troops - a.troops);

    let html = `
      <div class="section-h"><span>📊 천하 세력 순위 (통일 목표: ${getPlayerCities().length} / ${state.cities.length}성)</span></div>
      <div class="panel-card" style="padding:0;overflow:hidden;margin-bottom:14px;">
        <table class="data-tbl">
          <thead><tr><th>세력</th><th>군주</th><th>거점</th><th>장수</th><th>총 병력</th><th>총 자금</th></tr></thead>
          <tbody>
            ${facRows.map(r => `<tr>
              <td style="font-weight:800;color:${r.f.color};">● ${r.f.name}</td>
              <td>${r.f.leader}</td>
              <td>${r.cities}개</td>
              <td>${r.officers}명</td>
              <td>${r.troops.toLocaleString()}</td>
              <td>${r.gold.toLocaleString()}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="section-h"><span>🏯 전체 도시 현황</span></div>
      <div class="panel-card" style="padding:0;overflow:hidden;">
        <table class="data-tbl">
          <thead><tr><th>도시</th><th>세력</th><th>인구</th><th>농업/상업</th><th>치안</th><th>병력</th></tr></thead>
          <tbody>
            ${state.cities.map(c => {
              const f = state.factions[c.faction];
              return `<tr>
                <td style="font-weight:700;color:var(--gold-bright);">${c.name}</td>
                <td style="color:${f.color};font-weight:700;">${f.name}</td>
                <td>${c.pop.toLocaleString()}</td>
                <td>${c.agri} / ${c.comm}</td>
                <td>${c.order}</td>
                <td>${c.troops.toLocaleString()}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    $('viewInfo').innerHTML = html;
  }

  /* ================= ISOMETRIC CITY CANVAS RENDERER ================= */
  let animTick = 0;
  let cityHitBoxes = [];
  let petals = Array.from({ length: 18 }, () => ({
    x: Math.random(), y: Math.random(), vx: 0.0007 + Math.random() * 0.001, vy: 0.0012 + Math.random() * 0.0012, s: 2 + Math.random() * 2.5
  }));

  /* Per-Theme Strictly Walkable Courtyard / Road Zones (Zero Wall/Roof/River Clipping!) */
  const CITY_THEME_BADGES = {
    xinye:    { bar: [0.27, 0.36], mkt: [0.75, 0.41], ord: [0.51, 0.49], farm: [0.24, 0.74] },
    capital:  { bar: [0.31, 0.33], mkt: [0.68, 0.54], ord: [0.48, 0.48], farm: [0.22, 0.74] },
    jiangnan: { bar: [0.19, 0.34], mkt: [0.71, 0.54], ord: [0.54, 0.43], farm: [0.21, 0.77] },
    jingzhou: { bar: [0.37, 0.36], mkt: [0.64, 0.43], ord: [0.48, 0.48], farm: [0.18, 0.72] },
    shu:      { bar: [0.23, 0.46], mkt: [0.70, 0.53], ord: [0.53, 0.52], farm: [0.28, 0.80] }
  };

  const CITY_THEME_ROUTES = {
    xinye: [
      { role: 'villager', speed: 0.00018, lines: ['태수님 덕분에 살기 좋소!', '벚꽃 광장이 참 곱구나~'], pts: [[0.46,0.52],[0.52,0.56],[0.55,0.51],[0.49,0.48]] },
      { role: 'villager', speed: 0.00016, lines: ['치안이 좋아 안심이오.', '오늘도 평온한 하루요.'], pts: [[0.56,0.53],[0.51,0.57],[0.47,0.54],[0.52,0.50]] },
      { role: 'merchant', speed: 0.00019, lines: ['장터에 좋은 물건이 많소!', '군량 시세가 좋구려!'], pts: [[0.68,0.49],[0.75,0.45],[0.77,0.48],[0.70,0.52]] },
      { role: 'soldier',  speed: 0.00022, lines: ['하나! 둘! 훈련에 매진하라!', '성곽 경계 이상 무!'], pts: [[0.23,0.46],[0.31,0.42],[0.33,0.46],[0.25,0.49]] },
      { role: 'soldier',  speed: 0.00020, lines: ['출진 명령만 기다립니다!', '군기가 바짝 들었소!'], pts: [[0.32,0.44],[0.25,0.48],[0.28,0.50],[0.34,0.46]] },
      { role: 'farmer',   speed: 0.00015, lines: ['올해 밀 농사가 대풍이오!', '군량 걱정은 마시게!'], pts: [[0.18,0.71],[0.27,0.76],[0.24,0.79],[0.15,0.74]] }
    ],
    capital: [
      { role: 'villager', speed: 0.00018, lines: ['황성의 위용이 대단하구나!', '대로가 넓어 다니기 좋소.'], pts: [[0.42,0.53],[0.50,0.47],[0.53,0.51],[0.45,0.57]] },
      { role: 'villager', speed: 0.00016, lines: ['태수부에서 좋은 정치가 펼쳐지네.', '천하의 중심답구려!'], pts: [[0.47,0.58],[0.54,0.52],[0.51,0.49],[0.44,0.55]] },
      { role: 'merchant', speed: 0.00019, lines: ['도성 장터에 손님이 구름 같소!', '비단과 차를 구경하시오!'], pts: [[0.62,0.62],[0.69,0.58],[0.71,0.62],[0.64,0.65]] },
      { role: 'soldier',  speed: 0.00022, lines: ['도성 수비 이상 무!', '정예 병사들 훈련 개시!'], pts: [[0.28,0.40],[0.35,0.36],[0.37,0.39],[0.30,0.43]] },
      { role: 'farmer',   speed: 0.00015, lines: ['중원의 황금 들녘이 풍요롭소!', '올가을 풍년일세!'], pts: [[0.19,0.73],[0.27,0.78],[0.24,0.81],[0.16,0.76]] }
    ],
    jiangnan: [
      { role: 'villager', speed: 0.00017, lines: ['강남 물길이 참 아름답소!', '돌다리에 바람이 시원하네.'], pts: [[0.50,0.47],[0.57,0.44],[0.59,0.48],[0.52,0.51]] },
      { role: 'merchant', speed: 0.00019, lines: ['장강 수운으로 물자가 넘쳐나오!', '나루터 장터로 오시오!'], pts: [[0.66,0.64],[0.73,0.60],[0.75,0.63],[0.68,0.67]] },
      { role: 'merchant', speed: 0.00018, lines: ['오나라 수군과 상선이 든든하구려!', '비단 시세가 좋소!'], pts: [[0.53,0.50],[0.58,0.47],[0.55,0.44],[0.50,0.48]] },
      { role: 'soldier',  speed: 0.00021, lines: ['강동 수군 출격 준비 완료!', '성곽 경계 이상 무!'], pts: [[0.16,0.42],[0.22,0.39],[0.24,0.42],[0.18,0.45]] },
      { role: 'farmer',   speed: 0.00015, lines: ['강남 논농사가 잘 익었소!', '풍년이로다!'], pts: [[0.18,0.77],[0.24,0.81],[0.21,0.83],[0.15,0.79]] }
    ],
    jingzhou: [
      { role: 'villager', speed: 0.00017, lines: ['해자가 깊어 적도 못 넘보겠소!', '형주 백성들이 평안하오.'], pts: [[0.43,0.50],[0.51,0.46],[0.54,0.50],[0.46,0.54]] },
      { role: 'villager', speed: 0.00016, lines: ['성내 광장이 참 깔끔하구려.', '오늘도 무사태평이오.'], pts: [[0.46,0.53],[0.53,0.49],[0.50,0.46],[0.44,0.50]] },
      { role: 'merchant', speed: 0.00019, lines: ['형주 요충지라 장사가 잘 되오!', '군량과 물자 거래하시오!'], pts: [[0.60,0.48],[0.66,0.45],[0.68,0.48],[0.62,0.51]] },
      { role: 'soldier',  speed: 0.00022, lines: ['철벽 수성! 한 놈도 못 들어온다!', '훈련 이상 무!'], pts: [[0.34,0.43],[0.40,0.40],[0.42,0.43],[0.36,0.46]] },
      { role: 'farmer',   speed: 0.00015, lines: ['성 밖 밭이 기름지구나!', '곡식이 쑥쑥 자라네!'], pts: [[0.15,0.71],[0.22,0.76],[0.19,0.79],[0.12,0.74]] }
    ],
    shu: [
      { role: 'villager', speed: 0.00017, lines: ['촉산의 절경과 천부지국이로다!', '등불 정자가 참 멋지오.'], pts: [[0.46,0.59],[0.53,0.56],[0.56,0.59],[0.49,0.62]] },
      { role: 'villager', speed: 0.00016, lines: ['산세가 험해 도적이 얼씬도 못하오.', '살기 좋은 고장이네.'], pts: [[0.58,0.52],[0.64,0.49],[0.66,0.52],[0.60,0.55]] },
      { role: 'merchant', speed: 0.00019, lines: ['촉나라 비단과 차가 천하제일이오!', '어서 구경하시오!'], pts: [[0.66,0.59],[0.72,0.56],[0.74,0.59],[0.68,0.62]] },
      { role: 'soldier',  speed: 0.00022, lines: ['촉산 관문 수비 철저!', '정예병 훈련 중!'], pts: [[0.20,0.54],[0.27,0.51],[0.29,0.54],[0.22,0.57]] },
      { role: 'farmer',   speed: 0.00015, lines: ['계단식 논에 황금 벼가 가득하오!', '풍년일세!'], pts: [[0.25,0.79],[0.33,0.83],[0.30,0.86],[0.22,0.82]] }
    ]
  };

  let currentNpcTheme = null;
  let townNpcs = [];

  function syncTownNpcsForTheme(theme) {
    if (currentNpcTheme === theme && townNpcs.length > 0) return;
    currentNpcTheme = theme;
    const routes = CITY_THEME_ROUTES[theme] || CITY_THEME_ROUTES.xinye;
    townNpcs = routes.map((r, idx) => ({
      ...r,
      id: idx,
      wp: idx % r.pts.length,
      x: r.pts[idx % r.pts.length][0],
      y: r.pts[idx % r.pts.length][1],
      facing: 1,
      pause: 15 + idx * 12,
      bubble: '',
      bubbleTimer: 0,
      screenX: 0,
      screenY: 0
    }));
  }

  function updateAndDrawTownNpcs(ctx, pt, scale) {
    // Realistic miniature diorama scale (small, proportional to buildings & plazas!)
    const npcScale = Math.max(0.65, Math.min(1.1, scale));
    townNpcs.forEach(npc => {
      if (npc.pause > 0) {
        npc.pause--;
      } else {
        const target = npc.pts[npc.wp];
        const dx = target[0] - npc.x;
        const dy = target[1] - npc.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.003) {
          npc.wp = (npc.wp + 1) % npc.pts.length;
          npc.pause = 45 + Math.floor(Math.random() * 65);
        } else {
          npc.x += (dx / dist) * npc.speed;
          npc.y += (dy / dist) * npc.speed;
          npc.facing = dx >= 0 ? 1 : -1;
        }
      }

      if (npc.bubbleTimer > 0) npc.bubbleTimer--;
      else if (Math.random() < 0.00045) {
        npc.bubble = npc.lines[Math.floor(Math.random() * npc.lines.length)];
        npc.bubbleTimer = 140;
      }

      const [sx, sy] = pt(npc.x, npc.y);
      npc.screenX = sx;
      npc.screenY = sy;

      const walking = npc.pause === 0;
      const bob = walking ? Math.abs(Math.sin(animTick * 0.16 + npc.id)) * 1.3 * npcScale : 0;

      // Crisp miniature ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
      ctx.beginPath();
      ctx.ellipse(sx, sy + 1 * npcScale, 4.8 * npcScale, 2.2 * npcScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Miniature 3D figurine sprite (17~20px proportional to diorama courtyards!)
      const spImg = npcSprites[npc.role];
      const spriteH = (npc.role === 'soldier' ? 21 : 18) * npcScale;
      if (spImg && spImg.complete && spImg.naturalWidth > 0) {
        const spriteW = spriteH * (spImg.naturalWidth / spImg.naturalHeight);
        const tilt = walking ? Math.sin(animTick * 0.16 + npc.id) * 0.035 : 0;
        const flipX = (npc.facing === (NPC_SPRITE_DEFAULT_DIR[npc.role] || 1)) ? 1 : -1;
        ctx.save();
        ctx.translate(sx, sy - bob);
        ctx.rotate(tilt);
        ctx.scale(flipX, 1);
        ctx.drawImage(spImg, -spriteW / 2, -spriteH + 2 * npcScale, spriteW, spriteH);
        ctx.restore();
      }

      // Speech bubble
      if (npc.bubbleTimer > 0 && npc.bubble) {
        ctx.save();
        ctx.font = 'bold 10.5px "Malgun Gothic", sans-serif';
        const tw = ctx.measureText(npc.bubble).width;
        const bw = tw + 12;
        const bh = 18;
        const bx = sx - bw / 2;
        const by = sy - 34 * npcScale - bob;
        ctx.globalAlpha = Math.min(1, npc.bubbleTimer / 25);
        ctx.fillStyle = 'rgba(13, 21, 39, 0.92)';
        ctx.strokeStyle = '#e5be67';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fef3c7';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(npc.bubble, sx, by + bh / 2 + 0.5);
        ctx.restore();
      }
    });
  }

  function resizeCanvases() {
    const vp = $('viewport');
    if (!vp) return;
    const w = vp.clientWidth;
    const h = vp.clientHeight;
    if (w <= 0 || h <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    ['cityCanvas', 'mapCanvas'].forEach(id => {
      const c = $(id);
      if (!c) return;
      c.width = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
      const ctx = c.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    });
  }

  function drawIsoTile(ctx, cx, cy, rx, ry, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - ry);
    ctx.lineTo(cx + rx, cy);
    ctx.lineTo(cx, cy + ry);
    ctx.lineTo(cx - rx, cy);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }

  function drawIsoBox(ctx, cx, cy, rx, ry, h, topCol, leftCol, rightCol) {
    // Left face
    ctx.beginPath();
    ctx.moveTo(cx - rx, cy);
    ctx.lineTo(cx, cy + ry);
    ctx.lineTo(cx, cy + ry - h);
    ctx.lineTo(cx - rx, cy - h);
    ctx.closePath();
    ctx.fillStyle = leftCol; ctx.fill();

    // Right face
    ctx.beginPath();
    ctx.moveTo(cx + rx, cy);
    ctx.lineTo(cx, cy + ry);
    ctx.lineTo(cx, cy + ry - h);
    ctx.lineTo(cx + rx, cy - h);
    ctx.closePath();
    ctx.fillStyle = rightCol; ctx.fill();

    // Top face
    drawIsoTile(ctx, cx, cy - h, rx, ry, topCol, 'rgba(0,0,0,0.2)');
  }

  function drawRoof(ctx, cx, cy, rx, ry, h, color) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - ry - h);
    ctx.lineTo(cx + rx * 1.15, cy);
    ctx.lineTo(cx, cy + ry * 1.15);
    ctx.lineTo(cx - rx * 1.15, cy);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawBadge(ctx, x, y, text, color, taskKey) {
    ctx.font = 'bold 11.5px "Malgun Gothic", sans-serif';
    const tw = ctx.measureText(text).width;
    const bw = tw + 16;
    const bh = 22;
    const bx = x - bw / 2;
    const by = y - bh / 2;

    ctx.fillStyle = 'rgba(11, 18, 34, 0.88)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 0.5);

    cityHitBoxes.push({ x: bx, y: by, w: bw, h: bh, taskKey });
  }

  function drawCityScene() {
    const canvas = $('cityCanvas');
    if (!canvas || state.mapMode || state.activeTab !== 'domestic') return;
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w <= 0 || h <= 0) return;

    const city = getCurrentCity();
    if (!city) return;
    const econ = calcMonthlyEconomy(city);
    cityHitBoxes = [];

    // Background fill
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#0d1729';
    ctx.fillRect(0, 0, w, h);

    // Draw Regional 3D Isometric City Diorama (unique per region + subtle per-city lighting!)
    const theme = CITY_THEME_MAP[city.id] || 'xinye';
    syncTownNpcsForTheme(theme);
    const cImg = cityThemeImgs[city.id] || cityThemeImgs[theme];

    let drawX = 0, drawY = 0, drawW = w, drawH = h;
    if (cImg && cImg.complete && cImg.naturalWidth > 0) {
      const imgRatio = cImg.naturalWidth / cImg.naturalHeight;
      const boxRatio = w / h;
      if (boxRatio > imgRatio) {
        drawW = w;
        drawH = w / imgRatio;
        drawX = 0;
        drawY = (h - drawH) * 0.5;
      } else {
        drawH = h;
        drawW = h * imgRatio;
        drawX = (w - drawW) * 0.5;
        drawY = 0;
      }
      ctx.drawImage(cImg, drawX, drawY, drawW, drawH);

      if (CITY_TINTS[city.id]) {
        ctx.fillStyle = CITY_TINTS[city.id];
        ctx.fillRect(0, 0, w, h);
      }

      const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.32, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
      vig.addColorStop(0, 'rgba(9, 14, 26, 0)');
      vig.addColorStop(1, 'rgba(9, 14, 26, 0.30)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    }

    // Helper to convert normalized diorama coordinates (0..1) into canvas pixels
    const pt = (nx, ny) => [drawX + nx * drawW, drawY + ny * drawH];

    // Live animated water shimmer on bottom-right river
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.6;
    const wave = (animTick * 0.5) % 18;
    for (let i = 0; i < 4; i++) {
      const [rx1, ry1] = pt(0.64 + i * 0.08, 0.90 - i * 0.07);
      ctx.beginPath();
      ctx.moveTo(rx1 - wave * 0.3, ry1);
      ctx.lineTo(rx1 + 12 - wave * 0.3, ry1 - 4);
      ctx.stroke();
    }
    ctx.restore();

    // Live moving 3D-shaded town NPCs (villagers, soldiers, merchants, farmers, travelers)
    updateAndDrawTownNpcs(ctx, pt, Math.min(w, h) / 420);

    // Live drifting cherry blossom petals over the 3D courtyard
    ctx.fillStyle = getSeasonInfo(state.month).particle;
    petals.forEach(p => {
      p.x = (p.x + p.vx) % 1;
      p.y = (p.y + p.vy) % 1;
      ctx.beginPath();
      ctx.ellipse(p.x * w, p.y * h, p.s, p.s * 0.58, animTick * 0.05, 0, Math.PI * 2);
      ctx.fill();
    });

    // Clickable Floating Building Badges aligned to this city theme's exact 3D landmarks
    const bPos = CITY_THEME_BADGES[theme] || CITY_THEME_BADGES.xinye;
    const [bx, by] = pt(bPos.bar[0], bPos.bar[1]);
    const [mx, my] = pt(bPos.mkt[0], bPos.mkt[1]);
    const [ox, oy] = pt(bPos.ord[0], bPos.ord[1]);
    const [fx, fy] = pt(bPos.farm[0], bPos.farm[1]);

    drawBadge(ctx, bx, by, `⚔️ 병영 Lv${econ.barLv}`, '#fb923c', 'train');
    drawBadge(ctx, mx, my, `🏪 시장 Lv${econ.mktLv}`, '#facc15', 'comm');
    drawBadge(ctx, ox, oy, `🛡️ 치안 ${city.order}`, '#38bdf8', 'order');
    drawBadge(ctx, fx, fy, `🌾 농장 Lv${econ.farmLv}`, '#4ade80', 'agri');
  }

  /* ================= STRATEGIC CHINA MAP RENDERER ================= */
  let mapCityNodes = [];

  const MAP_GEO_COORDS = {
    xinye:     [0.66, 0.49],
    jiangxia:  [0.73, 0.60],
    wan:       [0.62, 0.44],
    xuchang:   [0.70, 0.41],
    luoyang:   [0.63, 0.36],
    ye:        [0.69, 0.25],
    changan:   [0.53, 0.35],
    xiangyang: [0.61, 0.54],
    jiangling: [0.63, 0.63],
    chaisang:  [0.79, 0.66],
    jianye:    [0.86, 0.54],
    hanzhong:  [0.49, 0.47],
    chengdu:   [0.43, 0.62]
  };

  function drawWorldMap() {
    const canvas = $('mapCanvas');
    if (!canvas || !state.mapMode) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w <= 0 || h <= 0) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#09121e';
    ctx.fillRect(0, 0, w, h);

    // Cover-project the photorealistic 3D satellite relief map of China
    let dx = 0, dy = 0, dw = w, dh = h;
    if (worldMap3DLoaded && worldMap3DImg.naturalWidth > 0) {
      const ir = worldMap3DImg.naturalWidth / worldMap3DImg.naturalHeight;
      const br = w / h;
      if (br > ir) {
        dw = w; dh = w / ir; dx = 0; dy = (h - dh) * 0.5;
      } else {
        dh = h; dw = h * ir; dx = (w - dw) * 0.5; dy = 0;
      }
      ctx.drawImage(worldMap3DImg, dx, dy, dw, dh);

      // Subtle atmospheric vignette for strategy UI contrast
      const vig = ctx.createRadialGradient(w * 0.55, h * 0.5, Math.min(w, h) * 0.25, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
      vig.addColorStop(0, 'rgba(8, 14, 26, 0.04)');
      vig.addColorStop(1, 'rgba(6, 11, 22, 0.45)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    }

    const pt = (c) => {
      const g = MAP_GEO_COORDS[c.id] || [c.x, c.y];
      return [dx + g[0] * dw, dy + g[1] * dh];
    };

    // Draw strategic golden supply roads between connected cities
    const drawn = new Set();
    state.cities.forEach(c => {
      const [x1, y1] = pt(c);
      c.neighbors.forEach(nid => {
        const key = [c.id, nid].sort().join('-');
        if (drawn.has(key)) return;
        drawn.add(key);
        const n = getCity(nid);
        if (!n) return;
        const [x2, y2] = pt(n);
        ctx.strokeStyle = 'rgba(10, 14, 24, 0.65)';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

        ctx.strokeStyle = 'rgba(245, 210, 120, 0.78)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.setLineDash([]);
      });
    });

    // Draw 3D-styled Fortress City Markers with Territory Aura & Name Plates
    mapCityNodes = [];
    const pulse = 0.5 + 0.5 * Math.sin(animTick * 0.08);

    state.cities.forEach(c => {
      const [x, y] = pt(c);
      const fac = state.factions[c.faction];
      const isSelected = state.selectedMapCityId === c.id || (!state.selectedMapCityId && c.id === state.selectedCityId);
      const r = c.tier === '대성' ? 13 : c.tier === '중성' ? 11 : 9;

      // Territory glow ring
      const aura = ctx.createRadialGradient(x, y, r * 0.4, x, y, r + 18 + (isSelected ? pulse * 6 : 0));
      aura.addColorStop(0, fac.color + '66');
      aura.addColorStop(1, fac.color + '00');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(x, y, r + 18 + (isSelected ? pulse * 6 : 0), 0, Math.PI * 2);
      ctx.fill();

      // Faction base ring on terrain
      ctx.strokeStyle = isSelected ? '#ffffff' : fac.color;
      ctx.lineWidth = isSelected ? 2.8 : 2.0;
      ctx.beginPath();
      ctx.ellipse(x, y + 6, r + 5, (r + 5) * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 3D Miniature Fortress Castle Sprite
      const castSp = npcSprites.castle;
      const ch = c.tier === '대성' ? 42 : c.tier === '중성' ? 35 : 30;
      if (castSp && castSp.complete && castSp.naturalWidth > 0) {
        const cw = ch * (castSp.naturalWidth / castSp.naturalHeight);
        ctx.drawImage(castSp, x - cw / 2, y - ch + 11, cw, ch);
      }

      // Crisp Name + Troop Plate below/above fortress
      ctx.font = 'bold 11.5px "Malgun Gothic", sans-serif';
      const label = `${c.name} ${(c.troops / 1000).toFixed(1)}천`;
      const tw = ctx.measureText(label).width;
      const pw = tw + 12;
      const ph = 18;
      const px = x - pw / 2;
      const py = y - (c.tier === '대성' ? 32 : 26) - ph;

      ctx.fillStyle = 'rgba(9, 15, 28, 0.88)';
      ctx.strokeStyle = isSelected ? '#ffd97d' : fac.color;
      ctx.lineWidth = isSelected ? 1.6 : 1.2;
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, py + ph / 2 + 0.5);

      mapCityNodes.push({ id: c.id, x, y, r: r + 12 });
    });
  }

  function renderMapOverlayCard(cityId) {
    const card = $('mapCard');
    const c = getCity(cityId);
    if (!c) { card.classList.remove('show'); return; }
    const fac = state.factions[c.faction];
    const isMine = c.faction === state.playerFaction;
    const adjPlayerCity = state.cities.find(pc => pc.faction === state.playerFaction && pc.neighbors.includes(c.id));

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:15px;font-weight:800;color:var(--gold-bright);">🏯 ${c.name} <span style="font-size:11px;color:var(--text-sub);">${c.tier}</span></span>
        <span style="font-size:11px;font-weight:800;color:${fac.color};">${fac.name}</span>
      </div>
      <div style="font-size:11.5px;color:var(--text-sub);line-height:1.55;margin-bottom:8px;">
        병력: <b style="color:#fff;">${c.troops.toLocaleString()}명</b> · 장수 ${getCityOfficers(c.id).length}명<br>
        금: ${c.gold.toLocaleString()} · 군량: ${c.food.toLocaleString()}<br>
        농업 ${c.agri} · 상업 ${c.comm} · 치안 ${c.order}
      </div>
      <div style="display:flex;gap:6px;">
        ${isMine
          ? `<button class="btn-sm btn-success" id="btnMapEnter" style="flex:1;">도시 관리</button>`
          : adjPlayerCity
            ? `<button class="btn-sm btn-danger" id="btnMapAttack" style="flex:1;">${adjPlayerCity.name}에서 출진</button>`
            : `<span style="font-size:11px;color:var(--text-dim);">인접 아군 성이 없어 출진 불가</span>`}
      </div>
    `;
    card.classList.add('show');

    const enterBtn = $('btnMapEnter');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        state.selectedCityId = c.id;
        state.mapMode = false;
        state.activeTab = 'domestic';
        playSfx('click');
        renderAll();
      });
    }
    const atkBtn = $('btnMapAttack');
    if (atkBtn) {
      atkBtn.addEventListener('click', () => {
        if (state.factions[state.playerFaction].allies[c.faction]) {
          return showToast('동맹 세력은 공격할 수 없습니다.');
        }
        openMarchModal(adjPlayerCity.id, c.id);
      });
    }
  }

  /* ================= MAIN UI RENDER ================= */
  function renderAll() {
    const city = getCurrentCity();
    if (!city) return;
    const pCities = getPlayerCities();
    const cIdx = pCities.findIndex(c => c.id === city.id) + 1;
    const econ = calcMonthlyEconomy(city);
    const offs = getCityOfficers(city.id);
    const gov = offs[0];
    const idleOffs = getIdleOfficers(city);

    // Top bar
    $('topCityName').textContent = city.name;
    $('topCityIdx').textContent = `${cIdx}/${pCities.length}`;
    $('resGold').textContent = city.gold.toLocaleString();
    const dEl = $('resGoldDelta');
    dEl.textContent = (econ.goldNet >= 0 ? '+' : '') + econ.goldNet.toLocaleString();
    dEl.className = 'res-delta ' + (econ.goldNet >= 0 ? 'pos' : 'neg');

    $('resGov').textContent = gov ? gov.name : '없음';
    $('topGovAva').innerHTML = gov ? makePortraitSVG(gov) : '';
    $('resPop').textContent = city.pop.toLocaleString();
    $('resAgri').textContent = city.agri;
    $('resComm').textContent = city.comm;
    $('resOrder').textContent = city.order;
    $('resTroops').textContent = city.troops.toLocaleString();
    $('resFood').textContent = city.food.toLocaleString();
    const sInfo = getSeasonInfo(state.month);
    $('dateBadge').textContent = `${sInfo.icon} ${state.year}년 ${state.month}월`;
    $('dateBadge').title = `${sInfo.name}: ${sInfo.bonus}`;

    $('btnMapToggle').classList.toggle('active', state.mapMode);

    // Left Command Sidebar
    const asg = city.assignments || {};
    [
      ['agri', 'cmdAgri', 'subAgri'],
      ['comm', 'cmdComm', 'subComm'],
      ['order', 'cmdOrder', 'subOrder'],
      ['train', 'cmdTrain', 'subTrain'],
      ['recruit', 'cmdRecruit', 'subRecruit']
    ].forEach(([key, btnId, subId]) => {
      const oid = asg[key];
      const o = oid ? getOfficer(oid) : null;
      $(btnId).classList.toggle('assigned', !!o);
      $(subId).textContent = o ? `${o.name} 담당 중` : '맡은 장수 없음';
    });

    $('idleCountText').textContent = `쉬는 장수 ${idleOffs.length}명`;
    $('autoCount').textContent = idleOffs.length;
    $('idleAvatars').innerHTML = idleOffs.slice(0, 6).map(o =>
      `<div class="mini-ava" data-oid="${o.id}" title="${o.name} (통${o.ldr}/무${o.war}/지${o.int}/정${o.pol})">${makePortraitSVG(o)}</div>`
    ).join('') + (idleOffs.length > 6 ? `<span style="font-size:11px;color:var(--text-sub);margin-left:3px;">+${idleOffs.length - 6}</span>` : '');

    $('idleAvatars').querySelectorAll('.mini-ava').forEach(el => {
      el.addEventListener('click', () => openOfficerModal(el.dataset.oid));
    });

    $('subMerchant').textContent = `군량 시세 1:${state.foodRate}`;
    const salLabels = ['절약', '보통', '후함'];
    const salSubs = ['지출 절감 · 충성 주의', '장수 충성 유지', '매달 충성도 +2'];
    $('salaryTitle').textContent = `급여: ${salLabels[city.salary]}`;
    $('salarySub').textContent = salSubs[city.salary];

    // Right Sidebar — Advisor
    const advisor = offs.slice().sort((a, b) => b.int - a.int)[0];
    $('advisorTitle').textContent = advisor ? `📜 ${advisor.name} (지력 ${advisor.int})의 진언` : '📜 군사 조언';

    const enemyNeighbors = city.neighbors.map(id => getCity(id)).filter(n => n && n.faction !== state.playerFaction);
    const strongestEnemy = enemyNeighbors.sort((a, b) => b.troops - a.troops)[0];
    const freeHere = getFreeOfficers(city.id);
    let advice = '';
    if (freeHere.length > 0) {
      advice = `주공, ${city.name} 인근에 재야 명장 <b>${freeHere[0].name}</b>이(가) 은거 중이오! [인재] 탭에서 속히 등용하소서.`;
    } else if (strongestEnemy && strongestEnemy.troops > city.troops * 1.2) {
      advice = `${strongestEnemy.name}의 병력(약 ${(strongestEnemy.troops / 1000).toFixed(1)}천)이 ${city.name}(${(city.troops / 1000).toFixed(1)}천)보다 많소. 징병과 훈련을 서두르시옵소서.`;
    } else if (city.order < 65) {
      advice = `${city.name}의 치안이 ${city.order}으로 낮아 민심이 흉흉하오. 치안 순찰에 장수를 배치하소서.`;
    } else if (idleOffs.length > 0) {
      advice = `현재 쉬고 있는 장수가 ${idleOffs.length}명이오. 좌측 [추천 맡기기]로 내정을 극대화하고 턴을 넘기소서.`;
    } else {
      advice = `${city.name}의 내정이 순조롭소! 병력과 군량이 충분하다면 [군사] 탭이나 [지도]에서 인접 성을 공략해 보시옵소서.`;
    }
    $('advisorText').innerHTML = advice;
    checkQuestsAndAchievements();
    const qIdx = Math.min(state.questStep || 0, QUEST_LIST.length - 1);
    const curQ = QUEST_LIST[qIdx];
    if (curQ && $('questLabel')) {
      $('questLabel').textContent = `🎯 목표 ${qIdx + 1}: ${curQ.title}`;
      $('questReward').textContent = `보상: ${curQ.rewardTxt}`;
      $('questDesc').textContent = curQ.desc;
    }

    // Right Sidebar — City Info & Progress
    $('infoGoldInc').innerHTML = `${econ.goldNet >= 0 ? '+' : ''}${econ.goldNet.toLocaleString()} <span style="font-size:10px;color:var(--text-dim);">/월</span>`;
    $('infoGoldInc').className = 'info-cell-val ' + (econ.goldNet >= 0 ? 'pos' : 'neg');
    $('infoFoodInc').innerHTML = `${econ.foodNet >= 0 ? '+' : ''}${econ.foodNet.toLocaleString()} <span style="font-size:10px;color:var(--text-dim);">/월</span>`;
    $('infoFoodInc').className = 'info-cell-val ' + (econ.foodNet >= 0 ? 'pos' : 'neg');
    $('infoTroops').innerHTML = `${city.troops.toLocaleString()} <span style="font-size:10px;color:var(--amber);">훈련 ${city.train}%</span>`;
    $('infoFood').textContent = city.food.toLocaleString();
    $('infoPopText').textContent = `${city.pop.toLocaleString()} / ${Math.round(city.maxPop / 10000)}만`;
    $('barPop').style.width = `${Math.min(100, Math.round((city.pop / city.maxPop) * 100))}%`;
    const vAva = $('villagerNpcAva');
    if (vAva && !vAva.innerHTML) {
      vAva.innerHTML = `<img src="${NPC_ARCHETYPES.villager}" alt="백성" style="width:100%;height:100%;object-fit:cover;display:block;">`;
    }
    const vMood = $('villagerMoodText');
    if (vMood) {
      vMood.innerHTML = city.order >= 80
        ? '<b style="color:var(--green);">백성 민심 최상</b><br>"태수님 덕분에 살기 좋소!"'
        : city.order >= 60
          ? '<b style="color:var(--cyan);">백성 민심 안정</b><br>"평온한 나날이 이어집니다."'
          : '<b style="color:var(--red);">백성 민심 불안</b><br>"치안 순찰이 필요합니다!"';
    }

    $('lvFarm').textContent = `Lv${econ.farmLv}`;
    $('bonusFarm').textContent = `군량 +${(econ.farmLv - 1) * 5}%`;
    $('valFarm').textContent = `${city.agri}/100`;
    $('barFarm').style.width = `${city.agri}%`;

    $('lvMkt').textContent = `Lv${econ.mktLv}`;
    $('bonusMkt').textContent = `금 +${(econ.mktLv - 1) * 5}%`;
    $('valMkt').textContent = `${city.comm}/100`;
    $('barMkt').style.width = `${city.comm}%`;

    $('lvBar').textContent = `Lv${econ.barLv}`;
    $('bonusBar').textContent = `징병 +${(econ.barLv - 1) * 10}%`;
    $('valBar').textContent = `${city.barracks}/60`;
    $('barBar').style.width = `${Math.round((city.barracks / 60) * 100)}%`;

    $('valOrder').textContent = `${city.order}/100`;
    $('barOrder').style.width = `${city.order}%`;

    $('cityBannerText').textContent = `${city.name} · ${city.tier}`;

    // Center Views Visibility
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', !state.mapMode && b.dataset.tab === state.activeTab);
    });
    $('viewDomestic').style.display  = (!state.mapMode && state.activeTab === 'domestic') ? 'block' : 'none';
    $('viewMap').style.display       = state.mapMode ? 'block' : 'none';
    $('viewPersonnel').style.display = (!state.mapMode && state.activeTab === 'personnel') ? 'block' : 'none';
    $('viewDiplomacy').style.display = (!state.mapMode && state.activeTab === 'diplomacy') ? 'block' : 'none';
    $('viewMilitary').style.display  = (!state.mapMode && state.activeTab === 'military') ? 'block' : 'none';
    $('viewTech').style.display      = (!state.mapMode && state.activeTab === 'tech') ? 'block' : 'none';
    $('viewInfo').style.display      = (!state.mapMode && state.activeTab === 'info') ? 'block' : 'none';

    if (!state.mapMode) {
      if (state.activeTab === 'personnel') renderPersonnelTab();
      if (state.activeTab === 'diplomacy') renderDiplomacyTab();
      if (state.activeTab === 'military') renderMilitaryTab();
      if (state.activeTab === 'tech') renderTechTab();
      if (state.activeTab === 'info') renderInfoTab();
    } else {
      resizeCanvases();
      drawWorldMap();
      if (state.selectedMapCityId) renderMapOverlayCard(state.selectedMapCityId);
    }

    // Bottom Officer Strip
    $('officerStrip').innerHTML = offs.map(o => {
      const t = getOfficerAssignment(city, o.id);
      return `<div class="off-card ${t ? 'busy' : ''}" data-oid="${o.id}">
        <div class="off-ava">${makePortraitSVG(o)}</div>
        <div class="off-info">
          <span class="off-name">${o.name}</span>
          <span class="off-status">${t ? TASK_META[t].name : '쉬는 중'}</span>
        </div>
      </div>`;
    }).join('');

    $('officerStrip').querySelectorAll('.off-card').forEach(el => {
      el.addEventListener('click', () => openOfficerModal(el.dataset.oid));
    });

    // Bottom Log
    $('logBox').innerHTML = state.logs.slice(0, 12).map(l => {
      const cls = l.type === 'hist' ? 'tag-hist' : l.type === 'dom' ? 'tag-dom' : l.type === 'mil' ? 'tag-mil' : l.type === 'dip' ? 'tag-dip' : 'tag-per';
      return `<div class="log-line"><span class="${cls}">${l.text.split(' ')[0]}</span> ${l.text.slice(l.text.indexOf(' ') + 1)}</div>`;
    }).join('');
  }

  /* ================= MENU, GUIDE, EXPORT/IMPORT & TITLE SCREEN ================= */
  function openGuideModal() {
    playSfx('click');
    const html = `
      <div style="font-size:12.5px;line-height:1.65;color:#dbe7fa;">
        <p style="margin-bottom:8px;"><b style="color:var(--gold-bright);">1. 내정과 성장:</b> 좌측 <b>추천 맡기기</b> 또는 3D 성곽 위의 배지를 클릭해 장수를 배치한 뒤 <b>▶ 턴 종료</b>를 누르세요. 임무를 수행한 장수는 공적을 쌓아 레벨업합니다.</p>
        <p style="margin-bottom:8px;"><b style="color:var(--gold-bright);">2. 계절 전략:</b> 🌸봄(인구+30%), ☀️여름(화계 유리), 🍁가을(군량+40%), ❄️겨울(수성 방어+15%)에 맞춰 내정과 출진 시기를 조절하세요.</p>
        <p style="margin-bottom:8px;"><b style="color:var(--gold-bright);">3. 병종 상성과 전술 전투:</b> 출진 시 <b>기병 &gt; 궁병 &gt; 보병 &gt; 기병</b> 상성을 활용하고, 전투 중 <b>맹돌격·일제사격·화계·일기토·필살 전법</b>을 지휘해 13개 성을 모두 통일하세요.</p>
        <p><b style="color:var(--gold-bright);">4. 단축키:</b> PC에서는 <b>← / →</b>(성 전환), <b>Tab</b>(천하 지도)을 지원합니다.</p>
      </div>
    `;
    openModal('📖 삼국지: 천하쟁패 플레이 가이드', html);
  }

  function openSettingsModal() {
    playSfx('click');
    const html = `
      <p style="font-size:12px;color:var(--text-sub);margin-bottom:10px;">
        현재 난이도: <b style="color:var(--gold-bright);">${state.difficulty === 'easy' ? '쉬움' : state.difficulty === 'hard' ? '어려움' : '보통'}</b> · 매 턴 브라우저에 자동 저장됩니다.
      </p>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <button class="btn-gold" id="btnManualSave" style="padding:9px;">💾 지금 수동 저장</button>
        <button class="btn-sm" id="btnExportSave" style="padding:9px;">⬇️ 세이브 파일(.json) 백업 내보내기</button>
        <label class="btn-sm" style="padding:9px;text-align:center;cursor:pointer;display:block;">
          ⬆️ 세이브 파일(.json) 불러오기
          <input type="file" id="inpImportSave" accept=".json" style="display:none;">
        </label>
        <button class="btn-sm" id="btnGoTitle" style="padding:9px;">🏠 타이틀 화면 (다른 군주 / 난이도 선택)</button>
        <button class="btn-sm btn-danger" id="btnResetGame" style="padding:9px;">🔄 새 게임 처음부터 다시 시작</button>
      </div>
    `;
    openModal('⚙️ 게임 설정 & 저장 관리', html);
    $('btnManualSave').addEventListener('click', () => { saveState(false); closeModal(); });
    $('btnExportSave').addEventListener('click', () => {
      try {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `samgukji_${state.year}_${state.month}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('세이브 파일을 다운로드했습니다.');
      } catch (e) { showToast('내보내기에 실패했습니다.'); }
    });
    $('inpImportSave').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (parsed && parsed.cities && parsed.officers && parsed.factions) {
            state = parsed;
            saveState(true);
            closeModal();
            renderAll();
            showToast('세이브 파일을 성공적으로 불러왔습니다!');
          } else showToast('올바른 세이브 파일이 아닙니다.');
        } catch (err) { showToast('파일을 읽을 수 없습니다.'); }
      };
      reader.readAsText(file);
    });
    $('btnGoTitle').addEventListener('click', () => { closeModal(); openTitleScreen(); });
    $('btnResetGame').addEventListener('click', () => { closeModal(); resetGame(); });
  }

  let pickedStartFaction = 'liubei';
  let pickedDifficulty = 'normal';

  function openTitleScreen() {
    const playable = [
      { id: 'liubei',  name: '유비', sub: '촉한 · 신야/강하 (도전 ★★★)', desc: '관우·장비·조운·제갈량과 함께 한실 부흥', img: PORTRAIT_IMAGES.liubei },
      { id: 'cao',     name: '조조', sub: '위 · 허창/낙양 등 5성 (입문 ★☆☆)', desc: '압도적 국력과 맹장들로 빠른 중원 평정', img: PORTRAIT_IMAGES.caocao },
      { id: 'sun',     name: '손권', sub: '오 · 건업/시상 (표준 ★★☆)', desc: '주유·감녕·노숙과 강동의 패권 장악', img: PORTRAIT_IMAGES.sunquan },
      { id: 'liubiao', name: '유표', sub: '형주 · 양양/강릉 (표준 ★★☆)', desc: '풍요로운 형주 요충지에서 천하를 도모', img: PORTRAIT_IMAGES.liubiao }
    ];
    $('factionPickGrid').innerHTML = playable.map(p => `
      <div class="faction-pick-card ${p.id === pickedStartFaction ? 'selected' : ''}" data-fid="${p.id}">
        <div class="off-ava" style="width:52px;height:52px;"><img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;"></div>
        <div style="min-width:0;">
          <div style="font-weight:800;font-size:14px;color:var(--gold-bright);">${p.name}</div>
          <div style="font-size:11px;color:var(--cyan);">${p.sub}</div>
          <div style="font-size:10.5px;color:var(--text-sub);margin-top:2px;">${p.desc}</div>
        </div>
      </div>
    `).join('');

    $('factionPickGrid').querySelectorAll('.faction-pick-card').forEach(el => {
      el.addEventListener('click', () => {
        pickedStartFaction = el.dataset.fid;
        playSfx('click');
        openTitleScreen();
      });
    });

    const saved = loadState();
    const contBtn = $('btnContinueGame');
    if (saved) {
      const fName = saved.factions[saved.playerFaction] ? saved.factions[saved.playerFaction].name : '유비군';
      contBtn.style.display = 'inline-block';
      contBtn.textContent = `📂 이어하기 (${fName} · ${saved.year}년 ${saved.month}월)`;
    } else {
      contBtn.style.display = 'none';
    }
    $('titleOverlay').classList.remove('hidden');
  }

  function resetGame() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    state = createInitialState();
    playSfx('fanfare');
    showToast('새 게임이 시작되었습니다!');
    renderAll();
  }

  function switchCity(dir) {
    const pcs = getPlayerCities();
    if (pcs.length <= 1) return;
    const idx = pcs.findIndex(c => c.id === state.selectedCityId);
    const next = pcs[(idx + dir + pcs.length) % pcs.length];
    state.selectedCityId = next.id;
    playSfx('click');
    renderAll();
  }

  /* ================= EVENT BINDINGS & LOOP ================= */
  let rafId = null;
  function animLoop() {
    animTick++;
    if (activeBattle) {
      drawBattleCanvas();
    } else if (state.mapMode) {
      drawWorldMap();
    } else if (state.activeTab === 'domestic') {
      drawCityScene();
    }
    rafId = requestAnimationFrame(animLoop);
  }

  window.addEventListener('load', () => {
    resizeCanvases();
    renderAll();
    openTitleScreen();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(animLoop);
  });

  document.querySelectorAll('#diffRow .diff-btn').forEach(b => {
    b.addEventListener('click', () => {
      pickedDifficulty = b.dataset.diff;
      document.querySelectorAll('#diffRow .diff-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      playSfx('click');
    });
  });

  $('btnStartNewGame').addEventListener('click', () => {
    state = createInitialState(pickedStartFaction, pickedDifficulty);
    saveState(true);
    $('titleOverlay').classList.add('hidden');
    playSfx('fanfare');
    resizeCanvases();
    renderAll();
    showToast(`${state.factions[state.playerFaction].name}으로 천하통일을 시작합니다!`);
  });

  $('btnContinueGame').addEventListener('click', () => {
    const saved = loadState();
    if (saved) state = saved;
    $('titleOverlay').classList.add('hidden');
    playSfx('assign');
    resizeCanvases();
    renderAll();
  });

  $('btnBgm').addEventListener('click', () => {
    bgmEnabled = !bgmEnabled;
    $('btnBgm').style.color = bgmEnabled ? 'var(--gold-bright)' : 'var(--text-sub)';
    if (bgmEnabled) { startBgm(); showToast('🎵 동양풍 배경음악 켜짐'); }
    else { stopBgm(); showToast('🎵 배경음악 꺼짐'); }
  });

  $('btnGuide').addEventListener('click', openGuideModal);
  $('btnAch').addEventListener('click', openAchievementsModal);

  window.addEventListener('resize', () => {
    resizeCanvases();
    drawCityScene();
    drawWorldMap();
  });

  // Top & Left buttons
  $('btnPrevCity').addEventListener('click', () => switchCity(-1));
  $('btnNextCity').addEventListener('click', () => switchCity(1));
  $('btnMapToggle').addEventListener('click', () => {
    state.mapMode = !state.mapMode;
    playSfx('click');
    renderAll();
  });
  $('btnSound').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    $('btnSound').textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled) playSfx('click');
  });
  $('btnMenu').addEventListener('click', openSettingsModal);

  $('cmdAgri').addEventListener('click', () => openAssignModal('agri'));
  $('cmdComm').addEventListener('click', () => openAssignModal('comm'));
  $('cmdOrder').addEventListener('click', () => openAssignModal('order'));
  $('cmdTrain').addEventListener('click', () => openAssignModal('train'));
  $('cmdRecruit').addEventListener('click', () => openAssignModal('recruit'));
  $('cmdMerchant').addEventListener('click', openMerchantModal);
  $('cmdSalary').addEventListener('click', cycleSalary);
  $('btnAutoAssign').addEventListener('click', autoAssignAll);
  $('btnEndTurn').addEventListener('click', endTurn);

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => {
      state.mapMode = false;
      state.activeTab = b.dataset.tab;
      playSfx('click');
      renderAll();
    });
  });

  // Officer strip scroll
  $('btnStripLeft').addEventListener('click', () => { $('officerStrip').scrollLeft -= 180; });
  $('btnStripRight').addEventListener('click', () => { $('officerStrip').scrollLeft += 180; });

  // Modal close
  $('modalClose').addEventListener('click', () => { if (!activeBattle) closeModal(); });
  $('modalBackdrop').addEventListener('click', (e) => {
    if (e.target === $('modalBackdrop') && !activeBattle) closeModal();
  });

  // Mobile panel switcher (Commands vs Info/Advisor)
  let mobileActivePanel = 'commands';
  function applyMobilePanel() {
    const left = document.querySelector('.left-panel');
    const right = document.querySelector('.right-panel');
    if (!left || !right) return;
    left.classList.toggle('mobile-hidden', mobileActivePanel !== 'commands');
    right.classList.toggle('mobile-hidden', mobileActivePanel !== 'info');
    document.querySelectorAll('.m-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mpanel === mobileActivePanel);
    });
  }
  document.querySelectorAll('.m-tab-btn').forEach(b => {
    b.addEventListener('click', () => {
      mobileActivePanel = b.dataset.mpanel;
      playSfx('click');
      applyMobilePanel();
    });
  });
  applyMobilePanel();

  window.addEventListener('orientationchange', () => {
    setTimeout(() => { resizeCanvases(); drawCityScene(); drawWorldMap(); }, 180);
  });

  // Canvas interactions (with touch-friendly expanded hit padding for mobile)
  $('cityCanvas').addEventListener('click', (e) => {
    const rect = $('cityCanvas').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pad = window.innerWidth <= 820 ? 12 : 4;
    const hit = cityHitBoxes.find(b => x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - pad && y <= b.y + b.h + pad);
    if (hit) {
      openAssignModal(hit.taskKey);
      return;
    }
    const npcHit = townNpcs.find(n => Math.hypot(x - n.screenX, y - (n.screenY - 5)) <= 16 + pad);
    if (npcHit) {
      npcHit.bubble = npcHit.lines[Math.floor(Math.random() * npcHit.lines.length)];
      npcHit.bubbleTimer = 180;
      npcHit.pause = 60;
      playSfx('click');
    }
  });

  $('mapCanvas').addEventListener('click', (e) => {
    const rect = $('mapCanvas').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pad = window.innerWidth <= 820 ? 12 : 4;
    const hit = mapCityNodes.find(n => Math.hypot(x - n.x, y - n.y) <= n.r + pad);
    if (hit) {
      state.selectedMapCityId = hit.id;
      playSfx('click');
      drawWorldMap();
      renderMapOverlayCard(hit.id);
    } else {
      state.selectedMapCityId = null;
      $('mapCard').classList.remove('show');
      drawWorldMap();
    }
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if ($('modalBackdrop').classList.contains('open')) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      state.mapMode = !state.mapMode;
      playSfx('click');
      renderAll();
    } else if (e.key === 'ArrowLeft') {
      switchCity(-1);
    } else if (e.key === 'ArrowRight') {
      switchCity(1);
    }
  });
})();
