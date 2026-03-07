const { create, all } = require('mathjs');
const math = create(all);

function flattenArgs(args) {
    let result = [];
    for (const arg of args) {
        if (arg && arg.toArray) { // mathjs Matrix
            result = result.concat(flattenArgs(arg.toArray()));
        } else if (Array.isArray(arg)) {
            result = result.concat(flattenArgs(arg));
        } else {
            result.push(arg);
        }
    }
    return result;
}

math.import({
    mymax: (...args) => {
        const flat = flattenArgs(args).map(Number).filter(n => !isNaN(n));
        return flat.length ? Math.max(...flat) : 0;
    }
});

console.log(math.evaluate('mymax([10,20], 5)'));
