import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { LoginPage } from './LoginPage';
import { SignupPage } from './Signup';

export function Home() {
  const [prompt, setPrompt] = useState('');
  
  // --- IMPROVEMENT ---
  // Use a single state to control the view: 'home', 'login', or 'signup'
  const [view, setView] = useState('home'); 
  
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
    }
  };

  return (
    <BackgroundWrapper>
      <div>
        <nav className='flex justify-between pt-4 px-8 '>
          <div className='text-white font-script font-bold text-2xl '> Weblium</div>

          <div className='flex gap-7 px-4 text-white font-bold'>
            {/* These buttons now change the 'view' state */}
            <button className='px-4' onClick={() => setView('login')}> Login</button>
            <button className='px-4' onClick={() => setView('signup')}> Get Started</button>
          </div>
        </nav>

        <div className="min-h-screen flex items-center justify-center p-4">

          {/* --- COMPLETION & IMPROVEMENT --- */}
          {/* We now render content based on the 'view' state */}

          {/* 1. Show Login Page */}
          {view === 'login' && <LoginPage setView={setView} />}

          {/* 2. Show Signup Page */}
          {view === 'signup' && <SignupPage setView={setView} />}

          {/* 3. Show Homepage Content */}
          {view === 'home' && (
            <div className="max-w-2xl w-full">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Wand2 className="w-12 h-12 text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold text-gray-100 mb-4">
                  Website Builder AI
                </h1>
                <p className="text-lg text-gray-300">
                  Describe your dream website, and we'll help you build it step by step
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-transparent rounded-lg shadow-lg p-6">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the website you want to build..."
                    className="w-full h-32 p-4 bg-transparent text-gray-100 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    className="w-full mt-4 bg-[#EAE4D5] text-black py-3 px-6 rounded-lg font-medium hover:bg-[#0077b6]/50 hover:text-white transition-colors"
                  >
                    Generate Website Plan
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </BackgroundWrapper>
  );
}