
CREATE DATABASE IF NOT EXISTS user_auth;


USE user_auth;


CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,   
    username VARCHAR(255) NOT NULL,      
    email VARCHAR(255) NOT NULL UNIQUE,  
    password VARCHAR(255) NOT NULL,      
    phoneNumber VARCHAR(15),             
    gender ENUM('Male', 'Female', 'Other'), 
    dob DATE,                            
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
);