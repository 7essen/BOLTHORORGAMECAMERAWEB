import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VerificationBox from './components/VerificationBox';
import HomePage from './components/HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VerificationBox />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;