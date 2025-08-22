 
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO users (name, email, password, created_at, updated_at) 
SELECT 'John Doe', 'john.doe@example.com', '$2b$10$K7L/VJp.0QZr1Fl4aWzZKOzYm8PzZ5w9Rj5n7qJ9JzXzW8RHnz8jG', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'john.doe@example.com');

INSERT INTO users (name, email, password, created_at, updated_at) 
SELECT 'Jane Smith', 'jane.smith@example.com', '$2b$10$M9N/WLq.1RAr2Gm5bXaLPP0aoc1R6z0A9k6o8sL0Ma0Y9SJO0a9K', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jane.smith@example.com');

INSERT INTO users (name, email, password, created_at, updated_at) 
SELECT 'Bob Johnson', 'bob.johnson@example.com', '$2b$10$L8K/VIo.0PZq1Em4aVyYJO9Xl7OyZz4w8Qi4n6pI8yWyV7QGmy7iF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bob.johnson@example.com');