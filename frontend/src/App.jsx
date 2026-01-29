import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Send auth token to Chrome extension if user is logged in
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          // Broadcast to content script which will forward to extension
          window.postMessage({ 
            type: 'RECALLBIN_AUTH_TOKEN', 
            token 
          }, '*');
          console.log('Auth token sent to extension');
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
