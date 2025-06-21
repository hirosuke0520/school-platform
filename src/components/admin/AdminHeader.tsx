'use client';

import { useSession, signOut } from 'next-auth/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function AdminHeader() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '管理者';
      case 'INSTRUCTOR':
        return '講師';
      case 'LEARNER':
        return 'ユーザー';
      default:
        return role;
    }
  };

  const getUserInitial = (name: string | null | undefined, email: string) => {
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-6">
        <h2 className="text-xl font-semibold text-gray-900">管理画面</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {getRoleDisplayName(session?.user?.role || '')}: {session?.user?.email}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {getUserInitial(session?.user?.name, session?.user?.email || '')}
                </span>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <div className="font-medium">{session?.user?.name || 'ユーザー'}</div>
                    <div className="text-gray-500">{session?.user?.email}</div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}