# How To Initialize A TypeScript Project

This guide covers the steps to set up a new TypeScript project from scratch, including project initialization, TypeScript configuration, and compilation commands.

## Project Setup Steps

### 1. Initialize npm Project

```bash
npm init -y
```

### 2. Install TypeScript

```bash
npm install -D typescript
```

### 3. Initialize TypeScript Configuration

```bash
npx tsc --init
```

This creates a `tsconfig.json` file with default TypeScript compiler options.

## Key Files in a TypeScript Project

### package.json

Contains project metadata and dependencies. TypeScript is installed as a dev dependency:

```json
{
	"name": "03.-how-to-inititialize-a-typescript-project",
	"version": "1.0.0",
	"devDependencies": {
		"typescript": "^5.9.3"
	}
}
```

### tsconfig.json

The TypeScript configuration file that controls how TypeScript compiles your code. Key options include:

- **Module System**: `"module": "nodenext"` - Modern ES modules
- **Target**: `"target": "esnext"` - Latest JavaScript features
- **Strict Mode**: `"strict": true` - Enables all strict type checking options
- **JSX**: `"jsx": "react-jsx"` - For React projects
- **Source Maps**: `"sourceMap": true` - For debugging
- **Declarations**: `"declaration": true` - Generate .d.ts files

## TypeScript Compilation Commands

### Compile All Files

```bash
npx tsc
```

Compiles all `.ts` files according to `tsconfig.json`

### Compile Specific File

```bash
npx tsc script.ts
```

### Watch Mode (Auto-compile on changes)

```bash
npx tsc --watch
```

### Run TypeScript Directly (with tsx)

```bash
npx tsx script.ts
```

## Example Code

### TypeScript (script.ts)

```typescript
const num1 = 1;
const num2 = 3;

function sum(a: number, b: number) {
	return a + b;
}

// TypeScript catches this error at compile time:
// sum(num1); // Error: Expected 2 arguments, but got 1.

console.log("Sum:", sum(num1, num2));
```

### Compiled JavaScript (script.js)

```javascript
var num1 = 1;
var num2 = 3;
function sum(a, b) {
	return a + b;
}
// sum(num1); // Error: Expected 2 arguments, but got 1.
console.log("Sum:", sum(num1, num2));
```

## Running the Project

1. Compile TypeScript to JavaScript:

   ```bash
   npx tsc
   ```

2. Run the compiled JavaScript:
   ```bash
   node script.js
   ```

## Benefits of Proper Initialization

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Enhanced autocomplete and refactoring
- **Modern JavaScript**: Use latest features with backward compatibility
- **Maintainable Code**: Types serve as documentation
- **Scalable Projects**: Foundation for larger applications

## Additional Configuration

For Node.js projects, you might want to add:

```json
{
	"lib": ["esnext"],
	"types": ["node"]
}
```

And install Node.js types:

```bash
npm install -D @types/node
```
