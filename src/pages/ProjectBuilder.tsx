import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { ArrowLeft, Play, Settings, Bot, CheckSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useProject } from '../contexts/ProjectContext';
import FileExplorer from '../components/FileExplorer';
import CodeEditor from '../components/CodeEditor';
import AIAssistant from '../components/AIAssistant';
import TaskPanel from '../components/TaskPanel';
// import PreviewPanel from '../components/PreviewPanel';

const ProjectBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, currentProject, setCurrentProject } = useProject();

  useEffect(() => {
    if (id) {
      const project = projects.find((p: any) => p.id === id);
      if (project) {
        setCurrentProject(project);
      } else {
        navigate('/');
      }
    }
  }, [id, projects, setCurrentProject, navigate]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-semibold">{currentProject.name}</h1>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              {currentProject.template}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Run
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - File Explorer & Tasks */}
          <Panel defaultSize={20} minSize={15} maxSize={40}>
            <div className="h-full flex flex-col">
              <div className="flex-1 border-r">
                <div className="h-full overflow-auto">
                  <FileExplorer />
                </div>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle />

          {/* Center - Code Editor */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <CodeEditor />
            </div>
          </Panel>

          <PanelResizeHandle />

          {/* Right Sidebar - AI Assistant & Preview */}
          <Panel defaultSize={30} minSize={20} maxSize={50}>
            <PanelGroup direction="vertical">
              {/* AI Assistant */}
              <Panel defaultSize={60} minSize={30}>
                <div className="h-full border-l">
                  <div className="border-b p-3 bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">AI Assistant</h3>
                    </div>
                  </div>
                  <AIAssistant />
                </div>
              </Panel>

              <PanelResizeHandle />

              {/* Task Panel */}
              <Panel defaultSize={40} minSize={20}>
                <div className="h-full border-l border-t">
                  <div className="border-b p-3 bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <CheckSquare className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">Tasks & Workflow</h3>
                    </div>
                  </div>
                  <TaskPanel />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default ProjectBuilder;