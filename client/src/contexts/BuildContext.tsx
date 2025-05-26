import axios from 'axios';
import { createContext, useState, useContext, ReactNode } from 'react';
import { BACKEND_URL } from '../config';
import { parseBoltArtifactXml, parseXml } from '../steps/step';

export type StepType = 'analysis' | 'planning' | 'creation' | 'implementation' | 'styling' | 'testing';

export interface Step {
  id: number;
  title: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  type?: StepType; // Add this line to allow 'type' property

}


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
  setSteps: (steps: Step[]) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  files: FileItem[];
  setfiles: (files: FileItem[]) => void;
  isBuilding: boolean;
  startBuild: () => void;
}

const defaultSteps: Step[] = [
  
];

const defaultFiles: FileItem[] = [

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


      setFiles(parseBoltArtifactXml(newFiles));
      console.log(files);



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