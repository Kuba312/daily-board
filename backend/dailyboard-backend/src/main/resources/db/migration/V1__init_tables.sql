CREATE TABLE duty (
    id VARCHAR(36) PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    effective_date DATE,
    start_time TIME,
    end_time TIME,
    week_day VARCHAR(10),
    color VARCHAR(7)
);

