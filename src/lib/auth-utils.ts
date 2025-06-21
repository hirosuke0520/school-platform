import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return session;
}

export async function requireAdminAuth() {
  const session = await requireAuth();
  
  if (session.user.role === 'LEARNER') {
    redirect('/?error=access_denied&message=管理画面へのアクセス権限がありません');
  }
  
  return session;
}

export async function requireSuperAdminAuth() {
  const session = await requireAuth();
  
  if (session.user.role !== 'ADMIN') {
    redirect('/admin?error=access_denied&message=この機能へのアクセス権限がありません');
  }
  
  return session;
}

export function hasAdminAccess(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'INSTRUCTOR';
}

export function hasUserManagementAccess(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function canAccessAdminPanel(role: UserRole): boolean {
  return role !== 'LEARNER';
}