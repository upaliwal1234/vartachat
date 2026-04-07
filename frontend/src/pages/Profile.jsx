import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import api from '../utils/api';
import { getInitials, getAvatarColor } from '../utils/helpers';

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [pwError, setPwError] = useState(null);
  const [pwSuccess, setPwSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const fileRef = useRef(null);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('bio', form.bio);

      if (fileRef.current?.files[0]) {
        formData.append('profilePicture', fileRef.current.files[0]);
      }

      const res = await api.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(res.data.user);
      setMessage('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }

    setPwLoading(true);
    try {
      await api.put('/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPwSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto animate-slide-up">

        {/* Profile header */}
        <div className="card p-6 mb-6 text-center">
          <div className="relative inline-block mb-4">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
            ) : (
              <div className={`w-24 h-24 rounded-full ${getAvatarColor(user?.name || '')} flex items-center justify-center text-white text-2xl font-bold mx-auto`}>
                {getInitials(user?.name || 'U')}
              </div>
            )}
            {editMode && (
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full p-1.5 shadow-md hover:bg-primary-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => {}} // handled on submit
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user?.email}</p>
          {user?.bio && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 max-w-sm mx-auto">{user.bio}</p>
          )}

          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${user?.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-500">{user?.isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
          {['profile', 'security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 dark:text-white">Edit Profile</h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className={editMode ? 'btn-secondary text-sm py-1.5 px-3' : 'btn-primary text-sm py-1.5 px-3'}
              >
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {message && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-xl p-3 mb-4 text-sm">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={!editMode}
                  className="input-field disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  disabled={!editMode}
                  rows={3}
                  maxLength={200}
                  className="input-field resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/200</p>
              </div>

              {editMode && (
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </form>
          </div>
        )}

        {/* Security tab */}
        {activeTab === 'security' && (
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Change Password</h2>

            {pwSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-xl p-3 mb-4 text-sm">
                {pwSuccess}
              </div>
            )}
            {pwError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-3 mb-4 text-sm">
                {pwError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" disabled={pwLoading} className="btn-primary w-full">
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* Logout */}
        <div className="mt-6 text-center">
          <button onClick={handleLogout} className="btn-danger w-full sm:w-auto px-8">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
