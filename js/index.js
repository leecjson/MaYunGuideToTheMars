'use strict';

const createVM = require('./lib/vm');
const vm = createVM();

process.stdin.setEncoding('utf8');
process.stdin.on('data', input => {
  console.log(vm(input))
});