require('typescript-register');
var target = process.argv.slice(2)[0];
// splice the target away so args can be correctly parsed by typescript
process.argv.splice(2, 1);

if (target.indexOf('./') == -1) {
    target = './' + target;
}

require(target);