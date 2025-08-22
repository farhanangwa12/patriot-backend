-- Quiz Sessions Table
CREATE TABLE quiz_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 100,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);