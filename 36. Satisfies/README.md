# Satisfies Operator in TypeScript

The `satisfies` operator, introduced in TypeScript 4.9, allows you to check that a value satisfies a given type without changing its inferred type. Unlike type assertions (`as`), `satisfies` preserves the most specific type information while ensuring type safety. It's particularly useful for maintaining literal types, validating object shapes, and working with discriminated unions.

## Basic Syntax

```typescript
// Basic usage
type Colors = "red" | "green" | "blue";
const myColor = "red" satisfies Colors;

// The inferred type of myColor is "red" (literal type)
// But TypeScript ensures it satisfies the Colors union

// Without satisfies
const myColor2: Colors = "red";
// myColor2 has type Colors, not the literal "red"

// With satisfies
const myColor3 = "red" satisfies Colors;
// myColor3 has type "red" but is checked against Colors
```

## How Satisfies Works

The `satisfies` operator performs a type check but doesn't widen the type:

```typescript
// Type checking without widening
const config = {
	apiUrl: "https://api.example.com",
	timeout: 5000,
	retries: 3,
} satisfies {
	apiUrl: string;
	timeout: number;
	retries: number;
};

// Inferred type maintains literal values
// config.apiUrl is "https://api.example.com" (literal)
// config.timeout is 5000 (literal)
// config.retries is 3 (literal)

// Without satisfies, these would be widened to string/number
const config2 = {
	apiUrl: "https://api.example.com",
	timeout: 5000,
	retries: 3,
};
// config2.apiUrl is string, config2.timeout is number
```

## Key Differences from Type Assertions

```typescript
// Type assertion (as) - changes the type
const value1 = "hello" as string; // type is string
const value2 = { x: 1, y: 2 } as { x: number; y: number }; // type is { x: number; y: number }

// Satisfies - preserves inferred type
const value3 = "hello" satisfies string; // type is "hello" (literal)
const value4 = { x: 1, y: 2 } satisfies { x: number; y: number }; // type is { x: 1, y: 2 } (literal properties)
```

## Common Use Cases

### 1. Maintaining Literal Types

```typescript
type Direction = "north" | "south" | "east" | "west";

const directions = {
	primary: "north",
	secondary: "east",
	fallback: "south",
} satisfies Record<string, Direction>;

// directions.primary has type "north" (not Direction)
// directions.secondary has type "east" (not Direction)
// This enables better IntelliSense and type safety
```

### 2. Object Shape Validation

```typescript
interface User {
	id: number;
	name: string;
	role: "admin" | "user";
}

const users = [
	{ id: 1, name: "Alice", role: "admin" },
	{ id: 2, name: "Bob", role: "user" },
	{ id: 3, name: "Charlie", role: "user" },
] satisfies User[];

// Each user maintains its literal property values
// users[0].role is "admin" (literal), not "admin" | "user"
```

### 3. Configuration Objects

```typescript
type Config = {
	api: {
		baseUrl: string;
		timeout: number;
	};
	features: {
		darkMode: boolean;
		notifications: boolean;
	};
};

const appConfig = {
	api: {
		baseUrl: "https://api.example.com",
		timeout: 5000,
	},
	features: {
		darkMode: true,
		notifications: false,
	},
} satisfies Config;

// appConfig.api.baseUrl is "https://api.example.com" (literal)
// appConfig.features.darkMode is true (literal)
```

### 4. Event Handlers

```typescript
type EventHandlers = {
	onClick: (event: MouseEvent) => void;
	onChange: (event: Event) => void;
	onSubmit: (event: SubmitEvent) => void;
};

const handlers = {
	onClick: (event) => console.log("Clicked", event.clientX),
	onChange: (event) => console.log("Changed", event.type),
	onSubmit: (event) => {
		event.preventDefault();
		console.log("Submitted");
	},
} satisfies EventHandlers;

// handlers.onClick has the exact function signature
// TypeScript knows the parameter types precisely
```

## Advanced Patterns

### Discriminated Unions

```typescript
type Shape =
	| { kind: "circle"; radius: number }
	| { kind: "rectangle"; width: number; height: number }
	| { kind: "triangle"; base: number; height: number };

const shapes = [
	{ kind: "circle", radius: 5 },
	{ kind: "rectangle", width: 10, height: 20 },
	{ kind: "triangle", base: 6, height: 8 },
] satisfies Shape[];

// shapes[0].kind is "circle" (literal)
// shapes[1].kind is "rectangle" (literal)
// This enables better type narrowing in switch statements
```

### Function Overloads

```typescript
type MathOperation = {
	add: (a: number, b: number) => number;
	multiply: (a: number, b: number) => number;
	divide: (a: number, b: number) => number;
};

const mathOps = {
	add: (a, b) => a + b,
	multiply: (a, b) => a * b,
	divide: (a, b) => a / b,
} satisfies MathOperation;

// TypeScript infers the parameter types from the satisfies constraint
// mathOps.add has type (a: number, b: number) => number
```

### Generic Constraints

```typescript
type Dictionary<T> = Record<string, T>;

const numberDict = {
	one: 1,
	two: 2,
	three: 3,
} satisfies Dictionary<number>;

// numberDict.one is 1 (literal), not number
// numberDict.two is 2 (literal), not number

const stringDict = {
	greeting: "hello",
	farewell: "goodbye",
} satisfies Dictionary<string>;

// stringDict.greeting is "hello" (literal)
```

### API Response Types

```typescript
interface ApiResponse<T> {
	data: T;
	status: number;
	message: string;
}

type UserResponse = ApiResponse<{
	id: number;
	name: string;
	email: string;
}>;

const mockResponse = {
	data: {
		id: 1,
		name: "John Doe",
		email: "john@example.com",
	},
	status: 200,
	message: "Success",
} satisfies UserResponse;

// mockResponse.data.id is 1 (literal)
// mockResponse.status is 200 (literal)
// mockResponse.message is "Success" (literal)
```

## Satisfies with Utility Types

### Record Types

```typescript
type EventMap = Record<string, (...args: any[]) => void>;

const events = {
	click: (x: number, y: number) => console.log(`Clicked at ${x}, ${y}`),
	hover: (element: string) => console.log(`Hovered ${element}`),
	scroll: (delta: number) => console.log(`Scrolled ${delta}`),
} satisfies EventMap;

// events.click has precise parameter types: (x: number, y: number) => void
// events.hover has precise parameter types: (element: string) => void
```

### Partial and Required

```typescript
interface FullConfig {
	apiUrl: string;
	timeout: number;
	retries: number;
	debug: boolean;
}

type OptionalConfig = Partial<FullConfig>;

const defaultConfig = {
	apiUrl: "https://api.example.com",
	timeout: 5000,
} satisfies OptionalConfig;

// defaultConfig.apiUrl is "https://api.example.com" (literal)
// defaultConfig.timeout is 5000 (literal)
// Other properties are undefined
```

### Pick and Omit

```typescript
interface Product {
	id: number;
	name: string;
	price: number;
	category: string;
	inStock: boolean;
}

type ProductSummary = Pick<Product, "id" | "name" | "price">;

const product = {
	id: 1,
	name: "Laptop",
	price: 999,
} satisfies ProductSummary;

// product.id is 1 (literal)
// product.name is "Laptop" (literal)
// product.price is 999 (literal)
```

## Error Prevention

### Catching Missing Properties

```typescript
type RequiredFields = {
	name: string;
	email: string;
	age: number;
};

const user = {
	name: "Alice",
	email: "alice@example.com",
	// Missing age property
} satisfies RequiredFields; // TypeScript error: Property 'age' is missing

// Fix by adding the missing property
const validUser = {
	name: "Alice",
	email: "alice@example.com",
	age: 30,
} satisfies RequiredFields; // OK
```

### Catching Extra Properties

```typescript
type StrictShape = {
	x: number;
	y: number;
};

const point = {
	x: 10,
	y: 20,
	z: 30, // Extra property
} satisfies StrictShape; // TypeScript error: Object literal may only specify known properties

// For objects that might have extra properties, use a different approach
const loosePoint = {
	x: 10,
	y: 20,
	z: 30,
} satisfies StrictShape & Record<string, unknown>; // OK
```

### Type Mismatches

```typescript
type Color = "red" | "green" | "blue";

const myColor = "yellow" satisfies Color; // TypeScript error: "yellow" does not satisfy Color

// Fix with a valid color
const validColor = "red" satisfies Color; // OK
```

## Best Practices

### 1. Use Satisfies for Configuration Objects

```typescript
// Good: Maintains literal types for better IntelliSense
const routes = {
	home: "/",
	about: "/about",
	contact: "/contact",
} satisfies Record<string, string>;

// routes.home is "/" (literal), not string
```

### 2. Combine with Const Assertions

```typescript
// For maximum type specificity
const config = {
	theme: "dark",
	language: "en",
} as const satisfies {
	theme: "dark" | "light";
	language: "en" | "es" | "fr";
};

// config.theme is "dark" (literal)
// config.language is "en" (literal)
```

### 3. Use for API Contracts

```typescript
// Ensure API responses match expected shape
type LoginResponse = {
	success: boolean;
	user?: {
		id: number;
		name: string;
	};
	error?: string;
};

const mockLoginSuccess = {
	success: true,
	user: {
		id: 1,
		name: "John",
	},
} satisfies LoginResponse;

const mockLoginFailure = {
	success: false,
	error: "Invalid credentials",
} satisfies LoginResponse;
```

### 4. Validate Complex Objects

```typescript
type ValidationResult = {
	isValid: boolean;
	errors: string[];
	data?: unknown;
};

function validateUser(input: unknown): input is User {
	// Validation logic here
	return true;
}

const validation = {
	isValid: true,
	errors: [],
	data: { id: 1, name: "John", role: "admin" },
} satisfies ValidationResult;

// If validateUser(validation.data) returns true,
// then validation.data is treated as User with literal types
```

## Common Patterns

### Theme Configuration

```typescript
type Theme = {
	colors: {
		primary: string;
		secondary: string;
		background: string;
	};
	spacing: {
		small: number;
		medium: number;
		large: number;
	};
};

const lightTheme = {
	colors: {
		primary: "#007bff",
		secondary: "#6c757d",
		background: "#ffffff",
	},
	spacing: {
		small: 8,
		medium: 16,
		large: 24,
	},
} satisfies Theme;

// All color and spacing values maintain their literal types
```

### Form Validation

```typescript
type FormRules = {
	required: boolean;
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
};

type FormConfig = Record<string, FormRules>;

const userFormConfig = {
	username: {
		required: true,
		minLength: 3,
		maxLength: 20,
	},
	email: {
		required: true,
		pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	},
	age: {
		required: false,
		minLength: 1, // This would be an error - age shouldn't have minLength
	},
} satisfies FormConfig;

// TypeScript catches the logical error with age field
```

### State Management

```typescript
type AppState = {
	user: {
		id: number;
		name: string;
		preferences: {
			theme: "light" | "dark";
			language: string;
		};
	} | null;
	loading: boolean;
	error: string | null;
};

const initialState = {
	user: null,
	loading: false,
	error: null,
} satisfies AppState;

// initialState.loading is false (literal)
// initialState.error is null (literal)
```

## Migration from Type Assertions

```typescript
// Old way with type assertions
const config1 = {
	apiUrl: "https://api.example.com",
	timeout: 5000,
} as const;

// config1.apiUrl is "https://api.example.com" (literal)
// config1.timeout is 5000 (literal)

// New way with satisfies (more explicit about the contract)
type ConfigShape = {
	apiUrl: string;
	timeout: number;
};

const config2 = {
	apiUrl: "https://api.example.com",
	timeout: 5000,
} satisfies ConfigShape;

// Same result, but clearer intent
```

## Summary

The `satisfies` operator is a powerful TypeScript feature that validates type compatibility while preserving the most specific type information. Key benefits:

- **Type Safety**: Ensures values match expected types without widening
- **Literal Preservation**: Maintains literal types for better IntelliSense
- **Error Detection**: Catches type mismatches and missing properties at compile time
- **Flexibility**: Works with complex object shapes and union types

Use `satisfies` when you want to:

- Validate object shapes without losing type specificity
- Maintain literal types in configuration objects
- Ensure API responses match expected contracts
- Create type-safe constants and enums

The operator is particularly valuable for configuration objects, API responses, theme definitions, and any scenario where you need both type safety and precise type information.
