# Discriminated Unions in TypeScript

Discriminated unions (also known as tagged unions or algebraic data types) are a powerful TypeScript pattern where each member of a union type has a common property - called the discriminant - that can be used to narrow down the type safely. This pattern enables exhaustive type checking and provides excellent IntelliSense support.

## Basic Concept

A discriminated union requires:

1. A common property (discriminant) with literal types
2. Different types for each union member
3. The ability to narrow the type based on the discriminant

```typescript
// Basic discriminated union
type Shape =
	| { kind: "circle"; radius: number }
	| { kind: "rectangle"; width: number; height: number }
	| { kind: "triangle"; base: number; height: number };

// The 'kind' property is the discriminant
// It has literal types: "circle", "rectangle", "triangle"
```

## Why Discriminated Unions?

### Type Safety

```typescript
function calculateArea(shape: Shape): number {
	switch (shape.kind) {
		case "circle":
			// TypeScript knows shape has radius
			return Math.PI * shape.radius ** 2;
		case "rectangle":
			// TypeScript knows shape has width and height
			return shape.width * shape.height;
		case "triangle":
			// TypeScript knows shape has base and height
			return (shape.base * shape.height) / 2;
		default:
			// TypeScript ensures exhaustiveness
			const _exhaustiveCheck: never = shape;
			throw new Error(`Unhandled shape: ${_exhaustiveCheck}`);
	}
}

// Usage
const circle: Shape = { kind: "circle", radius: 5 };
const rectangle: Shape = { kind: "rectangle", width: 10, height: 20 };

console.log(calculateArea(circle)); // 78.54
console.log(calculateArea(rectangle)); // 200
```

### IntelliSense Support

```typescript
// When you type shape., IntelliSense shows:
// - kind (common to all)
// - radius (only for circles)
// - width, height (only for rectangles)
// - base, height (only for triangles)

function printShape(shape: Shape): void {
	console.log(`Shape: ${shape.kind}`);
	// IntelliSense adapts based on shape.kind
}
```

## Common Patterns

### API Responses

```typescript
type ApiResponse<T> =
	| { status: "success"; data: T }
	| { status: "error"; error: string }
	| { status: "loading" };

function handleApiResponse<T>(response: ApiResponse<T>): void {
	switch (response.status) {
		case "success":
			console.log("Data:", response.data);
			break;
		case "error":
			console.error("Error:", response.error);
			break;
		case "loading":
			console.log("Loading...");
			break;
		default:
			const _never: never = response;
			throw new Error(`Unknown response: ${_never}`);
	}
}

// Usage
const successResponse: ApiResponse<User> = {
	status: "success",
	data: { id: 1, name: "John" },
};

const errorResponse: ApiResponse<User> = {
	status: "error",
	error: "User not found",
};

handleApiResponse(successResponse);
handleApiResponse(errorResponse);
```

### State Management

```typescript
type AppState =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "success"; data: User[] }
	| { status: "error"; error: string };

function renderApp(state: AppState): void {
	switch (state.status) {
		case "idle":
			return <div>Welcome!</div>;
		case "loading":
			return <div>Loading...</div>;
		case "success":
			return (
				<div>
					{state.data.map((user) => (
						<UserCard
							key={user.id}
							user={user}
						/>
					))}
				</div>
			);
		case "error":
			return <div>Error: {state.error}</div>;
		default:
			const _never: never = state;
			throw new Error(`Unknown state: ${_never}`);
	}
}
```

### Event Handling

```typescript
type UIEvent =
	| { type: "click"; x: number; y: number }
	| { type: "keydown"; key: string; ctrlKey: boolean }
	| { type: "resize"; width: number; height: number };

function handleEvent(event: UIEvent): void {
	switch (event.type) {
		case "click":
			console.log(`Clicked at ${event.x}, ${event.y}`);
			break;
		case "keydown":
			console.log(`Key pressed: ${event.key}, Ctrl: ${event.ctrlKey}`);
			break;
		case "resize":
			console.log(`Resized to ${event.width}x${event.height}`);
			break;
		default:
			const _never: never = event;
			throw new Error(`Unknown event: ${_never}`);
	}
}
```

## Advanced Patterns

### Nested Discriminated Unions

```typescript
type PaymentMethod =
	| { type: "credit_card"; cardNumber: string; expiry: string }
	| { type: "paypal"; email: string }
	| {
			type: "bank_transfer";
			bank: {
				name: string;
				account: string;
				routing: string;
			};
	  };

function processPayment(method: PaymentMethod): void {
	switch (method.type) {
		case "credit_card":
			console.log(`Processing card: ${method.cardNumber}`);
			break;
		case "paypal":
			console.log(`Processing PayPal: ${method.email}`);
			break;
		case "bank_transfer":
			console.log(`Processing bank transfer: ${method.bank.name}`);
			break;
		default:
			const _never: never = method;
			throw new Error(`Unknown payment method: ${_never}`);
	}
}
```

### Generic Discriminated Unions

```typescript
type Result<T, E = Error> =
	| { success: true; data: T }
	| { success: false; error: E };

function handleResult<T>(result: Result<T>): T {
	if (result.success) {
		return result.data;
	} else {
		throw result.error;
	}
}

// Usage
const successResult: Result<string> = { success: true, data: "Hello" };
const errorResult: Result<string> = {
	success: false,
	error: new Error("Failed"),
};

console.log(handleResult(successResult)); // "Hello"
// handleResult(errorResult); // Throws error
```

### Multiple Discriminants

```typescript
type NetworkRequest =
	| { method: "GET"; url: string; headers?: Record<string, string> }
	| {
			method: "POST";
			url: string;
			body: unknown;
			headers?: Record<string, string>;
	  }
	| {
			method: "PUT";
			url: string;
			body: unknown;
			headers?: Record<string, string>;
	  }
	| { method: "DELETE"; url: string; headers?: Record<string, string> };

function makeRequest(request: NetworkRequest): Promise<unknown> {
	switch (request.method) {
		case "GET":
			return fetch(request.url, { headers: request.headers });
		case "POST":
			return fetch(request.url, {
				method: "POST",
				body: JSON.stringify(request.body),
				headers: request.headers,
			});
		case "PUT":
			return fetch(request.url, {
				method: "PUT",
				body: JSON.stringify(request.body),
				headers: request.headers,
			});
		case "DELETE":
			return fetch(request.url, {
				method: "DELETE",
				headers: request.headers,
			});
		default:
			const _never: never = request;
			throw new Error(`Unknown method: ${_never}`);
	}
}
```

## Best Practices

### 1. Use Literal Types for Discriminants

```typescript
// Good: Literal types
type Status = "idle" | "loading" | "success" | "error";

// Bad: String type
type BadStatus = string; // Too broad
```

### 2. Make Discriminants Required and Readonly

```typescript
// Good
type Action =
	| { readonly type: "INCREMENT" }
	| { readonly type: "DECREMENT"; payload: number }
	| { readonly type: "RESET" };

// Bad: Optional discriminant
type BadAction =
	| { type?: "INCREMENT" } // Can be undefined
	| { type: "DECREMENT" };
```

### 3. Use Exhaustive Checks

```typescript
function processShape(shape: Shape): number {
	switch (shape.kind) {
		case "circle":
			return Math.PI * shape.radius ** 2;
		case "rectangle":
			return shape.width * shape.height;
		case "triangle":
			return (shape.base * shape.height) / 2;
		default:
			// This ensures we handle all cases
			const _never: never = shape;
			throw new Error(`Unhandled shape: ${_never}`);
	}
}

// Adding a new shape will cause a TypeScript error
// until we add a case for it
type ShapeWithSquare = Shape | { kind: "square"; side: number };
// Now processShape will error until we add the "square" case
```

### 4. Combine with Type Guards

```typescript
function isCircle(shape: Shape): shape is Shape & { kind: "circle" } {
	return shape.kind === "circle";
}

function isRectangle(shape: Shape): shape is Shape & { kind: "rectangle" } {
	return shape.kind === "rectangle";
}

function calculateAreaFunctional(shape: Shape): number {
	if (isCircle(shape)) {
		return Math.PI * shape.radius ** 2;
	}
	if (isRectangle(shape)) {
		return shape.width * shape.height;
	}
	// Must be triangle
	return (shape.base * shape.height) / 2;
}
```

## Common Use Cases

### Redux Actions

```typescript
type CounterAction =
	| { type: "INCREMENT" }
	| { type: "DECREMENT" }
	| { type: "RESET" }
	| { type: "SET_COUNT"; payload: number };

function counterReducer(state: number, action: CounterAction): number {
	switch (action.type) {
		case "INCREMENT":
			return state + 1;
		case "DECREMENT":
			return state - 1;
		case "RESET":
			return 0;
		case "SET_COUNT":
			return action.payload;
		default:
			const _never: never = action;
			throw new Error(`Unknown action: ${_never}`);
	}
}
```

### Form Validation

```typescript
type ValidationResult = { valid: true } | { valid: false; errors: string[] };

type FieldValidation =
	| { type: "required"; value: unknown }
	| { type: "email"; value: string }
	| { type: "minLength"; value: string; minLength: number };

function validateField(validation: FieldValidation): ValidationResult {
	switch (validation.type) {
		case "required":
			if (validation.value == null || validation.value === "") {
				return { valid: false, errors: ["This field is required"] };
			}
			return { valid: true };
		case "email":
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(validation.value)) {
				return { valid: false, errors: ["Invalid email format"] };
			}
			return { valid: true };
		case "minLength":
			if (validation.value.length < validation.minLength) {
				return {
					valid: false,
					errors: [`Minimum length is ${validation.minLength}`],
				};
			}
			return { valid: true };
		default:
			const _never: never = validation;
			throw new Error(`Unknown validation: ${_never}`);
	}
}
```

### Parser Combinators

```typescript
type ParseResult<T> =
	| { success: true; value: T; remaining: string }
	| { success: false; error: string };

type Parser<T> =
	| { type: "literal"; value: string; result: T }
	| { type: "regex"; pattern: RegExp; result: (match: string) => T }
	| {
			type: "sequence";
			parsers: Parser<any>[];
			combine: (...results: any[]) => T;
	  };

function parse<T>(input: string, parser: Parser<T>): ParseResult<T> {
	switch (parser.type) {
		case "literal":
			if (input.startsWith(parser.value)) {
				return {
					success: true,
					value: parser.result,
					remaining: input.slice(parser.value.length),
				};
			}
			return { success: false, error: `Expected "${parser.value}"` };
		case "regex":
			const match = input.match(parser.pattern);
			if (match && match.index === 0) {
				return {
					success: true,
					value: parser.result(match[0]),
					remaining: input.slice(match[0].length),
				};
			}
			return { success: false, error: `Pattern ${parser.pattern} not matched` };
		case "sequence":
			// Implementation for sequence parsing
			return { success: false, error: "Sequence parsing not implemented" };
		default:
			const _never: never = parser;
			throw new Error(`Unknown parser: ${_never}`);
	}
}
```

## Error Prevention

### Catching Missing Cases

```typescript
// TypeScript will error if we add a new shape but forget to handle it
type Shape =
	| { kind: "circle"; radius: number }
	| { kind: "rectangle"; width: number; height: number }
	| { kind: "triangle"; base: number; height: number }
	| { kind: "square"; side: number }; // New shape added

function calculateArea(shape: Shape): number {
	switch (shape.kind) {
		case "circle":
			return Math.PI * shape.radius ** 2;
		case "rectangle":
			return shape.width * shape.height;
		case "triangle":
			return (shape.base * shape.height) / 2;
		// TypeScript error: "square" case is missing
		default:
			const _never: never = shape;
			return _never; // This line would error
	}
}
```

### Type Safety in Refactors

```typescript
// Renaming a discriminant value
type Action =
	| { type: "ADD_ITEM" } // Changed from "ADD"
	| { type: "REMOVE_ITEM" }; // Changed from "REMOVE"

// All switch statements will now error until updated
function handleAction(action: Action): void {
	switch (action.type) {
		case "ADD_ITEM": // TypeScript guides the rename
			console.log("Adding item");
			break;
		case "REMOVE_ITEM": // TypeScript guides the rename
			console.log("Removing item");
			break;
		default:
			const _never: never = action;
			throw new Error(`Unknown action: ${_never}`);
	}
}
```

## Performance Considerations

### Switch vs If-Else

```typescript
// Switch statement (preferred for discriminated unions)
switch (shape.kind) {
	case "circle":
		/* ... */ break;
	case "rectangle":
		/* ... */ break;
	case "triangle":
		/* ... */ break;
}

// If-else chain (also works but less idiomatic)
if (shape.kind === "circle") {
	// ...
} else if (shape.kind === "rectangle") {
	// ...
} else if (shape.kind === "triangle") {
	// ...
}
```

### Type Narrowing Performance

Discriminated unions provide compile-time type narrowing without runtime overhead. The discriminant check is a simple property access.

## Integration with Other TypeScript Features

### With Generics

```typescript
type Container<T> =
	| { type: "array"; items: T[] }
	| { type: "single"; item: T }
	| { type: "empty" };

function getSize<T>(container: Container<T>): number {
	switch (container.type) {
		case "array":
			return container.items.length;
		case "single":
			return 1;
		case "empty":
			return 0;
		default:
			const _never: never = container;
			throw new Error(`Unknown container: ${_never}`);
	}
}
```

### With Utility Types

```typescript
type ApiResponse<T> = Result<T, string>;

type UserApiResponse = ApiResponse<User>;
type ProductApiResponse = ApiResponse<Product>;

// The discriminated union pattern works with mapped types
type ActionMap = {
	increment: { type: "increment" };
	decrement: { type: "decrement" };
	setCount: { type: "setCount"; payload: number };
};

type Action = ActionMap[keyof ActionMap];

function handleAction(action: Action): void {
	switch (action.type) {
		case "increment":
			// action has type { type: "increment" }
			break;
		case "decrement":
			// action has type { type: "decrement" }
			break;
		case "setCount":
			// action has type { type: "setCount"; payload: number }
			console.log(action.payload);
			break;
		default:
			const _never: never = action;
			throw new Error(`Unknown action: ${_never}`);
	}
}
```

## Summary

Discriminated unions are a cornerstone of type-safe TypeScript development. They provide:

- **Exhaustive Type Checking**: Compiler ensures all cases are handled
- **Type Safety**: Automatic narrowing based on discriminant values
- **Better IntelliSense**: Context-aware autocomplete
- **Maintainability**: Easy to extend and refactor
- **Error Prevention**: Compile-time detection of missing cases

Key principles:

- Use literal types for discriminants
- Make discriminants required and readonly
- Include exhaustive checks with `never`
- Combine with type guards for complex scenarios

Discriminated unions excel in scenarios like:

- API response handling
- State management (Redux, Zustand)
- Event processing
- Parser implementations
- Form validation
- Error handling

When designing TypeScript code, consider discriminated unions whenever you have mutually exclusive types that share a common property for identification.
