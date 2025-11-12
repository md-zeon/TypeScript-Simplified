# Bonus 02: TypeScript Setup and Props

This bonus section covers the essential setup for TypeScript projects and best practices for working with React props. Understanding how to properly configure TypeScript and handle component props is crucial for building maintainable React applications with type safety.

## Setting Up TypeScript

### 1. New Project Setup

#### Using Create React App with TypeScript

```bash
# Create React App with TypeScript template
npx create-react-app my-app --template typescript

# Or with Vite (recommended for modern projects)
npm create vite@latest my-app -- --template react-ts
```

#### Manual Setup

```bash
# Initialize npm project
npm init -y

# Install TypeScript and related packages
npm install -D typescript @types/node @types/react @types/react-dom

# For React projects
npm install react react-dom
npm install -D @types/react @types/react-dom

# Initialize TypeScript configuration
npx tsc --init
```

### 2. TypeScript Configuration

#### Basic tsconfig.json

```json
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

    /* Path mapping for clean imports */
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

#### Strict Mode Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### 3. Project Structure

```
my-app/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── index.ts
│   ├── types/
│   │   ├── common.ts
│   │   ├── api.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── validation.ts
│   ├── hooks/
│   │   ├── useApi.ts
│   │   └── useLocalStorage.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## React Props with TypeScript

### 1. Basic Props Interface

```tsx
// Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
```

### 2. Props with Children

```tsx
// Card.tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, children, className, onClick }) => {
  return (
    <div className={`card ${className || ''}`} onClick={onClick}>
      <h3 className="card-title">{title}</h3>
      <div className="card-content">{children}</div>
    </div>
  );
};

// Usage
<Card title="My Card">
  <p>This is the card content.</p>
  <Button onClick={() => console.log('clicked')}>Action</Button>
</Card>
```

### 3. Generic Props

```tsx
// List.tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  loading?: boolean;
}

function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = "No items found",
  loading = false,
}: ListProps<T>) {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (items.length === 0) {
    return <div>{emptyMessage}</div>;
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item, index)}>
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
      <strong>{user.name}</strong> - {user.email}
    </div>
  )}
/>
```

### 4. Props with Discriminated Unions

```tsx
// Notification.tsx
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface BaseNotificationProps {
  type: NotificationType;
  message: string;
  onClose?: () => void;
}

interface SuccessNotification extends BaseNotificationProps {
  type: 'success';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ErrorNotification extends BaseNotificationProps {
  type: 'error';
  retry?: () => void;
}

interface WarningNotification extends BaseNotificationProps {
  type: 'warning';
  confirmText?: string;
  onConfirm?: () => void;
}

interface InfoNotification extends BaseNotificationProps {
  type: 'info';
  duration?: number;
}

type NotificationProps =
  | SuccessNotification
  | ErrorNotification
  | WarningNotification
  | InfoNotification;

const Notification: React.FC<NotificationProps> = (props) => {
  const { type, message, onClose } = props;

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
    }
  };

  const renderActions = () => {
    switch (type) {
      case 'success':
        return props.action ? (
          <Button onClick={props.action.onClick}>
            {props.action.label}
          </Button>
        ) : null;

      case 'error':
        return props.retry ? (
          <Button onClick={props.retry}>Retry</Button>
        ) : null;

      case 'warning':
        return props.onConfirm ? (
          <Button onClick={props.onConfirm}>
            {props.confirmText || 'Confirm'}
          </Button>
        ) : null;

      case 'info':
        return null;
    }
  };

  return (
    <div className={`notification notification-${type}`}>
      <span className="notification-icon">{getIcon()}</span>
      <span className="notification-message">{message}</span>
      <div className="notification-actions">
        {renderActions()}
        {onClose && (
          <button onClick={onClose} className="close-btn">×</button>
        )}
      </div>
    </div>
  );
};

// Usage
<Notification
  type="success"
  message="Data saved successfully!"
  action={{ label: "View", onClick: () => console.log("View clicked") }}
  onClose={() => console.log("Closed")}
/>
```

### 5. Props with Event Handlers

```tsx
// Form.tsx
interface FormProps {
  onSubmit: (data: FormData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

interface FormData {
  name: string;
  email: string;
  age: number;
}

const Form: React.FC<FormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  disabled = false
}) => {
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    email: '',
    age: 18,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'age' ? parseInt(e.target.value) : e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleChange('name')}
          disabled={disabled || loading}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          disabled={disabled || loading}
          required
        />
      </div>

      <div>
        <label htmlFor="age">Age:</label>
        <input
          id="age"
          type="number"
          value={formData.age}
          onChange={handleChange('age')}
          disabled={disabled || loading}
          min={0}
          max={150}
        />
      </div>

      <div>
        <Button type="submit" disabled={disabled || loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
```

## Advanced Props Patterns

### 1. Props with Constraints

```tsx
// Component that requires at least one of two props
interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}

// Ensure at least one is provided using union types
type TogglePropsUnion =
  | (ToggleProps & { checked: boolean })
  | (ToggleProps & { defaultChecked: boolean });

const Toggle: React.FC<TogglePropsUnion> = (props) => {
  // Implementation
};
```

### 2. Props with Polymorphic Components

```tsx
// Polymorphic component that can render as different elements
type PolymorphicProps<Element extends React.ElementType> = {
  as?: Element;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<Element>;

const PolymorphicComponent = <Element extends React.ElementType = 'div'>({
  as,
  children,
  ...props
}: PolymorphicProps<Element>) => {
  const Component = as || 'div';
  return <Component {...props}>{children}</Component>;
};

// Usage
<PolymorphicComponent as="button" onClick={() => {}}>
  Click me
</PolymorphicComponent>

<PolymorphicComponent as="a" href="/link">
  Link
</PolymorphicComponent>
```

### 3. Props with Conditional Rendering

```tsx
interface ConditionalProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const Conditional: React.FC<ConditionalProps> = ({
  condition,
  children,
  fallback = null
}) => {
  return condition ? <>{children}</> : <>{fallback}</>;
};

// Usage
<Conditional condition={user.isLoggedIn} fallback={<LoginForm />}>
  <Dashboard user={user} />
</Conditional>
```

### 4. Props with Context

```tsx
// Theme context
interface Theme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

const ThemeContext = React.createContext<Theme | null>(null);

interface ThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = (): Theme => {
  const theme = React.useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
};

// Component that uses theme
interface ThemedComponentProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const ThemedComponent: React.FC<ThemedComponentProps> = ({
  variant = 'primary',
  children
}) => {
  const theme = useTheme();

  return (
    <div style={{ backgroundColor: theme[variant], color: theme.text }}>
      {children}
    </div>
  );
};
```

## Best Practices for Props

### 1. Use Interface for Complex Props

```tsx
// ✅ Good: Clear interface
interface UserProfileProps {
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  onEdit: (userId: number) => void;
  showEmail?: boolean;
  compact?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onEdit, showEmail = true, compact = false }) => {
  // Implementation
};

// ❌ Avoid: Inline complex types
const UserProfile: React.FC<{
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  onEdit: (userId: number) => void;
  showEmail?: boolean;
  compact?: boolean;
}> = ({ user, onEdit, showEmail = true, compact = false }) => {
  // Implementation
};
```

### 2. Extract Reusable Prop Types

```tsx
// types/common.ts
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface InteractiveProps extends BaseComponentProps {
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  tabIndex?: number;
}

// Usage
interface ButtonProps extends InteractiveProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}
```

### 3. Use Utility Types for Props

```tsx
// Make all props optional except children
type PartialPropsExceptChildren<T extends { children: React.ReactNode }> =
  Partial<Omit<T, 'children'>> & Pick<T, 'children'>;

// Extract props from HTML elements
type InputProps = React.ComponentProps<'input'>;

// Omit certain props
interface CustomInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  onValueChange: (value: string) => void;
}
```

### 4. Validate Props at Runtime (Optional)

```tsx
// For critical components, add runtime validation
const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  // Development-only validation
  if (process.env.NODE_ENV === 'development') {
    if (!user || typeof user.id !== 'number') {
      throw new Error('UserCard: user prop must have a valid id');
    }
  }

  return (
    <div>
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
};
```

### 5. Use Default Props Correctly

```tsx
// ✅ TypeScript way: Default parameters
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  onClick
}) => {
  // Implementation
};

// ❌ Avoid: defaultProps (not type-safe)
const OldButton = ({ variant, size, children, onClick }) => {
  // Implementation
};

OldButton.defaultProps = {
  variant: 'primary',
  size: 'medium',
};
```

## Common Patterns and Anti-Patterns

### Pattern: Props Destructuring

```tsx
// ✅ Good: Destructure with types
interface ComponentProps {
  title: string;
  items: string[];
  onItemClick: (item: string, index: number) => void;
  loading?: boolean;
}

const Component: React.FC<ComponentProps> = ({
  title,
  items,
  onItemClick,
  loading = false,
}) => {
  // Implementation
};

// ❌ Avoid: Destructure without types (loses type safety)
const Component = ({ title, items, onItemClick, loading }) => {
  // Implementation
};
```

### Anti-Pattern: Any Props

```tsx
// ❌ Avoid: any props
interface BadComponentProps {
  data: any;
  config: any;
  callback: any;
}

// ✅ Better: Specific types
interface GoodComponentProps {
  data: User[];
  config: {
    theme: 'light' | 'dark';
    itemsPerPage: number;
  };
  callback: (result: ApiResponse) => void;
}
```

### Pattern: Props Spreading

```tsx
// ✅ Safe props spreading
interface InputProps extends React.ComponentProps<'input'> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  ...inputProps // Safe because we extend ComponentProps
}) => {
  return (
    <div>
      <label>{label}</label>
      <input {...inputProps} />
      {error && <span className="error">{error}</span>}
    </div>
  );
};
```

## TypeScript + React Tooling

### 1. ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error"
  }
}
```

### 2. Path Mapping in tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/components/*": ["components/*"],
      "@/types/*": ["types/*"],
      "@/utils/*": ["utils/*"],
      "@/hooks/*": ["hooks/*"],
      "@/assets/*": ["assets/*"]
    }
  }
}
```

### 3. Declaration Files

```typescript
// src/types/images.d.ts
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";

// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_API_URL: string;
    REACT_APP_VERSION: string;
  }
}
```

## Summary

Setting up TypeScript with React and properly typing props is essential for building maintainable, type-safe React applications. Key principles:

### Setup:
- Use modern TypeScript configuration with strict mode
- Configure path mapping for clean imports
- Set up proper tooling (ESLint, testing)

### Props:
- Define clear interfaces for component props
- Use discriminated unions for complex prop patterns
- Leverage utility types for reusable prop definitions
- Prefer default parameters over defaultProps

### Best Practices:
- Extract reusable types to separate files
- Use generic props for flexible components
- Validate props in development mode when necessary
- Keep prop interfaces focused and well-documented

### Common Patterns:
- Base component props interfaces
- Polymorphic components with `as` prop
- Props with event handlers and callbacks
- Conditional props using union types

TypeScript transforms React development by providing compile-time type checking, better IDE support, and preventing runtime errors. Proper props typing is the foundation of this type safety, ensuring components are used correctly throughout your application.
