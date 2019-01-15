/**
 * Copyright (c) 2018 leecjson
 */

'use strict';

const assert = require('assert');

function isLetter(ch) {
  // if (typeof ch == 'string') {
  //   switch (ch) {
  //     case 'a': case 'b': case 'c': case 'd': case 'e': case 'f':
  //     case 'g': case 'h': case 'i': case 'j': case 'k': case 'l':
  //     case 'm': case 'n': case 'o': case 'p': case 'q': case 'r':
  //     case 's': case 't': case 'u': case 'v': case 'w': case 'x':
  //     case 'y': case 'z': case 'A': case 'B': case 'C': case 'D': 
  //     case 'E': case 'F': case 'G': case 'H': case 'I': case 'J': 
  //     case 'K': case 'L': case 'M': case 'N': case 'O': case 'P': 
  //     case 'Q': case 'R': case 'S': case 'T': case 'U': case 'V': 
  //     case 'W': case 'X': case 'Y': case 'Z': return true;
  //   }
  // }
  // return false;
  return ((ch >= 65 && ch <= 90) || (ch >= 97 && ch <= 122))
}

function isDigital(ch) {
  // if (typeof ch == 'string') {
  //   switch (ch) {
  //     case '0': case '1': case '2':
  //     case '3': case '4': case '5':
  //     case '6': case '7': case '8':
  //     case '9': return true;
  //   }
  // }
  // return false;
  return (ch >= 48 && ch <= 57);
}

function token(type, raw, line, pos, endPos) {
  return {
    type, raw, line, pos, endPos,
  }
}

function yields(ctx) {
  while (true) {
    let ch = ctx.move();
    if (isLetter(ch)) {
      const codes = [ch];
      const start = ctx.cursor;
      while (true) {
        ch = ctx.peek();
        if (!isLetter(ch) && !isDigital(ch)) {
          if (ch == 0/*end*/ ||
            ch == 32/*blankspace*/ ||
            ch == 10/*\n*/ ||
            ch == 13/*\r - windows only*/) {
            break;
          } else {
            throw new SyntaxError(`invalid identity, should ends with "blankspace", line: ${ctx.line}, position ${ctx.cursor}`);
          }
        }
        ctx.move();
        codes.push(ch);
      }
      const buf = codes.reduce((str, code) =>
        str + String.fromCharCode(code), '');
      return (
        token('id', buf, ctx.line, start, ctx.cursor)
      );
    } else if (isDigital(ch)) {
      const codes = [ch];
      const start = ctx.cursor;
      let hasletter = false;
      while (true) {
        ch = ctx.peek();
        if (!isDigital(ch)) {
          if (ch == 0/*end*/ ||
            ch == 32/*blankspace*/ ||
            ch == 10/*\n*/ ||
            ch == 13/*\r - windows only*/) {
            break;
          } else if (isLetter(ch)) {
            hasletter = true;
          } else {
            throw new SyntaxError(`invalid number, should ends with 'blankspace', line: ${ctx.line}, position: ${ctx.cursor}`);
          }
        }
        ctx.move();
        codes.push(ch);
      }
      const buf = codes.reduce((str, code) =>
        str + String.fromCharCode(code), '');
      if (!hasletter) { // is a number
        let num;
        try {
          num = parseInt(buf, 10);
          if (!Number.isSafeInteger(num)) {
            throw new Error();
          }
        } catch (e) {
          throw new SyntaxError(`invalid number: ${buf}, line: ${ctx.line}, position: ${start}`);
        }
        const t = token('number', buf, ctx.line, start, ctx.cursor);
        t.value = num;
        return t;
      } else { // actually an identity
        return (
          token('id', buf, ctx.line, start, ctx.cursor)
        );
      }
    } else if (ch == 32/*blankspace*/ || ch == 13/*\r - windows only*/) {
      continue;
    } else if (ch == 10/*\n*/) {
      ctx.newline();
      continue;
    } else if (ch == 47/* / */) {
      const nextCh = ctx.peek();
      if (nextCh == 47) {
        ctx.move();
        for (;;) {
          ch = ctx.peek();
          if (ch == 10 || ch == 0) {
            break;
          }
          ctx.move()
        }
      } else {
        throw new SyntaxError(`invalid comment: '${String.fromCharCode(ch)}', line: ${ctx.line}, position: ${ctx.cursor}`);
      }
    } else if (ch == 63/*?*/ || ch == 123 /*{*/ || ch == 125 /*}*/) { // single symbol
      return token('symbol', String.fromCharCode(ch), ctx.line, ctx.cursor, ctx.cursor);
    } else if (ch == 0/*end*/) {
      break;
    } else {
      throw new SyntaxError(`symbol or character are not supported: '${String.fromCharCode(ch)}', line: ${ctx.line}, position: ${ctx.cursor}`);
    }
  }
}

function newline() {
  ++this.line;
  this.cursor = 0;
}

/**
 * Create a lexer
 */
exports = module.exports = text => {
  const ctx = {
    text,
    i: -1,
    cursor: 0,
    line: 1,
    newline,
  };
  ctx.peek = function (n = 1) {
    const x = ctx.i + n;
    return (
      x < text.length ? text.charCodeAt(x) : 0
    );
  };
  ctx.move = function (n = 1) {
    const x = ctx.i + n;
    if (x >= text.length) {
      return 0;
    }
    ctx.cursor += n;
    ctx.i = x;
    return text.charCodeAt(x);
  };
  // ctx.newline = function () {
  //   ++ctx.line
  //   ctx.cursor = 0;
  // };

  let history = [];
  let now = 0;
  const fn = () => {
    if (now >= 0 && now < history.length) {
      const t = history[now];
      ++now;
      return t;
    } else {
      const t = yields(ctx);
      if (typeof t == 'undefined') {
        return;
      }
      history.push(t);
      ++now;
      return t;
    }
  };
  fn.backward = (n = 1) => {
    assert(n > 0);
    const x = Math.max(now - n, 0);
    now = x;
    assert(x < history.length);
    return history[x];
  };
  // fn.prev = () => {
  //   const x = now - 2;
  //   if (x >= 0 && x < history.length) {
  //     return history[x];
  //   }
  // };
  // fn.historylen = () => history.length;
  return fn;
};