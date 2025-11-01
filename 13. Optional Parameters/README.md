# Optional Parameters in TypeScript

Optional parameters allow functions to be called with fewer arguments than they are defined to accept. In TypeScript, optional parameters provide flexibility while maintaining type safety. This section explores how to define and work with optional parameters effectively.

## Basic Optional Parameters

### Using the Question Mark Operator

The `?` operator marks a parameter as optional. Optional parameters must come after all required parameters.

```typescript
// Basic optional parameter
function greet(name: string, greeting?: string): string {
	return `${greeting || "Hello"}, ${name}!`;
}

// Usage
console.log(greet("Alice")); // "Hello, Alice!"
console.log(greet("Bob", "Hi")); // "Hi, Bob!"
```

### Multiple Optional Parameters

```typescript
function createUser(
	name: string,
	age?: number,
	email?: string,
	isActive?: boolean,
): User {
	return {
		name,
		age: age || 18,
		email: email || `${name.toLowerCase()}@example.com`,
		isActive: isActive !== undefined ? isActive : true,
	};
}

// All combinations are valid
const user1 = createUser("Alice");
const user2 = createUser("Bob", 25);
const user3 = createUser("Charlie", 30, "charlie@example.com");
const user4 = createUser("David", 28, "david@example.com", false);
```

## Default Parameters vs Optional Parameters

### Default Parameters

Default parameters provide a value when no argument is passed, and they don't require the `?` operator.

```typescript
// Default parameters
function createConfig(
	host: string = "localhost",
	port: number = 8080,
	ssl: boolean = false,
): Config {
	return { host, port, ssl };
}

// Usage
const config1 = createConfig(); // { host: "localhost", port: 8080, ssl: false }
const config2 = createConfig("api.example.com"); // { host: "api.example.com", port: 8080, ssl: false }
const config3 = createConfig("api.example.com", 443, true); // { host: "api.example.com", port: 443, ssl: true }
```

### Optional Parameters with Default Values

You can combine optional parameters with default values for more control:

```typescript
function sendRequest(
	url: string,
	method?: string,
	headers?: Record<string, string>,
	timeout: number = 5000,
): Promise<Response> {
	const requestMethod = method || "GET";
	const requestHeaders = headers || {};
	// Implementation
}

// Usage
sendRequest("/api/users"); // method: "GET", headers: {}, timeout: 5000
sendRequest("/api/users", "POST"); // method: "POST", headers: {}, timeout: 5000
sendRequest("/api/users", "POST", { "Content-Type": "application/json" }); // method: "POST", custom headers, timeout: 5000
sendRequest(
	"/api/users",
	"POST",
	{ "Content-Type": "application/json" },
	10000,
); // All parameters specified
```

## Optional Parameters in Interfaces

### Method Signatures with Optional Parameters

```typescript
interface Database {
	connect(host?: string, port?: number): Promise<void>;
	query(sql: string, params?: any[]): Promise<any[]>;
	disconnect(): Promise<void>;
}

class PostgreSQLDatabase implements Database {
	async connect(
		host: string = "localhost",
		port: number = 5432,
	): Promise<void> {
		console.log(`Connecting to PostgreSQL at ${host}:${port}`);
		// Connection logic
	}

	async query(sql: string, params: any[] = []): Promise<any[]> {
		console.log(`Executing: ${sql} with params:`, params);
		// Query logic
		return [];
	}

	async disconnect(): Promise<void> {
		console.log("Disconnecting from PostgreSQL");
		// Disconnect logic
	}
}
```

### Optional Properties in Function Parameters

```typescript
interface UserQuery {
	name?: string;
	age?: number;
	email?: string;
	isActive?: boolean;
}

function findUsers(query: UserQuery = {}): User[] {
	const { name, age, email, isActive } = query;
	// Filter logic based on provided criteria
	console.log("Searching for users with:", { name, age, email, isActive });
	return [];
}

// Usage
findUsers(); // Empty query object
findUsers({ name: "Alice" }); // Search by name only
findUsers({ age: 25, isActive: true }); // Search by age and active status
```

## Advanced Patterns

### Optional Parameters with Type Guards

```typescript
function processValue(value?: string | number): string {
	// Type guard to check if value is provided
	if (value === undefined) {
		return "No value provided";
	}

	// TypeScript knows value is string | number here
	if (typeof value === "string") {
		return value.toUpperCase();
	} else {
		return value.toFixed(2);
	}
}

// Usage
console.log(processValue()); // "No value provided"
console.log(processValue("hello")); // "HELLO"
console.log(processValue(42)); // "42.00"
```

### Optional Parameters in Generic Functions

```typescript
function createList<T>(
	items: T[],
	sortBy?: keyof T,
	sortOrder: "asc" | "desc" = "asc",
): T[] {
	if (!sortBy) {
		return [...items];
	}

	return [...items].sort((a, b) => {
		const aValue = a[sortBy];
		const bValue = b[sortBy];

		if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
		if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
		return 0;
	});
}

// Usage
interface Person {
	name: string;
	age: number;
}

const people: Person[] = [
	{ name: "Alice", age: 25 },
	{ name: "Bob", age: 30 },
	{ name: "Charlie", age: 20 },
];

console.log(createList(people)); // No sorting
console.log(createList(people, "name")); // Sort by name ascending
console.log(createList(people, "age", "desc")); // Sort by age descending
```

### Function Overloads with Optional Parameters

```typescript
// Function overloads for different optional parameter combinations
function formatDate(date: Date): string;
function formatDate(date: Date, format: string): string;
function formatDate(date: Date, locale?: string, timeZone?: string): string;
function formatDate(
	date: Date,
	formatOrLocale?: string,
	timeZone?: string,
): string {
	if (!formatOrLocale) {
		return date.toLocaleDateString();
	}

	if (timeZone) {
		return date.toLocaleDateString(formatOrLocale, { timeZone });
	}

	// Check if formatOrLocale is a format string or locale
	if (formatOrLocale.includes("/")) {
		// Assume it's a format string like "YYYY-MM-DD"
		return "2023-10-15"; // Simplified
	} else {
		return date.toLocaleDateString(formatOrLocale);
	}
}

// Usage
const date = new Date();
console.log(formatDate(date)); // Basic formatting
console.log(formatDate(date, "en-US")); // With locale
console.log(formatDate(date, "en-US", "UTC")); // With locale and timezone
```

## Optional Parameters in Callbacks

### Callback Functions with Optional Parameters

```typescript
type Callback<T> = (result: T, error?: Error) => void;

function fetchData<T>(
	url: string,
	callback: Callback<T>,
	timeout?: number,
): void {
	const timeoutMs = timeout || 5000;

	setTimeout(() => {
		// Simulate API call
		const success = Math.random() > 0.1; // 90% success rate

		if (success) {
			const data = { id: 1, name: "Test Data" } as T;
			callback(data);
		} else {
			callback(null as T, new Error("Network error"));
		}
	}, Math.random() * timeoutMs);
}

// Usage
fetchData("/api/data", (result, error) => {
	if (error) {
		console.error("Error:", error.message);
	} else {
		console.log("Success:", result);
	}
});
```

## Best Practices

### 1. Use Optional Parameters for Flexibility

```typescript
// Good: Optional parameters for flexible APIs
function createElement(
	tag: string,
	attributes?: Record<string, string>,
	children?: string[],
): HTMLElement {
	// Implementation
}

// Avoid: Required parameters for everything
function createElement(
	tag: string,
	attributes: Record<string, string>,
	children: string[],
	classes: string[],
	id: string,
): HTMLElement {
	// Too many required parameters
}
```

### 2. Prefer Default Parameters for Simple Cases

```typescript
// Good: Default parameters for simple defaults
function connect(host: string = "localhost", port: number = 8080): void {
	console.log(`Connecting to ${host}:${port}`);
}

// OK: Optional parameters when undefined has special meaning
function findUser(id?: string): User | null {
	if (!id) {
		return null; // Special case: return null when no id provided
	}
	// Search logic
}
```

### 3. Use Union Types for Complex Optional Logic

```typescript
// Good: Union types for different parameter combinations
type SearchOptions =
	| { query: string; limit?: number }
	| { userId: string; includeInactive?: boolean };

function search(options: SearchOptions): Result[] {
	if ("query" in options) {
		// Search by query
		return [];
	} else {
		// Search by user ID
		return [];
	}
}

// Usage
search({ query: "typescript" });
search({ userId: "123", includeInactive: true });
```

### 4. Document Optional Parameters

```typescript
/**
 * Creates a new user account
 * @param name - The user's full name (required)
 * @param email - The user's email address (required)
 * @param age - The user's age (optional, defaults to 18)
 * @param role - The user's role (optional, defaults to "user")
 */
function createUser(
	name: string,
	email: string,
	age?: number,
	role: "admin" | "user" | "moderator" = "user",
): User {
	return {
		name,
		email,
		age: age || 18,
		role,
	};
}
```

### 5. Avoid Too Many Optional Parameters

```typescript
// Avoid: Too many optional parameters (hard to use)
function complexFunction(
	a?: string,
	b?: number,
	c?: boolean,
	d?: string[],
	e?: object,
	f?: Function,
): any {
	// Implementation
}

// Better: Use options object
interface ComplexOptions {
	a?: string;
	b?: number;
	c?: boolean;
	d?: string[];
	e?: object;
	f?: Function;
}

function complexFunction(options: ComplexOptions = {}): any {
	const { a, b, c, d, e, f } = options;
	// Implementation
}
```

## Common Patterns

### Builder Pattern with Optional Methods

```typescript
class QueryBuilder {
	private conditions: string[] = [];
	private limitValue?: number;
	private offsetValue?: number;

	where(condition: string): this {
		this.conditions.push(condition);
		return this;
	}

	limit(value: number): this {
		this.limitValue = value;
		return this;
	}

	offset(value: number): this {
		this.offsetValue = value;
		return this;
	}

	build(): string {
		let query = "SELECT * FROM users";

		if (this.conditions.length > 0) {
			query += ` WHERE ${this.conditions.join(" AND ")}`;
		}

		if (this.limitValue !== undefined) {
			query += ` LIMIT ${this.limitValue}`;
		}

		if (this.offsetValue !== undefined) {
			query += ` OFFSET ${this.offsetValue}`;
		}

		return query;
	}
}

// Usage - all methods are optional
const query1 = new QueryBuilder().build();
const query2 = new QueryBuilder().where("age > 18").build();
const query3 = new QueryBuilder()
	.where("age > 18")
	.where("status = 'active'")
	.limit(10)
	.offset(20)
	.build();
```

### Optional Parameters in React Components

```typescript
interface ButtonProps {
	children: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	variant?: "primary" | "secondary" | "danger";
	size?: "small" | "medium" | "large";
}

function Button({
	children,
	onClick,
	disabled = false,
	variant = "primary",
	size = "medium",
}: ButtonProps): JSX.Element {
	return (
		<button
			className={`btn btn-${variant} btn-${size}`}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</button>
	);
}

// Usage
<Button>Click me</Button>
<Button onClick={() => console.log("clicked")} variant="secondary">
	Secondary Button
</Button>
```

## TypeScript Configuration

### Strict Optional Parameters

```json
// tsconfig.json
{
	"compilerOptions": {
		"strict": true,
		"noImplicitAny": true,
		"strictNullChecks": true,
		"exactOptionalPropertyTypes": true // Makes optional properties more strict
	}
}
```

## Summary

- **Optional parameters** use the `?` operator and must come after required parameters
- **Default parameters** provide fallback values without requiring the `?` operator
- **Combine both** for flexible function signatures with sensible defaults
- **Use options objects** for functions with many optional parameters
- **Document optional parameters** clearly in function documentation
- **Consider function overloads** for complex optional parameter logic

Optional parameters make functions more flexible and easier to use while maintaining type safety. Use them judiciously to create clean, intuitive APIs.
