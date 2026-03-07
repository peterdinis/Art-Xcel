import { evaluateFormula } from "./formula-evaluator";

const mockData = {
    "A1": { value: "10", formula: "" },
    "A2": { value: "20", formula: "" },
    "B1": { value: "5", formula: "" }
};

console.log("Testing MAX(A1:A2, B1)...");
const result = evaluateFormula("=MAX(A1:A2, B1)", mockData as any);
console.log("Result:", result);
