import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt, { hash } from "bcryptjs";

const prisma = new PrismaClient();

describe("データベース表示統合テスト", () => {
  beforeAll(async () => {
    // テストデータのクリーンアップ
    await prisma.learningSession.deleteMany();
    await prisma.userProgress.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.chapter.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // テスト後のクリーンアップ
    // await prisma.learningSession.deleteMany()
    // await prisma.userProgress.deleteMany()
    // await prisma.lesson.deleteMany()
    // await prisma.chapter.deleteMany()
    // await prisma.course.deleteMany()
    // await prisma.user.deleteMany()
    await prisma.$disconnect();
  });

  describe("ユーザーデータ網羅テスト", () => {
    it("全ロールのユーザーが正しく作成・取得される", async () => {
      const hashedPassword = await hash("test123", 10);

      // ADMINユーザー
      const adminUser = await prisma.user.create({
        data: {
          email: "admin@test.com",
          name: "管理者テスト",
          passwordHash: hashedPassword,
          role: "ADMIN",
          emailVerified: new Date(),
          isFirstLogin: false,
        },
      });

      // INSTRUCTORユーザー
      const instructorUser = await prisma.user.create({
        data: {
          email: "instructor@test.com",
          name: "講師テスト",
          passwordHash: hashedPassword,
          role: "INSTRUCTOR",
          emailVerified: new Date(),
          isFirstLogin: true,
        },
      });

      // LEARNERユーザー（デフォルト設定）
      const learnerUser = await prisma.user.create({
        data: {
          email: "learner@test.com",
          name: "学習者テスト",
          passwordHash: hashedPassword,
          role: "LEARNER",
        },
      });

      // 削除済みユーザー
      const deletedUser = await prisma.user.create({
        data: {
          email: "deleted@test.com",
          name: "削除済みユーザー",
          passwordHash: hashedPassword,
          role: "LEARNER",
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // データ検証
      expect(adminUser.role).toBe("ADMIN");
      expect(adminUser.isFirstLogin).toBe(false);
      expect(instructorUser.role).toBe("INSTRUCTOR");
      expect(instructorUser.isFirstLogin).toBe(true);
      expect(learnerUser.role).toBe("LEARNER");
      expect(learnerUser.isFirstLogin).toBe(true);
      expect(deletedUser.isDeleted).toBe(true);

      // 全ユーザー取得テスト
      const allUsers = await prisma.user.findMany();
      expect(allUsers).toHaveLength(4);

      // アクティブユーザーのみ取得テスト
      const activeUsers = await prisma.user.findMany({
        where: { isDeleted: false },
      });
      expect(activeUsers).toHaveLength(3);
    });
  });

  describe("コースデータ網羅テスト", () => {
    it("様々なパターンのコースが正しく作成・取得される", async () => {
      // アクティブなコース
      const activeCourse = await prisma.course.create({
        data: {
          title: "アクティブコース",
          description: "これはアクティブなコースです",
          orderIndex: 1,
          isActive: true,
        },
      });

      // 非アクティブなコース
      const inactiveCourse = await prisma.course.create({
        data: {
          title: "非アクティブコース",
          description: "これは非アクティブなコースです",
          orderIndex: 2,
          isActive: false,
        },
      });

      // 説明なしのコース
      const noDescCourse = await prisma.course.create({
        data: {
          title: "説明なしコース",
          orderIndex: 3,
        },
      });

      // 削除済みコース
      const deletedCourse = await prisma.course.create({
        data: {
          title: "削除済みコース",
          description: "削除されたコースです",
          orderIndex: 4,
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // データ検証
      expect(activeCourse.isActive).toBe(true);
      expect(inactiveCourse.isActive).toBe(false);
      expect(noDescCourse.description).toBeNull();
      expect(deletedCourse.isDeleted).toBe(true);

      // orderIndex順での取得テスト
      const coursesOrderByIndex = await prisma.course.findMany({
        where: { isDeleted: false },
        orderBy: { orderIndex: "asc" },
      });
      expect(coursesOrderByIndex[0].orderIndex).toBe(1);
      expect(coursesOrderByIndex[1].orderIndex).toBe(2);
    });
  });

  describe("チャプター・レッスン階層テスト", () => {
    it("チャプターとレッスンの階層構造が正しく動作する", async () => {
      // コース作成
      const course = await prisma.course.create({
        data: {
          title: "階層テストコース",
          description: "チャプターとレッスンのテスト",
          orderIndex: 1,
        },
      });

      // チャプター作成
      const chapter1 = await prisma.chapter.create({
        data: {
          title: "第1章",
          description: "基礎編",
          orderIndex: 1,
          courseId: course.id,
        },
      });

      const chapter2 = await prisma.chapter.create({
        data: {
          title: "第2章",
          description: "応用編",
          orderIndex: 2,
          courseId: course.id,
        },
      });

      // レッスン作成
      const lesson1 = await prisma.lesson.create({
        data: {
          title: "レッスン1-1",
          content: "これは最初のレッスンです",
          estimatedMinutes: 30,
          orderIndex: 1,
          chapterId: chapter1.id,
          isPublished: true,
        },
      });

      const lesson2 = await prisma.lesson.create({
        data: {
          title: "レッスン1-2",
          content: "これは2番目のレッスンです",
          orderIndex: 2,
          chapterId: chapter1.id,
          isPublished: false,
        },
      });

      const lesson3 = await prisma.lesson.create({
        data: {
          title: "レッスン2-1",
          content: "これは第2章のレッスンです",
          estimatedMinutes: 45,
          orderIndex: 1,
          chapterId: chapter2.id,
          isPublished: true,
        },
      });

      // 階層構造での取得テスト
      const courseWithChapters = await prisma.course.findUnique({
        where: { id: course.id },
        include: {
          chapters: {
            orderBy: { orderIndex: "asc" },
            include: {
              lessons: {
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      });

      expect(courseWithChapters?.chapters).toHaveLength(2);
      expect(courseWithChapters?.chapters[0].lessons).toHaveLength(2);
      expect(courseWithChapters?.chapters[1].lessons).toHaveLength(1);
      expect(lesson1.isPublished).toBe(true);
      expect(lesson2.isPublished).toBe(false);
      expect(lesson3.isPublished).toBe(true);
    });
  });

  describe("学習進捗データ網羅テスト", () => {
    it("全ステータスの学習進捗が正しく管理される", async () => {
      // ユーザー作成
      const user = await prisma.user.create({
        data: {
          email: "progress@test.com",
          name: "進捗テストユーザー",
          passwordHash: await hash("test123", 10),
        },
      });

      // コース・チャプター・レッスン作成
      const course = await prisma.course.create({
        data: {
          title: "進捗テストコース",
          orderIndex: 1,
        },
      });

      const chapter = await prisma.chapter.create({
        data: {
          title: "進捗テストチャプター",
          orderIndex: 1,
          courseId: course.id,
        },
      });

      const lesson1 = await prisma.lesson.create({
        data: {
          title: "未開始レッスン",
          content: "まだ開始していないレッスン",
          orderIndex: 1,
          chapterId: chapter.id,
          isPublished: true,
        },
      });

      const lesson2 = await prisma.lesson.create({
        data: {
          title: "進行中レッスン",
          content: "進行中のレッスン",
          orderIndex: 2,
          chapterId: chapter.id,
          isPublished: true,
        },
      });

      const lesson3 = await prisma.lesson.create({
        data: {
          title: "完了レッスン",
          content: "完了したレッスン",
          orderIndex: 3,
          chapterId: chapter.id,
          isPublished: true,
        },
      });

      // 学習進捗作成
      const progressNotStarted = await prisma.userProgress.create({
        data: {
          userId: user.id,
          lessonId: lesson1.id,
          status: "NOT_STARTED",
        },
      });

      const progressInProgress = await prisma.userProgress.create({
        data: {
          userId: user.id,
          lessonId: lesson2.id,
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });

      const progressCompleted = await prisma.userProgress.create({
        data: {
          userId: user.id,
          lessonId: lesson3.id,
          status: "COMPLETED",
          startedAt: new Date(Date.now() - 60000),
          completedAt: new Date(),
        },
      });

      // 学習セッション作成
      const session1 = await prisma.learningSession.create({
        data: {
          userId: user.id,
          lessonId: lesson2.id,
          startedAt: new Date(Date.now() - 180000),
          endedAt: new Date(Date.now() - 120000),
          progressReport: "1時間の学習を完了しました",
        },
      });

      const session2 = await prisma.learningSession.create({
        data: {
          userId: user.id,
          lessonId: lesson3.id,
          startedAt: new Date(Date.now() - 120000),
          endedAt: new Date(),
          progressReport: "30分の短時間学習",
        },
      });

      // 進捗状況の検証
      expect(progressNotStarted.status).toBe("NOT_STARTED");
      expect(progressInProgress.status).toBe("IN_PROGRESS");
      expect(progressCompleted.status).toBe("COMPLETED");
      expect(progressCompleted.completedAt).toBeTruthy();

      // ユーザーの全進捗取得テスト
      const userProgress = await prisma.userProgress.findMany({
        where: { userId: user.id },
        include: {
          lesson: {
            include: {
              chapter: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
      });

      expect(userProgress).toHaveLength(3);
      expect(
        userProgress.every((p) => p.lesson.chapter.course.id === course.id)
      ).toBe(true);

      // 学習セッション検証
      const userSessions = await prisma.learningSession.findMany({
        where: { userId: user.id },
      });

      expect(userSessions).toHaveLength(2);
      expect(session1.progressReport).toBe("1時間の学習を完了しました");
      expect(session2.progressReport).toBe("30分の短時間学習");
    });
  });

  describe("ユーザー認証テスト", () => {
    it("ユーザーの認証情報を検証できる", async () => {
      const password = "securepassword";
      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email: "auth-test@example.com",
          name: "認証テストユーザー",
          passwordHash,
          role: UserRole.INSTRUCTOR,
          isFirstLogin: false,
        },
      });

      // パスワード検証
      const isValid = await bcrypt.compare(password, user.passwordHash!);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare(
        "wrongpassword",
        user.passwordHash!
      );
      expect(isInvalid).toBe(false);
    });
  });

  describe("データ整合性テスト", () => {
    it("重複するメールアドレスでユーザーを作成できない", async () => {
      const email = "unique-test@example.com";

      await prisma.user.create({
        data: {
          email,
          name: "最初のユーザー",
          passwordHash: await bcrypt.hash("password1", 10),
          role: UserRole.LEARNER,
        },
      });

      // 同じメールアドレスで2つ目のユーザー作成を試行
      await expect(
        prisma.user.create({
          data: {
            email,
            name: "2つ目のユーザー",
            passwordHash: await bcrypt.hash("password2", 10),
            role: UserRole.LEARNER,
          },
        })
      ).rejects.toThrow();
    });

    it("存在しないコースIDでチャプターを作成できない", async () => {
      await expect(
        prisma.chapter.create({
          data: {
            title: "無効なチャプター",
            description: "存在しないコースのチャプター",
            orderIndex: 1,
            courseId: 999999, // Invalid numeric ID
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("データ表示フィルタリングテスト", () => {
    it("削除フラグや公開状態による絞り込みが正しく動作する", async () => {
      // 公開済みレッスンのみ取得
      const publishedLessons = await prisma.lesson.findMany({
        where: {
          isPublished: true,
          isDeleted: false,
        },
      });

      // アクティブなコースのみ取得
      const activeCourses = await prisma.course.findMany({
        where: {
          isActive: true,
          isDeleted: false,
        },
      });

      // 初回ログインユーザーの取得
      const firstLoginUsers = await prisma.user.findMany({
        where: {
          isFirstLogin: true,
          isDeleted: false,
        },
      });

      // 完了済み進捗の取得
      const completedProgress = await prisma.userProgress.findMany({
        where: {
          status: "COMPLETED",
        },
      });

      // フィルタリング結果の検証
      expect(
        publishedLessons.every(
          (lesson) => lesson.isPublished && !lesson.isDeleted
        )
      ).toBe(true);
      expect(
        activeCourses.every((course) => course.isActive && !course.isDeleted)
      ).toBe(true);
      expect(
        firstLoginUsers.every((user) => user.isFirstLogin && !user.isDeleted)
      ).toBe(true);
      expect(
        completedProgress.every((progress) => progress.status === "COMPLETED")
      ).toBe(true);
    });
  });
});
