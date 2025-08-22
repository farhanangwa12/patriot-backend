 
-- Questions Table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,      -- pertanyaan uraian
    fact_answer TEXT NOT NULL,        -- kunci jawaban / jawaban acuan
    question_type VARCHAR(50) DEFAULT 'essay', -- biar tetap fleksibel

    created_by_ai BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
