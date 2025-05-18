import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage'; // adjust the path if your file is elsewhere
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './components/AdminPanel';
import NotificationPage from './pages/NotificationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
         <Route path="/admin" element={<AdminPanel />} /> 
         <Route path="/notification" element={<NotificationPage />} />
        {/* Future pages */}
        {/* <Route path="/notification" element={<NotificationPage />} />
        <Route path="/admin" element={<AdminPanel />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
