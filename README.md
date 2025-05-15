# Personal Finance Tracker

A simple web application to track personal finances, categorize expenses, and visualize spending patterns.

## Features

- Manual entry of income and expense transactions
- Categorization of transactions
- Transaction history table
- Data persistence using localStorage
- Basic financial summary (income, expenses, balance)
- Multiple data visualizations:
  - Pie chart for expense categories
  - Bar chart for spending by category
  - Line chart for income/expense trends over time
- Dark/Light mode theme toggle
- Responsive design

## Technologies Used

- HTML
- CSS
- JavaScript
- Chart.js for data visualization
- CSS Variables for theming
- LocalStorage API for data persistence

## How to Use

1. Open `index.html` in a web browser
2. Add transactions using the form:
   - Enter the date (defaults to today)
   - Enter a description
   - Enter the amount
   - Select whether it's income or expense
   - Choose a category
3. View your financial summary
4. Explore different visualizations using the chart selector
5. Toggle between dark and light mode using the switch
6. Review your transaction history
7. Your data will be saved automatically and persist between sessions

## Implementation Notes

- Uses vanilla JavaScript for DOM manipulation
- Transactions stored as objects in an array
- Chart.js provides multiple visualization types for different insights
- LocalStorage saves data between browser sessions
- CSS variables enable seamless theme switching
- Mobile-responsive design

## Future Improvements

- Add CSV import/export functionality
- Add transaction editing and deletion
- Implement filtering and sorting options
- Add monthly budget tracking
- Add data insights/analysis 