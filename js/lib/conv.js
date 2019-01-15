/**
 * Copyright (c) 2018 leecjson
 */

'use strict';

const assert = require('assert');

const RomanNumerals = {
  'I': {
    v: 1,
    repeat: true,
  },
  'V': {
    v: 5,
    repeat: false
  },
  'X': {
    v: 10,
    repeat: true
  },
  'L': {
    v: 50,
    repeat: false
  },
  'C': {
    v: 100,
    repeat: true
  },
  'D': {
    v: 500,
    repeat: false
  },
  'M': {
    v: 1000,
    repeat: true
  },
};

function subtract(x, y) {
  switch (y) {
    case RomanNumerals.I:
      if (x != RomanNumerals.V && x != RomanNumerals.X) {
        throw new SyntaxError(`"I" can be subtracted from "V" and "X" only.`);
      }
      break;
    case RomanNumerals.X:
      if (x != RomanNumerals.L && x != RomanNumerals.C) {
        throw new SyntaxError(`"X" can be subtracted from "L" and "C" only.`);
      }
      break
    case RomanNumerals.C:
      if (x != RomanNumerals.D && x != RomanNumerals.M) {
        throw new SyntaxError(`"C" can be subtracted from "D" and "M" only.`);
      }
      break
    case RomanNumerals.V:
    case RomanNumerals.L:
    case RomanNumerals.D:
      throw new SyntaxError(`"V", "L", and "D" can never be subtracted.`);
    case RomanNumerals.M:
      break;
    default:
      assert();
  }
  if (x.v > y.v) {
    return x.v - y.v;
  } else {
    throw new SyntaxError(`Only one small-value symbol may be subtracted from any large-value symbol.`);
  }
}

/**
 * Roman Numerals to Arabic Numerals
 * @param {string} src 
 */
exports = module.exports = src => {
  assert(typeof src == 'string', 'invalid input!');
  if (src.length == 0) {
    return 0;
  }

  let i = 0;
  const move = () => {
    if (i >= src.length) {
      return;
    }
    const ret = RomanNumerals[src.charAt(i++)];
    if (ret) {
      return ret;
    } else {
      throw new SyntaxError('invalid symbol!');
    }
  };
  
  /**      
   *  undefined
   *         ↓↓DCCCXC
   *         ↓↓↓↓↓↓↓↓
   *   fn -> xyzd↓↓↓↓
   *  +       ↓↓↓↓↓↓↓
   *    fn -> xyzd↓↓↓
   *   +       ↓↓↓↓↓↓
   *     fn -> xyzd↓↓
   *    +  .....  ↓↓↓
   *        fn -> xyzd
   *                 ↑
   *                 undefined
   */
  const fn = (x, y, z, d) => {
    if (x && x == y && y == z && z == d && d.repeat) {
      throw new SyntaxError(`The symbols "I", "X", "C", and "M" can be repeated three times in succession, but no more.`)
    }
    if ((x && x == y && !x.repeat) || (y && y == z && !y.repeat)) {
      throw new SyntaxError(`"D", "L", and "V" can never be repeated.`);
    }
    return d ? (
      z.v < d.v ? (subtract(d, z) + fn(z, d, move(), move())) :
        z.v + fn(y, z, d, move())) :
      (z ? z.v : 0);
  };
  
  return fn(
    undefined, undefined,
    move(), move());
};

exports.RomanNumerals = RomanNumerals;