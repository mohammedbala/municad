import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { SamplePlans } from './components/SamplePlans';
import { Footer } from './components/Footer';
import { Editor } from './components/create/Editor';
import { SignIn } from './components/SignIn';
import { AuthCallback } from './components/AuthCallback';
import { Pricing } from './components/Pricing';
import { UserHome } from './components/UserHome';

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <SamplePlans />
      <Pricing />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<UserHome />} />
        <Route path="/create" element={<Editor />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </Router>
  );
}

export default App;