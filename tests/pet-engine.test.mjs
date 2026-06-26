import assert from "node:assert/strict";
import { createPets, interactWithPet } from "../pet-engine.mjs";

const pets = createPets();

assert.equal(pets.length, 4);
assert.equal(pets[0].mood, 68);

const fed = interactWithPet(pets[0], "feed");
assert.equal(fed.hunger, 79);
assert.equal(fed.mood, 72);
assert.match(fed.activity, /投喂/);

const petted = interactWithPet(pets[1], "pet");
assert.equal(petted.mood, 82);
assert.equal(petted.energy, 58);
assert.match(petted.activity, /摸头/);

const coffee = interactWithPet(pets[2], "coffee");
assert.equal(coffee.energy, 76);
assert.equal(coffee.fishPower, 81);
assert.match(coffee.activity, /咖啡/);

const meeting = interactWithPet(pets[3], "meeting");
assert.equal(meeting.energy, 40);
assert.equal(meeting.fishPower, 87);
assert.match(meeting.activity, /代开会/);

assert.throws(() => interactWithPet(pets[0], "unknown"), /Unknown pet action/);
