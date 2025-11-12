# Bonus 06: useContext with TypeScript

The `useContext` hook provides a way to consume React context values. When combined with TypeScript, it enables type-safe context consumption and prevents runtime errors. This section covers proper typing patterns for useContext and context creation in TypeScript.

## Basic useContext Typing

### 1. Creating Typed Context

```tsx
import React, { createContext, useContext } from 'react';

// Define context value type
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Create context with proper typing
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Custom hook for consuming context
const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Provider component
interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextValue = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Usage
const ThemedButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={`btn btn-${theme}`}
      onClick={toggleTheme}
    >
      Current theme: {theme}
    </button>
  );
};
```

### 2. Context with Complex State

```tsx
// User context
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  const value: AuthContextValue = {
    user,
    login,
    logout,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Advanced Context Patterns

### 1. Multiple Contexts

```tsx
// App-wide context composition
interface AppContextValue {
  theme: ThemeContextValue;
  auth: AuthContextValue;
  notifications: NotificationContextValue;
}

const AppContext = createContext<AppContextValue | null>(null);

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContextProvider>
            {children}
          </AppContextProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const auth = useAuth();
  const notifications = useNotifications();

  const value: AppContextValue = {
    theme,
    auth,
    notifications,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
```

### 2. Generic Context Creator

```tsx
// Generic context creator function
function createTypedContext<T>() {
  const context = createContext<T | null>(null);

  const useContext = (): T => {
    const value = React.useContext(context);
    if (!value) {
      throw new Error('Context must be used within its provider');
    }
    return value;
  };

  return {
    context,
    useContext,
    Provider: context.Provider,
  };
}

// Usage
interface CounterContextValue {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const {
  context: CounterContext,
  useContext: useCounter,
  Provider: CounterProvider,
} = createTypedContext<CounterContextValue>();

// Provider implementation
interface CounterProviderProps {
  children: React.ReactNode;
  initialCount?: number;
}

const CounterProviderComponent: React.FC<CounterProviderProps> = ({
  children,
  initialCount = 0
}) => {
  const [count, setCount] = React.useState(initialCount);

  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);

  const value: CounterContextValue = {
    count,
    increment,
    decrement,
  };

  return (
    <CounterProvider value={value}>
      {children}
    </CounterProvider>
  );
};
```

### 3. Context with Reducer

```tsx
// Shopping cart context with reducer
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          ),
          total: state.total + (action.payload.price * (action.payload.quantity || 1)),
        };
      }

      const newItem: CartItem = {
        ...action.payload,
        quantity: action.payload.quantity || 1,
      };

      return {
        ...state,
        items: [...state.items, newItem],
        total: state.total + (newItem.price * newItem.quantity),
      };
    }

    case 'REMOVE_ITEM': {
      const itemToRemove = state.items.find(item => item.id === action.payload);
      if (!itemToRemove) return state;

      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (itemToRemove.price * itemToRemove.quantity),
      };
    }

    case 'UPDATE_QUANTITY': {
      const item = state.items.find(item => item.id === action.payload.id);
      if (!item) return state;

      const quantityDiff = action.payload.quantity - item.quantity;

      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        total: state.total + (item.price * quantityDiff),
      };
    }

    case 'CLEAR_CART':
      return { items: [], total: 0 };

    default:
      return state;
  }
};

interface CartContextValue {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = React.useReducer(cartReducer, {
    items: [],
    total: 0,
  });

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value: CartContextValue = {
    state,
    dispatch,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
```

## Context with TypeScript Best Practices

### 1. Strict Context Types

```tsx
// ✅ Good: Strict typing with proper error handling
interface UserContextValue {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// ❌ Avoid: Loose typing that allows null access
interface BadUserContextValue {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

const BadUserContext = createContext<BadUserContextValue>({
  user: null,
  updateUser: () => {},
  clearUser: () => {},
});

const useBadUser = () => {
  const context = useContext(BadUserContext);
  // context could be the default value, leading to bugs
  return context;
};
```

### 2. Context Splitting

```tsx
// ✅ Good: Split large contexts into focused ones
const ThemeContext = createContext<ThemeContextValue | null>(null);
const AuthContext = createContext<AuthContextValue | null>(null);
const NotificationContext = createContext<NotificationContextValue | null>(null);

// ❌ Avoid: Monolithic context
interface MonolithicContextValue {
  theme: ThemeContextValue;
  auth: AuthContextValue;
  notifications: NotificationContextValue;
  cart: CartContextValue;
  // ... many more properties
}

const MonolithicContext = createContext<MonolithicContextValue | null>(null);
```

### 3. Context with Memoization

```tsx
// ✅ Good: Memoize context value to prevent unnecessary re-renders
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  const toggleTheme = React.useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const value = React.useMemo<ThemeContextValue>(() => ({
    theme,
    toggleTheme,
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 4. Context Testing

```tsx
// Context testing utilities
const createTestContext = <T,>(context: React.Context<T | null>, value: T) => {
  const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <context.Provider value={value}>
        {children}
      </context.Provider>
    );
  };

  return TestProvider;
};

// Usage in tests
const TestThemeProvider = createTestContext(ThemeContext, {
  theme: 'light',
  toggleTheme: jest.fn(),
});

describe('ThemedButton', () => {
  it('renders with correct theme', () => {
    render(
      <TestThemeProvider>
        <ThemedButton />
      </TestThemeProvider>
    );

    expect(screen.getByRole('button')).toHaveClass('btn-light');
  });
});
```

## Common Context Patterns

### 1. Async Context

```tsx
interface AsyncDataContextValue<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function createAsyncDataContext<T>() {
  const context = createContext<AsyncDataContextValue<T> | null>(null);

  const useAsyncData = (): AsyncDataContextValue<T> => {
    const value = useContext(context);
    if (!value) {
      throw new Error('useAsyncData must be used within AsyncDataProvider');
    }
    return value;
  };

  return { context, useAsyncData };
}

// Usage
const { context: UserDataContext, useAsyncData: useUserData } = createAsyncDataContext<User[]>();

const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = React.useState<User[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refetch = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users');
      const users = await response.json();
      setData(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  const value: AsyncDataContextValue<User[]> = {
    data,
    loading,
    error,
    refetch,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};
```

### 2. Form Context

```tsx
interface FormContextValue {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
  setTouched: (name: string, touched?: boolean) => void;
  reset: () => void;
  isValid: boolean;
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextValue | null>(null);

export const useFormContext = (): FormContextValue => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

interface FormProviderProps {
  children: React.ReactNode;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
}

export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  initialValues = {},
  onSubmit,
}) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const setValue = React.useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setError = React.useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const setTouched = React.useCallback((name: string, touched: boolean = true) => {
    setTouched(prev => ({ ...prev, [name]: touched }));
  }, []);

  const reset = React.useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit]);

  const isValid = React.useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const value: FormContextValue = {
    values,
    errors,
    touched,
    setValue,
    setError,
    setTouched,
    reset,
    isValid,
    isSubmitting,
  };

  return (
    <FormContext.Provider value={value}>
      <form onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
};
```

### 3. Modal Context

```tsx
interface ModalContextValue {
  modals: Map<string, ModalConfig>;
  openModal: (id: string, config: ModalConfig) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

interface ModalConfig {
  title: string;
  content: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  closable?: boolean;
  onClose?: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export const useModal = (): ModalContextValue => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: React.ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modals, setModals] = React.useState<Map<string, ModalConfig>>(new Map());

  const openModal = React.useCallback((id: string, config: ModalConfig) => {
    setModals(prev => new Map(prev.set(id, config)));
  }, []);

  const closeModal = React.useCallback((id: string) => {
    setModals(prev => {
      const newModals = new Map(prev);
      const config = newModals.get(id);
      if (config?.onClose) {
        config.onClose();
      }
      newModals.delete(id);
      return newModals;
    });
  }, []);

  const closeAllModals = React.useCallback(() => {
    setModals(prev => {
      // Call onClose for all modals
      prev.forEach(config => config.onClose?.());
      return new Map();
    });
  }, []);

  const value: ModalContextValue = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      {/* Render modals */}
      {Array.from(modals.entries()).map(([id, config]) => (
        <Modal key={id} id={id} config={config} />
      ))}
    </ModalContext.Provider>
  );
};
```

## Performance Considerations

### 1. Context Splitting

```tsx
// ✅ Good: Split contexts to avoid unnecessary re-renders
const UserContext = createContext<User | null>(null);
const ThemeContext = createContext<'light' | 'dark'>('light');

// ❌ Avoid: Single context causing all consumers to re-render
interface AppContextValue {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

const AppContext = createContext<AppContextValue>({
  user: null,
  theme: 'light',
  notifications: [],
});
```

### 2. Memoization

```tsx
// ✅ Good: Memoize context values
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  const value = React.useMemo<ThemeContextValue>(() => ({
    theme,
    toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light'),
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 3. Selective Context

```tsx
// ✅ Good: Selective context updates
const CounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [count, setCount] = React.useState(0);
  const [step, setStep] = React.useState(1);

  const countValue = React.useMemo(() => ({ count, setCount }), [count]);
  const stepValue = React.useMemo(() => ({ step, setStep }), [step]);

  return (
    <CountContext.Provider value={countValue}>
      <StepContext.Provider value={stepValue}>
        {children}
      </StepContext.Provider>
    </CountContext.Provider>
  );
};
```

## Best Practices

### 1. Provide Clear Error Messages

```tsx
// ✅ Good: Descriptive error messages
const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// ❌ Avoid: Generic error messages
const useBadTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('Context error');
  }
  return context;
};
```

### 2. Use Functional Updates

```tsx
// ✅ Good: Functional updates for complex state
const CounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [count, setCount] = React.useState(0);

  const increment = React.useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  // ...
};
```

### 3. Type Context Values Properly

```tsx
// ✅ Good: Strict typing
interface ThemeContextValue {
  readonly theme: 'light' | 'dark';
  readonly toggleTheme: () => void;
}

// ❌ Avoid: Loose typing
interface BadThemeContextValue {
  theme: string; // Too broad
  toggleTheme: Function; // Too loose
}
```

### 4. Test Context Providers

```tsx
// Context testing pattern
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        {component}
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('App', () => {
  it('renders with providers', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
});
```

## Summary

`useContext` with TypeScript provides powerful, type-safe context consumption for React applications. Key principles:

### Type Safety:
- Define strict context value interfaces
- Use proper error handling for missing context
- Leverage discriminated unions for complex context values

### Patterns:
- Custom hooks for context consumption
- Generic context creators for reusability
- Context composition for complex state management

### Best Practices:
- Split large contexts into focused ones
- Memoize context values to prevent unnecessary re-renders
- Provide clear error messages for missing context
- Test context providers thoroughly

### Common Use Cases:
- Theme management
- Authentication state
- Global application state
- Form state management
- Modal and dialog management

TypeScript enhances `useContext` by providing compile-time guarantees about context structure and preventing runtime errors from incorrect context usage. When combined with proper typing patterns, context becomes a powerful tool for building scalable React applications.
