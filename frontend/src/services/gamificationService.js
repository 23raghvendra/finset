import notificationService from './notificationService';

class GamificationService {
  constructor() {
    this.loadState();
  }

  loadState() {
    this.state = JSON.parse(localStorage.getItem('gamificationState') || JSON.stringify({
      level: 1,
      xp: 0,
      streak: 0,
      lastActiveDate: null,
      achievements: [],
      challenges: [],
      totalPoints: 0,
      badges: []
    }));
  }

  saveState() {
    localStorage.setItem('gamificationState', JSON.stringify(this.state));
  }

  getLevelInfo() {
    const xpForNextLevel = this.state.level * 1000;
    const progress = (this.state.xp / xpForNextLevel) * 100;
    return {
      level: this.state.level,
      xp: this.state.xp,
      xpForNextLevel,
      progress,
      title: this.getLevelTitle()
    };
  }

  getLevelTitle() {
    if (this.state.level >= 50) return 'Financial Guru';
    if (this.state.level >= 40) return 'Money Master';
    if (this.state.level >= 30) return 'Budget Boss';
    if (this.state.level >= 20) return 'Savings Samurai';
    if (this.state.level >= 10) return 'Finance Ninja';
    if (this.state.level >= 5) return 'Budget Warrior';
    return 'Finance Beginner';
  }

  addXP(amount, reason) {
    this.state.xp += amount;
    this.state.totalPoints += amount;

    const xpForNextLevel = this.state.level * 1000;
    if (this.state.xp >= xpForNextLevel) {
      this.state.level++;
      this.state.xp = this.state.xp - xpForNextLevel;
      notificationService.notify(
        '🎉 Level Up!',
        `You're now ${this.getLevelTitle()} (Level ${this.state.level})`,
        'achievement',
        { type: 'levelUp', level: this.state.level }
      );
    }

    this.saveState();
    this.checkAchievements();
  }

  updateStreak() {
    const today = new Date().toDateString();
    const lastActive = this.state.lastActiveDate;

    if (lastActive === today) {
      return;
    }

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate.toDateString() === yesterday.toDateString()) {
        this.state.streak++;
        if (this.state.streak % 7 === 0) {
          this.addXP(100, `${this.state.streak} day streak`);
          notificationService.notify(
            '🔥 Streak Milestone!',
            `${this.state.streak} days of budget tracking!`,
            'achievement',
            { type: 'streak', days: this.state.streak }
          );
        }
      } else {
        if (this.state.streak >= 7) {
          notificationService.notify(
            '😢 Streak Lost',
            `Your ${this.state.streak} day streak has ended`,
            'warning',
            { type: 'streakLost', days: this.state.streak }
          );
        }
        this.state.streak = 1;
      }
    } else {
      this.state.streak = 1;
    }

    this.state.lastActiveDate = today;
    this.saveState();
  }

  onTransactionAdded(amount, category) {
    this.updateStreak();
    this.addXP(10, 'Transaction added');

    if (amount > 10000) {
      this.checkAchievement('big_spender', 'Big Spender', 'Record a transaction over ₹10,000');
    }

    this.checkAchievement('first_transaction', 'Getting Started', 'Add your first transaction');
    
    const transactionCount = this.getTransactionCount() + 1;
    if (transactionCount === 10) {
      this.unlockAchievement('record_keeper', 'Record Keeper', 'Add 10 transactions');
    }
    if (transactionCount === 50) {
      this.unlockAchievement('data_master', 'Data Master', 'Add 50 transactions');
    }
    if (transactionCount === 100) {
      this.unlockAchievement('transaction_pro', 'Transaction Pro', 'Add 100 transactions');
    }
  }

  onBudgetCreated() {
    this.addXP(50, 'Budget created');
    this.checkAchievement('budget_planner', 'Budget Planner', 'Create your first budget');
  }

  onGoalCreated() {
    this.addXP(50, 'Goal created');
    this.checkAchievement('goal_setter', 'Goal Setter', 'Set your first savings goal');
  }

  onGoalCompleted(amount) {
    this.addXP(200, 'Goal completed');
    notificationService.notify(
      '🎯 Goal Achieved!',
      `Congratulations on saving ₹${amount}!`,
      'milestone'
    );
  }

  onMonthUnderBudget() {
    this.addXP(150, 'Stayed under budget');
    this.checkAchievement('budget_master', 'Budget Master', 'Stay under budget for a month');
  }

  onSavingsMilestone(amount) {
    const xp = Math.floor(amount / 1000);
    this.addXP(xp, `Saved ₹${amount}`);
  }

  checkAchievement(id, title, description) {
    if (!this.hasAchievement(id)) {
      this.unlockAchievement(id, title, description);
    }
  }

  unlockAchievement(id, title, description) {
    if (this.hasAchievement(id)) return;

    const achievement = {
      id,
      title,
      description,
      unlockedAt: new Date().toISOString(),
      xpReward: 100
    };

    this.state.achievements.push(achievement);
    this.addXP(achievement.xpReward, `Achievement: ${title}`);
    notificationService.notifyAchievement(achievement);
    this.saveState();
  }

  hasAchievement(id) {
    return this.state.achievements.some(a => a.id === id);
  }

  getAllAchievements() {
    return [
      { id: 'first_transaction', title: 'Getting Started', description: 'Add your first transaction', icon: '🌱', xp: 100 },
      { id: 'record_keeper', title: 'Record Keeper', description: 'Add 10 transactions', icon: '📝', xp: 100 },
      { id: 'data_master', title: 'Data Master', description: 'Add 50 transactions', icon: '📊', xp: 150 },
      { id: 'transaction_pro', title: 'Transaction Pro', description: 'Add 100 transactions', icon: '💼', xp: 200 },
      { id: 'budget_planner', title: 'Budget Planner', description: 'Create your first budget', icon: '💰', xp: 100 },
      { id: 'budget_master', title: 'Budget Master', description: 'Stay under budget for a month', icon: '🎯', xp: 150 },
      { id: 'goal_setter', title: 'Goal Setter', description: 'Set your first savings goal', icon: '🎯', xp: 100 },
      { id: 'goal_achiever', title: 'Goal Achiever', description: 'Complete your first goal', icon: '🏆', xp: 200 },
      { id: 'big_spender', title: 'Big Spender', description: 'Record a transaction over ₹10,000', icon: '💸', xp: 50 },
      { id: 'week_warrior', title: 'Week Warrior', description: '7 day streak', icon: '🔥', xp: 100 },
      { id: 'month_master', title: 'Month Master', description: '30 day streak', icon: '🔥', xp: 300 },
      { id: 'saver_bronze', title: 'Bronze Saver', description: 'Save ₹10,000', icon: '🥉', xp: 100 },
      { id: 'saver_silver', title: 'Silver Saver', description: 'Save ₹50,000', icon: '🥈', xp: 150 },
      { id: 'saver_gold', title: 'Gold Saver', description: 'Save ₹100,000', icon: '🥇', xp: 200 },
      { id: 'early_bird', title: 'Early Bird', description: 'Track expenses for 7 days in a row', icon: '🌅', xp: 100 }
    ].map(a => ({
      ...a,
      unlocked: this.hasAchievement(a.id),
      unlockedAt: this.state.achievements.find(ua => ua.id === a.id)?.unlockedAt
    }));
  }

  createChallenge(type, target, reward) {
    const challenge = {
      id: Date.now(),
      type,
      target,
      progress: 0,
      reward,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      active: true,
      completed: false
    };

    this.state.challenges.push(challenge);
    this.saveState();
    return challenge;
  }

  updateChallengeProgress(challengeId, progress) {
    const challenge = this.state.challenges.find(c => c.id === challengeId);
    if (!challenge || !challenge.active) return;

    challenge.progress = progress;

    if (progress >= challenge.target && !challenge.completed) {
      challenge.completed = true;
      challenge.active = false;
      this.addXP(challenge.reward, 'Challenge completed');
      notificationService.notify(
        '🎉 Challenge Completed!',
        `You've earned ${challenge.reward} XP!`,
        'achievement',
        { type: 'challengeComplete', challenge }
      );
    }

    this.saveState();
  }

  getActiveChallenges() {
    return this.state.challenges.filter(c => c.active);
  }

  getLeaderboardData() {
    return {
      rank: this.calculateRank(),
      level: this.state.level,
      xp: this.state.totalPoints,
      achievements: this.state.achievements.length
    };
  }

  calculateRank() {
    const ranks = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const index = Math.min(Math.floor(this.state.level / 10), ranks.length - 1);
    return ranks[index];
  }

  getTransactionCount() {
    return parseInt(localStorage.getItem('transactionCount') || '0');
  }

  incrementTransactionCount() {
    const count = this.getTransactionCount() + 1;
    localStorage.setItem('transactionCount', count.toString());
    return count;
  }

  checkAchievements() {
    if (this.state.streak >= 7 && !this.hasAchievement('week_warrior')) {
      this.unlockAchievement('week_warrior', 'Week Warrior', '7 day streak');
    }
    if (this.state.streak >= 30 && !this.hasAchievement('month_master')) {
      this.unlockAchievement('month_master', 'Month Master', '30 day streak');
    }
  }

  reset() {
    this.state = {
      level: 1,
      xp: 0,
      streak: 0,
      lastActiveDate: null,
      achievements: [],
      challenges: [],
      totalPoints: 0,
      badges: []
    };
    this.saveState();
  }
}

export default new GamificationService();
