const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const EPS = 1e-10;

function det(m) {
  const n = m.length;
  for (let i = 0; i < n; i++) {
    if (m[i].length !== n) throw new Error('Определитель вычисляется только для квадратных матриц');
  }
  const a = m.map(r => [...r]);
  let sign = 1;
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(a[k][i]) > Math.abs(a[maxRow][i])) maxRow = k;
    if (Math.abs(a[maxRow][i]) < EPS) return 0;
    if (maxRow !== i) { [a[i], a[maxRow]] = [a[maxRow], a[i]]; sign *= -1; }
    sign *= a[i][i];
    for (let k = i + 1; k < n; k++) {
      const f = a[k][i] / a[i][i];
      for (let j = i; j < n; j++) a[k][j] -= f * a[i][j];
    }
  }
  return sign;
}

function multiply(a, b) {
  if (a[0].length !== b.length) throw new Error('Несовместимые размерности');
  const res = a.map(() => Array(b[0].length).fill(0));
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b[0].length; j++)
      for (let k = 0; k < a[0].length; k++) res[i][j] += a[i][k] * b[k][j];
  return res;
}

function inverse(m) {
  const n = m.length;
  if (n !== m[0].length) throw new Error('Матрица должна быть квадратной');
  const aug = m.map((r, i) => [...r, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]);
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) maxRow = k;
    if (Math.abs(aug[maxRow][i]) < EPS) throw new Error('Матрица вырождена');
    if (maxRow !== i) [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];
    const p = aug[i][i];
    for (let j = 0; j < 2 * n; j++) aug[i][j] /= p;
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const f = aug[k][i];
      for (let j = 0; j < 2 * n; j++) aug[k][j] -= f * aug[i][j];
    }
  }
  return aug.map(r => r.slice(n));
}


app.post('/api/calc', (req, res) => {
  try {
    const { type, a, b } = req.body;
    let result;
    if (type === 'det') result = det(a);
    else if (type === 'mul') result = multiply(a, b);
    else if (type === 'inv') result = inverse(a);
    else throw new Error('Неизвестный тип операции');
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => console.log(`✅ Запущено: http://localhost:${PORT}`));
