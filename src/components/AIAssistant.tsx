import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code, FileText, Zap } from 'lucide-react';
import { Button } from './ui/button';
import ReactMarkdown from 'react-markdown';
import { useProject } from '../contexts/ProjectContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'plan';
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your AI assistant. I can help you with:

• **Code Generation** - Create components, functions, and entire features
• **Task Planning** - Break down complex features into actionable steps  
• **Code Review** - Analyze and improve your existing code
• **Debugging** - Find and fix issues in your application
• **Architecture** - Suggest best practices and design patterns

What would you like to work on today?`,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentProject, addTask } = useProject();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    try {
      const response = await simulateAIResponse(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        type: response.type
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-create tasks or workflows based on AI response
      if (response.type === 'plan' && currentProject) {
        const tasks = extractTasksFromResponse(response.content);
        tasks.forEach(task => {
          addTask(currentProject.id, task);
        });
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Bot className="h-4 w-4" />
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="border-t p-2">
        <div className="flex flex-wrap gap-1 mb-2">
          <QuickActionButton
            icon={<Code className="h-3 w-3" />}
            text="Generate component"
            onClick={() => handleQuickAction('Create a new React component for ')}
          />
          <QuickActionButton
            icon={<FileText className="h-3 w-3" />}
            text="Plan feature"
            onClick={() => handleQuickAction('Create a plan to implement ')}
          />
          <QuickActionButton
            icon={<Zap className="h-3 w-3" />}
            text="Review code"
            onClick={() => handleQuickAction('Review my current code and suggest improvements')}
          />
        </div>
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your project..."
              className="w-full px-3 py-2 border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              rows={1}
              style={{ 
                minHeight: '40px',
                maxHeight: '120px',
                height: 'auto',
                overflowY: input.split('\\n').length > 3 ? 'scroll' : 'hidden'
              }}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="h-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex space-x-2 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}
        `}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        
        <div className={`
          rounded-lg px-3 py-2 
          ${isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted border'
          }
        `}>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          
          <div className={`
            text-xs mt-2 opacity-70
            ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}
          `}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

interface QuickActionButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}

const QuickActionButton = ({ icon, text, onClick }: QuickActionButtonProps) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClick}
    className="h-7 text-xs"
  >
    {icon}
    <span className="ml-1">{text}</span>
  </Button>
);

// Simulate AI response (in production, this would call actual AI API)
async function simulateAIResponse(input: string): Promise<{ content: string; type: 'text' | 'code' | 'plan' }> {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('plan') || lowerInput.includes('break down') || lowerInput.includes('steps')) {
    return {
      type: 'plan',
      content: `## Implementation Plan

Here's a step-by-step approach:

### Phase 1: Setup
- [ ] Create necessary file structure
- [ ] Install required dependencies
- [ ] Set up configuration files

### Phase 2: Core Implementation  
- [ ] Implement main functionality
- [ ] Add error handling
- [ ] Write unit tests

### Phase 3: Integration
- [ ] Connect with existing components
- [ ] Update documentation
- [ ] Test integration points

### Phase 4: Polish
- [ ] Optimize performance
- [ ] Improve user experience
- [ ] Final testing

Would you like me to elaborate on any of these steps?`
    };
  }
  
  if (lowerInput.includes('component') || lowerInput.includes('create') || lowerInput.includes('generate')) {
    return {
      type: 'code',
      content: `I'll help you create a component! Here's a basic template:

\`\`\`tsx
import { useState } from 'react';

interface ComponentProps {
  title: string;
  onAction?: () => void;
}

const NewComponent = ({ title, onAction }: ComponentProps) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">{title}</h3>
      <button 
        onClick={() => {
          setIsActive(!isActive);
          onAction?.();
        }}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isActive ? 'Active' : 'Inactive'}
      </button>
    </div>
  );
};

export default NewComponent;
\`\`\`

This component includes:
- TypeScript interfaces for props
- State management with hooks
- Event handling
- Tailwind CSS styling

Would you like me to customize this for your specific use case?`
    };
  }
  
  if (lowerInput.includes('review') || lowerInput.includes('improve') || lowerInput.includes('optimize')) {
    return {
      type: 'text',
      content: `I'd be happy to review your code! Here are some general best practices I can check:

**Code Quality:**
- TypeScript types and interfaces
- Error handling and edge cases
- Performance optimizations
- Security considerations

**React Best Practices:**
- Component composition
- Hook usage and dependencies
- State management patterns
- Rendering optimizations

**Architecture:**
- File organization
- Separation of concerns
- Reusability and maintainability

Please share the specific code you'd like me to review, or select a file in the editor and I'll analyze it!`
    };
  }
  
  return {
    type: 'text',
    content: `I understand you're asking about: "${input}"

I'm here to help with your development needs! I can assist with:

- **Code Generation**: Creating components, functions, APIs
- **Planning**: Breaking down features into tasks
- **Debugging**: Finding and fixing issues
- **Architecture**: Design patterns and best practices
- **Optimization**: Performance and code quality improvements

Could you provide more specific details about what you'd like to accomplish?`
  };
}

// Extract tasks from AI response for auto-creation
function extractTasksFromResponse(content: string): string[] {
  const tasks: string[] = [];
  const lines = content.split('\\n');
  
  for (const line of lines) {
    const taskMatch = line.match(/^-\\s*\\[\\s*\\]\\s*(.+)$/);
    if (taskMatch) {
      tasks.push(taskMatch[1].trim());
    }
  }
  
  return tasks;
}

export default AIAssistant;