# Defining Functions in TypeScript

Functions are the building blocks of any TypeScript application. TypeScript extends JavaScript's function capabilities with powerful type annotations for parameters, return values, and function signatures. This section covers various ways to define and type functions in TypeScript.

## Function Declaration with Types

### Basic Function Declaration

```typescript
// Function declaration with typed parameters and return type
function add(a: number, b: number): number {
	return a + b;
}

// Function declaration with optional parameters
function greet(name: string, greeting?: string): string {
	return `${greeting || "Hello"}, ${name}!`;
}

// Function declaration with default parameters
function createUser(
	name: string,
	age: number = 18,
): { name: string; age: number } {
	return { name, age };
}
```

### Function Expression

```typescript
// Function expression with type annotations
const multiply: (x: number, y: number) => number = function (x, y) {
	return x * y;
};

// Arrow function expression
const divide = (a: number, b: number): number => {
	if (b === 0) throw new Error("Division by zero");
	return a / b;
};

// Short arrow function
const square: (n: number) => number = (n) => n * n;
```

## Function Types

### Function Type Aliases

```typescript
// Function type alias
type MathOperation = (a: number, b: number) => number;

// Using the type alias
const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;
const multiply: MathOperation = (a, b) => a * b;

// Generic function type
type Transformer<T> = (value: T) => T;

// Usage
const stringTransformer: Transformer<string> = (str) => str.toUpperCase();
const numberTransformer: Transformer<number> = (num) => num * 2;
```

### Interface with Function Signatures

```typescript
// Interface with function properties
interface Calculator {
	add: (a: number, b: number) => number;
	subtract: (a: number, b: number) => number;
	multiply: (a: number, b: number) => number;
	divide: (a: number, b: number) => number;
}

// Implementation
const calculator: Calculator = {
	add: (a, b) => a + b,
	subtract: (a, b) => a - b,
	multiply: (a, b) => a * b,
	divide: (a, b) => {
		if (b === 0) throw new Error("Division by zero");
		return a / b;
	},
};
```

## Advanced Function Types

### Rest Parameters

```typescript
// Rest parameters with array type
function sum(...numbers: number[]): number {
	return numbers.reduce((total, num) => total + num, 0);
}

// Rest parameters with tuple type for fixed number of initial parameters
function formatName(first: string, last: string, ...titles: string[]): string {
	return `${titles.join(" ")} ${first} ${last}`.trim();
}

// Usage
console.log(sum(1, 2, 3, 4, 5)); // 15
console.log(formatName("John", "Doe", "Dr.", "Prof.")); // "Dr. Prof. John Doe"
```

### Function Overloads

```typescript
// Function overloads for different parameter types
function format(value: string): string;
function format(value: number): string;
function format(value: boolean): string;
function format(value: string | number | boolean): string {
	if (typeof value === "string") {
		return `"${value}"`;
	} else if (typeof value === "number") {
		return value.toFixed(2);
	} else {
		return value ? "true" : "false";
	}
}

// Usage
console.log(format("hello")); // "hello"
console.log(format(42)); // "42.00"
console.log(format(true)); // "true"
```

### Generic Functions

```typescript
// Generic function with type parameter
function identity<T>(value: T): T {
	return value;
}

// Generic function with constraints
function getLength<T extends { length: number }>(value: T): number {
	return value.length;
}

// Generic function with multiple type parameters
function merge<T, U>(obj1: T, obj2: U): T & U {
	return { ...obj1, ...obj2 };
}

// Usage
const result1 = identity("hello"); // string
const result2 = identity(42); // number

console.log(getLength("hello")); // 5
console.log(getLength([1, 2, 3])); // 3

const merged = merge({ name: "John" }, { age: 30 }); // { name: string; age: number }
```

## Function Parameters

### Optional Parameters

```typescript
// Optional parameters (must come after required parameters)
function createPerson(
	name: string,
	age?: number,
	email?: string,
): {
	name: string;
	age?: number;
	email?: string;
} {
	return { name, age, email };
}

// Usage
const person1 = createPerson("Alice"); // OK
const person2 = createPerson("Bob", 25); // OK
const person3 = createPerson("Charlie", 30, "charlie@example.com"); // OK
```

### Default Parameters

```typescript
// Default parameter values
function createConfig(
	host: string,
	port: number = 8080,
	ssl: boolean = false,
): { host: string; port: number; ssl: boolean } {
	return { host, port, ssl };
}

// Usage
const config1 = createConfig("localhost"); // { host: "localhost", port: 8080, ssl: false }
const config2 = createConfig("api.example.com", 443, true); // { host: "api.example.com", port: 443, ssl: true }
```

### Destructuring Parameters

```typescript
// Object destructuring in parameters
function printUser({
	name,
	age,
	email,
}: {
	name: string;
	age: number;
	email?: string;
}): void {
	console.log(`Name: ${name}`);
	console.log(`Age: ${age}`);
	if (email) console.log(`Email: ${email}`);
}

// Array destructuring in parameters
function swap([a, b]: [number, number]): [number, number] {
	return [b, a];
}

// Usage
printUser({ name: "Alice", age: 25, email: "alice@example.com" });
console.log(swap([1, 2])); // [2, 1]
```

## Return Types

### Explicit Return Types

```typescript
// Explicit return type annotation
function getUser(): { id: number; name: string; email: string } {
	return {
		id: 1,
		name: "John Doe",
		email: "john@example.com",
	};
}

// Function returning void
function logMessage(message: string): void {
	console.log(message);
}

// Function returning never (never returns)
function throwError(message: string): never {
	throw new Error(message);
}

// Function returning undefined
function doNothing(): undefined {
	return undefined;
}
```

### Return Type Inference

```typescript
// TypeScript infers return type
function add(a: number, b: number) {
	return a + b; // Inferred as number
}

function getMessage() {
	return "Hello World"; // Inferred as string
}

function createArray() {
	return [1, 2, 3]; // Inferred as number[]
}
```

## Higher-Order Functions

### Functions as Parameters

```typescript
// Function that takes another function as parameter
function executeOperation(
	a: number,
	b: number,
	operation: (x: number, y: number) => number,
): number {
	return operation(a, b);
}

// Usage
const result = executeOperation(10, 5, (x, y) => x - y); // 5
```

### Functions Returning Functions

```typescript
// Function that returns a function
function createMultiplier(factor: number): (value: number) => number {
	return (value: number) => value * factor;
}

// Usage
const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

## Method Signatures

### Object Methods

```typescript
// Object with typed methods
const mathUtils = {
	add(a: number, b: number): number {
		return a + b;
	},

	subtract(a: number, b: number): number {
		return a - b;
	},

	power(base: number, exponent: number): number {
		return Math.pow(base, exponent);
	},
};
```

### Class Methods

```typescript
class Calculator {
	add(a: number, b: number): number {
		return a + b;
	}

	multiply(a: number, b: number): number {
		return a * b;
	}

	// Static method
	static create(): Calculator {
		return new Calculator();
	}
}

const calc = new Calculator();
console.log(calc.add(5, 3)); // 8
```

## Function Type Guards

```typescript
// Type guard function
function isString(value: unknown): value is string {
	return typeof value === "string";
}

// Function using type guard
function processValue(value: unknown): string {
	if (isString(value)) {
		// TypeScript knows value is string here
		return value.toUpperCase();
	} else {
		return String(value);
	}
}
```

## Best Practices

### 1. Always Type Function Parameters

```typescript
// Good: Typed parameters
function processUser(user: { id: number; name: string }): void {
	console.log(`Processing user ${user.name}`);
}

// Bad: Untyped parameters
function processUser(user): void {
	// Implicit any
	console.log(`Processing user ${user.name}`);
}
```

### 2. Use Explicit Return Types for Complex Functions

```typescript
// Good: Explicit return type for complex function
function transformData(data: any[]): { result: string[]; count: number } {
	const result = data.map((item) => String(item));
	return {
		result,
		count: result.length,
	};
}

// OK: Return type inference for simple functions
function add(a: number, b: number) {
	return a + b; // TypeScript infers number
}
```

### 3. Prefer Interfaces for Complex Function Types

```typescript
// Good: Use interface for complex function objects
interface DataProcessor {
	process(data: any[]): Promise<any[]>;
	validate(data: any[]): boolean;
	transform(data: any[]): any[];
}

// Less ideal: Inline function types
const processor: {
	process: (data: any[]) => Promise<any[]>;
	validate: (data: any[]) => boolean;
	transform: (data: any[]) => any[];
} = {
	// implementation
};
```

### 4. Use Function Overloads Sparingly

```typescript
// Good: Simple overload for related functionality
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
	return String(value);
}

// Avoid: Overloads that do completely different things
function process(value: string): string;
function process(value: number): number;
function process(value: string | number): string | number {
	// This could be two separate functions
}
```

### 5. Leverage Generic Constraints

```typescript
// Good: Constrain generics appropriately
function findById<T extends { id: string }>(
	items: T[],
	id: string,
): T | undefined {
	return items.find((item) => item.id === id);
}

// Bad: Overly broad generic
function findById(items: any[], id: string): any {
	return items.find((item) => item.id === id);
}
```

## Common Patterns

### Callback Functions

```typescript
type Callback<T> = (result: T) => void;

function fetchData<T>(url: string, callback: Callback<T>): void {
	// Simulate async operation
	setTimeout(() => {
		const data = { id: 1, name: "Test" } as T;
		callback(data);
	}, 1000);
}

// Usage
fetchData("/api/user", (user) => {
	console.log("Received user:", user);
});
```

### Builder Pattern with Functions

```typescript
type QueryBuilder = {
	select: (fields: string[]) => QueryBuilder;
	from: (table: string) => QueryBuilder;
	where: (condition: string) => QueryBuilder;
	build: () => string;
};

function createQueryBuilder(): QueryBuilder {
	let query = "";

	return {
		select(fields: string[]): QueryBuilder {
			query += `SELECT ${fields.join(", ")} `;
			return this;
		},

		from(table: string): QueryBuilder {
			query += `FROM ${table} `;
			return this;
		},

		where(condition: string): QueryBuilder {
			query += `WHERE ${condition}`;
			return this;
		},

		build(): string {
			return query.trim();
		},
	};
}

// Usage
const sql = createQueryBuilder()
	.select(["id", "name"])
	.from("users")
	.where("age > 18")
	.build();
```

### Function Composition

```typescript
// Function composition utility
function compose<A, B, C>(
	fn1: (arg: A) => B,
	fn2: (arg: B) => C,
): (arg: A) => C {
	return (arg: A) => fn2(fn1(arg));
}

// Usage
const addOne = (n: number) => n + 1;
const double = (n: number) => n * 2;
const addOneThenDouble = compose(addOne, double);

console.log(addOneThenDouble(5)); // 12 (5 + 1 = 6, 6 * 2 = 12)
```

## Summary

- **Function declarations** and expressions can be typed with parameter and return type annotations
- **Function types** can be defined using type aliases or interfaces
- **Generic functions** provide type safety for reusable code
- **Function overloads** handle different parameter types
- **Rest parameters** and destructuring enhance flexibility
- **Best practices** emphasize explicit typing and appropriate use of advanced features

Mastering function definitions in TypeScript enables writing type-safe, maintainable, and reusable code with clear contracts between different parts of your application.
