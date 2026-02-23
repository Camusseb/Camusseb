(function (globalScope) {
  const defaultHourlyCostBySector = {
    education: 26,
    industrie: 31,
    pme: 30,
    default: 28,
  };

  function normalizeSector(sectorRaw) {
    const value = String(sectorRaw || '').toLowerCase();
    if (value.includes('école') || value.includes('ecole') || value.includes('education')) return 'education';
    if (value.includes('industrie')) return 'industrie';
    if (value.includes('pme') || value.includes('tpe')) return 'pme';
    return 'default';
  }

  function parseFrequency(raw) {
    const normalized = String(raw || '')
      .toLowerCase()
      .replace(',', '.')
      .replace(/\s+/g, '');

    const value = Number.parseFloat(normalized);
    if (!Number.isFinite(value)) return 0;
    if (normalized.includes('/semaine') || normalized.includes('semaine')) return value * 4.33;
    return value;
  }

  function resolveHourlyCost(rawInput, sectorRaw) {
    const parsed = Number.parseFloat(String(rawInput || '').trim().replace(',', '.'));
    if (Number.isFinite(parsed) && parsed > 0) {
      return { cost: parsed, fallbackUsed: false };
    }

    const sectorKey = normalizeSector(sectorRaw);
    return {
      cost: defaultHourlyCostBySector[sectorKey],
      fallbackUsed: true,
    };
  }

  function computeRoi({ tempsH = 0, volumeMensuel = 0, coutHoraire = 0 }) {
    const T = Number(tempsH || 0);
    const V = Number(volumeMensuel || 0);
    const C = Number(coutHoraire || 0);

    const tempsIA = T * 0.2;
    const gainHDoc = T - tempsIA;
    const gainHMois = gainHDoc * V;
    const gainHAn = gainHMois * 12;
    const gainEurosAn = gainHAn * C;
    const coutFormation = 1500;
    const roiNet = gainEurosAn - coutFormation;
    const payback = gainEurosAn > 0 ? coutFormation / (gainEurosAn / 12) : 0;

    return {
      T,
      V,
      C,
      tempsIA,
      gainHDoc,
      gainHMois,
      gainHAn,
      gainEurosAn,
      coutFormation,
      roiNet,
      payback,
    };
  }

  const api = {
    defaultHourlyCostBySector,
    normalizeSector,
    parseFrequency,
    resolveHourlyCost,
    computeRoi,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    globalScope.DiagIARoi = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
