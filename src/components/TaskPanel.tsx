import { useState } from 'react';
import { Plus, CheckSquare, Square, Clock, Play, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useProject } from '../contexts/ProjectContext';
import type { TaskItem } from '../contexts/ProjectContext';

const TaskPanel = () => {
  const { 
    currentProject, 
    tasks, 
    addTask, 
    updateTaskStatus, 
    deleteTask 
  } = useProject();
  const [newTaskInput, setNewTaskInput] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  if (!currentProject) return null;

  const projectTasks = tasks.filter((task: TaskItem) => task.projectId === currentProject.id);
  const pendingTasks = projectTasks.filter((task: TaskItem) => task.status === 'pending');
  const inProgressTasks = projectTasks.filter((task: TaskItem) => task.status === 'in_progress');
  const completedTasks = projectTasks.filter((task: TaskItem) => task.status === 'completed');

  const handleAddTask = () => {
    if (newTaskInput.trim()) {
      addTask(currentProject.id, newTaskInput.trim());
      setNewTaskInput('');
      setIsAddingTask(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskInput('');
    }
  };

  // const getStatusIcon = (status: TaskItem['status']) => {
  //   switch (status) {
  //     case 'pending':
  //       return <Square className="h-4 w-4 text-muted-foreground" />;
  //     case 'in_progress':
  //       return <Clock className="h-4 w-4 text-blue-500" />;
  //     case 'completed':
  //       return <CheckSquare className="h-4 w-4 text-green-500" />;
  //   }
  // };

  // const getStatusColor = (status: TaskItem['status']) => {
  //   switch (status) {
  //     case 'pending':
  //       return 'text-muted-foreground';
  //     case 'in_progress':
  //       return 'text-blue-600';
  //     case 'completed':
  //       return 'text-green-600';
  //   }
  // };

  const cycleTaskStatus = (taskId: string, currentStatus: TaskItem['status']) => {
    const statusCycle: TaskItem['status'][] = ['pending', 'in_progress', 'completed'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    updateTaskStatus(taskId, nextStatus);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Add Task */}
        <div>
          {isAddingTask ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter task description..."
                className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleAddTask} disabled={!newTaskInput.trim()}>
                  Add Task
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskInput('');
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingTask(true)}
              className="w-full justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>

        {/* Task Sections */}
        {inProgressTasks.length > 0 && (
          <TaskSection
            title="In Progress"
            tasks={inProgressTasks}
            icon={<Clock className="h-4 w-4 text-blue-500" />}
            onStatusChange={cycleTaskStatus}
            onDelete={deleteTask}
          />
        )}

        {pendingTasks.length > 0 && (
          <TaskSection
            title="To Do"
            tasks={pendingTasks}
            icon={<Square className="h-4 w-4 text-muted-foreground" />}
            onStatusChange={cycleTaskStatus}
            onDelete={deleteTask}
          />
        )}

        {completedTasks.length > 0 && (
          <TaskSection
            title="Completed"
            tasks={completedTasks}
            icon={<CheckSquare className="h-4 w-4 text-green-500" />}
            onStatusChange={cycleTaskStatus}
            onDelete={deleteTask}
            collapsed={true}
          />
        )}

        {projectTasks.length === 0 && !isAddingTask && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs">Add tasks to track your progress</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="border-t p-3 bg-muted/50">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-sm font-medium">{pendingTasks.length}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div>
            <div className="text-sm font-medium text-blue-600">{inProgressTasks.length}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div>
            <div className="text-sm font-medium text-green-600">{completedTasks.length}</div>
            <div className="text-xs text-muted-foreground">Done</div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TaskSectionProps {
  title: string;
  tasks: TaskItem[];
  icon: React.ReactNode;
  onStatusChange: (taskId: string, currentStatus: TaskItem['status']) => void;
  onDelete: (taskId: string) => void;
  collapsed?: boolean;
}

const TaskSection = ({ 
  title, 
  tasks, 
  icon, 
  onStatusChange, 
  onDelete, 
  collapsed = false 
}: TaskSectionProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  return (
    <div>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full p-2 text-sm font-medium hover:bg-accent rounded-md"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
            {tasks.length}
          </span>
        </div>
        <div className={`transform transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}>
          <Play className="h-3 w-3" />
        </div>
      </button>

      {!isCollapsed && (
        <div className="space-y-1 mt-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TaskItemProps {
  task: TaskItem;
  onStatusChange: (taskId: string, currentStatus: TaskItem['status']) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem = ({ task, onStatusChange, onDelete }: TaskItemProps) => {
  const getStatusIcon = (status: TaskItem['status']) => {
    switch (status) {
      case 'pending':
        return <Square className="h-4 w-4 text-muted-foreground" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckSquare className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="group flex items-center space-x-2 p-2 hover:bg-accent/50 rounded-md">
      <button
        onClick={() => onStatusChange(task.id, task.status)}
        className="flex-shrink-0"
      >
        {getStatusIcon(task.status)}
      </button>
      
      <span className={`flex-1 text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
        {task.content}
      </span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onStatusChange(task.id, 'pending')}>
            <Square className="h-4 w-4 mr-2" />
            Mark as Pending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_progress')}>
            <Clock className="h-4 w-4 mr-2" />
            Mark as In Progress
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusChange(task.id, 'completed')}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Mark as Completed
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onDelete(task.id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TaskPanel;