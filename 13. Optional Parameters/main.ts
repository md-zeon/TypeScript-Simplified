// Optional Parameters in TypeScript

// Basic Optional Parameters
function greet(name: string, greeting?: string): string {
	return `${greeting || "Hello"}, ${name}!`;
}

console.log(greet("Alice")); // "Hello, Alice!"
console.log(greet("Bob", "Hi")); // "Hi, Bob!"

// Multiple Optional Parameters
interface User {
	name: string;
	age?: number;
	email?: string;
	isActive?: boolean;
}

function createUser(
	name: string,
	age?: number,
	email?: string,
	isActive?: boolean,
): User {
	return {
		name,
		age: age || 18,
		email: email || `${name.toLowerCase()}@example.com`,
		isActive: isActive !== undefined ? isActive : true,
	};
}

const user1 = createUser("Alice");
const user2 = createUser("Bob", 25);
const user3 = createUser("Charlie", 30, "charlie@example.com");
const user4 = createUser("David", 28, "david@example.com", false);

console.log(user1);
console.log(user2);
console.log(user3);
console.log(user4);

// Default Parameters vs Optional Parameters
function createConfig(
	host: string = "localhost",
	port: number = 8080,
	ssl: boolean = false,
): { host: string; port: number; ssl: boolean } {
	return { host, port, ssl };
}

const config1 = createConfig();
const config2 = createConfig("api.example.com");
const config3 = createConfig("api.example.com", 443, true);

console.log(config1);
console.log(config2);
console.log(config3);

// Optional Parameters with Default Values
function sendRequest(
	url: string,
	method?: string,
	headers?: Record<string, string>,
	timeout: number = 5000,
): void {
	const requestMethod = method || "GET";
	const requestHeaders = headers || {};
	console.log(
		`Sending ${requestMethod} request to ${url} with timeout ${timeout}ms`,
	);
	console.log("Headers:", requestHeaders);
}

sendRequest("/api/users");
sendRequest("/api/users", "POST");
sendRequest("/api/users", "POST", { "Content-Type": "application/json" });
sendRequest(
	"/api/users",
	"POST",
	{ "Content-Type": "application/json" },
	10000,
);

// Optional Parameters in Interfaces
interface Database {
	connect(host?: string, port?: number): Promise<void>;
	query(sql: string, params?: any[]): Promise<any[]>;
	disconnect(): Promise<void>;
}

class PostgreSQLDatabase implements Database {
	async connect(
		host: string = "localhost",
		port: number = 5432,
	): Promise<void> {
		console.log(`Connecting to PostgreSQL at ${host}:${port}`);
	}

	async query(sql: string, params: any[] = []): Promise<any[]> {
		console.log(`Executing: ${sql} with params:`, params);
		return [];
	}

	async disconnect(): Promise<void> {
		console.log("Disconnecting from PostgreSQL");
	}
}

const db = new PostgreSQLDatabase();
db.connect();
db.query("SELECT * FROM users");
db.disconnect();

// Optional Properties in Function Parameters
interface UserQuery {
	name?: string;
	age?: number;
	email?: string;
	isActive?: boolean;
}

function findUsers(query: UserQuery = {}): User[] {
	const { name, age, email, isActive } = query;
	console.log("Searching for users with:", { name, age, email, isActive });
	return [];
}

findUsers();
findUsers({ name: "Alice" });
findUsers({ age: 25, isActive: true });

// Advanced Patterns - Optional Parameters with Type Guards
function processValue(value?: string | number): string {
	if (value === undefined) {
		return "No value provided";
	}

	if (typeof value === "string") {
		return value.toUpperCase();
	} else {
		return value.toFixed(2);
	}
}

console.log(processValue());
console.log(processValue("hello"));
console.log(processValue(42));

// Optional Parameters in Generic Functions
function createList<T>(
	items: T[],
	sortBy?: keyof T,
	sortOrder: "asc" | "desc" = "asc",
): T[] {
	if (!sortBy) {
		return [...items];
	}

	return [...items].sort((a, b) => {
		const aValue = a[sortBy] as any;
		const bValue = b[sortBy] as any;

		if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
		if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
		return 0;
	});
}

interface Person {
	name: string;
	age: number;
}

const people: Person[] = [
	{ name: "Alice", age: 25 },
	{ name: "Bob", age: 30 },
	{ name: "Charlie", age: 20 },
];

console.log(createList(people));
console.log(createList(people, "name"));
console.log(createList(people, "age", "desc"));

// Function Overloads with Optional Parameters
function formatDate(date: Date): string;
function formatDate(date: Date, format: string): string;
function formatDate(date: Date, locale?: string, timeZone?: string): string;
function formatDate(
	date: Date,
	formatOrLocale?: string,
	timeZone?: string,
): string {
	if (!formatOrLocale) {
		return date.toLocaleDateString();
	}

	if (timeZone) {
		return date.toLocaleDateString(formatOrLocale, { timeZone });
	}

	if (formatOrLocale.includes("/")) {
		return "2023-10-15"; // Simplified format handling
	} else {
		return date.toLocaleDateString(formatOrLocale);
	}
}

const date = new Date();
console.log(formatDate(date));
console.log(formatDate(date, "en-US"));
console.log(formatDate(date, "en-US", "UTC"));

// Optional Parameters in Callbacks
type Callback<T> = (result: T, error?: Error) => void;

function fetchData<T>(
	url: string,
	callback: Callback<T>,
	timeout?: number,
): void {
	const timeoutMs = timeout || 5000;

	setTimeout(() => {
		const success = Math.random() > 0.1;

		if (success) {
			const data = { id: 1, name: "Test Data" } as T;
			callback(data);
		} else {
			callback(null as T, new Error("Network error"));
		}
	}, Math.random() * timeoutMs);
}

fetchData("/api/data", (result, error) => {
	if (error) {
		console.error("Error:", error.message);
	} else {
		console.log("Success:", result);
	}
});

// Best Practices - Builder Pattern with Optional Methods
class QueryBuilder {
	private conditions: string[] = [];
	private limitValue?: number;
	private offsetValue?: number;

	where(condition: string): this {
		this.conditions.push(condition);
		return this;
	}

	limit(value: number): this {
		this.limitValue = value;
		return this;
	}

	offset(value: number): this {
		this.offsetValue = value;
		return this;
	}

	build(): string {
		let query = "SELECT * FROM users";

		if (this.conditions.length > 0) {
			query += ` WHERE ${this.conditions.join(" AND ")}`;
		}

		if (this.limitValue !== undefined) {
			query += ` LIMIT ${this.limitValue}`;
		}

		if (this.offsetValue !== undefined) {
			query += ` OFFSET ${this.offsetValue}`;
		}

		return query;
	}
}

const query1 = new QueryBuilder().build();
const query2 = new QueryBuilder().where("age > 18").build();
const query3 = new QueryBuilder()
	.where("age > 18")
	.where("status = 'active'")
	.limit(10)
	.offset(20)
	.build();

console.log(query1);
console.log(query2);
console.log(query3);
