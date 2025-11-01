# ReturnType and Parameters Utility Types in TypeScript

`ReturnType` and `Parameters` are powerful utility types in TypeScript that allow you to extract type information from function signatures. `ReturnType` extracts the return type of a function, while `Parameters` extracts the parameter types as a tuple. These utilities are essential for creating type-safe abstractions, mocking, and working with higher-order functions.

## ReturnType Utility Type

### Basic ReturnType Usage

```typescript
function createUser(
	name: string,
	age: number,
): { id: number; name: string; age: number } {
	return {
		id: Math.random(),
		name,
		age,
	};
}

// Extract the return type
type User = ReturnType<typeof createUser>;
// Equivalent to: { id: number; name: string; age: number; }

const user: User = {
	id: 1,
	name: "Alice",
	age: 30,
};
```

### ReturnType with Methods

```typescript
class UserService {
	createUser(
		name: string,
		email: string,
	): { id: number; name: string; email: string } {
		return {
			id: Date.now(),
			name,
			email,
		};
	}

	getUserById(id: number): { id: number; name: string; email: string } | null {
		// Implementation
		return null;
	}
}

// Extract return types from methods
type CreateUserResult = ReturnType<UserService["createUser"]>;
type GetUserResult = ReturnType<UserService["getUserById"]>;
```

### ReturnType with Generic Functions

```typescript
function wrapInArray<T>(value: T): T[] {
	return [value];
}

// Extract return type from generic function
type ArrayWrapper<T> = ReturnType<typeof wrapInArray<T>>;
// For any T, this is T[]

type StringArray = ArrayWrapper<string>; // string[]
type NumberArray = ArrayWrapper<number>; // number[]
```

### ReturnType with Async Functions

```typescript
async function fetchUser(id: number): Promise<{ id: number; name: string }> {
	const response = await fetch(`/api/users/${id}`);
	return response.json();
}

// Extract the resolved type from Promise
type UserData = ReturnType<typeof fetchUser>; // Promise<{ id: number; name: string }>

// To get the inner type, you might need to await or use Awaited
type AwaitedUserData = Awaited<ReturnType<typeof fetchUser>>; // { id: number; name: string }
```

## Parameters Utility Type

### Basic Parameters Usage

```typescript
function updateUser(id: number, name: string, email?: string): void {
	// Implementation
}

// Extract parameter types as tuple
type UpdateUserParams = Parameters<typeof updateUser>;
// Equivalent to: [id: number, name: string, email?: string | undefined]

const params: UpdateUserParams = [1, "Alice", "alice@example.com"];
updateUser(...params); // Spread the parameters
```

### Parameters with Overloaded Functions

```typescript
function process(value: string): string;
function process(value: number): number;
function process(value: string | number): string | number {
	if (typeof value === "string") {
		return value.toUpperCase();
	}
	return value * 2;
}

// Parameters extracts from the implementation signature
type ProcessParams = Parameters<typeof process>; // [value: string | number]
```

### Parameters with Rest Parameters

```typescript
function sum(...numbers: number[]): number {
	return numbers.reduce((a, b) => a + b, 0);
}

// Extract rest parameter types
type SumParams = Parameters<typeof sum>; // [...numbers: number[]]
```

### Parameters with Generic Functions

```typescript
function map<T, U>(array: T[], mapper: (item: T, index: number) => U): U[] {
	return array.map(mapper);
}

// Extract parameter types
type MapParams<T, U> = Parameters<typeof map<T, U>>;
// [array: T[], mapper: (item: T, index: number) => U]
```

## Advanced Patterns

### Function Type Extraction

```typescript
// Extract function signature components
function apiCall<T>(
	endpoint: string,
	options: { method?: string; headers?: Record<string, string> },
): Promise<T> {
	// Implementation
	return fetch(endpoint).then((r) => r.json());
}

type ApiCallFunction = typeof apiCall;
type ApiCallParams = Parameters<ApiCallFunction>; // [endpoint: string, options: { method?: string; headers?: Record<string, string> }]
type ApiCallReturn = ReturnType<ApiCallFunction>; // Promise<T>
```

### Creating Function Wrappers

```typescript
function createLogger<T extends (...args: any[]) => any>(fn: T) {
	return (...args: Parameters<T>): ReturnType<T> => {
		console.log(`Calling ${fn.name} with:`, args);
		const result = fn(...args);
		console.log(`Result:`, result);
		return result;
	};
}

function add(a: number, b: number): number {
	return a + b;
}

const loggedAdd = createLogger(add);
const result = loggedAdd(2, 3); // Logs: Calling add with: [2, 3], Result: 5
```

### API Client Abstraction

```typescript
interface ApiClient {
	getUser: (id: number) => Promise<{ id: number; name: string }>;
	createUser: (user: {
		name: string;
		email: string;
	}) => Promise<{ id: number; name: string; email: string }>;
	updateUser: (
		id: number,
		updates: Partial<{ name: string; email: string }>,
	) => Promise<{ id: number; name: string; email: string }>;
	deleteUser: (id: number) => Promise<void>;
}

// Extract method signatures
type GetUserMethod = ApiClient["getUser"];
type GetUserParams = Parameters<GetUserMethod>; // [id: number]
type GetUserReturn = ReturnType<GetUserMethod>; // Promise<{ id: number; name: string }>

type CreateUserMethod = ApiClient["createUser"];
type CreateUserParams = Parameters<CreateUserMethod>; // [user: { name: string; email: string }]
type CreateUserReturn = ReturnType<CreateUserMethod>; // Promise<{ id: number; name: string; email: string }>
```

### Mock Function Types

```typescript
// Original function
function sendEmail(
	to: string,
	subject: string,
	body: string,
): Promise<boolean> {
	// Implementation
	return Promise.resolve(true);
}

// Create mock with same signature
type SendEmailMock = jest.MockedFunction<typeof sendEmail>;
type SendEmailParams = Parameters<typeof sendEmail>; // [to: string, subject: string, body: string]
type SendEmailReturn = ReturnType<typeof sendEmail>; // Promise<boolean>

// Usage in tests
const mockSendEmail: SendEmailMock = jest.fn();
mockSendEmail.mockResolvedValue(true);

const params: SendEmailParams = ["user@example.com", "Welcome", "Hello there!"];
await mockSendEmail(...params);
```

## Real-World Examples

### Redux Action Creators

```typescript
// Action types
enum ActionTypes {
	USER_LOGIN = "USER_LOGIN",
	USER_LOGOUT = "USER_LOGOUT",
	USER_UPDATE = "USER_UPDATE",
}

// Action creators
const loginUser = (userId: number, token: string) => ({
	type: ActionTypes.USER_LOGIN as const,
	payload: { userId, token },
});

const logoutUser = () => ({
	type: ActionTypes.USER_LOGOUT as const,
});

const updateUser = (updates: Partial<{ name: string; email: string }>) => ({
	type: ActionTypes.USER_UPDATE as const,
	payload: updates,
});

// Extract action types
type LoginAction = ReturnType<typeof loginUser>;
type LogoutAction = ReturnType<typeof logoutUser>;
type UpdateAction = ReturnType<typeof updateUser>;

type UserAction = LoginAction | LogoutAction | UpdateAction;

// Reducer with proper typing
function userReducer(
	state: UserState | null,
	action: UserAction,
): UserState | null {
	switch (action.type) {
		case ActionTypes.USER_LOGIN:
			return { id: action.payload.userId, token: action.payload.token };
		case ActionTypes.USER_LOGOUT:
			return null;
		case ActionTypes.USER_UPDATE:
			return state ? { ...state, ...action.payload } : null;
		default:
			return state;
	}
}
```

### Express Route Handlers

```typescript
import express from "express";

function createUser(req: express.Request, res: express.Response): void {
	// Handler implementation
	res.json({ id: 1, name: req.body.name });
}

function getUser(req: express.Request, res: express.Response): void {
	// Handler implementation
	res.json({ id: req.params.id, name: "User" });
}

// Extract handler types
type CreateUserHandler = typeof createUser;
type GetUserHandler = typeof getUser;

// Create typed middleware
function authenticate<
	T extends (req: express.Request, res: express.Response) => void,
>(handler: T): T {
	return ((req: express.Request, res: express.Response) => {
		// Authentication logic
		if (!req.headers.authorization) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}
		return handler(req, res);
	}) as T;
}

const authenticatedCreateUser = authenticate(createUser);
const authenticatedGetUser = authenticate(getUser);
```

### Database Query Builders

```typescript
interface Database {
	findUsers: (
		query: Partial<{ name: string; email: string; age: number }>,
	) => Promise<User[]>;
	findUserById: (id: number) => Promise<User | null>;
	createUser: (user: Omit<User, "id" | "createdAt">) => Promise<User>;
	updateUser: (
		id: number,
		updates: Partial<Pick<User, "name" | "email">>,
	) => Promise<User>;
	deleteUser: (id: number) => Promise<void>;
}

// Extract method signatures for testing
type FindUsersMethod = Database["findUsers"];
type FindUsersParams = Parameters<FindUsersMethod>;
type FindUsersReturn = ReturnType<FindUsersMethod>;

type CreateUserMethod = Database["createUser"];
type CreateUserParams = Parameters<CreateUserMethod>;
type CreateUserReturn = ReturnType<CreateUserMethod>;

// Mock implementation
const mockDb: Database = {
	findUsers: jest.fn(),
	findUserById: jest.fn(),
	createUser: jest.fn(),
	updateUser: jest.fn(),
	deleteUser: jest.fn(),
};
```

### React Hook Types

```typescript
import { useState, useEffect } from "react";

// Custom hook
function useApi<T>(url: string): {
	data: T | null;
	loading: boolean;
	error: string | null;
	refetch: () => void;
} {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		setLoading(true);
		try {
			const response = await fetch(url);
			const result = await response.json();
			setData(result);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [url]);

	return { data, loading, error, refetch: fetchData };
}

// Extract hook return type
type UseApiReturn<T> = ReturnType<typeof useApi<T>>;

// Usage
function UserProfile({ userId }: { userId: number }) {
	const { data, loading, error, refetch } = useApi<{
		id: number;
		name: string;
		email: string;
	}>(`/api/users/${userId}`);

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!data) return <div>No data</div>;

	return (
		<div>
			<h1>{data.name}</h1>
			<p>{data.email}</p>
			<button onClick={refetch}>Refresh</button>
		</div>
	);
}
```

## Utility Types Built with ReturnType and Parameters

### Function Signature Extraction

```typescript
type FunctionSignature<T extends (...args: any) => any> = {
	params: Parameters<T>;
	return: ReturnType<T>;
};

function add(a: number, b: number): number {
	return a + b;
}

type AddSignature = FunctionSignature<typeof add>;
// { params: [a: number, b: number]; return: number; }
```

### Higher-Order Function Types

```typescript
type Thunk<T> = () => T;

function createThunk<T extends (...args: any[]) => any>(
	fn: T,
): Thunk<ReturnType<T>> {
	return () => fn();
}

function greet(name: string): string {
	return `Hello, ${name}!`;
}

const greetThunk = createThunk(greet);
const message = greetThunk(); // Error: needs name parameter

// Better approach
function createThunkWithArgs<T extends (...args: any[]) => any>(
	fn: T,
	...args: Parameters<T>
): Thunk<ReturnType<T>> {
	return () => fn(...args);
}

const greetThunkFixed = createThunkWithArgs(greet, "Alice");
const messageFixed = greetThunkFixed(); // "Hello, Alice!"
```

### Event Handler Types

```typescript
type EventHandler<T extends (event: any) => void> = {
	handler: T;
	params: Parameters<T>;
	return: ReturnType<T>;
};

function handleClick(event: MouseEvent): void {
	console.log("Clicked at:", event.clientX, event.clientY);
}

function handleInput(event: Event): string {
	const target = event.target as HTMLInputElement;
	return target.value;
}

type ClickHandler = EventHandler<typeof handleClick>;
type InputHandler = EventHandler<typeof handleInput>;
```

## Best Practices

### When to Use ReturnType

1. **Extracting API response types**: When you have functions that return complex objects
2. **Working with existing codebases**: When you need to maintain compatibility
3. **Creating derived types**: When building types based on function return values
4. **Testing and mocking**: When creating mock implementations

### When to Use Parameters

1. **Function composition**: When creating higher-order functions
2. **API wrappers**: When building abstractions over existing APIs
3. **Testing utilities**: When creating test helpers and mocks
4. **Type-safe function calls**: When you need to store and replay function calls

### Naming Conventions

```typescript
// Good: Descriptive names
type UserCreationParams = Parameters<typeof createUser>;
type ApiResponseData = ReturnType<typeof fetchUserData>;
type ValidationResult = ReturnType<typeof validateForm>;

// Avoid: Generic names
type Params = Parameters<typeof someFunction>; // Less descriptive
type Result = ReturnType<typeof someFunction>; // Less descriptive
```

### Performance Considerations

```typescript
// ReturnType and Parameters are compile-time operations
// They don't affect runtime performance
// The resulting types are equivalent to manually defined types

// This:
type UserData = ReturnType<typeof fetchUser>;

// Is equivalent to manually writing:
type UserData = Promise<{ id: number; name: string; email: string }>;
```

### Combining with Other Utility Types

```typescript
// Create comprehensive API types
type ApiMethod<T extends (args: any) => Promise<any>> = {
	params: Parameters<T>;
	response: Awaited<ReturnType<T>>;
	error?: Error;
};

// Create form handler types
type FormHandler<T extends (data: any) => any> = {
	validate: (data: Parameters<T>[0]) => boolean;
	submit: T;
	result: ReturnType<T>;
};
```

## Common Patterns

### Factory Functions

```typescript
function createService<T extends new (...args: any[]) => any>(
	ServiceClass: T,
	...args: Parameters<T>
): InstanceType<T> {
	return new ServiceClass(...args);
}

class DatabaseService {
	constructor(connectionString: string, options?: { timeout: number }) {
		// Implementation
	}
}

const service = createService(DatabaseService, "mongodb://localhost", {
	timeout: 5000,
});
```

### Decorator Patterns

```typescript
function memoize<T extends (...args: any[]) => any>(fn: T): T {
	const cache = new Map();

	return ((...args: Parameters<T>): ReturnType<T> => {
		const key = JSON.stringify(args);
		if (cache.has(key)) {
			return cache.get(key);
		}
		const result = fn(...args);
		cache.set(key, result);
		return result;
	}) as T;
}

function expensiveCalculation(n: number): number {
	console.log(`Calculating for ${n}`);
	return n * n;
}

const memoizedCalculation = memoize(expensiveCalculation);
console.log(memoizedCalculation(5)); // Calculates and logs
console.log(memoizedCalculation(5)); // Returns cached result, no log
```

### Type-Safe Event Emitters

```typescript
type EventMap = {
	user: (user: { id: number; name: string }) => void;
	error: (error: Error) => void;
	data: (data: any) => void;
};

class TypedEventEmitter<
	TEvents extends Record<string, (...args: any[]) => void>,
> {
	private listeners = new Map<keyof TEvents, Function[]>();

	emit<K extends keyof TEvents>(
		event: K,
		...args: Parameters<TEvents[K]>
	): void {
		const listeners = this.listeners.get(event);
		if (listeners) {
			listeners.forEach((listener) => listener(...args));
		}
	}

	on<K extends keyof TEvents>(event: K, listener: TEvents[K]): void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)!.push(listener);
	}
}

const emitter = new TypedEventEmitter<EventMap>();

emitter.on("user", (user) => {
	console.log(`User ${user.name} logged in`);
});

emitter.emit("user", { id: 1, name: "Alice" });
```

`ReturnType` and `Parameters` are essential utility types that enable sophisticated type-level programming in TypeScript. They allow you to extract and manipulate function signatures, creating type-safe abstractions and maintaining compatibility with existing codebases.
