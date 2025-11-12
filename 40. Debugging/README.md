# Debugging TypeScript Code

Debugging is a crucial skill for TypeScript developers. TypeScript's compiled nature and type system introduce unique debugging challenges and opportunities. This guide covers essential debugging techniques, tools, and best practices for effective TypeScript development.

## Source Maps

Source maps are the foundation of TypeScript debugging, allowing you to debug your original TypeScript code instead of the compiled JavaScript.

### Generating Source Maps

```json
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true,           // Generate .js.map files
    "inlineSourceMap": false,    // Alternative: inline source maps
    "sourceRoot": "/",           // Root for source files in dev tools
    "mapRoot": "./maps"          // Custom location for map files
  }
}
```

### Source Map Types

```typescript
// External source maps (recommended for production)
"compilerOptions": {
  "sourceMap": true
}
// Generates: main.js and main.js.map

// Inline source maps (larger bundles, no extra files)
"compilerOptions": {
  "inlineSourceMap": true
}
// Embeds source map data directly in JS files

// Inline sources (includes original TS in source map)
"compilerOptions": {
  "inlineSources": true
}
// Source map contains original TypeScript code
```

## Browser Developer Tools

### Setting Up Breakpoints

```typescript
// Set breakpoints in your TypeScript code
function processUser(user: User): void {
    debugger; // Programmatic breakpoint

    if (user.age < 18) {
        console.log("User is underage");
        return;
    }

    // Complex logic here
    validateUser(user);
    saveUser(user);
}

// Breakpoints will work in original TypeScript files
// thanks to source maps
```

### Using Chrome DevTools

1. **Open DevTools**: F12 or Ctrl+Shift+I
2. **Go to Sources tab**
3. **Navigate to your TypeScript files** (webpack:// or file://)
4. **Set breakpoints by clicking line numbers**
5. **Use the debugger controls**:
   - Continue (F8)
   - Step over (F10)
   - Step into (F11)
   - Step out (Shift+F11)

### Watch Expressions

```typescript
// Add watch expressions in DevTools
// Watch: user.name
// Watch: user.age > 18 ? "Adult" : "Minor"
// Watch: Object.keys(user)
```

## Console Debugging

### Type-Aware Console Logging

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    preferences: {
        theme: "light" | "dark";
        notifications: boolean;
    };
}

function debugUser(user: User): void {
    // TypeScript ensures user has the correct structure
    console.log("User:", user);
    console.log("User name:", user.name);
    console.log("User preferences:", user.preferences);

    // Use console.table for structured data
    console.table(user);

    // Group related logs
    console.group("User Details");
    console.log("ID:", user.id);
    console.log("Email:", user.email);
    console.groupEnd();
}
```

### Custom Debug Utilities

```typescript
// Type-safe debug utilities
function debug<T>(label: string, value: T): T {
    console.log(`${label}:`, value);
    return value; // Allow chaining
}

function debugType<T>(value: T): T {
    console.log(`Type of ${typeof value}:`, value);
    return value;
}

// Usage
const result = debug("API Response", apiCall())
    .data
    .filter(user => user.age > 18)
    .map(debugType); // Debug each user type
```

### Conditional Logging

```typescript
// Environment-based logging
const isDevelopment = process.env.NODE_ENV === "development";

function log(...args: any[]): void {
    if (isDevelopment) {
        console.log(...args);
    }
}

// Type-safe conditional logging
function debugInDev<T>(value: T, label?: string): T {
    if (isDevelopment) {
        console.log(label || "Debug:", value);
    }
    return value;
}
```

## IDE Debugging

### Visual Studio Code

#### Launch Configuration

```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug TypeScript",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/src/index.ts",
            "preLaunchTask": "tsc: build - tsconfig.json",
            "outFiles": ["${workspaceFolder}/dist/**/*.js"],
            "sourceMaps": true
        },
        {
            "name": "Debug Tests",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/node_modules/.bin/jest",
            "args": ["--runInBand"],
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen"
        }
    ]
}
```

#### VS Code Debug Features

- **Breakpoint gutter**: Click line numbers to set breakpoints
- **Debug panel**: Watch variables, call stack, loaded scripts
- **Conditional breakpoints**: Right-click breakpoint → "Edit Breakpoint"
- **Log points**: Right-click → "Add Logpoint" (logs without stopping)
- **Debug console**: Evaluate expressions in debug context

### IntelliJ/WebStorm

- **Run/Debug Configurations**: Add Node.js or JavaScript Debug
- **TypeScript support**: Built-in TypeScript debugging
- **Inline debugging**: Debug directly in editor
- **HotSwap**: Apply changes without restarting debug session

## Runtime Type Checking

### Assertion Functions

```typescript
// TypeScript 3.7+ assertion functions
function assertIsString(value: unknown): asserts value is string {
    if (typeof value !== "string") {
        throw new Error(`Expected string, got ${typeof value}`);
    }
}

function assertIsDefined<T>(value: T | undefined | null): asserts value is T {
    if (value === undefined || value === null) {
        throw new Error("Value must be defined");
    }
}

function processUserData(data: unknown): void {
    assertIsDefined(data);
    assertIsString(data.name); // TypeScript knows data.name is string

    console.log(`Processing user: ${data.name}`);
}
```

### Runtime Type Validation

```typescript
interface ApiResponse {
    success: boolean;
    data?: User;
    error?: string;
}

function validateApiResponse(response: unknown): ApiResponse {
    if (typeof response !== "object" || response === null) {
        throw new Error("Response must be an object");
    }

    const obj = response as Record<string, unknown>;

    if (typeof obj.success !== "boolean") {
        throw new Error("Response.success must be boolean");
    }

    if (obj.success && obj.data) {
        // Validate data structure
        if (typeof obj.data !== "object" || !obj.data) {
            throw new Error("Response.data must be a valid object");
        }
    }

    return response as ApiResponse;
}
```

## Error Handling and Debugging

### Try-Catch with Type Information

```typescript
interface ApiError {
    code: number;
    message: string;
    details?: unknown;
}

function handleApiCall(): void {
    try {
        const result = callApi();
        console.log("Success:", result);
    } catch (error) {
        // TypeScript 4.0+ error narrowing
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Stack trace:", error.stack);
        } else if (typeof error === "string") {
            console.error("String error:", error);
        } else {
            console.error("Unknown error:", error);
        }
    }
}
```

### Custom Error Classes

```typescript
class ValidationError extends Error {
    constructor(
        message: string,
        public field: string,
        public value: unknown
    ) {
        super(message);
        this.name = "ValidationError";
    }
}

class NetworkError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public url: string
    ) {
        super(message);
        this.name = "NetworkError";
    }
}

function validateUser(user: unknown): User {
    if (typeof user !== "object" || user === null) {
        throw new ValidationError("User must be an object", "user", user);
    }

    // Validation logic...
    throw new ValidationError("Invalid email format", "email", (user as any).email);
}

function debugError(error: unknown): void {
    if (error instanceof ValidationError) {
        console.error(`Validation failed for ${error.field}:`, error.value);
    } else if (error instanceof NetworkError) {
        console.error(`Network error ${error.statusCode} for ${error.url}`);
    } else {
        console.error("Unknown error:", error);
    }
}
```

## Debugging Async Code

### Async/Await Debugging

```typescript
async function fetchUserData(userId: number): Promise<User> {
    console.log(`Fetching user ${userId}`);

    try {
        const response = await fetch(`/api/users/${userId}`);
        console.log("Response received:", response.status);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("Data parsed:", data);

        return data as User;
    } catch (error) {
        console.error("Error in fetchUserData:", error);
        throw error;
    }
}

// Usage with debugging
async function processUsers(): Promise<void> {
    const userIds = [1, 2, 3];

    for (const id of userIds) {
        try {
            const user = await fetchUserData(id);
            console.log(`Processed user: ${user.name}`);
        } catch (error) {
            console.error(`Failed to process user ${id}:`, error);
        }
    }
}
```

### Promise Debugging

```typescript
// Debug promise chains
fetchUser(1)
    .then(user => {
        console.log("User fetched:", user);
        return validateUser(user);
    })
    .then(validatedUser => {
        console.log("User validated:", validatedUser);
        return saveUser(validatedUser);
    })
    .then(() => {
        console.log("User saved successfully");
    })
    .catch(error => {
        console.error("Error in promise chain:", error);
        // Log additional context
        console.error("Error stack:", error.stack);
    });
```

## Type-Level Debugging

### Using never for Exhaustive Checks

```typescript
type Action =
    | { type: "INCREMENT" }
    | { type: "DECREMENT" }
    | { type: "RESET" };

function handleAction(action: Action): void {
    switch (action.type) {
        case "INCREMENT":
            console.log("Incrementing");
            break;
        case "DECREMENT":
            console.log("Decrementing");
            break;
        case "RESET":
            console.log("Resetting");
            break;
        default:
            // TypeScript will error if we miss a case
            const _exhaustive: never = action;
            throw new Error(`Unhandled action: ${_exhaustive}`);
    }
}

// Adding a new action type will cause a compile error
// until we handle it in the switch statement
type NewAction = Action | { type: "SET_VALUE"; payload: number };
// Now handleAction will error until we add the "SET_VALUE" case
```

### Type Assertions for Debugging

```typescript
// Temporary type assertions for debugging
function debugType<T>(value: unknown): T {
    console.log("Value:", value);
    console.log("Type:", typeof value);
    console.log("Constructor:", (value as any)?.constructor?.name);

    return value as T; // Temporary assertion
}

// Usage
const data = getSomeData();
const typedData = debugType<{ id: number; name: string }>(data);
// Now you can inspect what data actually contains
```

## Testing and Debugging

### Unit Test Debugging

```typescript
describe("UserService", () => {
    it("should create user correctly", () => {
        const userData = { name: "John", email: "john@example.com" };

        // Debug the creation process
        console.log("Creating user with:", userData);

        const user = createUser(userData);

        console.log("Created user:", user);

        expect(user.name).toBe("John");
        expect(user.email).toBe("john@example.com");
        expect(user.id).toBeDefined();
    });
});
```

### Integration Test Debugging

```typescript
describe("API Integration", () => {
    it("should handle API errors gracefully", async () => {
        // Mock a failing API call
        const mockApi = jest.fn().mockRejectedValue(new Error("Network error"));

        try {
            await makeApiCall(mockApi);
            fail("Expected API call to throw");
        } catch (error) {
            console.log("Caught error:", error);
            expect(error.message).toBe("Network error");
        }
    });
});
```

## Performance Debugging

### Memory Leaks

```typescript
// Debug memory usage
function logMemoryUsage(): void {
    if (typeof performance !== "undefined" && performance.memory) {
        const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
        console.log(`Memory: ${Math.round(usedJSHeapSize / 1024 / 1024)}MB used of ${Math.round(totalJSHeapSize / 1024 / 1024)}MB total`);
    }
}

// Usage in long-running operations
function processLargeDataset(data: unknown[]): void {
    logMemoryUsage();

    // Process data...

    logMemoryUsage();
}
```

### Performance Profiling

```typescript
// Time function execution
function timeFunction<T extends (...args: any[]) => any>(
    fn: T,
    ...args: Parameters<T>
): ReturnType<T> {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();

    console.log(`${fn.name} took ${end - start} milliseconds`);
    return result;
}

// Usage
const result = timeFunction(processLargeArray, data);
```

## Build and Compilation Debugging

### TypeScript Compiler Options for Debugging

```json
{
  "compilerOptions": {
    "noImplicitAny": true,           // Catch implicit any
    "strictNullChecks": true,        // Catch null/undefined issues
    "strictFunctionTypes": true,     // Stricter function type checking
    "noImplicitReturns": true,       // Ensure all code paths return
    "noFallthroughCasesInSwitch": true, // Prevent switch fallthrough
    "exactOptionalPropertyTypes": true, // Stricter optional properties
    "noUncheckedIndexedAccess": true   // Safer array/object access
  }
}
```

### Debugging Compilation Errors

```typescript
// Common error: Property does not exist
interface User {
    name: string;
    age: number;
}

const user: User = { name: "John" };
// Error: Property 'age' is missing in type '{ name: string; }'

// Debug by checking the interface
console.log("User interface expects:", Object.keys({} as User));

// Fix: Add the missing property
const fixedUser: User = { name: "John", age: 30 };
```

### Declaration File Debugging

```typescript
// Debug third-party library types
declare module "some-library" {
    export interface Config {
        apiKey: string;
        timeout?: number;
    }

    export function init(config: Config): void;
}

// Test the types
const config: import("some-library").Config = {
    apiKey: "test-key",
    timeout: 5000
};

init(config);
```

## Advanced Debugging Techniques

### Conditional Breakpoints with Type Guards

```typescript
function processItems(items: unknown[]): void {
    for (const item of items) {
        // Set conditional breakpoint: isUser(item) && item.age < 18
        if (isUser(item) && item.age < 18) {
            console.log("Processing underage user:", item);
            // Breakpoint here will only trigger for underage users
        }
    }
}
```

### Debug Logging with Types

```typescript
// Type-safe debug logger
class DebugLogger {
    private enabled = process.env.DEBUG === "true";

    log<T>(label: string, value: T): T {
        if (this.enabled) {
            console.log(`[${new Date().toISOString()}] ${label}:`, value);
        }
        return value;
    }

    error<T extends Error>(error: T): T {
        console.error(`[${new Date().toISOString()}] Error:`, {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return error;
    }
}

const logger = new DebugLogger();

// Usage
const result = logger.log("API Response", apiCall());
```

### Remote Debugging

```json
// For debugging Node.js applications remotely
{
    "name": "Attach to Remote",
    "type": "node",
    "request": "attach",
    "address": "localhost",
    "port": 9229,
    "localRoot": "${workspaceFolder}",
    "remoteRoot": "/app"
}
```

## Best Practices

### 1. Use Source Maps in Development

```json
// Always enable source maps for debugging
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSources": true
  }
}
```

### 2. Write Debuggable Code

```typescript
// Good: Clear, debuggable functions
function calculateTotal(items: CartItem[]): number {
    console.log(`Calculating total for ${items.length} items`);

    let total = 0;
    for (const item of items) {
        const itemTotal = item.price * item.quantity;
        console.log(`${item.name}: $${itemTotal}`);
        total += itemTotal;
    }

    console.log(`Total: $${total}`);
    return total;
}

// Avoid: Complex, hard-to-debug functions
function calcTotal(items: any[]): number {
    return items.reduce((a, b) => a + (b.p * b.q), 0);
}
```

### 3. Use Descriptive Variable Names

```typescript
// Good for debugging
const userAuthenticationStatus = checkAuth();
const validatedUserData = sanitizeInput(rawUserData);
const processedOrderTotal = calculateTotal(orderItems);

// Avoid generic names
const x = check();
const y = sanitize(raw);
const z = calc(items);
```

### 4. Implement Proper Error Handling

```typescript
// Good: Descriptive error messages
function validateEmail(email: string): void {
    if (!email.includes("@")) {
        throw new Error(`Invalid email format: "${email}" - missing @ symbol`);
    }

    const parts = email.split("@");
    if (parts.length !== 2) {
        throw new Error(`Invalid email format: "${email}" - too many @ symbols`);
    }
}

// Bad: Generic error messages
function validateEmail(email: string): void {
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        throw new Error("Invalid email");
    }
}
```

### 5. Use TypeScript's Strict Mode

```json
// Enable all strict checks for better debugging
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Summary

Effective TypeScript debugging combines traditional JavaScript debugging techniques with TypeScript-specific features:

- **Source Maps**: Debug original TypeScript code
- **Type Guards**: Runtime type validation
- **IDE Integration**: Rich debugging in VS Code and other editors
- **Error Handling**: Custom error classes and assertion functions
- **Performance Monitoring**: Memory and timing analysis

Key debugging strategies:
- Use source maps for accurate breakpoints
- Leverage TypeScript's type system for compile-time error detection
- Implement comprehensive error handling with custom error types
- Use console logging strategically with type information
- Employ debugging tools in your IDE and browser
- Write testable, debuggable code with clear variable names

Debugging TypeScript code becomes more effective when you understand how the type system can help prevent bugs and provide better runtime error information. Regular use of these techniques will significantly improve your development workflow and code quality.
