# Tuples in TypeScript

Tuples in TypeScript are fixed-length arrays where each element has a specific type. Unlike regular arrays, tuples maintain type information for each position, providing compile-time type safety for ordered collections of values. Tuples are particularly useful for representing structured data with a known number of elements of different types.

## Basic Tuple Types

### Simple Tuples

```typescript
// A tuple with two elements: string and number
let person: [string, number];

person = ["Alice", 30]; // OK
// person = [30, "Alice"]; // Error: Type 'number' is not assignable to type 'string'
// person = ["Alice"]; // Error: Property '1' is missing
// person = ["Alice", 30, true]; // Error: Type '[string, number, boolean]' is not assignable to type '[string, number]'
```

### Accessing Tuple Elements

```typescript
let coordinates: [number, number] = [10, 20];

let x: number = coordinates[0]; // 10
let y: number = coordinates[1]; // 20

// coordinates[2] = 30; // Error: Tuple type '[number, number]' has no element at index 2
```

## Tuple Types with Labels

### Named Tuple Elements

```typescript
type Point = [x: number, y: number];
type Person = [name: string, age: number, isActive: boolean];

const point: Point = [10, 20];
const person: Person = ["Alice", 30, true];

// Named elements provide better IntelliSense
point.x; // Error: Property 'x' does not exist on type '[number, number]'
point[0]; // Still need to use index access
```

## Optional Elements in Tuples

### Tuples with Optional Elements

```typescript
type Config = [string, number?, boolean?];

let config1: Config = ["localhost"]; // OK
let config2: Config = ["localhost", 8080]; // OK
let config3: Config = ["localhost", 8080, true]; // OK
// let config4: Config = ["localhost", true]; // Error: Type 'boolean' is not assignable to type 'number | undefined'
```

## Rest Elements in Tuples

### Tuples with Rest Parameters

```typescript
type StringNumbers = [string, ...number[]];
type NumbersString = [...number[], string];

let tuple1: StringNumbers = ["hello", 1, 2, 3]; // OK
let tuple2: StringNumbers = ["hello"]; // OK
// let tuple3: StringNumbers = [1, 2, 3]; // Error: First element must be string

let tuple4: NumbersString = [1, 2, 3, "hello"]; // OK
let tuple5: NumbersString = ["hello"]; // OK
```

## Readonly Tuples

### Creating Immutable Tuples

```typescript
let mutableTuple: [string, number] = ["hello", 42];
mutableTuple[0] = "world"; // OK
mutableTuple[1] = 100; // OK

let readonlyTuple: readonly [string, number] = ["hello", 42];
// readonlyTuple[0] = "world"; // Error: Cannot assign to '0' because it is a read-only property
// readonlyTuple[1] = 100; // Error: Cannot assign to '1' because it is a read-only property

// But you can reassign the entire tuple
readonlyTuple = ["world", 100]; // OK
```

## Tuple Type Inference

### Automatic Tuple Type Inference

```typescript
// TypeScript infers tuple types automatically
const tuple1 = ["hello", 42] as const; // readonly ["hello", 42]
const tuple2 = ["hello", 42]; // (string | number)[]

let tuple3 = [1, 2, 3]; // number[]
let tuple4: [number, number, number] = [1, 2, 3]; // Explicit tuple type

// Function returning tuples
function getCoordinates(): [number, number] {
	return [10, 20];
}

const coords = getCoordinates(); // [number, number]
```

## Advanced Tuple Patterns

### Tuple as Function Parameters

```typescript
function createUser([name, age, email]: [string, number, string?]): {
	name: string;
	age: number;
	email?: string;
} {
	return { name, age, email };
}

const user1 = createUser(["Alice", 30]); // OK
const user2 = createUser(["Bob", 25, "bob@example.com"]); // OK
// createUser(["Charlie"]); // Error: Property '1' is missing
```

### Tuple Destructuring

```typescript
type RGB = [number, number, number];
type PersonData = [string, number, boolean];

function processData([name, age, isActive]: PersonData): string {
	return `${name} is ${age} years old and ${isActive ? "active" : "inactive"}`;
}

const data: PersonData = ["Alice", 30, true];
console.log(processData(data)); // "Alice is 30 years old and active"

// Nested destructuring
type NestedTuple = [[string, number], boolean];
const nested: NestedTuple = [["hello", 42], true];
const [[message, count], flag] = nested;
```

## Tuples vs Arrays

### Key Differences

```typescript
// Array: homogeneous elements, variable length
let array: number[] = [1, 2, 3];
array.push(4); // OK
array[0] = 10; // OK

// Tuple: heterogeneous elements, fixed length
let tuple: [number, string] = [1, "hello"];
// tuple.push("world"); // Error: Property 'push' does not exist on type '[number, string]'
// tuple[2] = "world"; // Error: Tuple type '[number, string]' has no element at index 2
tuple[0] = 10; // OK - can modify existing elements
```

## Tuple Utility Types

### Extracting Tuple Elements

```typescript
type TupleToUnion<T extends readonly any[]> = T[number];

type Colors = ["red", "green", "blue"];
type Color = TupleToUnion<Colors>; // "red" | "green" | "blue"

type Numbers = [1, 2, 3, 4, 5];
type NumberUnion = TupleToUnion<Numbers>; // 1 | 2 | 3 | 4 | 5
```

### Tuple Length

```typescript
type Length<T extends readonly any[]> = T["length"];

type MyTuple = [string, number, boolean];
type TupleLength = Length<MyTuple>; // 3

type EmptyTuple = [];
type EmptyLength = Length<EmptyTuple>; // 0
```

### Reversing Tuples

```typescript
type Reverse<T extends readonly any[]> = T extends readonly [
	infer First,
	...infer Rest,
]
	? readonly [...Reverse<Rest>, First]
	: readonly [];

type Original = [1, 2, 3, 4];
type Reversed = Reverse<Original>; // [4, 3, 2, 1]
```

## Practical Examples

### Representing Coordinates

```typescript
type Point2D = [number, number];
type Point3D = [number, number, number];

function distance2D([x1, y1]: Point2D, [x2, y2]: Point2D): number {
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function distance3D([x1, y1, z1]: Point3D, [x2, y2, z2]: Point3D): number {
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
}

const p1: Point2D = [0, 0];
const p2: Point2D = [3, 4];
console.log(distance2D(p1, p2)); // 5
```

### HTTP Response Handling

```typescript
type HTTPResponse = [
	status: number,
	data: any,
	headers?: Record<string, string>,
];

function handleResponse([status, data, headers]: HTTPResponse): void {
	if (status === 200) {
		console.log("Success:", data);
	} else {
		console.log("Error:", status);
	}

	if (headers) {
		console.log("Headers:", headers);
	}
}

const response1: HTTPResponse = [200, { message: "OK" }];
const response2: HTTPResponse = [
	404,
	{ error: "Not found" },
	{ "content-type": "application/json" },
];

handleResponse(response1);
handleResponse(response2);
```

### CSV Data Processing

```typescript
type CSVRow = [string, number, boolean];
type CSVData = CSVRow[];

function parseCSVRow(row: string): CSVRow {
	const [name, age, isActive] = row.split(",");
	return [name, parseInt(age), isActive === "true"];
}

function processCSVData(data: CSVData): void {
	data.forEach(([name, age, isActive]) => {
		console.log(`${name} (${age}) is ${isActive ? "active" : "inactive"}`);
	});
}

const csvData: CSVData = [
	["Alice", 30, true],
	["Bob", 25, false],
	["Charlie", 35, true],
];

processCSVData(csvData);
```

### State Management with Tuples

```typescript
type StateTransition = [from: string, to: string, action: string];

class StateMachine {
	private transitions: StateTransition[] = [];

	addTransition(transition: StateTransition): void {
		this.transitions.push(transition);
	}

	canTransition(from: string, to: string): boolean {
		return this.transitions.some(([f, t]) => f === from && t === to);
	}

	getPossibleActions(from: string): string[] {
		return this.transitions
			.filter(([f]) => f === from)
			.map(([, , action]) => action);
	}
}

const sm = new StateMachine();
sm.addTransition(["idle", "running", "start"]);
sm.addTransition(["running", "idle", "stop"]);
sm.addTransition(["running", "error", "fail"]);

console.log(sm.canTransition("idle", "running")); // true
console.log(sm.getPossibleActions("running")); // ["stop", "fail"]
```

## Tuple Methods and Operations

### Tuple Concatenation

```typescript
type Concat<T extends readonly any[], U extends readonly any[]> = readonly [
	...T,
	...U,
];

type A = [1, 2];
type B = ["a", "b"];
type Combined = Concat<A, B>; // [1, 2, "a", "b"]
```

### Tuple Slicing

```typescript
type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]]
	? H
	: never;
type Tail<T extends readonly any[]> = T extends readonly [any, ...infer T]
	? T
	: [];

type MyTuple = [1, 2, 3, 4];
type First = Head<MyTuple>; // 1
type Rest = Tail<MyTuple>; // [2, 3, 4]
```

### Finding Tuple Length at Compile Time

```typescript
type TupleLength<T extends readonly any[]> = T["length"];

type ShortTuple = [1, 2];
type LongTuple = [1, 2, 3, 4, 5];

type ShortLength = TupleLength<ShortTuple>; // 2
type LongLength = TupleLength<LongTuple>; // 5
```

## Common Patterns and Best Practices

### Use Tuples for Fixed-Length Data

```typescript
// Good: Use tuples for coordinates, RGB values, etc.
type RGB = [number, number, number];
type Coordinate = [number, number];

// Avoid: Don't use tuples for variable-length data
// Bad: const names: [string, string, string] = ["Alice"]; // Forces fixed length
// Good: const names: string[] = ["Alice"]; // Allows variable length
```

### Prefer Named Tuples for Clarity

```typescript
// Less clear
type UserData = [string, number, boolean];

// More clear
type UserDataNamed = [name: string, age: number, isActive: boolean];
```

### Use Readonly Tuples for Constants

```typescript
// For immutable tuple data
const CONFIG: readonly [string, number, boolean] = ["localhost", 8080, true];

// For mutable tuple data
let coordinates: [number, number] = [0, 0];
coordinates = [10, 20]; // OK - reassigning the tuple
coordinates[0] = 5; // OK - modifying elements
```

## Performance Considerations

### Tuple vs Object

```typescript
// Tuples are more memory-efficient for small, fixed-size data
type PointTuple = [number, number]; // 2 elements
type PointObject = { x: number; y: number }; // 2 properties

// But objects are more flexible and self-documenting
const point1: PointTuple = [10, 20];
const point2: PointObject = { x: 10, y: 20 };

// Accessing tuple elements by index
const x1 = point1[0]; // Less readable

// Accessing object properties by name
const x2 = point2.x; // More readable
```

### Tuple Type Checking

```typescript
// TypeScript performs strict checking on tuple lengths and types
type StrictTuple = [string, number, boolean];

const valid: StrictTuple = ["hello", 42, true]; // OK
// const invalid: StrictTuple = ["hello", 42]; // Error: missing boolean
// const invalid2: StrictTuple = ["hello", 42, true, "extra"]; // Error: too many elements
```

## Best Practices

1. **Use tuples for fixed-length, heterogeneous data**: Perfect for coordinates, RGB values, key-value pairs, etc.

2. **Prefer objects for complex data**: When you have many properties or need self-documenting code.

3. **Use readonly tuples for constants**: Prevents accidental mutation of tuple elements.

4. **Consider named tuples**: Improve code readability and maintainability.

5. **Avoid tuples for variable-length data**: Use arrays instead when the length can vary.

6. **Use tuple destructuring**: Makes working with tuples more ergonomic.

7. **Be aware of tuple limitations**: No push/pop methods, fixed length, etc.

## Common Use Cases

### Database Query Results

```typescript
type QueryResult = [rows: any[], count: number, hasMore: boolean];

function executeQuery(sql: string): QueryResult {
	// Simulate database query
	const rows = [{ id: 1, name: "Alice" }];
	const count = rows.length;
	const hasMore = false;

	return [rows, count, hasMore];
}

const [rows, count, hasMore] = executeQuery("SELECT * FROM users");
```

### API Response Structures

```typescript
type APIResponse<T> = [status: number, data: T, error?: string];

function apiCall<T>(endpoint: string): APIResponse<T> {
	try {
		// Simulate API call
		const data = { message: "Success" } as T;
		return [200, data];
	} catch (error) {
		return [500, {} as T, "Internal server error"];
	}
}

const [status, data, error] = apiCall<{ message: string }>("/api/test");
```

### Matrix Operations

```typescript
type Matrix2x2 = [[number, number], [number, number]];
type Vector2D = [number, number];

function multiplyMatrixVector(matrix: Matrix2x2, vector: Vector2D): Vector2D {
	const [a, b] = matrix[0];
	const [c, d] = matrix[1];
	const [x, y] = vector;

	return [a * x + b * y, c * x + d * y];
}

const matrix: Matrix2x2 = [
	[1, 2],
	[3, 4],
];
const vector: Vector2D = [5, 6];

const result = multiplyMatrixVector(matrix, vector);
console.log(result); // [17, 39]
```

Tuples provide a powerful way to work with structured, fixed-length data in TypeScript. They offer type safety and compile-time guarantees about the structure of your data, making them ideal for representing coordinates, function return values, and other ordered collections with known types and lengths.
