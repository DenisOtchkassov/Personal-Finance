# Personal Finance Tracker

A simple web application to track personal finances, categorize expenses, and visualize spending patterns.

## Features

- Manual entry of income and expense transactions
- Categorization of transactions
- Transaction history table
- Data persistence using localStorage
- Basic financial summary (income, expenses, balance)
- Pie chart for expense categories
- Responsive design

## Technologies Used

- HTML
- CSS
- JavaScript
- Chart.js for data visualization
- LocalStorage API for data persistence

## How to Use

1. Open `index.html` in a web browser
2. Add transactions using the form:
   - Enter the date (defaults to today)
   - Enter a description
   - Enter the amount
   - Select whether it's income or expense
   - Choose a category
3. View your financial summary and spending chart
4. Review your transaction history
5. Your data will be saved automatically and persist between sessions

## Implementation Notes

- Uses vanilla JavaScript for DOM manipulation
- Transactions stored as objects in an array
- Chart.js provides visualization of spending by category
- LocalStorage saves data between browser sessions
- Mobile-responsive design with simple CSS

## Future Improvements

- Add CSV import/export functionality
- Add transaction editing and deletion
- Implement filtering and sorting options
- Add monthly budget tracking
- Improve chart visualizations
- Add data insights/analysis 