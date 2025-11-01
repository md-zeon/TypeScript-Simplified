// Destructured and Rest Parameters in TypeScript

// Array Destructuring

// Basic Array Destructuring
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

// Array Destructuring with Types
const coordinates: [number, number, number] = [10, 20, 30];
const [x, y, z] = coordinates;
console.log(x, y, z); // 10, 20, 30

// Destructuring with type annotations
const [userName, userAge, userIsActive]: [string, number, boolean] = [
	"Alice",
	25,
	true,
];
console.log(userName, userAge, userIsActive); // Alice, 25, true

// Default Values in Array Destructuring
const [a = 0, b = 0, c = 0] = [1, 2];
console.log(a, b, c); // 1, 2, 0

// With undefined values
const sparseArray = [1, undefined, 3];
const [firstVal = 0, secondVal = 0, thirdVal = 0] = sparseArray;
console.log(firstVal, secondVal, thirdVal); // 1, 0, 3

// Object Destructuring

// Basic Object Destructuring
const person = {
	name: "John",
	age: 30,
	city: "New York",
	country: "USA",
};

const { name: personName, age: personAge } = person;
console.log(personName, personAge); // John, 30

// Renaming variables
const { name: fullName, age: years } = person;
console.log(fullName, years); // John, 30

// Object Destructuring with Types
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

const { id, name: userFullName, email: userEmail }: User = user;
console.log(id, userFullName, userEmail); // 1, Alice, alice@example.com

// Default Values in Object Destructuring
const config = { host: "localhost", port: 8080 };
const { host, port, ssl = false } = config;
console.log(host, port, ssl); // localhost, 8080, false

// With undefined properties
const partialUser = { name: "Bob" };
const {
	name: partialName,
	age = 18,
	email = "default@example.com",
} = partialUser;
console.log(partialName, age, email); // Bob, 18, default@example.com

// Nested Object Destructuring
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

// Rest Parameters in Functions

// Basic Rest Parameters
function sum(...numbers: number[]): number {
	return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3)); // 6
console.log(sum(1, 2, 3, 4, 5)); // 15

// Rest parameters with regular parameters
function formatMessage(prefix: string, ...messages: string[]): string {
	return `${prefix}: ${messages.join(" ")}`;
}

console.log(formatMessage("INFO", "This", "is", "a", "message")); // INFO: This is a message
console.log(formatMessage("ERROR", "Something", "went", "wrong")); // ERROR: Something went wrong

// Rest parameters with different types
function createElement(
	tag: string,
	className?: string,
	...children: string[]
): string {
	const classAttr = className ? ` class="${className}"` : "";
	const content = children.join("");
	return `<${tag}${classAttr}>${content}</${tag}>`;
}

console.log(createElement("div", "container", "Hello", " ", "World")); // <div class="container">Hello World</div>
console.log(createElement("p", undefined, "This", " is", " a", " paragraph")); // <p>This is a paragraph</p>

// Advanced Rest Parameters
function mergeArrays<T>(...arrays: T[][]): T[] {
	return arrays.flat();
}

const arr1 = [1, 2];
const arr2 = [3, 4];
const arr3 = [5, 6];
console.log(mergeArrays(arr1, arr2, arr3)); // [1, 2, 3, 4, 5, 6]

// Rest parameters in class methods
class Logger {
	log(level: string, ...messages: string[]): void {
		const timestamp = new Date().toISOString();
		console.log(`[${timestamp}] ${level.toUpperCase()}: ${messages.join(" ")}`);
	}
}

const logger = new Logger();
logger.log("info", "Application", "started");
logger.log("error", "Database", "connection", "failed");

// Combining destructuring and rest parameters
function processItems(
	items: number[],
	...processors: ((n: number) => number)[]
): number[] {
	return processors.reduce((acc, processor) => acc.map(processor), items);
}

const numbers2 = [1, 2, 3, 4, 5];
const result = processItems(
	numbers2,
	(n) => n * 2, // Double
	(n) => n + 1, // Add 1
	(n) => n % 10, // Modulo 10
);
console.log(result); // [3, 5, 7, 9, 1]

// Destructuring in function parameters
function drawPoint({ x, y }: { x: number; y: number }): void {
	console.log(`Drawing point at (${x}, ${y})`);
}

drawPoint({ x: 10, y: 20 });

// Array destructuring in function parameters
function swap([a, b]: [number, number]): [number, number] {
	return [b, a];
}

console.log(swap([1, 2])); // [2, 1]

// Complex destructuring in function parameters
interface ApiResponse {
	data: {
		users: Array<{
			id: number;
			name: string;
			profile: {
				avatar: string;
				bio: string;
			};
		}>;
		total: number;
	};
	status: number;
}

function processApiResponse({
	data: { users, total },
	status,
}: ApiResponse): void {
	console.log(`Status: ${status}, Total users: ${total}`);
	users.forEach(({ id, name, profile: { avatar, bio } }) => {
		console.log(`User ${id}: ${name} - ${bio} (${avatar})`);
	});
}

const response: ApiResponse = {
	data: {
		users: [
			{
				id: 1,
				name: "Alice",
				profile: {
					avatar: "alice.jpg",
					bio: "Software engineer",
				},
			},
			{
				id: 2,
				name: "Bob",
				profile: {
					avatar: "bob.jpg",
					bio: "Designer",
				},
			},
		],
		total: 2,
	},
	status: 200,
};

processApiResponse(response);

// Destructuring with rest in function parameters
function extractFirstAndRest<T>([first, ...rest]: T[]): {
	first: T;
	rest: T[];
} {
	return { first, rest };
}

const { first: firstItem, rest: remainingItems } = extractFirstAndRest([
	1, 2, 3, 4, 5,
]);
console.log(firstItem); // 1
console.log(remainingItems); // [2, 3, 4, 5]

// Practical example: Configuration with defaults
interface ServerConfig {
	host?: string;
	port?: number;
	ssl?: boolean;
	timeout?: number;
}

function createServer({
	host = "localhost",
	port = 8080,
	ssl = false,
	timeout = 30000,
}: ServerConfig = {}): void {
	console.log(
		`Server config: ${host}:${port}, SSL: ${ssl}, Timeout: ${timeout}ms`,
	);
}

createServer();
createServer({ host: "api.example.com", port: 443, ssl: true });

// Destructuring in loops
const users2 = [
	{ id: 1, name: "Alice", age: 25 },
	{ id: 2, name: "Bob", age: 30 },
	{ id: 3, name: "Charlie", age: 35 },
];

for (const { id, name, age } of users2) {
	console.log(`${name} (ID: ${id}) is ${age} years old`);
}

// Array destructuring in loops
const pairs = [
	[1, "one"],
	[2, "two"],
	[3, "three"],
];

for (const [number, word] of pairs) {
	console.log(`${number} = ${word}`);
}

// Advanced: Destructuring with computed property names
const key = "dynamicKey";
const obj = {
	[key]: "dynamic value",
	staticKey: "static value",
};

const { [key]: dynamicValue, staticKey } = obj;
console.log(dynamicValue); // "dynamic value"
console.log(staticKey); // "static value"

// Type-safe destructuring with generics
function extractValues<T extends Record<string, any>, K extends keyof T>(
	obj: T,
	...keys: K[]
): Pick<T, K> {
	const result = {} as Pick<T, K>;
	keys.forEach((key) => {
		result[key] = obj[key];
	});
	return result;
}

const person2 = { name: "Alice", age: 25, city: "NYC", country: "USA" };
const extracted = extractValues(person2, "name", "age");
console.log(extracted); // { name: "Alice", age: 25 }
