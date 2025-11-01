# Typing Variables As Functions in TypeScript

In TypeScript, you can assign types to variables that hold functions. This allows you to ensure type safety when working with function variables, parameters, and return values. Function types can be defined using arrow function syntax or by referencing existing function signatures.

## Basic Function Type Syntax

### Function Type Expressions

```typescript
// Basic function type
let greet: (name: string) => string;

// Assigning a function to the variable
greet = (name: string) => `Hello, ${name}!`;

console.log(greet("World")); // Hello, World!
```

### Function Type with Multiple Parameters

```typescript
// Function with multiple parameters
let calculate: (a: number, b: number, operation: string) => number;

calculate = (a: number, b: number, operation: string) => {
	switch (operation) {
		case "add":
			return a + b;
		case "subtract":
			return a - b;
		case "multiply":
			return a * b;
		case "divide":
			return b !== 0 ? a / b : 0;
		default:
			return 0;
	}
};

console.log(calculate(10, 5, "add")); // 15
console.log(calculate(10, 5, "divide")); // 2
```

## Optional Parameters in Function Types

```typescript
// Function type with optional parameters
let logMessage: (message: string, level?: string) => void;

logMessage = (message: string, level: string = "info") => {
	console.log(`[${level.toUpperCase()}] ${message}`);
};

logMessage("Application started");
logMessage("Database error", "error");
```

## Function Types with Rest Parameters

```typescript
// Function type with rest parameters
let sumNumbers: (...numbers: number[]) => number;

sumNumbers = (...numbers: number[]) => {
	return numbers.reduce((sum, num) => sum + num, 0);
};

console.log(sumNumbers(1, 2, 3, 4, 5)); // 15
```

## Function Types in Interfaces

```typescript
// Interface with function properties
interface Calculator {
	add: (a: number, b: number) => number;
	subtract: (a: number, b: number) => number;
	multiply: (a: number, b: number) => number;
	divide: (a: number, b: number) => number;
}

const calculator: Calculator = {
	add: (a, b) => a + b,
	subtract: (a, b) => a - b,
	multiply: (a, b) => a * b,
	divide: (a, b) => a / b,
};

console.log(calculator.add(5, 3)); // 8
console.log(calculator.multiply(4, 7)); // 28
```

## Generic Function Types

```typescript
// Generic function type
let identity: <T>(value: T) => T;

identity = <T>(value: T) => value;

console.log(identity<string>("Hello"));
console.log(identity<number>(42));

// Generic function type with constraints
let getLength: <T extends { length: number }>(item: T) => number;

getLength = <T extends { length: number }>(item: T) => item.length;

console.log(getLength("Hello World")); // 11
console.log(getLength([1, 2, 3, 4, 5])); // 5
```

## Function Type Aliases

```typescript
// Type alias for function types
type Comparator<T> = (a: T, b: T) => number;
type Predicate<T> = (item: T) => boolean;
type Transformer<T, U> = (item: T) => U;

// Using the type aliases
let compareNumbers: Comparator<number>;
let filterEven: Predicate<number>;
let numberToString: Transformer<number, string>;

compareNumbers = (a, b) => a - b;
filterEven = (num) => num % 2 === 0;
numberToString = (num) => num.toString();

console.log(compareNumbers(5, 3)); // 2
console.log(filterEven(4)); // true
console.log(numberToString(42)); // "42"
```

## Higher-Order Functions

```typescript
// Function that returns a function
let createMultiplier: (factor: number) => (value: number) => number;

createMultiplier = (factor: number) => {
	return (value: number) => value * factor;
};

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

## Method Signatures

```typescript
// Object with method signatures
interface EventEmitter {
	on: (event: string, handler: (data: any) => void) => void;
	emit: (event: string, data?: any) => void;
}

const eventEmitter: EventEmitter = {
	events: {} as Record<string, ((data: any) => void)[]>,

	on(event, handler) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(handler);
	},

	emit(event, data) {
		const handlers = this.events[event];
		if (handlers) {
			handlers.forEach((handler) => handler(data));
		}
	},
};

eventEmitter.on("click", (data) => console.log("Clicked:", data));
eventEmitter.emit("click", { x: 10, y: 20 });
```

## Constructor Function Types

```typescript
// Constructor function type
interface Constructor<T> {
	new (...args: any[]): T;
}

// Factory function that creates instances
function createInstance<T>(ctor: Constructor<T>, ...args: any[]): T {
	return new ctor(...args);
}

class Person {
	constructor(public name: string, public age: number) {}
}

class Car {
	constructor(public make: string, public model: string, public year: number) {}
}

const person = createInstance(Person, "Alice", 30);
const car = createInstance(Car, "Toyota", "Camry", 2020);

console.log(person.name); // Alice
console.log(car.make); // Toyota
```

## Advanced Function Types

### Overloaded Function Types

```typescript
// Overloaded function type
interface OverloadedFunction {
	(value: string): string[];
	(value: string, separator: string): string[];
	(value: number): string;
}

const processValue: OverloadedFunction = (
	value: string | number,
	separator?: string,
): string | string[] => {
	if (typeof value === "string") {
		return separator ? value.split(separator) : [value];
	} else {
		return value.toString();
	}
};

console.log(processValue("hello world")); // ["hello world"]
console.log(processValue("hello,world", ",")); // ["hello", "world"]
console.log(processValue(42)); // "42"
```

### Function Types with `this` Parameter

```typescript
// Function type with explicit 'this' parameter
interface Database {
	connect(): void;
	query(sql: string): any[];
}

class MySQLDatabase implements Database {
	private connected = false;

	connect() {
		this.connected = true;
		console.log("Connected to MySQL");
	}

	query(sql: string) {
		if (!this.connected) {
			throw new Error("Not connected to database");
		}
		console.log(`Executing: ${sql}`);
		return [{ id: 1, name: "Sample" }];
	}
}

// Function that operates on database instances
function executeQuery(db: Database, sql: string) {
	db.connect();
	return db.query(sql);
}

const db = new MySQLDatabase();
const results = executeQuery(db, "SELECT * FROM users");
console.log(results);
```
