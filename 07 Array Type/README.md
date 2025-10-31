# Array Types in TypeScript

Arrays are fundamental data structures in JavaScript and TypeScript. TypeScript provides powerful type annotations for arrays, allowing you to specify the types of elements an array can contain. This section covers various ways to work with array types in TypeScript.

## Basic Array Type Annotations

### Simple Array Types

You can specify array types using two syntaxes:

```typescript
// Using type[] syntax
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Alice", "Bob", "Charlie"];
let flags: boolean[] = [true, false, true];

// Using Array<type> syntax
let scores: Array<number> = [85, 92, 78, 96];
let cities: Array<string> = ["New York", "London", "Tokyo"];
```

### Array Type Inference

TypeScript can infer array types from initial values:

```typescript
// TypeScript infers: number[]
let primes = [2, 3, 5, 7, 11];

// TypeScript infers: string[]
let fruits = ["apple", "banana", "orange"];

// TypeScript infers: (string | number)[]
let mixed = ["hello", 42, "world"];
```

## Working with Array Methods

Array methods maintain type safety:

```typescript
const numbers: number[] = [1, 2, 3, 4, 5];

// Type-safe array methods
numbers.push(6); // OK
numbers.push("seven"); // Error: Argument of type 'string' is not assignable to parameter of type 'number'

// Map returns a new array with the same element type
const doubled = numbers.map((n) => n * 2); // number[]

// Filter maintains the element type
const evenNumbers = numbers.filter((n) => n % 2 === 0); // number[]

// Reduce can change the return type
const sum = numbers.reduce((acc, curr) => acc + curr, 0); // number
```

## Tuple Types

Tuples are fixed-length arrays with specific types for each position:

```typescript
// Basic tuple
let coordinates: [number, number] = [10, 20];
let userInfo: [string, number, boolean] = ["Alice", 25, true];

// Accessing tuple elements
coordinates[0] = 15; // OK
coordinates[1] = "invalid"; // Error: Type 'string' is not assignable to type 'number'

// Optional tuple elements
let optionalTuple: [string, number?] = ["hello"];
optionalTuple = ["hello", 42]; // OK

// Rest elements in tuples
let restTuple: [string, ...number[]] = ["coordinates", 10, 20, 30];
```

## Readonly Arrays

TypeScript provides readonly arrays to prevent mutation:

```typescript
// Readonly array syntax
let readonlyNumbers: readonly number[] = [1, 2, 3, 4, 5];
let readonlyNames: ReadonlyArray<string> = ["Alice", "Bob"];

// Mutation is prevented
readonlyNumbers.push(6); // Error: Property 'push' does not exist on type 'readonly number[]'
readonlyNumbers[0] = 10; // Error: Index signature in type 'readonly number[]' only permits reading

// But reading is allowed
const first = readonlyNumbers[0]; // OK
const length = readonlyNumbers.length; // OK
```

## Array Destructuring with Types

TypeScript supports typed destructuring:

```typescript
const numbers: number[] = [1, 2, 3, 4, 5];

// Basic destructuring
const [first, second] = numbers; // first: number, second: number

// Skipping elements
const [, , third] = numbers; // third: number

// Rest destructuring
const [head, ...tail] = numbers; // head: number, tail: number[]

// Default values
const [a = 0, b = 0] = numbers; // a: number, b: number

// Tuple destructuring
const coordinates: [number, number] = [10, 20];
const [x, y] = coordinates; // x: number, y: number
```

## Generic Array Types

Working with generic functions and arrays:

```typescript
// Generic function with array parameter
function getFirstElement<T>(arr: T[]): T | undefined {
	return arr[0];
}

const firstNumber = getFirstElement([1, 2, 3]); // number | undefined
const firstString = getFirstElement(["a", "b", "c"]); // string | undefined

// Generic function with constraints
function getLength<T extends { length: number }>(arr: T): number {
	return arr.length;
}

getLength([1, 2, 3]); // OK
getLength("hello"); // OK
getLength(42); // Error: number doesn't have length property

// Array utility functions
function reverse<T>(arr: T[]): T[] {
	return [...arr].reverse();
}

const reversedNumbers = reverse([1, 2, 3]); // number[]
const reversedStrings = reverse(["a", "b", "c"]); // string[]
```

## Union Types with Arrays

Arrays can contain elements of different types using union types:

```typescript
// Array of union type
let mixedArray: (string | number)[] = ["hello", 42, "world", 100];

// Type guards for union arrays
function processMixedArray(arr: (string | number)[]): void {
	arr.forEach((item) => {
		if (typeof item === "string") {
			console.log(item.toUpperCase());
		} else {
			console.log(item.toFixed(2));
		}
	});
}

// Discriminated unions with arrays
type Circle = { type: "circle"; radius: number };
type Square = { type: "square"; side: number };
type Shape = Circle | Square;

const shapes: Shape[] = [
	{ type: "circle", radius: 5 },
	{ type: "square", side: 10 },
];
```

## Multidimensional Arrays

Arrays can contain other arrays:

```typescript
// 2D array
let matrix: number[][] = [
	[1, 2, 3],
	[4, 5, 6],
	[7, 8, 9],
];

// 3D array
let cube: number[][][] = [
	[
		[1, 2],
		[3, 4],
	],
	[
		[5, 6],
		[7, 8],
	],
];

// Mixed dimensional arrays
let jagged: (number[] | number)[] = [[1, 2], 3, [4, 5, 6]];
```

## Array Type Assertions

Sometimes you need to tell TypeScript more about array types:

```typescript
// Type assertion for array
const data: any = [1, 2, 3];
const numbers = data as number[]; // Assert that data is number[]

// Non-null assertion for array access
const arr: number[] | undefined = [1, 2, 3];
const first = arr![0]; // Assert that arr is not undefined

// Double assertion (use sparingly)
const value = "hello" as any as number[];
```

## Best Practices

### Type Annotations

1. **Use explicit types for public APIs**: Make array types clear in function signatures
2. **Prefer `type[]` over `Array<type>`**: More readable and consistent
3. **Use readonly arrays when possible**: Prevents accidental mutation
4. **Specify tuple types explicitly**: Helps catch length and type errors

### Array Operations

1. **Use typed array methods**: TypeScript provides type safety for array operations
2. **Leverage type inference**: Let TypeScript infer types when they're obvious
3. **Use generics for reusable functions**: Maintain type safety across different array types
4. **Consider union types for mixed arrays**: When arrays contain different types

### Performance Considerations

1. **Use readonly arrays for constants**: Prevents runtime errors and clarifies intent
2. **Be specific with tuple types**: Fixed-length arrays are more performant
3. **Avoid `any[]` when possible**: Use specific types for better type checking

## Common Patterns

### Array Filtering with Types

```typescript
interface User {
	id: number;
	name: string;
	role: "admin" | "user";
}

const users: User[] = [
	{ id: 1, name: "Alice", role: "admin" },
	{ id: 2, name: "Bob", role: "user" },
	{ id: 3, name: "Charlie", role: "user" },
];

// Type-safe filtering
const admins = users.filter((user) => user.role === "admin"); // User[]
const userNames = users.map((user) => user.name); // string[]
```

### Array Transformation Patterns

```typescript
// Transform array elements
const numbers = [1, 2, 3, 4, 5];
const stringNumbers = numbers.map((n) => n.toString()); // string[]

// Filter and transform
const evenSquares = numbers.filter((n) => n % 2 === 0).map((n) => n * n); // number[]

// Group by operation
const grouped = numbers.reduce((acc, num) => {
	const key = num % 2 === 0 ? "even" : "odd";
	acc[key] = (acc[key] || []).concat(num);
	return acc;
}, {} as Record<string, number[]>);
```

### Type Guards for Arrays

```typescript
function isStringArray(arr: unknown): arr is string[] {
	return Array.isArray(arr) && arr.every((item) => typeof item === "string");
}

function isNumberArray(arr: unknown): arr is number[] {
	return Array.isArray(arr) && arr.every((item) => typeof item === "number");
}

function processArray(arr: unknown): void {
	if (isStringArray(arr)) {
		// TypeScript knows arr is string[]
		console.log(arr.join(", "));
	} else if (isNumberArray(arr)) {
		// TypeScript knows arr is number[]
		console.log(arr.reduce((sum, n) => sum + n, 0));
	}
}
```

## Summary

- **Array type annotations** provide type safety for collections
- **Tuples** offer fixed-length, typed arrays
- **Readonly arrays** prevent mutation
- **Generic functions** work with arrays of any type
- **Union types** handle mixed array contents
- **Type guards** enable runtime type checking
- **Best practices** balance type safety with usability

Mastering array types in TypeScript leads to more robust, maintainable code with better compile-time error detection.
