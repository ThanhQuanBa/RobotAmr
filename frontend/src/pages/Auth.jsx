import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { User, Lock, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let result;
    if (isLogin) {
      result = await login(username, password);
    } else {
      result = await register(username, password);
    }

    setIsLoading(false);

    if (result.success) {
      // Redirect based on role
      const user = useAuthStore.getState().user;
      if (user?.role === 'operator' || user?.role === 'administrator') {
        navigate('/dashboard');
      } else {
        const redirect = searchParams.get('redirect');
        navigate(redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : '/booking');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="page-container auth-page flex-center">
      <div className="glass-panel auth-card animate-slide-in">
        <div className="auth-header">
          <Shield className="auth-icon" size={40} />
          <h2>{isLogin ? 'Welcome Back' : 'Join SmartBus'}</h2>
          <p>{isLogin ? 'Sign in to access your dashboard' : 'Create a visitor account to book tours'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                className="input-glass w-full pl-10" 
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <Lock size={18} className="input-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-glass w-full pl-10 pr-10" 
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Register as Visitor' : 'Sign In'}
            </span>
          </p>
        </div>
        
        {isLogin && (
          <div className="demo-credentials">
            <p><strong>Demo Admin:</strong> admin / password</p>
            <p><strong>Demo Visitor:</strong> visitor1 / password</p>
          </div>
        )}
      </div>
    </div>
  );
}
