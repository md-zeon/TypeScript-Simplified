// Function Declaration with Types
function add(a: number, b: number): number {
	return a + b;
}

function greet(name: string, greeting?: string): string {
	return `${greeting || "Hello"}, ${name}!`;
}

function createUser(
	name: string,
	age: number = 18,
): { name: string; age: number } {
	return { name, age };
}

console.log("Function Declaration Examples:");
console.log("add(5, 3) =", add(5, 3));
console.log("greet('Alice') =", greet("Alice"));
console.log("greet('Bob', 'Hi') =", greet("Bob", "Hi"));
console.log("createUser('Charlie') =", createUser("Charlie"));
console.log("createUser('David', 25) =", createUser("David", 25));

// Function Expression
const multiply: (x: number, y: number) => number = function (x, y) {
	return x * y;
};

const divide = (a: number, b: number): number => {
	if (b === 0) throw new Error("Division by zero");
	return a / b;
};

const square: (n: number) => number = (n) => n * n;

console.log("\nFunction Expression Examples:");
console.log("multiply(4, 3) =", multiply(4, 3));
console.log("divide(10, 2) =", divide(10, 2));
console.log("square(5) =", square(5));

// Function Types
type MathOperation = (a: number, b: number) => number;
type ValueTransformer<T> = (value: T) => T;

const addition: MathOperation = (a, b) => a + b;
const subtraction: MathOperation = (a, b) => a - b;

const stringTransformer: ValueTransformer<string> = (str: string) =>
	str.toUpperCase();
const numberTransformer: ValueTransformer<number> = (num: number) => num * 2;

console.log("\nFunction Type Examples:");
console.log("addition(10, 5) =", addition(10, 5));
console.log("subtraction(10, 5) =", subtraction(10, 5));
console.log("stringTransformer('hello') =", stringTransformer("hello"));
console.log("numberTransformer(21) =", numberTransformer(21));

// Interface with Function Signatures
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
	divide: (a, b) => {
		if (b === 0) throw new Error("Division by zero");
		return a / b;
	},
};

console.log("\nCalculator Interface Example:");
console.log("calculator.add(8, 3) =", calculator.add(8, 3));
console.log("calculator.subtract(8, 3) =", calculator.subtract(8, 3));
console.log("calculator.multiply(8, 3) =", calculator.multiply(8, 3));
console.log("calculator.divide(8, 2) =", calculator.divide(8, 2));

// Rest Parameters
function sum(...numbers: number[]): number {
	return numbers.reduce((total, num) => total + num, 0);
}

function formatName(first: string, last: string, ...titles: string[]): string {
	return `${titles.join(" ")} ${first} ${last}`.trim();
}

console.log("\nRest Parameters Examples:");
console.log("sum(1, 2, 3, 4, 5) =", sum(1, 2, 3, 4, 5));
console.log(
	"formatName('John', 'Doe', 'Dr.', 'Prof.') =",
	formatName("John", "Doe", "Dr.", "Prof."),
);
console.log("formatName('Jane', 'Smith') =", formatName("Jane", "Smith"));

// Function Overloads
function format(value: string): string;
function format(value: number): string;
function format(value: boolean): string;
function format(value: string | number | boolean): string {
	if (typeof value === "string") {
		return `"${value}"`;
	} else if (typeof value === "number") {
		return value.toFixed(2);
	} else {
		return value ? "true" : "false";
	}
}

console.log("\nFunction Overloads Examples:");
console.log("format('hello') =", format("hello"));
console.log("format(42) =", format(42));
console.log("format(true) =", format(true));

// Generic Functions
function identity<T>(value: T): T {
	return value;
}

function getLength<T extends { length: number }>(value: T): number {
	return value.length;
}

function merge<T, U>(obj1: T, obj2: U): T & U {
	return { ...obj1, ...obj2 };
}

console.log("\nGeneric Functions Examples:");
console.log("identity('TypeScript') =", identity("TypeScript"));
console.log("identity(2024) =", identity(2024));
console.log("getLength('hello') =", getLength("hello"));
console.log("getLength([1, 2, 3, 4]) =", getLength([1, 2, 3, 4]));

const merged = merge({ name: "Alice" }, { age: 30 });
console.log("merge({ name: 'Alice' }, { age: 30 }) =", merged);

// Optional and Default Parameters
function createPerson(
	name: string,
	age?: number,
	email?: string,
): {
	name: string;
	age?: number;
	email?: string;
} {
	return { name, age, email };
}

function createConfig(
	host: string,
	port: number = 8080,
	ssl: boolean = false,
): { host: string; port: number; ssl: boolean } {
	return { host, port, ssl };
}

console.log("\nOptional and Default Parameters Examples:");
console.log("createPerson('Alice') =", createPerson("Alice"));
console.log("createPerson('Bob', 25) =", createPerson("Bob", 25));
console.log(
	"createPerson('Charlie', 30, 'charlie@example.com') =",
	createPerson("Charlie", 30, "charlie@example.com"),
);
console.log("createConfig('localhost') =", createConfig("localhost"));
console.log(
	"createConfig('api.example.com', 443, true) =",
	createConfig("api.example.com", 443, true),
);

// Destructuring Parameters
function printUser({
	name,
	age,
	email,
}: {
	name: string;
	age: number;
	email?: string;
}): void {
	console.log(`Name: ${name}`);
	console.log(`Age: ${age}`);
	if (email) console.log(`Email: ${email}`);
}

function swap([a, b]: [number, number]): [number, number] {
	return [b, a];
}

console.log("\nDestructuring Parameters Examples:");
printUser({ name: "Alice", age: 25, email: "alice@example.com" });
console.log("swap([1, 2]) =", swap([1, 2]));

// Higher-Order Functions
function executeOperation(
	a: number,
	b: number,
	operation: (x: number, y: number) => number,
): number {
	return operation(a, b);
}

function createMultiplier(factor: number): (value: number) => number {
	return (value: number) => value * factor;
}

console.log("\nHigher-Order Functions Examples:");
console.log(
	"executeOperation(10, 5, (x, y) => x - y) =",
	executeOperation(10, 5, (x, y) => x - y),
);

const double = createMultiplier(2);
const triple = createMultiplier(3);
console.log("double(5) =", double(5));
console.log("triple(5) =", triple(5));

// Object Methods
const mathUtils = {
	add(a: number, b: number): number {
		return a + b;
	},

	subtract(a: number, b: number): number {
		return a - b;
	},

	power(base: number, exponent: number): number {
		return Math.pow(base, exponent);
	},
};

console.log("\nObject Methods Example:");
console.log("mathUtils.add(7, 4) =", mathUtils.add(7, 4));
console.log("mathUtils.subtract(7, 4) =", mathUtils.subtract(7, 4));
console.log("mathUtils.power(2, 3) =", mathUtils.power(2, 3));

// Class Methods
class CalculatorClass {
	add(a: number, b: number): number {
		return a + b;
	}

	multiply(a: number, b: number): number {
		return a * b;
	}

	static create(): CalculatorClass {
		return new CalculatorClass();
	}
}

const calc = new CalculatorClass();
console.log("\nClass Methods Example:");
console.log("calc.add(6, 7) =", calc.add(6, 7));
console.log("calc.multiply(6, 7) =", calc.multiply(6, 7));

// Function Type Guards
function isString(value: unknown): value is string {
	return typeof value === "string";
}

function processValue(value: unknown): string {
	if (isString(value)) {
		return value.toUpperCase();
	} else {
		return String(value);
	}
}

console.log("\nFunction Type Guards Example:");
console.log("processValue('hello') =", processValue("hello"));
console.log("processValue(42) =", processValue(42));

// Function Composition
function compose<A, B, C>(
	fn1: (arg: A) => B,
	fn2: (arg: B) => C,
): (arg: A) => C {
	return (arg: A) => fn2(fn1(arg));
}

const addOne = (n: number) => n + 1;
const doubleNum = (n: number) => n * 2;
const addOneThenDouble = compose(addOne, doubleNum);

console.log("\nFunction Composition Example:");
console.log("addOneThenDouble(5) =", addOneThenDouble(5)); // (5 + 1) * 2 = 12
