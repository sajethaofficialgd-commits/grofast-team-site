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
        // Demo mode login
        if (APP_CONFIG.debug) {
            const user = DEMO_USERS.find(u =>
                (u.email === email || u.email.split('@')[0] === email) && u.password === password
            );
            if (user) {
                return this.createSession(user, rememberMe);
            }
            throw new Error('Invalid email or password');
        }

        // Supabase login
        if (this.supabase) {
            const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            const { data: profile } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            return this.createSession({ ...data.user, ...profile }, rememberMe);
        }

        throw new Error('Authentication not configured');
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
