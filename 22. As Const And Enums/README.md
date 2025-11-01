# As Const Assertion and Enums in TypeScript

TypeScript provides powerful tools for creating immutable values and defining enumerated types. The `as const` assertion creates deeply immutable literal types, while enums offer a way to define named constants with associated values. Both features are essential for type-safe programming and creating robust applications.

## As Const Assertion

### Basic As Const Usage

```typescript
// Without as const
const colors = {
	red: "#FF0000",
	green: "#00FF00",
	blue: "#0000FF",
};

type ColorsType = typeof colors;
// { red: string; green: string; blue: string; }

// With as const
const colorsConst = {
	red: "#FF0000",
	green: "#00FF00",
	blue: "#0000FF",
} as const;

type ColorsConstType = typeof colorsConst;
// { readonly red: "#FF0000"; readonly green: "#00FF00"; readonly blue: "#0000FF"; }
```

### Array Literals with As Const

```typescript
// Regular array
const directions = ["north", "south", "east", "west"];
type DirectionsType = typeof directions; // string[]

// Const assertion on array
const directionsConst = ["north", "south", "east", "west"] as const;
type DirectionsConstType = typeof directionsConst; // readonly ["north", "south", "east", "west"]
```

### Deep Immutability

```typescript
const config = {
	database: {
		host: "localhost",
		port: 5432,
		credentials: {
			username: "admin",
			password: "secret",
		},
	},
	features: ["auth", "logging", "cache"] as const,
} as const;

type ConfigType = typeof config;
// Deeply readonly structure
```

## Enums in TypeScript

### Numeric Enums

```typescript
enum Direction {
	North, // 0
	South, // 1
	East, // 2
	West, // 3
}

console.log(Direction.North); // 0
console.log(Direction[0]); // "North"
```

### String Enums

```typescript
enum DirectionString {
	North = "NORTH",
	South = "SOUTH",
	East = "EAST",
	West = "WEST",
}

console.log(DirectionString.North); // "NORTH"
// DirectionString[0] would not work with string enums
```

### Heterogeneous Enums

```typescript
enum Mixed {
	No = 0,
	Yes = "YES",
	Maybe = 1,
}

console.log(Mixed.No); // 0
console.log(Mixed.Yes); // "YES"
console.log(Mixed.Maybe); // 1
```

### Computed and Constant Members

```typescript
enum FileAccess {
	// Constant members
	None,
	Read = 1 << 1,
	Write = 1 << 2,
	ReadWrite = Read | Write,
	// Computed member
	G = "123".length,
}
```

## As Const vs Enums

### When to Use As Const

```typescript
// For literal values that should be immutable
const API_ENDPOINTS = {
	users: "/api/users",
	posts: "/api/posts",
	comments: "/api/comments",
} as const;

type APIEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
// "/api/users" | "/api/posts" | "/api/comments"

// For configuration objects
const THEME = {
	colors: {
		primary: "#007bff",
		secondary: "#6c757d",
		danger: "#dc3545",
	},
	fontSize: {
		small: "12px",
		medium: "16px",
		large: "20px",
	},
} as const;
```

### When to Use Enums

```typescript
// For related constants with semantic meaning
enum UserRole {
	Admin = "ADMIN",
	User = "USER",
	Moderator = "MODERATOR",
}

// For status codes
enum HTTPStatus {
	OK = 200,
	Created = 201,
	BadRequest = 400,
	Unauthorized = 401,
	NotFound = 404,
}

// For bitwise operations
enum Permission {
	Read = 1,
	Write = 2,
	Execute = 4,
	ReadWrite = Read | Write,
	All = Read | Write | Execute,
}
```

## Advanced As Const Patterns

### Template Literal Types with As Const

```typescript
const routes = {
	home: "/",
	about: "/about",
	contact: "/contact",
	user: "/user/:id",
} as const;

type RouteKeys = keyof typeof routes;
type RouteValues = (typeof routes)[RouteKeys]; // "/" | "/about" | "/contact" | "/user/:id"
```

### Function Return Types with As Const

```typescript
function createAction(type: string, payload?: any) {
	return {
		type,
		payload,
		timestamp: Date.now(),
	} as const;
}

type Action = ReturnType<typeof createAction>;
// { readonly type: string; readonly payload?: any; readonly timestamp: number; }

const loginAction = createAction("LOGIN", { username: "alice" });
// loginAction.type = "LOGOUT"; // Error: readonly property
```

### As Const with Tuples

```typescript
// Regular tuple
const point = [10, 20];
type PointType = typeof point; // number[]

// Const tuple
const pointConst = [10, 20] as const;
type PointConstType = typeof pointConst; // readonly [10, 20]

// Named tuple with const
const userTuple = ["Alice", 30, true] as const;
type UserTupleType = typeof userTuple; // readonly ["Alice", 30, true]
```

## Enum Best Practices

### Use String Enums for Better Debugging

```typescript
// Avoid numeric enums in production
enum Status {
	Pending = 0,
	Approved = 1,
	Rejected = 2,
}

// Prefer string enums
enum StatusString {
	Pending = "PENDING",
	Approved = "APPROVED",
	Rejected = "REJECTED",
}
```

### Avoid Enum Merging

```typescript
// This works but can be confusing
enum Color {
	Red,
	Green,
}

enum Color {
	Blue = 2,
}

// Better to define all at once
enum ColorComplete {
	Red,
	Green,
	Blue,
}
```

### Use Const Enums for Performance

```typescript
// Regular enum (emits both object and values)
enum RegularEnum {
	A,
	B,
	C,
}

// Const enum (only emits values, no object)
const enum ConstEnum {
	A,
	B,
	C,
}

// Usage
console.log(RegularEnum.A); // Works at runtime
console.log(ConstEnum.A); // Works, but ConstEnum object doesn't exist at runtime
```

## Practical Examples

### API Configuration with As Const

```typescript
const API_CONFIG = {
	baseURL: "https://api.example.com",
	endpoints: {
		users: "/users",
		posts: "/posts",
		comments: "/comments",
	} as const,
	methods: ["GET", "POST", "PUT", "DELETE"] as const,
	statusCodes: {
		ok: 200,
		created: 201,
		badRequest: 400,
	} as const,
} as const;

type Endpoint =
	(typeof API_CONFIG.endpoints)[keyof typeof API_CONFIG.endpoints];
type HTTPMethod = (typeof API_CONFIG.methods)[number];
type StatusCode =
	(typeof API_CONFIG.statusCodes)[keyof typeof API_CONFIG.statusCodes];
```

### State Management with Enums

```typescript
enum AppState {
	Loading = "LOADING",
	Ready = "READY",
	Error = "ERROR",
}

enum UserAction {
	Login = "LOGIN",
	Logout = "LOGOUT",
	UpdateProfile = "UPDATE_PROFILE",
}

interface AppAction {
	type: UserAction;
	payload?: any;
}

const reducer = (state: AppState, action: AppAction): AppState => {
	switch (action.type) {
		case UserAction.Login:
			return AppState.Ready;
		case UserAction.Logout:
			return AppState.Loading;
		default:
			return state;
	}
};
```

### Theme System with As Const

```typescript
const LIGHT_THEME = {
	name: "light",
	colors: {
		background: "#ffffff",
		foreground: "#000000",
		primary: "#007bff",
		secondary: "#6c757d",
	},
	spacing: {
		small: "8px",
		medium: "16px",
		large: "24px",
	},
} as const;

const DARK_THEME = {
	name: "dark",
	colors: {
		background: "#000000",
		foreground: "#ffffff",
		primary: "#0d6efd",
		secondary: "#6c757d",
	},
	spacing: LIGHT_THEME.spacing, // Reuse spacing
} as const;

type Theme = typeof LIGHT_THEME | typeof DARK_THEME;
type ThemeName = Theme["name"]; // "light" | "dark"
type ColorKey = keyof Theme["colors"]; // "background" | "foreground" | "primary" | "secondary"
```

### Form Validation with Enums

```typescript
enum ValidationError {
	Required = "REQUIRED",
	InvalidEmail = "INVALID_EMAIL",
	TooShort = "TOO_SHORT",
	TooLong = "TOO_LONG",
}

interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
}

function validateEmail(email: string): ValidationResult {
	const errors: ValidationError[] = [];

	if (!email) {
		errors.push(ValidationError.Required);
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errors.push(ValidationError.InvalidEmail);
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}
```

## As Const with Utility Types

### Creating Immutable Types

```typescript
type DeepReadonly<T> = {
	readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

const config = {
	api: {
		baseURL: "https://api.example.com",
		timeout: 5000,
	},
	features: {
		auth: true,
		cache: false,
	},
} as const;

// This achieves the same as DeepReadonly<typeof config>
type ImmutableConfig = typeof config;
```

### Extracting Union Types

```typescript
const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de"] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]; // "en" | "es" | "fr" | "de"

const HTTP_METHODS = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	DELETE: "DELETE",
} as const;

type HTTPMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS]; // "GET" | "POST" | "PUT" | "DELETE"
```

## Enum Limitations and Workarounds

### Reverse Mapping Issues

```typescript
enum Status {
	Active = "ACTIVE",
	Inactive = "INACTIVE",
}

// This doesn't work with string enums
// console.log(Status["ACTIVE"]); // undefined

// Workaround: create a reverse mapping
const StatusReverse = {
	ACTIVE: Status.Active,
	INACTIVE: Status.Inactive,
} as const;
```

### Enum as Types

```typescript
enum Size {
	Small = "S",
	Medium = "M",
	Large = "L",
}

// Use the enum as a type
function createShirt(size: Size): { size: Size } {
	return { size };
}

// Get union of all enum values
type SizeValue = `${Size}`; // "S" | "M" | "L"
```

## Performance Considerations

### Const Enums vs Regular Enums

```typescript
// Regular enum - creates object at runtime
enum Regular {
	A = 1,
	B = 2,
}

// Const enum - inlined at compile time
const enum Const {
	A = 1,
	B = 2,
}

// Generated JavaScript:
// Regular enum creates: {1: "A", 2: "B", A: 1, B: 2}
// Const enum inlines: console.log(1); instead of console.log(Const.A);
```

### As Const Bundle Size Impact

```typescript
// This creates larger type information
const LARGE_CONFIG = {
	// ... hundreds of properties
} as const;

// Consider using interfaces for large objects
interface LargeConfig {
	readonly [key: string]: string | number | boolean;
}
```

## Best Practices

### When to Use As Const

1. **For literal values**: When you need exact literal types
2. **For configuration**: API endpoints, themes, constants
3. **For immutable data**: When mutation should be prevented
4. **For tuple types**: When you need readonly tuples

### When to Use Enums

1. **For related constants**: Group related values together
2. **For type safety**: Better IntelliSense and error checking
3. **For serialization**: String enums are JSON-serializable
4. **For iteration**: Can iterate over enum values

### General Guidelines

1. **Prefer string enums over numeric enums** for better debugging
2. **Use const enums** for better performance in production
3. **Use as const** for literal type preservation
4. **Avoid enum merging** - define all values in one place
5. **Consider const assertions** for small, fixed sets of values
6. **Use enums** for larger sets or when you need iteration

## Migration from JavaScript

### From Objects to Enums

```typescript
// JavaScript object
const StatusOld = {
	PENDING: "pending",
	APPROVED: "approved",
	REJECTED: "rejected",
};

// TypeScript enum
enum StatusNew {
	Pending = "pending",
	Approved = "approved",
	Rejected = "rejected",
}
```

### From Constants to As Const

```typescript
// JavaScript constants
const API_BASE = "https://api.example.com";
const ENDPOINTS = {
	users: "/users",
	posts: "/posts",
};

// TypeScript with as const
const API_BASE = "https://api.example.com" as const;
const ENDPOINTS = {
	users: "/users",
	posts: "/posts",
} as const;
```

Both `as const` assertions and enums are powerful TypeScript features that help create type-safe, maintainable code. Choose `as const` for immutable literal values and enums for named constants with semantic meaning.
