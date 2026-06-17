// ═══════════════════════════════════════════════
//  NOPSTRACK — App JS
// ═══════════════════════════════════════════════

const BACKEND_URL = 'http://34.50.109.136'; // GKE LoadBalancer IP
const ANALYZE_URL = `${BACKEND_URL}/api/analyze-food`;
const HISTORY_URL = `${BACKEND_URL}/api/history`;

// ── State ──────────────────────────────────────
let selectedFile = null;

// ── DOM refs ───────────────────────────────────
const dropZone    = document.getElementById('drop-zone');
const fileInput   = document.getElementById('foodImage');
const previewWrap = document.getElementById('preview-wrap');
const previewImg  = document.getElementById('preview-img');
const resetBtn    = document.getElementById('reset-btn');
const uploadBtn   = document.getElementById('uploadBtn');
const btnText     = document.getElementById('btn-text');

const resultEmpty   = document.getElementById('result-empty');
const resultContent = document.getElementById('result-content');
const resultLoading = document.getElementById('result-loading');
const resName       = document.getElementById('resName');
const resCal        = document.getElementById('resCal');
const resImg        = document.getElementById('resImg');

// ── Sidebar nav ────────────────────────────────
const navItems   = document.querySelectorAll('.nav-item');
const sections   = document.querySelectorAll('.section');
const topbarTitle = document.getElementById('topbar-title');
const menuBtn    = document.getElementById('menu-btn');
const sidebar    = document.getElementById('sidebar');

const sectionTitles = {
  scanner: 'Pindai Makanan',
  history: 'Riwayat Makanan',
};

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const target = item.dataset.section;
    navItems.forEach(n => n.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    item.classList.add('active');
    document.getElementById(`section-${target}`).classList.add('active');
    topbarTitle.textContent = sectionTitles[target] || target;
    if (window.innerWidth <= 768) sidebar.classList.remove('open');
    if (target === 'history') loadHistory();
  });
});

menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));

// Close sidebar on outside click (mobile)
document.addEventListener('click', e => {
  if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== menuBtn) {
    sidebar.classList.remove('open');
  }
});

// ── Sidebar date ───────────────────────────────
(function updateDate() {
  const el = document.getElementById('sidebar-date');
  const now = new Date();
  el.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
})();

// ── Drop Zone ──────────────────────────────────
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) setFile(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) setFile(fileInput.files[0]);
});

resetBtn.addEventListener('click', clearFile);

function setFile(file) {
  selectedFile = file;
  const url = URL.createObjectURL(file);
  previewImg.src = url;
  dropZone.style.display = 'none';
  previewWrap.style.display = 'block';
  uploadBtn.disabled = false;
  btnText.textContent = 'Pindai Kalori dengan AI';
  // Reset result
  showResultEmpty();
}

function clearFile() {
  selectedFile = null;
  fileInput.value = '';
  previewImg.src = '';
  dropZone.style.display = 'block';
  previewWrap.style.display = 'none';
  uploadBtn.disabled = true;
  btnText.textContent = 'Pilih foto dulu';
  showResultEmpty();
}

function showResultEmpty() {
  resultEmpty.style.display = 'block';
  resultContent.style.display = 'none';
  resultLoading.style.display = 'none';
}
function showResultLoading() {
  resultEmpty.style.display = 'none';
  resultContent.style.display = 'none';
  resultLoading.style.display = 'block';
}
function showResultContent() {
  resultEmpty.style.display = 'none';
  resultContent.style.display = 'flex';
  resultLoading.style.display = 'none';
}

// ── Analyze ────────────────────────────────────
uploadBtn.addEventListener('click', analyzeFood);

async function analyzeFood() {
  if (!selectedFile) return;

  uploadBtn.disabled = true;
  btnText.textContent = 'Memproses...';
  showResultLoading();

  const formData = new FormData();
  formData.append('foodImage', selectedFile);

  try {
    const response = await fetch(ANALYZE_URL, { method: 'POST', body: formData });
    const result = await response.json();

    if (result.success) {
      resName.textContent = result.data.food_name;
      resCal.textContent  = result.data.calories;
      resImg.src          = result.data.image_url;
      showResultContent();
      showToast(`✅ ${result.data.food_name} — ${result.data.calories} kcal`, 'success');
    } else {
      showResultEmpty();
      showToast('❌ Gagal: ' + (result.error || 'Error tidak diketahui'), 'error');
    }
  } catch (err) {
    console.error(err);
    showResultEmpty();
    showToast('❌ Tidak dapat terhubung ke server', 'error');
  } finally {
    uploadBtn.disabled = false;
    btnText.textContent = 'Pindai Kalori dengan AI';
  }
}

// ── History ────────────────────────────────────
document.getElementById('refresh-btn').addEventListener('click', loadHistory);

async function loadHistory() {
  const list = document.getElementById('history-list');
  list.innerHTML = '<div class="empty-state">⏳ Memuat data...</div>';
  try {
    const res  = await fetch(HISTORY_URL);
    const data = await res.json();
    if (!data.length) {
      list.innerHTML = '<div class="empty-state">Belum ada makanan yang dipindai.</div>';
      return;
    }
    list.innerHTML = data.map(item => {
      const date = new Date(item.created_at || item.logged_at || Date.now());
      const timeStr = date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      return `
        <div class="history-item">
          <img class="history-thumb" src="${item.image_url}" alt="${item.food_name}"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><rect width=%2260%22 height=%2260%22 fill=%22%23ffffff10%22 rx=%228%22/><text x=%2230%22 y=%2235%22 text-anchor=%22middle%22 font-size=%2224%22>🍽️</text></svg>'" />
          <div class="history-info">
            <div class="history-name">${item.food_name}</div>
            <div class="history-time">📅 ${timeStr}</div>
          </div>
          <div class="history-kal">
            ${item.calories}
            <span>kcal</span>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    list.innerHTML = '<div class="empty-state">❌ Gagal memuat riwayat. Pastikan backend berjalan.</div>';
  }
}

// ── Toast ──────────────────────────────────────
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}