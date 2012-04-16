(function($){
/*
 * jMerrygoround jQuery Plugin version 1.0
 * http://lab.hisasann.com/jmerrygoround/
 *
 * Copyright (c) 2009 hisasann http://hisasann.com/
 * Dual licensed under the MIT and GPL licenses.
 */

var
	// 画像ロケーション情報
	offset = [],
	// オプション
	options = {
		radiusX: 200,			// Radius X point
		radiusY: 30,			// Radius Y point
		centerX: 250,			// Position adjustment left
		centerY: 100,			// Position adjustment top
		width: 140,				// Image height
		height: 100,			// Image width
		action: "click",		// Animation action
		motion: "normal",		// Click action motion
		duration: 800,			// Easing speed
		easing: "swing",		// Animation type
		nextId: "#next",		// Next button element id
		prevId: "#prev",		// Prev button element id
		targetElem: "img",		// Merrygoround target element
		reflection: false		// Reflection flag
	},
	// Merrygoroundさせたいエレメント
	$imgs,
	// Merrygoround対象のエレメントを持つ親オブジェクト
	$this;

$.jMerrygoround = function(targetId, opts){
	$.extend(options, opts);
	$imgs = $(targetId).find(options.targetElem);
	$this = $(targetId);

	setup();
}

$.fn.jMerrygoround = function(opts){
	$.extend(options, opts);
	$imgs = $(this).find(options.targetElem);
	$this = $(this);

	setup();
}

// Setup!!
function setup() {
	// リフレクション画像の表示枠
	if(options.reflection)
		$this.append("<div id='reflection'></div>");

	// フラッシュ
	(options.targetElem == "img" ?
					$($imgs).fadeIn(500) :
					$($imgs).find("img").fadeIn(500));

	$($imgs).each(function(index){
		// id指定
		$(this).attr("id", "img" + index);
		
		// 画像のポジションを計算します
		slider(index, $(this), true, false);

		// リフレクション画像の作成
		createReflector(options.targetElem == "img" ?
					$(this)[0] :
					$(this).find("img")[0], $(this).attr("id"), offset[index]);
	});

	// actionに合わせたイベント指定
	$.fn.jMerrygoround[options.action]();
}

var speed = 0;
function slider(index, elem, isBuff, isSpeedup){
	var numSlots = $($imgs).size(),
		_a, _t, _l, _s, _h, _w, zindex, opacity;
	_a = index * ((Math.PI * 2) / numSlots);

	if(isSpeedup)
		_a += speed;

	_t = Math.sin(_a) * options.radiusY + options.centerY;
	_l = Math.cos(_a) * options.radiusX + options.centerX;
	_s = (_t / ((options.centerY) + options.radiusY));
	_w = elem.width() * (options.width / elem.width());
	_h = elem.height() * (options.height / elem.height());
	zindex = 2000 + Math.floor(_w * _s);
	opacity = (Math.floor((_w * _s) / 10) / 10) - 0.2;

	// 画像ロケーション情報の保存
	// actionをclickにした場合に使用
	if(isBuff)
		offset[index] = {
			top: _t - 70, left: _l,
			width: _w * _s, height: _h * _s,
			zIndex: zindex, opacity: opacity
		}

	elem.css({
			position: "absolute", top: _t - 70, left: _l,
			width: (_w * _s) + "px", height: (_h * _s) + "px",
			zIndex: zindex,
			opacity: opacity
	});
}

// リフレクションしたcanvasを取得
// via http://lab.hisasann.com/reflector/
var _opacity = 0.5, _height = 0.5;
function createReflector(elem, id, offset){
	if(!options.reflection)
		return;

	var reflector;
	var refHeight = Math.floor(elem.height * _height);
	var refWidth = elem.width;
	var canvas = document.createElement("canvas")
	if(canvas.getContext){		// not IE
		canvas.id = id + "can";
		canvas.style.position = "absolute";
		canvas.style.top = offset.top + offset.height - 1 + "px";
		canvas.style.left = offset.left + "px";
		canvas.style.height = refHeight + "px";
		canvas.style.width = refWidth + "px";
		canvas.height = refHeight;
		canvas.width = refWidth;
		var ctx = canvas.getContext("2d")
		with(ctx){
			save();
			translate(0, elem.height);
			scale(1,-1);
			drawImage(elem, 0, 0, elem.width, elem.height);
			restore();
			var gradient = createLinearGradient(0, 0, 0, refHeight);
			gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
			gradient.addColorStop(0, "rgba(0, 0, 0, " + _opacity + ")");
			globalCompositeOperation = "destination-out";
			fillStyle = gradient;
			fillRect(0, 0, refWidth, refHeight);
			fill();
		}
		reflector = canvas;
	}else{		// IE
		var reflection = document.createElement("img");
		reflection.id = id + "can";
		with(reflection){
			src = elem.src;
			style.position = "absolute";
			style.top = offset.top + offset.height - 1 + "px";
			style.left = offset.left + "px";
			style.width = refWidth + "px";
			style.height = elem.height + "px";
			style.display = "block";
			style.marginBottom = "-"+(elem.height - refHeight)+"px";
			style.filter = 'flipv progid:DXImageTransform.Microsoft.Alpha(opacity='+(_opacity*100)+', style=1, finishOpacity=0, startx=0, starty=0, finishx=0, finishy='+(_height*100)+')';
		}
		reflector = reflection;
	}
	$(reflector).appendTo("#reflection");
}

// auto animation
$.fn.jMerrygoround.auto = function() {
	var interval,
		width = $this.width() / 2,
	offsetX = $this.offset().left;
	interval = setInterval(function(){
		$($imgs).each(function(index){
			slider(index, $(this), true, true);
			reflectCSS($(this), offset[index]);
		});
		speed += 0.05;
	}, 10);
}

// mouseover animation
$.fn.jMerrygoround.mouseover = function() {
	var interval,
		width = $this.width() / 2,
		offsetX = $this.offset().left;
	$this.mouseover(function(e){
		interval = setInterval(function(){
			$($imgs).each(function(index){
				slider(index, $(this), true, true);
				reflectCSS($(this), offset[index]);
			});
			speed += ((e.pageX - offsetX) - width) / 1500;
		}, 10);
	});
	$this.mouseout(function(e){
		clearInterval(interval);
		interval = null;
	});
}

// mousedown animation
$.fn.jMerrygoround.mousedown = function() {
	var interval = null;
	// next
	$(options.nextId).mousedown(function(e){
		interval = setInterval(function(){
			speed += 0.1;
			$($imgs).each(function(index){
				slider(index, $(this), true, true);
				reflectCSS($(this), offset[index]);
			});
		}, 10);
	}).mouseup(function(e){
		clearInterval(interval);
		interval = null;
	}).mouseout(function(e){
		clearInterval(interval);
		interval = null;
	});
	// prev
	$(options.prevId).mousedown(function(e){
		interval = setInterval(function(){
			speed -= 0.1;
			$($imgs).each(function(index){
				slider(index, $(this), true, true);
				reflectCSS($(this), offset[index]);
			});
		}, 10);
	}).mouseup(function(e){
		clearInterval(interval);
		interval = null;
	}).mouseout(function(e){
		clearInterval(interval);
		interval = null;
	});
}

// click animation
var nowIndex = 0;
$.fn.jMerrygoround.click = function(){
	// next
	$(options.nextId).mousedown(function(){
		// 一周したら元のインデックスに戻る
		if(nowIndex >= $($imgs).size())
			nowIndex = 1;
		else
			nowIndex++;

		$($imgs).each(function(index) {
			$.fn.jMerrygoround.click[options.motion]($(this), offset[calcIndex(nowIndex + index)], index);
			reflectAnime($(this), offset[calcIndex(nowIndex + index)]);
		});
	});
	// prev
	$(options.prevId).click(function(){
		// 一周したら元のインデックスに戻る
		if(nowIndex <= -$($imgs).size())
			nowIndex = -1;
		else
			nowIndex--;

		$($imgs).each(function(index) {
			$.fn.jMerrygoround.click[options.motion]($(this), offset[calcIndex(nowIndex + index)], index);
			reflectAnime($(this), offset[calcIndex(nowIndex + index)]);
		});
	});
}

// click animation - normal
$.fn.jMerrygoround.click.normal = function(elem, offset, index){
	elem.css({
			zIndex: offset.zIndex,
			opacity: offset.opacity
		}).animate(
		{
			left: offset.left + 'px',
			top: offset.top + 'px',
			width: offset.width + 'px',
			height: offset.height + 'px'
		},
		{queue: true, duration: options.duration, easing: options.easing, complete: function(){}}
	);
};

// click animation - spiral
$.fn.jMerrygoround.click.spiral = function(elem, offset, index){
		elem.animate(
			{
				top: index * offset.height / 4 - options.centerY + 'px'
			},
			{queue: true, duration: options.duration, easing: options.easing, complete: function(){
				setTimeout(function() {
					elem.css({
							zIndex: offset.zIndex,
							opacity: offset.opacity
						}).animate(
						{
							left: offset.left + 'px',
							top: offset.top + 'px',
							width: offset.width + 'px',
							height: offset.height + 'px'
						},
						{queue: true, duration: options.duration, easing: options.easing, complete: function(){}}
					);
				}, Math.random() * options.duration);
			}}
		);
}

// click animation - shake
$.fn.jMerrygoround.click.shake = function(elem, offset, index){
	setTimeout(function() {
		elem.animate(
			{
				left: Math.sin(index) * options.radiusX + options.centerX + 'px',
				top: Math.cos(index) * options.radiusY + options.centerY + 'px',
				opacity: 0.6
			},
			{queue: true, duration: options.duration, easing: options.easing, complete: function(){
				elem.css({
						zIndex: offset.zIndex,
						opacity: offset.opacity
					}).animate(
					{
						left: offset.left + 'px',
						top: offset.top + 'px',
						width: offset.width + 'px',
						height: offset.height + 'px'
					},
					{queue: true, duration: options.duration, easing: options.easing, complete: function(){}}
				);
			}}
		);
	}, Math.random() * options.duration);
}

// click animation - grow
$.fn.jMerrygoround.click.grow = function(elem, offset, index){
	elem.animate(
		{
			width: Math.random() * options.width + 'px',
			height: Math.random() * options.height + 'px'
		},
		{queue: true, duration: options.duration, easing: options.easing, complete: function(){
			elem.css({
					zIndex: offset.zIndex,
					opacity: offset.opacity
				}).animate(
				{
					left: offset.left + 'px',
					top: offset.top + 'px',
					width: offset.width + 'px',
					height: offset.height + 'px'
				},
				{queue: true, duration: options.duration, easing: options.easing, complete: function(){}}
			);
		}}
	);
}

// click animation - delay
$.fn.jMerrygoround.click.delay = function(elem, offset, index){
	setTimeout(function() {
		elem.animate(
			{
				left: offset.left + 'px',
				top: offset.top + 'px',
				width: offset.width + 'px',
				height: offset.height + 'px'
			},
			{queue: true, duration: options.duration, easing: options.easing, complete: function(){
				$(this).css({
					zIndex: offset.zIndex,
					opacity: offset.opacity
				});
			}}
		);
	}, Math.random() * options.duration);
}

// リフレクション用CSS設定
function reflectCSS(elem, offset) {
	if(!options.reflection)
		return;
	$("#" + elem.attr("id") + "can").css({
		left: offset.left + 'px',
		top: offset.top + offset.height - 1 + 'px',
		width: offset.width + 'px',
		height: $.browser.msie ? offset.height : Math.floor(offset.height * _height) + 'px'
	});
}

// リフレクション用アニメーション
function reflectAnime(elem, offset) {
	if(!options.reflection)
		return;
	$("#" + elem.attr("id") + "can").animate({
		left: offset.left + 'px',
		top: offset.top + offset.height - 1 + 'px',
		width: offset.width + 'px',
		height: $.browser.msie ? offset.height : Math.floor(offset.height * _height) + 'px'
	}, options.duration, options.easing);
}

function calcIndex(x){
	var ret = 0;
	if(x < 0)
		ret = x + offset.length;
	else if(x >= offset.length)
		ret = x - offset.length;
	else
		ret = x;
	return ret;
}
// Thank you enjoy!!
})(jQuery);