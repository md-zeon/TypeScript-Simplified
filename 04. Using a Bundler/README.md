# Using a Bundler

This section demonstrates how to use a bundler (Vite) with TypeScript to create a modern web application development setup.

## What is a Bundler?

A bundler is a tool that takes multiple JavaScript/TypeScript files and their dependencies, and bundles them into a single (or a few) optimized files that can be served to the browser. Modern bundlers also provide:

- Development server with hot module replacement
- Code splitting
- Asset optimization
- Plugin ecosystem

## Project Setup

This project uses **Vite** as the bundler, which is fast and provides excellent TypeScript support out of the box.

### package.json

```json
{
	"name": "04--using-a-bundler",
	"private": true,
	"version": "0.0.0",
	"type": "module",
	"scripts": {
		"dev": "vite",
		"build": "tsc && vite build",
		"preview": "vite preview"
	},
	"devDependencies": {
		"typescript": "~5.9.3",
		"vite": "^7.1.7"
	}
}
```

### Key Files

- **`index.html`**: The main HTML file that serves as the entry point
- **`src/main.ts`**: The main TypeScript entry file
- **`tsconfig.json`**: TypeScript configuration
- **`vite.config.js`**: Vite configuration (if present)

## Development Workflow

### Start Development Server

```bash
npm run dev
```

This starts the Vite development server with hot module replacement.

### Build for Production

```bash
npm run build
```

This compiles TypeScript and bundles the code for production.

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## Vite + TypeScript Benefits

1. **Fast Development**: Lightning-fast hot module replacement
2. **TypeScript Support**: Built-in TypeScript compilation and error checking
3. **Modern JavaScript**: Supports ES modules, modern syntax
4. **Plugin Ecosystem**: Extensive plugins for various frameworks
5. **Zero Configuration**: Works out of the box with sensible defaults

## File Structure

```
04. Using a Bundler/
├── index.html          # Main HTML file
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── src/
│   └── main.ts         # Main TypeScript entry point
├── public/             # Static assets
└── node_modules/       # Dependencies
```

## HTML Entry Point

The `index.html` file includes the TypeScript file as a module:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0" />
		<title>04--using-a-bundler</title>
	</head>
	<body>
		<div id="app"></div>
		<script
			type="module"
			src="/src/main.ts"></script>
	</body>
</html>
```

## TypeScript Entry Point

The `src/main.ts` file contains the application logic:

```typescript
console.log("Hi");
```

## Why Use a Bundler?

- **Module System**: Organize code into reusable modules
- **Development Experience**: Hot reloading, source maps, error overlays
- **Performance**: Code splitting, tree shaking, minification
- **Compatibility**: Transpile modern JavaScript for older browsers
- **Asset Handling**: Process CSS, images, fonts, etc.

Bundlers like Vite have largely replaced task runners like Gulp and Grunt for modern web development, providing a more integrated and efficient workflow.
