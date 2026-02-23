const test = require('node:test');
const assert = require('node:assert/strict');

const { computeAuditScore, buildActionPlan } = require('../audit-core');

test('computeAuditScore returns high score for mature org', () => {
  const score = computeAuditScore({
    charteIA: 'oui',
    referentIA: 'oui',
    cadreRGPD: 'oui',
    validationJuridique: 'oui',
    nbCasUsage: 5,
    shadowPersonalAccounts: 'non',
    formationIA: 'oui',
    promptFramework: 'oui',
    kpiIA: 'oui',
    roadmapIA: 'oui',
  });

  assert.equal(score.total, 100);
  assert.equal(score.level.label.includes('Piloté'), true);
});

test('computeAuditScore low score generates priorities', () => {
  const score = computeAuditScore({
    charteIA: 'non',
    referentIA: 'non',
    cadreRGPD: 'non',
    validationJuridique: 'non',
    nbCasUsage: 0,
    shadowPersonalAccounts: 'oui',
    formationIA: 'non',
    promptFramework: 'non',
    kpiIA: 'non',
    roadmapIA: 'non',
  });

  assert.ok(score.total < 30);
  const actions = buildActionPlan(score);
  assert.ok(actions.length >= 4);
});
