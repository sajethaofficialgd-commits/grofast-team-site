// =============================================
// SUPABASE DATABASE HELPER
// Grofast Digital Team - Persistent Storage
// =============================================

// Initialize Supabase client
let supabaseClient = null;

// Check if Supabase JS is loaded
function initSupabase() {
    if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase connected!');
        return true;
    }
    console.warn('⚠️ Supabase not available, using localStorage fallback');
    return false;
}

// =============================================
// EMPLOYEES CRUD OPERATIONS
// =============================================

// Get all employees
async function getEmployeesFromDB() {
    if (!supabaseClient) {
        return JSON.parse(localStorage.getItem('employees') || '[]');
    }

    try {
        const { data, error } = await supabaseClient
            .from('employees')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('DB Error:', err);
        return JSON.parse(localStorage.getItem('employees') || '[]');
    }
}

// Get employee by ID
async function getEmployeeById(id) {
    if (!supabaseClient) {
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        return employees.find(e => e.id == id) || null;
    }

    try {
        const { data, error } = await supabaseClient
            .from('employees')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('DB Error:', err);
        return null;
    }
}

// Get employee by email
async function getEmployeeByEmail(email) {
    if (!supabaseClient) {
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        return employees.find(e => e.email.toLowerCase() === email.toLowerCase()) || null;
    }

    try {
        const { data, error } = await supabaseClient
            .from('employees')
            .select('*')
            .ilike('email', email)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    } catch (err) {
        console.error('DB Error:', err);
        return null;
    }
}

// Add new employee
async function addEmployeeToDB(employeeData) {
    if (!supabaseClient) {
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        const newEmployee = {
            id: Date.now().toString(),
            ...employeeData,
            created_at: new Date().toISOString(),
            status: 'active'
        };
        employees.push(newEmployee);
        localStorage.setItem('employees', JSON.stringify(employees));
        return newEmployee;
    }

    try {
        const { data, error } = await supabaseClient
            .from('employees')
            .insert([{
                ...employeeData,
                status: 'active'
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('DB Error:', err);
        return null;
    }
}

// Update employee
async function updateEmployeeInDB(id, updates) {
    if (!supabaseClient) {
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        const index = employees.findIndex(e => e.id == id);
        if (index !== -1) {
            employees[index] = { ...employees[index], ...updates };
            localStorage.setItem('employees', JSON.stringify(employees));
            return employees[index];
        }
        return null;
    }

    try {
        const { data, error } = await supabaseClient
            .from('employees')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('DB Error:', err);
        return null;
    }
}

// Delete employee
async function deleteEmployeeFromDB(id) {
    if (!supabaseClient) {
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        const filtered = employees.filter(e => e.id != id);
        localStorage.setItem('employees', JSON.stringify(filtered));
        return true;
    }

    try {
        const { error } = await supabaseClient
            .from('employees')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('DB Error:', err);
        return false;
    }
}

// =============================================
// ATTENDANCE CRUD OPERATIONS
// =============================================

// Get attendance records
async function getAttendanceFromDB(filters = {}) {
    if (!supabaseClient) {
        let records = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
        if (filters.userId) {
            records = records.filter(r => r.userId == filters.userId);
        }
        if (filters.date) {
            records = records.filter(r => r.date === filters.date);
        }
        return records;
    }

    try {
        let query = supabaseClient.from('attendance').select('*');

        if (filters.userId) {
            query = query.eq('user_id', filters.userId);
        }
        if (filters.date) {
            query = query.eq('date', filters.date);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('DB Error:', err);
        return [];
    }
}

// Add attendance record
async function addAttendanceToDB(attendanceData) {
    if (!supabaseClient) {
        const records = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
        const newRecord = {
            id: Date.now().toString(),
            ...attendanceData,
            timestamp: new Date().toISOString()
        };
        records.push(newRecord);
        localStorage.setItem('gf_attendance', JSON.stringify(records));
        return newRecord;
    }

    try {
        const { data, error } = await supabaseClient
            .from('attendance')
            .insert([{
                user_id: attendanceData.userId,
                user_name: attendanceData.userName,
                type: attendanceData.type,
                date: attendanceData.date,
                time: attendanceData.time,
                photo_url: attendanceData.photoUrl || null,
                location: attendanceData.location || null,
                latitude: attendanceData.latitude || null,
                longitude: attendanceData.longitude || null
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('DB Error:', err);
        return null;
    }
}

// =============================================
// WORK UPDATES CRUD OPERATIONS
// =============================================

// Get work updates
async function getWorkUpdatesFromDB(filters = {}) {
    if (!supabaseClient) {
        let updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');
        if (filters.userId) {
            updates = updates.filter(u => u.userId == filters.userId);
        }
        if (filters.date) {
            updates = updates.filter(u => u.date === filters.date);
        }
        return updates;
    }

    try {
        let query = supabaseClient.from('work_updates').select('*');

        if (filters.userId) {
            query = query.eq('user_id', filters.userId);
        }
        if (filters.date) {
            query = query.eq('date', filters.date);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('DB Error:', err);
        return [];
    }
}

// Add work update
async function addWorkUpdateToDB(updateData) {
    if (!supabaseClient) {
        const updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');
        const newUpdate = {
            id: Date.now().toString(),
            ...updateData,
            timestamp: new Date().toISOString()
        };
        updates.push(newUpdate);
        localStorage.setItem('gf_work_updates', JSON.stringify(updates));
        return newUpdate;
    }

    try {
        const { data, error } = await supabaseClient
            .from('work_updates')
            .insert([{
                user_id: updateData.userId,
                user_name: updateData.userName,
                date: updateData.date,
                start_time: updateData.startTime,
                end_time: updateData.endTime,
                activity: updateData.activity,
                category: updateData.category,
                status: updateData.status || 'completed'
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('DB Error:', err);
        return null;
    }
}

// =============================================
// MESSAGES CRUD OPERATIONS
// =============================================

// Get messages
async function getMessagesFromDB(limit = 50) {
    if (!supabaseClient) {
        const messages = JSON.parse(localStorage.getItem('gf_messages') || '[]');
        return messages.slice(-limit);
    }

    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('DB Error:', err);
        return [];
    }
}

// Add message
async function addMessageToDB(messageData) {
    if (!supabaseClient) {
        const messages = JSON.parse(localStorage.getItem('gf_messages') || '[]');
        const newMessage = {
            id: Date.now().toString(),
            ...messageData,
            timestamp: new Date().toISOString()
        };
        messages.push(newMessage);
        localStorage.setItem('gf_messages', JSON.stringify(messages));
        return newMessage;
    }

    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .insert([{
                user_id: messageData.userId,
                user_name: messageData.userName,
                recipient_id: messageData.recipientId || null,
                content: messageData.content,
                type: messageData.type || 'text',
                is_team_chat: !!messageData.isTeamChat
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('DB Error:', err);
        return null;
    }
}

// Subscribe to new messages (real-time)
function subscribeToMessages(callback) {
    if (!supabaseClient) {
        console.warn('Real-time not available without Supabase');
        return null;
    }

    return supabaseClient
        .channel('messages')
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
                callback(payload.new);
            }
        )
        .subscribe();
}

// =============================================
// ACTIVITY LOG
// =============================================

// Add activity log
async function addActivityToDB(type, employee, description) {
    if (!supabaseClient) {
        const log = JSON.parse(localStorage.getItem('activityLog') || '[]');
        const newActivity = {
            id: Date.now().toString(),
            type,
            employee,
            description,
            timestamp: new Date().toISOString()
        };
        log.unshift(newActivity);
        localStorage.setItem('activityLog', JSON.stringify(log));
        return newActivity;
    }

    try {
        const { data, error } = await supabaseClient
            .from('activity_log')
            .insert([{
                type,
                employee_name: employee,
                description
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('DB Error:', err);
        return null;
    }
}

// Get activity log
async function getActivityLogFromDB(limit = 20) {
    if (!supabaseClient) {
        const log = JSON.parse(localStorage.getItem('activityLog') || '[]');
        return log.slice(0, limit);
    }

    try {
        const { data, error } = await supabaseClient
            .from('activity_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('DB Error:', err);
        return [];
    }
}

// =============================================
// LEARNING CRUD OPERATIONS
// =============================================

// Get learning progress
async function getLearningProgressFromDB(userId) {
    if (!supabaseClient) {
        return JSON.parse(localStorage.getItem(`learning_progress_${userId}`) || '[]');
    }

    try {
        const { data, error } = await supabaseClient
            .from('learning_progress')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('DB Error:', err);
        return [];
    }
}

// Update learning progress
async function updateLearningProgressInDB(userId, moduleId, updates) {
    if (!supabaseClient) {
        const progress = JSON.parse(localStorage.getItem(`learning_progress_${userId}`) || '[]');
        const index = progress.findIndex(p => p.moduleId === moduleId);
        if (index !== -1) {
            progress[index] = { ...progress[index], ...updates };
        } else {
            progress.push({ moduleId, ...updates });
        }
        localStorage.setItem(`learning_progress_${userId}`, JSON.stringify(progress));
        return true;
    }

    try {
        const { data, error } = await supabaseClient
            .from('learning_progress')
            .upsert({
                user_id: userId,
                module_id: moduleId,
                ...updates,
                updated_at: new Date().toISOString()
            })
            .select();

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('DB Error:', err);
        return false;
    }
}

// Get learning logs
async function getLearningLogsFromDB(userId) {
    if (!supabaseClient) {
        return JSON.parse(localStorage.getItem(`learning_logs_${userId}`) || '[]');
    }

    try {
        const { data, error } = await supabaseClient
            .from('learning_logs')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('DB Error:', err);
        return [];
    }
}

// Add learning log
async function addLearningLogToDB(logData) {
    if (!supabaseClient) {
        const logs = JSON.parse(localStorage.getItem(`learning_logs_${logData.userId}`) || '[]');
        const newLog = {
            id: Date.now().toString(),
            ...logData,
            created_at: new Date().toISOString()
        };
        logs.push(newLog);
        localStorage.setItem(`learning_logs_${logData.userId}`, JSON.stringify(logs));
        return newLog;
    }

    try {
        const { data, error } = await supabaseClient
            .from('learning_logs')
            .insert([{
                user_id: logData.userId,
                date: logData.date,
                topic: logData.topic,
                start_time: logData.startTime,
                end_time: logData.endTime
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('DB Error:', err);
        return null;
    }
}

// Delete learning log
async function deleteLearningLogFromDB(id) {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient
            .from('learning_logs')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (err) {
        console.error('DB Error:', err);
        return false;
    }
}

// =============================================
// FILE STORAGE (for photos)
// =============================================

// Upload file to Supabase Storage
async function uploadFile(bucket, filePath, file) {
    if (!supabaseClient) {
        console.warn('File upload not available without Supabase');
        return null;
    }

    try {
        const { data, error } = await supabaseClient
            .storage
            .from(bucket)
            .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabaseClient
            .storage
            .from(bucket)
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (err) {
        console.error('Upload Error:', err);
        return null;
    }
}

// =============================================
// AUTHENTICATION HELPER
// =============================================

// Validate employee login
async function validateEmployeeLogin(email, password) {
    // First check DEMO_USERS (permanent users in config)
    if (typeof DEMO_USERS !== 'undefined') {
        const demoUser = DEMO_USERS.find(user =>
            user.email.toLowerCase() === email.toLowerCase() &&
            user.password === password &&
            user.role !== 'admin'
        );
        if (demoUser) {
            return {
                id: demoUser.id,
                name: demoUser.name,
                email: demoUser.email,
                role: demoUser.role,
                position: demoUser.position,
                department: demoUser.department,
                phone: demoUser.phone,
                status: 'active'
            };
        }
    }

    // Then check database
    const employee = await getEmployeeByEmail(email);
    if (employee && employee.password === password) {
        return employee;
    }

    return null;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
});

console.log('📦 Supabase database helper loaded');
