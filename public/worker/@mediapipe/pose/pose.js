(function () {/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
    'use strict';
    var x;

    function aa(a) {
        var b = 0;
        return function () {
            return b < a.length ? {done: !1, value: a[b++]} : {done: !0}
        }
    }

    var ba = "function" == typeof Object.defineProperties ? Object.defineProperty : function (a, b, c) {
        if (a == Array.prototype || a == Object.prototype) return a;
        a[b] = c.value;
        return a
    };

    function ca(a) {
        a = ["object" == typeof globalThis && globalThis, a, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
        for (var b = 0; b < a.length; ++b) {
            var c = a[b];
            if (c && c.Math == Math) return c
        }
        throw Error("Cannot find global object");
    }

    var y = ca(this);

    function B(a, b) {
        if (b) a:{
            var c = y;
            a = a.split(".");
            for (var d = 0; d < a.length - 1; d++) {
                var e = a[d];
                if (!(e in c)) break a;
                c = c[e]
            }
            a = a[a.length - 1];
            d = c[a];
            b = b(d);
            b != d && null != b && ba(c, a, {configurable: !0, writable: !0, value: b})
        }
    }

    B("Symbol", function (a) {
        function b(g) {
            if (this instanceof b) throw new TypeError("Symbol is not a constructor");
            return new c(d + (g || "") + "_" + e++, g)
        }

        function c(g, f) {
            this.g = g;
            ba(this, "description", {configurable: !0, writable: !0, value: f})
        }

        if (a) return a;
        c.prototype.toString = function () {
            return this.g
        };
        var d = "jscomp_symbol_" + (1E9 * Math.random() >>> 0) + "_", e = 0;
        return b
    });
    B("Symbol.iterator", function (a) {
        if (a) return a;
        a = Symbol("Symbol.iterator");
        for (var b = "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "), c = 0; c < b.length; c++) {
            var d = y[b[c]];
            "function" === typeof d && "function" != typeof d.prototype[a] && ba(d.prototype, a, {
                configurable: !0,
                writable: !0,
                value: function () {
                    return da(aa(this))
                }
            })
        }
        return a
    });

    function da(a) {
        a = {next: a};
        a[Symbol.iterator] = function () {
            return this
        };
        return a
    }

    function C(a) {
        var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
        return b ? b.call(a) : {next: aa(a)}
    }

    function ea(a) {
        if (!(a instanceof Array)) {
            a = C(a);
            for (var b, c = []; !(b = a.next()).done;) c.push(b.value);
            a = c
        }
        return a
    }

    var fa = "function" == typeof Object.create ? Object.create : function (a) {
        function b() {
        }

        b.prototype = a;
        return new b
    }, ha;
    if ("function" == typeof Object.setPrototypeOf) ha = Object.setPrototypeOf; else {
        var ia;
        a:{
            var ja = {a: !0}, ka = {};
            try {
                ka.__proto__ = ja;
                ia = ka.a;
                break a
            } catch (a) {
            }
            ia = !1
        }
        ha = ia ? function (a, b) {
            a.__proto__ = b;
            if (a.__proto__ !== b) throw new TypeError(a + " is not extensible");
            return a
        } : null
    }
    var la = ha;

    function E(a, b) {
        a.prototype = fa(b.prototype);
        a.prototype.constructor = a;
        if (la) la(a, b); else for (var c in b) if ("prototype" != c) if (Object.defineProperties) {
            var d = Object.getOwnPropertyDescriptor(b, c);
            d && Object.defineProperty(a, c, d)
        } else a[c] = b[c];
        a.ea = b.prototype
    }

    function ma() {
        this.l = !1;
        this.i = null;
        this.h = void 0;
        this.g = 1;
        this.s = this.m = 0;
        this.j = null
    }

    function na(a) {
        if (a.l) throw new TypeError("Generator is already running");
        a.l = !0
    }

    ma.prototype.o = function (a) {
        this.h = a
    };

    function oa(a, b) {
        a.j = {U: b, V: !0};
        a.g = a.m || a.s
    }

    ma.prototype.return = function (a) {
        this.j = {return: a};
        this.g = this.s
    };

    function F(a, b, c) {
        a.g = c;
        return {value: b}
    }

    function pa(a) {
        this.g = new ma;
        this.h = a
    }

    function qa(a, b) {
        na(a.g);
        var c = a.g.i;
        if (c) return ra(a, "return" in c ? c["return"] : function (d) {
            return {value: d, done: !0}
        }, b, a.g.return);
        a.g.return(b);
        return G(a)
    }

    function ra(a, b, c, d) {
        try {
            var e = b.call(a.g.i, c);
            if (!(e instanceof Object)) throw new TypeError("Iterator result " + e + " is not an object");
            if (!e.done) return a.g.l = !1, e;
            var g = e.value
        } catch (f) {
            return a.g.i = null, oa(a.g, f), G(a)
        }
        a.g.i = null;
        d.call(a.g, g);
        return G(a)
    }

    function G(a) {
        for (; a.g.g;) try {
            var b = a.h(a.g);
            if (b) return a.g.l = !1, {value: b.value, done: !1}
        } catch (c) {
            a.g.h = void 0, oa(a.g, c)
        }
        a.g.l = !1;
        if (a.g.j) {
            b = a.g.j;
            a.g.j = null;
            if (b.V) throw b.U;
            return {value: b.return, done: !0}
        }
        return {value: void 0, done: !0}
    }

    function sa(a) {
        this.next = function (b) {
            na(a.g);
            a.g.i ? b = ra(a, a.g.i.next, b, a.g.o) : (a.g.o(b), b = G(a));
            return b
        };
        this.throw = function (b) {
            na(a.g);
            a.g.i ? b = ra(a, a.g.i["throw"], b, a.g.o) : (oa(a.g, b), b = G(a));
            return b
        };
        this.return = function (b) {
            return qa(a, b)
        };
        this[Symbol.iterator] = function () {
            return this
        }
    }

    function ta(a) {
        function b(d) {
            return a.next(d)
        }

        function c(d) {
            return a.throw(d)
        }

        return new Promise(function (d, e) {
            function g(f) {
                f.done ? d(f.value) : Promise.resolve(f.value).then(b, c).then(g, e)
            }

            g(a.next())
        })
    }

    function H(a) {
        return ta(new sa(new pa(a)))
    }

    B("Promise", function (a) {
        function b(f) {
            this.h = 0;
            this.i = void 0;
            this.g = [];
            this.o = !1;
            var k = this.j();
            try {
                f(k.resolve, k.reject)
            } catch (h) {
                k.reject(h)
            }
        }

        function c() {
            this.g = null
        }

        function d(f) {
            return f instanceof b ? f : new b(function (k) {
                k(f)
            })
        }

        if (a) return a;
        c.prototype.h = function (f) {
            if (null == this.g) {
                this.g = [];
                var k = this;
                this.i(function () {
                    k.l()
                })
            }
            this.g.push(f)
        };
        var e = y.setTimeout;
        c.prototype.i = function (f) {
            e(f, 0)
        };
        c.prototype.l = function () {
            for (; this.g && this.g.length;) {
                var f = this.g;
                this.g = [];
                for (var k = 0; k < f.length; ++k) {
                    var h =
                        f[k];
                    f[k] = null;
                    try {
                        h()
                    } catch (l) {
                        this.j(l)
                    }
                }
            }
            this.g = null
        };
        c.prototype.j = function (f) {
            this.i(function () {
                throw f;
            })
        };
        b.prototype.j = function () {
            function f(l) {
                return function (n) {
                    h || (h = !0, l.call(k, n))
                }
            }

            var k = this, h = !1;
            return {resolve: f(this.C), reject: f(this.l)}
        };
        b.prototype.C = function (f) {
            if (f === this) this.l(new TypeError("A Promise cannot resolve to itself")); else if (f instanceof b) this.F(f); else {
                a:switch (typeof f) {
                    case "object":
                        var k = null != f;
                        break a;
                    case "function":
                        k = !0;
                        break a;
                    default:
                        k = !1
                }
                k ? this.v(f) : this.m(f)
            }
        };
        b.prototype.v = function (f) {
            var k = void 0;
            try {
                k = f.then
            } catch (h) {
                this.l(h);
                return
            }
            "function" == typeof k ? this.G(k, f) : this.m(f)
        };
        b.prototype.l = function (f) {
            this.s(2, f)
        };
        b.prototype.m = function (f) {
            this.s(1, f)
        };
        b.prototype.s = function (f, k) {
            if (0 != this.h) throw Error("Cannot settle(" + f + ", " + k + "): Promise already settled in state" + this.h);
            this.h = f;
            this.i = k;
            2 === this.h && this.D();
            this.A()
        };
        b.prototype.D = function () {
            var f = this;
            e(function () {
                if (f.B()) {
                    var k = y.console;
                    "undefined" !== typeof k && k.error(f.i)
                }
            }, 1)
        };
        b.prototype.B =
            function () {
                if (this.o) return !1;
                var f = y.CustomEvent, k = y.Event, h = y.dispatchEvent;
                if ("undefined" === typeof h) return !0;
                "function" === typeof f ? f = new f("unhandledrejection", {cancelable: !0}) : "function" === typeof k ? f = new k("unhandledrejection", {cancelable: !0}) : (f = y.document.createEvent("CustomEvent"), f.initCustomEvent("unhandledrejection", !1, !0, f));
                f.promise = this;
                f.reason = this.i;
                return h(f)
            };
        b.prototype.A = function () {
            if (null != this.g) {
                for (var f = 0; f < this.g.length; ++f) g.h(this.g[f]);
                this.g = null
            }
        };
        var g = new c;
        b.prototype.F =
            function (f) {
                var k = this.j();
                f.J(k.resolve, k.reject)
            };
        b.prototype.G = function (f, k) {
            var h = this.j();
            try {
                f.call(k, h.resolve, h.reject)
            } catch (l) {
                h.reject(l)
            }
        };
        b.prototype.then = function (f, k) {
            function h(p, m) {
                return "function" == typeof p ? function (q) {
                    try {
                        l(p(q))
                    } catch (t) {
                        n(t)
                    }
                } : m
            }

            var l, n, r = new b(function (p, m) {
                l = p;
                n = m
            });
            this.J(h(f, l), h(k, n));
            return r
        };
        b.prototype.catch = function (f) {
            return this.then(void 0, f)
        };
        b.prototype.J = function (f, k) {
            function h() {
                switch (l.h) {
                    case 1:
                        f(l.i);
                        break;
                    case 2:
                        k(l.i);
                        break;
                    default:
                        throw Error("Unexpected state: " +
                            l.h);
                }
            }

            var l = this;
            null == this.g ? g.h(h) : this.g.push(h);
            this.o = !0
        };
        b.resolve = d;
        b.reject = function (f) {
            return new b(function (k, h) {
                h(f)
            })
        };
        b.race = function (f) {
            return new b(function (k, h) {
                for (var l = C(f), n = l.next(); !n.done; n = l.next()) d(n.value).J(k, h)
            })
        };
        b.all = function (f) {
            var k = C(f), h = k.next();
            return h.done ? d([]) : new b(function (l, n) {
                function r(q) {
                    return function (t) {
                        p[q] = t;
                        m--;
                        0 == m && l(p)
                    }
                }

                var p = [], m = 0;
                do p.push(void 0), m++, d(h.value).J(r(p.length - 1), n), h = k.next(); while (!h.done)
            })
        };
        return b
    });

    function ua(a, b) {
        a instanceof String && (a += "");
        var c = 0, d = !1, e = {
            next: function () {
                if (!d && c < a.length) {
                    var g = c++;
                    return {value: b(g, a[g]), done: !1}
                }
                d = !0;
                return {done: !0, value: void 0}
            }
        };
        e[Symbol.iterator] = function () {
            return e
        };
        return e
    }

    var va = "function" == typeof Object.assign ? Object.assign : function (a, b) {
        for (var c = 1; c < arguments.length; c++) {
            var d = arguments[c];
            if (d) for (var e in d) Object.prototype.hasOwnProperty.call(d, e) && (a[e] = d[e])
        }
        return a
    };
    B("Object.assign", function (a) {
        return a || va
    });
    B("Object.is", function (a) {
        return a ? a : function (b, c) {
            return b === c ? 0 !== b || 1 / b === 1 / c : b !== b && c !== c
        }
    });
    B("Array.prototype.includes", function (a) {
        return a ? a : function (b, c) {
            var d = this;
            d instanceof String && (d = String(d));
            var e = d.length;
            c = c || 0;
            for (0 > c && (c = Math.max(c + e, 0)); c < e; c++) {
                var g = d[c];
                if (g === b || Object.is(g, b)) return !0
            }
            return !1
        }
    });
    B("String.prototype.includes", function (a) {
        return a ? a : function (b, c) {
            if (null == this) throw new TypeError("The 'this' value for String.prototype.includes must not be null or undefined");
            if (b instanceof RegExp) throw new TypeError("First argument to String.prototype.includes must not be a regular expression");
            return -1 !== this.indexOf(b, c || 0)
        }
    });
    B("Array.prototype.keys", function (a) {
        return a ? a : function () {
            return ua(this, function (b) {
                return b
            })
        }
    });
    var wa = this || self;

    function J(a, b) {
        a = a.split(".");
        var c = wa;
        a[0] in c || "undefined" == typeof c.execScript || c.execScript("var " + a[0]);
        for (var d; a.length && (d = a.shift());) a.length || void 0 === b ? c[d] && c[d] !== Object.prototype[d] ? c = c[d] : c = c[d] = {} : c[d] = b
    };

    function xa(a) {
        wa.setTimeout(function () {
            throw a;
        }, 0)
    };

    function K(a) {
        xa(a);
        return;
        throw Error("invalid error level: 1");
    }

    function ya(a, b) {
        K(Error("Invalid wire type: " + a + " (at position " + b + ")"))
    }

    function za() {
        K(Error("Failed to read varint, encoding is invalid."))
    };

    function Aa(a, b) {
        b = String.fromCharCode.apply(null, b);
        return null == a ? b : a + b
    }

    var Ba, Ca = "undefined" !== typeof TextDecoder, Da, Ea = "undefined" !== typeof TextEncoder;

    function Fa(a) {
        if (Ea) a = (Da || (Da = new TextEncoder)).encode(a); else {
            var b = void 0;
            b = void 0 === b ? !1 : b;
            for (var c = 0, d = new Uint8Array(3 * a.length), e = 0; e < a.length; e++) {
                var g = a.charCodeAt(e);
                if (128 > g) d[c++] = g; else {
                    if (2048 > g) d[c++] = g >> 6 | 192; else {
                        if (55296 <= g && 57343 >= g) {
                            if (56319 >= g && e < a.length) {
                                var f = a.charCodeAt(++e);
                                if (56320 <= f && 57343 >= f) {
                                    g = 1024 * (g - 55296) + f - 56320 + 65536;
                                    d[c++] = g >> 18 | 240;
                                    d[c++] = g >> 12 & 63 | 128;
                                    d[c++] = g >> 6 & 63 | 128;
                                    d[c++] = g & 63 | 128;
                                    continue
                                } else e--
                            }
                            if (b) throw Error("Found an unpaired surrogate");
                            g = 65533
                        }
                        d[c++] =
                            g >> 12 | 224;
                        d[c++] = g >> 6 & 63 | 128
                    }
                    d[c++] = g & 63 | 128
                }
            }
            a = d.subarray(0, c)
        }
        return a
    };var Ga = {}, L = null;

    function Ha(a) {
        var b;
        void 0 === b && (b = 0);
        Ia();
        b = Ga[b];
        for (var c = Array(Math.floor(a.length / 3)), d = b[64] || "", e = 0, g = 0; e < a.length - 2; e += 3) {
            var f = a[e], k = a[e + 1], h = a[e + 2], l = b[f >> 2];
            f = b[(f & 3) << 4 | k >> 4];
            k = b[(k & 15) << 2 | h >> 6];
            h = b[h & 63];
            c[g++] = l + f + k + h
        }
        l = 0;
        h = d;
        switch (a.length - e) {
            case 2:
                l = a[e + 1], h = b[(l & 15) << 2] || d;
            case 1:
                a = a[e], c[g] = b[a >> 2] + b[(a & 3) << 4 | l >> 4] + h + d
        }
        return c.join("")
    }

    function Ja(a) {
        var b = a.length, c = 3 * b / 4;
        c % 3 ? c = Math.floor(c) : -1 != "=.".indexOf(a[b - 1]) && (c = -1 != "=.".indexOf(a[b - 2]) ? c - 2 : c - 1);
        var d = new Uint8Array(c), e = 0;
        Ka(a, function (g) {
            d[e++] = g
        });
        return d.subarray(0, e)
    }

    function Ka(a, b) {
        function c(h) {
            for (; d < a.length;) {
                var l = a.charAt(d++), n = L[l];
                if (null != n) return n;
                if (!/^[\s\xa0]*$/.test(l)) throw Error("Unknown base64 encoding at char: " + l);
            }
            return h
        }

        Ia();
        for (var d = 0; ;) {
            var e = c(-1), g = c(0), f = c(64), k = c(64);
            if (64 === k && -1 === e) break;
            b(e << 2 | g >> 4);
            64 != f && (b(g << 4 & 240 | f >> 2), 64 != k && b(f << 6 & 192 | k))
        }
    }

    function Ia() {
        if (!L) {
            L = {};
            for (var a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""), b = ["+/=", "+/", "-_=", "-_.", "-_"], c = 0; 5 > c; c++) {
                var d = a.concat(b[c].split(""));
                Ga[c] = d;
                for (var e = 0; e < d.length; e++) {
                    var g = d[e];
                    void 0 === L[g] && (L[g] = e)
                }
            }
        }
    };var La = "function" === typeof Uint8Array, Ma;

    function Na(a) {
        this.g = a;
        if (null !== a && 0 === a.length) throw Error("ByteString should be constructed with non-empty values");
    }

    Na.prototype.toJSON = function () {
        if (null == this.g) var a = ""; else a = this.g, a = this.g = null == a || "string" === typeof a ? a : La && a instanceof Uint8Array ? Ha(a) : null;
        return a
    };
    var Oa = "function" === typeof Uint8Array.prototype.slice;

    function Pa(a, b, c) {
        return b === c ? Ma || (Ma = new Uint8Array(0)) : Oa ? a.slice(b, c) : new Uint8Array(a.subarray(b, c))
    }

    var M = 0, N = 0;

    function Qa(a) {
        if (a.constructor === Uint8Array) return a;
        if (a.constructor === ArrayBuffer) return new Uint8Array(a);
        if (a.constructor === Array) return new Uint8Array(a);
        if (a.constructor === String) return Ja(a);
        if (a.constructor === Na) {
            if (null == a.g) var b = Ma || (Ma = new Uint8Array(0)); else {
                b = Uint8Array;
                var c = a.g;
                c = null == c || La && null != c && c instanceof Uint8Array ? c : "string" === typeof c ? Ja(c) : null;
                a = a.g = c;
                b = new b(a)
            }
            return b
        }
        if (a instanceof Uint8Array) return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        throw Error("Type not convertible to a Uint8Array, expected a Uint8Array, an ArrayBuffer, a base64 encoded string, or Array of numbers");
    };

    function Ra(a, b) {
        b = void 0 === b ? {} : b;
        b = void 0 === b.u ? !1 : b.u;
        this.h = null;
        this.g = this.i = this.l = 0;
        this.j = !1;
        this.u = b;
        a && Sa(this, a)
    }

    function Sa(a, b) {
        a.h = Qa(b);
        a.l = 0;
        a.i = a.h.length;
        a.g = a.l
    }

    Ra.prototype.reset = function () {
        this.g = this.l
    };

    function O(a) {
        a.g > a.i && (a.j = !0, K(Error("Tried to read past the end of the data " + a.g + " > " + a.i)))
    }

    function P(a) {
        var b = a.h, c = b[a.g], d = c & 127;
        if (128 > c) return a.g += 1, O(a), d;
        c = b[a.g + 1];
        d |= (c & 127) << 7;
        if (128 > c) return a.g += 2, O(a), d;
        c = b[a.g + 2];
        d |= (c & 127) << 14;
        if (128 > c) return a.g += 3, O(a), d;
        c = b[a.g + 3];
        d |= (c & 127) << 21;
        if (128 > c) return a.g += 4, O(a), d;
        c = b[a.g + 4];
        d |= (c & 15) << 28;
        if (128 > c) return a.g += 5, O(a), d >>> 0;
        a.g += 5;
        if (128 <= b[a.g++] && 128 <= b[a.g++] && 128 <= b[a.g++] && 128 <= b[a.g++] && 128 <= b[a.g++]) return a.j = !0, za(), d;
        O(a);
        return d
    }

    var Ta = [];

    function Ua() {
        this.g = new Uint8Array(64);
        this.h = 0
    }

    function Q(a, b) {
        if (!(a.h + 1 < a.g.length)) {
            var c = a.g;
            a.g = new Uint8Array(Math.ceil(1 + 2 * a.g.length));
            a.g.set(c)
        }
        a.g[a.h++] = b
    }

    Ua.prototype.length = function () {
        return this.h
    };
    Ua.prototype.end = function () {
        var a = this.g, b = this.h;
        this.h = 0;
        return Pa(a, 0, b)
    };

    function R(a, b) {
        for (; 127 < b;) Q(a, b & 127 | 128), b >>>= 7;
        Q(a, b)
    };

    function Va(a) {
        var b = {}, c = void 0 === b.N ? !1 : b.N;
        this.m = {u: void 0 === b.u ? !1 : b.u};
        this.N = c;
        b = this.m;
        Ta.length ? (c = Ta.pop(), b && (c.u = b.u), a && Sa(c, a), a = c) : a = new Ra(a, b);
        this.g = a;
        this.l = this.g.g;
        this.h = this.i = -1;
        this.j = !1
    }

    Va.prototype.reset = function () {
        this.g.reset();
        this.h = this.i = -1
    };

    function Wa(a) {
        var b = a.g;
        (b = b.g == b.i) || (b = a.j) || (b = a.g, b = b.j || 0 > b.g || b.g > b.i);
        if (b) return !1;
        a.l = a.g.g;
        var c = P(a.g);
        b = c >>> 3;
        c &= 7;
        if (!(0 <= c && 5 >= c)) return a.j = !0, ya(c, a.l), !1;
        a.i = b;
        a.h = c;
        return !0
    }

    function Xa(a) {
        switch (a.h) {
            case 0:
                if (0 != a.h) Xa(a); else a:{
                    a = a.g;
                    for (var b = a.g, c = 0; 10 > c; c++) {
                        if (0 === (a.h[b] & 128)) {
                            a.g = b + 1;
                            O(a);
                            break a
                        }
                        b++
                    }
                    a.j = !0;
                    za()
                }
                break;
            case 1:
                a = a.g;
                a.g += 8;
                O(a);
                break;
            case 2:
                2 != a.h ? Xa(a) : (b = P(a.g), a = a.g, a.g += b, O(a));
                break;
            case 5:
                a = a.g;
                a.g += 4;
                O(a);
                break;
            case 3:
                b = a.i;
                do {
                    if (!Wa(a)) {
                        a.j = !0;
                        K(Error("Unmatched start-group tag: stream EOF"));
                        break
                    }
                    if (4 == a.h) {
                        a.i != b && (a.j = !0, K(Error("Unmatched end-group tag")));
                        break
                    }
                    Xa(a)
                } while (1);
                break;
            default:
                a.j = !0, ya(a.h, a.l)
        }
    }

    function Ya(a, b, c) {
        a.N || (a = Pa(a.g.h, c, a.g.g), (c = b.m) ? c.push(a) : b.m = [a])
    }

    var Za = [];

    function $a() {
        this.h = [];
        this.i = 0;
        this.g = new Ua
    }

    function ab(a, b) {
        0 !== b.length && (a.h.push(b), a.i += b.length)
    }

    function bb(a, b, c) {
        R(a.g, 8 * b + 2);
        R(a.g, c.length);
        ab(a, a.g.end());
        ab(a, c)
    };var cb = "function" === typeof Symbol && "symbol" === typeof Symbol() ? Symbol(void 0) : void 0;

    function db(a, b) {
        Object.isFrozen(a) || (cb ? a[cb] |= b : void 0 !== a.g ? a.g |= b : Object.defineProperties(a, {
            g: {
                value: b,
                configurable: !0,
                writable: !0,
                enumerable: !1
            }
        }))
    }

    function eb(a) {
        if (!a) return 0;
        var b;
        cb ? b = a[cb] : b = a.g;
        return null == b ? 0 : b
    }

    function fb(a) {
        if (!Array.isArray(a)) return a;
        db(a, 1);
        return a
    }

    function gb(a) {
        if (!Array.isArray(a)) throw Error("cannot mark non-array as immutable");
        db(a, 2)
    };

    function hb(a) {
        return null !== a && "object" === typeof a && a.constructor === Object
    }

    function ib(a) {
        switch (typeof a) {
            case "number":
                return isFinite(a) ? a : String(a);
            case "object":
                return La && null != a && a instanceof Uint8Array ? Ha(a) : a;
            default:
                return a
        }
    };

    function jb(a, b) {
        if (null != a) return Array.isArray(a) || hb(a) ? kb(a, b) : b(a)
    }

    function kb(a, b) {
        if (Array.isArray(a)) {
            for (var c = Array(a.length), d = 0; d < a.length; d++) c[d] = jb(a[d], b);
            eb(a) & 1 && fb(c);
            return c
        }
        c = {};
        for (d in a) c[d] = jb(a[d], b);
        return c
    };var lb;

    function T(a, b, c) {
        var d = lb;
        lb = null;
        a || (a = d);
        d = this.constructor.ca;
        a || (a = d ? [d] : []);
        this.j = (d ? 0 : -1) - (this.constructor.aa || 0);
        this.i = null;
        this.g = a;
        a:{
            d = this.g.length;
            a = d - 1;
            if (d && (d = this.g[a], hb(d))) {
                this.l = a - this.j;
                this.h = d;
                break a
            }
            void 0 !== b && -1 < b ? (this.l = Math.max(b, a + 1 - this.j), this.h = null) : this.l = Number.MAX_VALUE
        }
        if (c) for (b = 0; b < c.length; b++) a = c[b], a < this.l ? (a += this.j, (d = this.g[a]) ? fb(d) : this.g[a] = mb) : (nb(this), (d = this.h[a]) ? fb(d) : this.h[a] = mb)
    }

    var mb = Object.freeze(fb([]));

    function nb(a) {
        var b = a.l + a.j;
        a.g[b] || (a.h = a.g[b] = {})
    }

    function U(a, b, c) {
        return -1 === b ? null : (void 0 === c ? 0 : c) || b >= a.l ? a.h ? a.h[b] : void 0 : a.g[b + a.j]
    }

    function ob(a, b, c) {
        c = void 0 === c ? !0 : c;
        var d = void 0 === d ? !1 : d;
        var e = U(a, b, d);
        null == e && (e = mb);
        e === mb ? (e = fb([]), V(a, b, e, d)) : c && Array.isArray(e) && eb(e) & 2 && (e = e.slice(), V(a, b, e, d));
        return e
    }

    function W(a, b, c) {
        a = U(a, b);
        a = null == a ? a : +a;
        return null == a ? void 0 === c ? 0 : c : a
    }

    function V(a, b, c, d) {
        (void 0 === d ? 0 : d) || b >= a.l ? (nb(a), a.h[b] = c) : a.g[b + a.j] = c
    }

    function pb(a, b, c) {
        a.i || (a.i = {});
        var d = a.i[c];
        if (!d) {
            var e = ob(a, c, !1);
            d = [];
            for (var g = Array.isArray(e) ? !!(eb(e) & 2) : !1, f = 0; f < e.length; f++) d[f] = new b(e[f]), g && gb(d[f].g);
            g && (gb(d), Object.freeze(d));
            a.i[c] = d
        }
        return d
    }

    function qb(a, b, c, d, e) {
        var g = pb(a, d, b);
        c = c ? c : new d;
        a = ob(a, b);
        void 0 != e ? (g.splice(e, 0, c), a.splice(e, 0, X(c))) : (g.push(c), a.push(X(c)))
    }

    T.prototype.toJSON = function () {
        var a = X(this);
        return kb(a, ib)
    };

    function X(a) {
        if (a.i) for (var b in a.i) {
            var c = a.i[b];
            if (Array.isArray(c)) for (var d = 0; d < c.length; d++) c[d] && X(c[d]); else c && X(c)
        }
        return a.g
    }

    T.prototype.toString = function () {
        return X(this).toString()
    };

    function rb(a, b) {
        a = U(a, b);
        return null == a ? 0 : a
    }

    function sb(a, b) {
        a = U(a, b);
        return null == a ? "" : a
    };

    function tb(a, b) {
        if (a = a.m) {
            ab(b, b.g.end());
            for (var c = 0; c < a.length; c++) ab(b, a[c])
        }
    }

    function ub(a) {
        var b = a[0];
        switch (a.length) {
            case 2:
                var c = a[1];
                return function (h, l, n) {
                    return b(h, l, n, c)
                };
            case 3:
                var d = a[1], e = a[2];
                return function (h, l, n) {
                    return b(h, l, n, d, e)
                };
            case 4:
                var g = a[1], f = a[2], k = a[3];
                return function (h, l, n) {
                    return b(h, l, n, g, f, k)
                };
            default:
                throw Error("unsupported number of parameters, expected [2-4], got " + a.length);
        }
    }

    function vb(a, b, c) {
        for (; Wa(b) && 4 != b.h;) {
            var d = b.i, e = c[d];
            if (e) {
                if (Array.isArray(e) && (e = c[d] = ub(e)), !e(b, a, d)) {
                    d = b;
                    e = a;
                    var g = d.l;
                    Xa(d);
                    Ya(d, e, g)
                }
            } else d = b, e = a, g = d.l, Xa(d), Ya(d, e, g)
        }
        return a
    }

    function wb(a, b) {
        var c = new $a;
        b(a, c);
        a = c.i + c.g.length();
        if (0 === a) c = new Uint8Array(0); else {
            a = new Uint8Array(a);
            for (var d = c.h, e = d.length, g = b = 0; g < e; g++) {
                var f = d[g];
                0 !== f.length && (a.set(f, b), b += f.length)
            }
            d = c.g;
            e = d.h;
            0 !== e && (a.set(d.g.subarray(0, e), b), d.h = 0);
            c.h = [a];
            c = a
        }
        return c
    }

    function xb(a, b, c) {
        if (Za.length) {
            var d = Za.pop();
            a && (Sa(d.g, a), d.i = -1, d.h = -1);
            a = d
        } else a = new Va(a);
        try {
            return c(new b, a)
        } finally {
            b = a.g, b.h = null, b.l = 0, b.i = 0, b.g = 0, b.j = !1, b.u = !1, a.i = -1, a.h = -1, a.j = !1, 100 > Za.length && Za.push(a)
        }
    }

    function Y(a, b, c) {
        b = U(b, c);
        if (null != b) {
            R(a.g, 8 * c + 5);
            a = a.g;
            var d = b;
            d = (c = 0 > d ? 1 : 0) ? -d : d;
            0 === d ? 0 < 1 / d ? M = N = 0 : (N = 0, M = 2147483648) : isNaN(d) ? (N = 0, M = 2147483647) : 3.4028234663852886E38 < d ? (N = 0, M = (c << 31 | 2139095040) >>> 0) : 1.1754943508222875E-38 > d ? (d = Math.round(d / Math.pow(2, -149)), N = 0, M = (c << 31 | d) >>> 0) : (b = Math.floor(Math.log(d) / Math.LN2), d *= Math.pow(2, -b), d = Math.round(8388608 * d), 16777216 <= d && ++b, N = 0, M = (c << 31 | b + 127 << 23 | d & 8388607) >>> 0);
            c = M;
            Q(a, c >>> 0 & 255);
            Q(a, c >>> 8 & 255);
            Q(a, c >>> 16 & 255);
            Q(a, c >>> 24 & 255)
        }
    }

    function Z(a, b, c) {
        if (5 !== a.h) return !1;
        a = a.g;
        var d = a.h[a.g];
        var e = a.h[a.g + 1];
        var g = a.h[a.g + 2], f = a.h[a.g + 3];
        a.g += 4;
        O(a);
        e = (d << 0 | e << 8 | g << 16 | f << 24) >>> 0;
        a = 2 * (e >> 31) + 1;
        d = e >>> 23 & 255;
        e &= 8388607;
        V(b, c, 255 == d ? e ? NaN : Infinity * a : 0 == d ? a * Math.pow(2, -149) * e : a * Math.pow(2, d - 150) * (e + Math.pow(2, 23)));
        return !0
    }

    function yb(a, b, c) {
        if (0 !== a.h) return !1;
        for (var d = a.g, e = 128, g = 0, f = a = 0; 4 > f && 128 <= e; f++) e = d.h[d.g++], g |= (e & 127) << 7 * f;
        128 <= e && (e = d.h[d.g++], g |= (e & 127) << 28, a |= (e & 127) >> 4);
        if (128 <= e) for (f = 0; 5 > f && 128 <= e; f++) e = d.h[d.g++], a |= (e & 127) << 7 * f + 3;
        if (128 > e) {
            d = g >>> 0;
            e = a >>> 0;
            if (a = e & 2147483648) d = ~d + 1 >>> 0, e = ~e >>> 0, 0 == d && (e = e + 1 >>> 0);
            d = 4294967296 * e + (d >>> 0);
            a = a ? -d : d
        } else d.j = !0, za(), a = void 0;
        V(b, c, a);
        return !0
    }

    function zb(a, b, c) {
        if (0 !== a.h) return !1;
        V(b, c, P(a.g));
        return !0
    }

    function Ab(a, b, c) {
        if (2 !== a.h) return !1;
        var d = P(a.g);
        a = a.g;
        var e = a.g;
        a.g += d;
        O(a);
        a = a.h;
        var g;
        if (Ca) (g = Ba) || (g = Ba = new TextDecoder("utf-8", {fatal: !1})), g = g.decode(a.subarray(e, e + d)); else {
            d = e + d;
            for (var f = [], k = null, h, l, n; e < d;) h = a[e++], 128 > h ? f.push(h) : 224 > h ? e >= d ? f.push(65533) : (l = a[e++], 194 > h || 128 !== (l & 192) ? (e--, f.push(65533)) : f.push((h & 31) << 6 | l & 63)) : 240 > h ? e >= d - 1 ? f.push(65533) : (l = a[e++], 128 !== (l & 192) || 224 === h && 160 > l || 237 === h && 160 <= l || 128 !== ((g = a[e++]) & 192) ? (e--, f.push(65533)) : f.push((h & 15) << 12 | (l & 63) << 6 |
                g & 63)) : 244 >= h ? e >= d - 2 ? f.push(65533) : (l = a[e++], 128 !== (l & 192) || 0 !== (h << 28) + (l - 144) >> 30 || 128 !== ((g = a[e++]) & 192) || 128 !== ((n = a[e++]) & 192) ? (e--, f.push(65533)) : (h = (h & 7) << 18 | (l & 63) << 12 | (g & 63) << 6 | n & 63, h -= 65536, f.push((h >> 10 & 1023) + 55296, (h & 1023) + 56320))) : f.push(65533), 8192 <= f.length && (k = Aa(k, f), f.length = 0);
            g = Aa(k, f)
        }
        V(b, c, g);
        return !0
    }

    function Bb(a, b, c, d, e) {
        if (2 !== a.h) return !1;
        var g = new d, f = a.g.i, k = P(a.g), h = a.g.g + k;
        a.g.i = h;
        e(g, a);
        e = h - a.g.g;
        if (0 !== e) throw Error("Message parsing ended unexpectedly. Expected to read " + (k + " bytes, instead read " + (k - e) + " bytes, either the data ended unexpectedly or the message misreported its own length"));
        a.g.g = h;
        a.g.i = f;
        qb(b, c, g, d, void 0);
        return !0
    };

    function Cb(a) {
        T.call(this, a)
    }

    var Db;
    E(Cb, T);

    function Eb(a, b) {
        var c = U(a, 1);
        if (null != c && null != c) {
            R(b.g, 8);
            var d = b.g;
            if (0 <= c) R(d, c); else {
                for (var e = 0; 9 > e; e++) Q(d, c & 127 | 128), c >>= 7;
                Q(d, 1)
            }
        }
        Y(b, a, 2);
        d = U(a, 3);
        null != d && bb(b, 3, Fa(d));
        d = U(a, 4);
        null != d && bb(b, 4, Fa(d));
        tb(a, b)
    }

    function Fb(a, b) {
        return vb(a, b, Db || (Db = {1: zb, 2: Z, 3: Ab, 4: Ab}))
    };

    function Gb(a) {
        T.call(this, a, -1, Hb)
    }

    var Ib;
    E(Gb, T);
    Gb.prototype.addClassification = function (a, b) {
        qb(this, 1, a, Cb, b);
        return this
    };

    function Jb(a, b) {
        return vb(a, b, Ib || (Ib = {1: [Bb, Cb, Fb]}))
    }

    var Hb = [1];

    function Kb(a) {
        T.call(this, a)
    }

    var Lb;
    E(Kb, T);

    function Mb(a, b) {
        Y(b, a, 1);
        Y(b, a, 2);
        Y(b, a, 3);
        Y(b, a, 4);
        Y(b, a, 5);
        tb(a, b)
    }

    function Nb(a, b) {
        return vb(a, b, Lb || (Lb = {1: Z, 2: Z, 3: Z, 4: Z, 5: Z}))
    };

    function Ob(a) {
        T.call(this, a, -1, Pb)
    }

    var Qb;
    E(Ob, T);

    function Rb(a, b) {
        return vb(a, b, Qb || (Qb = {1: [Bb, Kb, Nb]}))
    }

    var Pb = [1];

    function Sb(a) {
        T.call(this, a)
    }

    var Tb;
    E(Sb, T);

    function Ub(a, b) {
        Y(b, a, 1);
        Y(b, a, 2);
        Y(b, a, 3);
        Y(b, a, 4);
        Y(b, a, 5);
        var c = U(a, 6);
        if (null != c && null != c) {
            R(b.g, 48);
            var d = b.g, e = c;
            c = 0 > e;
            e = Math.abs(e);
            var g = e >>> 0;
            e = Math.floor((e - g) / 4294967296);
            e >>>= 0;
            c && (e = ~e >>> 0, g = (~g >>> 0) + 1, 4294967295 < g && (g = 0, e++, 4294967295 < e && (e = 0)));
            M = g;
            N = e;
            c = M;
            for (g = N; 0 < g || 127 < c;) Q(d, c & 127 | 128), c = (c >>> 7 | g << 25) >>> 0, g >>>= 7;
            Q(d, c)
        }
        tb(a, b)
    }

    function Vb(a, b) {
        return vb(a, b, Tb || (Tb = {1: Z, 2: Z, 3: Z, 4: Z, 5: Z, 6: yb}))
    };

    function Wb(a, b, c) {
        c = a.createShader(0 === c ? a.VERTEX_SHADER : a.FRAGMENT_SHADER);
        a.shaderSource(c, b);
        a.compileShader(c);
        if (!a.getShaderParameter(c, a.COMPILE_STATUS)) throw Error("Could not compile WebGL shader.\n\n" + a.getShaderInfoLog(c));
        return c
    };

    function Xb(a) {
        return pb(a, Cb, 1).map(function (b) {
            return {
                index: rb(b, 1),
                X: W(b, 2),
                label: null != U(b, 3) ? sb(b, 3) : void 0,
                displayName: null != U(b, 4) ? sb(b, 4) : void 0
            }
        })
    };

    function Yb(a) {
        return {x: W(a, 1), y: W(a, 2), z: W(a, 3), visibility: null != U(a, 4) ? W(a, 4) : void 0}
    }

    function Zb(a) {
        return pb(xb(a, Ob, Rb), Kb, 1).map(Yb)
    };

    function $b(a, b) {
        this.h = a;
        this.g = b;
        this.l = 0
    }

    function ac(a, b, c) {
        bc(a, b);
        if ("function" === typeof a.g.canvas.transferToImageBitmap) return Promise.resolve(a.g.canvas.transferToImageBitmap());
        if (c) return Promise.resolve(a.g.canvas);
        if ("function" === typeof createImageBitmap) return createImageBitmap(a.g.canvas);
        void 0 === a.i && (a.i = document.createElement("canvas"));
        return new Promise(function (d) {
            a.i.height = a.g.canvas.height;
            a.i.width = a.g.canvas.width;
            a.i.getContext("2d", {}).drawImage(a.g.canvas, 0, 0, a.g.canvas.width, a.g.canvas.height);
            d(a.i)
        })
    }

    function bc(a, b) {
        var c = a.g;
        if (void 0 === a.m) {
            var d = Wb(c, "\n  attribute vec2 aVertex;\n  attribute vec2 aTex;\n  varying vec2 vTex;\n  void main(void) {\n    gl_Position = vec4(aVertex, 0.0, 1.0);\n    vTex = aTex;\n  }", 0),
                e = Wb(c, "\n  precision mediump float;\n  varying vec2 vTex;\n  uniform sampler2D sampler0;\n  void main(){\n    gl_FragColor = texture2D(sampler0, vTex);\n  }", 1),
                g = c.createProgram();
            c.attachShader(g, d);
            c.attachShader(g, e);
            c.linkProgram(g);
            if (!c.getProgramParameter(g, c.LINK_STATUS)) throw Error("Could not compile WebGL program.\n\n" +
                c.getProgramInfoLog(g));
            d = a.m = g;
            c.useProgram(d);
            e = c.getUniformLocation(d, "sampler0");
            a.j = {I: c.getAttribLocation(d, "aVertex"), H: c.getAttribLocation(d, "aTex"), da: e};
            a.s = c.createBuffer();
            c.bindBuffer(c.ARRAY_BUFFER, a.s);
            c.enableVertexAttribArray(a.j.I);
            c.vertexAttribPointer(a.j.I, 2, c.FLOAT, !1, 0, 0);
            c.bufferData(c.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), c.STATIC_DRAW);
            c.bindBuffer(c.ARRAY_BUFFER, null);
            a.o = c.createBuffer();
            c.bindBuffer(c.ARRAY_BUFFER, a.o);
            c.enableVertexAttribArray(a.j.H);
            c.vertexAttribPointer(a.j.H,
                2, c.FLOAT, !1, 0, 0);
            c.bufferData(c.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]), c.STATIC_DRAW);
            c.bindBuffer(c.ARRAY_BUFFER, null);
            c.uniform1i(e, 0)
        }
        d = a.j;
        c.useProgram(a.m);
        c.canvas.width = b.width;
        c.canvas.height = b.height;
        c.viewport(0, 0, b.width, b.height);
        c.activeTexture(c.TEXTURE0);
        a.h.bindTexture2d(b.glName);
        c.enableVertexAttribArray(d.I);
        c.bindBuffer(c.ARRAY_BUFFER, a.s);
        c.vertexAttribPointer(d.I, 2, c.FLOAT, !1, 0, 0);
        c.enableVertexAttribArray(d.H);
        c.bindBuffer(c.ARRAY_BUFFER, a.o);
        c.vertexAttribPointer(d.H,
            2, c.FLOAT, !1, 0, 0);
        c.bindFramebuffer(c.DRAW_FRAMEBUFFER ? c.DRAW_FRAMEBUFFER : c.FRAMEBUFFER, null);
        c.clearColor(0, 0, 0, 0);
        c.clear(c.COLOR_BUFFER_BIT);
        c.colorMask(!0, !0, !0, !0);
        c.drawArrays(c.TRIANGLE_FAN, 0, 4);
        c.disableVertexAttribArray(d.I);
        c.disableVertexAttribArray(d.H);
        c.bindBuffer(c.ARRAY_BUFFER, null);
        a.h.bindTexture2d(0)
    }

    function cc(a) {
        this.g = a
    };var dc = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 9, 1, 7, 0, 65, 0, 253, 15, 26, 11]);

    function ec(a, b) {
        return b + a
    }

    function fc(a, b) {
        window[a] = b
    }

    function gc(a) {
        var b = document.createElement("script");
        b.setAttribute("src", a);
        b.setAttribute("crossorigin", "anonymous");
        return new Promise(function (c) {
            b.addEventListener("load", function () {
                c()
            }, !1);
            b.addEventListener("error", function () {
                c()
            }, !1);
            document.body.appendChild(b)
        })
    }

    function hc() {
        return H(function (a) {
            switch (a.g) {
                case 1:
                    return a.m = 2, F(a, WebAssembly.instantiate(dc), 4);
                case 4:
                    a.g = 3;
                    a.m = 0;
                    break;
                case 2:
                    return a.m = 0, a.j = null, a.return(!1);
                case 3:
                    return a.return(!0)
            }
        })
    }

    function ic(a) {
        this.g = a;
        this.listeners = {};
        this.j = {};
        this.F = {};
        this.m = {};
        this.s = {};
        this.G = this.o = this.R = !0;
        this.C = Promise.resolve();
        this.P = "";
        this.B = {};
        this.locateFile = a && a.locateFile || ec;
        if ("object" === typeof window) var b = window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/"; else if ("undefined" !== typeof location) b = location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/"; else throw Error("solutions can only be loaded on a web page or in a web worker");
        this.S = b;
        if (a.options) {
            b = C(Object.keys(a.options));
            for (var c = b.next(); !c.done; c = b.next()) {
                c = c.value;
                var d = a.options[c].default;
                void 0 !== d && (this.j[c] = "function" === typeof d ? d() : d)
            }
        }
    }

    x = ic.prototype;
    x.close = function () {
        this.i && this.i.delete();
        return Promise.resolve()
    };

    function jc(a) {
        var b, c, d, e, g, f, k, h, l, n, r;
        return H(function (p) {
            switch (p.g) {
                case 1:
                    if (!a.R) return p.return();
                    b = void 0 === a.g.files ? [] : "function" === typeof a.g.files ? a.g.files(a.j) : a.g.files;
                    return F(p, hc(), 2);
                case 2:
                    c = p.h;
                    if ("object" === typeof window) return fc("createMediapipeSolutionsWasm", {locateFile: a.locateFile}), fc("createMediapipeSolutionsPackedAssets", {locateFile: a.locateFile}), f = b.filter(function (m) {
                        return void 0 !== m.data
                    }), k = b.filter(function (m) {
                        return void 0 === m.data
                    }), h = Promise.all(f.map(function (m) {
                        var q =
                            kc(a, m.url);
                        if (void 0 !== m.path) {
                            var t = m.path;
                            q = q.then(function (w) {
                                a.overrideFile(t, w);
                                return Promise.resolve(w)
                            })
                        }
                        return q
                    })), l = Promise.all(k.map(function (m) {
                        return void 0 === m.simd || m.simd && c || !m.simd && !c ? gc(a.locateFile(m.url, a.S)) : Promise.resolve()
                    })).then(function () {
                        var m, q, t;
                        return H(function (w) {
                            if (1 == w.g) return m = window.createMediapipeSolutionsWasm, q = window.createMediapipeSolutionsPackedAssets, t = a, F(w, m(q), 2);
                            t.h = w.h;
                            w.g = 0
                        })
                    }), n = function () {
                        return H(function (m) {
                            a.g.graph && a.g.graph.url ? m = F(m,
                                kc(a, a.g.graph.url), 0) : (m.g = 0, m = void 0);
                            return m
                        })
                    }(), F(p, Promise.all([l, h, n]), 7);
                    if ("function" !== typeof importScripts) throw Error("solutions can only be loaded on a web page or in a web worker");
                    d = b.filter(function (m) {
                        return void 0 === m.simd || m.simd && c || !m.simd && !c
                    }).map(function (m) {
                        return a.locateFile(m.url, a.S)
                    });
                    importScripts.apply(null, ea(d));
                    e = a;
                    return F(p, createMediapipeSolutionsWasm(Module), 6);
                case 6:
                    e.h = p.h;
                    a.l = new OffscreenCanvas(1, 1);
                    a.h.canvas = a.l;
                    g = a.h.GL.createContext(a.l, {
                        antialias: !1,
                        alpha: !1,
                        majorVersion: 1
                    });
                    a.h.GL.makeContextCurrent(g);
                    p.g = 4;
                    break;
                case 7:
                    a.l = document.createElement("canvas");
                    r = a.l.getContext("webgl2", {});
                    if (!r && (r = a.l.getContext("webgl", {}), !r)) return alert("Failed to create WebGL canvas context when passing video frame."), p.return();
                    a.D = r;
                    a.h.canvas = a.l;
                    a.h.createContext(a.l, !0, !0, {});
                case 4:
                    a.i = new a.h.SolutionWasm, a.R = !1, p.g = 0
            }
        })
    }

    function lc(a) {
        var b, c, d, e, g, f, k, h;
        return H(function (l) {
            if (1 == l.g) {
                if (a.g.graph && a.g.graph.url && a.P === a.g.graph.url) return l.return();
                a.o = !0;
                if (!a.g.graph || !a.g.graph.url) {
                    l.g = 2;
                    return
                }
                a.P = a.g.graph.url;
                return F(l, kc(a, a.g.graph.url), 3)
            }
            2 != l.g && (b = l.h, a.i.loadGraph(b));
            c = C(Object.keys(a.B));
            for (d = c.next(); !d.done; d = c.next()) e = d.value, a.i.overrideFile(e, a.B[e]);
            a.B = {};
            if (a.g.listeners) for (g = C(a.g.listeners), f = g.next(); !f.done; f = g.next()) k = f.value, mc(a, k);
            h = a.j;
            a.j = {};
            a.setOptions(h);
            l.g = 0
        })
    }

    x.reset = function () {
        var a = this;
        return H(function (b) {
            a.i && (a.i.reset(), a.m = {}, a.s = {});
            b.g = 0
        })
    };
    x.setOptions = function (a, b) {
        var c = this;
        if (b = b || this.g.options) {
            for (var d = [], e = [], g = {}, f = C(Object.keys(a)), k = f.next(); !k.done; g = {
                K: g.K,
                L: g.L
            }, k = f.next()) {
                var h = k.value;
                h in this.j && this.j[h] === a[h] || (this.j[h] = a[h], k = b[h], void 0 !== k && (k.onChange && (g.K = k.onChange, g.L = a[h], d.push(function (l) {
                    return function () {
                        var n;
                        return H(function (r) {
                            if (1 == r.g) return F(r, l.K(l.L), 2);
                            n = r.h;
                            !0 === n && (c.o = !0);
                            r.g = 0
                        })
                    }
                }(g))), k.graphOptionXref && (h = {
                    valueNumber: 1 === k.type ? a[h] : 0, valueBoolean: 0 === k.type ? a[h] : !1, valueString: 2 ===
                    k.type ? a[h] : ""
                }, k = Object.assign(Object.assign(Object.assign({}, {
                    calculatorName: "",
                    calculatorIndex: 0
                }), k.graphOptionXref), h), e.push(k))))
            }
            if (0 !== d.length || 0 !== e.length) this.o = !0, this.A = (void 0 === this.A ? [] : this.A).concat(e), this.v = (void 0 === this.v ? [] : this.v).concat(d)
        }
    };

    function nc(a) {
        var b, c, d, e, g, f, k;
        return H(function (h) {
            switch (h.g) {
                case 1:
                    if (!a.o) return h.return();
                    if (!a.v) {
                        h.g = 2;
                        break
                    }
                    b = C(a.v);
                    c = b.next();
                case 3:
                    if (c.done) {
                        h.g = 5;
                        break
                    }
                    d = c.value;
                    return F(h, d(), 4);
                case 4:
                    c = b.next();
                    h.g = 3;
                    break;
                case 5:
                    a.v = void 0;
                case 2:
                    if (a.A) {
                        e = new a.h.GraphOptionChangeRequestList;
                        g = C(a.A);
                        for (f = g.next(); !f.done; f = g.next()) k = f.value, e.push_back(k);
                        a.i.changeOptions(e);
                        e.delete();
                        a.A = void 0
                    }
                    a.o = !1;
                    h.g = 0
            }
        })
    }

    x.initialize = function () {
        var a = this;
        return H(function (b) {
            return 1 == b.g ? F(b, jc(a), 2) : 3 != b.g ? F(b, lc(a), 3) : F(b, nc(a), 0)
        })
    };

    function kc(a, b) {
        var c, d;
        return H(function (e) {
            if (b in a.F) return e.return(a.F[b]);
            c = a.locateFile(b, "");
            d = fetch(c).then(function (g) {
                return g.arrayBuffer()
            });
            a.F[b] = d;
            return e.return(d)
        })
    }

    x.overrideFile = function (a, b) {
        this.i ? this.i.overrideFile(a, b) : this.B[a] = b
    };
    x.clearOverriddenFiles = function () {
        this.B = {};
        this.i && this.i.clearOverriddenFiles()
    };
    x.send = function (a, b) {
        var c = this, d, e, g, f, k, h, l, n, r;
        return H(function (p) {
            switch (p.g) {
                case 1:
                    if (!c.g.inputs) return p.return();
                    d = 1E3 * (void 0 === b || null === b ? performance.now() : b);
                    return F(p, c.C, 2);
                case 2:
                    return F(p, c.initialize(), 3);
                case 3:
                    e = new c.h.PacketDataList;
                    g = C(Object.keys(a));
                    for (f = g.next(); !f.done; f = g.next()) if (k = f.value, h = c.g.inputs[k]) {
                        a:{
                            var m = a[k];
                            switch (h.type) {
                                case "video":
                                    var q = c.m[h.stream];
                                    q || (q = new $b(c.h, c.D), c.m[h.stream] = q);
                                    0 === q.l && (q.l = q.h.createTexture());
                                    if ("undefined" !== typeof HTMLVideoElement &&
                                        m instanceof HTMLVideoElement) {
                                        var t = m.videoWidth;
                                        var w = m.videoHeight
                                    } else "undefined" !== typeof HTMLImageElement && m instanceof HTMLImageElement ? (t = m.naturalWidth, w = m.naturalHeight) : (t = m.width, w = m.height);
                                    w = {glName: q.l, width: t, height: w};
                                    t = q.g;
                                    t.canvas.width = w.width;
                                    t.canvas.height = w.height;
                                    t.activeTexture(t.TEXTURE0);
                                    q.h.bindTexture2d(q.l);
                                    t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, t.RGBA, t.UNSIGNED_BYTE, m);
                                    q.h.bindTexture2d(0);
                                    q = w;
                                    break a;
                                case "detections":
                                    q = c.m[h.stream];
                                    q || (q = new cc(c.h), c.m[h.stream] = q);
                                    q.data || (q.data = new q.g.DetectionListData);
                                    q.data.reset(m.length);
                                    for (w = 0; w < m.length; ++w) {
                                        t = m[w];
                                        var v = q.data, A = v.setBoundingBox, I = w;
                                        var D = t.T;
                                        var u = new Sb;
                                        V(u, 1, D.Y);
                                        V(u, 2, D.Z);
                                        V(u, 3, D.height);
                                        V(u, 4, D.width);
                                        V(u, 5, D.rotation);
                                        V(u, 6, D.W);
                                        D = wb(u, Ub);
                                        A.call(v, I, D);
                                        if (t.O) for (v = 0; v < t.O.length; ++v) {
                                            u = t.O[v];
                                            var z = u.visibility ? !0 : !1;
                                            A = q.data;
                                            I = A.addNormalizedLandmark;
                                            D = w;
                                            u = Object.assign(Object.assign({}, u), {visibility: z ? u.visibility : 0});
                                            z = new Kb;
                                            V(z, 1, u.x);
                                            V(z, 2, u.y);
                                            V(z, 3, u.z);
                                            u.visibility && V(z, 4, u.visibility);
                                            u = wb(z, Mb);
                                            I.call(A, D, u)
                                        }
                                        if (t.M) for (v = 0; v < t.M.length; ++v) A = q.data, I = A.addClassification, D = w, u = t.M[v], z = new Cb, V(z, 2, u.X), u.index && V(z, 1, u.index), u.label && V(z, 3, u.label), u.displayName && V(z, 4, u.displayName), u = wb(z, Eb), I.call(A, D, u)
                                    }
                                    q = q.data;
                                    break a;
                                default:
                                    q = {}
                            }
                        }
                        l = q;
                        n = h.stream;
                        switch (h.type) {
                            case "video":
                                e.pushTexture2d(Object.assign(Object.assign({}, l), {stream: n, timestamp: d}));
                                break;
                            case "detections":
                                r = l;
                                r.stream = n;
                                r.timestamp = d;
                                e.pushDetectionList(r);
                                break;
                            default:
                                throw Error("Unknown input config type: '" +
                                    h.type + "'");
                        }
                    }
                    c.i.send(e);
                    return F(p, c.C, 4);
                case 4:
                    e.delete(), p.g = 0
            }
        })
    };

    function oc(a, b, c) {
        var d, e, g, f, k, h, l, n, r, p, m, q, t, w;
        return H(function (v) {
            switch (v.g) {
                case 1:
                    if (!c) return v.return(b);
                    d = {};
                    e = 0;
                    g = C(Object.keys(c));
                    for (f = g.next(); !f.done; f = g.next()) k = f.value, h = c[k], "string" !== typeof h && "texture" === h.type && void 0 !== b[h.stream] && ++e;
                    1 < e && (a.G = !1);
                    l = C(Object.keys(c));
                    f = l.next();
                case 2:
                    if (f.done) {
                        v.g = 4;
                        break
                    }
                    n = f.value;
                    r = c[n];
                    if ("string" === typeof r) return t = d, w = n, F(v, pc(a, n, b[r]), 14);
                    p = b[r.stream];
                    if ("detection_list" === r.type) {
                        if (p) {
                            var A = p.getRectList();
                            for (var I = p.getLandmarksList(),
                                     D = p.getClassificationsList(), u = [], z = 0; z < A.size(); ++z) {
                                var S = xb(A.get(z), Sb, Vb);
                                S = {
                                    T: {
                                        Y: W(S, 1),
                                        Z: W(S, 2),
                                        height: W(S, 3),
                                        width: W(S, 4),
                                        rotation: W(S, 5, 0),
                                        W: rb(S, 6)
                                    }, O: Zb(I.get(z)), M: Xb(xb(D.get(z), Gb, Jb))
                                };
                                u.push(S)
                            }
                            A = u
                        } else A = [];
                        d[n] = A;
                        v.g = 7;
                        break
                    }
                    if ("proto_list" === r.type) {
                        if (p) {
                            A = Array(p.size());
                            for (I = 0; I < p.size(); I++) A[I] = p.get(I);
                            p.delete()
                        } else A = [];
                        d[n] = A;
                        v.g = 7;
                        break
                    }
                    if (void 0 === p) {
                        v.g = 3;
                        break
                    }
                    if ("float_list" === r.type) {
                        d[n] = p;
                        v.g = 7;
                        break
                    }
                    if ("proto" === r.type) {
                        d[n] = p;
                        v.g = 7;
                        break
                    }
                    if ("texture" !== r.type) throw Error("Unknown output config type: '" +
                        r.type + "'");
                    m = a.s[n];
                    m || (m = new $b(a.h, a.D), a.s[n] = m);
                    return F(v, ac(m, p, a.G), 13);
                case 13:
                    q = v.h, d[n] = q;
                case 7:
                    r.transform && d[n] && (d[n] = r.transform(d[n]));
                    v.g = 3;
                    break;
                case 14:
                    t[w] = v.h;
                case 3:
                    f = l.next();
                    v.g = 2;
                    break;
                case 4:
                    return v.return(d)
            }
        })
    }

    function pc(a, b, c) {
        var d;
        return H(function (e) {
            return "number" === typeof c || c instanceof Uint8Array || c instanceof a.h.Uint8BlobList ? e.return(c) : c instanceof a.h.Texture2dDataOut ? (d = a.s[b], d || (d = new $b(a.h, a.D), a.s[b] = d), e.return(ac(d, c, a.G))) : e.return(void 0)
        })
    }

    function mc(a, b) {
        for (var c = b.name || "$", d = [].concat(ea(b.wants)), e = new a.h.StringList, g = C(b.wants), f = g.next(); !f.done; f = g.next()) e.push_back(f.value);
        g = a.h.PacketListener.implement({
            onResults: function (k) {
                for (var h = {}, l = 0; l < b.wants.length; ++l) h[d[l]] = k.get(l);
                var n = a.listeners[c];
                n && (a.C = oc(a, h, b.outs).then(function (r) {
                    r = n(r);
                    for (var p = 0; p < b.wants.length; ++p) {
                        var m = h[d[p]];
                        "object" === typeof m && m.hasOwnProperty && m.hasOwnProperty("delete") && m.delete()
                    }
                    r && (a.C = r)
                }))
            }
        });
        a.i.attachMultiListener(e, g);
        e.delete()
    }

    x.onResults = function (a, b) {
        this.listeners[b || "$"] = a
    };
    J("Solution", ic);
    J("OptionType", {BOOL: 0, NUMBER: 1, $: 2, 0: "BOOL", 1: "NUMBER", 2: "STRING"});

    function qc(a) {
        void 0 === a && (a = 0);
        switch (a) {
            case 1:
                return "pose_landmark_full.tflite";
            case 2:
                return "pose_landmark_heavy.tflite";
            default:
                return "pose_landmark_lite.tflite"
        }
    }

    function rc(a) {
        var b = this;
        a = a || {};
        this.g = new ic({
            locateFile: a.locateFile, files: function (c) {
                return [{url: "pose_solution_packed_assets_loader.js"}, {
                    simd: !1,
                    url: "pose_solution_wasm_bin.js"
                }, {simd: !0, url: "pose_solution_simd_wasm_bin.js"}, {data: !0, url: qc(c.modelComplexity)}]
            }, graph: {url: "pose_web.binarypb"}, listeners: [{
                wants: ["pose_landmarks", "world_landmarks", "segmentation_mask", "image_transformed"], outs: {
                    image: {type: "texture", stream: "image_transformed"},
                    poseLandmarks: {
                        type: "proto", stream: "pose_landmarks",
                        transform: Zb
                    },
                    poseWorldLandmarks: {type: "proto", stream: "world_landmarks", transform: Zb},
                    segmentationMask: {type: "texture", stream: "segmentation_mask"}
                }
            }], inputs: {image: {type: "video", stream: "input_frames_gpu"}}, options: {
                useCpuInference: {
                    type: 0,
                    graphOptionXref: {calculatorType: "InferenceCalculator", fieldName: "use_cpu_inference"},
                    default: "iPad Simulator;iPhone Simulator;iPod Simulator;iPad;iPhone;iPod".split(";").includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document
                },
                selfieMode: {
                    type: 0,
                    graphOptionXref: {
                        calculatorType: "GlScalerCalculator",
                        calculatorIndex: 1,
                        fieldName: "flip_horizontal"
                    }
                },
                modelComplexity: {
                    type: 1,
                    graphOptionXref: {
                        calculatorType: "ConstantSidePacketCalculator",
                        calculatorName: "ConstantSidePacketCalculatorModelComplexity",
                        fieldName: "int_value"
                    },
                    onChange: function (c) {
                        var d, e, g;
                        return H(function (f) {
                            if (1 == f.g) return d = qc(c), e = "third_party/mediapipe/modules/pose_landmark/" + d, F(f, kc(b.g, d), 2);
                            g = f.h;
                            b.g.overrideFile(e, g);
                            return f.return(!0)
                        })
                    }
                },
                smoothLandmarks: {
                    type: 0,
                    graphOptionXref: {
                        calculatorType: "ConstantSidePacketCalculator",
                        calculatorName: "ConstantSidePacketCalculatorSmoothLandmarks",
                        fieldName: "bool_value"
                    }
                },
                enableSegmentation: {
                    type: 0,
                    graphOptionXref: {
                        calculatorType: "ConstantSidePacketCalculator",
                        calculatorName: "ConstantSidePacketCalculatorEnableSegmentation",
                        fieldName: "bool_value"
                    }
                },
                smoothSegmentation: {
                    type: 0,
                    graphOptionXref: {
                        calculatorType: "ConstantSidePacketCalculator",
                        calculatorName: "ConstantSidePacketCalculatorSmoothSegmentation",
                        fieldName: "bool_value"
                    }
                },
                minDetectionConfidence: {
                    type: 1,
                    graphOptionXref: {
                        calculatorType: "TensorsToDetectionsCalculator",
                        calculatorName: "poselandmarkgpu__posedetectiongpu__TensorsToDetectionsCalculator",
                        fieldName: "min_score_thresh"
                    }
                },
                minTrackingConfidence: {
                    type: 1,
                    graphOptionXref: {
                        calculatorType: "ThresholdingCalculator",
                        calculatorName: "poselandmarkgpu__poselandmarkbyroigpu__tensorstoposelandmarksandsegmentation__ThresholdingCalculator",
                        fieldName: "threshold"
                    }
                }
            }
        })
    }

    x = rc.prototype;
    x.reset = function () {
        this.g.reset()
    };
    x.close = function () {
        this.g.close();
        return Promise.resolve()
    };
    x.onResults = function (a) {
        this.g.onResults(a)
    };
    x.initialize = function () {
        var a = this;
        return H(function (b) {
            return F(b, a.g.initialize(), 0)
        })
    };
    x.send = function (a, b) {
        var c = this;
        return H(function (d) {
            return F(d, c.g.send(a, b), 0)
        })
    };
    x.setOptions = function (a) {
        this.g.setOptions(a)
    };
    J("Pose", rc);
    J("POSE_CONNECTIONS", [[0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32], [27, 31], [28, 32]]);
    J("POSE_LANDMARKS", {
        NOSE: 0,
        LEFT_EYE_INNER: 1,
        LEFT_EYE: 2,
        LEFT_EYE_OUTER: 3,
        RIGHT_EYE_INNER: 4,
        RIGHT_EYE: 5,
        RIGHT_EYE_OUTER: 6,
        LEFT_EAR: 7,
        RIGHT_EAR: 8,
        LEFT_RIGHT: 9,
        RIGHT_LEFT: 10,
        LEFT_SHOULDER: 11,
        RIGHT_SHOULDER: 12,
        LEFT_ELBOW: 13,
        RIGHT_ELBOW: 14,
        LEFT_WRIST: 15,
        RIGHT_WRIST: 16,
        LEFT_PINKY: 17,
        RIGHT_PINKY: 18,
        LEFT_INDEX: 19,
        RIGHT_INDEX: 20,
        LEFT_THUMB: 21,
        RIGHT_THUMB: 22,
        LEFT_HIP: 23,
        RIGHT_HIP: 24,
        LEFT_KNEE: 25,
        RIGHT_KNEE: 26,
        LEFT_ANKLE: 27,
        RIGHT_ANKLE: 28,
        LEFT_HEEL: 29,
        RIGHT_HEEL: 30,
        LEFT_FOOT_INDEX: 31,
        RIGHT_FOOT_INDEX: 32
    });
    J("POSE_LANDMARKS_LEFT", {
        LEFT_EYE_INNER: 1,
        LEFT_EYE: 2,
        LEFT_EYE_OUTER: 3,
        LEFT_EAR: 7,
        LEFT_RIGHT: 9,
        LEFT_SHOULDER: 11,
        LEFT_ELBOW: 13,
        LEFT_WRIST: 15,
        LEFT_PINKY: 17,
        LEFT_INDEX: 19,
        LEFT_THUMB: 21,
        LEFT_HIP: 23,
        LEFT_KNEE: 25,
        LEFT_ANKLE: 27,
        LEFT_HEEL: 29,
        LEFT_FOOT_INDEX: 31
    });
    J("POSE_LANDMARKS_RIGHT", {
        RIGHT_EYE_INNER: 4,
        RIGHT_EYE: 5,
        RIGHT_EYE_OUTER: 6,
        RIGHT_EAR: 8,
        RIGHT_LEFT: 10,
        RIGHT_SHOULDER: 12,
        RIGHT_ELBOW: 14,
        RIGHT_WRIST: 16,
        RIGHT_PINKY: 18,
        RIGHT_INDEX: 20,
        RIGHT_THUMB: 22,
        RIGHT_HIP: 24,
        RIGHT_KNEE: 26,
        RIGHT_ANKLE: 28,
        RIGHT_HEEL: 30,
        RIGHT_FOOT_INDEX: 32
    });
    J("POSE_LANDMARKS_NEUTRAL", {NOSE: 0});
    J("VERSION", "0.5.1635988162");
}).call(this);
