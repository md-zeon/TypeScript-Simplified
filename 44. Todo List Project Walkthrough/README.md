# Todo List Project Walkthrough: Building with Vite + TypeScript

This section provides a complete walkthrough of building our Todo List application using Vite and TypeScript. We'll start from project initialization and build up to a fully functional application, applying all the TypeScript concepts we've learned.

## Phase 1: Project Setup

### 1. Initialize Vite TypeScript Project

```bash
# Create new Vite project with TypeScript
npm create vite@latest todo-list-app -- --template react-ts
cd todo-list-app

# Install dependencies
npm install

# Install additional dependencies we'll need
npm install date-fns clsx @types/node

# For testing (optional)
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### 2. Configure TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"],
      "@/hooks/*": ["src/hooks/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. Configure Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### 4. Set Up Project Structure

```bash
# Create directory structure
mkdir -p src/components src/types src/utils src/hooks src/contexts

# Create initial files
touch src/types/index.ts
touch src/utils/storage.ts
touch src/utils/validation.ts
touch src/hooks/useTodos.ts
touch src/contexts/TodoContext.tsx
```

## Phase 2: Core Types

### 1. Define Todo Types

```typescript
// src/types/todo.ts
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: Category;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type Category = "work" | "personal" | "shopping" | "health" | "other";

export type TodoFilter = "all" | "active" | "completed";

// Utility types
export type CreateTodoInput = Omit<Todo, "id" | "createdAt" | "updatedAt">;
export type UpdateTodoInput = Partial<CreateTodoInput>;
export type TodoSummary = Pick<Todo, "id" | "title" | "completed" | "category">;

// Branded type for IDs
export type TodoId = string & { readonly __brand: "TodoId" };

export function createTodoId(id: string): TodoId {
  return id as TodoId;
}
```

### 2. Define API Response Types

```typescript
// src/types/api.ts
import { Todo } from './todo';

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type TodoListResponse = ApiResponse<Todo[]>;
export type TodoResponse = ApiResponse<Todo>;
export type CreateTodoResponse = ApiResponse<Todo>;
export type UpdateTodoResponse = ApiResponse<Todo>;
export type DeleteTodoResponse = ApiResponse<void>;
```

### 3. Export All Types

```typescript
// src/types/index.ts
export * from './todo';
export * from './api';
```

## Phase 3: Utility Functions

### 1. Local Storage Utilities

```typescript
// src/utils/storage.ts
import { Todo, TodoId } from '@/types';

const STORAGE_KEY = 'todos-typescript-app';

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export function loadTodos(): Todo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    // Validate and transform dates
    return parsed.map((todo: any) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt),
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
    }));
  } catch (error) {
    console.error('Failed to load todos:', error);
    throw new StorageError('Failed to load todos from storage');
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos:', error);
    throw new StorageError('Failed to save todos to storage');
  }
}

export function clearTodos(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear todos:', error);
    throw new StorageError('Failed to clear todos from storage');
  }
}
```

### 2. Validation Utilities

```typescript
// src/utils/validation.ts
import { CreateTodoInput, UpdateTodoInput } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export type ValidationResult = ValidationError[];

// Type guard for validation errors
export function isValidationErrorArray(errors: unknown): errors is ValidationError[] {
  return Array.isArray(errors) &&
         errors.every(error =>
           typeof error === 'object' &&
           error !== null &&
           typeof (error as ValidationError).field === 'string' &&
           typeof (error as ValidationError).message === 'string'
         );
}

export function validateTodoInput(input: CreateTodoInput | UpdateTodoInput): ValidationResult {
  const errors: ValidationError[] = [];

  if ('title' in input && typeof input.title === 'string') {
    if (input.title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (input.title.length > 100) {
      errors.push({ field: 'title', message: 'Title must be less than 100 characters' });
    }
  }

  if ('description' in input && input.description !== undefined) {
    if (typeof input.description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string' });
    } else if (input.description.length > 500) {
      errors.push({ field: 'description', message: 'Description must be less than 500 characters' });
    }
  }

  if ('category' in input && input.category !== undefined) {
    const validCategories = ['work', 'personal', 'shopping', 'health', 'other'];
    if (!validCategories.includes(input.category)) {
      errors.push({ field: 'category', message: 'Invalid category' });
    }
  }

  if ('dueDate' in input && input.dueDate !== undefined) {
    if (!(input.dueDate instanceof Date) || isNaN(input.dueDate.getTime())) {
      errors.push({ field: 'dueDate', message: 'Invalid due date' });
    }
  }

  return errors;
}

export function assertValidTodo(input: CreateTodoInput): asserts input is CreateTodoInput {
  const errors = validateTodoInput(input);
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
  }
}
```

### 3. Date Utilities

```typescript
// src/utils/date.ts
import { format, isToday, isTomorrow, isYesterday, formatDistanceToNow } from 'date-fns';

export function formatDueDate(date: Date): string {
  if (isToday(date)) {
    return `Today at ${format(date, 'HH:mm')}`;
  }
  if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, 'HH:mm')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'HH:mm')}`;
  }
  return format(date, 'MMM dd, yyyy \'at\' HH:mm');
}

export function getRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function isOverdue(date: Date): boolean {
  return date < new Date();
}

export function sortByDueDate(a: Date | undefined, b: Date | undefined): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.getTime() - b.getTime();
}
```

## Phase 4: Custom Hooks

### 1. useLocalStorage Hook

```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Save to localStorage whenever value changes
  const setValue = useCallback((value: T | ((prevValue: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
```

### 2. useTodos Hook

```typescript
// src/hooks/useTodos.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Todo, CreateTodoInput, UpdateTodoInput, TodoFilter, Category, TodoId, createTodoId } from '@/types';
import { loadTodos, saveTodos } from '@/utils/storage';
import { validateTodoInput } from '@/utils/validation';

export interface UseTodosReturn {
  todos: Todo[];
  filteredTodos: Todo[];
  addTodo: (input: CreateTodoInput) => Promise<TodoId>;
  updateTodo: (id: TodoId, updates: UpdateTodoInput) => Promise<void>;
  deleteTodo: (id: TodoId) => Promise<void>;
  toggleTodo: (id: TodoId) => Promise<void>;
  clearCompleted: () => Promise<void>;
  filter: TodoFilter;
  setFilter: (filter: TodoFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: Category | 'all';
  setSelectedCategory: (category: Category | 'all') => void;
  stats: {
    total: number;
    completed: number;
    active: number;
    overdue: number;
  };
  isLoading: boolean;
  error: string | null;
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos on mount
  useEffect(() => {
    try {
      const loadedTodos = loadTodos();
      setTodos(loadedTodos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save todos whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        saveTodos(todos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save todos');
      }
    }
  }, [todos, isLoading]);

  // Filter and search todos
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      // Filter by completion status
      if (filter === 'active' && todo.completed) return false;
      if (filter === 'completed' && !todo.completed) return false;

      // Filter by category
      if (selectedCategory !== 'all' && todo.category !== selectedCategory) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return todo.title.toLowerCase().includes(query) ||
               (todo.description?.toLowerCase().includes(query));
      }

      return true;
    });
  }, [todos, filter, searchQuery, selectedCategory]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    const overdue = todos.filter(t => t.dueDate && !t.completed && t.dueDate < new Date()).length;

    return { total, completed, active, overdue };
  }, [todos]);

  // Add new todo
  const addTodo = useCallback(async (input: CreateTodoInput): Promise<TodoId> => {
    const validationErrors = validateTodoInput(input);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    const id = createTodoId(crypto.randomUUID());
    const now = new Date();

    const newTodo: Todo = {
      ...input,
      id,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    setTodos(prev => [...prev, newTodo]);
    setError(null);
    return id;
  }, []);

  // Update existing todo
  const updateTodo = useCallback(async (id: TodoId, updates: UpdateTodoInput): Promise<void> => {
    const validationErrors = validateTodoInput(updates);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    setTodos(prev => prev.map(todo =>
      todo.id === id
        ? { ...todo, ...updates, updatedAt: new Date() }
        : todo
    ));
    setError(null);
  }, []);

  // Delete todo
  const deleteTodo = useCallback(async (id: TodoId): Promise<void> => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    setError(null);
  }, []);

  // Toggle completion status
  const toggleTodo = useCallback(async (id: TodoId): Promise<void> => {
    setTodos(prev => prev.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
        : todo
    ));
    setError(null);
  }, []);

  // Clear completed todos
  const clearCompleted = useCallback(async (): Promise<void> => {
    setTodos(prev => prev.filter(todo => !todo.completed));
    setError(null);
  }, []);

  return {
    todos,
    filteredTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    stats,
    isLoading,
    error,
  };
}
```

## Phase 5: React Components

### 1. TodoItem Component

```tsx
// src/components/TodoItem.tsx
import React from 'react';
import clsx from 'clsx';
import { Todo, TodoId } from '@/types';
import { formatDueDate, isOverdue } from '@/utils/date';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: TodoId) => void;
  onDelete: (id: TodoId) => void;
  onEdit: (id: TodoId) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const isOverdueItem = todo.dueDate && !todo.completed && isOverdue(todo.dueDate);

  return (
    <div className={clsx('todo-item', {
      'completed': todo.completed,
      'overdue': isOverdueItem,
    })}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="todo-checkbox"
        />

        <div className="todo-details">
          <h3 className="todo-title">{todo.title}</h3>
          {todo.description && (
            <p className="todo-description">{todo.description}</p>
          )}

          <div className="todo-meta">
            <span className={`todo-category category-${todo.category}`}>
              {todo.category}
            </span>

            {todo.dueDate && (
              <span className={clsx('todo-due-date', {
                'overdue': isOverdueItem,
              })}>
                {formatDueDate(todo.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="todo-actions">
        <button
          onClick={() => onEdit(todo.id)}
          className="btn btn-secondary"
          aria-label="Edit todo"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="btn btn-danger"
          aria-label="Delete todo"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
```

### 2. TodoForm Component

```tsx
// src/components/TodoForm.tsx
import React, { useState } from 'react';
import { CreateTodoInput, Category } from '@/types';
import { validateTodoInput } from '@/utils/validation';

interface TodoFormProps {
  onSubmit: (input: CreateTodoInput) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateTodoInput>;
}

export const TodoForm: React.FC<TodoFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState<CreateTodoInput>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'personal',
    dueDate: initialData?.dueDate,
    completed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateTodoInput(formData);
    if (validationErrors.length > 0) {
      const errorMap = validationErrors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as Record<string, string>);
      setErrors(errorMap);
      return;
    }

    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      dueDate: undefined,
      completed: false,
    });
    setErrors({});
  };

  const handleChange = (
    field: keyof CreateTodoInput,
    value: string | boolean | Date | undefined
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className={clsx('form-input', { 'error': errors.title })}
          required
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className={clsx('form-input', { 'error': errors.description })}
          rows={3}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value as Category)}
          className="form-input"
        >
          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="shopping">Shopping</option>
          <option value="health">Health</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="dueDate">Due Date</label>
        <input
          id="dueDate"
          type="datetime-local"
          value={formData.dueDate ? formData.dueDate.toISOString().slice(0, 16) : ''}
          onChange={(e) => handleChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
          className="form-input"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Update Todo' : 'Add Todo'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
```

### 3. TodoList Component

```tsx
// src/components/TodoList.tsx
import React from 'react';
import { Todo, TodoId, TodoFilter, Category } from '@/types';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  onToggle: (id: TodoId) => void;
  onDelete: (id: TodoId) => void;
  onEdit: (id: TodoId) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onToggle,
  onDelete,
  onEdit,
}) => {
  return (
    <div className="todo-list">
      <div className="todo-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value as TodoFilter)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value as Category | 'all')}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="shopping">Shopping</option>
              <option value="health">Health</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="todos">
        {todos.length === 0 ? (
          <div className="empty-state">
            <p>No todos found. Add one above!</p>
          </div>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};
```

## Phase 6: Main Application

### 1. TodoContext

```tsx
// src/contexts/TodoContext.tsx
import React, { createContext, useContext } from 'react';
import { useTodos, UseTodosReturn } from '@/hooks/useTodos';

const TodoContext = createContext<UseTodosReturn | null>(null);

export const useTodoContext = (): UseTodosReturn => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
};

interface TodoProviderProps {
  children: React.ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const todoData = useTodos();

  return (
    <TodoContext.Provider value={todoData}>
      {children}
    </TodoContext.Provider>
  );
};
```

### 2. App Component

```tsx
// src/App.tsx
import React, { useState } from 'react';
import { TodoProvider, useTodoContext } from '@/contexts/TodoContext';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';
import { CreateTodoInput, TodoId } from '@/types';

const AppContent: React.FC = () => {
  const {
    filteredTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    stats,
    isLoading,
    error,
  } = useTodoContext();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<TodoId | null>(null);

  const handleAddTodo = async (input: CreateTodoInput) => {
    try {
      await addTodo(input);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add todo:', err);
    }
  };

  const handleEditTodo = (id: TodoId) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleUpdateTodo = async (input: CreateTodoInput) => {
    if (editingId) {
      try {
        await updateTodo(editingId, input);
        setEditingId(null);
        setShowForm(false);
      } catch (err) {
        console.error('Failed to update todo:', err);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  if (isLoading) {
    return <div className="loading">Loading todos...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo List App</h1>
        <div className="stats">
          <span>Total: {stats.total}</span>
          <span>Active: {stats.active}</span>
          <span>Completed: {stats.completed}</span>
          {stats.overdue > 0 && (
            <span className="overdue">Overdue: {stats.overdue}</span>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="actions">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : 'Add Todo'}
          </button>

          {stats.completed > 0 && (
            <button
              onClick={clearCompleted}
              className="btn btn-secondary"
            >
              Clear Completed ({stats.completed})
            </button>
          )}
        </div>

        {error && (
          <div className="error-banner">
            Error: {error}
          </div>
        )}

        {showForm && (
          <div className="form-container">
            <TodoForm
              onSubmit={editingId ? handleUpdateTodo : handleAddTodo}
              onCancel={handleCancel}
              initialData={editingId ? filteredTodos.find(t => t.id === editingId) : undefined}
            />
          </div>
        )}

        <TodoList
          todos={filteredTodos}
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={handleEditTodo}
        />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <TodoProvider>
      <AppContent />
    </TodoProvider>
  );
};

export default App;
```

### 3. Main Entry Point

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## Phase 7: Styling

### 1. Global Styles

```css
/* src/index.css */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --border-color: #dee2e6;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
  color: var(--dark-color);
  background-color: var(--light-color);
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.app-header h1 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.stats {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.stats span {
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  box-shadow: var(--shadow);
}

.stats .overdue {
  color: var(--danger-color);
  font-weight: bold;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-danger {
  background-color: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.todo-item {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
  color: var(--secondary-color);
}

.todo-item.overdue {
  border-left: 4px solid var(--danger-color);
}

.todo-content {
  flex: 1;
  display: flex;
  gap: 1rem;
}

.todo-details {
  flex: 1;
}

.todo-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.todo-description {
  color: var(--secondary-color);
  margin-bottom: 0.5rem;
}

.todo-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.todo-category {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: bold;
}

.category-work { background-color: #e3f2fd; color: #1976d2; }
.category-personal { background-color: #f3e5f5; color: #7b1fa2; }
.category-shopping { background-color: #e8f5e8; color: #388e3c; }
.category-health { background-color: #fff3e0; color: #f57c00; }
.category-other { background-color: #fafafa; color: #616161; }

.todo-due-date {
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.todo-due-date.overdue {
  color: var(--danger-color);
  font-weight: bold;
}

.todo-actions {
  display: flex;
  gap: 0.5rem;
}

.todo-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-input.error {
  border-color: var(--danger-color);
}

.error-message {
  color: var(--danger-color);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.todo-list {
  margin-top: 2rem;
}

.todo-controls {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.todos {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--secondary-color);
}

.error-banner {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .app {
    padding: 1rem;
  }

  .todo-content {
    flex-direction: column;
  }

  .todo-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .filters {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
  }

  .stats {
    flex-direction: column;
    align-items: center;
  }
}
```

## Phase 8: Testing Setup

### 1. Vitest Configuration

```typescript
// vitest.config.ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

### 2. Test Setup

```typescript
// src/test/setup.ts
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

### 3. Example Test

```typescript
// src/utils/validation.test.ts
import { describe, it, expect } from 'vitest'
import { validateTodoInput } from './validation'

describe('validateTodoInput', () => {
  it('should return no errors for valid input', () => {
    const input = {
      title: 'Test Todo',
      description: 'Test description',
      category: 'personal' as const,
      completed: false,
    }

    const errors = validateTodoInput(input)
    expect(errors).toHaveLength(0)
  })

  it('should return error for empty title', () => {
    const input = {
      title: '',
      category: 'personal' as const,
      completed: false,
    }

    const errors = validateTodoInput(input)
    expect(errors).toEqual([
      { field: 'title', message: 'Title is required' }
    ])
  })

  it('should return error for title too long', () => {
    const input = {
      title: 'a'.repeat(101),
      category: 'personal' as const,
      completed: false,
    }

    const errors = validateTodoInput(input)
    expect(errors).toEqual([
      { field: 'title', message: 'Title must be less than 100 characters' }
    ])
  })
})
```

## Phase 9: Running the Application

### 1. Development Server

```bash
npm run dev
```

### 2. Build for Production

```bash
npm run build
```

### 3. Preview Production Build

```bash
npm run preview
```

### 4. Run Tests

```bash
npm run test
```

## Summary

This walkthrough demonstrates building a complete Todo List application using Vite and TypeScript, showcasing:

- **Modern Tooling**: Vite for fast development and building
- **Type Safety**: Comprehensive TypeScript usage throughout
- **Advanced Patterns**: Custom hooks, context, discriminated unions
- **Best Practices**: Error handling, validation, accessibility
- **Testing**: Unit tests with Vitest
- **Production Ready**: Optimized build and deployment

The application includes all the features mentioned in the introduction and serves as a practical example of applying TypeScript concepts in a real-world React application.
