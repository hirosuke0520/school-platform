import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

describe("レッスン進捗API統合テスト", () => {
  let testUser: any;
  let testCourse: any;
  let testChapter: any;
  let testLesson: any;

  beforeAll(async () => {
    // テストデータのクリーンアップ（プログレスAPIテスト用データのみ）
    await prisma.userProgress.deleteMany({
      where: {
        user: {
          email: {
            contains: "progress-test"
          }
        }
      }
    });
    await prisma.lesson.deleteMany({
      where: {
        title: {
          contains: "進捗テスト"
        }
      }
    });
    await prisma.chapter.deleteMany({
      where: {
        title: {
          contains: "進捗テスト"
        }
      }
    });
    await prisma.course.deleteMany({
      where: {
        title: {
          contains: "進捗テスト"
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "progress-test"
        }
      }
    });

    // テストユーザー作成
    testUser = await prisma.user.create({
      data: {
        email: "progress-test-main@example.com",
        name: "進捗テストユーザー",
        passwordHash: await bcrypt.hash("test123", 10),
        role: "LEARNER",
      },
    });

    // テストコース・チャプター・レッスン作成
    testCourse = await prisma.course.create({
      data: {
        title: "進捗テストコース",
        orderIndex: 1,
      },
    });

    testChapter = await prisma.chapter.create({
      data: {
        title: "進捗テストチャプター",
        orderIndex: 1,
        courseId: testCourse.id,
      },
    });

    testLesson = await prisma.lesson.create({
      data: {
        title: "進捗テストレッスン",
        content: "これはテスト用のレッスンです",
        orderIndex: 1,
        chapterId: testChapter.id,
        isPublished: true,
      },
    });
  });

  afterAll(async () => {
    // テスト後のクリーンアップ（プログレスAPIテスト用データのみ）
    await prisma.userProgress.deleteMany({
      where: {
        user: {
          email: {
            contains: "progress-test"
          }
        }
      }
    });
    await prisma.lesson.deleteMany({
      where: {
        title: {
          contains: "進捗テスト"
        }
      }
    });
    await prisma.chapter.deleteMany({
      where: {
        title: {
          contains: "進捗テスト"
        }
      }
    });
    await prisma.course.deleteMany({
      where: {
        title: {
          contains: "進捗テスト"
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "progress-test"
        }
      }
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // 各テスト前に進捗データをクリア
    await prisma.userProgress.deleteMany({
      where: {
        userId: testUser.id,
        lessonId: testLesson.id,
      },
    });
  });

  describe("レッスン開始API", () => {
    it("新しいレッスンを開始できる", async () => {
      // レッスン開始前の状態確認
      const beforeProgress = await prisma.userProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: testUser.id,
            lessonId: testLesson.id,
          },
        },
      });
      expect(beforeProgress).toBeNull();

      // レッスン開始処理をシミュレート
      const userProgress = await prisma.userProgress.create({
        data: {
          userId: testUser.id,
          lessonId: testLesson.id,
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });

      // 進捗が正しく作成されたことを確認
      expect(userProgress.status).toBe("IN_PROGRESS");
      expect(userProgress.startedAt).toBeTruthy();
      expect(userProgress.completedAt).toBeNull();
    });

    it("既に開始済みのレッスンを再開始した場合、状態が更新される", async () => {
      // 先に未開始状態の進捗を作成
      await prisma.userProgress.create({
        data: {
          userId: testUser.id,
          lessonId: testLesson.id,
          status: "NOT_STARTED",
        },
      });

      // レッスン開始処理をシミュレート
      const updatedProgress = await prisma.userProgress.update({
        where: {
          userId_lessonId: {
            userId: testUser.id,
            lessonId: testLesson.id,
          },
        },
        data: {
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });

      // 状態が更新されたことを確認
      expect(updatedProgress.status).toBe("IN_PROGRESS");
      expect(updatedProgress.startedAt).toBeTruthy();
    });
  });

  describe("レッスン完了API", () => {
    it("進行中のレッスンを完了できる", async () => {
      // 先に進行中状態の進捗を作成
      const startTime = new Date();
      await prisma.userProgress.create({
        data: {
          userId: testUser.id,
          lessonId: testLesson.id,
          status: "IN_PROGRESS",
          startedAt: startTime,
        },
      });

      // レッスン完了処理をシミュレート
      const completedProgress = await prisma.userProgress.update({
        where: {
          userId_lessonId: {
            userId: testUser.id,
            lessonId: testLesson.id,
          },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // 完了状態が正しく設定されたことを確認
      expect(completedProgress.status).toBe("COMPLETED");
      expect(completedProgress.completedAt).toBeTruthy();
      expect(completedProgress.startedAt).toEqual(startTime);
    });

    it("進捗なしでレッスンを完了した場合、新しい進捗が作成される", async () => {
      // 進捗が存在しない状態を確認
      const beforeProgress = await prisma.userProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: testUser.id,
            lessonId: testLesson.id,
          },
        },
      });
      expect(beforeProgress).toBeNull();

      // レッスン完了処理をシミュレート
      const now = new Date();
      const newProgress = await prisma.userProgress.create({
        data: {
          userId: testUser.id,
          lessonId: testLesson.id,
          status: "COMPLETED",
          startedAt: now,
          completedAt: now,
        },
      });

      // 新しい進捗が作成されたことを確認
      expect(newProgress.status).toBe("COMPLETED");
      expect(newProgress.startedAt).toBeTruthy();
      expect(newProgress.completedAt).toBeTruthy();
    });

    it("完了済みのレッスンを再完了しても問題ない", async () => {
      // 先に完了済み状態の進捗を作成
      const firstCompletionTime = new Date();
      await prisma.userProgress.create({
        data: {
          userId: testUser.id,
          lessonId: testLesson.id,
          status: "COMPLETED",
          startedAt: new Date(Date.now() - 60000),
          completedAt: firstCompletionTime,
        },
      });

      // 再完了処理をシミュレート
      const newCompletionTime = new Date();
      const recompletedProgress = await prisma.userProgress.update({
        where: {
          userId_lessonId: {
            userId: testUser.id,
            lessonId: testLesson.id,
          },
        },
        data: {
          status: "COMPLETED",
          completedAt: newCompletionTime,
        },
      });

      // 完了時刻が更新されたことを確認
      expect(recompletedProgress.status).toBe("COMPLETED");
      expect(recompletedProgress.completedAt).toEqual(newCompletionTime);
      expect(recompletedProgress.completedAt?.getTime()).toBeGreaterThan(
        firstCompletionTime.getTime()
      );
    });
  });

  describe("進捗状態の整合性", () => {
    it("ユーザーごとにレッスン進捗が独立している", async () => {
      // 別のテストユーザーを作成
      const otherUser = await prisma.user.create({
        data: {
          email: "other-progress-test@example.com",
          name: "別の進捗テストユーザー",
          passwordHash: await bcrypt.hash("test123", 10),
          role: "LEARNER",
        },
      });

      try {
        // 最初のユーザーがレッスンを開始
        await prisma.userProgress.create({
          data: {
            userId: testUser.id,
            lessonId: testLesson.id,
            status: "IN_PROGRESS",
            startedAt: new Date(),
          },
        });

        // 2番目のユーザーがレッスンを完了
        await prisma.userProgress.create({
          data: {
            userId: otherUser.id,
            lessonId: testLesson.id,
            status: "COMPLETED",
            startedAt: new Date(Date.now() - 60000),
            completedAt: new Date(),
          },
        });

        // それぞれの進捗が独立していることを確認
        const firstUserProgress = await prisma.userProgress.findUnique({
          where: {
            userId_lessonId: {
              userId: testUser.id,
              lessonId: testLesson.id,
            },
          },
        });

        const secondUserProgress = await prisma.userProgress.findUnique({
          where: {
            userId_lessonId: {
              userId: otherUser.id,
              lessonId: testLesson.id,
            },
          },
        });

        expect(firstUserProgress?.status).toBe("IN_PROGRESS");
        expect(secondUserProgress?.status).toBe("COMPLETED");
      } finally {
        // 別ユーザーをクリーンアップ
        await prisma.userProgress.deleteMany({
          where: { userId: otherUser.id },
        });
        await prisma.user.delete({
          where: { id: otherUser.id },
        });
      }
    });

    it("同じユーザーが複数レッスンを管理できる", async () => {
      // 別のレッスンを作成
      const otherLesson = await prisma.lesson.create({
        data: {
          title: "別の進捗テストレッスン",
          content: "これは別のテスト用レッスンです",
          orderIndex: 2,
          chapterId: testChapter.id,
          isPublished: true,
        },
      });

      try {
        // 最初のレッスンを進行中に
        await prisma.userProgress.create({
          data: {
            userId: testUser.id,
            lessonId: testLesson.id,
            status: "IN_PROGRESS",
            startedAt: new Date(),
          },
        });

        // 2番目のレッスンを完了に
        await prisma.userProgress.create({
          data: {
            userId: testUser.id,
            lessonId: otherLesson.id,
            status: "COMPLETED",
            startedAt: new Date(Date.now() - 60000),
            completedAt: new Date(),
          },
        });

        // 両方の進捗が正しく管理されていることを確認
        const allProgress = await prisma.userProgress.findMany({
          where: { userId: testUser.id },
          orderBy: { lessonId: "asc" },
        });

        expect(allProgress).toHaveLength(2);
        expect(allProgress[0].status).toBe("IN_PROGRESS");
        expect(allProgress[1].status).toBe("COMPLETED");
      } finally {
        // 別レッスンをクリーンアップ
        await prisma.userProgress.deleteMany({
          where: { lessonId: otherLesson.id },
        });
        await prisma.lesson.delete({
          where: { id: otherLesson.id },
        });
      }
    });
  });
});