import assert from "node:assert/strict";
import {
  applyRoomAction,
  createRoomState
} from "../room-engine.mjs";

const room = createRoomState("FISH-404");
assert.equal(room.code, "FISH-404");
assert.equal(room.messages.length, 3);
assert.equal(room.pets.length, 4);

const joined = applyRoomAction(room, {
  type: "join",
  nickname: "小林",
  status: "假装写日报"
});
assert.equal(joined.members[0].nickname, "小林");
assert.equal(joined.members[0].status, "假装写日报");

const messaged = applyRoomAction(joined, {
  type: "message",
  nickname: "小林",
  text: "老板到哪了"
});
assert.equal(messaged.messages.at(-1).author, "小林");
assert.equal(messaged.messages.at(-1).text, "老板到哪了");

const petted = applyRoomAction(messaged, {
  type: "pet",
  petId: "fish",
  actionId: "coffee"
});
assert.equal(petted.pets.find((pet) => pet.id === "fish").energy, 66);
assert.match(petted.activities[0], /咖啡/);

const fished = applyRoomAction(petted, {
  type: "fish",
  nickname: "小林"
});
assert.equal(fished.taskScore, petted.taskScore + 1);
assert.ok(fished.activities[0].includes("小林"));
