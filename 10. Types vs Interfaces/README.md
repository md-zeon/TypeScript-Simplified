# Types vs Interfaces in TypeScript

TypeScript provides two primary ways to define custom types: `type` aliases and `interface` declarations. While they often seem interchangeable, they have different capabilities and use cases. Understanding when to use each is crucial for writing clean, maintainable TypeScript code.

## Basic Syntax

### Type Aliases

```typescript
// Basic type alias
type UserId = string;

// Object type alias
type User = {
	id: string;
	name: string;
	email: string;
};

// Union type alias
type Status = "active" | "inactive" | "pending";

// Function type alias
type Callback = (data: any) => void;
```

### Interfaces

```typescript
// Basic interface
interface User {
	id: string;
	name: string;
	email: string;
}

// Interface with method
interface Repository {
	findById(id: string): User | null;
	save(user: User): void;
	delete(id: string): boolean;
}
```

## Key Differences

### 1. Declaration Merging

Interfaces support declaration merging, types do not:

```typescript
// Interface declaration merging
interface User {
	name: string;
}

interface User {
	email: string;
}

// User now has both name and email properties
const user: User = {
	name: "John",
	email: "john@example.com",
};

// Type alias merging (NOT ALLOWED)
type Person = {
	name: string;
};

type Person = {
	email: string;
}; // Error: Duplicate identifier 'Person'
```

### 2. Extending Types

Both can extend other types, but with different syntax:

```typescript
// Interface extending interface
interface Animal {
	name: string;
}

interface Dog extends Animal {
	breed: string;
}

// Type alias extending type
type Animal = {
	name: string;
};

type Dog = Animal & {
	breed: string;
};

// Interface extending type (allowed)
type BaseEntity = {
	id: string;
	createdAt: Date;
};

interface User extends BaseEntity {
	name: string;
	email: string;
}

// Type alias extending interface (allowed)
interface Shape {
	area(): number;
}

type Circle = Shape & {
	radius: number;
};
```

### 3. Union and Intersection Types

Type aliases excel at union and intersection types:

```typescript
// Union types (types only)
type StringOrNumber = string | number;
type UserOrAdmin = User | Admin;

// Intersection types (types only)
type NamedEntity = { name: string };
type TimestampedEntity = { createdAt: Date; updatedAt: Date };
type NamedTimestampedEntity = NamedEntity & TimestampedEntity;

// Interfaces cannot directly define unions
interface User {
	// Cannot do: type: "user" | "admin"
}
```

### 4. Computed Properties

Type aliases support computed property names:

```typescript
type DynamicKeys = {
	[key: string]: string;
};

const translations: DynamicKeys = {
	hello: "Hola",
	goodbye: "Adiós",
};

// Interfaces support index signatures
interface Dictionary {
	[key: string]: string;
}
```

### 5. Tuple Types

Type aliases are better for tuple types:

```typescript
// Tuple type (type alias preferred)
type Coordinate = [number, number];
type RGBColor = [number, number, number];

// Interface for tuple (awkward)
interface CoordinateInterface {
	0: number;
	1: number;
	length: 2;
}
```

## When to Use Interfaces

### 1. Object-Oriented Programming

```typescript
interface Vehicle {
	start(): void;
	stop(): void;
	getSpeed(): number;
}

interface Car extends Vehicle {
	brand: string;
	model: string;
	drive(): void;
}

class Sedan implements Car {
	brand: string;
	model: string;

	constructor(brand: string, model: string) {
		this.brand = brand;
		this.model = model;
	}

	start(): void {
		console.log("Engine started");
	}

	stop(): void {
		console.log("Engine stopped");
	}

	getSpeed(): number {
		return 0; // Simplified
	}

	drive(): void {
		console.log("Driving...");
	}
}
```

### 2. Public APIs

```typescript
// Good for library authors
interface ApiClient {
	get<T>(url: string): Promise<T>;
	post<T>(url: string, data: any): Promise<T>;
	put<T>(url: string, data: any): Promise<T>;
	delete(url: string): Promise<void>;
}

// Declaration merging allows extending
interface ApiClient {
	// Additional methods can be added by consumers
	setAuthToken(token: string): void;
}
```

### 3. Complex Object Types

```typescript
interface DatabaseConfig {
	host: string;
	port: number;
	ssl: boolean;
	poolSize: number;
	credentials: {
		username: string;
		password: string;
	};
	retry: {
		maxAttempts: number;
		delay: number;
	};
}
```

## When to Use Type Aliases

### 1. Union Types

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type ApiResponse<T> =
	| {
			data: T;
			status: number;
			message: string;
	  }
	| {
			error: string;
			status: number;
	  };

type UserRole = "admin" | "user" | "moderator";
type Permission = "read" | "write" | "delete";
type UserPermissions = {
	[key in UserRole]: Permission[];
};
```

### 2. Primitive Type Aliases

```typescript
type UserId = string;
type Timestamp = number;
type Email = string;
type Url = string;

// These can be used for better type safety
function sendEmail(to: Email, subject: string, body: string): void {
	// Implementation
}

const userEmail: Email = "user@example.com";
sendEmail(userEmail, "Welcome", "Hello!");
```

### 3. Complex Type Operations

```typescript
type Optional<T> = T | undefined;
type Nullable<T> = T | null;

// Utility types
type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type FunctionKeys<T> = {
	[K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
```

### 4. Mapped Types

```typescript
type ReadonlyUser = {
	readonly [K in keyof User]: User[K];
};

type OptionalUser = {
	[K in keyof User]?: User[K];
};

type UserGetters = {
	[K in keyof User as `get${Capitalize<string & K>}`]: () => User[K];
};
```

## Best Practices

### Prefer Interfaces for Object Shapes

```typescript
// Good: Use interface for object contracts
interface UserService {
	create(user: User): Promise<User>;
	findById(id: string): Promise<User | null>;
	update(id: string, user: Partial<User>): Promise<User>;
	delete(id: string): Promise<void>;
}

// Less ideal: Type alias for the same purpose
type UserServiceType = {
	create(user: User): Promise<User>;
	findById(id: string): Promise<User | null>;
	update(id: string, user: Partial<User>): Promise<User>;
	delete(id: string): Promise<void>;
};
```

### Use Type Aliases for Unions and Primitives

```typescript
// Good: Type aliases for domain-specific types
type OrderStatus = "pending" | "processing" | "shipped" | "delivered";
type ProductId = string;
type Price = number;

// Good: Type aliases for complex types
type ValidationResult<T> = { success: true; data: T } | { success: false; errors: string[] };
```

### Combine Both When Appropriate

```typescript
// Interface for the base shape
interface BaseEntity {
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

// Type alias for variations
type CreatableEntity = Omit<BaseEntity, "id" | "createdAt" | "updatedAt">;
type UpdatableEntity = Partial<Omit<BaseEntity, "id" | "createdAt">>;
```

### Consider Declaration Merging Needs

```typescript
// Use interface if declaration merging is needed
interface GlobalConfig {
	apiUrl: string;
}

interface GlobalConfig {
	timeout: number; // Merged with previous declaration
}

// Use type alias if no merging is needed
type AppConfig = {
	apiUrl: string;
	timeout: number;
};
```

## Advanced Patterns

### Hybrid Approach

```typescript
// Define base interface
interface Shape {
	area(): number;
}

// Use type aliases for specific shapes
type Circle = Shape & {
	kind: "circle";
	radius: number;
};

type Rectangle = Shape & {
	kind: "rectangle";
	width: number;
	height: number;
};

type Triangle = Shape & {
	kind: "triangle";
	base: number;
	height: number;
};

// Union type for all shapes
type GeometricShape = Circle | Rectangle | Triangle;

// Discriminated union pattern
function calculateArea(shape: GeometricShape): number {
	switch (shape.kind) {
		case "circle":
			return Math.PI * shape.radius * shape.radius;
		case "rectangle":
			return shape.width * shape.height;
		case "triangle":
			return (shape.base * shape.height) / 2;
	}
}
```

### Generic Constraints

```typescript
// Interface with generics
interface Repository<T extends { id: string }> {
	findById(id: string): Promise<T | null>;
	save(entity: T): Promise<T>;
	delete(id: string): Promise<void>;
}

// Type alias with generics
type ApiResponse<T> =
	| {
			data: T;
			status: "success";
	  }
	| {
			error: string;
			status: "error";
	  };
```

### Conditional Types

```typescript
// Type aliases work well with conditional types
type IsArray<T> = T extends any[] ? true : false;

type ElementType<T> = T extends (infer U)[] ? U : never;

type FunctionReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
```

## Migration Between Types and Interfaces

### Interface to Type Alias

```typescript
// Original interface
interface User {
	name: string;
	email: string;
}

// Convert to type alias
type User = {
	name: string;
	email: string;
};
```

### Type Alias to Interface

```typescript
// Original type alias
type User = {
	name: string;
	email: string;
};

// Convert to interface
interface User {
	name: string;
	email: string;
}
```

## Tooling and Linting

### TypeScript ESLint Rules

```json
{
	"@typescript-eslint/consistent-type-definitions": ["error", "interface"],
	"@typescript-eslint/no-type-alias": "off",
	"@typescript-eslint/prefer-interface": "off"
}
```

### When to Use Each

- **Use `interface`**: For object shapes, public APIs, declaration merging
- **Use `type`**: For unions, primitives, complex type operations, mapped types
- **Use both**: When combining the strengths of each approach

## Summary

- **Interfaces** are better for object-oriented programming and declaration merging
- **Type aliases** excel at union types, primitives, and complex type operations
- **Choose based on use case**: Interfaces for contracts, types for flexibility
- **Combine both** when it makes sense for your codebase
- **Consistency matters**: Pick one approach and stick to it within a codebase

Understanding the differences between types and interfaces allows you to write more expressive and maintainable TypeScript code.
