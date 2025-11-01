# Async Functions in TypeScript

Asynchronous programming is essential for handling operations that take time to complete, such as network requests, file I/O, or database operations. TypeScript provides powerful tools for working with asynchronous code through Promises and async/await syntax. This chapter covers async functions, error handling, and best practices for asynchronous programming in TypeScript.

## Promises

### Basic Promise Usage

```typescript
// Creating a Promise
const delay = (ms: number): Promise<void> => {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), ms);
	});
};

// Using a Promise
delay(1000).then(() => {
	console.log("Delayed by 1 second");
});
```

### Promise with Types

```typescript
interface User {
	id: number;
	name: string;
	email: string;
}

const fetchUser = (id: number): Promise<User> => {
	return new Promise((resolve, reject) => {
		// Simulate API call
		setTimeout(() => {
			if (id === 1) {
				resolve({
					id: 1,
					name: "Alice",
					email: "alice@example.com",
				});
			} else {
				reject(new Error("User not found"));
			}
		}, 1000);
	});
};
```

### Promise Methods

```typescript
// Promise.resolve
const resolvedPromise = Promise.resolve("Success");

// Promise.reject
const rejectedPromise = Promise.reject(new Error("Failed"));

// Promise.all - all promises must resolve
const promises = [fetchUser(1), delay(500), Promise.resolve("Done")];

Promise.all(promises)
	.then(([user, _, message]) => {
		console.log("All resolved:", user.name, message);
	})
	.catch((error) => {
		console.log("One failed:", error.message);
	});

// Promise.race - first to resolve or reject wins
Promise.race([delay(1000), fetchUser(1)]).then((result) => {
	console.log("First to complete:", result);
});

// Promise.allSettled - waits for all to settle (resolve or reject)
Promise.allSettled([fetchUser(1), fetchUser(999)]).then((results) => {
	results.forEach((result, index) => {
		if (result.status === "fulfilled") {
			console.log(`Promise ${index} resolved:`, result.value.name);
		} else {
			console.log(`Promise ${index} rejected:`, result.reason.message);
		}
	});
});
```

## Async Functions

### Basic Async Function

```typescript
async function getUserData(userId: number): Promise<User> {
	try {
		const user = await fetchUser(userId);
		console.log("User fetched:", user.name);
		return user;
	} catch (error) {
		console.error("Error fetching user:", error);
		throw error;
	}
}

// Usage
getUserData(1).then((user) => {
	console.log("Final result:", user.email);
});
```

### Async Function Return Types

```typescript
// Explicit return type (recommended)
async function fetchData(): Promise<string[]> {
	const response = await fetch("/api/data");
	const data = await response.json();
	return data.items;
}

// Inferred return type
async function processData(data: any) {
	await delay(100);
	return data.map((item: any) => item.name);
}
```

### Async Arrow Functions

```typescript
const fetchUserData = async (userId: number): Promise<User> => {
	const response = await fetch(`/api/users/${userId}`);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return await response.json();
};

const processUsers = async (userIds: number[]): Promise<User[]> => {
	const userPromises = userIds.map((id) => fetchUserData(id));
	return await Promise.all(userPromises);
};
```

## Error Handling in Async Functions

### Try-Catch with Async/Await

```typescript
async function safeFetchUser(userId: number): Promise<User | null> {
	try {
		const user = await fetchUser(userId);
		return user;
	} catch (error) {
		console.error("Failed to fetch user:", error);
		return null;
	}
}

// Multiple async operations with error handling
async function processUserWorkflow(userId: number): Promise<void> {
	try {
		const user = await fetchUser(userId);
		await sendWelcomeEmail(user.email);
		await updateUserStats(user.id);
		console.log("User workflow completed successfully");
	} catch (error) {
		console.error("User workflow failed:", error);
		await logError(error);
	}
}
```

### Error Types and Custom Errors

```typescript
class NetworkError extends Error {
	constructor(message: string, public statusCode?: number) {
		super(message);
		this.name = "NetworkError";
	}
}

class ValidationError extends Error {
	constructor(message: string, public field: string) {
		super(message);
		this.name = "ValidationError";
	}
}

async function fetchWithCustomErrors(url: string): Promise<any> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new NetworkError(`HTTP ${response.status}`, response.status);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		if (error instanceof NetworkError) {
			console.error("Network error:", error.message);
		} else {
			console.error("Unexpected error:", error);
		}
		throw error;
	}
}
```

## Sequential vs Parallel Execution

### Sequential Execution

```typescript
async function processSequentially(userIds: number[]): Promise<User[]> {
	const users: User[] = [];

	for (const userId of userIds) {
		const user = await fetchUser(userId);
		users.push(user);
	}

	return users;
}

// Each fetchUser waits for the previous one to complete
```

### Parallel Execution

```typescript
async function processInParallel(userIds: number[]): Promise<User[]> {
	const userPromises = userIds.map((id) => fetchUser(id));
	return await Promise.all(userPromises);
}

// All fetchUser calls start simultaneously
```

### Controlled Parallelism

```typescript
async function processWithLimit<T, R>(
	items: T[],
	processor: (item: T) => Promise<R>,
	limit: number,
): Promise<R[]> {
	const results: R[] = [];

	for (let i = 0; i < items.length; i += limit) {
		const batch = items.slice(i, i + limit);
		const batchPromises = batch.map(processor);
		const batchResults = await Promise.all(batchPromises);
		results.push(...batchResults);
	}

	return results;
}

// Process only 3 users at a time
const users = await processWithLimit([1, 2, 3, 4, 5], fetchUser, 3);
```

## Async Iterators and Generators

### Async Generators

```typescript
async function* asyncRange(
	start: number,
	end: number,
	delay: number,
): AsyncIterableIterator<number> {
	for (let i = start; i <= end; i++) {
		await new Promise((resolve) => setTimeout(resolve, delay));
		yield i;
	}
}

// Usage
async function processRange() {
	for await (const num of asyncRange(1, 5, 100)) {
		console.log("Number:", num);
	}
}
```

### Async Iterables

```typescript
class AsyncDataStream<T> {
	private data: T[] = [];
	private delay: number;

	constructor(delay: number = 100) {
		this.delay = delay;
	}

	add(item: T): void {
		this.data.push(item);
	}

	async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
		for (const item of this.data) {
			await new Promise((resolve) => setTimeout(resolve, this.delay));
			yield item;
		}
	}
}

const stream = new AsyncDataStream<string>();
stream.add("First");
stream.add("Second");
stream.add("Third");

async function consumeStream() {
	for await (const item of stream) {
		console.log("Received:", item);
	}
}
```

## Advanced Patterns

### Timeout with AbortController

```typescript
async function fetchWithTimeout(
	url: string,
	timeoutMs: number = 5000,
): Promise<any> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, {
			signal: controller.signal,
		});
		clearTimeout(timeoutId);
		return await response.json();
	} catch (error) {
		clearTimeout(timeoutId);
		if (error.name === "AbortError") {
			throw new Error("Request timed out");
		}
		throw error;
	}
}
```

### Retry Logic

```typescript
async function retryAsync<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	delay: number = 1000,
): Promise<T> {
	let lastError: Error;

	for (let i = 0; i <= maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			if (i < maxRetries) {
				await new Promise((resolve) =>
					setTimeout(resolve, delay * Math.pow(2, i)),
				);
			}
		}
	}

	throw lastError!;
}

// Usage
const result = await retryAsync(() => fetchUserData(1), 3, 1000);
```

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
	private failures = 0;
	private lastFailureTime = 0;
	private state: "closed" | "open" | "half-open" = "closed";

	constructor(
		private failureThreshold: number = 5,
		private recoveryTimeout: number = 60000,
	) {}

	async execute<T>(fn: () => Promise<T>): Promise<T> {
		if (this.state === "open") {
			if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
				this.state = "half-open";
			} else {
				throw new Error("Circuit breaker is open");
			}
		}

		try {
			const result = await fn();
			this.onSuccess();
			return result;
		} catch (error) {
			this.onFailure();
			throw error;
		}
	}

	private onSuccess(): void {
		this.failures = 0;
		this.state = "closed";
	}

	private onFailure(): void {
		this.failures++;
		this.lastFailureTime = Date.now();

		if (this.failures >= this.failureThreshold) {
			this.state = "open";
		}
	}
}

const breaker = new CircuitBreaker();
const result = await breaker.execute(() => fetchUserData(1));
```

## TypeScript-Specific Async Features

### Async Function Overloads

```typescript
// Function overloads with async
function processData(data: string): Promise<number>;
function processData(data: number): Promise<string>;
function processData(data: string | number): Promise<string | number> {
	if (typeof data === "string") {
		return Promise.resolve(data.length);
	} else {
		return Promise.resolve(data.toString());
	}
}

// Usage
const length: number = await processData("hello");
const str: string = await processData(42);
```

### Generic Async Functions

```typescript
async function mapAsync<T, U>(
	array: T[],
	mapper: (item: T, index: number) => Promise<U>,
): Promise<U[]> {
	const results: U[] = [];

	for (let i = 0; i < array.length; i++) {
		const result = await mapper(array[i], i);
		results.push(result);
	}

	return results;
}

// Usage
const urls = ["https://api1.com", "https://api2.com", "https://api3.com"];
const responses = await mapAsync(urls, async (url) => {
	const response = await fetch(url);
	return response.json();
});
```

### Async Method in Classes

```typescript
class DataService {
	private cache = new Map<string, any>();

	async fetchData(key: string): Promise<any> {
		if (this.cache.has(key)) {
			return this.cache.get(key);
		}

		try {
			const response = await fetch(`/api/data/${key}`);
			const data = await response.json();
			this.cache.set(key, data);
			return data;
		} catch (error) {
			console.error(`Failed to fetch data for key: ${key}`, error);
			throw error;
		}
	}

	async fetchMultiple(keys: string[]): Promise<any[]> {
		const promises = keys.map((key) => this.fetchData(key));
		return await Promise.all(promises);
	}
}

const service = new DataService();
const data = await service.fetchMultiple(["user", "posts", "comments"]);
```

## Testing Async Functions

### Testing with Jest/Mocha

```typescript
// Async function to test
async function validateUser(email: string, password: string): Promise<boolean> {
	if (!email.includes("@")) {
		throw new Error("Invalid email");
	}

	// Simulate API call
	await delay(100);

	return password.length >= 8;
}

// Test examples
describe("validateUser", () => {
	it("should validate correct credentials", async () => {
		const result = await validateUser("user@example.com", "password123");
		expect(result).toBe(true);
	});

	it("should reject invalid email", async () => {
		await expect(validateUser("invalid-email", "password123")).rejects.toThrow(
			"Invalid email",
		);
	});

	it("should handle async operations", async () => {
		const startTime = Date.now();
		await validateUser("user@example.com", "password123");
		const endTime = Date.now();
		expect(endTime - startTime).toBeGreaterThanOrEqual(100);
	});
});
```

### Mocking Async Functions

```typescript
// Mock implementation for testing
const mockFetchUser = jest.fn().mockImplementation(async (id: number) => {
	if (id === 1) {
		return { id: 1, name: "Alice", email: "alice@example.com" };
	}
	throw new Error("User not found");
});

describe("UserService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should fetch user successfully", async () => {
		const user = await mockFetchUser(1);
		expect(user.name).toBe("Alice");
		expect(mockFetchUser).toHaveBeenCalledWith(1);
	});

	it("should handle user not found", async () => {
		await expect(mockFetchUser(999)).rejects.toThrow("User not found");
	});
});
```

## Best Practices

### Error Handling

```typescript
// ✅ Good: Proper error handling
async function fetchUserProfile(userId: number): Promise<User> {
	try {
		const user = await fetchUser(userId);
		const profile = await fetchUserProfile(user.id);
		return { ...user, ...profile };
	} catch (error) {
		// Log error for debugging
		console.error("Failed to fetch user profile:", error);
		// Re-throw with context
		throw new Error(
			`Unable to fetch profile for user ${userId}: ${error.message}`,
		);
	}
}

// ❌ Bad: Silent failures
async function badFetchUserProfile(userId: number): Promise<User | null> {
	try {
		return await fetchUser(userId);
	} catch {
		return null; // Silent failure
	}
}
```

### Resource Cleanup

```typescript
// ✅ Good: Proper cleanup with finally
async function processFile(filePath: string): Promise<void> {
	let fileHandle;

	try {
		fileHandle = await openFile(filePath);
		const data = await readFile(fileHandle);
		await processData(data);
	} finally {
		if (fileHandle) {
			await closeFile(fileHandle);
		}
	}
}

// Using async disposal (TypeScript 5.2+)
async function processFileModern(filePath: string): Promise<void> {
	await using fileHandle = await openFile(filePath);
	const data = await readFile(fileHandle);
	await processData(data);
	// Automatic cleanup
}
```

### Avoid Common Pitfalls

```typescript
// ❌ Bad: Fire and forget
async function badExample() {
	fetchUser(1); // No await - fire and forget
	console.log("Function completed"); // This runs before fetchUser
}

// ✅ Good: Proper awaiting
async function goodExample() {
	try {
		const user = await fetchUser(1);
		console.log("User:", user);
	} catch (error) {
		console.error("Error:", error);
	}
}

// ❌ Bad: Nested promises
function badNested() {
	return fetchUser(1).then((user) => {
		return fetchPosts(user.id).then((posts) => {
			return { user, posts };
		});
	});
}

// ✅ Good: Flat async/await
async function goodFlat(): Promise<{ user: User; posts: Post[] }> {
	const user = await fetchUser(1);
	const posts = await fetchPosts(user.id);
	return { user, posts };
}
```

### Performance Considerations

```typescript
// ✅ Good: Parallel when independent
async function fetchDashboardData(userId: number): Promise<DashboardData> {
	const [user, posts, notifications] = await Promise.all([
		fetchUser(userId),
		fetchUserPosts(userId),
		fetchNotifications(userId),
	]);

	return { user, posts, notifications };
}

// ❌ Bad: Unnecessary sequential
async function badFetchDashboardData(userId: number): Promise<DashboardData> {
	const user = await fetchUser(userId);
	const posts = await fetchUserPosts(userId); // Waits for user first
	const notifications = await fetchNotifications(userId); // Waits for posts first

	return { user, posts, notifications };
}
```

## Migration from Callbacks to Async/Await

### Callback-based to Promise-based

```typescript
// Old callback-based function
function fetchUserCallback(
	id: number,
	callback: (error: Error | null, user?: User) => void,
): void {
	setTimeout(() => {
		if (id === 1) {
			callback(null, { id: 1, name: "Alice", email: "alice@example.com" });
		} else {
			callback(new Error("User not found"));
		}
	}, 1000);
}

// New Promise-based function
function fetchUserPromise(id: number): Promise<User> {
	return new Promise((resolve, reject) => {
		fetchUserCallback(id, (error, user) => {
			if (error) {
				reject(error);
			} else {
				resolve(user!);
			}
		});
	});
}

// Usage with async/await
async function getUser(id: number): Promise<User> {
	return await fetchUserPromise(id);
}
```

### Converting Promise Chains to Async/Await

```typescript
// Promise chain
function processUserChain(userId: number): Promise<ProcessedUser> {
	return fetchUser(userId)
		.then((user) => {
			return fetchUserPosts(user.id);
		})
		.then((posts) => {
			return fetchUserComments(user.id);
		})
		.then((comments) => {
			return {
				user,
				posts,
				comments,
			};
		})
		.catch((error) => {
			console.error("Processing failed:", error);
			throw error;
		});
}

// Async/await version
async function processUserAsync(userId: number): Promise<ProcessedUser> {
	try {
		const user = await fetchUser(userId);
		const [posts, comments] = await Promise.all([
			fetchUserPosts(user.id),
			fetchUserComments(user.id),
		]);

		return {
			user,
			posts,
			comments,
		};
	} catch (error) {
		console.error("Processing failed:", error);
		throw error;
	}
}
```

Async functions and Promises are fundamental to modern JavaScript and TypeScript development. They enable writing asynchronous code that is readable, maintainable, and performant. Mastering these concepts is essential for building responsive web applications and robust backend services.
