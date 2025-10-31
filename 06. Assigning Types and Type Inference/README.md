# Assigning Types and Type Inference

TypeScript provides powerful type system features that allow you to explicitly assign types to variables, function parameters, and return values, while also automatically inferring types when possible. This section covers both explicit type assignment and TypeScript's type inference capabilities.

## Explicit Type Assignment

### Variable Type Annotations

You can explicitly specify types using type annotations:

```typescript
// Primitive types
let age: number = 25;
let name: string = "John";
let isActive: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Alice", "Bob", "Charlie"];

// Objects
let person: { name: string; age: number } = {
	name: "John",
	age: 30,
};

// Union types
let id: string | number = "ABC123";
id = 12345; // Also valid

// Any type (use sparingly)
let data: any = "Hello";
data = 42;
data = { key: "value" };
```

### Function Type Annotations

Functions can have typed parameters and return values:

```typescript
// Function with typed parameters and return type
function add(a: number, b: number): number {
	return a + b;
}

// Arrow function with type annotations
const multiply = (x: number, y: number): number => x * y;

// Optional parameters
function greet(name: string, greeting?: string): string {
	return `${greeting || "Hello"}, ${name}!`;
}

// Default parameters
function createUser(name: string, age: number = 18): { name: string; age: number } {
	return { name, age };
}

// Rest parameters
function sum(...numbers: number[]): number {
	return numbers.reduce((total, num) => total + num, 0);
}
```

### Interface and Type Definitions

For complex objects, use interfaces or type aliases:

```typescript
// Interface
interface User {
	id: number;
	name: string;
	email: string;
	isActive: boolean;
}

const user: User = {
	id: 1,
	name: "John Doe",
	email: "john@example.com",
	isActive: true,
};

// Type alias
type Point = {
	x: number;
	y: number;
};

const point: Point = { x: 10, y: 20 };

// Union types with type aliases
type Status = "active" | "inactive" | "pending";

let userStatus: Status = "active";
```

## Type Inference

TypeScript can automatically infer types based on context, reducing the need for explicit annotations:

### Variable Inference

```typescript
// TypeScript infers: number
let count = 42;

// TypeScript infers: string
let message = "Hello World";

// TypeScript infers: boolean
let isDone = false;

// TypeScript infers: number[]
let numbers = [1, 2, 3, 4, 5];

// TypeScript infers: { name: string; age: number }
let person = {
	name: "Alice",
	age: 25,
};
```

### Function Return Type Inference

```typescript
// Return type is inferred as number
function add(a: number, b: number) {
	return a + b;
}

// Return type is inferred as string
const getGreeting = (name: string) => {
	return `Hello, ${name}!`;
};

// Return type is inferred as boolean
function isEven(num: number) {
	return num % 2 === 0;
}
```

### Contextual Typing

TypeScript infers types based on context:

```typescript
// Array methods
const numbers = [1, 2, 3, 4, 5];
numbers.map((num) => num * 2); // num is inferred as number

// Event handlers
const button = document.getElementById("myButton");
button?.addEventListener("click", (event) => {
	// event is inferred as MouseEvent
	console.log(event.clientX, event.clientY);
});

// Generic functions
function identity<T>(arg: T): T {
	return arg;
}

const result = identity("hello"); // T is inferred as string
```

## Best Practices

### When to Use Explicit Types

1. **Function parameters**: Always specify types for function parameters
2. **Complex objects**: Use interfaces for objects with multiple properties
3. **Public APIs**: Explicit types improve documentation
4. **Union types**: Specify when a variable can have multiple types
5. **Constants**: Even when inferred, explicit types can clarify intent

### When to Rely on Inference

1. **Simple variables**: Let TypeScript infer obvious types
2. **Function return types**: Usually inferred correctly
3. **Local variables**: Inference works well for scoped variables
4. **Generic functions**: Type parameters are often inferred

### Type Assertions

When you know more about a type than TypeScript does:

```typescript
// Type assertion with 'as'
const input = document.getElementById("myInput") as HTMLInputElement;

// Non-null assertion
const element = document.getElementById("myElement")!;

// Double assertion (use sparingly)
const value = "hello" as any as number;
```

## Advanced Type Features

### Literal Types

```typescript
// String literal types
type Direction = "north" | "south" | "east" | "west";

// Numeric literal types
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

// Boolean literal types
type IsLoading = true | false;
```

### Tuple Types

```typescript
// Fixed-length arrays with specific types
let coordinates: [number, number] = [10, 20];
let userInfo: [string, number, boolean] = ["Alice", 25, true];

// Optional tuple elements
let optionalTuple: [string, number?] = ["hello"];
```

### Enum Types

```typescript
enum Color {
	Red,
	Green,
	Blue,
}

enum Status {
	Active = "active",
	Inactive = "inactive",
	Pending = "pending",
}

const color: Color = Color.Red;
const status: Status = Status.Active;
```

## Common Patterns

### Function Overloads

```typescript
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
	if (typeof value === "string") {
		return value.toUpperCase();
	} else {
		return value.toFixed(2);
	}
}
```

### Generic Constraints

```typescript
interface HasLength {
	length: number;
}

function getLength<T extends HasLength>(arg: T): number {
	return arg.length;
}

getLength("hello"); // OK
getLength([1, 2, 3]); // OK
getLength(42); // Error: number doesn't have length property
```

### Utility Types

```typescript
interface User {
	id: number;
	name: string;
	email: string;
	createdAt: Date;
}

// Partial makes all properties optional
type PartialUser = Partial<User>;

// Pick selects specific properties
type UserSummary = Pick<User, "id" | "name">;

// Omit removes specific properties
type UserWithoutId = Omit<User, "id">;

// Readonly makes all properties readonly
type ReadonlyUser = Readonly<User>;
```

## Type Guards

Functions that help narrow down types:

```typescript
function isString(value: unknown): value is string {
	return typeof value === "string";
}

function isNumber(value: unknown): value is number {
	return typeof value === "number";
}

function processValue(value: unknown) {
	if (isString(value)) {
		// TypeScript knows value is string here
		console.log(value.toUpperCase());
	} else if (isNumber(value)) {
		// TypeScript knows value is number here
		console.log(value.toFixed(2));
	}
}
```

## Summary

- **Explicit typing** provides clarity and catches errors early
- **Type inference** reduces boilerplate while maintaining safety
- **Interfaces and types** help structure complex data
- **Advanced features** like generics and utility types provide flexibility
- **Best practices** balance explicitness with conciseness

Mastering type assignment and inference is key to writing maintainable, error-free TypeScript code.
