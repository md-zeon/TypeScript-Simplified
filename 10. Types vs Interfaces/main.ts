type Person = {
	name: string;
	age: number;
	isProgrammer?: boolean;
	friends: string[];
	address: {
		street: string;
		city: string;
	};
};

type Num = number; // Works: Type alias can represent primitive types

interface IPerson {
	name: string;
	age: number;
	isProgrammer?: boolean;
	friends: string[];
	address: {
		street: string;
		city: string;
	};
}

// interface INum  number; // Error: An interface can only extend an object type or intersection of object types with statically known members.
interface INum extends Number {} // Works: Extending the built-in Number object

const person: Person = {
	name: "Zeon",
	age: 23,
	friends: ["Riaz"],
	address: {
		street: "123 Main St",
		city: "Somewhere",
	},
};
