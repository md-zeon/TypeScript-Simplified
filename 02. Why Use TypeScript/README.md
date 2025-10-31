# Why Use TypeScript?

TypeScript provides several advantages over plain JavaScript, primarily through static typing and enhanced developer tooling. Let's examine the benefits through code examples.

## Type Safety and Error Prevention

### JavaScript Example (script.js)

```javascript
// const button = document.createElement("button");

// button.addEventListener("click", (e) => {
//     console.log(e.target);
// });

// function handleClick(e) {
//     console.log(e.anyTarget); // undefined. Our code has a bug. But
// }
```

In the commented JavaScript code, there's a bug where `e.anyTarget` is used instead of `e.target`. JavaScript won't catch this error until runtime, potentially causing issues in production.

### TypeScript Example (script.ts)

```typescript
const button = document.createElement("button");

button.addEventListener("click", handleClick);

function handleClick(e: MouseEvent) {
	console.log(e.target);
}
```

In TypeScript:

- The parameter `e` is explicitly typed as `MouseEvent`
- TypeScript's compiler would catch the `e.anyTarget` error at compile-time
- IDEs provide better autocomplete and error highlighting

## Key Benefits

1. **Compile-time Error Detection**: Catch bugs before code runs
2. **Better IDE Support**: Enhanced autocomplete, refactoring, and navigation
3. **Improved Code Maintainability**: Types serve as documentation and prevent regressions
4. **Enhanced Refactoring**: Safe renaming and restructuring of code
5. **Better Team Collaboration**: Types make code intentions clearer

## Real-world Impact

TypeScript helps prevent common JavaScript bugs like:

- Typos in property names
- Incorrect function parameter usage
- Null/undefined reference errors
- Type mismatches in assignments

By catching these issues during development rather than at runtime, TypeScript significantly improves code quality and developer productivity.
