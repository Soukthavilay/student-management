import test from "node:test";
import assert from "node:assert/strict";
import { calculateWeightedFinalScore, toGpaPoint } from "./grade.js";

test("calculateWeightedFinalScore returns weighted result", () => {
  const result = calculateWeightedFinalScore([
    { name: "A", weight: 0.1, score: 9 },
    { name: "B", weight: 0.3, score: 8 },
    { name: "C", weight: 0.6, score: 8.5 },
  ]);

  assert.equal(result, 8.4);
});

test("calculateWeightedFinalScore throws if total weight is not 1", () => {
  assert.throws(() =>
    calculateWeightedFinalScore([
      { name: "A", weight: 0.2, score: 9 },
      { name: "B", weight: 0.3, score: 8 },
    ]),
  );
});

test("toGpaPoint maps score to expected gpa point", () => {
  assert.equal(toGpaPoint(8.6), 4.0);
  assert.equal(toGpaPoint(8.2), 3.5);
  assert.equal(toGpaPoint(7.2), 3.0);
  assert.equal(toGpaPoint(6.6), 2.5);
  assert.equal(toGpaPoint(5.6), 2.0);
  assert.equal(toGpaPoint(5.0), 1.5);
  assert.equal(toGpaPoint(4.0), 1.0);
  assert.equal(toGpaPoint(3.0), 0);
});
