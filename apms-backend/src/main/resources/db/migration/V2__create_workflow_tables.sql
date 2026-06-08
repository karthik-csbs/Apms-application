-- Create workflow table
CREATE TABLE workflow (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    project_type VARCHAR(50),
    total_stages INTEGER,
    current_stage INTEGER,
    workflow_status VARCHAR(50),
    submitted_date TIMESTAMP,
    approved_date TIMESTAMP,
    completed_date TIMESTAMP,
    remarks VARCHAR(1000),
    created_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP,
    updated_by VARCHAR(255),
    CONSTRAINT fk_workflow_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Add index on project_id
CREATE INDEX idx_workflow_project_id ON workflow(project_id);

-- Create workflow_stage table
CREATE TABLE workflow_stage (
    id BIGSERIAL PRIMARY KEY,
    workflow_id BIGINT NOT NULL,
    stage_number INTEGER NOT NULL,
    stage_name VARCHAR(255),
    stage_status VARCHAR(50),
    reviewer_id BIGINT,
    reviewed_date TIMESTAMP,
    remarks VARCHAR(1000),
    created_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP,
    updated_by VARCHAR(255),
    CONSTRAINT fk_workflow_stage_workflow FOREIGN KEY (workflow_id) REFERENCES workflow(id) ON DELETE CASCADE
);

-- Add indexes on workflow_id and stage_number
CREATE INDEX idx_workflow_stage_workflow_id ON workflow_stage(workflow_id);
CREATE INDEX idx_workflow_stage_number ON workflow_stage(stage_number);

-- Create workflow_history table
CREATE TABLE workflow_history (
    id BIGSERIAL PRIMARY KEY,
    workflow_id BIGINT,
    project_id BIGINT,
    stage_number INTEGER,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    action VARCHAR(100),
    remarks VARCHAR(1000),
    performed_by VARCHAR(255),
    performed_date TIMESTAMP,
    created_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP,
    updated_by VARCHAR(255)
);

-- Add index on project_id in history table
CREATE INDEX idx_workflow_history_project_id ON workflow_history(project_id);
