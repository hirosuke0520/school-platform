# データベース設計 - ER図

## ER図

```mermaid
erDiagram
    User {
        string id PK
        string email UK
        string name
        string passwordHash
        UserRole role
        DateTime emailVerified
        boolean isFirstLogin
        DateTime createdAt
        DateTime updatedAt
        DateTime deletedAt
        boolean isDeleted
    }
    
    Course {
        int id PK
        string title
        string description
        int orderIndex
        boolean isActive
        DateTime createdAt
        DateTime deletedAt
        boolean isDeleted
    }
    
    Chapter {
        int id PK
        int courseId FK
        string title
        string description
        int orderIndex
        DateTime createdAt
        DateTime deletedAt
        boolean isDeleted
    }
    
    Lesson {
        int id PK
        int chapterId FK
        string title
        string content
        int estimatedMinutes
        int orderIndex
        boolean isPublished
        DateTime createdAt
        DateTime updatedAt
        DateTime deletedAt
        boolean isDeleted
    }
    
    UserProgress {
        string id PK
        string userId FK
        int lessonId FK
        ProgressStatus status
        DateTime startedAt
        DateTime completedAt
        DateTime createdAt
    }
    
    LearningSession {
        string id PK
        string userId FK
        DateTime startedAt
        DateTime endedAt
        string progressReport
        DateTime createdAt
    }

    User ||--o{ UserProgress : "tracks"
    User ||--o{ LearningSession : "participates"
    Course ||--o{ Chapter : "contains"
    Chapter ||--o{ Lesson : "contains"
    Lesson ||--o{ UserProgress : "has"
```

## データベース設計の特徴

### 主要エンティティ
- **User**: システム利用者（学習者、講師、管理者）
- **Course**: コース（学習単位の最上位）
- **Chapter**: チャプター（コース内の章）
- **Lesson**: レッスン（実際の学習コンテンツ）
- **UserProgress**: ユーザーの学習進捗
- **LearningSession**: 学習セッション

### 設計の特徴
1. **階層構造**: Course → Chapter → Lesson の3層構造
2. **ソフトデリート**: deletedAt, isDeleted による論理削除対応
3. **進捗管理**: UserProgress による詳細な学習状況追跡
4. **学習時間管理**: LearningSession による学習時間・レポート記録（レッスン進捗とは独立）
5. **ユーザー役割**: ADMIN, INSTRUCTOR, LEARNER の3役割

### Enum定義
- **UserRole**: ADMIN, INSTRUCTOR, LEARNER
- **ProgressStatus**: NOT_STARTED, IN_PROGRESS, COMPLETED