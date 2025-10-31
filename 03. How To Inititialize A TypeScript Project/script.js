var num1 = 1;
var num2 = 3;
function sum(a, b) {
    return a + b;
}
// sum(num1); // Error: Expected 2 arguments, but got 1.
console.log("Sum:", sum(num1, num2));
// use tsc --init to create a tsconfig.json file
// use tsc to compile the TypeScript file to JavaScript
// use node to run the compiled JavaScript file
// use tsc --watch to automatically compile on file changes
// use npx tsc to run the TypeScript compiler without installing it globally
// use npx tsc --init to create a tsconfig.json file without installing TypeScript globally
// use npx tsc <filename>.ts to compile a specific TypeScript file without installing TypeScript globally
// use npx tsc --watch to automatically compile on file changes without installing TypeScript globally
// use npx tsx <filename>.ts --noEmitOnError to run TypeScript files directly without emitting JavaScript files
