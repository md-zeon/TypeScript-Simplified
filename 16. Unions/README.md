# Union Types in TypeScript

Union types allow you to declare that a variable, parameter, or property can hold values of multiple types. This is particularly useful when a value can be one of several different types, and you want to handle each case appropriately. Union types are denoted using the `|` (pipe) symbol between the types.

## Basic Union Types

### Simple Union Types

```typescript
// A variable that can hold either a string or a number
let value: string | number;

value = "Hello"; // Valid
value = 42; // Valid
// value = true; // Error: Type 'boolean' is not assignable to type 'string | number'
```

### Union Types with Functions

```typescript
// Function parameter with union type
function printValue(value: string | number): void {
	console.log(value);
}

printValue("Hello");
printValue(123);
```

## Type Guards

### Using typeof

```typescript
function processValue(value: string | number): string {
	if (typeof value === "string") {
		return value.toUpperCase();
	} else {
		return value.toString();
	}
}

console.log(processValue("hello")); // "HELLO"
console.log(processValue(42)); // "42"
```

### Using instanceof

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
		animal.bark();
	} else {
		animal.meow();
	}
}

const dog = new Dog();
const cat = new Cat();

makeSound(dog); // Woof!
makeSound(cat); // Meow!
```

## Discriminated Unions

### Basic Discriminated Union

```typescript
interface Circle {
	kind: "circle";
	radius: number;
}

interface Square {
	kind: "square";
	sideLength: number;
}

type Shape = Circle | Square;

function getArea(shape: Shape): number {
	switch (shape.kind) {
		case "circle":
			return Math.PI * shape.radius ** 2;
		case "square":
			return shape.sideLength ** 2;
	}
}

const circle: Circle = { kind: "circle", radius: 5 };
const square: Square = { kind: "square", sideLength: 10 };

console.log(getArea(circle)); // 78.53981633974483
console.log(getArea(square)); // 100
```

## Union Types with Arrays

### Arrays of Union Types

```typescript
// Array that can contain strings or numbers
let mixedArray: (string | number)[];

mixedArray = ["hello", 42, "world", 100];
console.log(mixedArray); // ["hello", 42, "world", 100]

// Array of arrays with union types
let matrix: (string | number)[][];
matrix = [
	["a", 1],
	["b", 2],
	["c", 3],
];
```

## Union Types in Interfaces

### Optional Properties with Union Types

```typescript
interface User {
	id: number;
	name: string;
	email?: string | null;
}

const user1: User = { id: 1, name: "Alice" };
const user2: User = { id: 2, name: "Bob", email: "bob@example.com" };
const user3: User = { id: 3, name: "Charlie", email: null };
```

## Advanced Union Patterns

### Union of Function Types

```typescript
type EventHandler = (event: MouseEvent) => void | (event: KeyboardEvent) => void;

function handleEvent(handler: EventHandler, event: MouseEvent | KeyboardEvent): void {
	handler(event);
}
```

### Generic Unions

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };

function processResult<T>(result: Result<T>): T | never {
	if (result.success) {
		return result.data;
	} else {
		throw new Error(result.error);
	}
}

const successResult: Result<number> = { success: true, data: 42 };
const errorResult: Result<number> = {
	success: false,
	error: "Something went wrong",
};

console.log(processResult(successResult)); // 42
// console.log(processResult(errorResult)); // Throws error
```

## Narrowing Union Types

### Custom Type Guards

```typescript
interface Car {
	type: "car";
	wheels: 4;
}

interface Motorcycle {
	type: "motorcycle";
	wheels: 2;
}

type Vehicle = Car | Motorcycle;

function isCar(vehicle: Vehicle): vehicle is Car {
	return vehicle.type === "car";
}

function getWheelCount(vehicle: Vehicle): number {
	if (isCar(vehicle)) {
		return vehicle.wheels; // TypeScript knows this is a Car
	} else {
		return vehicle.wheels; // TypeScript knows this is a Motorcycle
	}
}

const car: Car = { type: "car", wheels: 4 };
const motorcycle: Motorcycle = { type: "motorcycle", wheels: 2 };

console.log(getWheelCount(car)); // 4
console.log(getWheelCount(motorcycle)); // 2
```

### Exhaustiveness Checking

```typescript
type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction): void {
	switch (direction) {
		case "north":
			console.log("Moving north");
			break;
		case "south":
			console.log("Moving south");
			break;
		case "east":
			console.log("Moving east");
			break;
		case "west":
			console.log("Moving west");
			break;
		default:
			// TypeScript will catch if we miss a case
			const exhaustiveCheck: never = direction;
			throw new Error(`Unknown direction: ${exhaustiveCheck}`);
	}
}

move("north");
move("south");
// move("up"); // Error: Argument of type '"up"' is not assignable to parameter of type 'Direction'
```

## Union Types with Classes

### Class Hierarchies

```typescript
abstract class Animal {
	constructor(public name: string) {}
	abstract makeSound(): void;
}

class Dog extends Animal {
	makeSound(): void {
		console.log("Woof!");
	}
}

class Cat extends Animal {
	makeSound(): void {
		console.log("Meow!");
	}
}

function handleAnimal(animal: Dog | Cat): void {
	console.log(`${animal.name} says:`);
	animal.makeSound();
}

const dog = new Dog("Buddy");
const cat = new Cat("Whiskers");

handleAnimal(dog);
handleAnimal(cat);
```

## Practical Examples

### API Response Types

```typescript
type ApiResponse =
	| { status: "success"; data: any }
	| { status: "error"; message: string }
	| { status: "loading" };

function handleApiResponse(response: ApiResponse): void {
	switch (response.status) {
		case "success":
			console.log("Data received:", response.data);
			break;
		case "error":
			console.error("Error:", response.message);
			break;
		case "loading":
			console.log("Loading...");
			break;
	}
}

const successResponse: ApiResponse = {
	status: "success",
	data: { user: "Alice" },
};
const errorResponse: ApiResponse = {
	status: "error",
	message: "Network error",
};
const loadingResponse: ApiResponse = { status: "loading" };

handleApiResponse(successResponse);
handleApiResponse(errorResponse);
handleApiResponse(loadingResponse);
```

### Form Input Types

```typescript
type FormField =
	| { type: "text"; value: string; placeholder?: string }
	| { type: "number"; value: number; min?: number; max?: number }
	| { type: "boolean"; value: boolean };

function renderField(field: FormField): string {
	switch (field.type) {
		case "text":
			return `<input type="text" value="${field.value}" placeholder="${
				field.placeholder || ""
			}">`;
		case "number":
			return `<input type="number" value="${field.value}" min="${
				field.min || ""
			}" max="${field.max || ""}">`;
		case "boolean":
			return `<input type="checkbox" ${field.value ? "checked" : ""}>`;
	}
}

const textField: FormField = {
	type: "text",
	value: "Hello",
	placeholder: "Enter text",
};
const numberField: FormField = { type: "number", value: 42, min: 0, max: 100 };
const booleanField: FormField = { type: "boolean", value: true };

console.log(renderField(textField));
console.log(renderField(numberField));
console.log(renderField(booleanField));
```
