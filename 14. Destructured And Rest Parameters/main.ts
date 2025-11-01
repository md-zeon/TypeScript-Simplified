// Array Destructuring
console.log("=== Array Destructuring ===");

// Basic array destructuring
const numbers = [1, 2, 3, 4, 5];
const [first, second] = numbers;
console.log("First:", first, "Second:", second); // First: 1 Second: 2

// Skipping elements
const [, , third] = numbers;
console.log("Third:", third); // Third: 3

// Rest element
const [head, ...tail] = numbers;
console.log("Head:", head, "Tail:", tail); // Head: 1 Tail: [2, 3, 4, 5]

// Default values
const [a = 10, b = 20, c = 30] = [1];
console.log("With defaults - a:", a, "b:", b, "c:", c); // a: 1 b: 20 c: 30

// Object Destructuring
console.log("\n=== Object Destructuring ===");

// Basic object destructuring
const person = {
	name: "Alice",
	age: 25,
	city: "New York",
	country: "USA",
};

const { name, age } = person;
console.log("Name:", name, "Age:", age); // Name: Alice Age: 25

// Renaming properties
const { name: fullName, age: yearsOld } = person;
console.log("Full Name:", fullName, "Years:", yearsOld); // Full Name: Alice Years: 25

// Default values
const { city, country } = person;
const state = "Unknown"; // Default value since person doesn't have state
console.log("City:", city, "Country:", country, "State:", state); // State: Unknown

// Nested destructuring
const user = {
	id: 1,
	profile: {
		firstName: "John",
		lastName: "Doe",
		contact: {
			email: "john@example.com",
			phone: "123-456-7890",
		},
	},
};

const {
	profile: {
		firstName,
		contact: { email },
	},
} = user;
console.log("First Name:", firstName, "Email:", email); // First Name: John Email: john@example.com

// Rest Parameters in Functions
console.log("\n=== Rest Parameters ===");

// Basic rest parameters
function sum(...numbers: number[]): number {
	return numbers.reduce((total, num) => total + num, 0);
}

console.log("Sum of 1, 2, 3:", sum(1, 2, 3)); // 6
console.log("Sum of 5, 10, 15, 20:", sum(5, 10, 15, 20)); // 50

// Rest with regular parameters
function formatMessage(prefix: string, ...messages: string[]): string {
	return `${prefix}: ${messages.join(" ")}`;
}

console.log(formatMessage("INFO", "This", "is", "a", "message"));
// "INFO: This is a message"

// Rest with tuple types
function processCoordinates(...coords: [number, number, number?]): string {
	const [x, y, z] = coords;
	return z !== undefined
		? `3D coordinates: (${x}, ${y}, ${z})`
		: `2D coordinates: (${x}, ${y})`;
}

console.log(processCoordinates(10, 20)); // "2D coordinates: (10, 20)"
console.log(processCoordinates(10, 20, 30)); // "3D coordinates: (10, 20, 30)"

// Destructuring in Function Parameters
console.log("\n=== Destructuring in Function Parameters ===");

// Array destructuring in parameters
function printCoordinates([x, y]: [number, number]): void {
	console.log(`X: ${x}, Y: ${y}`);
}

printCoordinates([5, 10]); // X: 5, Y: 10

// Object destructuring in parameters
function createUser({
	name,
	age,
	email,
}: {
	name: string;
	age: number;
	email?: string;
}): { name: string; age: number; email?: string } {
	return { name, age, email };
}

const newUser = createUser({ name: "Bob", age: 30, email: "bob@example.com" });
console.log("New user:", newUser);

// Default values in destructured parameters
function configure({
	host = "localhost",
	port = 8080,
	ssl = false,
}: {
	host?: string;
	port?: number;
	ssl?: boolean;
} = {}): string {
	return `Server: ${ssl ? "https" : "http"}://${host}:${port}`;
}

console.log(configure()); // "Server: http://localhost:8080"
console.log(configure({ host: "api.example.com", ssl: true })); // "Server: https://api.example.com:8080"

// Rest in destructuring
console.log("\n=== Rest in Destructuring ===");

// Array rest destructuring
const [firstNum, ...remaining] = [1, 2, 3, 4, 5];
console.log("First:", firstNum, "Remaining:", remaining); // First: 1 Remaining: [2, 3, 4, 5]

// Object rest destructuring
const {
	name: personName,
	age: personAge,
	...otherProps
} = {
	name: "Charlie",
	age: 35,
	city: "London",
	country: "UK",
	job: "Developer",
};
console.log("Name:", personName, "Age:", personAge, "Other:", otherProps);
// Other: { city: "London", country: "UK", job: "Developer" }

// Advanced Patterns
console.log("\n=== Advanced Patterns ===");

// Destructuring with type annotations
interface Point {
	x: number;
	y: number;
}

function calculateDistance(p1: Point, p2: Point): number {
	const { x: x1, y: y1 } = p1;
	const { x: x2, y: y2 } = p2;
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

const point1: Point = { x: 0, y: 0 };
const point2: Point = { x: 3, y: 4 };
console.log("Distance:", calculateDistance(point1, point2)); // Distance: 5

// Destructuring in loops
const users = [
	{ id: 1, name: "Alice", role: "admin" },
	{ id: 2, name: "Bob", role: "user" },
	{ id: 3, name: "Charlie", role: "user" },
];

console.log("Users with roles:");
for (const { name, role } of users) {
	console.log(`${name} is a ${role}`);
}

// Destructuring function return values
function getUserInfo(): [string, number, string] {
	return ["Alice", 25, "alice@example.com"];
}

const [userName, userAge, userEmail] = getUserInfo();
console.log("User info:", { userName, userAge, userEmail });

// Complex destructuring with defaults and rest
function processApiResponse(response: any) {
	const {
		data: { users = [], total = 0, ...meta },
		status,
		message = "Success",
	} = response;

	console.log("Status:", status);
	console.log("Message:", message);
	console.log("Total users:", total);
	console.log("Users:", users);
	console.log("Meta:", meta);
}

const apiResponse = {
	data: {
		users: ["Alice", "Bob"],
		total: 2,
		page: 1,
		limit: 10,
	},
	status: 200,
	message: "Data retrieved successfully",
};

processApiResponse(apiResponse);

// Type-safe destructuring with generics
function extractValues<T extends Record<string, any>, K extends keyof T>(
	obj: T,
	keys: K[],
): Pick<T, K> {
	const result = {} as Pick<T, K>;
	for (const key of keys) {
		result[key] = obj[key];
	}
	return result;
}

const fullUser = {
	id: 1,
	name: "Alice",
	email: "alice@example.com",
	password: "secret",
	createdAt: new Date(),
};

const publicUser = extractValues(fullUser, ["id", "name", "email"]);
console.log("Public user:", publicUser); // No password or createdAt

console.log("\n=== All examples completed ===");
