import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

// Format currency for INR
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// CSV Export
export const exportToCSV = (transactions, filename = 'transactions') => {
  if (!transactions || transactions.length === 0) {
    return { success: false, message: 'No transactions to export' };
  }

  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
  const csvContent = [
    headers.join(','),
    ...transactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString('en-IN'),
      transaction.type,
      `"${transaction.category}"`,
      `"${transaction.description}"`,
      transaction.amount.toFixed(2)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
  return { success: true, message: 'CSV exported successfully' };
};

// Beautiful PDF Export
export const exportToPDF = (transactions, totals, filename = 'financial-report') => {
  if (!transactions || transactions.length === 0) {
    return { success: false, message: 'No transactions to export' };
  }

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  // Colors
  const primaryColor = [132, 112, 255]; // Purple
  const successColor = [16, 185, 129]; // Green
  const dangerColor = [239, 68, 68]; // Red
  const grayColor = [107, 114, 128];
  
  // Header with gradient-like effect
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 45, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont(undefined, 'bold');
  pdf.text('Financial Report', 20, 25);
  
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Generated on ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`, 20, 35);
  
  let yPos = 60;
  
  // Summary Cards
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('Summary', 20, yPos);
  yPos += 10;
  
  // Income Card
  pdf.setFillColor(240, 253, 244);
  pdf.roundedRect(20, yPos, 50, 30, 3, 3, 'F');
  pdf.setFontSize(9);
  pdf.setTextColor(...grayColor);
  pdf.text('Income', 25, yPos + 10);
  pdf.setFontSize(12);
  pdf.setTextColor(...successColor);
  pdf.setFont(undefined, 'bold');
  pdf.text(formatINR(totals.income), 25, yPos + 22);
  
  // Expenses Card
  pdf.setFillColor(254, 242, 242);
  pdf.roundedRect(80, yPos, 50, 30, 3, 3, 'F');
  pdf.setFontSize(9);
  pdf.setTextColor(...grayColor);
  pdf.setFont(undefined, 'normal');
  pdf.text('Expenses', 85, yPos + 10);
  pdf.setFontSize(12);
  pdf.setTextColor(...dangerColor);
  pdf.setFont(undefined, 'bold');
  pdf.text(formatINR(totals.expenses), 85, yPos + 22);
  
  // Balance Card
  const balanceColor = totals.balance >= 0 ? successColor : dangerColor;
  pdf.setFillColor(245, 243, 255);
  pdf.roundedRect(140, yPos, 50, 30, 3, 3, 'F');
  pdf.setFontSize(9);
  pdf.setTextColor(...grayColor);
  pdf.setFont(undefined, 'normal');
  pdf.text('Balance', 145, yPos + 10);
  pdf.setFontSize(12);
  pdf.setTextColor(...balanceColor);
  pdf.setFont(undefined, 'bold');
  pdf.text(formatINR(totals.balance), 145, yPos + 22);
  
  yPos += 45;
  
  // Category Breakdown
  const categoryData = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
  });
  
  const sortedCategories = Object.entries(categoryData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  if (sortedCategories.length > 0) {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Top Expense Categories', 20, yPos);
    yPos += 10;
    
    sortedCategories.forEach(([category, amount], index) => {
      const percentage = (amount / totals.expenses) * 100;
      const barWidth = (percentage / 100) * 100;
      
      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(20, yPos, 100, 8, 2, 2, 'F');
      
      pdf.setFillColor(...primaryColor);
      pdf.roundedRect(20, yPos, barWidth, 8, 2, 2, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'normal');
      pdf.text(category, 125, yPos + 6);
      pdf.text(`${formatINR(amount)} (${percentage.toFixed(1)}%)`, 165, yPos + 6);
      
      yPos += 12;
    });
    
    yPos += 10;
  }
  
  // Transactions Table
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('Recent Transactions', 20, yPos);
  yPos += 10;
  
  // Table header
  pdf.setFillColor(...primaryColor);
  pdf.rect(20, yPos, pageWidth - 40, 10, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'bold');
  pdf.text('Date', 25, yPos + 7);
  pdf.text('Category', 55, yPos + 7);
  pdf.text('Description', 95, yPos + 7);
  pdf.text('Amount', 165, yPos + 7);
  yPos += 12;
  
  pdf.setFont(undefined, 'normal');
  
  // Table rows (limit to fit page)
  const displayTransactions = transactions.slice(0, 15);
  displayTransactions.forEach((transaction, index) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = 20;
    }
    
    // Alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(20, yPos - 4, pageWidth - 40, 10, 'F');
    }
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(8);
    pdf.text(new Date(transaction.date).toLocaleDateString('en-IN'), 25, yPos + 3);
    pdf.text(transaction.category.substring(0, 15), 55, yPos + 3);
    pdf.text(transaction.description.substring(0, 25), 95, yPos + 3);
    
    const amountColor = transaction.type === 'income' ? successColor : dangerColor;
    pdf.setTextColor(...amountColor);
    const prefix = transaction.type === 'income' ? '+' : '-';
    pdf.text(`${prefix}${formatINR(transaction.amount)}`, 165, yPos + 3);
    
    yPos += 10;
  });
  
  if (transactions.length > 15) {
    pdf.setTextColor(...grayColor);
    pdf.setFontSize(8);
    pdf.text(`... and ${transactions.length - 15} more transactions`, 20, yPos + 5);
  }
  
  // Footer on all pages
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFillColor(245, 245, 245);
    pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(...grayColor);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 5);
    pdf.text('FinSet - Your Personal Finance Tracker', 20, pageHeight - 5);
  }
  
  pdf.save(`${filename}.pdf`);
  return { success: true, message: 'PDF exported successfully' };
};

// Generate comprehensive monthly report
export const generateMonthlyReport = (transactions, budgets, goals, year, month) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
  
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Calculate totals
  const totals = monthTransactions.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount;
    else acc.expenses += t.amount;
    return acc;
  }, { income: 0, expenses: 0 });
  totals.balance = totals.income - totals.expenses;
  totals.savingsRate = totals.income > 0 ? ((totals.income - totals.expenses) / totals.income * 100) : 0;
  
  // Colors
  const primaryColor = [132, 112, 255];
  const successColor = [16, 185, 129];
  const dangerColor = [239, 68, 68];
  const grayColor = [107, 114, 128];
  
  // Header
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont(undefined, 'bold');
  pdf.text('Monthly Report', 20, 28);
  
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'normal');
  pdf.text(monthName, 20, 42);
  
  let yPos = 65;
  
  // Summary section
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('Financial Summary', 20, yPos);
  yPos += 15;
  
  // Summary boxes
  const boxWidth = (pageWidth - 60) / 4;
  
  // Income
  pdf.setFillColor(240, 253, 244);
  pdf.roundedRect(20, yPos, boxWidth, 35, 3, 3, 'F');
  pdf.setFontSize(10);
  pdf.setTextColor(...grayColor);
  pdf.text('Total Income', 25, yPos + 12);
  pdf.setFontSize(14);
  pdf.setTextColor(...successColor);
  pdf.setFont(undefined, 'bold');
  pdf.text(formatINR(totals.income), 25, yPos + 26);
  
  // Expenses
  pdf.setFillColor(254, 242, 242);
  pdf.roundedRect(30 + boxWidth, yPos, boxWidth, 35, 3, 3, 'F');
  pdf.setFontSize(10);
  pdf.setTextColor(...grayColor);
  pdf.setFont(undefined, 'normal');
  pdf.text('Total Expenses', 35 + boxWidth, yPos + 12);
  pdf.setFontSize(14);
  pdf.setTextColor(...dangerColor);
  pdf.setFont(undefined, 'bold');
  pdf.text(formatINR(totals.expenses), 35 + boxWidth, yPos + 26);
  
  // Net Savings
  pdf.setFillColor(245, 243, 255);
  pdf.roundedRect(40 + boxWidth * 2, yPos, boxWidth, 35, 3, 3, 'F');
  pdf.setFontSize(10);
  pdf.setTextColor(...grayColor);
  pdf.setFont(undefined, 'normal');
  pdf.text('Net Savings', 45 + boxWidth * 2, yPos + 12);
  pdf.setFontSize(14);
  pdf.setTextColor(...(totals.balance >= 0 ? successColor : dangerColor));
  pdf.setFont(undefined, 'bold');
  pdf.text(formatINR(totals.balance), 45 + boxWidth * 2, yPos + 26);
  
  // Savings Rate
  pdf.setFillColor(254, 249, 195);
  pdf.roundedRect(50 + boxWidth * 3, yPos, boxWidth, 35, 3, 3, 'F');
  pdf.setFontSize(10);
  pdf.setTextColor(...grayColor);
  pdf.setFont(undefined, 'normal');
  pdf.text('Savings Rate', 55 + boxWidth * 3, yPos + 12);
  pdf.setFontSize(14);
  pdf.setTextColor(180, 83, 9);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${totals.savingsRate.toFixed(1)}%`, 55 + boxWidth * 3, yPos + 26);
  
  yPos += 50;
  
  // Transaction count
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Total Transactions: ${monthTransactions.length}`, 20, yPos);
  
  yPos += 20;
  
  // Category breakdown
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('Expense Breakdown', 20, yPos);
  yPos += 15;
  
  const categoryData = {};
  monthTransactions.filter(t => t.type === 'expense').forEach(t => {
    categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
  });
  
  const sortedCategories = Object.entries(categoryData)
    .sort(([, a], [, b]) => b - a);
  
  sortedCategories.forEach(([category, amount]) => {
    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = 20;
    }
    
    const percentage = totals.expenses > 0 ? (amount / totals.expenses) * 100 : 0;
    const barWidth = (percentage / 100) * 120;
    
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(20, yPos, 120, 8, 2, 2, 'F');
    
    pdf.setFillColor(...primaryColor);
    if (barWidth > 0) {
      pdf.roundedRect(20, yPos, Math.max(barWidth, 4), 8, 2, 2, 'F');
    }
    
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont(undefined, 'normal');
    pdf.text(category, 145, yPos + 6);
    pdf.text(`${formatINR(amount)}`, 185, yPos + 6, { align: 'right' });
    
    yPos += 12;
  });
  
  // Footer
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFillColor(245, 245, 245);
    pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(...grayColor);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 5);
    pdf.text('FinSet - Monthly Financial Report', 20, pageHeight - 5);
  }
  
  pdf.save(`monthly-report-${monthName.replace(' ', '-').toLowerCase()}.pdf`);
  return { success: true, message: 'Monthly report generated successfully' };
};

// Share goal progress (generate shareable image data)
export const generateGoalShareCard = (goal) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [150, 80]
  });
  
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const primaryColor = [132, 112, 255];
  const successColor = [16, 185, 129];
  
  // Background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 150, 80, 'F');
  
  // Accent bar
  pdf.setFillColor(...(progress >= 100 ? successColor : primaryColor));
  pdf.rect(0, 0, 5, 80, 'F');
  
  // Goal name
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text(goal.name, 15, 20);
  
  // Progress
  pdf.setFontSize(24);
  pdf.setTextColor(...(progress >= 100 ? successColor : primaryColor));
  pdf.text(`${progress.toFixed(0)}%`, 15, 40);
  
  // Amounts
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128);
  pdf.setFont(undefined, 'normal');
  pdf.text(`${formatINR(goal.currentAmount)} of ${formatINR(goal.targetAmount)}`, 15, 52);
  
  // Progress bar
  pdf.setFillColor(245, 245, 245);
  pdf.roundedRect(15, 58, 120, 6, 2, 2, 'F');
  
  pdf.setFillColor(...(progress >= 100 ? successColor : primaryColor));
  pdf.roundedRect(15, 58, Math.min(progress, 100) * 1.2, 6, 2, 2, 'F');
  
  // Branding
  pdf.setFontSize(8);
  pdf.setTextColor(180, 180, 180);
  pdf.text('Tracked with FinSet', 15, 72);
  
  pdf.save(`goal-${goal.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  return { success: true, message: 'Goal card generated!' };
};

// Export filtered data
export const exportFilteredData = (transactions, filters, format = 'csv') => {
  let filteredData = [...transactions];
  
  if (filters.type) {
    filteredData = filteredData.filter(t => t.type === filters.type);
  }
  
  if (filters.category) {
    filteredData = filteredData.filter(t => t.category === filters.category);
  }
  
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    filteredData = filteredData.filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
  }
  
  let filename = 'transactions';
  if (filters.type) filename += `_${filters.type}`;
  if (filters.category) filename += `_${filters.category.replace(/\s+/g, '_')}`;
  
  const totals = filteredData.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount;
    else acc.expenses += t.amount;
    return acc;
  }, { income: 0, expenses: 0, balance: 0 });
  totals.balance = totals.income - totals.expenses;
  
  if (format === 'csv') {
    return exportToCSV(filteredData, filename);
  } else {
    return exportToPDF(filteredData, totals, filename);
  }
};

// Export monthly report (simplified)
export const exportMonthlyReport = (transactions, year, month, format = 'pdf') => {
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
  
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const filename = `monthly_report_${monthName.replace(' ', '_')}`;
  
  const totals = monthTransactions.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount;
    else acc.expenses += t.amount;
    return acc;
  }, { income: 0, expenses: 0, balance: 0 });
  totals.balance = totals.income - totals.expenses;
  
  if (format === 'csv') {
    return exportToCSV(monthTransactions, filename);
  } else {
    return exportToPDF(monthTransactions, totals, filename);
  }
};
