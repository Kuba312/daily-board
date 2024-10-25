CREATE TABLE duty (
    id CHAR(36) PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    effective_date DATE,
    start_time TIME,
    end_time TIME
);