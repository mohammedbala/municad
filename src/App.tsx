import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SEOWrapper } from './components/SEOWrapper';
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
import { Documentation } from './components/Documentation';

function LandingPage() {
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

const routes = [
  {
    path: '/',
    element: <Editor />,
    title: 'Traffic Control Plan Editor | MuniCAD',
    description: 'Create professional traffic control plans with our MUTCD-compliant editor. Design, edit and export your plans easily.'
  },
  {
    path: '/landing',
    element: <LandingPage />,
    title: 'MuniCAD - Professional Traffic Control Plan Software',
    description: 'Design MUTCD-compliant traffic control plans and highway signs. Perfect for municipalities and contractors.'
  },
  {
    path: '/home',
    element: <UserHome />,
    title: 'My Projects | MuniCAD',
    description: 'Access and manage your traffic control plans and templates in one place.'
  },
  {
    path: '/create',
    element: <Editor />,
    title: 'Create New Traffic Control Plan | MuniCAD',
    description: 'Start designing your traffic control plan with our professional editor.'
  },
  {
    path: '/signin',
    element: <SignIn />,
    title: 'Sign In | MuniCAD',
    description: 'Sign in to your MuniCAD account to access your traffic control plans.'
  },
  {
    path: '/docs',
    element: <Documentation />,
    title: 'Documentation | MuniCAD',
    description: 'Comprehensive documentation for using MuniCAD traffic control plan software.'
  }
];

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {routes.map(({ path, element, title, description }) => (
            <Route
              key={path}
              path={path}
              element={
                <SEOWrapper
                  title={title}
                  description={description}
                  canonicalUrl={path}
                >
                  {element}
                </SEOWrapper>
              }
            />
          ))}
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;