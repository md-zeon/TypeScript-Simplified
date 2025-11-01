# Record Utility Type in TypeScript

The `Record` utility type in TypeScript is used to create an object type with specified keys and a uniform value type. It's essentially a shortcut for defining index signatures with known keys. `Record<K, T>` creates a type where all properties of type `K` have values of type `T`. This utility is particularly useful for creating dictionaries, maps, and configuration objects with type safety.

## Basic Record Usage

### Simple Record Type

```typescript
// Record<Keys, Values>
type StringRecord = Record<string, string>;
type NumberRecord = Record<string, number>;
type BooleanRecord = Record<string, boolean>;

// Usage
const colors: StringRecord = {
	red: "#FF0000",
	green: "#00FF00",
	blue: "#0000FF",
};

const scores: NumberRecord = {
	math: 95,
	science: 87,
	history: 92,
};
```

### Record with Union Keys

```typescript
type WeekDays = "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
type Weekend = "saturday" | "sunday";
type DayOfWeek = WeekDays | Weekend;

type WorkHours = Record<WeekDays, number>;
type WeekendActivities = Record<Weekend, string>;
type DailySchedule = Record<DayOfWeek, string>;

const workHours: WorkHours = {
	monday: 8,
	tuesday: 8,
	wednesday: 8,
	thursday: 8,
	friday: 8,
};

const weekendActivities: WeekendActivities = {
	saturday: "golf",
	sunday: "reading",
};
```

### Record with Complex Values

```typescript
interface User {
	id: number;
	name: string;
	email: string;
}

type UserMap = Record<string, User>;
type UserById = Record<number, User>;

const usersByUsername: UserMap = {
	alice: { id: 1, name: "Alice", email: "alice@example.com" },
	bob: { id: 2, name: "Bob", email: "bob@example.com" },
};

const usersById: UserById = {
	1: { id: 1, name: "Alice", email: "alice@example.com" },
	2: { id: 2, name: "Bob", email: "bob@example.com" },
};
```

## Record vs Index Signatures

### Key Differences

```typescript
// Index signature - allows any string keys
interface Dictionary {
	[key: string]: string;
}

// Record - provides better type safety with known keys
type ColorDictionary = Record<"red" | "green" | "blue", string>;

const colors1: Dictionary = {
	red: "#FF0000",
	green: "#00FF00",
	blue: "#0000FF",
	yellow: "#FFFF00", // Allowed - any string key
};

const colors2: ColorDictionary = {
	red: "#FF0000",
	green: "#00FF00",
	blue: "#0000FF",
	// yellow: "#FFFF00", // Error - not in the union type
};
```

### When to Use Record vs Index Signatures

```typescript
// Use Record when you know the exact keys
type HTTPStatusCodes = Record<200 | 404 | 500, string>;

// Use index signatures when keys are dynamic
interface APIData {
	[key: string]: any; // Dynamic API responses
}

// Record with index signature fallback
type KnownConfig = Record<"apiUrl" | "timeout", string> & Record<string, any>;
```

## Advanced Record Patterns

### Record with Function Values

```typescript
type EventHandlers = Record<string, (event: Event) => void>;

type SpecificHandlers = Record<
	"click" | "hover" | "focus",
	(event: Event) => void
>;

const handlers: SpecificHandlers = {
	click: (event) => console.log("Clicked"),
	hover: (event) => console.log("Hovered"),
	focus: (event) => console.log("Focused"),
};
```

### Record with Nested Structures

```typescript
type NestedRecord = Record<string, Record<string, number>>;

const matrix: NestedRecord = {
	row1: { col1: 1, col2: 2, col3: 3 },
	row2: { col1: 4, col2: 5, col3: 6 },
	row3: { col1: 7, col2: 8, col3: 9 },
};
```

### Record with Optional Keys

```typescript
type OptionalRecord = Partial<Record<string, number>>;

const scores: OptionalRecord = {
	math: 95,
	// science and history are optional
};
```

## Record with Template Literal Types

### Dynamic Key Generation

```typescript
type EventNames = "click" | "hover" | "focus" | "blur";

type EventHandlerNames = `on${Capitalize<EventNames>}`;
// "onClick" | "onHover" | "onFocus" | "onBlur"

type EventHandlers = Record<EventHandlerNames, () => void>;

const handlers: EventHandlers = {
	onClick: () => console.log("Clicked"),
	onHover: () => console.log("Hovered"),
	onFocus: () => console.log("Focused"),
	onBlur: () => console.log("Blurred"),
};
```

### API Endpoint Mapping

```typescript
type HTTPMethods = "GET" | "POST" | "PUT" | "DELETE";

type Endpoints = "users" | "posts" | "comments";

type APIEndpoints = Record<Endpoints, Record<HTTPMethods, string>>;

const apiEndpoints: APIEndpoints = {
	users: {
		GET: "/api/users",
		POST: "/api/users",
		PUT: "/api/users/:id",
		DELETE: "/api/users/:id",
	},
	posts: {
		GET: "/api/posts",
		POST: "/api/posts",
		PUT: "/api/posts/:id",
		DELETE: "/api/posts/:id",
	},
	comments: {
		GET: "/api/comments",
		POST: "/api/comments",
		PUT: "/api/comments/:id",
		DELETE: "/api/comments/:id",
	},
};
```

## Real-World Examples

### Configuration Objects

```typescript
type Environment = "development" | "staging" | "production";

type Config = Record<
	Environment,
	{
		apiUrl: string;
		timeout: number;
		features: Record<string, boolean>;
	}
>;

const appConfig: Config = {
	development: {
		apiUrl: "http://localhost:3000",
		timeout: 5000,
		features: {
			logging: true,
			cache: false,
			analytics: false,
		},
	},
	staging: {
		apiUrl: "https://staging-api.example.com",
		timeout: 10000,
		features: {
			logging: true,
			cache: true,
			analytics: false,
		},
	},
	production: {
		apiUrl: "https://api.example.com",
		timeout: 15000,
		features: {
			logging: false,
			cache: true,
			analytics: true,
		},
	},
};
```

### Translation/Localization

```typescript
type Languages = "en" | "es" | "fr" | "de";

type Translations = Record<Languages, Record<string, string>>;

const translations: Translations = {
	en: {
		welcome: "Welcome",
		goodbye: "Goodbye",
		save: "Save",
		cancel: "Cancel",
	},
	es: {
		welcome: "Bienvenido",
		goodbye: "Adiós",
		save: "Guardar",
		cancel: "Cancelar",
	},
	fr: {
		welcome: "Bienvenue",
		goodbye: "Au revoir",
		save: "Sauvegarder",
		cancel: "Annuler",
	},
	de: {
		welcome: "Willkommen",
		goodbye: "Auf Wiedersehen",
		save: "Speichern",
		cancel: "Abbrechen",
	},
};

function getTranslation(language: Languages, key: string): string {
	return translations[language][key] || translations.en[key] || key;
}
```

### State Management

```typescript
type ActionTypes = "SET_LOADING" | "SET_ERROR" | "SET_DATA";

type ActionPayloads = {
	SET_LOADING: boolean;
	SET_ERROR: string | null;
	SET_DATA: any[];
};

type Actions = Record<
	ActionTypes,
	(payload: ActionPayloads[ActionTypes]) => void
>;

interface State {
	loading: boolean;
	error: string | null;
	data: any[];
}

class Store {
	private state: State = {
		loading: false,
		error: null,
		data: [],
	};

	private actions: Actions = {
		SET_LOADING: (payload: boolean) => {
			this.state.loading = payload;
		},
		SET_ERROR: (payload: string | null) => {
			this.state.error = payload;
		},
		SET_DATA: (payload: any[]) => {
			this.state.data = payload;
		},
	};

	dispatch(
		actionType: ActionTypes,
		payload: ActionPayloads[ActionTypes],
	): void {
		this.actions[actionType](payload);
	}

	getState(): State {
		return { ...this.state };
	}
}
```

### Form Validation

```typescript
type FieldNames = "name" | "email" | "password" | "confirmPassword";

type ValidationRules = Record<FieldNames, (value: string) => string | null>;

type FormErrors = Partial<Record<FieldNames, string>>;

type FormData = Record<FieldNames, string>;

const validationRules: ValidationRules = {
	name: (value) =>
		value.length < 2 ? "Name must be at least 2 characters" : null,
	email: (value) => (!value.includes("@") ? "Invalid email address" : null),
	password: (value) =>
		value.length < 8 ? "Password must be at least 8 characters" : null,
	confirmPassword: (value, formData) => {
		const password = (formData as FormData)?.password;
		return value !== password ? "Passwords do not match" : null;
	},
};

function validateForm(formData: FormData): FormErrors {
	const errors: FormErrors = {};

	for (const field in validationRules) {
		const rule = validationRules[field as FieldNames];
		const error = rule(formData[field as FieldNames]);
		if (error) {
			errors[field as FieldNames] = error;
		}
	}

	return errors;
}
```

### HTTP Status Code Mapping

```typescript
type HTTPStatusCodes = 200 | 201 | 400 | 401 | 403 | 404 | 500;

type StatusMessages = Record<HTTPStatusCodes, string>;

const statusMessages: StatusMessages = {
	200: "OK",
	201: "Created",
	400: "Bad Request",
	401: "Unauthorized",
	403: "Forbidden",
	404: "Not Found",
	500: "Internal Server Error",
};

function getStatusMessage(status: HTTPStatusCodes): string {
	return statusMessages[status];
}
```

## Record with Generics

### Generic Record Types

```typescript
function createRecord<K extends string | number | symbol, V>(
	keys: K[],
	valueFactory: (key: K) => V,
): Record<K, V> {
	const record = {} as Record<K, V>;
	keys.forEach((key) => {
		record[key] = valueFactory(key);
	});
	return record;
}

const numberRecord = createRecord(["a", "b", "c"], (key) => key.charCodeAt(0));
// { a: 97, b: 98, c: 99 }

const stringRecord = createRecord([1, 2, 3], (key) => `Item ${key}`);
// { 1: "Item 1", 2: "Item 2", 3: "Item 3" }
```

### Record Transformation Functions

```typescript
function mapRecord<K extends string | number | symbol, V, U>(
	record: Record<K, V>,
	transformer: (value: V, key: K) => U,
): Record<K, U> {
	const result = {} as Record<K, U>;
	for (const key in record) {
		result[key] = transformer(record[key], key);
	}
	return result;
}

function filterRecord<K extends string | number | symbol, V>(
	record: Record<K, V>,
	predicate: (value: V, key: K) => boolean,
): Partial<Record<K, V>> {
	const result = {} as Partial<Record<K, V>>;
	for (const key in record) {
		if (predicate(record[key], key)) {
			result[key] = record[key];
		}
	}
	return result;
}

const scores = { math: 95, science: 87, history: 92, art: 78 };

const grades = mapRecord(scores, (score) =>
	score >= 90 ? "A" : score >= 80 ? "B" : "C",
);
// { math: "A", science: "B", history: "A", art: "C" }

const highScores = filterRecord(scores, (score) => score >= 90);
// { math: 95, history: 92 }
```

## Utility Types Built with Record

### Strict Record

```typescript
// Ensures all keys from a union are present
type StrictRecord<K extends string | number | symbol, V> = Record<K, V> & {
	[P in K]-?: V;
};

// Usage
type RGB = StrictRecord<"red" | "green" | "blue", number>;

const color: RGB = {
	red: 255,
	green: 0,
	blue: 0,
	// All keys must be present
};
```

### Record with Optional Values

```typescript
type OptionalRecord<K extends string | number | symbol, V> = Partial<
	Record<K, V>
>;

type Settings = OptionalRecord<"theme" | "language" | "notifications", any>;

const userSettings: Settings = {
	theme: "dark",
	// language and notifications are optional
};
```

### Record with Default Values

```typescript
type RecordWithDefaults<K extends string | number | symbol, V> = Record<
	K,
	V
> & {
	defaults: Record<K, V>;
};

function createConfigWithDefaults<K extends string, V>(
	config: Partial<Record<K, V>>,
	defaults: Record<K, V>,
): RecordWithDefaults<K, V> {
	return {
		...defaults,
		...config,
		defaults,
	} as RecordWithDefaults<K, V>;
}

const config = createConfigWithDefaults(
	{ timeout: 10000 },
	{ timeout: 5000, retries: 3, debug: false },
);
// { timeout: 10000, retries: 3, debug: false, defaults: { timeout: 5000, retries: 3, debug: false } }
```

## Best Practices

### When to Use Record

1. **Dictionary/Map-like structures**: When you need key-value pairs with known keys
2. **Configuration objects**: For settings with specific allowed keys
3. **Translation/localization**: For organizing text by language
4. **State management**: For action types and their payloads
5. **API responses**: When the structure has known keys

### When to Avoid Record

1. **Dynamic keys**: Use index signatures when keys are truly dynamic
2. **Complex nested structures**: Consider interfaces for deeply nested objects
3. **Performance-critical code**: Records are compile-time constructs

### Naming Conventions

```typescript
// Good: Descriptive names
type UserPermissions = Record<string, boolean>;
type TranslationDictionary = Record<string, string>;
type APIEndpoints = Record<string, string>;

// Avoid: Generic names
type Data = Record<string, any>; // Too generic
type Config = Record<string, unknown>; // Better: AppConfig
```

### Type Safety Considerations

```typescript
// ✅ Good: Specific key types
type UserRoles = Record<"admin" | "user" | "moderator", boolean>;

// ❌ Bad: Overly broad
type UserData = Record<string, any>; // Loses type safety

// ✅ Better: Specific value types
type UserData = Record<string, string | number | boolean>;
```

### Combining Record with Other Utility Types

```typescript
// Create flexible yet type-safe structures
type FlexibleConfig = Record<string, any> & {
	required: Record<"apiUrl" | "timeout", string | number>;
};

// Use with Pick/Omit for API types
type PublicUser = Pick<Record<string, any>, "id" | "name" | "email">;
type CreateUserInput = Omit<Record<string, any>, "id" | "createdAt"> & {
	password: string;
};
```

## Performance Considerations

### Record vs Interfaces

```typescript
// Record is a compile-time construct
type UserRecord = Record<"name" | "email" | "age", string>;

// Interface provides better IntelliSense and error messages
interface UserInterface {
	name: string;
	email: string;
	age: string;
}

// Both compile to the same JavaScript, but interfaces are often preferred
// for better developer experience with larger objects
```

### Record with Large Unions

```typescript
// Large unions can impact compilation performance
type ManyKeys = Record<1 | 2 | 3 | ... | 1000, string>; // Can be slow

// Consider alternatives for very large key sets
type LargeRecord = Record<string, string>; // Index signature
```

## Common Patterns

### Enum-like Records

```typescript
// Create enum-like behavior with Records
const UserStatus = {
	Active: "active",
	Inactive: "inactive",
	Pending: "pending",
} as const;

type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus];
// "active" | "inactive" | "pending"

const StatusConfig = {
	active: { color: "green", canEdit: true },
	inactive: { color: "red", canEdit: false },
	pending: { color: "yellow", canEdit: false },
} as const;

type StatusConfigType = Record<
	UserStatusType,
	{ color: string; canEdit: boolean }
>;
```

### Factory Functions with Record

```typescript
function createHandlers<T extends Record<string, (...args: any[]) => any>>(
	handlers: T,
): T {
	return handlers;
}

const apiHandlers = createHandlers({
	getUsers: async (limit?: number) => {
		// Implementation
		return [];
	},
	createUser: async (userData: any) => {
		// Implementation
		return {};
	},
	updateUser: async (id: string, updates: any) => {
		// Implementation
		return {};
	},
});

type APIHandlers = typeof apiHandlers;
```

### Validation Schemas

```typescript
type ValidationSchema = Record<
	string,
	{
		required?: boolean;
		type: "string" | "number" | "boolean";
		minLength?: number;
		maxLength?: number;
		pattern?: RegExp;
	}
>;

const userSchema: ValidationSchema = {
	name: {
		required: true,
		type: "string",
		minLength: 2,
		maxLength: 50,
	},
	email: {
		required: true,
		type: "string",
		pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	},
	age: {
		type: "number",
		min: 0,
		max: 150,
	},
};

function validateData(
	data: Record<string, any>,
	schema: ValidationSchema,
): Record<string, string[]> {
	const errors: Record<string, string[]> = {};

	for (const field in schema) {
		const rules = schema[field];
		const value = data[field];
		const fieldErrors: string[] = [];

		// Validation logic here
		if (
			rules.required &&
			(value === undefined || value === null || value === "")
		) {
			fieldErrors.push(`${field} is required`);
		}

		if (value !== undefined && typeof value !== rules.type) {
			fieldErrors.push(`${field} must be of type ${rules.type}`);
		}

		// Add more validation rules...

		if (fieldErrors.length > 0) {
			errors[field] = fieldErrors;
		}
	}

	return errors;
}
```

The `Record` utility type is a powerful tool for creating type-safe dictionaries and structured objects. It provides better type safety than index signatures while maintaining flexibility for dynamic key-value operations. Use Record when you need known keys with uniform value types, and combine it with other utility types for complex type transformations.
