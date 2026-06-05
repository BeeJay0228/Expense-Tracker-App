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
  const saveDayBtn = document.getElementById('save-day-btn');
  const historyList = document.getElementById('history-list');
  const successModal = document.getElementById('success-modal');
  const closeSuccessBtn = document.getElementById('close-success-btn');
  const detailModal = document.getElementById('detail-modal');
  const detailHeading = document.getElementById('detail-date-heading');
  const detailExpenses = document.getElementById('detail-expenses');
  const detailTotal = document.getElementById('detail-total');
  const closeDetailBtn = document.getElementById('close-detail-btn');

  let expenses = [];
  var savedDays = {};
  var STORAGE_KEY = 'expense-tracker-history';

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

  function formatDateShort(dateStr) {
    var parts = dateStr.split('-');
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  function getTotal() {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  function updateTotal() {
    totalDisplay.textContent = formatNaira(getTotal());
    saveDayBtn.disabled = expenses.length === 0;
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

      var logged = document.createElement('span');
      logged.className = 'expense-logged';
      logged.textContent = 'Logged: ' + formatTimestamp(expense.loggedAt);

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
    var dateParts = date.split('-');
    var now = new Date();
    var loggedDate = new Date(
      parseInt(dateParts[0], 10),
      parseInt(dateParts[1], 10) - 1,
      parseInt(dateParts[2], 10),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );

    var expense = {
      id: Date.now(),
      name: name.trim(),
      amount: Number(amount),
      loggedAt: loggedDate.toISOString(),
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

  function loadSavedDays() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        savedDays = JSON.parse(stored);
      } catch (_) {
        savedDays = {};
      }
    }
  }

  function saveSavedDays() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDays));
  }

  function renderHistory() {
    var dates = Object.keys(savedDays).sort().reverse();

    if (dates.length === 0) {
      historyList.innerHTML =
        '<div class="empty-state">No saved days yet.</div>';
      return;
    }

    var fragment = document.createDocumentFragment();

    dates.forEach(function (dateStr) {
      var day = savedDays[dateStr];
      var total = day.expenses.reduce(function (sum, e) {
        return sum + e.amount;
      }, 0);
      var count = day.expenses.length;

      var entry = document.createElement('div');
      entry.className = 'history-entry';
      entry.setAttribute('tabindex', '0');
      entry.setAttribute('role', 'button');
      entry.setAttribute('aria-label', 'View expenses for ' + formatDateShort(dateStr));

      var left = document.createElement('div');
      left.className = 'history-entry-left';

      var dateEl = document.createElement('span');
      dateEl.className = 'history-entry-date';
      dateEl.textContent = formatDateShort(dateStr);

      var countEl = document.createElement('span');
      countEl.className = 'history-entry-count';
      countEl.textContent = count + ' expense' + (count !== 1 ? 's' : '');

      left.appendChild(dateEl);
      left.appendChild(countEl);

      var totalEl = document.createElement('span');
      totalEl.className = 'history-entry-total';
      totalEl.textContent = formatNaira(total);

      entry.appendChild(left);
      entry.appendChild(totalEl);

      entry.addEventListener('click', function () {
        showDayDetail(dateStr);
      });

      entry.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showDayDetail(dateStr);
        }
      });

      fragment.appendChild(entry);
    });

    historyList.innerHTML = '';
    historyList.appendChild(fragment);
  }

  function saveDay() {
    if (expenses.length === 0) return;

    expenses.forEach(function (expense) {
      var dateKey = expense.loggedAt.slice(0, 10);

      if (!savedDays[dateKey]) {
        savedDays[dateKey] = {
          expenses: [],
          savedAt: new Date().toISOString(),
        };
      }

      savedDays[dateKey].expenses.push({
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        loggedAt: expense.loggedAt,
      });
    });

    saveSavedDays();
    expenses = [];
    renderExpenses();
    updateTotal();
    renderHistory();
    showSuccessModal();
  }

  function showSuccessModal() {
    successModal.hidden = false;
  }

  function hideSuccessModal() {
    successModal.hidden = true;
    nameInput.focus();
  }

  function showDayDetail(dateStr) {
    var day = savedDays[dateStr];
    if (!day) return;

    detailHeading.textContent = formatDateShort(dateStr);

    var total = day.expenses.reduce(function (sum, e) {
      return sum + e.amount;
    }, 0);

    detailExpenses.innerHTML = '';

    day.expenses.forEach(function (expense) {
      var item = document.createElement('div');
      item.className = 'detail-item';

      var nameEl = document.createElement('span');
      nameEl.className = 'detail-item-name';
      nameEl.textContent = expense.name;

      var amountEl = document.createElement('span');
      amountEl.className = 'detail-item-amount';
      amountEl.textContent = formatNaira(expense.amount);

      item.appendChild(nameEl);
      item.appendChild(amountEl);
      detailExpenses.appendChild(item);
    });

    detailTotal.textContent = 'Total: ' + formatNaira(total);
    detailModal.hidden = false;
  }

  function hideDayDetail() {
    detailModal.hidden = true;
  }

  loadSavedDays();
  renderHistory();
  form.addEventListener('submit', handleSubmit);
  saveDayBtn.addEventListener('click', saveDay);
  closeSuccessBtn.addEventListener('click', hideSuccessModal);
  successModal.addEventListener('click', function (e) {
    if (e.target === successModal) hideSuccessModal();
  });
  closeDetailBtn.addEventListener('click', hideDayDetail);
  detailModal.addEventListener('click', function (e) {
    if (e.target === detailModal) hideDayDetail();
  });
  nameInput.focus();
})();
