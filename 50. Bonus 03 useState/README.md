# Bonus 03: useState with TypeScript

The `useState` hook is React's primary way to add state to functional components. When combined with TypeScript, it provides compile-time type safety for state management. This section covers proper typing patterns for useState and common scenarios you'll encounter.

## Basic useState Typing

### 1. Type Inference (Recommended)

TypeScript can often infer the type from the initial value:

```tsx
import React, { useState } from 'react';

const Counter: React.FC = () => {
  // TypeScript infers: number
  const [count, setCount] = useState(0);
  
  // TypeScript infers: string
  const [name, setName] = useState('John');
  
  // TypeScript infers: boolean
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Name: {name}</p>
      <p>Visible: {isVisible ? 'Yes' : 'No'}</p>
    </div>
  );
};
```

### 2. Explicit Type Annotation

For complex types or when TypeScript can't infer correctly:

```tsx
interface User {
  id: number;
  name: string;
  email: string;
}

const UserForm: React.FC = () => {
  // Explicit typing for objects
  const [user, setUser] = useState<User>({
    id: 0,
    name: '',
    email: '',
  });

  // Explicit typing for arrays
  const [tags, setTags] = useState<string[]>([]);

  // Explicit typing for union types
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  return (
    <form>
      <input
        value={user.name}
        onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Name"
      />
      <input
        value={user.email}
        onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
        placeholder="Email"
      />
      <button
        onClick={() => setTags(prev => [...prev, 'new-tag'])}
        type="button"
      >
        Add Tag
      </button>
    </form>
  );
};
```

## Advanced State Patterns

### 1. State with Complex Objects

```tsx
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  loading: boolean;
  error: string | null;
}

const TodoApp: React.FC = () => {
  const [state, setState] = useState<TodoState>({
    todos: [],
    filter: 'all',
    loading: false,
    error: null,
  });

  const addTodo = (text: string, priority: Todo['priority'] = 'medium') => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      priority,
    };

    setState(prev => ({
      ...prev,
      todos: [...prev.todos, newTodo],
    }));
  };

  const toggleTodo = (id: string) => {
    setState(prev => ({
      ...prev,
      todos: prev.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
  };

  const setFilter = (filter: TodoState['filter']) => {
    setState(prev => ({ ...prev, filter }));
  };

  return (
    <div>
      {/* Render todos based on state */}
    </div>
  );
};
```

### 2. State with Functions

```tsx
type CalculatorOperation = 'add' | 'subtract' | 'multiply' | 'divide';

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: CalculatorOperation | null;
  waitingForOperand: boolean;
}

const Calculator: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
  });

  const inputDigit = (digit: number) => {
    setState(prev => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: String(digit),
          waitingForOperand: false,
        };
      }

      return {
        ...prev,
        display: prev.display === '0' ? String(digit) : prev.display + digit,
      };
    });
  };

  const performOperation = (nextOperation: CalculatorOperation) => {
    const inputValue = parseFloat(state.display);

    setState(prev => {
      if (prev.previousValue === null) {
        return {
          ...prev,
          previousValue: inputValue,
          operation: nextOperation,
          waitingForOperand: true,
        };
      }

      const currentValue = prev.previousValue || 0;
      const newValue = calculate(currentValue, inputValue, prev.operation);

      return {
        ...prev,
        display: String(newValue),
        previousValue: newValue,
        operation: nextOperation,
        waitingForOperand: true,
      };
    });
  };

  return (
    <div className="calculator">
      <div className="display">{state.display}</div>
      {/* Calculator buttons */}
    </div>
  );
};
```

### 3. State with Optional Properties

```tsx
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
}

const ProfileEditor: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  });

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <form>
      <input
        value={profile.name}
        onChange={(e) => updateProfile({ name: e.target.value })}
        placeholder="Name"
      />
      <input
        value={profile.email}
        onChange={(e) => updateProfile({ email: e.target.value })}
        placeholder="Email"
      />
      <input
        value={profile.bio || ''}
        onChange={(e) => updateProfile({ bio: e.target.value })}
        placeholder="Bio (optional)"
      />
      <input
        value={profile.website || ''}
        onChange={(e) => updateProfile({ website: e.target.value })}
        placeholder="Website (optional)"
      />
    </form>
  );
};
```

## State Initialization Patterns

### 1. Lazy Initial State

```tsx
// For expensive computations
const [data, setData] = useState<ComplexData>(() => {
  // This function only runs on first render
  return computeExpensiveInitialState();
});

// For getting initial state from localStorage
const [theme, setTheme] = useState<'light' | 'dark'>(() => {
  const saved = localStorage.getItem('theme');
  return (saved as 'light' | 'dark') || 'light';
});

// For props-based initial state
interface CounterProps {
  initialCount?: number;
}

const Counter: React.FC<CounterProps> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState<number>(() => initialCount);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
};
```

### 2. State with Generic Constraints

```tsx
// Generic state hook
function useGenericState<T>(initialValue: T) {
  return useState<T>(initialValue);
}

// Usage
const [user, setUser] = useGenericState<User>({
  id: '1',
  name: 'John',
  email: 'john@example.com',
});

const [count, setCount] = useGenericState(0); // number
const [name, setName] = useGenericState(''); // string
```

## State Updates and Type Safety

### 1. Functional Updates

```tsx
interface ShoppingCart {
  items: CartItem[];
  total: number;
}

const ShoppingCart: React.FC = () => {
  const [cart, setCart] = useState<ShoppingCart>({
    items: [],
    total: 0,
  });

  const addItem = (item: CartItem) => {
    setCart(prevCart => ({
      items: [...prevCart.items, item],
      total: prevCart.total + item.price,
    }));
  };

  const removeItem = (itemId: string) => {
    setCart(prevCart => {
      const itemToRemove = prevCart.items.find(item => item.id === itemId);
      if (!itemToRemove) return prevCart;

      return {
        items: prevCart.items.filter(item => item.id !== itemId),
        total: prevCart.total - itemToRemove.price,
      };
    });
  };

  return (
    <div>
      <h2>Shopping Cart</h2>
      <p>Total: ${cart.total.toFixed(2)}</p>
      {/* Cart items */}
    </div>
  );
};
```

### 2. State with Validation

```tsx
interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

const useForm = (initialValues: Record<string, any>) => {
  const [state, setState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  const setValue = (field: string, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
    }));
  };

  const setError = (field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  };

  const setTouched = (field: string, touched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation logic
    if (!state.values.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(state.values.email)) {
      newErrors.email = 'Email is invalid';
    }

    setState(prev => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await submitForm(state.values);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    ...state,
    setValue,
    setError,
    setTouched,
    validate,
    submit,
  };
};
```

## Common Patterns and Best Practices

### 1. State Colocation

```tsx
// ✅ Good: Keep related state together
const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Better: Combine related state
  const [state, setState] = useState<{
    user: User | null;
    loading: boolean;
    error: string | null;
  }>({
    user: null,
    loading: false,
    error: null,
  });

  return (
    <div>
      {state.loading && <p>Loading...</p>}
      {state.error && <p>Error: {state.error}</p>}
      {state.user && <UserCard user={state.user} />}
    </div>
  );
};
```

### 2. State Lifting

```tsx
// Parent component
interface AppState {
  currentUser: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    theme: 'light',
    notifications: [],
  });

  const updateUser = (user: User) => {
    setAppState(prev => ({ ...prev, currentUser: user }));
  };

  const toggleTheme = () => {
    setAppState(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  return (
    <ThemeContext.Provider value={appState.theme}>
      <UserContext.Provider value={{ user: appState.currentUser, updateUser }}>
        {/* Child components */}
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};
```

### 3. State with Effects

```tsx
const DataFetcher: React.FC<{ url: string }> = ({ url }) => {
  const [state, setState] = useState<{
    data: any[] | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();

        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (state.loading) return <div>Loading...</div>;
  if (state.error) return <div>Error: {state.error}</div>;
  if (!state.data) return <div>No data</div>;

  return (
    <ul>
      {state.data.map((item, index) => (
        <li key={index}>{JSON.stringify(item)}</li>
      ))}
    </ul>
  );
};
```

## TypeScript-Specific Patterns

### 1. Discriminated Union State

```tsx
type LoadingState = { status: 'idle' };
type LoadingDataState = { status: 'loading' };
type SuccessState<T> = { status: 'success'; data: T };
type ErrorState = { status: 'error'; error: string };

type AsyncState<T> = LoadingState | LoadingDataState | SuccessState<T> | ErrorState;

const useAsyncData = <T>(url: string) => {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });

  const fetchData = async () => {
    setState({ status: 'loading' });

    try {
      const response = await fetch(url);
      const data = await response.json();
      setState({ status: 'success', data });
    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return { state, fetchData };
};

// Usage
const DataComponent: React.FC<{ url: string }> = ({ url }) => {
  const { state, fetchData } = useAsyncData<User[]>(url);

  switch (state.status) {
    case 'idle':
      return <button onClick={fetchData}>Load Data</button>;
    case 'loading':
      return <div>Loading...</div>;
    case 'success':
      return <UserList users={state.data} />;
    case 'error':
      return <div>Error: {state.error}</div>;
  }
};
```

### 2. State with Type Guards

```tsx
// Type guards for state checking
const isSuccessState = <T>(state: AsyncState<T>): state is SuccessState<T> => {
  return state.status === 'success';
};

const isErrorState = <T>(state: AsyncState<T>): state is ErrorState => {
  return state.status === 'error';
};

const isLoadingState = <T>(state: AsyncState<T>): state is LoadingDataState => {
  return state.status === 'loading';
};

// Usage in components
const StatusDisplay: React.FC<{ state: AsyncState<any> }> = ({ state }) => {
  if (isSuccessState(state)) {
    return <div>Data loaded: {state.data.length} items</div>;
  }

  if (isErrorState(state)) {
    return <div className="error">Error: {state.error}</div>;
  }

  if (isLoadingState(state)) {
    return <div className="loading">Loading...</div>;
  }

  return <div>Ready to load</div>;
};
```

## Performance Considerations

### 1. State Updates

```tsx
// ✅ Good: Functional updates prevent stale closures
const Counter: React.FC = () => {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(prevCount => prevCount + 1);
  };

  return <button onClick={increment}>Count: {count}</button>;
};

// ❌ Avoid: Direct state mutation
const BadCounter: React.FC = () => {
  const [count, setCount] = useState(0);

  const increment = () => {
    // This can cause issues with stale closures
    setCount(count + 1);
  };

  return <button onClick={increment}>Count: {count}</button>;
};
```

### 2. State Batching

```tsx
// Multiple state updates are batched
const Form: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Good: Single state update
  const resetForm = () => {
    setFormData({ name: '', email: '' });
  };

  // ✅ Good: Functional update
  const clearField = (field: keyof typeof formData) => {
    setFormData(prev => ({
      ...prev,
      [field]: '',
    }));
  };

  return (
    <form>
      <input
        value={formData.name}
        onChange={(e) => updateForm('name', e.target.value)}
      />
      <input
        value={formData.email}
        onChange={(e) => updateForm('email', e.target.value)}
      />
    </form>
  );
};
```

## Summary

`useState` with TypeScript provides powerful type safety for React state management. Key principles:

### Type Inference:
- Let TypeScript infer types when possible
- Use explicit types for complex objects and unions

### State Patterns:
- Combine related state into objects
- Use discriminated unions for complex state
- Leverage functional updates for state changes

### Best Practices:
- Keep state colocated when possible
- Use proper TypeScript types for all state
- Implement type guards for complex state checking
- Consider performance implications of state updates

### Common Patterns:
- Lazy initial state for expensive computations
- State with validation and error handling
- Generic state hooks for reusability
- Discriminated union state for complex flows

TypeScript enhances `useState` by providing compile-time guarantees about state structure and preventing runtime errors from incorrect state usage.
