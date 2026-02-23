const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeSector,
  parseFrequency,
  resolveHourlyCost,
  computeRoi,
} = require('../roi-core');

test('normalizeSector maps expected French sectors', () => {
  assert.equal(normalizeSector('École privée'), 'education');
  assert.equal(normalizeSector('PME industrielle'), 'industrie');
  assert.equal(normalizeSector('TPE services'), 'pme');
  assert.equal(normalizeSector('Association'), 'default');
});

test('parseFrequency supports monthly and weekly input', () => {
  assert.equal(parseFrequency('8/mois'), 8);
  assert.equal(parseFrequency('2/semaine'), 8.66);
  assert.equal(parseFrequency('abc'), 0);
});

test('resolveHourlyCost uses fallback when needed', () => {
  const provided = resolveHourlyCost('45', 'PME');
  assert.equal(provided.cost, 45);
  assert.equal(provided.fallbackUsed, false);

  const fallback = resolveHourlyCost('refus', 'école');
  assert.equal(fallback.cost, 26);
  assert.equal(fallback.fallbackUsed, true);
});

test('computeRoi returns coherent outputs', () => {
  const roi = computeRoi({ tempsH: 5, volumeMensuel: 10, coutHoraire: 30 });
  assert.equal(roi.tempsIA, 1);
  assert.equal(roi.gainHMois, 40);
  assert.equal(roi.gainEurosAn, 14400);
  assert.equal(roi.roiNet, 12900);
  assert.ok(roi.payback > 1 && roi.payback < 2);
});
