# What is TypeScript?

TypeScript is a programming language developed and maintained by Microsoft. It is a superset of JavaScript, meaning that any valid JavaScript code is also valid TypeScript code.

## Key Features

- **Static Typing**: TypeScript adds static type checking to JavaScript, allowing developers to define types for variables, function parameters, and return values.
- **Enhanced IDE Support**: Better autocomplete, refactoring, and error detection in code editors.
- **Compiled Language**: TypeScript code is transpiled to JavaScript before execution.
- **Modern JavaScript Features**: Supports the latest ECMAScript features and provides backward compatibility.

## Basic Syntax

```typescript
// Variable declarations with types
let name: string = "TypeScript";
let age: number = 25;
let isActive: boolean = true;

// Function with typed parameters and return type
function greet(person: string): string {
	return `Hello, ${person}!`;
}

// Interface for object types
interface User {
	name: string;
	age: number;
}

const user: User = {
	name: "John",
	age: 30,
};
```

## Why Learn TypeScript?

TypeScript helps catch errors at compile-time rather than runtime, makes code more maintainable, and improves developer productivity through better tooling support.
