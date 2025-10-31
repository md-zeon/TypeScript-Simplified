let a: number = 4.7394;
console.log(a.toFixed(2)); // Outputs: 4.74

// a = "hello"; // Error: Type 'string' is not assignable to type 'number'

const b = 4; // TypeScript infers 'b' as number
console.log(b); // Outputs: 4

let c; // TypeScript infers 'c' as any
c = 5;
console.log(c); // Outputs: 5
c = "now I'm a string";
console.log(c); // Outputs: now I'm a string

let d = null; // TypeScript infers 'd' as any
d = undefined; // No error, 'd' is of type any

const e = undefined; // TypeScript infers 'e' as undefined
console.log(e); // Outputs: undefined
// e = 10; // Error: Type 'number' is not assignable to type 'undefined'
