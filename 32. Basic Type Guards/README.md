# Basic Type Guards in TypeScript

Type guards are functions or expressions that perform runtime checks to narrow down the type of a variable within a conditional block. They help TypeScript understand more specific types in different code paths, enabling safer and more precise type checking.

## Built-in Type Guards

### typeof Operator

The `typeof` operator is the most basic type guard, working with JavaScript's primitive types.

```typescript
function processValue(value: unknown): string {
	if (typeof value === "string") {
		// TypeScript knows value is string here
		return value.toUpperCase();
	}

	if (typeof value === "number") {
		// TypeScript knows value is number here
		return value.toFixed(2);
	}

	if (typeof value === "boolean") {
		// TypeScript knows value is boolean here
		return value ? "True" : "False";
	}

	return "Unknown type";
}

// Usage
console.log(processValue("hello")); // "HELLO"
console.log(processValue(42)); // "42.00"
console.log(processValue(true)); // "True"
```

### instanceof Operator

The `instanceof` operator checks if an object is an instance of a specific class or constructor.

```typescript
class Dog {
	bark(): void {
		console.log("Woof!");
	}
}

class Cat {
	meow(): void {
		console.log("Meow!");
	}
}

function makeSound(animal: Dog | Cat): void {
	if (animal instanceof Dog) {
		// TypeScript knows animal is Dog here
		animal.bark();
	} else {
		// TypeScript knows animal is Cat here
		animal.meow();
	}
}

// Usage
const dog = new Dog();
const cat = new Cat();
makeSound(dog); // "Woof!"
makeSound(cat); // "Meow!"
```

### in Operator

The `in` operator checks if a property exists on an object.

```typescript
interface Bird {
	fly(): void;
	wingspan: number;
}

interface Fish {
	swim(): void;
	fins: number;
}

type Animal = Bird | Fish;

function move(animal: Animal): void {
	if ("fly" in animal) {
		// TypeScript knows animal is Bird here
		animal.fly();
		console.log(`Wingspan: ${animal.wingspan}`);
	} else {
		// TypeScript knows animal is Fish here
		animal.swim();
		console.log(`Fins: ${animal.fins}`);
	}
}

// Usage
const bird: Bird = { fly: () => console.log("Flying!"), wingspan: 2 };
const fish: Fish = { swim: () => console.log("Swimming!"), fins: 4 };
move(bird); // "Flying!" "Wingspan: 2"
move(fish); // "Swimming!" "Fins: 4"
```

## Custom Type Guards

### User-Defined Type Guards

You can create custom type guard functions that return a boolean and use type predicates.

```typescript
interface Car {
	brand: string;
	model: string;
	drive(): void;
}

interface Boat {
	name: string;
	type: string;
	sail(): void;
}

type Vehicle = Car | Boat;

// Custom type guard function
function isCar(vehicle: Vehicle): vehicle is Car {
	return "drive" in vehicle;
}

function operateVehicle(vehicle: Vehicle): void {
	if (isCar(vehicle)) {
		// TypeScript knows vehicle is Car here
		console.log(`Driving ${vehicle.brand} ${vehicle.model}`);
		vehicle.drive();
	} else {
		// TypeScript knows vehicle is Boat here
		console.log(`Sailing ${vehicle.name} ${vehicle.type}`);
		vehicle.sail();
	}
}

// Usage
const car: Car = {
	brand: "Toyota",
	model: "Camry",
	drive: () => console.log("Vroom!"),
};

const boat: Boat = {
	name: "Sea Breeze",
	type: "Sailboat",
	sail: () => console.log("Whoosh!"),
};

operateVehicle(car); // "Driving Toyota Camry" "Vroom!"
operateVehicle(boat); // "Sailing Sea Breeze Sailboat" "Whoosh!"
```

### Type Guard with Union Types

```typescript
type Shape =
	| { kind: "circle"; radius: number }
	| { kind: "rectangle"; width: number; height: number }
	| { kind: "triangle"; base: number; height: number };

function isCircle(shape: Shape): shape is Shape & { kind: "circle" } {
	return shape.kind === "circle";
}

function isRectangle(shape: Shape): shape is Shape & { kind: "rectangle" } {
	return shape.kind === "rectangle";
}

function calculateArea(shape: Shape): number {
	if (isCircle(shape)) {
		// TypeScript knows shape has radius
		return Math.PI * shape.radius * shape.radius;
	}

	if (isRectangle(shape)) {
		// TypeScript knows shape has width and height
		return shape.width * shape.height;
	}

	// TypeScript knows shape is triangle here
	return (shape.base * shape.height) / 2;
}

// Usage
const circle: Shape = { kind: "circle", radius: 5 };
const rectangle: Shape = { kind: "rectangle", width: 10, height: 20 };
const triangle: Shape = { kind: "triangle", base: 6, height: 8 };

console.log(calculateArea(circle)); // 78.54
console.log(calculateArea(rectangle)); // 200
console.log(calculateArea(triangle)); // 24
```

## Advanced Type Guard Patterns

### Type Guards with Generics

```typescript
function isArray<T>(value: unknown): value is T[] {
	return Array.isArray(value);
}

function isDefined<T>(value: T | undefined | null): value is T {
	return value !== undefined && value !== null;
}

function processItems<T>(items: unknown): T[] {
	if (isArray<T>(items)) {
		// TypeScript knows items is T[]
		return items.filter(isDefined);
	}

	return [];
}

// Usage
const data: unknown = [1, 2, null, 3, undefined];
const numbers = processItems<number>(data); // number[]
console.log(numbers); // [1, 2, 3]
```

### Type Guards for API Responses

```typescript
interface ApiSuccess<T> {
	success: true;
	data: T;
}

interface ApiError {
	success: false;
	error: string;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
	return response.success;
}

async function handleApiResponse<T>(
	response: Promise<ApiResponse<T>>,
): Promise<T | null> {
	const result = await response;

	if (isApiSuccess(result)) {
		// TypeScript knows result has data property
		return result.data;
	} else {
		// TypeScript knows result has error property
		console.error(result.error);
		return null;
	}
}

// Usage
const mockApiCall = Promise.resolve({
	success: true,
	data: { id: 1, name: "John" },
} as ApiResponse<{ id: number; name: string }>);

handleApiResponse(mockApiCall).then((data) => console.log(data)); // { id: 1, name: "John" }
```

### Assertion Functions (TypeScript 3.7+)

```typescript
function assertIsString(value: unknown): asserts value is string {
	if (typeof value !== "string") {
		throw new Error("Value must be a string");
	}
}

function assertIsDefined<T>(value: T | undefined | null): asserts value is T {
	if (value === undefined || value === null) {
		throw new Error("Value must be defined");
	}
}

function processString(input: unknown): string {
	assertIsString(input);
	// TypeScript knows input is string here
	return input.toUpperCase();
}

function greet(name: string | undefined): void {
	assertIsDefined(name);
	// TypeScript knows name is string here
	console.log(`Hello, ${name}!`);
}

// Usage
try {
	console.log(processString("hello")); // "HELLO"
	greet("John"); // "Hello, John!"
	processString(123); // Throws error
} catch (error) {
	console.error(error.message);
}
```

## Type Guards in Practice

### Filtering Arrays with Type Guards

```typescript
type MixedArray = (string | number | boolean)[];

function isString(value: unknown): value is string {
	return typeof value === "string";
}

function isNumber(value: unknown): value is number {
	return typeof value === "number";
}

function filterStrings(array: MixedArray): string[] {
	return array.filter(isString);
}

function filterNumbers(array: MixedArray): number[] {
	return array.filter(isNumber);
}

// Usage
const mixed: MixedArray = ["hello", 42, true, "world", 3.14];
console.log(filterStrings(mixed)); // ["hello", "world"]
console.log(filterNumbers(mixed)); // [42, 3.14]
```

### Type Guards with Classes

```typescript
abstract class Animal {
	constructor(public name: string) {}
	abstract makeSound(): void;
}

class Dog extends Animal {
	makeSound(): void {
		console.log("Woof!");
	}

	fetch(): void {
		console.log("Fetching ball...");
	}
}

class Cat extends Animal {
	makeSound(): void {
		console.log("Meow!");
	}

	climb(): void {
		console.log("Climbing tree...");
	}
}

function isDog(animal: Animal): animal is Dog {
	return animal instanceof Dog;
}

function isCat(animal: Animal): animal is Cat {
	return animal instanceof Cat;
}

function performTrick(animal: Animal): void {
	if (isDog(animal)) {
		animal.fetch();
	} else if (isCat(animal)) {
		animal.climb();
	} else {
		animal.makeSound();
	}
}

// Usage
const dog = new Dog("Buddy");
const cat = new Cat("Whiskers");
performTrick(dog); // "Fetching ball..."
performTrick(cat); // "Climbing tree..."
```

## Best Practices

### 1. Use Descriptive Names

```typescript
// Good
function isValidEmail(value: unknown): value is string {
	return typeof value === "string" && value.includes("@");
}

// Less clear
function check(value: unknown): value is string {
	return typeof value === "string" && value.includes("@");
}
```

### 2. Keep Type Guards Simple

```typescript
// Good: Simple, focused type guard
function isPositiveNumber(value: unknown): value is number {
	return typeof value === "number" && value > 0;
}

// Avoid: Complex logic in type guard
function isValidUser(value: unknown): value is User {
	// Complex validation logic...
	return /* ... */;
}
```

### 3. Combine Type Guards Effectively

```typescript
interface User {
	id: number;
	name: string;
	email: string;
	role: "admin" | "user";
}

function isUser(value: unknown): value is User {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"name" in value &&
		"email" in value &&
		"role" in value
	);
}

function isAdmin(user: User): boolean {
	return user.role === "admin";
}

// Usage
function processUser(value: unknown): void {
	if (isUser(value)) {
		if (isAdmin(value)) {
			console.log(`Admin ${value.name} has access`);
		} else {
			console.log(`User ${value.name} logged in`);
		}
	}
}
```

### 4. Use Assertion Functions for Validation

```typescript
function assertIsEmail(value: unknown): asserts value is string {
	if (typeof value !== "string" || !value.includes("@")) {
		throw new Error("Invalid email");
	}
}

function sendEmail(to: unknown, subject: string, body: string): void {
	assertIsEmail(to);
	// TypeScript knows 'to' is string here
	console.log(`Sending email to ${to}`);
}
```

## Common Pitfalls

### 1. Forgetting Type Predicates

```typescript
// Wrong: Missing 'value is string'
function isStringWrong(value: unknown): boolean {
	return typeof value === "string";
}

// Correct
function isStringCorrect(value: unknown): value is string {
	return typeof value === "string";
}
```

### 2. Type Guards Don't Narrow in All Contexts

```typescript
const value: string | number = "hello";

if (typeof value === "string") {
	// Type narrowed here
	console.log(value.toUpperCase());
}

// Type not narrowed here - back to union
setTimeout(() => {
	console.log(value); // string | number
}, 100);
```

### 3. Complex Union Types

```typescript
type ComplexUnion =
	| { type: "A"; a: number }
	| { type: "B"; b: string }
	| { type: "C"; c: boolean };

// Good: Specific type guards
function isTypeA(value: ComplexUnion): value is ComplexUnion & { type: "A" } {
	return value.type === "A";
}

// Avoid: Generic type guard that doesn't narrow properly
function isOfType(value: ComplexUnion, type: string): boolean {
	return value.type === type;
}
```

## Summary

Type guards are essential for working with union types and unknown values in TypeScript. They provide:

- **Type Safety**: Narrow down types in conditional blocks
- **Better IntelliSense**: IDE support for narrowed types
- **Runtime Safety**: Combine compile-time and runtime checks
- **Maintainability**: Clear, reusable type checking logic

Key type guards include:

- `typeof` for primitives
- `instanceof` for class instances
- `in` for property existence
- Custom functions with type predicates (`value is Type`)
- Assertion functions for validation

Use type guards to make your TypeScript code more robust and type-safe, especially when working with external data, APIs, or complex type hierarchies.
