# Partial and Required Utility Types in TypeScript

`Partial` and `Required` are essential utility types in TypeScript that allow you to modify the optionality of properties in existing types. `Partial` makes all properties optional, while `Required` makes all properties required. These utilities are fundamental for creating flexible APIs, handling form data, and managing state updates.

## Required Utility Type

### Basic Required Usage

```typescript
interface User {
	name: string;
	email?: string;
	age?: number;
}

// Make all properties required
type RequiredUser = Required<User>;
// Equivalent to: { name: string; email: string; age: number; }

const user: RequiredUser = {
	name: "Alice",
	email: "alice@example.com", // Now required
	age: 30, // Now required
};
```

### Required with Nested Objects

```typescript
interface Profile {
	basic: {
		name: string;
		email?: string;
	};
	preferences: {
		theme?: "light" | "dark";
		notifications?: boolean;
	};
}

// Make all nested properties required
type CompleteProfile = Required<Profile>;
// Equivalent to:
// {
//   basic: { name: string; email: string; };
//   preferences: { theme: "light" | "dark"; notifications: boolean; };
// }
```

### Required in Form Validation

```typescript
interface LoginForm {
	username?: string;
	password?: string;
	rememberMe?: boolean;
}

// For form submission, all fields should be required
type ValidatedLoginForm = Required<LoginForm>;

function submitLogin(form: ValidatedLoginForm): Promise<void> {
	// All fields are guaranteed to be present
	console.log(`Logging in ${form.username}...`);
	// ... API call
}
```

## Partial Utility Type

### Basic Partial Usage

```typescript
interface Product {
	name: string;
	price: number;
	category: string;
	description?: string;
}

// Make all properties optional
type PartialProduct = Partial<Product>;
// Equivalent to: { name?: string; price?: number; category?: string; description?: string; }

const update: PartialProduct = {
	price: 29.99,
	description: "Updated description",
	// name and category are optional
};
```

### Partial with Nested Objects

```typescript
interface Company {
	name: string;
	address: {
		street: string;
		city: string;
		country: string;
	};
	employees: number;
}

// Make all properties optional recursively
type PartialCompany = Partial<Company>;
// Equivalent to:
// {
//   name?: string;
//   address?: { street?: string; city?: string; country?: string; };
//   employees?: number;
// }
```

### Partial in Update Operations

```typescript
interface Todo {
	id: number;
	title: string;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// For updates, allow partial updates
type TodoUpdate = Partial<Pick<Todo, "title" | "completed">>;

function updateTodo(id: number, updates: TodoUpdate): Promise<Todo> {
	// Only specified fields will be updated
	return apiCall(`/todos/${id}`, "PATCH", {
		...updates,
		updatedAt: new Date(),
	});
}

// Usage
await updateTodo(1, { completed: true });
await updateTodo(2, { title: "Updated title", completed: false });
```

## Combining Partial and Required

### Selective Required with Partial

```typescript
interface UserForm {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
	acceptTerms: boolean;
}

// For registration, make some fields required and others optional
type RegistrationForm = Required<
	Pick<UserForm, "name" | "email" | "password" | "acceptTerms">
> &
	Partial<Pick<UserForm, "confirmPassword">>;
```

### Deep Partial and Required

```typescript
// Deep Partial - makes all nested properties optional
type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Deep Required - makes all nested properties required
type DeepRequired<T> = {
	[P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

interface NestedConfig {
	database: {
		host: string;
		port?: number;
		credentials: {
			username: string;
			password?: string;
		};
	};
	features?: {
		auth: boolean;
		cache?: boolean;
	};
}

type PartialConfig = DeepPartial<NestedConfig>;
type RequiredConfig = DeepRequired<NestedConfig>;
```

## Advanced Patterns

### Conditional Partial/Required

```typescript
type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

interface ApiResponse {
	data: any;
	status: number;
	message?: string;
	error?: string;
}

// Make 'message' required but keep others as-is
type SuccessResponse = OptionalKeys<ApiResponse, "error"> &
	RequiredKeys<ApiResponse, "message">;

// Make 'error' required but keep others as-is
type ErrorResponse = OptionalKeys<ApiResponse, "message"> &
	RequiredKeys<ApiResponse, "error">;
```

### Partial/Required with Generics

```typescript
function createUpdater<T>() {
	return {
		update: (current: T, changes: Partial<T>): T => {
			return { ...current, ...changes };
		},
		create: (data: Required<T>): T => {
			// Ensure all required fields are present
			return data;
		},
	};
}

interface User {
	id: number;
	name: string;
	email: string;
	role?: "admin" | "user";
}

const userUpdater = createUpdater<User>();

const user = userUpdater.create({
	id: 1,
	name: "Alice",
	email: "alice@example.com",
	role: "user", // Required in create
});

const updatedUser = userUpdater.update(user, {
	email: "alice.smith@example.com",
	// Other fields optional
});
```

## Real-World Examples

### Form State Management

```typescript
interface ContactForm {
	name: string;
	email: string;
	message: string;
	phone?: string;
	newsletter?: boolean;
}

// Form data can be partial during editing
type FormData = Partial<ContactForm>;

// But must be complete for submission
type SubmitData = Required<Omit<ContactForm, "newsletter">> &
	Partial<Pick<ContactForm, "newsletter">>;

class FormManager {
	private data: FormData = {};

	updateField<K extends keyof ContactForm>(
		field: K,
		value: ContactForm[K],
	): void {
		this.data[field] = value;
	}

	isValid(): boolean {
		const requiredFields: (keyof ContactForm)[] = ["name", "email", "message"];
		return requiredFields.every(
			(field) => field in this.data && this.data[field],
		);
	}

	submit(): SubmitData | null {
		if (!this.isValid()) return null;

		return {
			name: this.data.name!,
			email: this.data.email!,
			message: this.data.message!,
			phone: this.data.phone,
			newsletter: this.data.newsletter,
		};
	}
}
```

### API Layer Types

```typescript
interface DatabaseUser {
	id: number;
	name: string;
	email: string;
	password: string;
	role: "admin" | "user";
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
}

// Create - exclude auto-generated fields
type CreateUserInput = Required<
	Pick<DatabaseUser, "name" | "email" | "password">
> &
	Partial<Pick<DatabaseUser, "role">>;

// Update - allow partial updates of specific fields
type UpdateUserInput = Partial<
	Pick<DatabaseUser, "name" | "email" | "role" | "isActive">
>;

// Response - exclude sensitive fields
type UserResponse = Omit<DatabaseUser, "password">;

// Public profile - further restrict fields
type PublicUserProfile = Pick<UserResponse, "id" | "name" | "createdAt">;
```

### Configuration Objects

```typescript
interface AppConfig {
	api: {
		baseUrl: string;
		timeout: number;
		retries: number;
	};
	database: {
		host: string;
		port: number;
		database: string;
		ssl?: boolean;
	};
	features: {
		auth: boolean;
		cache: boolean;
		logging: boolean;
	};
}

// Default config with all required fields
const defaultConfig: Required<AppConfig> = {
	api: {
		baseUrl: "https://api.example.com",
		timeout: 5000,
		retries: 3,
	},
	database: {
		host: "localhost",
		port: 5432,
		database: "myapp",
		ssl: false,
	},
	features: {
		auth: true,
		cache: true,
		logging: true,
	},
};

// User config can override any part
type UserConfig = DeepPartial<AppConfig>;

function mergeConfig(userConfig: UserConfig): Required<AppConfig> {
	// Deep merge logic would go here
	return { ...defaultConfig, ...userConfig } as Required<AppConfig>;
}
```

### State Management

```typescript
interface AppState {
	user: {
		id: number;
		name: string;
		email: string;
		isLoggedIn: boolean;
	};
	settings: {
		theme: "light" | "dark";
		language: string;
		notifications: boolean;
	};
	ui: {
		loading: boolean;
		error: string | null;
	};
}

// Actions can update any part of the state
type StateUpdate = Partial<AppState>;

// But some updates might require all fields
type UserLoginUpdate = Required<
	Pick<AppState["user"], "id" | "name" | "email">
> & {
	isLoggedIn: true;
};

class StateManager {
	private state: AppState;

	constructor(initialState: AppState) {
		this.state = initialState;
	}

	update(updates: StateUpdate): void {
		this.state = this.deepMerge(this.state, updates);
	}

	login(userData: UserLoginUpdate): void {
		this.update({
			user: {
				...this.state.user,
				...userData,
			},
		});
	}

	private deepMerge(target: any, source: any): any {
		// Deep merge implementation
		return { ...target, ...source };
	}
}
```

## Utility Types Built with Partial and Required

### Strict Partial

```typescript
// Unlike regular Partial, this ensures at least one property is provided
type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
	U[keyof U];

interface FilterOptions {
	name?: string;
	age?: number;
	city?: string;
}

type ValidFilter = AtLeastOne<FilterOptions>;

// Valid
const filter1: ValidFilter = { name: "Alice" };
const filter2: ValidFilter = { age: 30, city: "NYC" };

// Invalid
// const filter3: ValidFilter = {}; // At least one property required
```

### Selective Required

```typescript
type SelectiveRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

interface ApiOptions {
	method?: "GET" | "POST" | "PUT" | "DELETE";
	url?: string;
	headers?: Record<string, string>;
	body?: any;
	timeout?: number;
}

// Make method and url required, others optional
type ValidApiCall = SelectiveRequired<ApiOptions, "method" | "url">;

const apiCall: ValidApiCall = {
	method: "GET",
	url: "/api/users",
	// headers, body, timeout are optional
};
```

### Optional Except

```typescript
type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

interface UserRegistration {
	name: string;
	email: string;
	password: string;
	confirmPassword?: string;
	acceptTerms?: boolean;
}

// Make name and email required, others optional
type RegistrationData = OptionalExcept<UserRegistration, "name" | "email">;

const registration: RegistrationData = {
	name: "Alice", // Required
	email: "alice@example.com", // Required
	password: "secret123", // Optional
	acceptTerms: true, // Optional
};
```

## Best Practices

### When to Use Required

1. **Form Submissions**: Ensure all required fields are present
2. **API Responses**: Guarantee expected data structure
3. **Configuration**: Ensure all settings are provided
4. **Validation**: After validating optional fields

### When to Use Partial

1. **Updates/Patches**: Allow partial modifications
2. **Form Editing**: During data entry before validation
3. **Configuration Overrides**: Optional configuration properties
4. **Search Filters**: Optional filter criteria

### Naming Conventions

```typescript
// Good: Descriptive names
type UserUpdate = Partial<Pick<User, "name" | "email">>;
type CompleteUser = Required<User>;
type UserCreation = Required<Pick<User, "name" | "email">>;

// Avoid: Generic names
type PartialUser = Partial<User>; // Less specific
type RequiredUser = Required<User>; // Less specific
```

### Performance Considerations

```typescript
// Partial/Required are compile-time operations
// They don't affect runtime performance
// The resulting types are equivalent to manually defined interfaces

// This:
type OptionalUser = Partial<User>;

// Is equivalent to:
interface OptionalUser {
	name?: string;
	email?: string;
	age?: number;
}
```

### Combining with Other Utility Types

```typescript
// Create flexible CRUD types
type CreateInput<T> = Required<Omit<T, "id" | "createdAt" | "updatedAt">>;
type UpdateInput<T> = Partial<Pick<T, keyof T>>;
type ResponseType<T> = Omit<T, "password" | "internalId">;

// Create form types
type FormData<T> = Partial<T>;
type ValidatedForm<T> = Required<T>;
type FormErrors<T> = Partial<Record<keyof T, string>>;
```

## Common Patterns

### Entity Management

```typescript
interface BaseEntity {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	version: number;
}

// Generic entity operations
type EntityOperations<T extends BaseEntity> = {
	create: (data: CreateInput<T>) => Promise<T>;
	update: (id: string, data: UpdateInput<T>) => Promise<T>;
	findById: (id: string) => Promise<T | null>;
	findAll: (filters?: Partial<T>) => Promise<T[]>;
	delete: (id: string) => Promise<void>;
};

// Usage
interface User extends BaseEntity {
	name: string;
	email: string;
	role: "admin" | "user";
}

type UserOperations = EntityOperations<User>;
```

### API Client Types

```typescript
interface ApiClient<TData, TFilters = Partial<TData>> {
	getAll: (filters?: TFilters) => Promise<TData[]>;
	getById: (id: string) => Promise<TData>;
	create: (
		data: Required<Omit<TData, "id" | "createdAt" | "updatedAt">>,
	) => Promise<TData>;
	update: (id: string, data: Partial<TData>) => Promise<TData>;
	delete: (id: string) => Promise<void>;
}

interface Product {
	id: string;
	name: string;
	price: number;
	category: string;
	createdAt: Date;
	updatedAt: Date;
}

type ProductApiClient = ApiClient<Product, Pick<Product, "category">>;
```

### Form Validation System

```typescript
type ValidationResult<T> = {
	isValid: boolean;
	errors: Partial<Record<keyof T, string>>;
	data: Partial<T>;
};

type ValidationRules<T> = {
	[K in keyof T]?: (value: T[K]) => string | null;
};

class FormValidator<T extends Record<string, any>> {
	constructor(private rules: ValidationRules<Required<T>>) {}

	validate(data: Partial<T>): ValidationResult<T> {
		const errors: Partial<Record<keyof T, string>> = {};
		let isValid = true;

		for (const key in this.rules) {
			const rule = this.rules[key];
			const value = data[key];

			if (rule && value !== undefined) {
				const error = rule(value as T[typeof key]);
				if (error) {
					errors[key] = error;
					isValid = false;
				}
			}
		}

		return {
			isValid,
			errors,
			data,
		};
	}
}

// Usage
interface LoginForm {
	email: string;
	password: string;
}

const loginValidator = new FormValidator<LoginForm>({
	email: (value) => (!value.includes("@") ? "Invalid email" : null),
	password: (value) => (value.length < 6 ? "Password too short" : null),
});

const result = loginValidator.validate({
	email: "user@example.com",
	password: "secret",
});
```

`Partial` and `Required` are fundamental utility types that provide essential flexibility in TypeScript type definitions. They enable creating APIs and components that can handle both complete and incomplete data structures, making them indispensable for robust application development.
