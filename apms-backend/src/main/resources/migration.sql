-- 1. Upgrades to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS skills TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS github_profile VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS resume_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. Upgrades to project_team table
ALTER TABLE project_team ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'MEMBER';
ALTER TABLE project_team ADD COLUMN IF NOT EXISTS contribution TEXT;
ALTER TABLE project_team ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Migrate old team_lead boolean values to new role column if table exists and column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='project_team' AND column_name='team_lead') THEN
        UPDATE project_team SET role = 'TEAM_LEAD' WHERE team_lead = true;
        UPDATE project_team SET role = 'MEMBER' WHERE team_lead = false OR team_lead IS NULL;
        ALTER TABLE project_team DROP COLUMN team_lead;
    END IF;
END $$;

-- 3. Upgrades to notifications table
ALTER TABLE notifications RENAME COLUMN is_read TO read_status;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS student_id BIGINT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS project_id BIGINT;

-- Migrate user_id to student_id if user_id exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='user_id') THEN
        UPDATE notifications SET student_id = user_id;
        ALTER TABLE notifications DROP COLUMN user_id;
    END IF;
END $$;

-- Add foreign key constraints for notifications
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS fk_notifications_student;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS fk_notifications_project;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
