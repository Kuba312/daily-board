CREATE TABLE planner (
    id VARCHAR(36) PRIMARY KEY NOT NULL,
    title VARCHAR(255) NOT NULL,
    until_time TIME,
    is_constant BOOLEAN
);

CREATE TABLE duty (
    id VARCHAR(36) PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    effective_date DATE,
    start_time TIME,
    end_time TIME,
    week_day VARCHAR(10),
    color VARCHAR(7),
    planner_id VARCHAR(36),
    FOREIGN KEY (planner_id) REFERENCES planner(id) ON DELETE CASCADE
);