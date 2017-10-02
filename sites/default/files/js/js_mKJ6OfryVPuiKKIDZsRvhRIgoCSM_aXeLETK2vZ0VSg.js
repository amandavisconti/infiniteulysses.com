/*
** Annotator v1.2.9
** https://github.com/okfn/annotator/
**
** Copyright 2013, the Annotator project contributors.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/okfn/annotator/blob/master/LICENSE
**
** Built at: 2013-12-02 17:58:01Z
 */
 ! 
function() {
	var $,
	Annotator,
	Delegator,
	LinkParser,
	Range,
	Util,
	base64Decode,
	base64UrlDecode,
	createDateFromISO8601,
	findChild,
	fn,
	functions,
	g,
	getNodeName,
	getNodePosition,
	gettext,
	parseToken,
	simpleXPathJQuery,
	simpleXPathPure,
	_Annotator,
	_gettext,
	_i,
	_j,
	_len,
	_len1,
	_ref,
	_ref1,
	_t,
	__slice = [].slice,
	__hasProp = {}.hasOwnProperty,
	__extends = function(child, parent) {
		for (var key in parent) {
			if (__hasProp.call(parent, key)) child[key] = parent[key]
		}
		function ctor() {
			this.constructor = child
		}
		ctor.prototype = parent.prototype;
		child.prototype = new ctor;
		child.__super__ = parent.prototype;
		return child
	},
	__bind = function(fn, me) {
		return function() {
			return fn.apply(me, arguments)
		}
	},
	__indexOf = [].indexOf || 
	function(item) {
		for (var i = 0, l = this.length; i < l; i++) {
			if (i in this && this[i] === item) return i
		}
		return - 1
	};
	simpleXPathJQuery = function(relativeRoot) {
		var jq;
		jq = this.map(function() {
			var elem,
			idx,
			path,
			tagName;
			path = "";
			elem = this;
			while ((elem != null ? elem.nodeType: void 0) === Node.ELEMENT_NODE && elem !== relativeRoot) {
				tagName = elem.tagName.replace(":", "\\:");
				idx = $(elem.parentNode).children(tagName).index(elem) + 1;
				idx = "[" + idx + "]";
				path = "/" + elem.tagName.toLowerCase() + idx + path;
				elem = elem.parentNode
			}
			return path
		});
		return jq.get()
	};
	simpleXPathPure = function(relativeRoot) {
		var getPathSegment,
		getPathTo,
		jq,
		rootNode;
		getPathSegment = function(node) {
			var name,
			pos;
			name = getNodeName(node);
			pos = getNodePosition(node);
			return "" + name + "[" + pos + "]"
		};
		rootNode = relativeRoot;
		getPathTo = function(node) {
			var xpath;
			xpath = "";
			while (node !== rootNode) {
				if (node == null) {
					throw new Error("Called getPathTo on a node which was not a descendant of @rootNode. " + rootNode)
				}
				xpath = getPathSegment(node) + "/" + xpath;
				node = node.parentNode
			}
			xpath = "/" + xpath;
			xpath = xpath.replace(/\/$/, "");
			return xpath
		};
		jq = this.map(function() {
			var path;
			path = getPathTo(this);
			return path
		});
		return jq.get()
	};
	findChild = function(node, type, index) {
		var child,
		children,
		found,
		name,
		_i,
		_len;
		if (!node.hasChildNodes()) {
			throw new Error("XPath error: node has no children!")
		}
		children = node.childNodes;
		found = 0;
		for (_i = 0, _len = children.length; _i < _len; _i++) {
			child = children[_i];
			name = getNodeName(child);
			if (name === type) {
				found += 1;
				if (found === index) {
					return child
				}
			}
		}
		throw new Error("XPath error: wanted child not found.")
	};
	getNodeName = function(node) {
		var nodeName;
		nodeName = node.nodeName.toLowerCase();
		switch (nodeName) {
		case "#text":
			return "text()";
		case "#comment":
			return "comment()";
		case "#cdata-section":
			return "cdata-section()";
		default:
			return nodeName
		}
	};
	getNodePosition = function(node) {
		var pos,
		tmp;
		pos = 0;
		tmp = node;
		while (tmp) {
			if (tmp.nodeName === node.nodeName) {
				pos++
			}
			tmp = tmp.previousSibling
		}
		return pos
	};
	gettext = null;
	if (typeof Gettext !== "undefined" && Gettext !== null) {
		_gettext = new Gettext({
			domain: "annotator"
		});
		gettext = function(msgid) {
			return _gettext.gettext(msgid)
		}
	} else {
		gettext = function(msgid) {
			return msgid
		}
	}
	_t = function(msgid) {
		return gettext(msgid)
	};
	if (! (typeof jQuery !== "undefined" && jQuery !== null ? (_ref = jQuery.fn) != null ? _ref.jquery: void 0: void 0)) {
		console.error(_t("Annotator requires jQuery: have you included lib/vendor/jquery.js?"))
	}
	if (! (JSON && JSON.parse && JSON.stringify)) {
		console.error(_t("Annotator requires a JSON implementation: have you included lib/vendor/json2.js?"))
	}
	$ = jQuery;
	Util = {};
	Util.flatten = function(array) {
		var flatten;
		flatten = function(ary) {
			var el,
			flat,
			_i,
			_len;
			flat = [];
			for (_i = 0, _len = ary.length; _i < _len; _i++) {
				el = ary[_i];
				flat = flat.concat(el && $.isArray(el) ? flatten(el) : el)
			}
			return flat
		};
		return flatten(array)
	};
	Util.contains = function(parent, child) {
		var node;
		node = child;
		while (node != null) {
			if (node === parent) {
				return true
			}
			node = node.parentNode
		}
		return false
	};
	Util.getTextNodes = function(jq) {
		var getTextNodes;
		getTextNodes = function(node) {
			var nodes;
			if (node && node.nodeType !== Node.TEXT_NODE) {
				nodes = [];
				if (node.nodeType !== Node.COMMENT_NODE) {
					node = node.lastChild;
					while (node) {
						nodes.push(getTextNodes(node));
						node = node.previousSibling
					}
				}
				return nodes.reverse()
			} else {
				return node
			}
		};
		return jq.map(function() {
			return Util.flatten(getTextNodes(this))
		})
	};
	Util.getLastTextNodeUpTo = function(n) {
		var result;
		switch (n.nodeType) {
		case Node.TEXT_NODE:
			return n;
		case Node.ELEMENT_NODE:
			if (n.lastChild != null) {
				result = Util.getLastTextNodeUpTo(n.lastChild);
				if (result != null) {
					return result
				}
			}
			break
		}
		n = n.previousSibling;
		if (n != null) {
			return Util.getLastTextNodeUpTo(n)
		} else {
			return null
		}
	};
	Util.getFirstTextNodeNotBefore = function(n) {
		var result;
		switch (n.nodeType) {
		case Node.TEXT_NODE:
			return n;
		case Node.ELEMENT_NODE:
			if (n.firstChild != null) {
				result = Util.getFirstTextNodeNotBefore(n.firstChild);
				if (result != null) {
					return result
				}
			}
			break
		}
		n = n.nextSibling;
		if (n != null) {
			return Util.getFirstTextNodeNotBefore(n)
		} else {
			return null
		}
	};
	Util.readRangeViaSelection = function(range) {
		var sel;
		sel = Util.getGlobal().getSelection();
		sel.removeAllRanges();
		sel.addRange(range.toRange());
		return sel.toString()
	};
	Util.xpathFromNode = function(el, relativeRoot) {
		var exception,
		result;
		try {
			result = simpleXPathJQuery.call(el, relativeRoot)
		} catch(_error) {
			exception = _error;
			console.log("jQuery-based XPath construction failed! Falling back to manual.");
			result = simpleXPathPure.call(el, relativeRoot)
		}
		return result
	};
	Util.nodeFromXPath = function(xp, root) {
		var idx,
		name,
		node,
		step,
		steps,
		_i,
		_len,
		_ref1;
		steps = xp.substring(1).split("/");
		node = root;
		for (_i = 0, _len = steps.length; _i < _len; _i++) {
			step = steps[_i];
			_ref1 = step.split("["),
			name = _ref1[0],
			idx = _ref1[1];
			idx = idx != null ? parseInt((idx != null ? idx.split("]") : void 0)[0]) : 1;
			node = findChild(node, name.toLowerCase(), idx)
		}
		return node
	};
	Util.escape = function(html) {
		return html.replace(/&(?!\w+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
	};
	Util.uuid = function() {
		var counter;
		counter = 0;
		return function() {
			return counter++
		}
	} ();
	Util.getGlobal = function() {
		return function() {
			return this
		} ()
	};
	Util.maxZIndex = function($elements) {
		var all,
		el;
		all = function() {
			var _i,
			_len,
			_results;
			_results = [];
			for (_i = 0, _len = $elements.length; _i < _len; _i++) {
				el = $elements[_i];
				if ($(el).css("position") === "static") {
					_results.push( - 1)
				} else {
					_results.push(parseFloat($(el).css("z-index")) || -1)
				}
			}
			return _results
		} ();
		return Math.max.apply(Math, all)
	};
	Util.mousePosition = function(e, offsetEl) {
		var offset,
		_ref1;
		if ((_ref1 = $(offsetEl).css("position")) !== "absolute" && _ref1 !== "fixed" && _ref1 !== "relative") {
			offsetEl = $(offsetEl).offsetParent()[0]
		}
		offset = $(offsetEl).offset();
		return {
			top: e.pageY - offset.top,
			left: e.pageX - offset.left
		}
	};
	Util.preventEventDefault = function(event) {
		return event != null ? typeof event.preventDefault === "function" ? event.preventDefault() : void 0: void 0
	};
	functions = ["log", "debug", "info", "warn", "exception", "assert", "dir", "dirxml", "trace", "group", "groupEnd", "groupCollapsed", "time", "timeEnd", "profile", "profileEnd", "count", "clear", "table", "error", "notifyFirebug", "firebug", "userObjects"];
	if (typeof console !== "undefined" && console !== null) {
		if (console.group == null) {
			console.group = function(name) {
				return console.log("GROUP: ", name)
			}
		}
		if (console.groupCollapsed == null) {
			console.groupCollapsed = console.group
		}
		for (_i = 0, _len = functions.length; _i < _len; _i++) {
			fn = functions[_i];
			if (console[fn] == null) {
				console[fn] = function() {
					return console.log(_t("Not implemented:") + (" console." + name))
				}
			}
		}
	} else {
		this.console = {};
		for (_j = 0, _len1 = functions.length; _j < _len1; _j++) {
			fn = functions[_j];
			this.console[fn] = function() {}
		}
		this.console["error"] = function() {
			var args;
			args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
			return alert("ERROR: " + args.join(", "))
		};
		this.console["warn"] = function() {
			var args;
			args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
			return alert("WARNING: " + args.join(", "))
		}
	}
	Delegator = function() {
		Delegator.prototype.events = {};
		Delegator.prototype.options = {};
		Delegator.prototype.element = null;
		function Delegator(element, options) {
			this.options = $.extend(true, {},
			this.options, options);
			this.element = $(element);
			this._closures = {};
			this.on = this.subscribe;
			this.addEvents()
		}
		Delegator.prototype.destroy = function() {
			return this.removeEvents()
		};
		Delegator.prototype.addEvents = function() {
			var event,
			_k,
			_len2,
			_ref1,
			_results;
			_ref1 = Delegator._parseEvents(this.events);
			_results = [];
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				event = _ref1[_k];
				_results.push(this._addEvent(event.selector, event.event, event.functionName))
			}
			return _results
		};
		Delegator.prototype.removeEvents = function() {
			var event,
			_k,
			_len2,
			_ref1,
			_results;
			_ref1 = Delegator._parseEvents(this.events);
			_results = [];
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				event = _ref1[_k];
				_results.push(this._removeEvent(event.selector, event.event, event.functionName))
			}
			return _results
		};
		Delegator.prototype._addEvent = function(selector, event, functionName) {
			var closure;
			closure = function(_this) {
				return function() {
					return _this[functionName].apply(_this, arguments)
				}
			} (this);
			if (selector === "" && Delegator._isCustomEvent(event)) {
				this.subscribe(event, closure)
			} else {
				this.element.delegate(selector, event, closure)
			}
			this._closures["" + selector + "/" + event + "/" + functionName] = closure;
			return this
		};
		Delegator.prototype._removeEvent = function(selector, event, functionName) {
			var closure;
			closure = this._closures["" + selector + "/" + event + "/" + functionName];
			if (selector === "" && Delegator._isCustomEvent(event)) {
				this.unsubscribe(event, closure)
			} else {
				this.element.undelegate(selector, event, closure)
			}
			delete this._closures["" + selector + "/" + event + "/" + functionName];
			return this
		};
		Delegator.prototype.publish = function() {
			this.element.triggerHandler.apply(this.element, arguments);
			return this
		};
		Delegator.prototype.subscribe = function(event, callback) {
			var closure;
			closure = function() {
				return callback.apply(this, [].slice.call(arguments, 1))
			};
			closure.guid = callback.guid = $.guid += 1;
			this.element.bind(event, closure);
			return this
		};
		Delegator.prototype.unsubscribe = function() {
			this.element.unbind.apply(this.element, arguments);
			return this
		};
		return Delegator
	} ();
	Delegator._parseEvents = function(eventsObj) {
		var event,
		events,
		functionName,
		sel,
		selector,
		_k,
		_ref1;
		events = [];
		for (sel in eventsObj) {
			functionName = eventsObj[sel];
			_ref1 = sel.split(" "),
			selector = 2 <= _ref1.length ? __slice.call(_ref1, 0, _k = _ref1.length - 1) : (_k = 0, []),
			event = _ref1[_k++];
			events.push({
				selector: selector.join(" "),
				event: event,
				functionName: functionName
			})
		}
		return events
	};
	Delegator.natives = function() {
		var key,
		specials,
		val;
		specials = function() {
			var _ref1,
			_results;
			_ref1 = jQuery.event.special;
			_results = [];
			for (key in _ref1) {
				if (!__hasProp.call(_ref1, key)) continue;
				val = _ref1[key];
				_results.push(key)
			}
			return _results
		} ();
		return "blur focus focusin focusout load resize scroll unload click dblclick\nmousedown mouseup mousemove mouseover mouseout mouseenter mouseleave\nchange select submit keydown keypress keyup error".split(/[^a-z]+/).concat(specials)
	} ();
	Delegator._isCustomEvent = function(event) {
		event = event.split(".")[0];
		return $.inArray(event, Delegator.natives) === -1
	};
	Range = {};
	Range.sniff = function(r) {
		if (r.commonAncestorContainer != null) {
			return new Range.BrowserRange(r)
		} else if (typeof r.start === "string") {
			return new Range.SerializedRange(r)
		} else if (r.start && typeof r.start === "object") {
			return new Range.NormalizedRange(r)
		} else {
			console.error(_t("Could not sniff range type"));
			return false
		}
	};
	Range.nodeFromXPath = function(xpath, root) {
		var customResolver,
		evaluateXPath,
		namespace,
		node,
		segment;
		if (root == null) {
			root = document
		}
		evaluateXPath = function(xp, nsResolver) {
			var exception;
			if (nsResolver == null) {
				nsResolver = null
			}
			try {
				return document.evaluate("." + xp, root, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
			} catch(_error) {
				exception = _error;
				console.log("XPath evaluation failed.");
				console.log("Trying fallback...");
				return Util.nodeFromXPath(xp, root)
			}
		};
		if (!$.isXMLDoc(document.documentElement)) {
			return evaluateXPath(xpath)
		} else {
			customResolver = document.createNSResolver(document.ownerDocument === null ? document.documentElement: document.ownerDocument.documentElement);
			node = evaluateXPath(xpath, customResolver);
			if (!node) {
				xpath = function() {
					var _k,
					_len2,
					_ref1,
					_results;
					_ref1 = xpath.split("/");
					_results = [];
					for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
						segment = _ref1[_k];
						if (segment && segment.indexOf(":") === -1) {
							_results.push(segment.replace(/^([a-z]+)/, "xhtml:$1"))
						} else {
							_results.push(segment)
						}
					}
					return _results
				} ().join("/");
				namespace = document.lookupNamespaceURI(null);
				customResolver = function(ns) {
					if (ns === "xhtml") {
						return namespace
					} else {
						return document.documentElement.getAttribute("xmlns:" + ns)
					}
				};
				node = evaluateXPath(xpath, customResolver)
			}
			return node
		}
	};
	Range.RangeError = function(_super) {
		__extends(RangeError, _super);
		function RangeError(type, message, parent) {
			this.type = type;
			this.message = message;
			this.parent = parent != null ? parent: null;
			RangeError.__super__.constructor.call(this, this.message)
		}
		return RangeError
	} (Error);
	Range.BrowserRange = function() {
		function BrowserRange(obj) {
			this.commonAncestorContainer = obj.commonAncestorContainer;
			this.startContainer = obj.startContainer;
			this.startOffset = obj.startOffset;
			this.endContainer = obj.endContainer;
			this.endOffset = obj.endOffset
		}
		BrowserRange.prototype.normalize = function(root) {
			var n,
			node,
			nr,
			r;
			if (this.tainted) {
				console.error(_t("You may only call normalize() once on a BrowserRange!"));
				return false
			} else {
				this.tainted = true
			}
			r = {};
			if (this.startContainer.nodeType === Node.ELEMENT_NODE) {
				r.start = Util.getFirstTextNodeNotBefore(this.startContainer.childNodes[this.startOffset]);
				r.startOffset = 0
			} else {
				r.start = this.startContainer;
				r.startOffset = this.startOffset
			}
			if (this.endContainer.nodeType === Node.ELEMENT_NODE) {
				node = this.endContainer.childNodes[this.endOffset];
				if (node != null) {
					n = node;
					while (n != null && n.nodeType !== Node.TEXT_NODE) {
						n = n.firstChild
					}
					if (n != null) {
						r.end = n;
						r.endOffset = 0
					}
				}
				if (r.end == null) {
					node = this.endContainer.childNodes[this.endOffset - 1];
					r.end = Util.getLastTextNodeUpTo(node);
					r.endOffset = r.end.nodeValue.length
				}
			} else {
				r.end = this.endContainer;
				r.endOffset = this.endOffset
			}
			nr = {};
			if (r.startOffset > 0) {
				if (r.start.nodeValue.length > r.startOffset) {
					nr.start = r.start.splitText(r.startOffset)
				} else {
					nr.start = r.start.nextSibling
				}
			} else {
				nr.start = r.start
			}
			if (r.start === r.end) {
				if (nr.start.nodeValue.length > r.endOffset - r.startOffset) {
					nr.start.splitText(r.endOffset - r.startOffset)
				}
				nr.end = nr.start
			} else {
				if (r.end.nodeValue.length > r.endOffset) {
					r.end.splitText(r.endOffset)
				}
				nr.end = r.end
			}
			nr.commonAncestor = this.commonAncestorContainer;
			while (nr.commonAncestor.nodeType !== Node.ELEMENT_NODE) {
				nr.commonAncestor = nr.commonAncestor.parentNode
			}
			return new Range.NormalizedRange(nr)
		};
		BrowserRange.prototype.serialize = function(root, ignoreSelector) {
			return this.normalize(root).serialize(root, ignoreSelector)
		};
		return BrowserRange
	} ();
	Range.NormalizedRange = function() {
		function NormalizedRange(obj) {
			this.commonAncestor = obj.commonAncestor;
			this.start = obj.start;
			this.end = obj.end
		}
		NormalizedRange.prototype.normalize = function(root) {
			return this
		};
		NormalizedRange.prototype.limit = function(bounds) {
			var nodes,
			parent,
			startParents,
			_k,
			_len2,
			_ref1;
			nodes = $.grep(this.textNodes(), 
			function(node) {
				return node.parentNode === bounds || $.contains(bounds, node.parentNode)
			});
			if (!nodes.length) {
				return null
			}
			this.start = nodes[0];
			this.end = nodes[nodes.length - 1];
			startParents = $(this.start).parents();
			_ref1 = $(this.end).parents();
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				parent = _ref1[_k];
				if (startParents.index(parent) !== -1) {
					this.commonAncestor = parent;
					break
				}
			}
			return this
		};
		NormalizedRange.prototype.serialize = function(root, ignoreSelector) {
			var end,
			serialization,
			start;
			serialization = function(node, isEnd) {
				var n,
				nodes,
				offset,
				origParent,
				textNodes,
				xpath,
				_k,
				_len2;
				if (ignoreSelector) {
					origParent = $(node).parents(":not(" + ignoreSelector + ")").eq(0)
				} else {
					origParent = $(node).parent()
				}
				xpath = Util.xpathFromNode(origParent, root)[0];
				textNodes = Util.getTextNodes(origParent);
				nodes = textNodes.slice(0, textNodes.index(node));
				offset = 0;
				for (_k = 0, _len2 = nodes.length; _k < _len2; _k++) {
					n = nodes[_k];
					offset += n.nodeValue.length
				}
				if (isEnd) {
					return [xpath, offset + node.nodeValue.length]
				} else {
					return [xpath, offset]
				}
			};
			start = serialization(this.start);
			end = serialization(this.end, true);
			return new Range.SerializedRange({
				start: start[0],
				end: end[0],
				startOffset: start[1],
				endOffset: end[1]
			})
		};
		NormalizedRange.prototype.text = function() {
			var node;
			return function() {
				var _k,
				_len2,
				_ref1,
				_results;
				_ref1 = this.textNodes();
				_results = [];
				for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
					node = _ref1[_k];
					_results.push(node.nodeValue)
				}
				return _results
			}.call(this).join("")
		};
		NormalizedRange.prototype.textNodes = function() {
			var end,
			start,
			textNodes,
			_ref1;
			textNodes = Util.getTextNodes($(this.commonAncestor));
			_ref1 = [textNodes.index(this.start), textNodes.index(this.end)],
			start = _ref1[0],
			end = _ref1[1];
			return $.makeArray(textNodes.slice(start, +end + 1 || 9e9))
		};
		NormalizedRange.prototype.toRange = function() {
			var range;
			range = document.createRange();
			range.setStartBefore(this.start);
			range.setEndAfter(this.end);
			return range
		};
		return NormalizedRange
	} ();
	Range.SerializedRange = function() {
		function SerializedRange(obj) {
			this.start = obj.start;
			this.startOffset = obj.startOffset;
			this.end = obj.end;
			this.endOffset = obj.endOffset
		}
		SerializedRange.prototype.normalize = function(root) {
			var contains,
			e,
			length,
			node,
			p,
			range,
			targetOffset,
			tn,
			_k,
			_l,
			_len2,
			_len3,
			_ref1,
			_ref2;
			range = {};
			_ref1 = ["start", "end"];
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				p = _ref1[_k];
				try {
					node = Range.nodeFromXPath(this[p], root)
				} catch(_error) {
					e = _error;
					throw new Range.RangeError(p, "Error while finding " + p + " node: " + this[p] + ": " + e, e)
				}
				if (!node) {
					throw new Range.RangeError(p, "Couldn't find " + p + " node: " + this[p])
				}
				length = 0;
				targetOffset = this[p + "Offset"];
				if (p === "end") {
					targetOffset--
				}
				_ref2 = Util.getTextNodes($(node));
				for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
					tn = _ref2[_l];
					if (length + tn.nodeValue.length > targetOffset) {
						range[p + "Container"] = tn;
						range[p + "Offset"] = this[p + "Offset"] - length;
						break
					} else {
						length += tn.nodeValue.length
					}
				}
				if (range[p + "Offset"] == null) {
					throw new Range.RangeError("" + p + "offset", "Couldn't find offset " + this[p + "Offset"] + " in element " + this[p])
				}
			}
			contains = document.compareDocumentPosition == null ? 
			function(a, b) {
				return a.contains(b)
			}: function(a, b) {
				return a.compareDocumentPosition(b) & 16
			};
			$(range.startContainer).parents().each(function() {
				if (contains(this, range.endContainer)) {
					range.commonAncestorContainer = this;
					return false
				}
			});
			return new Range.BrowserRange(range).normalize(root)
		};
		SerializedRange.prototype.serialize = function(root, ignoreSelector) {
			return this.normalize(root).serialize(root, ignoreSelector)
		};
		SerializedRange.prototype.toObject = function() {
			return {
				start: this.start,
				startOffset: this.startOffset,
				end: this.end,
				endOffset: this.endOffset
			}
		};
		return SerializedRange
	} ();
	_Annotator = this.Annotator;
	Annotator = function(_super) {
		__extends(Annotator, _super);
		Annotator.prototype.events = {
			".annotator-adder button click": "onAdderClick",
			".annotator-adder button mousedown": "onAdderMousedown",
			".annotator-hl click": "onHighlightClick",
			//".annotator-hl mouseout": "startViewerHideTimer"
		};
		Annotator.prototype.html = {
			adder: '<div class="annotator-adder"><button>' + _t("Annotate") + "</button></div>",
			wrapper: '<div class="annotator-wrapper"></div>'
		};
		Annotator.prototype.options = {
			readOnly: false
		};
		Annotator.prototype.plugins = {};
		Annotator.prototype.editor = null;
		Annotator.prototype.viewer = null;
		Annotator.prototype.selectedRanges = null;
		Annotator.prototype.mouseIsDown = false;
		Annotator.prototype.ignoreMouseup = false;
		Annotator.prototype.viewerHideTimer = null;
		function Annotator(element, options) {
			this.onDeleteAnnotation = __bind(this.onDeleteAnnotation, this);
			this.onEditAnnotation = __bind(this.onEditAnnotation, this);
			this.onAdderClick = __bind(this.onAdderClick, this);
			this.onAdderMousedown = __bind(this.onAdderMousedown, this);
			this.onHighlightClick = __bind(this.onHighlightClick, this);
			this.checkForEndSelection = __bind(this.checkForEndSelection, this);
			this.checkForStartSelection = __bind(this.checkForStartSelection, this);
			this.clearViewerHideTimer = __bind(this.clearViewerHideTimer, this);
			this.startViewerHideTimer = __bind(this.startViewerHideTimer, this);
			this.showViewer = __bind(this.showViewer, this);
			this.onEditorSubmit = __bind(this.onEditorSubmit, this);
			this.onEditorHide = __bind(this.onEditorHide, this);
			this.showEditor = __bind(this.showEditor, this);
			Annotator.__super__.constructor.apply(this, arguments);
			this.plugins = {};
			if (!Annotator.supported()) {
				return this
			}
			if (!this.options.readOnly) {
				this._setupDocumentEvents()
			}
			this._setupWrapper()._setupViewer()._setupEditor();
			this._setupDynamicStyle();
			this.adder = $(this.html.adder).appendTo(this.wrapper).hide();
			Annotator._instances.push(this)
		}
		Annotator.prototype._setupWrapper = function() {
			this.wrapper = $(this.html.wrapper);
			this.element.find("script").remove();
			this.element.wrapInner(this.wrapper);
			this.wrapper = this.element.find(".annotator-wrapper");
			return this
		};
		Annotator.prototype._setupViewer = function() {
			this.viewer = new Annotator.Viewer({
				readOnly: this.options.readOnly
			});
			this.viewer.hide().on("edit", this.onEditAnnotation).on("delete", this.onDeleteAnnotation).addField({
				load: function(_this) {
					return function(field, annotation) {
						if (annotation.text) {
							$(field).html(Util.escape(annotation.text))
						} else {
							$(field).html("<i>" + _t("No Comment") + "</i>")
						}
						return _this.publish("annotationViewerTextField", [field, annotation])
					}
				} (this)
			}).element.appendTo(this.wrapper).bind({
				//mouseover: this.clearViewerHideTimer,
				//mouseout: this.startViewerHideTimer
			});
			return this
		};
		Annotator.prototype._setupEditor = function() {
			this.editor = new Annotator.Editor;
			this.editor.hide().on("hide", this.onEditorHide).on("save", this.onEditorSubmit).addField({
				type: "textarea",
				label: _t("Comments") + "…",
				load: function(field, annotation) {
					return $(field).find("textarea").val(annotation.text || "")
				},
				submit: function(field, annotation) {
					return annotation.text = $(field).find("textarea").val()
				}
			});
			this.editor.element.appendTo(this.wrapper);
			return this
		};
		Annotator.prototype._setupDocumentEvents = function() {
			$(document).bind({
				mouseup: this.checkForEndSelection,
				click: this.checkForStartSelection
			});
			return this
		};
		Annotator.prototype._setupDynamicStyle = function() {
			var max,
			sel,
			style,
			x;
			style = $("#annotator-dynamic-style");
			if (!style.length) {
				style = $('<style id="annotator-dynamic-style"></style>').appendTo(document.head)
			}
			sel = "*" + 
			function() {
				var _k,
				_len2,
				_ref1,
				_results;
				_ref1 = ["adder", "outer", "notice", "filter"];
				_results = [];
				for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
					x = _ref1[_k];
					_results.push(":not(.annotator-" + x + ")")
				}
				return _results
			} ().join("");
			max = Util.maxZIndex($(document.body).find(sel));
			max = Math.max(max, 1e3);
			style.text([".annotator-adder, .annotator-outer, .annotator-notice {", "  z-index: " + (max + 20) + ";", "}", ".annotator-filter {", "  z-index: " + (max + 10) + ";", "}"].join("\n"));
			return this
		};
		Annotator.prototype.destroy = function() {
			var idx,
			name,
			plugin,
			_ref1;
			$(document).unbind({
				//mouseup: this.checkForEndSelection,
				click: this.checkForStartSelection
			});
			$("#annotator-dynamic-style").remove();
			this.adder.remove();
			this.viewer.destroy();
			this.editor.destroy();
			this.wrapper.find(".annotator-hl").each(function() {
				$(this).contents().insertBefore(this);
				return $(this).remove()
			});
			this.wrapper.contents().insertBefore(this.wrapper);
			this.wrapper.remove();
			this.element.data("annotator", null);
			_ref1 = this.plugins;
			for (name in _ref1) {
				plugin = _ref1[name];
				this.plugins[name].destroy()
			}
			this.removeEvents();
			idx = Annotator._instances.indexOf(this);
			if (idx !== -1) {
				return Annotator._instances.splice(idx, 1)
			}
		};
		Annotator.prototype.getSelectedRanges = function() {
			var browserRange,
			i,
			normedRange,
			r,
			ranges,
			rangesToIgnore,
			selection,
			_k,
			_len2;
			selection = Util.getGlobal().getSelection();
			ranges = [];
			rangesToIgnore = [];
			if (!selection.isCollapsed) {
				ranges = function() {
					var _k,
					_ref1,
					_results;
					_results = [];
					for (i = _k = 0, _ref1 = selection.rangeCount; 0 <= _ref1 ? _k < _ref1: _k > _ref1; i = 0 <= _ref1 ? ++_k: --_k) {
						r = selection.getRangeAt(i);
						browserRange = new Range.BrowserRange(r);
						normedRange = browserRange.normalize().limit(this.wrapper[0]);
						if (normedRange === null) {
							rangesToIgnore.push(r)
						}
						_results.push(normedRange)
					}
					return _results
				}.call(this);
				selection.removeAllRanges()
			}
			for (_k = 0, _len2 = rangesToIgnore.length; _k < _len2; _k++) {
				r = rangesToIgnore[_k];
				selection.addRange(r)
			}
			return $.grep(ranges, 
			function(range) {
				if (range) {
					selection.addRange(range.toRange())
				}
				return range
			})
		};
		Annotator.prototype.createAnnotation = function() {
			var annotation;
			annotation = {};
			this.publish("beforeAnnotationCreated", [annotation]);
			return annotation
		};
		Annotator.prototype.setupAnnotation = function(annotation) {
			var e,
			normed,
			normedRanges,
			r,
			root,
			_k,
			_l,
			_len2,
			_len3,
			_ref1;
			root = this.wrapper[0];
			annotation.ranges || (annotation.ranges = this.selectedRanges);
			normedRanges = [];
			_ref1 = annotation.ranges;
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				r = _ref1[_k];
				try {
					normedRanges.push(Range.sniff(r).normalize(root))
				} catch(_error) {
					e = _error;
					if (e instanceof Range.RangeError) {
						this.publish("rangeNormalizeFail", [annotation, r, e])
					} else {
						throw e
					}
				}
			}
			annotation.quote = [];
			annotation.ranges = [];
			annotation.highlights = [];
			for (_l = 0, _len3 = normedRanges.length; _l < _len3; _l++) {
				normed = normedRanges[_l];
				annotation.quote.push($.trim(normed.text()));
				annotation.ranges.push(normed.serialize(this.wrapper[0], ".annotator-hl"));
				$.merge(annotation.highlights, this.highlightRange(normed))
			}
			annotation.quote = annotation.quote.join(" / ");
			$(annotation.highlights).data("annotation", annotation);
			$(annotation.highlights).attr("data-annotation-id", annotation.id);
			return annotation
		};
		Annotator.prototype.updateAnnotation = function(annotation) {
			this.publish("beforeAnnotationUpdated", [annotation]);
			$(annotation.highlights).attr("data-annotation-id", annotation.id);
			this.publish("annotationUpdated", [annotation]);
			return annotation
		};
		Annotator.prototype.deleteAnnotation = function(annotation) {
			var child,
			h,
			_k,
			_len2,
			_ref1;
			if (annotation.highlights != null) {
				_ref1 = annotation.highlights;
				for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
					h = _ref1[_k];
					if (! (h.parentNode != null)) {
						continue
					}
					child = h.childNodes[0];
					$(h).replaceWith(h.childNodes)
				}
			}
			this.publish("annotationDeleted", [annotation]);
			return annotation
		};
		Annotator.prototype.loadAnnotations = function(annotations) {
			var clone,
			loader;
			if (annotations == null) {
				annotations = []
			}
			loader = function(_this) {
				return function(annList) {
					var n,
					now,
					_k,
					_len2;
					if (annList == null) {
						annList = []
					}
					now = annList.splice(0, 10);
					for (_k = 0, _len2 = now.length; _k < _len2; _k++) {
						n = now[_k];
						_this.setupAnnotation(n)
					}
					if (annList.length > 0) {
						return setTimeout(function() {
							return loader(annList)
						},
						10)
					} else {
						return _this.publish("annotationsLoaded", [clone])
					}
				}
			} (this);
			clone = annotations.slice();
			loader(annotations);
			return this
		};
		Annotator.prototype.dumpAnnotations = function() {
			if (this.plugins["Store"]) {
				return this.plugins["Store"].dumpAnnotations()
			} else {
				console.warn(_t("Can't dump annotations without Store plugin."));
				return false
			}
		};
		Annotator.prototype.highlightRange = function(normedRange, cssClass) {
			var hl,
			node,
			white,
			_k,
			_len2,
			_ref1,
			_results;
			if (cssClass == null) {
				cssClass = "annotator-hl"
			}
			white = /^\s*$/;
			hl = $("<span class='" + cssClass + "' href=''></span>");
			_ref1 = normedRange.textNodes();
			_results = [];
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				node = _ref1[_k];
				if (!white.test(node.nodeValue)) {
					_results.push($(node).wrapAll(hl).parent().show()[0])
				}
			}
			return _results
		};
		Annotator.prototype.highlightRanges = function(normedRanges, cssClass) {
			var highlights,
			r,
			_k,
			_len2;
			if (cssClass == null) {
				cssClass = "annotator-hl"
			}
			highlights = [];
			for (_k = 0, _len2 = normedRanges.length; _k < _len2; _k++) {
				r = normedRanges[_k];
				$.merge(highlights, this.highlightRange(r, cssClass))
			}
			return highlights
		};
		Annotator.prototype.addPlugin = function(name, options) {
			var klass,
			_base;
			if (this.plugins[name]) {
				console.error(_t("You cannot have more than one instance of any plugin."))
			} else {
				klass = Annotator.Plugin[name];
				if (typeof klass === "function") {
					this.plugins[name] = new klass(this.element[0], options);
					this.plugins[name].annotator = this;
					if (typeof(_base = this.plugins[name]).pluginInit === "function") {
						_base.pluginInit()
					}
				} else {
					console.error(_t("Could not load ") + name + _t(" plugin. Have you included the appropriate <script> tag?"))
				}
			}
			return this
		};
		Annotator.prototype.showEditor = function(annotation, location) {
			this.editor.element.css(location);
			this.editor.load(annotation);
			this.publish("annotationEditorShown", [this.editor, annotation]);
			return this
		};
		Annotator.prototype.onEditorHide = function() {
			this.publish("annotationEditorHidden", [this.editor]);
			return this.ignoreMouseup = false
		};
		Annotator.prototype.onEditorSubmit = function(annotation) {
			return this.publish("annotationEditorSubmit", [this.editor, annotation])
		};
		Annotator.prototype.showViewer = function(annotations, location) {
			this.viewer.element.css(location);
			this.viewer.load(annotations);
			return this.publish("annotationViewerShown", [this.viewer, annotations])
		};
		Annotator.prototype.startViewerHideTimer = function() {
			if (!this.viewerHideTimer) {
				return this.viewerHideTimer = setTimeout(this.viewer.hide, 250) // Amanda: change timer length if annotation happens across in sidebar; was originally 250
			}
		};
		Annotator.prototype.clearViewerHideTimer = function() {
			clearTimeout(this.viewerHideTimer);
			return this.viewerHideTimer = false
		};
		Annotator.prototype.checkForStartSelection = function(event) {
			if (! (event && this.isAnnotator(event.target))) {
				this.startViewerHideTimer()
			}
			return this.mouseIsDown = true
		};
		Annotator.prototype.checkForEndSelection = function(event) {
			var container,
			range,
			_k,
			_len2,
			_ref1;
			this.mouseIsDown = false;
			if (this.ignoreMouseup) {
				return
			}
			this.selectedRanges = this.getSelectedRanges();
			_ref1 = this.selectedRanges;
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				range = _ref1[_k];
				container = range.commonAncestor;
				if ($(container).hasClass("annotator-hl")) {
					container = $(container).parents("[class!=annotator-hl]")[0]
				}
				if (this.isAnnotator(container)) {
					return
				}
			}
			if (event && this.selectedRanges.length) {
				return this.adder.css(Util.mousePosition(event, this.wrapper[0])).show()
			} else {
				return this.adder.hide()
			}
		};
		Annotator.prototype.isAnnotator = function(element) {
			return !! $(element).parents().addBack().filter("[class^=annotator-]").not(this.wrapper).length
		};
		Annotator.prototype.onHighlightClick = function(event) {
			var annotations;
			/*this.clearViewerHideTimer(); //Amanda: removed to change highlight activation from hover to click
			if (this.mouseIsDown || this.viewer.isShown()) {
				return false
			}*/
			annotations = $(event.target).parents(".annotator-hl").addBack().map(function() {
				return $(this).data("annotation")
			});
			return this.showViewer($.makeArray(annotations), Util.mousePosition(event, this.wrapper[0]))
		};
		Annotator.prototype.onAdderMousedown = function(event) {
			if (event != null) {
				event.preventDefault()
			}
			return this.ignoreMouseup = true
		};
		Annotator.prototype.onAdderClick = function(event) {
			var annotation,
			cancel,
			cleanup,
			position,
			save;
			if (event != null) {
				event.preventDefault()
			}
			position = this.adder.position();
			this.adder.hide();
			annotation = this.setupAnnotation(this.createAnnotation());
			$(annotation.highlights).addClass("annotator-hl-temporary");
			save = function(_this) {
				return function() {
					cleanup();
					$(annotation.highlights).removeClass("annotator-hl-temporary");
					return _this.publish("annotationCreated", [annotation])
				}
			} (this);
			cancel = function(_this) {
				return function() {
					cleanup();
					return _this.deleteAnnotation(annotation)
				}
			} (this);
			cleanup = function(_this) {
				return function() {
					_this.unsubscribe("annotationEditorHidden", cancel);
					return _this.unsubscribe("annotationEditorSubmit", save)
				}
			} (this);
			this.subscribe("annotationEditorHidden", cancel);
			this.subscribe("annotationEditorSubmit", save);
			return this.showEditor(annotation, position)
		};
		Annotator.prototype.onEditAnnotation = function(annotation) {
			var cleanup,
			offset,
			update;
			offset = this.viewer.element.position();
			update = function(_this) {
				return function() {
					cleanup();
					return _this.updateAnnotation(annotation)
				}
			} (this);
			cleanup = function(_this) {
				return function() {
					_this.unsubscribe("annotationEditorHidden", cleanup);
					return _this.unsubscribe("annotationEditorSubmit", update)
				}
			} (this);
			this.subscribe("annotationEditorHidden", cleanup);
			this.subscribe("annotationEditorSubmit", update);
			this.viewer.hide();
			return this.showEditor(annotation, offset)
		};
		Annotator.prototype.onDeleteAnnotation = function(annotation) {
			this.viewer.hide();
			return this.deleteAnnotation(annotation)
		};
		return Annotator
	} (Delegator);
	Annotator.Plugin = function(_super) {
		__extends(Plugin, _super);
		function Plugin(element, options) {
			Plugin.__super__.constructor.apply(this, arguments)
		}
		Plugin.prototype.pluginInit = function() {};
		Plugin.prototype.destroy = function() {
			return this.removeEvents()
		};
		return Plugin
	} (Delegator);
	g = Util.getGlobal();
	if (((_ref1 = g.document) != null ? _ref1.evaluate: void 0) == null) {
		$.getScript("http://assets.annotateit.org/vendor/xpath.min.js")
	}
	if (g.getSelection == null) {
		$.getScript("http://assets.annotateit.org/vendor/ierange.min.js")
	}
	if (g.JSON == null) {
		$.getScript("http://assets.annotateit.org/vendor/json2.min.js")
	}
	if (g.Node == null) {
		g.Node = {
			ELEMENT_NODE: 1,
			ATTRIBUTE_NODE: 2,
			TEXT_NODE: 3,
			CDATA_SECTION_NODE: 4,
			ENTITY_REFERENCE_NODE: 5,
			ENTITY_NODE: 6,
			PROCESSING_INSTRUCTION_NODE: 7,
			COMMENT_NODE: 8,
			DOCUMENT_NODE: 9,
			DOCUMENT_TYPE_NODE: 10,
			DOCUMENT_FRAGMENT_NODE: 11,
			NOTATION_NODE: 12
		}
	}
	Annotator.$ = $;
	Annotator.Delegator = Delegator;
	Annotator.Range = Range;
	Annotator.Util = Util;
	Annotator._instances = [];
	Annotator._t = _t;
	Annotator.supported = function() {
		return function() {
			return !! this.getSelection
		} ()
	};
	Annotator.noConflict = function() {
		Util.getGlobal().Annotator = _Annotator;
		return this
	};
	$.fn.annotator = function(options) {
		var args;
		args = Array.prototype.slice.call(arguments, 1);
		return this.each(function() {
			var instance;
			instance = $.data(this, "annotator");
			if (instance) {
				return options && instance[options].apply(instance, args)
				
			} else {
				instance = new Annotator(this, options);
				return $.data(this, "annotator", instance)
			}
		})
	};
	this.Annotator = Annotator;
	Annotator.Widget = function(_super) {
		__extends(Widget, _super);
		Widget.prototype.classes = {
			hide: "annotator-hide",
			invert: {
				x: "annotator-invert-x",
				y: "annotator-invert-y"
			}
		};
		function Widget(element, options) {
			Widget.__super__.constructor.apply(this, arguments);
			this.classes = $.extend({},
			Annotator.Widget.prototype.classes, this.classes)
		}
		Widget.prototype.destroy = function() {
			this.removeEvents();
			return this.element.remove()
		};
		Widget.prototype.checkOrientation = function() {
			var current,
			offset,
			viewport,
			widget,
			window;
			this.resetOrientation();
			window = $(Annotator.Util.getGlobal());
			widget = this.element.children(":first");
			offset = widget.offset();
			viewport = {
				top: window.scrollTop(),
				right: window.width() + window.scrollLeft()
			};
			current = {
				top: offset.top,
				right: offset.left + widget.width()
			};
			if (current.top - viewport.top < 0) {
				this.invertY()
			}
			if (current.right - viewport.right > 0) {
				this.invertX()
			}
			return this
		};
		Widget.prototype.resetOrientation = function() {
			this.element.removeClass(this.classes.invert.x).removeClass(this.classes.invert.y);
			return this
		};
		Widget.prototype.invertX = function() {
			this.element.addClass(this.classes.invert.x);
			return this
		};
		Widget.prototype.invertY = function() {
			this.element.addClass(this.classes.invert.y);
			return this
		};
		Widget.prototype.isInvertedY = function() {
			return this.element.hasClass(this.classes.invert.y)
		};
		Widget.prototype.isInvertedX = function() {
			return this.element.hasClass(this.classes.invert.x)
		};
		return Widget
	} (Delegator);
	Annotator.Editor = function(_super) {
		__extends(Editor, _super);
		Editor.prototype.events = {
			"form submit": "submit",
			".annotator-save click": "submit",
			".annotator-cancel click": "hide",
			".annotator-cancel mouseover": "onCancelButtonMouseover",
			"textarea keydown": "processKeypress"
		};
		Editor.prototype.classes = {
			hide: "annotator-hide",
			focus: "annotator-focus"
		};
		Editor.prototype.html = '<div class="annotator-outer annotator-editor">\n  <form class="annotator-widget">\n    <ul class="annotator-listing"></ul>\n    <div class="annotator-controls">\n      <a href="#cancel" class="annotator-cancel">' + _t("Cancel") + '</a>\n<a href="#save" class="annotator-save annotator-focus">' + _t("Save") + "</a>\n    </div>\n  </form>\n</div>";
		Editor.prototype.options = {};
		function Editor(options) {
			this.onCancelButtonMouseover = __bind(this.onCancelButtonMouseover, this);
			this.processKeypress = __bind(this.processKeypress, this);
			this.submit = __bind(this.submit, this);
			this.load = __bind(this.load, this);
			this.hide = __bind(this.hide, this);
			this.show = __bind(this.show, this);
			Editor.__super__.constructor.call(this, $(this.html)[0], options);
			this.fields = [];
			this.annotation = {}
		}
		Editor.prototype.show = function(event) {
			Annotator.Util.preventEventDefault(event);
			this.element.removeClass(this.classes.hide);
			this.element.find(".annotator-save").addClass(this.classes.focus);
			this.checkOrientation();
			this.element.find(":input:first").focus();
			this.setupDraggables();
			return this.publish("show")
		};
		Editor.prototype.hide = function(event) {
			Annotator.Util.preventEventDefault(event);
			this.element.addClass(this.classes.hide);
			return this.publish("hide")
		};
		Editor.prototype.load = function(annotation) {
			var field,
			_k,
			_len2,
			_ref2;
			this.annotation = annotation;
			this.publish("load", [this.annotation]);
			_ref2 = this.fields;
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				field = _ref2[_k];
				field.load(field.element, this.annotation)
			}
			return this.show()
		};
		Editor.prototype.submit = function(event) {
			var field,
			_k,
			_len2,
			_ref2;
			Annotator.Util.preventEventDefault(event);
			_ref2 = this.fields;
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				field = _ref2[_k];
				field.submit(field.element, this.annotation)
			}
			this.publish("save", [this.annotation]);
			return this.hide()
		};
		Editor.prototype.addField = function(options) {
			var element,
			field,
			input;
			field = $.extend({
				id: "annotator-field-" + Annotator.Util.uuid(),
				type: "input",
				label: "",
				load: function() {},
				submit: function() {}
			},
			options);
			input = null;
			element = $('<li class="annotator-item" />');
			field.element = element[0];
			switch (field.type) {
			case "textarea":
				input = $("<textarea />");
				break;
			case "input":
			case "checkbox":
				input = $("<input />");
				break;
			case "select":
				input = $("<select />")
			}
			element.append(input);
			input.attr({
				id: field.id,
				placeholder: field.label
			});
			if (field.type === "checkbox") {
				input[0].type = "checkbox";
				element.addClass("annotator-checkbox");
				element.append($("<label />", {
					"for": field.id,
					html: field.label
				}))
			}
			this.element.find("ul:first").append(element);
			this.fields.push(field);
			return field.element
		};
		Editor.prototype.checkOrientation = function() {
			var controls,
			list;
			Editor.__super__.checkOrientation.apply(this, arguments);
			list = this.element.find("ul");
			controls = this.element.find(".annotator-controls");
			if (this.element.hasClass(this.classes.invert.y)) {
				controls.insertBefore(list)
			} else if (controls.is(":first-child")) {
				controls.insertAfter(list)
			}
			return this
		};
		Editor.prototype.processKeypress = function(event) {
			if (event.keyCode === 27) {
				return this.hide()
			} else if (event.keyCode === 13 && !event.shiftKey) {
				return this.submit()
			}
		};
		Editor.prototype.onCancelButtonMouseover = function() {
			return this.element.find("." + this.classes.focus).removeClass(this.classes.focus)
		};
		Editor.prototype.setupDraggables = function() {
			var classes,
			controls,
			cornerItem,
			editor,
			mousedown,
			onMousedown,
			onMousemove,
			onMouseup,
			resize,
			textarea,
			throttle;
			this.element.find(".annotator-resize").remove();
			if (this.element.hasClass(this.classes.invert.y)) {
				cornerItem = this.element.find(".annotator-item:last")
			} else {
				cornerItem = this.element.find(".annotator-item:first")
			}
			if (cornerItem) {
				$('<span class="annotator-resize"></span>').appendTo(cornerItem)
			}
			mousedown = null;
			classes = this.classes;
			editor = this.element;
			textarea = null;
			resize = editor.find(".annotator-resize");
			controls = editor.find(".annotator-controls");
			throttle = false;
			onMousedown = function(event) {
				if (event.target === this) {
					mousedown = {
						element: this,
						top: event.pageY,
						left: event.pageX
					};
					textarea = editor.find("textarea:first");
					$(window).bind({
						"mouseup.annotator-editor-resize": onMouseup,
						"mousemove.annotator-editor-resize": onMousemove
					});
					return event.preventDefault()
				}
			};
			onMouseup = function() {
				mousedown = null;
				return $(window).unbind(".annotator-editor-resize")
			};
			onMousemove = function(_this) {
				return function(event) {
					var diff,
					directionX,
					directionY,
					height,
					width;
					if (mousedown && throttle === false) {
						diff = {
							top: event.pageY - mousedown.top,
							left: event.pageX - mousedown.left
						};
						if (mousedown.element === resize[0]) {
							height = textarea.outerHeight();
							width = textarea.outerWidth();
							directionX = editor.hasClass(classes.invert.x) ? -1: 1;
							directionY = editor.hasClass(classes.invert.y) ? 1: -1;
							textarea.height(height + diff.top * directionY);
							textarea.width(width + diff.left * directionX);
							if (textarea.outerHeight() !== height) {
								mousedown.top = event.pageY
							}
							if (textarea.outerWidth() !== width) {
								mousedown.left = event.pageX
							}
						} else if (mousedown.element === controls[0]) {
							editor.css({
								top: parseInt(editor.css("top"), 10) + diff.top,
								left: parseInt(editor.css("left"), 10) + diff.left
							});
							mousedown.top = event.pageY;
							mousedown.left = event.pageX
						}
						throttle = true;
						return setTimeout(function() {
							return throttle = false
						},
						1e3 / 60)
					}
				}
			} (this);
			resize.bind("mousedown", onMousedown);
			return controls.bind("mousedown", onMousedown)
		};
		return Editor
	} (Annotator.Widget);
	Annotator.Viewer = function(_super) {
		__extends(Viewer, _super);
		Viewer.prototype.events = {
			".annotator-edit click": "onEditClick",
			".annotator-delete click": "onDeleteClick"
		};
		Viewer.prototype.classes = {
			hide: "annotator-hide",
			showControls: "annotator-visible"
		};
		Viewer.prototype.html = {
			element: '<div class="annotator-outer annotator-viewer">\n  <ul class="annotator-widget annotator-listing"></ul>\n</div>',
			item: '<li class="annotator-annotation annotator-item">\n <span class="annotator-controls">\n    <a href="#" title="View as webpage" class="annotator-link">View as webpage</a>\n    <button title="Edit" class="annotator-edit">Edit</button>\n    <button title="Delete" class="annotator-delete">Delete</button>\n  </span>\n</li>'
		};
		Viewer.prototype.options = {
			readOnly: false
		};
		function Viewer(options) {
			this.onDeleteClick = __bind(this.onDeleteClick, this);
			this.onEditClick = __bind(this.onEditClick, this);
			this.load = __bind(this.load, this);
			this.hide = __bind(this.hide, this);
			this.show = __bind(this.show, this);
			Viewer.__super__.constructor.call(this, $(this.html.element)[0], options);
			this.item = $(this.html.item)[0];
			this.fields = [];
			this.annotations = []
		}
		Viewer.prototype.show = function(event) {
			var controls;
			Annotator.Util.preventEventDefault(event);
			controls = this.element.find(".annotator-controls").addClass(this.classes.showControls);
			setTimeout(function(_this) {
				return function() {
					return controls.removeClass(_this.classes.showControls)
				}
			} (this), 500);
			this.element.removeClass(this.classes.hide);
			return this.checkOrientation().publish("show")
		};
		Viewer.prototype.isShown = function() {
			return ! this.element.hasClass(this.classes.hide)
		};
		Viewer.prototype.hide = function(event) {
			Annotator.Util.preventEventDefault(event);
			this.element.addClass(this.classes.hide);
			return this.publish("hide")
		};
		Viewer.prototype.load = function(annotations) {
			var annotation,
			controller,
			controls,
			del,
			edit,
			element,
			field,
			item,
			link,
			links,
			list,
			_k,
			_l,
			_len2,
			_len3,
			_ref2,
			_ref3;
			this.annotations = annotations || []; //Amanda: Begin code to input annotations NIDs related to a highlight to concealed view exposed filter for annosidebar view.
			var theresult = new Array();
			for(var key in annotations){
  				allNIDs = annotations[key]['nid'];
  				theresult.push(allNIDs);
			}
			grabNID = theresult.join(',');
			$('#edit-nid--2').val(grabNID);
			$('#views-exposed-form-annosidebar-annosidebar').submit();//Amanda:  autosubmit; working code ends
			list = this.element.find("ul:first").empty();
			_ref2 = this.annotations;
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				annotation = _ref2[_k];
				item = $(this.item).clone().appendTo(list).data("annotation", annotation);
				controls = item.find(".annotator-controls");
				link = controls.find(".annotator-link");
				edit = controls.find(".annotator-edit");
				del = controls.find(".annotator-delete");
				links = new LinkParser(annotation.links || []).get("alternate", {
					type: "text/html"
				});
				if (links.length === 0 || links[0].href == null) {
					link.remove()
				} else {
					link.attr("href", links[0].href);
				}
				if (this.options.readOnly) {
					edit.remove();
					del.remove()
				} else {
					controller = {
						showEdit: function() {
							return edit.removeAttr("disabled")
						},
						hideEdit: function() {
							return edit.attr("disabled", "disabled")
						},
						showDelete: function() {
							return del.removeAttr("disabled")
						},
						hideDelete: function() {
							return del.attr("disabled", "disabled")
						}
					}
				}
				_ref3 = this.fields;
				for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
					field = _ref3[_l];
					element = $(field.element).clone().appendTo(item)[0];
					field.load(element, annotation, controller)
				}
			}
			this.publish("load", [this.annotations]);
			return this.show()
		}; 
		Viewer.prototype.addField = function(options) {
			var field;
			field = $.extend({
				load: function() {}
			},
			options);
			field.element = $("<div />")[0];
			this.fields.push(field);
			field.element;
			return this
		};
		Viewer.prototype.onEditClick = function(event) {
			return this.onButtonClick(event, "edit")
		};
		Viewer.prototype.onDeleteClick = function(event) {
			return this.onButtonClick(event, "delete")
		};
		Viewer.prototype.onButtonClick = function(event, type) {
			var item;
			item = $(event.target).parents(".annotator-annotation");
			return this.publish(type, [item.data("annotation")])
		};
		return Viewer
	} (Annotator.Widget);
	LinkParser = function() {
		function LinkParser(data) {
			this.data = data
		}
		LinkParser.prototype.get = function(rel, cond) {
			var d,
			k,
			keys,
			match,
			v,
			_k,
			_len2,
			_ref2,
			_results;
			if (cond == null) {
				cond = {}
			}
			cond = $.extend({},
			cond, {
				rel: rel
			});
			keys = function() {
				var _results;
				_results = [];
				for (k in cond) {
					if (!__hasProp.call(cond, k)) continue;
					v = cond[k];
					_results.push(k)
				}
				return _results
			} ();
			_ref2 = this.data;
			_results = [];
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				d = _ref2[_k];
				match = keys.reduce(function(m, k) {
					return m && d[k] === cond[k]
				},
				true);
				if (match) {
					_results.push(d)
				} else {
					continue
				}
			}
			return _results
		};
		return LinkParser
	} ();
	Annotator = Annotator || {};
	Annotator.Notification = function(_super) {
		__extends(Notification, _super);
		Notification.prototype.events = {
			click: "hide"
		};
		Notification.prototype.options = {
			html: "<div class='annotator-notice'></div>",
			classes: {
				show: "annotator-notice-show",
				info: "annotator-notice-info",
				success: "annotator-notice-success",
				error: "annotator-notice-error"
			}
		};
		function Notification(options) {
			this.hide = __bind(this.hide, this);
			this.show = __bind(this.show, this);
			Notification.__super__.constructor.call(this, $(this.options.html).appendTo(document.body)[0], options)
		}
		Notification.prototype.show = function(message, status) {
			if (status == null) {
				status = Annotator.Notification.INFO
			}
			this.currentStatus = status;
			$(this.element).addClass(this.options.classes.show).addClass(this.options.classes[this.currentStatus]).html(Util.escape(message || ""));
			setTimeout(this.hide, 5e3);
			return this
		};
		Notification.prototype.hide = function() {
			if (this.currentStatus == null) {
				this.currentStatus = Annotator.Notification.INFO
			}
			$(this.element).removeClass(this.options.classes.show).removeClass(this.options.classes[this.currentStatus]);
			return this
		};
		return Notification
	} (Delegator);
	Annotator.Notification.INFO = "info";
	Annotator.Notification.SUCCESS = "success";
	Annotator.Notification.ERROR = "error";
	$(function() {
		var notification;
		notification = new Annotator.Notification;
		Annotator.showNotification = notification.show;
		return Annotator.hideNotification = notification.hide
	});
	Annotator.Plugin.Unsupported = function(_super) {
		__extends(Unsupported, _super);
		function Unsupported() {
			return Unsupported.__super__.constructor.apply(this, arguments)
		}
		Unsupported.prototype.options = {
			message: Annotator._t("Annotation is not supported by this browser, and/or you need to enable Javascript in your browser to annotate.") // Amanda: clarified unsupported message. Note this message has a character limit (127 characters?).
		};
		Unsupported.prototype.pluginInit = function() {
			if (!Annotator.supported()) {
				return $(function(_this) {
					return function() {
						Annotator.showNotification(_this.options.message);
						if (window.XMLHttpRequest === void 0 && ActiveXObject !== void 0) {
							return $("html").addClass("ie6")
						}
					}
				} (this))
			}
		};
		return Unsupported
	} (Annotator.Plugin);
	createDateFromISO8601 = function(string) {
		var d,
		date,
		offset,
		regexp,
		time,
		_ref2;
		regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" + "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?" + "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
		d = string.match(new RegExp(regexp));
		offset = 0;
		date = new Date(d[1], 0, 1);
		if (d[3]) {
			date.setMonth(d[3] - 1)
		}
		if (d[5]) {
			date.setDate(d[5])
		}
		if (d[7]) {
			date.setHours(d[7])
		}
		if (d[8]) {
			date.setMinutes(d[8])
		}
		if (d[10]) {
			date.setSeconds(d[10])
		}
		if (d[12]) {
			date.setMilliseconds(Number("0." + d[12]) * 1e3)
		}
		if (d[14]) {
			offset = Number(d[16]) * 60 + Number(d[17]);
			offset *= (_ref2 = d[15] === "-") != null ? _ref2: {
				1: -1
			}
		}
		offset -= date.getTimezoneOffset();
		time = Number(date) + offset * 60 * 1e3;
		date.setTime(Number(time));
		return date
	};
	base64Decode = function(data) {
		var ac,
		b64,
		bits,
		dec,
		h1,
		h2,
		h3,
		h4,
		i,
		o1,
		o2,
		o3,
		tmp_arr;
		if (typeof atob !== "undefined" && atob !== null) {
			return atob(data)
		} else {
			b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			i = 0;
			ac = 0;
			dec = "";
			tmp_arr = [];
			if (!data) {
				return data
			}
			data += "";
			while (i < data.length) {
				h1 = b64.indexOf(data.charAt(i++));
				h2 = b64.indexOf(data.charAt(i++));
				h3 = b64.indexOf(data.charAt(i++));
				h4 = b64.indexOf(data.charAt(i++));
				bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
				o1 = bits >> 16 & 255;
				o2 = bits >> 8 & 255;
				o3 = bits & 255;
				if (h3 === 64) {
					tmp_arr[ac++] = String.fromCharCode(o1)
				} else if (h4 === 64) {
					tmp_arr[ac++] = String.fromCharCode(o1, o2)
				} else {
					tmp_arr[ac++] = String.fromCharCode(o1, o2, o3)
				}
			}
			return tmp_arr.join("")
		}
	};
	base64UrlDecode = function(data) {
		var i,
		m,
		_k,
		_ref2;
		m = data.length % 4;
		if (m !== 0) {
			for (i = _k = 0, _ref2 = 4 - m; 0 <= _ref2 ? _k < _ref2: _k > _ref2; i = 0 <= _ref2 ? ++_k: --_k) {
				data += "="
			}
		}
		data = data.replace(/-/g, "+");
		data = data.replace(/_/g, "/");
		return base64Decode(data)
	};
	parseToken = function(token) {
		var head,
		payload,
		sig,
		_ref2;
		_ref2 = token.split("."),
		head = _ref2[0],
		payload = _ref2[1],
		sig = _ref2[2];
		return JSON.parse(base64UrlDecode(payload))
	};
	Annotator.Plugin.Auth = function(_super) {
		__extends(Auth, _super);
		Auth.prototype.options = {
			token: null,
			tokenUrl: "/auth/token",
			autoFetch: true
		};
		function Auth(element, options) {
			Auth.__super__.constructor.apply(this, arguments);
			this.waitingForToken = [];
			if (this.options.token) {
				this.setToken(this.options.token)
			} else {
				this.requestToken()
			}
		}
		Auth.prototype.requestToken = function() {
			this.requestInProgress = true;
			return $.ajax({
				url: this.options.tokenUrl,
				dataType: "text",
				xhrFields: {
					withCredentials: true
				}
			}).done(function(_this) {
				return function(data, status, xhr) {
					return _this.setToken(data)
				}
			} (this)).fail(function(_this) {
				return function(xhr, status, err) {
					var msg;
					msg = Annotator._t("Couldn't get auth token:");
					console.error("" + msg + " " + err, xhr);
					return Annotator.showNotification("" + msg + " " + xhr.responseText, Annotator.Notification.ERROR)
				}
			} (this)).always(function(_this) {
				return function() {
					return _this.requestInProgress = false
				}
			} (this))
		};
		Auth.prototype.setToken = function(token) {
			var _results;
			this.token = token;
			this._unsafeToken = parseToken(token);
			if (this.haveValidToken()) {
				if (this.options.autoFetch) {
					this.refreshTimeout = setTimeout(function(_this) {
						return function() {
							return _this.requestToken()
						}
					} (this), (this.timeToExpiry() - 2) * 1e3)
				}
				this.updateHeaders();
				_results = [];
				while (this.waitingForToken.length > 0) {
					_results.push(this.waitingForToken.pop()(this._unsafeToken))
				}
				return _results
			} else {
				console.warn(Annotator._t("Didn't get a valid token."));
				if (this.options.autoFetch) {
					console.warn(Annotator._t("Getting a new token in 10s."));
					return setTimeout(function(_this) {
						return function() {
							return _this.requestToken()
						}
					} (this), 10 * 1e3)
				}
			}
		};
		Auth.prototype.haveValidToken = function() {
			var allFields;
			allFields = this._unsafeToken && this._unsafeToken.issuedAt && this._unsafeToken.ttl && this._unsafeToken.consumerKey;
			if (allFields && this.timeToExpiry() > 0) {
				return true
			} else {
				return false
			}
		};
		Auth.prototype.timeToExpiry = function() {
			var expiry,
			issue,
			now,
			timeToExpiry;
			now = (new Date).getTime() / 1e3;
			issue = createDateFromISO8601(this._unsafeToken.issuedAt).getTime() / 1e3;
			expiry = issue + this._unsafeToken.ttl;
			timeToExpiry = expiry - now;
			if (timeToExpiry > 0) {
				return timeToExpiry
			} else {
				return 0
			}
		};
		Auth.prototype.updateHeaders = function() {
			var current;
			current = this.element.data("annotator:headers");
			return this.element.data("annotator:headers", $.extend(current, {
				"x-annotator-auth-token": this.token
			}))
		};
		Auth.prototype.withToken = function(callback) {
			if (callback == null) {
				return
			}
			if (this.haveValidToken()) {
				return callback(this._unsafeToken)
			} else {
				this.waitingForToken.push(callback);
				if (!this.requestInProgress) {
					return this.requestToken()
				}
			}
		};
		return Auth
	} (Annotator.Plugin);
	Annotator.Plugin.Store = function(_super) {
		__extends(Store, _super);
		Store.prototype.events = {
			annotationCreated: "annotationCreated",
			annotationDeleted: "annotationDeleted",
			annotationUpdated: "annotationUpdated"
		};
		Store.prototype.options = {
			annotationData: {},
			emulateHTTP: false,
			loadFromSearch: false,
			prefix: "/store",
			urls: {
				create: "/annotations",
				read: "/annotations/:id",
				update: "/annotations/:id",
				destroy: "/annotations/:id",
				search: "/search"
			}
		};
		function Store(element, options) {
			this._onError = __bind(this._onError, this);
			this._onLoadAnnotationsFromSearch = __bind(this._onLoadAnnotationsFromSearch, this);
			this._onLoadAnnotations = __bind(this._onLoadAnnotations, this);
			this._getAnnotations = __bind(this._getAnnotations, this);
			Store.__super__.constructor.apply(this, arguments);
			this.annotations = []
		}
		Store.prototype.pluginInit = function() {
			if (!Annotator.supported()) {
				return
			}
			if (this.annotator.plugins.Auth) {
				return this.annotator.plugins.Auth.withToken(this._getAnnotations)
			} else {
				return this._getAnnotations()
			}
		};
		Store.prototype._getAnnotations = function() {
			if (this.options.loadFromSearch) {
				return this.loadAnnotationsFromSearch(this.options.loadFromSearch)
			} else {
				return this.loadAnnotations()
			}
		};
		Store.prototype.annotationCreated = function(annotation) {
			if (__indexOf.call(this.annotations, annotation) < 0) {
				this.registerAnnotation(annotation);
				return this._apiRequest("create", annotation, 
				function(_this) {
					return function(data) {
						if (data.id == null) {
							console.warn(Annotator._t("Warning: No ID returned from server for annotation "), annotation)
						}
						return _this.updateAnnotation(annotation, data)
					}
				} (this))
			} else {
				return this.updateAnnotation(annotation, {})
			}
		};
		Store.prototype.annotationUpdated = function(annotation) {
			if (__indexOf.call(this.annotations, annotation) >= 0) {
				return this._apiRequest("update", annotation, 
				function(_this) {
					return function(data) {
						return _this.updateAnnotation(annotation, data)
					}
				} (this))
			}
		};
		Store.prototype.annotationDeleted = function(annotation) {
			if (__indexOf.call(this.annotations, annotation) >= 0) {
				return this._apiRequest("destroy", annotation, 
				function(_this) {
					return function() {
						return _this.unregisterAnnotation(annotation)
					}
				} (this))
			}
		};
		Store.prototype.registerAnnotation = function(annotation) {
			return this.annotations.push(annotation)
		};
		Store.prototype.unregisterAnnotation = function(annotation) {
			return this.annotations.splice(this.annotations.indexOf(annotation), 1)
		};
		Store.prototype.updateAnnotation = function(annotation, data) {
			if (__indexOf.call(this.annotations, annotation) < 0) {
				console.error(Annotator._t("Trying to update unregistered annotation!"))
			} else {
				$.extend(annotation, data)
			}
			return $(annotation.highlights).data("annotation", annotation)
		};
		Store.prototype.loadAnnotations = function() {
			return this._apiRequest("read", null, this._onLoadAnnotations)
		};
		Store.prototype._onLoadAnnotations = function(data) {
			var a,
			annotation,
			annotationMap,
			newData,
			_k,
			_l,
			_len2,
			_len3,
			_ref2;
			if (data == null) {
				data = []
			}
			annotationMap = {};
			_ref2 = this.annotations;
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				a = _ref2[_k];
				annotationMap[a.id] = a
			}
			newData = [];
			for (_l = 0, _len3 = data.length; _l < _len3; _l++) {
				a = data[_l];
				if (annotationMap[a.id]) {
					annotation = annotationMap[a.id];
					this.updateAnnotation(annotation, a)
				} else {
					newData.push(a)
				}
			}
			this.annotations = this.annotations.concat(newData);
			return this.annotator.loadAnnotations(newData.slice())
		};
		Store.prototype.loadAnnotationsFromSearch = function(searchOptions) {
			return this._apiRequest("search", searchOptions, this._onLoadAnnotationsFromSearch)
		};
		Store.prototype._onLoadAnnotationsFromSearch = function(data) {
			if (data == null) {
				data = {}
			}
			return this._onLoadAnnotations(data.rows || [])
		};
		Store.prototype.dumpAnnotations = function() {
			var ann,
			_k,
			_len2,
			_ref2,
			_results;
			_ref2 = this.annotations;
			_results = [];
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				ann = _ref2[_k];
				_results.push(JSON.parse(this._dataFor(ann)))
			}
			return _results
		};
		Store.prototype._apiRequest = function(action, obj, onSuccess) {
			var id,
			options,
			request,
			url;
			id = obj && obj.id;
			url = this._urlFor(action, id);
			options = this._apiRequestOptions(action, obj, onSuccess);
			request = $.ajax(url, options);
			request._id = id;
			request._action = action;
			return request
		};
		Store.prototype._apiRequestOptions = function(action, obj, onSuccess) {
			var data,
			method,
			opts;
			method = this._methodFor(action);
			opts = {
				type: method,
				headers: this.element.data("annotator:headers"),
				dataType: "json",
				success: onSuccess || 
				function() {},
				error: this._onError
			};
			if (this.options.emulateHTTP && (method === "PUT" || method === "DELETE")) {
				opts.headers = $.extend(opts.headers, {
					"X-HTTP-Method-Override": method
				});
				opts.type = "POST"
			}
			if (action === "search") {
				opts = $.extend(opts, {
					data: obj
				});
				return opts
			}
			data = obj && this._dataFor(obj);
			if (this.options.emulateJSON) {
				opts.data = {
					json: data
				};
				if (this.options.emulateHTTP) {
					opts.data._method = method
				}
				return opts
			}
			opts = $.extend(opts, {
				data: data,
				contentType: "application/json; charset=utf-8"
			});
			return opts
		};
		Store.prototype._urlFor = function(action, id) {
			var url;
			url = this.options.prefix != null ? this.options.prefix: "";
			url += this.options.urls[action];
			url = url.replace(/\/:id/, id != null ? "/" + id: "");
			url = url.replace(/:id/, id != null ? id: "");
			return url
		};
		Store.prototype._methodFor = function(action) {
			var table;
			table = {
				create: "POST",
				read: "GET",
				update: "PUT",
				destroy: "DELETE",
				search: "GET"
			};
			return table[action]
		};
		Store.prototype._dataFor = function(annotation) {
			var data,
			highlights;
			highlights = annotation.highlights;
			delete annotation.highlights;
			$.extend(annotation, this.options.annotationData);
			data = JSON.stringify(annotation);
			if (highlights) {
				annotation.highlights = highlights
			}
			return data
		};
		Store.prototype._onError = function(xhr) {
			var action,
			message;
			action = xhr._action;
			message = Annotator._t("Sorry we could not ") + action + Annotator._t(" this annotation");
			if (xhr._action === "search") {
				message = Annotator._t("Sorry we could not search the store for annotations")
			} else if (xhr._action === "read" && !xhr._id) {
				message = Annotator._t("Sorry we could not ") + action + Annotator._t(" the annotations from the store")
			}
			switch (xhr.status) {
			case 401:
				message = Annotator._t("Sorry you are not allowed to ") + action + Annotator._t(" this annotation");
				break;
			case 404:
				message = Annotator._t("Sorry we could not connect to the annotations store");
				break;
			case 500:
				message = Annotator._t("Sorry something went wrong with the annotation store")
			}
			Annotator.showNotification(message, Annotator.Notification.ERROR);
			return console.error(Annotator._t("API request failed:") + (" '" + xhr.status + "'"))
		};
		return Store
	} (Annotator.Plugin);
	Annotator.Plugin.Permissions = function(_super) {
		__extends(Permissions, _super);
		Permissions.prototype.events = {
			beforeAnnotationCreated: "addFieldsToAnnotation"
		};
		Permissions.prototype.options = {
			showViewPermissionsCheckbox: true,
			showEditPermissionsCheckbox: true,
			userId: function(user) {
				return user
			},
			userString: function(user) {
				return user
			},
			userAuthorize: function(action, annotation, user) {
				var token,
				tokens,
				_k,
				_len2;
				if (annotation.permissions) {
					tokens = annotation.permissions[action] || [];
					if (tokens.length === 0) {
						return true
					}
					for (_k = 0, _len2 = tokens.length; _k < _len2; _k++) {
						token = tokens[_k];
						if (this.userId(user) === token) {
							return true
						}
					}
					return false
				} else if (annotation.user) {
					if (user) {
						return this.userId(user) === this.userId(annotation.user)
					} else {
						return false
					}
				}
				return true
			},
			user: "",
			permissions: {
				read: [],
				update: [],
				"delete": [],
				admin: []
			}
		};
		function Permissions(element, options) {
			this._setAuthFromToken = __bind(this._setAuthFromToken, this);
			this.updateViewer = __bind(this.updateViewer, this);
			this.updateAnnotationPermissions = __bind(this.updateAnnotationPermissions, this);
			this.updatePermissionsField = __bind(this.updatePermissionsField, this);
			this.addFieldsToAnnotation = __bind(this.addFieldsToAnnotation, this);
			Permissions.__super__.constructor.apply(this, arguments);
			if (this.options.user) {
				this.setUser(this.options.user);
				delete this.options.user
			}
		}
		Permissions.prototype.pluginInit = function() {
			var createCallback,
			self;
			if (!Annotator.supported()) {
				return
			}
			self = this;
			createCallback = function(method, type) {
				return function(field, annotation) {
					return self[method].call(self, type, field, annotation)
				}
			};
			if (!this.user && this.annotator.plugins.Auth) {
				this.annotator.plugins.Auth.withToken(this._setAuthFromToken)
			}
			if (this.options.showViewPermissionsCheckbox === true) {
				this.annotator.editor.addField({
					type: "checkbox",
					label: Annotator._t("Allow anyone to <strong>view</strong> this annotation"),
					load: createCallback("updatePermissionsField", "read"),
					submit: createCallback("updateAnnotationPermissions", "read")
				})
			}
			if (this.options.showEditPermissionsCheckbox === true) {
				this.annotator.editor.addField({
					type: "checkbox",
					label: Annotator._t("Allow anyone to <strong>edit</strong> this annotation"),
					load: createCallback("updatePermissionsField", "update"),
					submit: createCallback("updateAnnotationPermissions", "update")
				})
			}
			this.annotator.viewer.addField({
				load: this.updateViewer
			});
			if (this.annotator.plugins.Filter) {
				return this.annotator.plugins.Filter.addFilter({
					label: Annotator._t("User"),
					property: "user",
					isFiltered: function(_this) {
						return function(input, user) {
							var keyword,
							_k,
							_len2,
							_ref2;
							user = _this.options.userString(user);
							if (! (input && user)) {
								return false
							}
							_ref2 = input.split(/\s*/);
							for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
								keyword = _ref2[_k];
								if (user.indexOf(keyword) === -1) {
									return false
								}
							}
							return true
						}
					} (this)
				})
			}
		};
		Permissions.prototype.setUser = function(user) {
			return this.user = user
		};
		Permissions.prototype.addFieldsToAnnotation = function(annotation) {
			if (annotation) {
				annotation.permissions = this.options.permissions;
				if (this.user) {
					return annotation.user = this.user
				}
			}
		};
		Permissions.prototype.authorize = function(action, annotation, user) {
			if (user === void 0) {
				user = this.user
			}
			if (this.options.userAuthorize) {
				return this.options.userAuthorize.call(this.options, action, annotation, user)
			} else {
				return true
			}
		};
		Permissions.prototype.updatePermissionsField = function(action, field, annotation) {
			var input;
			field = $(field).show();
			input = field.find("input").removeAttr("disabled");
			if (!this.authorize("admin", annotation)) {
				field.hide()
			}
			if (this.authorize(action, annotation || {},
			null)) {
				return input.attr("checked", "checked")
			} else {
				return input.removeAttr("checked")
			}
		};
		Permissions.prototype.updateAnnotationPermissions = function(type, field, annotation) {
			var dataKey;
			if (!annotation.permissions) {
				annotation.permissions = this.options.permissions
			}
			dataKey = type + "-permissions";
			if ($(field).find("input").is(":checked")) {
				return annotation.permissions[type] = []
			} else {
				return annotation.permissions[type] = [this.options.userId(this.user)]
			}
		};
		Permissions.prototype.updateViewer = function(field, annotation, controls) {
			var user,
			username;
			field = $(field);
			username = this.options.userString(annotation.user);
			if (annotation.user && username && typeof username === "string") {
				user = Annotator.Util.escape(this.options.userString(annotation.user));
				field.html(user).addClass("annotator-user")
			} else {
				field.remove()
			}
			if (controls) {
				if (!this.authorize("update", annotation)) {
					controls.hideEdit()
				}
				if (!this.authorize("delete", annotation)) {
					return controls.hideDelete()
				}
			}
		};
		Permissions.prototype._setAuthFromToken = function(token) {
			return this.setUser(token.userId)
		};
		return Permissions
	} (Annotator.Plugin);
	Annotator.Plugin.AnnotateItPermissions = function(_super) {
		__extends(AnnotateItPermissions, _super);
		function AnnotateItPermissions() {
			this._setAuthFromToken = __bind(this._setAuthFromToken, this);
			this.updateAnnotationPermissions = __bind(this.updateAnnotationPermissions, this);
			this.updatePermissionsField = __bind(this.updatePermissionsField, this);
			this.addFieldsToAnnotation = __bind(this.addFieldsToAnnotation, this);
			return AnnotateItPermissions.__super__.constructor.apply(this, arguments)
		}
		AnnotateItPermissions.prototype.options = {
			showViewPermissionsCheckbox: true,
			showEditPermissionsCheckbox: true,
			groups: {
				world: "group:__world__",
				authenticated: "group:__authenticated__",
				consumer: "group:__consumer__"
			},
			userId: function(user) {
				return user.userId
			},
			userString: function(user) {
				return user.userId
			},
			userAuthorize: function(action, annotation, user) {
				var action_field,
				permissions,
				_ref2,
				_ref3,
				_ref4,
				_ref5;
				permissions = annotation.permissions || {};
				action_field = permissions[action] || [];
				if (_ref2 = this.groups.world, __indexOf.call(action_field, _ref2) >= 0) {
					return true
				} else if (user != null && user.userId != null && user.consumerKey != null) {
					if (user.userId === annotation.user && user.consumerKey === annotation.consumer) {
						return true
					} else if (_ref3 = this.groups.authenticated, __indexOf.call(action_field, _ref3) >= 0) {
						return true
					} else if (user.consumerKey === annotation.consumer && (_ref4 = this.groups.consumer, __indexOf.call(action_field, _ref4) >= 0)) {
						return true
					} else if (user.consumerKey === annotation.consumer && (_ref5 = user.userId, __indexOf.call(action_field, _ref5) >= 0)) {
						return true
					} else if (user.consumerKey === annotation.consumer && user.admin) {
						return true
					} else {
						return false
					}
				} else {
					return false
				}
			},
			permissions: {
				read: ["group:__world__"],
				update: [],
				"delete": [],
				admin: []
			}
		};
		AnnotateItPermissions.prototype.addFieldsToAnnotation = function(annotation) {
			if (annotation) {
				annotation.permissions = this.options.permissions;
				if (this.user) {
					annotation.user = this.user.userId;
					return annotation.consumer = this.user.consumerKey
				}
			}
		};
		AnnotateItPermissions.prototype.updatePermissionsField = function(action, field, annotation) {
			var input;
			field = $(field).show();
			input = field.find("input").removeAttr("disabled");
			if (!this.authorize("admin", annotation)) {
				field.hide()
			}
			if (this.user && this.authorize(action, annotation || {},
			{
				userId: "__nonexistentuser__",
				consumerKey: this.user.consumerKey
			})) {
				return input.attr("checked", "checked")
			} else {
				return input.removeAttr("checked")
			}
		};
		AnnotateItPermissions.prototype.updateAnnotationPermissions = function(type, field, annotation) {
			var dataKey;
			if (!annotation.permissions) {
				annotation.permissions = this.options.permissions
			}
			dataKey = type + "-permissions";
			if ($(field).find("input").is(":checked")) {
				return annotation.permissions[type] = [type === "read" ? this.options.groups.world: this.options.groups.consumer]
			} else {
				return annotation.permissions[type] = []
			}
		};
		AnnotateItPermissions.prototype._setAuthFromToken = function(token) {
			return this.setUser(token)
		};
		return AnnotateItPermissions
	} (Annotator.Plugin.Permissions);
	Annotator.Plugin.Filter = function(_super) {
		__extends(Filter, _super);
		Filter.prototype.events = {
			".annotator-filter-property input focus": "_onFilterFocus",
			".annotator-filter-property input blur": "_onFilterBlur",
			".annotator-filter-property input keyup": "_onFilterKeyup",
			".annotator-filter-previous click": "_onPreviousClick",
			".annotator-filter-next click": "_onNextClick",
			".annotator-filter-clear click": "_onClearClick"
		};
		Filter.prototype.classes = {
			active: "annotator-filter-active",
			hl: {
				hide: "annotator-hl-filtered",
				active: "annotator-hl-active"
			}
		};
		Filter.prototype.html = { //Amanda: removed navigation code, changed title text
			element: '<div class="annotator-filter">\n <strong>' + "</strong>\n</div>",
			filter: '<span class="annotator-filter-property">\n  <label></label>\n  <input/>\n  <button class="annotator-filter-clear">' + Annotator._t("Clear") + "</button>\n</span>"
		};
		Filter.prototype.options = {
			appendTo: "#theannotationfilter",
			filters: [],
			addAnnotationFilter: true,
			isFiltered: function(input, property) {
				var keyword,
				_k,
				_len2,
				_ref2;
				if (! (input && property)) {
					return false
				}
				_ref2 = input.split(/\s+/);
				for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
					keyword = _ref2[_k];
					if (property.indexOf(keyword) === -1) {
						return false
					}
				}
				return true
			}
		};
		function Filter(element, options) {
			this._onPreviousClick = __bind(this._onPreviousClick, this);
			this._onNextClick = __bind(this._onNextClick, this);
			this._onFilterKeyup = __bind(this._onFilterKeyup, this);
			this._onFilterBlur = __bind(this._onFilterBlur, this);
			this._onFilterFocus = __bind(this._onFilterFocus, this);
			this.updateHighlights = __bind(this.updateHighlights, this);
			var _base;
			element = $(this.html.element).appendTo((options != null ? options.appendTo: void 0) || this.options.appendTo);
			Filter.__super__.constructor.call(this, element, options); (_base = this.options).filters || (_base.filters = []);
			this.filter = $(this.html.filter);
			this.filters = [];
			this.current = 0
		}
		Filter.prototype.pluginInit = function() {
			var filter,
			_k,
			_len2,
			_ref2;
			_ref2 = this.options.filters;
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				filter = _ref2[_k];
				this.addFilter(filter)
			}
			this.updateHighlights();
			this._setupListeners()._insertSpacer();
			if (this.options.addAnnotationFilter === true) {
				return this.addFilter({
					label: Annotator._t("Annotation"),
					property: "text"
				})
			}
		};
		Filter.prototype.destroy = function() {
			var currentMargin,
			html;
			Filter.__super__.destroy.apply(this, arguments);
			html = $("html");
			currentMargin = parseInt(html.css("padding-top"), 10) || 0;
			html.css("padding-top", currentMargin - this.element.outerHeight());
			return this.element.remove()
		};
		Filter.prototype._insertSpacer = function() {
			var currentMargin,
			html;
			html = $("html");
			currentMargin = parseInt(html.css("padding-top"), 10) || 0;
			html.css("padding-top", currentMargin + this.element.outerHeight());
			return this
		};
		Filter.prototype._setupListeners = function() {
			var event,
			events,
			_k,
			_len2;
			events = ["annotationsLoaded", "annotationCreated", "annotationUpdated", "annotationDeleted"];
			for (_k = 0, _len2 = events.length; _k < _len2; _k++) {
				event = events[_k];
				this.annotator.subscribe(event, this.updateHighlights)
			}
			return this
		};
		Filter.prototype.addFilter = function(options) {
			var f,
			filter;
			filter = $.extend({
				label: "",
				property: "",
				isFiltered: this.options.isFiltered
			},
			options);
			if (!
			function() {
				var _k,
				_len2,
				_ref2,
				_results;
				_ref2 = this.filters;
				_results = [];
				for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
					f = _ref2[_k];
					if (f.property === filter.property) {
						_results.push(f)
					}
				}
				return _results
			}.call(this).length) {
				filter.id = "annotator-filter-" + filter.property;
				filter.annotations = [];
				filter.element = this.filter.clone().appendTo(this.element);
				filter.element.find("label").html(filter.label).attr("for", filter.id);
				filter.element.find("input").attr({
					id: filter.id,
					placeholder: Annotator._t("Filter by ") + filter.label + "…"
				});
				filter.element.find("button").hide();
				filter.element.data("filter", filter);
				this.filters.push(filter)
			}
			return this
		};
		Filter.prototype.updateFilter = function(filter) {
			var annotation,
			annotations,
			input,
			property,
			_k,
			_len2,
			_ref2;
			filter.annotations = [];
			this.updateHighlights();
			this.resetHighlights();
			input = $.trim(filter.element.find("input").val());
			if (input) {
				annotations = this.highlights.map(function() {
					return $(this).data("annotation")
				});
				_ref2 = $.makeArray(annotations);
				for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
					annotation = _ref2[_k];
					property = annotation[filter.property];
					if (filter.isFiltered(input, property)) {
						filter.annotations.push(annotation)
					}
				}
				return this.filterHighlights()
			}
		};
		Filter.prototype.updateHighlights = function() {
			this.highlights = this.annotator.element.find(".annotator-hl:visible");
			return this.filtered = this.highlights.not(this.classes.hl.hide)
		};
		Filter.prototype.filterHighlights = function() {
			var activeFilters,
			annotation,
			annotations,
			filtered,
			highlights,
			index,
			uniques,
			_k,
			_len2,
			_ref2;
			activeFilters = $.grep(this.filters, 
			function(filter) {
				return !! filter.annotations.length
			});
			filtered = ((_ref2 = activeFilters[0]) != null ? _ref2.annotations: void 0) || [];
			if (activeFilters.length > 1) {
				annotations = [];
				$.each(activeFilters, 
				function() {
					return $.merge(annotations, this.annotations)
				});
				uniques = [];
				filtered = [];
				$.each(annotations, 
				function() {
					if ($.inArray(this, uniques) === -1) {
						return uniques.push(this)
					} else {
						return filtered.push(this)
					}
				})
			}
			highlights = this.highlights;
			for (index = _k = 0, _len2 = filtered.length; _k < _len2; index = ++_k) {
				annotation = filtered[index];
				highlights = highlights.not(annotation.highlights)
			}
			highlights.addClass(this.classes.hl.hide);
			this.filtered = this.highlights.not(this.classes.hl.hide);
			return this
		};
		Filter.prototype.resetHighlights = function() {
			this.highlights.removeClass(this.classes.hl.hide);
			this.filtered = this.highlights;
			return this
		};
		Filter.prototype._onFilterFocus = function(event) {
			var input;
			input = $(event.target);
			input.parent().addClass(this.classes.active);
			return input.next("button").show()
		};
		Filter.prototype._onFilterBlur = function(event) {
			var input;
			if (!event.target.value) {
				input = $(event.target);
				input.parent().removeClass(this.classes.active);
				return input.next("button").hide()
			}
		};
		Filter.prototype._onFilterKeyup = function(event) {
			var filter;
			filter = $(event.target).parent().data("filter");
			if (filter) {
				return this.updateFilter(filter)
			}
		};
		Filter.prototype._findNextHighlight = function(previous) {
			var active,
			annotation,
			current,
			index,
			next,
			offset,
			operator,
			resetOffset;
			if (!this.highlights.length) {
				return this
			}
			offset = previous ? 0: -1;
			resetOffset = previous ? -1: 0;
			operator = previous ? "lt": "gt";
			active = this.highlights.not("." + this.classes.hl.hide);
			current = active.filter("." + this.classes.hl.active);
			if (!current.length) {
				current = active.eq(offset)
			}
			annotation = current.data("annotation");
			index = active.index(current[0]);
			next = active.filter(":" + operator + "(" + index + ")").not(annotation.highlights).eq(resetOffset);
			if (!next.length) {
				next = active.eq(resetOffset)
			}
			return this._scrollToHighlight(next.data("annotation").highlights)
		};
		Filter.prototype._onNextClick = function(event) {
			return this._findNextHighlight()
		};
		Filter.prototype._onPreviousClick = function(event) {
			return this._findNextHighlight(true)
		};
		Filter.prototype._scrollToHighlight = function(highlight) {
			highlight = $(highlight);
			this.highlights.removeClass(this.classes.hl.active);
			highlight.addClass(this.classes.hl.active);
			return $("html, body").animate({
				scrollTop: highlight.offset().top - (this.element.height() + 20)
			},
			150)
		};
		Filter.prototype._onClearClick = function(event) {
			return $(event.target).prev("input").val("").keyup().blur()
		};
		return Filter
	} (Annotator.Plugin);
	
	Annotator.Plugin.Tags = function(_super) {
		__extends(Tags, _super);
		function Tags() {
			this.setAnnotationTags = __bind(this.setAnnotationTags, this);
			this.updateField = __bind(this.updateField, this);
			return Tags.__super__.constructor.apply(this, arguments)
		}
		Tags.prototype.options = {
			parseTags: function(string) {
				var tags;
				string = $.trim(string);
				tags = [];
				if (string) {
					tags = string.split(/\s+/)
				}
				return tags
			},
			stringifyTags: function(array) {
				return array.join(" ")
			}
		};
		Tags.prototype.field = null;
		Tags.prototype.input = null;
		Tags.prototype.pluginInit = function() {
			if (!Annotator.supported()) {
				return
			}
			this.field = this.annotator.editor.addField({
				label: Annotator._t("Add some tags here") + "…",
				load: this.updateField,
				submit: this.setAnnotationTags
			});
			this.annotator.viewer.addField({
				load: this.updateViewer
			});
			if (this.annotator.plugins.Filter) {
				this.annotator.plugins.Filter.addFilter({
					label: Annotator._t("Tag"),
					property: "tags",
					isFiltered: Annotator.Plugin.Tags.filterCallback
				})
			}
			return this.input = $(this.field).find(":input")
		};
		Tags.prototype.parseTags = function(string) {
			return this.options.parseTags(string)
		};
		Tags.prototype.stringifyTags = function(array) {
			return this.options.stringifyTags(array)
		};
		Tags.prototype.updateField = function(field, annotation) {
			var value;
			value = "";
			if (annotation.tags) {
				value = this.stringifyTags(annotation.tags)
			}
			return this.input.val(value)
		};
		Tags.prototype.setAnnotationTags = function(field, annotation) {
			return annotation.tags = this.parseTags(this.input.val())
		};
		Tags.prototype.updateViewer = function(field, annotation) {
			field = $(field);
			if (annotation.tags && $.isArray(annotation.tags) && annotation.tags.length) {
				return field.addClass("annotator-tags").html(function() {
					var string;
					return string = $.map(annotation.tags, 
					function(tag) {
						return '<span class="annotator-tag">' + Annotator.Util.escape(tag) + "</span>"
					}).join(" ")
				})
			} else {
				return field.remove()
			}
		};
		return Tags
	} (Annotator.Plugin);
	Annotator.Plugin.Tags.filterCallback = function(input, tags) {
		var keyword,
		keywords,
		matches,
		tag,
		_k,
		_l,
		_len2,
		_len3;
		if (tags == null) {
			tags = []
		}
		matches = 0;
		keywords = [];
		if (input) {
			keywords = input.split(/\s+/g);
			for (_k = 0, _len2 = keywords.length; _k < _len2; _k++) {
				keyword = keywords[_k];
				if (tags.length) {
					for (_l = 0, _len3 = tags.length; _l < _len3; _l++) {
						tag = tags[_l];
						if (tag.indexOf(keyword) !== -1) {
							matches += 1
						}
					}
				}
			}
		}
		return matches === keywords.length
	};
	Annotator.prototype.setupPlugins = function(config, options) {
		var name,
		opts,
		pluginConfig,
		plugins,
		uri,
		win,
		_k,
		_len2,
		_results;
		if (config == null) {
			config = {}
		}
		if (options == null) {
			options = {}
		}
		win = Annotator.Util.getGlobal();
		plugins = ["Unsupported", "Auth", "Tags", "Filter", "Store", "AnnotateItPermissions"];
		uri = win.location.href.split(/#|\?/).shift() || "";
		pluginConfig = {
			Tags: {},
			Filter: {
				filters: [{
					label: Annotator._t("User"),
					property: "user"
				},
				{
					label: Annotator._t("Tags"),
					property: "tags"
				}]
			},
			Auth: {
				tokenUrl: config.tokenUrl || "http://annotateit.org/api/token"
			},
			Store: {
				prefix: config.storeUrl || "http://annotateit.org/api",
				annotationData: {
					uri: uri
				},
				loadFromSearch: {
					uri: uri
				}
			}
		};
		for (name in options) {
			if (!__hasProp.call(options, name)) continue;
			opts = options[name];
			if (__indexOf.call(plugins, name) < 0) {
				plugins.push(name)
			}
		}
		$.extend(true, pluginConfig, options);
		_results = [];
		for (_k = 0, _len2 = plugins.length; _k < _len2; _k++) {
			name = plugins[_k];
			if (! (name in pluginConfig) || pluginConfig[name]) {
				_results.push(this.addPlugin(name, pluginConfig[name]))
			} else {
				_results.push(void 0)
			}
		}
		return _results
	}
}.call(this);
//
//# sourceMappingURL=annotator-full.min.map;
(function ($) {
  Drupal.behaviors.annotator = {
    attach: function (context, settings) {
      Drupal.Annotator = $(Drupal.settings.annotator.element).annotator();
    }
  };


})(jQuery);

;
(function ($) {
  Drupal.behaviors.annotatorStore = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Store', {
        prefix: settings.annotator_store.prefix,
        urls: settings.annotator_store.urls,
        annotationData: {
          'uri': window.location.href,
          'type': 'annotator'
        },
        loadFromSearch: {
          'limit': 0, // Amanda: does this fix the issue of loading all available annotations?
          'uri': window.location.href
        }
      });
    }
  };
})(jQuery);
;
(function ($) {
  Drupal.behaviors.annotatorUnsupported = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Unsupported');
    }
  };
})(jQuery);;
(function ($) {
  Drupal.behaviors.annotatorFilter = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Filter');
    }
  };
})(jQuery);;
(function ($) {
  Drupal.behaviors.annotatorPermissions = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Permissions', {
        user: settings.annotator_permissions.user,
        permissions: settings.annotator_permissions.permissions,
        showViewPermissionsCheckbox: settings.annotator_permissions.showViewPermissionsCheckbox == 1,
        showEditPermissionsCheckbox: settings.annotator_permissions.showEditPermissionsCheckbox == 1,
        userId: function (user) {
          if (user && user.uid) {
            return user.uid;
          }
          return user;
        },
        userString: function (user) {
          if (user && user.name) {
            return user.name;
          }
          return user;
        },
        /*
        userAuthorize: function (action, annotation, user) {
          if (user && annotation) {

            // Edit own annotations
            if (annotation.permissions[action]['user'] &&
               (user.uid == annotation.user.uid) &&
               (jQuery.inArray(user.uid, annotation.permissions[action]['user']) !== -1)) {
              return true;
            }

            // Check if user has appropriate role
            for (var i = 0; i < user.roles.length; i++) {
              var role = jQuery.inArray(user.roles[i], annotation.permissions[action]['roles']);
              if (jQuery.inArray(user.roles[i], annotation.permissions[action]['roles']) !== -1) {
                return true;
              }
            }
          }

          // Deny access
          return false;
        }*/
      });
    }
  };
})(jQuery);
;
(function ($) {
  Drupal.behaviors.annotatorTags = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Tags');
    }
  };
})(jQuery);;
/* Amanda: patched via this workaround: https://www.drupal.org/node/1543752#comment-7393666 */
(function ($) {
  Drupal.behaviors.ViewsExposedFormFix = {
    attach: function() {
      if (Drupal.settings && Drupal.settings.views && Drupal.settings.views.ajaxViews) {
        $.each(Drupal.settings.views.ajaxViews, function(i, settings) {
          // This matches the logic in Drupal.views.ajaxView.prototype.attachExposedFormAjax.
          var exposed_form = $('form#views-exposed-form-'+ settings.view_name.replace(/_/g, '-') + '-' + settings.view_display_id.replace(/_/g, '-'));
          exposed_form.once('views-exposed-form-fix', function() {
            var button = $('input[type=submit], button[type=submit], input[type=image]', exposed_form);
            button = button[0];
            // This will catch browsers that don't activate the submit button when pressing enter in the form.
            exposed_form.submit(function (event) {
              button.click();
              event.preventDefault();
              return false;
            });
          })
        });
      }
    }
  };
})(jQuery);;
/*
 * jQuery Cycle Plugin (with Transition Definitions)
 * Examples and documentation at: http://jquery.malsup.com/cycle/
 * Copyright (c) 2007-2013 M. Alsup
 * Version: 3.0.3 (11-JUL-2013)
 * Dual licensed under the MIT and GPL licenses.
 * http://jquery.malsup.com/license.html
 * Requires: jQuery v1.7.1 or later
 */
(function($,undefined){var ver="3.0.3";function debug(s){if($.fn.cycle.debug){log(s);}}function log(){if(window.console&&console.log){console.log("[cycle] "+Array.prototype.join.call(arguments," "));}}$.expr[":"].paused=function(el){return el.cyclePause;};$.fn.cycle=function(options,arg2){var o={s:this.selector,c:this.context};if(this.length===0&&options!="stop"){if(!$.isReady&&o.s){log("DOM not ready, queuing slideshow");$(function(){$(o.s,o.c).cycle(options,arg2);});return this;}log("terminating; zero elements found by selector"+($.isReady?"":" (DOM not ready)"));return this;}return this.each(function(){var opts=handleArguments(this,options,arg2);if(opts===false){return;}opts.updateActivePagerLink=opts.updateActivePagerLink||$.fn.cycle.updateActivePagerLink;if(this.cycleTimeout){clearTimeout(this.cycleTimeout);}this.cycleTimeout=this.cyclePause=0;this.cycleStop=0;var $cont=$(this);var $slides=opts.slideExpr?$(opts.slideExpr,this):$cont.children();var els=$slides.get();if(els.length<2){log("terminating; too few slides: "+els.length);return;}var opts2=buildOptions($cont,$slides,els,opts,o);if(opts2===false){return;}var startTime=opts2.continuous?10:getTimeout(els[opts2.currSlide],els[opts2.nextSlide],opts2,!opts2.backwards);if(startTime){startTime+=(opts2.delay||0);if(startTime<10){startTime=10;}debug("first timeout: "+startTime);this.cycleTimeout=setTimeout(function(){go(els,opts2,0,!opts.backwards);},startTime);}});};function triggerPause(cont,byHover,onPager){var opts=$(cont).data("cycle.opts");if(!opts){return;}var paused=!!cont.cyclePause;if(paused&&opts.paused){opts.paused(cont,opts,byHover,onPager);}else{if(!paused&&opts.resumed){opts.resumed(cont,opts,byHover,onPager);}}}function handleArguments(cont,options,arg2){if(cont.cycleStop===undefined){cont.cycleStop=0;}if(options===undefined||options===null){options={};}if(options.constructor==String){switch(options){case"destroy":case"stop":var opts=$(cont).data("cycle.opts");if(!opts){return false;}cont.cycleStop++;if(cont.cycleTimeout){clearTimeout(cont.cycleTimeout);}cont.cycleTimeout=0;if(opts.elements){$(opts.elements).stop();}$(cont).removeData("cycle.opts");if(options=="destroy"){destroy(cont,opts);}return false;case"toggle":cont.cyclePause=(cont.cyclePause===1)?0:1;checkInstantResume(cont.cyclePause,arg2,cont);triggerPause(cont);return false;case"pause":cont.cyclePause=1;triggerPause(cont);return false;case"resume":cont.cyclePause=0;checkInstantResume(false,arg2,cont);triggerPause(cont);return false;case"prev":case"next":opts=$(cont).data("cycle.opts");if(!opts){log('options not found, "prev/next" ignored');return false;}if(typeof arg2=="string"){opts.oneTimeFx=arg2;}$.fn.cycle[options](opts);return false;default:options={fx:options};}return options;}else{if(options.constructor==Number){var num=options;options=$(cont).data("cycle.opts");if(!options){log("options not found, can not advance slide");return false;}if(num<0||num>=options.elements.length){log("invalid slide index: "+num);return false;}options.nextSlide=num;if(cont.cycleTimeout){clearTimeout(cont.cycleTimeout);cont.cycleTimeout=0;}if(typeof arg2=="string"){options.oneTimeFx=arg2;}go(options.elements,options,1,num>=options.currSlide);return false;}}return options;function checkInstantResume(isPaused,arg2,cont){if(!isPaused&&arg2===true){var options=$(cont).data("cycle.opts");if(!options){log("options not found, can not resume");return false;}if(cont.cycleTimeout){clearTimeout(cont.cycleTimeout);cont.cycleTimeout=0;}go(options.elements,options,1,!options.backwards);}}}function removeFilter(el,opts){if(!$.support.opacity&&opts.cleartype&&el.style.filter){try{el.style.removeAttribute("filter");}catch(smother){}}}function destroy(cont,opts){if(opts.next){$(opts.next).unbind(opts.prevNextEvent);}if(opts.prev){$(opts.prev).unbind(opts.prevNextEvent);}if(opts.pager||opts.pagerAnchorBuilder){$.each(opts.pagerAnchors||[],function(){this.unbind().remove();});}opts.pagerAnchors=null;$(cont).unbind("mouseenter.cycle mouseleave.cycle");if(opts.destroy){opts.destroy(opts);}}function buildOptions($cont,$slides,els,options,o){var startingSlideSpecified;var opts=$.extend({},$.fn.cycle.defaults,options||{},$.metadata?$cont.metadata():$.meta?$cont.data():{});var meta=$.isFunction($cont.data)?$cont.data(opts.metaAttr):null;if(meta){opts=$.extend(opts,meta);}if(opts.autostop){opts.countdown=opts.autostopCount||els.length;}var cont=$cont[0];$cont.data("cycle.opts",opts);opts.$cont=$cont;opts.stopCount=cont.cycleStop;opts.elements=els;opts.before=opts.before?[opts.before]:[];opts.after=opts.after?[opts.after]:[];if(!$.support.opacity&&opts.cleartype){opts.after.push(function(){removeFilter(this,opts);});}if(opts.continuous){opts.after.push(function(){go(els,opts,0,!opts.backwards);});}saveOriginalOpts(opts);if(!$.support.opacity&&opts.cleartype&&!opts.cleartypeNoBg){clearTypeFix($slides);}if($cont.css("position")=="static"){$cont.css("position","relative");}if(opts.width){$cont.width(opts.width);}if(opts.height&&opts.height!="auto"){$cont.height(opts.height);}if(opts.startingSlide!==undefined){opts.startingSlide=parseInt(opts.startingSlide,10);if(opts.startingSlide>=els.length||opts.startSlide<0){opts.startingSlide=0;}else{startingSlideSpecified=true;}}else{if(opts.backwards){opts.startingSlide=els.length-1;}else{opts.startingSlide=0;}}if(opts.random){opts.randomMap=[];for(var i=0;i<els.length;i++){opts.randomMap.push(i);}opts.randomMap.sort(function(a,b){return Math.random()-0.5;});if(startingSlideSpecified){for(var cnt=0;cnt<els.length;cnt++){if(opts.startingSlide==opts.randomMap[cnt]){opts.randomIndex=cnt;}}}else{opts.randomIndex=1;opts.startingSlide=opts.randomMap[1];}}else{if(opts.startingSlide>=els.length){opts.startingSlide=0;}}opts.currSlide=opts.startingSlide||0;var first=opts.startingSlide;$slides.css({position:"absolute",top:0,left:0}).hide().each(function(i){var z;if(opts.backwards){z=first?i<=first?els.length+(i-first):first-i:els.length-i;}else{z=first?i>=first?els.length-(i-first):first-i:els.length-i;}$(this).css("z-index",z);});$(els[first]).css("opacity",1).show();removeFilter(els[first],opts);if(opts.fit){if(!opts.aspect){if(opts.width){$slides.width(opts.width);}if(opts.height&&opts.height!="auto"){$slides.height(opts.height);}}else{$slides.each(function(){var $slide=$(this);var ratio=(opts.aspect===true)?$slide.width()/$slide.height():opts.aspect;if(opts.width&&$slide.width()!=opts.width){$slide.width(opts.width);$slide.height(opts.width/ratio);}if(opts.height&&$slide.height()<opts.height){$slide.height(opts.height);$slide.width(opts.height*ratio);}});}}if(opts.center&&((!opts.fit)||opts.aspect)){$slides.each(function(){var $slide=$(this);$slide.css({"margin-left":opts.width?((opts.width-$slide.width())/2)+"px":0,"margin-top":opts.height?((opts.height-$slide.height())/2)+"px":0});});}if(opts.center&&!opts.fit&&!opts.slideResize){$slides.each(function(){var $slide=$(this);$slide.css({"margin-left":opts.width?((opts.width-$slide.width())/2)+"px":0,"margin-top":opts.height?((opts.height-$slide.height())/2)+"px":0});});}var reshape=(opts.containerResize||opts.containerResizeHeight)&&$cont.innerHeight()<1;if(reshape){var maxw=0,maxh=0;for(var j=0;j<els.length;j++){var $e=$(els[j]),e=$e[0],w=$e.outerWidth(),h=$e.outerHeight();if(!w){w=e.offsetWidth||e.width||$e.attr("width");}if(!h){h=e.offsetHeight||e.height||$e.attr("height");}maxw=w>maxw?w:maxw;maxh=h>maxh?h:maxh;}if(opts.containerResize&&maxw>0&&maxh>0){$cont.css({width:maxw+"px",height:maxh+"px"});}if(opts.containerResizeHeight&&maxh>0){$cont.css({height:maxh+"px"});}}var pauseFlag=false;if(opts.pause){$cont.bind("mouseenter.cycle",function(){pauseFlag=true;this.cyclePause++;triggerPause(cont,true);}).bind("mouseleave.cycle",function(){if(pauseFlag){this.cyclePause--;}triggerPause(cont,true);});}if(supportMultiTransitions(opts)===false){return false;}var requeue=false;options.requeueAttempts=options.requeueAttempts||0;$slides.each(function(){var $el=$(this);this.cycleH=(opts.fit&&opts.height)?opts.height:($el.height()||this.offsetHeight||this.height||$el.attr("height")||0);this.cycleW=(opts.fit&&opts.width)?opts.width:($el.width()||this.offsetWidth||this.width||$el.attr("width")||0);if($el.is("img")){var loading=(this.cycleH===0&&this.cycleW===0&&!this.complete);if(loading){if(o.s&&opts.requeueOnImageNotLoaded&&++options.requeueAttempts<100){log(options.requeueAttempts," - img slide not loaded, requeuing slideshow: ",this.src,this.cycleW,this.cycleH);setTimeout(function(){$(o.s,o.c).cycle(options);},opts.requeueTimeout);requeue=true;return false;}else{log("could not determine size of image: "+this.src,this.cycleW,this.cycleH);}}}return true;});if(requeue){return false;}opts.cssBefore=opts.cssBefore||{};opts.cssAfter=opts.cssAfter||{};opts.cssFirst=opts.cssFirst||{};opts.animIn=opts.animIn||{};opts.animOut=opts.animOut||{};$slides.not(":eq("+first+")").css(opts.cssBefore);$($slides[first]).css(opts.cssFirst);if(opts.timeout){opts.timeout=parseInt(opts.timeout,10);if(opts.speed.constructor==String){opts.speed=$.fx.speeds[opts.speed]||parseInt(opts.speed,10);}if(!opts.sync){opts.speed=opts.speed/2;}var buffer=opts.fx=="none"?0:opts.fx=="shuffle"?500:250;while((opts.timeout-opts.speed)<buffer){opts.timeout+=opts.speed;}}if(opts.easing){opts.easeIn=opts.easeOut=opts.easing;}if(!opts.speedIn){opts.speedIn=opts.speed;}if(!opts.speedOut){opts.speedOut=opts.speed;}opts.slideCount=els.length;opts.currSlide=opts.lastSlide=first;if(opts.random){if(++opts.randomIndex==els.length){opts.randomIndex=0;}opts.nextSlide=opts.randomMap[opts.randomIndex];}else{if(opts.backwards){opts.nextSlide=opts.startingSlide===0?(els.length-1):opts.startingSlide-1;}else{opts.nextSlide=opts.startingSlide>=(els.length-1)?0:opts.startingSlide+1;}}if(!opts.multiFx){var init=$.fn.cycle.transitions[opts.fx];if($.isFunction(init)){init($cont,$slides,opts);}else{if(opts.fx!="custom"&&!opts.multiFx){log("unknown transition: "+opts.fx,"; slideshow terminating");return false;}}}var e0=$slides[first];if(!opts.skipInitializationCallbacks){if(opts.before.length){opts.before[0].apply(e0,[e0,e0,opts,true]);}if(opts.after.length){opts.after[0].apply(e0,[e0,e0,opts,true]);}}if(opts.next){$(opts.next).bind(opts.prevNextEvent,function(){return advance(opts,1);});}if(opts.prev){$(opts.prev).bind(opts.prevNextEvent,function(){return advance(opts,0);});}if(opts.pager||opts.pagerAnchorBuilder){buildPager(els,opts);}exposeAddSlide(opts,els);return opts;}function saveOriginalOpts(opts){opts.original={before:[],after:[]};opts.original.cssBefore=$.extend({},opts.cssBefore);opts.original.cssAfter=$.extend({},opts.cssAfter);opts.original.animIn=$.extend({},opts.animIn);opts.original.animOut=$.extend({},opts.animOut);$.each(opts.before,function(){opts.original.before.push(this);});$.each(opts.after,function(){opts.original.after.push(this);});}function supportMultiTransitions(opts){var i,tx,txs=$.fn.cycle.transitions;if(opts.fx.indexOf(",")>0){opts.multiFx=true;opts.fxs=opts.fx.replace(/\s*/g,"").split(",");for(i=0;i<opts.fxs.length;i++){var fx=opts.fxs[i];tx=txs[fx];if(!tx||!txs.hasOwnProperty(fx)||!$.isFunction(tx)){log("discarding unknown transition: ",fx);opts.fxs.splice(i,1);i--;}}if(!opts.fxs.length){log("No valid transitions named; slideshow terminating.");return false;}}else{if(opts.fx=="all"){opts.multiFx=true;opts.fxs=[];for(var p in txs){if(txs.hasOwnProperty(p)){tx=txs[p];if(txs.hasOwnProperty(p)&&$.isFunction(tx)){opts.fxs.push(p);}}}}}if(opts.multiFx&&opts.randomizeEffects){var r1=Math.floor(Math.random()*20)+30;for(i=0;i<r1;i++){var r2=Math.floor(Math.random()*opts.fxs.length);opts.fxs.push(opts.fxs.splice(r2,1)[0]);}debug("randomized fx sequence: ",opts.fxs);}return true;}function exposeAddSlide(opts,els){opts.addSlide=function(newSlide,prepend){var $s=$(newSlide),s=$s[0];if(!opts.autostopCount){opts.countdown++;}els[prepend?"unshift":"push"](s);if(opts.els){opts.els[prepend?"unshift":"push"](s);}opts.slideCount=els.length;if(opts.random){opts.randomMap.push(opts.slideCount-1);opts.randomMap.sort(function(a,b){return Math.random()-0.5;});}$s.css("position","absolute");$s[prepend?"prependTo":"appendTo"](opts.$cont);if(prepend){opts.currSlide++;opts.nextSlide++;}if(!$.support.opacity&&opts.cleartype&&!opts.cleartypeNoBg){clearTypeFix($s);}if(opts.fit&&opts.width){$s.width(opts.width);}if(opts.fit&&opts.height&&opts.height!="auto"){$s.height(opts.height);}s.cycleH=(opts.fit&&opts.height)?opts.height:$s.height();s.cycleW=(opts.fit&&opts.width)?opts.width:$s.width();$s.css(opts.cssBefore);if(opts.pager||opts.pagerAnchorBuilder){$.fn.cycle.createPagerAnchor(els.length-1,s,$(opts.pager),els,opts);}if($.isFunction(opts.onAddSlide)){opts.onAddSlide($s);}else{$s.hide();}};}$.fn.cycle.resetState=function(opts,fx){fx=fx||opts.fx;opts.before=[];opts.after=[];opts.cssBefore=$.extend({},opts.original.cssBefore);opts.cssAfter=$.extend({},opts.original.cssAfter);opts.animIn=$.extend({},opts.original.animIn);opts.animOut=$.extend({},opts.original.animOut);opts.fxFn=null;$.each(opts.original.before,function(){opts.before.push(this);});$.each(opts.original.after,function(){opts.after.push(this);});var init=$.fn.cycle.transitions[fx];if($.isFunction(init)){init(opts.$cont,$(opts.elements),opts);}};function go(els,opts,manual,fwd){var p=opts.$cont[0],curr=els[opts.currSlide],next=els[opts.nextSlide];if(manual&&opts.busy&&opts.manualTrump){debug("manualTrump in go(), stopping active transition");$(els).stop(true,true);opts.busy=0;clearTimeout(p.cycleTimeout);}if(opts.busy){debug("transition active, ignoring new tx request");return;}if(p.cycleStop!=opts.stopCount||p.cycleTimeout===0&&!manual){return;}if(!manual&&!p.cyclePause&&!opts.bounce&&((opts.autostop&&(--opts.countdown<=0))||(opts.nowrap&&!opts.random&&opts.nextSlide<opts.currSlide))){if(opts.end){opts.end(opts);}return;}var changed=false;if((manual||!p.cyclePause)&&(opts.nextSlide!=opts.currSlide)){changed=true;var fx=opts.fx;curr.cycleH=curr.cycleH||$(curr).height();curr.cycleW=curr.cycleW||$(curr).width();next.cycleH=next.cycleH||$(next).height();next.cycleW=next.cycleW||$(next).width();if(opts.multiFx){if(fwd&&(opts.lastFx===undefined||++opts.lastFx>=opts.fxs.length)){opts.lastFx=0;}else{if(!fwd&&(opts.lastFx===undefined||--opts.lastFx<0)){opts.lastFx=opts.fxs.length-1;}}fx=opts.fxs[opts.lastFx];}if(opts.oneTimeFx){fx=opts.oneTimeFx;opts.oneTimeFx=null;}$.fn.cycle.resetState(opts,fx);if(opts.before.length){$.each(opts.before,function(i,o){if(p.cycleStop!=opts.stopCount){return;}o.apply(next,[curr,next,opts,fwd]);});}var after=function(){opts.busy=0;$.each(opts.after,function(i,o){if(p.cycleStop!=opts.stopCount){return;}o.apply(next,[curr,next,opts,fwd]);});if(!p.cycleStop){queueNext();}};debug("tx firing("+fx+"); currSlide: "+opts.currSlide+"; nextSlide: "+opts.nextSlide);opts.busy=1;if(opts.fxFn){opts.fxFn(curr,next,opts,after,fwd,manual&&opts.fastOnEvent);}else{if($.isFunction($.fn.cycle[opts.fx])){$.fn.cycle[opts.fx](curr,next,opts,after,fwd,manual&&opts.fastOnEvent);}else{$.fn.cycle.custom(curr,next,opts,after,fwd,manual&&opts.fastOnEvent);}}}else{queueNext();}if(changed||opts.nextSlide==opts.currSlide){var roll;opts.lastSlide=opts.currSlide;if(opts.random){opts.currSlide=opts.nextSlide;if(++opts.randomIndex==els.length){opts.randomIndex=0;opts.randomMap.sort(function(a,b){return Math.random()-0.5;});}opts.nextSlide=opts.randomMap[opts.randomIndex];if(opts.nextSlide==opts.currSlide){opts.nextSlide=(opts.currSlide==opts.slideCount-1)?0:opts.currSlide+1;}}else{if(opts.backwards){roll=(opts.nextSlide-1)<0;if(roll&&opts.bounce){opts.backwards=!opts.backwards;opts.nextSlide=1;opts.currSlide=0;}else{opts.nextSlide=roll?(els.length-1):opts.nextSlide-1;opts.currSlide=roll?0:opts.nextSlide+1;}}else{roll=(opts.nextSlide+1)==els.length;if(roll&&opts.bounce){opts.backwards=!opts.backwards;opts.nextSlide=els.length-2;opts.currSlide=els.length-1;}else{opts.nextSlide=roll?0:opts.nextSlide+1;opts.currSlide=roll?els.length-1:opts.nextSlide-1;}}}}if(changed&&opts.pager){opts.updateActivePagerLink(opts.pager,opts.currSlide,opts.activePagerClass);}function queueNext(){var ms=0,timeout=opts.timeout;if(opts.timeout&&!opts.continuous){ms=getTimeout(els[opts.currSlide],els[opts.nextSlide],opts,fwd);if(opts.fx=="shuffle"){ms-=opts.speedOut;}}else{if(opts.continuous&&p.cyclePause){ms=10;}}if(ms>0){p.cycleTimeout=setTimeout(function(){go(els,opts,0,!opts.backwards);},ms);}}}$.fn.cycle.updateActivePagerLink=function(pager,currSlide,clsName){$(pager).each(function(){$(this).children().removeClass(clsName).eq(currSlide).addClass(clsName);});};function getTimeout(curr,next,opts,fwd){if(opts.timeoutFn){var t=opts.timeoutFn.call(curr,curr,next,opts,fwd);while(opts.fx!="none"&&(t-opts.speed)<250){t+=opts.speed;}debug("calculated timeout: "+t+"; speed: "+opts.speed);if(t!==false){return t;}}return opts.timeout;}$.fn.cycle.next=function(opts){advance(opts,1);};$.fn.cycle.prev=function(opts){advance(opts,0);};function advance(opts,moveForward){var val=moveForward?1:-1;var els=opts.elements;var p=opts.$cont[0],timeout=p.cycleTimeout;if(timeout){clearTimeout(timeout);p.cycleTimeout=0;}if(opts.random&&val<0){opts.randomIndex--;if(--opts.randomIndex==-2){opts.randomIndex=els.length-2;}else{if(opts.randomIndex==-1){opts.randomIndex=els.length-1;}}opts.nextSlide=opts.randomMap[opts.randomIndex];}else{if(opts.random){opts.nextSlide=opts.randomMap[opts.randomIndex];}else{opts.nextSlide=opts.currSlide+val;if(opts.nextSlide<0){if(opts.nowrap){return false;}opts.nextSlide=els.length-1;}else{if(opts.nextSlide>=els.length){if(opts.nowrap){return false;}opts.nextSlide=0;}}}}var cb=opts.onPrevNextEvent||opts.prevNextClick;if($.isFunction(cb)){cb(val>0,opts.nextSlide,els[opts.nextSlide]);}go(els,opts,1,moveForward);return false;}function buildPager(els,opts){var $p=$(opts.pager);$.each(els,function(i,o){$.fn.cycle.createPagerAnchor(i,o,$p,els,opts);});opts.updateActivePagerLink(opts.pager,opts.startingSlide,opts.activePagerClass);}$.fn.cycle.createPagerAnchor=function(i,el,$p,els,opts){var a;if($.isFunction(opts.pagerAnchorBuilder)){a=opts.pagerAnchorBuilder(i,el);debug("pagerAnchorBuilder("+i+", el) returned: "+a);}else{a='<a href="#">'+(i+1)+"</a>";}if(!a){return;}var $a=$(a);if($a.parents("body").length===0){var arr=[];if($p.length>1){$p.each(function(){var $clone=$a.clone(true);$(this).append($clone);arr.push($clone[0]);});$a=$(arr);}else{$a.appendTo($p);}}opts.pagerAnchors=opts.pagerAnchors||[];opts.pagerAnchors.push($a);var pagerFn=function(e){e.preventDefault();opts.nextSlide=i;var p=opts.$cont[0],timeout=p.cycleTimeout;if(timeout){clearTimeout(timeout);p.cycleTimeout=0;}var cb=opts.onPagerEvent||opts.pagerClick;if($.isFunction(cb)){cb(opts.nextSlide,els[opts.nextSlide]);}go(els,opts,1,opts.currSlide<i);};if(/mouseenter|mouseover/i.test(opts.pagerEvent)){$a.hover(pagerFn,function(){});}else{$a.bind(opts.pagerEvent,pagerFn);}if(!/^click/.test(opts.pagerEvent)&&!opts.allowPagerClickBubble){$a.bind("click.cycle",function(){return false;});}var cont=opts.$cont[0];var pauseFlag=false;if(opts.pauseOnPagerHover){$a.hover(function(){pauseFlag=true;cont.cyclePause++;triggerPause(cont,true,true);},function(){if(pauseFlag){cont.cyclePause--;}triggerPause(cont,true,true);});}};$.fn.cycle.hopsFromLast=function(opts,fwd){var hops,l=opts.lastSlide,c=opts.currSlide;if(fwd){hops=c>l?c-l:opts.slideCount-l;}else{hops=c<l?l-c:l+opts.slideCount-c;}return hops;};function clearTypeFix($slides){debug("applying clearType background-color hack");function hex(s){s=parseInt(s,10).toString(16);return s.length<2?"0"+s:s;}function getBg(e){for(;e&&e.nodeName.toLowerCase()!="html";e=e.parentNode){var v=$.css(e,"background-color");if(v&&v.indexOf("rgb")>=0){var rgb=v.match(/\d+/g);return"#"+hex(rgb[0])+hex(rgb[1])+hex(rgb[2]);}if(v&&v!="transparent"){return v;}}return"#ffffff";}$slides.each(function(){$(this).css("background-color",getBg(this));});}$.fn.cycle.commonReset=function(curr,next,opts,w,h,rev){$(opts.elements).not(curr).hide();if(typeof opts.cssBefore.opacity=="undefined"){opts.cssBefore.opacity=1;}opts.cssBefore.display="block";if(opts.slideResize&&w!==false&&next.cycleW>0){opts.cssBefore.width=next.cycleW;}if(opts.slideResize&&h!==false&&next.cycleH>0){opts.cssBefore.height=next.cycleH;}opts.cssAfter=opts.cssAfter||{};opts.cssAfter.display="none";$(curr).css("zIndex",opts.slideCount+(rev===true?1:0));$(next).css("zIndex",opts.slideCount+(rev===true?0:1));};$.fn.cycle.custom=function(curr,next,opts,cb,fwd,speedOverride){var $l=$(curr),$n=$(next);var speedIn=opts.speedIn,speedOut=opts.speedOut,easeIn=opts.easeIn,easeOut=opts.easeOut,animInDelay=opts.animInDelay,animOutDelay=opts.animOutDelay;$n.css(opts.cssBefore);if(speedOverride){if(typeof speedOverride=="number"){speedIn=speedOut=speedOverride;}else{speedIn=speedOut=1;}easeIn=easeOut=null;}var fn=function(){$n.delay(animInDelay).animate(opts.animIn,speedIn,easeIn,function(){cb();});};$l.delay(animOutDelay).animate(opts.animOut,speedOut,easeOut,function(){$l.css(opts.cssAfter);if(!opts.sync){fn();}});if(opts.sync){fn();}};$.fn.cycle.transitions={fade:function($cont,$slides,opts){$slides.not(":eq("+opts.currSlide+")").css("opacity",0);opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts);opts.cssBefore.opacity=0;});opts.animIn={opacity:1};opts.animOut={opacity:0};opts.cssBefore={top:0,left:0};}};$.fn.cycle.ver=function(){return ver;};$.fn.cycle.defaults={activePagerClass:"activeSlide",after:null,allowPagerClickBubble:false,animIn:null,animInDelay:0,animOut:null,animOutDelay:0,aspect:false,autostop:0,autostopCount:0,backwards:false,before:null,center:null,cleartype:!$.support.opacity,cleartypeNoBg:false,containerResize:1,containerResizeHeight:0,continuous:0,cssAfter:null,cssBefore:null,delay:0,easeIn:null,easeOut:null,easing:null,end:null,fastOnEvent:0,fit:0,fx:"fade",fxFn:null,height:"auto",manualTrump:true,metaAttr:"cycle",next:null,nowrap:0,onPagerEvent:null,onPrevNextEvent:null,pager:null,pagerAnchorBuilder:null,pagerEvent:"click.cycle",pause:0,pauseOnPagerHover:0,prev:null,prevNextEvent:"click.cycle",random:0,randomizeEffects:1,requeueOnImageNotLoaded:true,requeueTimeout:250,rev:0,shuffle:null,skipInitializationCallbacks:false,slideExpr:null,slideResize:1,speed:1000,speedIn:null,speedOut:null,startingSlide:undefined,sync:1,timeout:4000,timeoutFn:null,updateActivePagerLink:null,width:null};})(jQuery);
/*
 * jQuery Cycle Plugin Transition Definitions
 * This script is a plugin for the jQuery Cycle Plugin
 * Examples and documentation at: http://malsup.com/jquery/cycle/
 * Copyright (c) 2007-2010 M. Alsup
 * Version:	 2.73
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function($){$.fn.cycle.transitions.none=function($cont,$slides,opts){opts.fxFn=function(curr,next,opts,after){$(next).show();$(curr).hide();after();};};$.fn.cycle.transitions.fadeout=function($cont,$slides,opts){$slides.not(":eq("+opts.currSlide+")").css({display:"block",opacity:1});opts.before.push(function(curr,next,opts,w,h,rev){$(curr).css("zIndex",opts.slideCount+(rev!==true?1:0));$(next).css("zIndex",opts.slideCount+(rev!==true?0:1));});opts.animIn.opacity=1;opts.animOut.opacity=0;opts.cssBefore.opacity=1;opts.cssBefore.display="block";opts.cssAfter.zIndex=0;};$.fn.cycle.transitions.scrollUp=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push($.fn.cycle.commonReset);var h=$cont.height();opts.cssBefore.top=h;opts.cssBefore.left=0;opts.cssFirst.top=0;opts.animIn.top=0;opts.animOut.top=-h;};$.fn.cycle.transitions.scrollDown=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push($.fn.cycle.commonReset);var h=$cont.height();opts.cssFirst.top=0;opts.cssBefore.top=-h;opts.cssBefore.left=0;opts.animIn.top=0;opts.animOut.top=h;};$.fn.cycle.transitions.scrollLeft=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push($.fn.cycle.commonReset);var w=$cont.width();opts.cssFirst.left=0;opts.cssBefore.left=w;opts.cssBefore.top=0;opts.animIn.left=0;opts.animOut.left=0-w;};$.fn.cycle.transitions.scrollRight=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push($.fn.cycle.commonReset);var w=$cont.width();opts.cssFirst.left=0;opts.cssBefore.left=-w;opts.cssBefore.top=0;opts.animIn.left=0;opts.animOut.left=w;};$.fn.cycle.transitions.scrollHorz=function($cont,$slides,opts){$cont.css("overflow","hidden").width();opts.before.push(function(curr,next,opts,fwd){if(opts.rev){fwd=!fwd;}$.fn.cycle.commonReset(curr,next,opts);opts.cssBefore.left=fwd?(next.cycleW-1):(1-next.cycleW);opts.animOut.left=fwd?-curr.cycleW:curr.cycleW;});opts.cssFirst.left=0;opts.cssBefore.top=0;opts.animIn.left=0;opts.animOut.top=0;};$.fn.cycle.transitions.scrollVert=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push(function(curr,next,opts,fwd){if(opts.rev){fwd=!fwd;}$.fn.cycle.commonReset(curr,next,opts);opts.cssBefore.top=fwd?(1-next.cycleH):(next.cycleH-1);opts.animOut.top=fwd?curr.cycleH:-curr.cycleH;});opts.cssFirst.top=0;opts.cssBefore.left=0;opts.animIn.top=0;opts.animOut.left=0;};$.fn.cycle.transitions.slideX=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$(opts.elements).not(curr).hide();$.fn.cycle.commonReset(curr,next,opts,false,true);opts.animIn.width=next.cycleW;});opts.cssBefore.left=0;opts.cssBefore.top=0;opts.cssBefore.width=0;opts.animIn.width="show";opts.animOut.width=0;};$.fn.cycle.transitions.slideY=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$(opts.elements).not(curr).hide();$.fn.cycle.commonReset(curr,next,opts,true,false);opts.animIn.height=next.cycleH;});opts.cssBefore.left=0;opts.cssBefore.top=0;opts.cssBefore.height=0;opts.animIn.height="show";opts.animOut.height=0;};$.fn.cycle.transitions.shuffle=function($cont,$slides,opts){var i,w=$cont.css("overflow","visible").width();$slides.css({left:0,top:0});opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,true,true);});if(!opts.speedAdjusted){opts.speed=opts.speed/2;opts.speedAdjusted=true;}opts.random=0;opts.shuffle=opts.shuffle||{left:-w,top:15};opts.els=[];for(i=0;i<$slides.length;i++){opts.els.push($slides[i]);}for(i=0;i<opts.currSlide;i++){opts.els.push(opts.els.shift());}opts.fxFn=function(curr,next,opts,cb,fwd){if(opts.rev){fwd=!fwd;}var $el=fwd?$(curr):$(next);$(next).css(opts.cssBefore);var count=opts.slideCount;$el.animate(opts.shuffle,opts.speedIn,opts.easeIn,function(){var hops=$.fn.cycle.hopsFromLast(opts,fwd);for(var k=0;k<hops;k++){if(fwd){opts.els.push(opts.els.shift());}else{opts.els.unshift(opts.els.pop());}}if(fwd){for(var i=0,len=opts.els.length;i<len;i++){$(opts.els[i]).css("z-index",len-i+count);}}else{var z=$(curr).css("z-index");$el.css("z-index",parseInt(z,10)+1+count);}$el.animate({left:0,top:0},opts.speedOut,opts.easeOut,function(){$(fwd?this:curr).hide();if(cb){cb();}});});};$.extend(opts.cssBefore,{display:"block",opacity:1,top:0,left:0});};$.fn.cycle.transitions.turnUp=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,false);opts.cssBefore.top=next.cycleH;opts.animIn.height=next.cycleH;opts.animOut.width=next.cycleW;});opts.cssFirst.top=0;opts.cssBefore.left=0;opts.cssBefore.height=0;opts.animIn.top=0;opts.animOut.height=0;};$.fn.cycle.transitions.turnDown=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,false);opts.animIn.height=next.cycleH;opts.animOut.top=curr.cycleH;});opts.cssFirst.top=0;opts.cssBefore.left=0;opts.cssBefore.top=0;opts.cssBefore.height=0;opts.animOut.height=0;};$.fn.cycle.transitions.turnLeft=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,false,true);opts.cssBefore.left=next.cycleW;opts.animIn.width=next.cycleW;});opts.cssBefore.top=0;opts.cssBefore.width=0;opts.animIn.left=0;opts.animOut.width=0;};$.fn.cycle.transitions.turnRight=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,false,true);opts.animIn.width=next.cycleW;opts.animOut.left=curr.cycleW;});$.extend(opts.cssBefore,{top:0,left:0,width:0});opts.animIn.left=0;opts.animOut.width=0;};$.fn.cycle.transitions.zoom=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,false,false,true);opts.cssBefore.top=next.cycleH/2;opts.cssBefore.left=next.cycleW/2;$.extend(opts.animIn,{top:0,left:0,width:next.cycleW,height:next.cycleH});$.extend(opts.animOut,{width:0,height:0,top:curr.cycleH/2,left:curr.cycleW/2});});opts.cssFirst.top=0;opts.cssFirst.left=0;opts.cssBefore.width=0;opts.cssBefore.height=0;};$.fn.cycle.transitions.fadeZoom=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,false,false);opts.cssBefore.left=next.cycleW/2;opts.cssBefore.top=next.cycleH/2;$.extend(opts.animIn,{top:0,left:0,width:next.cycleW,height:next.cycleH});});opts.cssBefore.width=0;opts.cssBefore.height=0;opts.animOut.opacity=0;};$.fn.cycle.transitions.blindX=function($cont,$slides,opts){var w=$cont.css("overflow","hidden").width();opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts);opts.animIn.width=next.cycleW;opts.animOut.left=curr.cycleW;});opts.cssBefore.left=w;opts.cssBefore.top=0;opts.animIn.left=0;opts.animOut.left=w;};$.fn.cycle.transitions.blindY=function($cont,$slides,opts){var h=$cont.css("overflow","hidden").height();opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts);opts.animIn.height=next.cycleH;opts.animOut.top=curr.cycleH;});opts.cssBefore.top=h;opts.cssBefore.left=0;opts.animIn.top=0;opts.animOut.top=h;};$.fn.cycle.transitions.blindZ=function($cont,$slides,opts){var h=$cont.css("overflow","hidden").height();var w=$cont.width();opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts);opts.animIn.height=next.cycleH;opts.animOut.top=curr.cycleH;});opts.cssBefore.top=h;opts.cssBefore.left=w;opts.animIn.top=0;opts.animIn.left=0;opts.animOut.top=h;opts.animOut.left=w;};$.fn.cycle.transitions.growX=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,false,true);opts.cssBefore.left=this.cycleW/2;opts.animIn.left=0;opts.animIn.width=this.cycleW;opts.animOut.left=0;});opts.cssBefore.top=0;opts.cssBefore.width=0;};$.fn.cycle.transitions.growY=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,false);opts.cssBefore.top=this.cycleH/2;opts.animIn.top=0;opts.animIn.height=this.cycleH;opts.animOut.top=0;});opts.cssBefore.height=0;opts.cssBefore.left=0;};$.fn.cycle.transitions.curtainX=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,false,true,true);opts.cssBefore.left=next.cycleW/2;opts.animIn.left=0;opts.animIn.width=this.cycleW;opts.animOut.left=curr.cycleW/2;opts.animOut.width=0;});opts.cssBefore.top=0;opts.cssBefore.width=0;};$.fn.cycle.transitions.curtainY=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,false,true);opts.cssBefore.top=next.cycleH/2;opts.animIn.top=0;opts.animIn.height=next.cycleH;opts.animOut.top=curr.cycleH/2;opts.animOut.height=0;});opts.cssBefore.height=0;opts.cssBefore.left=0;};$.fn.cycle.transitions.cover=function($cont,$slides,opts){var d=opts.direction||"left";var w=$cont.css("overflow","hidden").width();var h=$cont.height();opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts);opts.cssAfter.display="";if(d=="right"){opts.cssBefore.left=-w;}else{if(d=="up"){opts.cssBefore.top=h;}else{if(d=="down"){opts.cssBefore.top=-h;}else{opts.cssBefore.left=w;}}}});opts.animIn.left=0;opts.animIn.top=0;opts.cssBefore.top=0;opts.cssBefore.left=0;};$.fn.cycle.transitions.uncover=function($cont,$slides,opts){var d=opts.direction||"left";var w=$cont.css("overflow","hidden").width();var h=$cont.height();opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,true,true);if(d=="right"){opts.animOut.left=w;}else{if(d=="up"){opts.animOut.top=-h;}else{if(d=="down"){opts.animOut.top=h;}else{opts.animOut.left=-w;}}}});opts.animIn.left=0;opts.animIn.top=0;opts.cssBefore.top=0;opts.cssBefore.left=0;};$.fn.cycle.transitions.toss=function($cont,$slides,opts){var w=$cont.css("overflow","visible").width();var h=$cont.height();opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,true,true);if(!opts.animOut.left&&!opts.animOut.top){$.extend(opts.animOut,{left:w*2,top:-h/2,opacity:0});}else{opts.animOut.opacity=0;}});opts.cssBefore.left=0;opts.cssBefore.top=0;opts.animIn.left=0;};$.fn.cycle.transitions.wipe=function($cont,$slides,opts){var w=$cont.css("overflow","hidden").width();var h=$cont.height();opts.cssBefore=opts.cssBefore||{};var clip;if(opts.clip){if(/l2r/.test(opts.clip)){clip="rect(0px 0px "+h+"px 0px)";}else{if(/r2l/.test(opts.clip)){clip="rect(0px "+w+"px "+h+"px "+w+"px)";}else{if(/t2b/.test(opts.clip)){clip="rect(0px "+w+"px 0px 0px)";}else{if(/b2t/.test(opts.clip)){clip="rect("+h+"px "+w+"px "+h+"px 0px)";}else{if(/zoom/.test(opts.clip)){var top=parseInt(h/2,10);var left=parseInt(w/2,10);clip="rect("+top+"px "+left+"px "+top+"px "+left+"px)";}}}}}}opts.cssBefore.clip=opts.cssBefore.clip||clip||"rect(0px 0px 0px 0px)";var d=opts.cssBefore.clip.match(/(\d+)/g);var t=parseInt(d[0],10),r=parseInt(d[1],10),b=parseInt(d[2],10),l=parseInt(d[3],10);opts.before.push(function(curr,next,opts){if(curr==next){return;}var $curr=$(curr),$next=$(next);$.fn.cycle.commonReset(curr,next,opts,true,true,false);opts.cssAfter.display="block";var step=1,count=parseInt((opts.speedIn/13),10)-1;(function f(){var tt=t?t-parseInt(step*(t/count),10):0;var ll=l?l-parseInt(step*(l/count),10):0;var bb=b<h?b+parseInt(step*((h-b)/count||1),10):h;var rr=r<w?r+parseInt(step*((w-r)/count||1),10):w;$next.css({clip:"rect("+tt+"px "+rr+"px "+bb+"px "+ll+"px)"});(step++<=count)?setTimeout(f,13):$curr.css("display","none");})();});$.extend(opts.cssBefore,{display:"block",opacity:1,top:0,left:0});opts.animIn={left:0};opts.animOut={left:0};};})(jQuery);;
/*
    json2.js
    2015-02-25

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 
                        ? '0' + n 
                        : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint 
    eval, for, this 
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 
        ? '0' + n 
        : n;
    }
    
    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
            ? this.getUTCFullYear() + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate()) + 'T' +
                    f(this.getUTCHours()) + ':' +
                    f(this.getUTCMinutes()) + ':' +
                    f(this.getUTCSeconds()) + 'Z'
            : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var cx,
        escapable,
        gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) 
        ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
            ? c
            : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' 
        : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) 
            ? String(value) 
            : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                ? '[]'
                : gap
                ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap 
                                ? ': ' 
                                : ':'
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap 
                                ? ': ' 
                                : ':'
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
            ? '{}'
            : gap
            ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
            : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (
                /^[\],:{}\s]*$/.test(
                    text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, '')
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                ? walk({'': j}, '')
                : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
;

/**
 *  @file
 *  A simple jQuery Cycle Div Slideshow Rotator.
 */

/**
 * This will set our initial behavior, by starting up each individual slideshow.
 */
(function ($) {
  Drupal.behaviors.viewsSlideshowCycle = {
    attach: function (context) {
      $('.views_slideshow_cycle_main:not(.viewsSlideshowCycle-processed)', context).addClass('viewsSlideshowCycle-processed').each(function() {
        var fullId = '#' + $(this).attr('id');
        var settings = Drupal.settings.viewsSlideshowCycle[fullId];
        settings.targetId = '#' + $(fullId + " :first").attr('id');

        settings.slideshowId = settings.targetId.replace('#views_slideshow_cycle_teaser_section_', '');
        // Pager after function.
        var pager_after_fn = function(curr, next, opts) {
          // Need to do some special handling on first load.
          var slideNum = opts.currSlide;
          if (typeof settings.processedAfter == 'undefined' || !settings.processedAfter) {
            settings.processedAfter = 1;
            slideNum = (typeof settings.opts.startingSlide == 'undefined') ? 0 : settings.opts.startingSlide;
          }
          Drupal.viewsSlideshow.action({ "action": 'transitionEnd', "slideshowID": settings.slideshowId, "slideNum": slideNum });
        }
        // Pager before function.
        var pager_before_fn = function(curr, next, opts) {
          var slideNum = opts.nextSlide;

          // Remember last slide.
          if (settings.remember_slide) {
            createCookie(settings.vss_id, slideNum, settings.remember_slide_days);
          }

          // Make variable height.
          if (!settings.fixed_height) {
            //get the height of the current slide
            var $ht = $(next).height();
            //set the container's height to that of the current slide
            $(next).parent().animate({height: $ht});
          }

          // Need to do some special handling on first load.
          if (typeof settings.processedBefore == 'undefined' || !settings.processedBefore) {
            settings.processedBefore = 1;
            slideNum = (typeof opts.startingSlide == 'undefined') ? 0 : opts.startingSlide;
          }

          Drupal.viewsSlideshow.action({ "action": 'transitionBegin', "slideshowID": settings.slideshowId, "slideNum": slideNum });
        }
        settings.loaded = false;

        settings.opts = {
          speed:settings.speed,
          timeout:settings.timeout,
          delay:settings.delay,
          sync:settings.sync,
          random:settings.random,
          nowrap:settings.nowrap,
          after:pager_after_fn,
          before:pager_before_fn,
          cleartype:(settings.cleartype)? true : false,
          cleartypeNoBg:(settings.cleartypenobg)? true : false
        }

        // Set the starting slide if we are supposed to remember the slide
        if (settings.remember_slide) {
          var startSlide = readCookie(settings.vss_id);
          if (startSlide == null) {
            startSlide = 0;
          }
          settings.opts.startingSlide = parseInt(startSlide);
        }

        if (settings.effect == 'none') {
          settings.opts.speed = 1;
        }
        else {
          settings.opts.fx = settings.effect;
        }

        // Take starting item from fragment.
        var hash = location.hash;
        if (hash) {
          var hash = hash.replace('#', '');
          var aHash = hash.split(';');
          var aHashLen = aHash.length;

          // Loop through all the possible starting points.
          for (var i = 0; i < aHashLen; i++) {
            // Split the hash into two parts. One part is the slideshow id the
            // other is the slide number.
            var initialInfo = aHash[i].split(':');
            // The id in the hash should match our slideshow.
            // The slide number chosen shouldn't be larger than the number of
            // slides we have.
            if (settings.slideshowId == initialInfo[0] && settings.num_divs > initialInfo[1]) {
              settings.opts.startingSlide = parseInt(initialInfo[1]);
            }
          }
        }

        // Pause on hover.
        if (settings.pause) {
          var mouseIn = function() {
            Drupal.viewsSlideshow.action({ "action": 'pause', "slideshowID": settings.slideshowId });
          }

          var mouseOut = function() {
            Drupal.viewsSlideshow.action({ "action": 'play', "slideshowID": settings.slideshowId });
          }

          if (jQuery.fn.hoverIntent) {
            $('#views_slideshow_cycle_teaser_section_' + settings.vss_id).hoverIntent(mouseIn, mouseOut);
          }
          else {
            $('#views_slideshow_cycle_teaser_section_' + settings.vss_id).hover(mouseIn, mouseOut);
          }
        }

        // Pause on clicking of the slide.
        if (settings.pause_on_click) {
          $('#views_slideshow_cycle_teaser_section_' + settings.vss_id).click(function() {
            Drupal.viewsSlideshow.action({ "action": 'pause', "slideshowID": settings.slideshowId, "force": true });
          });
        }

        if (typeof JSON != 'undefined') {
          var advancedOptions = JSON.parse(settings.advanced_options);
          for (var option in advancedOptions) {
            switch(option) {

              // Standard Options
              case "activePagerClass":
              case "allowPagerClickBubble":
              case "autostop":
              case "autostopCount":
              case "backwards":
              case "bounce":
              case "cleartype":
              case "cleartypeNoBg":
              case "containerResize":
              case "continuous":
              case "delay":
              case "easeIn":
              case "easeOut":
              case "easing":
              case "fastOnEvent":
              case "fit":
              case "fx":
              case "height":
              case "manualTrump":
              case "metaAttr":
              case "next":
              case "nowrap":
              case "pager":
              case "pagerEvent":
              case "pause":
              case "pauseOnPagerHover":
              case "prev":
              case "prevNextEvent":
              case "random":
              case "randomizeEffects":
              case "requeueOnImageNotLoaded":
              case "requeueTimeout":
              case "rev":
              case "slideExpr":
              case "slideResize":
              case "speed":
              case "speedIn":
              case "speedOut":
              case "startingSlide":
              case "sync":
              case "timeout":
              case "width":
                var optionValue = advancedOptions[option];
                optionValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(optionValue);
                settings.opts[option] = optionValue;
                break;

              // These process options that look like {top:50, bottom:20}
              case "animIn":
              case "animOut":
              case "cssBefore":
              case "cssAfter":
              case "shuffle":
                var cssValue = advancedOptions[option];
                cssValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(cssValue);
                settings.opts[option] = eval('(' + cssValue + ')');
                break;

              // These options have their own functions.
              case "after":
                var afterValue = advancedOptions[option];
                afterValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(afterValue);
                // transition callback (scope set to element that was shown): function(currSlideElement, nextSlideElement, options, forwardFlag)
                settings.opts[option] = function(currSlideElement, nextSlideElement, options, forwardFlag) {
                  pager_after_fn(currSlideElement, nextSlideElement, options);
                  eval(afterValue);
                }
                break;

              case "before":
                var beforeValue = advancedOptions[option];
                beforeValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(beforeValue);
                // transition callback (scope set to element to be shown):     function(currSlideElement, nextSlideElement, options, forwardFlag)
                settings.opts[option] = function(currSlideElement, nextSlideElement, options, forwardFlag) {
                  pager_before_fn(currSlideElement, nextSlideElement, options);
                  eval(beforeValue);
                }
                break;

              case "end":
                var endValue = advancedOptions[option];
                endValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(endValue);
                // callback invoked when the slideshow terminates (use with autostop or nowrap options): function(options)
                settings.opts[option] = function(options) {
                  eval(endValue);
                }
                break;

              case "fxFn":
                var fxFnValue = advancedOptions[option];
                fxFnValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(fxFnValue);
                // function used to control the transition: function(currSlideElement, nextSlideElement, options, afterCalback, forwardFlag)
                settings.opts[option] = function(currSlideElement, nextSlideElement, options, afterCalback, forwardFlag) {
                  eval(fxFnValue);
                }
                break;

              case "onPagerEvent":
                var onPagerEventValue = advancedOptions[option];
                onPagerEventValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(onPagerEventValue);
                settings.opts[option] = function(zeroBasedSlideIndex, slideElement) {
                  eval(onPagerEventValue);
                }
                break;

              case "onPrevNextEvent":
                var onPrevNextEventValue = advancedOptions[option];
                onPrevNextEventValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(onPrevNextEventValue);
                settings.opts[option] = function(isNext, zeroBasedSlideIndex, slideElement) {
                  eval(onPrevNextEventValue);
                }
                break;

              case "pagerAnchorBuilder":
                var pagerAnchorBuilderValue = advancedOptions[option];
                pagerAnchorBuilderValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(pagerAnchorBuilderValue);
                // callback fn for building anchor links:  function(index, DOMelement)
                settings.opts[option] = function(index, DOMelement) {
                  var returnVal = '';
                  eval(pagerAnchorBuilderValue);
                  return returnVal;
                }
                break;

              case "pagerClick":
                var pagerClickValue = advancedOptions[option];
                pagerClickValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(pagerClickValue);
                // callback fn for pager clicks:    function(zeroBasedSlideIndex, slideElement)
                settings.opts[option] = function(zeroBasedSlideIndex, slideElement) {
                  eval(pagerClickValue);
                }
                break;

              case "paused":
                var pausedValue = advancedOptions[option];
                pausedValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(pausedValue);
                // undocumented callback when slideshow is paused:    function(cont, opts, byHover)
                settings.opts[option] = function(cont, opts, byHover) {
                  eval(pausedValue);
                }
                break;

              case "resumed":
                var resumedValue = advancedOptions[option];
                resumedValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(resumedValue);
                // undocumented callback when slideshow is resumed:    function(cont, opts, byHover)
                settings.opts[option] = function(cont, opts, byHover) {
                  eval(resumedValue);
                }
                break;

              case "timeoutFn":
                var timeoutFnValue = advancedOptions[option];
                timeoutFnValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(timeoutFnValue);
                settings.opts[option] = function(currSlideElement, nextSlideElement, options, forwardFlag) {
                  eval(timeoutFnValue);
                }
                break;

              case "updateActivePagerLink":
                var updateActivePagerLinkValue = advancedOptions[option];
                updateActivePagerLinkValue = Drupal.viewsSlideshowCycle.advancedOptionCleanup(updateActivePagerLinkValue);
                // callback fn invoked to update the active pager link (adds/removes activePagerClass style)
                settings.opts[option] = function(pager, currSlideIndex) {
                  eval(updateActivePagerLinkValue);
                }
                break;
            }
          }
        }

        // If selected wait for the images to be loaded.
        // otherwise just load the slideshow.
        if (settings.wait_for_image_load) {
          // For IE/Chrome/Opera we if there are images then we need to make
          // sure the images are loaded before starting the slideshow.
          settings.totalImages = $(settings.targetId + ' img').length;
          if (settings.totalImages) {
            settings.loadedImages = 0;

            // Add a load event for each image.
            $(settings.targetId + ' img').each(function() {
              var $imageElement = $(this);
              $imageElement.bind('load', function () {
                Drupal.viewsSlideshowCycle.imageWait(fullId);
              });

              // Removing the source and adding it again will fire the load event.
              var imgSrc = $imageElement.attr('src');
              $imageElement.attr('src', '');
              $imageElement.attr('src', imgSrc);
            });

            // We need to set a timeout so that the slideshow doesn't wait
            // indefinitely for all images to load.
            setTimeout("Drupal.viewsSlideshowCycle.load('" + fullId + "')", settings.wait_for_image_load_timeout);
          }
          else {
            Drupal.viewsSlideshowCycle.load(fullId);
          }
        }
        else {
          Drupal.viewsSlideshowCycle.load(fullId);
        }
      });
    }
  };

  Drupal.viewsSlideshowCycle = Drupal.viewsSlideshowCycle || {};

  // Cleanup the values of advanced options.
  Drupal.viewsSlideshowCycle.advancedOptionCleanup = function(value) {
    value = $.trim(value);
    value = value.replace(/\n/g, '');
    if (!isNaN(parseInt(value))) {
      value = parseInt(value);
    }
    else if (value.toLowerCase() == 'true') {
      value = true;
    }
    else if (value.toLowerCase() == 'false') {
      value = false;
    }

    return value;
  }

  // This checks to see if all the images have been loaded.
  // If they have then it starts the slideshow.
  Drupal.viewsSlideshowCycle.imageWait = function(fullId) {
    if (++Drupal.settings.viewsSlideshowCycle[fullId].loadedImages == Drupal.settings.viewsSlideshowCycle[fullId].totalImages) {
      Drupal.viewsSlideshowCycle.load(fullId);
    }
  };

  // Start the slideshow.
  Drupal.viewsSlideshowCycle.load = function (fullId) {
    var settings = Drupal.settings.viewsSlideshowCycle[fullId];

    // Make sure the slideshow isn't already loaded.
    if (!settings.loaded) {
      $(settings.targetId).cycle(settings.opts);
      settings.loaded = true;

      // Start Paused
      if (settings.start_paused) {
        Drupal.viewsSlideshow.action({ "action": 'pause', "slideshowID": settings.slideshowId, "force": true });
      }

      // Pause if hidden.
      if (settings.pause_when_hidden) {
        var checkPause = function(settings) {
          // If the slideshow is visible and it is paused then resume.
          // otherwise if the slideshow is not visible and it is not paused then
          // pause it.
          var visible = viewsSlideshowCycleIsVisible(settings.targetId, settings.pause_when_hidden_type, settings.amount_allowed_visible);
          if (visible) {
            Drupal.viewsSlideshow.action({ "action": 'play', "slideshowID": settings.slideshowId });
          }
          else {
            Drupal.viewsSlideshow.action({ "action": 'pause', "slideshowID": settings.slideshowId });
          }
        }

        // Check when scrolled.
        $(window).scroll(function() {
         checkPause(settings);
        });

        // Check when the window is resized.
        $(window).resize(function() {
          checkPause(settings);
        });
      }
    }
  };

  Drupal.viewsSlideshowCycle.pause = function (options) {
    //Eat TypeError, cycle doesn't handle pause well if options isn't defined.
    try{
      if (options.pause_in_middle && $.fn.pause) {
        $('#views_slideshow_cycle_teaser_section_' + options.slideshowID).pause();
      }
      else {
        $('#views_slideshow_cycle_teaser_section_' + options.slideshowID).cycle('pause');
      }
    }
    catch(e){
      if(!e instanceof TypeError){
        throw e;
      }
    }
  };

  Drupal.viewsSlideshowCycle.play = function (options) {
    Drupal.settings.viewsSlideshowCycle['#views_slideshow_cycle_main_' + options.slideshowID].paused = false;
    if (options.pause_in_middle && $.fn.resume) {
      $('#views_slideshow_cycle_teaser_section_' + options.slideshowID).resume();
    }
    else {
      $('#views_slideshow_cycle_teaser_section_' + options.slideshowID).cycle('resume');
    }
  };

  Drupal.viewsSlideshowCycle.previousSlide = function (options) {
    $('#views_slideshow_cycle_teaser_section_' + options.slideshowID).cycle('prev');
  };

  Drupal.viewsSlideshowCycle.nextSlide = function (options) {
    $('#views_slideshow_cycle_teaser_section_' + options.slideshowID).cycle('next');
  };

  Drupal.viewsSlideshowCycle.goToSlide = function (options) {
    $('#views_slideshow_cycle_teaser_section_' + options.slideshowID).cycle(options.slideNum);
  };

  // Verify that the value is a number.
  function IsNumeric(sText) {
    var ValidChars = "0123456789";
    var IsNumber=true;
    var Char;

    for (var i=0; i < sText.length && IsNumber == true; i++) {
      Char = sText.charAt(i);
      if (ValidChars.indexOf(Char) == -1) {
        IsNumber = false;
      }
    }
    return IsNumber;
  }

  /**
   * Cookie Handling Functions
   */
  function createCookie(name,value,days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      var expires = "; expires="+date.toGMTString();
    }
    else {
      var expires = "";
    }
    document.cookie = name+"="+value+expires+"; path=/";
  }

  function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) {
        return c.substring(nameEQ.length,c.length);
      }
    }
    return null;
  }

  function eraseCookie(name) {
    createCookie(name,"",-1);
  }

  /**
   * Checks to see if the slide is visible enough.
   * elem = element to check.
   * type = The way to calculate how much is visible.
   * amountVisible = amount that should be visible. Either in percent or px. If
   *                it's not defined then all of the slide must be visible.
   *
   * Returns true or false
   */
  function viewsSlideshowCycleIsVisible(elem, type, amountVisible) {
    // Get the top and bottom of the window;
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var docViewLeft = $(window).scrollLeft();
    var docViewRight = docViewLeft + $(window).width();

    // Get the top, bottom, and height of the slide;
    var elemTop = $(elem).offset().top;
    var elemHeight = $(elem).height();
    var elemBottom = elemTop + elemHeight;
    var elemLeft = $(elem).offset().left;
    var elemWidth = $(elem).width();
    var elemRight = elemLeft + elemWidth;
    var elemArea = elemHeight * elemWidth;

    // Calculate what's hiding in the slide.
    var missingLeft = 0;
    var missingRight = 0;
    var missingTop = 0;
    var missingBottom = 0;

    // Find out how much of the slide is missing from the left.
    if (elemLeft < docViewLeft) {
      missingLeft = docViewLeft - elemLeft;
    }

    // Find out how much of the slide is missing from the right.
    if (elemRight > docViewRight) {
      missingRight = elemRight - docViewRight;
    }

    // Find out how much of the slide is missing from the top.
    if (elemTop < docViewTop) {
      missingTop = docViewTop - elemTop;
    }

    // Find out how much of the slide is missing from the bottom.
    if (elemBottom > docViewBottom) {
      missingBottom = elemBottom - docViewBottom;
    }

    // If there is no amountVisible defined then check to see if the whole slide
    // is visible.
    if (type == 'full') {
      return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
      && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop)
      && (elemLeft >= docViewLeft) && (elemRight <= docViewRight)
      && (elemLeft <= docViewRight) && (elemRight >= docViewLeft));
    }
    else if(type == 'vertical') {
      var verticalShowing = elemHeight - missingTop - missingBottom;

      // If user specified a percentage then find out if the current shown percent
      // is larger than the allowed percent.
      // Otherwise check to see if the amount of px shown is larger than the
      // allotted amount.
      if (amountVisible.indexOf('%')) {
        return (((verticalShowing/elemHeight)*100) >= parseInt(amountVisible));
      }
      else {
        return (verticalShowing >= parseInt(amountVisible));
      }
    }
    else if(type == 'horizontal') {
      var horizontalShowing = elemWidth - missingLeft - missingRight;

      // If user specified a percentage then find out if the current shown percent
      // is larger than the allowed percent.
      // Otherwise check to see if the amount of px shown is larger than the
      // allotted amount.
      if (amountVisible.indexOf('%')) {
        return (((horizontalShowing/elemWidth)*100) >= parseInt(amountVisible));
      }
      else {
        return (horizontalShowing >= parseInt(amountVisible));
      }
    }
    else if(type == 'area') {
      var areaShowing = (elemWidth - missingLeft - missingRight) * (elemHeight - missingTop - missingBottom);

      // If user specified a percentage then find out if the current shown percent
      // is larger than the allowed percent.
      // Otherwise check to see if the amount of px shown is larger than the
      // allotted amount.
      if (amountVisible.indexOf('%')) {
        return (((areaShowing/elemArea)*100) >= parseInt(amountVisible));
      }
      else {
        return (areaShowing >= parseInt(amountVisible));
      }
    }
  }
})(jQuery);
;
/**
 * @file
 * Integrate Sidr library with Responsive Menus.
 */
(function ($) {
  /**
   * Preparation for each element Sidr will affect.
   */
  function sidr_it(menuElement, ind, iteration, $windowWidth) {
    // Only apply if window size is correct.
    var $media_size = iteration.media_size || 768;
    // Call Sidr with our settings.
    $(menuElement).once('responsive-menus-sidr', function() {
      var $id = 'sidr-' + ind;
      var $wrapper_id = 'sidr-wrapper-' + ind;
      $(this).before('<div id="' + $wrapper_id + '"><a id="' + $id + '-button" href="#' + $id + '">' + iteration.trigger_txt + '</a></div>');
      $('#' + $wrapper_id).hide();
      if ($windowWidth <= $media_size) {
        $('#' + $wrapper_id).show();
        $(this).hide();
      }
      // Set 1/0 to true/false respectively.
      $.each(iteration, function(key, value) {
        if (value == 0) {
          iteration[key] = false;
        }
        if (value == 1) {
          iteration[key] = true;
        }
      });
      // Sidr power go.
      $('#' + $id + '-button').sidr({
        name: $id || "sidr",
        speed: iteration.speed || 200,
        side: iteration.side || "left",
        source: iteration.selectors[ind] || "#main-menu",
        displace: iteration.displace,
        onOpen: function() { eval(iteration.onOpen); } || function() {},
        onClose: function() { eval(iteration.onClose); } || function() {}
      });
    });
  }


  /**
   * Main loop.
   */
  Drupal.behaviors.responsive_menus_sidr = {
    attach: function (context, settings) {
      settings.responsive_menus = settings.responsive_menus || {};
      var $windowWidth = document.documentElement.clientWidth || document.body.clientWidth;
      $.each(settings.responsive_menus, function(ind, iteration) {
        if (iteration.responsive_menus_style != 'sidr') {
          return true;
        }
        if (!iteration.selectors.length) {
          return;
        }
        // Iterate each selector.
        $.each(iteration.selectors, function(index, value) {
          // Stop if there is no menu element.
          if ($(value).length < 1) {
            return true;
          }
          // Multi-level (selector hits multiple ul's).
          if ($(value).length > 1) {
              $(value).each(function(val_index) {
                if (!$(this).parents('ul').length) {
                  sidr_it(this, index, iteration, $windowWidth);
                }
              });
            }
            else {
              // Single level.
              sidr_it(value, index, iteration, $windowWidth);
            }
        });
      });

      // Handle window resizing.
      $(window).resize(function() {
        // Window width with legacy browsers.
        $windowWidth = document.documentElement.clientWidth || document.body.clientWidth;
        $.each(settings.responsive_menus, function(ind, iteration) {
          if (iteration.responsive_menus_style != 'sidr') {
            return true;
          }
          if (!iteration.selectors.length) {
            return;
          }
          // Iterate each selector.
          $.each(iteration.selectors, function(index, value) {
            // Stop if there is no menu element.
            if ($(value).length < 1) {
              return true;
            }
            var $wrapper_id = 'sidr-wrapper-' + index;
            $media_size = iteration.media_size || 768;
            if ($windowWidth <= $media_size) {
              if (!$(value).hasClass('sidr-hidden')) {
                $('#' + $wrapper_id).show();
                $(value).hide().addClass('sidr-hidden');
              }
            }
            else {
              if ($(value).hasClass('sidr-hidden')) {
                $('#' + $wrapper_id).hide();
                $(value).show().removeClass('sidr-hidden');
              }
            }
          });
        });
      });
    }
  };
}(jQuery));
;
/*! Sidr - v1.2.1 - 2013-11-06
 * https://github.com/artberri/sidr
 * Copyright (c) 2013 Alberto Varela; Licensed MIT */
(function(e){var t=!1,i=!1,n={isUrl:function(e){var t=RegExp("^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$","i");return t.test(e)?!0:!1},loadContent:function(e,t){e.html(t)},addPrefix:function(e){var t=e.attr("id"),i=e.attr("class");"string"==typeof t&&""!==t&&e.attr("id",t.replace(/([A-Za-z0-9_.\-]+)/g,"sidr-id-$1")),"string"==typeof i&&""!==i&&"sidr-inner"!==i&&e.attr("class",i.replace(/([A-Za-z0-9_.\-]+)/g,"sidr-class-$1")),e.removeAttr("style")},execute:function(n,s,a){"function"==typeof s?(a=s,s="sidr"):s||(s="sidr");var r,d,l,c=e("#"+s),u=e(c.data("body")),f=e("html"),p=c.outerWidth(!0),g=c.data("speed"),h=c.data("side"),m=c.data("displace"),v=c.data("onOpen"),y=c.data("onClose"),x="sidr"===s?"sidr-open":"sidr-open "+s+"-open";if("open"===n||"toggle"===n&&!c.is(":visible")){if(c.is(":visible")||t)return;if(i!==!1)return o.close(i,function(){o.open(s)}),void 0;t=!0,"left"===h?(r={left:p+"px"},d={left:"0px"}):(r={right:p+"px"},d={right:"0px"}),u.is("body")&&(l=f.scrollTop(),f.css("overflow-x","hidden").scrollTop(l)),m?u.addClass("sidr-animating").css({width:u.width(),position:"absolute"}).animate(r,g,function(){e(this).addClass(x)}):setTimeout(function(){e(this).addClass(x)},g),c.css("display","block").animate(d,g,function(){t=!1,i=s,"function"==typeof a&&a(s),u.removeClass("sidr-animating")}),v()}else{if(!c.is(":visible")||t)return;t=!0,"left"===h?(r={left:0},d={left:"-"+p+"px"}):(r={right:0},d={right:"-"+p+"px"}),u.is("body")&&(l=f.scrollTop(),f.removeAttr("style").scrollTop(l)),u.addClass("sidr-animating").animate(r,g).removeClass(x),c.animate(d,g,function(){c.removeAttr("style").hide(),u.removeAttr("style"),e("html").removeAttr("style"),t=!1,i=!1,"function"==typeof a&&a(s),u.removeClass("sidr-animating")}),y()}}},o={open:function(e,t){n.execute("open",e,t)},close:function(e,t){n.execute("close",e,t)},toggle:function(e,t){n.execute("toggle",e,t)},toogle:function(e,t){n.execute("toggle",e,t)}};e.sidr=function(t){return o[t]?o[t].apply(this,Array.prototype.slice.call(arguments,1)):"function"!=typeof t&&"string"!=typeof t&&t?(e.error("Method "+t+" does not exist on jQuery.sidr"),void 0):o.toggle.apply(this,arguments)},e.fn.sidr=function(t){var i=e.extend({name:"sidr",speed:200,side:"left",source:null,renaming:!0,body:"body",displace:!0,onOpen:function(){},onClose:function(){}},t),s=i.name,a=e("#"+s);if(0===a.length&&(a=e("<div />").attr("id",s).appendTo(e("body"))),a.addClass("sidr").addClass(i.side).data({speed:i.speed,side:i.side,body:i.body,displace:i.displace,onOpen:i.onOpen,onClose:i.onClose}),"function"==typeof i.source){var r=i.source(s);n.loadContent(a,r)}else if("string"==typeof i.source&&n.isUrl(i.source))e.get(i.source,function(e){n.loadContent(a,e)});else if("string"==typeof i.source){var d="",l=i.source.split(",");if(e.each(l,function(t,i){d+='<div class="sidr-inner">'+e(i).html()+"</div>"}),i.renaming){var c=e("<div />").html(d);c.find("*").each(function(t,i){var o=e(i);n.addPrefix(o)}),d=c.html()}n.loadContent(a,d)}else null!==i.source&&e.error("Invalid Sidr Source");return this.each(function(){var t=e(this),i=t.data("sidr");i||(t.data("sidr",s),"ontouchstart"in document.documentElement?(t.bind("touchstart",function(e){e.originalEvent.touches[0],this.touched=e.timeStamp}),t.bind("touchend",function(e){var t=Math.abs(e.timeStamp-this.touched);200>t&&(e.preventDefault(),o.toggle(s))})):t.click(function(e){e.preventDefault(),o.toggle(s)}))})}})(jQuery);;
/**
 * @file
 * Integrate GoogleNexus (codrops) library with Responsive Menus module.
 */

(function ($) {
  Drupal.behaviors.responsive_menus_google_nexus = {
    attach: function (context, settings) {
      settings.responsive_menus = settings.responsive_menus || {};
      $.each(settings.responsive_menus, function(ind, iteration) {
        if (iteration.responsive_menus_style != 'google_nexus') {
          return true;
        }
        if (!iteration.selectors.length) {
          return;
        }
        // Main loop.
        $(iteration.selectors).once('responsive-menus-google-nexus', function() {
          $(this).attr('class', 'gn-menu responsive-menus-google-nexus-processed').removeAttr('id');
          if (iteration.use_ecoicons == '1') {
            $(this).addClass('ecoicons');
          }
          // Add icons in front of menu items.
          $(this).find('a').each(function(a_ind) {
            if (iteration.icons[a_ind]) {
              // Un-escape unicode or html entities.
              var $icon = $('<div />').html(JSON.parse('"' + iteration.icons[a_ind] + '"')).text();
              $(this).attr('data-content', $icon);
            }
            else {
              $icon = $('<div />').html(JSON.parse('"' + iteration.icon_fallback + '"')).text();
              $(this).attr('data-content', $icon);
            }
          });
          // Add other required classes.
          $(this).find('ul').attr('class', 'gn-submenu');
          $(this).find('li').removeAttr('class');

          $(this).before('<div class="gn-menu-container"></div>');
          // Wrap with the structure Google Nexus Menu needs.
          $('.gn-menu-container').append('<ul id="gn-menu" class="gn-menu-main" style="z-index: 99;">'
           + '<li class="gn-trigger">'
           + '<a class="gn-icon gn-icon-menu"><span>Menu</span></a>'
           + '<nav class="gn-menu-wrapper">'
           + '<div class="gn-scroller">'
           + $(this)[0].outerHTML
           + '</div>'
           + '</nav>'
           + '</li>'
           + '<li></li>'
           + '</ul>');

          $(this).remove();
          // Create the menu.
          new gnMenu(document.getElementById('gn-menu'));

        });
      });
    }
  };
}(jQuery));
;
/**
 * gnmenu.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
;( function( window ) {
	
	'use strict';

	// http://stackoverflow.com/a/11381730/989439
	function mobilecheck() {
		var check = false;
		(function(a){if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	}

	function gnMenu( el, options ) {	
		this.el = el;
		this._init();
	}

	gnMenu.prototype = {
		_init : function() {
			this.trigger = this.el.querySelector( 'a.gn-icon-menu' );
			this.menu = this.el.querySelector( 'nav.gn-menu-wrapper' );
			this.isMenuOpen = false;
			this.eventtype = mobilecheck() ? 'touchstart' : 'click';
			this._initEvents();

			var self = this;
			this.bodyClickFn = function() {
				self._closeMenu();
				this.removeEventListener( self.eventtype, self.bodyClickFn );
			};
		},
		_initEvents : function() {
			var self = this;

			if( !mobilecheck() ) {
				this.trigger.addEventListener( 'mouseover', function(ev) { self._openIconMenu(); } );
				this.trigger.addEventListener( 'mouseout', function(ev) { self._closeIconMenu(); } );
			
				this.menu.addEventListener( 'mouseover', function(ev) {
					self._openMenu(); 
					document.addEventListener( self.eventtype, self.bodyClickFn ); 
				} );
			}
			this.trigger.addEventListener( this.eventtype, function( ev ) {
				ev.stopPropagation();
				ev.preventDefault();
				if( self.isMenuOpen ) {
					self._closeMenu();
					document.removeEventListener( self.eventtype, self.bodyClickFn );
				}
				else {
					self._openMenu();
					document.addEventListener( self.eventtype, self.bodyClickFn );
				}
			} );
			this.menu.addEventListener( this.eventtype, function(ev) { ev.stopPropagation(); } );
		},
		_openIconMenu : function() {
			classie.add( this.menu, 'gn-open-part' );
		},
		_closeIconMenu : function() {
			classie.remove( this.menu, 'gn-open-part' );
		},
		_openMenu : function() {
			if( this.isMenuOpen ) return;
			classie.add( this.trigger, 'gn-selected' );
			this.isMenuOpen = true;
			classie.add( this.menu, 'gn-open-all' );
			this._closeIconMenu();
		},
		_closeMenu : function() {
			if( !this.isMenuOpen ) return;
			classie.remove( this.trigger, 'gn-selected' );
			this.isMenuOpen = false;
			classie.remove( this.menu, 'gn-open-all' );
			this._closeIconMenu();
		}
	}

	// add to global namespace
	window.gnMenu = gnMenu;

} )( window );;
/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );
;
(function ($) {

Drupal.googleanalytics = {};

$(document).ready(function() {

  // Attach mousedown, keyup, touchstart events to document only and catch
  // clicks on all elements.
  $(document.body).bind("mousedown keyup touchstart", function(event) {

    // Catch the closest surrounding link of a clicked element.
    $(event.target).closest("a,area").each(function() {

      // Is the clicked URL internal?
      if (Drupal.googleanalytics.isInternal(this.href)) {
        // Skip 'click' tracking, if custom tracking events are bound.
        if ($(this).is('.colorbox')) {
          // Do nothing here. The custom event will handle all tracking.
          //console.info("Click on .colorbox item has been detected.");
        }
        // Is download tracking activated and the file extension configured for download tracking?
        else if (Drupal.settings.googleanalytics.trackDownload && Drupal.googleanalytics.isDownload(this.href)) {
          // Download link clicked.
          ga("send", "event", "Downloads", Drupal.googleanalytics.getDownloadExtension(this.href).toUpperCase(), Drupal.googleanalytics.getPageUrl(this.href));
        }
        else if (Drupal.googleanalytics.isInternalSpecial(this.href)) {
          // Keep the internal URL for Google Analytics website overlay intact.
          ga("send", "pageview", { "page": Drupal.googleanalytics.getPageUrl(this.href) });
        }
      }
      else {
        if (Drupal.settings.googleanalytics.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']")) {
          // Mailto link clicked.
          ga("send", "event", "Mails", "Click", this.href.substring(7));
        }
        else if (Drupal.settings.googleanalytics.trackOutbound && this.href.match(/^\w+:\/\//i)) {
          if (Drupal.settings.googleanalytics.trackDomainMode != 2 || (Drupal.settings.googleanalytics.trackDomainMode == 2 && !Drupal.googleanalytics.isCrossDomain(this.hostname, Drupal.settings.googleanalytics.trackCrossDomains))) {
            // External link clicked / No top-level cross domain clicked.
            ga("send", "event", "Outbound links", "Click", this.href);
          }
        }
      }
    });
  });

  // Track hash changes as unique pageviews, if this option has been enabled.
  if (Drupal.settings.googleanalytics.trackUrlFragments) {
    window.onhashchange = function() {
      ga('send', 'pageview', location.pathname + location.search + location.hash);
    }
  }

  // Colorbox: This event triggers when the transition has completed and the
  // newly loaded content has been revealed.
  $(document).bind("cbox_complete", function () {
    var href = $.colorbox.element().attr("href");
    if (href) {
      ga("send", "pageview", { "page": Drupal.googleanalytics.getPageUrl(href) });
    }
  });

});

/**
 * Check whether the hostname is part of the cross domains or not.
 *
 * @param string hostname
 *   The hostname of the clicked URL.
 * @param array crossDomains
 *   All cross domain hostnames as JS array.
 *
 * @return boolean
 */
Drupal.googleanalytics.isCrossDomain = function (hostname, crossDomains) {
  /**
   * jQuery < 1.6.3 bug: $.inArray crushes IE6 and Chrome if second argument is
   * `null` or `undefined`, http://bugs.jquery.com/ticket/10076,
   * https://github.com/jquery/jquery/commit/a839af034db2bd934e4d4fa6758a3fed8de74174
   *
   * @todo: Remove/Refactor in D8
   */
  if (!crossDomains) {
    return false;
  }
  else {
    return $.inArray(hostname, crossDomains) > -1 ? true : false;
  }
};

/**
 * Check whether this is a download URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isDownload = function (url) {
  var isDownload = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  return isDownload.test(url);
};

/**
 * Check whether this is an absolute internal URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternal = function (url) {
  var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return isInternal.test(url);
};

/**
 * Check whether this is a special URL or not.
 *
 * URL types:
 *  - gotwo.module /go/* links.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternalSpecial = function (url) {
  var isInternalSpecial = new RegExp("(\/go\/.*)$", "i");
  return isInternalSpecial.test(url);
};

/**
 * Extract the relative internal URL from an absolute internal URL.
 *
 * Examples:
 * - http://mydomain.com/node/1 -> /node/1
 * - http://example.com/foo/bar -> http://example.com/foo/bar
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   Internal website URL
 */
Drupal.googleanalytics.getPageUrl = function (url) {
  var extractInternalUrl = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return url.replace(extractInternalUrl, '');
};

/**
 * Extract the download file extension from the URL.
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   The file extension of the passed url. e.g. "zip", "txt"
 */
Drupal.googleanalytics.getDownloadExtension = function (url) {
  var extractDownloadextension = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  var extension = extractDownloadextension.exec(url);
  return (extension === null) ? '' : extension[1];
};

})(jQuery);
;
