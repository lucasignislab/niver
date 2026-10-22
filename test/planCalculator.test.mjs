import assert from "node:assert/strict";
import { test } from "node:test";
import { networkTier, recommendPlan } from "../src/lib/planCalculator.ts";

const accounts = { google: 1, meta: 1, taboola: 1, newsbreak: 1 };

test("recomenda o menor plano que cobre volume, contas e e-mails", () => {
  assert.equal(recommendPlan("pages", [], 4, accounts, 1), 3);
  assert.equal(recommendPlan("ads", ["meta"], 0, { ...accounts, meta: 6 }, 1), 1);
  assert.equal(recommendPlan("hub", ["google"], 1, accounts, 25), 2);
  assert.equal(recommendPlan("ads", ["mgid", "tiktok", "revcontent"], 0, accounts, 1), 0);
  assert.equal(networkTier(3), "all");
});
