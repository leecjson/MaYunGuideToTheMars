/**
 * Copyright (c) 2018 leecjson
 */

'use strict';

const lexer = require('./lexer');

test('General Test', () => {
  let lex;
  lex = lexer('');
  expect(lex()).toBe(undefined);
  expect(lex()).toBe(undefined);
  expect(lex()).toBe(undefined);

  lex = lexer('fasfaw fvvvvv');
  expect(lex()).toMatchObject({ type: 'id', raw: 'fasfaw'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'fvvvvv'});
  expect(lex()).toBe(undefined);

  lex = lexer('087878 mm ab gg3 34');
  expect(lex()).toMatchObject({ type: 'number', value: 87878, raw: '087878'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'mm'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'ab'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'gg3'});
  expect(lex()).toMatchObject({ type: 'number', value: 34, raw: '34'});
  expect(lex()).toBe(undefined);

  lex = lexer('a b c d');
  expect(lex()).toMatchObject({ type: 'id', raw: 'a'});
  lex.backward();
  expect(lex()).toMatchObject({ type: 'id', raw: 'a'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'b'});
  lex.backward(2);
  expect(lex()).toMatchObject({ type: 'id', raw: 'a'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'b'});
  lex.backward(3); // limit to 0
  expect(lex()).toMatchObject({ type: 'id', raw: 'a'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'b'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'c'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'd'});
  expect(lex()).toBe(undefined);
  expect(lex()).toBe(undefined);
  expect(lex()).toBe(undefined);
  lex.backward();
  expect(lex()).toMatchObject({ type: 'id', raw: 'd'});

  lex = lexer(`
  
  asdasdv 222xxz 
  
  b bsssss2 ggg   77  Why r u 
  so 
  cute

  `);

  expect(lex()).toMatchObject({ type: 'id', raw: 'asdasdv'});
  expect(lex()).toMatchObject({ type: 'id', raw: '222xxz'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'b'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'bsssss2'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'ggg'});
  expect(lex()).toMatchObject({ type: 'number', value: 77, raw: '77'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'Why'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'r'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'u'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'so'});
  expect(lex()).toMatchObject({ type: 'id', raw: 'cute'});
  expect(lex()).toBe(undefined);
});

test('Exception Test', () => {
  let lex;
  lex = lexer('_232');
  expect(lex.bind()).toThrowError();
  lex = lexer('3422vb(())');
  expect(lex.bind()).toThrowError();
  lex = lexer('3535_d233');
  expect(lex.bind()).toThrowError();
  lex = lexer('___##@#@#');
  expect(lex.bind()).toThrowError();
  lex = lexer('vdsvdrr _52244z22_');
  expect(() => {lex(); lex();}).toThrowError();
  lex = lexer('vdsvdrr$      ');
  expect(() => lex()).toThrowError();
  lex = lexer('vdsvdrr 52244   T     _4');
  expect(() => {lex(); lex(); lex(); lex();}).toThrowError();
  lex = lexer('我爱你 天天向上 大吉大利今晚吃鸡'); // support english letters only -> for now
  expect(() => {lex(); lex(); lex();}).toThrowError();
});