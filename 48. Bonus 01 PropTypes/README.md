# Bonus 01: PropTypes vs TypeScript

This bonus section explores React PropTypes, a runtime type checking library, and compares it with TypeScript's compile-time type checking. While TypeScript largely replaces the need for PropTypes, understanding both approaches helps in migrating legacy codebases and making informed architectural decisions.

## What are PropTypes?

PropTypes is a React library that provides runtime type checking for component props. It was the primary way to add type safety to React components before TypeScript became popular.

```javascript
// With PropTypes
import React from 'react';
import PropTypes from 'prop-types';

function UserCard({ user, onEdit, isLoading }) {
  return (
    <div className="user-card">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <button onClick={() => onEdit(user.id)}>Edit</button>
        </>
      )}
    </div>
  );
}

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

UserCard.defaultProps = {
  isLoading: false,
};
```

## PropTypes API

### Basic Types

```javascript
import PropTypes from 'prop-types';

MyComponent.propTypes = {
  // Primitive types
  name: PropTypes.string,
  age: PropTypes.number,
  isActive: PropTypes.bool,
  
  // Required versions
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  
  // Special types
  children: PropTypes.node,
  style: PropTypes.object,
  className: PropTypes.string,
};
```

### Complex Types

```javascript
MyComponent.propTypes = {
  // Arrays
  tags: PropTypes.arrayOf(PropTypes.string),
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })),
  
  // Objects
  config: PropTypes.shape({
    theme: PropTypes.oneOf(['light', 'dark']),
    language: PropTypes.string,
  }),
  
  // Union types
  status: PropTypes.oneOf(['idle', 'loading', 'success', 'error']),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  
  // Functions
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  
  // Custom validators
  email: function(props, propName, componentName) {
    const value = props[propName];
    if (value && !/\S+@\S+\.\S+/.test(value)) {
      return new Error(
        `Invalid prop ${propName} supplied to ${componentName}. Expected valid email.`
      );
    }
  },
};
```

### Advanced Patterns

```javascript
// Instance type checking
MyComponent.propTypes = {
  date: PropTypes.instanceOf(Date),
  element: PropTypes.instanceOf(Element),
};

// Custom validation functions
function percentage(props, propName, componentName) {
  const value = props[propName];
  if (value < 0 || value > 100) {
    return new Error(
      `${propName} in ${componentName} must be between 0 and 100`
    );
  }
}

MyComponent.propTypes = {
  progress: percentage,
};

// Conditional validation
MyComponent.propTypes = {
  value: function(props, propName, componentName) {
    const value = props[propName];
    const type = props.type;
    
    if (type === 'number' && typeof value !== 'number') {
      return new Error(`${propName} must be a number when type is "number"`);
    }
    
    if (type === 'text' && typeof value !== 'string') {
      return new Error(`${propName} must be a string when type is "text"`);
    }
  },
};
```

## TypeScript vs PropTypes

### Same Component, Different Approaches

```typescript
// With TypeScript
import React from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserCardProps {
  user: User;
  onEdit: (userId: number) => void;
  isLoading?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onEdit, 
  isLoading = false 
}) => {
  return (
    <div className="user-card">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <button onClick={() => onEdit(user.id)}>Edit</button>
        </>
      )}
    </div>
  );
};

export default UserCard;
```

```javascript
// With PropTypes
import React from 'react';
import PropTypes from 'prop-types';

const UserCard = ({ user, onEdit, isLoading }) => {
  return (
    <div className="user-card">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <button onClick={() => onEdit(user.id)}>Edit</button>
        </>
      )}
    </div>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

UserCard.defaultProps = {
  isLoading: false,
};

export default UserCard;
```

## Key Differences

### 1. When Errors Occur

```typescript
// TypeScript: Compile-time errors
const user = { name: "John" }; // Missing id and email
<UserCard user={user} onEdit={() => {}} />; // TypeScript error!

// PropTypes: Runtime warnings (only in development)
const user = { name: "John" };
<UserCard user={user} onEdit={() => {}} />; // Console warning in dev mode
```

### 2. Performance Impact

```typescript
// TypeScript: Zero runtime overhead
// Types are erased during compilation
const MyComponent: React.FC<Props> = ({ data }) => {
  return <div>{data.name}</div>;
};

// PropTypes: Runtime validation overhead
MyComponent.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};
```

### 3. Developer Experience

```typescript
// TypeScript: Rich IDE support
interface Props {
  user: {
    id: number;
    name: string;
    email: string;
  };
  onEdit: (id: number) => void;
}

const MyComponent: React.FC<Props> = ({ user, onEdit }) => {
  // IntelliSense shows user.id, user.name, user.email
  // Auto-completion for onEdit parameter
  return <button onClick={() => onEdit(user.id)}>Edit</button>;
};

// PropTypes: Limited IDE support
const MyComponent = ({ user, onEdit }) => {
  // No IntelliSense for user properties
  // No type checking for onEdit calls
  return <button onClick={() => onEdit(user.id)}>Edit</button>;
};
```

## Migration Strategies

### 1. Gradual Migration

```typescript
// Step 1: Add TypeScript with PropTypes still in place
import React from 'react';
import PropTypes from 'prop-types';

interface UserCardProps {
  user: {
    id: number;
    name: string;
    email: string;
  };
  onEdit: (userId: number) => void;
  isLoading?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, isLoading = false }) => {
  // TypeScript provides compile-time checking
  return (
    <div className="user-card">
      <h3>{user.name}</h3> {/* TypeScript knows user has name property */}
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
};

// Keep PropTypes for runtime validation during migration
UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default UserCard;
```

```typescript
// Step 2: Remove PropTypes once migration is complete
import React from 'react';

interface UserCardProps {
  user: {
    id: number;
    name: string;
    email: string;
  };
  onEdit: (userId: number) => void;
  isLoading?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, isLoading = false }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
};

export default UserCard;
```

### 2. Converting PropTypes to TypeScript

```javascript
// Original PropTypes
MyComponent.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
  isActive: PropTypes.bool,
  tags: PropTypes.arrayOf(PropTypes.string),
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }),
  status: PropTypes.oneOf(['idle', 'loading', 'success']),
  onChange: PropTypes.func,
  children: PropTypes.node,
};
```

```typescript
// Converted to TypeScript
interface MyComponentProps {
  name: string;
  age?: number;
  isActive?: boolean;
  tags?: string[];
  user: {
    id: number;
    name: string;
  };
  status?: 'idle' | 'loading' | 'success';
  onChange?: () => void;
  children?: React.ReactNode;
}
```

### 3. Handling Complex PropTypes

```javascript
// Complex PropTypes
Component.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      value: PropTypes.any,
    }),
  ]),
  callback: PropTypes.func,
  style: PropTypes.object,
};
```

```typescript
// TypeScript equivalent
interface ComponentProps {
  data: string | number | {
    id: string;
    value: any;
  };
  callback?: () => void;
  style?: React.CSSProperties; // More specific than object
}
```

## When to Use PropTypes with TypeScript

### 1. Runtime Validation for External Data

```typescript
// When receiving data from external APIs
import PropTypes from 'prop-types';

interface ApiComponentProps {
  userData: unknown; // External data
}

const ApiComponent: React.FC<ApiComponentProps> = ({ userData }) => {
  // TypeScript can't validate runtime data
  return <div>{userData.name}</div>; // Potential runtime error
};

// Add PropTypes for runtime validation
ApiComponent.propTypes = {
  userData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
  }).isRequired,
};
```

### 2. Library Authors

```typescript
// When creating a library that accepts any React node
import PropTypes from 'prop-types';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
}

const Modal: React.FC<ModalProps> = ({ children, isOpen }) => {
  // Implementation
};

// PropTypes ensures runtime validation for library users
Modal.propTypes = {
  children: PropTypes.node,
  isOpen: PropTypes.bool.isRequired,
};
```

### 3. Legacy Codebases

```typescript
// During gradual migration
const LegacyComponent = ({ data }) => {
  // Old code that expects certain data shape
  return <div>{data.items.map(item => item.name)}</div>;
};

// Add PropTypes to catch issues during migration
LegacyComponent.propTypes = {
  data: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};
```

## Advanced PropTypes Patterns

### 1. Custom Validators

```javascript
import PropTypes from 'prop-types';

function emailValidator(props, propName, componentName) {
  const value = props[propName];
  
  if (!value) return; // Allow empty values
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return new Error(
      `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected valid email address.`
    );
  }
}

function rangeValidator(min, max) {
  return function(props, propName, componentName) {
    const value = props[propName];
    
    if (typeof value !== 'number' || value < min || value > max) {
      return new Error(
        `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected number between ${min} and ${max}.`
      );
    }
  };
}

MyComponent.propTypes = {
  email: emailValidator,
  percentage: rangeValidator(0, 100),
};
```

### 2. Conditional Validation

```javascript
function conditionalValidator(props, propName, componentName) {
  const value = props[propName];
  const type = props.type;
  
  if (type === 'email' && typeof value !== 'string') {
    return new Error(`${propName} must be string when type is email`);
  }
  
  if (type === 'number' && typeof value !== 'number') {
    return new Error(`${propName} must be number when type is number`);
  }
}

MyComponent.propTypes = {
  value: conditionalValidator,
  type: PropTypes.oneOf(['email', 'number']).isRequired,
};
```

### 3. Array Validation

```javascript
MyComponent.propTypes = {
  // Simple array
  tags: PropTypes.arrayOf(PropTypes.string),
  
  // Complex array
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      roles: PropTypes.arrayOf(
        PropTypes.oneOf(['admin', 'user', 'moderator'])
      ),
    })
  ),
  
  // Array with custom validation
  scores: PropTypes.arrayOf(function(propValue, key, componentName, location, propFullName) {
    if (typeof propValue !== 'number' || propValue < 0 || propValue > 100) {
      return new Error(
        `Invalid ${propFullName} supplied to ${componentName}. Score must be between 0 and 100.`
      );
    }
  }),
};
```

## TypeScript-Only Alternatives

### 1. Assertion Functions

```typescript
// TypeScript assertion functions (3.7+)
function assertIsUser(value: unknown): asserts value is User {
  if (!value || typeof value !== 'object') {
    throw new Error('Value must be an object');
  }
  
  const obj = value as Record<string, unknown>;
  if (typeof obj.id !== 'number' || typeof obj.name !== 'string') {
    throw new Error('Invalid user object');
  }
}

const UserCard: React.FC<{ userData: unknown }> = ({ userData }) => {
  assertIsUser(userData);
  // TypeScript now knows userData is User
  return <div>{userData.name}</div>;
};
```

### 2. Type Guards

```typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as User).id === 'number' &&
    typeof (value as User).name === 'string'
  );
}

const UserCard: React.FC<{ userData: unknown }> = ({ userData }) => {
  if (!isUser(userData)) {
    return <div>Invalid user data</div>;
  }
  
  return <div>{userData.name}</div>;
};
```

### 3. Schema Validation Libraries

```typescript
// Using Zod for runtime validation
import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof userSchema>;

const UserCard: React.FC<{ userData: unknown }> = ({ userData }) => {
  const result = userSchema.safeParse(userData);
  
  if (!result.success) {
    return <div>Invalid user data</div>;
  }
  
  const user = result.data;
  return <div>{user.name}</div>;
};
```

## Best Practices

### 1. Prefer TypeScript Over PropTypes

```typescript
// ✅ Recommended: TypeScript interfaces
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary' }) => {
  // Implementation
};

// ❌ Avoid: PropTypes when TypeScript is available
const Button = ({ children, onClick, variant }) => {
  // Implementation
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
};
```

### 2. Use Both During Migration

```typescript
// During migration, use both for safety
interface ComponentProps {
  data: User[];
}

const Component: React.FC<ComponentProps> = ({ data }) => {
  // TypeScript provides compile-time safety
  return <div>{data.map(user => user.name)}</div>;
};

// PropTypes provide runtime safety during migration
Component.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};
```

### 3. Remove PropTypes After Migration

```typescript
// ✅ After full migration
interface ComponentProps {
  data: User[];
}

const Component: React.FC<ComponentProps> = ({ data }) => {
  return <div>{data.map(user => user.name)}</div>;
};

// No PropTypes needed - TypeScript handles everything
```

## Performance Considerations

### Bundle Size Impact

```typescript
// PropTypes adds ~20KB to bundle (development)
// Zero impact in production (automatically stripped)
import PropTypes from 'prop-types';

// TypeScript: Zero runtime bundle impact
interface Props {
  name: string;
}
```

### Development vs Production

```javascript
// PropTypes only run in development
if (process.env.NODE_ENV !== 'production') {
  MyComponent.propTypes = {
    // Validation only in development
  };
}

// TypeScript: Always provides type safety
interface Props {
  // Type checking in all environments
}
```

## Summary

PropTypes and TypeScript serve similar purposes but with different approaches:

- **PropTypes**: Runtime validation, development-only warnings, adds bundle size
- **TypeScript**: Compile-time checking, zero runtime overhead, better DX

### When to Use Each:

**Use TypeScript:**
- New projects
- Full type safety is needed
- Better developer experience required
- Performance is critical

**Use PropTypes:**
- Legacy JavaScript codebases
- Runtime validation is required
- External data validation
- Library development (additional safety)

**Use Both:**
- During migration from JavaScript to TypeScript
- Extra runtime safety is needed alongside compile-time checks

### Migration Path:

1. **Start with TypeScript** for new projects
2. **Add PropTypes** to existing JavaScript code for safety
3. **Migrate to TypeScript** gradually
4. **Remove PropTypes** once TypeScript coverage is complete

TypeScript largely replaces PropTypes for modern React development, providing superior type safety, better performance, and enhanced developer experience. However, PropTypes still have their place in specific scenarios requiring runtime validation.
