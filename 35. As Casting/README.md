# As Casting (Type Assertions) in TypeScript

Type assertions in TypeScript, using the `as` keyword, allow you to override the compiler's type inference and tell it to treat a value as a different type. While powerful, type assertions should be used carefully as they bypass TypeScript's type checking. Introduced as a safer alternative to angle-bracket syntax (`<Type>value`), the `as` keyword provides explicit type casting with better readability.

## Basic Syntax

```typescript
// Basic type assertion
let value: unknown = "hello world";
let strLength: number = (value as string).length;

// With DOM elements
let inputElement = document.querySelector("input") as HTMLInputElement;

// With function parameters
function processString(input: unknown): string {
	return (input as string).toUpperCase();
}
```

## When to Use Type Assertions

### 1. When You Know More Than TypeScript

```typescript
interface User {
	id: number;
	name: string;
}

function fetchUser(): unknown {
	// Simulating an API call that returns unknown
	return { id: 1, name: "John" };
}

const user = fetchUser() as User;
// TypeScript trusts that you know this is a User
console.log(user.name); // "John"
```

### 2. DOM API Interactions

```typescript
// TypeScript doesn't know the specific element type
const button = document.querySelector(".my-button") as HTMLButtonElement;
button.addEventListener("click", () => {
	console.log("Button clicked!");
});

// For collections
const inputs = document.querySelectorAll(
	"input",
) as NodeListOf<HTMLInputElement>;
inputs.forEach((input) => {
	console.log(input.value);
});
```

### 3. Working with Third-Party Libraries

```typescript
// When a library returns any or unknown
declare function getData(): any;

const data = getData() as { users: User[]; total: number };
console.log(`Found ${data.total} users`);
```

### 4. Type Narrowing After Checks

```typescript
function processValue(value: unknown): void {
	if (typeof value === "object" && value !== null) {
		// TypeScript still sees value as unknown
		// We can assert it as a specific type
		const obj = value as { name: string; age: number };
		console.log(`${obj.name} is ${obj.age} years old`);
	}
}
```

## Type Assertion vs Type Declaration

```typescript
// Type declaration (safe)
let message: string = "hello";

// Type assertion (overrides compiler)
let value: unknown = "hello";
let message2 = value as string; // Tells compiler to trust you

// Multiple assertions (be careful!)
let complexValue: unknown = { data: [1, 2, 3] };
let numbers = (complexValue as any as { data: number[] }).data;
```

## Advanced Patterns

### Double Assertion (Not Recommended)

```typescript
// Sometimes you need to bypass strict checking
let value: string = "hello";
let anyValue = value as any as number; // First to any, then to number

// Better approach: Use proper type guards
function isNumber(value: unknown): value is number {
	return typeof value === "number";
}

if (isNumber(value)) {
	// Now TypeScript knows it's a number
	console.log(value.toFixed(2));
}
```

### Assertion Functions

```typescript
// TypeScript 3.7+ assertion functions
function assertIsString(value: unknown): asserts value is string {
	if (typeof value !== "string") {
		throw new Error("Value must be a string");
	}
}

function processString(value: unknown): void {
	assertIsString(value);
	// TypeScript now knows value is string
	console.log(value.toUpperCase());
}

// Usage
processString("hello"); // "HELLO"
processString(123); // Throws error
```

### Generic Type Assertions

```typescript
function castToType<T>(value: unknown): T {
	return value as T;
}

// Usage
const user = castToType<User>({ id: 1, name: "John" });
const numbers = castToType<number[]>([1, 2, 3]);

// Be careful with this - no runtime checking!
const invalid = castToType<string>(123); // TypeScript allows it, but it's wrong
```

### Safe Casting Utility

```typescript
function safeCast<T>(
	value: unknown,
	validator: (v: unknown) => v is T,
): T | null {
	return validator(value) ? value : null;
}

function isUser(value: unknown): value is User {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"name" in value &&
		typeof (value as User).id === "number" &&
		typeof (value as User).name === "string"
	);
}

// Usage
const data: unknown = { id: 1, name: "John" };
const user = safeCast(data, isUser);

if (user) {
	console.log(user.name); // Safe!
} else {
	console.log("Invalid user data");
}
```

## Common Use Cases

### 1. JSON Parsing

```typescript
interface ApiResponse {
	users: User[];
	total: number;
}

// Unsafe way
const response = JSON.parse(apiData) as ApiResponse;

// Safer way
function parseApiResponse(data: string): ApiResponse | null {
	try {
		const parsed = JSON.parse(data);
		// Validate structure here
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			Array.isArray(parsed.users) &&
			typeof parsed.total === "number"
		) {
			return parsed as ApiResponse;
		}
		return null;
	} catch {
		return null;
	}
}
```

### 2. Event Handling

```typescript
// Type assertions for event targets
function handleInputChange(event: Event): void {
	const target = event.target as HTMLInputElement;
	console.log(`New value: ${target.value}`);
}

// For custom events
interface CustomEventData {
	userId: number;
	action: string;
}

function handleCustomEvent(event: CustomEvent): void {
	const data = event.detail as CustomEventData;
	console.log(`User ${data.userId} performed ${data.action}`);
}
```

### 3. Working with Libraries

```typescript
// When library types are incomplete
declare function getLibraryData(): any;

interface LibraryResult {
	success: boolean;
	data?: unknown;
}

const result = getLibraryData() as LibraryResult;

if (result.success && result.data) {
	// Process data
	console.log("Success:", result.data);
}
```

### 4. Type Guards with Assertions

```typescript
function isStringArray(value: unknown): value is string[] {
	return (
		Array.isArray(value) && value.every((item) => typeof item === "string")
	);
}

function processStringArray(data: unknown): void {
	if (isStringArray(data)) {
		// TypeScript knows data is string[]
		data.forEach((str) => console.log(str.toUpperCase()));
	} else {
		// Fallback: assert and handle potential errors
		const array = data as string[];
		try {
			array.forEach((str) => console.log(str.toUpperCase()));
		} catch (error) {
			console.error("Failed to process array:", error);
		}
	}
}
```

## Best Practices

### 1. Prefer Type Guards Over Assertions

```typescript
// Avoid: Direct assertion
function processUser(data: unknown): void {
	const user = data as User;
	console.log(user.name); // Runtime error if data isn't a User
}

// Better: Use type guards
function isUser(data: unknown): data is User {
	return (
		typeof data === "object" && data !== null && "id" in data && "name" in data
	);
}

function processUser(data: unknown): void {
	if (isUser(data)) {
		console.log(data.name); // Type-safe
	}
}
```

### 2. Use Non-Null Assertions Sparingly

```typescript
// Sometimes necessary with strict null checks
function processElement(element: HTMLElement | null): void {
	// element! asserts it's not null
	element!.style.color = "red";
}

// Better: Proper null checking
function processElement(element: HTMLElement | null): void {
	if (element) {
		element.style.color = "red";
	}
}
```

### 3. Validate Before Asserting

```typescript
// Good: Validate structure before asserting
function createUser(data: unknown): User {
	if (
		typeof data === "object" &&
		data !== null &&
		"id" in data &&
		"name" in data &&
		typeof (data as any).id === "number" &&
		typeof (data as any).name === "string"
	) {
		return data as User;
	}
	throw new Error("Invalid user data");
}
```

### 4. Use Specific Types

```typescript
// Avoid: Generic any casting
const data = JSON.parse(jsonString) as any;

// Better: Specific interface
interface ParsedData {
	users: User[];
	settings: Record<string, unknown>;
}

const data = JSON.parse(jsonString) as ParsedData;
```

## Common Pitfalls

### 1. Overusing Type Assertions

```typescript
// Bad: Too many assertions
function complexFunction(data: unknown): void {
	const obj = data as any;
	const users = obj.users as User[];
	const firstUser = users[0] as User;
	const name = firstUser.name as string;
	console.log(name);
}

// Better: Proper validation
function complexFunction(data: unknown): void {
	if (
		typeof data === "object" &&
		data !== null &&
		"users" in data &&
		Array.isArray((data as any).users)
	) {
		const users = (data as { users: unknown[] }).users;
		const firstUser = users[0];
		if (
			typeof firstUser === "object" &&
			firstUser !== null &&
			"name" in firstUser &&
			typeof (firstUser as User).name === "string"
		) {
			console.log((firstUser as User).name);
		}
	}
}
```

### 2. Asserting Incorrect Types

```typescript
// Runtime error waiting to happen
const numberValue: unknown = "123";
const result = (numberValue as number) + 10; // "123" + 10 = "12310"

// Correct approach
const numberValue: unknown = "123";
if (typeof numberValue === "string") {
	const parsed = parseInt(numberValue);
	if (!isNaN(parsed)) {
		const result = parsed + 10;
		console.log(result); // 133
	}
}
```

### 3. Losing Type Safety

```typescript
// Bad: Casting away type safety
function unsafeFunction<T>(value: T): void {
	const anyValue = value as any;
	// Now you can do anything, but lose type safety
	anyValue.doSomethingDangerous();
}

// Better: Maintain type safety
function safeFunction<T>(value: T): void {
	// Use proper type constraints
	if (typeof value === "object" && value !== null) {
		// Safe operations
	}
}
```

## Advanced Type Assertion Patterns

### Conditional Type Assertions

```typescript
type AssertedType<T> = T extends string
	? string
	: T extends number
	? number
	: T extends boolean
	? boolean
	: never;

function assertType<T>(value: unknown): AssertedType<T> {
	return value as AssertedType<T>;
}

// Usage
const str = assertType<string>("hello");
const num = assertType<number>(42);
```

### Branded Types with Assertions

```typescript
// Branded types for type safety
type UserId = string & { readonly __brand: "UserId" };
type Email = string & { readonly __brand: "Email" };

function createUserId(id: string): UserId {
	if (id.length === 0) throw new Error("Invalid ID");
	return id as UserId;
}

function createEmail(email: string): Email {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) throw new Error("Invalid email");
	return email as Email;
}

// Usage
const userId = createUserId("123");
const email = createEmail("user@example.com");

// TypeScript prevents mixing branded types
// const invalid: UserId = email; // Error
```

### Assertion in Utility Types

```typescript
// Custom utility types with assertions
type AsArray<T> = T extends readonly unknown[] ? T : T[];

function ensureArray<T>(value: T): AsArray<T> {
	return (Array.isArray(value) ? value : [value]) as AsArray<T>;
}

// Usage
const single = ensureArray("hello"); // ["hello"]
const multiple = ensureArray([1, 2, 3]); // [1, 2, 3]
```

## Migration from Angle Brackets

```typescript
// Old syntax (still works but not recommended in TSX)
let value: any = "hello";
let str: string = <string>value;

// New syntax (preferred)
let str2: string = value as string;

// In TSX/JSX, only 'as' works
let element = <div>Hello</div> as JSX.Element;
```

## Summary

Type assertions with the `as` keyword are a powerful TypeScript feature for overriding the compiler's type inference. Key points:

- **Purpose**: Tell TypeScript to treat a value as a different type
- **Safety**: Bypasses type checking - use with caution
- **Syntax**: `value as Type` (preferred over `<Type>value`)
- **Best Use**: When you know more than the compiler about a type

Benefits:

- **Flexibility**: Work with dynamic data and external APIs
- **DOM Integration**: Type HTML elements correctly
- **Library Integration**: Handle incomplete third-party types

Risks:

- **Runtime Errors**: No type checking means potential runtime failures
- **Maintainability**: Can hide type-related bugs
- **Code Safety**: Reduces TypeScript's type safety guarantees

Use type assertions sparingly and prefer type guards, proper validation, and interface definitions whenever possible. When you must use assertions, combine them with runtime checks to maintain safety.
