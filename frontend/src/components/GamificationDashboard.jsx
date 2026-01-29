import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, Target, TrendingUp, Zap, Gift, Medal } from 'lucide-react';
import gamificationService from '../services/gamificationService';

const GamificationDashboard = () => {
  const [levelInfo, setLevelInfo] = useState(gamificationService.getLevelInfo());
  const [achievements, setAchievements] = useState(gamificationService.getAllAchievements());
  const [challenges, setChallenges] = useState(gamificationService.getActiveChallenges());
  const [leaderboard, setLeaderboard] = useState(gamificationService.getLeaderboardData());

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    setLevelInfo(gamificationService.getLevelInfo());
    setAchievements(gamificationService.getAllAchievements());
    setChallenges(gamificationService.getActiveChallenges());
    setLeaderboard(gamificationService.getLeaderboardData());
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <div className="space-y-6">
      {/* Level & XP Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Level {levelInfo.level}
              </h2>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {levelInfo.title}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>XP Progress</p>
            <p className="text-lg font-bold" style={{ color: 'var(--primary-600)' }}>
              {levelInfo.xp} / {levelInfo.xpForNextLevel}
            </p>
          </div>
        </div>

        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${levelInfo.progress}%`,
              background: 'linear-gradient(90deg, var(--primary-600), var(--primary-400))'
            }}
          />
        </div>
        <p className="text-xs mt-2 text-right" style={{ color: 'var(--text-muted)' }}>
          {Math.round(levelInfo.progress)}% to next level
        </p>
      </div>

      {/* Streak & Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-3xl mb-2">🔥</div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {gamificationService.state.streak}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Day Streak</p>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {unlockedCount}/{totalAchievements}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Achievements</p>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-3xl mb-2">💎</div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {leaderboard.rank}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Rank</p>
        </div>
      </div>

      {/* Active Challenges */}
      {challenges.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Target size={20} style={{ color: 'var(--primary-600)' }} />
            Active Challenges
          </h3>
          <div className="space-y-3">
            {challenges.map(challenge => (
              <div key={challenge.id} className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {challenge.type === 'save' ? '💰 Save' : '🎯 Complete'} ₹{challenge.target}
                  </p>
                  <span className="text-xs font-medium" style={{ color: 'var(--primary-600)' }}>
                    +{challenge.reward} XP
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%`,
                      background: 'var(--primary-600)'
                    }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  ₹{challenge.progress} / ₹{challenge.target}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Grid */}
      <div className="card p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Trophy size={20} style={{ color: 'var(--primary-600)' }} />
          Achievements ({unlockedCount}/{totalAchievements})
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                achievement.unlocked ? 'border-[var(--primary-600)]' : 'border-transparent opacity-50'
              }`}
              style={{ background: 'var(--bg-secondary)' }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2 grayscale-0">
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                  {achievement.title}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {achievement.description}
                </p>
                {achievement.unlocked && (
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <Zap size={12} style={{ color: 'var(--primary-600)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--primary-600)' }}>
                      +{achievement.xp} XP
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Teaser */}
      <div className="card p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Medal size={20} style={{ color: 'var(--primary-600)' }} />
          Your Rank
        </h3>
        
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))',
              boxShadow: '0 4px 20px rgba(132, 112, 255, 0.3)'
            }}
          >
            <span className="text-3xl font-bold text-white">{leaderboard.rank}</span>
          </div>
          <p className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {leaderboard.rank} Tier
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Level {leaderboard.level} • {leaderboard.xp} Total XP
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            {leaderboard.achievements} achievements unlocked
          </p>
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;
