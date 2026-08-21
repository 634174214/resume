// 初始化页面的各项DOM
var initPage = {
    // 顶部轮播
    infoBgTurn: function() {
        var $infoBgs = $('#info-bg span');
        var fadeTime = 600;
        $infoBgs.eq(0).fadeIn(fadeTime);
        var infoTimer = setInterval(function() {
            $infoBgs.each(function(index, item) {
                if($(item).is(':visible')) {
                    $(item).fadeOut(fadeTime);
                    if(index ===  $infoBgs.length - 1) {
                        $infoBgs.eq(0).fadeIn(fadeTime);
                    } else {
                        $(item).next().fadeIn(fadeTime)
                    }
                    return false;
                }
            });
        }, 5000);
    },
    // 计算微信二维码显示位置
    setErwePlace: function(ispc, el) {
        if(ispc) {
            var left = Math.floor(el.offset().left),
                top = Math.floor(el.offset().top);
            $('#erwe-wrapper').css({
                'left': left + 135,
                // 由于添加css动画导致top值计算错误 这里使用固定值
                'top': 187
            });
        }
    },
    // 渲染技能卡片（替代原来的进度条）
    renderSkillCards: function() {
        var $grid = $('#skill-grid');
        // 如果不存在 skill-grid，直接返回
        if(!$grid.length) {
            return;
        }
        var html = '';
        
        $.each(skills, function(key, category) {
            var icon = category['icon'];
            var itemsHtml = '';
            $.each(category.items, function(i, item) {
                itemsHtml += '<span class="skill-tag">' + item + '</span>';
            });
            html += '<div class="skill-card">';
            html += '  <div class="skill-card-header">';
            html += '    <span class="skill-icon">' + icon + '</span>';
            html += '    <h4>' + category.name + '</h4>';
            html += '  </div>';
            html += '  <div class="skill-card-body">' + itemsHtml + '</div>';
            html += '</div>';
        });
        
        $grid.html(html);
    }
} 

// 获取每一个section的高度
var getSectionsTop = function(arr, scrollOffset, ispc) {
    var ret = [];
    // 根据是否是pc做不同调整
    var litescroll = ispc ? 150 : 500;
    $.each(arr, function(index, item) {
        var $item = $(item);
        if(!$item.length) {
            ret.push(0);
            return true;
        }
        var itemTop = Math.ceil($item.offset().top) + scrollOffset;
        // 对前端、设计作品的距离顶部距离单独做调整
        switch(true) {
            case index === 3:
                itemTop = itemTop + litescroll;
                break;
            case index === 4:
                itemTop = itemTop + litescroll;
                // 对最后一个手机做调整
                itemTop = ispc ? itemTop : (itemTop + 200);
                break;
        }
        ret.push(itemTop);
    });
    return ret;
};

// 判断pc手机
var browser = function() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ['Android', 'iPhone',
        'SymbianOS', 'Windows Phone',
        'iPad', 'iPod'
    ];
    var flag = true;
    for (var i = 0; i < Agents.length; i++) {
        if (userAgentInfo.indexOf(Agents[i]) != -1) {
            flag = false;
            break;
        }
    }
    return flag;
};
// 获取nav每一个li距离父元素左边的距离
var getNavListItemsLeft = function($navlis) {
    var ret = [];
    $navlis.each(function(index, item) {
        var left = item.offsetLeft;
        ret.push(left);
    });
    return ret;
};

// 前端开发展示-所有相关方法
var frontendMethods = function() {
    var $wrap = $('#Frontend-content');
    var $spans = $('#tabs-bar span');
    var $slides = $wrap.find('.swiper-slide');
    var _self = this;
    var containerHeight = $('FrontendShow').height();
    var $frontEndRollBtn = $('#front-end-roll');
    // 初始化时，渲染初始数据
    this.first = function() {
        // https://segmentfault.com/q/1010000004474036 JQ中实现一次性渲染
        var contents = webBetter[0].data,
            qrclickShow = webBetter[0].qrclickShow;
        this.setSlide(contents, $slides, qrclickShow);

    }
    // 切换tabs选项卡
    this.tabsClick = function($this, swiper, ispc) {
        if ($this.hasClass('active')) {
            return;
        }

        // 每次点击切换选项卡都重置换一换的按钮状态
        $frontEndRollBtn.removeClass('disabled');

        // 这里的this指向这个构造函数，
        var index = $this.index();
        var dirname = $this.data('dir');
        if(!worksDir[dirname]) {
            $frontEndRollBtn.addClass('disabled');
        }
        // 对应点击的下标 找到webbetter数组中对应的data数组，否则这里需要用for-in
        var contents = webBetter[index];
        var contentval = contents.data,
            qrclickShow = contents.qrclickShow,
            contentKey = contents.label;
        var $frontEndAllBtn = $('#front-end-all');
        // 每次点击tab的时候 都更改下方查看全部的按钮
        var scrollTo = $this.data('scrollto');
        $frontEndAllBtn.attr(
            'href', 
            $frontEndAllBtn.attr('href') + '#' + scrollTo
        );
        
        $this.siblings().removeAttr('class');
        $this.addClass('active');
        // 开启动画
        $('#FrontendShow').fadeOut(500 , function() {
            $(this).fadeIn(500);
        });
        // 如果手机启动swiper情况下,因为替换元素会有闪屏bug，这里用透明度优化，延迟450ms执行替换元素
        setTimeout(function() {
            if (swiper) {
                $.each(contentval, function(j, item) {
                    var sildeHtml = _self.template(item, qrclickShow);
                    swiper.getSlide(j).html(sildeHtml);
                    // 回到第一帧
                    swiper.swipeTo(0, 800, false);
                });
            } else {
                $slides.empty();
                // 这里避免作用域的问题 这里this指向构造函数
                _self.setSlide(contentval, $slides, qrclickShow);
            }
            // 必须再每次切换之后执行一次组织默认事件的点击 未完成
            _self.hrefStop(ispc);
        },450);
    }
    // pc-计算前端开发块选项卡总宽
    this.setTabsWidth = function() {
        var tabsWidth = 0;
        $spans.each(function(index, item) {
            // 为兼容IE 在IE上使用获取宽度的方法不奏效，所以采用去掉padding 在根本元素宽度上加上一个值60，撑起宽度，再计算
            var _width = Math.ceil(item.clientWidth) + 60;
            $(item).css('width', _width);
            // 左右border = 2px
            tabsWidth = tabsWidth + _width + 2;
        });
        // 因为margin-left =15
        tabsWidth = tabsWidth + ($spans.length - 1) * 15;
        $('#tabs-bar').css('width', tabsWidth);
    },
    // pc鼠标移动
    this.detailhover = function() {
        $('.linkto').hover(
            function() {
                $('.QRcode', this).fadeIn(400);
                $(this).addClass('active');
            },function() {
                $('.QRcode', this).fadeOut(400);
                $(this).removeClass('active');
            }
        );
    }
    // 手机左右箭头的点击
    this.arrowClick = function(FrontendWorks) {
        $('#Frontend-left').on('click', function(e) {
            e.preventDefault();
            FrontendWorks.swipePrev();
        });
        $('#Frontend-right').on('click', function(e) {
            e.preventDefault();
             FrontendWorks.swipeNext();
        });
    }
    // 阻止a标签跳转
    this.hrefStop = function(ispc) {
        // 当为小程序时候 点击阻止a标签跳转并显示二维码
        $('.hrefstop-hook').on('click', function() {
            // 排除掉有链接的情况 让有链接的也能点击
            var href = $(this).attr('href');
            if(ispc) {
                if(href.indexOf('javascript:;') > -1 ||
                   !href    
                ) {
                    return false;
                }
            } else {
                if(href.indexOf('javascript:;') > -1) {
                    var $qrbox = $(this).find('.QRcode');
                    $qrbox.fadeIn();
                    return false;
                } else {
                    window.open(href);
                }
            }
            
        });
        $('.close').on('click', function() {
            $(this).parent().fadeOut();
            return false;
        });
    }
    this.getActiveData = function() {
        var $activeSpan = $('#tabs-bar .active');
        var dirname = $activeSpan.data('dir');
        if(!worksDir[dirname]) {
            return [];
        }
        var resArr = getRandomItems(worksDir[dirname], 3);
        return resArr;
    },
    this.rollClick = function(ispc, frontendSwiper) {
        if($frontEndRollBtn.hasClass('disabled')) {
            return;
        }
        $frontEndRollBtn.addClass('disabled');
        var newData = _self.getActiveData();
        if(newData.length <= 0) {
            return;
        }
        // 找出当前的active是第几个
        var index = $('#tabs-bar .active').index();
        // 同时也要更新记录的固定数据
        webBetter[index]['data'] = newData;
        var qrclickShow = webBetter[index].qrclickShow;
        $slides.each(function() {
            $(this).empty();
        });
        this.setSlide(newData, $slides, qrclickShow);
        if(ispc) {
            setTimeout(_self.detailhover, 500);
        } else {
            // 手机版换完之后回第一帧
            // setTimeout(function() {
            //     frontendSwiper.swipeTo(0, 800, false);
            // }, 200);
            // frontendSwiper.reInit();
            frontendSwiper.swipeTo(0, 800, false);
        }
        setTimeout(function() {
            $frontEndRollBtn.removeClass('disabled');
        }, 3000);
    }
}
frontendMethods.prototype = {
    init: function(ispc) {
        var _self = this;
        var frontendSwiper = null;
        this.first();
        if (ispc) {
            this.setTabsWidth();
            this.detailhover();
        } else {
            // 手机-启动swiper
            frontendSwiper = $('#FrontendShow').swiper({
                pagination: '.pagination',
                autoplay : false,
                calculateHeight:true,
                loop: false
            });
            // 需要传启动的swiper做参数
            this.arrowClick(frontendSwiper);
        }
        $('#tabs-bar').on('click', 'span', function() {
            var $this = $(this);
            // 注意这里this指向问题，必须传入$this指向点击的元素
            // 不同于$('#tabs-bar').on('click', 'span', this.tabsClick)，这样函数中this指向点击元素，而不是构造函数
            _self.tabsClick($this, frontendSwiper, ispc);
            if (ispc) {
                // 点击tab的时候dom更新设置了一个450ms的延迟，所以这里也要加一个延迟，否则鼠标移动没反映
                setTimeout(_self.detailhover, 500);
            }
        });

        // 点击前端换一换按钮
        $('#front-end-roll').on('click', function() {
            _self.rollClick(ispc, frontendSwiper);
        });
    },
    // 定义结构模板
    template: function(opt, qrclickShow) {
        // 如果手机版点击出现二维码不跳转的情况 
        var hrefStopCls = qrclickShow ? 'hrefstop-hook' : '';
        return '<a href="'+ opt.href + '" target="_blank" class="linkto ' + hrefStopCls + '"><dl class="detail"><dt class="imgbox"><img src="'+ opt.src + '" class="work-pic"><em class="QRcode"><cite class="work-qr"><img src="' + opt.qr + '"></cite><cite class="text">扫码 / 点击 查看详情</cite><cite class="icon close"></cite></em></dt><dd class="name">'+ opt.name + '</dd></dl></a>';
    },
    // 设置slide中内容,仅用于pc版
    setSlide: function(contents, $slides, qrclickShow) {
        var _self = this;
        $.each(contents, function(index, obj) {
            var item = _self.template(obj, qrclickShow);
            $slides.eq(index).append($(item));
        });

        setTimeout(function() {
            _self.setQrByUrl();
        }, 1000);
    },
    // 为每个链接动态设置二维码
    setQrByUrl: function() {
        var $slides = $('#Frontend-content').find('.swiper-slide');
        $.each($slides, function(index, item) {
            var $linkto = $(item).find('.linkto').eq(0);
            var href = $linkto.attr('href');
            var $workQr = $linkto.find('.work-qr').eq(0);
            var $workQrImg = $workQr.find('img');
            if($workQrImg && !$workQrImg.attr('src')) {
                $workQr.empty();
                new QRCode($workQr[0], {
                    text: href,
                    width: 100,
                    height: 100
                });
            }
            
        });
    }
}

// 开启设计作品的瀑布流
var designWaterfall = function(screenHeight, ispc) {
    var $galleryEnd = $('#gallery-end'),
        $gallery = $('#gallery-wrapper');
    var _self = this;
    var documentH = screenHeight;
    // 列数是pc=4 手机=2
    var columns = ispc ? 4 : 2;
    var allLens = designWorks.length;
    // 加载的起点
    this.loadStart = 0; 
    // 每次加载的个数 pc= 20 手机=10
    this.loadStep = ispc ? 20 : 10;
    this.init = function() {
        var start = _self.loadStart,
            step = _self.loadStep;
        // 更改加载的起点，这里要先执行赋值，否则当最后阶段，会一直等于allLens
        _self.loadStart = start + step;
        if(start <= allLens) {
            if( (start + step) > allLens ) {
                step = allLens - start;
            }
            _self.setDesignItem(start, step);
            _self.waterfall();
        } else {
            if($galleryEnd.is(':hidden')) {
                $('#gallery-end').fadeIn('slow');
                $('#footer').show();
            }
        }
        return;
    }
    // 设计作品dom动态插入
    this.template = function(opt) {
        return '<li class="pin"><div class="box"><img src="' + opt.show + '" class="thumb"><h1>' + opt.label + '</h1><p>' + opt.desc + '</p></div></li>';
    }
    // 给瀑布流添加项目
    this.setDesignItem = function(start, step) {
        var inHtml = '';
        // 求出结束值
        var end = start + step;
        $.each(designWorks, function(index, designItem) {
            if(index >= start && index < end) {
                inHtml = inHtml + _self.template(designItem);
            }
        });
        $gallery.append($(inHtml));
    }
    this.waterfall = function() {
        var $aPin = $( "#gallery-wrapper>li" );
        var col = columns;//每行中能容纳的pin个数 /列数

        var pinHArr=[];//用于存储 每列中的所有块框相加的高度。
        $('#gallery-wrapper img').on('load',function(){
            $aPin.each( function( index, value ){
                var pinH = $aPin.eq( index ).height();
                if( index < col ){
                    pinHArr[ index ] = pinH; //第一行中的num个块框pin 先添加进数组pinHArr
                }else{
                    var minH = Math.min.apply( null, pinHArr );//数组pinHArr中的最小值minH
                    var minHIndex = $.inArray( minH, pinHArr );
                    $( value ).css({
                        'position': 'absolute',
                        'top': minH + 15,
                        'left': $aPin.eq( minHIndex ).position().left
                    });
                    //数组 最小高元素的高 + 添加上的aPin[i]块框高
                    pinHArr[ minHIndex ] += $aPin.eq( index ).height() + 15;//更新添加了块框后的列高
                }
            });
            var max = Math.max.apply(null, pinHArr)
            $gallery.css('height', max)
        });
    }
    this.checkscrollside = function(scrollTop) {
        var $aPin = $( "#gallery-wrapper>li" );
        if(!$aPin.length) {
            return false;
        }
        var lastPinH = $aPin.last().offset().top + Math.floor($aPin.last().height()/2);
        return (lastPinH < scrollTop + documentH ) ? true : false;
    }
};


// 实例化设计作品
var designWorksMethods = function(ispc) {
    var $title = $('.design-works-title', '#design-works');
    var $desc = $('.desc', '#design-works');
    var $swiperWrap = $('.design-swiper', '#design-works');
    var $designWorks = $('#design-works');
    var $close = $('.close-hook', '#design-works');
    var grabAllow = ispc ? true : false;
    // 开启滚轮后 在pc上当只有一张图片的时候 会有bug 滚轮滚动图片会一直滚 所以pc取消loop
    var slideLoop = ispc ? false : true;
    // 这里仅仅初始化一次swiper即可 使用swiper2自带的方法增减元素
    var designSwiper = $('#design-swiper').swiper({
        pagination : '.design-pagination',
        calculateHeight: false,
        noSwiping : true,
        mousewheelControl : true,
        // 禁止鼠标拖动
        onlyExternal : grabAllow,
        noSwipingClass : 'stop-swiping',
        loop: slideLoop
        
    }); 

    this.template = function(opt) {
        var imgCls = opt.isvertical ? 'imgis-vertical' : 'imgis-horizontal';
        return '<img src="' + opt.src + '" class="' + imgCls + '">'
    }
    // 展示设计类作品
    this.designWorkShow = function(index) {
        // 这里要先显示否则在手机浏览器上无法运行，待测试用visibility：hidden
        $designWorks.fadeIn();
        // 这里this指代designWorksMethods
        var _self = this;
        var worksItem = designWorks[index];
        $title.text(worksItem.label);
        $desc.text(worksItem.desc);
        // 遍历图片数组
        $.each(worksItem.images, function(index, imgitem) {
            // 创建slide时要添加的class
            var slideCls = 'swiper-slide';
            // 当仅有一张图片时，给slide添加不可拖动的样式
            if (worksItem.images.length <= 1) {
                $swiperWrap.addClass('onlyone');
                slideCls = 'swiper-slide stop-swiping'
            } 
            var slide = _self.template(imgitem);
            // 创建slide收添加class名
            var newSlide = designSwiper.createSlide(slide, slideCls);
            newSlide.append();
        });
        // 添加完元素重新初始化一下
        designSwiper.reInit();
        // 配置为loop必须手动控制滚动到0页
        designSwiper.swipeTo(0, 0, false);
    }
    // 关闭
    $close.on('click', function() {
        // 关闭时删除所有slide
        designSwiper.removeAllSlides();
        if ($swiperWrap.hasClass('onlyone')) {
            // 避免单张图片关闭时 会出现箭头情况，使用定时器延迟执行,fadeout默认400ms
            setTimeout(function() {
                $swiperWrap.removeClass('onlyone');
            }, 400);
        }
    });
    // 箭头点击
    $('#design-left').on('click', function(e) {
        e.preventDefault();
        designSwiper.swipePrev();
    });
    $('#design-right').on('click', function(e) {
        e.preventDefault();
        designSwiper.swipeNext();
    });
};
AOS.init({
    easing: 'ease-out-back',
    duration: 500
});

// 后台作品展示、弹窗 已经废弃
var afterEndMethods = function() {
    function After() {
        this.$list = $('.afterend-list').clone().addClass('hide').removeAttr('id');
        $('body').append(this.$list);

        // 插入后获取全部的点击交互按钮
        this.$showBtn = $('.show-after-imgs');

        this.init();
    }
    After.prototype = {
        init: function() {
            this.showImgs();
            this.lookall();
        },
        getOrder: function(order) {
            var res = '';
            switch(order) {
                case 1:
                    res = {
                        title: '信网直播后台',
                        url: 'after-show-img/qdxin-live.html'
                    };
                    break;
                case 2:
                    res = {
                        title: '信网应用后台',
                        url: 'after-show-img/qdxin-app.html'
                    };
                    break;
                default:
                    res = {
                        title: '其他后台',
                        url: ''
                    }    
            }
            return res;
        },
        showImgs: function() {
            var self = this;
            this.$showBtn.on('click', function() {
                var order = $(this).data('imgorder');
                var resObj = self.getOrder(order);
                console.log(resObj)
                layer.open({
                    type: 2,
                    title: resObj.title,
                    shadeClose: true,
                    shade: 0.8,
                    area: ['80%', '90%'],
                    content: resObj.url //iframe的url
                }); 
            });
        },
        lookall: function() {
            var self = this;
            $('#afterend-lookall').on('click', function() {
                layer.open({
                    type: 1,
                    title: '全部案例',
                    shadeClose: true,
                    shade: 0.8,
                    area: ['80%', '90%'],
                    content: self.$list
                }); 
            });
        }
    }

    return new After();
};

// 后端页面启动时随机显示
var afterEndRandShow = function() {
    var $allItems = $('#afterend-list li');
    // 第0个是带着show样式 所以排除掉 从下标1开始
    var indexArr = rangeStep(1, $allItems.length - 1, 1);
    indexArr = shuffleArray(indexArr)
    // 截取开头2项索引
    indexArr = indexArr.slice(0, 2);
    $.each(indexArr, function(index, item) {
        $allItems.eq(item).addClass('show');
    });
}();

$(function() {
     // 判断浏览器
    var isPc = browser();
    // 滚动值偏移量，根据pc或者手机有所区别
    var scrollOffset = isPc ? 350 : 100;
    var $navContact = $('#navicon-content li');
    var $addwexin = $('.addwexin').eq(0);
    var $cover = $('#cover');
    // 导航当前的索引
    var navActiveIndex = 0;
    // 所有的主要块
    var sections = ['#info', '#works', '#skill', '#afterend', '#Frontend', '#design'];
    // 每个主要块距离页面顶部距离的数组
    var sectionsTop = getSectionsTop(sections, scrollOffset, isPc);
    // 菜单是否打开
    var navOpened = false;
    // 获取全部的导航的li
    var $navLis = $('#nav-list li');
    // 获取导航下面的移动横线
    var $navline = $('#navline');
    var $nav = $('#nav');
    // 获取nav距离顶部的高度
    var navTop = $nav.offset().top;
    // nav-list每个li距离左边的距离
    var navListItemsLeft = getNavListItemsLeft($navLis);
    var $bigImgwrap = $('#bigimg'),
        bigImg = $bigImgwrap.find('img').get(0);
    // 学历认证按钮
    var checkBen = 'img/renzheng-ben.jpg',
        checkZhuan = 'img/renzheng-zhuan.jpg',
        $schoolCheck = $('.school-check'),
        $checkSchool = $('#check-school'),
        $checkSchoolImg = $('img', $checkSchool).eq(0);
    // 屏幕高度
    var screenHeight = $(window).height();
    initPage.infoBgTurn();
    initPage.setErwePlace(isPc, $addwexin);
    initPage.renderSkillCards();
    // info 微信项目 鼠标移动
    $addwexin.hover(
        function() {
            if(isPc) {
                $('#erwe-wrapper').fadeIn();
                $(this).addClass('active');
            }
        },
        function() {
            if(isPc) {
                $('#erwe-wrapper').fadeOut();
                $(this).removeClass('active');
            }
        }
    );
    // 手机二维码点击显示
    $('.addwexin-hook').on('click', function() {
        if(isPc) {
            return;
        }
        $('#erwe-wrapper').addClass('moveIn');
        // 隐藏菜单按钮,如果使用hide无论样式还是style 恢复时都会触发一遍动画所以使用透明度
        $('#navbtn').css('opacity', 0);
        return false;
    });
    // 二维码点击关闭
    $('#erwe-wrapper').on('click', function() {
        if(!isPc) {
            $('#erwe-wrapper').removeClass('moveIn');
            $('#navbtn').css('opacity', 1);
        }
    });
    // pc-nav 右侧图标鼠标移动
    $('#nav-icon li').hover(
        function(e) {
            navActiveIndex = $(this).index();
            $navContact.eq(navActiveIndex).fadeIn()
            $(this).addClass('active');
        },
        function() { 
            $(this).removeClass('active');
            $navContact.hide()
        }
    );
    // 在其中移动鼠标不会隐藏掉内容框
    $('#navicon-content').hover(
        function() {
            $navContact.eq(navActiveIndex).show();
        },
        function() {
            $navContact.eq(navActiveIndex).hide();
        }
    );
    // 导航点击
    // 导航点击（PC和手机统一使用锚点平滑滚动）
    // 导航点击（PC和手机统一使用锚点平滑滚动）
    $navLis.on('click', function() {
        var index = $(this).index();
        var targetId = sections[index];
        var targetEl = $(targetId);
        var $that = $(this);

        if(targetEl.length) {
            // 1. 先切换菜单的 active 样式（视觉上立刻选中）
            $navLis.removeClass('active');
            $that.addClass('active');

            // 2. 设置一个标记：告诉滚动监听器“现在正在手动跳转，不要捣乱”
            window.isNavigating = true;

            // 手机端关菜单逻辑
            if(!isPc && navOpened) {
                $('#navbtn').trigger('click');
                setTimeout(function() {
                    targetEl[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // 滚动结束后，等待 800ms 解锁监听器，恢复滚动跟随
                    setTimeout(function() { window.isNavigating = false; }, 800);
                }, 400);
            } else {
                // PC端直接跳
                targetEl[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
                // 同样解锁
                setTimeout(function() { window.isNavigating = false; }, 800);
            }
        }
    });
    // 手机菜单按钮点击
    $('#navbtn').on('click', function() {
        var $that = $(this);
        if(!navOpened) {
            $nav.addClass('moveIn');
            $cover.fadeIn();
            $that.attr('class', 'navbtn m-nav-close');
            navOpened = true;
        } else {
            $nav.removeClass('moveIn');
            $cover.fadeOut();
            $that.attr('class', 'navbtn m-nav-gonormal');
            // 动画执行1s 所以等1s的时候执行更换样式，这里用监听动画执行结束不合适
            setTimeout(function() {
                $that.attr('class', 'navbtn m-nav-normal');
            }, 700);
            navOpened = false;
        }
    });
    
    // 启动前端开发所有操作
    var  frontend= new frontendMethods().init(isPc);
    // 点击关闭按钮 前端作品&设计作品用到&
    $('.close-hook').on('click', function() {
        $(this).parent().fadeOut();
        $cover.fadeOut();
    });
    
    // 启动设计作品的瀑布流
    var water = new designWaterfall(screenHeight, isPc);
    water.init();
    // 设计作品展示
    var designworks = new designWorksMethods(isPc);
    $('#gallery-wrapper').on('click', 'li', function() {
        var index = $(this).index();
        designworks.designWorkShow(index)
    });
    // 显示大弹窗
    $('#design-swiper').on('click', '.swiper-slide', function() {
        var nowSrc = $(this).find('img').eq(0).attr('src');
        if(isPc) {
            window.open(nowSrc, "_blank");   
        } else {
            bigImg.src = nowSrc;
            $bigImgwrap.fadeIn();
        }
    });
    $bigImgwrap.on('click', '.bigcloser', function() {
        $bigImgwrap.fadeOut();
    });

    // 向下滚动监听
    $(window).on('scroll', function() {
        // 【新增条件】如果正在执行菜单跳转动画，暂停监听，防止样式错乱
        if (window.isNavigating) {
            return; 
        }

        // html body高度不能设置为100%否则滚动不起作用
        var scrollTop = $(window).scrollTop();

        // 如果在pc下， 对nav进行固定
        if (isPc) {
            if(scrollTop >= navTop && !$nav.hasClass('fixed')) {
                $nav.addClass('fixed');
                $('#works').addClass('navFixTop');
            } else if(scrollTop < navTop && $nav.hasClass('fixed')) {
                $nav.removeClass('fixed');
                $('#works').removeClass('navFixTop');
            }
        }
        // 每次判断设计瀑布是否需要加载
        if(water.checkscrollside(scrollTop)) {
            water.init();
        }
    });

    // 使用 IntersectionObserver 自动高亮导航（带安全降级）
    var sectionsElements = sections.map(function(id) { return document.querySelector(id); }).filter(Boolean);

    // 检查浏览器是否支持 IntersectionObserver
    if ('IntersectionObserver' in window) {
        // --- 走现代方案 ---
        var observerOptions = {
            root: null,
            rootMargin: '-40% 0px -40% 0px',
            threshold: 0
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var index = sections.indexOf('#' + entry.target.id);

                    // 如果是后端和前端 滚动到对应区域时，出现换一换按钮
                    if(!isPc) {
                        switch(entry.target.id) {
                            case 'afterend':
                                $('#after-end-roll').fadeIn();
                                break;
                            case 'Frontend':
                                $('#front-end-roll').fadeIn();
                                break;
                            default:
                                $('#after-end-roll').fadeOut();
                                $('#front-end-roll').fadeOut();
                        }
                    }

                    if (index !== -1) {
                        $navLis.removeClass('active');
                        $navLis.eq(index).addClass('active');
                        if (navListItemsLeft[index] !== undefined) {
                            $navline.css('transform', 'translate(' + navListItemsLeft[index] + 'px,0)');
                        }
                    }
                }
            });
        }, observerOptions);

        sectionsElements.forEach(function(el) {
            if(el) {
                observer.observe(el);
            }
        });

    } else {
        // --- 传统兼容方案（兜底）: 如果浏览器不支持 IntersectionObserver，用你原来的 Scroll 监听 ---
        // 浏览器不支持IntersectionObserver 那么就不显示 换一换按钮
        $(window).on('scroll', function() {
            if (window.isNavigating) { return; }
            var scrollTop = $(window).scrollTop();
            $.each(sectionsTop, function(index, item) {
                if (item > scrollTop) {
                    var left = navListItemsLeft[index];
                    $navLis.removeClass('active');
                    $navLis.eq(index).addClass('active');
                    $navline.css('transform', 'translate(' + left + 'px,0)');
                    return false;
                }
            });
        });
    }

    // 学历认证弹窗
    $schoolCheck.on('click', function(e) {
        e.stopPropagation();
        var clsname = $.trim(this.className.split('school-check')[1]);
        switch(clsname) {
            case 'zhuan':
                $checkSchoolImg.attr('src', checkZhuan);
                break;
            case 'ben':
                $checkSchoolImg.attr('src', checkBen);
                break;
        }
        $checkSchool.fadeIn();
        if(isPc) {
            $cover.fadeIn();
        }
    });

    // 海大显示非全日制tips
    var haidaTips = null;
    $('#haida-school').on('mouseenter', function() {
        haidaTips = layer.tips('非全日制学历', this, {
            tips: 2
        });
    });
    $('#haida-school').on('mouseleave', function() {
        layer.close(haidaTips);
    });


    // 高项点击显示图片
    // 所有有.open-img-alert样式的元素 点击都出现弹窗 显示data-imgsrc指向的图片
    $('.open-img-alert').on('click', function() {
        var imgsrc = $(this).data('imgsrc');
        var imgtitle = $(this).data('imgtitle');
        if(!imgsrc) {
            return;
        }
        imgtitle = imgtitle ? imgtitle : '信息'
        var contentHtml = '<div class="img-alert"><img src="' + imgsrc + '"></div>';
        var dialogArea = isPc ? ['600px', '90%'] : ['100%', '100%'];
        layer.open({
            type: 1,
            title: imgtitle,
            area: dialogArea,
            shade: 0.7,
            shadeClose: true,
            anim: 0,
            content: contentHtml
        });
    });

    // 打开Pdf
    $('.open-iframe-alert').on('click', function() {
        var iframeUrl = $(this).data('url');
        var iframeTitle = $(this).data('title');
        
        if(!iframeUrl) {
            return;
        }
        iframeTitle = iframeTitle ? iframeTitle : '信息';
        
        var dialogArea = isPc ? ['60%', '80%'] : ['100%', '100%'];
        
        layer.open({
            type: 2,
            title: iframeTitle,
            area: dialogArea,
            shade: 0.7,
            shadeClose: true,
            anim: 0,
            content: iframeUrl,
        });
    });

    // 随机更换后端项目
    $('#after-end-roll').on('click', function() {
        var $afterEndWorks = $('#afterend-list li');
        $afterEndWorks.removeClass('show')
        var indexArr = rangeStep(0, $afterEndWorks.length - 1, 1);
        indexArr = shuffleArray(indexArr);
        indexArr = indexArr.slice(0, 3);
        $.each(indexArr, function(index, item) {
            $afterEndWorks.eq(item).addClass('show');
        });
    });

    

});