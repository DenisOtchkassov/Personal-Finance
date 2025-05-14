// Personal Finance Tracker - Version 2.0
// Added localStorage persistence to save transactions between sessions

// Initialize data structure to store transactions
let transactions = [];

// Function to save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('financeTrackerTransactions', JSON.stringify(transactions));
}

// Function to load transactions from localStorage
function loadTransactions() {
    const savedTransactions = localStorage.getItem('financeTrackerTransactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    }
}

// Get DOM elements
const transactionForm = document.getElementById('transaction-form');
const transactionsBody = document.getElementById('transactions-body');
const totalIncomeElement = document.getElementById('total-income');
const totalExpensesElement = document.getElementById('total-expenses');
const balanceElement = document.getElementById('balance');
const categoryChart = document.getElementById('category-chart');

// Chart instance
let chart = null;

// Add event listener for form submission
transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    
    // Create transaction object
    const transaction = {
        id: Date.now(), // Add unique ID for future editing/deletion
        date: date,
        description: description,
        amount: amount,
        type: type,
        category: category
    };
    
    // Add to transactions array
    transactions.push(transaction);
    
    // Save to localStorage
    saveTransactions();
    
    // Update the UI
    updateTransactionTable();
    updateSummary();
    updateChart();
    
    // Reset form
    transactionForm.reset();
});

// Function to update transaction table
function updateTransactionTable() {
    // Clear existing rows
    transactionsBody.innerHTML = '';
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add transactions to table
    sortedTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // Format date
        const dateObj = new Date(transaction.date);
        const formattedDate = dateObj.toLocaleDateString();
        
        // Format amount with $ sign and color based on type
        const amountCell = document.createElement('td');
        amountCell.textContent = transaction.type === 'income' 
            ? `+$${transaction.amount.toFixed(2)}` 
            : `-$${transaction.amount.toFixed(2)}`;
        amountCell.style.color = transaction.type === 'income' ? 'green' : 'red';
        
        // Create all cells
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
        `;
        row.appendChild(amountCell);
        
        // Add row to table
        transactionsBody.appendChild(row);
    });
}

// Function to update summary information
function updateSummary() {
    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpenses += transaction.amount;
        }
    });
    
    const balance = totalIncome - totalExpenses;
    
    // Update UI elements
    totalIncomeElement.textContent = `$${totalIncome.toFixed(2)}`;
    totalExpensesElement.textContent = `$${totalExpenses.toFixed(2)}`;
    balanceElement.textContent = `$${balance.toFixed(2)}`;
    balanceElement.style.color = balance >= 0 ? 'green' : 'red';
}

// Function to update the pie chart
function updateChart() {
    // Get expense categories and amounts
    const categories = {};
    
    transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            if (categories[transaction.category]) {
                categories[transaction.category] += transaction.amount;
            } else {
                categories[transaction.category] = transaction.amount;
            }
        }
    });
    
    // Prepare data for chart
    const categoryLabels = Object.keys(categories);
    const categoryData = Object.values(categories);
    
    // Generate random colors for each category
    const backgroundColors = categoryLabels.map(() => {
        return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.7)`;
    });
    
    // Destroy previous chart if it exists
    if (chart) {
        chart.destroy();
    }
    
    // Create new chart
    if (categoryLabels.length > 0) {
        chart = new Chart(categoryChart, {
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
                title: {
                    display: true,
                    text: 'Expenses by Category'
                }
            }
        });
    } else {
        // If no expense data, display a message
        categoryChart.getContext('2d').clearRect(0, 0, categoryChart.width, categoryChart.height);
        const ctx = categoryChart.getContext('2d');
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No expense data to display', categoryChart.width / 2, categoryChart.height / 2);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Load saved transactions from localStorage
    loadTransactions();
    
    // Set today's date as default in the date input
    document.getElementById('date').valueAsDate = new Date();
    
    // Update UI with loaded data
    updateTransactionTable();
    updateSummary();
    updateChart();
}); 