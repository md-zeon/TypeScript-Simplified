# The Void Type in TypeScript

The `void` type in TypeScript represents the absence of a value. It is commonly used to indicate that a function doesn't return any value, or that a variable is intentionally set to `undefined`. While seemingly simple, understanding `void` is crucial for writing type-safe functions and handling side effects properly.

## What is the Void Type?

The `void` type represents the absence of any type. It is different from `undefined` - while `undefined` is a specific value, `void` indicates the lack of a return value.

```typescript
// Function that returns void (doesn't return a value)
function logMessage(message: string): void {
	console.log(message);
	// No return statement needed
}

// Variable explicitly typed as void
let result: void;

// This is allowed (void can be assigned undefined)
result = undefined;

// This is not allowed (void cannot be assigned other values)
// result = null;    // Error
// result = 42;      // Error
// result = "hello"; // Error
```

## Function Return Types

### Explicit Void Return Type

```typescript
// Function that performs side effects but doesn't return a value
function sendEmail(to: string, subject: string, body: string): void {
	// Send email logic here
	console.log(`Email sent to ${to} with subject: ${subject}`);
}

// Event handler functions
function handleClick(event: Event): void {
	console.log("Button clicked");
	event.preventDefault();
}

// Utility functions that mutate data
function updateUser(user: User, updates: Partial<User>): void {
	Object.assign(user, updates);
}
```

### Inferred Void Return Type

```typescript
// TypeScript infers void return type
function printGreeting(name: string) {
	console.log(`Hello, ${name}!`);
}
// Type: (name: string) => void

// Arrow function with inferred void
const logError = (error: Error) => {
	console.error(error.message);
};
// Type: (error: Error) => void
```

## Void vs Undefined

While `void` and `undefined` are related, they serve different purposes:

```typescript
// Void: absence of return value
function doSomething(): void {
	console.log("Doing something");
	// Function doesn't return anything
}

// Undefined: specific value
function getNothing(): undefined {
	return undefined;
}

// Variable that can be undefined
let maybeValue: string | undefined = "hello";
maybeValue = undefined; // OK

// Variable that is void (can only be undefined)
let noValue: void = undefined;
// noValue = "something"; // Error
```

## Void in Function Parameters

### Void as Parameter Type

```typescript
// Function that accepts no arguments
type NoArgsFunction = () => void;

// Function that accepts void (rare, but possible)
function execute(callback: () => void): void {
	callback();
}

// Usage
const myCallback: () => void = () => {
	console.log("Callback executed");
};

execute(myCallback);
```

## Void in Generic Types

### Promise<void>

```typescript
// Promise that resolves to no value
async function sendNotification(userId: string): Promise<void> {
	const user = await getUser(userId);
	await emailService.send(user.email, "Notification", "You have a new message");
	// No return value, just side effects
}

// Usage
sendNotification("user123").then(() => {
	console.log("Notification sent successfully");
});
```

### Generic Constraints with Void

```typescript
// Generic function that works with void-returning functions
function executeIfCondition<T extends () => void>(
	condition: boolean,
	action: T,
): void {
	if (condition) {
		action();
	}
}

// Usage
executeIfCondition(true, () => console.log("Condition met"));
executeIfCondition(false, () => console.log("This won't execute"));
```

## Void in Method Signatures

### Interface Methods Returning Void

```typescript
interface Logger {
	info(message: string): void;
	warn(message: string): void;
	error(message: string, error?: Error): void;
}

class ConsoleLogger implements Logger {
	info(message: string): void {
		console.log(`[INFO] ${message}`);
	}

	warn(message: string): void {
		console.warn(`[WARN] ${message}`);
	}

	error(message: string, error?: Error): void {
		console.error(`[ERROR] ${message}`, error);
	}
}
```

### Abstract Methods

```typescript
abstract class DataProcessor {
	abstract process(data: any): void;
	abstract validate(data: any): boolean;
}

class JsonProcessor extends DataProcessor {
	process(data: any): void {
		console.log("Processing JSON data:", JSON.stringify(data));
	}

	validate(data: any): boolean {
		return typeof data === "object" && data !== null;
	}
}
```

## Void in Callback Functions

### Event Handlers

```typescript
interface EventEmitter {
	on(event: string, handler: () => void): void;
	off(event: string, handler: () => void): void;
	emit(event: string): void;
}

class SimpleEventEmitter implements EventEmitter {
	private handlers: Map<string, (() => void)[]> = new Map();

	on(event: string, handler: () => void): void {
		const handlers = this.handlers.get(event) || [];
		handlers.push(handler);
		this.handlers.set(event, handlers);
	}

	off(event: string, handler: () => void): void {
		const handlers = this.handlers.get(event) || [];
		const index = handlers.indexOf(handler);
		if (index > -1) {
			handlers.splice(index, 1);
		}
	}

	emit(event: string): void {
		const handlers = this.handlers.get(event) || [];
		handlers.forEach((handler) => handler());
	}
}
```

### Array Methods

```typescript
// forEach returns void
const numbers = [1, 2, 3, 4, 5];
numbers.forEach((num: number): void => {
	console.log(num * 2);
});

// map returns an array, not void
const doubled = numbers.map((num: number): number => num * 2);
```

## Void in Union Types

### Optional Void in Unions

```typescript
// Function that might return a value or nothing
type Result<T> = T | void;

// Usage
function findUser(id: string): User | void {
	const users = getAllUsers();
	return users.find((user) => user.id === id);
}

// More explicit version
function findUserExplicit(id: string): User | undefined {
	const users = getAllUsers();
	return users.find((user) => user.id === id);
}
```

## Strict Void Checking

### TypeScript Configuration

```json
// tsconfig.json
{
	"compilerOptions": {
		"strict": true,
		"noImplicitReturns": true,
		"noImplicitAny": true
	}
}
```

### Common Patterns

#### Side Effect Functions

```typescript
// Functions that perform side effects
function saveToDatabase(data: any): void {
	// Save logic here
	localStorage.setItem("data", JSON.stringify(data));
}

function updateUI(element: HTMLElement, content: string): void {
	element.textContent = content;
	element.classList.add("updated");
}

function logAnalytics(event: string, data?: any): void {
	// Analytics tracking
	console.log(`Analytics: ${event}`, data);
}
```

#### Builder Pattern

```typescript
class QueryBuilder {
	private query = "";

	select(fields: string[]): this {
		this.query += `SELECT ${fields.join(", ")} `;
		return this;
	}

	from(table: string): this {
		this.query += `FROM ${table} `;
		return this;
	}

	where(condition: string): this {
		this.query += `WHERE ${condition}`;
		return this;
	}

	execute(): void {
		console.log("Executing query:", this.query.trim());
		// Execute query logic here
	}
}

// Usage
new QueryBuilder()
	.select(["id", "name"])
	.from("users")
	.where("age > 18")
	.execute(); // Returns void
```

## Best Practices

### 1. Use Void for Side Effects

```typescript
// Good: Explicit void for side effect functions
function sendAnalytics(event: string): void {
	analytics.track(event);
}

// Avoid: Returning meaningless values
function sendAnalytics(event: string): boolean {
	analytics.track(event);
	return true; // Unnecessary return value
}
```

### 2. Prefer Void Over Undefined for Return Types

```typescript
// Good: Use void for functions that don't return values
function log(message: string): void {
	console.log(message);
}

// Less clear: Using undefined explicitly
function log(message: string): undefined {
	console.log(message);
	return undefined;
}
```

### 3. Be Explicit with Void in Interfaces

```typescript
// Good: Explicit void in interfaces
interface FileSystem {
	readFile(path: string): Promise<string>;
	writeFile(path: string, content: string): Promise<void>;
	deleteFile(path: string): Promise<void>;
}

// Avoid: Implicit void
interface FileSystem {
	readFile(path: string): Promise<string>;
	writeFile(path: string, content: string): Promise<any>; // Unclear intent
	deleteFile(path: string): Promise<any>; // Unclear intent
}
```

### 4. Use Void in Generic Constraints Appropriately

```typescript
// Good: Constrain to void-returning functions
function executeAfterDelay<T extends () => void>(
	delay: number,
	callback: T,
): void {
	setTimeout(callback, delay);
}

// Avoid: Overly broad constraints
function executeAfterDelay(callback: Function): void {
	setTimeout(callback, 1000); // Less type-safe
}
```

## Common Mistakes

### 1. Confusing Void with Undefined

```typescript
// Mistake: Thinking void means undefined
function getData(): void {
	return undefined; // This is actually valid but confusing
}

// Better: Be explicit about intent
function processData(): void {
	// Process data without returning
}

function getOptionalData(): undefined | Data {
	return Math.random() > 0.5 ? undefined : { value: "data" };
}
```

### 2. Using Void When a Return Value is Needed

```typescript
// Mistake: Using void when a value is expected
function calculateTotal(items: number[]): void {
	const total = items.reduce((sum, item) => sum + item, 0);
	console.log(total); // Side effect, but caller can't use the result
}

// Better: Return the calculated value
function calculateTotal(items: number[]): number {
	return items.reduce((sum, item) => sum + item, 0);
}
```

### 3. Void in Variable Declarations

```typescript
// Usually unnecessary: Variable typed as void
let result: void = undefined;

// Better: Use undefined if you need to represent "no value"
let result: undefined = undefined;

// Or use union types if appropriate
let result: string | undefined = undefined;
```

## Summary

- **`void` represents the absence of a return value**, not the `undefined` value itself
- **Use `void` for functions that perform side effects** without returning data
- **Explicit `void` annotations** make function intentions clear
- **Prefer `void` over `undefined`** for function return types when no value is returned
- **Void is essential** for type-safe callback functions and event handlers
- **Common in interfaces** for methods that mutate state or perform I/O operations

Mastering the `void` type helps write clearer, more intentional TypeScript code where the absence of return values is explicitly communicated to other developers and the type system.
