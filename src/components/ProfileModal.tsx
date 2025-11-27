// components/ProfileButton.tsx
'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { User, LogIn, LogOut, Edit } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import EditProfileModal from './EditProfileModal';

interface ProfileButtonProps {
  user: FirebaseUser | null;
  onShowLogin: () => void;
  onLogout: () => void;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({
  user,
  onShowLogin,
  onLogout
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center justify-center gap-2 p-2 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <span className="text-sm font-medium text-white">
            {user ? (user.displayName || user.email?.split('@')[0] || 'User') : 'Guest'}
          </span>
        </button>

        {/* User dropdown menu */}
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px] z-50">
            {user ? (
              <>
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-800">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditProfile(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onShowLogin();
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && user && createPortal(
        <EditProfileModal
          user={user}
          onClose={() => setShowEditProfile(false)}
        />,
        document.body
      )}
    </>
  );
};
