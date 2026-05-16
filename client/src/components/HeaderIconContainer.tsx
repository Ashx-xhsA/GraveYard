import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useModal } from '../context/ModalContext';
import Settings from './Settings';
import NewGrave from './NewGrave';

const HeaderIconContainer = () => {
  const { isLoggedIn, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {openModal} = useModal();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      setShowLogin(false);
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="headerIconContainer"
      className="flex flex-row justify-between gap-2 relative"
    >
      <button id="SettingsButton" className="header-icon-button" onClick={()=>openModal(<Settings />)}>
        Settings
      </button>
      <button id="ApplyButton" className="header-icon-button" onClick={()=>openModal(<NewGrave/>)}>
        New Grave
      </button>
      {isLoggedIn ? (
        <button
          id="LoginButton"
          className="header-icon-button"
          onClick={logout}
        >
          Logout
        </button>
      ) : (
        <button
          id="LoginButton"
          className="header-icon-button"
          onClick={() => setShowLogin(!showLogin)}
        >
          Login
        </button>
      )}
      {showLogin && !isLoggedIn && (
        <form
          onSubmit={handleSubmit}
          className="absolute top-full right-0 mt-2 p-4 z-50 flex flex-col gap-2"
          style={{
            background: 'rgb(249, 228, 246)',
            border: '2px solid #333',
            minWidth: '200px',
          }}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-1 border border-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-1 border border-gray-400"
            required
          />
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <button
            type="submit"
            className="header-icon-button"
            disabled={loading}
          >
            {loading ? '...' : 'Login'}
          </button>
        </form>
      )}
    </div>
  );
};

export default HeaderIconContainer;
