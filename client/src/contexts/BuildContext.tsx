import axios from 'axios';
import  { createContext, useState, useContext, ReactNode } from 'react';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps/step';

export type StepType = 'analysis' | 'planning' | 'creation' | 'implementation' | 'styling' | 'testing';

export interface Step {
  id: number;
  title: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  type?: StepType; // Add this line to allow 'type' property

}
// export interface Step {
//   id: number;
//   title: string;
//   description?: string;
//   status: string;
//   code?: string;
//   path?: string;
//   type?: StepType; // Add this line to allow 'type' property
// }

export interface FileItem {
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
  setSteps:(steps:Step[])=> void ;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  files: FileItem[];
  setfiles:(files:FileItem[])=> void ;
  isBuilding: boolean;
  startBuild: () => void;
}

const defaultSteps: Step[] = [
  // { id: 1, title: 'Analyzing Prompt', description: 'Understanding your requirements', status: 'pending' },
  // { id: 2, title: 'Planning Architecture', description: 'Designing the system structure', status: 'pending' },
  // { id: 3, title: 'Creating Components', description: 'Building UI components', status: 'pending' },
  // { id: 4, title: 'Implementing Logic', description: 'Adding functionality', status: 'pending' },
  // { id: 5, title: 'Styling Interface', description: 'Applying visual design', status: 'pending' },
  // { id: 6, title: 'Testing & Optimization', description: 'Ensuring quality and performance', status: 'pending' },
];

const defaultFiles: FileItem[] = [
  // {
  //   id: '10',
  //   name: 'public',
  //   type: 'folder',
  //   children: [
  //     { id: '11', name: 'index.html', type: 'file', extension: 'html' },
  //     { id: '12', name: 'favicon.ico', type: 'file', extension: 'ico' },
  //   ],
  // }, {
  //   id: '1',
  //   name: 'src',
  //   type: 'folder',
  //   children: [
  //     {
  //       id: '2',
  //       name: 'components',
  //       type: 'folder',
  //       children: [
  //         { id: '3', name: 'Header.tsx', type: 'file', extension: 'tsx' },
  //         { id: '4', name: 'Footer.tsx', type: 'file', extension: 'tsx' },
  //       ],
  //     },
  //     {
  //       id: '5',
  //       name: 'pages',
  //       type: 'folder',
  //       children: [
  //         { id: '6', name: 'Home.tsx', type: 'file', extension: 'tsx' },
  //         { id: '7', name: 'About.tsx', type: 'file', extension: 'tsx' },
  //       ],
  //     },
  //     { id: '8', name: 'App.tsx', type: 'file', extension: 'tsx' },
  //     { id: '9', name: 'index.css', type: 'file', extension: 'css' },
  //   ],
  // },
  // { id: '13', name: 'package.json', type: 'file', extension: 'json' },
];

const BuildContext = createContext<BuildContextType | undefined>(undefined);

export const BuildProvider = ({ children }: { children: ReactNode }) => {
  const [prompt, setPrompt] = useState('');
  const [steps, setSteps] = useState<Step[]>(defaultSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<FileItem[]>(defaultFiles);
  const [isBuilding, setIsBuilding] = useState(false);

  const startBuild = async () => {
  // Prevent duplicate builds
  if (isBuilding) return;

  setIsBuilding(true);
  setCurrentStep(0);

  try {
    // Step 1: Template generation
    const templateResponse = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim(),
    });

    const { basePrompt, uiPrompt } = templateResponse.data;

    // Step 2: Parse UI steps from XML
    const parsedSteps: Step[] = parseXml(uiPrompt[0]);
    setSteps(parsedSteps);

    // Step 3: Request final build with combined prompt
    const chatResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...basePrompt, prompt].map((content) => ({
        role: 'user',
        content,
      })),
    });

    // Step 4: Set final generated files
    const newFiles = chatResponse.data.response;
    console.log(newFiles);
    console.log(files);
    
    setFiles(parseXml(newFiles));

    // Step 5: Simulate step-by-step progress using parsed steps
    let index = 0;
    const totalSteps = parsedSteps.length;

    const interval = setInterval(() => {
      setSteps((prevSteps) =>
        prevSteps.map((step, idx) => ({
          ...step,
          status:
            idx < index
              ? 'completed'
              : idx === index
              ? 'in-progress'
              : 'pending',
        }))
      );

      setCurrentStep(index);

      index++;
      if (index >= totalSteps) {
        clearInterval(interval);
        setIsBuilding(false);
      }
    }, 1500);
  } catch (err) {
    console.error('Build failed:', err);
    setIsBuilding(false);
  }
};

 const value = {
  prompt,
  setPrompt,
  steps,
  setSteps,
  currentStep,
  setCurrentStep,
  files,
  setFiles,
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