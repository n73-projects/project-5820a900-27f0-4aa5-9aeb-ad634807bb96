// import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder, Calendar, Settings, Code, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useProject } from '../contexts/ProjectContext';
import type { Project } from '../contexts/ProjectContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { projects, createProject } = useProject();
  // const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateProject = (template: Project['template']) => {
    const project = createProject(`New ${template} Project`, template);
    navigate(`/project/${project.id}`);
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI App Builder
            </h1>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Build Apps with{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Power
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create, iterate, and deploy applications using intelligent workflows, 
            automated code generation, and live preview sandboxes.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <QuickActionCard
            icon={<Code className="h-6 w-6" />}
            title="React App"
            description="Modern React application with TypeScript"
            onClick={() => handleCreateProject('react')}
          />
          <QuickActionCard
            icon={<Zap className="h-6 w-6" />}
            title="Next.js"
            description="Full-stack React framework"
            onClick={() => handleCreateProject('nextjs')}
          />
          <QuickActionCard
            icon={<Settings className="h-6 w-6" />}
            title="Node.js API"
            description="Backend API with Express"
            onClick={() => handleCreateProject('nodejs')}
          />
          <QuickActionCard
            icon={<Folder className="h-6 w-6" />}
            title="Vanilla JS"
            description="Simple HTML, CSS, and JavaScript"
            onClick={() => handleCreateProject('vanilla')}
          />
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold">Recent Projects</h3>
            <Button
              onClick={() => handleCreateProject('react')}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">No projects yet</h4>
              <p className="text-muted-foreground mb-4">
                Create your first AI-powered application to get started
              </p>
              <Button onClick={() => handleCreateProject('react')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project: any) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => handleOpenProject(project.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            icon="🤖"
            title="AI-Powered Generation"
            description="Generate components, APIs, and entire features using natural language prompts"
          />
          <FeatureCard
            icon="⚡"
            title="Live Sandboxes"
            description="Test and preview your applications in real-time with isolated execution environments"
          />
          <FeatureCard
            icon="🔄"
            title="Smart Workflows"
            description="Automated task planning and execution with intelligent error handling and recovery"
          />
        </div>
      </main>
    </div>
  );
};

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const QuickActionCard = ({ icon, title, description, onClick }: QuickActionCardProps) => (
  <div
    onClick={onClick}
    className="p-6 border rounded-lg bg-card hover:bg-accent cursor-pointer transition-colors group"
  >
    <div className="flex items-center space-x-3 mb-3">
      <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <h4 className="font-semibold">{title}</h4>
    </div>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
}

const ProjectCard = ({ project, onOpen }: ProjectCardProps) => (
  <div
    onClick={onOpen}
    className="p-6 border rounded-lg bg-card hover:bg-accent cursor-pointer transition-colors group"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-2">
        <Folder className="h-5 w-5 text-primary" />
        <h4 className="font-semibold group-hover:text-primary transition-colors">
          {project.name}
        </h4>
      </div>
      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
        {project.template}
      </span>
    </div>
    
    {project.description && (
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {project.description}
      </p>
    )}
    
    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
      <div className="flex items-center space-x-1">
        <Calendar className="h-3 w-3" />
        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
      </div>
      <span>{project.files.length} files</span>
    </div>
  </div>
);

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="text-center p-6">
    <div className="text-4xl mb-4">{icon}</div>
    <h4 className="text-lg font-semibold mb-2">{title}</h4>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Dashboard;