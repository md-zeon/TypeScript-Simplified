# Importing Types in TypeScript

TypeScript provides powerful features for importing and exporting types across modules. Understanding how to properly import types is crucial for maintaining clean code, avoiding runtime overhead, and leveraging TypeScript's type system effectively. This guide covers type imports, re-exports, and best practices for modular TypeScript development.

## Type-Only Imports

TypeScript 3.8 introduced `import type` syntax for importing only types, not values. This is essential for tree-shaking and avoiding unnecessary runtime code.

### Basic Type Imports

```typescript
// Import only types
import type { User, Product } from "./types";

// Import types and values separately
import type { User } from "./types";
import { createUser } from "./userService";

// Mixed imports (not recommended for clarity)
import { createUser, type User } from "./userService";
```

### Why Use Type-Only Imports?

```typescript
// Without type-only imports
import { User, createUser } from "./userService";

// TypeScript includes User in the compiled JavaScript
// even though it's only used for type checking
const user: User = createUser("John");

// With type-only imports
import type { User } from "./types";
import { createUser } from "./userService";

// User is completely erased from the compiled JavaScript
// Only createUser remains in the runtime code
const user: User = createUser("John");
```

## Import Type Syntax

### Named Type Imports

```typescript
// types.ts
export interface User {
    id: number;
    name: string;
}

export type UserRole = "admin" | "user" | "moderator";

export class UserService {
    static createUser(name: string): User {
        return { id: Math.random(), name };
    }
}

// consumer.ts
import type { User, UserRole } from "./types";
import { UserService } from "./types";

const user: User = UserService.createUser("John");
const role: UserRole = "admin";
```

### Namespace Type Imports

```typescript
// types.ts
export namespace Api {
    export interface Response<T> {
        data: T;
        status: number;
    }

    export type Method = "GET" | "POST" | "PUT" | "DELETE";
}

// consumer.ts
import type { Api } from "./types";

const response: Api.Response<User> = {
    data: user,
    status: 200
};

const method: Api.Method = "GET";
```

### Default Type Imports

```typescript
// types.ts
export default interface Config {
    apiUrl: string;
    timeout: number;
}

// consumer.ts
import type Config from "./types";

const config: Config = {
    apiUrl: "https://api.example.com",
    timeout: 5000
};
```

## Re-exporting Types

### Type Re-exports

```typescript
// types/index.ts
export type { User, Product } from "./user";
export type { Order } from "./order";
export { type ApiResponse } from "./api";

// Re-export with alias
export type { User as AppUser } from "./user";

// Re-export everything from a module
export * from "./types";
```

### Selective Re-exports

```typescript
// public-api.ts
// Export only public types and functions
export type { PublicUser, PublicProduct } from "./internal/types";
export { createUser, getUser } from "./internal/userService";

// Don't export internal types
// export type { InternalUser } from "./internal/types"; // Not exported
```

### Barrel Exports

```typescript
// types/index.ts
export type {
    User,
    Product,
    Order,
    ApiResponse,
    Config
} from "./user-types";

export type {
    ValidationError,
    NetworkError
} from "./error-types";

export type {
    Theme,
    ColorScheme
} from "./ui-types";
```

## Import/Export Patterns

### Interface Merging Across Modules

```typescript
// module1.ts
export interface Config {
    apiUrl: string;
}

// module2.ts
export interface Config {
    timeout: number;
}

// consumer.ts
import type { Config } from "./module1";
import type { Config } from "./module2";

// Config now has both apiUrl and timeout properties
const config: Config = {
    apiUrl: "https://api.example.com",
    timeout: 5000
};
```

### Conditional Type Imports

```typescript
// platform-specific types
// web.ts
export interface PlatformConfig {
    userAgent: string;
    viewport: { width: number; height: number };
}

// node.ts
export interface PlatformConfig {
    processId: number;
    environment: string;
}

// main.ts
import type { PlatformConfig } from "./platform";

// PlatformConfig adapts based on the imported module
```

### Generic Type Imports

```typescript
// generic-types.ts
export interface Result<T, E = Error> {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
}

export interface Repository<T> {
    findById(id: string): Promise<T | null>;
    save(entity: T): Promise<T>;
    delete(id: string): Promise<void>;
}

// consumer.ts
import type { Result, Repository } from "./generic-types";

type UserResult = Result<User>;
type UserRepository = Repository<User>;
```

## Module Resolution

### Path Mapping

```json
// tsconfig.json
{
    "compilerOptions": {
        "baseUrl": "./src",
        "paths": {
            "@types/*": ["types/*"],
            "@utils/*": ["utils/*"],
            "@components/*": ["components/*"]
        }
    }
}
```

```typescript
// With path mapping
import type { User } from "@types/user";
import type { ApiClient } from "@utils/api";
import type { ButtonProps } from "@components/button";
```

### Ambient Module Declarations

```typescript
// global-types.d.ts
declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__?: any;
    }

    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production" | "test";
            API_URL: string;
        }
    }
}

// No import needed - types are globally available
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__;
const apiUrl = process.env.API_URL;
```

## Advanced Import Patterns

### Dynamic Type Imports

```typescript
// Type-only dynamic imports
async function loadUserModule(): Promise<typeof import("./user-module")> {
    const module = await import("./user-module");
    return module;
}

// Usage
const userModule = await loadUserModule();
type User = typeof userModule.User;
const user: User = userModule.createUser("John");
```

### Import Type from Values

```typescript
// Extract types from runtime values
import { userService } from "./userService";

// Get the type of the instance
type UserServiceType = typeof userService;

// Get the return type of a method
type User = ReturnType<typeof userService.getUser>;

// Get parameter types
type CreateUserParams = Parameters<typeof userService.createUser>;
```

### Utility Types for Imports

```typescript
// Create utility types for common import patterns
type ModuleTypes<T> = T extends { [K: string]: infer U } ? U : never;

type ImportedTypes<T> = T extends { default: infer D; ...rest: infer R }
    ? D | ModuleTypes<R>
    : ModuleTypes<T>;

// Usage
import * as ReactTypes from "react";
type ReactType = ImportedTypes<typeof ReactTypes>;
```

## Best Practices

### 1. Use Type-Only Imports for Types

```typescript
// Good: Clear separation of types and values
import type { User, Product } from "./types";
import { createUser, updateProduct } from "./api";

// Avoid: Mixing types and values in one import
import { User, createUser, Product, updateProduct } from "./mixed-module";
```

### 2. Prefer Named Exports for Types

```typescript
// Good: Named exports are tree-shakeable
export interface User { /* ... */ }
export type UserRole = "admin" | "user";

// Avoid: Default exports for types (less tree-shakeable)
export default interface User { /* ... */ }
```

### 3. Create Barrel Exports

```typescript
// types/index.ts
export type { User, Product, Order } from "./models";
export type { ApiResponse, ApiError } from "./api";
export type { ThemeConfig } from "./ui";

// consumer.ts
import type { User, ApiResponse, ThemeConfig } from "./types";
```

### 4. Use Import Type for Third-Party Libraries

```typescript
// For libraries that export both types and values
import type { ComponentProps, FC } from "react";
import { useState, useEffect } from "react";

// For type-only libraries
import type { Express, Request, Response } from "express";
```

### 5. Avoid Import/Export of Values as Types

```typescript
// Avoid: Using values as types
import { userService } from "./userService";
type User = typeof userService.getUser; // Complex and unclear

// Better: Export types explicitly
// userService.ts
export interface User { /* ... */ }
export function getUser(id: string): User { /* ... */ }

// consumer.ts
import type { User } from "./userService";
```

## Common Patterns and Anti-Patterns

### Pattern: Type-Only Import for Large Libraries

```typescript
// For large libraries where you only need types
import type { ComponentType, PropsWithChildren } from "react";

// Avoid importing the entire react namespace just for types
// import * as React from "react"; // Imports runtime code
```

### Anti-Pattern: Overusing Namespace Imports

```typescript
// Avoid: Pollutes the import namespace
import * as Types from "./types";

// Better: Explicit named imports
import type { User, Product } from "./types";
```

### Pattern: Conditional Type Exports

```typescript
// types.ts
export interface BaseConfig {
    apiUrl: string;
}

export interface WebConfig extends BaseConfig {
    userAgent: string;
}

export interface NodeConfig extends BaseConfig {
    processId: number;
}

// consumer.ts
import type { WebConfig } from "./types"; // Or NodeConfig based on platform
```

### Anti-Pattern: Deep Import Paths

```typescript
// Avoid: Deep import paths are brittle
import type { User } from "../../../types/models/user";

// Better: Use barrel exports and path mapping
import type { User } from "@types/models";
```

## Module System Integration

### ES Modules vs CommonJS

```typescript
// ES Modules (recommended)
import type { User } from "./user";
export type { User };

// CommonJS (still supported)
const types = require("./types");
type User = typeof types.User;

// Or with import()
import type { User } = await import("./user");
```

### Declaration Merging

```typescript
// module1.ts
export interface Config {
    apiUrl: string;
}

// module2.ts
export interface Config {
    timeout: number;
}

// When imported together, Config has both properties
import type { Config } from "./module1";
import type { Config } from "./module2";
```

### Ambient Declarations

```typescript
// types.d.ts
declare module "some-library" {
    export interface Config {
        apiKey: string;
    }
}

// Usage
import type { Config } from "some-library";
```

## Performance Considerations

### Tree Shaking

```typescript
// Type-only imports are completely removed at compile time
import type { User } from "./types"; // No runtime code

// Value imports remain in the bundle
import { createUser } from "./userService"; // Runtime code included

// Mixed imports - only values remain
import { createUser, type User } from "./userService";
```

### Bundle Size Impact

```typescript
// Large type-only imports have zero bundle size impact
import type {
    User,
    Product,
    Order,
    Payment,
    Shipping,
    // ... many more types
} from "./types"; // 0 bytes in bundle

// Value imports increase bundle size
import { createUser, validateProduct, processOrder } from "./services"; // Actual code
```

## Tooling and IDE Support

### Auto-Import Suggestions

Modern IDEs can automatically suggest the correct import type:

```typescript
// Typing "User" might suggest:
// import type { User } from "./types";  // For type-only usage
// import { User } from "./types";       // For value usage
```

### Import Organization

```typescript
// Group imports by type
import type { User, Product, Order } from "./types";
import type { ApiResponse } from "./api";

import { createUser } from "./userService";
import { validateProduct } from "./productService";
import { processOrder } from "./orderService";
```

### Refactoring Support

```typescript
// When moving types between files, imports are automatically updated
// From: import type { User } from "./old-location";
// To:   import type { User } from "./new-location";
```

## Migration Strategies

### From Value Imports to Type Imports

```typescript
// Before
import { User, createUser } from "./userService";
const user: User = createUser("John");

// After
import type { User } from "./types";
import { createUser } from "./userService";
const user: User = createUser("John");
```

### Converting Default Exports to Named Exports

```typescript
// Before
export default interface User { /* ... */ }

// After
export interface User { /* ... */ }

// Usage
import type { User } from "./types"; // Cleaner
// vs
import type User from "./types"; // Less clear
```

## Summary

Effective type importing in TypeScript involves understanding the distinction between type-only and value imports, using proper re-export patterns, and following best practices for maintainability and performance.

Key principles:
- Use `import type` for type-only imports to enable tree shaking
- Prefer named exports for better tree-shaking support
- Create barrel exports for clean import paths
- Separate type and value imports for clarity
- Use path mapping for scalable import structures

Benefits of proper type imports:
- **Tree Shaking**: Eliminate unused code from bundles
- **Performance**: Reduce bundle size and loading times
- **Maintainability**: Clear separation of types and values
- **IDE Support**: Better autocomplete and refactoring
- **Type Safety**: Compile-time guarantees without runtime overhead

Mastering TypeScript's import system is essential for building scalable, performant applications with clean, maintainable code architecture.
