'use client';

import { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { User } from '@prisma/client';
import { formatDateShort } from "@/lib/dateUtils";
import UserCreateModal from "@/app/admin/users/components/UserCreateModal";
import UserEditModal from "@/app/admin/users/components/UserEditModal";
import UserDeleteModal from "@/app/admin/users/components/UserDeleteModal";
import { useRouter } from "next/navigation";

interface UserManagementProps {
  initialUsers: User[];
}

export default function UserManagement({ initialUsers }: UserManagementProps) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // モーダルを開く（編集）
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // モーダルを開く（削除）
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // モーダルを閉じる時の処理
  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(null); // 重要：選択されたユーザーをクリア
  };

  // 作成・更新・削除後の処理
  const handleUserUpdated = () => {
    handleCloseModals();
    router.refresh(); // サーバーコンポーネントを再読み込み
  };

  const roleLabels = {
    ADMIN: '管理者',
    INSTRUCTOR: '講師',
    LEARNER: '学習者',
  };

  const roleColors = {
    ADMIN: 'bg-red-100 text-red-800',
    INSTRUCTOR: 'bg-blue-100 text-blue-800',
    LEARNER: 'bg-green-100 text-green-800',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ユーザー管理</h1>
          <p className="text-gray-600">社員アカウントの作成・編集・削除</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          新規ユーザー作成
        </button>
      </div>

      {/* ユーザー一覧テーブル */}
      <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ユーザー
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                役割
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メール認証
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {initialUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || '名前未設定'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>
                    {roleLabels[user.role]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateShort(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.emailVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.emailVerified ? '認証済み' : '未認証'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="編集"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="削除"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {initialUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">ユーザーがまだ登録されていません</p>
              <p className="text-sm">新規ユーザー作成から始めましょう</p>
            </div>
          </div>
        )}
      </div>

      {/* 統計情報 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{initialUsers.length}</div>
          <div className="text-sm text-gray-600">総ユーザー数</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {initialUsers.filter(u => u.role === 'LEARNER').length}
          </div>
          <div className="text-sm text-gray-600">学習者</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {initialUsers.filter(u => u.role === 'INSTRUCTOR').length}
          </div>
          <div className="text-sm text-gray-600">講師</div>
        </div>
      </div>

      {/* モーダル */}
      <UserCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onUserCreated={handleUserUpdated}
      />

      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
      />

      <UserDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onUserDeleted={handleUserUpdated}
        user={selectedUser}
      />
    </div>
  );
}