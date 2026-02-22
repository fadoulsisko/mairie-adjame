// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import Services from './pages/Services';
import Evenements from './pages/Evenements';
import Galerie from './pages/Galerie';
import Audiences from './pages/Audiences';
import Config from './pages/Config';
import Users from './pages/Users';
import Analytics from './pages/Analytics';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function PrivateLayout({ children, user, onLogout }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-8">Mairie Admin</h1>
        
        <nav className="space-y-2 mb-12">
          <NavLink to="/admin" exact icon="📊">Dashboard</NavLink>
          <NavLink to="/admin/audiences" icon="📋">Audiences</NavLink>
          <NavLink to="/admin/articles" icon="📝">Articles</NavLink>
          <NavLink to="/admin/services" icon="🛠️">Services</NavLink>
          <NavLink to="/admin/evenements" icon="📅">Événements</NavLink>
          <NavLink to="/admin/galerie" icon="🖼️">Galerie</NavLink>
          <NavLink to="/admin/analytics" icon="📈">Analytics</NavLink>
          <NavLink to="/admin/config" icon="⚙️">Configuration</NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin/users" icon="👥">Utilisateurs</NavLink>
          )}
        </nav>

        <div className="border-t border-gray-700 pt-4">
          <div className="text-sm text-gray-400 mb-4">
            <p className="font-medium text-white">{user?.nom} {user?.prenom}</p>
            <p className="text-xs">{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition text-sm font-medium"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow p-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900">Backoffice d'Administration</h2>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ to, exact, icon, children }) {
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isActive = exact ? location === to : location.startsWith(to);

  return (
    <Link
      to={to}
      className={`block px-4 py-2 rounded transition ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-800'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {children}
    </Link>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          console.error('Auth error:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin"
          element={
            <PrivateLayout user={user} onLogout={handleLogout}>
              <Dashboard user={user} token={token} />
            </PrivateLayout>
          }
        />
        <Route
          path="/admin/audiences"
          element={
            <PrivateLayout user={user} onLogout={handleLogout}>
              <Audiences token={token} user={user} />
            </PrivateLayout>
          }
        />
        <Route
          path="/admin/articles"
          element={
            <PrivateLayout user={user} onLogout={handleLogout}>
              <Articles token={token} user={user} />
            </PrivateLayout>
          }
        />
        <Route
          path="/admin/services"
          element={
            <PrivateLayout user={user} onLogout={handleLogout}>
              <Services token={token} user={user} />
            </PrivateLayout>
          }
        />
        <Route
          path="/admin/evenements"
          element={
            <PrivateLayout user={user} onLogout={handleLogout}>
              <Evenements token={token} user={user} />
            </PrivateLayout>
          }
        />
        <Route
          path="/admin/galerie"
          element={
            <PrivateLayout user={user} onLogout={handleLogout}>
              <Galerie token={token} user={user} />
            </PrivateLayout>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <PrivateLayout user={user} onLogout={handleLogout}>
              <Analytics token={token} user={user} />
            </PrivateLayout>
          }
        />
        <Route
          path="/admin/config"
          element={
            <PrivateLayout user={user} onLogout={handleLogout}>
              <Config token={token} user={user} />
            </PrivateLayout>
          }
        />
        {user?.role === 'ADMIN' && (
          <Route
            path="/admin/users"
            element={
              <PrivateLayout user={user} onLogout={handleLogout}>
                <Users token={token} user={user} />
              </PrivateLayout>
            }
          />
        )}
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
