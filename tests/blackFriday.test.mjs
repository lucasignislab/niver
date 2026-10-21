import assert from "node:assert/strict";
import test from "node:test";
import { currentLot, discounted } from "../src/lib/blackFriday.ts";

test("troca os cinco lotes na meia-noite de São Paulo", () => {
  const cases = [
    ["2026-10-29T02:59:59Z", "upcoming", "BLACK35"],
    ["2026-10-29T03:00:00Z", "active", "BLACK35"],
    ["2026-11-01T03:00:00Z", "active", "BLACK30"],
    ["2026-11-09T03:00:00Z", "active", "BLACK27"],
    ["2026-11-16T03:00:00Z", "active", "BLACK25"],
    ["2026-11-23T03:00:00Z", "active", "BLACK22"],
    ["2026-12-01T02:59:59Z", "active", "BLACK22"],
    ["2026-12-01T03:00:00Z", "ended", "BLACK22"],
  ];
  for (const [time, status, coupon] of cases) {
    const lot = currentLot(new Date(time));
    assert.equal(lot.status, status, time);
    assert.equal(lot.coupon, coupon, time);
  }
});

test("mantém os centavos da tabela", () => {
  assert.equal(discounted(197, 35), 128.05);
  assert.equal(discounted(197, 27), 143.81);
  assert.equal(discounted(1970, 22), 1536.6);
});
