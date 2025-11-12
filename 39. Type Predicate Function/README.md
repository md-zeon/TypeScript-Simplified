# Type Predicate Functions in TypeScript

Type predicate functions (also known as user-defined type guards) are special functions that return a boolean value and use the `is` keyword to narrow the type of a variable within a conditional block. They provide a way to create custom type guards that TypeScript can understand, enabling safer type narrowing and better IntelliSense.

## Basic Syntax

A type predicate function has the signature:
```typescript
function isType(value: unknown): value is Type {
    // Return true if value is of type Type
    // Return false otherwise
}
```

The key elements are:
- Return type: `value is Type` (where `value` is the parameter name and `Type` is the narrowed type)
- Return value: `boolean`
- Logic: Checks if the value matches the expected type

```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

function isUser(value: unknown): value is User {
    return (
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        "name" in value &&
        "email" in value &&
        typeof (value as User).id === "number" &&
        typeof (value as User).name === "string" &&
        typeof (value as User).email === "string"
    );
}

// Usage
function processValue(value: unknown): void {
    if (isUser(value)) {
        // TypeScript knows value is User here
        console.log(`User: ${value.name} (${value.email})`);
    } else {
        console.log("Not a user");
    }
}
```

## Why Use Type Predicates?

### Type Safety

```typescript
// Without type predicate
function processData(data: unknown): void {
    if (typeof data === "object" && data !== null && "name" in data) {
        // TypeScript still sees data as unknown
        console.log((data as any).name); // Unsafe type assertion
    }
}

// With type predicate
function processData(data: unknown): void {
    if (isUser(data)) {
        // TypeScript knows data is User
        console.log(data.name); // Type-safe access
    }
}
```

### Better IntelliSense

```typescript
function handleUserOrProduct(value: unknown): void {
    if (isUser(value)) {
        // IntelliSense shows User properties: id, name, email
        value.name; // ✅ Available
        value.email; // ✅ Available
        // value.price; // ❌ Not available (would be a Product property)
    }
}
```

### Reusable Type Guards

```typescript
// Create reusable type guards
const typeGuards = {
    isString: (value: unknown): value is string => typeof value === "string",
    isNumber: (value: unknown): value is number => typeof value === "number",
    isBoolean: (value: unknown): value is boolean => typeof value === "boolean",
    isArray: <T>(value: unknown): value is T[] => Array.isArray(value),
};

// Usage
function processMixedArray(arr: unknown[]): void {
    arr.forEach(item => {
        if (typeGuards.isString(item)) {
            console.log(`String: ${item.toUpperCase()}`);
        } else if (typeGuards.isNumber(item)) {
            console.log(`Number: ${item.toFixed(2)}`);
        } else if (typeGuards.isBoolean(item)) {
            console.log(`Boolean: ${item ? "true" : "false"}`);
        }
    });
}
```

## Common Patterns

### Object Type Guards

```typescript
interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
}

function isProduct(value: unknown): value is Product {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as Product).id === "string" &&
        typeof (value as Product).name === "string" &&
        typeof (value as Product).price === "number" &&
        typeof (value as Product).category === "string"
    );
}

// Usage
function calculateTotal(items: unknown[]): number {
    return items
        .filter(isProduct)
        .reduce((total, product) => total + product.price, 0);
}
```

### Union Type Guards

```typescript
type Shape =
    | { kind: "circle"; radius: number }
    | { kind: "rectangle"; width: number; height: number }
    | { kind: "triangle"; base: number; height: number };

function isCircle(shape: Shape): shape is Shape & { kind: "circle" } {
    return shape.kind === "circle";
}

function isRectangle(shape: Shape): shape is Shape & { kind: "rectangle" } {
    return shape.kind === "rectangle";
}

function isTriangle(shape: Shape): shape is Shape & { kind: "triangle" } {
    return shape.kind === "triangle";
}

// Usage
function getArea(shape: Shape): number {
    if (isCircle(shape)) {
        return Math.PI * shape.radius ** 2;
    } else if (isRectangle(shape)) {
        return shape.width * shape.height;
    } else if (isTriangle(shape)) {
        return (shape.base * shape.height) / 2;
    }
    throw new Error("Unknown shape");
}
```

### Generic Type Guards

```typescript
function isArrayOf<T>(
    value: unknown,
    predicate: (item: unknown) => item is T
): value is T[] {
    return Array.isArray(value) && value.every(predicate);
}

function isStringArray(value: unknown): value is string[] {
    return isArrayOf(value, (item): item is string => typeof item === "string");
}

function isNumberArray(value: unknown): value is number[] {
    return isArrayOf(value, (item): item is number => typeof item === "number");
}

// Usage
function processArray(data: unknown): void {
    if (isStringArray(data)) {
        console.log("String array:", data.map(s => s.toUpperCase()));
    } else if (isNumberArray(data)) {
        console.log("Number array sum:", data.reduce((a, b) => a + b, 0));
    } else {
        console.log("Unknown array type");
    }
}
```

### Class Instance Guards

```typescript
class Dog {
    constructor(public name: string, public breed: string) {}
    bark(): void {
        console.log(`${this.name} barks!`);
    }
}

class Cat {
    constructor(public name: string, public color: string) {}
    meow(): void {
        console.log(`${this.name} meows!`);
    }
}

function isDog(pet: unknown): pet is Dog {
    return pet instanceof Dog;
}

function isCat(pet: unknown): pet is Cat {
    return pet instanceof Cat;
}

// Usage
function makeSound(pet: unknown): void {
    if (isDog(pet)) {
        pet.bark();
    } else if (isCat(pet)) {
        pet.meow();
    } else {
        console.log("Unknown pet");
    }
}
```

## Advanced Patterns

### Type Guards with keyof

```typescript
function hasProperty<T extends object, K extends string>(
    obj: T,
    key: K
): obj is T & Record<K, unknown> {
    return key in obj;
}

function hasStringProperty<T extends object, K extends string>(
    obj: T,
    key: K
): obj is T & Record<K, string> {
    return hasProperty(obj, key) && typeof obj[key] === "string";
}

// Usage
interface Person {
    name?: string;
    age?: number;
}

function greet(person: Person): void {
    if (hasStringProperty(person, "name")) {
        console.log(`Hello, ${person.name}!`);
    } else {
        console.log("Hello, stranger!");
    }
}
```

### Recursive Type Guards

```typescript
interface TreeNode {
    value: number;
    left?: TreeNode;
    right?: TreeNode;
}

function isTreeNode(value: unknown): value is TreeNode {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const obj = value as Record<string, unknown>;

    // Check value property
    if (typeof obj.value !== "number") {
        return false;
    }

    // Check left property (optional)
    if ("left" in obj && obj.left !== undefined && !isTreeNode(obj.left)) {
        return false;
    }

    // Check right property (optional)
    if ("right" in obj && obj.right !== undefined && !isTreeNode(obj.right)) {
        return false;
    }

    return true;
}

// Usage
const tree: unknown = {
    value: 1,
    left: { value: 2 },
    right: { value: 3, left: { value: 4 } }
};

if (isTreeNode(tree)) {
    console.log("Valid tree with root value:", tree.value);
}
```

### Type Guards for API Responses

```typescript
interface ApiSuccess<T> {
    success: true;
    data: T;
    timestamp: number;
}

interface ApiError {
    success: false;
    error: string;
    code: number;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
    return response.success === true;
}

function isApiError<T>(response: ApiResponse<T>): response is ApiError {
    return response.success === false;
}

// Usage
async function fetchUser(id: number): Promise<ApiResponse<User>> {
    // Simulate API call
    return {
        success: true,
        data: { id, name: "John", email: "john@example.com" },
        timestamp: Date.now()
    };
}

async function handleUserFetch(id: number): Promise<void> {
    const response = await fetchUser(id);

    if (isApiSuccess(response)) {
        console.log("User:", response.data.name);
    } else if (isApiError(response)) {
        console.error(`Error ${response.code}: ${response.error}`);
    }
}
```

### Branded Types with Type Guards

```typescript
// Branded types for type safety
type UserId = string & { readonly __brand: "UserId" };
type Email = string & { readonly __brand: "Email" };

function isUserId(value: unknown): value is UserId {
    return typeof value === "string" && value.length > 0;
}

function isEmail(value: unknown): value is Email {
    return (
        typeof value === "string" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    );
}

function createUser(id: UserId, email: Email): User {
    return { id: id as string, name: "Unknown", email: email as string };
}

// Usage
function validateAndCreateUser(id: unknown, email: unknown): User | null {
    if (isUserId(id) && isEmail(email)) {
        return createUser(id, email);
    }
    return null;
}
```

## Best Practices

### 1. Keep Type Guards Simple and Focused

```typescript
// Good: Focused type guard
function isPositiveNumber(value: unknown): value is number {
    return typeof value === "number" && value > 0;
}

// Avoid: Complex type guard doing too much
function isValidUser(value: unknown): value is User {
    // Complex validation, API calls, etc.
    // This should be separated
}
```

### 2. Use Descriptive Names

```typescript
// Good
function isValidEmail(value: unknown): value is string {
    return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Less clear
function check(value: unknown): value is string {
    return typeof value === "string" && value.includes("@");
}
```

### 3. Combine Type Guards Effectively

```typescript
function isCompleteUser(user: Partial<User>): user is User {
    return (
        typeof user.id === "number" &&
        typeof user.name === "string" &&
        typeof user.email === "string"
    );
}

function isAdultUser(user: User): user is User & { age: number } {
    return "age" in user && user.age >= 18;
}

// Usage
function processUser(user: Partial<User>): void {
    if (isCompleteUser(user)) {
        if (isAdultUser(user)) {
            console.log(`Adult user: ${user.name}, age ${user.age}`);
        } else {
            console.log(`User: ${user.name}`);
        }
    } else {
        console.log("Incomplete user data");
    }
}
```

### 4. Test Type Guards Thoroughly

```typescript
describe("isUser", () => {
    it("should return true for valid user objects", () => {
        const validUser = { id: 1, name: "John", email: "john@example.com" };
        expect(isUser(validUser)).toBe(true);
    });

    it("should return false for invalid objects", () => {
        expect(isUser(null)).toBe(false);
        expect(isUser({})).toBe(false);
        expect(isUser({ id: "1", name: "John" })).toBe(false);
    });

    it("should narrow types correctly", () => {
        const data: unknown = { id: 1, name: "John", email: "john@example.com" };

        if (isUser(data)) {
            // TypeScript should know data is User here
            const name: string = data.name; // Should not error
            expect(name).toBe("John");
        }
    });
});
```

### 5. Handle Edge Cases

```typescript
function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.length > 0;
}

function isValidDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
}

function isDefined<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
}

// Usage
function processData(data: unknown): void {
    if (isNonEmptyString(data)) {
        console.log(`Processing: ${data.toUpperCase()}`);
    } else if (isValidDate(data)) {
        console.log(`Date: ${data.toISOString()}`);
    } else if (isDefined(data)) {
        console.log(`Defined value: ${data}`);
    } else {
        console.log("Undefined or null");
    }
}
```

## Common Use Cases

### 1. JSON Parsing and Validation

```typescript
interface Config {
    apiUrl: string;
    timeout: number;
    retries: number;
}

function isConfig(value: unknown): value is Config {
    if (typeof value !== "object" || value === null) return false;

    const obj = value as Record<string, unknown>;
    return (
        typeof obj.apiUrl === "string" &&
        typeof obj.timeout === "number" &&
        typeof obj.retries === "number"
    );
}

function loadConfig(jsonString: string): Config | null {
    try {
        const parsed = JSON.parse(jsonString);
        return isConfig(parsed) ? parsed : null;
    } catch {
        return null;
    }
}
```

### 2. Form Data Validation

```typescript
interface LoginForm {
    email: string;
    password: string;
    rememberMe: boolean;
}

function isLoginForm(data: unknown): data is LoginForm {
    if (typeof data !== "object" || data === null) return false;

    const form = data as Record<string, unknown>;
    return (
        typeof form.email === "string" &&
        typeof form.password === "string" &&
        typeof form.rememberMe === "boolean"
    );
}

function handleLogin(data: unknown): void {
    if (isLoginForm(data)) {
        // Safe to use login API
        loginUser(data.email, data.password, data.rememberMe);
    } else {
        showFormErrors();
    }
}
```

### 3. Event Handling

```typescript
type ClickEvent = { type: "click"; x: number; y: number };
type KeyEvent = { type: "keydown"; key: string; ctrlKey: boolean };

type UIEvent = ClickEvent | KeyEvent;

function isClickEvent(event: UIEvent): event is ClickEvent {
    return event.type === "click";
}

function isKeyEvent(event: UIEvent): event is KeyEvent {
    return event.type === "keydown";
}

function handleUIEvent(event: UIEvent): void {
    if (isClickEvent(event)) {
        console.log(`Clicked at ${event.x}, ${event.y}`);
    } else if (isKeyEvent(event)) {
        console.log(`Key pressed: ${event.key}, Ctrl: ${event.ctrlKey}`);
    }
}
```

### 4. Array Filtering

```typescript
function filterUsers(data: unknown[]): User[] {
    return data.filter(isUser);
}

function filterProducts(data: unknown[]): Product[] {
    return data.filter(isProduct);
}

// Usage
const mixedData: unknown[] = [
    { id: 1, name: "John", email: "john@example.com" },
    "not a user",
    { id: "P001", name: "Laptop", price: 999 },
    42
];

const users = filterUsers(mixedData);
const products = filterProducts(mixedData);

console.log(`Found ${users.length} users and ${products.length} products`);
```

## Limitations and Considerations

### 1. Type Guards Don't Persist

```typescript
function processItems(items: unknown[]): void {
    const validItems = items.filter(isUser);

    // validItems is User[] here
    validItems.forEach(user => console.log(user.name));

    // But after reassignment, type is lost
    const processedItems: unknown[] = validItems;
    // processedItems.forEach(user => console.log(user.name)); // Error
}
```

### 2. Complex Type Guards Can Be Error-Prone

```typescript
// Be careful with complex type guards
function isComplexObject(value: unknown): value is {
    user: User;
    settings: { theme: "light" | "dark" };
    permissions: string[];
} {
    // This can get very complex and error-prone
    // Consider breaking it down into smaller guards
}
```

### 3. Performance Considerations

Type guards are executed at runtime, so complex guards can impact performance:

```typescript
// Expensive type guard
function isValidUserWithApiCheck(value: unknown): value is User {
    if (!isUser(value)) return false;

    // Expensive API call to validate user exists
    return checkUserExistsInDatabase(value.id);
}

// Use sparingly for performance-critical code
```

## Integration with Other TypeScript Features

### With Utility Types

```typescript
type Predicate<T> = (value: unknown) => value is T;

function createTypeGuard<T>(
    validator: (value: unknown) => boolean
): Predicate<T> {
    return (value: unknown): value is T => validator(value);
}

const isPositiveNumber = createTypeGuard<number>(
    (value) => typeof value === "number" && value > 0
);

// Usage
function processNumbers(data: unknown[]): number[] {
    return data.filter(isPositiveNumber);
}
```

### With Conditional Types

```typescript
type ExtractTypeGuardReturn<T> = T extends (value: unknown) => value is infer R ? R : never;

type UserType = ExtractTypeGuardReturn<typeof isUser>; // User
type StringType = ExtractTypeGuardReturn<typeof typeGuards.isString>; // string
```

### With Mapped Types

```typescript
type TypeGuards<T> = {
    [K in keyof T]: (value: unknown) => value is T[K];
};

interface Person {
    name: string;
    age: number;
    email: string;
}

type PersonGuards = TypeGuards<Person>;
// {
//   name: (value: unknown) => value is string;
//   age: (value: unknown) => value is number;
//   email: (value: unknown) => value is string;
// }
```

## Summary

Type predicate functions are essential for creating type-safe TypeScript code. They provide:

- **Type Safety**: Narrow unknown types to specific types
- **Better IntelliSense**: Context-aware autocomplete
- **Reusable Logic**: Shareable type validation functions
- **Runtime Safety**: Combine compile-time and runtime checks

Key principles:
- Use `value is Type` syntax for return types
- Keep guards simple and focused
- Test guards thoroughly
- Combine with other TypeScript features effectively

Type predicate functions excel in scenarios like:
- API response validation
- Form data processing
- Event handling
- Array filtering and processing
- Complex object validation

When working with external data, user input, or any situation involving `unknown` types, type predicate functions are your primary tool for maintaining type safety while providing runtime validation.
