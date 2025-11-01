// Union Types in TypeScript

// Basic Union Types

// Simple Union Types
let value: string | number;

value = "Hello"; // Valid
value = 42; // Valid
// value = true; // Error: Type 'boolean' is not assignable to type 'string | number'

console.log("Value as string:", value);

// Union Types with Functions
function printValue(value: string | number): void {
	console.log(value);
}

printValue("Hello");
printValue(123);

// Type Guards

// Using typeof
function processValue(value: string | number): string {
	if (typeof value === "string") {
		return value.toUpperCase();
	} else {
		return value.toString();
	}
}

console.log(processValue("hello")); // "HELLO"
console.log(processValue(42)); // "42"

// Using instanceof
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

// Discriminated Unions

// Basic Discriminated Union
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

// Union Types with Arrays

// Arrays of Union Types
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
console.log(matrix);

// Union Types in Interfaces

// Optional Properties with Union Types
interface User {
	id: number;
	name: string;
	email?: string | null;
}

const user1: User = { id: 1, name: "Alice" };
const user2: User = { id: 2, name: "Bob", email: "bob@example.com" };
const user3: User = { id: 3, name: "Charlie", email: null };

console.log(user1, user2, user3);

// Advanced Union Patterns

// Generic Unions
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
try {
	processResult(errorResult); // Throws error
} catch (e) {
	console.log("Error caught:", e.message);
}

// Narrowing Union Types

// Custom Type Guards
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

// Exhaustiveness Checking
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

// Union Types with Classes

// Class Hierarchies
abstract class Animal {
	constructor(public name: string) {}
	abstract makeSound(): void;
}

class Dog2 extends Animal {
	makeSound(): void {
		console.log("Woof!");
	}
}

class Cat2 extends Animal {
	makeSound(): void {
		console.log("Meow!");
	}
}

function handleAnimal(animal: Dog2 | Cat2): void {
	console.log(`${animal.name} says:`);
	animal.makeSound();
}

const dog2 = new Dog2("Buddy");
const cat2 = new Cat2("Whiskers");

handleAnimal(dog2);
handleAnimal(cat2);

// Practical Examples

// API Response Types
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

// Form Input Types
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

// Union Types with Objects
interface Person {
	type: "person";
	name: string;
	age: number;
}

interface Company {
	type: "company";
	name: string;
	employees: number;
}

type Entity = Person | Company;

function describeEntity(entity: Entity): string {
	switch (entity.type) {
		case "person":
			return `${entity.name} is ${entity.age} years old`;
		case "company":
			return `${entity.name} has ${entity.employees} employees`;
	}
}

const person: Person = { type: "person", name: "Alice", age: 30 };
const company: Company = { type: "company", name: "Tech Corp", employees: 100 };

console.log(describeEntity(person));
console.log(describeEntity(company));

// Union Types with Literals
type Status = "pending" | "approved" | "rejected";

interface Application {
	id: number;
	status: Status;
}

function updateStatus(
	application: Application,
	newStatus: Status,
): Application {
	return { ...application, status: newStatus };
}

const app: Application = { id: 1, status: "pending" };
const updatedApp = updateStatus(app, "approved");
console.log(updatedApp);

// Complex Union Types
type StringOrNumber = string | number;
type ArrayOfStringOrNumber = StringOrNumber[];
type ObjectWithUnion = { value: StringOrNumber; items: ArrayOfStringOrNumber };

const complexObject: ObjectWithUnion = {
	value: "hello",
	items: ["world", 42, "test", 100],
};

console.log(complexObject);

// Union Types in Generics
function merge<T, U>(obj1: T, obj2: U): T & U {
	return { ...obj1, ...obj2 };
}

const merged = merge({ name: "Alice" }, { age: 30 });
console.log(merged); // { name: "Alice", age: 30 }

// Union Types with Functions
type MathOperation = (a: number, b: number) => number;

const operations: MathOperation[] = [
	(a, b) => a + b,
	(a, b) => a - b,
	(a, b) => a * b,
	(a, b) => a / b,
];

console.log("Addition:", operations[0](10, 5));
console.log("Subtraction:", operations[1](10, 5));
console.log("Multiplication:", operations[2](10, 5));
console.log("Division:", operations[3](10, 5));

// Advanced Type Guards
function isString(value: unknown): value is string {
	return typeof value === "string";
}

function isNumber(value: unknown): value is number {
	return typeof value === "number" && !isNaN(value);
}

function processUnknown(value: unknown): string {
	if (isString(value)) {
		return `String: ${value.toUpperCase()}`;
	} else if (isNumber(value)) {
		return `Number: ${value.toFixed(2)}`;
	} else {
		return `Unknown type: ${typeof value}`;
	}
}

console.log(processUnknown("hello"));
console.log(processUnknown(42));
console.log(processUnknown(true));
