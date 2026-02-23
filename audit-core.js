(function (globalScope) {
  const maturityLevels = [
    { max: 24, label: 'Niveau 1 — Initial', color: 'critical' },
    { max: 49, label: 'Niveau 2 — Opportuniste', color: 'warning' },
    { max: 74, label: 'Niveau 3 — Structuré', color: 'info' },
    { max: 100, label: 'Niveau 4 — Piloté', color: 'success' },
  ];

  function yesNoScore(value, yes = 20, no = 0) {
    return /oui|yes|ok/i.test(String(value || '')) ? yes : no;
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function computeAuditScore(session) {
    const governance = clamp(yesNoScore(session.charteIA, 20, 2) + yesNoScore(session.referentIA, 20, 0), 0, 20);
    const compliance = clamp(yesNoScore(session.cadreRGPD, 20, 3) + yesNoScore(session.validationJuridique, 20, 0), 0, 20);
    const usages = clamp((Number(session.nbCasUsage || 0) >= 3 ? 12 : Number(session.nbCasUsage || 0) * 4) + yesNoScore(session.shadowPersonalAccounts, 2, 8), 0, 20);
    const competences = clamp(yesNoScore(session.formationIA, 14, 2) + yesNoScore(session.promptFramework, 6, 0), 0, 20);
    const pilotage = clamp(yesNoScore(session.kpiIA, 14, 2) + yesNoScore(session.roadmapIA, 6, 0), 0, 20);

    const total = governance + compliance + usages + competences + pilotage;
    const level = maturityLevels.find((entry) => total <= entry.max) || maturityLevels[maturityLevels.length - 1];

    return {
      total,
      level,
      pillars: {
        gouvernance: governance,
        conformite: compliance,
        usages,
        competences,
        pilotage,
      },
    };
  }

  function buildActionPlan(score) {
    const plan = [];
    if (score.pillars.gouvernance < 12) plan.push('J+30: nommer un référent IA et publier une charte interne de 1 page.');
    if (score.pillars.conformite < 12) plan.push('J+30: cadrer les données interdites et la checklist RGPD pour les prompts.');
    if (score.pillars.competences < 12) plan.push('J+60: lancer un atelier formation IA + guide de prompts par métier.');
    if (score.pillars.usages < 12) plan.push('J+60: sélectionner 3 cas d’usage prioritaires et mesurer le gain temps.');
    if (score.pillars.pilotage < 12) plan.push('J+90: suivre 3 KPI IA mensuels dans un comité de pilotage.');
    if (plan.length === 0) plan.push('Continuer l’industrialisation: généraliser les standards IA à tous les services.');
    return plan;
  }

  const api = { computeAuditScore, buildActionPlan };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    globalScope.DiagIAAudit = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
