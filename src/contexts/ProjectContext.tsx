import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  language?: string;
  children?: FileNode[];
  parentId?: string;
  isOpen?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  template: 'react' | 'nextjs' | 'nodejs' | 'vanilla';
  files: FileNode[];
  activeFileId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskItem {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  projectId: string;
  createdAt: Date;
}

export interface WorkflowStep {
  id: string;
  type: 'planning' | 'coding' | 'testing' | 'review';
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string;
  projectId: string;
}

// Store interface
interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  tasks: TaskItem[];
  workflows: WorkflowStep[];
  
  // Project actions
  createProject: (name: string, template: Project['template'], description?: string) => Project;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  
  // File actions
  addFile: (projectId: string, parentId: string | null, name: string, type: 'file' | 'directory') => FileNode;
  updateFile: (projectId: string, fileId: string, content: string) => void;
  deleteFile: (projectId: string, fileId: string) => void;
  setActiveFile: (projectId: string, fileId: string) => void;
  toggleDirectory: (projectId: string, fileId: string) => void;
  
  // Task actions
  addTask: (projectId: string, content: string) => TaskItem;
  updateTaskStatus: (taskId: string, status: TaskItem['status']) => void;
  deleteTask: (taskId: string) => void;
  
  // Workflow actions
  addWorkflowStep: (projectId: string, step: Omit<WorkflowStep, 'id'>) => WorkflowStep;
  updateWorkflowStep: (stepId: string, updates: Partial<WorkflowStep>) => void;
}

// Create the store
const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  currentProject: null,
  tasks: [],
  workflows: [],
  
  createProject: (name: string, template: Project['template'], description = '') => {
    const project: Project = {
      id: uuidv4(),
      name,
      description,
      template,
      files: createDefaultFiles(template),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      projects: [...state.projects, project],
      currentProject: project,
    }));
    
    return project;
  },
  
  deleteProject: (id: string) => {
    set((state) => ({
      projects: state.projects.filter(p => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
      tasks: state.tasks.filter(t => t.projectId !== id),
      workflows: state.workflows.filter(w => w.projectId !== id),
    }));
  },
  
  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },
  
  updateProject: (id: string, updates: Partial<Project>) => {
    set((state) => ({
      projects: state.projects.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
      currentProject: state.currentProject?.id === id 
        ? { ...state.currentProject, ...updates, updatedAt: new Date() }
        : state.currentProject,
    }));
  },
  
  addFile: (projectId: string, parentId: string | null, name: string, type: 'file' | 'directory') => {
    const file: FileNode = {
      id: uuidv4(),
      name,
      type,
      content: type === 'file' ? '' : undefined,
      children: type === 'directory' ? [] : undefined,
      parentId: parentId || undefined,
      isOpen: false,
    };
    
    set((state) => {
      const updateFiles = (files: FileNode[]): FileNode[] => {
        if (!parentId) {
          return [...files, file];
        }
        
        return files.map(f => {
          if (f.id === parentId && f.type === 'directory') {
            return {
              ...f,
              children: [...(f.children || []), file],
            };
          }
          if (f.children) {
            return {
              ...f,
              children: updateFiles(f.children),
            };
          }
          return f;
        });
      };
      
      const updatedProjects = state.projects.map(p =>
        p.id === projectId
          ? { ...p, files: updateFiles(p.files), updatedAt: new Date() }
          : p
      );
      
      return {
        projects: updatedProjects,
        currentProject: state.currentProject?.id === projectId
          ? updatedProjects.find(p => p.id === projectId) || state.currentProject
          : state.currentProject,
      };
    });
    
    return file;
  },
  
  updateFile: (projectId: string, fileId: string, content: string) => {
    set((state) => {
      const updateFileContent = (files: FileNode[]): FileNode[] => {
        return files.map(f => {
          if (f.id === fileId) {
            return { ...f, content };
          }
          if (f.children) {
            return { ...f, children: updateFileContent(f.children) };
          }
          return f;
        });
      };
      
      const updatedProjects = state.projects.map(p =>
        p.id === projectId
          ? { ...p, files: updateFileContent(p.files), updatedAt: new Date() }
          : p
      );
      
      return {
        projects: updatedProjects,
        currentProject: state.currentProject?.id === projectId
          ? updatedProjects.find(p => p.id === projectId) || state.currentProject
          : state.currentProject,
      };
    });
  },
  
  deleteFile: (projectId: string, fileId: string) => {
    set((state) => {
      const removeFile = (files: FileNode[]): FileNode[] => {
        return files.filter(f => f.id !== fileId).map(f => ({
          ...f,
          children: f.children ? removeFile(f.children) : undefined,
        }));
      };
      
      const updatedProjects = state.projects.map(p =>
        p.id === projectId
          ? { ...p, files: removeFile(p.files), updatedAt: new Date() }
          : p
      );
      
      return {
        projects: updatedProjects,
        currentProject: state.currentProject?.id === projectId
          ? updatedProjects.find(p => p.id === projectId) || state.currentProject
          : state.currentProject,
      };
    });
  },
  
  setActiveFile: (projectId: string, fileId: string) => {
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === projectId ? { ...p, activeFileId: fileId } : p
      ),
      currentProject: state.currentProject?.id === projectId
        ? { ...state.currentProject, activeFileId: fileId }
        : state.currentProject,
    }));
  },
  
  toggleDirectory: (projectId: string, fileId: string) => {
    set((state) => {
      const toggleDir = (files: FileNode[]): FileNode[] => {
        return files.map(f => {
          if (f.id === fileId && f.type === 'directory') {
            return { ...f, isOpen: !f.isOpen };
          }
          if (f.children) {
            return { ...f, children: toggleDir(f.children) };
          }
          return f;
        });
      };
      
      const updatedProjects = state.projects.map(p =>
        p.id === projectId ? { ...p, files: toggleDir(p.files) } : p
      );
      
      return {
        projects: updatedProjects,
        currentProject: state.currentProject?.id === projectId
          ? updatedProjects.find(p => p.id === projectId) || state.currentProject
          : state.currentProject,
      };
    });
  },
  
  addTask: (projectId: string, content: string) => {
    const task: TaskItem = {
      id: uuidv4(),
      content,
      status: 'pending',
      projectId,
      createdAt: new Date(),
    };
    
    set((state) => ({
      tasks: [...state.tasks, task],
    }));
    
    return task;
  },
  
  updateTaskStatus: (taskId: string, status: TaskItem['status']) => {
    set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, status } : t
      ),
    }));
  },
  
  deleteTask: (taskId: string) => {
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== taskId),
    }));
  },
  
  addWorkflowStep: (projectId: string, step: Omit<WorkflowStep, 'id'>) => {
    const workflowStep: WorkflowStep = {
      ...step,
      id: uuidv4(),
      projectId,
    };
    
    set((state) => ({
      workflows: [...state.workflows, workflowStep],
    }));
    
    return workflowStep;
  },
  
  updateWorkflowStep: (stepId: string, updates: Partial<WorkflowStep>) => {
    set((state) => ({
      workflows: state.workflows.map(w =>
        w.id === stepId ? { ...w, ...updates } : w
      ),
    }));
  },
}));

// Helper function to create default files based on template
function createDefaultFiles(template: Project['template']): FileNode[] {
  const baseFiles: FileNode[] = [
    {
      id: uuidv4(),
      name: 'src',
      type: 'directory',
      children: [],
      isOpen: true,
    },
    {
      id: uuidv4(),
      name: 'package.json',
      type: 'file',
      content: getPackageJsonContent(template),
      language: 'json',
    },
    {
      id: uuidv4(),
      name: 'README.md',
      type: 'file',
      content: '# New Project\\n\\nBuilt with AI App Builder',
      language: 'markdown',
    },
  ];
  
  // Add template-specific files
  const srcFolder = baseFiles.find(f => f.name === 'src');
  if (srcFolder && srcFolder.children) {
    switch (template) {
      case 'react':
        srcFolder.children.push(
          {
            id: uuidv4(),
            name: 'App.tsx',
            type: 'file',
            content: getReactAppContent(),
            language: 'typescript',
            parentId: srcFolder.id,
          },
          {
            id: uuidv4(),
            name: 'main.tsx',
            type: 'file',
            content: getReactMainContent(),
            language: 'typescript',
            parentId: srcFolder.id,
          }
        );
        break;
      case 'nextjs':
        srcFolder.children.push(
          {
            id: uuidv4(),
            name: 'app',
            type: 'directory',
            children: [
              {
                id: uuidv4(),
                name: 'page.tsx',
                type: 'file',
                content: getNextJSPageContent(),
                language: 'typescript',
              }
            ],
            isOpen: true,
            parentId: srcFolder.id,
          }
        );
        break;
      case 'nodejs':
        srcFolder.children.push(
          {
            id: uuidv4(),
            name: 'index.ts',
            type: 'file',
            content: getNodeJSContent(),
            language: 'typescript',
            parentId: srcFolder.id,
          }
        );
        break;
      case 'vanilla':
        srcFolder.children.push(
          {
            id: uuidv4(),
            name: 'index.html',
            type: 'file',
            content: getVanillaHTMLContent(),
            language: 'html',
            parentId: srcFolder.id,
          },
          {
            id: uuidv4(),
            name: 'script.js',
            type: 'file',
            content: getVanillaJSContent(),
            language: 'javascript',
            parentId: srcFolder.id,
          }
        );
        break;
    }
  }
  
  return baseFiles;
}

// Template content generators
function getPackageJsonContent(template: Project['template']): string {
  const base = {
    name: 'new-project',
    version: '1.0.0',
    description: 'Generated by AI App Builder',
  };
  
  switch (template) {
    case 'react':
      return JSON.stringify({
        ...base,
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          '@vitejs/plugin-react': '^4.0.0',
          typescript: '^5.0.0',
          vite: '^4.4.0',
        },
      }, null, 2);
    case 'nextjs':
      return JSON.stringify({
        ...base,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          next: '^14.0.0',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          typescript: '^5.0.0',
        },
      }, null, 2);
    case 'nodejs':
      return JSON.stringify({
        ...base,
        scripts: {
          dev: 'tsx src/index.ts',
          build: 'tsc',
          start: 'node dist/index.js',
        },
        dependencies: {
          express: '^4.18.0',
        },
        devDependencies: {
          '@types/express': '^4.17.0',
          '@types/node': '^20.0.0',
          tsx: '^4.0.0',
          typescript: '^5.0.0',
        },
      }, null, 2);
    default:
      return JSON.stringify(base, null, 2);
  }
}

function getReactAppContent(): string {
  return `import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>Hello from React!</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  )
}

export default App`;
}

function getReactMainContent(): string {
  return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
}

function getNextJSPageContent(): string {
  return `export default function Home() {
  return (
    <main>
      <h1>Hello from Next.js!</h1>
      <p>Welcome to your new application.</p>
    </main>
  )
}`;
}

function getNodeJSContent(): string {
  return `import express from 'express'

const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Node.js!' })
})

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`)
})`;
}

function getVanillaHTMLContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vanilla Project</title>
</head>
<body>
    <h1>Hello from Vanilla JS!</h1>
    <button id="click-me">Click me!</button>
    <script src="script.js"></script>
</body>
</html>`;
}

function getVanillaJSContent(): string {
  return `document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('click-me')
  let count = 0
  
  button.addEventListener('click', () => {
    count++
    button.textContent = \`Clicked \${count} times\`
  })
})`;
}

// Context - we'll export the hook directly since Zustand handles state management
export const useProject = useProjectStore;