import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const demoAccounts = [
        { email: 'ravi@grofast.com', role: 'Employee' },
        { email: 'priya@grofast.com', role: 'Team Lead' },
        { email: 'arun@grofast.com', role: 'Senior' },
        { email: 'vikram@grofast.com', role: 'MD' },
        { email: 'admin@grofast.com', role: 'Admin' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
            background: 'var(--bg-primary)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px'
            }}>
                {/* Logo */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: 'var(--space-10)'
                }}>
                    <img
                        src="/logo.png"
                        alt="Grofast Digital"
                        style={{
                            width: 88,
                            height: 88,
                            marginBottom: 'var(--space-4)',
                            filter: 'drop-shadow(0 0 20px rgba(185, 28, 28, 0.4))'
                        }}
                    />
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 900,
                        background: 'var(--primary-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: 'var(--space-1)'
                    }}>
                        GROFAST
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--text-sm)'
                    }}>
                        Team Operations Platform
                    </p>
                </div>

                {/* Login Card */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h2 style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 700,
                        marginBottom: 'var(--space-6)',
                        textAlign: 'center'
                    }}>
                        Welcome Back
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                padding: 'var(--space-3) var(--space-4)',
                                background: 'var(--error-bg)',
                                color: 'var(--error)',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--space-5)',
                                fontSize: 'var(--text-sm)'
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={20} style={{
                                    position: 'absolute',
                                    left: 'var(--space-4)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="you@grofast.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ paddingLeft: 'calc(var(--space-4) + 28px)' }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={20} style={{
                                    position: 'absolute',
                                    left: 'var(--space-4)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        paddingLeft: 'calc(var(--space-4) + 28px)',
                                        paddingRight: 'calc(var(--space-4) + 28px)'
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: 'var(--space-4)',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: 0,
                                        display: 'flex'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            disabled={isLoading}
                            style={{ marginTop: 'var(--space-6)' }}
                        >
                            {isLoading ? (
                                <span className="loading-spinner" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Demo Accounts */}
                <div style={{
                    marginTop: 'var(--space-6)',
                    padding: 'var(--space-5)',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-muted)',
                        marginBottom: 'var(--space-3)',
                        textAlign: 'center'
                    }}>
                        Demo Accounts (Use any password)
                    </p>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)'
                    }}>
                        {demoAccounts.map((acc) => (
                            <button
                                key={acc.email}
                                type="button"
                                onClick={() => {
                                    setEmail(acc.email);
                                    setPassword('demo123');
                                }}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--space-3)',
                                    background: 'var(--bg-elevated)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    transition: 'all 150ms ease'
                                }}
                            >
                                <span style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                                    {acc.email}
                                </span>
                                <span className="badge badge-neutral">{acc.role}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
