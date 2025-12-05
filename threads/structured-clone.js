const v8 = require("v8");

// Value can be anything that can be passed to JSON.parse, plus more
function structuredClone(value) {
  const buffer = v8.serialize(value);
  return v8.deserialize(buffer);
}

const obj = {
  // func: () => {}, NOT SUPPORTED
  name: "Joe",
  more: {
    items: ["surfing", "skating"],
    test: {
      foo: "bar",
    },
  },
  created: new Date(),
};

// Structured clone
const clonedObj = structuredClone(obj);
clonedObj.name = "Dylan";
clonedObj.more.test.foo = "something else";

// Contrast structuredClone with this:
// anotherObj = obj;
// anotherObj.name = "Dylan";
// anotherObj.more.test.foo = "something else";

console.log("Original Object:", obj);
console.log("Cloned Object:", clonedObj);
