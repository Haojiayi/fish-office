const DEFAULT_SECONDS = 42;

export function createPatrolState() {
  return {
    phase: "calm",
    secondsLeft: DEFAULT_SECONDS,
    risk: 18,
    reward: 0,
    notice: "老板暂未靠近，维持低调摸鱼。"
  };
}

export function tickPatrol(state) {
  const secondsLeft = Math.max(0, state.secondsLeft - 1);

  if (secondsLeft === 0) {
    return {
      ...state,
      phase: "danger",
      secondsLeft,
      risk: 96,
      notice: "巡视到达，立刻伪装或让宠物代开会。"
    };
  }

  if (secondsLeft <= 12) {
    return {
      ...state,
      phase: "warning",
      secondsLeft,
      risk: 72,
      notice: "老板正在靠近工位区，宠物们开始整理表情。"
    };
  }

  return {
    ...state,
    phase: "calm",
    secondsLeft,
    risk: Math.max(18, state.risk - 1),
    notice: "老板暂未靠近，维持低调摸鱼。"
  };
}

export function resolvePatrol(state, escaped) {
  if (state.phase === "calm") {
    return {
      ...state,
      reward: 1,
      notice: "提前演练完成，宠物们已经记住了严肃表情。"
    };
  }

  return {
    ...createPatrolState(),
    risk: escaped ? 16 : 38,
    reward: escaped ? 8 : -10,
    notice: escaped
      ? "伪装成功，巡视被严肃报表和宠物会议糊弄过去。"
      : "露馅了，宠物们临时背锅，摸鱼值小幅扣减。"
  };
}
