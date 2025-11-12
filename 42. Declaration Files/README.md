# Declaration Files in TypeScript

Declaration files (`.d.ts`) are TypeScript files that provide type information for JavaScript code, third-party libraries, and ambient declarations. They enable TypeScript to understand the shape and types of code that wasn't written in TypeScript, making it possible to use JavaScript libraries with full type safety. This guide covers creating, using, and publishing declaration files.

## What are Declaration Files?

Declaration files contain only type information - no implementation. They use the `.d.ts` extension and are automatically included by TypeScript's compiler.

```typescript
// example.d.ts
declare function greet(name: string): string;
declare const PI: number;
declare class Calculator {
    add(a: number, b: number): number;
}
```

## Basic Declaration Syntax

### Function Declarations

```typescript
// Single function
declare function createUser(name: string, age: number): User;

// Function overloads
declare function parse(input: string): number;
declare function parse(input: string, radix: number): number;

// Optional parameters
declare function configure(options?: Config): void;

// Rest parameters
declare function format(template: string, ...args: any[]): string;
```

### Variable Declarations

```typescript
// Constants
declare const VERSION: string;
declare const PI: number;

// Variables
declare let currentUser: User | null;
declare var globalConfig: Config;
```

### Class Declarations

```typescript
declare class HttpClient {
    constructor(baseUrl: string);
    get<T>(url: string): Promise<T>;
    post<T>(url: string, data: any): Promise<T>;
    put<T>(url: string, data: any): Promise<T>;
    delete(url: string): Promise<void>;
}

// Abstract classes
declare abstract class BaseService {
    abstract findAll(): Promise<any[]>;
    save(item: any): Promise<any>;
}
```

### Interface and Type Declarations

```typescript
// Interfaces
declare interface User {
    id: number;
    name: string;
    email: string;
}

// Type aliases
declare type UserRole = "admin" | "user" | "moderator";
declare type ApiResponse<T> = {
    data: T;
    status: number;
    message: string;
};
```

### Module Declarations

```typescript
// For CommonJS modules
declare module "lodash" {
    export function chunk<T>(array: T[], size?: number): T[][];
    export function debounce<T extends (...args: any[]) => any>(
        func: T,
        wait?: number
    ): T;
}

// For ES modules
declare module "express" {
    export interface Request {
        body: any;
        params: Record<string, string>;
        query: Record<string, string>;
    }

    export interface Response {
        send(data: any): void;
        json(data: any): void;
        status(code: number): Response;
    }

    export function Router(): any;
    export default function(): any;
}
```

## Ambient Declarations

### Global Variables

```typescript
// globals.d.ts
declare global {
    const __DEV__: boolean;
    const __VERSION__: string;

    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__?: any;
        gtag: (command: string, ...args: any[]) => void;
    }

    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production" | "test";
            API_URL: string;
            DATABASE_URL: string;
        }
    }
}
```

### Extending Existing Types

```typescript
// extensions.d.ts
declare global {
    interface Array<T> {
        first(): T | undefined;
        last(): T | undefined;
        isEmpty(): boolean;
    }

    interface String {
        capitalize(): string;
        isEmail(): boolean;
    }
}

// Implementation would go in a .ts file
Array.prototype.first = function() {
    return this[0];
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
```

## Declaration Merging

### Interface Merging

```typescript
// module1.d.ts
declare interface Config {
    apiUrl: string;
}

// module2.d.ts
declare interface Config {
    timeout: number;
}

// When both are imported, Config has both properties
// Usage: const config: Config = { apiUrl: "...", timeout: 5000 };
```

### Module Augmentation

```typescript
// Augment an existing module
declare module "express" {
    interface Request {
        user?: User;
        sessionId?: string;
    }
}

// Now express Request has additional properties
import { Request } from "express";

function handler(req: Request, res: Response) {
    const user = req.user; // Available
    const sessionId = req.sessionId; // Available
}
```

### Namespace Merging

```typescript
// lib.d.ts
declare namespace MyLib {
    export interface Options {
        debug: boolean;
    }
}

// extensions.d.ts
declare namespace MyLib {
    export interface Options {
        timeout: number; // Merged with existing Options
    }

    export function createClient(options: Options): Client;
}
```

## Creating Declaration Files

### For JavaScript Libraries

```typescript
// my-library.d.ts
declare namespace MyLibrary {
    interface Config {
        apiKey: string;
        baseUrl?: string;
    }

    class ApiClient {
        constructor(config: Config);
        get(endpoint: string): Promise<any>;
        post(endpoint: string, data: any): Promise<any>;
    }

    function createClient(config: Config): ApiClient;
}

declare module "my-library" {
    export = MyLibrary;
    export default MyLibrary;
}
```

### Auto-Generating Declarations

```json
// tsconfig.json
{
    "compilerOptions": {
        "declaration": true,        // Generate .d.ts files
        "declarationMap": true,     // Generate .d.ts.map files
        "emitDeclarationOnly": false, // Generate both .js and .d.ts
        "outDir": "./dist",
        "declarationDir": "./types" // Custom directory for declarations
    }
}
```

### Manual Declaration Files

```typescript
// types/jquery.d.ts
declare interface JQuery {
    on(event: string, handler: Function): this;
    off(event: string, handler?: Function): this;
    click(handler: Function): this;
    hide(): this;
    show(): this;
}

declare interface JQueryStatic {
    (selector: string): JQuery;
    ajax(settings: any): any;
}

declare const $: JQueryStatic;
```

## Publishing Declaration Files

### Including in Package

```json
// package.json
{
    "name": "my-library",
    "version": "1.0.0",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",  // Main declaration file
    "files": [
        "dist/"
    ]
}
```

### Separate @types Packages

```json
// For libraries without built-in types
{
    "name": "@types/lodash",
    "version": "4.14.0",
    "description": "TypeScript definitions for lodash",
    "types": "index.d.ts"
}
```

### Declaration Bundles

```typescript
// dist/index.d.ts (bundled declarations)
declare interface User {
    id: number;
    name: string;
}

declare function createUser(name: string): User;
declare function getUser(id: number): User | null;

// Re-export types from internal modules
export type { User } from "./internal/user";
export { createUser, getUser } from "./internal/user-service";
```

## Advanced Patterns

### Conditional Declarations

```typescript
// Platform-specific declarations
declare namespace NodeJS {
    interface Global {
        process: Process;
    }
}

declare namespace WebAssembly {
    interface Module {
        // WebAssembly types
    }
}

// Browser-specific
declare interface HTMLElement {
    dataset: DOMStringMap;
}

// Node.js specific
declare interface Process {
    env: { [key: string]: string | undefined };
}
```

### Generic Declarations

```typescript
declare interface Repository<T> {
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    save(entity: T): Promise<T>;
    delete(id: string): Promise<void>;
}

declare interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
    timestamp: number;
}

declare function createRepository<T>(
    model: new () => T
): Repository<T>;
```

### Function Overloads in Declarations

```typescript
declare interface StringUtils {
    padStart(targetLength: number, padString?: string): string;
    padEnd(targetLength: number, padString?: string): string;
}

declare namespace StringUtils {
    function capitalize(str: string): string;
    function truncate(str: string, maxLength: number): string;
    function slugify(str: string): string;
}
```

### Declaration Templates

```typescript
// Generic declaration template
declare function createSelector<TState, TResult>(
    selector: (state: TState) => TResult
): (state: TState) => TResult;

declare function createSelector<TState, T1, TResult>(
    selector1: (state: TState) => T1,
    combiner: (arg1: T1) => TResult
): (state: TState) => TResult;

// Usage
const getUserName = createSelector(
    (state: AppState) => state.user,
    (user) => user.name
);
```

## Best Practices

### 1. Use Specific Types

```typescript
// Good: Specific types
declare function fetchUser(id: number): Promise<User>;

// Avoid: Generic any
declare function fetchUser(id: any): Promise<any>;
```

### 2. Document Declarations

```typescript
/**
 * Creates a new user with the given name
 * @param name - The user's full name
 * @returns A promise that resolves to the created user
 */
declare function createUser(name: string): Promise<User>;

/**
 * Configuration options for the API client
 */
declare interface ApiConfig {
    /** The base URL for API requests */
    baseUrl: string;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** API authentication token */
    token?: string;
}
```

### 3. Keep Declarations Minimal

```typescript
// Good: Only declare what's needed
declare interface Database {
    connect(url: string): Promise<void>;
    disconnect(): Promise<void>;
    query<T>(sql: string, params?: any[]): Promise<T[]>;
}

// Avoid: Over-declaring
declare interface Database {
    connect(url: string): Promise<void>;
    disconnect(): Promise<void>;
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    // Unnecessary internal methods
    _parseConnectionString(url: string): any;
    _executeRawQuery(query: string): any;
}
```

### 4. Use Declaration Merging Wisely

```typescript
// Good: Augment existing types
declare global {
    interface Array<T> {
        first(): T | undefined;
        last(): T | undefined;
    }
}

// Avoid: Conflicting declarations
// declare interface Array<T> { ... } // Conflicts with lib.d.ts
```

### 5. Test Declarations

```typescript
// declarations.test.ts
import { expectType } from "tsd";

// Test that declarations work as expected
expectType<User>(createUser("John"));
expectType<Promise<User[]>>(getUsers());
expectType<string>(formatDate(new Date()));
```

## Common Declaration Patterns

### Library Wrapper

```typescript
// For libraries that don't have types
declare module "legacy-library" {
    export interface LegacyOptions {
        host: string;
        port: number;
    }

    export class LegacyClient {
        constructor(options: LegacyOptions);
        connect(): Promise<void>;
        send(data: any): Promise<any>;
        close(): void;
    }

    export default LegacyClient;
}
```

### Plugin System

```typescript
// Plugin interface declarations
declare interface Plugin {
    name: string;
    version: string;
    init(app: Application): void;
    destroy?(): void;
}

declare interface PluginManager {
    register(plugin: Plugin): void;
    unregister(name: string): void;
    get(name: string): Plugin | undefined;
    list(): Plugin[];
}

// Usage
declare module "my-app" {
    export { Plugin, PluginManager };
}
```

### Environment-Specific Declarations

```typescript
// Environment-specific declarations
declare const process: {
    env: {
        NODE_ENV: "development" | "production" | "test";
        API_URL: string;
        [key: `REACT_APP_${string}`]: string | undefined;
    };
    version: string;
    platform: string;
};

// Browser-specific
declare interface Navigator {
    userAgent: string;
    language: string;
    onLine: boolean;
}
```

## Tooling and Utilities

### Declaration File Generators

```bash
# Generate declarations from TypeScript
tsc --declaration --emitDeclarationOnly

# Use dts-gen for JavaScript libraries
npx dts-gen -m lodash

# Use api-extractor for complex projects
npx @microsoft/api-extractor
```

### Declaration Linting

```json
// .eslintrc.js
module.exports = {
    rules: {
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/prefer-readonly": "error",
        "@typescript-eslint/no-empty-interface": "warn"
    }
};
```

### Declaration Testing

```typescript
// Use tsd for testing declaration files
import { expectType, expectError } from "tsd";

import { createUser, getUser } from "./";

// Test correct usage
expectType<Promise<User>>(createUser("John"));
expectType<Promise<User | null>>(getUser(1));

// Test incorrect usage (should error)
expectError(createUser(123)); // Wrong parameter type
expectError(getUser("invalid")); // Wrong parameter type
```

## Troubleshooting

### Common Issues

```typescript
// Issue: Module not found
// Solution: Check tsconfig.json paths and moduleResolution

// Issue: Type not found in declaration
// Solution: Ensure all exports are properly declared

// Issue: Declaration conflicts
// Solution: Use declaration merging or rename types

// Issue: Ambient declarations not recognized
// Solution: Check tsconfig.json includes and types settings
```

### Declaration File Structure

```
types/
├── index.d.ts          # Main declarations
├── globals.d.ts        # Global declarations
├── modules/            # Module-specific declarations
│   ├── express.d.ts
│   ├── lodash.d.ts
│   └── react.d.ts
└── utils.d.ts          # Utility type declarations
```

## Publishing and Distribution

### NPM Package Structure

```json
{
    "name": "@types/my-library",
    "version": "1.0.0",
    "description": "TypeScript definitions for my-library",
    "types": "index.d.ts",
    "typesPublisherContentHash": "hash",
    "typeScriptVersion": "4.0"
}
```

### DefinitelyTyped Contributions

```typescript
// For DefinitelyTyped packages
// Follow the contribution guidelines at:
// https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "my-library" {
    // Declarations following DT patterns
    export function doSomething(): void;
    export interface Options {
        // ...
    }
}
```

## Summary

Declaration files are essential for TypeScript's interoperability with JavaScript and provide type safety for untyped code. They enable:

- **Type Safety**: Full TypeScript support for JavaScript libraries
- **Better DX**: IntelliSense and autocomplete for external code
- **Documentation**: Self-documenting APIs through types
- **Ecosystem**: Large collection of typed packages via DefinitelyTyped

Key principles for declaration files:
- Keep declarations minimal and focused
- Use specific types over `any`
- Document with JSDoc comments
- Test declarations with tools like `tsd`
- Follow established patterns for consistency

Mastering declaration files enables building robust TypeScript applications that can safely integrate with the vast JavaScript ecosystem while maintaining full type safety.
