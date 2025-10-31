const a: number[] = [1, 2, 3, 4, 5];
const b: string[] = ["hello", "world"];
const c: (number | string)[] = [1, "two", 3, "four"];
const d: [number, string, boolean] = [42, "answer", true];

console.log("Array of numbers:", a);
console.log("Array of strings:", b);
console.log("Array of numbers and strings:", c);
console.log("Tuple of number, string, and boolean:", d);

const e: Array<number> = [10, 20, 30]; // Generic array type
console.log("Generic array of numbers:", e);
