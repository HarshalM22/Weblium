import React, { useEffect, useState } from 'react';
import { useBuild } from '../contexts/BuildContext';
import Header from '../components/layout/Header';
import { ChevronRight, Code, Eye, File, Folder, FolderOpen, Monitor, Settings, Terminal } from 'lucide-react';
// import { useWebContainer } from '../hooks/useWebContainer';

const Builder: React.FC = () => {
  const { prompt, steps, currentStep, files, isBuilding, startBuild, previewURL } = useBuild();
  const [selectedTab, setSelectedTab] = useState<'preview' | 'code'>('code');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '1': true, // src folder
    '2': true, // components folder
    '5': true, // pages folder
  });



  // Start the build process when the component mounts
  useEffect(() => {
    if (prompt) {
      startBuild();
    }
  }, [prompt]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFile(fileId);
    setSelectedTab('code');
  };

      console.log(`from builder: ${previewURL}`);




  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header />

      <main className="flex-grow flex flex-col">
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-white">Building Your Website</h1>
            <p className="text-slate-300 mt-2 max-w-3xl">
              {prompt || "Transforming your prompt into a fully-featured website..."}
            </p>
          </div>
        </div>

        <div className="flex-grow flex flex-col lg:flex-row">
          {/* Build Steps Panel - Left Side */}
          <div className="w-full lg:w-72 xl:w-80 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Terminal size={18} className="mr-2 text-purple-500" />
              Build Progress
            </h2>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg transition-all duration-300 ${step.status === 'completed'
                    ? 'bg-green-900/20 border border-green-800/50'
                    : step.status === 'in-progress'
                      ? 'bg-blue-900/20 border border-blue-800/50 animate-pulse'
                      : 'bg-slate-800/50 border border-slate-700/50'
                    }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${step.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : step.status === 'in-progress'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300'
                      }`}>
                      {step.status === 'completed'
                        ? '✓'
                        : step.status === 'in-progress'
                          ? index + 1
                          : index + 1
                      }
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-white">{step.title}</h3>
                      <p className="text-sm text-slate-400">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              {currentStep >= steps.length && (
                <div className="p-3 rounded-lg bg-green-900/20 border border-green-800/50">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-3">
                      ✓
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Build Complete</h3>
                      <p className="text-sm text-slate-400">Your website is ready!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area - Middle */}
          <div className="flex-grow border-r border-slate-800 flex flex-col">
            {/* Tab Navigation */}
            <div className="bg-slate-800/50 border-b border-slate-700 flex items-center px-2">
              <button
                className={`px-4 py-3 border-b-2 font-medium ${selectedTab === 'code'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
                  } transition-colors`}
                onClick={() => setSelectedTab('code')}
              >
                <div className="flex items-center">
                  <Code size={16} className="mr-2" />
                  <span>Code</span>
                </div>
              </button>
              <button
                className={`px-4 py-3 border-b-2 font-medium ${selectedTab === 'preview'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
                  } transition-colors`}
                onClick={() => setSelectedTab('preview')}
              >
                <div className="flex items-center">
                  <Eye size={16} className="mr-2" />
                  <span>Preview</span>
                </div>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-auto p-4">
              {selectedTab === "preview" ? (
                previewURL ? (
                  // ✅ Live Preview
                  <iframe
                    src={previewURL}
                    title="Live Preview"
                    className="w-full h-full rounded-lg border border-slate-700"
                  />
                ) : (
                  // ✅ Placeholder (no URL yet)
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-8 bg-slate-800 rounded-lg border border-slate-700 max-w-md">
                      <Monitor size={48} className="mx-auto text-slate-400 mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Website Preview
                      </h3>
                      <p className="text-slate-300 mb-4">
                        Preview will be available once the build process is complete.
                      </p>
                      {currentStep >= steps.length && previewURL && (
                        <button
                          onClick={() => window.open(previewURL, "_blank")}
                          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-md shadow-lg hover:shadow-purple-500/20 transition-all"
                        >
                          View Live Preview
                        </button>
                      )}
                    </div>
                  </div>
                )
              ) : (
                // ✅ Code Preview Tab
                <div className="bg-slate-800 rounded-lg border border-slate-700 h-full overflow-hidden">
                  {selectedFile ? (
                    <CodePreview fileId={selectedFile} files={files} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <div className="text-center">
                        <Code size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Select a file to view its content</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* File Explorer - Right Side */}
          <div className="w-full lg:w-64 xl:w-72 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Folder size={18} className="mr-2 text-purple-500" />
              Files
            </h2>

            <div className="space-y-2">
              {renderFileTree(files, expandedFolders, toggleFolder, handleFileSelect, selectedFile)}
            </div>
          </div>
        </div>
      </main>


    </div>
  );
};

// Helper function to render the file tree recursively
const renderFileTree = (
  items: any[],
  expandedFolders: Record<string, boolean>,
  toggleFolder: (id: string) => void,
  handleFileSelect: (id: string) => void,
  selectedFile: string | null,
  level = 0
) => {
  return items.map(item => {
    const isFolder = item.type === 'folder';
    const isExpanded = expandedFolders[item.id];
    const isSelected = selectedFile === item.id;

    return (
      <div key={item.id} style={{ marginLeft: `${level * 12}px` }}>
        <div
          className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer ${isSelected ? 'bg-purple-500/20 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            } transition-colors`}
          onClick={() => isFolder ? toggleFolder(item.id) : handleFileSelect(item.id)}
        >
          {isFolder ? (
            isExpanded ? (
              <FolderOpen size={16} className="text-blue-400 mr-2 flex-shrink-0" />
            ) : (
              <Folder size={16} className="text-blue-400 mr-2 flex-shrink-0" />
            )
          ) : (
            <File size={16} className="text-slate-400 mr-2 flex-shrink-0" />
          )}

          <span className="truncate">{item.name}</span>

          {isFolder && (
            <ChevronRight
              size={16}
              className={`ml-auto transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          )}
        </div>

        {isFolder && isExpanded && item.children && (
          <div className="mt-1 mb-2">
            {renderFileTree(item.children, expandedFolders, toggleFolder, handleFileSelect, selectedFile, level + 1)}
          </div>
        )}
      </div>
    );
  });
};

interface CodePreviewProps {
  fileId: string;
  files: any[];
}

const CodePreview: React.FC<CodePreviewProps> = ({ fileId, files }) => {
  const findFile = (items: any[], id: string): any => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findFile(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const file = findFile(files, fileId);

  if (!file) {
    return <div className="p-4 text-slate-400">File not found</div>;
  }

  if (!file.content) {
    return <div className="p-4 text-slate-400">No content available for this file.</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <File size={16} className="text-slate-400 mr-2" />
          <span className="text-slate-300 font-medium">{file.name}</span>
        </div>
        <div className="flex items-center">
          <button className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-700 transition-colors">
            <Settings size={14} />
          </button>
        </div>
      </div>
      <div className="bg-slate-900 rounded-md p-4 font-mono text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap">
        <pre>{file.content}</pre>
      </div>
    </div>
  );
};


export default Builder;