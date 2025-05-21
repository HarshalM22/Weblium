import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Github } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white">
          <Code size={24} className="text-purple-500" />
          <span className="font-bold text-xl">WebCraft</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="#" label="Features" />
          <NavLink href="#" label="Examples" />
          <NavLink href="#" label="Documentation" />
          <NavLink href="#" label="Pricing" />
        </nav>
        
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Github size={20} />
          </a>
          
          <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  href: string;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label }) => (
  <a 
    href={href} 
    className="text-slate-300 hover:text-white transition-colors duration-200"
  >
    {label}
  </a>
);

export default Header;