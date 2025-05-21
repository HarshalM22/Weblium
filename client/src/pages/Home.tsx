import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuild } from '../contexts/BuildContext';
import { ArrowRight, Code, LayoutGrid, Wand2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Home: React.FC = () => {
  const { setPrompt } = useBuild();
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    setIsSubmitting(true);
    setPrompt(inputValue);
    
    // Simulate processing time
    setTimeout(() => {
      navigate('/builder');
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-8">
        <div className="max-w-4xl w-full text-center mb-16 mt-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Create beautiful websites with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              just a prompt
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Transform your ideas into fully-featured websites in seconds. Describe what you want, and watch the magic happen.
          </p>

          <form onSubmit={handleSubmit} className="mb-12">
            <div className="relative max-w-3xl mx-auto">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe the website you want to build..."
                className="w-full px-6 py-4 rounded-lg text-gray-800 bg-white border-2 border-transparent focus:border-purple-500 focus:outline-none text-lg shadow-lg transition-all duration-300"
              />
              <button
                type="submit"
                disabled={isSubmitting || !inputValue.trim()}
                className={`absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-2.5 rounded-md shadow-md transition-all duration-300 ${
                  isSubmitting || !inputValue.trim() 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:translate-y-[-2px]'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={20} />
                )}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <FeatureCard 
              icon={<Wand2 className="text-purple-400" size={28} />}
              title="AI-Powered"
              description="Advanced AI understands your requirements and builds exactly what you need"
            />
            <FeatureCard 
              icon={<Code className="text-blue-400" size={28} />}
              title="Production Ready"
              description="Get clean, optimized code that's ready for deployment"
            />
            <FeatureCard 
              icon={<LayoutGrid className="text-teal-400" size={28} />}
              title="Fully Customizable"
              description="Edit and refine your website with an intuitive interface"
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/10">
    <div className="p-3 bg-slate-700/50 w-fit rounded-lg mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-300">{description}</p>
  </div>
);

export default Home;