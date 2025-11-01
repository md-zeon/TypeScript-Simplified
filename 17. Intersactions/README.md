# Intersection Types in TypeScript

Intersection types allow you to combine multiple types into one. This means that an object of an intersection type must satisfy all the combined types. Intersection types are denoted using the `&` (ampersand) symbol between the types.

## Basic Intersection Types

### Simple Intersection Types

```typescript
interface Person {
	name: string;
	age: number;
}

interface Employee {
	employeeId: number;
	department: string;
}

// Intersection type combining Person and Employee
type StaffMember = Person & Employee;

const staff: StaffMember = {
	name: "Alice",
	age: 30,
	employeeId: 12345,
	department: "Engineering",
};

console.log(staff.name); // "Alice"
console.log(staff.employeeId); // 12345
```

### Intersection with Primitive Types

```typescript
// Intersection of primitive types (rare but possible)
type StringAndNumber = string & number; // This is 'never' since no value can be both string and number

// More practical example
type Serializable = { toJSON(): string };
type Loggable = { log(): void };

type DebuggableObject = Serializable & Loggable;

const obj: DebuggableObject = {
	toJSON() {
		return JSON.stringify(this);
	},
	log() {
		console.log("Logging:", this.toJSON());
	},
};
```

## Intersection Types with Functions

### Function Intersection Types

```typescript
interface Callable {
	(): void;
}

interface Loggable {
	log(message: string): void;
}

// Intersection of function and object types
type CallableLogger = Callable & Loggable;

const logger: CallableLogger = Object.assign(() => console.log("Called!"), {
	log(message: string) {
		console.log("Log:", message);
	},
});

logger(); // "Called!"
logger.log("Hello"); // "Log: Hello"
```

## Intersection Types in Classes

### Class Intersection Types

```typescript
class Animal {
	constructor(public name: string) {}
	move(distance: number = 0) {
		console.log(`${this.name} moved ${distance}m.`);
	}
}

class Eater {
	eat(food: string) {
		console.log(`${this.constructor.name} is eating ${food}.`);
	}
}

// Intersection type
type AnimalEater = Animal & Eater;

const animalEater: AnimalEater = Object.assign(new Animal("Dog"), new Eater());

animalEater.move(10); // "Dog moved 10m."
animalEater.eat("bone"); // "Eater is eating bone."
```

## Advanced Intersection Patterns

### Intersection with Utility Types

```typescript
interface BaseEntity {
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

interface UserData {
	name: string;
	email: string;
}

interface PostData {
	title: string;
	content: string;
}

// Using intersection with utility types
type User = BaseEntity & UserData;
type Post = BaseEntity & PostData;

const user: User = {
	id: "1",
	createdAt: new Date(),
	updatedAt: new Date(),
	name: "Alice",
	email: "alice@example.com",
};

const post: Post = {
	id: "2",
	createdAt: new Date(),
	updatedAt: new Date(),
	title: "TypeScript Intersections",
	content: "Intersection types are powerful...",
};
```

### Generic Intersection Types

```typescript
interface Repository<T> {
	findById(id: string): T | undefined;
	save(entity: T): void;
	delete(id: string): void;
}

interface Cacheable<T> {
	getCached(key: string): T | undefined;
	setCached(key: string, value: T): void;
}

// Generic intersection
type CachedRepository<T> = Repository<T> & Cacheable<T>;

class UserRepository implements CachedRepository<User> {
	private users: Map<string, User> = new Map();
	private cache: Map<string, User> = new Map();

	findById(id: string): User | undefined {
		return this.users.get(id);
	}

	save(entity: User): void {
		this.users.set(entity.id, entity);
		this.setCached(entity.id, entity);
	}

	delete(id: string): void {
		this.users.delete(id);
		this.cache.delete(id);
	}

	getCached(key: string): User | undefined {
		return this.cache.get(key);
	}

	setCached(key: string, value: User): void {
		this.cache.set(key, value);
	}
}
```

## Intersection vs Union Types

### Key Differences

```typescript
interface A {
	a: string;
}

interface B {
	b: string;
}

// Intersection: must have both properties
type IntersectionAB = A & B;
const intersectionObj: IntersectionAB = { a: "hello", b: "world" };

// Union: can have either set of properties
type UnionAB = A | B;
const unionObj1: UnionAB = { a: "hello" };
const unionObj2: UnionAB = { b: "world" };
```

## Practical Examples

### Configuration Objects

```typescript
interface DatabaseConfig {
	host: string;
	port: number;
	database: string;
}

interface AuthConfig {
	username: string;
	password: string;
}

interface SSLConfig {
	ssl: boolean;
	ca?: string;
	cert?: string;
	key?: string;
}

// Combined configuration
type FullDatabaseConfig = DatabaseConfig & AuthConfig & SSLConfig;

const config: FullDatabaseConfig = {
	host: "localhost",
	port: 5432,
	database: "myapp",
	username: "admin",
	password: "secret",
	ssl: true,
	ca: "/path/to/ca.pem",
	cert: "/path/to/client-cert.pem",
	key: "/path/to/client-key.pem",
};
```

### Mixin Patterns

```typescript
// Base class
class BaseClass {
	baseProperty = "base";
	baseMethod() {
		console.log("Base method");
	}
}

// Mixin functions
function Timestampable<T extends new (...args: any[]) => any>(Base: T) {
	return class extends Base {
		timestamp = new Date();
		getTimestamp() {
			return this.timestamp;
		}
	};
}

function Serializable<T extends new (...args: any[]) => any>(Base: T) {
	return class extends Base {
		toJSON() {
			return JSON.stringify(this);
		}
		fromJSON(json: string) {
			Object.assign(this, JSON.parse(json));
			return this;
		}
	};
}

// Applying mixins using intersection types
type TimestampedSerializableClass = ReturnType<typeof Timestampable> &
	ReturnType<typeof Serializable>;

const MixedClass = Serializable(Timestampable(BaseClass));
type MixedInstance = InstanceType<typeof MixedClass>;

const instance: MixedInstance = new MixedClass();
instance.baseMethod(); // "Base method"
console.log(instance.getTimestamp()); // Current timestamp
console.log(instance.toJSON()); // JSON representation
```

### API Response Types

```typescript
interface ApiResponse {
	status: number;
	statusText: string;
}

interface SuccessResponse extends ApiResponse {
	status: 200;
	data: any;
}

interface ErrorResponse extends ApiResponse {
	status: 400 | 401 | 500;
	error: string;
}

// Intersection for specific response types
type HttpResponse = SuccessResponse | ErrorResponse;

function handleResponse(response: HttpResponse) {
	if (response.status === 200) {
		console.log("Success:", (response as SuccessResponse).data);
	} else {
		console.error("Error:", (response as ErrorResponse).error);
	}
}

const success: SuccessResponse = {
	status: 200,
	statusText: "OK",
	data: { message: "Success!" },
};

const error: ErrorResponse = {
	status: 400,
	statusText: "Bad Request",
	error: "Invalid input",
};

handleResponse(success);
handleResponse(error);
```

## Common Use Cases

### Extending Existing Types

```typescript
type OriginalType = {
	name: string;
	age: number;
};

// Adding additional properties
type ExtendedType = OriginalType & {
	email: string;
	phone?: string;
};

const extended: ExtendedType = {
	name: "Alice",
	age: 30,
	email: "alice@example.com",
	phone: "123-456-7890",
};
```

### Combining Utility Types

```typescript
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;

// Intersection of utility types
type ComplexUser = PartialUser & RequiredUser & ReadonlyUser;

const complexUser: ComplexUser = {
	id: "1", // Required
	createdAt: new Date(), // Required
	updatedAt: new Date(), // Required
	name: "Alice", // Required
	email: "alice@example.com", // Required
};

// complexUser.id = "2"; // Error: readonly property
```

## Best Practices

1. **Use intersections for combining related types**: Intersections work best when combining types that represent different aspects of the same entity.

2. **Avoid conflicting properties**: Be careful with intersections that have conflicting property types, as this can result in `never` types.

3. **Prefer interfaces for object types**: For object types, consider using interface merging instead of intersections when possible.

4. **Use intersections with utility types**: Intersections work well with TypeScript's built-in utility types like `Partial`, `Required`, `Readonly`, etc.

5. **Consider union types for alternatives**: If you need a type that can be one of several options, use union types (`|`) instead of intersections (`&`).

## Performance Considerations

Intersection types are resolved at compile time and don't affect runtime performance. However, deeply nested intersection types can make type checking slower and error messages harder to read. Keep intersection types as simple as possible for better developer experience.
