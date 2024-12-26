import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import MathKeyboard from './components/MathKeyboard';
import ImageUpload from './components/ImageUpload';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<MathKeyboard />} />
            <Route path="/scan" element={<ImageUpload />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
