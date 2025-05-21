import React from 'react';
import { Code, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 px-6 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white mb-4">
              <Code size={24} className="text-purple-500" />
              <span className="font-bold text-xl">WebCraft</span>
            </Link>
            <p className="text-slate-400 mb-4">
              Transform your ideas into beautiful websites with just a prompt.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <FooterSection 
                title="Product" 
                links={[
                  { label: "Features", href: "#" },
                  { label: "Examples", href: "#" },
                  { label: "Pricing", href: "#" },
                  { label: "Templates", href: "#" },
                ]}
              />
              
              <FooterSection 
                title="Resources" 
                links={[
                  { label: "Documentation", href: "#" },
                  { label: "Tutorials", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Support", href: "#" },
                ]}
              />
              
              <FooterSection 
                title="Company" 
                links={[
                  { label: "About Us", href: "#" },
                  { label: "Careers", href: "#" },
                  { label: "Contact", href: "#" },
                  { label: "Legal", href: "#" },
                ]}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} WebCraft. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

interface FooterSectionProps {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => (
  <div>
    <h3 className="font-semibold text-white mb-4">{title}</h3>
    <ul className="space-y-2">
      {links.map((link, index) => (
        <li key={index}>
          <a 
            href={link.href} 
            className="text-slate-400 hover:text-white transition-colors"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;