### 第5章 内存控制

​	也许读者会好奇为何会有这样一章存在于本书中,因为在过去很长一段时间内, JavaScript 开发者很少在开发过程中遇到需要对内存精确控制的场景,也缺乏控制的手段。说到内存泄漏大家首先想起的也只是早期版本的正中 Javascript与DOM交互时发生的问题。如果页面里的内存占用过多,基本等不到进行代码回收,用户已经不耐烦地刷新了当前页面。随着Node的发展, JavaScript已经实现了 Commonjs的生态圈大一统的梦想, JavaScript的应用场景早已不再局限在浏览器中。本章将暂时抛开那些短时间执行的场景,比如网页应用、命5令行工具等,这类场景由于运行时间短,且运行在用户的机器上,即使内存使用过多或内存泄漏,也只会影响到终端用户。由于运行时间短,随着进程的退出,内存会释放,几乎没有内存管理的必要。但随着Node在服务器端的广泛应用,其他语言里存在着的问题在 Javascript中也暴露出来了。

​	基于无阻塞、事件驱动建立的Node服务,具有内存消耗低的优点,非常适合处理海量的网络请求。在海量请求的前提下,开发者就需要考虑一些平常不会形成影响的问题。本书写到这里算是正式迈进服务器端编程的领域了,内存控制正是在海量请求和长时间运行的前提下进行探讨的。在服务器端,资源向来就寸土寸金,要为海量用户服务,就得使一切资源都要高效循环利用。

 

在第3章中,差不多已介绍完Node是如何利用cPU和IO这两个服务器资源,而本章将介绍在Node中如何合理高效地使用内存。

#### 5.1 V8的垃圾回收机制与内存限制

​	我们在学习 JavaScript编程时听说过,它与Java一样**,由垃圾回收机制来进行自动内存管理,**这使得开发者不需要像CC++程序员那样在编写代码的过程中时刻关注内存的分配和释放问题。但在浏览器中进行开发时,几乎很少有人能遇到垃圾回收对应用程序构成性能影响的情况。Node极大地拓宽了 JavaScript的应用场景,当主流应用场景从客户端延伸到服务器端之后,我们就能发现,**对于性能敏感的服务器端程序,内存管理的好坏、垃圾回收状况是否优良,都会对服务构成影响**。而在Node中,这一切都与**Node的 JavaScript执行引擎V8息息相关**。

##### 5.1.1 Node与V8

​	回溯历史可以发现,Node在发展历程中离不开V8,所以在官方的主页介绍中就提到Node是一个构建在 Chrome的 JavaScrip运行时上的平台。2009年,Node的创始人 Ryan Dah选择了V8来作为Node的 Javascript脚本引擎,这离不开当时硝烟四起的第三次浏览器大战。那次大战中,来自Google的 Chrome浏览器以其优异的性能成为焦点。 Chrome成功的背后离不开 JavaScript引擎v8。V8出现后, JavaScript一改它作为脚本语言性能低下的形象。在接下来的性能跑分中,V8持续领跑少至今。V8的性能优势使JavaScrip写高性能后台服务程序成为可能。在这样的契机下,Ryan 选择了 **JavaScript,选择了v8,在事件驱动、非阻塞Io模型的设计下实现了Node**

​	关于V8,它的来历与背景亦是大有来头。作为虚拟机,V8的性能表现优异,这与它的领导者有莫大的渊源, Chrome的成功也离不开它背后的天才— Lars bak。在Lars的工作履历里,绝大部分都是与虚拟机相关的工作。在开发V8之前,他曾经在Sun公司工作,担任 Hotspo团队的技术领导,主要致力于开发高性能的Java虚拟机。在这之前,他也曾为Self、 Smalltalk语言开发过高性能虚拟机。这些无与伦比的经历让V8一出世就超越了当时所有的 JavaScript虚拟机Node在 JavaScript的执行上直接受益于V8,可以随着v8的升级就能享受到更好的性能或新的语言特性(如ES5和ES6)等,同时也受到V8的一些限制,尤其是本章要重点讨论的**内存限制**。

##### 5.1.2 V8的内存限制

​	在一般的后端开发语言中,在基本的内存使用上没有什么限制,然而在Node中通过 JavaScript

使用内存时就会发现**只能使用部分内存**(64位系统下约为1.4GB,32位系统下约为0.7GB)。在这样的限制下,将会导致**Node无法直接操作大内存对象**,比如无法将一个2GB的文件读入内存中进行字符串分析处理,即使物理内存有32GB。这样在单个Node进程的情况下,计算机的内存资源无法得到充足的使用。

​	造成这个问题的主要原因在于Node基于V8构建,所以在Node中使用的 JavaScript.对象基本上都是通过V8自己的方式来进行分配和管理的。V8的这套内存管理机制在浏览器的应用场景下使用起来绰绰有余,足以胜任前端页面中的所有需求。但在Nod中,这却限制了开发者随心所欲使用大内存的想法。

​	尽管在服务器端操作大内存也不是常见的需求场景,但有了限制之后,我们的行为就如同带

着镣铐跳舞,如果在实际的应用中不小心触碰到这个界限,会造成进程退出。

要知晓V8为何限制了内存的用量,则需要回归到V8在内存使用上的策略。知晓其原理后,才能避免问题并更好 地进行内存管理。  

#####  5.1.3 V8的对象分配   

 在V8中,所有的 JavaScript对象都是通过**堆**来进行分配的。Node提供了**V8中内存使用量的查看**方式,执行下面的代码,将得到输出的内存信息:

###### process.memoryUsage()

```
> process.memoryUsage()
{ rss: 26660864,
  heapTotal: 11255808, //V8已申请到的堆内存
  heapUsed: 6456024,// V8 当前使用的量
  external: 8707 }
```



​	当我们在代码中**声明变量并赋值时**,所使用对象的内存就分配在堆中。如果已申请的堆空闲内存不够分配新的对象,将继续申请堆内存,直到堆的大小超过V8的限制为止。

至于**V8为何要限制堆的大小,**

​	表层原因：

​			为V8最初为浏览器而设计,不太可能遇到用大量内5存的场景。对于网页来说,V8的限制值已经绰绰有余。

​	深层原因：

​			是V8的垃圾回收机制的限制。按官方的说法,以15GB的垃圾回收堆内存为例,V8做一次小的垃圾回收需要50毫秒以上,做一次非增量式的垃圾回收甚至要1秒以上。这是垃圾回收中引起 JavaScript线程暂停执行的时间,在这样的时间花销下,**应用的性能和响应能力都会直线下降**。这样的情况不仅仅后端服务无法接受,前端浏览器也无法接受。因此,在当时的考虑下直接限制堆内存是一个好的选择。当然,这个限制也不是不能打开,V8依然提供了选项让我们使用更多的内存。

Node在启动时可以传递**--max-old- space-size**或**--max-new- space-size**来调整内存限制的大小,示例如下:

```
node --max-old-space-size=1700 test.js // 单位为MB 
//或者
node --max-new-space-size=1024 test.js // 单位为KB 
```

 

​	上述参数在V8初始化时生效,一旦生效就不能再动态改变。如果遇到Node无法分配足够内存给 JavaScript对象的情况,可以用这个办法来放宽v8默认的内存限制,避免在执行过程中稍微多用了一些内存就轻易崩溃。

 接下来,让我们更深入地了解V8在垃圾回收方面的策略。在限制的前提下,带着镣铐跳出的舞蹈并不一定就难看。

##### 5.1.4 V8的垃圾回收机制

​	在展开介绍V8的垃圾回收机制前,有必要简略介绍下v8用到的各种垃圾回收算法。

###### 1. V8主要的垃圾回收算法

 v8的垃圾回收策略主要基于**分代式垃圾回收机制**。在自动垃圾回收的演变过程中,人们发现没有一种垃圾回收算法能够胜任所有的场景。因为在实际的应用中,对象的生存周期长短不不同的算法只能针对特定情况具有最好的效果。为此,统计学在垃圾回收算法的发展中产生了较大的作用,现代的垃圾回收算法中**按对象的存活时间**将内存的垃圾回收**进行不同的分代,**然后分别对不同分代的内存施以更高效的算法。

​	V8的内存分代

​	在V8中,主要将内存分为**新生代**和**老生代**两代。新生代中的对象为存活时间较短的对象,老生代中的对象为存活时间较长或常驻内存的对象.

​	图5-2 V8的分代示意图

**V8堆的整体大小**就是新生代所用内存空间加上老生代的内存空间。前面我们提及的

--max-old-space-size命令行参数可以用于设置老生代内存空间的最大值,-max-new- space-size

命令行参数则用于设置新生代内存空间的大小的。



比较遗憾的是,这两个最大值需要在启动时就指定。这意味着V8使用的内存没有办法根据使用情况自动扩充,当内存分配过程中超过极限值时,就会引起进程出错。

 

​	前面提到过,在默认设置下,如果一直分配内存,在64位系统和32位系统下会分别只能使用约1.4GB和约0.7GB的大小。这个限制可以从Ⅴ8的源码中找到。在下面的代码中,Page: kPageSize的值为1MB。可以看到,老生代的设置在64位系统下为1400MB,在32位系统下为700MB:

 

```
//TODO
```



 

对于新生代内存,它由两个 reserved semispace size所构成,后面将描述其原因。按机器位数不同, reserved semispace size在64位系统和32位系统上分别为16MB和8MB。所以新生代内存的最大值在64位系统和32位系统上分别为32MB和16MB。

 

V8堆内存的最大保留空间可以从下面的代码中看出来: **MaxReserved**

```C++

Heap::~Heap() = default;

size_t Heap::MaxReserved() {
  const size_t kMaxNewLargeObjectSpaceSize = max_semi_space_size_;
  return static_cast<size_t>(2 * max_semi_space_size_ +
                             kMaxNewLargeObjectSpaceSize +
                             max_old_generation_size_);
}
```

 

 

因此,默认情况下,V8堆内存的最大值在64位系统上为1464MB,32位系统上则为732MB。这个数值可以解释为何在64位系统下只能使用约14GB内存和在32位系统下只能使用约07GB内存。

 

###### Scavenge算法

 

​	在分代的基础上,新生代中的对象主**要通过 Scavenge算法进行垃圾回收**。在 Scavenge具体实现中,主要采用了 Cheney算法,该算法由C. J. Cheney-于1970年首次发表在ACM论文上。

Cheney算法是一种**采用复制的方式实现的垃圾回收算法**。它将堆内存一分为二,每一部分空间称为 semispace。在这两个 semispace空间中,只有一个处于使用中,另一个处于闲置状态。

处于使用状态的 semispace空间称为From空间,

处于闲置状态的空间称为To空间。

​	当我们分配对象时,先是在From空间中进行分配。当开始进行垃圾回收时,会检查From空间中的存活对象,这些存活对象将被复制到To空间中,而非存活对象占用的空间将会被释放。完成复制后,From空间和To空间的角色发生对换。简而言之,在垃圾回收的过程中,就是通过将存活对象在两个semispace空间之间进行复制。

​	Scavenge的**缺点**是只能使用堆内存中的一半,这是由划分空间和复制机制所决定的。但Scavenge由于只复制存活的对象,并且对于生命周期短的场景存活对象只占少部分,所以它在时间效率上有优异的表现。

​	由于 Scavenge是典型的牺牲空间换取时间的算法,所以无法大规模地应用到所有的垃圾回收中。但可以发现, Scavenge非常适合应用在新生代中,因为新生代中对象的生命周期较短,恰恰适合这个算法。

V8的堆内存示意图



semispace-- 新生代内存空间

 semispace (From) |semispace(to)| 老生代内存空间

 



​	实际使用的堆内存是新生代中的两个 semispace空间大小和老生代所用内存大小之和。

 当一个对象经过多次复制依然存活时,它将会被认为是生命周期较长的对象。这种较长生命周期的对象随后会被移动到老生代中,采用新的算法进行管理。

对象从新生代中移动到老生代中的过程称为晋升。在单纯的 Scavenge过程中,From空间中的存活对象会被复制到To空间中去,然后对From空间和To空间进行角色对换(又称翻转)。但在分代式垃圾回收的前提下,From空间中的存活对象在复制到To空间之前需要进行检查。在一定条件下,需要将存活周期长的对象移动到老生代中,也就是完成对象晋升**。对象晋升**的条件主要有两个,一个是**对象是否经历过 Scavenge回收**,一个是**To空间的内存占用比超过限制。**

​	在默认情况下,V8的对象分配主要集中在From空间中。对象从Fom空间中复制到To空间时,会检查它的内存地址来判断这个对象是否已经经历过一次 Scavenge回收。如果已经经历过了,会将该对象从From空间复制到老生代空间中,如果没有,则复制到To空间中。

###### 晋升流程TODO



​	另一个判断条件是To空间的内存占用比。当要从From空间复制一个对象到To空间时,如果To空间已经使用了超过25%,则这个对象直接晋升到老生代空间中,这个晋升的判断示意图如图

###### 图5.5晋升的判断示意图 TODO



​	**设置25%这个限制值的原因**是当这次 Scavenge回收完成后,这个To空间将变成From空间,接下来的内存分配将在这个空间中进行。如果占比过高,会影响后续的内存分配。对象晋升后,将会在老生代空间中作为存活周期较长的对象来对待,接受新的回收算法处理。

 

###### Mark-Sweep && Mark-Compact

​	对于老生代中的对象,由于存活对象占较大比重,再采用 Scavenge方式会有**两个问题**:一个是存活对象较多,复制存活对象的效率将会很低;另一个问题依然是浪费一半空间的问题。这两个问题导致应对生命周期较长的对象时 Scavenge会显得捉襟见肘。为此,V8在老生代中主要采用了 Mark-Sweep和 Mark-Compact相结合的方式进行垃圾回收。

 

​		Mark-Sweep是标记清除的意思,它分为**标记**和**清除**两个阶段。与 Scavenge相比,Mark- Sweep 并不将内存空间划分为两半,所以不存在浪费一半空间的行为。与 Scavenge复制活着的对象不同, Mark-Sweep在标记阶段遍历堆中的所有对象,并标记活着的对象,在随后的清除阶段中,只清除没有被标记的对象。**可以看出, Scavenge中只复制活着的对象,而 Mark-Sweep只清理死亡对象。**活对象在新生代中只占较小部分,死对象在老生代中只占较小部分,这是两种回收方式能高效处理的原因。图5.6为 Mark-Sweep在老生代空间中标记后的示意图,黑色部分标记为死亡的对象。

 

###### 图5-6 Mark-Sweep在老生代空间中标记后的示意图 //TODO

 

​	Mark-Sweep**最大的问题**是在进行一次标记清除回收后,内存空间会出现不连续的状态。这种内存碎片会对后续的内存分配造成问题,因为很可能出现需要分配一个大对象的情况,这时所有的碎片空间都无法完成此次分配,就会提前触发垃圾回收,而这次回收是不必要的。

**为了解决 Mark-Sweep的内存碎片问题, Mark-Compact被提出来**。 Mark-Compact是标记整理的意思,是在 Mark-Sweep的基础上演变而来的。它们的差别在于对象在标记为死亡后,在整理的过程中将活着的对象往一端移动移动完成后,直接清理掉边界外的内存。图5-7为 Mark-Compact 完成标记并移动存活对象后的示意图,白色格子为存活对象,深色格子为死亡对象,浅色格子为存活对象移动后留下的空洞。



###### 图57 Mark-Compact完成标记并移动存活对象后的示意图 TODO




​	完成移动后,就可以直接清除最右边的存活对象后面的内存区域完成回收。这里将Mak-Sweep和 Mark-Compact结合着介绍不仅仅是因为两种策略是递进关系,在Ⅴ8的回收策略中两者是结合使用的。表5-1是目前介绍到的3种主要垃圾回收算法的简单对比。

表5-13种垃圾回收算法的简单对比

 

| 回收算法     | Mark-Sweep   | Mark-Compact | Scavenge           |
| ------------ | ------------ | ------------ | ------------------ |
| 速度         | 中等         | 最慢         | 最快               |
| 空间开销     | 少（有碎片） | 少（无碎片） | 双倍空间（无碎片） |
| 是否移动对象 | 否           | 是           | 是                 |

​                                  

​	从表5-中可以看到,在 Mark-Sweep和 Mark-Compact之间,由于 Mark-Compact需要移动对象

 所以它的执行速度不可能很快,**所以在取舍上,V8主要使用 Mark-Sweep,**

**在空间不足以对从新生代中晋升过来的对象进行分配时才使用 Mark-Compact**

 

###### Incremental Marking

​	为了避免出现 JavaScript应用逻辑与垃圾回收器看到的不一致的情况,垃圾回收的3种基本算法都需要将应用逻辑暂停下来,待执行完垃圾回收后再恢复执行应用逻辑,这种行为被称为**“全停顿”( stop-the-world)**。在V8的分代式垃圾回收中,一次小垃圾回收只收集新生代,由于新生代默认配置得较小,且其中存活对象通常较少,所以即便它是全停顿的影响也不大。但V8的老生代通常配置得较大,且存活对象较多,全堆垃圾回收(full垃圾回收)的标记、清理、整理等动作造成的停顿就会比较可怕,需要设法改善。

​		为了降低全堆垃圾回收带来的停顿时间,V8先从标记阶段入手,将原本要一口气停顿完成的动作改为增量标记( incremental marking),也就是拆分为许多小“步进”,每做完一“步进”就让 JavaScript应用逻辑执行一小会儿,垃圾回收与应用逻辑交替执行直到标记阶段完成。

###### 图5-8为增量标记示意图



​	V8在经过增量标记的改进后,垃圾回收的最大停顿时间可以减少到原本的16左右。V8后续还引入了延迟清理( lazy sweeping)与增量式整理( incremental compaction),让清理与整理动作也变成增量式的。同时还计划引入并行标记与并行清理,进一步利用多核性能降低每次停顿的时间。鉴于篇幅有限,此处不再深入讲解了。

 

###### 2.小结

​	从V8的自动垃圾回收机制的设计角度可以看到,V8对内存使用进行限制的缘由。新生代设计为一个较小的内存空间是合理的,而老生代空间过大对于垃圾回收并无特别意义。V8对内存限制的设置对于 Chrome浏览器这种每个选项卡页面使用一个V8实例而言,内存的使用是绰绰有余了。对于Node编写的服务器端来说,内存限制也并不影响正常场景下的使用。但是对于v8的垃圾回收特点和 JavaScript在单线程上的执行情况,垃圾回收是影响性能的因素之一。想要高性能的执行效率,需要注意让垃圾回收尽量少地进行,尤其是全堆垃圾回收。

 	以Web服务器中的会话实现为例,一般通过内存来存储,但在访问量大的时候会导致老生代中的存活对象骤增,不仅造成清理整理过程费时,还会造成内存紧张,甚至溢出(详情可参见第8章)。

##### 5.1.5查看垃圾回收日志

​	查看垃圾回收日志的方式主要是在启动时添加`-trace_gc`参数。在进行垃圾回收时,将会从标准输出中打印垃圾回收的日志信息。下面是一段示例,执行结束后,将会在 gc.log文件中得到所有垃圾回收信息

 

```
node --trace_gc -e "var a = [];for (var i = 0; i < 1000000; i++) a.push(new Array(100));" > gc.log 
```

下面是我截取的垃圾回收日志中的部分重要内容: 

```

```



​	通过分析垃圾回收日志,可以了解垃圾回收的运行状况,找出垃圾回收的哪些阶段比较耗时,触发的原因是什么。

 通过在Node启动时使用**--prof**参数,可以得到V8执行时的性能分析数据,其中包含了垃圾 回收执行时占用的时间。下面的代码不断创建对象并将其分配给局部变量a,这里将以下代码存为test01.js文件:

 

```
for (var i = 0; i < 1000000; i++) {
  var a = {};
} 
```



然后执行以下命令:

$ node --prof test01.js

 

这将会在目录下得到一个v8.log日志文件。该日志文件基本不具备可读性,内容大致如下:

 



​	所幸,V8提供了 **Linux-tick-processor**工具用于统计日志信息。该工具可以从Node源码的deps/v8/tools目录下找到, Windows下的对应命令文件为 windows-tick-processor.bat将该目录添加到环境变量PATH中,即可直接调用:

```
$linux-tick-processor v8.log
```



下面为我某次运行日志的统计结果: //TODO



统计内容较多,其中垃圾回收部分如下://TODO



由于不断分配对象,垃圾回收所占的时间为54%。按此比例,这意味着事件循环执行1000毫秒的过程中要给出54毫秒的时间用于垃圾回收。

 

#### 5.2 高效使用内存

​	在V8面前,开发者所要具备的责任是如何让垃圾回收机制更高效地工作。

##### 5.2.1作用域

​	提到如何触发垃圾回收,第一个要介绍的是作用域( scope)。在 JavaScript中能形成作用域的有函数调用、with以及全局作用域。

 

以如下代码为例:

```js
var foo = function () {
  var local = {};
};
```

foo()函数在每次被调用时会创建对应的作用域,函数执行结束后,该作用域将会销毁。同时作用域中声明的局部变量分配在该作用域上,随作用域的销毁而销毁。只被局部变量引用的对象存活周期较短。在这个示例中,由于对象非常小,将会分配在新生代中的From空间中。在作用域释放后,局部变量`local`失效,其引用的对象将会在下次垃圾回收时被释放。以上就是**最基本的内存回收过程**。

###### 1.标识符查找

 

​	与作用域相关的即是标识符查找。所谓标识符,可以理解为变量名。在下面的代码中,执行bar()函数时,将会遇到1ocal变量



```js
var bar = function () {
  console.log(local);
}; 
```

​	JavaScript在执行时会去查找该变量定义在哪里。它最先查找的是当前作用域,如果在当前作用域中无法找到该变量的声明,将会向上级的作用域里查找,直到查到为止。

###### 2.作用域链

在下面的代码中:

 

```js
var foo = function () {
  var local = 'local var'; 
  var bar = function () {
    var local = 'another var'; 
    var baz = function () {
      console.log(local);
    }; baz();
  }; 
  bar();
}; 
foo();
```



`local`变量在baz()函数形成的作用域里查找不到,继而将在bar()的作用域里寻找。如果去掉上述代码bar()中的1ocal声明,将会继续向上查找,一直到全局作用域。**这样的查找方式使得作用域像一个链条**。由于标识符的查找方向是向上的,所以变量只能向外访问,而不能向内访问。



###### 图59为变量在作用域中的查找示意图。//TOTO



​	当我们在baz()函数中访问local变量时,由于作用域中的变量列表中没有`local`,所以会向上 一个作用域中查找,接着会在bar()函数执行得到的变量列表中找到了一个`local`变量的定义,于是使用它。尽管在再上一层的作用域中也存在`local`的定义,但是不会继续查找了。如果查找一个不存在的变量,将会一直沿着作用域链查找到全局作用域,最后抛出未定义错误。

 	了解了作用域,有助于我们了解变量的分配和释放。

###### 3.变量的主动释放

​	如果变量是全局变量(不通过var声明或定义在globa变量上),由于全局作用域需要直到进程退出才能释放,此时将导致引用的对象常驻内存(常驻在老生代中)。如果需要释放常驻内存的对象,可以通过 delete操作来删除引用关系。或者将变量重新赋值,让旧的对象脱离引用关系。在接下来的老生代内存清除和整理的过程中,会被回收释放。下面为示例代码:



```js
global.foo = "I am global object";
console.log(global.foo); // => "I am global object" 
delete global.foo; 
//或者重新赋值
global.foo = undefined; // or null 
console.log(global.foo); // => undefined 
```

​	同样,如果在非全局作用域中,想主动释放变量引用的对象,也可以通过这样的方式。虽然delete操作和重新赋值具有相同的效果,但是在V8中通过 delete删除对象的属性有可能干扰v8的优化,所以**通过赋值方式解除引用更好**。

##### 5.2.2闭包

​	我们知道作用域链上的对象访问只能向上,这样外部无法向内部访问。如下代码可以正常打印:

```js
var foo = function () {
  var local = "局部量";
  (function () {
    console.log(local);
  }());
}; 
```



但在下面的代码中,却会得到`local`未定义的异常:

 

```js
var foo = function () {
  (function () {
    var local = "局部量";
  }());
  console.log(local);
};
```



在 JavaScript中,实现外部作用域访问内部作用域中变量的方法叫做**闭包**( closure)。这得益于高阶函数的特性:**函数可以作为参数或者返回值**。示例代码的如下:

 

```js
var foo = function () {
  var bar = function () {
    var local = "局部量";
    return function () {
      return local;
    };
  };
  var baz = bar();
  console.log(baz());
}; 
```



一般而言,在bar(函数执行完成后,局部变量`local`将会随着作用域的销毁而被回收。但是注意这里的特点在于返回值是一个匿名函数,且这个函数中具备了访问local的条件。虽然在后 续的执行中,在外部作用域中还是无法直接访问local,但是若要访问它,只要通过这个中间函数稍作周转即可。

​	闭包是 JavaScript的高级特性,利用它可以产生很多巧妙的效果。它的问题在于,一旦有变量引用这个中间函数,这个中间函数将不会释放,同时也会使原始的作用域不会得到释放,作用域中产生的内存占用也不会得到释放。除非不再有引用,才会逐步释放。

##### 5.2.3小结

​	在正常的 JavaScript执行中,无法立即回收的内存有闭包和全局变量引用这两种情况。由于V8的内存限制,要十分小心此类变量是否无限制地增加,因为它会导致老生代中的对象增多。

#### 5.3内存指标

​	一般而言,应用中存在一些全局性的对象是正常的,而且在正常的使用中,变量都会自动释放回收。但是也会存在一些我们认为会回收但是却没有被回收的对象,这会导致内存占用无限增长。一旦增长达到V8的内存限制,将会得到内存溢出错误,进而导致进程退出。

##### 5.3.1查看内存使用情况

前面我们提到了 process. memoryUsage()可以查看内存使用情况。除此之外**,os模块**中的totale()和 freemen()方法也可以查看内存使用情况。

 

###### 1.查看进程的内存占用

调用 process. memoryUsage()可以看到Node进程的内存占用情况,示例代码如下:

```
> process.memoryUsage()
{ rss: 4956160,
  heapTotal: 11255808,
  heapUsed: 6483328,
  external: 8711 }
>
```



**rss**是 resident set size的缩写,即进程的常驻内存部分。

进程的内存总共有几部分,一部分是rss,其余部分在交换区(swap)或者文件系统( filesystem)中。

​	除了rss外, heapTotal和 heapUsed对应的是V8的堆内存信息。 heapTotal是堆中总共申请的内存量, heapUsed表示目前堆中使用中的内存量。这3个值的单位都是字节。

为了更好地查看效果,我们格式化一下输出结果

```js
var showMem = function () {
  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }; 
  console.log('Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss)); 
  console.log('-----------------------------------------------------------');
}; 
```



同时,写一个方法用于不停地分配内存但不释放内存,相关代码如下:

```js
var useMem = function () {
  var size = 20 * 1024 * 1024;
  var arr = new Array(size); 
  for (var i = 0; i < size; i++) { 
    arr[i] = 0; 
  } 
  return arr;
};

var total = [];

for (var j = 0; j < 15; j++) {
  showMem(); 
  total.push(useMem());
} 
showMem(); 
```

 

将以上代码存为 outofmemory js并执行它,得到的输出结果如下:

```
$ node  outofheap.js
Process: heapTotal 6.23 MB heapUsed 3.82 MB rss 21.64 MB
-----------------------------------------------------------
Process: heapTotal 168.25 MB heapUsed 164.52 MB rss 182.94 MB
-----------------------------------------------------------
Process: heapTotal 328.26 MB heapUsed 324.53 MB rss 343.01 MB
-----------------------------------------------------------
Process: heapTotal 488.27 MB heapUsed 484.53 MB rss 503.12 MB
-----------------------------------------------------------
Process: heapTotal 648.28 MB heapUsed 644.53 MB rss 663.18 MB
-----------------------------------------------------------
Process: heapTotal 808.29 MB heapUsed 804.53 MB rss 823.21 MB
-----------------------------------------------------------
Process: heapTotal 968.30 MB heapUsed 964.54 MB rss 983.26 MB
-----------------------------------------------------------
Process: heapTotal 1130.32 MB heapUsed 1123.70 MB rss 1143.69 MB
-----------------------------------------------------------
Process: heapTotal 1290.33 MB heapUsed 1283.70 MB rss 1303.74 MB
-----------------------------------------------------------


<--- Last few GCs --->

[20636:0000022EAA36D160]     1013 ms: Mark-sweep 1283.7 (1288.2) -> 1283.7 (1288.2) MB, 92.1 / 0.0 ms  (average mu = 0.216, current mu
 = 0.000) last resort GC in old space requested
[20636:0000022EAA36D160]     1106 ms: Mark-sweep 1283.7 (1288.2) -> 1283.7 (1288.2) MB, 92.6 / 0.0 ms  (average mu = 0.121, current mu
 = 0.000) last resort GC in old space requested

<--- JS stacktrace --->

==== JS stack trace =========================================

    0: ExitFrame [pc: 000001F780C5C5C1]
Security context: 0x00e95569e6e9 <JSObject>
    1: useMem [000000E9556E2FB1] [D:\0-refer\node\projects\outofheap.js:~10] [pc=000001F780CEF67E](this=0x036ed998d481 <JSGlobal Objec
t>)
    2: /* anonymous */ [000000E9556E2BA1] [D:\0-refer\node\projects\outofheap.js:23] [bytecode=0000005A7BC56C49 offset=37](this=0x00e9
556f46b9 <Object map = 00000292F3B02571>,exports=0x00e9556f46b9 <Object map = 00000292...

FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory

```

​	

可以看到,每次调用 useMem都导致了3个值的增长。在接近1500MB的时候,无法继续分配内存,然后进程内存溢出了,连循环体都无法执行完成,仅执行了7次。

 

###### 2.查看系统的内存占用

​	与 process.memoryUsage()不同的是,os模块中的 totalmem()和 freemem()这两个方法用于查看操作系统的内存使用情况,它们分别返回**系统的总内存**和**闲置内存**,以字节为单位。示例代码如下

```
$ node 
> os.totalmem() 
8589934592 
> os.freemem() 
4527833088 
```



​	从输出信息可以看到我的电脑的总内存为8GB,当前闲置内存大致为42GB。

##### 5.3.2 堆外内存

​	通过 process. momoryUsage(的结果可以看到,**堆中的内存用量总是小于进程的常驻内存用量**,这意味着Node中的内存使用并非都是通过V8进行分配的。我们将那些不是通过v8分配的内存称为**堆外内存**

​	这里我们将前面的 useMem()方法稍微改造一下,将Aray变为 Buffer,将size变大,每一次构造200MB的对象,相关代码如下:

###### outofheap.js

```js
var useMem = function () {
  var size = 200 * 1024 * 1024; 
  var buffer = new Buffer(size); 
  for (var i = 0; i < size; i++) {
    buffer[i] = 0;
  } return buffer;
};
```

 

重新执行该代码,得到的输出结果如下所示:

```
$ node  outofheap.js
Process: heapTotal 6.23 MB heapUsed 3.83 MB rss 21.60 MB
-----------------------------------------------------------
Process: heapTotal 8.23 MB heapUsed 4.73 MB rss 223.25 MB
-----------------------------------------------------------
Process: heapTotal 8.23 MB heapUsed 4.74 MB rss 423.45 MB
-----------------------------------------------------------
Process: heapTotal 10.23 MB heapUsed 4.26 MB rss 623.82 MB
-----------------------------------------------------------
Process: heapTotal 10.23 MB heapUsed 4.26 MB rss 823.82 MB
-----------------------------------------------------------
Process: heapTotal 10.23 MB heapUsed 4.03 MB rss 1023.84 MB
-----------------------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.84 MB rss 1224.33 MB
-----------------------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.85 MB rss 1424.34 MB
-----------------------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.85 MB rss 1624.37 MB
-----------------------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.85 MB rss 1824.38 MB
-----------------------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.85 MB rss 2024.38 MB
-----------------------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.85 MB rss 2224.39 MB
-----------------------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.84 MB rss 2424.39 MB
-----------------------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.84 MB rss 2624.40 MB
-----------------------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.85 MB rss 2824.40 MB
-----------------------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.84 MB rss 3024.41 MB
-----------------------------------------------------------
(node:8628) [DEP0005] DeprecationWarning: Buffer() is deprecated due to security and usability issues. Please use the Buffer.alloc(),
Buffer.allocUnsafe(), or Buffer.from() methods instead.
```

​	

​	我们看到15次循环都完整执行,并且三个内存占用值与前一个示例完全不同。在改造后的输出结果中, heapTotal与 heapUsed的变化极小,唯一变化的是rss的值,并且该值已经远远超过v8的限制值。这其中的原因是 B**uffer对象不同于其他对象,它不经过v8的内存分配机制,所以也不会有堆内存的大小限制。**

​	**这意味着利用堆外内存可以突破内存限制的问题。**

​	**为何 Buffer对象并非通过v8分配?**这在于Node并不同于浏览器的应用场景。在浏览器中JavaScript直接处理字符串即可满足绝大多数的业务需求,而Noe则需要处理网络流和文件IO流,操作字符串远远不能满足传输的性能需求。关于 Buffer细节可参见第6章。

##### 5.3.3小结

​	从上面的介绍可以得知,Node的内存构成主要由通过V8进行分配的部分和Node自行分配的部分。受V8的垃圾回收限制的主要是V8的堆内存。

 

#### 5.4内存泄漏

​	Node对内存泄漏十分敏感,一旦线上应用有成千上万的流量,那怕是一个字节的内存泄漏也会造成堆积,垃圾回收过程中将会耗费更多时间进行对象扫描,应用响应缓慢,直到进程内存溢出,应用崩溃。在V8的垃圾回收机制下,在通常的代码编写中,很少会出现内存泄漏的情况。但是内存泄漏通常产生于无意间,较难排查。尽管内存泄漏的情况不尽相同,**但其实质只有一个,那就是应当回收的对象出现意外而没有被回收,变成了常驻在老生代中的对象**。

通常,造成内存泄漏的原因有如下几个。

- 缓存。
- 队列消费不及时。
- 作用域未释放。

##### 5.4.1 慎将内存当做缓存

 	缓存在应用中的作用举足轻重,可以十分有效地节省资源。因为它的访问效率要比IO的效率高,一旦命中缓存,就可以节省一次IO的时间。

​	但是在Node中,缓存并非物美价廉。一旦一个对象被当做缓存来使用,那就意味着它将会常驻在老生代中。缓存中存储的键越多,长期存活的对象也就越多,这将导致垃圾回收在进行扫描和整理时,对这些对象做无用功。

​	另一个问题在于, JavaScrip开发者通常喜欢用对象的键值对来缓存东西,但这与严格意义上的缓存又有着区别,严格意义的缓存有着完善的过期策略,而普通对象的键值对并没有。

如下代码虽然利用 JavaScript对象十分容易创建一个缓存对象,但是受垃圾回收机制的影响,只能小量使用:

 

```js
var cache = {}; var get = function (key) {
  if (cache[key]) {
    return cache[key];
  } else {
    // get from otherwise   
  }
};
var set = function (key, value) {
  cache[key] = value;
};

```

上述示例在解释原理后,十分容易理解,如果需要,只要限定缓存对象的大小,加上完善的过期策略以防止内存无限制增长,还是可以一用的。



这里给出一个可能无意识造成内存泄漏的场景: memorize。下面是著名类库 underscore对memoize的实现

```js
_.memoize = function (func, hasher) {
  var memo = {};
  hasher || (hasher = _.identity);
  return function () {
    var key = hasher.apply(this, arguments);
    return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
  };
};
```

 

它的原理是以参数作为键进行缓存,以内存空间换CPU执行时间。这里潜藏的陷阱即是每个被执行的结果都会按参数缓存在mem对象上,不会被清除。这在前端网页这种短时应用场景中不存在大问题,但是执行量大和参数多样性的情况下,会造成内存占用不释放。

​	**所以在Node中,任何试图拿内存当缓存的行为都应当被限制。当然,这种限制并不是不允许使用的意思,而是要小心为之。**

###### 1.緩存限制策略

​	为了解决缓存中的对象永远无法释放的问题,需要加入一种策略来限制缓存的无限增长。为此我曾写过一个模块 imitablemap,它可以实现对键值数量的限制。下面是其实现:

```js


var LimitableMap = function (limit) {
  this.limit = limit || 10; this.map = {};
  this.keys = [];
};

var hasOwnProperty = Object.prototype.hasOwnProperty;

LimitableMap.prototype.set = function (key, value) {
  var map = this.map; var keys = this.keys;
  if (!hasOwnProperty.call(map, key)) {
    if (keys.length === this.limit) {
      var firstKey = keys.shift();
      delete map[firstKey];
    }
    keys.push(key);
  } map[key] = value;
};

LimitableMap.prototype.get = function (key) { 
  return this.map[key];
 };

module.exports = LimitableMap; 
```



可以看到,实现过程还是非常简单的。记录键在数组中,一旦超过数量,就以先进先出的方式进行淘汰。当然,这种淘汰策略并不是十分高效,只能应付小型应用场景。如果需要更高效的缓存,可以参见IsaacZ.Schlueter采用LRU算法的缓存,地址为https://github.com/isaacs/node-lru-cache结合有限制的缓存, memoize还是可用的。

​	另一个案例在于**模块机制**。在第2章的模块介绍中,为了加速模块的引入,所有模块都会通过编译执行,然后被缓存起来。由于通过 exports导出的函数,可以访问文件模块中的私有变量,这样每个文件模块在编译执行后形成的作用域因为模块缓存的原因,不会被释放。示例代码如下

 

所示:

```js
(function (exports, require, module, __filename, __dirname) {
  var local = "局部量";
  exports.get = function () {
    return local;
  };
}); 
```



​	由于模块的缓存机制,**模块是常驻老生代的**。在设计模块时,要十分小心内存泄漏的出现。在下面的代码,每次调用leak()方法时,都导致局部变量leakArray不停增加内存的占用,且不被释放:

```js

var leakArray = [];
exports.leak = function () {
  leakArray.push("leak" + Math.random());
};
```

如果模块不可避免地需要这么设计,**那么请添加清空队列的相应接口,以供调用者释放内存。**

###### 2.缓存的解决方案

​	直接将内存作为缓存的方案要十分慎重。除了限制缓存的大小外,另外要考虑的事情是,进程之间无法共享内存。如果在进程内使用缓存,这些缓存不可避免地有重复,对物理内存的使用是一种浪费。

​	**如何使用大量缓存,目前比较好的解决方案是采用进程外的缓存,进程自身不存储状态**。**外部的缓存**软件有着良好的缓存过期淘汰策略以及自有的内存管理,不影响Node进程的性能。它的好处多多,在Node中主要可以解决以下两个问题。

​	(1)将缓存转移到外部,减少常驻内存的对象的数量,让垃圾回收更高效。

​	(2)进程之间可以共享缓存。

目前,市面上较好的缓存有 Redis和 Memcached。 Node模块的生态系统十分完善,这两个产品的客户端都有,通过以下地址可以查看具体使用详情。

 Redishttps://github.com/mranney/node_redis。

  Memcachedhttps://github.com/3rd-Eden/node-memcached

****

##### 5.4.2 关注队列状态

​	在解决了缓存带来的内存泄漏问题后,另一个不经意产生的内存泄漏则是队列。在第4章中可以看到,在 JavaScript可以通过队列(数组对象)来完成许多特殊的需求,比如 Bagpipe。队列在消费者生产者模型中经常充当中间产物。这是一个容易忽略的情况,因为在大多数应用场景下,消费的速度远远大于生产的速度,内存泄漏不易产生。**但是一旦消费速度低于生产速度将会形成堆积。**

​	举个实际的例子,有的应用会收集日志。如果欠缺考虑,也许会采用数据库来记录日志。日志通常会是海量的,数据库构建在文件系统之上,写人效率远远低于文件直接写入,于是会形成数据库写入操作的堆积,而 JavaScript相关的作用域也不会得到释放,内存占用不会回落,从而出现内存泄漏。

​	遇到这种场景,表层的解决方案是换用消费速度更高的技术。在日志收集的案例中,换用文件写人日志的方式会更高效。需要注意的是,如果生产速度因为某些原因突然激增,或者消费速度因为突然的系统故障降低,内存泄漏还是可能出现的。

​	**深度的解决方案应该是监控队列的长度,一旦堆积,应当通过监控系统产生报警并通知相关人员。**另一个解决方案是**任意异步调用都应该包含超时机制**,一旦在限定的时间内未完成响应,通过回调函数传递超时异常,使得任意异步调用的回调都具备可控的响应时间,给消费速度一个下限值。

​	对于 Bagpipe而言,它提供了**超时模式**和**拒绝模式**。启用超时模式时,调用加入到队列中就开始计时,超时就直接响应一个超时错误。启用拒绝模式时,当队列拥塞时,新到来的调用会直接响应拥塞错误。这两种模式都能够有效地防止队列拥塞导致的内存泄漏问题。

#### 5.5内存泄漏排查

​	前面提及了几种导致内存泄漏的常见类型。在Node中,由于V8的堆内存大小的限制,它对内存泄漏非常敏感。当在线服务的请求量变大时,哪怕是一个字节的泄漏都会导致内存占用过高这里介绍一下遇到内存泄漏时的排查方案。现在已经有许多工具用于定位Node应用的内存泄漏,下面是一些常见的工具。

- ​	v8-profiler。由 Danny Coates提供,它可以于对v8堆内存抓取快照和对CPU进行分析,但该项目已经有3年没有维护了

- ​	node-heapdump。这是Node核心贡献者之一 Ben noordhuis编写的模块,它允许对v8堆内存抓取快照,用于事后分析。
- ​	node-mtrace。由 Jimb esser提供,它使用了GCC的 mtrace工具来分析堆的使用。
- ​	dtrace。在 Joyent的 Smarts系统上,有完善的 dtrace工具用来分析内存泄漏。

-  	node- memwatch。来自 Mozilla. Lloyd Hilaiel贡献的模块,采用 WTFPL许可发布。


 

由于各种条件限制,这里将只着重介绍通过 **node-heapdump**和 **node-memwatch**两种方式进行内存泄漏的排查。

 

##### 5.5.1 node-heapdump

​	想要了解 node-heapdump对内存泄漏进行排查的方式,我们需要先构造如下一份包含内存泄漏的代码示例,并将其存为 server.js文件:

```js
var leakArray = [];
var leak = function () {
  leakArray.push("leak" + Math.random());
};

http.createServer(function (req, res) {
  leak();
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
}).listen(1337);

console.log('Server running at http://127.0.0.1:1337/');
```

 

在上面这段代码中,每次访问服务进程都将引起LeakArray数组中的元素增加,而且得不到回收。我们可以用curl工具具输入`http://127.0.0.1:1337/`命令来模拟用户访问。

 

·安装node-heapdump

 安装 node-heapdump非常简单,执行以下命令即可:

```
$ npm install heapdump 
```

 

安装node- heapdump后,在代码的第一行添加如下代码将其引人:

```js
var heapdump = require('heapdump');
```

引入 node-heapdump后,就可以启动服务进程,并接受客户端的请求。访问多次之后,

 

leakArray中就会具备大量的元素。这个时候我们通过向服务进程发送SIGUSR2信号,让

 node-heapdump抓拍一份堆内存的快照。发送信号的命令如下:

```
$ kill -USR2 <pid> 
```


​	这份抓取的快照将会在文件目录下以 heapdump-<sec>.<usec>.heapsnapshot的格式存放。这是一份较大的JSON文件,需要通过 Chrome的开发者工具打开查看。

​	在 Chrome的开发者工具中选中 Profiles面板,右击该文件后,从弹出的快捷菜单中选择Load选项,打开刚才的快照文件,就可以查看堆内存中的详细信息,如图5-10所示。

 

 

 

​	在图5-10中可以看到有大量leak字符串存在,这些字符串就是一直未能得到回收的数据。通过在开发者工具的面板中查看内存分布,我们可以找到泄漏的数据,然后根据这些信息找到造成泄漏的代码。

 

##### 5.5.2 node-memwatch

​	node- memwatch的用法和 node-heapdump-样,我们需要准备一份具有内存泄漏的代码。这里不再赘述 node-memwatch的安装过程。整个示例代码如下

```js
var memwatch = require('memwatch');
memwatch.on('leak', function (info) {
  console.log('leak:');
  console.log(info);
});

memwatch.on('stats', function (stats) {
  console.log('stats:')
  console.log(stats);
});

var http = require('http');

var leakArray = [];
var leak = function () {
  leakArray.push("leak" + Math.random());
};

http.createServer(
  function (req, res) {
    leak(); res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
  }).listen(1337);

console.log('Server running at http://127.0.0.1:1337/');
```

 

1. ###### stats事件

​	在进程中使用 node-memwatch.之后,每次进行全堆垃圾回收时,将会触发一次 stats事件,这个事件将会传递内存的统计信息。在对上述代码创建的服务进程进行访问时,某次 stats事件打印的数据如下所示,其中每项的意义写在注释中了:

 

```
stats: {
  num_full_gc: 4, // 第几次全堆垃圾回收
  num_inc_gc: 23, // 第几次增量垃圾回收
  heap_compactions: 4, // 第几次对老生代进行整理
  usage_trend: 0, // 使用趋势
  estimated_base: 7152944, // 预估基数
  current_base: 7152944, // 当前基数 
  min: 6720776, //最小
  max: 7152944//最大
} 
```

​	在这些数据中, num_full_gc 和num_inc_gc比较直观地反应了垃圾回收的情况。

###### 2.leak事件

​	如果经过连续5次垃圾回收后,内存仍然没有被释放,这意味着有内存泄漏的产生,node-memwatch会出发一个1eak事件。某次leak事件得到的数据如下所示:

```json
leak: {
  start: Mon Oct 07 2013 13: 46: 27 GMT+0800 (CST),   
  end: Mon Oct 07 2013 13: 54: 40 GMT+0800 (CST),  
  growth: 6222576,   
  reason: 'heap growth over 5 consecutive GCs (8m 13s) - 43.33 mb/hr' 
}
```

这个数据能显示5次垃圾回收的过程中内存增长了多少。

 

###### 3.堆内存比较

​	最终得到的leak事件的信息只能告知我们应用中存在内存泄漏,具体问题产生在何处还需要从V8的堆内存上定位。node-memwatch提供了抓取快照和比较快照的功能,它能够比较堆上对象的名称和分配数量,从而找出导致内存泄漏的元凶。

下面为一段导致内存泄漏的代码,这是通过 node-memwatch获取堆内存差异结果的示例:

```js

var memwatch = require('memwatch'); var leakArray = [];
var leak = function () { leakArray.push("leak" + Math.random()); };

// Take first snapshot
var hd = new memwatch.HeapDiff();

for (var i = 0; i < 10000; i++) {
  leak();
}

// Take the second snapshot and compute the diff 
var diff = hd.end();
console.log(JSON.stringify(diff, null, 2));
```

执行上面这段代码,得到的输出结果如下所示

 

```json


$ node diff.js  {
  "before": {
    "nodes": 11719,
    "time": "2013-10-07T06:32:07.000Z",
    "size_bytes": 1493304,
    "size": "1.42 mb"
  },
  "after": {
    "nodes": 31618,
    "time": "2013-10-07T06:32:07.000Z",
    "size_bytes": 2684864,
    "size": "2.56 mb"
  },
  "change": {
    "size_bytes": 1191560,
    "size": "1.14 mb",
    "freed_nodes": 129,
    "allocated_nodes": 20028,
    "details": [
      {
        "what": "Array",
        "size_bytes": 323720,
        "size": "316.13 kb",
        "+": 15,
        "-": 65
      },
      {
        "what": "Code",
        "size_bytes": -10944,
        "size": "-10.69 kb",
        "+": 8,
        "-": 28
      },
      {
        "what": "String",
        "size_bytes": 879424,
        "size": "858.81 kb",
        "+": 20001,
        "-": 1
      }
    ]
  }
}
```



在上面的输出结果中,主要关注 change节点下的 freed_nodes和allocated_nodes,它们记录了释放的节点数量和分配的节点数量。这里由于有内存泄漏,分配的节点数量远远多余释放的节点数量。在 details下可以看到具体每种类型的分配和释放数量,主要问题展现在下面这段输出中

```json
{
  "what": "String",
  "size_bytes": 879424,
  "size": "858.81 kb",
  "+": 20001, //分配的字符串对象数量
  "-": 1//释放的字符串对象数量
}
```

​	

​	在上述代码中,加号和减号分别表示分配和释放的字符串对象数量。可以通过上面的输出结果猜测到,有大量的字符串没有被回收。

##### 5.5.3小结

​		从本节的内容我们可以得知,排查内存泄漏的原因**主要通过对堆内存进行分析而找到**。node-heapdump和 node-memwatch各有所长,读者可以结合它们的优势进行内存泄漏排查。

 

#### 5.6大内存应用

​	在Node中,不可避免地还是会存在操作大文件的场景。由于Node的内存限制,操作大文件也需要小心,好在Node提供了 **stream模块**用于处理大文件。

​	stream模块是Node的原生模块,直接引用即可。 stream继承自 EventEmitter,具备基本的自定义事件功能,同时抽象出标准的事件和方法。它分可读和可写两种。Node中的大多数模块都有stream的应用,比如fs的 createReadStream()和 createwritestream()方法可以分别用于创建文件的可读流和可写流, process模块中的 stdin和 stdout则分别是可读流和可写流的示例。=

​	由于V8的内存限制,我们无法通过fs.readFile()和fs.writeFile()直接进行大文件的操作,而改用

**fs.createReadStream()**和**fs.createwriteStream()**方法通过流的方式实现对大文件的操作。

下面的代码展示了如何读取一个文件,然后将数据写入到另一个文件的过程:

```js
var reader = fs.createReadStream('in.txt');
var writer = fs.createWriteStream('out.txt');
reader.on('data', function (chunk) {
  writer.write(chunk);
});
reader.on('end', function () {
  writer.end();
});
```



由于读写模型固定,上述方法有更简洁的方式,具体如下所示:

 

```js
var reader = fs.createReadStream('in.txt');
var writer = fs.createWriteStream('out.txt');
reader.pipe(writer);
```



 

​	可读流提供了管道方法pipe(),封装了data事件和写入操作。通过流的方式,上述代码不会受到V8内存限制的影响,有效地提高了程序的健壮性。

​	如果**不需要进行字符串层面的操作**,则不需要借助v8来处理,可以尝试进行纯粹的 **Buffer操作**,这不会受到v8堆内存的限制。但是这种大片使用内存的情况依然要小心,即使V8不限制堆内存的大小,物理内存依然有限制。

#### 5.7总结

​	Node将 Javascript的主要应用场景扩展到了服务器端,相应要考虑的细节也与浏览器端不同,需要更严谨地为每一份资源作出安排。总的来说**,内存在Node中不能随心所欲地使用,但也不是完全不擅长**。本章介绍了内存的各种限制,希望读者可以在使用中规避禁忌,与生态系统中的各种软件搭配,发挥Noe的长处。 

#### 5.8参考资源

 https://github.com/joyent/node/wiki/FAQ 

 http://www.cs.sunysb.edu/~cse304/Fall08/Lectures/mem-handout.pdf 

 http://en.wikipedia.org/wiki/Resident_set_size 

 https://github.com/isaacs/node-lru-cache 

 https://github.com/mranney/node_redis 

 https://github.com/3rd-Eden/node-memcached 

 http://nodejs.org/docs/latest/api/stream.html 

 http://www.showmuch.com/a/20111012/215033.html 

 https://github.com/lloyd/node-memwatch 

 https://github.com/bnoordhuis/node-heapdump 

 http://www.williamlong.info/archives/3042.html 

 https://code.google.com/p/v8/issues/detail?id=847 

 http://blog.chromium.org/2011/11/game-changer-for-interactive.html 