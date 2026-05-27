const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const ui = {
  stickerCount: document.getElementById("stickerCount"),
  sceneToast: document.getElementById("sceneToast"),
  sceneButtons: document.getElementById("sceneButtons"),
  memoryText: document.getElementById("memoryText"),
  playerName: document.getElementById("playerName"),
  joinButton: document.getElementById("joinButton"),
  onlineCount: document.getElementById("onlineCount"),
  connectionState: document.getElementById("connectionState"),
  chatInput: document.getElementById("chatInput"),
  sendButton: document.getElementById("sendButton"),
  hairButtons: document.getElementById("hairButtons"),
  topButtons: document.getElementById("topButtons"),
  bottomButtons: document.getElementById("bottomButtons"),
  accessoryButtons: document.getElementById("accessoryButtons")
};

const audioPanel = document.createElement("section");
audioPanel.className = "audio-panel";
audioPanel.innerHTML = `
  <h2>声音</h2>
  <div class="audio-row">
    <button id="audioButton" type="button">开启</button>
    <input id="volumeSlider" type="range" min="0" max="100" value="45" aria-label="音量" />
  </div>
  <div id="audioHint" class="audio-hint">开启后，每个场景会有自己的 BGM，互动和换装会有音效。</div>
`;
document.querySelector(".control-panel").insertBefore(audioPanel, document.querySelector(".chat-panel"));
ui.audioButton = document.getElementById("audioButton");
ui.volumeSlider = document.getElementById("volumeSlider");
ui.audioHint = document.getElementById("audioHint");

function createPlayerId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const playerId = sessionStorage.getItem("blingeePlayerId") || createPlayerId();
sessionStorage.setItem("blingeePlayerId", playerId);

const scenes = [
  {
    id: "lakeNight",
    name: "星河湖边",
    note: "长椅、路灯、城市剪影",
    bg: "9146d2a65b762451054f1782e434097b.jpg",
    palette: ["#1f49d8", "#42c8ff", "#ffd447", "#0a1338"],
    memory: "你站在湖边草地上。对岸的房子亮着小小的窗，像每个人都拥有一格自己的理想生活。",
    next: "pianoBar",
    spawn: { x: 480, y: 440 },
    fragments: [{ x: 160, y: 470, icon: "✦" }, { x: 520, y: 412, icon: "♥" }, { x: 760, y: 475, icon: "★" }],
    hotspots: [
      { x: 255, y: 395, w: 150, h: 66, label: "湖边长椅", text: "木头长椅微微发热，像刚有人坐在这里等晚风。" },
      { x: 705, y: 340, w: 54, h: 145, label: "老路灯", text: "路灯亮起来，水面上的城市倒影也跟着闪了一次。" }
    ]
  },
  {
    id: "pianoBar",
    name: "夜景钢琴吧",
    note: "落地窗、舞台、酒柜",
    bg: "652ee6d03b6bd9d2ae22209e72dfb88b.jpg",
    palette: ["#8b3e2f", "#ffd07a", "#42c8ff", "#171126"],
    memory: "落地窗外是千禧年的城市夜景。钢琴没有自动演奏，但你靠近时，整间屋子都会变亮。",
    next: "sakuraLake",
    spawn: { x: 500, y: 430 },
    fragments: [{ x: 205, y: 210, icon: "◆" }, { x: 455, y: 365, icon: "♪" }, { x: 760, y: 344, icon: "✦" }],
    hotspots: [
      { x: 292, y: 282, w: 230, h: 130, label: "三角钢琴", text: "钢琴弹出一段没有歌词的前奏，像某个空间主页的背景音乐。" },
      { x: 690, y: 330, w: 120, h: 92, label: "窗边圆桌", text: "圆桌上有一盏小火，适合坐下来说一些不急着实现的愿望。" }
    ]
  },
  {
    id: "sakuraLake",
    name: "樱花湖畔",
    note: "粉色树、白栅栏、湖边小屋",
    bg: "1ae729b50ffeff163d8c03fc21563cb1.jpg",
    palette: ["#ff9bd2", "#a8f7ff", "#f9ff8a", "#5abf67"],
    memory: "樱花亮得有点不真实。你走过的地方会留下小小闪点，像图片终于被允许发生了时间。",
    next: "poolHome",
    spawn: { x: 450, y: 440 },
    fragments: [{ x: 135, y: 308, icon: "✿" }, { x: 430, y: 474, icon: "♡" }, { x: 805, y: 265, icon: "✦" }],
    hotspots: [
      { x: 180, y: 322, w: 165, h: 92, label: "樱花长椅", text: "长椅上放着一本摊开的日记，第一页写着：先拥有一个可以发呆的地方。" },
      { x: 712, y: 170, w: 112, h: 82, label: "湖边小屋", text: "小屋窗户反光，里面也许有厨房、床、猫和没有被催促的上午。" }
    ]
  },
  {
    id: "poolHome",
    name: "泳池厨房",
    note: "蓝色橱柜、泳池、早餐",
    bg: "08b4591f8e5cb8d5faec750020e7a1e3.jpg",
    palette: ["#20bdf4", "#ffffff", "#ff80c8", "#ffe86b"],
    memory: "这里把厨房和泳池放在一起，像小时候游戏里的豪宅：不合理，但非常快乐。",
    next: "cityRoad",
    spawn: { x: 520, y: 430 },
    fragments: [{ x: 178, y: 398, icon: "♡" }, { x: 455, y: 338, icon: "✚" }, { x: 760, y: 210, icon: "✿" }],
    hotspots: [
      { x: 360, y: 310, w: 270, h: 104, label: "蓝色厨房", text: "锅里冒出像素蒸汽。早餐还没做好，但整个房间已经开始度假。" },
      { x: 45, y: 110, w: 280, h: 292, label: "室内泳池", text: "水面闪了一下，反射出一串透明爱心。" }
    ]
  },
  {
    id: "cityRoad",
    name: "霓虹桥边",
    note: "城市、弯路、水面反光",
    bg: "3e55bda70492fdb9cf76d34b0b791bea.jpg",
    palette: ["#092b68", "#e7404c", "#ffd447", "#50f0ff"],
    memory: "桥、月亮、红色路面和水面反光。这不是通勤路，更像通往另一个相册的入口。",
    next: "pinkRoom",
    spawn: { x: 360, y: 470 },
    fragments: [{ x: 155, y: 430, icon: "✦" }, { x: 555, y: 360, icon: "★" }, { x: 805, y: 245, icon: "♥" }],
    hotspots: [
      { x: 90, y: 405, w: 250, h: 92, label: "红色弯路", text: "道路没有尽头，只会慢慢转向更亮的地方。" },
      { x: 735, y: 180, w: 120, h: 92, label: "月亮", text: "月亮很大，像老网页里的装饰图标，却真的照着你。" }
    ]
  },
  {
    id: "pinkRoom",
    name: "粉色钢琴房",
    note: "帷幔、沙发、白钢琴",
    bg: "9342fded92b465f6ab098c8903254faa.jpg",
    palette: ["#ff73c9", "#ffffff", "#ffd1f0", "#8d2a64"],
    memory: "粉色房间过于甜，但正因为过于甜，才像一个被允许不实用的愿望。",
    next: "danceClub",
    spawn: { x: 500, y: 430 },
    fragments: [{ x: 190, y: 430, icon: "♥" }, { x: 532, y: 365, icon: "♪" }, { x: 760, y: 235, icon: "✦" }],
    hotspots: [
      { x: 530, y: 286, w: 190, h: 125, label: "白钢琴", text: "白钢琴响起一小段旋律，粉色帷幔像水波一样晃动。" },
      { x: 125, y: 315, w: 265, h: 118, label: "心形沙发", text: "沙发上有一颗发光抱枕，按下去会弹出一行：今天可以慢一点。" }
    ]
  },
  {
    id: "danceClub",
    name: "千禧舞厅",
    note: "棋盘地、DJ台、霓虹墙",
    bg: "5eda06b930ed820d7c535ca94c9e7c27.jpg",
    palette: ["#ff48c7", "#4ad8ff", "#ffffff", "#1f1634"],
    memory: "灯球在头顶旋转，墙上的 LET'S PARTY 像 2008 年空间皮肤里最勇敢的一行字。",
    next: "villageStreet",
    spawn: { x: 380, y: 450 },
    fragments: [{ x: 215, y: 345, icon: "✦" }, { x: 560, y: 260, icon: "◆" }, { x: 780, y: 410, icon: "♪" }],
    hotspots: [
      { x: 555, y: 172, w: 260, h: 132, label: "DJ台", text: "DJ台亮起，低音像粉蓝色方块一样从地板弹出来。" },
      { x: 220, y: 360, w: 520, h: 150, label: "棋盘舞池", text: "每走一步，黑白格都会亮一格，像脚下有自己的节拍。" }
    ]
  },
  {
    id: "villageStreet",
    name: "彩虹小镇",
    note: "教堂、树屋、彩虹路",
    bg: "e59672bc971d25f0abef9057f404bc7f.jpg",
    palette: ["#52d5ff", "#8be35a", "#ff7bbf", "#ffd447"],
    memory: "彩虹架在小镇路口。这里不像现实里的目的地，更像所有网页素材共同相信过的生活。",
    next: "lakeNight",
    spawn: { x: 470, y: 455 },
    fragments: [{ x: 120, y: 410, icon: "✿" }, { x: 520, y: 358, icon: "★" }, { x: 790, y: 400, icon: "♡" }],
    hotspots: [
      { x: 48, y: 245, w: 160, h: 170, label: "小教堂", text: "钟楼没有报时，只会提醒你：别急着从这里离开。" },
      { x: 430, y: 260, w: 120, h: 90, label: "彩虹", text: "彩虹尽头不是宝藏，是一台可以反复打开的旧电脑。" }
    ]
  }
];

const closet = {
  hair: [
    { id: "blonde", label: "金发", color: "#ffd771", bang: "#ffe7a2" },
    { id: "brown", label: "茶发", color: "#9a5b34", bang: "#c78352" },
    { id: "pink", label: "粉发", color: "#ff79c8", bang: "#ffc1e9" },
    { id: "black", label: "黑发", color: "#16131f", bang: "#3d314d" }
  ],
  top: [
    { id: "idol", label: "偶像装", color: "#ff5fb8", trim: "#ffffff" },
    { id: "rock", label: "摇滚外套", color: "#c95a2d", trim: "#17223f" },
    { id: "coat", label: "长风衣", color: "#f6e36b", trim: "#2bb6d7" },
    { id: "school", label: "学院衫", color: "#d7b88a", trim: "#ffffff" }
  ],
  bottom: [
    { id: "skirt", label: "百褶裙", color: "#ff9bd2" },
    { id: "denim", label: "牛仔裙", color: "#2589c8" },
    { id: "shorts", label: "短裤", color: "#1b1b28" },
    { id: "white", label: "白裙", color: "#ffffff" }
  ],
  accessory: [
    { id: "wings", label: "天使翼" },
    { id: "hat", label: "鼓手帽" },
    { id: "flower", label: "花环" },
    { id: "none", label: "无" }
  ]
};

const defaultLook = { hair: "blonde", top: "idol", bottom: "skirt", accessory: "wings" };
const sceneMusic = {
  lakeNight: { tempo: 980, wave: "sine", bass: "C3", notes: ["E4", "G4", "B4", "G4", "D4", "G4", "A4", "G4"] },
  pianoBar: { tempo: 720, wave: "triangle", bass: "A2", notes: ["A3", "C4", "E4", "G4", "E4", "C4", "B3", "E4"] },
  sakuraLake: { tempo: 860, wave: "sine", bass: "F3", notes: ["A4", "G4", "E4", "C4", "D4", "E4", "G4", "A4"] },
  poolHome: { tempo: 640, wave: "square", bass: "D3", notes: ["D4", "F4", "A4", "C5", "A4", "F4", "E4", "A4"] },
  cityRoad: { tempo: 760, wave: "sawtooth", bass: "G2", notes: ["G3", "D4", "F4", "A4", "F4", "D4", "C4", "D4"] },
  pinkRoom: { tempo: 900, wave: "triangle", bass: "Bb2", notes: ["D4", "F4", "Bb4", "A4", "F4", "D4", "C4", "F4"] },
  danceClub: { tempo: 420, wave: "square", bass: "E2", notes: ["E4", "E4", "G4", "B4", "D5", "B4", "G4", "E4"] },
  villageStreet: { tempo: 700, wave: "triangle", bass: "C3", notes: ["C4", "E4", "G4", "C5", "B4", "G4", "E4", "D4"] }
};
const noteFrequency = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98, A2: 110, Bb2: 116.54, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196, A3: 220, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33
};
const localRoomKey = "blingeePixelRoom899";
const collectedKey = "blingeeCollected899";
const nameKey = "blingeePlayerName899";
const lookKey = "blingeePlayerLook899";

const images = {};
const keys = new Set();
let sceneIndex = 0;
let tick = 0;
let messageTimer = 0;
let socket = null;
let connected = false;
let localChannel = "BroadcastChannel" in window ? new BroadcastChannel("blingee-pixel-room-899") : null;
let otherPlayers = new Map();
let bubbles = [];
let sparkles = [];
let collected = new Set(JSON.parse(localStorage.getItem(collectedKey) || "[]"));
let playerName = localStorage.getItem(nameKey) || "游客";
let playerLook = { ...defaultLook, ...JSON.parse(localStorage.getItem(lookKey) || "{}") };
let player = { x: 480, y: 440, facing: 1 };
let audioContext = null;
let masterGain = null;
let musicTimer = null;
let musicStep = 0;
let audioEnabled = false;

ui.playerName.value = playerName === "游客" ? "" : playerName;

function currentScene() {
  return scenes[sceneIndex];
}

function optionBy(type, id) {
  return closet[type].find((item) => item.id === id) || closet[type][0];
}

function loadImages() {
  scenes.forEach((scene) => {
    const img = new Image();
    img.src = scene.bg;
    images[scene.bg] = img;
  });
  const ref = new Image();
  ref.src = "04dfb06830873a21f6daf971ffd28f0e.jpg";
  images.characterReference = ref;
}

function showToast(text) {
  ui.sceneToast.textContent = text;
  messageTimer = 280;
}

function ensureAudio() {
  if (audioContext) return true;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    ui.audioHint.textContent = "这个浏览器暂时不支持网页音频。";
    return false;
  }
  audioContext = new AudioCtor();
  masterGain = audioContext.createGain();
  masterGain.gain.value = Number(ui.volumeSlider.value) / 100;
  masterGain.connect(audioContext.destination);
  return true;
}

function startAudio() {
  if (!ensureAudio()) return;
  audioContext.resume();
  audioEnabled = true;
  ui.audioButton.textContent = "关闭";
  ui.audioHint.textContent = `正在播放：${currentScene().name}`;
  startSceneMusic();
}

function stopAudio() {
  audioEnabled = false;
  ui.audioButton.textContent = "开启";
  ui.audioHint.textContent = "声音已关闭。";
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
}

function toggleAudio() {
  if (audioEnabled) stopAudio();
  else startAudio();
}

function startSceneMusic() {
  if (!audioEnabled || !audioContext || !masterGain) return;
  if (musicTimer) clearInterval(musicTimer);
  musicStep = 0;
  const music = sceneMusic[currentScene().id];
  ui.audioHint.textContent = `正在播放：${currentScene().name}`;
  musicTimer = setInterval(() => {
    playNote(music.notes[musicStep % music.notes.length], 0.12, music.wave, 0.055);
    if (musicStep % 4 === 0) playNote(music.bass, 0.2, "sine", 0.04);
    if (currentScene().id === "danceClub" && musicStep % 2 === 0) playNoise(0.035, 0.018);
    musicStep += 1;
  }, music.tempo);
}

function playNote(note, duration = 0.12, type = "sine", volume = 0.05, bend = 1) {
  if (!audioEnabled || !audioContext || !masterGain) return;
  const freq = noteFrequency[note] || note;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (bend !== 1) osc.frequency.exponentialRampToValueAtTime(freq * bend, now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + duration + 0.03);
}

function playNoise(duration = 0.05, volume = 0.03) {
  if (!audioEnabled || !audioContext || !masterGain) return;
  const buffer = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * duration), audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  gain.gain.value = volume;
  source.buffer = buffer;
  source.connect(gain);
  gain.connect(masterGain);
  source.start();
}

function playSfx(name) {
  if (!audioEnabled) return;
  if (name === "collect") {
    playNote("C5", 0.08, "square", 0.08);
    setTimeout(() => playNote("G4", 0.09, "square", 0.07), 80);
  }
  if (name === "interact") {
    playNote("A4", 0.08, "triangle", 0.07);
    setTimeout(() => playNote("D5", 0.12, "triangle", 0.06), 70);
  }
  if (name === "portal") {
    playNote("C4", 0.18, "sawtooth", 0.06, 1.8);
  }
  if (name === "chat") {
    playNote("E4", 0.07, "sine", 0.06);
    setTimeout(() => playNote("G4", 0.07, "sine", 0.05), 55);
  }
  if (name === "dress") {
    playNote("B4", 0.06, "triangle", 0.07);
    setTimeout(() => playNote("D5", 0.08, "triangle", 0.06), 55);
  }
}

function send(message) {
  if (connected && socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    localChannel?.postMessage(message);
    const room = JSON.parse(localStorage.getItem(localRoomKey) || "{}");
    if (message.type === "state") room[playerId] = message.player;
    if (message.type === "leave") delete room[playerId];
    localStorage.setItem(localRoomKey, JSON.stringify(room));
  }
}

function connectMultiplayer() {
  if (location.protocol === "file:") {
    ui.connectionState.textContent = "本地模式";
    showToast("现在是本地模式。启动 multiplayer server 后，用网页地址进入就是真多人。");
    return;
  }

  const configuredURL = window.BLINGEE_PIXEL_CONFIG?.wsUrl?.trim();
  const wsURL = configuredURL || `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}`;
  socket = new WebSocket(wsURL);
  socket.addEventListener("open", () => {
    connected = true;
    ui.connectionState.textContent = "实时房间";
    showToast("已进入实时多人房间。");
    publishState("加入房间");
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    receive(message);
  });
  socket.addEventListener("close", () => {
    connected = false;
    ui.connectionState.textContent = "本地模式";
    setTimeout(connectMultiplayer, 1200);
  });
}

function receive(message) {
  if (!message || message.id === playerId) return;
  if (message.type === "snapshot") {
    Object.values(message.players).forEach((remote) => {
      if (remote.id !== playerId) otherPlayers.set(remote.id, remote);
    });
  }
  if (message.type === "state") {
    otherPlayers.set(message.player.id, message.player);
    if (message.status) showToast(`${message.player.name} ${message.status}`);
  }
  if (message.type === "chat") {
    otherPlayers.set(message.player.id, message.player);
    addBubble(message.player.id, message.text);
    showToast(`${message.player.name}：${message.text}`);
  }
  if (message.type === "leave") {
    otherPlayers.delete(message.id);
  }
  updateOnlineCount();
}

function publishState(status = "") {
  send({
    type: "state",
    id: playerId,
    status,
    player: serializePlayer()
  });
  updateOnlineCount();
}

function serializePlayer() {
  return {
    id: playerId,
    name: playerName,
    sceneId: currentScene().id,
    x: Math.round(player.x),
    y: Math.round(player.y),
    facing: player.facing,
    look: playerLook,
    time: Date.now()
  };
}

function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawText(text, x, y, size = 16, color = "#fff", align = "left") {
  ctx.save();
  ctx.font = `900 ${size}px "Trebuchet MS", "Microsoft YaHei", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.lineWidth = Math.max(3, Math.floor(size / 4));
  ctx.strokeStyle = "#241c46";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawScene(scene) {
  const bg = images[scene.bg];
  drawPixelRect(0, 0, canvas.width, canvas.height, scene.palette[3]);
  if (bg?.complete && bg.naturalWidth) {
    const sx = Math.round(bg.naturalWidth * 0.02);
    const sy = Math.round(bg.naturalHeight * 0.33);
    const sw = Math.round(bg.naturalWidth * 0.86);
    const sh = Math.round(bg.naturalHeight * 0.26);
    ctx.drawImage(bg, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.12;
    drawPixelRect(0, 0, canvas.width, canvas.height, scene.palette[0]);
    ctx.globalAlpha = 1;
  }

  for (let i = 0; i < 92; i++) {
    const x = (i * 71 + tick * 0.2) % 980;
    const y = (i * 43) % 420;
    const size = i % 9 === 0 ? 4 : 2;
    drawPixelRect(x, y, size, size, i % 6 === 0 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)");
  }

  ctx.globalAlpha = 0.18;
  for (let y = 0; y < canvas.height; y += 5) drawPixelRect(0, y, canvas.width, 1, y % 10 === 0 ? "#fff" : "#000");
  ctx.globalAlpha = 1;
}

function drawPortal(scene) {
  ctx.save();
  ctx.translate(885, 438);
  ctx.rotate(Math.sin(tick / 28) * 0.08);
  ctx.globalAlpha = 0.78;
  drawPixelRect(-28, -66, 56, 120, scene.palette[2]);
  drawPixelRect(-16, -48, 32, 84, "#ffffff");
  ctx.globalAlpha = 1;
  drawText("NEXT", -38, -82, 15, "#ffffff");
  ctx.restore();
}

function drawHotspots(scene) {
  scene.hotspots.forEach((spot) => {
    const near = isNearRect(spot, 46);
    ctx.strokeStyle = near ? "#ffd447" : "rgba(255,255,255,0.55)";
    ctx.lineWidth = near ? 5 : 3;
    ctx.setLineDash([8, 7]);
    ctx.strokeRect(spot.x, spot.y, spot.w, spot.h);
    ctx.setLineDash([]);
    if (near) drawText("E", spot.x + spot.w / 2, spot.y - 20 + Math.sin(tick / 8) * 3, 18, "#ffd447", "center");
  });
}

function drawFragments(scene) {
  scene.fragments.forEach((fragment, index) => {
    if (collected.has(`${scene.id}:${index}`)) return;
    ctx.save();
    ctx.translate(fragment.x, fragment.y + Math.sin(tick / 13 + index) * 6);
    ctx.rotate(Math.sin(tick / 22 + index) * 0.18);
    drawText(fragment.icon, -12, 0, 28, scene.palette[index % scene.palette.length]);
    ctx.restore();
  });
}

function drawCharacter(body, options = {}) {
  const look = { ...defaultLook, ...(body.look || {}) };
  const hair = optionBy("hair", look.hair);
  const top = optionBy("top", look.top);
  const bottom = optionBy("bottom", look.bottom);
  const alpha = options.alpha ?? 1;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(body.x, body.y);
  ctx.scale(body.facing || 1, 1);

  if (look.accessory === "wings") {
    drawPixelRect(-44, -38, 26, 52, "rgba(255,255,255,0.82)");
    drawPixelRect(18, -38, 26, 52, "rgba(255,255,255,0.82)");
    drawPixelRect(-54, -22, 18, 32, "rgba(255,160,220,0.62)");
    drawPixelRect(36, -22, 18, 32, "rgba(255,160,220,0.62)");
  }

  drawPixelRect(-15, -15, 30, 38, "#ffd7b6");
  drawPixelRect(-24, -52, 48, 42, "#ffd7b6");
  drawPixelRect(-26, -58, 52, 22, hair.color);
  drawPixelRect(-22, -42, 16, 22, hair.bang);
  drawPixelRect(6, -42, 16, 22, hair.bang);
  drawPixelRect(-12, -38, 7, 8, "#1a1630");
  drawPixelRect(7, -38, 7, 8, "#1a1630");
  drawPixelRect(-5, -24, 10, 4, "#ff5f90");

  if (look.accessory === "hat") {
    drawPixelRect(-29, -70, 58, 12, "#111827");
    drawPixelRect(-22, -90, 44, 24, "#111827");
    drawPixelRect(-18, -75, 36, 8, "#e23b3b");
  }
  if (look.accessory === "flower") {
    drawText("✿", -26, -66, 20, "#ff7ac7");
    drawText("✿", 18, -64, 18, "#ffd447");
  }

  drawPixelRect(-22, -12, 44, 46, top.color);
  drawPixelRect(-18, -7, 36, 10, top.trim);
  if (look.top === "rock") drawPixelRect(-24, -7, 10, 50, "#17223f");
  if (look.top === "coat") {
    drawPixelRect(-30, -6, 14, 64, top.color);
    drawPixelRect(16, -6, 14, 64, top.color);
  }

  drawPixelRect(-24, 30, 48, 26, bottom.color);
  if (look.bottom === "skirt" || look.bottom === "white") {
    drawPixelRect(-30, 44, 12, 14, bottom.color);
    drawPixelRect(18, 44, 12, 14, bottom.color);
  }
  drawPixelRect(-18, 56, 10, 28, "#ffd7b6");
  drawPixelRect(8, 56, 10, 28, "#ffd7b6");
  drawPixelRect(-22, 82, 18, 10, "#ffffff");
  drawPixelRect(4, 82, 18, 10, "#ffffff");
  drawPixelRect(-28, -2 + Math.sin(tick / 8) * 3, 10, 34, "#ffd7b6");
  drawPixelRect(18, -2 - Math.sin(tick / 8) * 3, 10, 34, "#ffd7b6");
  ctx.restore();

  const label = options.label || body.name || playerName;
  drawText(label, body.x, body.y + 105, 13, "#ffffff", "center");
  const bubble = bubbles.find((item) => item.id === body.id && item.until > Date.now());
  if (bubble) drawBubble(body.x, body.y - 110, bubble.text);
}

function drawBubble(x, y, text) {
  const width = Math.min(260, 36 + text.length * 14);
  drawPixelRect(x - width / 2, y - 18, width, 34, "rgba(255,255,255,0.94)");
  ctx.strokeStyle = "#241c46";
  ctx.lineWidth = 3;
  ctx.strokeRect(x - width / 2, y - 18, width, 34);
  drawText(text, x, y, 13, "#1a1630", "center");
}

function drawSparkles() {
  sparkles = sparkles.filter((sparkle) => sparkle.life > 0);
  sparkles.forEach((sparkle) => {
    sparkle.life -= 1;
    sparkle.y -= 0.35;
    ctx.globalAlpha = Math.max(0, sparkle.life / 48);
    drawText(sparkle.icon, sparkle.x, sparkle.y, sparkle.size, sparkle.color);
    ctx.globalAlpha = 1;
  });
  if (tick % 5 === 0) {
    const scene = currentScene();
    sparkles.push({
      x: Math.random() * canvas.width,
      y: 40 + Math.random() * canvas.height * 0.72,
      life: 40,
      size: 10 + Math.random() * 13,
      icon: Math.random() > 0.54 ? "✦" : "·",
      color: scene.palette[Math.floor(Math.random() * scene.palette.length)]
    });
  }
}

function render() {
  const scene = currentScene();
  drawScene(scene);
  drawHotspots(scene);
  drawPortal(scene);
  drawFragments(scene);
  drawSparkles();
  [...otherPlayers.values()]
    .filter((item) => item.sceneId === scene.id && Date.now() - item.time < 12000)
    .forEach((remote) => drawCharacter(remote, { alpha: 0.88, label: remote.name }));
  drawCharacter({ ...player, id: playerId, name: playerName, look: playerLook }, { alpha: 1, label: playerName });
}

function update() {
  const speed = keys.has("Shift") ? 4.2 : 3;
  let dx = 0;
  let dy = 0;
  if (keys.has("ArrowLeft") || keys.has("a")) dx -= 1;
  if (keys.has("ArrowRight") || keys.has("d")) dx += 1;
  if (keys.has("ArrowUp") || keys.has("w")) dy -= 1;
  if (keys.has("ArrowDown") || keys.has("s")) dy += 1;
  if (dx || dy) {
    const len = Math.hypot(dx, dy);
    player.x += (dx / len) * speed;
    player.y += (dy / len) * speed;
    player.facing = dx < 0 ? -1 : dx > 0 ? 1 : player.facing;
    if (tick % 5 === 0) publishState();
  }
  player.x = Math.max(44, Math.min(canvas.width - 44, player.x));
  player.y = Math.max(130, Math.min(canvas.height - 105, player.y));

  const scene = currentScene();
  scene.fragments.forEach((fragment, index) => {
    const key = `${scene.id}:${index}`;
    if (!collected.has(key) && distance(player, fragment) < 46) {
      collected.add(key);
      localStorage.setItem(collectedKey, JSON.stringify([...collected]));
      showToast(`收集到生活碎片 ${fragment.icon}`);
      playSfx("collect");
      burst(fragment.x, fragment.y);
      updateControls();
    }
  });

  if (distance(player, { x: 885, y: 438 }) < 48) {
    const next = scenes.findIndex((item) => item.id === scene.next);
    playSfx("portal");
    switchScene(next);
  }

  if (messageTimer > 0) messageTimer -= 1;
  if (messageTimer === 0) {
    const nearHotspot = scene.hotspots.find((spot) => isNearRect(spot, 54));
    const nearPlayer = nearestPlayer();
    ui.sceneToast.textContent = nearPlayer ? `你靠近了 ${nearPlayer.name}，可以发送聊天` : nearHotspot ? `按 E 查看：${nearHotspot.label}` : "靠近发光物件按 E 互动，靠近玩家可以聊天";
  }
}

function loop() {
  tick += 1;
  update();
  render();
  requestAnimationFrame(loop);
}

function switchScene(index, fromButton = false) {
  sceneIndex = index;
  const spawn = currentScene().spawn;
  player.x = fromButton ? spawn.x : 95;
  player.y = spawn.y;
  ui.memoryText.textContent = currentScene().memory;
  showToast(currentScene().memory);
  updateControls();
  startSceneMusic();
  publishState("进入了 " + currentScene().name);
}

function interact() {
  const found = currentScene().hotspots.find((spot) => isNearRect(spot, 54));
  if (found) {
    ui.memoryText.textContent = found.text;
    showToast(found.text);
    playSfx("interact");
    burst(found.x + found.w / 2, found.y + found.h / 2);
    publishState("正在互动：" + found.label);
    return;
  }
  const near = nearestPlayer();
  if (near) {
    ui.chatInput.focus();
    showToast(`正在和 ${near.name} 交流。`);
    return;
  }
  showToast("这里暂时只有闪光的空气。再靠近发光框试试。");
}

function sendChat() {
  const text = ui.chatInput.value.trim().slice(0, 32);
  if (!text) return;
  ui.chatInput.value = "";
  addBubble(playerId, text);
  playSfx("chat");
  send({ type: "chat", id: playerId, player: serializePlayer(), text });
}

function joinRoom() {
  playerName = ui.playerName.value.trim().slice(0, 8) || "游客";
  localStorage.setItem(nameKey, playerName);
  publishState("加入了房间");
  showToast(`${playerName} 加入了 8.99 房间。`);
}

function buildControls() {
  ui.sceneButtons.innerHTML = "";
  scenes.forEach((scene, index) => {
    const button = document.createElement("button");
    button.className = "scene-button";
    button.type = "button";
    button.innerHTML = `<span class="scene-swatch" style="background:linear-gradient(135deg,${scene.palette[0]},${scene.palette[1]} 48%,${scene.palette[2]})"></span><span><span class="scene-name">${scene.name}</span><span class="scene-note">${scene.note}</span></span>`;
    button.addEventListener("click", () => switchScene(index, true));
    ui.sceneButtons.appendChild(button);
  });

  buildClosetGroup("hair", ui.hairButtons);
  buildClosetGroup("top", ui.topButtons);
  buildClosetGroup("bottom", ui.bottomButtons);
  buildClosetGroup("accessory", ui.accessoryButtons);
  updateControls();
}

function buildClosetGroup(type, container) {
  container.innerHTML = "";
  closet[type].forEach((item) => {
    const button = document.createElement("button");
    button.className = "closet-button";
    button.type = "button";
    button.textContent = item.label;
    button.addEventListener("click", () => {
      playerLook[type] = item.id;
      localStorage.setItem(lookKey, JSON.stringify(playerLook));
      showToast(`换上了 ${item.label}`);
      playSfx("dress");
      updateControls();
      publishState("换了造型");
    });
    container.appendChild(button);
  });
}

function updateControls() {
  [...ui.sceneButtons.children].forEach((button, index) => button.classList.toggle("active", index === sceneIndex));
  updateClosetActive("hair", ui.hairButtons);
  updateClosetActive("top", ui.topButtons);
  updateClosetActive("bottom", ui.bottomButtons);
  updateClosetActive("accessory", ui.accessoryButtons);
  const total = currentScene().fragments.length;
  const got = currentScene().fragments.filter((_, index) => collected.has(`${currentScene().id}:${index}`)).length;
  ui.stickerCount.textContent = `${got}/${total}`;
  updateOnlineCount();
}

function updateClosetActive(type, container) {
  [...container.children].forEach((button, index) => button.classList.toggle("active", closet[type][index].id === playerLook[type]));
}

function updateOnlineCount() {
  const live = [...otherPlayers.values()].filter((item) => Date.now() - item.time < 12000).length + 1;
  ui.onlineCount.textContent = `${live} 人在线`;
}

function addBubble(id, text) {
  bubbles = bubbles.filter((item) => item.id !== id);
  bubbles.push({ id, text, until: Date.now() + 5200 });
}

function nearestPlayer() {
  return [...otherPlayers.values()].find((item) => item.sceneId === currentScene().id && distance(player, item) < 115);
}

function isNearRect(rect, pad = 0) {
  return player.x > rect.x - pad && player.x < rect.x + rect.w + pad && player.y > rect.y - pad && player.y < rect.y + rect.h + pad;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function burst(x, y) {
  const scene = currentScene();
  for (let i = 0; i < 12; i++) {
    sparkles.push({
      x: x + (Math.random() - 0.5) * 88,
      y: y + (Math.random() - 0.5) * 60,
      life: 48,
      size: 13 + Math.random() * 16,
      icon: i % 2 ? "✦" : "♡",
      color: scene.palette[i % scene.palette.length]
    });
  }
}

window.addEventListener("keydown", (event) => {
  if (!audioEnabled && (event.key === "Enter" || event.key === " ")) startAudio();
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
  keys.add(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  if (event.key.toLowerCase() === "e" || event.key === " ") interact();
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
});

document.querySelectorAll("[data-move]").forEach((button) => {
  const map = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" };
  const key = map[button.dataset.move];
  button.addEventListener("pointerdown", () => keys.add(key));
  button.addEventListener("pointerup", () => keys.delete(key));
  button.addEventListener("pointerleave", () => keys.delete(key));
});

ui.joinButton.addEventListener("click", joinRoom);
ui.sendButton.addEventListener("click", sendChat);
ui.audioButton.addEventListener("click", toggleAudio);
ui.volumeSlider.addEventListener("input", () => {
  if (masterGain) masterGain.gain.value = Number(ui.volumeSlider.value) / 100;
});
ui.playerName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") joinRoom();
});
ui.chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendChat();
});
document.querySelector("[data-action='interact']").addEventListener("click", interact);

localChannel?.addEventListener("message", (event) => receive(event.data));
window.addEventListener("storage", (event) => {
  if (event.key === localRoomKey && event.newValue) {
    Object.values(JSON.parse(event.newValue)).forEach((playerState) => receive({ type: "state", id: playerState.id, player: playerState }));
  }
});
window.addEventListener("beforeunload", () => send({ type: "leave", id: playerId }));

setInterval(() => {
  publishState();
  [...otherPlayers.entries()].forEach(([id, item]) => {
    if (Date.now() - item.time > 15000) otherPlayers.delete(id);
  });
  updateOnlineCount();
}, 1200);

loadImages();
buildControls();
switchScene(0, true);
connectMultiplayer();
loop();
