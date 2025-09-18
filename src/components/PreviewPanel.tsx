import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from './ui/button';
import { useProject } from '../contexts/ProjectContext';

const PreviewPanel = () => {
  const { currentProject } = useProject();
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  // const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    // In a real implementation, this would generate a preview URL
    // from the current project files using a sandbox service like E2B
    if (currentProject) {
      // setPreviewUrl('about:blank');
    }
  }, [currentProject]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const getViewportClass = () => {
    switch (viewMode) {
      case 'mobile':
        return 'w-80 h-[600px]';
      case 'tablet':
        return 'w-[600px] h-[800px]';
      default:
        return 'w-full h-full';
    }
  };

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/10">
        <div className="text-center">
          <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
          <p className="text-muted-foreground">
            Select a project to see the live preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-3 bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Preview</h3>
          <div className="flex items-center space-x-2">
            {/* Viewport Controls */}
            <div className="flex items-center space-x-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('desktop')}
                className="h-6 w-6 p-0"
              >
                <Monitor className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tablet')}
                className="h-6 w-6 p-0"
              >
                <Tablet className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('mobile')}
                className="h-6 w-6 p-0"
              >
                <Smartphone className="h-3 w-3" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-7"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            <Button variant="ghost" size="sm" className="h-7">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
        <div className="h-full flex items-center justify-center">
          <div className={`${getViewportClass()} bg-white dark:bg-gray-800 shadow-lg border rounded-lg overflow-hidden transition-all duration-300`}>
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading preview...</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Preview Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    Live preview will be available once the sandbox integration is complete.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>• Real-time code execution</div>
                    <div>• Multiple device previews</div>
                    <div>• Hot reload on changes</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t p-2 bg-muted/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Sandbox ready</span>
          </div>
          <span>{viewMode} view</span>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;