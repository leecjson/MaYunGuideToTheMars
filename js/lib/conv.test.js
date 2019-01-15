/**
 * Copyright (c) 2018 leecjson
 */

'use strict';

const conv = require('./conv');

test('General Test', () => {
  expect(conv('')).toBe(0);
  expect(conv('I')).toBe(1);
  expect(conv('II')).toBe(2);
  expect(conv('III')).toBe(3);
  expect(conv('IV')).toBe(4);
  expect(conv('V')).toBe(5);
  expect(conv('VI')).toBe(6);
  expect(conv('VII')).toBe(7);
  expect(conv('VIII')).toBe(8);
  expect(conv('IX')).toBe(9);
  expect(conv('X')).toBe(10);
  expect(conv('XI')).toBe(11);

  expect(conv('LXVII')).toBe(67);
  expect(conv('DL')).toBe(550);
  expect(conv('DCCVII')).toBe(707);
  expect(conv('DCCCXC')).toBe(890);
  expect(conv('LXXXIV')).toBe(84);
  expect(conv('LVI')).toBe(56);
  expect(conv('LVIII')).toBe(58);
  expect(conv('MDCCC')).toBe(1800);
});

test('Exception Test', () => {
  // The symbols "I", "X", "C", and "M" can be repeated three times in succession, but no more.
  expect(conv.bind(undefined, 'IIII')).toThrowError();
  expect(conv.bind(undefined, 'XXXXXXXXIII')).toThrowError();
  expect(conv.bind(undefined, 'DXIIIII')).toThrowError();
  expect(conv.bind(undefined, 'CCCCC')).toThrowError();
  expect(conv.bind(undefined, 'MMMMMM')).toThrowError();
  expect(conv.bind(undefined, 'MCXXXXI')).toThrowError()
  expect(conv.bind(undefined, 'MCXXXIIII')).toThrowError();;

  // "D", "L", and "V" can never be repeated.
  expect(conv.bind(undefined, 'DD')).toThrowError();
  expect(conv.bind(undefined, 'LLLLL')).toThrowError();
  expect(conv.bind(undefined, 'VVV')).toThrowError();
  expect(conv.bind(undefined, 'DDCCCXC')).toThrowError();
  expect(conv.bind(undefined, 'LVVIII')).toThrowError();

  // "I" can be subtracted from "V" and "X" only.
  expect(conv.bind(undefined, 'DIL')).toThrowError();
  // "X" can be subtracted from "L" and "C" only.
  expect(conv.bind(undefined, 'XD')).toThrowError();
  // "C" can be subtracted from "D" and "M" only.
  expect(conv.bind(undefined, 'LC')).toThrowError();

  // "V", "L", and "D" can never be subtracted.
  expect(conv.bind(undefined, 'VX')).toThrowError();
  expect(conv.bind(undefined, 'VD')).toThrowError();
  expect(conv.bind(undefined, 'LDC')).toThrowError();
  expect(conv.bind(undefined, 'DM')).toThrowError();
});