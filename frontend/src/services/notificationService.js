import toast from 'react-hot-toast';

class NotificationService {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    this.settings = JSON.parse(localStorage.getItem('notificationSettings') || JSON.stringify({
      billReminders: true,
      budgetAlerts: true,
      savingsMilestones: true,
      unusualActivity: true,
      weeklyReports: true,
      achievementUnlocks: true
    }));
  }

  checkPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  notify(title, body, type = 'info', data = {}) {
    const notification = {
      id: Date.now(),
      title,
      body,
      type,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(notification);
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    localStorage.setItem('notifications', JSON.stringify(this.notifications));

    const toastStyles = {
      success: { icon: '✅', duration: 4000 },
      warning: { icon: '⚠️', duration: 5000 },
      error: { icon: '❌', duration: 6000 },
      info: { icon: 'ℹ️', duration: 4000 },
      achievement: { icon: '🏆', duration: 5000 },
      milestone: { icon: '🎉', duration: 5000 }
    };

    const style = toastStyles[type] || toastStyles.info;
    
    toast(body, {
      icon: style.icon,
      duration: style.duration,
      style: {
        background: 'var(--card-bg)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)'
      }
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }

    return notification;
  }

  checkBillReminders(transactions) {
    if (!this.settings.billReminders) return;

    const today = new Date();
    const recurringBills = this.detectRecurringBills(transactions);

    recurringBills.forEach(bill => {
      const daysTillDue = Math.ceil((new Date(bill.nextDue) - today) / (1000 * 60 * 60 * 24));
      
      if (daysTillDue === 3) {
        this.notify(
          '📅 Bill Reminder',
          `${bill.description} (₹${bill.amount}) is due in 3 days`,
          'warning',
          { type: 'billReminder', bill }
        );
      }
    });
  }

  checkBudgetAlerts(budgets) {
    if (!this.settings.budgetAlerts) return;

    budgets.forEach(budget => {
      const percentage = (budget.spent / budget.amount) * 100;

      if (percentage >= 80 && percentage < 100 && !this.hasRecentAlert(`budget_${budget.id}_80`)) {
        this.notify(
          '💰 Budget Alert',
          `${budget.category}: ${percentage.toFixed(0)}% used (₹${(budget.amount - budget.spent).toFixed(0)} remaining)`,
          'warning',
          { type: 'budgetAlert', budget, percentage }
        );
        this.markAlertShown(`budget_${budget.id}_80`);
      }

      if (percentage >= 100 && !this.hasRecentAlert(`budget_${budget.id}_100`)) {
        this.notify(
          '🚨 Budget Exceeded',
          `${budget.category} budget exceeded by ₹${(budget.spent - budget.amount).toFixed(0)}`,
          'error',
          { type: 'budgetExceeded', budget, percentage }
        );
        this.markAlertShown(`budget_${budget.id}_100`);
      }
    });
  }

  checkSavingsMilestones(totalSavings) {
    if (!this.settings.savingsMilestones) return;

    const milestones = [10000, 25000, 50000, 100000, 200000, 500000, 1000000];
    
    milestones.forEach(milestone => {
      if (totalSavings >= milestone && !this.hasRecentAlert(`milestone_${milestone}`)) {
        this.notify(
          '🎉 Savings Milestone!',
          `Congratulations! You've saved ₹${this.formatAmount(milestone)}!`,
          'milestone',
          { type: 'savingsMilestone', amount: milestone }
        );
        this.markAlertShown(`milestone_${milestone}`);
      }
    });
  }

  checkUnusualActivity(todaySpending, averageSpending) {
    if (!this.settings.unusualActivity) return;

    if (todaySpending > averageSpending * 2 && todaySpending > 5000) {
      if (!this.hasRecentAlert('unusual_spending_today')) {
        this.notify(
          '⚠️ Unusual Spending',
          `High spending detected today: ₹${this.formatAmount(todaySpending)} (avg: ₹${this.formatAmount(averageSpending)})`,
          'warning',
          { type: 'unusualActivity', todaySpending, averageSpending }
        );
        this.markAlertShown('unusual_spending_today', 86400000);
      }
    }
  }

  sendWeeklyReport(data) {
    if (!this.settings.weeklyReports) return;

    this.notify(
      '📊 Weekly Report',
      `This week: ₹${this.formatAmount(data.totalSpent)} spent, ₹${this.formatAmount(data.totalIncome)} earned, ₹${this.formatAmount(data.saved)} saved`,
      'info',
      { type: 'weeklyReport', data }
    );
  }

  notifyAchievement(achievement) {
    if (!this.settings.achievementUnlocks) return;

    this.notify(
      `🏆 Achievement Unlocked!`,
      achievement.title,
      'achievement',
      { type: 'achievement', achievement }
    );
  }

  detectRecurringBills(transactions) {
    const bills = [];
    const grouped = {};

    transactions.forEach(t => {
      const key = `${t.description}_${Math.round(t.amount)}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(new Date(t.date));
    });

    Object.entries(grouped).forEach(([key, dates]) => {
      if (dates.length >= 2) {
        dates.sort((a, b) => a - b);
        const intervals = [];
        for (let i = 1; i < dates.length; i++) {
          intervals.push((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24));
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

        if (avgInterval >= 25 && avgInterval <= 35) {
          const [description, amount] = key.split('_');
          const lastDate = dates[dates.length - 1];
          const nextDue = new Date(lastDate);
          nextDue.setDate(nextDue.getDate() + Math.round(avgInterval));

          bills.push({ description, amount: parseFloat(amount), nextDue });
        }
      }
    });

    return bills;
  }

  hasRecentAlert(key) {
    const alerts = JSON.parse(localStorage.getItem('recentAlerts') || '{}');
    const alertTime = alerts[key];
    if (!alertTime) return false;
    return Date.now() - alertTime < 86400000;
  }

  markAlertShown(key, duration = 86400000) {
    const alerts = JSON.parse(localStorage.getItem('recentAlerts') || '{}');
    alerts[key] = Date.now();
    
    Object.keys(alerts).forEach(k => {
      if (Date.now() - alerts[k] > duration) {
        delete alerts[k];
      }
    });
    
    localStorage.setItem('recentAlerts', JSON.stringify(alerts));
  }

  formatAmount(amount) {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toFixed(0);
  }

  getNotifications() {
    return this.notifications;
  }

  markAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  clearAll() {
    this.notifications = [];
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  updateSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
  }

  getSettings() {
    return this.settings;
  }
}

export default new NotificationService();
