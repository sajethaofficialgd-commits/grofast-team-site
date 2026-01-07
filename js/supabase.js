// =============================================
// SUPABASE DATABASE HELPER
// Grofast Digital Team - Persistent Storage
// =============================================

// Initialize Supabase client
let supabaseClient = null;

// Check if Supabase JS is loaded
function initSupabase() {
    const indicator = document.getElementById('dbStatusIndicator');
    const updateUI = (connected) => {
        if (!indicator) return;
        if (connected) {
            indicator.classList.remove('offline');
            indicator.classList.add('connected');
            indicator.querySelector('.db-status-text').textContent = 'Live Cloud';
            indicator.title = 'Connected to Supabase';
        } else {
            indicator.classList.remove('connected');
            indicator.classList.add('offline');
            indicator.querySelector('.db-status-text').textContent = 'Local Mode';
            indicator.title = 'Using local storage (offline)';
        }
    };

    if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase connected!');
        updateUI(true);
        return true;
    }
    console.warn('⚠️ Supabase not available, using localStorage fallback');
    updateUI(false);
    return false;
}

// Helper: Convert Base64 to Blob
function base64ToBlob(base64, type = 'image/jpeg') {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
}

// Upload file to Supabase Storage
async function uploadToSupabase(base64, path, bucket = 'photos') {
    if (!supabaseClient || !base64) return null;

    try {
        const blob = base64ToBlob(base64);
        const fileName = `${path}_${Date.now()}.jpg`;

        const { data, error } = await supabaseClient
            .storage
            .from(bucket)
            .upload(fileName, blob, {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabaseClient
            .storage
            .from(bucket)
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (err) {
        console.error('Upload Error:', err);
        return null;
    }
}

// n8n Webhook Helper for Google Sheets backup
async function callN8NWebhook(type, data) {
    if (typeof N8N_WEBHOOKS === 'undefined' || !N8N_WEBHOOKS[type] || N8N_WEBHOOKS[type].includes('YOUR_N8N')) {
        console.info(`ℹ️ skipping n8n ${type} webhook: URL not configured`);
        return;
    }

    try {
        await fetch(N8N_WEBHOOKS[type], {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data_type: type, // Added this field
                ...data,
                timestamp: new Date().toISOString()
            })
        });
        console.log(`✅ ${type} data backed up to Google Sheets via n8n`);
    } catch (err) {
        console.error(`❌ n8n webhook error for ${type}:`, err);
    }
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
            .eq('id', Number(id))
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
            .eq('id', Number(id))
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
            .eq('id', Number(id));

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
    // Helper to normalize records with consistent field names
    const normalizeRecord = (r) => ({
        ...r,
        userId: r.userId || r.user_id,
        user_id: r.user_id || r.userId,
        userName: r.userName || r.user_name,
        user_name: r.user_name || r.userName,
        timestamp: r.timestamp || r.created_at || new Date(r.date).toISOString()
    });

    // Get from localStorage first (always available)
    let localRecords = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
    localRecords = localRecords.map(normalizeRecord);

    if (filters.userId) {
        const uid = String(filters.userId);
        localRecords = localRecords.filter(r =>
            String(r.userId) === uid || String(r.user_id) === uid
        );
    }
    if (filters.date) {
        localRecords = localRecords.filter(r => r.date === filters.date);
    }

    // If no Supabase, return localStorage only
    if (!supabaseClient) {
        console.log(`📊 getAttendanceFromDB (local): ${localRecords.length} records`);
        return localRecords;
    }

    try {
        let query = supabaseClient.from('attendance').select('*');

        if (filters.userId) {
            const uid = Number(filters.userId);
            if (!isNaN(uid)) {
                query = query.eq('user_id', uid);
            }
        }

        const { data, error } = await query
            .order('date', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Normalize Supabase data
        const supabaseRecords = (data || []).map(normalizeRecord);
        console.log(`📊 getAttendanceFromDB (cloud): ${supabaseRecords.length} records`);

        // Merge: Supabase takes priority, but include local records not in Supabase
        if (supabaseRecords.length > 0) {
            return supabaseRecords;
        }

        // If no Supabase records, return local
        return localRecords;
    } catch (err) {
        console.error('DB Error (falling back to local):', err);
        return localRecords;
    }
}

// Add attendance record
async function addAttendanceToDB(attendanceData) {
    // Always save to localStorage as a fallback/persistent cache
    const saveToLocal = (data) => {
        try {
            const records = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
            const dataUserId = String(data.userId || data.user_id || data.employee_id);

            // For updates, find and replace by matching user + date
            const index = records.findIndex(r => {
                const recordUserId = String(r.userId || r.user_id || r.employee_id);
                return r.date === data.date && recordUserId === dataUserId;
            });

            // Ensure both naming conventions are present
            const normalizedData = {
                ...data,
                userId: dataUserId,
                user_id: dataUserId,
                userName: data.userName || data.user_name,
                user_name: data.user_name || data.userName,
                timestamp: new Date().toISOString()
            };

            if (index !== -1) {
                records[index] = { ...records[index], ...normalizedData };
            } else {
                records.unshift(normalizedData);
            }
            localStorage.setItem('gf_attendance', JSON.stringify(records.slice(0, 100)));
        } catch (e) {
            console.error('Local Storage Error:', e);
        }
    };

    if (!supabaseClient) {
        const userId = attendanceData.userId || attendanceData.employee_id || attendanceData.user_id;
        const userName = attendanceData.userName || attendanceData.employee_name || attendanceData.user_name;
        const localData = {
            id: Date.now().toString(),
            ...attendanceData,
            // Ensure both naming conventions work
            userId: userId,
            user_id: userId,
            userName: userName,
            user_name: userName,
            timestamp: new Date().toISOString()
        };
        saveToLocal(localData);
        console.log('📝 Saved attendance to localStorage:', localData);
        return localData;
    }

    try {
        const recordToSave = {
            user_id: attendanceData.userId || attendanceData.employee_id || attendanceData.user_id,
            user_name: attendanceData.userName || attendanceData.employee_name || attendanceData.user_name,
            type: attendanceData.type || 'check_in',
            date: attendanceData.date,
            check_in_time: attendanceData.check_in_time || attendanceData.time || attendanceData.checkInTime,
            check_out_time: attendanceData.check_out_time || attendanceData.checkOutTime || null,
            total_hours: (attendanceData.total_hours || attendanceData.totalHours || "").toString(),
            status: attendanceData.status || 'present',
            photo_url: attendanceData.photo_url || attendanceData.photoUrl || attendanceData.photo || null,
            location: typeof attendanceData.location === 'string' ? attendanceData.location :
                (attendanceData.location ? `${attendanceData.location.latitude}, ${attendanceData.location.longitude}` : null),
            work_mode: attendanceData.work_mode || attendanceData.workMode || 'Office',
            latitude: attendanceData.latitude || (attendanceData.location?.latitude) || null,
            longitude: attendanceData.longitude || (attendanceData.location?.longitude) || null
        };

        // If we have an ID, we should update/upsert
        let query;
        if (attendanceData.id) {
            query = supabaseClient
                .from('attendance')
                .upsert([{ id: attendanceData.id, ...recordToSave }], { onConflict: 'id' });
        } else {
            // Check if record for today already exists to prevent duplicates if app logic fails
            const { data: existing } = await supabaseClient
                .from('attendance')
                .select('id')
                .eq('user_id', recordToSave.user_id)
                .eq('date', recordToSave.date)
                .maybeSingle();

            if (existing) {
                query = supabaseClient
                    .from('attendance')
                    .update(recordToSave)
                    .eq('id', existing.id);
            } else {
                query = supabaseClient
                    .from('attendance')
                    .insert([recordToSave]);
            }
        }

        const { data, error } = await query.select().single();

        if (error) {
            // If it's a foreign key error, the user doesn't exist in Supabase Employees table
            if (error.code === '23503') {
                console.warn('Foreign key violation: User ID likely doesn\'t exist in Employees table. Saving to local only.');
                saveToLocal(recordToSave);
                return { ...recordToSave, id: 'temp_' + Date.now() };
            }
            throw error;
        }

        // Success - save to local as cache
        saveToLocal(data);

        // Backup to Google Sheets
        callN8NWebhook('attendance', {
            ...data,
            source: 'dashboard_sync'
        });

        return data;
    } catch (err) {
        console.error('DB Attendance Error:', err);
        // Fallback to local
        saveToLocal(attendanceData);
        return { ...attendanceData, id: 'err_' + Date.now() };
    }
}

// =============================================
// WORK UPDATES CRUD OPERATIONS
// =============================================

// Get work updates
async function getWorkUpdatesFromDB(filters = {}) {
    // Helper to normalize records
    const normalizeRecord = (r) => ({
        ...r,
        userId: r.userId || r.user_id || r.employee_id,
        user_id: r.user_id || r.userId || r.employee_id,
        userName: r.userName || r.user_name || r.employee_name,
        user_name: r.user_name || r.userName || r.employee_name,
        startTime: r.startTime || r.start_time,
        start_time: r.start_time || r.startTime,
        endTime: r.endTime || r.end_time,
        end_time: r.end_time || r.endTime,
        timestamp: r.timestamp || r.created_at || new Date().toISOString()
    });

    // Get from localStorage first
    let localUpdates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');
    localUpdates = localUpdates.map(normalizeRecord);

    if (filters.userId) {
        const uid = String(filters.userId);
        localUpdates = localUpdates.filter(u =>
            String(u.userId) === uid || String(u.user_id) === uid || String(u.employee_id) === uid
        );
    }
    if (filters.date) {
        localUpdates = localUpdates.filter(u => u.date === filters.date);
    }

    if (!supabaseClient) {
        console.log(`📊 getWorkUpdatesFromDB (local): ${localUpdates.length} records`);
        return localUpdates;
    }

    try {
        let query = supabaseClient.from('work_updates').select('*');

        if (filters.userId) {
            const uid = Number(filters.userId);
            if (!isNaN(uid)) {
                query = query.eq('user_id', uid);
            }
        }
        if (filters.date) {
            query = query.eq('date', filters.date);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        const supabaseUpdates = (data || []).map(normalizeRecord);
        console.log(`📊 getWorkUpdatesFromDB (cloud): ${supabaseUpdates.length} records`);

        if (supabaseUpdates.length > 0) {
            return supabaseUpdates;
        }

        return localUpdates;
    } catch (err) {
        console.error('DB Error (falling back to local):', err);
        return localUpdates;
    }
}

// Add work update
async function addWorkUpdateToDB(updateData) {
    // Normalize field names
    const userId = updateData.userId || updateData.employee_id || updateData.user_id;
    const userName = updateData.userName || updateData.employee_name || updateData.user_name || '';
    const startTime = updateData.startTime || updateData.start_time;
    const endTime = updateData.endTime || updateData.end_time;

    const normalizedUpdate = {
        ...updateData,
        userId: userId,
        user_id: userId,
        userName: userName,
        user_name: userName,
        startTime: startTime,
        start_time: startTime,
        endTime: endTime,
        end_time: endTime,
        timestamp: new Date().toISOString()
    };

    // Helper to save to localStorage
    const saveToLocal = (data) => {
        const updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');
        updates.unshift(data);
        localStorage.setItem('gf_work_updates', JSON.stringify(updates.slice(0, 200)));
        console.log('📝 Saved work update to localStorage:', data);
        return data;
    };

    if (!supabaseClient) {
        const newUpdate = {
            id: Date.now().toString(),
            ...normalizedUpdate
        };
        return saveToLocal(newUpdate);
    }

    try {
        const { data, error } = await supabaseClient
            .from('work_updates')
            .insert([{
                user_id: userId,
                user_name: userName,
                date: updateData.date,
                start_time: startTime,
                end_time: endTime,
                activity: updateData.activity,
                category: updateData.category || '',
                status: updateData.status || 'completed'
            }])
            .select()
            .single();

        if (error) throw error;

        // Backup to Google Sheets via n8n
        callN8NWebhook('workUpdate', {
            ...normalizedUpdate,
            db_id: data.id,
            source: 'dashboard'
        });

        // Also save to local for instant display
        const localData = { ...normalizedUpdate, id: data.id };
        saveToLocal(localData);

        return data;
    } catch (err) {
        console.error('DB Error (falling back to local):', err);
        // Fallback: save to localStorage even when Supabase fails
        const localUpdate = {
            id: 'local_' + Date.now().toString(),
            ...normalizedUpdate
        };
        return saveToLocal(localUpdate);
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
    // Get from localStorage first
    let localLogs = JSON.parse(localStorage.getItem(`learning_logs_${userId}`) || '[]');

    if (!supabaseClient) {
        console.log(`📚 getLearningLogsFromDB (local): ${localLogs.length} logs`);
        return localLogs;
    }

    try {
        const { data, error } = await supabaseClient
            .from('learning_logs')
            .select('*')
            .eq('user_id', Number(userId))
            .order('date', { ascending: false });

        if (error) throw error;

        console.log(`📚 getLearningLogsFromDB (cloud): ${(data || []).length} logs`);

        if (data && data.length > 0) {
            return data;
        }

        return localLogs;
    } catch (err) {
        console.error('DB Error (falling back to local):', err);
        return localLogs;
    }
}

// Add learning log
async function addLearningLogToDB(logData) {
    const userId = logData.userId || logData.user_id || logData.employee_id;

    // Helper to save to localStorage
    const saveToLocal = (data) => {
        const logs = JSON.parse(localStorage.getItem(`learning_logs_${userId}`) || '[]');
        logs.unshift(data);
        localStorage.setItem(`learning_logs_${userId}`, JSON.stringify(logs.slice(0, 100)));
        console.log('📚 Saved learning log to localStorage:', data);
        return data;
    };

    if (!supabaseClient) {
        const newLog = {
            id: Date.now().toString(),
            ...logData,
            user_id: userId,
            userId: userId,
            start_time: logData.startTime || logData.start_time,
            end_time: logData.endTime || logData.end_time,
            created_at: new Date().toISOString()
        };
        return saveToLocal(newLog);
    }

    try {
        const { data, error } = await supabaseClient
            .from('learning_logs')
            .insert([{
                user_id: userId,
                date: logData.date,
                topic: logData.topic,
                start_time: logData.startTime || logData.start_time,
                end_time: logData.endTime || logData.end_time
            }])
            .select()
            .single();

        if (error) throw error;

        // Backup to Google Sheets via n8n
        callN8NWebhook('learning', {
            ...logData,
            db_id: data.id,
            source: 'dashboard'
        });

        // Also save to localStorage for instant display
        saveToLocal({ ...data, userId: userId });

        return data;
    } catch (err) {
        console.error('DB Error (falling back to local):', err);
        // Fallback to localStorage
        const localLog = {
            id: 'local_' + Date.now().toString(),
            ...logData,
            user_id: userId,
            userId: userId,
            start_time: logData.startTime || logData.start_time,
            end_time: logData.endTime || logData.end_time,
            created_at: new Date().toISOString()
        };
        return saveToLocal(localLog);
    }
}

// Delete learning log
async function deleteLearningLogFromDB(id) {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient
            .from('learning_logs')
            .delete()
            .eq('id', Number(id));
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

// =============================================
// EVENTS CRUD OPERATIONS
// =============================================

async function getEventsFromDB(userId) {
    if (!supabaseClient) {
        const key = `events_${userId}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    try {
        const { data, error } = await supabaseClient
            .from('events')
            .select('*')
            .eq('user_id', Number(userId))
            .order('date', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Events DB Error:', err);
        return JSON.parse(localStorage.getItem(`events_${userId}`) || '[]');
    }
}

async function saveEventToDB(event) {
    if (!supabaseClient) {
        const key = `events_${event.user_id}`;
        const events = JSON.parse(localStorage.getItem(key) || '[]');
        event.id = Date.now();
        events.push(event);
        localStorage.setItem(key, JSON.stringify(events));
        return event;
    }

    try {
        const { data, error } = await supabaseClient
            .from('events')
            .insert([{
                user_id: Number(event.user_id),
                title: event.title,
                description: event.description || '',
                date: event.date,
                time: event.time || null,
                type: event.type || 'personal'
            }])
            .select()
            .single();

        if (error) throw error;

        // Backup to Google Sheets
        callN8NWebhook('event', { ...event, db_id: data.id });

        return data;
    } catch (err) {
        console.error('Save Event Error:', err);
        return null;
    }
}

async function deleteEventFromDB(eventId, userId) {
    if (!supabaseClient) {
        const key = `events_${userId}`;
        let events = JSON.parse(localStorage.getItem(key) || '[]');
        events = events.filter(e => e.id !== eventId);
        localStorage.setItem(key, JSON.stringify(events));
        return true;
    }

    try {
        const { error } = await supabaseClient
            .from('events')
            .delete()
            .eq('id', Number(eventId));

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Delete Event Error:', err);
        return false;
    }
}

// =============================================
// MOOD LOGS CRUD OPERATIONS
// =============================================

async function getMoodLogsFromDB(userId, limit = 30) {
    if (!supabaseClient) {
        const key = `moodHistory_${userId}`;
        return JSON.parse(localStorage.getItem(key) || '[]').slice(0, limit);
    }

    try {
        const { data, error } = await supabaseClient
            .from('mood_logs')
            .select('*')
            .eq('user_id', Number(userId))
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Mood Logs DB Error:', err);
        return JSON.parse(localStorage.getItem(`moodHistory_${userId}`) || '[]');
    }
}

async function saveMoodLogToDB(userId, mood) {
    if (!supabaseClient) {
        const key = `moodHistory_${userId}`;
        const history = JSON.parse(localStorage.getItem(key) || '[]');
        const moodEmojis = { great: '😊', good: '🙂', okay: '😐', stressed: '😓' };
        history.unshift({
            mood,
            emoji: moodEmojis[mood],
            date: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(history.slice(0, 30)));
        return true;
    }

    try {
        const { error } = await supabaseClient
            .from('mood_logs')
            .insert([{
                user_id: Number(userId),
                mood: mood,
                date: new Date().toISOString().split('T')[0]
            }]);

        if (error) throw error;

        // Backup to Google Sheets
        callN8NWebhook('mood', { userId, mood, date: new Date().toISOString() });

        return true;
    } catch (err) {
        console.error('Save Mood Error:', err);
        return false;
    }
}

// =============================================
// ANNOUNCEMENTS CRUD OPERATIONS
// =============================================

async function getAnnouncementsFromDB() {
    if (!supabaseClient) {
        return JSON.parse(localStorage.getItem('announcements') || '[]');
    }

    try {
        const { data, error } = await supabaseClient
            .from('announcements')
            .select('*')
            .order('pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Announcements DB Error:', err);
        return JSON.parse(localStorage.getItem('announcements') || '[]');
    }
}

async function saveAnnouncementToDB(announcement) {
    if (!supabaseClient) {
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        announcement.id = Date.now();
        announcement.created_at = new Date().toISOString();
        announcements.unshift(announcement);
        localStorage.setItem('announcements', JSON.stringify(announcements));
        return announcement;
    }

    try {
        const { data, error } = await supabaseClient
            .from('announcements')
            .insert([{
                title: announcement.title,
                content: announcement.content,
                pinned: announcement.pinned || false,
                created_by: announcement.created_by ? Number(announcement.created_by) : null
            }])
            .select()
            .single();

        if (error) throw error;

        // Backup to Google Sheets
        callN8NWebhook('announcement', { ...announcement, db_id: data.id });

        return data;
    } catch (err) {
        console.error('Save Announcement Error:', err);
        return null;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
});

console.log('📦 Supabase database helper loaded');
