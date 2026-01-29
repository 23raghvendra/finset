import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { User, Mail, Phone, MapPin, Save, Lock, Shield, Sun, Moon } from 'lucide-react';

const ProfilePage = ({ user }) => {
  const { isDark, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'User',
    email: user?.email || 'user@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Profile</h1>
            <p className="text-secondary text-sm">Manage your account settings</p>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={isEditing ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            {isEditing ? <><Save size={16} /> Save</> : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-surface rounded-2xl border border-default overflow-hidden">
          <div className="bg-elevated h-24 relative border-b border-default">
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 bg-surface rounded-2xl border-4 border-[var(--bg)] flex items-center justify-center text-3xl font-bold text-primary">
                {formData.name.charAt(0)}
              </div>
            </div>
          </div>
          <div className="pt-16 p-6">
            <h2 className="text-xl font-bold text-primary">{formData.name}</h2>
            <p className="text-secondary text-sm">{formData.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-surface rounded-2xl p-6 border border-default">
          <h3 className="font-semibold text-primary mb-6 flex items-center gap-2">
            <User size={18} /> Personal Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="input disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="input disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="input disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={!isEditing}
                className="input disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-surface rounded-2xl p-6 border border-default">
          <h3 className="font-semibold text-primary mb-6 flex items-center gap-2">
            {isDark ? <Moon size={18} /> : <Sun size={18} />} Appearance
          </h3>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-4 bg-elevated hover:bg-[var(--divider)] rounded-xl transition-colors border border-default"
          >
            <div className="flex items-center gap-3">
              {isDark ? <Moon size={18} className="text-secondary" /> : <Sun size={18} className="text-secondary" />}
              <span className="text-primary font-medium">Theme</span>
            </div>
            <span className="text-secondary text-sm">{isDark ? 'Dark' : 'Light'}</span>
          </button>
        </div>

        {/* Security */}
        <div className="bg-surface rounded-2xl p-6 border border-default">
          <h3 className="font-semibold text-primary mb-6 flex items-center gap-2">
            <Shield size={18} /> Security
          </h3>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-elevated hover:bg-[var(--divider)] rounded-xl transition-colors border border-default">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-secondary" />
                <span className="text-primary font-medium">Change Password</span>
              </div>
              <span className="text-muted">→</span>
            </button>

            <div className="flex items-center justify-between p-4 bg-elevated rounded-xl border border-default">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-secondary" />
                <span className="text-primary font-medium">Two-Factor Auth</span>
              </div>
              <span className="text-xs font-medium px-2 py-1 accent-bg text-[var(--bg)] rounded-full">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
