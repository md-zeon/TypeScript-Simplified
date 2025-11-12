# Function Overloads in TypeScript

Function overloads in TypeScript allow you to define multiple call signatures for the same function. This enables better type safety, improved IntelliSense, and more precise type checking. Overloads provide different ways to call a function while maintaining type safety for each usage pattern.

## Basic Syntax

Function overloads consist of:

1. Multiple function signatures (overloads)
2. One implementation signature
3. A single function implementation

```typescript
// Overload signatures
function greet(name: string): string;
function greet(name: string, age: number): string;
function greet(names: string[]): string;

// Implementation signature
function greet(nameOrNames: string | string[], age?: number): string {
	if (Array.isArray(nameOrNames)) {
		return `Hello ${nameOrNames.join(", ")}!`;
	}

	if (age !== undefined) {
		return `Hello ${nameOrNames}, you are ${age} years old!`;
	}

	return `Hello ${nameOrNames}!`;
}

// Usage
console.log(greet("John")); // "Hello John!"
console.log(greet("John", 30)); // "Hello John, you are 30 years old!"
console.log(greet(["John", "Jane"])); // "Hello John, Jane!"
```

## Why Use Function Overloads?

### Type Safety

```typescript
// Without overloads - less type safe
function add(a: any, b: any): any {
	return a + b;
}

add(1, 2); // 3
add("hello", "world"); // "helloworld"
add(1, "world"); // "1world" - potentially unexpected

// With overloads - type safe
function add(a: number, b: number): number;
function add(a: string, b: string): string;
function add(a: number | string, b: number | string): number | string {
	return a + b;
}

add(1, 2); // 3 (number)
add("hello", "world"); // "helloworld" (string)
// add(1, "world"); // TypeScript error
```

### Better IntelliSense

```typescript
// IntelliSense shows appropriate return types based on input types
const result1 = add(1, 2); // result1: number
const result2 = add("hello", "world"); // result2: string

// Hovering over result1 shows: const result1: number
// Hovering over result2 shows: const result2: string
```

## Common Patterns

### Different Parameter Types

```typescript
function format(value: string): string;
function format(value: number): string;
function format(value: boolean): string;
function format(value: string | number | boolean): string {
	if (typeof value === "string") {
		return `"${value}"`;
	}
	if (typeof value === "number") {
		return value.toFixed(2);
	}
	return value ? "true" : "false";
}

// Usage
console.log(format("hello")); // ""hello""
console.log(format(3.14159)); // "3.14"
console.log(format(true)); // "true"
```

### Different Parameter Counts

```typescript
function createUser(name: string): User;
function createUser(name: string, age: number): User;
function createUser(name: string, age?: number): User {
	return {
		id: Math.random(),
		name,
		age: age ?? 18,
	};
}

// Usage
const user1 = createUser("John"); // User with default age 18
const user2 = createUser("Jane", 25); // User with age 25
```

### Union Types with Overloads

```typescript
type Value = string | number | boolean;

function process(value: string): string[];
function process(value: number): number;
function process(value: boolean): boolean;
function process(value: Value): string[] | number | boolean {
	if (typeof value === "string") {
		return value.split("");
	}
	if (typeof value === "number") {
		return value * 2;
	}
	return !value;
}

// Usage
const result1 = process("hello"); // string[]
const result2 = process(5); // number
const result3 = process(true); // boolean
```

## Advanced Patterns

### Generic Overloads

```typescript
function map<T>(array: T[], mapper: (item: T) => T): T[];
function map<T, U>(array: T[], mapper: (item: T) => U): U[];
function map<T, U>(array: T[], mapper: (item: T) => U): U[] {
	return array.map(mapper);
}

// Usage
const numbers = [1, 2, 3];
const doubled = map(numbers, (x) => x * 2); // number[]
const strings = map(numbers, (x) => x.toString()); // string[]
```

### Overloads with Rest Parameters

```typescript
function concat(separator: string, ...strings: string[]): string;
function concat(...strings: string[]): string;
function concat(separatorOrString: string, ...rest: string[]): string {
	if (rest.length === 0) {
		// No separator provided, just join all arguments
		return [separatorOrString, ...rest].join("");
	} else {
		// Separator provided
		return [separatorOrString, ...rest].join(separatorOrString);
	}
}

// Wait, this is wrong. Let me fix it:

function concat(...strings: string[]): string;
function concat(separator: string, ...strings: string[]): string;
function concat(separatorOrFirst: string, ...rest: string[]): string {
	if (rest.length === 0) {
		return separatorOrFirst;
	} else {
		return [separatorOrFirst, ...rest].join(separatorOrFirst);
	}
}

// Better implementation
function concat(separator: string, ...strings: string[]): string;
function concat(first: string, ...rest: string[]): string;
function concat(first: string, ...rest: string[]): string {
	return rest.length > 0 ? [first, ...rest].join(first) : first;
}

// Usage
console.log(concat("hello")); // "hello"
console.log(concat("-", "a", "b", "c")); // "a-b-c"
```

### Method Overloads

```typescript
class Calculator {
	add(a: number, b: number): number;
	add(a: string, b: string): string;
	add(a: number | string, b: number | string): number | string {
		return a + b;
	}

	multiply(a: number, b: number): number;
	multiply(a: number, b: number, c: number): number;
	multiply(a: number, b: number, c?: number): number {
		return c ? a * b * c : a * b;
	}
}

// Usage
const calc = new Calculator();
const sum = calc.add(1, 2); // number
const concat = calc.add("hello", "world"); // string
const product = calc.multiply(2, 3); // 6
const product3 = calc.multiply(2, 3, 4); // 24
```

### Constructor Overloads

```typescript
class Point {
	constructor(x: number, y: number);
	constructor(value: string); // "10,20"
	constructor(x: number | string, y?: number) {
		if (typeof x === "string") {
			const [xStr, yStr] = x.split(",");
			this.x = parseFloat(xStr);
			this.y = parseFloat(yStr);
		} else {
			this.x = x;
			this.y = y!;
		}
	}

	x: number;
	y: number;
}

// Usage
const point1 = new Point(10, 20);
const point2 = new Point("15,25");
```

## Overloads with Discriminated Unions

```typescript
type ApiResponse<T> =
	| { success: true; data: T }
	| { success: false; error: string };

function fetchData(url: string): Promise<ApiResponse<unknown>>;
function fetchData<T>(
	url: string,
	parser: (data: unknown) => T,
): Promise<ApiResponse<T>>;
function fetchData<T>(
	url: string,
	parser?: (data: unknown) => T,
): Promise<ApiResponse<T | unknown>> {
	return fetch(url)
		.then((response) => response.json())
		.then((data) => {
			if (parser) {
				try {
					return { success: true, data: parser(data) };
				} catch (error) {
					return { success: false, error: error.message };
				}
			}
			return { success: true, data };
		})
		.catch((error) => ({ success: false, error: error.message }));
}

// Usage
const response1 = await fetchData("/api/users"); // ApiResponse<unknown>
const response2 = await fetchData("/api/users", (data: any) => data as User[]); // ApiResponse<User[]>
```

## Best Practices

### 1. Keep Overloads Simple

```typescript
// Good: Clear, simple overloads
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
	return typeof value === "string" ? `"${value}"` : value.toString();
}

// Avoid: Complex overloads that are hard to understand
function process(a: string, b: number): string;
function process(a: number, b: string): number;
function process(a: boolean, b: boolean): boolean;
// ... many more overloads
```

### 2. Use Union Types When Appropriate

```typescript
// Sometimes a union type is simpler than overloads
type FormatInput = string | number | boolean;

function format(value: FormatInput): string {
	// Implementation
}

// Use overloads when you need different return types
function parse(input: string): number;
function parse(input: string, radix: number): number;
function parse(input: string, radix?: number): number {
	return parseInt(input, radix);
}
```

### 3. Document Overloads Clearly

```typescript
/**
 * Creates a user with optional properties
 * @param name - The user's name
 * @returns A user with default age
 */
function createUser(name: string): User;
/**
 * Creates a user with specified age
 * @param name - The user's name
 * @param age - The user's age
 * @returns A user with specified age
 */
function createUser(name: string, age: number): User;
function createUser(name: string, age: number = 18): User {
	return { id: Math.random(), name, age };
}
```

### 4. Test All Overload Signatures

```typescript
// Ensure all overloads work correctly
describe("createUser", () => {
	it("should create user with default age", () => {
		const user = createUser("John");
		expect(user.name).toBe("John");
		expect(user.age).toBe(18);
	});

	it("should create user with specified age", () => {
		const user = createUser("Jane", 25);
		expect(user.name).toBe("Jane");
		expect(user.age).toBe(25);
	});
});
```

## Common Use Cases

### DOM API Wrappers

```typescript
function getElement(id: string): HTMLElement | null;
function getElement(selector: string): NodeListOf<Element>;
function getElement(
	selector: string,
): HTMLElement | null | NodeListOf<Element> {
	if (selector.startsWith("#")) {
		return document.getElementById(selector.slice(1));
	}
	return document.querySelectorAll(selector);
}

// Usage
const element = getElement("#myDiv"); // HTMLElement | null
const elements = getElement(".myClass"); // NodeListOf<Element>
```

### Array-like Operations

```typescript
function first<T>(array: T[]): T;
function first<T>(array: readonly T[]): T;
function first<T>(array: T[] | readonly T[]): T {
	if (array.length === 0) {
		throw new Error("Array is empty");
	}
	return array[0];
}

// Usage
const numbers = [1, 2, 3];
const firstNum = first(numbers); // number

const readonlyNumbers: readonly number[] = [1, 2, 3];
const firstReadonly = first(readonlyNumbers); // number
```

### Event Handlers

```typescript
type EventHandler = (event: Event) => void;

function on(event: string, handler: EventHandler): void;
function on(element: Element, event: string, handler: EventHandler): void;
function on(
	elementOrEvent: Element | string,
	eventOrHandler: string | EventHandler,
	handler?: EventHandler,
): void {
	if (typeof elementOrEvent === "string") {
		// Global event listener
		document.addEventListener(elementOrEvent, eventOrHandler as EventHandler);
	} else {
		// Element-specific event listener
		elementOrEvent.addEventListener(eventOrHandler as string, handler!);
	}
}

// Usage
on("click", handleClick);
on(button, "click", handleClick);
```

### Configuration Objects

```typescript
interface Config {
	timeout?: number;
	retries?: number;
}

function configure(options: Config): void;
function configure(timeout: number): void;
function configure(timeout: number, retries: number): void;
function configure(optionsOrTimeout: Config | number, retries?: number): void {
	let config: Config;

	if (typeof optionsOrTimeout === "number") {
		config = { timeout: optionsOrTimeout, retries };
	} else {
		config = optionsOrTimeout;
	}

	// Apply configuration
	console.log("Configured:", config);
}

// Usage
configure({ timeout: 5000, retries: 3 });
configure(5000);
configure(5000, 3);
```

## Limitations and Considerations

### 1. Implementation Signature Constraints

The implementation signature must be compatible with all overload signatures:

```typescript
// This works
function func(a: string): string;
function func(a: string, b?: number): string;
function func(a: string, b?: number): string {
	return b ? `${a}${b}` : a;
}

// This doesn't work - implementation is too restrictive
function func(a: string): string;
function func(a: string, b?: number): string;
// function func(a: string, b: number): string { // Error: not compatible
//     return `${a}${b}`;
// }
```

### 2. Optional Parameters in Overloads

```typescript
// Careful with optional parameters
function func(a: string): void;
function func(a: string, b?: number): void;
function func(a: string, b?: number): void {
	// Implementation
}

// This can cause confusion
func("hello"); // Matches both overloads
func("hello", undefined); // Also matches both
```

### 3. Generic Constraints

```typescript
// Generics work with overloads
function identity<T>(value: T): T;
function identity(value: unknown): unknown {
	return value;
}

// But be careful with constraints
function process<T extends string>(value: T): string;
function process(value: string): string {
	return value.toUpperCase();
}
```

## Integration with Other TypeScript Features

### With Utility Types

```typescript
type OverloadParameters<T> = T extends {
	(...args: infer A1): any;
	(...args: infer A2): any;
	(...args: infer A3): any;
}
	? A1 | A2 | A3
	: never;

type OverloadReturnType<T> = T extends {
	(...args: any[]): infer R1;
	(...args: any[]): infer R2;
	(...args: any[]): infer R3;
}
	? R1 | R2 | R3
	: never;

// Usage
type FuncParams = OverloadParameters<typeof createUser>; // [name: string] | [name: string, age: number]
type FuncReturn = OverloadReturnType<typeof createUser>; // User
```

### With Conditional Types

```typescript
type IsOverloaded<T> = T extends {
	(...args: any[]): any;
	(...args: any[]): any;
}
	? true
	: false;

type HasMultipleSignatures<T> = IsOverloaded<T> extends true
	? "overloaded"
	: "single";

// Usage
type CreateUserType = HasMultipleSignatures<typeof createUser>; // "overloaded"
```

## Summary

Function overloads provide a powerful way to create type-safe functions with multiple calling conventions. They offer:

- **Type Safety**: Different signatures for different use cases
- **Better IntelliSense**: Context-aware parameter and return type hints
- **API Design**: Clean, intuitive function interfaces
- **Backward Compatibility**: Support multiple calling patterns

Key principles:

- Keep overloads simple and clear
- Ensure implementation signature is compatible with all overloads
- Use when different parameter types should produce different return types
- Document overloads thoroughly
- Test all overload signatures

Function overloads are particularly useful for:

- Utility functions with multiple input types
- API wrappers with different parameter patterns
- Configuration functions with optional parameters
- DOM manipulation functions
- Mathematical or string processing functions

When designing TypeScript APIs, consider function overloads when you need to support multiple calling conventions while maintaining type safety.
