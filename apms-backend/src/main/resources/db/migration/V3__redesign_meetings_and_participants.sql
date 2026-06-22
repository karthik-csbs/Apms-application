-- Drop old meetings table if it exists
DROP TABLE IF EXISTS meetings CASCADE;

-- Create meeting types and status columns (handled via varchar in Hibernate/Postgres)
CREATE TABLE meetings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_type VARCHAR(50) NOT NULL,
    meeting_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    meeting_link VARCHAR(512),
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meeting_participants (
    id BIGSERIAL PRIMARY KEY,
    meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    attendance_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT unique_meeting_user UNIQUE (meeting_id, user_id)
);
