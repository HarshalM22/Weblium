// import { Step, StepType } from './types';

import { FileItem, Step} from "../contexts/BuildContext";

/*
 * Parse input XML and convert it into steps.
 * Eg: Input - 
 * <boltArtifact id=\"project-import\" title=\"Project Files\">
 *  <boltAction type=\"file\" filePath=\"eslint.config.js\">
 *      import js from '@eslint/js';\nimport globals from 'globals';\n
 *  </boltAction>
 * <boltAction type="shell">
 *      node index.js
 * </boltAction>
 * </boltArtifact>
 * 
 * Output - 
 * [{
 *      title: "Project Files",
 *      status: "Pending"
 * }, {
 *      title: "Create eslint.config.js",
 *      type: StepType.CreateFile,
 *      code: "import js from '@eslint/js';\nimport globals from 'globals';\n"
 * }, {
 *      title: "Run command",
 *      code: "node index.js",
 *      type: StepType.RunScript
 * }]
 * 
 * The input can have strings in the middle they need to be ignored
 */
export function parseXml(response: string): Step[]  {
    // Extract the XML content between <boltArtifact> tags
    const xmlMatch = response.match(/<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/);
    
    if (!xmlMatch) {
      return [];
    }
  
    const xmlContent = xmlMatch[1];
    const steps: Step[] = [];
    let stepId = 1;
  
    // Extract artifact title
    const titleMatch = response.match(/title="([^"]*)"/);
    const artifactTitle = titleMatch ? titleMatch[1] : 'Project Files';
  
    // Add initial artifact step
    steps.push({
      id: stepId++,
      title: artifactTitle,
      description: '',
    //   type: StepType.creation,
      status: 'pending'
    });
  
    // Regular expression to find boltAction elements
    const actionRegex = /<boltAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/boltAction>/g;
    
    let match;
    while ((match = actionRegex.exec(xmlContent)) !== null) {
      const [, type, filePath, content] = match;
  
      if (type === 'file') {
        // File creation step
        steps.push({
          id: stepId++,
          title: `Create ${filePath || 'file'}`,
          description: '',
        //   type: StepType.CreateFile,
          status: 'pending',
        //   code: content.trim(),
        });
      } else if (type === 'shell') {
        // Shell command step
        steps.push({
          id: stepId++,
          title: 'Run command',
          description: '',
        //   type: StepType.RunScript,
          status: 'pending',
        //   code: content.trim()
        });
      }
    }
  
    return steps;
  }



// Utility: Ensure folder path exists in the tree and return the target folder
function ensurePath(tree: FileItem[], pathParts: string[]): FileItem[] {
  let currentLevel = tree;
  for (const part of pathParts) {
    let existing = currentLevel.find(item => item.name === part && item.type === 'folder');
    if (!existing) {
      existing = {
        id: Math.random().toString(36).substr(2, 9),
        name: part, 
        type: 'folder',
        children: []
      };
      currentLevel.push(existing);
    }
    currentLevel = existing.children!;
  }
  return currentLevel;
}

export function parseBoltArtifactXml(xml: string): FileItem[] {
  const fileRegex = /<boltAction type="file" filePath="([^"]+)">([\s\S]*?)<\/boltAction>/g;
  const files: FileItem[] = [];

  let match;
  while ((match = fileRegex.exec(xml)) !== null) {
    const fullPath = match[1].trim();
    const content = match[2].trim();

    const pathParts = fullPath.split('/');
    const fileName = pathParts.pop()!;
    const extension = fileName.split('.').pop();

    const folder = ensurePath(files, pathParts);
    folder.push({
      id: Math.random().toString(36).substr(2, 9),
      name: fileName,
      type: 'file',
      extension,
      content,
    });
  }

  return files;
}
