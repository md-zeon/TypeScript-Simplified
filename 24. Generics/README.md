# Generics in TypeScript

Generics are one of the most powerful features in TypeScript, enabling the creation of reusable components that work with multiple types while maintaining type safety. Generics allow you to write code that can work with any type, providing compile-time type checking and IntelliSense support. They are essential for building flexible, type-safe libraries and applications.

## Basic Generic Functions

### Simple Generic Function

```typescript
function identity<T>(arg: T): T {
	return arg;
}

const result1 = identity<string>("hello"); // Explicit type
const result2 = identity(42); // Type inferred as number
const result3 = identity({ name: "Alice", age: 30 }); // Type inferred as object
```

### Generic Function with Multiple Type Parameters

```typescript
function merge<T, U>(obj1: T, obj2: U): T & U {
	return { ...obj1, ...obj2 };
}

const merged = merge({ name: "Alice" }, { age: 30 });
// Type: { name: string; } & { age: number; }
console.log(merged); // { name: "Alice", age: 30 }
```

## Generic Interfaces

### Generic Interface

```typescript
interface Container<T> {
	value: T;
	getValue(): T;
	setValue(value: T): void;
}

const stringContainer: Container<string> = {
	value: "hello",
	getValue() {
		return this.value;
	},
	setValue(value: string) {
		this.value = value;
	},
};

const numberContainer: Container<number> = {
	value: 42,
	getValue() {
		return this.value;
	},
	setValue(value: number) {
		this.value = value;
	},
};
```

### Generic Interface with Multiple Parameters

```typescript
interface Pair<T, U> {
	first: T;
	second: U;
}

const stringNumberPair: Pair<string, number> = {
	first: "hello",
	second: 42,
};

const booleanArrayPair: Pair<boolean, string[]> = {
	first: true,
	second: ["a", "b", "c"],
};
```

## Generic Classes

### Basic Generic Class

```typescript
class Stack<T> {
	private items: T[] = [];

	push(item: T): void {
		this.items.push(item);
	}

	pop(): T | undefined {
		return this.items.pop();
	}

	peek(): T | undefined {
		return this.items[this.items.length - 1];
	}

	isEmpty(): boolean {
		return this.items.length === 0;
	}

	size(): number {
		return this.items.length;
	}
}

const stringStack = new Stack<string>();
stringStack.push("hello");
stringStack.push("world");
console.log(stringStack.pop()); // "world"

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
console.log(numberStack.peek()); // 2
```

### Generic Class with Constraints

```typescript
interface HasLength {
	length: number;
}

class Collection<T extends HasLength> {
	private items: T[] = [];

	add(item: T): void {
		this.items.push(item);
	}

	findLongest(): T | undefined {
		if (this.items.length === 0) return undefined;

		return this.items.reduce((longest, current) =>
			current.length > longest.length ? current : longest,
		);
	}
}

const strings = new Collection<string>();
strings.add("hello");
strings.add("world");
strings.add("typescript");
console.log(strings.findLongest()); // "typescript"
```

## Generic Constraints

### Basic Constraints with extends

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
	return obj[key];
}

const person = { name: "Alice", age: 30 };
const name = getProperty(person, "name"); // string
const age = getProperty(person, "age"); // number
// getProperty(person, "email"); // Error: "email" is not a key of person
```

### Multiple Constraints

```typescript
function combine<T extends string | number, U extends string | number>(
	a: T,
	b: U,
): string {
	return `${a}${b}`;
}

console.log(combine("hello", 42)); // "hello42"
console.log(combine(1, "world")); // "1world"
// combine(true, "test"); // Error: boolean doesn't extend string | number
```

### Constructor Constraints

```typescript
function createInstance<T>(Constructor: new () => T): T {
	return new Constructor();
}

class Person {
	constructor(public name: string = "Unknown") {}
}

const person = createInstance(Person);
console.log(person.name); // "Unknown"
```

## Advanced Generic Patterns

### Conditional Types with Generics

```typescript
type IsArray<T> = T extends any[] ? true : false;

type A = IsArray<string[]>; // true
type B = IsArray<string>; // false

type ElementType<T> = T extends (infer U)[] ? U : never;

type StringArrayElement = ElementType<string[]>; // string
type NumberArrayElement = ElementType<number[]>; // number
type NotArrayElement = ElementType<string>; // never
```

### Mapped Types with Generics

```typescript
type OptionalProperties<T> = {
	[K in keyof T]?: T[K];
};

type ReadonlyProperties<T> = {
	readonly [K in keyof T]: T[K];
};

interface User {
	name: string;
	age: number;
	email: string;
}

type PartialUser = OptionalProperties<User>;
type ReadonlyUser = ReadonlyProperties<User>;

const partialUser: PartialUser = { name: "Alice" };
const readonlyUser: ReadonlyUser = {
	name: "Bob",
	age: 30,
	email: "bob@example.com",
};
// readonlyUser.name = "Charlie"; // Error: readonly property
```

### Generic Utility Types

```typescript
// Pick specific properties
type PickedUser = Pick<User, "name" | "email">;

// Omit specific properties
type OmittedUser = Omit<User, "age">;

// Make all properties optional
type PartialUser2 = Partial<User>;

// Make all properties required
type RequiredUser = Required<User>;

// Extract property types
type UserName = User["name"]; // string
type UserKeys = keyof User; // "name" | "age" | "email"
```

## Generic Type Inference

### Automatic Type Inference

```typescript
function createPair<T, U>(first: T, second: U): [T, U] {
	return [first, second];
}

const pair1 = createPair("hello", 42); // [string, number]
const pair2 = createPair(true, { name: "Alice" }); // [boolean, { name: string }]
```

### Context-Sensitive Inference

```typescript
function map<T, U>(array: T[], mapper: (item: T) => U): U[] {
	return array.map(mapper);
}

const numbers = [1, 2, 3];
const strings = map(numbers, (n) => n.toString()); // string[]
const doubled = map(numbers, (n) => n * 2); // number[]
```

## Generic Classes with Static Members

### Static Generic Methods

```typescript
class Utility {
	static wrap<T>(value: T): { value: T } {
		return { value };
	}

	static unwrap<T>(wrapped: { value: T }): T {
		return wrapped.value;
	}
}

const wrapped = Utility.wrap("hello"); // { value: string }
const unwrapped = Utility.unwrap(wrapped); // string
```

## Advanced Generic Constraints

### Using typeof with Generics

```typescript
const config = {
	apiUrl: "https://api.example.com",
	timeout: 5000,
} as const;

type Config = typeof config;

function updateConfig<T extends Partial<Config>>(updates: T): Config {
	return { ...config, ...updates };
}

const newConfig = updateConfig({ timeout: 10000 });
```

### Template Literal Types with Generics

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;

type ClickEvent = EventName<"click">; // "onClick"
type ChangeEvent = EventName<"change">; // "onChange"

interface EventHandlers {
	[K in EventName<string>]: () => void;
}
```

## Practical Examples

### Generic Data Structures

#### Linked List

```typescript
class Node<T> {
	constructor(public value: T, public next: Node<T> | null = null) {}
}

class LinkedList<T> {
	private head: Node<T> | null = null;
	private _size = 0;

	add(value: T): void {
		const newNode = new Node(value);
		if (!this.head) {
			this.head = newNode;
		} else {
			let current = this.head;
			while (current.next) {
				current = current.next;
			}
			current.next = newNode;
		}
		this._size++;
	}

	get size(): number {
		return this._size;
	}

	toArray(): T[] {
		const result: T[] = [];
		let current = this.head;
		while (current) {
			result.push(current.value);
			current = current.next;
		}
		return result;
	}
}

const list = new LinkedList<number>();
list.add(1);
list.add(2);
list.add(3);
console.log(list.toArray()); // [1, 2, 3]
```

#### Generic API Wrapper

```typescript
interface APIResponse<T> {
	data: T;
	status: number;
	message: string;
}

class APIClient {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	async get<T>(endpoint: string): Promise<APIResponse<T>> {
		const response = await fetch(`${this.baseURL}${endpoint}`);
		const data = await response.json();
		return {
			data,
			status: response.status,
			message: response.statusText,
		};
	}

	async post<T, U>(endpoint: string, body: U): Promise<APIResponse<T>> {
		const response = await fetch(`${this.baseURL}${endpoint}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const data = await response.json();
		return {
			data,
			status: response.status,
			message: response.statusText,
		};
	}
}

interface User {
	id: number;
	name: string;
	email: string;
}

const api = new APIClient("https://api.example.com");

// Type-safe API calls
const usersResponse = await api.get<User[]>("/users");
const createUserResponse = await api.post<User, Omit<User, "id">>("/users", {
	name: "Alice",
	email: "alice@example.com",
});
```

### Generic Form Handling

```typescript
type FormField<T> = {
	value: T;
	error: string | null;
	touched: boolean;
};

type FormData<T> = {
	[K in keyof T]: FormField<T[K]>;
};

class Form<T extends Record<string, any>> {
	private data: FormData<T>;

	constructor(initialData: T) {
		this.data = {} as FormData<T>;
		for (const key in initialData) {
			this.data[key] = {
				value: initialData[key],
				error: null,
				touched: false,
			};
		}
	}

	setValue<K extends keyof T>(key: K, value: T[K]): void {
		this.data[key].value = value;
		this.data[key].touched = true;
	}

	getValue<K extends keyof T>(key: K): T[K] {
		return this.data[key].value;
	}

	setError<K extends keyof T>(key: K, error: string | null): void {
		this.data[key].error = error;
	}

	getField<K extends keyof T>(key: K): FormField<T[K]> {
		return this.data[key];
	}

	isValid(): boolean {
		return Object.values(this.data).every((field) => field.error === null);
	}
}

interface LoginForm {
	email: string;
	password: string;
}

const loginForm = new Form<LoginForm>({
	email: "",
	password: "",
});

loginForm.setValue("email", "user@example.com");
loginForm.setError("password", "Password is required");

console.log(loginForm.getValue("email")); // "user@example.com"
console.log(loginForm.isValid()); // false
```

## Generic Higher-Order Functions

### Generic Compose Function

```typescript
function compose<A, B, C>(f: (x: B) => C, g: (x: A) => B): (x: A) => C {
	return (x) => f(g(x));
}

function addOne(x: number): number {
	return x + 1;
}

function double(x: number): number {
	return x * 2;
}

const addOneThenDouble = compose(double, addOne);
console.log(addOneThenDouble(3)); // 8 (3 + 1 = 4, 4 * 2 = 8)
```

### Generic Pipe Function

```typescript
function pipe<A, B>(value: A, fn: (x: A) => B): B;
function pipe<A, B, C>(value: A, fn1: (x: A) => B, fn2: (x: B) => C): C;
function pipe<A, B, C, D>(
	value: A,
	fn1: (x: A) => B,
	fn2: (x: B) => C,
	fn3: (x: C) => D,
): D;
function pipe(value: any, ...fns: ((x: any) => any)[]): any {
	return fns.reduce((acc, fn) => fn(acc), value);
}

const result = pipe(
	5,
	(x: number) => x + 1,
	(x: number) => x * 2,
	(x: number) => x.toString(),
); // "12"
```

## Best Practices

### Use Meaningful Generic Names

```typescript
// Good: Descriptive names
function filterArray<T, U extends T>(
	array: T[],
	predicate: (item: T) => item is U,
): U[] {
	return array.filter(predicate);
}

// Avoid: Single letters without context
function process<T, U>(data: T[]): U[] {
	// ...
}
```

### Provide Default Generic Types

```typescript
// Good: Default type when possible
class Container<T = any> {
	constructor(public value: T) {}
}

// Better: Constrained defaults
interface Repository<T extends { id: string } = { id: string }> {
	findById(id: string): T | undefined;
	save(entity: T): void;
}
```

### Use Generic Constraints Wisely

```typescript
// Good: Specific constraints
function sortBy<T, K extends keyof T>(array: T[], key: K): T[] {
	return array.sort((a, b) => {
		if (a[key] < b[key]) return -1;
		if (a[key] > b[key]) return 1;
		return 0;
	});
}

// Avoid: Overly broad constraints
function process<T extends any>(value: T): T {
	return value; // No real constraint needed
}
```

### Consider Performance Implications

```typescript
// Generics are zero-cost at runtime
// TypeScript compiles generics to JavaScript without type information
function identity<T>(value: T): T {
	return value;
}

// Compiled JavaScript:
// function identity(value) {
//     return value;
// }
```

## Common Patterns

### Builder Pattern with Generics

```typescript
class QueryBuilder<T> {
	private filters: Partial<T> = {};

	where<K extends keyof T>(key: K, value: T[K]): this {
		this.filters[key] = value;
		return this;
	}

	build(): Partial<T> {
		return this.filters;
	}
}

interface User {
	name: string;
	age: number;
	email: string;
}

const query = new QueryBuilder<User>().where("name", "Alice").where("age", 30);

const filters = query.build(); // Partial<User>
```

### Generic Error Handling

```typescript
class Result<T, E = Error> {
	constructor(private success: boolean, private value?: T, private error?: E) {}

	static ok<T>(value: T): Result<T> {
		return new Result(true, value);
	}

	static err<E>(error: E): Result<never, E> {
		return new Result(false, undefined, error);
	}

	isOk(): boolean {
		return this.success;
	}

	isErr(): boolean {
		return !this.success;
	}

	unwrap(): T {
		if (!this.success) {
			throw this.error;
		}
		return this.value!;
	}

	unwrapErr(): E {
		if (this.success) {
			throw new Error("Called unwrapErr on Ok result");
		}
		return this.error!;
	}
}

function divide(a: number, b: number): Result<number, string> {
	if (b === 0) {
		return Result.err("Division by zero");
	}
	return Result.ok(a / b);
}

const result = divide(10, 2);
if (result.isOk()) {
	console.log("Result:", result.unwrap()); // 5
} else {
	console.log("Error:", result.unwrapErr());
}
```

## Advanced Topics

### Higher-Kinded Types (Simulated)

```typescript
// TypeScript doesn't have higher-kinded types natively,
// but we can simulate them with conditional types

interface HKT<F, A> {
	// Higher-kinded type representation
}

type Maybe<A> = { type: "Just"; value: A } | { type: "Nothing" };

type Functor<F> = {
	map: <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B>;
};

function mapMaybe<A, B>(maybe: Maybe<A>, f: (a: A) => B): Maybe<B> {
	if (maybe.type === "Just") {
		return { type: "Just", value: f(maybe.value) };
	}
	return { type: "Nothing" };
}
```

### Generic Type Guards

```typescript
function isArray<T>(value: T | T[]): value is T[] {
	return Array.isArray(value);
}

function isDefined<T>(value: T | undefined | null): value is T {
	return value != null;
}

function assertIsDefined<T>(value: T | undefined | null): asserts value is T {
	if (value == null) {
		throw new Error("Value is null or undefined");
	}
}

function processItems<T>(items: (T | undefined)[]): T[] {
	return items.filter(isDefined);
}
```

Generics are fundamental to writing reusable, type-safe TypeScript code. They enable the creation of flexible APIs and data structures while maintaining compile-time type checking. Mastering generics is essential for building robust TypeScript applications and libraries.
