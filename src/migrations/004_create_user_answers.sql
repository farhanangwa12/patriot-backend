CREATE TABLE user_answers (
    id SERIAL PRIMARY KEY,
    
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    
    user_answer TEXT, -- boleh NULL kalau belum menjawab
    
    is_correct BOOLEAN, -- TRUE, FALSE, atau NULL (belum dijawab)
    score INTEGER, -- NULL (belum dijawab), 0 (salah), >0 (benar/partial)
    
    answered_at TIMESTAMP, -- NULL kalau belum menjawab
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
