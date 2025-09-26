import { useState } from 'react';
import { X } from 'lucide-react'; // For the close icon
import { BACKEND_URL } from '../config';
import axios from 'axios';

export function SignupPage({ setView }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async(e) => {
    e.preventDefault();

    const signResponse =await axios.post(`${BACKEND_URL}/api/v1/signup`,{
      username,
      email,
      password
    })
    if(signResponse.status === 200){
      setView('login') ;
    }
    
  };

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
      
      {/* The Signup Form Card */}
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={() => setView('home')} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
          <p className="text-gray-500 mt-2">Start your journey with us today.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email Input */}
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

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
            >
              Create Account
            </button>
          </div>
        </form>

        {/* Switch to Sign In */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{' '}
          <span
            onClick={() => setView('login')}
            className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
          >
            Log In
          </span>
        </p>
      </div>
    </div>
  );
}