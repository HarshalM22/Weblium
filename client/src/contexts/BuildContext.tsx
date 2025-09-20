import axios from 'axios';
import { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { BACKEND_URL } from '../config';
import { parseBoltArtifactXml, parseXml } from '../steps/step';
import { useWebContainer } from '../hooks/useWebContainer';

// --- Type definitions are the same ---
export type StepType = 'analysis' | 'planning' | 'creation' | 'implementation' | 'styling' | 'testing';

export interface Step {
  id: number;
  title: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  type?: StepType;
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
  previewURL: string | undefined;
  steps: Step[];
  currentStep: number;
  files: FileItem[];
  isBuilding: boolean;
  startBuild: () => void;
  buildError: string | null; // Added for better error feedback
}

const BuildContext = createContext<BuildContextType | undefined>(undefined);

export function BuildProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState('');
  const [previewURL, setPreviewURL] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null); // State for errors
  const webcontainer = useWebContainer();

  // Helper function to simulate step-by-step progress
  const simulateProgress = (totalSteps: number) => {
    let index = 0;
    const interval = setInterval(() => {
      setSteps((prevSteps) =>
        prevSteps.map((step, idx) => ({
          ...step,
          status: idx < index ? 'completed' : idx === index ? 'in-progress' : 'pending',
        }))
      );
      setCurrentStep(index);
      index++;
      if (index > totalSteps) { // Go one step past to mark the last one as complete
        clearInterval(interval);
      }
    }, 1000);
  };

  // Renamed from 'Url' and now accepts files as an argument
const launchPreviewEnvironment = useCallback(async (newFiles: FileItem[]) => {
  if (!webcontainer) return;

  // Convert file structure
  function toWebContainerTree(items: FileItem[]): any {
    const tree: any = {};
    for (const item of items) {
      if (item.type === 'file') {
        tree[item.name] = { file: { contents: item.content || '' } };
      } else if (item.type === 'folder' && item.children) {
        tree[item.name] = { directory: toWebContainerTree(item.children) };
      }
    }
    return tree;
  }

  // 1. Mount files
  const fileTree = toWebContainerTree(newFiles);
  await webcontainer.mount(fileTree);

  // 2. Install dependencies (logs to console)
  const installProcess = await webcontainer.spawn("npm", ["install"]);
  installProcess.output.pipeTo(
    new WritableStream({ write: (data) => console.log("[npm install]", data) })
  );
  const exitCode = await installProcess.exit;
  if (exitCode !== 0) throw new Error("npm install failed");

  // 3. Start dev server
  const devProcess = await webcontainer.spawn("npm", ["run", "dev"]);
  devProcess.output.pipeTo(
    new WritableStream({ write: (data) => console.log("[npm run dev]", data) })
  );

  // 4. Wait for ready event
  webcontainer.on("server-ready", (port, url) => {
    console.log(`✅ Dev server running at ${url}`);
    setPreviewURL(url); // <-- always trust this
  });
}, [webcontainer]);


  const startBuild = async () => {
    if (isBuilding) return;

    // Reset state for a new build
    setIsBuilding(true);
    setBuildError(null);
    setPreviewURL('');
    setFiles([]);
    setSteps([]);
    setCurrentStep(0);

    try {
      // Step 1: Template generation
      const templateResponse = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim(),
      });
      const { basePrompt, uiPrompt } = templateResponse.data;

      // Step 2: Parse UI steps
      const parsedSteps: Step[] = parseXml(uiPrompt[0]);
      setSteps(parsedSteps);

      // Step 3: Request final build artifacts
      const chatResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...basePrompt, prompt].map((content) => ({ role: 'user', content })),
      });
      
      const answer = chatResponse.data.response;

      // Step 4: Parse generated files (FIXED: using a local variable)
      const finalFiles = parseBoltArtifactXml(answer);
      setFiles(finalFiles);

      // Step 5: Simulate progress on the UI
      simulateProgress(parsedSteps.length);

      // Step 6: Launch the preview environment (consolidated logic)
      await launchPreviewEnvironment(finalFiles);
      
      
    } catch (err: any) {
      console.error('Build failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred.';
      setBuildError(errorMessage);
    } finally {
      setIsBuilding(false);
      // Ensure the final step is marked as completed even if the preview launch fails
      // This is a UI choice; you might want different behavior on failure
      setSteps((prevSteps) => prevSteps.map(step => ({ ...step, status: 'completed' })));
    }
  };

  const value = {
    prompt,
    setPrompt,
    previewURL,
    steps,
    currentStep,
    files,
    isBuilding,
    startBuild,
    buildError,
  };

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
}

// --- useBuild hook is the same ---
export const useBuild = (): BuildContextType => {
  const context = useContext(BuildContext);
  if (context === undefined) {
    throw new Error('useBuild must be used within a BuildProvider');
  }
  return context;
};