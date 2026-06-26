import assert from "node:assert/strict";
import {
  createPatrolState,
  resolvePatrol,
  tickPatrol
} from "../patrol-engine.mjs";

const initial = createPatrolState();
assert.equal(initial.phase, "calm");
assert.equal(initial.secondsLeft, 42);
assert.equal(initial.risk, 18);

const warning = tickPatrol({ ...initial, secondsLeft: 13 });
assert.equal(warning.phase, "warning");
assert.equal(warning.risk, 72);
assert.match(warning.notice, /靠近/);

const danger = tickPatrol({ ...initial, secondsLeft: 1 });
assert.equal(danger.phase, "danger");
assert.equal(danger.secondsLeft, 0);
assert.equal(danger.risk, 96);
assert.match(danger.notice, /巡视到达/);

const escaped = resolvePatrol(danger, true);
assert.equal(escaped.phase, "calm");
assert.equal(escaped.risk, 16);
assert.equal(escaped.reward, 8);
assert.match(escaped.notice, /伪装成功/);

const caught = resolvePatrol(danger, false);
assert.equal(caught.phase, "calm");
assert.equal(caught.risk, 38);
assert.equal(caught.reward, -10);
assert.match(caught.notice, /露馅/);

const rehearsal = resolvePatrol(initial, false);
assert.equal(rehearsal.phase, "calm");
assert.equal(rehearsal.risk, 18);
assert.equal(rehearsal.reward, 1);
assert.match(rehearsal.notice, /提前演练/);
