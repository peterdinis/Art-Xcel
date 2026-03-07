import { create, all, Matrix } from "mathjs";

const math = create(all);

function flattenArgs(args: unknown[]): number[] {
    let result: number[] = [];
    for (const arg of args) {
        if (arg && typeof arg === "object" && "toArray" in arg) {
            // mathjs Matrix
            result = result.concat(flattenArgs((arg as Matrix).toArray() as unknown[]));
        } else if (Array.isArray(arg)) {
            result = result.concat(flattenArgs(arg));
        } else {
            result.push(arg as number);
        }
    }
    return result;
}

math.import({
    mymax: (...args: unknown[]): number => {
        const flat = flattenArgs(args).map(Number).filter((n) => !isNaN(n));
        return flat.length ? Math.max(...flat) : 0;
    },
});

console.log(math.evaluate("mymax([10,20], 5)"));