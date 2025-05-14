// Personal Finance Tracker - Version 2.0
// Added localStorage persistence to save transactions between sessions

// Constants
const STORAGE_KEY = 'financeTrackerTransactions';
const COLOR_INCOME = 'green';
const COLOR_EXPENSE = 'red';

// DOM elements - cache all references to avoid repeated lookups
const elements = {
    form: document.getElementById('transaction-form'),
    dateInput: document.getElementById('date'),
    descriptionInput: document.getElementById('description'),
    amountInput: document.getElementById('amount'),
    typeSelect: document.getElementById('type'),
    categorySelect: document.getElementById('category'),
    transactionsBody: document.getElementById('transactions-body'),
    totalIncome: document.getElementById('total-income'),
    totalExpenses: document.getElementById('total-expenses'),
    balance: document.getElementById('balance'),
    categoryChart: document.getElementById('category-chart')
};

// State management
let transactions = [];
let chart = null;

// Category colors - assign fixed colors to categories for consistency
const categoryColors = {
    Food: 'rgba(255, 99, 132, 0.7)',
    Transport: 'rgba(54, 162, 235, 0.7)',
    Entertainment: 'rgba(255, 206, 86, 0.7)',
    Utilities: 'rgba(75, 192, 192, 0.7)',
    Rent: 'rgba(153, 102, 255, 0.7)',
    Shopping: 'rgba(255, 159, 64, 0.7)',
    Other: 'rgba(199, 199, 199, 0.7)'
};

// LocalStorage functions
const saveTransactions = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));

const loadTransactions = () => {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            transactions = JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        transactions = [];
    }
};

// Create transaction object
const createTransaction = (formData) => ({
    id: Date.now(),
    date: formData.date,
    description: formData.description,
    amount: formData.amount,
    type: formData.type,
    category: formData.category
});

// Update UI
const updateUI = () => {
    updateTransactionTable();
    updateSummary();
    updateChart();
};

// Handle form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        date: elements.dateInput.value,
        description: elements.descriptionInput.value,
        amount: parseFloat(elements.amountInput.value),
        type: elements.typeSelect.value,
        category: elements.categorySelect.value
    };
    
    // Add transaction
    transactions.push(createTransaction(formData));
    
    // Save and update
    saveTransactions();
    updateUI();
    
    // Reset form
    elements.form.reset();
    elements.dateInput.valueAsDate = new Date();
};

// Update transaction table
const updateTransactionTable = () => {
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create rows
    sortedTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // Format date once
        const formattedDate = new Date(transaction.date).toLocaleDateString();
        const isIncome = transaction.type === 'income';
        
        // Create amount cell with formatting
        const amountCell = document.createElement('td');
        amountCell.textContent = isIncome 
            ? `+$${transaction.amount.toFixed(2)}` 
            : `-$${transaction.amount.toFixed(2)}`;
        amountCell.style.color = isIncome ? COLOR_INCOME : COLOR_EXPENSE;
        
        // Create cell content with template literals
        const cells = `
            <td>${formattedDate}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
        `;
        
        // Set row content and append cells
        row.innerHTML = cells;
        row.appendChild(amountCell);
        fragment.appendChild(row);
    });
    
    // Replace all content at once
    elements.transactionsBody.innerHTML = '';
    elements.transactionsBody.appendChild(fragment);
};

// Calculate financial summary
const calculateSummary = () => {
    // Use reduce for more efficient calculation
    return transactions.reduce((summary, transaction) => {
        if (transaction.type === 'income') {
            summary.income += transaction.amount;
        } else {
            summary.expenses += transaction.amount;
        }
        return summary;
    }, { income: 0, expenses: 0 });
};

// Update financial summary
const updateSummary = () => {
    const summary = calculateSummary();
    const balance = summary.income - summary.expenses;
    
    // Update UI
    elements.totalIncome.textContent = `$${summary.income.toFixed(2)}`;
    elements.totalExpenses.textContent = `$${summary.expenses.toFixed(2)}`;
    elements.balance.textContent = `$${balance.toFixed(2)}`;
    elements.balance.style.color = balance >= 0 ? COLOR_INCOME : COLOR_EXPENSE;
};

// Collect expense categories data
const getExpenseCategories = () => {
    return transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((categories, transaction) => {
            const category = transaction.category;
            categories[category] = (categories[category] || 0) + transaction.amount;
            return categories;
        }, {});
};

// Update the pie chart
const updateChart = () => {
    // Get expense data
    const categories = getExpenseCategories();
    const categoryLabels = Object.keys(categories);
    const categoryData = Object.values(categories);
    
    // Get colors for categories
    const backgroundColors = categoryLabels.map(category => categoryColors[category] || 'rgba(128, 128, 128, 0.7)');
    
    // Destroy previous chart if it exists
    if (chart) {
        chart.destroy();
    }
    
    // Create chart if we have data
    if (categoryLabels.length > 0) {
        chart = new Chart(elements.categoryChart, {
            type: 'pie',
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: categoryData,
                    backgroundColor: backgroundColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Expenses by Category'
                    }
                }
            }
        });
    } else {
        // Show empty state message
        const ctx = elements.categoryChart.getContext('2d');
        ctx.clearRect(0, 0, elements.categoryChart.width, elements.categoryChart.height);
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No expense data to display', elements.categoryChart.width / 2, elements.categoryChart.height / 2);
    }
};

// Initialize the app
const initApp = () => {
    // Load data
    loadTransactions();
    
    // Set default date
    elements.dateInput.valueAsDate = new Date();
    
    // Add event listeners
    elements.form.addEventListener('submit', handleFormSubmit);
    
    // Initial UI update
    updateUI();
};

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp); 