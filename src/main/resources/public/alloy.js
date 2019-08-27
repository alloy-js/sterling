(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.alloy = {}));
}(this, function (exports) { 'use strict';

    var __values = (undefined && undefined.__values) || function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };
    var Signature = /** @class */ (function () {
        function Signature(label, isbuiltin, isone, issubset) {
            if (isbuiltin === void 0) { isbuiltin = false; }
            if (isone === void 0) { isone = false; }
            if (issubset === void 0) { issubset = false; }
            this._label = label;
            this._parent = null;
            this._builtin = isbuiltin;
            this._one = isone;
            this._subset = issubset;
            this._atoms = new Map();
            this._fields = new Map();
            this._signatures = new Map();
        }
        Signature.prototype.atoms = function () {
            return Array.from(this._atoms.values())
                .concat(Array.from(this._signatures.values())
                .reduce(function (acc, cur) { return acc.concat(cur.atoms()); }, []));
        };
        Signature.prototype.atom = function (label) {
            var e_1, _a;
            if (!this._subset) {
                if (this._atoms.has(label))
                    return this._atoms.get(label);
                try {
                    for (var _b = __values(this._signatures.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var subsig = _c.value;
                        var atom = subsig.atom(label);
                        if (atom)
                            return atom;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            else {
                return Array
                    .from(this._atoms.values())
                    .find(function (a) { return a.label() === label; });
            }
        };
        Signature.prototype.builtin = function () {
            return this._builtin;
        };
        Signature.prototype.label = function () {
            return this._label;
        };
        Signature.prototype.toString = function () {
            return this._label;
        };
        Signature.prototype.types = function () {
            var hierarchy = this._parent ? this._parent.types() : [];
            hierarchy.push(this);
            return hierarchy;
        };
        return Signature;
    }());

    var Atom = /** @class */ (function () {
        function Atom(signature, label) {
            this._label = label;
            this._signature = signature;
        }
        Atom.prototype.isType = function (signature) {
            return signature === this._signature ||
                this._signature.types().includes(this._signature);
        };
        Atom.prototype.label = function () {
            return this._label;
        };
        Atom.prototype.signature = function () {
            return this._signature;
        };
        Atom.prototype.toString = function () {
            return this._label;
        };
        return Atom;
    }());

    var Field = /** @class */ (function () {
        function Field(label, types) {
            this._label = label;
            this._parent = null;
            this._tuples = [];
            this._types = types;
        }
        Field.prototype.has = function () {
            var atoms = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                atoms[_i] = arguments[_i];
            }
            return !!this._tuples.find(function (t) {
                return t.atoms().every(function (a, i) { return atoms[i] === a; });
            });
        };
        Field.prototype.label = function () {
            return this._label;
        };
        Field.prototype.size = function () {
            return this._types.length;
        };
        Field.prototype.toString = function () {
            return (this._parent ? this._parent + '<:' : '') + this._label;
        };
        Field.prototype.tuples = function () {
            return this._tuples.slice();
        };
        Field.prototype.types = function () {
            return this._types.slice();
        };
        return Field;
    }());

    var Skolem = /** @class */ (function () {
        function Skolem(label, types) {
            this._label = label;
            this._tuples = [];
            this._types = types;
        }
        Skolem.prototype.has = function () {
            var atoms = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                atoms[_i] = arguments[_i];
            }
            return !!this._tuples.find(function (t) {
                return t.atoms().every(function (a, i) { return atoms[i] === a; });
            });
        };
        Skolem.prototype.label = function () {
            return this._label;
        };
        Skolem.prototype.size = function () {
            return this._types.length;
        };
        Skolem.prototype.toString = function () {
            return this._label;
        };
        Skolem.prototype.tuples = function () {
            return this._tuples.slice();
        };
        Skolem.prototype.types = function () {
            return this._types.slice();
        };
        return Skolem;
    }());

    var Tuple = /** @class */ (function () {
        function Tuple(atoms) {
            this._atoms = atoms;
        }
        Tuple.prototype.atoms = function () {
            return this._atoms.slice();
        };
        Tuple.prototype.toString = function () {
            return this._atoms.join('->');
        };
        return Tuple;
    }());

    var xhtml = "http://www.w3.org/1999/xhtml";

    var namespaces = {
      svg: "http://www.w3.org/2000/svg",
      xhtml: xhtml,
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/"
    };

    function namespace(name) {
      var prefix = name += "", i = prefix.indexOf(":");
      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
      return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
    }

    function creatorInherit(name) {
      return function() {
        var document = this.ownerDocument,
            uri = this.namespaceURI;
        return uri === xhtml && document.documentElement.namespaceURI === xhtml
            ? document.createElement(name)
            : document.createElementNS(uri, name);
      };
    }

    function creatorFixed(fullname) {
      return function() {
        return this.ownerDocument.createElementNS(fullname.space, fullname.local);
      };
    }

    function creator(name) {
      var fullname = namespace(name);
      return (fullname.local
          ? creatorFixed
          : creatorInherit)(fullname);
    }

    function none() {}

    function selector(selector) {
      return selector == null ? none : function() {
        return this.querySelector(selector);
      };
    }

    function selection_select(select) {
      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
          }
        }
      }

      return new Selection(subgroups, this._parents);
    }

    function empty() {
      return [];
    }

    function selectorAll(selector) {
      return selector == null ? empty : function() {
        return this.querySelectorAll(selector);
      };
    }

    function selection_selectAll(select) {
      if (typeof select !== "function") select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            subgroups.push(select.call(node, node.__data__, i, group));
            parents.push(node);
          }
        }
      }

      return new Selection(subgroups, parents);
    }

    function matcher(selector) {
      return function() {
        return this.matches(selector);
      };
    }

    function selection_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Selection(subgroups, this._parents);
    }

    function sparse(update) {
      return new Array(update.length);
    }

    function selection_enter() {
      return new Selection(this._enter || this._groups.map(sparse), this._parents);
    }

    function EnterNode(parent, datum) {
      this.ownerDocument = parent.ownerDocument;
      this.namespaceURI = parent.namespaceURI;
      this._next = null;
      this._parent = parent;
      this.__data__ = datum;
    }

    EnterNode.prototype = {
      constructor: EnterNode,
      appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
      insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
      querySelector: function(selector) { return this._parent.querySelector(selector); },
      querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
    };

    function constant(x) {
      return function() {
        return x;
      };
    }

    var keyPrefix = "$"; // Protect against keys like “__proto__”.

    function bindIndex(parent, group, enter, update, exit, data) {
      var i = 0,
          node,
          groupLength = group.length,
          dataLength = data.length;

      // Put any non-null nodes that fit into update.
      // Put any null nodes into enter.
      // Put any remaining data into enter.
      for (; i < dataLength; ++i) {
        if (node = group[i]) {
          node.__data__ = data[i];
          update[i] = node;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Put any non-null nodes that don’t fit into exit.
      for (; i < groupLength; ++i) {
        if (node = group[i]) {
          exit[i] = node;
        }
      }
    }

    function bindKey(parent, group, enter, update, exit, data, key) {
      var i,
          node,
          nodeByKeyValue = {},
          groupLength = group.length,
          dataLength = data.length,
          keyValues = new Array(groupLength),
          keyValue;

      // Compute the key for each node.
      // If multiple nodes have the same key, the duplicates are added to exit.
      for (i = 0; i < groupLength; ++i) {
        if (node = group[i]) {
          keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
          if (keyValue in nodeByKeyValue) {
            exit[i] = node;
          } else {
            nodeByKeyValue[keyValue] = node;
          }
        }
      }

      // Compute the key for each datum.
      // If there a node associated with this key, join and add it to update.
      // If there is not (or the key is a duplicate), add it to enter.
      for (i = 0; i < dataLength; ++i) {
        keyValue = keyPrefix + key.call(parent, data[i], i, data);
        if (node = nodeByKeyValue[keyValue]) {
          update[i] = node;
          node.__data__ = data[i];
          nodeByKeyValue[keyValue] = null;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Add any remaining nodes that were not bound to data to exit.
      for (i = 0; i < groupLength; ++i) {
        if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
          exit[i] = node;
        }
      }
    }

    function selection_data(value, key) {
      if (!value) {
        data = new Array(this.size()), j = -1;
        this.each(function(d) { data[++j] = d; });
        return data;
      }

      var bind = key ? bindKey : bindIndex,
          parents = this._parents,
          groups = this._groups;

      if (typeof value !== "function") value = constant(value);

      for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
        var parent = parents[j],
            group = groups[j],
            groupLength = group.length,
            data = value.call(parent, parent && parent.__data__, j, parents),
            dataLength = data.length,
            enterGroup = enter[j] = new Array(dataLength),
            updateGroup = update[j] = new Array(dataLength),
            exitGroup = exit[j] = new Array(groupLength);

        bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

        // Now connect the enter nodes to their following update node, such that
        // appendChild can insert the materialized enter node before this node,
        // rather than at the end of the parent node.
        for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
          if (previous = enterGroup[i0]) {
            if (i0 >= i1) i1 = i0 + 1;
            while (!(next = updateGroup[i1]) && ++i1 < dataLength);
            previous._next = next || null;
          }
        }
      }

      update = new Selection(update, parents);
      update._enter = enter;
      update._exit = exit;
      return update;
    }

    function selection_exit() {
      return new Selection(this._exit || this._groups.map(sparse), this._parents);
    }

    function selection_join(onenter, onupdate, onexit) {
      var enter = this.enter(), update = this, exit = this.exit();
      enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
      if (onupdate != null) update = onupdate(update);
      if (onexit == null) exit.remove(); else onexit(exit);
      return enter && update ? enter.merge(update).order() : update;
    }

    function selection_merge(selection) {

      for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Selection(merges, this._parents);
    }

    function selection_order() {

      for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
        for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
          if (node = group[i]) {
            if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
            next = node;
          }
        }
      }

      return this;
    }

    function selection_sort(compare) {
      if (!compare) compare = ascending;

      function compareNode(a, b) {
        return a && b ? compare(a.__data__, b.__data__) : !a - !b;
      }

      for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            sortgroup[i] = node;
          }
        }
        sortgroup.sort(compareNode);
      }

      return new Selection(sortgroups, this._parents).order();
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function selection_call() {
      var callback = arguments[0];
      arguments[0] = this;
      callback.apply(null, arguments);
      return this;
    }

    function selection_nodes() {
      var nodes = new Array(this.size()), i = -1;
      this.each(function() { nodes[++i] = this; });
      return nodes;
    }

    function selection_node() {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
          var node = group[i];
          if (node) return node;
        }
      }

      return null;
    }

    function selection_size() {
      var size = 0;
      this.each(function() { ++size; });
      return size;
    }

    function selection_empty() {
      return !this.node();
    }

    function selection_each(callback) {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) callback.call(node, node.__data__, i, group);
        }
      }

      return this;
    }

    function attrRemove(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant(name, value) {
      return function() {
        this.setAttribute(name, value);
      };
    }

    function attrConstantNS(fullname, value) {
      return function() {
        this.setAttributeNS(fullname.space, fullname.local, value);
      };
    }

    function attrFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttribute(name);
        else this.setAttribute(name, v);
      };
    }

    function attrFunctionNS(fullname, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
        else this.setAttributeNS(fullname.space, fullname.local, v);
      };
    }

    function selection_attr(name, value) {
      var fullname = namespace(name);

      if (arguments.length < 2) {
        var node = this.node();
        return fullname.local
            ? node.getAttributeNS(fullname.space, fullname.local)
            : node.getAttribute(fullname);
      }

      return this.each((value == null
          ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
          ? (fullname.local ? attrFunctionNS : attrFunction)
          : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
    }

    function defaultView(node) {
      return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
          || (node.document && node) // node is a Window
          || node.defaultView; // node is a Document
    }

    function styleRemove(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant(name, value, priority) {
      return function() {
        this.style.setProperty(name, value, priority);
      };
    }

    function styleFunction(name, value, priority) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.style.removeProperty(name);
        else this.style.setProperty(name, v, priority);
      };
    }

    function selection_style(name, value, priority) {
      return arguments.length > 1
          ? this.each((value == null
                ? styleRemove : typeof value === "function"
                ? styleFunction
                : styleConstant)(name, value, priority == null ? "" : priority))
          : styleValue(this.node(), name);
    }

    function styleValue(node, name) {
      return node.style.getPropertyValue(name)
          || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
    }

    function propertyRemove(name) {
      return function() {
        delete this[name];
      };
    }

    function propertyConstant(name, value) {
      return function() {
        this[name] = value;
      };
    }

    function propertyFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) delete this[name];
        else this[name] = v;
      };
    }

    function selection_property(name, value) {
      return arguments.length > 1
          ? this.each((value == null
              ? propertyRemove : typeof value === "function"
              ? propertyFunction
              : propertyConstant)(name, value))
          : this.node()[name];
    }

    function classArray(string) {
      return string.trim().split(/^|\s+/);
    }

    function classList(node) {
      return node.classList || new ClassList(node);
    }

    function ClassList(node) {
      this._node = node;
      this._names = classArray(node.getAttribute("class") || "");
    }

    ClassList.prototype = {
      add: function(name) {
        var i = this._names.indexOf(name);
        if (i < 0) {
          this._names.push(name);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      remove: function(name) {
        var i = this._names.indexOf(name);
        if (i >= 0) {
          this._names.splice(i, 1);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      contains: function(name) {
        return this._names.indexOf(name) >= 0;
      }
    };

    function classedAdd(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.add(names[i]);
    }

    function classedRemove(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.remove(names[i]);
    }

    function classedTrue(names) {
      return function() {
        classedAdd(this, names);
      };
    }

    function classedFalse(names) {
      return function() {
        classedRemove(this, names);
      };
    }

    function classedFunction(names, value) {
      return function() {
        (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
      };
    }

    function selection_classed(name, value) {
      var names = classArray(name + "");

      if (arguments.length < 2) {
        var list = classList(this.node()), i = -1, n = names.length;
        while (++i < n) if (!list.contains(names[i])) return false;
        return true;
      }

      return this.each((typeof value === "function"
          ? classedFunction : value
          ? classedTrue
          : classedFalse)(names, value));
    }

    function textRemove() {
      this.textContent = "";
    }

    function textConstant(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.textContent = v == null ? "" : v;
      };
    }

    function selection_text(value) {
      return arguments.length
          ? this.each(value == null
              ? textRemove : (typeof value === "function"
              ? textFunction
              : textConstant)(value))
          : this.node().textContent;
    }

    function htmlRemove() {
      this.innerHTML = "";
    }

    function htmlConstant(value) {
      return function() {
        this.innerHTML = value;
      };
    }

    function htmlFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.innerHTML = v == null ? "" : v;
      };
    }

    function selection_html(value) {
      return arguments.length
          ? this.each(value == null
              ? htmlRemove : (typeof value === "function"
              ? htmlFunction
              : htmlConstant)(value))
          : this.node().innerHTML;
    }

    function raise() {
      if (this.nextSibling) this.parentNode.appendChild(this);
    }

    function selection_raise() {
      return this.each(raise);
    }

    function lower() {
      if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
    }

    function selection_lower() {
      return this.each(lower);
    }

    function selection_append(name) {
      var create = typeof name === "function" ? name : creator(name);
      return this.select(function() {
        return this.appendChild(create.apply(this, arguments));
      });
    }

    function constantNull() {
      return null;
    }

    function selection_insert(name, before) {
      var create = typeof name === "function" ? name : creator(name),
          select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
      return this.select(function() {
        return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
      });
    }

    function remove() {
      var parent = this.parentNode;
      if (parent) parent.removeChild(this);
    }

    function selection_remove() {
      return this.each(remove);
    }

    function selection_cloneShallow() {
      return this.parentNode.insertBefore(this.cloneNode(false), this.nextSibling);
    }

    function selection_cloneDeep() {
      return this.parentNode.insertBefore(this.cloneNode(true), this.nextSibling);
    }

    function selection_clone(deep) {
      return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
    }

    function selection_datum(value) {
      return arguments.length
          ? this.property("__data__", value)
          : this.node().__data__;
    }

    var filterEvents = {};

    if (typeof document !== "undefined") {
      var element = document.documentElement;
      if (!("onmouseenter" in element)) {
        filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
      }
    }

    function filterContextListener(listener, index, group) {
      listener = contextListener(listener, index, group);
      return function(event) {
        var related = event.relatedTarget;
        if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
          listener.call(this, event);
        }
      };
    }

    function contextListener(listener, index, group) {
      return function(event1) {
        try {
          listener.call(this, this.__data__, index, group);
        } finally {
        }
      };
    }

    function parseTypenames(typenames) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        return {type: t, name: name};
      });
    }

    function onRemove(typename) {
      return function() {
        var on = this.__on;
        if (!on) return;
        for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
          if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.capture);
          } else {
            on[++i] = o;
          }
        }
        if (++i) on.length = i;
        else delete this.__on;
      };
    }

    function onAdd(typename, value, capture) {
      var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
      return function(d, i, group) {
        var on = this.__on, o, listener = wrap(value, i, group);
        if (on) for (var j = 0, m = on.length; j < m; ++j) {
          if ((o = on[j]).type === typename.type && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.capture);
            this.addEventListener(o.type, o.listener = listener, o.capture = capture);
            o.value = value;
            return;
          }
        }
        this.addEventListener(typename.type, listener, capture);
        o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
        if (!on) this.__on = [o];
        else on.push(o);
      };
    }

    function selection_on(typename, value, capture) {
      var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

      if (arguments.length < 2) {
        var on = this.node().__on;
        if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
          for (i = 0, o = on[j]; i < n; ++i) {
            if ((t = typenames[i]).type === o.type && t.name === o.name) {
              return o.value;
            }
          }
        }
        return;
      }

      on = value ? onAdd : onRemove;
      if (capture == null) capture = false;
      for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
      return this;
    }

    function dispatchEvent(node, type, params) {
      var window = defaultView(node),
          event = window.CustomEvent;

      if (typeof event === "function") {
        event = new event(type, params);
      } else {
        event = window.document.createEvent("Event");
        if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
        else event.initEvent(type, false, false);
      }

      node.dispatchEvent(event);
    }

    function dispatchConstant(type, params) {
      return function() {
        return dispatchEvent(this, type, params);
      };
    }

    function dispatchFunction(type, params) {
      return function() {
        return dispatchEvent(this, type, params.apply(this, arguments));
      };
    }

    function selection_dispatch(type, params) {
      return this.each((typeof params === "function"
          ? dispatchFunction
          : dispatchConstant)(type, params));
    }

    var root = [null];

    function Selection(groups, parents) {
      this._groups = groups;
      this._parents = parents;
    }

    function selection() {
      return new Selection([[document.documentElement]], root);
    }

    Selection.prototype = selection.prototype = {
      constructor: Selection,
      select: selection_select,
      selectAll: selection_selectAll,
      filter: selection_filter,
      data: selection_data,
      enter: selection_enter,
      exit: selection_exit,
      join: selection_join,
      merge: selection_merge,
      order: selection_order,
      sort: selection_sort,
      call: selection_call,
      nodes: selection_nodes,
      node: selection_node,
      size: selection_size,
      empty: selection_empty,
      each: selection_each,
      attr: selection_attr,
      style: selection_style,
      property: selection_property,
      classed: selection_classed,
      text: selection_text,
      html: selection_html,
      raise: selection_raise,
      lower: selection_lower,
      append: selection_append,
      insert: selection_insert,
      remove: selection_remove,
      clone: selection_clone,
      datum: selection_datum,
      on: selection_on,
      dispatch: selection_dispatch
    };

    function select(selector) {
      return typeof selector === "string"
          ? new Selection([[document.querySelector(selector)]], [document.documentElement])
          : new Selection([[selector]], root);
    }

    var __read = (undefined && undefined.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spread = (undefined && undefined.__spread) || function () {
        for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
        return ar;
    };
    var __values$1 = (undefined && undefined.__values) || function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };
    var Instance = /** @class */ (function () {
        function Instance() {
            this._command = null;
            this._filename = null;
            this._bitwidth = null;
            this._maxseq = null;
            this._builddate = null;
            this._sources = new Map();
            this._signatures = new Map();
            this._fields = new Map();
            this._skolem = new Map();
        }
        Instance.prototype.bitwidth = function () {
            return this._bitwidth;
        };
        Instance.prototype.builddate = function () {
            return this._builddate;
        };
        Instance.prototype.command = function () {
            return this._command;
        };
        Instance.prototype.fields = function () {
            return Array.from(this._fields.values());
        };
        Instance.prototype.filename = function () {
            return this._filename;
        };
        Instance.prototype.maxseq = function () {
            return this._maxseq;
        };
        Instance.prototype.signatures = function () {
            return Array.from(this._signatures.values());
        };
        Instance.prototype.skolems = function () {
            return Array.from(this._skolem.values());
        };
        Instance.prototype.sources = function () {
            return this._sources;
        };
        Instance.fromXML = function (xml) {
            var instance = new Instance(), parser = new DOMParser(), doc = select(parser.parseFromString(xml, "application/xml"));
            var inst = doc.select('instance');
            var ally = doc.select('alloy');
            instance._command = inst.attr('command');
            instance._filename = inst.attr('filename');
            instance._bitwidth = parseInt(inst.attr('bitwidth'));
            instance._maxseq = parseInt(inst.attr('maxseq'));
            instance._builddate = ally.attr('builddate');
            var sigparents = new Map();
            var fldparents = new Map();
            var signatures = new Map();
            var fields = new Map();
            var skolem = new Map();
            // Parse signatures and atoms
            doc.selectAll('sig')
                .filter(subsetTest(false))
                .each(parseSig(instance, sigparents, signatures));
            // Assemble signature hierarchy
            sigparents.forEach(function (pid, cid) {
                var parent = signatures.get(pid);
                var child = signatures.get(cid);
                if (parent && child)
                    addSignature(parent, child);
            });
            // Parse subsets and atoms
            doc.selectAll('sig')
                .filter(subsetTest(true))
                .each(parseSubset(instance, signatures));
            // Parse fields and tuples
            doc.selectAll('field')
                .each(parseField(fldparents, signatures, fields));
            // Parse skolem
            doc.selectAll('skolem')
                .each(parseSkolem(signatures, skolem));
            // Assemble field hierarchy
            fldparents.forEach(function (pid, cid) {
                var parent = signatures.get(pid);
                var child = fields.get(cid);
                if (parent && child)
                    addField(parent, child);
            });
            // Save to instance
            signatures.forEach(function (sig) { return instance._signatures.set(sig.toString(), sig); });
            fields.forEach(function (fld) { return instance._fields.set(fld.toString(), fld); });
            skolem.forEach(function (sko) { return instance._skolem.set(sko.toString(), sko); });
            // Save model source
            doc.selectAll('source')
                .each(function () {
                var s = select(this), f = s.attr('filename'), c = s.attr('content');
                instance._sources.set(f, c);
            });
            return instance;
        };
        return Instance;
    }());
    function addAtom(sig, label) {
        if (sig._atoms.has(label)) {
            throw Error('Atom ' + label + ' already exists in ' + sig);
        }
        sig._atoms.set(label, new Atom(sig, label));
    }
    function addField(parent, child) {
        if (child.types()[0] !== parent)
            throw Error('First type of field ' + child + ' must be ' + parent);
        if (parent._fields.has(child.label()))
            throw Error(parent + ' already contains field ' + child);
        parent._fields.set(child.label(), child);
        child._parent = parent;
    }
    function addSignature(parent, child) {
        if (parent._signatures.has(child.label()))
            throw Error(parent + ' already contains ' + child);
        parent._signatures.set(child.label(), child);
        child._parent = parent;
    }
    function addTuple(receiver, tuple) {
        // Array of types for atoms in relation
        var types = receiver.types();
        // Atoms in tuple
        var atoms = tuple.atoms();
        // Check for same number of atoms
        if (atoms.length !== types.length) {
            throw Error(tuple + ' has incorrect number of atoms for ' + receiver);
        }
        // Check that atoms are correct type
        if (!types.every(function (t, i) { return atoms[i].isType(t); })) {
            throw Error(tuple + ' incompatible with field ' + receiver);
        }
        // Check that tuple not already in relation
        if (receiver.has.apply(receiver, __spread(atoms))) {
            throw Error(receiver + ' already contains ' + tuple);
        }
        receiver._tuples.push(tuple);
    }
    function buildInt(sig, bitwidth) {
        if (bitwidth < 1)
            return;
        var n = Math.pow(2, bitwidth);
        for (var i = -n / 2; i < n / 2; ++i) {
            addAtom(sig, i.toString());
        }
    }
    function parseField(parents, signatures, fields) {
        return function () {
            var f = select(this);
            var id = parseInt(f.attr('ID'));
            var parent = parseInt(f.attr('parentID'));
            var label = f.attr('label');
            var types = f.select('types')
                .selectAll('type')
                .nodes()
                .map(parseType)
                .map(function (id) { return signatures.get(id); });
            var field = new Field(label, types);
            f.selectAll('tuple')
                .nodes()
                .map(parseTuple)
                .map(function (t) { return t.map(function (a, i) { return types[i].atom(a); }); })
                .map(function (t) { return new Tuple(t); })
                .forEach(function (tuple) { return addTuple(field, tuple); });
            parents.set(id, parent);
            fields.set(id, field);
        };
    }
    function parseSubset(instance, signatures) {
        return function () {
            var s = select(this);
            var id = parseInt(s.attr('ID'));
            var types = s.selectAll('type')
                .nodes()
                .map(parseType)
                .map(function (id) { return signatures.get(id); });
            var sig = new Signature(s.attr('label'), s.attr('builtin') === 'yes', s.attr('one') === 'yes', true);
            signatures.set(id, sig);
            // Sequences aren't explicitly made subset signatures, but in reality
            // that is how they act, so get up to maxseq atoms from int
            if (sig.label() === 'seq/Int') {
                var int = Array
                    .from(signatures.values())
                    .find(function (s) { return s.label() === 'Int'; });
                for (var i = 0; i < instance.maxseq(); ++i) {
                    var label = i.toString();
                    var atom = int.atom(label);
                    sig._atoms.set(label, atom);
                }
                return;
            }
            s.selectAll('atom')
                .each(function () {
                var e_1, _a;
                var label = select(this).attr('label');
                try {
                    for (var types_1 = __values$1(types), types_1_1 = types_1.next(); !types_1_1.done; types_1_1 = types_1.next()) {
                        var t = types_1_1.value;
                        var atom = t.atom(label);
                        if (atom) {
                            sig._atoms.set(label, atom);
                            break;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (types_1_1 && !types_1_1.done && (_a = types_1["return"])) _a.call(types_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            });
        };
    }
    function parseSig(instance, parents, signatures) {
        return function () {
            var s = select(this);
            var id = parseInt(s.attr('ID'));
            var parent = parseInt(s.attr('parentID'));
            var sig = new Signature(s.attr('label'), s.attr('builtin') === 'yes', s.attr('one') === 'yes');
            parents.set(id, parent);
            signatures.set(id, sig);
            s.selectAll('atom')
                .each(function () {
                addAtom(sig, select(this).attr('label'));
            });
            // Integer atoms are not explicitly included, so
            // build them based on the bitwidth
            if (sig.label() === 'Int')
                buildInt(sig, instance.bitwidth());
        };
    }
    function parseSkolem(signatures, skolems) {
        return function () {
            var s = select(this);
            var id = parseInt(s.attr('ID'));
            var label = s.attr('label');
            var types = s.select('types')
                .selectAll('type')
                .nodes()
                .map(parseType)
                .map(function (id) { return signatures.get(id); });
            var skolem = new Skolem(label, types);
            s.selectAll('tuple')
                .nodes()
                .map(parseTuple)
                .map(function (t) { return t.map(function (a, i) { return types[i].atom(a); }); })
                .map(function (t) { return new Tuple(t); })
                .forEach(function (tuple) { return addTuple(skolem, tuple); });
            skolems.set(id, skolem);
        };
    }
    function parseTuple(tuple) {
        return select(tuple)
            .selectAll('atom')
            .nodes()
            .map(function (d) {
            return select(d).attr('label');
        });
    }
    function parseType(type) {
        return parseInt(select(type).attr('ID'));
    }
    function subsetTest(keepSubsets) {
        return function () {
            var s = select(this);
            var parentID = s.attr('parentID');
            var label = s.attr('label');
            var issubset = (parentID === null && label !== 'univ') || label === 'seq/Int';
            return keepSubsets ? issubset : !issubset;
        };
    }

    exports.Atom = Atom;
    exports.Field = Field;
    exports.Instance = Instance;
    exports.Signature = Signature;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
