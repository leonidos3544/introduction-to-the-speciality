const fmt = (num) => {
  const rounded = Math.round(num);
  return Math.abs(num - rounded) < 1e-6 ? rounded : num.toFixed(3);
};

function updateGrid(suffix) {
  const rowsInput = document.getElementById(`rows${suffix}`);
  const colsInput = document.getElementById(`cols${suffix}`);
  let rows = Math.min(Math.max(parseInt(rowsInput.value) || 3, 1), 10);
  let cols = Math.min(Math.max(parseInt(colsInput.value) || 3, 1), 10);
  
  rowsInput.value = rows;
  colsInput.value = cols;
  initGrid(`grid${suffix}`, rows, cols);
}

function initGrid(id, rows, cols) {
  const el = document.getElementById(id);
  el.dataset.rows = rows;
  el.dataset.cols = cols;
  el.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  el.innerHTML = '';
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const inp = document.createElement('input');
      inp.type = 'number'; inp.step = 'any';
      inp.value = (i === j) ? 1 : 0;
      el.appendChild(inp);
    }
  }
}

function readMatrix(id) {
  const el = document.getElementById(id);
  const rows = parseInt(el.dataset.rows);
  const cols = parseInt(el.dataset.cols);
  const inputs = el.querySelectorAll('input');
  const m = [];
  let idx = 0;
  
  for (let i = 0; i < rows; i++) {
    m[i] = [];
    for (let j = 0; j < cols; j++) {
      const val = parseFloat(inputs[idx++].value);
      m[i][j] = isNaN(val) ? 0 : val;
    }
  }
  return m;
}

function renderOutput(data) {
  const out = document.getElementById('output');
  if (typeof data === 'number') {
    out.textContent = `Определитель: ${fmt(data)}`;
  } else if (Array.isArray(data)) {
    out.innerHTML = data.map(r => r.map(v => fmt(v)).join('\t')).join('\n');
  }
}

async function calc(type) {
  const out = document.getElementById('output');
  out.className = 'panel';
  try {
    if (type === 'det') {
      const rows = parseInt(document.getElementById('gridA').dataset.rows);
      const cols = parseInt(document.getElementById('gridA').dataset.cols);
      if (rows !== cols) {
        out.textContent = `⚠️ Определитель существует только для квадратных матриц. Сейчас: ${rows}×${cols}`;
        out.className = 'panel error';
        return;
      }
    }
    const body = { type, a: readMatrix('gridA') };
    if (type === 'mul') body.b = readMatrix('gridB');
    
    const res = await fetch('/api/calc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    renderOutput(json.data);
  } catch (e) {
    out.textContent = `⚠️ ${e.message}`;
    out.className = 'panel error';
  }
}
updateGrid('A');
updateGrid('B');
