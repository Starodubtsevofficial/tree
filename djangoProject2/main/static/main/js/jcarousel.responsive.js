function jcarousel_load() {
    var jcarousel = $('.jcarousel');
    if (!jcarousel.length) return;

    jcarousel
        .on('jcarousel:reload jcarousel:create', function () {
            var width = jcarousel.innerWidth();

            if (width >= 600) {
                width = width / 6;
            } else if (width >= 450) {
                width = width / 4;
            } else if (width >= 300) {
                width = width / 2;
            }

            jcarousel.jcarousel('items').css('width', width + 'px');
            $(window).trigger('resize');

        })
        .on('click','.jcarousel-item',function() {
            $('.jcarousel-item').removeClass('active');

            $(this).addClass('active');
            var url = $(this).children('img').data('fullsize');
            var container = $(this).closest('.jcarousel-container');
            var elements = {
                imageWr:    container.find('.jcarousel-preview-wrapper'),
                loadIcon:   container.find('.jcarousel-loading-ico'),
                preload:    container.find('.jcarousel-preload-wrapper'),
            };

            var preloadedUrls = [];
            elements.preload.children('img').each(function(){
                preloadedUrls.push($(this).attr('data-link'));
            });

            var index = $.inArray(url,preloadedUrls);
            if (index == -1) {
                elements.loadIcon.show();
                elements.imageWr.css('opacity','0.5');
                container.find('.jcarousel-preview-prev, .jcarousel-preview-next').attr('data-disabled',1);
                preloadImage(url,function(){
                    var newImg = $(document.createElement('img')).prop('src',url);
                    newImg.attr('data-link',url);
                    newImg.addClass('jcarousel-preview-image');
                    if (elements.imageWr.children('img').length) {
                        elements.imageWr.children('img').replaceWith(newImg);
                    } else {
                        elements.imageWr.append(newImg);
                    }
                    elements.loadIcon.hide();
                    elements.imageWr.css('opacity','1');
                    container.find('.jcarousel-preview-prev, .jcarousel-preview-next').attr('data-disabled',0);
                    elements.preload.append(newImg.clone());
                });
            } else {
                if (elements.imageWr.children('img').length) {
                    elements.imageWr.children('img').prop('src',preloadedUrls[index]);
                } else {
                    var img = $(document.createElement('img')).prop('src',preloadedUrls[index]);
                    img.addClass('jcarousel-preview-image');
                    elements.imageWr.append(img);
                }
            }

            $(window).trigger('resize');

            if ($(this).data('index') !== undefined) {
                var index = $(this).data('index');
                var indexLast = $(this).parent().children().last().data('index');

                $('.jcarousel-page-current').html(index+1);
                $('.jcarousel-page-max').html(indexLast+1);

                var indexPrev = index > 0 ? index-1 : false, indexNext = index < indexLast ? index+1 : false;
                $('.jcarousel-preview-prev').attr('data-index',indexPrev);
                if (indexPrev === false) {
                    $('.jcarousel-preview-prev').hide();
                } else {
                    $('.jcarousel-preview-prev').show();
                }
                $('.jcarousel-preview-next').attr('data-index',indexNext);
                if (indexNext === false) {
                    $('.jcarousel-preview-next').hide();
                } else {
                    $('.jcarousel-preview-next').show();
                }
            }

            if ($(this).data('index') !== undefined) {
                var ofs = 0;
                if (jcarousel.innerWidth() > 500) ofs += 1;
                if (jcarousel.innerWidth() > 650) ofs += 1;
                if (ofs) {
                    var t = jcarousel.offset().left + jcarousel.width() - $(this).offset().left;
                    if (t < 1.5 * $(this).width() && t > 0) {
                        jcarousel.jcarousel('scroll',$(this).data('index')-ofs-1);
                    } else {
                        var t = $(this).offset().left - jcarousel.offset().left;
                        if (t < 0.5 * $(this).width()) {
                            var shiftedIndex = $(this).data('index')-ofs;
                            if (shiftedIndex < 0) shiftedIndex = 0;
                            jcarousel.jcarousel('scroll',shiftedIndex);
                        }
                    }
                }
            }

        })
        .on('jcarousel:createend', function () {
            jcarousel.closest('.modal').css('overflow-y','scroll');
            jcarousel.find('ul').css({
                top: '0px',
                left: '0px'
            });
            jcarousel.jcarousel('items').first().trigger('click');
        })
        .jcarousel({
            wrap: null
        });

    $('.jcarousel-control-prev')
        .jcarouselControl({
            target: '-=1'
        });

    $('.jcarousel-control-next')
        .jcarouselControl({
            target: '+=1'
        });

    $('.jcarousel-pagination')
        .on('jcarouselpagination:active', 'a', function() {
            $(this).addClass('active');
        })
        .on('jcarouselpagination:inactive', 'a', function() {
            $(this).removeClass('active');
        })
        .on('click', function(e) {
            e.preventDefault();
        })
        .jcarouselPagination({
            perPage: 1,
            item: function(page) {
                return '<a href="#' + page + '">' + page + '</a>';
            }
        });


    function preloadImage(src,callback){
        var obj = new Image();
        obj.src = src;
        if (obj.complete) {
            callback();
            obj.onload=function(){};
        } else {
            obj.onload = function(){
                callback();
                obj.onload=function(){};
            }
        }
    }

    var container = jcarousel.closest('.jcarousel-container');
    container.delegate('.jcarousel-preview-prev, .jcarousel-preview-next','click',function(){
        var index = $(this).attr('data-index');
        if (index === false || $(this).attr('data-disabled') == 1) return;
        jcarousel.jcarousel('scroll',index);
        jcarousel.find('li.jcarousel-item[data-index='+index+']').trigger('click');
    });
}
