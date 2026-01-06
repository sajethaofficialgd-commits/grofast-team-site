-- =============================================
-- GROFAST DIGITAL TEAM - DATABASE SCHEMA
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- 1. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(255),
    department VARCHAR(255),
    roles TEXT[], -- Array of role IDs
    bio TEXT,
    profile_photo TEXT,
    field VARCHAR(100), -- Maps to LEARNING_DATA keys (video_editor, gen_ai, etc.)
    status VARCHAR(50) DEFAULT 'active',
    join_date DATE DEFAULT CURRENT_DATE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    type VARCHAR(50), -- 'check_in' or 'check_out' (deprecated in favor of status)
    date DATE NOT NULL,
    time TIME, -- check_in_time
    check_in_time TIME,
    check_out_time TIME,
    total_hours VARCHAR(20),
    status VARCHAR(50), -- 'present', 'full-day', 'half-day', 'late'
    photo_url TEXT,
    location TEXT,
    work_mode VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. WORK UPDATES TABLE
CREATE TABLE IF NOT EXISTS work_updates (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    activity TEXT NOT NULL,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MESSAGES TABLE (for team chat)
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES employees(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    recipient_id BIGINT REFERENCES employees(id) ON DELETE CASCADE, -- NULL for team chat
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file'
    is_team_chat BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ACTIVITY LOG TABLE
CREATE TABLE IF NOT EXISTS activity_log (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(100),
    employee_name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    assigned_to BIGINT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to BIGINT REFERENCES employees(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(50) DEFAULT 'medium',
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. LEARNING PROGRESS TABLE
CREATE TABLE IF NOT EXISTS learning_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    module_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started',
    progress INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- 9. LEARNING LOGS TABLE
CREATE TABLE IF NOT EXISTS learning_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    topic TEXT NOT NULL,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. EVENTS TABLE (Calendar)
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    type VARCHAR(50) DEFAULT 'personal', -- 'work', 'learning', 'meeting', 'personal'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. MOOD LOGS TABLE (Pulse Surveys)
CREATE TABLE IF NOT EXISTS mood_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    mood VARCHAR(50) NOT NULL, -- 'great', 'good', 'okay', 'stressed'
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    pinned BOOLEAN DEFAULT false,
    created_by BIGINT REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read (for demo purposes)
-- In production, you'd want stricter policies

CREATE POLICY "Allow public read on employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow public insert on employees" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on employees" ON employees FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on employees" ON employees FOR DELETE USING (true);

CREATE POLICY "Allow public read on attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Allow public insert on attendance" ON attendance FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on work_updates" ON work_updates FOR SELECT USING (true);
CREATE POLICY "Allow public insert on work_updates" ON work_updates FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert on messages" ON messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on activity_log" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert on activity_log" ON activity_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert on projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on projects" ON projects FOR UPDATE USING (true);

CREATE POLICY "Allow public read on tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on tasks" ON tasks FOR UPDATE USING (true);

CREATE POLICY "Allow public read on learning_progress" ON learning_progress FOR SELECT USING (true);
CREATE POLICY "Allow public insert on learning_progress" ON learning_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on learning_progress" ON learning_progress FOR UPDATE USING (true);

CREATE POLICY "Allow public read on learning_logs" ON learning_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on learning_logs" ON learning_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on learning_logs" ON learning_logs FOR DELETE USING (true);

-- Enable RLS on new tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Allow public read on events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public insert on events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on events" ON events FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on events" ON events FOR DELETE USING (true);

-- Mood logs policies
CREATE POLICY "Allow public read on mood_logs" ON mood_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on mood_logs" ON mood_logs FOR INSERT WITH CHECK (true);

-- Announcements policies
CREATE POLICY "Allow public read on announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Allow public insert on announcements" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on announcements" ON announcements FOR UPDATE USING (true);

-- =============================================
-- ENABLE REALTIME
-- =============================================

-- Enable realtime for messages and events tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;

-- =============================================
-- INSERT DEFAULT ADMIN/EMPLOYEES
-- =============================================

-- Insert Grofast Admin
INSERT INTO employees (id, name, email, password, field, position, department, status) 
VALUES (1, 'Grofast Admin', 'grofastdigital@gmail.com', 'Grofast@123', 'all', 'CEO & Founder', 'Management', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert Naveena (the employee you wanted to add)
INSERT INTO employees (name, email, password, position, field, department, status) 
VALUES ('Naveena', 'sajeethasiva6@gmail.com', 'Sara@1545', 'Team Member', 'digital_marketing', 'Marketing', 'active')
ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Database setup complete! ✅' as status;
