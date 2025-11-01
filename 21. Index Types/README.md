# Index Types in TypeScript

Index types, also known as index signatures, allow you to define types for objects that can have properties with arbitrary keys. This is particularly useful when you need to create flexible data structures like dictionaries, maps, or objects with dynamic property names. Index signatures are denoted using square brackets `[]` in type definitions.

## Basic Index Signatures

### String Index Signatures

```typescript
interface StringDictionary {
	[key: string]: string;
}

const dictionary: StringDictionary = {
	hello: "world",
	foo: "bar",
	name: "TypeScript",
};

// All values must be strings
dictionary["newKey"] = "newValue";
console.log(dictionary.hello); // "world"
```

### Number Index Signatures

```typescript
interface NumberArray {
	[index: number]: string;
}

const arrayLike: NumberArray = {
	0: "first",
	1: "second",
	2: "third",
};

console.log(arrayLike[0]); // "first"
console.log(arrayLike[1]); // "second"
```

## Index Signatures with Known Properties

### Combining Index Signatures with Specific Properties

```typescript
interface Person {
	name: string;
	age: number;
	[key: string]: string | number; // Index signature must include all possible property types
}

const person: Person = {
	name: "Alice",
	age: 30,
	email: "alice@example.com", // string
	nickname: "Al", // string
};

// person.address = { street: "123 Main St" }; // Error: object not assignable to string | number
```

## Index Signatures with Symbol Keys

### Symbol Index Signatures

```typescript
const sym1 = Symbol("key1");
const sym2 = Symbol("key2");

interface SymbolDictionary {
	[key: symbol]: string;
}

const symbolDict: SymbolDictionary = {
	[sym1]: "value1",
	[sym2]: "value2",
};

console.log(symbolDict[sym1]); // "value1"
```

## Advanced Index Signature Patterns

### Index Signatures with Union Types

```typescript
interface FlexibleObject {
	[key: string]: string | number | boolean;
}

const obj: FlexibleObject = {
	name: "Alice",
	age: 30,
	isActive: true,
	score: 95.5,
};
```

### Index Signatures with Function Values

```typescript
interface EventHandlers {
	[event: string]: (data: any) => void;
}

const handlers: EventHandlers = {
	click: (data) => console.log("Clicked:", data),
	hover: (data) => console.log("Hovered:", data),
	custom: (data) => console.log("Custom event:", data),
};

function triggerEvent(eventName: string, data: any) {
	if (handlers[eventName]) {
		handlers[eventName](data);
	}
}

triggerEvent("click", { x: 10, y: 20 });
```

## Index Signatures vs Mapped Types

### Key Differences

```typescript
// Index signature - allows any string keys
interface Dictionary {
	[key: string]: string;
}

// Mapped type - works with known keys
type MappedDict<T> = {
	[K in keyof T]: string;
};

interface KnownKeys {
	name: string;
	age: number;
}

type Stringified = MappedDict<KnownKeys>;
// { name: string; age: string; }
```

## Index Signatures with Generics

### Generic Index Signatures

```typescript
interface GenericDictionary<T> {
	[key: string]: T;
}

const stringDict: GenericDictionary<string> = {
	hello: "world",
	greeting: "hi",
};

const numberDict: GenericDictionary<number> = {
	one: 1,
	two: 2,
	three: 3,
};
```

### Generic Constraints with Index Signatures

```typescript
type Dictionary<T extends string | number> = {
	[key: string]: T;
};

const mixedDict: Dictionary<string | number> = {
	name: "Alice",
	age: 30,
	score: 95,
};
```

## Practical Examples

### Configuration Objects

```typescript
interface Config {
	[key: string]: string | number | boolean;
	apiUrl: string;
	timeout: number;
	debug: boolean;
}

const appConfig: Config = {
	apiUrl: "https://api.example.com",
	timeout: 5000,
	debug: true,
	// Additional dynamic config
	theme: "dark",
	maxRetries: 3,
	enableCache: true,
};

function getConfigValue(key: string): string | number | boolean | undefined {
	return appConfig[key];
}

console.log(getConfigValue("apiUrl")); // "https://api.example.com"
console.log(getConfigValue("theme")); // "dark"
```

### HTTP Headers

```typescript
interface Headers {
	[key: string]: string;
	"content-type": string;
	authorization?: string;
}

const headers: Headers = {
	"content-type": "application/json",
	authorization: "Bearer token123",
	"x-custom-header": "custom-value",
	"x-api-key": "api-key-456",
};

function setHeader(name: string, value: string) {
	headers[name] = value;
}

function getHeader(name: string): string | undefined {
	return headers[name];
}
```

### Database Records

```typescript
interface DatabaseRecord {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	[key: string]: any; // Allow additional fields
}

interface UserRecord extends DatabaseRecord {
	name: string;
	email: string;
	role: "admin" | "user";
}

const user: UserRecord = {
	id: "user123",
	createdAt: new Date(),
	updatedAt: new Date(),
	name: "Alice",
	email: "alice@example.com",
	role: "admin",
	// Additional custom fields
	lastLogin: new Date(),
	preferences: { theme: "dark" },
};
```

## Index Signatures with Classes

### Class with Index Signature

```typescript
class DataStore {
	private data: { [key: string]: any } = {};

	set(key: string, value: any): void {
		this.data[key] = value;
	}

	get(key: string): any {
		return this.data[key];
	}

	has(key: string): boolean {
		return key in this.data;
	}

	delete(key: string): void {
		delete this.data[key];
	}

	keys(): string[] {
		return Object.keys(this.data);
	}
}

const store = new DataStore();
store.set("user", { name: "Alice", age: 30 });
store.set("config", { theme: "dark", lang: "en" });

console.log(store.get("user")); // { name: "Alice", age: 30 }
console.log(store.has("config")); // true
```

## Index Signatures with Utility Types

### Record Utility Type

```typescript
// Record<K, T> is equivalent to { [P in K]: T; }
type StringRecord = Record<string, string>;
type NumberRecord = Record<string, number>;
type BooleanRecord = Record<string, boolean>;

// Using with union types
type StatusRecord = Record<"idle" | "loading" | "success" | "error", boolean>;

const status: StatusRecord = {
	idle: false,
	loading: true,
	success: false,
	error: false,
};
```

### Partial with Index Signatures

```typescript
interface FullConfig {
	apiUrl: string;
	timeout: number;
	retries: number;
	[key: string]: string | number;
}

type PartialConfig = Partial<FullConfig>;

const partialConfig: PartialConfig = {
	apiUrl: "https://api.example.com",
	// timeout and retries are optional
	customSetting: "value",
};
```

## Index Signatures in Function Parameters

### Function with Index Signature Parameters

```typescript
function mergeObjects<T extends Record<string, any>>(
	target: T,
	source: Partial<T>,
): T {
	return { ...target, ...source };
}

interface User {
	name: string;
	age: number;
	email: string;
}

const user: User = {
	name: "Alice",
	age: 30,
	email: "alice@example.com",
};

const updatedUser = mergeObjects(user, {
	age: 31,
	email: "alice.smith@example.com",
});

console.log(updatedUser);
// { name: "Alice", age: 31, email: "alice.smith@example.com" }
```

## Common Patterns and Best Practices

### Dictionary Pattern

```typescript
type Dictionary<T> = { [key: string]: T };

const stringDict: Dictionary<string> = {
	hello: "world",
	goodbye: "farewell",
};

const numberDict: Dictionary<number> = {
	one: 1,
	two: 2,
	three: 3,
};
```

### Cache Implementation

```typescript
interface Cache<T> {
	[key: string]: T;
}

class MemoryCache<T> implements Cache<T> {
	[key: string]: T;

	private expiryTimes: { [key: string]: number } = {};

	set(key: string, value: T, ttlMs: number = 0): void {
		this[key] = value;
		if (ttlMs > 0) {
			this.expiryTimes[key] = Date.now() + ttlMs;
		}
	}

	get(key: string): T | undefined {
		if (this.expiryTimes[key] && Date.now() > this.expiryTimes[key]) {
			delete this[key];
			delete this.expiryTimes[key];
			return undefined;
		}
		return this[key];
	}
}

const cache = new MemoryCache<string>();
cache.set("user", "Alice", 5000); // Expires in 5 seconds
console.log(cache.get("user")); // "Alice"
```

### Event Emitter

```typescript
type EventCallback = (data?: any) => void;

interface EventEmitter {
	[eventName: string]: EventCallback | undefined;
}

class SimpleEventEmitter implements EventEmitter {
	[eventName: string]: EventCallback | undefined;

	private events: { [eventName: string]: EventCallback[] } = {};

	on(eventName: string, callback: EventCallback): void {
		if (!this.events[eventName]) {
			this.events[eventName] = [];
		}
		this.events[eventName].push(callback);
	}

	emit(eventName: string, data?: any): void {
		const callbacks = this.events[eventName];
		if (callbacks) {
			callbacks.forEach((callback) => callback(data));
		}
	}

	off(eventName: string, callback?: EventCallback): void {
		if (!callback) {
			delete this.events[eventName];
		} else {
			const callbacks = this.events[eventName];
			if (callbacks) {
				const index = callbacks.indexOf(callback);
				if (index > -1) {
					callbacks.splice(index, 1);
				}
			}
		}
	}
}

const emitter = new SimpleEventEmitter();
emitter.on("user:login", (data) => console.log("User logged in:", data));
emitter.on("user:logout", () => console.log("User logged out"));

emitter.emit("user:login", { userId: 123 });
emitter.emit("user:logout");
```

## Limitations and Considerations

### Index Signatures Cannot Coexist with Other Index Types

```typescript
// This is not allowed
interface MixedIndex {
	[key: string]: string;
	[index: number]: string; // Error: conflicting index signatures
}
```

### Index Signatures and Property Conflicts

```typescript
interface Problematic {
	[key: string]: string;
	name: string; // OK - string is assignable to string
	age: number; // Error - number is not assignable to string
}
```

### Performance Considerations

```typescript
// Index signatures can make type checking slower for large objects
interface LargeDictionary {
	[key: string]: any;
}

// Consider using Map for better performance with many dynamic keys
const map = new Map<string, any>();
map.set("key1", "value1");
map.set("key2", "value2");
```

## Best Practices

1. **Use specific types when possible**: Prefer known properties over index signatures when you know the structure.

2. **Be consistent with value types**: All properties must match the index signature's value type.

3. **Consider using Record utility type**: `Record<string, T>` is often clearer than `{ [key: string]: T }`.

4. **Use union types for mixed values**: When you need different types of values, use union types in the index signature.

5. **Avoid overusing `any`**: Try to be as specific as possible with index signature value types.

6. **Consider Map for complex scenarios**: For complex key-value storage, consider using `Map<K, V>` instead of index signatures.

## Common Use Cases

### Translation/Localization

```typescript
interface Translations {
	[key: string]: string;
	en: string;
	es: string;
	fr: string;
}

const greetings: Translations = {
	en: "Hello",
	es: "Hola",
	fr: "Bonjour",
	de: "Hallo", // Additional language
};

function getGreeting(lang: string): string {
	return greetings[lang] || greetings.en;
}
```

### Form Validation

```typescript
interface ValidationRules {
	[fieldName: string]: (value: any) => string | null;
}

const rules: ValidationRules = {
	email: (value) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value) ? null : "Invalid email";
	},
	age: (value) => {
		return typeof value === "number" && value >= 0
			? null
			: "Age must be a positive number";
	},
	name: (value) => {
		return typeof value === "string" && value.length > 0
			? null
			: "Name is required";
	},
};

function validateField(fieldName: string, value: any): string | null {
	const rule = rules[fieldName];
	return rule ? rule(value) : null;
}

console.log(validateField("email", "invalid-email")); // "Invalid email"
console.log(validateField("email", "user@example.com")); // null
```

### API Response Caching

```typescript
interface APICache {
	[url: string]: {
		data: any;
		timestamp: number;
		expiresAt: number;
	};
}

class APICacheManager {
	private cache: APICache = {};

	get(url: string): any | null {
		const cached = this.cache[url];
		if (!cached) return null;

		if (Date.now() > cached.expiresAt) {
			delete this.cache[url];
			return null;
		}

		return cached.data;
	}

	set(url: string, data: any, ttlMs: number = 300000): void {
		// 5 minutes default
		this.cache[url] = {
			data,
			timestamp: Date.now(),
			expiresAt: Date.now() + ttlMs,
		};
	}

	clear(): void {
		this.cache = {};
	}

	size(): number {
		return Object.keys(this.cache).length;
	}
}

const apiCache = new APICacheManager();
apiCache.set("/api/users", [{ id: 1, name: "Alice" }]);
console.log(apiCache.get("/api/users")); // [{ id: 1, name: "Alice" }]
```

Index types provide powerful flexibility for creating dynamic data structures while maintaining type safety. They are essential for building dictionaries, caches, configuration objects, and other structures that need to handle arbitrary keys.
