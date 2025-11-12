# Bonus 07: Generic Components in TypeScript

Generic components are reusable React components that work with different types while maintaining type safety. When combined with TypeScript generics, they provide powerful abstractions that can be used across different data types. This section covers advanced patterns for creating type-safe, reusable generic components.

## Basic Generic Components

### 1. Generic List Component

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  emptyMessage?: string;
  loading?: boolean;
  error?: string | null;
}

function List<T>({
  items,
  renderItem,
  keyExtractor = (_, index) => index,
  emptyMessage = "No items found",
  loading = false,
  error = null,
}: ListProps<T>) {
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (items.length === 0) {
    return <div className="empty">{emptyMessage}</div>;
  }

  return (
    <ul className="list">
      {items.map((item, index) => (
        <li key={keyExtractor(item, index)} className="list-item">
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// Usage
interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: "John", email: "john@example.com" },
  { id: 2, name: "Jane", email: "jane@example.com" },
];

<List
  items={users}
  keyExtractor={(user) => user.id}
  renderItem={(user) => (
    <div>
      <strong>{user.name}</strong>
      <span>{user.email}</span>
    </div>
  )}
/>
```

### 2. Generic Data Fetcher Component

```tsx
interface DataFetcherProps<T> {
  url: string;
  render: (data: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  }) => React.ReactNode;
  initialData?: T;
}

function DataFetcher<T>({
  url,
  render,
  initialData = null,
}: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <>{render({ data, loading, error, refetch: fetchData })}</>;
}

// Usage
interface Post {
  id: number;
  title: string;
  body: string;
}

const PostsPage: React.FC = () => {
  return (
    <DataFetcher<Post[]>
      url="/api/posts"
      render={({ data, loading, error, refetch }) => {
        if (loading) return <div>Loading posts...</div>;
        if (error) return <div>Error: {error}</div>;
        if (!data) return <div>No posts found</div>;

        return (
          <div>
            <button onClick={refetch}>Refresh</button>
            {data.map(post => (
              <article key={post.id}>
                <h2>{post.title}</h2>
                <p>{post.body}</p>
              </article>
            ))}
          </div>
        );
      }}
    />
  );
};
```

## Advanced Generic Patterns

### 1. Polymorphic Components

```tsx
// Polymorphic component that can render as different HTML elements
type PolymorphicProps<Element extends React.ElementType, Props = {}> = {
  as?: Element;
  children?: React.ReactNode;
} & Props & Omit<React.ComponentPropsWithoutRef<Element>, keyof Props | 'children'>;

function Polymorphic<
  Element extends React.ElementType = 'div',
  Props = {}
>({
  as,
  children,
  ...props
}: PolymorphicProps<Element, Props>) {
  const Component = as || 'div';
  return <Component {...props}>{children}</Component>;
}

// Usage
<Polymorphic as="button" onClick={() => {}} className="btn">
  Click me
</Polymorphic>

<Polymorphic as="a" href="/link" target="_blank">
  Link
</Polymorphic>
```

### 2. Generic Form Components

```tsx
interface FormFieldProps<T> {
  name: keyof T;
  label: string;
  value: T[keyof T];
  onChange: (name: keyof T, value: T[keyof T]) => void;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number';
}

function FormField<T extends Record<string, any>>({
  name,
  label,
  value,
  onChange,
  error,
  type = 'text',
}: FormFieldProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    onChange(name, newValue as T[keyof T]);
  };

  return (
    <div className="form-field">
      <label htmlFor={String(name)}>{label}</label>
      <input
        id={String(name)}
        name={String(name)}
        type={type}
        value={String(value)}
        onChange={handleChange}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

// Generic form component
interface FormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  children: (props: {
    values: T;
    setValue: (name: keyof T, value: T[keyof T]) => void;
    handleSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
  }) => React.ReactNode;
}

function Form<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  children,
}: FormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, values]);

  return (
    <form onSubmit={handleSubmit}>
      {children({ values, setValue, handleSubmit, isSubmitting })}
    </form>
  );
}

// Usage
interface UserFormData {
  name: string;
  email: string;
  age: number;
}

const UserForm: React.FC = () => {
  return (
    <Form<UserFormData>
      initialValues={{ name: '', email: '', age: 18 }}
      onSubmit={async (values) => {
        console.log('Submitting:', values);
        // Submit logic here
      }}
    >
      {({ values, setValue, isSubmitting }) => (
        <>
          <FormField
            name="name"
            label="Name"
            value={values.name}
            onChange={setValue}
          />
          <FormField
            name="email"
            label="Email"
            value={values.email}
            onChange={setValue}
            type="email"
          />
          <FormField
            name="age"
            label="Age"
            value={values.age}
            onChange={setValue}
            type="number"
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </>
      )}
    </Form>
  );
};
```

### 3. Generic Modal Components

```tsx
interface ModalProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  data?: T; // Optional data to pass to children
}

function Modal<T = any>({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  data,
}: ModalProps<T>) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="modal-body">
          {typeof children === 'function' ? children({ data, onClose }) : children}
        </div>
      </div>
    </div>
  );
}

// Usage with data
interface User {
  id: number;
  name: string;
  email: string;
}

const UserModal: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <Modal<User>
      isOpen={!!selectedUser}
      onClose={() => setSelectedUser(null)}
      title="User Details"
      data={selectedUser}
    >
      {({ data, onClose }) => data && (
        <div>
          <p><strong>Name:</strong> {data.name}</p>
          <p><strong>Email:</strong> {data.email}</p>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </Modal>
  );
};
```

## Generic Hooks

### 1. Generic Data Fetching Hook

```tsx
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useFetch<T>(
  url: string,
  options?: {
    initialData?: T;
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(options?.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: T = await response.json();
      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      options?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (options?.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options?.enabled]);

  return { data, loading, error, refetch: fetchData };
}

// Usage
interface User {
  id: number;
  name: string;
  email: string;
}

const UserProfile: React.FC<{ userId: number }> = ({ userId }) => {
  const { data: user, loading, error, refetch } = useFetch<User>(
    `/api/users/${userId}`,
    {
      onSuccess: (user) => console.log('User loaded:', user),
      onError: (error) => console.error('Failed to load user:', error),
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
};
```

### 2. Generic Local Storage Hook

```tsx
type SetValue<T> = T | ((prevValue: T) => T);

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: SetValue<T>) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

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

// Usage
interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings, resetSettings] = useLocalStorage<AppSettings>(
    'app-settings',
    {
      theme: 'light',
      language: 'en',
      notifications: true,
    }
  );

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <h1>Settings</h1>
      <div>
        <label>
          Theme:
          <select
            value={settings.theme}
            onChange={(e) => updateSetting('theme', e.target.value as 'light' | 'dark')}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
      <button onClick={resetSettings}>Reset to Defaults</button>
    </div>
  );
};
```

## Advanced Generic Component Patterns

### 1. Higher-Order Components with Generics

```tsx
function withDataFetching<T, P extends object>(
  WrappedComponent: React.ComponentType<P & { data: T }>,
  dataUrl: string
) {
  return function WithDataFetchingComponent(props: Omit<P, 'data'>) {
    const { data, loading, error } = useFetch<T>(dataUrl);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>No data</div>;

    return <WrappedComponent {...(props as P)} data={data} />;
  };
}

// Usage
interface UserListProps {
  data: User[];
  title: string;
}

const UserList: React.FC<UserListProps> = ({ data, title }) => {
  return (
    <div>
      <h1>{title}</h1>
      {data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};

const UserListWithData = withDataFetching<User[], UserListProps>(
  UserList,
  '/api/users'
);

// Usage
<UserListWithData title="All Users" />
```

### 2. Generic Component Factories

```tsx
interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

function createTableComponent<T extends Record<string, any>>() {
  return function Table({
    data,
    columns,
    keyExtractor,
    onRowClick,
    loading = false,
    emptyMessage = 'No data available',
  }: TableProps<T>) {
    if (loading) return <div>Loading...</div>;
    if (data.length === 0) return <div>{emptyMessage}</div>;

    return (
      <table>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={String(column.key)}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map(column => (
                <td key={String(column.key)}>
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key])
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
}

// Usage
const UserTable = createTableComponent<User>();

const UsersPage: React.FC = () => {
  const users: User[] = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' },
  ];

  const columns: TableColumn<User>[] = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
  ];

  return (
    <UserTable
      data={users}
      columns={columns}
      keyExtractor={(user) => user.id}
      onRowClick={(user) => console.log('Clicked user:', user)}
    />
  );
};
```

### 3. Generic Component Composition

```tsx
interface SelectableListProps<T> {
  items: T[];
  selectedItems: T[];
  onSelectionChange: (selectedItems: T[]) => void;
  itemKey: (item: T) => string | number;
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
  multiple?: boolean;
}

function SelectableList<T>({
  items,
  selectedItems,
  onSelectionChange,
  itemKey,
  renderItem,
  multiple = false,
}: SelectableListProps<T>) {
  const isSelected = (item: T): boolean => {
    const key = itemKey(item);
    return selectedItems.some(selected => itemKey(selected) === key);
  };

  const toggleSelection = (item: T) => {
    const key = itemKey(item);
    const currentlySelected = isSelected(item);

    if (multiple) {
      if (currentlySelected) {
        onSelectionChange(selectedItems.filter(selected => itemKey(selected) !== key));
      } else {
        onSelectionChange([...selectedItems, item]);
      }
    } else {
      onSelectionChange(currentlySelected ? [] : [item]);
    }
  };

  return (
    <div className="selectable-list">
      {items.map(item => (
        <div
          key={itemKey(item)}
          className={`list-item ${isSelected(item) ? 'selected' : ''}`}
          onClick={() => toggleSelection(item)}
        >
          {renderItem(item, isSelected(item))}
        </div>
      ))}
    </div>
  );
}

// Usage
interface Product {
  id: number;
  name: string;
  price: number;
}

const ProductSelector: React.FC = () => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const products: Product[] = [
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Mouse', price: 25 },
    { id: 3, name: 'Keyboard', price: 75 },
  ];

  return (
    <SelectableList
      items={products}
      selectedItems={selectedProducts}
      onSelectionChange={setSelectedProducts}
      itemKey={(product) => product.id}
      renderItem={(product, isSelected) => (
        <div>
          <span>{product.name}</span>
          <span>${product.price}</span>
          {isSelected && <span>✓</span>}
        </div>
      )}
      multiple={true}
    />
  );
};
```

## Best Practices

### 1. Constrain Generics Appropriately

```tsx
// ✅ Good: Constrain to objects with id
interface DataTableProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
}

// ❌ Avoid: Unconstrained generics
interface BadTableProps<T> {
  data: T[];
  columns: Column<T>[];
}
```

### 2. Use Utility Types for Props

```tsx
// ✅ Good: Extract props from components
type ButtonProps = React.ComponentProps<'button'>;
type InputProps = React.ComponentProps<'input'>;

// ✅ Good: Make specific props optional
type PartialProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface FormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void;
  disabledFields?: (keyof T)[];
}

// Usage
type PartialFormProps<T> = PartialProps<FormProps<T>, 'disabledFields'>;
```

### 3. Provide Sensible Defaults

```tsx
// ✅ Good: Default generic parameter
function List<T = any>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage without specifying type
<List items={[1, 2, 3]} renderItem={(item) => <span>{item}</span>} />
```

### 4. Document Generic Constraints

```tsx
/**
 * A generic data fetching component
 * @template T - The type of data being fetched
 * @param props.url - API endpoint URL
 * @param props.render - Render function that receives loading state and data
 */
function DataFetcher<T extends Record<string, any>>({
  url,
  render,
}: DataFetcherProps<T>) {
  // Implementation
}
```

## Common Patterns and Anti-Patterns

### Pattern: Generic Component Libraries

```tsx
// Component library structure
export function Button<T extends React.ElementType = 'button'>({
  as,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Component = as || 'button';
  return <Component {...props}>{children}</Component>;
}

export function Input<T extends React.ElementType = 'input'>({
  as,
  ...props
}: PolymorphicProps<T>) {
  const Component = as || 'input';
  return <Component {...props} />;
}

export function Select<T extends React.ElementType = 'select'>({
  as,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Component = as || 'select';
  return <Component {...props}>{children}</Component>;
}
```

### Anti-Pattern: Over-Generic Components

```tsx
// ❌ Avoid: Too many generic parameters
function ComplexComponent<
  TData,
  TError,
  TLoading,
  TConfig extends Record<string, any>
>({
  data,
  error,
  loading,
  config,
  render,
}: ComplexProps<TData, TError, TLoading, TConfig>) {
  // Implementation
}

// ✅ Better: Group related types
interface ApiState<TData, TError = string> {
  data: TData | null;
  error: TError | null;
  loading: boolean;
}

function SimpleComponent<TData, TError = string>({
  state,
  render,
}: {
  state: ApiState<TData, TError>;
  render: (state: ApiState<TData, TError>) => React.ReactNode;
}) {
  return <>{render(state)}</>;
}
```

### Pattern: Generic Hook Composition

```tsx
// Compose multiple generic hooks
function useCrudOperations<T extends { id: string }>(endpoint: string) {
  const [items, setItems] = useState<T[]>([]);
  const create = useCreate<T>(endpoint);
  const update = useUpdate<T>(endpoint);
  const remove = useDelete(endpoint);

  return {
    items,
    create: async (item: Omit<T, 'id'>) => {
      const newItem = await create(item);
      setItems(prev => [...prev, newItem]);
      return newItem;
    },
    update: async (id: string, updates: Partial<T>) => {
      const updatedItem = await update(id, updates);
      setItems(prev => prev.map(item =>
        item.id === id ? updatedItem : item
      ));
      return updatedItem;
    },
    remove: async (id: string) => {
      await remove(id);
      setItems(prev => prev.filter(item => item.id !== id));
    },
  };
}
```

## Performance Considerations

### 1. Generic Component Memoization

```tsx
// ✅ Good: Memoize generic components
const MemoizedList = React.memo(List) as <T>(
  props: ListProps<T>
) => React.ReactElement;

// ✅ Good: Use callback for stable references
function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
}: TableProps<T>) {
  const handleRowClick = useCallback((item: T) => {
    onRowClick?.(item);
  }, [onRowClick]);

  return (
    <table>
      {data.map(item => (
        <tr key={item.id} onClick={() => handleRowClick(item)}>
          {/* Render columns */}
        </tr>
      ))}
    </table>
  );
}
```

### 2. Type Inference Optimization

```tsx
// ✅ Good: Explicit return types for better inference
function useForm<T extends Record<string, any>>(
  initialValues: T
): {
  values: T;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  reset: () => void;
} {
  // Implementation
}

// ❌ Avoid: Implicit return types
function useBadForm<T extends Record<string, any>>(initialValues: T) {
  // TypeScript has to infer the return type
  return {
    values: initialValues,
    setValue: (key: string, value: any) => {},
    reset: () => {},
  };
}
```

## Summary

Generic components in TypeScript provide powerful abstractions for building reusable, type-safe React components. Key principles:

### Type Safety:
- Use constrained generics to ensure type safety
- Provide sensible defaults for generic parameters
- Leverage utility types for complex prop patterns

### Patterns:
- Polymorphic components for flexible rendering
- Generic hooks for reusable logic
- Higher-order components with type safety
- Component factories for complex scenarios

### Best Practices:
- Constrain generics appropriately
- Document generic constraints and usage
- Memoize generic components for performance
- Test generic components with different types

### Common Use Cases:
- Data display components (tables, lists, cards)
- Form components with type-safe validation
- Data fetching components
- Modal and dialog components
- Layout and container components

Generic components enable building scalable, maintainable React applications with strong type safety and excellent developer experience.
