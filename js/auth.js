// Grofast Digital - Authentication Module

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.supabase = null;
        this.init();
    }

    init() {
        // Initialize Supabase if credentials are provided
        if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && typeof supabase !== 'undefined') {
            this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        // Check for existing session
        this.checkSession();
    }

    checkSession() {
        const session = localStorage.getItem('gf_session');
        if (session) {
            try {
                const data = JSON.parse(session);
                if (data.expiry > Date.now()) {
                    this.currentUser = data.user;
                    this.redirectToDashboard();
                } else {
                    this.logout();
                }
            } catch (e) {
                localStorage.removeItem('gf_session');
            }
        }
    }

    async login(email, password, rememberMe = false) {
        // Supabase login (Real Accounts)
        if (this.supabase && !APP_CONFIG.debug) {
            try {
                const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                // Fetch extra profile data from employees table using UUID
                const { data: profile, error: profileError } = await this.supabase
                    .from('employees')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) {
                    console.warn('Profile not found in employees table, using auth metadata');
                }

                return this.createSession({
                    id: data.user.id,
                    email: data.user.email,
                    name: profile?.name || data.user.user_metadata?.full_name || 'User',
                    role: profile?.role || 'employee',
                    ...profile
                }, rememberMe);
            } catch (authError) {
                console.error('Real Auth Failed:', authError.message);
                throw authError;
            }
        }

        // Demo fallback (only if debug is true)
        if (APP_CONFIG.debug) {
            const user = DEMO_USERS.find(u =>
                (u.email === email || u.email.split('@')[0] === email) && u.password === password
            );
            if (user) {
                return this.createSession(user, rememberMe);
            }
            throw new Error('Invalid demo credentials');
        }

        throw new Error('Please check your email and password');
    }

    createSession(user, rememberMe) {
        const duration = rememberMe ? APP_CONFIG.session.rememberMeDuration : APP_CONFIG.session.timeout;
        const sessionData = {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                field: user.field,
                position: user.position || '',
                department: user.department || '',
                phone: user.phone || ''
            },
            expiry: Date.now() + duration,
            createdAt: Date.now()
        };

        localStorage.setItem('gf_session', JSON.stringify(sessionData));
        this.currentUser = sessionData.user;
        this.redirectToDashboard();
        return sessionData.user;
    }

    logout() {
        localStorage.removeItem('gf_session');
        this.currentUser = null;
        if (this.supabase) {
            this.supabase.auth.signOut();
        }
        window.location.href = 'index.html';
    }

    redirectToDashboard() {
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            window.location.href = 'dashboard.html';
        }
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const session = localStorage.getItem('gf_session');
            if (session) {
                try {
                    const data = JSON.parse(session);
                    if (data.expiry > Date.now()) {
                        this.currentUser = data.user;
                    }
                } catch (e) { }
            }
        }
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.getCurrentUser();
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }

    isAdmin() {
        return this.hasRole(ROLES.ADMIN);
    }
}

// Initialize Auth Manager
const auth = new AuthManager();
