# Object Basics in TypeScript

Objects are fundamental to JavaScript and TypeScript. TypeScript provides powerful ways to define object shapes, ensuring type safety while maintaining JavaScript's flexible object-oriented programming model. This section covers the basics of working with objects in TypeScript.

## Object Type Annotations

### Inline Object Types

You can define object types directly in variable declarations:

```typescript
// Basic object type
let user: { name: string; age: number; isActive: boolean } = {
	name: "John Doe",
	age: 30,
	isActive: true,
};

// Nested object types
let config: {
	database: {
		host: string;
		port: number;
	};
	features: {
		logging: boolean;
		analytics: boolean;
	};
} = {
	database: {
		host: "localhost",
		port: 5432,
	},
	features: {
		logging: true,
		analytics: false,
	},
};
```

### Optional Properties

Use the `?` operator to mark properties as optional:

```typescript
let person: {
	name: string;
	age?: number; // Optional property
	email?: string; // Optional property
} = {
	name: "Alice",
};

// All these are valid
person.age = 25;
person.email = "alice@example.com";
delete person.age; // OK, it's optional
```

### Readonly Properties

Use `readonly` to prevent property modification:

```typescript
let immutableUser: {
	readonly id: number;
	readonly name: string;
	age: number;
} = {
	id: 1,
	name: "John",
	age: 30,
};

immutableUser.age = 31; // OK
immutableUser.id = 2; // Error: Cannot assign to 'id' because it is a read-only property
```

## Interfaces

Interfaces provide a way to define object types that can be reused:

```typescript
// Basic interface
interface User {
	id: number;
	name: string;
	email: string;
	isActive: boolean;
}

// Using the interface
let user: User = {
	id: 1,
	name: "John Doe",
	email: "john@example.com",
	isActive: true,
};
```

### Interface with Optional Properties

```typescript
interface Product {
	id: number;
	name: string;
	description?: string;
	price: number;
	category?: string;
}

let product: Product = {
	id: 1,
	name: "Laptop",
	price: 999.99,
	// description and category are optional
};
```

### Interface with Readonly Properties

```typescript
interface Configuration {
	readonly apiUrl: string;
	readonly timeout: number;
	debug: boolean;
}

let config: Configuration = {
	apiUrl: "https://api.example.com",
	timeout: 5000,
	debug: false,
};

config.debug = true; // OK
config.apiUrl = "https://new-api.com"; // Error: read-only property
```

## Type Aliases

Type aliases provide another way to define object types:

```typescript
// Type alias for object
type Point = {
	x: number;
	y: number;
};

let point: Point = { x: 10, y: 20 };

// Type alias with union
type Status = "active" | "inactive" | "pending";

type UserWithStatus = {
	id: number;
	name: string;
	status: Status;
};

let user: UserWithStatus = {
	id: 1,
	name: "Alice",
	status: "active",
};
```

## Index Signatures

Index signatures allow objects to have dynamic property names:

```typescript
// String index signature
interface StringDictionary {
	[key: string]: string;
}

let dict: StringDictionary = {
	hello: "world",
	foo: "bar",
};

// Number index signature
interface NumberArray {
	[index: number]: number;
}

let arr: NumberArray = {
	0: 10,
	1: 20,
	2: 30,
};
```

### Combining Index Signatures with Known Properties

```typescript
interface UserPreferences {
	theme: string; // Known property
	[key: string]: string | number | boolean; // Index signature
}

let prefs: UserPreferences = {
	theme: "dark",
	language: "en",
	notifications: true,
	fontSize: 14,
};
```

## Object Methods

Objects can have methods with typed signatures:

```typescript
interface Calculator {
	add(a: number, b: number): number;
	subtract(a: number, b: number): number;
	multiply(a: number, b: number): number;
	divide(a: number, b: number): number;
}

let calculator: Calculator = {
	add: (a, b) => a + b,
	subtract: (a, b) => a - b,
	multiply: (a, b) => a * b,
	divide: (a, b) => {
		if (b === 0) throw new Error("Division by zero");
		return a / b;
	},
};
```

## Object Literal Types

TypeScript can infer types from object literals:

```typescript
// TypeScript infers the type
let user = {
	name: "John",
	age: 30,
	isAdmin: false,
};
// Type: { name: string; age: number; isAdmin: boolean; }

// But you can still assign compatible objects
user = {
	name: "Jane",
	age: 25,
	isAdmin: true,
};
```

## Structural Typing

TypeScript uses structural typing (also called duck typing):

```typescript
interface Point2D {
	x: number;
	y: number;
}

interface Point3D {
	x: number;
	y: number;
	z: number;
}

let point2D: Point2D = { x: 10, y: 20 };
let point3D: Point3D = { x: 10, y: 20, z: 30 };

// This is allowed because Point3D has all properties of Point2D
point2D = point3D; // OK

// This is not allowed because Point2D lacks the z property
point3D = point2D; // Error
```

## Object Spread and Rest

TypeScript supports object spread and rest operations:

```typescript
let baseConfig = {
	apiUrl: "https://api.example.com",
	timeout: 5000,
};

let devConfig = {
	...baseConfig,
	debug: true,
	environment: "development",
};
// Type: { apiUrl: string; timeout: number; debug: boolean; environment: string; }

function createUser({ name, email, ...rest }: { name: string; email: string; [key: string]: any }) {
	// rest contains any additional properties
	return {
		id: Date.now(),
		name,
		email,
		...rest,
	};
}
```

## Utility Types for Objects

TypeScript provides utility types for common object transformations:

```typescript
interface User {
	id: number;
	name: string;
	email: string;
	password: string;
	createdAt: Date;
}

// Partial makes all properties optional
type PartialUser = Partial<User>;

// Pick selects specific properties
type PublicUser = Pick<User, "id" | "name" | "email">;

// Omit removes specific properties
type UserWithoutPassword = Omit<User, "password">;

// Readonly makes all properties readonly
type ImmutableUser = Readonly<User>;
```

## Object Type Assertions

Sometimes you need to tell TypeScript more about an object's type:

```typescript
// Type assertion
let data: any = { name: "John", age: 30 };
let user = data as User;

// Double assertion (use sparingly)
let value = "hello" as any as { length: number };
```

## Best Practices

### Use Interfaces for Complex Objects

```typescript
// Good: Use interface for reusable object types
interface ApiResponse<T> {
	data: T;
	status: number;
	message: string;
}

// Bad: Inline types for complex objects
function fetchUser(): { data: { id: number; name: string }; status: number; message: string } {
	// ...
}
```

### Prefer Interfaces Over Type Aliases for Objects

```typescript
// Good: Use interface
interface User {
	name: string;
	age: number;
}

// OK: Use type alias for unions or primitives
type UserId = string | number;
```

### Use Readonly for Immutable Data

```typescript
// Good: Mark immutable properties as readonly
interface DatabaseConfig {
	readonly host: string;
	readonly port: number;
	ssl: boolean;
}

// Bad: No readonly modifier
interface DatabaseConfig {
	host: string;
	port: number;
	ssl: boolean;
}
```

### Be Specific with Optional Properties

```typescript
// Good: Clear which properties are optional
interface Product {
	id: number;
	name: string;
	description?: string; // Clearly optional
	price: number;
}

// Avoid: Making everything optional
interface LooseProduct {
	id?: number;
	name?: string;
	description?: string;
	price?: number;
}
```

## Common Patterns

### Builder Pattern

```typescript
interface QueryBuilder {
	select(fields: string[]): QueryBuilder;
	from(table: string): QueryBuilder;
	where(condition: string): QueryBuilder;
	build(): string;
}

class SQLQueryBuilder implements QueryBuilder {
	private query: string = "";

	select(fields: string[]): QueryBuilder {
		this.query += `SELECT ${fields.join(", ")} `;
		return this;
	}

	from(table: string): QueryBuilder {
		this.query += `FROM ${table} `;
		return this;
	}

	where(condition: string): QueryBuilder {
		this.query += `WHERE ${condition}`;
		return this;
	}

	build(): string {
		return this.query.trim();
	}
}
```

### Factory Functions

```typescript
interface Shape {
	area(): number;
	perimeter(): number;
}

interface Circle extends Shape {
	radius: number;
}

interface Rectangle extends Shape {
	width: number;
	height: number;
}

function createCircle(radius: number): Circle {
	return {
		radius,
		area: () => Math.PI * radius * radius,
		perimeter: () => 2 * Math.PI * radius,
	};
}

function createRectangle(width: number, height: number): Rectangle {
	return {
		width,
		height,
		area: () => width * height,
		perimeter: () => 2 * (width + height),
	};
}
```

### Discriminated Unions

```typescript
interface Dog {
	type: "dog";
	name: string;
	breed: string;
}

interface Cat {
	type: "cat";
	name: string;
	lives: number;
}

type Pet = Dog | Cat;

function describePet(pet: Pet): string {
	switch (pet.type) {
		case "dog":
			return `${pet.name} is a ${pet.breed} dog`;
		case "cat":
			return `${pet.name} is a cat with ${pet.lives} lives`;
	}
}
```

## Summary

- **Object types** can be defined inline or using interfaces/type aliases
- **Optional properties** use the `?` operator
- **Readonly properties** prevent modification
- **Index signatures** allow dynamic property names
- **Structural typing** enables flexible object assignments
- **Utility types** provide common object transformations
- **Best practices** emphasize clarity and type safety

Mastering object basics in TypeScript provides a solid foundation for building type-safe applications with clear, maintainable object structures.
