 
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT 'Quiz Patriotisme',
    description TEXT,
    question_statuses JSON,
    total_questions INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- INSERT INTO quizzes (
--     id, 
--     title, 
--     description, 
--     question_statuses, 
--     total_questions, 
--     created_at, 
--     updated_at
-- ) VALUES (
--     1,
--     'Quiz Patriotisme',
--     'Ini adalah quiz patriotisme yang dirancang untuk menguji pengetahuan, pemahaman, dan rasa cinta tanah air para peserta. Melalui soal-soal yang telah disusun, kuis ini tidak hanya mengingatkan kita pada peristiwa sejarah penting, tetapi juga membantu merefleksikan nilai-nilai perjuangan dan pengorbanan para pahlawan bangsa. Dengan demikian, diharapkan peserta dapat semakin menghargai semangat nasionalisme serta menerapkannya dalam kehidupan sehari-hari.',
--     '[
--         { "status": "fakta" },
--         { "status": "bukan_fakta" },
--         { "status": "fakta" },
--         { "status": "fakta" },
--         { "status": "bukan_fakta" },
--         { "status": "fakta" },
--         { "status": "fakta" },
--         { "status": "bukan_fakta" },
--         { "status": "fakta" },
--         { "status": "bukan_fakta" }
--     ]',
--     10,
--     CURRENT_TIMESTAMP,
--     CURRENT_TIMESTAMP
-- );
