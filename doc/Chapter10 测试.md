### 第10章 测试

​		在使用Node进行实际的项目开发之前,我内心也曾十分忐忑。尽管 JavaScript,历史悠久,但相较成熟的后端语言而言,Node尚且算是新晋同学。甚至对于前端,因为各种各样的原因,JavaScript的测试都十分少。Node编写的在线产品,在成千上万用户面前能否具备良好的质量保证,我是心存疑问的。
​		从最早写出的代码让自己睡不着觉,无法精确定位bug到底位于一堆程序里的哪个位置,到后来很踏实地面对自己产出的代码,对自己代码的了解如手心纹路那么清晰明了。从面对问题时的被动到主动,测试在这个演变过程中起到了至关重要的作用。
​		**测试的意义**在于,在用户消费产出的代码之前,开发者首先消费它,**给予其重要的质量保证**。这里值得提醒的是, JavaScript开发者需要转变观念,正视自己的代码,对自己产出的代码负责。为自己的代码写测试用例则是一种行之有效的方法,它能够让开发者明确掌握到代码的行为和性能等。
​		测试包含**单元测试、性能测试、安全测试和功能测试**等几个方面,本章将从Node实践的角度来介绍单元测试和性能测试。

#### 10.1 单元测试

​		单元测试在软件项目中扮演着举足轻重的角色,是几种软件质量保证的方法中投入产出比最高的一种。尽管在过去的 JavaScript开发中,绝大多数人都忽视了这个环节,但今天Node的盛行让我们不得不重新审视这块领域。

##### 10.1.1单元测试的意义

​		最初接触单元测试时,很多开发者都很疑惑,自己写的代码,自己写测试,这件事的意义何在?有的团队则配备了专门的测试工程师帮助开发者测试代码。这里第一种对自己写的代码不在意的行为是开发者对自己测试自己代码心存侥幸,认为测试是一种形式,小算盘是既然是形式,那为何要去实践。如果强迫实践,那就随意写写,蒙混过关吧,这使得开发者不正视测试代码,进而不正视自己的代码。配备专门的测试工程师则让开发者对测试人员产生依赖,完全不关心自己代码的测试。

​		这里需要倡导的是,开发者应该吃自己的狗粮。项目成员共同开发出来的代码会构成项目的产品,开发者写出来的代码是开发者自己的产品。要保证产品的质量,就应该有相应的手段去验证。对于开发者而言,单元测试就是最基本的一种方式。如果开发者不自己测试代码,那必然要面对如下问题。

###### (1)测试工程师是否可依赖?

​		这里涉及的问题有两个层面。第一个层面是测试工程师是否熟悉Node领域,不了解一个领域而只凭借过往经验来对这个项目进行测试,有可能演变为敷衍的行为,这对质量保证的目标背道而驰。另一个层面是,如果存在人事变动等原因,可能并不一定覆盖到开发者的代码,从而使测试用例的维护成本变高。

###### (2)第三方代码是否可信赖?

​		对于Node开源社区而言(共有3万多模块),作为一个不知名的开发者,其产出的模块如果连单元测试都没有提供,使用者在挑选模块时,内心也会闪过多个“靠谱吗”的疑问。

###### (3)在产品迭代过程中,如何继续保证质量?

​		**单元测试的意义在于每个测试用例的覆盖都是一种可能的承诺**。如果API升级时,测试用例可以很好地检査是否向下兼容。对于各种可能的输人,一旦测试覆盖,都能明确它的输出。代码改动后,可以通过测试结果判断代码的改动是否影响已确定的结果。

​		对于上述问题,如果你的答案是不关心,那么恭喜你,你的项目只能供短时间玩玩,甚至只是个演示产品。
​		另一个对单元测试持疑的观点是,如果要在项目中进行单元测试,那么势必会影响开发者的项目进度。这个答案是肯定的,因为产出品质可以久经考验的产品,必然要花费较多的精力。如果只是豆腐渣工程,自然可以快速产出。区别在于后续维护的差异,因为有单元测试的质量保证,可以放心地增加和删除功能。后者则会陷入举步维艰的维护之路,拆东墙补西墙,开发者也渐渐变得只想做新项目,而旧的项目最后变得不可维护,或者不敢维护。甚至到项目下线时,依然充斥幽灵代码和重复代码。
​		单元测试只是在早期会多花费一定的成本,但这个成本要远远低于后期深陷维护泥潭的投入。至于是选择在早期投入成本还是在后期投入,只是朝三暮四还是朝四暮三的选择。
​		展开介绍单元测试之前,需要提及的问题是**代码的可测试性**,它是能够为其编写单元测试的前提条件。复杂的逻辑代码充满各种分支和判断,甚至像面条一样乱作一团,要对它们进行测试,难度相当大。一个感觉就是当无法为一段代码写出单元测试时,这段代码必然有坏味道,这会为开发者带来心理压力,这样的代码最需要重构。好代码的单元测试必然是轻量的,重构和写单元测试之间是一个相互促进的步骤,当重构代码的压力比较小的时候,也就意味着代码比较稳定,代码的可测试性越好,甚至代码越简洁。
**简单而言,编写可测试代码有以下几个原则可以遵循。**
​		**单一职责**。如果一段代码承担的职责越多,为其编写单元测试的时候就要构造更多的输入数据,然后推测它的输出。比如,一段代码中既包含数据库的连接,也包含查询,那么为它编写测试用例就要同时关注数据库连接和数据库查询。较好的方式是将这两种职责进行解耦分离,变成两个单一职责的方法,分别测试数据库连接和数据库查询
​		**接口抽象**。通过对程序代码进行接口抽象后,我们可以针对接口进行测试,而具体代码实现的变化不影响为接口编写的单元测试
​		**层次分离**。层次分离实际上是单一职责的一种实现。在MVC结构的应用中,就是典型的层次分离模型,如果不分离各个层次,无法想象这个代码该如何切入测试。通过分层之后,可以逐层测试,逐层保证。

​		对于开发者而言,不仅要编写单元测试,还应当编写可测试代码。

##### 10.1.2单元测试介绍

​		单元测试主要包含**断言、测试框架、测试用例、测试覆盖率、mock、持续集成**等几个方面,由于Node的特殊性,它还会加入**异步代码测试和私有方法的测试**这两个部分。

###### 1.断言

​		鉴于 JavaScript,入门较为容易,在开源社区中可以看到许多不带单元测试的模块出现,甚至有的模块作者并不了解单元测试究竟是怎么回事。开发者通常仅仅在 test.js或者demo.js里看到示例代码,这对想进一步使用模块的用户会存在心理负担。以下为某个开源模块的示例代码:

```js
var readOF = require("readof");
readOF.read(pic, target_path, function (error, data) {
    // do something
});
```

此类代码对质量没有任何保证,这主要源于以下两点。
		没有对输出结果进行任何的检测。
		输入条件覆盖率并不完备。

​		这样的示例代码展现的是“ It works”而不是“ Testing”。示例代码可以正常运行并不代表代码是没有问题的。如何对输出结果进行检测,以确认方法调用是正常的,是最基本的测试点**。断言就是单元测试中用来保证最小单元是否正常的检测方法。**

​		如果有对Node的源码进行过研究,会发现Node中存在着 assert这个模块,以及很多主要模块都调用了这个模块。何谓断言,维基百科上的解释是:

​		在程序设计中,断言( assertion)是一种放在程序中的一阶逻輯(如一个结果为真或是假的逻辑判断式),**目的是为了标示程序开发者预期的结果**—当程序运行到断言的位置时,对应的断言应该为真。若断言不为真,程序会中止运行,并出现错误信息。

​		一言以蔽之**,断言用于检查程序在运行时是否满足期望**。 JavaScript的断言规范最来自于CommonJS的单元测试规范(详见http://wiki.commonjs.org/wiki/Unit_Testing/1.0），Node实现了规范中的断言部分。

如下代码是 assert模块的工作方式:

```js
var assert = require('assert');
assert.equal(Math.max(1, 100), 100);
```

​		一旦assert equal()不满足期望,将会抛出 AssertionError异常,整个程序将会停止执行。没有对输出结果做任何断言检查的代码,都不是测试代码。**没有测试代码的代码,都是不可信赖的代码。**

在断言规范中,我们定义了以下几种检测方法。
	ok():判断结果是否为真
	equal():判断实际值与期望值是否相等。
	notEqual():判断实际值与期望值是否不相等。
	deepEqual():判断实际值与期望值是否深度相等(对象或数组的元素是否相等)。
	notDeepEqual():判断实际值与期望值是否不深度相等。
	strictEqual(():判断实际值与期望值是否严格相等〔相当于==)。
	notstrictEqua1():判断实际值与期望值是否不严格相等(相当于!=)。
	throws():判断代码块是否抛出异常。
除此之外,Node的 assert模块还扩充了如下两个断言方法。
	doesNotThrow(():判断代码块是否没有抛出异常。
	ifError(:判断实际值是否为一个假值(nu1l、 undefined、0、''、 false),如果实际值为真值,将会抛出异常。

​	目前,市面上的断言库大多都是基于 assert模块进行封装和扩展的,这包括著名的should.js断言库。

###### 2.测试框架

​		前面提到断言一旦检查失败,将会抛出异常停止整个应用,这对于做大规模断言检查时并不友好。更通用的做法是**,记录下抛出的异常并继续执行,最后生成测试报告**。这些任务的承担者就是测试框架。
​		测试框架用于为测试服务,它本身并不参与测试,主要用于管理测试用例和生成测试报告,提升测试用例的开发速度,提高测试用例的可维护性和可读性,以及一些周边性的工作。这里我们要介绍的优秀单元测试框架是 mocha,它来自Node杜区的明星开发者TJ Holowaychuk。通过npm install mocha命令即可安装,在安装时添加-g命令可以将其安装为全局工具。
​	测试风格

​		**我们将测试用例的不同组织方式**称为测试风格,现今流行的单元测试风格主要有TDD(测试驱动开发)和BDD(行为驱动开发)两种,它们的差别如下所示。

​		关注点不同。TDD关注所有功能是否被正确实现,每一个功能都具备对应的测试用例;BDD关注整体行为是否符合预期,适合自顶向下的设计方式。
​		表达方式不同。TDD的表述方式偏向于功能说明书的风格;BDD的表述方式更接近于自然语言的习惯。

mocha对于两种测试风格都有支持。下面为两种测试风格的示例,其BDD风格的示例如下:

```js
describe('Array', function () {
  before(function () {
    // ...
  });
  describe('#indexOf()', function () {
    it('should return -1 when not present', function () {
      [1, 2, 3].indexOf(4).should.equal(-1);
    });
  });
});
```

​	  BDD对测试用例的组织主断言要采用 describe和it进行组织。 describe可以描述多层级的结构,
具体到测试用例时,用it。另外,它还提供 before、 after、 beforeEac和 afterEach这4个钩子方法,用于协助 describe中测试用例的准备、安装、卸载和回收等工作。 before和 after分别在进人执行前和执行后触发执行。
BDD风格的组织示意图如图10-1所示。

###### 图10-1BDD风格的组织示意图

TDD风格的示例如下所示:

```js
suite('Array', function () {
  setup(function () {
    // ...
  });
  suite('#indexOf()', function () {
    test('should return -1 when not present', function () {
      assert.equal(-1, [1, 2, 3].indexOf(4));
    });
  });
});
```

TDD对测试用例的组织主要采用suite和test完成。suite也可以实现多层级描述,测试用例用 test它提供的钩子函数仅包含 setup和 teardown,对应BDD中的 before和ater。TDD风格的组织示意图如图102所示。


###### 图102TDD风格的组织示意图

###### 测试报告

​		作为测试框架, mocha设计得十分灵活,它与断言之间并不耦合,使得具体的测试用例既可以采用 assert原生模块,也可以采用扩展的断言库,如 should.js、 expect和chai等。但无论采用哪个断言库,运行测试用例后,测试报告是开发者和质量管理者都关注的东西。mocha提供了相当丰富的报告格式,调用`mocha --reporters􀔀`即可查看所有的报告格式.

```
$ mocha --reporters
dot - dot matrix
doc - html documentation
spec - hierarchical spec list
json - single json object
progress - progress bar
list - spec-style listing
tap - test-anything-protocol
landing - unicode landing strip
xunit - xunit reporter
teamcity - teamcity ci support
html-cov - HTML test coverage
json-cov - JSON test coverage
min - minimal reporter (great with --watch)
json-stream - newline delimited json events
markdown - markdown documentation (github flavour)
nyan - nyan cat!
```



​		默认的报告格式为dot,其他比较常用的格式有spec、json、html-cov等。执行`mocha -R <repoter>`命令即可采用这些报告。json报告因为其格式非常通用,多用于将结果传递给其他程序进行处理,而htm-cov则用于可视化地观察代码覆盖率。图10-3是spec格式的报告

​		如果有测试用例执行失败,会得到如图10-4所示的结果。

###### 图10-3spec格式的报告

执行`mocha-help`命令可以看到更多的帮助信息来了解如何使用它们。

###### 图10-4有测试用例执行失败时的结果

###### 3.测试代码的文件组织

​		还记得第2章中介绍到的包规范吗?包规范中定义了测试代码存在于test目录中,而模块代码存在于lib目录下。
​		除此之外,想让你的单元测试顺利运行起来,请记得在包描述文件( package. json)中添加相应模块的依赖关系。由于 mocha只在运行测试时需要,所以添加到 devDependencies节点即可:

```json
"devDependencies": {
	"mocha": "*"
}
```



###### 4.测试用例

​		介绍完测试框架的基本功能后,我们对测试用例也有了简单的认知了。简单来讲,一个行为或者功能需要有完善的、多方面的测试用例,一个测试用例中包含至少一个断言。示例代码如下:

```js
describe('#indexOf()', function () {
  it('should return -1 when not present', function () {
    [1, 2, 3].indexOf(4).should.equal(-1);
  });
  it('should return index when present', function () {
    [1, 2, 3].indexOf(1).should.equal(0);
    [1, 2, 3].indexOf(2).should.equal(1);
    [1, 2, 3].indexOf(3).should.equal(2);
  });
});
```



​		测试用例最少需要通过正向测试和反向测试来保证测试对功能的覆盖,这是最基本的测试用例。对于Node而言,不仅有这样简单的方法调用,还有异步代码和超时设置需要关注。
**·异步测试**
​		由于Node环境的特殊性,异步调用非常常见,这也带来了异步代码在测试方面的挑战。在其他典型编程语言中,如Java、Ruby、 Python,代码大多是同步执行的,所以测试用例基本上只要包含一些断言检查返回值即可。但是在Node中,检查方法的返回值毫无意义,并且不知道回调函数具体何时调用结束,这将导致我们在对异步调用进行测试时,无法调度后续测试用例的执行。
​		所幸, mocha解决了这个问题。以下为fs模块中 readFile的测试用例:

```jsx
it('fs.readFile should be ok', function (done) {
    fs.readFile('file_path', 'utf-8', function (err, data) {
        should.not.exist(err);
        done();
    });
});
```



​			在上述代码中,测试用例方法it()接受两个参数;用例标题(title)和回调函数(fn)通过检查这个回调函数的形参长度(fn. length)来判断这个用例是否是异步调用,如果是异步调用,在执行测试用例时,会将一个函数done(注入为实参,测试代码需要主动调用这个函数通知测试框架当前测试用例执行完成,然后测试框架才进行下一个测试用例的执行,这与第4章里提到的尾触发十分类似。

 

**超时设置**

​		异步方法给测试带来的问题并不是断言方面有什么异同,主要在于回调函数执行的时间无从预期。通过上面的例子,我们无法知道done()具体在什么时间执行。如果代码偶然出错,导致done直没有执行,将会造成所有的测试用例处于暂停状态,这显然不是框架所期望的。

​		mocha给所有涉及异步的测试用例添加了超时限制,如果一个用例的执行时间超过了预期时间,将会记录下一个超时错误,然后执行下一个测试用例。

​		下面这个测试用例因为10秒后才执行,导致测试框架处理为超时错误:

 

```js
it('async test', function (done) {
// 模拟一个要执行很久的异步方法
setTimeout(done, 10000);
});
```



​		mocha的默认超时时间为2000毫秒。一般情况下,通过`过mocha -t <ms>`设置所有用例的超时时间。若需更细粒度地设置超时时间,可以在测试用例it中调用this. timeout(ms)实现对单个用例的特殊设置,示例代码如下:

```js
it('should take less than 500ms', function (done) {
    this.timeout(500);
    setTimeout(done, 300);
});
```



​		也可以在描述 describe中调用this.timeout(ms)设置描述下当前层级的所有用例:

 

```js
describe('a suite of tests', function () {
  this.timeout(500);
  it('should take less than 500ms', function (done) {
    setTimeout(done, 300);
  });
  it('should take less than 500ms as well', function (done) {
    setTimeout(done, 200);
  });
});
```

###### 5.测试覆盖率

​		通过不停地给代码添加测试用例,将会不断地覆盖代码的分支和不同的情况。但是如何判断单元测试对代码的覆盖情况,我们需要直观的工具来体现。测试覆盖率是单元测试中的一个重要指标,它能够概括性地给出整体的覆盖度,也能明确地给出统计到行的覆盖情况。

对于如下这段代码:

```js
exports.parseAsync = function (input, callback) {
  setTimeout(function () {
    var result;
    try {
      result = JSON.parse(input);
    } catch (e) {
      return callback(e);
    }
    callback(null, result);
  }, 10);
};
```



我们为其添加部分测试用例,具体如下:

 

```js
describe('parseAsync', function () {
  it('parseAsync should ok', function (done) {
    lib.parseAsync('{"name": "JacksonTian"}', function (err, data) {
      should.not.exist(err);
      data.name.should.be.equal('JacksonTian');
      done();
    });
  });
});
```



若要探知这个测试用例对源代码的覆盖率,需要一种工具来统计每一行代码是否执行,这里要介绍的相关工具是 jscover模块。通过`npm install jscover -g`的方式可以安装该模块。

​		假设你的这段代码遵循 CommonJS规范并且存放在lib目录下,那么调用`jscover lib lib-cov` 进行源代码的编译吧。jscover会将lib目录下的.js文件编译到lib-cov目录下,你会得到类似下面的代码:

 

```js
_$jscoverage['index.js'][31]++;
exports.parseAsync = function (input, callback) {
  _$jscoverage['index.js'][32]++;
  setTimeout(function () {
    _$jscoverage['index.js'][33]++;
    var result;
    _$jscoverage['index.js'][34]++;
    try {
      _$jscoverage['index.js'][35]++;
      result = JSON.parse(input);
    } catch (e) {
      _$jscoverage['index.js'][37]++;
      return callback(e);
    }
    _$jscoverage['index.js'][39]++;
    callback(null, result);
  }, 10);
};
```



​	我们看到,每一行原始代码的前面都有一些_$jscoverage的代码出现,它们将会在执行时统计每一行代码被执行了多少次,也即除了统计是否执行外,还能统计次数。

​		在测试代码时,我们通常通过 require引入lb目录下的文件进行测试。但是为了得到测试覆盖率,必须在运行测试用例时执行编译之后的代码

​		为了区分这种注人代码和原始代码的区别,我们在模块的入口文件(通常是包目录下的 ndex js)中需要做简单的区别,示例代码如下:

```js
module.exports = process.env.LIB_COV ? require('./lib-cov/index') : require('./lib/index');
```

​		在运行测试代码时,会设置一个 LIB_COV的环境变量,以此区分测试环境和正常环境备妥编译好的代码之后,执行以下命令行即可得到覆盖率的输出结果:

```
//设置当前命令行有效的变量
export LIB_COV=1
mocha -R html-cov > coverage.html 
```

 

这个流程的示意图如图10-5所示。

###### 图10-5流程示意图

​		在这次测试中,我们用到了html-cov报告,它帮我们生成了一张HTML页面,具体地标出了哪一行未执行到,整体覆盖率为多少。图10-6为页面截图,从中可以看到有一行代码没有被测试到。

 

###### 图10-6覆盖率测试结果

​		单元测试覆盖率方便我们定位没有测试到的代码行。通常,我们往往会不经意地遗漏掉一些异常情况的覆盖。

​		构造一个错误的输入可以覆盖错误情况,下面我们为其补足测试用例:

 

```js
it('parseAsync should throw err', function (done) {
  lib.parseAsync('{"name": "JacksonTian"}}', function (err, data) {
    should.exist(err);
    done();
  });
});
```

再次执行测试用例,我们将得到一个100%覆盖率的页面,如图107所示。

###### 图10-7100%覆盖率的页面

​		在使用过程中,也可以使用json-cov报告,这样结果数据对其余系统较为友好。事实上html-cov报告即是采用json-cov的数据与模板渲染而成的。
jscover模块虽然已经够用,但是还有两个问题。
​		它的编译部分是通过Java实现的,这样环境依赖上就多出了Java

​		它需要编译代码到一个额外的新目录,这个过程相对麻烦。

​		而 blanket模块解决了这两个问题,它由纯 JavaScript实现,编译代码的过程也是隐式的,无须配置额外的目录,对于原模块项目没有额外的侵入。
​		blanket与 jscover的原理基本一致,在实现过程上有所不同,其差别在于 blanket将编译的步骤注入在 require中,而不是去额外编译成文件,执行测试时再去引用编译后的文件,它的技巧在require中
​			它的配置比 jscover要简单,只需要在所有测试用例运行之前通过- require选项引人它即可

```
mocha --require blanket -R html-cov > coverage.html
```

​			另一个需要注意的是,在包描述文件中配置 scripts节点。在 scripts节点中, pattern,属性用以匹配需要编译的文件:

```json
"scripts": {
    "blanket": {
        "pattern": "eventproxy/lib"
    }
},
```


		当在测试文件中通过 require引入一个文件模块时,它将判断这个文件的实际路径,如果符合这个匹配规则,就对它进行编译。它的编译与 jscover不同, jscover需要将文件编译到磁盘上的另一个目录 lib-cov中。但是 blanket则不同,它的原理与第2章中讲到的文件模块编译相同。我们知道,对于js文件,Node会将它的编译逻辑封装在 require.extensions['.js']中。 blanket正是在这个环节中实现了编译,将覆盖率的追踪代码插入到原始代码中,然后再由原始模块处理逻辑进行处理,示意图如图10-8所示。


###### 图10-8 blanket的编译流程

​		使用 blanket之后,就无须配置环境变量了,也无须根据环境去判断引人哪种代码,所以下面这行代码就不再需要了:

```js
module.exports = process.env.LIB_COV ? require('./lib-cov/index') : require('./lib/index');
```

###### 6. mock

前面提到开发者常常会遗漏掉一些异常案例,其中相当大一部分原因在于异常的情况较难实 现。大多异常与输入数据并无绝对的关系,比如数据库的异步调用,除了输入异常外,还有可能是网络异常、权限异常等非输入数据相关的情况,这相对难以模拟。

​		在测试领域里,模拟异常其实是一个不小的科目,它有着一个特殊的名词:mock。我们通过伪造被调用方来测试上层代码的健壮性等。
  		以下面的代码为例,文件系统的异常是绝对不容易呈现的,为了测试代码的健壮性而专程调节磁盘上的权限等,成本略高:

```js
exports.getContent = function (filename) {
  try {
    return fs.readFileSync(filename, 'utf-8');
  } catch (e) {
    return '';
  }
};
```



​		为了解决这个问题,我们通过伪造fs.readFilesync()方法抛出错误来触发异常。同时为了保证该测试用例不影响其余用例我们需要在执行完后还原它。为此,前面提到的 before()和 after()钩子函数派上了用场,相关代码如下:

```js
describe("getContent", function () {
  var _readFileSync;
  before(function () {
    _readFileSync = fs.readFileSync;
    fs.readFileSync = function (filename, encoding) {
      throw new Error("mock readFileSync error"));
};
});
// it();
after(function () {
  fs.readFileSync = _readFileSync;
})
});
```

​	

  		我们在执行测试用例前将引用替换掉,执行结束后还原它。如果每个测试用例执行前后都要 进行设置和还原,就使用 beforeeach()和 afterEach()这两个钩子函数由于mok的过程比较烦琐,这里推荐一个模块来解决此事—**muk**,示例代码如下:

```js
var fs = require('fs');
var muk = require('muk');
before(function () {
  muk(fs, 'readFileSync', function (path, encoding) {
    throw new Error("mock readFileSync error");
  });
});
// it();
after(function () {
  muk.restore();
});

```



当有多个用例时,相关代码如下:

```js
var fs = require('fs');
var muk = require('muk');
beforeEach(function () {
  muk(fs, 'readFileSync', function (path, encoding) {
    throw new Error("mock readFileSync error");
  });
});
// it();
// it();
afterEach(function () {
  muk.restore();
});
```

  		模拟时无须临时缓存正确引用,用例执行结束后调用muk.restore()恢复即可。通过模拟底层方法出现异常的情况,现在只要检测调用方的输出值是否符合期望即可,无须关注是否是真正的异常。模拟异常可以很大程度地帮助开发者提升代码的健壮性,完善调用方代码的容错能力。
  		值得注意的一点是,对于异步方法的模拟,需要十分小心是否将异步方法模拟为同步。下面的mock方式可能会引起意外的结果:

```
fs.readFile = function (filename, encoding, callback) {
	callback(new Error("mock readFile error"));
};

```

正确的mock方式是尽量让mock后的行为与原始行为保持一致,相关代码如下:

```js
fs.readFile = function (filename, encoding, callback) {
    process.nextTick(function () {
   		callback(new Error("mock readFile error"));
    });
};
```


  		模拟异步方法时,我们调用 process. nextTick()使得回调方法能够异步执行即可。关于
  **process. nextTick()的原理,**第3章中有所阐述,此处不再做更多解释。

######  7.私有方法的测试

  		对于Node而言,又一个难点会出现在单元测试的过程中,那就是私有方法的测试,这在第2章中介绍过。只有挂载在 exports或 module, exports上的变量或方法才可以被外部通过 require引入访问,其余方法只能在模块内部被调用和访问。
  		在Java一类的语言里,私有方法的访问可以通过反射的方式实现。那么,Node该如何实现呢? 是否可以因为它们是私有方法就不用为它们添加单元测试?
  		答案是否定的,为了应用的健壮性,我们应该尽可能地给方法添加测试用例。那么除了将这些私有方法通过 exports导出外,还有别的方法吗?答案是肯定的。 **rewire**模块提供了一种巧妙的方式实现对私有方法的访问。
		rewire的调用方式与 require分类似。对于如下的私有方法,我们获取它并为其执行测试用例非常简单:

```js
var limit = function (num) {
	return num < 0 ? 0 : num;
};
```

 测试用例如下:

```js
it('limit should return success', function () {
    var lib = rewire('../lib/index.js');
    var litmit = lib.__get__('limit');
    litmit(10).should.be.equal(10);
});
```

 		 rewire的诀窍在于它引入文件时,像 require一样对原始文件做了一定的手脚。除了添加
(function(exports, require, module, __filename, __dirname) {和});的头尾包装外,它还注入了部分代码,具体如下所示:

```js
(function (exports, require, module, __filename, __dirname) {
  var method = function () { };
  exports.__set__ = function (name, value) {
    eval(name " = " value.toString());
  };
  exports.__get__ = function (name) {
    return eval(name);
  };
});
```

​		每一个被 rewire引入的模块都有`__set()__`和`__get()__`方法。它巧妙地利用了闭包的诀窍,在 eval()执行时,实现了对模块内部局部变量的访问,从而可以将局部变量导出给测试用例调用执行。

#####  10.1.3 工程化与自动化

 		 Node以及第三方模块提供的方法都相对偏底层,在开发项目时,还需要一定的工具来实现工 程化和自动化(这里我们介绍其中的一种方式—持续集成),以减少手工成本。

###### 1.工程化

​			Node在`*nix`系统下可以很好地利用一些成熟工具,其中 Makefile比较小巧灵活,适合用来构建工程。下面是我常用的 Makefile文件的内容:

```makefile
TESTS = test/*.js
REPORTER = spec
TIMEOUT = 10000
MOCHA_OPTS =
test:
  @NODE_ENV=test ./node_modules/mocha/bin/mocha \
  --reporter $(REPORTER) \
  --timeout $(TIMEOUT) \
  $(MOCHA_OPTS) \
  $(TESTS)
test-cov:
  @$(MAKE) test MOCHA_OPTS='--require blanket' REPORTER=html-cov > coverage.html
test-all: test test-cov
.PHONY: test
```



​		  开发者改动代码之后,只需通过 `make test`和 `make test-cov`命令即可执行复杂的单元测试和覆盖率。这里需要注意以下两点。
 	Makefile文件的缩进必须是tab符号,不能用空格。
 	记得在包描述文件中配置blanket。

######   2.持续集成

 		 将项目工程化可以帮助我们把项目组织成比较固定的结构,以供扩展。但是对于实际的项目而言,频繁地迭代是常见的状态,如何记录版本的迭代信息,还需要一个持续集成的环境。
  		至于如何持续集成,各个公司都有自己特定的方案,这里介绍一下社区中比较流行的方式——利用 travis-ci实现持续集成。
  		travis-ci与 GitHub的配合可谓相得益彰。 GitHub提供了代码托管和社交编程的良好环境,程序员们可以在上面很社交化地进行代码的 clone、fork、 pull request、 issues等操作,travis-ci则补足了 GitHub在持续集成方面的缺点。Git版本控制系统提供了hook机制,用户在push代码后会触发一个hook脚本,而 travis-ci即是通过这种方式与 GitHub衔接起来的。将你的代码与travis-ci链接起来十分容易,只需如下几步即可完成。
  (1)在`https://travis-ci.org`上通过 OAuth授权绑定你的 GitHub账号
  (2)在GitHub仓库的管理面板(admin)中打开services hook页,在这个页面中可以发现GitHub上提供了很多基于 git hook方式的钩子服务。
  (3)找到 travis服务,点击激活即可。
  (4)每次将代码push到 GitHub的仓库上后,将会触发该钩子服务。
 		 除此之外,一旦绑定了 GitHub之后,也可以通过travis-ci的管理界面来设置哪些代码仓库开启持续继承服务。
 		 travis-cil除了提供简单的语言运行时环境外,还提供数据库服务、消息队列、无界面浏览器等,十分强大,值得深度利用。需要注意的一点是, travis-ci是基于Ruby创建的项目,最开始是为Ruby项目服务的,目前提供了许多后端语言的测试持续集成服务,但是它会将项目默认当做Ruby项目。为了解决该问题,需要在自己的项目中提供一个 .travis.yml说明文件,告之 travis-ci是哪种类型的项目。Node项目的说明文件如下:

```
language: node_js
node_js:
- "0.8"
- "0.10"
```

 		 其中主要有两个说明,language和支持的版本号。 travis-ci在收到 Github的通知后,将会pull 最新的代码到测试机中,并根据该配置文件准备对应的环境和版本。还记得第2章中提到的 scripts描述么?前面 blanket的配置就在这个节点上。这里  travis-ci将会执行 npm test命令来启动  整个测试,而前面提到的`mocha -R spec`或 make tes命令应当配置在 package.json文件中

```
"scripts": {
	"test": "make test"
},
```


​		  travis-ci提供了一个测试状态的服务。在 GitHub上,也会经常看到此类的图标:國pasn或者红色的失败图标sstn。它就是由 travis-ci提供的项目状态服务,由如下格式组成

```
https://travis-ci.org/<username>/<repo>.png?branch=<branch>
```

  		该图标能够实时反映出项目的测试状态。 passing状态的图标能够在使用者调硏模块时增加使用当前模块的信心。
			travis-ci除了提供状态服务外,还详细记录了每次测试的详细报告和日志,通过这些信息我们可以追踪项目的迭代健康状态。

##### 10.1.4小结

​		在这一节中,我们介绍了普通的单元测试的方方面面,对于一些特定场景下的单元测试方式并未做过多介绍,比如测试Web应用等,读者可以自行查看所用Web框架的测试方式,比如 Connect或 Express提供了 supertest辅助库来简化单元测试的编写。
  		在项目中经常会因为依赖方的变化而产生业务代码的跟随变动,如果没有单元测试的覆盖,依赖方逻辑发生变化后,很难定位该变动影响的范围。一旦为项目覆盖完善的单元测试,项目的状态将会因为测试报告而了然于心。完善的单元测试在一定程度上也昭示着项目的成熟度。

#### 10.2性能测试

  		单元测试主要用于检测代码的行为是否符合预期。在完成代码的行为检测后,还需要对已有代码的性能作出评估,检测已有功能是否能满足生产环境的性能要求,能否承担实际业务带来的压力。换句话说,性能也是功能。
  		性能测试的范畴比较广泛,包括负载测试、压力测试和基准测试等。由于这部分内容并非Node特有,为了收敛范畴,这里将只会简单介绍下基准测试。
		除了基准测试,这里还将介绍如何对web应用进行网络层面的性能测试和业务指标的换算。

#####   10.2.1基准测试

  		基本上,每个开发者都具备为自己的代码写基准测试的能力。基准测试要统计的就是在多少时间内执行了多少次某个方法。为了增强可比性,一般会以次数作为参照物,然后比较时间,以此来判别性能的差距。
		  假如我们要测试 ECMAScript5提供的Array.prototype.map和循环提取值两种方式,它们都是迭代一个数组,根据回调函数执行的返回值得到一个新的数组,相关代码如下:

```js
var nativeMap = function (arr, callback) {
  return arr.map(callback);
};
var customMap = function (arr, callback) {
  var ret = [];
  for (var i = 0; i < arr.length; i++) {
    ret.push(callback(arr[i], i, arr));
  }
  return ret;
};
```

  		比较简单直接的方式就是构造相同的输人数据,然后执行相同的次数,最后比较时间。为此我们可以写一个方法来执行这个任务,具体如下所示

```js
var run = function (name, times, fn, arr, callback) {
  var start = (new Date()).getTime();
  for (var i = 0; i < times; i++) {
    fn(arr, callback);
  }
  var end = (new Date()).getTime();
  console.log('Running s d times cost % % %d ms', name, times, end - start);
};

```

  最后,分别调用100000次

```js
var callback = function (item) {
  return item;
};
run('nativeMap', 1000000, nativeMap, [0, 1, 2, 3, 5, 6], callback);
run('customMap', 1000000, customMap, [0, 1, 2, 3, 5, 6], callback);
```

  得到的结果如下所示:

```
Running nativeMap 1000000 times cost 873 ms
Running customMap 1000000 times cost 122 ms
```


​		  在我的机器上测试结果显示 Array.prototype.map执行相同的任务,要花费for循环方式7倍左右的时间。

​			上面就是进行基准测试的基本方法。为了得到更规范和更好的输出结果,这里介绍 benchmark 这个模块是如何组织基准测试的,相关代码如下:

```js
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();
var arr = [0, 1, 2, 3, 5, 6];
suite.add('nativeMap', function () {
  return arr.map(callback);
}).add('customMap', function () {
  var ret = [];
  for (var i = 0; i < arr.length; i++) {
    ret.push(callback(arr[i]));
  }
  return ret;
}).on('cycle', function (event) {
  console.log(String(event.target));
}).on('complete', function () {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
}).run();
```

  它通过 suite来组织每组测试,在测试套件中调用add)来添加被测试的代码。执行上述代码,得到的输出结果如下:

```
nativeMap x 1,227,341 ops/sec ±1.99% (83 runs sampled)
customMap x 7,919,649 ops/sec ±0.57% (96 runs sampled)
Fastest is customMap
```

  		benchmark模块输出的结果与我们用普通方式进行测试多出±.99(89 runs sampled)这么一 段。事实上, benchmark模块并不是简单地统计执行多少次测试代码后对比时间,它对测试有着严密的抽样过程。执行多少次方法取决于采样到的数据能否完成统计。83 runs sampled表示对nativeMap测试的过程中,有83个样本,然后我们根据这些样本,可以推算出标准方差,即±199%这部分数据。


##### 10.2.2压力测试

​		  除了可以对基本的方法进行基准测试外,通常还会对网络接口进行压力测试以判断网络接口的性能,这在64节演示过。对网络接口做压力测试需要考查的几个指标有吞吐率、响应时间和并发数,这些指标反映了服务器的并发处理能力。
  最常用的工具是ab、 siege、http_load等,下面我们通过ab工具来构造压力测试,相关代码如下:

```
$ ab -c 10 -t 3 http://localhost:8001/
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/
Benchmarking localhost (be patient)
Completed 5000 requests
Completed 10000 requests
Finished 11573 requests
Server Software:
Server Hostname: localhost
Server Port: 8001
Document Path: /
Document Length: 10240 bytes
Concurrency Level: 10
Time taken for tests: 3.000 seconds
Complete requests: 11573
Failed requests: 0
Write errors: 0
Total transferred: 119375495 bytes
HTML transferred: 118507520 bytes
Requests per second: 3857.60 [#/sec] (mean)
Time per request: 2.592 [ms] (mean)
Time per request: 0.259 [ms] (mean, across all concurrent requests)
Transfer rate: 38858.59 [Kbytes/sec] received
Connection Times (ms)
min mean[+/-sd] median max
Connect: 0 0 0.3 0 31
Processing: 1 2 1.9 2 35
Waiting: 0 2 1.9 2 35
Total: 1 3 2.0 2 35

Percentage of the requests served within a certain time (ms)
    50% 2
    66% 3
    75% 3
    80% 3
    90% 3
    95% 3
    98% 5
    99% 6
100% 35 (longest request)
```


  		上述命令表示10个并发用户持续3秒向服务器端发出请求。下面简要介绍上述代码中各个参数的含义。

- Document Path;表示文档的路径,此处为/。
  Document Length:表示文档的长度,就是报文的大小,这里有10KB。
  Concurrency Level:并发级别,就是我们在命令中传入的c,此处为10,即10个并发。
  Time taken for tests:表示完成所有测试所花费的时间,它与命令行中传人的t选项有细微出入。
  Complete requests:表示在这次测试中一共完成多少次请求。
  Failed requests:表示其中产生失败的请求数,这次测试中没有失败的请求。
  Write errors:表示在写入过程中出现的错误次数(连接断开导致的)
  Total transferred:表示所有的报文大小
  HTMLtransferred:表示仅HTTP报文的正文大小,它比上一个值小。
  Requests per second:这是我们重点关注的一个值,它表示服务器每秒能处理多少请求,是重点反映服务器并发能力的指标。这个值又称RPS或QPS。
- 两个 Time per request值:第一个代表的是用户平均等待时间,第二个代表的是服务器平均请求处理事件,前者除以并发数得到后者。
  Transfer rate:表示传输率,等于传输的大小除以传输时间,这个值受网卡的带宽限制。
  Connection Times:连接时间,它包括客户端向服务器端建立连接、服务器端处理请求、等待报文响应的过程。



​			最后的数据是请求的响应时间分布,这个数据是 Time per request的实际分布。可以看到50%的请求都在2ms内完成,99%的请求都在6ms内返回。

​			另外,需要说明的是,上述测试是在我的笔记本上进行的,我的笔记本的相关配置如下:
  					处理器2.4 GHz Intel Core i5
  					内存8 GB 1333 MHz DDR3

#####   10.2.3基准测试驱动开发

 		 Felix Geisendorfer是Node早期的一个代码贡献者,同时也是一些优秀模块的作者,其中最著名的为他的几个 MySQL驱动,以追求性能著称。他在“ Faster than C”幻灯片中提到了一种他所 使用的开发模式,简称也是BDD,全称为 Benchmark Driven Development,即基准测试驱动开发,其中主要分为如下几步其流程图如图10-9所示。
  (1)写基准测试。
  (2)写改代码。
  (3)收集数据。
  (4)找出问题。
  (5)回到第(2)步。

  图10-9基准测试驱动开发的流程图

​		之前测试的服务器端脚本运行在单个CPU上,为了验证 cluster模块是否有效,我们可以参照 Felix Geisendörfer的方法进行迭代。通过上面的测试,我们已经完成了一遍上述流程。接下来,我们回到第(2)步,看看是否有性能的提升。
​		原始代码无需任何更改,下面我们新增一个 cluster. js文件,用于根据机器上的cPU数量启动多进程来进行服务,相关代码如下

```js
var cluster = require('cluster');
cluster.setupMaster({
  exec: "server.js"
});
var cpus = require('os').cpus();
for (var i = 0; i < cpus.length; i++) {
  cluster.fork();
}
console.log('start ' + cpus.length + ' workers.');
```


  接着通过如下代码启动新的服务:

```
node cluster.js
start 4 workers.
```


  然后用相同的参数测试,根据结果判断启动多个进程是否是行之有效的方法。测试结果如下:

```
$ ab -c 10 -t 3 http://localhost:8001/
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/
Benchmarking localhost (be patient)
Completed 5000 requests
Completed 10000 requests
Finished 14145 requests
Server Software:
Server Hostname: localhost
Server Port: 8001
Document Path: /
Document Length: 10240 bytes
Concurrency Level: 10
Time taken for tests: 3.010 seconds
Complete requests: 14145
Failed requests: 0
Write errors: 0
Total transferred: 145905675 bytes
HTML transferred: 144844800 bytes
Requests per second: 4699.53 [#/sec] (mean)
Time per request: 2.128 [ms] (mean)
Time per request: 0.213 [ms] (mean, across all concurrent requests)
Transfer rate: 47339.54 [Kbytes/sec] received
Connection Times (ms)
min mean[+/-sd] median max
Connect: 0 0 0.5 0 61
Processing: 0 2 5.8 1 215
Waiting: 0 2 5.8 1 215
Total: 1 2 5.8 2 215
Percentage of the requests served within a certain time (ms)
    50% 2
    66% 2
    75% 2
    80% 2
    90% 3
    95% 3
    98% 4
    99% 5
100% 215 (longest request)
```



​	从测试结果可以看到,QPS从原来的3857.60变成了4699.53,这个结果显示性能并没有与CPU的数量成线性增长,这个问题我们暂不排查,但它已经验证了我们的改动确实是能够提升性能的。

#####   10.2.4测试数据与业务数据的转换

  		通常,在进行实际的功能开发之前,我们需要评估业务量,以便功能开发完成后能够胜任实际的在线业务量。如果用户量只有几个,每天的PV只有几十个,那么网站开发几乎不需要什么优化就能胜任。如果PV上10万甚至百万、千万,就需要运用性能测试来验证是否能够满足实际业务需求,如果不满足,就要运用各种优化手段提升服务能力。

假设某个页面每天的访问量为100万。根据实际业务情况,主要访问量大致集中在10个小时以内,那么换算公式就是:

```
QPS = PV / 10h
```

​		100万的业务访问量换算为QPS,约等于27.7,即服务器需要每秒处理277个请求才能胜任业务量。

  #### 10.3总结

  ​		测试是应用或者系统最重要的质量保证手段。有单元测试实践的项目,必然对代码的粒度和层次都掌握得较好。单元测试能够保证项目每个局部的正确性,也能够在项目迭代过程中很好地监督和反馈迭代质量。如果没有单元测试,就如同黑夜里没有秉烛的行走

  ​		对于性能,在编码过程中一定存在部分感性认知,与实际情况有部分偏差,而性能测试则能很好地斧正这种差异。

  #### 10.4 参考资源

  本章参考的资源如下:

  ```
  http://nodejs.org/docs/latest/api/assert.html
  http://visionmedia.github.com/mocha/
  https://github.com/visionmedia/should.js
  https://github.com/fent/node-muk
  https://github.com/alex-seville/blanket
  http://about.travis-ci.org/docs/
  https://github.com/JacksonTian/unittesting
  https://speakerdeck.com/felixge/faster-than-c-3
  ```

  