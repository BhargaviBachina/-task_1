CREATE TABLE records (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    data JSON NOT NULL,
    session_id VARCHAR(255) DEFAULT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (user_id), 
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) 
    
);
