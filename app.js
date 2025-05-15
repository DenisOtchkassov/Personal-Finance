// Personal Finance Tracker - Version 2.0
// Added localStorage persistence to save transactions between sessions

// Constants
const STORAGE_KEY = 'financeTrackerTransactions';
const THEME_STORAGE_KEY = 'financeTrackerTheme';
const COLOR_INCOME = 'var(--income-color)';
const COLOR_EXPENSE = 'var(--expense-color)';

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
    mainChart: document.getElementById('main-chart'),
    chartTypeSelector: document.getElementById('chart-type-selector'),
    themeToggle: document.getElementById('theme-toggle'),
    themeLabel: document.getElementById('theme-label'),
    html: document.documentElement
};

// State management
let transactions = [];
let chart = null;
let currentChartType = 'pie';

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

// Theme management
const toggleTheme = () => {
    const isDarkMode = elements.themeToggle.checked;
    const theme = isDarkMode ? 'dark' : 'light';
    elements.html.setAttribute('data-theme', theme);
    elements.themeLabel.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    
    // Refresh chart with new theme colors
    updateChart();
};

const loadTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
        elements.html.setAttribute('data-theme', savedTheme);
        elements.themeToggle.checked = savedTheme === 'dark';
        elements.themeLabel.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
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

// Handle chart type selection
const handleChartTypeChange = () => {
    currentChartType = elements.chartTypeSelector.value;
    updateChart();
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
        amountCell.className = isIncome ? 'income' : 'expense';
        
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
    elements.balance.className = balance >= 0 ? 'income' : 'expense';
};

// Get spending by category
const getExpenseCategories = () => {
    return transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((categories, transaction) => {
            const category = transaction.category;
            categories[category] = (categories[category] || 0) + transaction.amount;
            return categories;
        }, {});
};

// Group transactions by month for trend analysis
const getMonthlyData = () => {
    // Create object to store monthly totals
    const monthlyData = {};
    
    // Process each transaction
    transactions.forEach(transaction => {
        // Get month and year from date
        const date = new Date(transaction.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        // Initialize month if not exists
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
                income: 0,
                expenses: 0,
                displayLabel: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
            };
        }
        
        // Add amount to correct type
        if (transaction.type === 'income') {
            monthlyData[monthYear].income += transaction.amount;
        } else {
            monthlyData[monthYear].expenses += transaction.amount;
        }
    });
    
    // Sort by date
    const sortedMonths = Object.keys(monthlyData).sort();
    
    return {
        labels: sortedMonths.map(month => monthlyData[month].displayLabel),
        income: sortedMonths.map(month => monthlyData[month].income),
        expenses: sortedMonths.map(month => monthlyData[month].expenses)
    };
};

// Render pie/doughnut chart for category breakdown
const renderCategoryChart = (type = 'pie') => {
    // Get expense data
    const categories = getExpenseCategories();
    const categoryLabels = Object.keys(categories);
    const categoryData = Object.values(categories);
    
    // If no data, show message
    if (categoryLabels.length === 0) {
        showNoDataMessage();
        return;
    }
    
    // Get colors for categories
    const backgroundColors = categoryLabels.map(category => categoryColors[category] || 'rgba(128, 128, 128, 0.7)');
    
    // Create chart configuration
    return {
        type: type,
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
                    text: 'Expenses by Category',
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                },
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                    }
                }
            }
        }
    };
};

// Render bar chart for category breakdown
const renderBarChart = () => {
    // Get expense data
    const categories = getExpenseCategories();
    const categoryLabels = Object.keys(categories);
    const categoryData = Object.values(categories);
    
    // If no data, show message
    if (categoryLabels.length === 0) {
        showNoDataMessage();
        return;
    }
    
    // Get colors for categories
    const backgroundColors = categoryLabels.map(category => categoryColors[category] || 'rgba(128, 128, 128, 0.7)');
    
    // Create chart configuration
    return {
        type: 'bar',
        data: {
            labels: categoryLabels,
            datasets: [{
                label: 'Expenses',
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
                    text: 'Spending by Category',
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                },
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                    },
                    grid: {
                        color: 'rgba(200, 200, 200, 0.2)'
                    }
                },
                y: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                    },
                    grid: {
                        color: 'rgba(200, 200, 200, 0.2)'
                    }
                }
            }
        }
    };
};

// Render line chart for monthly trends
const renderLineChart = () => {
    // Get monthly data
    const monthlyData = getMonthlyData();
    
    // If no data, show message
    if (monthlyData.labels.length === 0) {
        showNoDataMessage();
        return;
    }
    
    // Create chart configuration
    return {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [
                {
                    label: 'Income',
                    data: monthlyData.income,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                },
                {
                    label: 'Expenses',
                    data: monthlyData.expenses,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Income & Expenses',
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                },
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                    },
                    grid: {
                        color: 'rgba(200, 200, 200, 0.2)'
                    }
                },
                y: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                    },
                    grid: {
                        color: 'rgba(200, 200, 200, 0.2)'
                    }
                }
            }
        }
    };
};

// Show "no data" message on chart
const showNoDataMessage = () => {
    const ctx = elements.mainChart.getContext('2d');
    ctx.clearRect(0, 0, elements.mainChart.width, elements.mainChart.height);
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
    ctx.fillText('No data to display', elements.mainChart.width / 2, elements.mainChart.height / 2);
};

// Update chart based on selected type
const updateChart = () => {
    // Destroy previous chart if it exists
    if (chart) {
        chart.destroy();
    }
    
    // Create chart config based on selected type
    let chartConfig;
    
    switch(currentChartType) {
        case 'pie':
            chartConfig = renderCategoryChart('pie');
            break;
        case 'bar':
            chartConfig = renderBarChart();
            break;
        case 'line':
            chartConfig = renderLineChart();
            break;
        default:
            chartConfig = renderCategoryChart();
    }
    
    // Create new chart if config exists
    if (chartConfig) {
        chart = new Chart(elements.mainChart, chartConfig);
    }
};

// Initialize the app
const initApp = () => {
    // Load data
    loadTransactions();
    loadTheme();
    
    // Set default date
    elements.dateInput.valueAsDate = new Date();
    
    // Add event listeners
    elements.form.addEventListener('submit', handleFormSubmit);
    elements.chartTypeSelector.addEventListener('change', handleChartTypeChange);
    elements.themeToggle.addEventListener('change', toggleTheme);
    
    // Update initial chart type
    currentChartType = elements.chartTypeSelector.value;
    
    // Initial UI update
    updateUI();
};

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp); 