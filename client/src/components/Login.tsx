import { useState } from 'react'
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const Login = () => {
  const { login, register } = useAuth();
  const { closeModal } = useModal();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegisterMode) {
        await register(username, password);
        await login(username, password);
      } else {
        await login(username, password);
      }
      setUsername('');
      setPassword('');
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.error || (isRegisterMode ? 'Registration failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 min-w-[280px]"
      >
        <h2 className="text-2xl font-bold text-center mb-2">{isRegisterMode ? 'Register' : 'Login'}</h2>
        
        <div className="flex items-center gap-3">
          <label className="w-20 font-medium text-right" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 p-1.5 bg-transparent rounded outline-none transition-colors [&:-webkit-autofill]:shadow-[0_0_0px_1000px_rgb(249,228,246)_inset]"
            autoComplete="off"
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="w-20 font-medium text-right" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 p-1.5 bg-transparent rounded outline-none transition-colors [&:-webkit-autofill]:shadow-[0_0_0px_1000px_rgb(249,228,246)_inset]"
            autoComplete="new-password"
            required
          />
        </div>

        {!isRegisterMode && (
          <div className="text-right -mt-2">
            <button 
              type="button" 
              className="text-xs text-gray-500 hover:text-black underline transition-colors"
              onClick={() => alert('Please contact admin to reset password for now.')}
            >
              Forgot Password?
            </button>
          </div>
        )}

        {error && <p className="text-red-600 text-xs text-center -mt-2">{error}</p>}

        <button
          type="submit"
          className="header-icon-button w-full mt-2 py-2"
          disabled={loading}
        >
          {loading ? '...' : (isRegisterMode ? 'Register' : 'Login')}
        </button>

        <div className="text-center mt-2">
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-black underline transition-colors"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
            }}
          >
            {isRegisterMode ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login
