第6章 理解 Buffer

 

 

 

 

 

 

 

 

 

JavaScript对于字符串( string)的操作十分友好,无论是宽字节字符串还是单字节字符串,都被认为是一个字符串。示例代码如下所示

 

console. log("0123456789° length);∥10

 

console. log(“零一二三四五六七八九" length);//0

 

console.log(" \uoobd”, length);∥1

 

对比PHP中的字符串统计,我们需要动用额外的函数来获取字符串的长度。示例代码如下所示:

 

pnp

echo strlen("0123456789");∥/10

 

echo"\n";

echo strlen("零一二三四五六七八九");∥30

echo     n";

 

echo mb strlen(“*一二三四五六七八九“,"utf-8");/10 echo"Ⅶn";

 

与第5章介绍的内容一样,本章讲述的也是前端 JavaScrip开发者不曾涉及的内容。文件和网

 

络ⅣO对于前端开发者而言都是不曾有的应用场景,因为前端只需做一些简单的字符串操作或DOM操作基本就能满足业务需求,在 ECMAScrip规范中,也没有对这些方面做任何的定义,只

 

有 Commonjs中有部分二进制的定义。由于应用场景不同,在Node中,应用需要处理网络协议、操作数据库、处理图片、接收上传文件等,在网络流和文件的操作中,还要处理大量二进制数据,

 

JavaScript自有的字符串远远不能满足这些需求,于是 Buffer对象应运而生。

 

6.1 Buffer结构

 

 

Buffer是一个像Aray的对象,但它主要用于操作字节。下面我们从模块结构和对象结构的层

 

面上来认识它。

 

6.11模块结构

 

Buffer是一个典型的 JAvasCript与C艹+结合的模块,它将性能相关部分用C艹+实现,将非性能

 

相关的部分用 JavaScrip实现,如图6-1所示。


 

 


 

138第6章理解 Buffer

 

 

JavaScript核心模块| Buffer// SlowBuffer

 

 

 

 

C艹内建模块

 

图61 Buffer的分工

 

第5章揭示了Buffer所占用的内存不是通过V8分配的,属于堆外内存。由于Ⅴ8垃圾回收性能的影响,将常用的操作对象用更高效和专有的内存分配回收策略来管理是个不错的思路。

 

由于Buffer太过常见,Node在进程启动时就已经加载了它,并将其放在全局对象(global)上。所以在使用 Buffer时,无须通过 require()即可直接使用。

 

 

6.12 Buffer对象

 

Buffer对象类似于数组,它的元素为16进制的两位数,即0到255的数值。示例代码如下所示:

 

var str="深入漫出node.js";

 

var buf new Buffer(str,utf-8);

 

console. log(buf)

 

// =><Buffer e6 b7 b1 e5 85 a5 e6 b5 85 e5 87 ba 6e 6f 64 65 2e 6a 73>

 

由上面的示例可见,不同编码的字符串占用的元素个数各不相同,上面代码中的中文字在UTF8编码下占用3个元素,字母和半角标点符号占用1个元素。

 

Buffer> Array类型的影响很大,可以访问 length属性得到长度,也可以通过下标访问元素,

 

在构造对象时也十分相似,代码如下:

 

var buf s new Buffer(100);

console.log(buflength);//=>100

 

上述代码分配了一个长100字节的Bur对象。可以通过下标访问刚初始化的 Buffer的元素,

 

代码如下:

 

console. log(buf[10]);

 

这里会得到一个比较奇怪的结果,它的元素值是一个0到255的随机值。

 

同样,我们也可以通过下标对它进行赋值

 

buf[0]=100;

console.log(buf[10]);//=>100

 

值得注意的是,如果给元素赋值不是0到25的整数而是小数时会怎样呢?示例代码如下所示:

 

buf[20]=-100;

 

console. log(buf[20]);//156

buf21]=300;

console.log(buf[21]);//44

 

buf[22]=31415;


 

 

console.log(buf[12】1);∥/3


 

给元素的赋值如果小于0,就将该值逐次加256,直到得到一个0到255之间的整数。如果得到

 

的数值大于255,就逐次减256,直到得到0-255区间内的数值。如果是小数,舍弃小数部分,只

 

保留整数部分。

 

61.3 Buffer内存分配

 

Buffer对象的内存分配不是在V8的堆内存中,而是在Node的C++层面实现内存的申请的。因为处理大量的字节数据不能采用需要一点内存就向操作系统申请一点内存的方式,这可能造成大

 

量的内存申请的系统调用,对操作系统有一定压力。为此Node在内存的使用上应用的是在C++

 

层面申请内存、在 JavaScript中分配内存的策略。

 

为了高效地使用申请来的内存,Node采用了slab分配机制。sab是一种动态内存管理机制,最早诞生于 SunOS操作系统( Solaris)中,目前在一些操作系统中有广泛的应用,如 FreeBSD和iux

 

简单而言,slab就是一块申请好的固定大小的内存区域。slab具有如下3种状态。

 

afll完全分配状态。

 

口 partial:部分分配状态。

 

口 empty:没有被分配状态。

 

当我们需要一个Buer对象,可以通过以下方式分配指定大小的Buer对象:

 

new Buffer(size);

 

Node以8KB为界限来区分Buer是大对象还是小对象

 

Buffer. poolsize -8*1024;

 

这个8KB的值也就是每个sab的大小值,在 JavaScript层面,以它作为单位单元进行内存的分配。

 

1.分配小Bufe对象

 

如果指定Buer的大小少于8KB,Node会按照小对象的方式进行分配。 Buffer的分配过程中

 

主要使用一个局部变量poo1作为中间处理对象,处于分配状态的slab单元都指向它。以下是分配一个全新的slab单元的操作,它会将新申请的 SlowBuffer对象指向它:

 

var pool:

 

function allocPooloi

 

pool= new SlowBuffer(BufferpoolSize);

 

pool used = 0;

 

图62为一个新构遣的sab单元示例。

 

 

 

 

 

 

used: 0


 

 

图62新构造的sab单元示例


 

140第6章理解 Buffer

 

 

在图6-2中,slab处于empy状态。

 

构造小Bur对象时的代码如下:

 

new Buffer(1024);

 

这次构造将会去检查p0对象,如果pool没有被创建,将会创建一个新的sab单元指向它:

 

if (Ipool II pool. length-pool used this length) allocPool0;

 

同时当前 Buffer对象的 parent属性指向该slab,并记录下是从这个slab的哪个位置( offset)

 

开始使用的,slab对象自身也记录被使用了多少字节,代码如下:

 

this parent pool;

 

this offset pool used

 

pool used +a thislength;

if (pool used&7) pool. used=(pool used +8)&"7:

 

图63为从一个新的slab单元中初次分配一个Buer对象的示意图。

 

 

 

offset: 0

 

 

Buffer1

 

 

used: 1024

 

 

图63从一个新的sab单元中初次分配一个 Buffer对象

 

这时候的sab状态为 partial

 

当再次创建一个 Buffer对象时,构造过程中将会判断这个ab的剩余空间是否足够。如果足

 

够,使用剩余空间,并更新sab的分配状态。下面的代码创建了一个新的Bur对象,它会引起

 

一次slab分配:

 

new Buffer(3000);

 

图64为再次分配的示意图。

 

 

 

offset: 1024

 

 

Buffer1                            Buffer

 

 

 

 

 

图64从slab单元中再次分配一个Burr对象

 

如果sab剩余的空间不够,将会构造新的slab,原slab中剩余的空间会造成浪费。例如,第一次构造1字节的 Buffer对象,第二次构造8192字节的 Buffer对象,由于第二次分配时slab中的空间


 

不够,所以创建并使用新的sab,第一个slab的8KB将会被第一个1字节的Buer对象独占。下面

 

的代码一共使用了两个slab单元

 

new Buffer (1);

 

new Buffer(8192);

 

这里要注意的事项是,由于同一个sab可能分配给多个 Buffer对象使用,只有这些小Buer对象在作用域释放并都可以回收时,slab的8KB空间才会被回收。尽管创建了1个字节的 Buffer对象,

 

但是如果不释放它,实际可能是8KB的内存没有释放。

 

2.分配大 Buffer对象

 

如果需要超过8KB的Bue对象,将会直接分配一个 SlowBuffer对象作为sab单元,这个sab

 

单元将会被这个大 Buffer对象独占。

 

// Big buffer, just alloc one

 

this parent new SlowBuffer(this length);

 

this offset= o;

 

这里的S1 owBuffer类是在C艹中定义的,虽然引用 buffer模块可以访问到它,但是不推荐直接操作它,而是用 Buffer替代

 

上面提到的 Buffer对象都是 JavaScript层面的,能够被v8的垃圾回收标记回收。但是其内部的

 

parent属性指向的 SlowBuffer对象却来自于Node自身C++中的定义,是C++层面上的Bufr对象,

 

所用内存不在8的堆中。

 

3.小结

 

简单而言,真正的内存是在Node的C+层面提供的, JavaScript层面只是使用它。当进行小而频繁的Buer操作时,采用slab的机制进行预先申请和事后分配,使得 JavaScript到操作系统之间不必有过多的内存申请方面的系统调用。对于大块的 Buffer而言,则直接使用C++层面提供的内

 

存,而无需细腻的分配操作。

 

62 Buffer的转换

 

 

Buffer对象可以与字符串之间相互转换。目前支持的字符串编码类型有如下这几种。

 

口ASCI

 

口UTF8

 

口UTF-16 LE/UCS-2

 

口Base64

 

日 Binary

 

口He

 

621字符串转 Buffer


 

 

字符串转Buer对象主要是通过构造函数完成的:


 

142第6章理解Buer

 

 

new Buffer(str, [encoding);

 

通过构造函数转换的 Buffer对象,存储的只能是一种编码类型。 encoding参数不传递时,默认按UTF-8编码进行转码和存储。

 

一个Buer对象可以存储不同编码类型的字符串转码的值,调用 write()方法可以实现该目

 

的,代码如下:

 

buf. write(string, [offset], [length], [encoding])

 

由于可以不断写入内容到 Buffer对象中,并且每次写入可以指定编码,所以 Buffer对象中可以存在多种编码转化后的内容。需要小心的是,每种编码所用的字节长度不同,将 Buffer反转回字符串时需要谨慎处理。

 

622 Buffer转字符串

 

实现Buer向字符串的转换也十分简单, Buffer.对象的 tostring()可以将Buer对象转换为字

 

符串,代码如下:

 

buf tostring([encoding, [start], [end])

 

比较精巧的是,可以设置 encoding(默认为UTF-8)、 start、end这3个参数实现整体或局部的转换。如果 Buffer对象由多种编码写人,就需要在局部指定不同的编码,才能转换回正常的编

 

码。

 

623Bufe不支持的编码类型

 

目前比较遗憾的是,Node的 Buffer对象支持的编码类型有限,只有少数的几种编码类型可以

 

在字符串和 Buffer之间转换。为此, Buffer提供了一个 isEncoding()函数来判断编码是否支持转换:

 

Buffer. isEncoding(encoding)

 

将编码类型作为参数传入上面的函数,如果支持转换返回值为true,否则为 false很遗憾的是,在中国常用的GBK、GB2312和BIG-5编码都不在支持的行列中。

 

对于不支持的编码类型,可以借助Nod生态圈中的模块完成转换。ionv和icon-1ite两个

 

模块可以支持更多的编码类型转换,包括 Windows125系列、ISO-8859系列、 IBMDOS代码页系

 

列、 Macintosh系列、KO8系列,以及 LatinI、US-ASCI,也支持宽字节编码GBK和GB2312。lconv-lite采用纯 vaSari实现,icon则通过C+调用 lubicon库完成。前者比后者更轻量,

 

无须编译和处理环境依赖直接使用。在性能方面,由于转码都是耗用cPU,在Ⅴ8的高性能下,少

 

了C艹到 JavaScript的层次转换,纯 JavaScript的性能比C++实现得更好。

 

以下为 iconv-lie示例代码:

 

var iconv require('iconv-lite);


 

 

∥Buer转字符串

 

var str= iconv decode(buf,win1251


 

字符串转 Buffer

 

var buf iconvencode ("Sample input string",'win1251);

 

另外, iconv和 iconv-ite对无法转换的内容进行降级处理时的方案不尽相同。 iconv-lite无

 

法转换的内容如果是多字节,会输出◆;如果是单字节,则输出?。icon则有三级降级策略,会尝试翻译无法转换的内容,或者忽略这些内容。如果不设置忽略,ionv对于无法转换的内容将

 

会得到 EILSEQ异常。如下是 iconv的示例代码兼选项设置方式:

 

var iconv new Iconv(UTF-8,'ASCIT');

 

iconv convert(ca va);// throws EILSEQ

 

var iconv new Iconv(UTF-8,'ASCII//IGNORE);

 

iconv convert (ca va);// returns " a va

 

var iconv new Iconv(UTF-8,ASCII//TRANSLIT);

iconv convert(ca va);//"ca va

 

var iconv= new Iconv(UTF-8,'ASCII//TRANSLIT//IGNORE);

iconv convert(ca va *');//ca va

 

63 Buffer的拼接

 

 

Buffer在使用场景中,通常是以一段一段的方式传输。以下是常见的从输入流中读取内容的

 

示例代码

 

var fs require(fs);

 

var rs= fs. createReadStream(test. md);

 

var data

rson("data", function (trunk)f

 

data +a trunk

 

rson("end", function ((

 

console.log(data);

 

上面这段代码常见于国外,用于流读取的示范,data事件中获取的 chunk对象即是 Buffer对象。

 

对于初学者而言,容易将Buer当做字符串来理解,所以在接受上面的示例时不会觉得有任何异

 

常。

 

旦输人流中有宽字节编码时,问题就会暴露出来。如果你在通过Node开发的网站上看到◆乱码符号,那么该问题的起源多半来自于这里。

 

这里潜藏的问题在于如下这句代码:

 

data +s trunk

 

这句代码里隐藏了 tostring(操作,它等价于如下的代码:

 

data- data tostring(+ trunk, tostring (;


 

 

值得注意的是,外国人的语境通常是指英文环境,在他们的场景下,这个 tostring()不会造


 

144第6章理解 Buffer

 

 

成任何问题。但对于宽字节的中文,却会形成问题。为了重现这个问题,下面我们模拟近似的场景,将文件可读流的每次读取的 Buffer长度限制为11,代码如下:

 

var rs- fs. createReadStream(test. md,,thighWaterMark: 11);

 

搭配该代码的测试数据为李白的《静夜思》。执行该程序,将会得到以下输出:

 

床前明◆◆◆光,疑◆◆◆地上霜;举头◆◆◆明月,◆◆◆头思故乡

 

631乱码是如何产生的

 

上面的诗歌中,“月”、“是”、“望”、“低”4个字没有被正常输出,取而代之的是3个◆。产

 

生这个输出结果的原因在于文件可读流在读取时会逐个读取 Buffer。这首诗的原始Buer应存

 

储为

 

<Buffer e5 ba 8a e5 89 8d e6 98 8e e6 9c 88 e5 85 89 ef bc 8c e7 96 91 e6 98 af e5 gc bo e4 b8 8a e9

 

gc c ef bc b e4 b8 be e5 a4 b4 e6 9c gb e6 98 8e e6 9c..>

 

由于我们限定了 Buffer对象的长度为11,因此只读流需要读取7次才能完成完整的读取,结果

 

是以下几个Buer对象依次输出:

 

<Buffer es ba 8a e5 89 8d e6 98 8e e6 9c>

 

<Buffer 88 e5 85 89 ef bc 8c e7 96 91 e6>

 

上文提到的buf, tostring()方法默认以UTF8为编码,中文字在UTF8下占3个字节。所以第

 

一个 Buffer对象在输出时,只能显示3个字符,Buer中剩下的2个字节(e69c)将会以乱码的形

 

式显示。第二个 Buffer对象的第一个字节也不能形成文字,只能显示乱码。于是形成一些文字无

 

法正常显示的问题

 

在这个示例中我们构造了11这个限制,但是对于任意长度的 Buffer而言,宽字节字符串都有可能存在被截断的情况,只不过Buer的长度越大出现的概率越低而已,但该问题依然不可忽视。

 

6.3.2 setEncoding(string_decoder)

 

在看过上述的示例后,也许我们忘记了可读流还有一个设置编码的方法 setEncoding(),示

 

例如下:

 

readable setEncoding (encoding)

 

该方法的作用是让data事件中传递的不再是一个Buer对象,而是编码后的字符串。为此

 

我们继续改进前面诗歌的程序,添加 setEncoding()的步骤如下:

 

var rs fs. createReadStream(test. md,i highWaterMark: 11); rssetEncoding ( utf8);

 

重新执行程序,得到输出:


 

 

床前明月光,疑是地上霜;举头望明月,低头思故乡


 

这是令人开心的输出结果,说明输出不再受Buer大小的影响了。那Node是如何实现这个输

 

出结果的呢?

 

要知道,无论如何设置编码,触发data事件的次数依旧相同,这意味着设置编码并未改变按

 

段读取的基本方式。

 

事实上,在调用 setEncoding()时,可读流对象在内部设置了一个 decoder对象。每次data事件都通过该 decoder对象进行 Buffer到字符串的解码,然后传递给调用者。是故设置编码后,data不再收到原始的 Buffer对象。但是这依旧无法解释为何设置编码后乱码问题被解决掉了,因为在前述分析中,无论如何转码,总是存在宽字节字符串被截断的问题。

 

最终乱码问题得以解决,还是在于 decoder的神奇之处。 decoder对象来自于 string decoder

 

模块 StringDecoder的实例对象。它神奇的原理是什么,下面我们以代码来说明:

 

var StringDecoder= require('string decoder).StringDecoder; var decoder new String Decoder (utf8);

 

var buf1- new Buffer([oxE5, OXBA, Ox8A, OxE5, 0x89, Ox8D, OXE6, 0x98, Ox8E, OXE6, Ox9C];

 

console. log(decoder. write(buf1))

 

∥-床前明

 

var buf2= new Buffer([ox88, OXE5, 0x85, 0x89, OxEF, OxBC, Ox8C, OXE7, 0x96, 0x91, OXE6D):

 

console. log(decoder. write(buf2));

 

∥-月光,疑

 

我将前文提到的前两个Bfer对象写人eoer中。奇怪的地方在于“月”的转码并没有如平6

 

常一样在两个部分分开输出。 StringDecoder在得到编码后,知道宽字节字符串在UTF-8编码下是

 

以3个字节的方式存储的,所以第一次 write()时,只输出前9个字节转码形成的字符,“月”字的前两个字节被保留在 String Decoder实例内部。第二次 write()时,会将这2个剩余字节和后续11个字节组合在一起,再次用3的整数倍字节进行转码。于是乱码问题通过这种中间形式被解决了。

 

虽然 string decoder模块很奇妙,但是它也并非万能药,它目前只能处理UTF-8、Base64和UCS-2UTF-16LE这3种编码。所以,通过 setEncoding()的方式不可否认能解决大部分的乱码问

 

题,但并不能从根本上解决该问题。

 

633正确拼接 Buffer

 

 

淘汰掉 setEncoding()方法后,剩下的解决方案只有将多个小Buer对象拼接为一个 Buffer对时

 

象,然后通过icon-lie类的模块来转码这种方式。+=的方式显然不行,那么正确的 Buffer拼

 

接方法应该如下面展示的形式

 

var chunks =0;

 

var size 0;

reson('data, function(chunk)[

 

chunks. push(chunk)

 

size +s chunk length;


 

 

res on('end, function( i


 

146第6章理解 Buffer

 

 

var buf Buffer concat(chunks, size);

var str iconv decode (buf,utf8)

 

lelog(str);

 

正确的拼接方式是用一个数组来存储接收到的所有 Buffer片段并记录下所有片段的总长度,

 

然后调用 Buffer. concat()方法生成一个合并的 Buffer对象。 Buffer. conca()方法封装了从小

 

Buer对象向大Buer对象的复制过程,实现十分细腻,值得围观学习:

 

Buffer concat function(list, length)i

(list))t

 

throw new Error(Usage: Buffer concat(list, [length]))

 

 

if (list length =ss o)(

 

return new Buffer(o);

I else if (list length === 1)

 

return list[o]:

 

 

if (typeof length l=s ' number)t

 

length = o

for (var i=0;i< list length; i++)i

 

r buf s list[i]

 

ngth +a buf length;

 

 

 

var buffer- new Buffer (length);

 

var pos 0

for (var 1= 0; i list length; i++)(

var buf=1ist[订];

 

buf copy(buffer, pos);

 

pos + buf length;

 

return buffer;

 

 

64 Buffer与性能

 

 

Buer在文件O和网络O中运用广泛,尤其在网络传输中,它的性能举足轻重。在应用中

 

我们通常会操作字符串,但一旦在网络中传输,都需要转换为Buer,以进行二进制数据传输。

 

在Web应用中,字符串转换到Buer是时时刻刻发生的,提高字符串到Buer转换效率,可以很

 

大程度地提高网络吞吐率。

 

在展开 Buffer与网络传输的关系之前,我们可以先来进行一次性能测试。下面的例子中构造

 

了一个10KB大小的字符串。我们首先通过纯字符串的方式向客户端发送,代码如下:

 

varhttp=requirehttp;


 

 

var helloworld ="


 

for(vari=0i<1024*10;i++){

 

helloworld +=a";

 

 

/ helloworld= new Buffer (helloworld);

 

httpcreateserver(functIon(req,rest

 

res whiteHead (200);

 

resend(helloworld);

 

}). listen(8001)

 

我们通过ab进行一次性能测试,发起200个并发客户端:

 

ab-c200-t100http://127.0.0.1:8001/

 

得到的测试结果如下所示:

 

| HTML   transferred                          | 512000000 bytes |          |                                                  |
| ------------------------------------------- | --------------- | -------- | ------------------------------------------------ |
| Requests   per second: 2527.64[#/sec](mean) |                 |          |                                                  |
| Time                                        | per             | request: | 79125[ms](mean)                                  |
| Time                                        | per             | request: | 0.396 [ms](mean, across all concurrent requests) |

 

Transfer rate:                           25370.16[Kbytes/sec] received

 

测试的QPS(每秒查询次数)是252764,传输率为每秒2537016KB。

 

接下来我们注释掉 Chelloworld= new Buffer( helloworld);使向客户端输出的是一个 Buffer,对

 

象,无须在每次响应时进行转换。再次进行性能测试的结果如下所示:

 

| Total   trans ferred                         | 513900000 bytes                                 |
| -------------------------------------------- | ----------------------------------------------- |
| HTML transferred                             | 12000000 bytes                                  |
| Requests   per second: 4843.28 [#/sec](mean) |                                                 |
| Time   per request:                          | 41.294[ms](mean)                                |
| Time per request:                            | 0.206[ms](mean, across all concurrent requests) |
| Transfer rate                                | 48612.56 [Kbytes/sec] received                  |

 

QPS的提升到484328,传输率为每秒4861256KB,性能提高近一倍。

 

通过预先转换静态内容为Buer对象,可以有效地减少CPU的重复使用,节省服务器资源。

 

在Node构建的Web应用中,可以选择将页面中的动态内容和静态内容分离,静态内容部分可以通

 

过预先转换为Buer的方式,使性能得到提升。由于文件自身是二进制数据,所以在不需要改变内容的场景下,尽量只读取Buer,然后直接传输,不做额外的转换,避免损耗。

 

文件读取

 

Buffer的使用除了与字符串的转换有性能损耗外,在文件的读取时,有一个 highWaterMark设

 

置对性能的影响至关重要。在fs. createReadStream(path,opts)时,我们可以传入一些参数,代

 

码如下:

 

 

flags: I',

 

encoding: nu

 

fd: null

 

mode:0666,


 

highMaterMark: 64*1024


 

148第6章理解 Buffer

 

 

我们还可以传递 start和end来指定读取文件的位置范围:

 

Istart: 90, end: 99)

 

fs, createReadStream()的工作方式是在内存中准备一段 Buffer,然后在fs,read()读取时逐步

 

从磁盘中将字节复制到Buer中。完成一次读取时,则从这个Buer中通过 slice()方法取出部分

 

数据作为一个小Buer对象,再通过data事件传递给调用方。如果 Buffer用完,则重新分配一个;如果还有剩余,则继续使用。下面为分配一个新的 Buffer对象的操作:

 

var pool;

 

function allocNewPool (poolSize)(

 

pool new Buffer (poolsize)

 

pool used 0;

 

在理想的状况下,每次读取的长度就是用户指定的 highWaterMark。但是有可能读到了文件结尾,或者文件本身就没有指定的 highWaterMark那么大,这个预先指定的Buer对象将会有部分剩余,不过好在这里的内存可以分配给下次读取时使用。poo1是常驻内存的,只有当pool单元剩

 

余数量小于128( kMin PoolSpace)字节时,才会重新分配一个新的Bue对象。Node源代码中分配新的Buer对象的判断条件如下所示

 

if (Ipool II poollength- pool used< kMinPoolSpace)t

 

// discard the old pool

 

allocNewPool(this. readablestate highwaterMark);

 

这里与Bur的内存分配比较类似, highwaterMark的大小对性能有两个影响的点。

 

o highWaterMark设置对 Buffer内存的分配和使用有一定影响。

 

口 highWaterMark设置过小,可能导致系统调用次数过多。

 

文件流读取基于 Buffer分配, Buffer则基于 SlowBuffer分配,这可以理解为两个维度的分配策

 

略。如果文件较小(小于8KB),有可能造成sab未能完全使用。

 

由于fs, createReadStream()内部采用fs,read()实现,将会引起对磁盘的系统调用,对于大

 

文件而言, highWater№ark的大小决定会触发系统调用和data事件的次数。

 

以下为Node自带的基准测试,在 benchmark/fs/read- stream- throughput js中可以找到:

 

function runTesto i

 

assert(fs. statSync(filename).size aam filesize);

 

var rs s fs. createReadStream(filename, i

 

highWater№ark:size,

 

encoding: encodin

 

 

rson (open, function((

 

bench. start:

 

});


 

 

var bytes


 

rson('data, function(chunk)(

 

bytes +s chunk length;

 

 

rson(,, function)(

 

try i fs. unlinkSync(filename ):)catch(e)i]

 

/ MB/sec

bench. end(bytes /(1024 *1024));

 

 

 

下面为某次执行的结果:

 

fs/read-stream-throughput. js type=buf size=1024:46.284

fs/read-stream-throughput js type=buf size=4096: 139.62

 

fs/read-stream-throughput js type=buf size= 65535: 681. 88

 

fs/read-stream-throughput js type=buf size=1048576:857.98

 

从上面的执行结果我们可以看到,读取一个相同的大文件时, highWaterMark值的大小与读取速

 

度的关系:该值越大,读取速度越快。

 

65总结

 

 

体验过 JavaScript友好的字符串操作后,有些开发者可能会形成思维定势,将 Buffer当做字

 

符串来理解。但字符串与 Buffer之间有实质上的差异,即 Buffer是二进制数据,字符串与 Buffer

之间存在编码关系。因此,理解 BufferE诸多细节十分必要,对于如何高效处理二进制数据+{6

 

分有用

 

6.6参考资源

 

 

本章参考的资源如下:

 

Ohttp://nodejs.org/docs/latest/api/buffer.html

 

Ohttp://nodejs.org/docs/latest/api/stringdecoderhtml

 

Ohttps:/github.com/bnoordhuis/node-iconv

 

Qhttps:/github.com/ashtuchkin/iconv-lite

 

Ohttp://httpd.apacheorg/docs/2.2/programs/ab.html

 

Ohttp://cnodejs.org/user/fool

 

Ohttp://en.wikipediaorg/wiki/slaballocation

 

Ohttps://www.ibm.com/developerworks/cn/linux/-linux-slab-allocator/