# Readonly Utility Type in TypeScript

The `Readonly` utility type in TypeScript creates a new type where all properties of the original type are marked as readonly. This prevents modification of object properties after initialization, providing immutability guarantees at compile time. `Readonly<T>` makes every property of `T` readonly, creating a deeply immutable version of the type.

## Basic Readonly Usage

### Simple Readonly Objects

```typescript
interface User {
	name: string;
	email: string;
	age: number;
}

type ReadonlyUser = Readonly<User>;
// Equivalent to: { readonly name: string; readonly email: string; readonly age: number; }

const user: ReadonlyUser = {
	name: "Alice",
	email: "alice@example.com",
	age: 30,
};

// All properties are readonly
// user.name = "Bob"; // Error: Cannot assign to 'name' because it is a read-only property
// user.age = 31; // Error: Cannot assign to 'age' because it is a read-only property
```

### Readonly Arrays

```typescript
const numbers: ReadonlyArray<number> = [1, 2, 3, 4, 5];

// numbers.push(6); // Error: Property 'push' does not exist on type 'readonly number[]'
// numbers[0] = 10; // Error: Index signature in type 'readonly number[]' only permits reading

// Reading is allowed
console.log(numbers[0]); // 1
console.log(numbers.length); // 5
```

### Readonly with Primitives

```typescript
// Readonly doesn't make primitives immutable (they already are)
type ReadonlyString = Readonly<string>; // Still just string
type ReadonlyNumber = Readonly<number>; // Still just number

// But useful for complex types
type ReadonlyConfig = Readonly<{
	apiUrl: string;
	timeout: number;
	features: string[];
}>;

// Equivalent to:
// {
//   readonly apiUrl: string;
//   readonly timeout: number;
//   readonly features: readonly string[];
// }
```

## Readonly vs Const

### Key Differences

```typescript
// const prevents reassignment of the variable
const constantValue = 42;
// constantValue = 43; // Error

// Readonly prevents mutation of object properties
const readonlyObject: Readonly<{ value: number }> = { value: 42 };
// readonlyObject.value = 43; // Error: readonly property

// const with object - prevents reassignment but allows mutation
const mutableObject = { value: 42 };
mutableObject.value = 43; // Allowed - only reassignment is prevented

// const with readonly object - both reassignment and mutation prevented
const readonlyObject2: Readonly<{ value: number }> = { value: 42 };
// readonlyObject2 = { value: 43 }; // Error: const reassignment
// readonlyObject2.value = 43; // Error: readonly property
```

## Deep Readonly

### Creating Deeply Immutable Types

```typescript
type DeepReadonly<T> = {
	readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

interface NestedConfig {
	database: {
		host: string;
		port: number;
		credentials: {
			username: string;
			password: string;
		};
	};
	features: {
		auth: boolean;
		cache: {
			enabled: boolean;
			size: number;
		};
	};
}

// Regular Readonly only affects top level
type ShallowReadonlyConfig = Readonly<NestedConfig>;
// {
//   readonly database: { host: string; port: number; credentials: { username: string; password: string; } };
//   readonly features: { auth: boolean; cache: { enabled: boolean; size: number; } };
// }

// Deep Readonly affects all levels
type DeepReadonlyConfig = DeepReadonly<NestedConfig>;
// {
//   readonly database: {
//     readonly host: string;
//     readonly port: number;
//     readonly credentials: {
//       readonly username: string;
//       readonly password: string;
//     };
//   };
//   readonly features: {
//     readonly auth: boolean;
//     readonly cache: {
//       readonly enabled: boolean;
//       readonly size: number;
//     };
//   };
// }
```

## Readonly in Function Parameters

### Preventing Mutation in Functions

```typescript
interface CartItem {
	id: number;
	name: string;
	price: number;
	quantity: number;
}

function calculateTotal(items: ReadonlyArray<Readonly<CartItem>>): number {
	// Function cannot modify the items or their properties
	return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

const cart: CartItem[] = [
	{ id: 1, name: "Laptop", price: 1000, quantity: 1 },
	{ id: 2, name: "Mouse", price: 50, quantity: 2 },
];

const total = calculateTotal(cart); // OK - function receives readonly view
console.log(total); // 1100

// Original cart can still be modified
cart.push({ id: 3, name: "Keyboard", price: 100, quantity: 1 });
```

### Readonly Parameters for Safety

```typescript
class UserService {
	private users: User[] = [];

	addUser(userData: Readonly<Omit<User, "id" | "createdAt">>): User {
		// Function cannot modify the input data
		const user: User = {
			id: Date.now(),
			createdAt: new Date(),
			...userData,
		};

		this.users.push(user);
		return user;
	}

	updateUser(
		id: number,
		updates: Readonly<Partial<Pick<User, "name" | "email">>>,
	): User | null {
		const user = this.users.find((u) => u.id === id);
		if (!user) return null;

		// Cannot modify the updates object
		Object.assign(user, updates);
		return user;
	}
}
```

## Readonly with Classes

### Readonly Properties in Classes

```typescript
class Configuration {
	readonly apiUrl: string;
	readonly timeout: number;
	readonly features: ReadonlyArray<string>;

	constructor(
		config: Readonly<{
			apiUrl: string;
			timeout: number;
			features: string[];
		}>,
	) {
		this.apiUrl = config.apiUrl;
		this.timeout = config.timeout;
		this.features = config.features;
	}

	// Methods cannot modify readonly properties
	updateTimeout(newTimeout: number): Configuration {
		// Cannot modify this.timeout directly
		// this.timeout = newTimeout; // Error

		// Return new instance instead
		return new Configuration({
			apiUrl: this.apiUrl,
			timeout: newTimeout,
			features: [...this.features],
		});
	}
}
```

### Readonly Class Instances

```typescript
class ImmutablePoint {
	constructor(readonly x: number, readonly y: number) {}

	translate(dx: number, dy: number): ImmutablePoint {
		return new ImmutablePoint(this.x + dx, this.y + dy);
	}

	distanceTo(other: ImmutablePoint): number {
		const dx = other.x - this.x;
		const dy = other.y - this.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
}

const point1 = new ImmutablePoint(10, 20);
const point2 = point1.translate(5, 5);

// point1.x = 15; // Error: readonly property
// point2.y = 30; // Error: readonly property
```

## Readonly with Utility Types

### Combining Readonly with Other Utilities

```typescript
interface Product {
	id: number;
	name: string;
	price: number;
	category: string;
	tags: string[];
	metadata: {
		createdAt: Date;
		updatedAt: Date;
		version: number;
	};
}

// Create different readonly variations
type ReadonlyProduct = Readonly<Product>;
type ReadonlyProductMetadata = Product & {
	readonly metadata: Readonly<Product["metadata"]>;
};
type ReadonlyProductTags = Product & {
	readonly tags: ReadonlyArray<string>;
};

// For API responses - make everything readonly
type ProductResponse = Readonly<Product>;

// For form data - allow partial updates
type ProductUpdate = Partial<
	Pick<Product, "name" | "price" | "category" | "tags">
>;

// For creation - exclude auto-generated fields
type ProductCreate = Readonly<Omit<Product, "id" | "metadata">>;
```

### Readonly Utility Type Combinations

```typescript
// Create immutable versions of utility types
type ImmutablePartial<T> = Readonly<Partial<T>>;
type ImmutableRequired<T> = Readonly<Required<T>>;
type ImmutablePick<T, K extends keyof T> = Readonly<Pick<T, K>>;
type ImmutableOmit<T, K extends keyof T> = Readonly<Omit<T, K>>;
type ImmutableRecord<K extends string | number | symbol, V> = Readonly<
	Record<K, V>
>;
```

## Practical Examples

### Immutable State Management

```typescript
interface AppState {
	user: {
		id: number;
		name: string;
		email: string;
		isLoggedIn: boolean;
	};
	settings: {
		theme: "light" | "dark";
		language: string;
		notifications: boolean;
	};
	counter: number;
}

type ImmutableAppState = Readonly<AppState>;

class StateManager {
	private state: ImmutableAppState;

	constructor(initialState: ImmutableAppState) {
		this.state = initialState;
	}

	// Return new state instead of mutating
	login(userData: {
		id: number;
		name: string;
		email: string;
	}): ImmutableAppState {
		return {
			...this.state,
			user: {
				...userData,
				isLoggedIn: true,
			},
		};
	}

	updateSettings(
		settings: Partial<ImmutableAppState["settings"]>,
	): ImmutableAppState {
		return {
			...this.state,
			settings: {
				...this.state.settings,
				...settings,
			},
		};
	}

	incrementCounter(): ImmutableAppState {
		return {
			...this.state,
			counter: this.state.counter + 1,
		};
	}

	getState(): ImmutableAppState {
		return this.state;
	}
}
```

### Configuration Objects

```typescript
interface DatabaseConfig {
	host: string;
	port: number;
	database: string;
	username: string;
	password: string;
	ssl: boolean;
	connectionPool: {
		min: number;
		max: number;
	};
}

type ImmutableDatabaseConfig = Readonly<DatabaseConfig>;

const dbConfig: ImmutableDatabaseConfig = {
	host: "localhost",
	port: 5432,
	database: "myapp",
	username: "admin",
	password: "secret",
	ssl: false,
	connectionPool: {
		min: 2,
		max: 10,
	},
};

// dbConfig.host = "remote"; // Error: readonly property
// dbConfig.connectionPool.min = 5; // Error: readonly property

// Create modified config
function updateConfig(
	config: ImmutableDatabaseConfig,
	updates: Partial<ImmutableDatabaseConfig>,
): ImmutableDatabaseConfig {
	return { ...config, ...updates };
}

const updatedConfig = updateConfig(dbConfig, { port: 3306 });
```

### API Response Types

```typescript
interface APIResponse<T> {
	data: T;
	status: number;
	message: string;
	timestamp: Date;
}

// Make API responses immutable
type ImmutableAPIResponse<T> = Readonly<APIResponse<T>>;

class APIClient {
	async getUser(id: number): Promise<ImmutableAPIResponse<User>> {
		const response = await fetch(`/api/users/${id}`);
		const data = await response.json();

		// Return immutable response
		return {
			data,
			status: response.status,
			message: response.statusText,
			timestamp: new Date(),
		} as ImmutableAPIResponse<User>;
	}

	async getUsers(): Promise<ImmutableAPIResponse<ReadonlyArray<User>>> {
		const response = await fetch("/api/users");
		const data = await response.json();

		return {
			data,
			status: response.status,
			message: response.statusText,
			timestamp: new Date(),
		} as ImmutableAPIResponse<ReadonlyArray<User>>;
	}
}

// Usage
const api = new APIClient();
const userResponse = await api.getUser(1);

// userResponse.data.name = "Modified"; // Error: readonly
// userResponse.status = 500; // Error: readonly
```

### Form State Management

```typescript
interface FormState {
	values: {
		name: string;
		email: string;
		password: string;
	};
	errors: Record<string, string>;
	isSubmitting: boolean;
	isValid: boolean;
}

type ImmutableFormState = Readonly<FormState>;

class FormManager {
	private state: ImmutableFormState;

	constructor(initialState: ImmutableFormState) {
		this.state = initialState;
	}

	updateValue(
		field: keyof ImmutableFormState["values"],
		value: string,
	): ImmutableFormState {
		return {
			...this.state,
			values: {
				...this.state.values,
				[field]: value,
			},
		};
	}

	setError(field: string, error: string): ImmutableFormState {
		return {
			...this.state,
			errors: {
				...this.state.errors,
				[field]: error,
			},
		};
	}

	setSubmitting(isSubmitting: boolean): ImmutableFormState {
		return {
			...this.state,
			isSubmitting,
		};
	}

	validate(): ImmutableFormState {
		const errors: Record<string, string> = {};

		if (!this.state.values.name) {
			errors.name = "Name is required";
		}

		if (!this.state.values.email) {
			errors.email = "Email is required";
		} else if (!this.state.values.email.includes("@")) {
			errors.email = "Invalid email";
		}

		if (this.state.values.password.length < 8) {
			errors.password = "Password must be at least 8 characters";
		}

		return {
			...this.state,
			errors,
			isValid: Object.keys(errors).length === 0,
		};
	}

	getState(): ImmutableFormState {
		return this.state;
	}
}
```

## Readonly with Generics

### Generic Readonly Functions

```typescript
function freeze<T>(obj: T): Readonly<T> {
	return Object.freeze(obj) as Readonly<T>;
}

function deepFreeze<T>(
	obj: T,
): T extends Readonly<infer U> ? T : DeepReadonly<T> {
	// Implementation would recursively freeze all properties
	return obj as any;
}

function createImmutable<T>(factory: () => T): Readonly<T> {
	const instance = factory();
	return freeze(instance);
}

// Usage
const immutableUser = createImmutable(() => ({
	name: "Alice",
	email: "alice@example.com",
	preferences: {
		theme: "dark",
		notifications: true,
	},
}));

// immutableUser.name = "Bob"; // Error
// immutableUser.preferences.theme = "light"; // Error (with deep freeze)
```

### Readonly Generic Constraints

```typescript
function processReadonlyData<T extends Record<string, any>>(
	data: Readonly<T>,
	processor: (data: Readonly<T>) => void,
): void {
	// Function guarantees data won't be modified
	processor(data);
}

interface SensitiveData {
	username: string;
	password: string;
	apiKey: string;
}

const sensitiveData: SensitiveData = {
	username: "admin",
	password: "secret",
	apiKey: "key123",
};

processReadonlyData(sensitiveData, (data) => {
	console.log("Processing:", data.username);
	// data.password = "modified"; // Error: readonly
});
```

## Best Practices

### When to Use Readonly

1. **Immutable data structures**: When you want to prevent accidental mutations
2. **API responses**: To ensure response data isn't modified
3. **Configuration objects**: Prevent runtime configuration changes
4. **Function parameters**: When functions shouldn't modify inputs
5. **State objects**: In state management to prevent direct mutations

### When to Avoid Readonly

1. **Mutable data**: When you need to modify object properties
2. **Performance-critical code**: Deep readonly can impact performance
3. **Simple primitives**: Readonly doesn't add value for primitives
4. **Third-party libraries**: May not be compatible with readonly types

### Naming Conventions

```typescript
// Good: Clear intent
type ImmutableUser = Readonly<User>;
type ReadonlyConfig = Readonly<AppConfig>;
type FrozenData = Readonly<DatabaseRecord>;

// Avoid: Redundant naming
type ReadonlyUser = Readonly<User>; // Same as above
type UserReadonly = Readonly<User>; // Less clear
```

### Performance Considerations

```typescript
// Readonly is a compile-time construct
// It doesn't affect runtime performance
// The generated JavaScript is identical

// For runtime immutability, combine with Object.freeze()
const frozenConfig = Object.freeze({
	apiUrl: "https://api.example.com",
	timeout: 5000,
}) as Readonly<{ apiUrl: string; timeout: number }>;

// Deep freezing requires custom implementation
function deepFreeze<T>(obj: T): Readonly<T> {
	// Recursive freezing implementation
	return obj as Readonly<T>;
}
```

### Combining Readonly with Other Utility Types

```typescript
// Create comprehensive immutable types
type ImmutablePartial<T> = Readonly<Partial<T>>;
type ImmutableRequired<T> = Readonly<Required<T>>;
type ImmutablePick<T, K extends keyof T> = Readonly<Pick<T, K>>;
type ImmutableOmit<T, K extends keyof T> = Readonly<Omit<T, K>>;
type ImmutableRecord<K extends string | number | symbol, V> = Readonly<
	Record<K, V>
>;

// Use in APIs
type CreateInput<T> = Readonly<Omit<T, "id" | "createdAt" | "updatedAt">>;
type UpdateInput<T> = Readonly<Partial<Pick<T, "name" | "email">>>;
type ResponseType<T> = Readonly<T>;
```

## Common Patterns

### Immutable Data Structures

```typescript
class ImmutableList<T> {
	private readonly items: ReadonlyArray<T>;

	constructor(items: T[] = []) {
		this.items = Object.freeze([...items]);
	}

	add(item: T): ImmutableList<T> {
		return new ImmutableList([...this.items, item]);
	}

	remove(index: number): ImmutableList<T> {
		return new ImmutableList(this.items.filter((_, i) => i !== index));
	}

	map<U>(mapper: (item: T) => U): ImmutableList<U> {
		return new ImmutableList(this.items.map(mapper));
	}

	get(index: number): T | undefined {
		return this.items[index];
	}

	toArray(): ReadonlyArray<T> {
		return this.items;
	}
}

const list = new ImmutableList([1, 2, 3]);
const newList = list.add(4).map((x) => x * 2);
// Original list unchanged
console.log(list.toArray()); // [1, 2, 3]
console.log(newList.toArray()); // [2, 4, 6, 8]
```

### Redux-Style State Updates

```typescript
interface TodoState {
	todos: ReadonlyArray<{
		readonly id: number;
		readonly text: string;
		readonly completed: boolean;
	}>;
	filter: "all" | "active" | "completed";
}

type ImmutableTodoState = Readonly<TodoState>;

function addTodo(state: ImmutableTodoState, text: string): ImmutableTodoState {
	const newTodo = {
		id: Date.now(),
		text,
		completed: false,
	} as const;

	return {
		...state,
		todos: [...state.todos, newTodo],
	};
}

function toggleTodo(state: ImmutableTodoState, id: number): ImmutableTodoState {
	return {
		...state,
		todos: state.todos.map((todo) =>
			todo.id === id ? { ...todo, completed: !todo.completed } : todo,
		),
	};
}

function setFilter(
	state: ImmutableTodoState,
	filter: TodoState["filter"],
): ImmutableTodoState {
	return {
		...state,
		filter,
	};
}
```

### Configuration Validation

```typescript
interface AppConfig {
	readonly apiUrl: string;
	readonly timeout: number;
	readonly features: Readonly<{
		readonly auth: boolean;
		readonly cache: boolean;
		readonly logging: boolean;
	}>;
}

function validateConfig(
	config: Readonly<Partial<AppConfig>>,
): config is Readonly<AppConfig> {
	return !!(
		config.apiUrl &&
		typeof config.timeout === "number" &&
		config.features &&
		typeof config.features.auth === "boolean" &&
		typeof config.features.cache === "boolean" &&
		typeof config.features.logging === "boolean"
	);
}

const partialConfig = {
	apiUrl: "https://api.example.com",
	timeout: 5000,
	features: {
		auth: true,
		cache: false,
		logging: true,
	},
} as const;

if (validateConfig(partialConfig)) {
	// partialConfig is now treated as fully readonly and complete
	console.log("Config is valid:", partialConfig.apiUrl);
}
```

The `Readonly` utility type is essential for creating immutable data structures and preventing accidental mutations in TypeScript. It provides compile-time immutability guarantees, making code more predictable and safer. Use Readonly when you need to ensure data integrity and prevent unintended side effects from object mutations.
