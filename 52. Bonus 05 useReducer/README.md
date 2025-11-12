# Bonus 05: useReducer with TypeScript

The `useReducer` hook is React's advanced state management solution for complex state logic. When combined with TypeScript, it provides type-safe state transitions and actions. This section covers proper typing patterns for useReducer and advanced state management scenarios.

## Basic useReducer Typing

### 1. Action Types and Reducer

```tsx
import React, { useReducer } from 'react';

// Define action types
type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET_COUNT'; payload: number };

// Define state type
interface CounterState {
  count: number;
  history: number[];
}

// Type the reducer function
const counterReducer = (state: CounterState, action: CounterAction): CounterState => {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 1,
        history: [...state.history, state.count + 1],
      };
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - 1,
        history: [...state.history, state.count - 1],
      };
    case 'RESET':
      return {
        ...state,
        count: 0,
        history: [...state.history, 0],
      };
    case 'SET_COUNT':
      return {
        ...state,
        count: action.payload,
        history: [...state.history, action.payload],
      };
    default:
      return state;
  }
};

const Counter: React.FC = () => {
  const [state, dispatch] = useReducer(counterReducer, {
    count: 0,
    history: [0],
  });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      <button onClick={() => dispatch({ type: 'SET_COUNT', payload: 10 })}>
        Set to 10
      </button>
      <div>
        <h3>History:</h3>
        <ul>
          {state.history.map((value, index) => (
            <li key={index}>{value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

### 2. Discriminated Union Actions

```tsx
// More complex action types
type TodoAction =
  | { type: 'ADD_TODO'; payload: { text: string; priority: 'low' | 'medium' | 'high' } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'EDIT_TODO'; payload: { id: string; text: string } }
  | { type: 'SET_FILTER'; payload: { filter: 'all' | 'active' | 'completed' } }
  | { type: 'CLEAR_COMPLETED' };

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'ADD_TODO':
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: action.payload.text,
        completed: false,
        priority: action.payload.priority,
        createdAt: new Date(),
      };
      return {
        ...state,
        todos: [...state.todos, newTodo],
      };

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload.id),
      };

    case 'EDIT_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, text: action.payload.text }
            : todo
        ),
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload.filter,
      };

    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed),
      };

    default:
      return state;
  }
};
```

## Advanced useReducer Patterns

### 1. Generic Reducer

```tsx
// Generic reducer for CRUD operations
interface CrudState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

type CrudAction<T> =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: T[] }
  | { type: 'ADD_ITEM'; payload: T }
  | { type: 'UPDATE_ITEM'; payload: { id: string; data: Partial<T> } }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'SELECT_ITEM'; payload: string | null };

function createCrudReducer<T extends { id: string }>() {
  return (state: CrudState<T>, action: CrudAction<T>): CrudState<T> => {
    switch (action.type) {
      case 'SET_LOADING':
        return { ...state, loading: action.payload };
      case 'SET_ERROR':
        return { ...state, error: action.payload, loading: false };
      case 'SET_ITEMS':
        return { ...state, items: action.payload, loading: false, error: null };
      case 'ADD_ITEM':
        return { ...state, items: [...state.items, action.payload] };
      case 'UPDATE_ITEM':
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, ...action.payload.data }
              : item
          ),
        };
      case 'DELETE_ITEM':
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload),
        };
      case 'SELECT_ITEM':
        return { ...state, selectedId: action.payload };
      default:
        return state;
    }
  };
}

// Usage
interface User {
  id: string;
  name: string;
  email: string;
}

const userReducer = createCrudReducer<User>();

const UserManager: React.FC = () => {
  const [state, dispatch] = useReducer(userReducer, {
    items: [],
    loading: false,
    error: null,
    selectedId: null,
  });

  // Component logic...
};
```

### 2. State Machines with useReducer

```tsx
// State machine for async operations
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'fulfilled'; data: T }
  | { status: 'rejected'; error: string };

type AsyncAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: T }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'RESET' };

function createAsyncReducer<T>() {
  return (state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> => {
    switch (action.type) {
      case 'FETCH_START':
        return { status: 'pending' };
      case 'FETCH_SUCCESS':
        return { status: 'fulfilled', data: action.payload };
      case 'FETCH_ERROR':
        return { status: 'rejected', error: action.payload };
      case 'RESET':
        return { status: 'idle' };
      default:
        return state;
    }
  };
}

// Usage
const dataReducer = createAsyncReducer<User[]>();

const DataFetcher: React.FC<{ url: string }> = ({ url }) => {
  const [state, dispatch] = useReducer(dataReducer, { status: 'idle' });

  const fetchData = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const response = await fetch(url);
      const data = await response.json();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  };

  switch (state.status) {
    case 'idle':
      return <button onClick={fetchData}>Fetch Data</button>;
    case 'pending':
      return <div>Loading...</div>;
    case 'fulfilled':
      return <UserList users={state.data} />;
    case 'rejected':
      return <div>Error: {state.error}</div>;
  }
};
```

### 3. Complex Form State

```tsx
interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
}

interface FormState {
  fields: Record<string, FormField>;
  isSubmitting: boolean;
  submitCount: number;
}

type FormAction =
  | { type: 'SET_FIELD_VALUE'; payload: { name: string; value: string } }
  | { type: 'SET_FIELD_ERROR'; payload: { name: string; error: string | null } }
  | { type: 'TOUCH_FIELD'; payload: { name: string } }
  | { type: 'START_SUBMIT' }
  | { type: 'END_SUBMIT' }
  | { type: 'RESET_FORM' };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.payload.name]: {
            ...state.fields[action.payload.name],
            value: action.payload.value,
          },
        },
      };

    case 'SET_FIELD_ERROR':
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.payload.name]: {
            ...state.fields[action.payload.name],
            error: action.payload.error,
          },
        },
      };

    case 'TOUCH_FIELD':
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.payload.name]: {
            ...state.fields[action.payload.name],
            touched: true,
          },
        },
      };

    case 'START_SUBMIT':
      return { ...state, isSubmitting: true, submitCount: state.submitCount + 1 };

    case 'END_SUBMIT':
      return { ...state, isSubmitting: false };

    case 'RESET_FORM':
      return {
        ...state,
        fields: Object.keys(state.fields).reduce((acc, key) => ({
          ...acc,
          [key]: { value: '', error: null, touched: false },
        }), {}),
        isSubmitting: false,
        submitCount: 0,
      };

    default:
      return state;
  }
};
```

## useReducer with Context

### 1. Global State Management

```tsx
// Global app state
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
  loading: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = React.createContext<AppContextType | null>(null);

export const useApp = (): AppContextType => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Provider
interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    theme: 'light',
    notifications: [],
    loading: false,
  });

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
```

### 2. Complex Component State

```tsx
interface WizardState {
  currentStep: number;
  steps: WizardStep[];
  data: Record<string, any>;
  completedSteps: Set<number>;
  isSubmitting: boolean;
}

interface WizardStep {
  id: number;
  title: string;
  component: React.ComponentType;
  validation?: (data: Record<string, any>) => string | null;
}

type WizardAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'UPDATE_DATA'; payload: Record<string, any> }
  | { type: 'SET_STEP_COMPLETED'; payload: number }
  | { type: 'START_SUBMIT' }
  | { type: 'END_SUBMIT' };

const wizardReducer = (state: WizardState, action: WizardAction): WizardState => {
  switch (action.type) {
    case 'NEXT_STEP':
      if (state.currentStep < state.steps.length - 1) {
        return { ...state, currentStep: state.currentStep + 1 };
      }
      return state;

    case 'PREV_STEP':
      if (state.currentStep > 0) {
        return { ...state, currentStep: state.currentStep - 1 };
      }
      return state;

    case 'GO_TO_STEP':
      if (action.payload >= 0 && action.payload < state.steps.length) {
        return { ...state, currentStep: action.payload };
      }
      return state;

    case 'UPDATE_DATA':
      return {
        ...state,
        data: { ...state.data, ...action.payload },
      };

    case 'SET_STEP_COMPLETED':
      return {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.payload]),
      };

    case 'START_SUBMIT':
      return { ...state, isSubmitting: true };

    case 'END_SUBMIT':
      return { ...state, isSubmitting: false };

    default:
      return state;
  }
};
```

## TypeScript-Specific Patterns

### 1. Action Creators with Type Safety

```tsx
// Action creator functions with proper typing
const createCounterActions = (dispatch: React.Dispatch<CounterAction>) => ({
  increment: () => dispatch({ type: 'INCREMENT' }),
  decrement: () => dispatch({ type: 'DECREMENT' }),
  reset: () => dispatch({ type: 'RESET' }),
  setCount: (count: number) => dispatch({ type: 'SET_COUNT', payload: count }),
});

// Usage
const CounterWithActions: React.FC = () => {
  const [state, dispatch] = useReducer(counterReducer, { count: 0, history: [0] });
  const actions = createCounterActions(dispatch);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={actions.increment}>+</button>
      <button onClick={actions.decrement}>-</button>
      <button onClick={actions.reset}>Reset</button>
      <button onClick={() => actions.setCount(10)}>Set to 10</button>
    </div>
  );
};
```

### 2. Reducer with Type Guards

```tsx
// Type guards for action checking
const isIncrementAction = (action: CounterAction): action is { type: 'INCREMENT' } => {
  return action.type === 'INCREMENT';
};

const isSetCountAction = (action: CounterAction): action is { type: 'SET_COUNT'; payload: number } => {
  return action.type === 'SET_COUNT';
};

// Usage in reducer
const enhancedCounterReducer = (state: CounterState, action: CounterAction): CounterState => {
  if (isIncrementAction(action)) {
    return {
      ...state,
      count: state.count + 1,
      history: [...state.history, state.count + 1],
    };
  }

  if (isSetCountAction(action)) {
    return {
      ...state,
      count: action.payload,
      history: [...state.history, action.payload],
    };
  }

  // Handle other actions...
  return state;
};
```

### 3. Generic useReducer Hook

```tsx
// Generic useReducer with better typing
function useTypedReducer<R extends React.Reducer<any, any>>(
  reducer: R,
  initialState: React.ReducerState<R>
): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>] {
  return useReducer(reducer, initialState);
}

// Usage
const MyComponent: React.FC = () => {
  const [state, dispatch] = useTypedReducer(counterReducer, {
    count: 0,
    history: [0],
  });

  // TypeScript knows the exact types
  dispatch({ type: 'SET_COUNT', payload: 5 }); // ✅ Correct
  dispatch({ type: 'SET_COUNT', payload: '5' }); // ❌ Type error
};
```

## Best Practices

### 1. Keep Actions Simple

```tsx
// ✅ Good: Simple, focused actions
type TodoAction =
  | { type: 'ADD_TODO'; payload: { text: string; priority: 'low' | 'medium' | 'high' } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } };

// ❌ Avoid: Overly complex actions
type BadAction =
  | { type: 'UPDATE_TODO'; payload: Partial<Todo> & { id: string } }
  | { type: 'BULK_UPDATE'; payload: Array<Partial<Todo> & { id: string }> };
```

### 2. Use Discriminated Unions

```tsx
// ✅ Good: Discriminated unions for type safety
type ApiAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: T }
  | { type: 'FETCH_ERROR'; payload: string };

// ❌ Avoid: Non-discriminated unions
type BadApiAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; data: T }  // Different property names
  | { type: 'FETCH_ERROR'; message: string };
```

### 3. Handle All Actions

```tsx
// ✅ Good: Exhaustive checking
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ACTION_1':
      return handleAction1(state, action);
    case 'ACTION_2':
      return handleAction2(state, action);
    default:
      // TypeScript will error if we miss a case
      const _exhaustive: never = action;
      throw new Error(`Unhandled action: ${_exhaustive}`);
  }
};
```

### 4. Separate Business Logic

```tsx
// ✅ Good: Pure reducer functions
const updateTodo = (todos: Todo[], id: string, updates: Partial<Todo>): Todo[] => {
  return todos.map(todo =>
    todo.id === id ? { ...todo, ...updates } : todo
  );
};

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: updateTodo(state.todos, action.payload.id, action.payload.updates),
      };
    // ...
  }
};
```

### 5. Test Reducers

```tsx
// Unit tests for reducers
describe('counterReducer', () => {
  const initialState: CounterState = { count: 0, history: [0] };

  it('should increment count', () => {
    const action: CounterAction = { type: 'INCREMENT' };
    const result = counterReducer(initialState, action);

    expect(result.count).toBe(1);
    expect(result.history).toEqual([0, 1]);
  });

  it('should set count', () => {
    const action: CounterAction = { type: 'SET_COUNT', payload: 10 };
    const result = counterReducer(initialState, action);

    expect(result.count).toBe(10);
    expect(result.history).toEqual([0, 10]);
  });
});
```

## Common Patterns and Anti-Patterns

### Pattern: State Machine

```tsx
type GameState =
  | { phase: 'menu' }
  | { phase: 'playing'; score: number; lives: number }
  | { phase: 'paused'; score: number; lives: number }
  | { phase: 'gameOver'; finalScore: number };

type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'END_GAME' }
  | { type: 'UPDATE_SCORE'; payload: number };

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (state.phase) {
    case 'menu':
      if (action.type === 'START_GAME') {
        return { phase: 'playing', score: 0, lives: 3 };
      }
      break;

    case 'playing':
      switch (action.type) {
        case 'PAUSE_GAME':
          return { phase: 'paused', score: state.score, lives: state.lives };
        case 'UPDATE_SCORE':
          return { ...state, score: state.score + action.payload };
        case 'END_GAME':
          return { phase: 'gameOver', finalScore: state.score };
      }
      break;

    case 'paused':
      if (action.type === 'RESUME_GAME') {
        return { phase: 'playing', score: state.score, lives: state.lives };
      }
      break;
  }

  return state;
};
```

### Anti-Pattern: Complex State Objects

```tsx
// ❌ Avoid: Deeply nested state
interface BadState {
  user: {
    profile: {
      personal: {
        name: string;
        email: string;
      };
      preferences: {
        theme: 'light' | 'dark';
        notifications: boolean;
      };
    };
    settings: {
      privacy: {
        isPublic: boolean;
        showEmail: boolean;
      };
    };
  };
}

// ✅ Better: Flatter state structure
interface UserProfile {
  name: string;
  email: string;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
}

interface UserPrivacy {
  isPublic: boolean;
  showEmail: boolean;
}

interface GoodState {
  profile: UserProfile;
  preferences: UserPreferences;
  privacy: UserPrivacy;
}
```

## Performance Considerations

### 1. State Updates

```tsx
// ✅ Good: Immutable updates
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };
  }
};
```

### 2. Memoization

```tsx
// Use useMemo for expensive computations
const expensiveValue = useMemo(() => {
  return state.items.reduce((sum, item) => sum + item.value, 0);
}, [state.items]);
```

### 3. Action Batching

```tsx
// Multiple dispatches are batched automatically
const handleComplexUpdate = () => {
  dispatch({ type: 'SET_LOADING', payload: true });
  dispatch({ type: 'UPDATE_DATA', payload: newData });
  dispatch({ type: 'SET_LOADING', payload: false });
};
```

## Summary

`useReducer` with TypeScript provides powerful, type-safe state management for complex React applications. Key principles:

### Type Safety:
- Define strict action types with discriminated unions
- Use proper state interfaces
- Leverage TypeScript's type checking for state transitions

### Patterns:
- Generic reducers for reusable logic
- State machines for complex workflows
- Action creators for type-safe dispatching

### Best Practices:
- Keep actions simple and focused
- Use exhaustive checking for action handling
- Separate business logic from reducers
- Test reducers thoroughly

### Common Use Cases:
- Complex form state management
- Global application state
- Async operation state machines
- Multi-step wizards and workflows

TypeScript enhances `useReducer` by providing compile-time guarantees about state structure, action types, and state transitions, preventing runtime errors and improving code maintainability.
