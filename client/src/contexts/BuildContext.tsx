import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Step {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  children?: FileItem[];
  content?: string;
}

interface BuildContextType {
  prompt: string;
  setPrompt: (prompt: string) => void;
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  files: FileItem[];
  isBuilding: boolean;
  startBuild: () => void;
}

const defaultSteps: Step[] = [
  { id: 1, title: 'Analyzing Prompt', description: 'Understanding your requirements', status: 'pending' },
  { id: 2, title: 'Planning Architecture', description: 'Designing the system structure', status: 'pending' },
  { id: 3, title: 'Creating Components', description: 'Building UI components', status: 'pending' },
  { id: 4, title: 'Implementing Logic', description: 'Adding functionality', status: 'pending' },
  { id: 5, title: 'Styling Interface', description: 'Applying visual design', status: 'pending' },
  { id: 6, title: 'Testing & Optimization', description: 'Ensuring quality and performance', status: 'pending' },
];

const defaultFiles: FileItem[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        children: [
          { id: '3', name: 'Header.tsx', type: 'file', extension: 'tsx' },
          { id: '4', name: 'Footer.tsx', type: 'file', extension: 'tsx' },
        ],
      },
      {
        id: '5',
        name: 'pages',
        type: 'folder',
        children: [
          { id: '6', name: 'Home.tsx', type: 'file', extension: 'tsx' },
          { id: '7', name: 'About.tsx', type: 'file', extension: 'tsx' },
        ],
      },
      { id: '8', name: 'App.tsx', type: 'file', extension: 'tsx' },
      { id: '9', name: 'index.css', type: 'file', extension: 'css' },
    ],
  },
  {
    id: '10',
    name: 'public',
    type: 'folder',
    children: [
      { id: '11', name: 'index.html', type: 'file', extension: 'html' },
      { id: '12', name: 'favicon.ico', type: 'file', extension: 'ico' },
    ],
  },
  { id: '13', name: 'package.json', type: 'file', extension: 'json' },
];

const BuildContext = createContext<BuildContextType | undefined>(undefined);

export const BuildProvider = ({ children }: { children: ReactNode }) => {
  const [prompt, setPrompt] = useState('');
  const [steps, setSteps] = useState<Step[]>(defaultSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<FileItem[]>(defaultFiles);
  const [isBuilding, setIsBuilding] = useState(false);

  const startBuild = () => {
    setIsBuilding(true);
    
    // Simulate build process
    const stepInterval = setInterval(() => {
      setCurrentStep((prevStep) => {
        if (prevStep < defaultSteps.length) {
          // Update step status
          setSteps((prevSteps) => 
            prevSteps.map((step, idx) => ({
              ...step,
              status: idx < prevStep ? 'completed' : 
                     idx === prevStep ? 'in-progress' : 'pending'
            }))
          );
          return prevStep + 1;
        } else {
          clearInterval(stepInterval);
          return prevStep;
        }
      });
    }, 1500);
  };

  const value = {
    prompt,
    setPrompt,
    steps,
    currentStep,
    setCurrentStep,
    files,
    isBuilding,
    startBuild,
  };

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
};

export const useBuild = (): BuildContextType => {
  const context = useContext(BuildContext);
  if (context === undefined) {
    throw new Error('useBuild must be used within a BuildProvider');
  }
  return context;
};