CREATE DATABASE IF NOT EXISTS trabalho;
USE trabalho;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50),
  password VARCHAR(50),
  name VARCHAR(100)
);

INSERT INTO users (username,password,name) VALUES
('pedro','123456','Pedro Henrique'),
('nanda','123789','Leandra Beatriz');
