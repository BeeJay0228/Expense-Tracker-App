(function () {
  const form = document.getElementById('expense-form');
  const nameInput = document.getElementById('expense-name');
  const amountInput = document.getElementById('expense-amount');
  const nameError = document.getElementById('name-error');
  const amountError = document.getElementById('amount-error');
  const expenseList = document.getElementById('expense-list');
  const totalDisplay = document.getElementById('total-amount');

  let expenses = [];

  function formatNaira(amount) {
    return '\u20A6' + Number(amount).toLocaleString('en-NG');
  }

  function getTotal() {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  function updateTotal() {
    totalDisplay.textContent = formatNaira(getTotal());
  }

  function clearErrors() {
    nameError.textContent = '';
    amountError.textContent = '';
    nameInput.closest('.form-group').classList.remove('error');
    amountInput.closest('.form-group').classList.remove('error');
  }

  function showError(input, errorEl, message) {
    errorEl.textContent = message;
    input.closest('.form-group').classList.add('error');
  }

  function validate(name, amount) {
    let valid = true;
    clearErrors();

    if (!name || name.trim() === '') {
      showError(nameInput, nameError, 'Please enter an expense name.');
      valid = false;
    }

    const num = Number(amount);
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
      const item = document.createElement('div');
      item.className = 'expense-item';

      const info = document.createElement('div');
      info.className = 'expense-info';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'expense-name';
      nameSpan.textContent = expense.name;

      const dot = document.createElement('span');
      dot.className = 'expense-dot';
      dot.textContent = '\u00B7';

      const amountSpan = document.createElement('span');
      amountSpan.className = 'expense-amount';
      amountSpan.textContent = formatNaira(expense.amount);

      info.appendChild(nameSpan);
      info.appendChild(dot);
      info.appendChild(amountSpan);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', 'Delete ' + expense.name);
      deleteBtn.addEventListener('click', function () {
        deleteExpense(expense.id);
      });

      item.appendChild(info);
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

  function addExpense(name, amount) {
    const expense = {
      id: Date.now(),
      name: name.trim(),
      amount: Number(amount),
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

    const name = nameInput.value;
    const amount = amountInput.value;

    if (!validate(name, amount)) return;

    addExpense(name, amount);
  }

  form.addEventListener('submit', handleSubmit);
  nameInput.focus();
})();
