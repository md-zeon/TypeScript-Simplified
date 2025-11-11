# Never Type in TypeScript

The `never` type is one of TypeScript's most powerful and unique types. It represents values that never occur or code paths that should never be reached. Understanding `never` is crucial for writing type-safe code, especially when working with exhaustive type checking, error handling, and control flow analysis.

## What is the Never Type?

The `never` type represents the absence of any value. It's used in situations where:

- A function never returns (throws an exception or runs infinitely)
- A code path is unreachable
- You want to ensure exhaustive checking of union types

```typescript
// Function that never returns
function throwError(message: string): never {
	throw new Error(message);
}

// Function that runs infinitely
function infiniteLoop(): never {
	while (true) {
		// Infinite loop
	}
}

// Unreachable code
function unreachable(): never {
	// This function should never be called
	throw new Error("This should never happen");
}
```

## Never vs Void

While both `never` and `void` represent "no value", they have different meanings:

- `void`: A function returns undefined (or nothing)
- `never`: A function never returns at all

```typescript
// void function - returns undefined
function logMessage(message: string): void {
	console.log(message);
	// Function returns undefined
}

// never function - never returns
function fail(message: string): never {
	throw new Error(message);
	// Function never returns
}

// Another never function
function infinite(): never {
	while (true) {
		// Never exits
	}
}
```

## Exhaustive Type Checking

One of the most powerful uses of `never` is ensuring exhaustive checking of union types.

### Basic Exhaustive Switch

```typescript
type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape, dimensions: any): number {
	switch (shape) {
		case "circle":
			return Math.PI * dimensions.radius ** 2;
		case "square":
			return dimensions.side ** 2;
		case "triangle":
			return (dimensions.base * dimensions.height) / 2;
		default:
			// TypeScript knows this is unreachable if all cases are covered
			const exhaustiveCheck: never = shape;
			throw new Error(`Unhandled shape: ${exhaustiveCheck}`);
	}
}

// Usage
console.log(getArea("circle", { radius: 5 })); // 78.54
console.log(getArea("square", { side: 4 })); // 16
console.log(getArea("triangle", { base: 6, height: 8 })); // 24
```

### Exhaustive Checking with Functions

```typescript
interface Circle {
	kind: "circle";
	radius: number;
}

interface Square {
	kind: "square";
	side: number;
}

interface Triangle {
	kind: "triangle";
	base: number;
	height: number;
}

type GeometricShape = Circle | Square | Triangle;

function assertNever(value: never): never {
	throw new Error(`Unexpected value: ${value}`);
}

function calculateArea(shape: GeometricShape): number {
	switch (shape.kind) {
		case "circle":
			return Math.PI * shape.radius ** 2;
		case "square":
			return shape.side ** 2;
		case "triangle":
			return (shape.base * shape.height) / 2;
		default:
			// This ensures we handle all possible cases
			return assertNever(shape);
	}
}

// If we add a new shape type, TypeScript will catch it
interface Rectangle {
	kind: "rectangle";
	width: number;
	height: number;
}

// Uncommenting this would cause a TypeScript error:
// type AllShapes = GeometricShape | Rectangle;
// Now calculateArea would need to handle Rectangle
```

## Never in Function Signatures

### Error-Throwing Functions

```typescript
// Utility functions that throw errors
function assertIsDefined<T>(value: T | undefined, message: string): T {
	if (value === undefined) {
		throw new Error(message);
	}
	return value;
}

function validateEmail(email: string): never | string {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		throw new Error("Invalid email format");
	}
	return email;
}

// Usage
function processUser(email: string | undefined): string {
	const validEmail = assertIsDefined(email, "Email is required");
	return validateEmail(validEmail);
}
```

### Conditional Never Returns

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };

function handleResult<T>(result: Result<T>): T {
	if (result.success) {
		return result.data;
	} else {
		// This function never returns when success is false
		throw new Error(result.error);
	}
}

// The return type is inferred as T (not T | never)
const data = handleResult({ success: true, data: "Hello" }); // string
```

## Never with Union Types

### Filtering with Never

```typescript
type ExcludeType<T, U> = T extends U ? never : T;

// Example: Remove null and undefined from a type
type NonNullable<T> = ExcludeType<T, null | undefined>;

type Example = string | number | null | undefined;
type CleanExample = NonNullable<Example>; // string | number
```

### Discriminated Unions

```typescript
type LoadingState = { status: "loading" };
type SuccessState<T> = { status: "success"; data: T };
type ErrorState = { status: "error"; error: string };

type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState;

function handleAsyncState<T>(state: AsyncState<T>): T | never {
	switch (state.status) {
		case "loading":
			// Still loading, nothing to return
			throw new Error("Still loading");
		case "success":
			return state.data;
		case "error":
			throw new Error(state.error);
		default:
			// Exhaustive check
			const never: never = state;
			throw new Error(`Unknown state: ${never}`);
	}
}
```

## Advanced Patterns

### Conditional Types with Never

```typescript
// Extract function parameter types
type Parameters<T extends (...args: any) => any> = T extends (
	...args: infer P
) => any
	? P
	: never;

// Extract function return types
type ReturnType<T extends (...args: any) => any> = T extends (
	...args: any
) => infer R
	? R
	: never;

// Check if a type is never
type IsNever<T> = [T] extends [never] ? true : false;

type Test1 = IsNever<never>; // true
type Test2 = IsNever<string>; // false
```

### Never in Generic Constraints

```typescript
// Function that accepts any type except never
function processValue<T>(value: T extends never ? never : T): void {
	console.log(value);
}

// This works
processValue("hello");
processValue(42);

// This would cause issues with never
// processValue(never); // Type 'never' is not assignable
```

### Utility Types with Never

```typescript
// Custom utility types using never
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
	k: infer I,
) => void
	? I
	: never;

type TestUnion = { a: string } | { b: number };
type TestIntersection = UnionToIntersection<TestUnion>;
// { a: string } & { b: number }

// Remove specific types from unions
type Remove<T, U> = T extends U ? never : T;

type Original = string | number | boolean;
type WithoutString = Remove<Original, string>; // number | boolean
```

## Never in Control Flow

### Conditional Returns

```typescript
function getUser(id: number): User | never {
	const user = findUserById(id);
	if (!user) {
		throw new Error(`User ${id} not found`);
	}
	return user;
}

// The function signature indicates it either returns User or never returns
function processUserRequest(id: number): void {
	try {
		const user = getUser(id);
		console.log(`Found user: ${user.name}`);
	} catch (error) {
		console.error(error.message);
	}
}
```

### Guard Clauses

```typescript
function validateInput(input: unknown): string | never {
	if (typeof input !== "string") {
		throw new Error("Input must be a string");
	}
	if (input.length === 0) {
		throw new Error("Input cannot be empty");
	}
	return input;
}

function processInput(input: unknown): void {
	const validInput = validateInput(input);
	// At this point, validInput is guaranteed to be a non-empty string
	console.log(`Processing: ${validInput.toUpperCase()}`);
}
```

## Common Use Cases

### 1. Assertion Functions

```typescript
function assert(condition: boolean, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

function divide(a: number, b: number): number {
	assert(b !== 0, "Cannot divide by zero");
	return a / b;
}

// Usage
console.log(divide(10, 2)); // 5
// divide(10, 0); // Throws error
```

### 2. Type Guards with Never

```typescript
type Primitive = string | number | boolean | null | undefined;

function isPrimitive(value: unknown): value is Primitive {
	return (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean" ||
		value === null ||
		value === undefined
	);
}

function processValue(value: unknown): Primitive | never {
	if (isPrimitive(value)) {
		return value;
	}
	throw new Error("Unsupported value type");
}
```

### 3. Event Handlers

```typescript
type EventType = "click" | "hover" | "focus";

function handleEvent(event: EventType): void {
	switch (event) {
		case "click":
			console.log("Handling click");
			break;
		case "hover":
			console.log("Handling hover");
			break;
		case "focus":
			console.log("Handling focus");
			break;
		default:
			// This should never happen if EventType is properly maintained
			const exhaustive: never = event;
			throw new Error(`Unhandled event: ${exhaustive}`);
	}
}
```

## Best Practices

### 1. Use Never for Exhaustive Checks

```typescript
// Good: Exhaustive checking ensures all cases are handled
type Action = { type: "INCREMENT" } | { type: "DECREMENT" } | { type: "RESET" };

function reducer(state: number, action: Action): number {
	switch (action.type) {
		case "INCREMENT":
			return state + 1;
		case "DECREMENT":
			return state - 1;
		case "RESET":
			return 0;
		default:
			const never: never = action;
			throw new Error(`Unknown action: ${never}`);
	}
}
```

### 2. Prefer Never over Any for Error Cases

```typescript
// Avoid: Using any for error cases
function badFunction(): any {
	throw new Error("Something went wrong");
}

// Good: Using never for functions that don't return
function goodFunction(): never {
	throw new Error("Something went wrong");
}
```

### 3. Use Never in Utility Types

```typescript
// Custom utility types
type NoUndefined<T> = T extends undefined ? never : T;
type NoNull<T> = T extends null ? never : T;

// Usage
type CleanType = NoUndefined<string | undefined>; // string
type NonNullType = NoNull<string | null>; // string
```

### 4. Combine Never with Conditional Types

```typescript
type FunctionPropertyNames<T> = {
	[K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

interface Example {
	name: string;
	age: number;
	greet: () => void;
	logout: () => void;
}

type FunctionKeys = FunctionPropertyNames<Example>; // "greet" | "logout"
```

## Common Pitfalls

### 1. Confusing Never with Void

```typescript
// Wrong: Using void when never is appropriate
function shouldNeverReturn(): void {
	throw new Error("Error");
}

// Correct
function shouldNeverReturn(): never {
	throw new Error("Error");
}
```

### 2. Incomplete Exhaustive Checks

```typescript
type Status = "pending" | "fulfilled" | "rejected";

// Wrong: Missing default case
function handleStatus(status: Status): void {
	switch (status) {
		case "pending":
			console.log("Loading...");
			break;
		case "fulfilled":
			console.log("Success!");
			break;
		// Missing "rejected" case
	}
}

// Correct: Include exhaustive check
function handleStatusCorrect(status: Status): void {
	switch (status) {
		case "pending":
			console.log("Loading...");
			break;
		case "fulfilled":
			console.log("Success!");
			break;
		case "rejected":
			console.log("Error!");
			break;
		default:
			const never: never = status;
			throw new Error(`Unknown status: ${never}`);
	}
}
```

### 3. Never in Variable Declarations

```typescript
// This is usually not useful
let impossible: never;

// But this can be used for type assertions
function assertUnreachable(x: never): never {
	throw new Error("Didn't expect to get here");
}
```

## Summary

The `never` type is a powerful TypeScript feature that represents impossible values and unreachable code paths. Key uses include:

- **Exhaustive Type Checking**: Ensure all cases in union types are handled
- **Error Functions**: Mark functions that never return normally
- **Type Safety**: Prevent impossible states in your code
- **Control Flow Analysis**: Help TypeScript understand unreachable code

Benefits of using `never`:

- **Compile-time Safety**: Catch missing cases at compile time
- **Better Error Handling**: Clear indication of error conditions
- **Type Inference**: Help TypeScript infer correct types
- **Maintainability**: Make code more robust and self-documenting

Use `never` whenever you have functions that throw errors, infinite loops, or want to ensure exhaustive checking of discriminated unions. It's especially valuable in large codebases where maintaining type safety is critical.
