import  { useState } from 'react';
import { X } from 'lucide-react'; // For the close icon
import axios from 'axios';
import { BACKEND_URL } from '../config';

export function LoginPage({ setView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async(e) => {
    e.preventDefault();
    const loginResponse = await axios.post(`${BACKEND_URL}/api/v1/login`,{
      email,
      password
    })

    if(loginResponse.status ===200){
      const token = loginResponse.data.token ;
      localStorage.setItem('token', token) ;
      setView('home');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
      
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-2xl relative">
        
        <button 
          onClick={() => setView('home')} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
            >
              Sign In
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Don't have an account?{' '}
          <span
            onClick={() => setView('signup')}
            className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}