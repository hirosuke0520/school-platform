import Link from "next/link";
import {
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { requireAdminAuth, hasUserManagementAccess } from "@/lib/auth-utils";
import AdminHeader from "@/components/admin/AdminHeader";
import ToastProvider from "@/components/ToastProvider";
import AdminErrorHandler from "@/components/admin/AdminErrorHandler";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminAuth();
  const baseNavigation = [
    { name: "ダッシュボード", href: "/admin", icon: ChartBarIcon },
    { name: "コンテンツ管理", href: "/admin/courses", icon: BookOpenIcon },
    { name: "設定", href: "/admin/settings", icon: Cog6ToothIcon },
  ];

  const navigation = hasUserManagementAccess(session.user.role)
    ? [
        baseNavigation[0],
        { name: "ユーザー管理", href: "/admin/users", icon: UserGroupIcon },
        ...baseNavigation.slice(1),
      ]
    : baseNavigation;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* サイドバー */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900">
        <div className="flex h-16 items-center justify-center bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-12"></div>
            </div>
            <h1 className="text-white text-lg font-bold">Code Strategy</h1>
          </div>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* メインコンテンツ */}
      <div className="ml-64">
        <AdminHeader />
        <AdminErrorHandler />

        <main className="p-6">{children}</main>
      </div>
      
      <ToastProvider />
    </div>
  );
}
