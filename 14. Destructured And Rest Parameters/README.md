# Destructured and Rest Parameters in TypeScript

Destructuring and rest parameters are powerful JavaScript features that TypeScript enhances with type safety. Destructuring allows you to extract values from arrays and objects into distinct variables, while rest parameters enable functions to accept an indefinite number of arguments. This section explores how to use these features effectively in TypeScript.

## Array Destructuring

### Basic Array Destructuring

```typescript
// Basic array destructuring
const numbers = [1, 2, 3, 4, 5];
const [first, second, third] = numbers;

console.log(first); // 1
console.log(second); // 2
console.log(third); // 3

// Skipping elements
const [, , thirdElement] = numbers;
console.log(thirdElement); // 3

// Using rest operator
const [head, ...tail] = numbers;
console.log(head); // 1
console.log(tail); // [2, 3, 4, 5]
```

### Array Destructuring with Types

```typescript
// Typed array destructuring
const coordinates: [number, number, number] = [10, 20, 30];
const [x, y, z] = coordinates;

console.log(x, y, z); // 10, 20, 30

// Destructuring with type annotations
const [name, age, isActive]: [string, number, boolean] = ["Alice", 25, true];
console.log(name, age, isActive); // Alice, 25, true
```

### Default Values in Array Destructuring

```typescript
// Default values
const [a = 0, b = 0, c = 0] = [1, 2];
console.log(a, b, c); // 1, 2, 0

// With undefined values
const sparseArray = [1, undefined, 3];
const [first = 0, second = 0, third = 0] = sparseArray;
console.log(first, second, third); // 1, 0, 3
```

## Object Destructuring

### Basic Object Destructuring

```typescript
// Basic object destructuring
const person = {
	name: "John",
	age: 30,
	city: "New York",
	country: "USA",
};

const { name, age } = person;
console.log(name, age); // John, 30

// Renaming variables
const { name: fullName, age: years } = person;
console.log(fullName, years); // John, 30
```

### Object Destructuring with Types

```typescript
// Typed object destructuring
interface User {
	id: number;
	name: string;
	email: string;
	isActive: boolean;
}

const user: User = {
	id: 1,
	name: "Alice",
	email: "alice@example.com",
	isActive: true,
};

const { id, name, email }: User = user;
console.log(id, name, email); // 1, Alice, alice@example.com
```

### Default Values in Object Destructuring

```typescript
// Default values
const config = { host: "localhost", port: 8080 };
const { host, port, ssl = false } = config;
console.log(host, port, ssl); // localhost, 8080, false

// With undefined properties
const partialUser = { name: "Bob" };
const { name, age = 18, email = "default@example.com" } = partialUser;
console.log(name, age, email); // Bob, 18, default@example.com
```

### Nested Object Destructuring

```typescript
// Nested object destructuring
const company = {
	name: "Tech Corp",
	address: {
		street: "123 Main St",
		city: "San Francisco",
		coordinates: {
			lat: 37.7749,
			lng: -122.4194,
		},
	},
};

const {
	name: companyName,
	address: {
		city,
		coordinates: { lat, lng },
	},
} = company;

console.log(companyName, city, lat, lng); // Tech Corp, San Francisco, 37.7749, -122.4194
```

## Rest Parameters in Functions

### Basic Rest Parameters

```typescript
// Rest parameters collect remaining arguments
function sum(...numbers: number[]): number {
	return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3)); // 6
console.log(sum(1, 2, 3, 4, 5)); // 15

// Rest parameters with regular parameters
function formatMessage(prefix: string, ...messages: string[]): string {
	return `${prefix}: ${messages.join(" ")}`;
}
```
