# Pick and Omit Utility Types in TypeScript

`Pick` and `Omit` are fundamental utility types in TypeScript that allow you to create new types by selecting or excluding specific properties from existing types. These utilities are essential for creating flexible, reusable type definitions and are commonly used in API design, data transformation, and component prop management.

## Pick Utility Type

### Basic Pick Usage

```typescript
interface User {
	id: number;
	name: string;
	email: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
}

// Create a type with only specific properties
type UserPreview = Pick<User, "id" | "name" | "email">;

const userPreview: UserPreview = {
	id: 1,
	name: "Alice",
	email: "alice@example.com",
	// password, createdAt, updatedAt are not included
};
```

### Pick with Single Property

```typescript
type UserId = Pick<User, "id">;
// Equivalent to: { id: number; }

type UserName = Pick<User, "name">;
// Equivalent to: { name: string; }
```

### Pick in Function Parameters

```typescript
function updateUser(
	id: number,
	updates: Pick<User, "name" | "email">,
): Promise<User> {
	// Only allow updating name and email
	return apiCall(`/users/${id}`, "PATCH", updates);
}

// Usage
await updateUser(1, {
	name: "Alice Smith",
	email: "alice.smith@example.com",
	// Cannot update password, createdAt, or updatedAt
});
```

## Omit Utility Type

### Basic Omit Usage

```typescript
interface Product {
	id: number;
	name: string;
	price: number;
	category: string;
	description: string;
	inStock: boolean;
	createdAt: Date;
}

// Create a type excluding specific properties
type ProductInput = Omit<Product, "id" | "createdAt">;

const newProduct: ProductInput = {
	name: "Laptop",
	price: 999.99,
	category: "Electronics",
	description: "High-performance laptop",
	inStock: true,
	// id and createdAt are excluded
};
```

### Omit with Single Property

```typescript
type ProductWithoutDescription = Omit<Product, "description">;

type ProductWithoutTimestamps = Omit<Product, "createdAt">;
```

### Omit in API Responses

```typescript
// For creating/updating - exclude read-only fields
type CreateProductRequest = Omit<Product, "id" | "createdAt">;

// For updating - allow all fields except id
type UpdateProductRequest = Omit<Product, "id">;

// For public display - exclude sensitive/internal fields
type PublicProduct = Omit<Product, "createdAt">;
```

## Advanced Pick and Omit Patterns

### Combining Pick and Omit

```typescript
// Create a base type
type BaseEntity = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	version: number;
};

// Create variations
type CreateEntityInput = Omit<
	BaseEntity,
	"id" | "createdAt" | "updatedAt" | "version"
>;
type UpdateEntityInput = Omit<BaseEntity, "id" | "createdAt" | "version">;
type EntityResponse = Pick<BaseEntity, "id" | "createdAt" | "updatedAt"> &
	Record<string, any>;
```

### Pick/Omit with Generic Constraints

```typescript
function createSelector<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
	const result = {} as Pick<T, K>;
	keys.forEach((key) => {
		if (key in obj) {
			result[key] = obj[key];
		}
	});
	return result;
}

function excludeKeys<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
	const result = { ...obj };
	keys.forEach((key) => {
		delete result[key];
	});
	return result as Omit<T, K>;
}

interface Person {
	name: string;
	age: number;
	email: string;
	password: string;
}

const person: Person = {
	name: "Alice",
	age: 30,
	email: "alice@example.com",
	password: "secret123",
};

const publicInfo = createSelector(person, ["name", "age", "email"]);
const withoutPassword = excludeKeys(person, ["password"]);
```

### Pick/Omit with Union Types

```typescript
type EntityFields = "id" | "name" | "email" | "createdAt" | "updatedAt";

type User = Pick<
	Record<EntityFields, any>,
	"id" | "name" | "email" | "createdAt" | "updatedAt"
>;
type Post = Pick<
	Record<EntityFields, any>,
	"id" | "name" | "createdAt" | "updatedAt"
>;

type UserInput = Omit<User, "id" | "createdAt" | "updatedAt">;
type PostInput = Omit<Post, "id" | "createdAt" | "updatedAt">;
```

## Real-World Examples

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
	lastLoginAt: Date | null;
	isActive: boolean;
}

// Public user data (what clients can see)
type PublicUser = Pick<
	DatabaseUser,
	"id" | "name" | "email" | "createdAt" | "lastLoginAt"
>;

// User creation input
type CreateUserInput = Pick<DatabaseUser, "name" | "email" | "password"> & {
	confirmPassword: string;
};

// User update input
type UpdateUserInput = Partial<
	Pick<DatabaseUser, "name" | "email" | "isActive">
>;

// Admin user data (includes sensitive fields)
type AdminUser = Omit<DatabaseUser, "password">;

// User login input
type LoginInput = Pick<DatabaseUser, "email" | "password">;
```

### React Component Props

```typescript
interface BaseButtonProps {
	children: React.ReactNode;
	onClick: () => void;
	disabled?: boolean;
	className?: string;
	size?: "sm" | "md" | "lg";
	variant?: "primary" | "secondary" | "danger";
}

// Primary button - only allows primary variant
type PrimaryButtonProps = Omit<BaseButtonProps, "variant"> & {
	variant?: "primary";
};

// Icon button - adds icon prop, removes children
type IconButtonProps = Omit<BaseButtonProps, "children"> & {
	icon: string;
	"aria-label": string;
};

// Link button - replaces onClick with href
type LinkButtonProps = Omit<BaseButtonProps, "onClick"> & {
	href: string;
	target?: "_blank" | "_self";
};
```

### Form Handling

```typescript
interface ContactForm {
	name: string;
	email: string;
	message: string;
	phone?: string;
	newsletter: boolean;
	privacyPolicy: boolean;
}

// Form data (what gets submitted)
type ContactFormData = Omit<ContactForm, "privacyPolicy">;

// Form validation errors
type ContactFormErrors = Partial<Record<keyof ContactFormData, string>>;

// Form field props
type FormFieldProps<T extends keyof ContactFormData> = {
	name: T;
	value: ContactFormData[T];
	error?: string;
	onChange: (value: ContactFormData[T]) => void;
};
```

### Database Operations

```typescript
interface Todo {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
}

// Create todo input
type CreateTodoInput = Pick<Todo, "title" | "description">;

// Update todo input
type UpdateTodoInput = Partial<
	Pick<Todo, "title" | "description" | "completed">
>;

// Todo response (exclude userId for security)
type TodoResponse = Omit<Todo, "userId">;

// Todo list item (minimal info for lists)
type TodoListItem = Pick<Todo, "id" | "title" | "completed" | "createdAt">;
```

## Utility Types Built on Pick and Omit

### Extract and Exclude

```typescript
// Extract properties of a certain type
type ExtractStringProperties<T> = Pick<
	T,
	{
		[K in keyof T]: T[K] extends string ? K : never;
	}[keyof T]
>;

// Exclude properties of a certain type
type ExcludeFunctionProperties<T> = Omit<
	T,
	{
		[K in keyof T]: T[K] extends Function ? K : never;
	}[keyof T]
>;

interface Example {
	name: string;
	age: number;
	greet: () => void;
	score: number;
}

type StringProps = ExtractStringProperties<Example>; // { name: string; }
type NonFunctionProps = ExcludeFunctionProperties<Example>; // { name: string; age: number; score: number; }
```

### Required and Partial Combinations

```typescript
interface FlexibleForm {
	name?: string;
	email?: string;
	age?: number;
	phone?: string;
}

// Make some fields required for registration
type RegistrationForm = Pick<FlexibleForm, "name" | "email"> &
	Partial<Pick<FlexibleForm, "age" | "phone">>;

// Make all fields required except phone
type FullForm = Omit<FlexibleForm, "phone"> &
	Required<Pick<FlexibleForm, "phone">>;
```

## Advanced Patterns

### Dynamic Pick/Omit with Template Literals

```typescript
type EventNames = "click" | "hover" | "focus" | "blur";

type EventHandlers<T extends EventNames> = {
	[K in T as `on${Capitalize<K>}`]: () => void;
};

// Result: { onClick: () => void; onHover: () => void; onFocus: () => void; onBlur: () => void; }
type ClickHandlers = EventHandlers<"click" | "hover">;
```

### Pick/Omit with Discriminated Unions

```typescript
interface BaseAction {
	type: string;
	payload?: any;
}

interface LoginAction extends BaseAction {
	type: "LOGIN";
	payload: { username: string; password: string };
}

interface LogoutAction extends BaseAction {
	type: "LOGOUT";
}

interface UpdateProfileAction extends BaseAction {
	type: "UPDATE_PROFILE";
	payload: { name?: string; email?: string };
}

type Action = LoginAction | LogoutAction | UpdateProfileAction;

// Extract payload types
type ActionPayloads = {
	[K in Action as K["type"]]: K extends { payload: infer P } ? P : undefined;
};

// Result: { LOGIN: { username: string; password: string }; LOGOUT: undefined; UPDATE_PROFILE: { name?: string; email?: string } }
```

### Conditional Pick/Omit

```typescript
type PickOptional<T> = Pick<
	T,
	{
		[K in keyof T]: T[K] extends undefined
			? never
			: T[K] extends Required<T>[K]
			? never
			: K;
	}[keyof T]
>;

type PickRequired<T> = Pick<
	T,
	{
		[K in keyof T]: T[K] extends undefined
			? never
			: T[K] extends Required<T>[K]
			? K
			: never;
	}[keyof T]
>;

interface ExampleForm {
	name: string;
	email?: string;
	age?: number;
	phone: string;
}

type OptionalFields = PickOptional<ExampleForm>; // { email?: string; age?: number; }
type RequiredFields = PickRequired<ExampleForm>; // { name: string; phone: string; }
```

## Best Practices

### When to Use Pick

1. **API Responses**: Select only the fields clients should see
2. **Form Inputs**: Define exactly which fields can be updated
3. **Component Props**: Limit props to only what's needed
4. **Database Queries**: Select specific columns/fields
5. **Type Safety**: Ensure functions only access intended properties

### When to Use Omit

1. **Input Types**: Exclude read-only or auto-generated fields
2. **Security**: Remove sensitive fields from responses
3. **API Contracts**: Define what clients shouldn't send
4. **Inheritance**: Remove unwanted properties from base types
5. **Data Transformation**: Exclude fields during mapping

### Naming Conventions

```typescript
// Good: Descriptive names
type UserProfile = Pick<User, "name" | "email" | "avatar">;
type CreateUserRequest = Omit<User, "id" | "createdAt" | "updatedAt">;
type PublicUserData = Omit<User, "password" | "resetToken">;

// Avoid: Generic names
type UserPick = Pick<User, "name" | "email">; // Less descriptive
type UserOmit = Omit<User, "password">; // Less descriptive
```

### Performance Considerations

```typescript
// Pick/Omit are compile-time operations
// They don't affect runtime performance
// The resulting types are equivalent to manually defined interfaces

// This:
type UserPreview = Pick<User, "name" | "email">;

// Is equivalent to:
interface UserPreview {
	name: string;
	email: string;
}
```

### Combining with Other Utility Types

```typescript
// Create flexible update types
type PartialUpdate<T> = Partial<Pick<T, keyof T>>;

// Create strict create types
type StrictCreate<T> = Omit<Required<T>, "id" | "createdAt" | "updatedAt">;

// Create response types
type ApiResponse<T> = Pick<T, Exclude<keyof T, "password" | "internalId">>;
```

## Common Patterns

### CRUD Operations

```typescript
interface Entity {
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	version: number;
	deletedAt?: Date;
}

// Create
type CreateInput<T extends Entity> = Omit<
	T,
	"id" | "createdAt" | "updatedAt" | "version"
>;

// Read
type EntityResponse<T extends Entity> = Pick<T, Exclude<keyof T, "deletedAt">>;

// Update
type UpdateInput<T extends Entity> = Partial<Pick<T, "name">>;

// Delete (soft delete)
type DeleteInput = Pick<Entity, "id">;
```

### API Versioning

```typescript
interface APIV1User {
	id: number;
	name: string;
	email: string;
	phone?: string;
}

interface APIV2User extends APIV1User {
	avatar?: string;
	preferences: {
		theme: "light" | "dark";
		notifications: boolean;
	};
}

// V1 API responses
type V1UserResponse = Pick<APIV1User, "id" | "name" | "email">;

// V2 API responses
type V2UserResponse = Pick<APIV2User, "id" | "name" | "email" | "avatar">;

// Migration helpers
type V1ToV2Migration = Omit<APIV2User, "preferences"> & {
	preferences?: Partial<APIV2User["preferences"]>;
};
```

### Form State Management

```typescript
interface ComplexForm {
	// Basic info
	name: string;
	email: string;
	age: number;

	// Preferences
	theme: "light" | "dark";
	notifications: boolean;
	marketingEmails: boolean;

	// Address
	street: string;
	city: string;
	country: string;
	postalCode: string;

	// Metadata
	createdAt: Date;
	updatedAt: Date;
	submittedAt?: Date;
}

// Step-by-step form types
type BasicInfoStep = Pick<ComplexForm, "name" | "email" | "age">;
type PreferencesStep = Pick<
	ComplexForm,
	"theme" | "notifications" | "marketingEmails"
>;
type AddressStep = Pick<
	ComplexForm,
	"street" | "city" | "country" | "postalCode"
>;

// Form submission (exclude metadata)
type FormSubmission = Omit<
	ComplexForm,
	"createdAt" | "updatedAt" | "submittedAt"
>;

// Form validation errors
type FormErrors = Partial<Record<keyof FormSubmission, string>>;
```

`Pick` and `Omit` are indispensable utility types that enable precise type composition and decomposition. They form the foundation for creating maintainable, type-safe APIs and components by allowing you to express exactly which properties should be included or excluded from your types.
