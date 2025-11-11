# Unknown Type in TypeScript

The `unknown` type is TypeScript's type-safe alternative to `any`. It represents values whose type is not known at compile time, requiring explicit type checking before use. Introduced in TypeScript 3.0, `unknown` helps maintain type safety when working with dynamic or external data.

## What is the Unknown Type?

`unknown` is the top type in TypeScript's type hierarchy - it's a supertype of all other types. This means:

- Any value can be assigned to `unknown`
- `unknown` can only be assigned to `unknown` or `any`
- You must narrow the type before performing operations

```typescript
// Any value can be assigned to unknown
let value: unknown;
value = "hello";
value = 42;
value = true;
value = { name: "John" };
value = [1, 2, 3];

// unknown can only be assigned to unknown or any
let unknownValue: unknown = "test";
let anyValue: any = unknownValue; // OK
// let stringValue: string = unknownValue; // Error: Type 'unknown' is not assignable to type 'string'
```

## Unknown vs Any

While both `unknown` and `any` allow any value, they differ significantly in type safety:

```typescript
let anyValue: any = "hello";
let unknownValue: unknown = "hello";

// With any - no type checking
console.log(anyValue.toUpperCase()); // OK at compile time, but may fail at runtime
console.log(anyValue.someMethod()); // OK at compile time

// With unknown - type checking required
// console.log(unknownValue.toUpperCase()); // Error: Property 'toUpperCase' does not exist on type 'unknown'
```

## Type Narrowing

To use values of type `unknown`, you must narrow them to more specific types:

### typeof Checks

```typescript
function processValue(value: unknown): string {
	if (typeof value === "string") {
		// TypeScript knows value is string here
		return value.toUpperCase();
	}

	if (typeof value === "number") {
		// TypeScript knows value is number here
		return value.toFixed(2);
	}

	if (typeof value === "boolean") {
		// TypeScript knows value is boolean here
		return value ? "True" : "False";
	}

	return "Unknown type";
}

// Usage
console.log(processValue("hello")); // "HELLO"
console.log(processValue(42)); // "42.00"
console.log(processValue(true)); // "True"
```

### instanceof Checks

```typescript
class Dog {
	bark(): void {
		console.log("Woof!");
	}
}

class Cat {
	meow(): void {
		console.log("Meow!");
	}
}

function makeSound(animal: unknown): void {
	if (animal instanceof Dog) {
		// TypeScript knows animal is Dog
		animal.bark();
	} else if (animal instanceof Cat) {
		// TypeScript knows animal is Cat
		animal.meow();
	} else {
		console.log("Unknown animal");
	}
}

// Usage
const dog = new Dog();
const cat = new Cat();
makeSound(dog); // "Woof!"
makeSound(cat); // "Meow!"
makeSound("not an animal"); // "Unknown animal"
```

### Custom Type Guards

```typescript
interface User {
	id: number;
	name: string;
	email: string;
}

function isUser(value: unknown): value is User {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"name" in value &&
		"email" in value &&
		typeof (value as User).id === "number" &&
		typeof (value as User).name === "string" &&
		typeof (value as User).email === "string"
	);
}

function processUser(value: unknown): void {
	if (isUser(value)) {
		// TypeScript knows value is User
		console.log(`User: ${value.name} (${value.email})`);
	} else {
		console.log("Not a valid user");
	}
}

// Usage
const validUser = { id: 1, name: "John", email: "john@example.com" };
const invalidUser = { name: "Jane" };

processUser(validUser); // "User: John (john@example.com)"
processUser(invalidUser); // "Not a valid user"
```

## Working with External Data

### JSON Parsing

```typescript
// Simulating JSON.parse result
function parseJson(jsonString: string): unknown {
	try {
		return JSON.parse(jsonString);
	} catch {
		return undefined;
	}
}

interface ApiResponse {
	userId: number;
	title: string;
	completed: boolean;
}

function processApiResponse(response: unknown): ApiResponse | null {
	if (
		typeof response === "object" &&
		response !== null &&
		"userId" in response &&
		"title" in response &&
		"completed" in response &&
		typeof (response as ApiResponse).userId === "number" &&
		typeof (response as ApiResponse).title === "string" &&
		typeof (response as ApiResponse).completed === "boolean"
	) {
		return response as ApiResponse;
	}
	return null;
}

// Usage
const jsonData = '{"userId": 1, "title": "Test", "completed": false}';
const parsed = parseJson(jsonData);
const apiResponse = processApiResponse(parsed);

if (apiResponse) {
	console.log(
		`Task: ${apiResponse.title}, Completed: ${apiResponse.completed}`,
	);
} else {
	console.log("Invalid API response");
}
```

### User Input Validation

```typescript
function validateAndProcessInput(input: unknown): string {
	// First check if it's a string
	if (typeof input !== "string") {
		throw new Error("Input must be a string");
	}

	// Now TypeScript knows input is string
	const trimmed = input.trim();

	if (trimmed.length === 0) {
		throw new Error("Input cannot be empty");
	}

	if (trimmed.length > 100) {
		throw new Error("Input too long");
	}

	return trimmed.toUpperCase();
}

// Usage
try {
	console.log(validateAndProcessInput("  hello world  ")); // "HELLO WORLD"
	console.log(validateAndProcessInput(123)); // Error: Input must be a string
} catch (error) {
	console.error(error.message);
}
```

## Advanced Patterns

### Generic Unknown Handling

```typescript
function safeJsonParse<T>(jsonString: string): T | null {
	try {
		const parsed: unknown = JSON.parse(jsonString);
		// In a real scenario, you'd validate the structure here
		return parsed as T;
	} catch {
		return null;
	}
}

// Usage
interface Config {
	apiUrl: string;
	timeout: number;
}

const config = safeJsonParse<Config>(
	'{"apiUrl": "https://api.example.com", "timeout": 5000}',
);
if (config) {
	console.log(`API URL: ${config.apiUrl}`);
}
```

### Unknown in Union Types

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };

function handleApiCall<T>(response: unknown): Result<T> {
	if (
		typeof response === "object" &&
		response !== null &&
		"success" in response &&
		typeof (response as any).success === "boolean"
	) {
		const apiResponse = response as Result<T>;
		if (apiResponse.success) {
			return apiResponse;
		} else {
			return apiResponse;
		}
	}

	return { success: false, error: "Invalid response format" };
}

// Usage
const mockResponse = { success: true, data: { id: 1, name: "John" } };
const result = handleApiCall(mockResponse);

if (result.success) {
	console.log(result.data);
} else {
	console.error(result.error);
}
```

### Assertion Functions with Unknown

```typescript
function assertIsString(value: unknown): asserts value is string {
	if (typeof value !== "string") {
		throw new Error("Value must be a string");
	}
}

function assertIsObject(value: unknown): asserts value is object {
	if (typeof value !== "object" || value === null) {
		throw new Error("Value must be a non-null object");
	}
}

function processConfig(config: unknown): void {
	assertIsObject(config);
	assertIsString((config as any).apiUrl);

	// Now TypeScript knows config is an object and has apiUrl as string
	console.log(`API URL: ${(config as { apiUrl: string }).apiUrl}`);
}

// Usage
const validConfig = { apiUrl: "https://api.example.com" };
processConfig(validConfig); // "API URL: https://api.example.com"

const invalidConfig = "not an object";
try {
	processConfig(invalidConfig);
} catch (error) {
	console.error(error.message); // "Value must be a non-null object"
}
```

## Unknown in Function Parameters

### Callback Functions

```typescript
type Callback<T> = (data: T) => void;

function withCallback<T>(
	data: unknown,
	callback: Callback<T>,
	validator: (value: unknown) => value is T,
): void {
	if (validator(data)) {
		callback(data);
	} else {
		console.error("Invalid data format");
	}
}

// Usage
function isNumberArray(value: unknown): value is number[] {
	return (
		Array.isArray(value) && value.every((item) => typeof item === "number")
	);
}

const callback: Callback<number[]> = (numbers) => {
	console.log(`Sum: ${numbers.reduce((a, b) => a + b, 0)}`);
};

withCallback([1, 2, 3, 4], callback, isNumberArray); // "Sum: 10"
withCallback("not an array", callback, isNumberArray); // "Invalid data format"
```

### Event Handlers

```typescript
interface CustomEvent<T = unknown> {
	type: string;
	payload: T;
}

function handleEvent(event: unknown): void {
	if (
		typeof event === "object" &&
		event !== null &&
		"type" in event &&
		"payload" in event &&
		typeof (event as CustomEvent).type === "string"
	) {
		const customEvent = event as CustomEvent;

		switch (customEvent.type) {
			case "user_login":
				console.log(`User logged in: ${customEvent.payload}`);
				break;
			case "data_update":
				console.log(`Data updated: ${JSON.stringify(customEvent.payload)}`);
				break;
			default:
				console.log(`Unknown event: ${customEvent.type}`);
		}
	} else {
		console.error("Invalid event format");
	}
}

// Usage
handleEvent({ type: "user_login", payload: "john@example.com" });
handleEvent({ type: "data_update", payload: { id: 1, status: "active" } });
handleEvent("not an event"); // "Invalid event format"
```

## Utility Functions for Unknown

### Type-Safe Property Access

```typescript
function getProperty<T>(obj: unknown, key: string): T | undefined {
	if (typeof obj === "object" && obj !== null && key in obj) {
		return (obj as Record<string, T>)[key];
	}
	return undefined;
}

function hasProperty(obj: unknown, key: string): boolean {
	return typeof obj === "object" && obj !== null && key in obj;
}

// Usage
const user = { name: "John", age: 30 };
console.log(getProperty<string>(user, "name")); // "John"
console.log(getProperty<number>(user, "age")); // 30
console.log(getProperty<string>(user, "email")); // undefined
console.log(hasProperty(user, "name")); // true
console.log(hasProperty(user, "email")); // false
```

### Safe Type Conversion

```typescript
function asString(value: unknown): string {
	if (typeof value === "string") {
		return value;
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	if (value === null || value === undefined) {
		return "";
	}
	return "[object Object]";
}

function asNumber(value: unknown): number {
	if (typeof value === "number") {
		return value;
	}
	if (typeof value === "string") {
		const parsed = parseFloat(value);
		return isNaN(parsed) ? 0 : parsed;
	}
	if (typeof value === "boolean") {
		return value ? 1 : 0;
	}
	return 0;
}

// Usage
console.log(asString("hello")); // "hello"
console.log(asString(42)); // "42"
console.log(asString({})); // "[object Object]"

console.log(asNumber("3.14")); // 3.14
console.log(asNumber(true)); // 1
console.log(asNumber("not a number")); // 0
```

## Best Practices

### 1. Prefer Unknown over Any

```typescript
// Avoid: Using any loses type safety
function processData(data: any): void {
	console.log(data.someProperty); // No type checking
}

// Good: Using unknown requires type checking
function processData(data: unknown): void {
	if (typeof data === "object" && data !== null && "someProperty" in data) {
		console.log((data as { someProperty: unknown }).someProperty);
	}
}
```

### 2. Create Specific Type Guards

```typescript
// Good: Specific type guards for your domain
function isValidUser(user: unknown): user is User {
	return (
		typeof user === "object" &&
		user !== null &&
		"id" in user &&
		typeof (user as User).id === "number" &&
		"name" in user &&
		typeof (user as User).name === "string" &&
		"email" in user &&
		typeof (user as User).email === "string"
	);
}

// Usage
function handleUser(user: unknown): void {
	if (isValidUser(user)) {
		// TypeScript knows user is User
		console.log(`Welcome ${user.name}!`);
	}
}
```

### 3. Use Assertion Functions for Validation

```typescript
function assertIsDefined<T>(value: unknown): asserts value is T {
	if (value === undefined || value === null) {
		throw new Error("Value must be defined");
	}
}

function processUserData(data: unknown): void {
	assertIsDefined(data);
	// Now data is not null or undefined

	if (typeof data === "object") {
		// Further type narrowing...
	}
}
```

### 4. Handle External Data Carefully

```typescript
// Good: Validate external data thoroughly
function processExternalData(data: unknown): void {
	if (typeof data !== "object" || data === null) {
		throw new Error("Data must be an object");
	}

	const obj = data as Record<string, unknown>;

	if (typeof obj.id !== "number") {
		throw new Error("ID must be a number");
	}

	if (typeof obj.name !== "string") {
		throw new Error("Name must be a string");
	}

	// Now we can safely use the data
	console.log(`Processing user ${obj.name} with ID ${obj.id}`);
}
```

## Common Patterns and Anti-Patterns

### Anti-Pattern: Type Assertion Without Checks

```typescript
// Bad: Type assertion without validation
function badFunction(data: unknown): void {
	const user = data as User; // Dangerous!
	console.log(user.name); // May fail at runtime
}

// Good: Validate before assertion
function goodFunction(data: unknown): void {
	if (isUser(data)) {
		console.log(data.name); // Safe
	}
}
```

### Pattern: Progressive Type Narrowing

```typescript
function processComplexData(data: unknown): void {
	// First level: Check if object
	if (typeof data !== "object" || data === null) {
		console.error("Data must be an object");
		return;
	}

	// Second level: Check required properties
	const obj = data as Record<string, unknown>;
	if (!("type" in obj) || typeof obj.type !== "string") {
		console.error("Data must have a type property");
		return;
	}

	// Third level: Handle different types
	switch (obj.type) {
		case "user":
			if (isUser(obj)) {
				console.log(`Processing user: ${obj.name}`);
			}
			break;
		case "product":
			if (isProduct(obj)) {
				console.log(`Processing product: ${obj.name}`);
			}
			break;
		default:
			console.error(`Unknown data type: ${obj.type}`);
	}
}
```

### Pattern: Safe JSON Schema Validation

```typescript
interface UserSchema {
	id: number;
	name: string;
	email: string;
	roles: string[];
}

function validateUserSchema(data: unknown): data is UserSchema {
	if (typeof data !== "object" || data === null) return false;

	const obj = data as Record<string, unknown>;

	return (
		typeof obj.id === "number" &&
		typeof obj.name === "string" &&
		typeof obj.email === "string" &&
		Array.isArray(obj.roles) &&
		obj.roles.every((role) => typeof role === "string")
	);
}

function processUserFromApi(apiData: unknown): void {
	if (validateUserSchema(apiData)) {
		// TypeScript knows apiData conforms to UserSchema
		console.log(`User ${apiData.name} has roles: ${apiData.roles.join(", ")}`);
	} else {
		console.error("Invalid user data from API");
	}
}
```

## Summary

The `unknown` type is TypeScript's type-safe approach to handling values of uncertain type. Key principles:

- **Type Safety**: Requires explicit type checking before use
- **Flexibility**: Accepts any value but restricts unsafe operations
- **External Data**: Ideal for JSON parsing, API responses, user input
- **Type Guards**: Use typeof, instanceof, and custom guards to narrow types

Benefits of using `unknown`:

- **Runtime Safety**: Prevents type-related runtime errors
- **Better IntelliSense**: IDE support for narrowed types
- **Maintainable Code**: Forces explicit type handling
- **Refactoring Safety**: Catches type mismatches during changes

Use `unknown` whenever you're dealing with data from external sources, user input, or any situation where the type isn't known at compile time. Combine it with proper type guards and validation to maintain type safety throughout your application.
