/**
 * Copyright (c) 2018 leecjson
 */

'use strict';

const createVM = require('./vm');

test('General Test', () => {
  let ouput;
  const vm = createVM();
  expect(vm(``)).toBe(``);  // empty in empty out
  ouput = vm(`

    kkk is V
    green is I

  kkk Silver is 34 Credits 
   IV Gold is 556 Credits
  
  how many Credits      is   green   green kkk   Gold   ?            // this is for comment
  
   how many Credits      is   I I V Silver    ?  
    how many Credits      is   IIV Silver    
  IIV is M
      how many Credits      is   IIV Silver    ?
      
  how many Credits      is   I I V   Iron
  
  how much is IV  how much is IIV  how much is M
  `);

  expect(ouput).toBe(
`green green kkk Gold is 695 Credits
I I V Silver is 34 Credits
IIV Silver is 34 Credits
IIV Silver is 6800 Credits
I don't know the price of product 'Iron' yet! you can tell me.
IV is 4
IIV is 1000
M is 1000
`
  )
});


test(`stmt -> pish is X`, () => {
  let output;
  const vm = createVM();
  output = vm(
    `sss225 is V
  nOPP2 is I
       v is I
     V is V                 // alias will not override the others alias
    I is V V is V i is V       
    D is C
    1 is I 5 is V
    C is D 
    M is C
          KKK is M      vv is D
    100 is M
    500000000222200 is C    123 is D
    18691094417 is X
    `
  );
  expect(output).toBe('');

  output = vm(`
    how much is 500000000222200
    how much is 100
    how much is 100 100 100
    how much is M
  `);
  expect(output).toBe(
`500000000222200 is 100
100 is 1000
100 100 100 is 3000
M is 100
`)
});


test(`stmt -> pish is X  Exception Test`, () => {
  const vm = createVM();
  // overflow number
  expect(vm(`166666666666666666666666666 is V`)).toBe('SyntaxError: invalid number: 166666666666666666666666666, line: 1, position: 1\n');
  expect(vm(`__s is X`)).toBe(`SyntaxError: symbol or character are not supported: '_', line: 1, position: 1${'\n'}`);
  expect(vm(`ivvvv is IV`)).toBe(`SyntaxError: token are not valid roman numeral 'IV'. line: 1, position: 10.${'\n'}`);
  expect(vm(`ivvvv is $`)).toBe(`SyntaxError: symbol or character are not supported: '$', line: 1, position: 10${'\n'}`);
  expect(vm(`abc is`)).toBe(`SyntaxError: expect identity. near to: 'is', line: 1, position: 6.${'\n'}`);
  expect(vm(`is`)).toBe(`SyntaxError: I have no idea what you are talking about. near to: is', line: 1, position: 1.${'\n'}`);
});


test(`stmt -> {glob glob ... glob} Silver is 34 Credits`, () => {
  const vm = createVM();
  expect(vm(`
  def product Shit { 5 }    // define a new product and give an unitprice
  def product House             // omit the initial unitprice is acceptable, means initial unitprice is 1
     I V Silver is 3400 Credits
     I V Shit is 50000 Credits    // override product unitprice is fine

     IV Shit is 400 Credits     
     LXXXIV Gold is 5 Credits     // use Roman Numerals directly

     def product Car
     L X X X I V Car is 5 Credits    // default alias to Roman numerals

     1 is I
     5 is V
     10 is X
     50 is L
     100 is C
     500 is D
     1000 is M

     def product ApplePhone
     50 10 10 10 1 5 ApplePhone is 7777777 Credits     // same as   L X X X I V    or LXXXIV
     def product AppleWatch
     LXXXIV AppleWatch is 84 Credits

         // Questions:
         how many Credits is 1 Silver ?
         how many Credits is IV Shit ?
         how many Credits is 1 House ?
         how many Credits is X X X Car   // you can omit the ? symbol if you like
         how many Credits is 1 ApplePhone ?

         how many Credits is 1 AppleWatch      // should equals to 1
         how much is LXXXIV ?      // equlas 84
   `))
   .toBe(
`1 Silver is 850 Credits
IV Shit is 400 Credits
1 House is 1 Credits
X X X Car is 1.7857142857142856 Credits
1 ApplePhone is 92592.58333333333 Credits
1 AppleWatch is 1 Credits
LXXXIV is 84
`);
});




test(`stmt -> {glob glob ... glob} Silver is 34 Credits   Exception Test`, () => {
  const vm = createVM();
  expect(vm(`bb bb bb Silver is 55 Credits`))
    .toBe(`SyntaxError: I have no idea what you are talking about. near to: bb', line: 1, position: 1.${'\n'}`);

  expect(vm(`DXIIIII Silver is 888 Credits`))
    .toBe(`SyntaxError: The symbols "I", "X", "C", and "M" can be repeated three times in succession, but no more. near to: DXIIIII line: 1, position: 1.${'\n'}`);

  vm(`
    red is I      green is X    blue is D
  `);
  expect(vm(`blue green red red red red red Silver is 888 Credits`))
    .toBe(`SyntaxError: The symbols "I", "X", "C", and "M" can be repeated three times in succession, but no more. near to: blue line: 1, position: 1.${'\n'}`);

  expect(vm(`blue blue Silver is 888 Credits`))
    .toBe(`SyntaxError: "D", "L", and "V" can never be repeated. near to: blue line: 1, position: 1.${'\n'}`);

  expect(vm(`IV Silver is`))
    .toBe(`SyntaxError: expect number. near to: 'is', line: 1, position: 12.${'\n'}`);

  expect(vm(`IV Silver is 9999999999999999999999999999999`)) // number overflow
    .toBe(`SyntaxError: invalid number: 9999999999999999999999999999999, line: 1, position: 14${'\n'}`);

  expect(vm(`IV Silver is 77777777777`))
    .toBe(`SyntaxError: expect identity 'Credits'. near to: '77777777777', line: 1, position: 24.${'\n'}`);

  expect(vm(`IV Silver is 123 Credits___`))
    .toBe(`SyntaxError: invalid identity, should ends with "blankspace", line: 1, position 24${'\n'}`);
});



/**
 * 
 *  I have no time to write other cases very detailed.
 *    
 */

test(`stmt -> how many Credits is {glob ... prok} Gold ?`, () => {
  const vm = createVM();
  expect(vm(`
    def product Lufei { 5 }

    how many Credits is IV Lufei
    how many Credits is I V Lufei

    KKK is V
    hello is I

    how many Credits is hello hello KKK Lufei

  `))
  .toBe(
`IV Lufei is 20 Credits
I V Lufei is 20 Credits
hello hello KKK Lufei is 25 Credits
`);
});


test(`stmt -> how many Credits is {glob ... prok} Gold ?   Exception Test`, () => {
  const vm = createVM();
  vm(`def product Lufei { 5 }`)

  expect(vm(`how many Credits is __ Lufei`))
    .toBe(`SyntaxError: symbol or character are not supported: '_', line: 1, position: 21${'\n'}`);

  expect(vm(`how many `))
    .toBe(`SyntaxError: I have no idea what you are talking about. near to: how', line: 1, position: 1.${'\n'}`);

  expect(vm(`how much Credits is IV Lufei`))
    .toBe(`SyntaxError: I have no idea what you are talking about. near to: how', line: 1, position: 1.${'\n'}`);

  expect(vm(`how many Credites is IV Lufei ?`))
    .toBe(`SyntaxError: I have no idea what you are talking about. near to: how', line: 1, position: 1.${'\n'}`);

  expect(vm(`how many Credits is ?`))
    .toBe(`SyntaxError: expect identity. near to: '?', line: 1, position: 21.${'\n'}`);

  expect(vm(`how many Credits is IV?`))
    .toBe(`SyntaxError: invalid identity, should ends with "blankspace", line: 1, position 22${'\n'}`);

  expect(vm(`how many Credits is VVVVV Lufei ?`))
    .toBe(`SyntaxError: "D", "L", and "V" can never be repeated. near to: 'VVVVV', line: 1, position: 21${'\n'}`);

  expect(vm(`how many Credits is IV Car ?`))
    .toBe(`SyntaxError: expect a Product name. near to: 'Car', line: 1, position: 24.${'\n'}`);

  expect(vm(`how many Credits is M J K SS Lufei ?`))
    .toBe(`SyntaxError: expect a Product name. near to: 'J', line: 1, position: 23.${'\n'}`);
});



test(`stmt -> how much is {pish tegj glob .... glob} ?`, () => {
  const vm = createVM();
  expect(vm(`
    how much is IV
    how much is I V
    how much is MDCCC

    pish is D
    jick is M
    how much is M

    lee is C

    how much is jick jick pish lee lee lee
  `))
  .toBe(
`IV is 4
I V is 4
MDCCC is 1800
M is 1000
jick jick pish lee lee lee is 2800
`);
});