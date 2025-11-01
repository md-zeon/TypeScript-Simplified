# Typeof Operator in TypeScript

The `typeof` operator in TypeScript serves two main purposes: at runtime, it returns a string indicating the type of a value, and at compile time, it can be used to extract the type of a variable or property. This dual nature makes `typeof` a powerful tool for both runtime type checking and compile-time type extraction.

## Runtime Typeof

### Basic Runtime Type Checking

```typescript
function getType(value: any): string {
	return typeof value;
}

console.log(getType("hello")); // "string"
console.log(getType(42)); // "number"
console.log(getType(true)); // "boolean"
console.log(getType({})); // "object"
console.log(getType([])); // "object"
console.log(getType(null)); // "object"
console.log(getType(undefined)); // "undefined"
console.log(getType(() => {})); // "function"
```

### Type Guards with Typeof

```typescript
function processValue(value: unknown): string {
	if (typeof value === "string") {
		return value.toUpperCase();
	} else if (typeof value === "number") {
		return value.toString();
	} else if (typeof value === "boolean") {
		return value ? "true" : "false";
	} else {
		return "unknown";
	}
}

console.log(processValue("hello")); // "HELLO"
console.log(processValue(42)); // "42"
console.log(processValue(true)); // "true"
```

## Compile-Time Typeof

### Extracting Types from Variables

```typescript
const user = {
	name: "Alice",
	age: 30,
	isAdmin: false,
};

type UserType = typeof user;
// Equivalent to: { name: string; age: number; isAdmin: boolean; }

const config = {
	apiUrl: "https://api.example.com",
	timeout: 5000,
	retries: 3,
} as const;

type ConfigType = typeof config;
// { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000; readonly retries: 3; }
```

### Typeof with Functions

```typescript
function createUser(name: string, age: number) {
	return {
		name,
		age,
		createdAt: new Date(),
	};
}

type CreateUserReturnType = ReturnType<typeof createUser>;
// { name: string; age: number; createdAt: Date; }

type CreateUserParams = Parameters<typeof createUser>;
// [name: string, age: number]
```

## Typeof with Classes

### Class Instance Types

```typescript
class Person {
	constructor(public name: string, public age: number) {}

	greet() {
		return `Hello, I'm ${this.name}`;
	}
}

type PersonInstance = InstanceType<typeof Person>;
// Equivalent to: Person

const personType: PersonInstance = new Person("Alice", 30);
```

### Class Constructor Types

```typescript
type PersonConstructor = typeof Person;
// Equivalent to: new (name: string, age: number) => Person

function createPerson(
	Constructor: typeof Person,
	name: string,
	age: number,
): Person {
	return new Constructor(name, age);
}

const alice = createPerson(Person, "Alice", 30);
```

## Typeof with Enums

### Enum Value Types

```typescript
enum Direction {
	Up = "UP",
	Down = "DOWN",
	Left = "LEFT",
	Right = "RIGHT",
}

type DirectionType = typeof Direction;
// { Up: Direction.Up; Down: Direction.Down; Left: Direction.Left; Right: Direction.Right; }

type DirectionValues = (typeof Direction)[keyof typeof Direction];
// "UP" | "DOWN" | "LEFT" | "RIGHT"
```

## Typeof with Modules

### Module Type Extraction

```typescript
// math.ts
export const PI = 3.14159;
export const E = 2.71828;
export function add(a: number, b: number): number {
	return a + b;
}

// main.ts
import * as MathModule from "./math";

type MathModuleType = typeof MathModule;
// { PI: number; E: number; add: (a: number, b: number) => number; }
```

## Advanced Typeof Patterns

### Typeof with Template Literals

```typescript
const eventTypes = {
	click: "click",
	change: "change",
	submit: "submit",
} as const;

type EventType = (typeof eventTypes)[keyof typeof eventTypes];
// "click" | "change" | "submit"

type EventHandlerName = `on${Capitalize<EventType>}`;
// "onClick" | "onChange" | "onSubmit"
```

### Typeof with Conditional Types

```typescript
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

function example<T>(value: T) {
	type IsValueFunction = IsFunction<typeof value>;
	// This would be evaluated at compile time
}
```

## Practical Examples

### API Response Types

```typescript
// API response structure
const mockResponse = {
	user: {
		id: 1,
		name: "Alice",
		email: "alice@example.com",
	},
	posts: [
		{ id: 1, title: "Hello World", content: "..." },
		{ id: 2, title: "TypeScript Tips", content: "..." },
	],
	metadata: {
		total: 2,
		page: 1,
	},
};

// Extract types from mock data
type APIResponse = typeof mockResponse;
type User = typeof mockResponse.user;
type Post = (typeof mockResponse.posts)[0];
type Metadata = typeof mockResponse.metadata;

// Use in functions
function processAPIResponse(response: APIResponse) {
	console.log(`Found ${response.posts.length} posts`);
	response.posts.forEach((post) => {
		console.log(`Post: ${post.title}`);
	});
}
```

### Configuration Management

```typescript
const developmentConfig = {
	apiUrl: "http://localhost:3000",
	debug: true,
	timeout: 5000,
	features: {
		logging: true,
		caching: false,
		analytics: false,
	},
} as const;

const productionConfig = {
	apiUrl: "https://api.example.com",
	debug: false,
	timeout: 10000,
	features: {
		logging: false,
		caching: true,
		analytics: true,
	},
} as const;

type Config = typeof developmentConfig;

function createApp(config: Config) {
	if (config.debug) {
		console.log("Running in debug mode");
	}
	// Use config...
}

createApp(developmentConfig);
createApp(productionConfig);
```

### Event System Types

```typescript
interface EventMap {
	"user:login": { userId: number; timestamp: Date };
	"user:logout": { userId: number; sessionId: string };
	"post:created": { postId: number; authorId: number; content: string };
}

type EventName = keyof EventMap;
type EventData<K extends EventName> = EventMap[K];

class EventEmitter {
	private listeners = new Map<EventName, Function[]>();

	emit<K extends EventName>(event: K, data: EventData<K>) {
		const listeners = this.listeners.get(event);
		if (listeners) {
			listeners.forEach((listener) => listener(data));
		}
	}

	on<K extends EventName>(event: K, listener: (data: EventData<K>) => void) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)!.push(listener);
	}
}

const emitter = new EventEmitter();
emitter.on("user:login", (data) => {
	console.log(`User ${data.userId} logged in at ${data.timestamp}`);
});

emitter.emit("user:login", { userId: 123, timestamp: new Date() });
```

## Typeof vs Other Type Operators

### Typeof vs Keyof

```typescript
interface Person {
	name: string;
	age: number;
}

const person = { name: "Alice", age: 30 };

// typeof extracts the type of the value
type PersonType = typeof person; // { name: string; age: number; }

// keyof extracts the keys of a type
type PersonKeys = keyof PersonType; // "name" | "age"
```

### Typeof vs Instanceof

```typescript
class Animal {
	constructor(public name: string) {}
}

const animal = new Animal("Dog");

// typeof (runtime)
console.log(typeof animal); // "object"

// instanceof (runtime)
console.log(animal instanceof Animal); // true

// typeof (compile-time)
type AnimalType = typeof animal; // Animal
```

## Best Practices

1. **Use typeof for extracting types from values**: When you have a value and want to extract its type, use `typeof`.

2. **Combine with utility types**: Use `ReturnType<typeof func>` and `Parameters<typeof func>` for function types.

3. **Use with const assertions**: Combine `typeof` with `as const` for literal types.

4. **Prefer compile-time typeof over runtime**: Use compile-time `typeof` when possible for better type safety.

5. **Be careful with runtime typeof**: Runtime `typeof` has limitations (e.g., arrays return "object").

6. **Use typeof with enums carefully**: Remember that `typeof enum` gives the enum object type, not the union of values.

## Common Pitfalls

### Arrays and Null

```typescript
// Pitfall: typeof [] === "object"
console.log(typeof []); // "object"
console.log(typeof null); // "object"

// Better approach
function isArray(value: unknown): value is unknown[] {
	return Array.isArray(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
```

### Function vs Object

```typescript
function isFunction(value: unknown): value is Function {
	return typeof value === "function";
}

const func = () => {};
const obj = {};

console.log(isFunction(func)); // true
console.log(isFunction(obj)); // false
```

### BigInt and Symbol

```typescript
// Modern JavaScript types
console.log(typeof 123n); // "bigint"
console.log(typeof Symbol()); // "symbol"

// These are properly typed in TypeScript
const bigInt: bigint = 123n;
const symbol: symbol = Symbol();
```

```

```
