const PETS = [
  {
    id: "cat",
    owner: "小周",
    name: "周报猫",
    species: "猫",
    icon: "猫",
    desk: "A1",
    hunger: 63,
    mood: 68,
    energy: 52,
    fishPower: 74
  },
  {
    id: "dog",
    owner: "Rita",
    name: "流程犬",
    species: "狗",
    icon: "犬",
    desk: "B2",
    hunger: 70,
    mood: 76,
    energy: 52,
    fishPower: 67
  },
  {
    id: "hamster",
    owner: "阿哲",
    name: "编译仓",
    species: "仓鼠",
    icon: "仓",
    desk: "C3",
    hunger: 58,
    mood: 61,
    energy: 64,
    fishPower: 69
  },
  {
    id: "fish",
    owner: "你",
    name: "电子鱼",
    species: "电子鱼",
    icon: "鱼",
    desk: "D4",
    hunger: 66,
    mood: 72,
    energy: 54,
    fishPower: 79
  }
];

const ACTIONS = {
  feed: {
    label: "投喂",
    hunger: 16,
    mood: 4,
    energy: 0,
    fishPower: 2,
    activity: (pet) => `给 ${pet.name} 投喂了工位零食，宠物开始认真监督摸鱼。`
  },
  pet: {
    label: "摸头",
    hunger: 0,
    mood: 6,
    energy: 6,
    fishPower: 3,
    activity: (pet) => `摸头安抚了 ${pet.name}，它决定暂时不举报你。`
  },
  coffee: {
    label: "送咖啡",
    hunger: 0,
    mood: 2,
    energy: 12,
    fishPower: 12,
    activity: (pet) => `给 ${pet.name} 送了咖啡，它的摸鱼雷达恢复在线。`
  },
  meeting: {
    label: "代开会",
    hunger: -3,
    mood: -2,
    energy: -14,
    fishPower: 8,
    activity: (pet) => `${pet.name} 已进入代开会模式，负责点头和说“我补充一下”。`
  }
};

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

export function createPets() {
  return PETS.map((pet) => ({ ...pet }));
}

export function interactWithPet(pet, actionId) {
  const action = ACTIONS[actionId];
  if (!action) {
    throw new Error(`Unknown pet action: ${actionId}`);
  }

  return {
    ...pet,
    hunger: clamp(pet.hunger + action.hunger),
    mood: clamp(pet.mood + action.mood),
    energy: clamp(pet.energy + action.energy),
    fishPower: clamp(pet.fishPower + action.fishPower),
    lastAction: action.label,
    activity: action.activity(pet)
  };
}

export function getPetActions() {
  return Object.entries(ACTIONS).map(([id, action]) => ({
    id,
    label: action.label
  }));
}
