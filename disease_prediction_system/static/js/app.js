/* ── STATE ── */
let selectedSymptoms = new Set();
let filterDebounce = null;

/* ── DOM REFS ── */
const symptomList    = document.getElementById('symptom-list');
const selectedTags   = document.getElementById('selected-tags');
const emptySelected  = document.getElementById('empty-selected');
const selectedCount  = document.getElementById('selected-count');
const predictBtn     = document.getElementById('predict-btn');
const searchInput    = document.getElementById('symptom-search');
const clearSearchBtn = document.getElementById('clear-search');
const resultPanel    = document.getElementById('result-panel');
const suggestionPanel= document.getElementById('suggestion-panel');
const suggestionList = document.getElementById('suggestion-list');
const loadingOverlay = document.getElementById('loading-overlay');
const toast          = document.getElementById('toast');

/* ── SEARCH ── */
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  clearSearchBtn.classList.toggle('visible', q.length > 0);

  let visible = 0;
  document.querySelectorAll('.symptom-chip').forEach(chip => {
    const label = chip.dataset.label.toLowerCase();
    const value = chip.dataset.value.toLowerCase();
    const match = label.includes(q) || value.includes(q);
    chip.classList.toggle('hidden', !match);
    if (match) visible++;
  });

  // Show no-results message
  let noRes = document.getElementById('no-results-msg');
  if (visible === 0 && q.length > 0) {
    if (!noRes) {
      noRes = document.createElement('div');
      noRes.id = 'no-results-msg';
      noRes.className = 'no-results';
      noRes.textContent = `No symptoms found for "${q}"`;
      symptomList.appendChild(noRes);
    } else {
      noRes.textContent = `No symptoms found for "${q}"`;
    }
  } else if (noRes) {
    noRes.remove();
  }
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.classList.remove('visible');
  document.querySelectorAll('.symptom-chip').forEach(c => c.classList.remove('hidden'));
  const noRes = document.getElementById('no-results-msg');
  if (noRes) noRes.remove();
  searchInput.focus();
});

/* ── TOGGLE SYMPTOM ── */
function toggleSymptom(chip) {
  const value = chip.dataset.value;
  const label = chip.dataset.label;

  if (selectedSymptoms.has(value)) {
    removeSymptom(value);
  } else {
    addSymptom(value, label, chip);
  }
}

function addSymptom(value, label, chip) {
  if (selectedSymptoms.has(value)) return;
  selectedSymptoms.add(value);

  // Mark chip
  if (chip) {
    chip.classList.add('selected');
    chip.querySelector('.chip-icon').textContent = '✓';
  }

  // Add tag
  renderSelectedTags();
  updateUI();
  scheduleFilter();
  showToast(`Added: ${label}`);
}

function removeSymptom(value) {
  selectedSymptoms.delete(value);

  // Unmark chip
  const chip = document.querySelector(`.symptom-chip[data-value="${value}"]`);
  if (chip) {
    chip.classList.remove('selected');
    chip.querySelector('.chip-icon').textContent = '＋';
  }

  renderSelectedTags();
  updateUI();
  scheduleFilter();
}

/* ── RENDER SELECTED TAGS ── */
function renderSelectedTags() {
  // Remove old tags (keep empty state)
  document.querySelectorAll('.selected-tag').forEach(t => t.remove());

  if (selectedSymptoms.size === 0) {
    emptySelected.style.display = 'flex';
    return;
  }

  emptySelected.style.display = 'none';

  selectedSymptoms.forEach(value => {
    const label = ALL_SYMPTOMS.find(s => s.value === value)?.label || value;
    const tag = document.createElement('div');
    tag.className = 'selected-tag';
    tag.dataset.value = value;
    tag.innerHTML = `<span>${label}</span><span class="remove-icon">✕</span>`;
    tag.addEventListener('click', () => removeSymptom(value));
    selectedTags.appendChild(tag);
  });
}

/* ── UPDATE UI STATE ── */
function updateUI() {
  const count = selectedSymptoms.size;
  selectedCount.textContent = `${count} selected`;
  predictBtn.disabled = count === 0;

  // Update steps
  document.getElementById('step-1').classList.toggle('active', count === 0);
  document.getElementById('step-2').classList.toggle('active', count > 0);
  document.getElementById('step-2').classList.toggle('done', false);
}

/* ── FILTER (suggestions) ── */
function scheduleFilter() {
  clearTimeout(filterDebounce);
  filterDebounce = setTimeout(fetchFilter, 400);
}

async function fetchFilter() {
  if (selectedSymptoms.size === 0) {
    suggestionPanel.style.display = 'none';
    return;
  }

  try {
    const res = await fetch('/filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected: [...selectedSymptoms] })
    });
    const data = await res.json();

    if (data.symptoms && data.symptoms.length > 0) {
      suggestionPanel.style.display = 'block';
      suggestionList.innerHTML = '';
      data.symptoms.slice(0, 15).forEach(s => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = s.label;
        chip.addEventListener('click', () => {
          addSymptom(s.value, s.label, document.querySelector(`.symptom-chip[data-value="${s.value}"]`));
        });
        suggestionList.appendChild(chip);
      });
    } else {
      suggestionPanel.style.display = 'none';
    }
  } catch (e) {
    console.error('Filter error:', e);
  }
}

/* ── PREDICT ── */
async function predict() {
  if (selectedSymptoms.size === 0) return;

  loadingOverlay.classList.add('active');
  resultPanel.style.display = 'none';

  try {
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected: [...selectedSymptoms] })
    });
    const data = await res.json();

    if (data.error) {
      showToast('⚠️ ' + data.error);
      return;
    }

    renderResult(data);

    // Update steps
    document.getElementById('step-2').classList.add('done');
    document.getElementById('step-2').classList.remove('active');
    document.getElementById('step-3').classList.add('active');

    // Scroll to result
    setTimeout(() => resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

  } catch (e) {
    showToast('⚠️ Network error. Please try again.');
    console.error(e);
  } finally {
    loadingOverlay.classList.remove('active');
  }
}

/* ── RENDER RESULT ── */
function renderResult(data) {
  document.getElementById('result-icon').textContent = data.icon || '🏥';
  document.getElementById('result-disease').textContent = data.disease;

  const sevEl = document.getElementById('result-severity');
  sevEl.textContent = data.severity || 'Unknown';
  sevEl.className = `severity-badge severity-${data.severity || 'Unknown'}`;

  document.getElementById('result-symptoms').textContent =
    `Based on ${data.symptom_count} symptom${data.symptom_count !== 1 ? 's' : ''}`;

  // Show/hide low confidence warning
  const warning = document.getElementById('confidence-warning');
  warning.style.display = data.low_confidence ? 'block' : 'none';

  // Top diseases bar chart
  const list = document.getElementById('top-diseases-list');
  list.innerHTML = '';

  if (data.top_diseases && data.top_diseases.length > 0) {
    data.top_diseases.forEach((d, i) => {
      const item = document.createElement('div');
      item.className = 'disease-bar-item';
      item.style.animationDelay = `${i * 0.08}s`;
      item.innerHTML = `
        <span class="bar-rank">#${d.rank}</span>
        <span class="bar-icon">${d.icon}</span>
        <div class="bar-info">
          <div class="bar-name">${d.disease}</div>
          <div class="bar-track">
            <div class="bar-fill" data-width="${d.score}" style="background:${d.color}; width:0%"></div>
          </div>
        </div>
        <span class="bar-score">${d.score}%</span>
      `;
      list.appendChild(item);
    });

    // Animate bars after render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.querySelectorAll('.bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.width + '%';
        });
      });
    });
  }

  resultPanel.style.display = 'block';
}

/* ── CLEAR ALL ── */
function clearAll() {
  selectedSymptoms.clear();
  document.querySelectorAll('.symptom-chip.selected').forEach(chip => {
    chip.classList.remove('selected');
    chip.querySelector('.chip-icon').textContent = '＋';
  });
  renderSelectedTags();
  updateUI();
  suggestionPanel.style.display = 'none';
  resultPanel.style.display = 'none';

  // Reset steps
  document.getElementById('step-1').classList.add('active');
  document.getElementById('step-2').classList.remove('active', 'done');
  document.getElementById('step-3').classList.remove('active', 'done');

  showToast('Cleared all symptoms');
}

/* ── RESET ALL ── */
function resetAll() {
  clearAll();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── TOAST ── */
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ── KEYBOARD SHORTCUT ── */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (!predictBtn.disabled) predict();
  }
  if (e.key === 'Escape') {
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');
    document.querySelectorAll('.symptom-chip').forEach(c => c.classList.remove('hidden'));
  }
  // Focus search on '/'
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
  }
});
