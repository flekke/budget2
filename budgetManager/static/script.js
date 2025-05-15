const monthKey = new Date().toISOString().slice(0, 7);
document.getElementById('currentMonth').textContent = `📅 ${monthKey}`;

let budgets = {};
let logs = [];

function fetchBudgets() {
  fetch('/api/getBudgets')
    .then(res => res.json())
    .then(data => {
      budgets = data;
      updateCategoryDropdown();
      renderCategoryList();
    });
}

function fetchLogs() {
  fetch('/api/getLogs')
    .then(res => res.json())
    .then(data => {
      logs = data;
      renderCategoryList();
    });
}

function addExpense() {
  const cat = document.getElementById('categorySelect').value;
  const amt = parseFloat(document.getElementById('amountInput').value);
  const desc = document.getElementById('descInput').value.trim();
  if (!cat || isNaN(amt)) return alert("Enter valid data.");
  const entry = { date: new Date().toISOString().split('T')[0], category: cat, amount: amt, desc };
  fetch('/api/addLog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  }).then(() => fetchLogs());
  document.getElementById('amountInput').value = '';
  document.getElementById('descInput').value = '';
}

function addOrUpdateCategory() {
  const name = document.getElementById('newCategoryInput').value.trim();
  const budget = parseFloat(document.getElementById('newBudgetInput').value);
  if (!name || isNaN(budget)) return alert("Enter valid category and budget.");
  budgets[name] = budget;
  fetch('/api/updateBudgets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budgets)
  }).then(() => fetchBudgets());
  document.getElementById('newCategoryInput').value = '';
  document.getElementById('newBudgetInput').value = '';
}

function updateCategoryDropdown() {
  const select = document.getElementById('categorySelect');
  select.innerHTML = '';
  for (const cat in budgets) {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  }
}

function renderCategoryList() {
  const ul = document.getElementById('categoryList');
  if (!ul) return;
  ul.innerHTML = '';
  for (const cat in budgets) {
    const used = logs.filter(l => l.category === cat).reduce((sum, l) => sum + l.amount, 0);
    const available = budgets[cat] - used;
    const li = document.createElement('li');
    li.innerHTML = `
      <span style="color:#dc2626; font-weight:bold;">${cat}</span> - ${budgets[cat]} kr
      (<span>Used: ${used} kr</span>, <span>Available: ${available} kr</span>)
    `;
    ul.appendChild(li);
  }
}

function resetLogs() {
  if (!confirm(`Reset all expenses for ${monthKey}?`)) return;
  logs = [];
  fetch('/api/addLog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([])
  }).then(() => fetchLogs());
}

function downloadBackup() {
  fetch("/api/getBudgets")
    .then(res => res.json())
    .then(b => {
      const blob = new Blob([JSON.stringify(b, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `budgets_backup_${monthKey}.json`;
      a.click();
    });

  fetch("/api/getLogs")
    .then(res => res.json())
    .then(l => {
      const blob = new Blob([JSON.stringify(l, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `logs_backup_${monthKey}.json`;
      a.click();
    });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchBudgets();
  fetchLogs();
});

