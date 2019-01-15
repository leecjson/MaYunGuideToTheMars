/**
 * Copyright (c) 2018 leecjson
 */

'use strict';

const assert = require('assert');
const conv = require('./conv');
const lexer = require('./lexer');

/**
 * check the token is an identity or number
 * @param {*} t token
 */
function isIdentityOrNumber(t) {
  return typeof t != 'undefined' && (t.type == 'id' || t.type == 'number');
}

/**
 * check the token is an identity or not
 * @param {*} t token 
 */
function isIdentity(t) {
  return typeof t != 'undefined' && t.type == 'id';
}

/**
 * check the identity and compare to the specific id,
 * auto backward while match failded
 * @param {*} t token
 * @param {*} id compare to
 */
function tryMatchIdentity(ctx, id) {
  assert(typeof id == 'undefined' || typeof id == 'string');
  const t = ctx.lex();
  if (typeof t == 'undefined') { // no need to backward, reach to end
    if (typeof id == 'undefined') {
      return;
    } else {
      return false;
    }
  }
  if (typeof id != 'undefined') {
    if (t.type == 'id' && t.raw == id) {
      return true;
    } else {
      ctx.lex.backward();
      return false;
    }
  } else {
    if (t.type == 'id') {
      return t;
    } else {
      ctx.lex.backward();
      return;
    }
  }
}

function tryMatchNumber(ctx, number) {
  assert(typeof number == 'undefined' || Number.isSafeInteger(number));
  const t = ctx.lex();
  if (typeof t == 'undefined') { // no need to backward, reach to end
    if (typeof number == 'undefined') {
      return;
    } else {
      return false;
    }
  }
  if (typeof number != 'undefined') {
    if (t.type == 'number' && t.value == number) {
      return true;
    } else {
      ctx.lex.backward();
      return false;
    }
  } else {
    if (t.type == 'number') {
      return t;
    } else {
      ctx.lex.backward();
      return;
    }
  }
}

function tryMatchSymbol(ctx, symbol) {
  assert(typeof symbol == 'undefined' || typeof symbol == 'string');
  const t = ctx.lex();
  if (typeof t == 'undefined') { // no need to backward, reach to end
    if (typeof symbol == 'undefined') {
      return;
    } else {
      return false;
    }
  }
  if (typeof symbol != 'undefined') {
    if (t.type == 'symbol' && t.raw == symbol) {
      return true;
    } else {
      ctx.lex.backward();
      return false;
    }
  } else {
    if (t.type == 'symbol') {
      return t;
    } else {
      ctx.lex.backward();
      return;
    }
  }
}

function MatchNumber(ctx, number) {
  assert(typeof number == 'undefined' || Number.isSafeInteger(number));
  const t = ctx.lex();
  const expectThrow = (t, followed = false) => {
    throw new SyntaxError(
      'expect number' +
      (typeof number != 'undefined' ? ` '${number}'. ` : '. ') +
      `near to: '${t.raw}', line: ${t.line}, position: ${followed ? t.endPos : t.pos}.`)
  };
  if (typeof t == 'undefined') expectThrow(ctx.lex.backward(), true);
  if (t.type != 'number') expectThrow(t);
  if (typeof number != 'undefined') {
    if (t.value != number) {
      expectThrow(t);
    }
  } else {
    return t;
  }
}

function MatchSymbol(ctx, symbol) {
  assert(typeof symbol == 'undefined' || typeof symbol == 'string');
  const t = ctx.lex();
  const expectThrow = (t, followed = false) => {
    throw new SyntaxError(
      'expect symbol' +
      (typeof symbol != 'undefined' ? ` '${symbol}'. ` : '. ') +
      `near to: '${t.raw}', line: ${t.line}, position: ${followed ? t.endPos : t.pos}.`)
  };
  if (typeof t == 'undefined') expectThrow(ctx.lex.backward(), true);
  if (t.type != 'symbol') expectThrow(t);
  if (typeof symbol != 'undefined') {
    if (t.raw != symbol) {
      expectThrow(t);
    }
  } else {
    return t;
  }
}

/**
 * given 'id' is to compare with the token and has no return.
 * if 'id' are not given, return the token as identity.
 * @param {*} lex token
 * @param {*} id 
 */
function matchIdentity(ctx, id) {
  let t = ctx.lex();
  const expectThrow = (t, followed = false) => {
    const msg = 'expect identity' + (
      typeof id != 'undefined' ? ` '${id}'. ` : '. '
    );
    throw new SyntaxError(
      msg + `near to: '${t.raw}', line: ${t.line}, position: ${followed ? t.endPos : t.pos}.`)
  };
  if (typeof t == 'undefined') expectThrow(ctx.lex.backward(), true);
  if (t.type != 'id') expectThrow(t);
  if (typeof id != 'undefined') {
    if (t.raw != id) {
      expectThrow(t);
    }
  } else {
    return t;
  }
}

/**
 * act like matchIdentity.
 * 'id' can be a number
 * @param {*} lex token
 * @param {*} id 
 */
function matchIdentityOrNumber(ctx, id) {
  assert(typeof id == 'undefined' || typeof id == 'string' || Number.isSafeInteger(id));
  let t = ctx.lex();
  const expectThrow = (t, followed = false) => {
    throw new SyntaxError(
      'expect an identity or number' +
      (typeof id != 'undefined' ? ` '${id}'. ` : '. ') +
      `near to: '${t.raw}', line: ${t.line}, position: ${followed ? t.endPos : t.pos}.`)
  };
  if (typeof t == 'undefined') expectThrow(ctx.lex.backward(), true);
  if (typeof id == 'string') {
    if (t.type != 'id' || t.raw != id) {
      expectThrow(t);
    }
  } else if (Number.isSafeInteger(id)) {
    if (t.type != 'number' || t.value != id) {
      expectThrow(t);
    }
  } else { // undefined case
    if (t.type == 'id' || t.type == 'number') {
      return t;
    } else {
      expectThrow(t);
    }
  }
}

function tryMatchIdentityOrNumber(ctx, id) {
  assert(typeof id == 'undefined' || typeof id == 'string' || Number.isSafeInteger(id));
  let t = ctx.lex();
  if (typeof t == 'undefined') { // no need to backward, reach to end
    if (typeof id == 'undefined') {
      return;
    } else {
      return false;
    }
  }
  if (typeof id == 'string') {
    if (t.type == 'id' && t.raw == id) {
      return true;
    } else {
      ctx.lex.backward();
      return false;
    }
  } else if (Number.isSafeInteger(id)) {
    if (t.type == 'number' && t.value == id) {
      return true;
    } else {
      ctx.lex.backward();
      return false;
    }
  } else { // undefined case
    if (t.type == 'id') {
      return { token: t, v: t.raw }
    } else if (t.type == 'number') {
      return { token: t, v: t.value }
    } else {
      ctx.lex.backward();
      return;
    }
  }
}

function matchRomanNumeralsAlias(ctx) {
  let t = ctx.lex();
  const expectThrow = (t, followed = false) => {
    throw new SyntaxError(
      'expect a Roman Numerals alias. ' +
      `near to: '${t.raw}', line: ${t.line}, position: ${followed ? t.endPos : t.pos}.`)
  };
  if (typeof t == 'undefined') expectThrow(ctx.lex.backward(), true);

  let key;
  if (t.type == 'id') key = t.raw;
  else if (t.type == 'number') key = t.value;
  else expectThrow(t);

  const alias = ctx.env.romanNumeralsAliases[key];
  if (alias) {
    return { alias, token: t };
  } else {
    expectThrow(t);
  }
}

function tryMatchRomanNumeralsAlias(ctx) {
  let t = ctx.lex();
  if (typeof t == 'undefined') { // reach end, dont backward.
    return;
  }
  let key;
  if (t.type == 'id') {
    key = t.raw;
  } else if (t.type == 'number') {
    key = t.value;
  } else {
    ctx.lex.backward();
    return;
  }
  const alias = ctx.env.romanNumeralsAliases[key];
  if (alias) {
    return { alias, token: t };
  } else {
    ctx.lex.backward();
    return;
  }
}

function tryMatchSerialRomanNumeralsAliases(ctx) {
  let list = [];
  for (; ;) {
    const alias = tryMatchRomanNumeralsAlias(ctx);
    if (alias) {
      list.push(alias);
    } else {
      return list;
    }
  }
}

function matchProductName(ctx) {
  let t = ctx.lex();
  const expectThrow = (t, followed = false) => {
    throw new SyntaxError(
      'expect a Product name. ' +
      `near to: '${t.raw}', line: ${t.line}, position: ${followed ? t.endPos : t.pos}.`)
  };
  if (typeof t == 'undefined') expectThrow(ctx.lex.backward(), true);
  if (t.type != 'id') expectThrow(t);

  const product = ctx.env.products[t.raw];
  if (product) {
    return { product, token: t };
  } else {
    expectThrow(t);
  }
}

function tryMatchProductName(ctx) {
  let t = ctx.lex();
  do {
    if (typeof t == 'undefined') return; // reach end, dont backward.
    if (t.type != 'id') break;

    const product = ctx.env.products[t.raw];
    if (product) {
      return { product, token: t };
    }
  } 
  while (false);
  ctx.lex.backward();
}


/**
 * aliases to Roman Numerals
 * @param {*} ctx 
 * @param {token[]} items should not be empty
 * @returns {string}
 */
function aliasesToRomanNumerals(ctx, items) {
  assert(items.length > 0);
  let symbols = [];
  for (const item of items) {
    let symbol = ctx.env.romanNumeralsAliases[item.raw]
    if (typeof symbol == 'undefined') {
      throw new SyntaxError(`the token '${item.raw}' are not a roman numeral, line: ${item.line}, position: ${item.pos}.`);
    }
    symbols.push(symbol);
  }
  return symbols.join('');
}

/**
 * stmt -> pish is X
 * @param {*} ctx 
 */
function matchDeclaration(ctx) {
  const aliasMatcher = tryMatchIdentityOrNumber(ctx);
  if (!aliasMatcher) {
    return false;
  }
  if (!tryMatchIdentity(ctx, 'is')) {
    ctx.lex.backward();
    return false;
  }
  const rn = matchIdentity(ctx);
  const symbol = conv.RomanNumerals[rn.raw];
  if (!symbol) {
    throw new SyntaxError(`token are not valid roman numeral '${rn.raw}'. ` +
      `line: ${rn.line}, position: ${rn.pos}.`);
  }
  ctx.env.romanNumeralsAliases[aliasMatcher.token.raw] = rn.raw;
  return true;
}

/**
 * stmt -> {glob glob ... glob} Silver is 34 Credits
 * @param {*} ctx 
 */
function matchCreditsDeclaration(ctx) {
  let quantity, rnQuantity, rnAliasQuantity, quantityToken;
  let backnum;
  const rnAliases = tryMatchSerialRomanNumeralsAliases(ctx); // Roman Numerals Alias Declaration
  if (rnAliases.length == 0) {
    const rn = tryMatchIdentity(ctx); // Roman Numerals Declaration
    if (!rn) {
      const arabicNumerals = tryMatchNumber(ctx); // Arabic Numerals Declaration
      if (!arabicNumerals) {
        return false; // Not match at first token
      } else {
        quantity = arabicNumerals.value;
        quantityToken = arabicNumerals;
      }
    } else {
      rnQuantity = rn.raw;
      quantityToken = rn;
    }
    backnum = 1;
  } else {
    rnAliasQuantity = rnAliases;
    quantityToken = rnAliases[0].token;
    backnum = rnAliases.length;
  }

  let product, productToken;
  const productMatcher = tryMatchProductName(ctx); // Product name parse
  if (productMatcher) {
    product = productMatcher.product;
    productToken = productMatcher.token;
    ++backnum;
  } else {
    ctx.lex.backward(backnum);
    return false;
  }
  if (!tryMatchIdentity(ctx, 'is')) { // is keyword
    ctx.lex.backward(backnum);
    return false;
  }
  const creditsNum = MatchNumber(ctx);
  matchIdentity(ctx, 'Credits');
  if (!Number.isSafeInteger(quantity)) { // Handle different type of quantity
    if (typeof rnAliasQuantity != 'undefined' && rnAliasQuantity.length > 0) {
      assert(typeof rnQuantity == 'undefined');
      rnQuantity = aliasesToRomanNumerals(ctx, rnAliasQuantity.map(item => item.token));
    }
    assert(typeof rnQuantity == 'string');
    try {
      quantity = conv(rnQuantity);
    } catch (e) {
      throw new Error(`${e.message} near to: ${quantityToken.raw} line: ${quantityToken.line}, position: ${quantityToken.pos}.`)
    }
  }
  product.unitprice = creditsNum.value / quantity; // Credits number / product quantity
  return true;
}


/**
 * stmt -> how much is {pish tegj glob .... glob} ?
 * @param {*} ctx 
 */
function matchHowMuchIs(ctx) {
  if (!tryMatchIdentity(ctx, 'how')) return false;
  if (!tryMatchIdentity(ctx, 'much')) return ctx.lex.backward(1), false;
  if (!tryMatchIdentity(ctx, 'is')) return ctx.lex.backward(2), false;

  let quantity, rnQuantity, quantityToken;
  const rnAliases = tryMatchSerialRomanNumeralsAliases(ctx);
  if (rnAliases.length > 0) {
    quantityToken = rnAliases[0].token;
    rnQuantity = aliasesToRomanNumerals(ctx, rnAliases.map(item => item.token));
  } else { // can also be Roman numerals identity
    const rn = matchIdentity(ctx);
    quantityToken = rn;
    rnQuantity = rn.raw;
  }
  tryMatchSymbol(ctx, '?'); // Maybe ends with ?
  try {
    quantity = conv(rnQuantity);
  } catch (e) {
    throw new Error(`${e.message} near to: '${quantityToken.raw}', ` +
      `line: ${quantityToken.line}, position: ${quantityToken.pos}.`)
  }
  ctx.feedback(`${
    rnAliases.length > 0 ?
      rnAliases.map(item => item.token.raw).join(' ') : rnQuantity
  } is ${quantity}`);
  return true;
}

/**
 * stmt -> how many Credits is {glob ... prok} Gold ?
 * @param {*} ctx 
 */
function matchHowManyCredits(ctx) {
  if (!tryMatchIdentity(ctx, 'how')) return false;
  if (!tryMatchIdentity(ctx, 'many')) return ctx.lex.backward(1), false;
  if (!tryMatchIdentity(ctx, 'Credits')) return ctx.lex.backward(2), false;
  if (!tryMatchIdentity(ctx, 'is')) return ctx.lex.backward(3), false;

  let rnQuantity, quantityToken;
  const rnAliases = tryMatchSerialRomanNumeralsAliases(ctx);
  if (rnAliases.length > 0) {
    quantityToken = rnAliases[0].token;
  } else {
    // const t = ctx.lex.backward();
    // throw new SyntaxError('expect Quantity of Product. ' +
    //   `near to '${t.raw}', line: ${t.line}, position: ${t.endPos}.`);

    // can also be Roman numerals identity
    const rn = matchIdentity(ctx);
    quantityToken = rn;
    rnQuantity = rn.raw;
  }

  const productMatcher = matchProductName(ctx);
  tryMatchSymbol(ctx, '?'); // Maybe ends with ?
  if (typeof productMatcher.product.unitprice != 'number') {
    ctx.feedback(`I don't know the price of product '${productMatcher.token.raw}' yet! you can tell me.`);
    return true;
  }
  if (rnAliases.length > 0) {
    rnQuantity = aliasesToRomanNumerals(ctx, rnAliases.map(item => item.token));
  } else {
    assert(typeof rnQuantity == 'string');
  }
  let quantity;
  try {
    quantity = conv(rnQuantity);
  } catch (e) {
    throw new Error(`${e.message} near to: '${quantityToken.raw}', ` +
      `line: ${quantityToken.line}, position: ${quantityToken.pos}`)
  }
  const price = quantity * productMatcher.product.unitprice;
  ctx.feedback(`${
    rnAliases.length > 0 ?
      rnAliases.map(item => item.token.raw).join(' ') : rnQuantity
  } ${productMatcher.token.raw} is ${price} Credits`);
  return true;
}


/**
 * def product Silver {1}
 * it's default unit price is 1
 */
function matchProductDeclaration(ctx) {
  if (!tryMatchIdentity(ctx, 'def')) return false;
  if (!tryMatchIdentity(ctx, 'product')) return ctx.lex.backward(1), false;
  const productToken = tryMatchIdentity(ctx);
  if (!productToken) {
    ctx.lex.backward(2);
    return false;
  }
  if (tryMatchSymbol(ctx, '{')) {
    const unitpriceToken = MatchNumber(ctx);
    MatchSymbol(ctx, '}');
    ctx.env.products[productToken.raw] = {
      unitprice: unitpriceToken.value,
    };
  } else {
    ctx.env.products[productToken.raw] = {
      unitprice: 1,
    };
  }
  return true;
}


function match(ctx) {
  if (matchHowManyCredits(ctx)) return true;
  if (matchDeclaration(ctx)) return true;
  if (matchCreditsDeclaration(ctx)) return true;
  if (matchHowMuchIs(ctx)) return true;
  if (matchProductDeclaration(ctx)) return true;
  return false;
}

/**
 *  vm
 */
module.exports = () => {
  const env = {
    romanNumeralsAliases: {},
    products: {
      'Silver': {},
      'Gold': {},
      'Iron': {},
    },
  };
  const defaults = {};
  for (const rn in conv.RomanNumerals) {
    defaults[rn] = rn;
  }
  Object.setPrototypeOf(env.romanNumeralsAliases, defaults);
  return input => {
    assert(typeof input == 'string', 'invalid input!');
    if (input.length == 0) {
      return '';
    }
    let output = '';
    const ctx = {
      env, 
      feedback: msg => {
        output += msg + '\n';
      },
    };
    const lex = ctx.lex = lexer(input);
    try {
      while (true) {
        const t = lex();
        if (typeof t == 'undefined') {
          break;
        }
        lex.backward();
        if (!match(ctx)) {
          throw new SyntaxError(`I have no idea what you are talking about. ` +
            `near to: ${t.raw}', line: ${t.line}, position: ${t.pos}.`
          );
        }
      }
    } catch (e) {
      output += 'SyntaxError: ' + e.message + '\n';
    }
    return output;
  };
};