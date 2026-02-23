const auditApi = window.DiagIAAudit;

const messagesEl = document.getElementById('messages');
const form = document.getElementById('answerForm');
const input = document.getElementById('answerInput');
const reportPanel = document.getElementById('reportPanel');
const riskBadges = document.getElementById('riskBadges');
const scoreCard = document.getElementById('scoreCard');
const pillarCards = document.getElementById('pillarCards');
const actionPlanEl = document.getElementById('actionPlan');
const downloadJsonBtn = document.getElementById('downloadJson');
const downloadCsvBtn = document.getElementById('downloadCsv');

const session = { risques: [] };

const steps = [
  {
    key: 'intro',
    question:
      '🤖 DiagIA activé — Mode Agent | SebGPT\n\nPlan audit IA:\n1) Cadrage organisation\n2) Gouvernance & conformité\n3) Usages & compétences\n4) Pilotage\n5) Rapport de maturité\n\nQuel est le nom de votre organisation et votre secteur ? (format: Organisation, Secteur)',
    onAnswer: (answer) => {
      const [org, ...rest] = answer.split(',');
      session.organisation = org?.trim() || answer.trim();
      session.secteur = rest.join(',').trim() || 'non précisé';
    },
  },
  { key: 'size', question: 'Combien de personnes composent vos équipes ?', field: 'tailleEquipe' },
  { key: 'defi', question: 'Quel est votre principal défi opérationnel ?', field: 'defi' },
  {
    key: 'charte',
    question: 'Avez-vous une charte IA interne ? (oui/non)',
    field: 'charteIA',
    onAnswer: (answer) => {
      if (/non/i.test(answer)) session.risques.push('Gouvernance faible');
    },
  },
  { key: 'referent', question: 'Avez-vous un référent IA identifié ? (oui/non)', field: 'referentIA' },
  {
    key: 'rgpd',
    question: 'Disposez-vous de règles RGPD spécifiques pour l’usage IA ? (oui/non)',
    field: 'cadreRGPD',
    onAnswer: (answer) => {
      if (/non/i.test(answer)) session.risques.push('Risque conformité RGPD');
    },
  },
  { key: 'juridique', question: 'Les contenus IA sensibles sont-ils validés juridiquement ? (oui/non)', field: 'validationJuridique' },
  {
    key: 'shadow',
    question: 'Des comptes IA personnels sont-ils utilisés pour des tâches pro ? (oui/non)',
    field: 'shadowPersonalAccounts',
    onAnswer: (answer) => {
      if (/oui/i.test(answer)) session.risques.push('Shadow AI actif');
    },
  },
  {
    key: 'casusage',
    question: 'Combien de cas d’usage IA sont réellement actifs aujourd’hui ? (nombre)',
    onAnswer: (answer) => {
      const v = Number.parseInt(answer, 10);
      session.nbCasUsage = Number.isFinite(v) ? v : 0;
    },
  },
  { key: 'formation', question: 'Avez-vous formé les équipes à l’IA générative ? (oui/non)', field: 'formationIA' },
  { key: 'prompts', question: 'Disposez-vous d’un framework de prompts (templates) ? (oui/non)', field: 'promptFramework' },
  { key: 'kpi', question: 'Suivez-vous des KPI IA (temps gagné, qualité, coûts) ? (oui/non)', field: 'kpiIA' },
  { key: 'roadmap', question: 'Avez-vous une roadmap IA 12 mois ? (oui/non)', field: 'roadmapIA', postMessage: () => renderReport() },
];

let currentStep = 0;

function addMessage(text, role = 'agent') {
  const node = document.createElement('div');
  node.className = `msg ${role}`;
  node.textContent = text;
  messagesEl.appendChild(node);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function askCurrent() {
  if (currentStep < steps.length) {
    addMessage(steps[currentStep].question, 'agent');
  } else {
    form.classList.add('hidden');
  }
}

function renderRisks() {
  const tags = session.risques.length
    ? session.risques.map((r) => `<span class="risk critical">${r}</span>`)
    : ['<span class="risk info">Aucun risque critique détecté</span>'];
  riskBadges.innerHTML = tags.join('');
}

function renderScore(score) {
  scoreCard.innerHTML = `
    <article class="kpi">
      <p class="label">Score global de maturité</p>
      <p class="value">${score.total}/100</p>
      <p class="label">${score.level.label}</p>
    </article>
  `;

  const labels = {
    gouvernance: 'Gouvernance',
    conformite: 'Conformité',
    usages: 'Usages',
    competences: 'Compétences',
    pilotage: 'Pilotage',
  };

  pillarCards.innerHTML = Object.entries(score.pillars)
    .map(([key, value]) => `<article class="kpi"><p class="label">${labels[key]}</p><p class="value">${value}/20</p></article>`)
    .join('');
}

function renderActions(actions) {
  actionPlanEl.innerHTML = actions.map((a) => `<li>${a}</li>`).join('');
}

function renderReport() {
  const score = auditApi.computeAuditScore(session);
  const actions = auditApi.buildActionPlan(score);
  session.audit = score;
  session.plan = actions;
  renderRisks();
  renderScore(score);
  renderActions(actions);
  reportPanel.classList.remove('hidden');
  addMessage('Audit terminé ✅ Rapport de maturité généré.', 'agent');
}

function toCsvRows(data) {
  return Object.entries(data)
    .map(([k, v]) => `${JSON.stringify(k)},${JSON.stringify(typeof v === 'object' ? JSON.stringify(v) : String(v))}`)
    .join('\n');
}

function downloadFile(name, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

downloadJsonBtn.addEventListener('click', () => {
  downloadFile('audit-ia-report.json', JSON.stringify({ session, generatedAt: new Date().toISOString() }, null, 2), 'application/json');
});

downloadCsvBtn.addEventListener('click', () => {
  downloadFile('audit-ia-report.csv', toCsvRows({ ...session, generatedAt: new Date().toISOString() }), 'text/csv;charset=utf-8');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const answer = input.value.trim();
  if (!answer) return;

  addMessage(answer, 'user');
  const step = steps[currentStep];
  if (step.field) session[step.field] = answer;
  if (typeof step.onAnswer === 'function') step.onAnswer(answer);
  if (typeof step.postMessage === 'function') step.postMessage();

  currentStep += 1;
  input.value = '';
  askCurrent();
});

askCurrent();
