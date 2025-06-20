import { prisma } from "@/lib/prisma";
import UserManagement from "@/components/admin/UserManagement";

export default async function UsersPage() {
  // DB操作をサーバーコンポーネントで実行
  const users = await prisma.user.findMany({
    where: {
      isDeleted: false
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return <UserManagement initialUsers={users} />;
}