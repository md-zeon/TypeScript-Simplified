# Awaited Utility Type in TypeScript

The `Awaited<T>` utility type is a powerful TypeScript feature introduced to help work with asynchronous operations. It extracts the resolved type from a Promise or other thenable objects, making it easier to work with complex async types.

## Basic Usage

```typescript
// Simple Promise
type StringPromise = Promise<string>;
type ResolvedString = Awaited<StringPromise>; // string

// Nested Promises
type NestedPromise = Promise<Promise<number>>;
type ResolvedNumber = Awaited<NestedPromise>; // number

// Non-Promise types (returns the type as-is)
type JustString = Awaited<string>; // string
type JustNumber = Awaited<number>; // number
```

## Real-World Examples

### API Response Types

```typescript
interface User {
	id: number;
	name: string;
	email: string;
}

interface ApiResponse<T> {
	data: T;
	status: number;
	message: string;
}

// API function that returns a Promise
async function fetchUser(id: number): Promise<ApiResponse<User>> {
	const response = await fetch(`/api/users/${id}`);
	return response.json();
}

// Extract the resolved type
type FetchUserResult = Awaited<ReturnType<typeof fetchUser>>;
// Equivalent to: ApiResponse<User>

// Extract just the data type
type UserData = Awaited<ReturnType<typeof fetchUser>>["data"];
// Equivalent to: User
```

### Working with Async Functions

```typescript
// Async function
async function getUserData(): Promise<User[]> {
	const response = await fetch("/api/users");
	return response.json();
}

// Get the return type of the function
type GetUserDataReturn = ReturnType<typeof getUserData>;
// Promise<User[]>

// Unwrap the Promise to get the actual data type
type UserArray = Awaited<ReturnType<typeof getUserData>>;
// User[]
```

### Complex Nested Types

```typescript
type ComplexAsyncType = Promise<{
	result: Promise<{
		data: string;
		timestamp: Date;
	}>;
}>;

type Unwrapped = Awaited<ComplexAsyncType>;
// {
//   result: Promise<{
//     data: string;
//     timestamp: Date;
//   }>;
// }

type FullyUnwrapped = Awaited<Awaited<ComplexAsyncType>["result"]>;
// {
//   data: string;
//   timestamp: Date;
// }
```

## Advanced Patterns

### Conditional Types with Awaited

```typescript
type IsPromise<T> = T extends Promise<infer U> ? U : T;

type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

// Using Awaited for the same effect
type UnwrapWithAwaited<T> = T extends Promise<infer U> ? Awaited<T> : T;
```

### Utility Functions

```typescript
// Helper function to unwrap promise types
type Unwrap<T> = Awaited<T>;

// More complex unwrapping for deeply nested promises
type DeepUnwrap<T> = T extends Promise<infer U> ? DeepUnwrap<U> : T;

// Using Awaited recursively
type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<Awaited<T>> : T;
```

### Integration with Other Utility Types

```typescript
interface ApiResponse<T> {
	data: T;
	error?: string;
	loading: boolean;
}

type AsyncApiResponse<T> = Promise<ApiResponse<T>>;

// Extract the data type from an async API response
type ApiData<T> = Awaited<AsyncApiResponse<T>>["data"];

// Make the response data optional
type OptionalApiData<T> = Partial<Awaited<AsyncApiResponse<T>>>["data"];

// Pick specific fields from the unwrapped response
type PickedApiData<T, K extends keyof Awaited<AsyncApiResponse<T>>> = Pick<
	Awaited<AsyncApiResponse<T>>,
	K
>["data"];
```

## When to Use Awaited

### 1. Type-Safe Async Operations

```typescript
async function processUser(userId: number) {
	// Fetch user data
	const userResponse = await fetchUser(userId);

	// TypeScript knows the exact shape
	const userData: User = userResponse.data;

	// Further processing with full type safety
	return {
		...userData,
		processedAt: new Date(),
	};
}

// Extract return type for other functions
type ProcessedUser = Awaited<ReturnType<typeof processUser>>;
```

### 2. Generic Async Utilities

```typescript
// Generic function that works with any async operation
async function withLoading<T extends Promise<any>>(
	asyncOperation: T,
): Promise<{ data: Awaited<T>; loading: boolean }> {
	try {
		const data = await asyncOperation;
		return { data, loading: false };
	} catch (error) {
		throw error;
	}
}

// Usage
const result = await withLoading(fetchUser(1));
// result.data is typed as ApiResponse<User>
```

### 3. API Client Libraries

```typescript
class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	async get<T>(endpoint: string): Promise<T> {
		const response = await fetch(`${this.baseUrl}${endpoint}`);
		return response.json();
	}

	async post<T, D = any>(endpoint: string, data: D): Promise<T> {
		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			method: "POST",
			body: JSON.stringify(data),
		});
		return response.json();
	}
}

// Type-safe API client usage
const client = new ApiClient("/api");

type GetUserResponse = Awaited<ReturnType<typeof client.get<User>>>;
// User

type CreateUserResponse = Awaited<
	ReturnType<typeof client.post<User, Omit<User, "id">>>
>;
// User
```

## Limitations and Considerations

### 1. Only Works with Promise-Like Types

```typescript
// Works with Promises
type A = Awaited<Promise<string>>; // string

// Works with thenables
type B = Awaited<{ then: (cb: (val: number) => void) => void }>; // number

// Doesn't unwrap non-thenable types
type C = Awaited<string>; // string
type D = Awaited<{ value: number }>; // { value: number }
```

### 2. No Deep Unwrapping by Default

```typescript
type Nested = Promise<Promise<string>>;
type SingleUnwrap = Awaited<Nested>; // Promise<string>
type DoubleUnwrap = Awaited<Awaited<Nested>>; // string
```

### 3. TypeScript Version Requirements

- `Awaited<T>` was introduced in TypeScript 4.5
- For older versions, you can define your own utility type:

```typescript
// Polyfill for older TypeScript versions
type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
```

## Best Practices

### 1. Use with ReturnType for Function Results

```typescript
// Good: Extract types from async functions
type ApiResult = Awaited<ReturnType<typeof myAsyncFunction>>;

// Less ideal: Manually typing the result
type ApiResult = {
	data: User;
	status: number;
};
```

### 2. Combine with Other Utility Types

```typescript
// Extract and transform
type UserNames = Awaited<ReturnType<typeof getUsers>>[number]["name"];

// Make optional for forms
type PartialUser = Partial<Awaited<ReturnType<typeof getUser>>>;

// Pick specific fields
type UserSummary = Pick<Awaited<ReturnType<typeof getUser>>, "id" | "name">;
```

### 3. Create Reusable Type Helpers

```typescript
// Common patterns
type ApiData<T> = Awaited<T>;
type ApiError<T> = Awaited<T>["error"];
type ApiLoading<T> = Awaited<T>["loading"];

// Usage
type UserData = ApiData<ReturnType<typeof fetchUser>>;
type UserError = ApiError<ReturnType<typeof fetchUser>>;
```

## Summary

The `Awaited<T>` utility type is essential for working with asynchronous TypeScript code. It provides:

- **Type Safety**: Extract resolved types from Promises
- **Developer Experience**: Better IntelliSense and error checking
- **Reusability**: Works with complex nested async types
- **Integration**: Combines well with other TypeScript utilities

Use `Awaited<T>` whenever you need to work with the resolved type of a Promise in your TypeScript applications, especially when building type-safe API clients, utility functions, or complex async workflows.
