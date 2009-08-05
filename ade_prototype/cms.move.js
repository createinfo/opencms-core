var over;
var favorites = ['item_010', 'item_011', 'item_012'];
var recent = [];
var recentSize = 3;
var cancel = false;
var oldBodyMarginTop = 0;
var zIndexMap = {};

var sortmenus = "#favoritelist ul, #recentlist ul"
var menuHandles = "#favoritelist a.cms-move, #recentlist a.cms-move"
var menus = "#favoritelist, #recentlist";
var currentMenu = "favoritelist";
var currentMenuItems = "favorite_list_items";



var isMenuContainer = function(id) {
	return id == 'favorite_list_items' || id == 'recent_list_items';
}

var movePreparation = function(event) {
	$(this).unbind('mouseenter').unbind('mouseleave').addClass('cms-trigger');
	hoverOut();
	$('a.cms-move:not(.cms-trigger)').hide();
}

var moveEnd = function(event) {
	$('a.cms-move').show();
	$(this).hover( function() {
		hoverIn($(this).parent(), 2)
	}, hoverOut).removeClass('cms-trigger');
}

var toggleMove = function(el) {
	var button = $(this);

	if (button.hasClass('ui-state-active')) {
		// disabling move-mode
		$(sortlist + ', #favorite_list_items').sortable('destroy');
		var list = $('#favoritelist');
		$('li.cms-item, button', list).css('display', 'block');
		list.css('display', 'none');
		list.get(0).style.visibility = '';
		$('#favorite_list_items').get(0).style.height = '';
		resetFavList();
		$('a.cms-move').remove();
		button.removeClass('ui-state-active');
	} else {
		$('button.ui-state-active').trigger('click');
		// enabling move mode
		$(sortitems).each(
				function() {
					var elem = $(this).css('position', 'relative');
					$('<a class="cms-handle cms-move"></a>').appendTo(elem)
							.hover( function() {
								hoverIn(elem, 2)
							}, hoverOut).mousedown(movePreparation).mouseup(
									moveEnd);
				});

		var list = $('#favoritelist');
		var favbutton = $('button[name="Favorites"]');
		$('li.cms-item, button', list).css('display', 'none');
		list.appendTo('#toolbar_content').css( {
			top :35,
			left :favbutton.position().left - 217,
			display :'block',
			visibility :'hidden'
		});
		$('#favorite_list_items').css('height', '37px');
		$('div.ui-widget-shadow', list).css( {
			top :0,
			left :-4,
			width :list.outerWidth() + 8,
			height :list.outerHeight() + 2,
			border :'0px solid',
			opacity :0.6
		});

		$(sortlist).children('*:visible').css('position', 'relative');
		$(sortlist + ', #favorite_list_items').sortable( {
			connectWith :sortlist + ', #favorite_list_items',
			placeholder :'placeholder',
			dropOnEmpty :true,
			start :startAdd,
			beforeStop :beforeStopFunction,
			over :overAdd,
			out :outAdd,
			tolerance :'pointer',
			opacity :0.7,
			stop :stopAdd,
			cursorAt : {
				right :10,
				top :10
			},
			zIndex :20000,
			handle :'a.cms-move',
			items :sortitems,
			revert :true,
			deactivate : function(event, ui) {
				$('#favorite_list_items li').hide(200);
				$('#favoritelist').css('visibility', 'hidden');
				if ($.browser.msie) {
					setTimeout("$(sortitems).css('display','block')", 10);
				}
			}
		});
		// list.css('display', 'none');

		button.addClass('ui-state-active');
	}
};

var startAdd = function(event, ui) {

	ui.self.cmsStartContainerId = ui.self.currentItem.parent().attr('id');
	// if (ui.self.cmsStartContainerId!='favorite_list_items'){
	// $('#favoritelist').css('display', 'block');
	// ui.self._refreshItems(event);
	// }
	ui.self.cmsHoverList = '#' + ui.self.cmsStartContainerId;
	ui.self.cmsCurrentContainerId = ui.self.cmsStartContainerId;
	ui.self.cmsResource_id = ui.self.currentItem.attr('rel');
	if (ui.self.cmsResource_id && cms_elements_list[ui.self.cmsResource_id]) {
		ui.self.cmsItem = cms_elements_list[ui.self.cmsResource_id];
		ui.self.cmsStartOffset = ui.placeholder.offset();
		ui.self.cmsHelpers = {};
		ui.self.cmsOrgPlaceholder = ui.placeholder.clone().insertBefore(
				ui.placeholder);
		ui.self.cmsOrgPlaceholder.addClass(ui.self.currentItem.attr('class'))
				.css( {
					'background-color' :'gray',
					'display' :'none',
					'height' :ui.self.currentItem.height()
				});
		zIndexMap = {};
		for (container_name in ui.self.cmsItem.contents) {
			var zIndex = $('#' + container_name).css('z-index');
			zIndexMap[container_name] = zIndex;
			if (container_name != ui.self.cmsStartContainerId) {
				ui.self.cmsHoverList += ', #' + container_name;
				ui.self.cmsHelpers[container_name] = $(
						ui.self.cmsItem.contents[container_name]).appendTo(
						'#' + container_name).css( {
					'display' :'none',
					'position' :'absolute',
					'zIndex' :ui.self.options.zIndex
				}).addClass('ui-sortable-helper');
				if (ui.self.cmsStartContainerId != currentMenuItems) {
					// if we aren't starting from the favorite list, call
					// movePreparation on the handle
					// (hides all other handles)
					$('<a class="cms-handle cms-move"></a>').appendTo(
							ui.self.cmsHelpers[container_name]).mousedown(
							movePreparation).mouseup(moveEnd);
				} else {
					$('<a class="cms-handle cms-move"></a>').appendTo(
							ui.self.cmsHelpers[container_name]);
				}

			} else {
				ui.self.cmsHelpers[container_name] = ui.self.helper;
				ui.self.cmsOver = true;
			}
		}
		if (isMenuContainer(ui.self.cmsStartContainerId)) {
			ui.self.cmsHelpers[currentMenuItems] = ui.self.helper;
			var elem = $(document.createElement('div')).addClass(
					"placeholder" + " ui-sortable-placeholder box").css(
					'display', 'none');
			ui.placeholder.replaceWith(elem);
			ui.self.placeholder = elem;

			$('.cms-additional', ui.self.currentItem).hide();
			if (!$('#cms_appendbox').length) {
				$(document.body).append('<div id="cms_appendbox"></div>');
			}
			ui.self.helper.appendTo('#cms_appendbox');
			ui.self._cacheHelperProportions();
			ui.self._adjustOffsetFromHelper(ui.self.options.cursorAt);
			ui.self.refreshPositions(true);
			$('#' + ui.self.cmsStartContainerId).closest('.cms-item-list').css(
					'display', 'none');
			ui.self.cmsOver = false;
		} else {

			fixZIndex(ui.self.cmsStartContainerId, zIndexMap);

			// show drop zone for new favorites
			var list_item = '<li class="cms-item"  rel="'
					+ ui.self.cmsResource_id
					+ '"><div class=" ui-widget-content"><div class="cms-head ui-state-hover"><div class="cms-navtext"><a class="left ui-icon ui-icon-triangle-1-e"></a>'
					+ ui.self.cmsItem.nav_text
					+ '</div><span class="cms-title">'
					+ ui.self.cmsItem.title
					+ '</span><span class="cms-file-icon"></span><a class="cms-handle cms-move"></a></div><div class="cms-additional"><div alt="File: '
					+ ui.self.cmsItem.file
					+ '"><span class="left">File:</span>'
					+ ui.self.cmsItem.file + '</div><div alt="Date: '
					+ ui.self.cmsItem.date
					+ '"><span class="left">Date:</span>'
					+ ui.self.cmsItem.date + '</div><div alt="User: '
					+ ui.self.cmsItem.user
					+ '"><span class="left">User:</span>'
					+ ui.self.cmsItem.user + '</div><div alt="Type: '
					+ ui.self.cmsItem.type
					+ '"><span class="left">Type:</span>'
					+ ui.self.cmsItem.type + '</div></div></div></li>';
			ui.self.cmsHelpers['favorite_list_items'] = $(list_item).appendTo(
					'#favorite_list_items').css( {
				'display' :'none',
				'position' :'absolute',
				'zIndex' :ui.self.options.zIndex
			}).addClass('ui-sortable-helper');
			$('#favoritelist').css('visibility', 'visible');
		}
		ui.self.placeholder.addClass(ui.self.currentItem.attr('class')).css( {
			'background-color' :'blue',
			'border' :'solid 2px black',
			'height' :ui.helper.height()
		});
		$(ui.self.cmsHoverList).each( function() {
			hoverInner($(this), 2);
		});

	} else {
		$(sortlist).sortable('cancel');
	}
}

var beforeStopFunction = function(event, ui) {
	if (!ui.self.cmsOver)
		cancel = true;
	else
		cancel = false;
}

var stopAdd = function(event, ui) {
	fixZIndex(null, zIndexMap);
	if (cancel) {
		cancel = false;

		if (isMenuContainer(ui.self.cmsStartContainerId)) {
			// show favorite list again after dragging a favorite from it.
			$('#' + currentMenu).css('display', 'block');
		}

		$(this).sortable('cancel');
		ui.self.cmsOrgPlaceholder.remove();

	} else {

		if (ui.self.cmsStartContainerId == currentMenuItems) {

			ui.self.cmsOrgPlaceholder
					.replaceWith(ui.self.cmsHelpers[currentMenuItems]);
			ui.self.cmsHelpers[currentMenuItems]
					.removeClass('ui-sortable-helper');
			clearAttributes(ui.self.cmsHelpers[currentMenuItems].get(0).style,
					[ 'width', 'height', 'top', 'left', 'position', 'opacity',
							'zIndex', 'display' ]);
			$('a.cms-move', ui.self.currentItem).remove();
			$('button.ui-state-active').trigger('click');
		} else {

			if (ui.self.cmsCurrentContainerId == 'favorite_list_items') {

				addUnique(favorites, ui.self.cmsResource_id);
			}
			ui.self.cmsOrgPlaceholder.remove();
		}
		addToRecent(ui.self.cmsResource_id);
	}
	for (container_name in ui.self.cmsHelpers) {

		if (container_name != ui.self.cmsCurrentContainerId
				&& !(ui.self.cmsStartContainerId == container_name && isMenuContainer(container_name))) {
			if (container_name == ui.self.cmsStartContainerId
					&& ui.self.cmsCurrentContainerId == 'favorite_list_items') {
				ui.self.cmsHelpers[container_name]
						.removeClass('ui-sortable-helper');
				// reset position (?) of helper that was dragged to favorites,
				// but don't remove it
				clearAttributes(
						ui.self.cmsHelpers[container_name].get(0).style, [
								'width', 'height', 'top', 'left', 'opacity',
								'zIndex', 'display' ]);

				ui.self.cmsHelpers[container_name].get(0).style.position = 'relative';
				if ($.browser.msie)
					ui.self.cmsHelpers[container_name].get(0).style
							.removeAttribute('filter');
			} else {
				// remove helper

				ui.self.cmsHelpers[container_name].remove();

			}
		}
	}

	$(ui.self.cmsHoverList).removeClass('show-sortable');

	hoverOut();

	clearAttributes(ui.self.currentItem.get(0).style, [ 'top', 'left',
			'zIndex', 'display' ]);
	if ($.browser.msie) {
		ui.self.currentItem.get(0).style.removeAttribute('filter');

		// ui.self.currentItem.get(0).style.removeAttribute('position');

	} else if (ui.self.currentItem) {

		// ui.self.currentItem.get(0).style.position='';
		ui.self.currentItem.get(0).style.opacity = '';
	}

}

/**
 * sertzsrthzs
 * 
 * @param {Event}
 *            event fff
 * @param {}
 *            ui
 */
var overAdd = function(event, ui) {

	var elem = event.target ? event.target : event.srcElement;
	var elemId = $(elem).attr('id');
	var reDoHover = !ui.self.cmsOver;
	if (ui.self.cmsStartContainerId != elemId
			&& ui.self.cmsStartContainerId != 'favorite_list_items'
			&& ui.self.cmsStartContainerId != 'recent_list_items') {
		// show pacelholder in start container if dragging over a different
		// container, but not from favorites or recent
		ui.self.cmsOrgPlaceholder.css( {
			'display' :'block',
			'border' :'dotted 2px black'
		});
	} else {
		// hide placeholder (otherwise both the gray and blue boxes would be
		// shown)
		ui.self.cmsOrgPlaceholder.css('display', 'none');
	}
	if (ui.self.cmsHelpers[elemId]) {
		fixZIndex(elemId, zIndexMap);
		ui.placeholder.css('display', 'block');
		ui.self.cmsOver = true;
		if (elemId != ui.self.cmsCurrentContainerId) {

			ui.self.cmsCurrentContainerId = elemId;

			reDoHover = true;
			// hide dragged helper, display helper for container instead
			ui.self.helper.css('display', 'none');
			ui.self.helper = ui.self.cmsHelpers[elemId].css('display', 'block');
			ui.self.currentItem = ui.self.cmsHelpers[elemId];
			ui.self.helper.width(ui.placeholder.width());
			ui.self.helper.height('auto');

			ui.self._cacheHelperProportions();
			ui.self._adjustOffsetFromHelper(ui.self.options.cursorAt);
			ui.self.refreshPositions(true);

		}

		ui.placeholder.height(ui.self.helper.height());
	} else {
		ui.placeholder.css('display', 'none');
		ui.self.cmsOver = false;
	}
	if (elemId == 'favorite_list_items'
			&& ui.placeholder.parent().attr('id') != elemId)
		ui.placeholder.appendTo(elem);

	if (reDoHover) {
		hoverOut();
		$(ui.self.cmsHoverList).each( function() {
			hoverInner($(this), 2);
		});
	}

}

var outAdd = function(event, ui) {
	var elem = event.target ? event.target : event.srcElement;
	var elemId = $(elem).attr('id');
	if (ui.self.helper && elemId==ui.self.cmsCurrentContainerId){
		if (ui.self.cmsStartContainerId != ui.self.cmsCurrentContainerId) {
			ui.self.cmsCurrentContainerId = ui.self.cmsStartContainerId;
			fixZIndex(ui.self.cmsStartContainerId, zIndexMap);
			ui.self.helper.css('display', 'none');
			ui.self.helper = ui.self.cmsHelpers[ui.self.cmsCurrentContainerId]
					.css('display', 'block');
			ui.self.currentItem = ui.self.cmsHelpers[ui.self.cmsCurrentContainerId];
			ui.self._cacheHelperProportions();
			ui.self._adjustOffsetFromHelper(ui.self.options.cursorAt);
			ui.self.refreshPositions(true);
		}
		ui.placeholder.css('display', 'none');
		if (ui.self.cmsStartContainerId != 'favorite_list_items') {
			ui.self.cmsOrgPlaceholder.css( {
				'display' :'block',
				'border' :'solid 2px black'
			});
		}
		ui.self.cmsOver = false;
		hoverOut();
		$(ui.self.cmsHoverList).each( function() {
			hoverInner($(this), 2);
		});
	}

}

var hoverIn = function(elem, hOff) {

	var position = getElementPosition(elem);
	var tHeight = elem.outerHeight();
	var tWidth = elem.outerWidth();
	var hWidth = 2;
	var lrHeight = tHeight + 2 * (hOff + hWidth);
	var btWidth = tWidth + 2 * (hOff + hWidth);
	var tlrTop = position.top - (hOff + hWidth);
	var tblLeft = position.left - (hOff + hWidth);
	// top
	$('<div class="hovering hovering-top"></div>').height(hWidth)
			.width(btWidth).css('top', tlrTop).css('left', tblLeft).appendTo(
					document.body);

	// right
	$('<div class="hovering hovering-right"></div>').height(lrHeight).width(
			hWidth).css('top', tlrTop).css('left',
			position.left + tWidth + hOff).appendTo(document.body);
	// left
	$('<div class="hovering hovering-left"></div>').height(lrHeight).width(
			hWidth).css('top', tlrTop).css('left', tblLeft).appendTo(
			document.body);
	// bottom
	$('<div class="hovering hovering-bottom"></div>').height(hWidth).width(
			btWidth).css('top', position.top + tHeight + hOff).css('left',
			tblLeft).appendTo(document.body);

}

var hoverInner = function(elem, hOff) {

	var position = {
		left :'x',
		top :'x'
	};
	var bottom = 'x';
	var right = 'x';

	$(elem.children('*:visible'))
			.each(
					function() {
						var el = $(this);
						if (!el.hasClass('ui-sortable-helper')) {
							var pos = getElementPosition(el);
							position.left = (position.left == 'x' || pos.left < position.left) ? pos.left
									: position.left;
							position.top = (position.top == 'x' || pos.top < position.top) ? pos.top
									: position.top;
							bottom = (bottom == 'x' || bottom < (pos.top + el
									.outerHeight())) ? pos.top
									+ el.outerHeight() : bottom;
							right = (right == 'x' || right < (pos.left + el
									.outerWidth())) ? pos.left
									+ el.outerWidth() : right;
						}
					});
	var tHeight = bottom - position.top;
	var tWidth = right - position.left;
	var elemPos = getElementPosition(elem);

	if (bottom == 'x') {
		tHeight = 25;
		tWidth = elem.innerWidth();
		position = elemPos;
	}

	var hWidth = 2;

	var inner = {
		top :position.top - (elemPos.top + hOff),
		left :position.left - (elemPos.left + hOff),
		height :tHeight + 2 * hOff,
		width :tWidth + 2 * hOff
	};
	// inner
	$(
			'<div class="show-sortable" style="position: absolute; z-index:0; top: '
					+ inner.top + 'px; left: ' + inner.left + 'px; height: '
					+ inner.height + 'px; width: ' + inner.width
					+ 'px;"></div>').prependTo(elem);

	// top
	$('<div class="hovering hovering-top"></div>').height(hWidth).width(
			tWidth + 2 * (hOff + hWidth)).css('top',
			position.top - (hOff + hWidth)).css('left',
			position.left - (hOff + hWidth)).appendTo(document.body);
	// right
	$('<div class="hovering hovering-right"></div>').height(
			tHeight + 2 * (hOff + hWidth)).width(hWidth).css('top',
			position.top - (hOff + hWidth)).css('left',
			position.left + tWidth + hOff).appendTo(document.body);
	// left
	$('<div class="hovering hovering-left"></div>').height(
			tHeight + 2 * (hOff + hWidth)).width(hWidth).css('top',
			position.top - (hOff + hWidth)).css('left',
			position.left - (hOff + hWidth)).appendTo(document.body);
	// bottom
	$('<div class="hovering hovering-bottom"></div>').height(hWidth).width(
			tWidth + 2 * (hOff + hWidth)).css('top',
			position.top + tHeight + hOff).css('left',
			position.left - (hOff + hWidth)).appendTo(document.body);

}
var hoverOut = function() {
	$('div.hovering, div.show-sortable').remove();

}

var clickFavDeleteIcon = function() {
	var button = $(this);
	var toRemove = button.parent().parent();
	toRemove.remove();
}

var arrayToString = function(arr) {
	return "[" + arr.join(", ") + "]";
}

var saveFavorites = function() {
	var newFavs = [];
	$("#fav-dialog li.cms-item").each( function() {
		var resource_id = this.getAttribute("rel");
		addUnique(newFavs, resource_id);
	});
	favorites = newFavs;
	resetFavList();

}

var favEditOK = function() {
	$(this).dialog("close");
	saveFavorites();
}

var favEditCancel = function() {
	$(this).dialog("close");
}

var initFavDialog = function() {
	$("#fav-edit").click(showFavDialog);
	var buttons = {
		"Cancel" :favEditCancel,
		"OK" :favEditOK

	};
	$('#fav-dialog').dialog( {
		width :340,
		// height: 500,
		title :"Edit favorites",
		modal :true,
		autoOpen :false,
		draggable :true,
		resizable :false,
		position : [ 'center', 20 ],
		close : function() {
			$('#fav-edit').removeClass('ui-state-active');
		},
		buttons :buttons,
		zIndex :10000
	});

}

var initFavDialogItems = function() {
	$("#fav-dialog ul").remove();
	$("#fav-dialog").append("<ul></ul>")
	var html = []
	for ( var i = 0; i < favorites.length; i++) {
		html.push(createItemFavDialogHtml(cms_elements_list[favorites[i]]));
	}
	$("#fav-dialog ul").append(html.join(''));
	$("#fav-dialog .cms-delete-icon").click(clickFavDeleteIcon);
	$("#fav-dialog ul").sortable();
	// $("#fav-dialog a.ui-icon").click(function() {clickTriangle(this);});
	$('#fav-dialog div.cms-additional div').jHelperTip( {
		trigger :'hover',
		source :'attribute',
		attrName :'alt',
		topOff :-30,
		opacity :0.8
	});
}

var showFavDialog = function() {
	var button = $(this);
	$("#fav-dialog li").show(); // Make "deleted" items show up again
	if (button.hasClass("ui-state-active")) {
		button.removeClass("ui-state-active");
	} else {
		$('button.ui-state-active').trigger('click');
		// enabling move-mode
		initFavDialogItems();
		$('#fav-dialog').dialog('open');
		button.addClass('ui-state-active');
	}
}

var clickTriangle = function(triangle) {
	var elem = $(triangle);
	if (elem.hasClass('ui-icon-triangle-1-e')) {
		elem.removeClass('ui-icon-triangle-1-e').addClass(
				'ui-icon-triangle-1-s');
		elem.parents('.ui-widget-content').children('.cms-additional').show(5,
				function() {
					var list = $(this).parents('div.cms-item-list');
					$('div.ui-widget-shadow', list).css( {
						height :list.outerHeight() + 2
					});
				});
	} else {
		elem.removeClass('ui-icon-triangle-1-s').addClass(
				'ui-icon-triangle-1-e');
		elem.parents('.ui-widget-content').children('.cms-additional').hide(5,
				function() {
					var list = $(this).parents('div.cms-item-list');
					$('div.ui-widget-shadow', list).css( {
						height :list.outerHeight() + 2
					});
				});
	}
	return false;
}

var resetFavList = function() {
	$("#favoritelist li.cms-item").remove();
	var $favlist = $("#favoritelist ul");
	for ( var i = 0; i < favorites.length; i++) {
		$favlist.append(createItemFavListHtml(cms_elements_list[favorites[i]]))
	}
	// $("#favoritelist a.ui-icon").click(function() {clickTriangle(this)});
}

var addToRecent = function(itemId) {
	addUnique(recent, itemId, recentSize);
}

var resetRecentList = function() {
	$("#recentlist li.cms-item").remove();
	var $recentlist = $("#recent_list_items");
	for ( var i = 0; i < recent.length; i++) {
		$recentlist.append(createItemFavListHtml(cms_elements_list[recent[i]]));
	}
}

var toggleList = function(buttonElem, newMenu) {
	var button = $(buttonElem);
	var newMenuItems = $('#' + newMenu).find("ul").attr('id');
	if (button.hasClass('ui-state-active')) {

		$(sortlist + ', ' + sortmenus).sortable('destroy');
		$(menuHandles).remove();
		$(menus).hide();
		button.removeClass('ui-state-active');
	} else {
		resetRecentList();
		currentMenu = newMenu;
		currentMenuItems = newMenuItems
		$('button.ui-state-active').trigger('click');

		// enabling move-mode
		// * current menu
		list = $('#' + currentMenu);
		$('.cms-head', list).each( function() {
			var elem = $(this);
			$('<a class="cms-handle cms-move"></a>').appendTo(elem);
		});
		list.appendTo('#toolbar_content').css( {
			/* position : 'fixed', */
			top :35,
			left :$(buttonElem).position().left - 217
		}).slideDown(100, function() {
			$('div.ui-widget-shadow', list).css( {
				top :0,
				left :-4,
				width :list.outerWidth() + 8,
				height :list.outerHeight() + 2,
				border :'0px solid',
				opacity :0.6
			});
		});
		$(sortlist).children('*:visible').css('position', 'relative');
		// * current menu
		$(sortlist + ', #' + currentMenuItems).sortable( {
			// * current menu
			connectWith :sortlist + ', #' + currentMenuItems,
			placeholder :'placeholder',
			dropOnEmpty :true,
			start :startAdd,
			beforeStop :beforeStopFunction,
			over :overAdd,
			out :outAdd,
			tolerance :'pointer',
			opacity :0.7,
			stop :stopAdd,
			cursorAt : {
				right :15,
				top :10
			},
			handle :'a.cms-move',
			items :sortitems + ', li.cms-item',
			revert :100,
			deactivate : function(event, ui) {
				$('a.cms-move', $(this)).removeClass('cms-trigger');
				if ($.browser.msie) {
					setTimeout("$(sortitems).css('display','block')", 10);
				}
			}
		});
		button.addClass('ui-state-active');
	}
};
