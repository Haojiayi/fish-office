import { createPets, interactWithPet } from "./pet-engine.mjs";
import { createPatrolState, resolvePatrol, tickPatrol } from "./patrol-engine.mjs";

const defaultMessages = [
  { author: "小周", text: "咖啡机需要维护，预计维护 15 分钟。", time: "09:41" },
  { author: "Rita", text: "我在同步竞品材料，其实是同步快乐。", time: "10:08" },
  { author: "阿哲", text: "会议纪要已进入沉浸式整理阶段。", time: "10:27" }
];

const defaultActivities = [
  "小周将「老板看不懂但会点头的图」推进到评审中。",
  "Rita 完成一次无声大笑并保持摄像头关闭。",
  "阿哲把需求拆成 3 个更像需求的需求。"
];

const fishActions = [
  "打开了一个看起来很像数据源的冷笑话页面。",
  "把鼠标移动轨迹伪装成深度思考。",
  "在会议窗口里练习了三种专业点头。",
  "用表格记录了今天第几次想下班。",
  "将零食补给归类为团队基础设施。"
];

export function createRoomState(code) {
  return {
    code,
    members: [],
    focusScore: 87,
    vibeScore: 73,
    taskScore: 12,
    safeWindow: 18,
    pets: createPets(),
    patrol: createPatrolState(),
    messages: [...defaultMessages],
    activities: [...defaultActivities]
  };
}

export function applyRoomAction(room, action) {
  const next = structuredClone(room);

  if (action.type === "join") {
    const nickname = cleanName(action.nickname);
    const existing = next.members.find((member) => member.nickname === nickname);
    if (existing) {
      existing.status = cleanText(action.status || existing.status);
      existing.lastSeen = Date.now();
    } else {
      next.members.push({
        nickname,
        status: cleanText(action.status || "写方案中"),
        lastSeen: Date.now()
      });
    }
    addActivity(next, `${nickname} 进入了摸鱼办公室。`);
    return next;
  }

  if (action.type === "message") {
    const text = cleanText(action.text);
    if (!text) {
      return next;
    }
    next.messages.push({
      author: cleanName(action.nickname),
      text,
      time: action.time || currentTime()
    });
    next.messages = next.messages.slice(-30);
    next.vibeScore = clampScore(next.vibeScore + 2);
    addActivity(next, `${cleanName(action.nickname)} 在会议纪要流中同步了一个低调暗号。`);
    return next;
  }

  if (action.type === "pet") {
    const pet = next.pets.find((item) => item.id === action.petId);
    if (!pet) {
      return next;
    }
    const updated = interactWithPet(pet, action.actionId);
    next.pets = next.pets.map((item) => (item.id === action.petId ? updated : item));
    next.vibeScore = clampScore(next.vibeScore + 1);
    next.taskScore += action.actionId === "meeting" ? 1 : 0;
    addActivity(next, updated.activity);
    return next;
  }

  if (action.type === "fish") {
    const actionText = fishActions[Math.floor(Math.random() * fishActions.length)];
    next.focusScore = clampScore(next.focusScore + Math.floor(Math.random() * 7) - 2);
    next.vibeScore = clampScore(next.vibeScore + 3);
    next.taskScore += 1;
    next.safeWindow = Math.max(4, next.safeWindow - 1);
    next.patrol.risk = clampScore(next.patrol.risk + 4);
    addActivity(next, `${cleanName(action.nickname)}${actionText}`);
    return next;
  }

  if (action.type === "panic") {
    const escaped = next.patrol.phase === "danger" || next.patrol.phase === "warning";
    next.patrol = resolvePatrol(next.patrol, escaped);
    next.vibeScore = clampScore(next.vibeScore + next.patrol.reward);
    next.focusScore = clampScore(next.focusScore + (escaped ? 5 : -8));
    addActivity(next, next.patrol.notice);
    return next;
  }

  if (action.type === "tick") {
    next.patrol = tickPatrol(next.patrol);
    if (next.patrol.phase === "danger") {
      next.focusScore = clampScore(next.focusScore - 1);
    }
    return next;
  }

  return next;
}

function addActivity(room, text) {
  room.activities.unshift(text);
  room.activities = room.activities.slice(0, 24);
}

function currentTime() {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
}

function cleanName(value) {
  return cleanText(value || "匿名同事").slice(0, 12) || "匿名同事";
}

function cleanText(value) {
  return String(value || "").trim().slice(0, 120);
}

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}
