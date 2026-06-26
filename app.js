import { createPets, getPetActions, interactWithPet } from "./pet-engine.mjs";
import { createPatrolState, resolvePatrol, tickPatrol } from "./patrol-engine.mjs";

const STORAGE_KEY = "fish-office-state-v1";
const ROOM_KEY = "fish-office-room-code";

const defaultState = {
  nickname: "匿名同事",
  status: "写方案中",
  focusScore: 87,
  vibeScore: 73,
  taskScore: 12,
  safeWindow: 18,
  pets: createPets(),
  patrol: createPatrolState(),
  messages: [
    { author: "小周", text: "咖啡机需要维护，预计维护 15 分钟。", time: "09:41" },
    { author: "Rita", text: "我在同步竞品材料，其实是同步快乐。", time: "10:08" },
    { author: "阿哲", text: "会议纪要已进入沉浸式整理阶段。", time: "10:27" }
  ],
  activities: [
    "小周将「老板看不懂但会点头的图」推进到评审中。",
    "Rita 完成一次无声大笑并保持摄像头关闭。",
    "阿哲把需求拆成 3 个更像需求的需求。"
  ]
};

const columns = [
  {
    title: "待同步",
    tasks: ["整理周报措辞", "给文档加一个更像标题的标题", "研究老板语气"]
  },
  {
    title: "推进中",
    tasks: ["把进度条调到 67%", "分析茶水间流量峰值", "复盘沉默会议"]
  },
  {
    title: "已闭环",
    tasks: ["确认今天适合低调", "完成工位舒适度调研", "归档摸鱼暗号"]
  }
];

const fishActions = [
  "打开了一个看起来很像数据源的冷笑话页面。",
  "把鼠标移动轨迹伪装成深度思考。",
  "在会议窗口里练习了三种专业点头。",
  "用表格记录了今天第几次想下班。",
  "将零食补给归类为团队基础设施。"
];

const quickReplies = [
  "收到，我这边保持观察。",
  "这个问题需要一点咖啡因支持。",
  "建议先低调同步，不要惊动流程。",
  "我在看数据，数据也在看我。"
];

const appShell = document.querySelector(".app-shell");
const officeView = document.querySelector("#officeView");
const bossReport = document.querySelector("#bossReport");
const roomCodeInput = document.querySelector("#roomCodeInput");
const roomCodeLabel = document.querySelector("#roomCode");
const connectionState = document.querySelector("#connectionState");
const nicknameInput = document.querySelector("#nickname");
const statusSelect = document.querySelector("#statusSelect");
const bossKeyButton = document.querySelector("#bossKey");
const fishButton = document.querySelector("#fishButton");
const copyRoomButton = document.querySelector("#copyRoom");
const panicButton = document.querySelector("#panicButton");
const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#messageInput");
const toast = document.querySelector("#toast");

let state = loadState();
let roomCode = localStorage.getItem(ROOM_KEY) || "FISH-404";
let eventSource = null;
let onlineMode = false;

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      ...defaultState,
      ...parsed,
      pets: parsed.pets || createPets(),
      patrol: parsed.patrol || createPatrolState()
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  if (!onlineMode) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function currentTime() {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
}

function clampScore(value) {
  return Math.max(12, Math.min(99, value));
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderMetrics() {
  document.querySelector("#focusScore").textContent = state.focusScore;
  document.querySelector("#vibeScore").textContent = state.vibeScore;
  document.querySelector("#taskScore").textContent = state.taskScore;
  document.querySelector("#safeWindow").textContent = `${state.safeWindow}m`;
}

function renderPatrol() {
  const panel = document.querySelector("#patrolPanel");
  const phaseText = {
    calm: "低风险",
    warning: "靠近中",
    danger: "巡视到达"
  };
  panel.classList.remove("calm", "warning", "danger");
  panel.classList.add(state.patrol.phase);
  document.querySelector("#patrolPhase").textContent = phaseText[state.patrol.phase];
  document.querySelector("#patrolCountdown").textContent = `${state.patrol.secondsLeft}s`;
  document.querySelector("#patrolRisk").textContent = `${state.patrol.risk}%`;
  document.querySelector("#patrolDot").style.width = `${state.patrol.risk}%`;
  document.querySelector("#patrolNotice").textContent = state.patrol.notice;
}

function renderPets() {
  const actions = getPetActions();
  const pets = state.pets.map((pet) =>
    pet.owner === "你" ? { ...pet, owner: state.nickname || "你" } : pet
  );

  document.querySelector("#petList").innerHTML = pets
    .map(
      (pet) => `
        <article class="pet-card">
          <div class="pet-row">
            <span class="pet-row">
              <span class="pet-icon">${pet.icon}</span>
              <span class="pet-copy">
                <strong>${pet.name}</strong>
                <small>${pet.owner} 的 ${pet.species} · ${pet.desk} · ${pet.lastAction || "待命"}</small>
              </span>
            </span>
          </div>
          <div class="pet-stats">
            ${renderStat("饱腹", pet.hunger, "hunger")}
            ${renderStat("心情", pet.mood, "mood")}
            ${renderStat("精力", pet.energy, "energy")}
            ${renderStat("摸鱼", pet.fishPower, "fish")}
          </div>
          <div class="pet-actions">
            ${actions
              .map((action) => `<button type="button" data-pet="${pet.id}" data-pet-action="${action.id}">${action.label}</button>`)
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderStat(label, value, className) {
  return `
    <div class="stat-line">
      <span>${label}</span>
      <span class="bar ${className}"><span style="width: ${value}%"></span></span>
      <span>${value}</span>
    </div>
  `;
}

function renderKanban() {
  document.querySelector("#kanbanBoard").innerHTML = columns
    .map(
      (column) => `
        <section class="column">
          <h3>${column.title}</h3>
          ${column.tasks
            .map(
              (task) => `
                <article class="task-card">
                  <strong>${task}</strong>
                  <small>状态：持续推进，暂无风险</small>
                  <button type="button" data-task="${task}">假装更新</button>
                </article>
              `
            )
            .join("")}
        </section>
      `
    )
    .join("");
}

function renderMessages() {
  document.querySelector("#messageList").innerHTML = state.messages
    .slice(-8)
    .map(
      (message) => `
        <article class="message">
          <div class="message-row">
            <strong>${message.author}</strong>
            <small>${message.time}</small>
          </div>
          <span>${message.text}</span>
        </article>
      `
    )
    .join("");
}

function renderActivities() {
  document.querySelector("#activityList").innerHTML = state.activities
    .slice(0, 8)
    .map((activity) => `<li>${activity}</li>`)
    .join("");
}

function render() {
  roomCodeInput.value = roomCode;
  roomCodeLabel.textContent = roomCode;
  nicknameInput.value = state.nickname;
  statusSelect.value = state.status;
  renderMetrics();
  renderPatrol();
  renderPets();
  renderKanban();
  renderMessages();
  renderActivities();
}

function addActivity(text) {
  state.activities.unshift(text);
  state.activities = state.activities.slice(0, 16);
}

function sendMessage(text) {
  if (onlineMode) {
    sendRoomAction({ type: "message", nickname: state.nickname, text, time: currentTime() });
    return;
  }

  const author = state.nickname || "匿名同事";
  state.messages.push({ author, text, time: currentTime() });
  state.messages = state.messages.slice(-20);
  state.vibeScore = clampScore(state.vibeScore + 2);
  addActivity(`${author} 在会议纪要流中同步了一个低调暗号。`);
  saveState();
  render();
}

function doFishAction() {
  if (onlineMode) {
    sendRoomAction({ type: "fish", nickname: state.nickname });
    showToast("摸鱼动作已同步到房间");
    return;
  }

  const action = fishActions[Math.floor(Math.random() * fishActions.length)];
  const author = state.nickname || "匿名同事";
  state.focusScore = clampScore(state.focusScore + Math.floor(Math.random() * 7) - 2);
  state.vibeScore = clampScore(state.vibeScore + 3);
  state.taskScore += 1;
  state.safeWindow = Math.max(4, state.safeWindow - 1);
  state.patrol.risk = clampScore(state.patrol.risk + 4);
  addActivity(`${author}${action}`);
  if (Math.random() > 0.45) {
    state.messages.push({
      author: "系统纪要",
      text: quickReplies[Math.floor(Math.random() * quickReplies.length)],
      time: currentTime()
    });
  }
  saveState();
  render();
  showToast("已完成一次非常合规的摸鱼动作");
}

nicknameInput.addEventListener("input", (event) => {
  state.nickname = event.target.value.trim() || "匿名同事";
  if (onlineMode) {
    sendRoomAction({ type: "join", nickname: state.nickname, status: state.status });
  }
  saveState();
  renderPets();
});

statusSelect.addEventListener("change", (event) => {
  state.status = event.target.value;
  if (onlineMode) {
    sendRoomAction({ type: "join", nickname: state.nickname, status: state.status });
  }
  addActivity(`${state.nickname || "匿名同事"} 将伪装状态切换为「${state.status}」。`);
  saveState();
  render();
});

bossKeyButton.addEventListener("click", () => {
  const nextMode = appShell.dataset.mode === "boss" ? "office" : "boss";
  appShell.dataset.mode = nextMode;
  bossKeyButton.textContent = nextMode === "boss" ? "恢复摸鱼" : "老板键";
  officeView.hidden = nextMode === "boss";
  bossReport.hidden = nextMode !== "boss";
  showToast(nextMode === "boss" ? "已切换至严肃报表" : "已恢复摸鱼协作台");
});

fishButton.addEventListener("click", doFishAction);

panicButton.addEventListener("click", () => {
  if (onlineMode) {
    sendRoomAction({ type: "panic", nickname: state.nickname });
    return;
  }

  const escaped = state.patrol.phase === "danger" || state.patrol.phase === "warning";
  state.patrol = resolvePatrol(state.patrol, escaped);
  state.vibeScore = clampScore(state.vibeScore + state.patrol.reward);
  state.focusScore = clampScore(state.focusScore + (escaped ? 5 : -8));
  addActivity(state.patrol.notice);
  saveState();
  render();
  showToast(state.patrol.notice);
});

copyRoomButton.addEventListener("click", async () => {
  const text = `我开了一个协同驾驶舱，房间暗号 ${roomCode}，进来同步一下项目风险：${window.location.origin}/?room=${encodeURIComponent(roomCode)}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast("伪装邀请已复制");
  } catch {
    showToast(text);
  }
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) {
    showToast("先输入一句低调暗号");
    return;
  }
  sendMessage(text);
  messageInput.value = "";
});

document.addEventListener("click", (event) => {
  const petButton = event.target.closest("[data-pet][data-pet-action]");
  if (petButton) {
    const petId = petButton.dataset.pet;
    const actionId = petButton.dataset.petAction;
    const pet = state.pets.find((item) => item.id === petId);
    if (!pet) {
      return;
    }
    if (onlineMode) {
      sendRoomAction({ type: "pet", petId, actionId, nickname: state.nickname });
      return;
    }
    const nextPet = interactWithPet(pet, actionId);
    state.pets = state.pets.map((item) => (item.id === petId ? nextPet : item));
    state.vibeScore = clampScore(state.vibeScore + 1);
    state.taskScore += actionId === "meeting" ? 1 : 0;
    addActivity(nextPet.activity);
    saveState();
    render();
    showToast(nextPet.activity);
    return;
  }

  const taskButton = event.target.closest("[data-task]");
  if (!taskButton) {
    return;
  }
  const task = taskButton.dataset.task;
  state.taskScore += 1;
  state.focusScore = clampScore(state.focusScore + 1);
  addActivity(`${state.nickname || "匿名同事"} 更新了「${task}」：结论是继续观察。`);
  saveState();
  render();
  showToast("任务状态已显得更加可靠");
});

render();

const localPatrolTimer = window.setInterval(() => {
  if (onlineMode) {
    return;
  }
  state.patrol = tickPatrol(state.patrol);
  if (state.patrol.phase === "danger") {
    state.focusScore = clampScore(state.focusScore - 1);
  }
  saveState();
  renderPatrol();
  renderMetrics();
}, 1000);

roomCodeInput.addEventListener("change", () => {
  roomCode = cleanRoomCode(roomCodeInput.value);
  localStorage.setItem(ROOM_KEY, roomCode);
  connectRoom();
  render();
});

function connectRoom() {
  const queryRoom = new URLSearchParams(window.location.search).get("room");
  if (queryRoom) {
    roomCode = cleanRoomCode(queryRoom);
    localStorage.setItem(ROOM_KEY, roomCode);
  }

  roomCode = cleanRoomCode(roomCode);
  roomCodeInput.value = roomCode;
  roomCodeLabel.textContent = roomCode;

  if (!window.EventSource || window.location.protocol === "file:") {
    connectionState.textContent = "单机模式";
    return;
  }

  eventSource?.close();
  eventSource = new EventSource(`/api/rooms/${encodeURIComponent(roomCode)}/events`);
  eventSource.onopen = () => {
    onlineMode = true;
    connectionState.textContent = "联网房间已连接";
    sendRoomAction({ type: "join", nickname: state.nickname, status: state.status });
  };
  eventSource.onmessage = (event) => {
    const roomState = JSON.parse(event.data);
    state = {
      ...state,
      ...roomState,
      nickname: state.nickname,
      status: state.status
    };
    render();
  };
  eventSource.onerror = () => {
    onlineMode = false;
    connectionState.textContent = "单机模式";
  };
}

function sendRoomAction(action) {
  fetch(`/api/rooms/${encodeURIComponent(roomCode)}/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action)
  }).catch(() => {
    onlineMode = false;
    connectionState.textContent = "单机模式";
    showToast("联网同步失败，已回到单机模式");
  });
}

function cleanRoomCode(value) {
  return String(value || "FISH-404")
    .trim()
    .replace(/[^a-zA-Z0-9-]/g, "")
    .slice(0, 16)
    .toUpperCase() || "FISH-404";
}

connectRoom();
