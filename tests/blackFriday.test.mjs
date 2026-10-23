import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { currentLot, discounted } from "../src/lib/blackFriday.ts";

const priceData = JSON.parse(readFileSync(new URL("../src/data/black-friday-prices.json", import.meta.url), "utf8"));

test("mantém os preços normais até 29/10 e troca os lotes nas datas da campanha", () => {
  const cases = [
    ["2026-10-23T15:10:00-03:00", "upcoming", "BLACK35", 35, "2026-10-29T00:00:00-03:00"],
    ["2026-10-28T23:59:59-03:00", "upcoming", "BLACK35", 35, "2026-10-29T00:00:00-03:00"],
    ["2026-10-29T00:00:00-03:00", "active", "BLACK35", 35, "2026-11-01T00:00:00-03:00"],
    ["2026-11-01T00:00:00-03:00", "active", "BLACK30", 30, "2026-11-09T00:00:00-03:00"],
    ["2026-11-09T00:00:00-03:00", "active", "BLACK27", 27, "2026-11-16T00:00:00-03:00"],
    ["2026-11-16T00:00:00-03:00", "active", "BLACK25", 25, "2026-11-23T00:00:00-03:00"],
    ["2026-11-23T00:00:00-03:00", "active", "BLACK22", 22, "2026-12-01T00:00:00-03:00"],
    ["2026-11-30T23:59:59-03:00", "active", "BLACK22", 22, "2026-12-01T00:00:00-03:00"],
    ["2026-12-01T00:00:00-03:00", "ended", "BLACK22", 22, null],
  ];
  for (const [time, status, coupon, discount, nextChange] of cases) {
    const lot = currentLot(new Date(time));
    assert.equal(lot.status, status, time);
    assert.equal(lot.coupon, coupon, time);
    assert.equal(lot.discount, discount, time);
    assert.equal(lot.appliedDiscount, status === "active" ? discount : 0, time);
    assert.equal(lot.nextChange, nextChange, time);
    assert.equal(discounted(197, lot.appliedDiscount), Math.round(197 * (100 - lot.appliedDiscount)) / 100, time);
  }
});

test("mantém os centavos da tabela", () => {
  assert.equal(discounted(197, 35), 128.05);
  assert.equal(discounted(197, 27), 143.81);
  assert.equal(discounted(1970, 22), 1536.6);
});

test("atualiza assinatura e vitalício junto com cada lote", () => {
  const before = currentLot(new Date("2026-10-23T15:09:59-03:00"));
  assert.equal(discounted(priceData.prices.hub["1"].anual.basic.parcel, before.appliedDiscount), 223);
  const expectedParcels = [144.95, 156.1, 162.79, 167.25, 173.94];
  const expectedLifetime = [6650, 7000, 7300, 7450, 7600];
  const lotStarts = ["2026-10-29", "2026-11-01", "2026-11-09", "2026-11-16", "2026-11-23"];
  for (let index = 0; index < lotStarts.length; index += 1) {
    const lot = currentLot(new Date(`${lotStarts[index]}T00:00:00-03:00`));
    assert.equal(discounted(priceData.prices.hub["1"].anual.basic.parcel, lot.discount), expectedParcels[index]);
    assert.equal(priceData.vitalicio.hub["1"][lot.index].parcel, expectedLifetime[index]);
  }
});
