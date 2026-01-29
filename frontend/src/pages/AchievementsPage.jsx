import React from 'react';
import Header from '../components/Header';
import GamificationDashboard from '../components/GamificationDashboard';

const AchievementsPage = ({ user }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <Header
        title="Achievements"
        subtitle="Track your progress and unlock rewards"
        user={user}
      />
      
      <GamificationDashboard />
    </div>
  );
};

export default AchievementsPage;
