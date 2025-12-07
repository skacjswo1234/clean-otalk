-- 관리자 테이블 스키마
-- D1 데이터베이스용 SQL

CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 초기 관리자 비밀번호 설정 (기본 비밀번호: admin123)
-- 실제 사용 시 비밀번호는 해시화하여 저장하는 것을 권장합니다
INSERT OR IGNORE INTO admin (password) VALUES ('1234');

