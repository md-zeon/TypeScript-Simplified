# Keyof Operator in TypeScript

The `keyof` operator in TypeScript is used to create a union type of all the keys (property names) of a given type. It's a powerful tool for creating type-safe operations on objects and is commonly used with mapped types, generics, and utility types.

## Basic Keyof Usage

### Simple Keyof

```typescript
interface Person {
	name: string;
	age: number;
	email: string;
}

type PersonKeys = keyof Person;
// Equivalent to: "name" | "age" | "email"

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
	return obj[key];
}

const person: Person = {
	name: "Alice",
	age: 30,
	email: "alice@example.com",
};

const name = getProperty(person, "name"); // string
const age = getProperty(person, "age"); // number
// const invalid = getProperty(person, "invalid"); // Error: Argument of type '"invalid"' is not assignable to parameter of type 'keyof Person'
```

## Keyof with Classes

### Class Property Keys

```typescript
class Car {
	brand: string;
	model: string;
	year: number;

	constructor(brand: string, model: string, year: number) {
		this.brand = brand;
		this.model = model;
		this.year = year;
	}
}

type CarKeys = keyof Car; // "brand" | "model" | "year"

const car = new Car("Toyota", "Camry", 2020);
const brand = car[keyof Car]; // Error: Element implicitly has an 'any' type

// Better approach
function getCarProperty<K extends keyof Car>(car: Car, key: K): Car[K] {
	return car[key];
}

const model = getCarProperty(car, "model"); // string
```

## Keyof with Index Signatures

### Index Signature Keys

```typescript
interface Dictionary {
	[key: string]: string;
}

type DictionaryKeys = keyof Dictionary; // string | number (string for string keys, number for numeric keys)

interface NumberDictionary {
	[key: number]: string;
}

type NumberDictionaryKeys = keyof NumberDictionary; // number
```

## Keyof with Union Types

### Union of Keys

```typescript
interface Dog {
	name: string;
	breed: string;
	bark(): void;
}

interface Cat {
	name: string;
	breed: string;
	meow(): void;
}

type Animal = Dog | Cat;
type AnimalKeys = keyof Animal; // "name" | "breed" (only common properties)

const animal: Animal = { name: "Fluffy", breed: "Mixed", bark: () => {} };
const name = animal["name"]; // OK
// const bark = animal["bark"]; // Error: Property 'bark' does not exist on type 'Animal'
```

## Keyof in Generic Constraints

### Generic Functions with Keyof

```typescript
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
	return items.map((item) => item[key]);
}

interface Product {
	id: number;
	name: string;
	price: number;
}

const products: Product[] = [
	{ id: 1, name: "Laptop", price: 1000 },
	{ id: 2, name: "Mouse", price: 50 },
];

const names = pluck(products, "name"); // string[]
const prices = pluck(products, "price"); // number[]
// const invalid = pluck(products, "category"); // Error
```

## Keyof with Mapped Types

### Creating Mapped Types

```typescript
interface User {
	id: number;
	name: string;
	email: string;
	createdAt: Date;
}

type OptionalUser = {
	[K in keyof User]?: User[K];
};

type ReadonlyUser = {
	readonly [K in keyof User]: User[K];
};

type NullableUser = {
	[K in keyof User]: User[K] | null;
};

const optionalUser: OptionalUser = {
	name: "Alice",
	email: "alice@example.com",
};

const readonlyUser: ReadonlyUser = {
	id: 1,
	name: "Bob",
	email: "bob@example.com",
	createdAt: new Date(),
};

// readonlyUser.name = "Charlie"; // Error: Cannot assign to 'name' because it is a read-only property
```

## Keyof with Template Literal Types

### Advanced Keyof Patterns

```typescript
interface APIResponse {
	userId: number;
	userName: string;
	postId: number;
	postTitle: string;
}

type APIKeys = keyof APIResponse;
// "userId" | "userName" | "postId" | "postTitle"

type UserKeys = `user${string}` & APIKeys;
// "userId" | "userName"

type PostKeys = `post${string}` & APIKeys;
// "postId" | "postTitle"
```

## Keyof with Conditional Types

### Conditional Keyof

```typescript
type NonFunctionPropertyNames<T> = {
	[K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

interface Example {
	name: string;
	age: number;
	greet(): void;
}

type PropertyNames = NonFunctionPropertyNames<Example>; // "name" | "age"
```

## Practical Examples

### Object Property Validator

```typescript
function validateObject<T extends Record<string, any>>(
	obj: T,
	requiredKeys: (keyof T)[],
): boolean {
	return requiredKeys.every((key) => key in obj && obj[key] != null);
}

interface FormData {
	name: string;
	email: string;
	age?: number;
}

const formData: FormData = {
	name: "Alice",
	email: "alice@example.com",
};

const isValid = validateObject(formData, ["name", "email"]); // true
const isValid2 = validateObject(formData, ["name", "age"]); // false
```

### Type-Safe Object Updater

```typescript
type Updater<T> = {
	[K in keyof T]?: T[K] | ((current: T[K]) => T[K]);
};

function updateObject<T extends Record<string, any>>(
	obj: T,
	updater: Updater<T>,
): T {
	const result = { ...obj };
	for (const key in updater) {
		const updateValue = updater[key];
		if (typeof updateValue === "function") {
			result[key] = (updateValue as Function)(result[key]);
		} else {
			result[key] = updateValue;
		}
	}
	return result;
}

interface Counter {
	count: number;
	name: string;
}

const counter: Counter = { count: 0, name: "My Counter" };

const updatedCounter = updateObject(counter, {
	count: (current: number) => current + 1,
	name: "Updated Counter",
});

console.log(updatedCounter); // { count: 1, name: "Updated Counter" }
```

### Deep Keyof

```typescript
type DeepKeys<T> = T extends Record<string, any>
	? {
			[K in keyof T]-?: K extends string | number
				? T[K] extends Record<string, any>
					? T[K] extends readonly unknown[]
						? K | `${K}.${DeepKeys<T[K]>}`
						: K | `${K}.${DeepKeys<T[K]>}`
					: K
				: never;
	  }[keyof T]
	: never;

interface NestedObject {
	user: {
		profile: {
			name: string;
			age: number;
		};
		settings: {
			theme: string;
		};
	};
	posts: Array<{
		id: number;
		title: string;
	}>;
}

type NestedKeys = DeepKeys<NestedObject>;
// "user" | "posts" | "user.profile" | "user.settings" | "user.profile.name" | "user.profile.age" | "user.settings.theme" | "posts.id" | "posts.title"
```

## Keyof with Utility Types

### Built-in Utility Types

```typescript
interface Todo {
	id: number;
	title: string;
	completed: boolean;
	createdAt: Date;
}

// Pick specific properties
type TodoPreview = Pick<Todo, "id" | "title">;

// Omit specific properties
type TodoWithoutId = Omit<Todo, "id">;

// Make all properties optional
type PartialTodo = Partial<Todo>;

// Make all properties required
type RequiredTodo = Required<Todo>;

// Extract property types
type TodoId = Todo["id"]; // number
type TodoTitle = Todo["title"]; // string
```

## Keyof in Advanced Patterns

### Event Handler Types

```typescript
interface EventHandlers {
	onClick: (event: MouseEvent) => void;
	onChange: (event: Event) => void;
	onSubmit: (event: SubmitEvent) => void;
}

type EventNames = keyof EventHandlers;
// "onClick" | "onChange" | "onSubmit"

type EventHandler<T extends EventNames> = EventHandlers[T];

function addEventListener<T extends EventNames>(
	element: HTMLElement,
	event: T,
	handler: EventHandler<T>,
) {
	element.addEventListener(
		event.slice(2).toLowerCase(),
		handler as EventListener,
	);
}

const button = document.createElement("button");
addEventListener(button, "onClick", (event) => {
	console.log("Button clicked", event);
});
```

### Database Query Builder

```typescript
interface User {
	id: number;
	name: string;
	email: string;
	role: "admin" | "user";
}

class QueryBuilder<T> {
	private filters: Partial<T> = {};

	where<K extends keyof T>(key: K, value: T[K]): this {
		this.filters[key] = value;
		return this;
	}

	whereIn<K extends keyof T>(key: K, values: T[K][]): this {
		// Implementation would filter by array of values
		return this;
	}

	orderBy<K extends keyof T>(key: K, direction: "asc" | "desc" = "asc"): this {
		// Implementation would set ordering
		return this;
	}

	select<K extends keyof T>(...keys: K[]): Pick<T, K>[] {
		// Implementation would return filtered and selected data
		return [];
	}
}

const query = new QueryBuilder<User>()
	.where("role", "admin")
	.whereIn("id", [1, 2, 3])
	.orderBy("name")
	.select("id", "name", "email");
```

## Best Practices

1. **Use keyof for type-safe property access**: Always use `keyof` when creating functions that access object properties dynamically.

2. **Combine with extends for constraints**: Use `K extends keyof T` to constrain generic parameters to valid keys.

3. **Leverage with mapped types**: Use `keyof` with mapped types to create powerful utility types.

4. **Consider performance**: Deep keyof operations can be expensive for very large types.
