'use strict';

const createVM = require('./lib/vm');

/*

首先我先告诉你，这是一篇写在代码中的指引，看不懂代码的朋友，没关系，只要是中文通常都是此篇文章的一部分。

第三个问题，最终要解决的是输入一些文本，输出一些对应的文本。

比如下方的输入文本

glob is I
prok is V
pish is X
tegj is L
glob glob Silver is 34 Credits
glob prok Gold is 57800 Credits
pish pish Iron is 3910 Credits
how much is pish tegj glob glob ?
how many Credits is glob prok Silver ?
how many Credits is glob prok Gold ?
how many Credits is glob prok Iron ?
how much wood could a woodchuck chuck if a woodchuck could chuck wood ?

与输入文本对应的输出文本

pish tegj glob glob is 42
glob prok Silver is 68 Credits
glob prok Gold is 57800 Credits
glob prok Iron is 782 Credits
I have no idea what you are talking about

只要做到输入与输出对应，就算解决了这个问题，接下来我将解释输入文本中具体的含义。

介于我发出来有些人还是没太看懂要解决什么问题，我再通俗的解释一下，什么叫输入和对应输出？
这就像是你跟一个人工智能对话，你说话，然后人工智能来回答你，被输入的文本的每一行就是你说的每句话。
你能看到你的文本中有陈述句、疑问句等等。
当你说出陈述句时，人工智能是不会回答你的。
当你说出疑问句时，只要你给的信息足够多，人工智能就能回答你问的问题。

*/

test(`Merchant's Guide to the Galaxy Guide`, () => {
  const vm = createVM();

  /*
      glob is I 是什么意思？
      大家知道很常见的罗马数字吧，常见的 I V X， 比如 VI 对应的阿拉伯数字就是6。
      上面这个输入文本的意思是 把'glob'作为罗马数字'I'的别名使用。
      比如我将来写下两个罗马数字的组合 V glob 其实对应的就是 VI。
      glob is I  这个输入只是定义一个别名，它并没有对应的输出，所以输出应该是个空的。
  */
  expect(vm(`glob is I`)).toBe(``);


  /*
      glob glob Silver is 34 Credits 又是什么意思呢？
      根据上文意，我们知道'glob'是'I'的别名，所以 glob glob 实际上等于 I I 或者 II    （空格分开有什么特殊含义 后文将解释）。
      接下来这句话实际上就是： II Silver is 34 Credits
      如果你熟悉英文你应该很容易读懂上面是什么意思，就是说：'II'份的银 它的价格是34
      这个'银'我自己把它定义为'产品'，除了'银'还有黄金和铁。  金、银、铁，这三个产品是在运行之前就预设好的。
      为什么要有这句输入呢？ 它实际上是告诉了你34份'银'的市场价，通过市场价你可以自己算出单位银的价格。
      这句输入也没有相应的输出，也是空。
  */
  expect(vm(`glob glob Silver is 34 Credits`)).toBe(``);


  /*
      how much is pish tegj glob glob ?     这显然是一个疑问句
      它在问你什么呢？ 估计how much is后面的内容你就看不懂了，后面的内容其实就是一系列罗马数字别名组成的罗马数字组合。
      本质上这个问题就是在问你，这个罗马数字的组合对应阿拉伯数字是多少。
      pish tegj glob glob 把别名翻译成罗马数字的组合就是 X L I I  或者 XLII
      现在这个疑问句变成了 how much is XLII
      XLII   ->   10 50 1 1   ->   42
      这个疑问句有一个对应的回答作为输出内容， 只有回答对了才能判定需求完成。
  */
  vm('prok is V      pish is X    tegj is L');    // 我先定义一些别名变量，免得下面不能通过
  expect(vm(`how much is pish tegj glob glob ?`)).toBe('pish tegj glob glob is 42\n');


  /*
      how many Credits is glob prok Silver ?    这是另一个疑问句
      同样的，how many Credits is你是可以看懂的，后面的序列同样是罗马数字别名组成的罗马数字组合，但最后一位是一个'产品'的名字。
      glob prok 的对应罗马数字组合是 IV
      它在问：IV份'银'的价格是多少
      首先IV转成对应的阿拉伯数字就是4，意思表示4份银（单位无需关心）。
      你需要知道4份银的价格，那么你肯定还需要知道每份银的价格，也就是所谓的单位价格，还记得吗？上面的某个语句已经告诉过你单位价格了。
      知道单位价格以后乘就完事了：单位价格 * 商品数量 = 商品总价
      最后的结果是68就代表是正确的。
  */
  expect(vm(`how many Credits is glob prok Silver ?`)).toBe('glob prok Silver is 68 Credits\n');


  /*
      这个就非常简单了，题意要求要能处理未定义的语法，并输出一个： 我不知道你在说什么啊 兄弟。
      但是这输出部分跟原题要求有不同，算是我的增强改良，你能看到具体发生语法错误的文本行号，和字符位置。
      主要是为了方便你定位错误呀，假设这个文件有几万行输入，你怎么知道哪错了？ 那不是要找死个人？
  */
  expect(vm(`how much wood could a woodchuck chuck if a woodchuck could chuck wood ?`))
    .toBe(`SyntaxError: I have no idea what you are talking about. near to: how', line: 1, position: 1.${'\n'}`);


  /*
      接下来就是验证题目输入输出的过程了。好了 完美通过。
      值得注意的是，你会发现，我验证题目输入输出和上面做示例用的是同一个vm（虚拟机），也就意味着有共同的环境和命名空间，所以下面会自己覆盖上面的定义，不会产生错误。
  */
  expect(vm(`glob is I
prok is V
pish is X
tegj is L
glob glob Silver is 34 Credits
glob prok Gold is 57800 Credits
pish pish Iron is 3910 Credits
how much is pish tegj glob glob ?
how many Credits is glob prok Silver ?
how many Credits is glob prok Gold ?
how many Credits is glob prok Iron ?
how much wood could a woodchuck chuck if a woodchuck could chuck wood ?`))
  .toBe(
`pish tegj glob glob is 42
glob prok Silver is 68 Credits
glob prok Gold is 57800 Credits
glob prok Iron is 782 Credits
SyntaxError: I have no idea what you are talking about. near to: how', line: 12, position: 1.
`);
});



/*

那么现在你已经完全了解题意了，并且看到我给你展示了一些使用情况，和一个增强改良，上面的几行代码就是干这个事的。
接下来我主要给你展示，我到底做了多少增强改良。 

*/

test(`Merchant's Guide to the Galaxy Improvement`, () => {
  const vm = createVM();
  expect(vm(`

    // 你现在看到的这段叫注释，啥意思？ 这也是增强改良之一，就是在输入文本中可以添加一段话，作为注解用，不会被解释运行。
    // 注释只能是单行的（目前），两个斜杠之后的全是注释，除非换到一个新行。

    // 而且你为什么能看到这么多换行，还有这么多空格？这是因为我的解决方案是文法处理的，空格、换行是允许的，只要文意正确。
     


    pish is V      // 题意不是说要这样定义罗马数字别名吗？
    // 然而你还可以这样做
    123 is V           // 使用一个合法64位整数来定义，如果溢出怎么办？ 别担心，会报出相应的错误。
    V is V             // 使用罗马数字定义别名，很奇特吧
    I is V
    IV is I             // 还可以覆盖原意

    

    glob is I
    glob glob Silver is 34 Credits     // 题意通过此句式来说明一个市场价格
    // 然而你还可以这样做
    LXXXIV Silver is 34 Credits      // 直接写一个罗马数字，而不是用别名，但如果你曾把'LXXXIV'作为别名定义过，那它就是别名，否则直接是个数字组合。

    

    // 你一定想知道单位价格和别名在还没定义以前使用是什么结果对吧？  它会合理报错，要遵循变量先定义后使用的原则。



    how much is glob glob ?          // 通过疑问句询问罗马数字组合对应的阿拉伯数字
    // 然而你还可以这样做
    how much is LXXXIV ?              // 直接询问一个罗马数字组合是多少，而不是使用别名。同样的如果它被定义为别名那就是别名。
    how much is glob glob glob        // 不想写问号 ？  完全可以省略



    // 使用数字定义别名做一个好玩的情况，  当然了，写在同一行也是可以的，空格分开就行，只需要一个空格就行
    1 is I         5 is V          10 is X                50 is L            100 is C
    500 is D            1000 is M
    how much is 50 10 10 10 1 5  ?         // 现在你可以看到阿拉伯数字转罗马数字的具体情况，很有趣吧？ 实际上它是 LXXXIV



    // 另外你可能还会担心 你可能书写了一个错误的罗马数字组合（是存在错误可能的，具体参见罗马数字书写规则）。
    // 别担心，它统统会给你一个合理的报错，并告知你错误的原因，比如 "D", "L", and "V" can never be repeated.


    
    // 觉得产品数量不够？ 光有预设的金、银、铁觉得乐趣太少，想多一些？ 没问题，你自己来定义。
    def product Food        // 定义食物
    def product Shit { 7 }      // 定义屎，和它的初始单位价格，是你给出的7，别担心，少个括号多个括号都会合理报错。



    how many Credits is glob glob Shit ?    // 现在是最后一个疑问句
    // 你还可以这样做
    how many Credits is IV Shit ?               // 直接给罗马符号而不是别名，规则跟上面一样，问号也是可以省略的，我就不展示了


 
    // 另外所有的报错都会有它的合理性和相关性，并指引你修改错误。
    // 不过搞了这么多，依旧没什么卵用，人家压根不看这些，我这个仓库的代码是个错误示范，大家不要学我。

  `))
  //  下面这些输出就是我刚才为了给你演示写出的特定语法对应的那些输出。
  .toBe(
`glob glob is 2
LXXXIV is 84
glob glob glob is 3
50 10 10 10 1 5 is 84
glob glob Shit is 14 Credits
IV Shit is 7 Credits
`);
});