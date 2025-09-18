import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { FileText, Save, Download } from 'lucide-react';
import { Button } from './ui/button';
import { useProject } from '../contexts/ProjectContext';
import type { FileNode } from '../contexts/ProjectContext';

const CodeEditor = () => {
  const { currentProject, updateFile } = useProject();
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Find active file
  useEffect(() => {
    if (!currentProject?.activeFileId) {
      setActiveFile(null);
      setEditorContent('');
      return;
    }

    const findFile = (files: FileNode[]): FileNode | null => {
      for (const file of files) {
        if (file.id === currentProject.activeFileId) {
          return file;
        }
        if (file.children) {
          const found = findFile(file.children);
          if (found) return found;
        }
      }
      return null;
    };

    const file = findFile(currentProject.files);
    setActiveFile(file);
    setEditorContent(file?.content || '');
    setHasUnsavedChanges(false);
  }, [currentProject?.activeFileId, currentProject?.files]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      setHasUnsavedChanges(value !== activeFile?.content);
    }
  };

  const handleSave = () => {
    if (activeFile && currentProject && hasUnsavedChanges) {
      updateFile(currentProject.id, activeFile.id, editorContent);
      setHasUnsavedChanges(false);
    }
  };

  const getLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'json':
        return 'json';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'md':
        return 'markdown';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'cpp':
      case 'c':
        return 'cpp';
      case 'rs':
        return 'rust';
      case 'go':
        return 'go';
      case 'yml':
      case 'yaml':
        return 'yaml';
      case 'xml':
        return 'xml';
      case 'sql':
        return 'sql';
      default:
        return 'plaintext';
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/10">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No file selected</h3>
          <p className="text-muted-foreground">
            Select a file from the explorer to start editing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="border-b bg-muted/50 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">{activeFile.name}</span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 bg-orange-500 rounded-full" title="Unsaved changes" />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="h-7"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button variant="ghost" size="sm" className="h-7">
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          value={editorContent}
          language={getLanguage(activeFile.name)}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Monaco, Cascadia Code, monospace',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            parameterHints: { enabled: true },
            hover: { enabled: true },
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'mouseover',
            unfoldOnClickAfterEndOfLine: false,
            contextmenu: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            cursorBlinking: 'blink',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'line',
            selectOnLineNumbers: true,
            glyphMargin: true,
            find: {
              addExtraSpaceOnTop: false,
              autoFindInSelection: 'never',
              seedSearchStringFromSelection: 'always',
            },
          }}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading editor...</p>
              </div>
            </div>
          }
        />
      </div>

      {/* Status Bar */}
      <div className="border-t bg-muted/50 px-4 py-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>{getLanguage(activeFile.name)}</span>
            <span>UTF-8</span>
            <span>LF</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Lines: {editorContent.split('\\n').length}</span>
            <span>Characters: {editorContent.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;