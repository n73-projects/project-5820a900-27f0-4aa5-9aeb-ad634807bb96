// import { useState } from 'react';
import { 
  File, 
  Folder, 
  FolderOpen, 
  Plus, 
  MoreHorizontal, 
  FileText,
  FileCode,
  Image,
  Settings,
  Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { useProject } from '../contexts/ProjectContext';
import type { FileNode } from '../contexts/ProjectContext';

const FileExplorer = () => {
  const { 
    currentProject, 
    addFile, 
    deleteFile, 
    setActiveFile, 
    toggleDirectory 
  } = useProject();
  // const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

  if (!currentProject) return null;

  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'file') {
      setActiveFile(currentProject.id, file.id);
    } else {
      toggleDirectory(currentProject.id, file.id);
    }
  };

  const handleAddFile = (parentId: string | null, type: 'file' | 'directory') => {
    const name = type === 'file' ? 'new-file.txt' : 'new-folder';
    addFile(currentProject.id, parentId, name, type);
  };

  const handleDeleteFile = (fileId: string) => {
    deleteFile(currentProject.id, fileId);
  };

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'directory') {
      return file.isOpen ? (
        <FolderOpen className="h-4 w-4 text-blue-500" />
      ) : (
        <Folder className="h-4 w-4 text-blue-500" />
      );
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'tsx':
      case 'ts':
      case 'jsx':
      case 'js':
        return <FileCode className="h-4 w-4 text-yellow-500" />;
      case 'json':
        return <Settings className="h-4 w-4 text-orange-500" />;
      case 'md':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="h-4 w-4 text-green-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderFileNode = (file: FileNode, depth = 0) => {
    const isActive = currentProject.activeFileId === file.id;
    
    return (
      <div key={file.id}>
        <div
          className={`
            flex items-center justify-between group hover:bg-accent/50 cursor-pointer
            ${isActive ? 'bg-accent' : ''}
          `}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => handleFileSelect(file)}
        >
          <div className="flex items-center space-x-2 py-1 flex-1 min-w-0">
            {getFileIcon(file)}
            <span className="text-sm truncate">{file.name}</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {file.type === 'directory' && (
                <>
                  <DropdownMenuItem onClick={() => handleAddFile(file.id, 'file')}>
                    <FileText className="h-4 w-4 mr-2" />
                    New File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddFile(file.id, 'directory')}>
                    <Folder className="h-4 w-4 mr-2" />
                    New Folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                onClick={() => handleDeleteFile(file.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {file.type === 'directory' && file.isOpen && file.children && (
          <div>
            {file.children.map((child: any) => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-3 bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Explorer</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAddFile(null, 'file')}>
                <FileText className="h-4 w-4 mr-2" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddFile(null, 'directory')}>
                <Folder className="h-4 w-4 mr-2" />
                New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          {currentProject.files.map(file => renderFileNode(file))}
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;