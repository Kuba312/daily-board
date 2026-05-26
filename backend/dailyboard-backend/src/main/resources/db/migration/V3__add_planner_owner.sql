ALTER TABLE planner
    ADD COLUMN owner_id VARCHAR(36);

CREATE INDEX idx_planner_owner_id ON planner(owner_id);

ALTER TABLE planner
    ADD CONSTRAINT fk_planner_owner
    FOREIGN KEY (owner_id) REFERENCES app_user(id);
