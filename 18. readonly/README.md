# Readonly Modifier in TypeScript

The `readonly` modifier in TypeScript allows you to mark properties of objects and arrays as immutable. Once a property is marked as `readonly`, it cannot be reassigned after the object is created. This helps prevent accidental mutations and makes your code more predictable and safer.

## Readonly Properties in Interfaces

### Basic Readonly Properties

```typescript
interface User {
	readonly id: number;
	name: string;
	email: string;
}

const user: User = {
	id: 1,
	name: "Alice",
	email: "alice@example.com",
};

user.name = "Bob"; // OK
user.email = "bob@example.com"; // OK
// user.id = 2; // Error: Cannot assign to 'id' because it is a read-only property
```

### Readonly in Classes

```typescript
class Person {
	readonly birthDate: Date;

	constructor(birthDate: Date, public name: string) {
		this.birthDate = birthDate;
	}
}

const person = new Person(new Date("1990-01-01"), "Alice");
// person.birthDate = new Date(); // Error: Cannot assign to 'birthDate' because it is a read-only property
person.name = "Bob"; // OK
```

## Readonly Arrays

### Readonly Array Type

```typescript
const numbers: readonly number[] = [1, 2, 3, 4, 5];

// numbers.push(6); // Error: Property 'push' does not exist on type 'readonly number[]'
// numbers.pop(); // Error: Property 'pop' does not exist on type 'readonly number[]'
// numbers[0] = 10; // Error: Index signature in type 'readonly number[]' only permits reading

// Reading is allowed
console.log(numbers[0]); // 1
console.log(numbers.length); // 5
```

### ReadonlyArray<T> Utility Type

```typescript
const strings: ReadonlyArray<string> = ["a", "b", "c"];

// strings.push("d"); // Error
// strings[0] = "z"; // Error

// You can create mutable copies
const mutableStrings = [...strings];
mutableStrings.push("d"); // OK
console.log(mutableStrings); // ["a", "b", "c", "d"]
```

## Readonly Utility Types

### Readonly<T>

```typescript
interface Config {
	host: string;
	port: number;
	ssl: boolean;
}

type ReadonlyConfig = Readonly<Config>;

const config: ReadonlyConfig = {
	host: "localhost",
	port: 8080,
	ssl: false,
};

// config.host = "remotehost"; // Error: Cannot assign to 'host' because it is a read-only property
// config.port = 443; // Error: Cannot assign to 'port' because it is a read-only property
```

### Deep Readonly

```typescript
interface NestedConfig {
	database: {
		host: string;
		port: number;
	};
	server: {
		port: number;
		ssl: boolean;
	};
}

type DeepReadonly<T> = {
	readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

type ReadonlyNestedConfig = DeepReadonly<NestedConfig>;

const nestedConfig: ReadonlyNestedConfig = {
	database: {
		host: "localhost",
		port: 5432,
	},
	server: {
		port: 8080,
		ssl: true,
	},
};

// nestedConfig.database.host = "remote"; // Error: Cannot assign to 'host' because it is a read-only property
// nestedConfig.server.port = 443; // Error: Cannot assign to 'port' because it is a read-only property
```

## Readonly with Index Signatures

### Readonly Index Signatures

```typescript
interface Dictionary {
	readonly [key: string]: string;
}

const dict: Dictionary = {
	hello: "world",
	foo: "bar",
};

// dict.hello = "universe"; // Error: Index signature in type 'Dictionary' only permits reading
// dict.newKey = "value"; // Error: Index signature in type 'Dictionary' only permits reading
```

## Readonly in Function Parameters

### Readonly Parameters

```typescript
function processArray(arr: readonly number[]): void {
	// arr.push(1); // Error: Property 'push' does not exist on type 'readonly number[]'
	// arr[0] = 10; // Error: Cannot assign to '0' because it is a read-only property

	// Reading is allowed
	for (const num of arr) {
		console.log(num);
	}
}

const myArray = [1, 2, 3];
processArray(myArray); // OK - arrays are contravariant
```

## Readonly vs Const

### Key Differences

```typescript
// const prevents reassignment of the variable
const constantValue = 42;
// constantValue = 43; // Error

// readonly prevents mutation of object properties
const readonlyObject = { value: 42 } as const;
// readonlyObject.value = 43; // Error

// readonly modifier on properties
interface ReadonlyInterface {
	readonly value: number;
}

const obj: ReadonlyInterface = { value: 42 };
// obj.value = 43; // Error
```

## Readonly with Mapped Types

### Creating Readonly Versions

```typescript
type MutablePerson = {
	name: string;
	age: number;
	email: string;
};

type ReadonlyPerson = {
	readonly [K in keyof MutablePerson]: MutablePerson[K];
};

const person: ReadonlyPerson = {
	name: "Alice",
	age: 30,
	email: "alice@example.com",
};

// person.name = "Bob"; // Error
// person.age = 31; // Error
```

## Practical Examples

### Immutable Data Structures

```typescript
interface Point {
	readonly x: number;
	readonly y: number;
}

function createPoint(x: number, y: number): Point {
	return { x, y };
}

function movePoint(point: Point, dx: number, dy: number): Point {
	return {
		x: point.x + dx,
		y: point.y + dy,
	};
}

const point1 = createPoint(10, 20);
const point2 = movePoint(point1, 5, 5);

console.log(point1); // { x: 10, y: 20 }
console.log(point2); // { x: 15, y: 25 }
```

### Configuration Objects

```typescript
interface AppConfig {
	readonly apiUrl: string;
	readonly timeout: number;
	readonly retries: number;
	readonly features: readonly string[];
}

const config: AppConfig = {
	apiUrl: "https://api.example.com",
	timeout: 5000,
	retries: 3,
	features: ["auth", "logging", "caching"],
};

// config.apiUrl = "https://new-api.example.com"; // Error
// config.features.push("new-feature"); // Error
// config.features[0] = "authentication"; // Error
```

### State Management

```typescript
interface AppState {
	readonly user: {
		readonly id: number;
		readonly name: string;
		readonly preferences: readonly string[];
	};
	readonly settings: {
		readonly theme: string;
		readonly language: string;
	};
}

function updateUserName(state: AppState, newName: string): AppState {
	return {
		...state,
		user: {
			...state.user,
			name: newName,
		},
	};
}

const initialState: AppState = {
	user: {
		id: 1,
		name: "Alice",
		preferences: ["dark-mode", "notifications"],
	},
	settings: {
		theme: "dark",
		language: "en",
	},
};

const updatedState = updateUserName(initialState, "Bob");
console.log(updatedState.user.name); // "Bob"
console.log(initialState.user.name); // "Alice" (original unchanged)
```

## Readonly with Tuples

### Readonly Tuples

```typescript
const tuple: readonly [string, number] = ["hello", 42];

// tuple[0] = "world"; // Error
// tuple.push("extra"); // Error

// Reading is allowed
console.log(tuple[0]); // "hello"
console.log(tuple[1]); // 42
```

## Best Practices

1. **Use readonly for immutable data**: Mark properties that should never change as `readonly` to prevent accidental mutations.

2. **Prefer readonly arrays when possible**: Use `readonly T[]` or `ReadonlyArray<T>` for arrays that shouldn't be modified.

3. **Combine with const assertions**: Use `as const` for literal values that should be deeply readonly.

4. **Use in function parameters**: Mark parameters as readonly when you
