(function () {
  const form = document.getElementById('expense-form');
  const dateInput = document.getElementById('expense-date');
  const nameInput = document.getElementById('expense-name');
  const amountInput = document.getElementById('expense-amount');
  const dateError = document.getElementById('date-error');
  const nameError = document.getElementById('name-error');
  const amountError = document.getElementById('amount-error');
  const expenseList = document.getElementById('expense-list');
  const totalDisplay = document.getElementById('total-amount');

  let expenses = [];

  (function setDefaultDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = year + '-' + month + '-' + day;
  })();

  function formatNaira(amount) {
    return '\u20A6' + Number(amount).toLocaleString('en-NG');
  }

  function formatDate(dateStr) {
    var parts = dateStr.split('-');
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  function formatTimestamp(isoStr) {
    var date = new Date(isoStr);
    var formatted = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    var time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return formatted + ' \u2022 ' + time;
  }

  function getTotal() {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  function updateTotal() {
    totalDisplay.textContent = formatNaira(getTotal());
  }

  function clearErrors() {
    dateError.textContent = '';
    nameError.textContent = '';
    amountError.textContent = '';
    dateInput.closest('.form-group').classList.remove('error');
    nameInput.closest('.form-group').classList.remove('error');
    amountInput.closest('.form-group').classList.remove('error');
  }

  function showError(input, errorEl, message) {
    errorEl.textContent = message;
    input.closest('.form-group').classList.add('error');
  }

  function validate(date, name, amount) {
    var valid = true;
    clearErrors();

    if (!date) {
      showError(dateInput, dateError, 'Please select a date.');
      valid = false;
    }

    if (!name || name.trim() === '') {
      showError(nameInput, nameError, 'Please enter an expense name.');
      valid = false;
    }

    var num = Number(amount);
    if (!amount || amount.trim() === '') {
      showError(amountInput, amountError, 'Please enter a valid amount.');
      valid = false;
    } else if (isNaN(num)) {
      showError(amountInput, amountError, 'Please enter a valid amount.');
      valid = false;
    } else if (num <= 0) {
      showError(amountInput, amountError, 'Amount must be greater than zero.');
      valid = false;
    }

    return valid;
  }

  function renderExpenses() {
    expenseList.innerHTML = '';

    if (expenses.length === 0) {
      expenseList.innerHTML =
        '<div class="empty-state">No expenses added yet.</div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    expenses.forEach(function (expense) {
      var item = document.createElement('div');
      item.className = 'expense-item';

      var left = document.createElement('div');
      left.className = 'expense-left';

      var info = document.createElement('div');
      info.className = 'expense-info';

      var nameSpan = document.createElement('span');
      nameSpan.className = 'expense-name';
      nameSpan.textContent = expense.name;

      var dot = document.createElement('span');
      dot.className = 'expense-dot';
      dot.textContent = '\u00B7';

      var amountSpan = document.createElement('span');
      amountSpan.className = 'expense-amount';
      amountSpan.textContent = formatNaira(expense.amount);

      info.appendChild(nameSpan);
      info.appendChild(dot);
      info.appendChild(amountSpan);
      left.appendChild(info);

      var meta = document.createElement('div');
      meta.className = 'expense-meta';

      var tracked = document.createElement('span');
      tracked.className = 'expense-tracked';
      tracked.textContent = 'Tracked For: ' + formatDate(expense.trackedDate);

      var logged = document.createElement('span');
      logged.className = 'expense-logged';
      logged.textContent = 'Logged: ' + formatTimestamp(expense.loggedAt);

      meta.appendChild(tracked);
      meta.appendChild(logged);
      left.appendChild(meta);

      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', 'Delete ' + expense.name);
      deleteBtn.addEventListener('click', function () {
        deleteExpense(expense.id);
      });

      item.appendChild(left);
      item.appendChild(deleteBtn);
      fragment.appendChild(item);
    });

    expenseList.appendChild(fragment);
  }

  function deleteExpense(id) {
    expenses = expenses.filter(function (e) {
      return e.id !== id;
    });
    renderExpenses();
    updateTotal();
    nameInput.focus();
  }

  function addExpense(date, name, amount) {
    var expense = {
      id: Date.now(),
      trackedDate: date,
      name: name.trim(),
      amount: Number(amount),
      loggedAt: new Date().toISOString(),
    };

    expenses.push(expense);
    renderExpenses();
    updateTotal();
    nameInput.value = '';
    amountInput.value = '';
    clearErrors();
    nameInput.focus();
  }

  function handleSubmit(e) {
    e.preventDefault();

    var date = dateInput.value;
    var name = nameInput.value;
    var amount = amountInput.value;

    if (!validate(date, name, amount)) return;

    addExpense(date, name, amount);
  }

  form.addEventListener('submit', handleSubmit);
  nameInput.focus();
})();
