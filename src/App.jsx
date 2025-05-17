import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage'; // adjust the path if your file is elsewhere

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        {/* Future pages */}
        {/* <Route path="/notification" element={<NotificationPage />} />
        <Route path="/admin" element={<AdminPanel />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
