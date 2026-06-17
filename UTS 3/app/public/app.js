/* ─────────────────────────────────────────────
   KaloriTrack — Frontend JavaScript
───────────────────────────────────────────── */
const API = '';  // same-origin; change to full URL if serving separately

// ─── State ────────────────────────────────────
let currentDate = new Date().toISOString().split('T')[0];
let allLogs = [];
let summary = {};
let historyFilter = 'all';

// ─── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupDatePicker();
  setupNav();
  setupForms();
  setupModal();
  renderSidebarDate();
  renderTips();
  renderQuickPicks();
  injectRingGradient();
  loadAll();
});

function setupDatePicker() {
  const dp = document.getElementById('date-picker');
  dp.value = currentDate;
  dp.addEventListener('change', () => {
    currentDate = dp.value;
    loadAll();
  });
}

function loadAll() {
  loadSummary();
  loadLogs();
  loadWeeklyStats();
}

// ─── Navigation ───────────────────────────────
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const sec = item.dataset.section;
      switchSection(sec);
      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
      }
    });
  });

  document.getElementById('menu-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

function switchSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
  document.getElementById(`nav-${name}`).classList.add('active');

  const titles = { dashboard:'Dashboard', log:'Catat Makanan', history:'Riwayat', stats:'Statistik', goals:'Target Harian' };
  document.getElementById('topbar-title').textContent = titles[name] || name;
}

// ─── API Helpers ──────────────────────────────
async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(API + path, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
    throw err;
  }
}

// ─── Load Summary ─────────────────────────────
async function loadSummary() {
  try {
    summary = await apiFetch(`/api/summary?date=${currentDate}`);
    renderRing();
    renderMacros();
    updateGoalInputs();
  } catch (_) {}
}

function renderRing() {
  const consumed = Math.round(summary.total_calories || 0);
  const goal     = Math.round(summary.calorie_goal   || 2000);
  const remain   = Math.max(0, goal - consumed);
  const pct      = Math.min(100, Math.round((consumed / goal) * 100));

  document.getElementById('ring-consumed').textContent = consumed.toLocaleString();
  document.getElementById('ring-goal').textContent     = goal.toLocaleString();
  document.getElementById('ring-remain').textContent   = remain.toLocaleString();
  document.getElementById('ring-pct').textContent      = pct + '%';

  // Animate ring (circumference = 2π × 65 ≈ 408.41)
  const circumf = 408.41;
  const offset  = circumf - (pct / 100) * circumf;
  document.getElementById('calorie-ring').style.strokeDashoffset = offset;

  // Greeting
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Selamat pagi!' : hour < 17 ? 'Selamat siang!' : 'Selamat malam!';
  document.getElementById('greeting-sub').textContent =
    `${greet} Kamu sudah mengonsumsi ${consumed} dari ${goal} kal hari ini.`;
}

function renderMacros() {
  const macros = [
    { key: 'protein', valId: 'protein-val', goalId: 'protein-goal', barId: 'protein-bar' },
    { key: 'carbs',   valId: 'carbs-val',   goalId: 'carbs-goal',   barId: 'carbs-bar'   },
    { key: 'fat',     valId: 'fat-val',      goalId: 'fat-goal',     barId: 'fat-bar'     },
  ];
  macros.forEach(m => {
    const val  = parseFloat(summary[`total_${m.key}`] || 0).toFixed(1);
    const goal = parseFloat(summary[`${m.key}_goal`]  || 0).toFixed(1);
    const pct  = goal > 0 ? Math.min(100, (val / goal) * 100) : 0;
    document.getElementById(m.valId).textContent  = val;
    document.getElementById(m.goalId).textContent = goal;
    document.getElementById(m.barId).style.width  = pct + '%';
  });
}

function updateGoalInputs() {
  document.getElementById('goal-cal').value     = summary.calorie_goal   || 2000;
  document.getElementById('goal-protein').value = summary.protein_goal   || 150;
  document.getElementById('goal-carbs').value   = summary.carbs_goal     || 250;
  document.getElementById('goal-fat').value     = summary.fat_goal       || 65;
}

// ─── Load Logs ────────────────────────────────
async function loadLogs() {
  try {
    allLogs = await apiFetch(`/api/logs?date=${currentDate}`);
    renderDashboardMeals();
    renderHistory();
  } catch (_) {}
}

function renderDashboardMeals() {
  const el = document.getElementById('dashboard-meal-list');
  if (!allLogs.length) {
    el.innerHTML = '<div class="empty-state">Belum ada makanan yang dicatat hari ini.</div>';
    return;
  }
  el.innerHTML = allLogs.slice(0, 6).map(log => mealItemHTML(log)).join('');
  el.querySelectorAll('.meal-del').forEach(btn => {
    btn.addEventListener('click', () => deleteLog(btn.dataset.id));
  });
}

function renderHistory() {
  const filtered = historyFilter === 'all' ? allLogs : allLogs.filter(l => l.meal_type === historyFilter);
  const el = document.getElementById('history-list');
  if (!filtered.length) {
    el.innerHTML = '<div class="empty-state">Tidak ada data untuk tanggal ini.</div>';
    return;
  }
  el.innerHTML = filtered.map(log => historyItemHTML(log)).join('');
  el.querySelectorAll('.history-del').forEach(btn => {
    btn.addEventListener('click', () => deleteLog(btn.dataset.id));
  });
}

function mealItemHTML(log) {
  const badge = { breakfast:'badge-breakfast', lunch:'badge-lunch', dinner:'badge-dinner', snack:'badge-snack' };
  const label = { breakfast:'Sarapan', lunch:'Siang', dinner:'Malam', snack:'Camilan' };
  return `
    <div class="meal-item">
      <span class="meal-badge ${badge[log.meal_type] || 'badge-snack'}">${label[log.meal_type] || log.meal_type}</span>
      <span class="meal-name">${escHtml(log.name)}</span>
      <span class="meal-kal">${log.calories} kal</span>
      <button class="meal-del" data-id="${log.id}" title="Hapus">🗑</button>
    </div>`;
}

function historyItemHTML(log) {
  const time = new Date(log.logged_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
  const badge = { breakfast:'badge-breakfast', lunch:'badge-lunch', dinner:'badge-dinner', snack:'badge-snack' };
  return `
    <div class="history-item">
      <span class="meal-badge ${badge[log.meal_type] || 'badge-snack'}">${log.meal_type}</span>
      <span class="history-name">${escHtml(log.name)}</span>
      <span class="history-macros">P:${parseFloat(log.protein||0).toFixed(1)}g C:${parseFloat(log.carbs||0).toFixed(1)}g F:${parseFloat(log.fat||0).toFixed(1)}g</span>
      <span class="history-kal">${log.calories} kal</span>
      <span class="history-time">${time}</span>
      <button class="history-del" data-id="${log.id}" title="Hapus">🗑</button>
    </div>`;
}

// ─── Delete Log ───────────────────────────────
async function deleteLog(id) {
  try {
    await apiFetch(`/api/logs/${id}`, { method: 'DELETE' });
    showToast('✅ Makanan dihapus', 'success');
    await loadAll();
  } catch (_) {}
}

// ─── Forms ────────────────────────────────────
function setupForms() {
  // Main food form
  document.getElementById('food-form').addEventListener('submit', async e => {
    e.preventDefault();
    await submitLog({
      name:      document.getElementById('food-name').value.trim(),
      calories:  parseInt(document.getElementById('food-calories').value),
      protein:   parseFloat(document.getElementById('food-protein').value) || 0,
      carbs:     parseFloat(document.getElementById('food-carbs').value)   || 0,
      fat:       parseFloat(document.getElementById('food-fat').value)     || 0,
      meal_type: document.getElementById('food-meal').value,
    });
    document.getElementById('food-form').reset();
  });

  // Goals form
  document.getElementById('goals-form').addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await apiFetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calorie_goal: parseInt(document.getElementById('goal-cal').value),
          protein_goal: parseFloat(document.getElementById('goal-protein').value),
          carbs_goal:   parseFloat(document.getElementById('goal-carbs').value),
          fat_goal:     parseFloat(document.getElementById('goal-fat').value),
        }),
      });
      showToast('🎯 Target berhasil disimpan!', 'success');
      await loadSummary();
    } catch (_) {}
  });

  // History filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      historyFilter = btn.dataset.filter;
      renderHistory();
    });
  });
}

async function submitLog(data) {
  try {
    await apiFetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    showToast(`✅ ${data.name} berhasil dicatat!`, 'success');
    await loadAll();
  } catch (_) {}
}

// ─── Modal ────────────────────────────────────
function setupModal() {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('quick-add-btn').addEventListener('click', () => {
    overlay.classList.add('open');
  });
  document.getElementById('modal-close').addEventListener('click', () => {
    overlay.classList.remove('open');
  });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  document.getElementById('quick-form').addEventListener('submit', async e => {
    e.preventDefault();
    await submitLog({
      name:      document.getElementById('q-name').value.trim(),
      calories:  parseInt(document.getElementById('q-cal').value),
      meal_type: document.getElementById('q-meal').value,
    });
    document.getElementById('quick-form').reset();
    overlay.classList.remove('open');
  });
}

// ─── Weekly Stats ─────────────────────────────
async function loadWeeklyStats() {
  try {
    const data = await apiFetch('/api/stats/weekly');
    renderBarChart(data);
    renderDonut(data);
    renderWeeklyTable(data);
  } catch (_) {}
}

function renderBarChart(data) {
  const el = document.getElementById('bar-chart');
  if (!data.length) { el.innerHTML = '<div class="empty-state">Belum ada data minggu ini.</div>'; return; }

  const maxKal = Math.max(...data.map(d => d.total_calories), 1);
  // Pad to 7 days
  const days = getLast7Days();
  const map   = {};
  data.forEach(d => { map[d.date] = d; });

  el.innerHTML = days.map(day => {
    const d    = map[day] || { total_calories: 0 };
    const kal  = Math.round(d.total_calories);
    const pct  = (kal / maxKal) * 100;
    const lbl  = new Date(day + 'T00:00:00').toLocaleDateString('id-ID', { weekday:'short' });
    return `
      <div class="bar-col">
        <div class="bar-fill" style="height:${Math.max(pct, 2)}%" data-val="${kal} kal"></div>
        <div class="bar-label">${lbl}</div>
      </div>`;
  }).join('');
}

function renderDonut(data) {
  if (!data.length) return;
  const totP = data.reduce((s,d) => s + parseFloat(d.total_protein || 0), 0);
  const totC = data.reduce((s,d) => s + parseFloat(d.total_carbs   || 0), 0);
  const totF = data.reduce((s,d) => s + parseFloat(d.total_fat     || 0), 0);
  const total = totP + totC + totF || 1;

  const circ = 2 * Math.PI * 70; // r=70
  const pPct = totP / total;
  const cPct = totC / total;
  const fPct = totF / total;

  let offset = 0;
  const segs = [
    { id: 'donut-protein', pct: pPct, color: '#22d3a0', label: 'Protein', val: totP.toFixed(1) },
    { id: 'donut-carbs',   pct: cPct, color: '#60a5fa', label: 'Karbo',   val: totC.toFixed(1) },
    { id: 'donut-fat',     pct: fPct, color: '#fb923c', label: 'Lemak',   val: totF.toFixed(1) },
  ];

  const legend = document.getElementById('donut-legend');
  legend.innerHTML = '';

  segs.forEach(seg => {
    const dash    = circ * seg.pct;
    const gap     = circ - dash;
    const el      = document.getElementById(seg.id);
    el.setAttribute('stroke-dasharray', `${dash} ${gap}`);
    el.setAttribute('stroke-dashoffset', -offset);
    offset += dash;

    legend.innerHTML += `
      <div class="legend-item">
        <div class="legend-dot" style="background:${seg.color}"></div>
        <span>${seg.label}: <strong>${seg.val}g</strong> (${Math.round(seg.pct*100)}%)</span>
      </div>`;
  });
}

function renderWeeklyTable(data) {
  const tbody = document.getElementById('weekly-tbody');
  if (!data.length) { tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Tidak ada data</td></tr>'; return; }
  tbody.innerHTML = data.map(d => `
    <tr>
      <td>${new Date(d.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'short' })}</td>
      <td><strong>${Math.round(d.total_calories)}</strong> kal</td>
      <td>${parseFloat(d.total_protein).toFixed(1)}g</td>
      <td>${parseFloat(d.total_carbs).toFixed(1)}g</td>
      <td>${parseFloat(d.total_fat).toFixed(1)}g</td>
    </tr>`).join('');
}

// ─── Quick Picks ──────────────────────────────
const QUICK_FOODS = [
  { name:'Nasi Putih',    calories:204, protein:4.2,  carbs:44.5, fat:0.4,  meal_type:'lunch' },
  { name:'Ayam Goreng',   calories:320, protein:28.5, carbs:8.2,  fat:18.6, meal_type:'lunch' },
  { name:'Telur Rebus',   calories:78,  protein:6.3,  carbs:0.6,  fat:5.3,  meal_type:'breakfast' },
  { name:'Roti Gandum',   calories:69,  protein:3.6,  carbs:12.4, fat:1.1,  meal_type:'breakfast' },
  { name:'Pisang',        calories:89,  protein:1.1,  carbs:23.0, fat:0.3,  meal_type:'snack' },
  { name:'Susu Full',     calories:149, protein:8.0,  carbs:11.7, fat:8.0,  meal_type:'breakfast' },
  { name:'Tempe Goreng',  calories:166, protein:9.4,  carbs:10.0, fat:9.8,  meal_type:'lunch' },
  { name:'Mie Goreng',    calories:430, protein:10.6, carbs:64.2, fat:13.4, meal_type:'lunch' },
  { name:'Salad Sayur',   calories:70,  protein:2.5,  carbs:10.0, fat:2.0,  meal_type:'lunch' },
  { name:'Greek Yogurt',  calories:100, protein:17.0, carbs:6.0,  fat:0.7,  meal_type:'snack' },
];

function renderQuickPicks() {
  const el = document.getElementById('quick-picks-grid');
  el.innerHTML = QUICK_FOODS.map((f, i) => `
    <button class="quick-pick-btn" data-idx="${i}" id="qpick-${i}">
      <div class="qp-name">${f.name}</div>
      <div class="qp-kal">${f.calories} kal</div>
    </button>`).join('');

  el.querySelectorAll('.quick-pick-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const f = QUICK_FOODS[btn.dataset.idx];
      await submitLog(f);
    });
  });
}

// ─── Tips ─────────────────────────────────────
const TIPS = [
  '💧 Minum 8 gelas air putih sehari untuk mendukung metabolisme.',
  '🥩 Konsumsi protein yang cukup membantu menjaga massa otot.',
  '🌿 Tambahkan sayuran hijau di setiap makan untuk serat & vitamin.',
  '⏰ Makan dengan jadwal teratur membantu mengontrol nafsu makan.',
  '🏃 Kombinasi diet sehat dan olahraga rutin untuk hasil optimal.',
  '🍽️ Kunyah makanan perlahan untuk merasa kenyang lebih lama.',
];

function renderTips() {
  const el = document.getElementById('tips-list');
  const picks = TIPS.sort(() => Math.random() - .5).slice(0, 3);
  el.innerHTML = picks.map(t => `<div class="tip-item">${t}</div>`).join('');
}

// ─── Sidebar Date ──────────────────────────────
function renderSidebarDate() {
  const el = document.getElementById('sidebar-date');
  el.textContent = new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

// ─── SVG Gradient for Ring ────────────────────
function injectRingGradient() {
  const svg = document.querySelector('.ring-svg');
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>`;
  svg.prepend(defs);

  // Fix stroke reference
  document.getElementById('calorie-ring').setAttribute('stroke', 'url(#ringGrad)');
}

// ─── Helpers ──────────────────────────────────
function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type = 'success') {
  const tc = document.getElementById('toast-container');
  const t  = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 3000);
  setTimeout(() => t.remove(), 3400);
}
