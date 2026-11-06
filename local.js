(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // stub.js
  var require_stub = __commonJS({
    "stub.js"(exports, module) {
      module.exports = {};
    }
  });

  // node_modules/sql.js/dist/sql-wasm.js
  var require_sql_wasm = __commonJS({
    "node_modules/sql.js/dist/sql-wasm.js"(exports, module) {
      var initSqlJsPromise = void 0;
      var initSqlJs2 = function(moduleConfig) {
        if (initSqlJsPromise) {
          return initSqlJsPromise;
        }
        initSqlJsPromise = new Promise(function(resolveModule, reject) {
          var Module = typeof moduleConfig !== "undefined" ? moduleConfig : {};
          var originalOnAbortFunction = Module["onAbort"];
          Module["onAbort"] = function(errorThatCausedAbort) {
            reject(new Error(errorThatCausedAbort));
            if (originalOnAbortFunction) {
              originalOnAbortFunction(errorThatCausedAbort);
            }
          };
          Module["postRun"] = Module["postRun"] || [];
          Module["postRun"].push(function() {
            resolveModule(Module);
          });
          module = void 0;
          var f;
          f ||= typeof Module != "undefined" ? Module : {};
          var aa = "object" == typeof window, ba = "undefined" != typeof WorkerGlobalScope, ca = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node && "renderer" != process.type;
          "use strict";
          f.onRuntimeInitialized = function() {
            function a(g, l) {
              switch (typeof l) {
                case "boolean":
                  dc(g, l ? 1 : 0);
                  break;
                case "number":
                  ec(g, l);
                  break;
                case "string":
                  fc(g, l, -1, -1);
                  break;
                case "object":
                  if (null === l) lb(g);
                  else if (null != l.length) {
                    var n = da(l, ea);
                    gc(g, n, l.length, -1);
                    fa(n);
                  } else va(g, "Wrong API use : tried to return a value of an unknown type (" + l + ").", -1);
                  break;
                default:
                  lb(g);
              }
            }
            function b(g, l) {
              for (var n = [], r = 0; r < g; r += 1) {
                var t = m(l + 4 * r, "i32"), y = hc(t);
                if (1 === y || 2 === y) t = ic(t);
                else if (3 === y) t = jc(t);
                else if (4 === y) {
                  y = t;
                  t = kc(y);
                  y = lc(y);
                  for (var L = new Uint8Array(t), J = 0; J < t; J += 1) L[J] = p[y + J];
                  t = L;
                } else t = null;
                n.push(t);
              }
              return n;
            }
            function c(g, l) {
              this.Qa = g;
              this.db = l;
              this.Oa = 1;
              this.lb = [];
            }
            function d(g, l) {
              this.db = l;
              l = ha(g) + 1;
              this.eb = ia(l);
              if (null === this.eb) throw Error("Unable to allocate memory for the SQL string");
              u(g, x, this.eb, l);
              this.kb = this.eb;
              this.Za = this.pb = null;
            }
            function e(g) {
              this.filename = "dbfile_" + (4294967295 * Math.random() >>> 0);
              if (null != g) {
                var l = this.filename, n = "/", r = l;
                n && (n = "string" == typeof n ? n : ja(n), r = l ? ka(n + "/" + l) : n);
                l = la(true, true);
                r = ma(r, l);
                if (g) {
                  if ("string" == typeof g) {
                    n = Array(g.length);
                    for (var t = 0, y = g.length; t < y; ++t) n[t] = g.charCodeAt(t);
                    g = n;
                  }
                  na(r, l | 146);
                  n = oa(r, 577);
                  pa(n, g, 0, g.length, 0);
                  qa(n);
                  na(r, l);
                }
              }
              this.handleError(q(this.filename, h));
              this.db = m(h, "i32");
              ob(this.db);
              this.fb = {};
              this.Sa = {};
            }
            var h = z(4), k = f.cwrap, q = k("sqlite3_open", "number", ["string", "number"]), w = k("sqlite3_close_v2", "number", ["number"]), v = k("sqlite3_exec", "number", ["number", "string", "number", "number", "number"]), C = k("sqlite3_changes", "number", ["number"]), G = k("sqlite3_prepare_v2", "number", ["number", "string", "number", "number", "number"]), pb = k("sqlite3_sql", "string", ["number"]), nc = k("sqlite3_normalized_sql", "string", ["number"]), qb = k("sqlite3_prepare_v2", "number", ["number", "number", "number", "number", "number"]), oc = k("sqlite3_bind_text", "number", ["number", "number", "number", "number", "number"]), rb = k("sqlite3_bind_blob", "number", ["number", "number", "number", "number", "number"]), pc = k("sqlite3_bind_double", "number", ["number", "number", "number"]), qc = k(
              "sqlite3_bind_int",
              "number",
              ["number", "number", "number"]
            ), rc = k("sqlite3_bind_parameter_index", "number", ["number", "string"]), sc = k("sqlite3_step", "number", ["number"]), tc = k("sqlite3_errmsg", "string", ["number"]), uc = k("sqlite3_column_count", "number", ["number"]), vc = k("sqlite3_data_count", "number", ["number"]), wc = k("sqlite3_column_double", "number", ["number", "number"]), sb = k("sqlite3_column_text", "string", ["number", "number"]), xc = k("sqlite3_column_blob", "number", ["number", "number"]), yc = k("sqlite3_column_bytes", "number", [
              "number",
              "number"
            ]), zc = k("sqlite3_column_type", "number", ["number", "number"]), Ac = k("sqlite3_column_name", "string", ["number", "number"]), Bc = k("sqlite3_reset", "number", ["number"]), Cc = k("sqlite3_clear_bindings", "number", ["number"]), Dc = k("sqlite3_finalize", "number", ["number"]), tb = k("sqlite3_create_function_v2", "number", "number string number number number number number number number".split(" ")), hc = k("sqlite3_value_type", "number", ["number"]), kc = k("sqlite3_value_bytes", "number", ["number"]), jc = k(
              "sqlite3_value_text",
              "string",
              ["number"]
            ), lc = k("sqlite3_value_blob", "number", ["number"]), ic = k("sqlite3_value_double", "number", ["number"]), ec = k("sqlite3_result_double", "", ["number", "number"]), lb = k("sqlite3_result_null", "", ["number"]), fc = k("sqlite3_result_text", "", ["number", "string", "number", "number"]), gc = k("sqlite3_result_blob", "", ["number", "number", "number", "number"]), dc = k("sqlite3_result_int", "", ["number", "number"]), va = k("sqlite3_result_error", "", ["number", "string", "number"]), ub = k(
              "sqlite3_aggregate_context",
              "number",
              ["number", "number"]
            ), ob = k("RegisterExtensionFunctions", "number", ["number"]), vb = k("sqlite3_update_hook", "number", ["number", "number", "number"]);
            c.prototype.bind = function(g) {
              if (!this.Qa) throw "Statement closed";
              this.reset();
              return Array.isArray(g) ? this.Cb(g) : null != g && "object" === typeof g ? this.Db(g) : true;
            };
            c.prototype.step = function() {
              if (!this.Qa) throw "Statement closed";
              this.Oa = 1;
              var g = sc(this.Qa);
              switch (g) {
                case 100:
                  return true;
                case 101:
                  return false;
                default:
                  throw this.db.handleError(g);
              }
            };
            c.prototype.wb = function(g) {
              null == g && (g = this.Oa, this.Oa += 1);
              return wc(this.Qa, g);
            };
            c.prototype.Gb = function(g) {
              null == g && (g = this.Oa, this.Oa += 1);
              g = sb(this.Qa, g);
              if ("function" !== typeof BigInt) throw Error("BigInt is not supported");
              return BigInt(g);
            };
            c.prototype.Hb = function(g) {
              null == g && (g = this.Oa, this.Oa += 1);
              return sb(this.Qa, g);
            };
            c.prototype.getBlob = function(g) {
              null == g && (g = this.Oa, this.Oa += 1);
              var l = yc(this.Qa, g);
              g = xc(this.Qa, g);
              for (var n = new Uint8Array(l), r = 0; r < l; r += 1) n[r] = p[g + r];
              return n;
            };
            c.prototype.get = function(g, l) {
              l = l || {};
              null != g && this.bind(g) && this.step();
              g = [];
              for (var n = vc(this.Qa), r = 0; r < n; r += 1) switch (zc(this.Qa, r)) {
                case 1:
                  var t = l.useBigInt ? this.Gb(r) : this.wb(r);
                  g.push(t);
                  break;
                case 2:
                  g.push(this.wb(r));
                  break;
                case 3:
                  g.push(this.Hb(r));
                  break;
                case 4:
                  g.push(this.getBlob(r));
                  break;
                default:
                  g.push(null);
              }
              return g;
            };
            c.prototype.getColumnNames = function() {
              for (var g = [], l = uc(this.Qa), n = 0; n < l; n += 1) g.push(Ac(this.Qa, n));
              return g;
            };
            c.prototype.getAsObject = function(g, l) {
              g = this.get(g, l);
              l = this.getColumnNames();
              for (var n = {}, r = 0; r < l.length; r += 1) n[l[r]] = g[r];
              return n;
            };
            c.prototype.getSQL = function() {
              return pb(this.Qa);
            };
            c.prototype.getNormalizedSQL = function() {
              return nc(this.Qa);
            };
            c.prototype.run = function(g) {
              null != g && this.bind(g);
              this.step();
              return this.reset();
            };
            c.prototype.sb = function(g, l) {
              null == l && (l = this.Oa, this.Oa += 1);
              g = ra(g);
              var n = da(g, ea);
              this.lb.push(n);
              this.db.handleError(oc(this.Qa, l, n, g.length - 1, 0));
            };
            c.prototype.Bb = function(g, l) {
              null == l && (l = this.Oa, this.Oa += 1);
              var n = da(g, ea);
              this.lb.push(n);
              this.db.handleError(rb(
                this.Qa,
                l,
                n,
                g.length,
                0
              ));
            };
            c.prototype.rb = function(g, l) {
              null == l && (l = this.Oa, this.Oa += 1);
              this.db.handleError((g === (g | 0) ? qc : pc)(this.Qa, l, g));
            };
            c.prototype.Eb = function(g) {
              null == g && (g = this.Oa, this.Oa += 1);
              rb(this.Qa, g, 0, 0, 0);
            };
            c.prototype.tb = function(g, l) {
              null == l && (l = this.Oa, this.Oa += 1);
              switch (typeof g) {
                case "string":
                  this.sb(g, l);
                  return;
                case "number":
                  this.rb(g, l);
                  return;
                case "bigint":
                  this.sb(g.toString(), l);
                  return;
                case "boolean":
                  this.rb(g + 0, l);
                  return;
                case "object":
                  if (null === g) {
                    this.Eb(l);
                    return;
                  }
                  if (null != g.length) {
                    this.Bb(
                      g,
                      l
                    );
                    return;
                  }
              }
              throw "Wrong API use : tried to bind a value of an unknown type (" + g + ").";
            };
            c.prototype.Db = function(g) {
              var l = this;
              Object.keys(g).forEach(function(n) {
                var r = rc(l.Qa, n);
                0 !== r && l.tb(g[n], r);
              });
              return true;
            };
            c.prototype.Cb = function(g) {
              for (var l = 0; l < g.length; l += 1) this.tb(g[l], l + 1);
              return true;
            };
            c.prototype.reset = function() {
              this.freemem();
              return 0 === Cc(this.Qa) && 0 === Bc(this.Qa);
            };
            c.prototype.freemem = function() {
              for (var g; void 0 !== (g = this.lb.pop()); ) fa(g);
            };
            c.prototype.free = function() {
              this.freemem();
              var g = 0 === Dc(this.Qa);
              delete this.db.fb[this.Qa];
              this.Qa = 0;
              return g;
            };
            d.prototype.next = function() {
              if (null === this.eb) return { done: true };
              null !== this.Za && (this.Za.free(), this.Za = null);
              if (!this.db.db) throw this.mb(), Error("Database closed");
              var g = sa(), l = z(4);
              ta(h);
              ta(l);
              try {
                this.db.handleError(qb(this.db.db, this.kb, -1, h, l));
                this.kb = m(l, "i32");
                var n = m(h, "i32");
                if (0 === n) return this.mb(), { done: true };
                this.Za = new c(n, this.db);
                this.db.fb[n] = this.Za;
                return { value: this.Za, done: false };
              } catch (r) {
                throw this.pb = ua(this.kb), this.mb(), r;
              } finally {
                wa(g);
              }
            };
            d.prototype.mb = function() {
              fa(this.eb);
              this.eb = null;
            };
            d.prototype.getRemainingSQL = function() {
              return null !== this.pb ? this.pb : ua(this.kb);
            };
            "function" === typeof Symbol && "symbol" === typeof Symbol.iterator && (d.prototype[Symbol.iterator] = function() {
              return this;
            });
            e.prototype.run = function(g, l) {
              if (!this.db) throw "Database closed";
              if (l) {
                g = this.prepare(g, l);
                try {
                  g.step();
                } finally {
                  g.free();
                }
              } else this.handleError(v(this.db, g, 0, 0, h));
              return this;
            };
            e.prototype.exec = function(g, l, n) {
              if (!this.db) throw "Database closed";
              var r = sa(), t = null;
              try {
                var y = xa(g), L = z(4);
                for (g = []; 0 !== m(y, "i8"); ) {
                  ta(h);
                  ta(L);
                  this.handleError(qb(this.db, y, -1, h, L));
                  var J = m(h, "i32");
                  y = m(L, "i32");
                  if (0 !== J) {
                    var I = null;
                    t = new c(J, this);
                    for (null != l && t.bind(l); t.step(); ) null === I && (I = { columns: t.getColumnNames(), values: [] }, g.push(I)), I.values.push(t.get(null, n));
                    t.free();
                  }
                }
                return g;
              } catch (M) {
                throw t && t.free(), M;
              } finally {
                wa(r);
              }
            };
            e.prototype.each = function(g, l, n, r, t) {
              "function" === typeof l && (r = n, n = l, l = void 0);
              g = this.prepare(g, l);
              try {
                for (; g.step(); ) n(g.getAsObject(
                  null,
                  t
                ));
              } finally {
                g.free();
              }
              if ("function" === typeof r) return r();
            };
            e.prototype.prepare = function(g, l) {
              ta(h);
              this.handleError(G(this.db, g, -1, h, 0));
              g = m(h, "i32");
              if (0 === g) throw "Nothing to prepare";
              var n = new c(g, this);
              null != l && n.bind(l);
              return this.fb[g] = n;
            };
            e.prototype.iterateStatements = function(g) {
              return new d(g, this);
            };
            e.prototype["export"] = function() {
              Object.values(this.fb).forEach(function(l) {
                l.free();
              });
              Object.values(this.Sa).forEach(A);
              this.Sa = {};
              this.handleError(w(this.db));
              var g = ya(this.filename);
              this.handleError(q(
                this.filename,
                h
              ));
              this.db = m(h, "i32");
              ob(this.db);
              return g;
            };
            e.prototype.close = function() {
              null !== this.db && (Object.values(this.fb).forEach(function(g) {
                g.free();
              }), Object.values(this.Sa).forEach(A), this.Sa = {}, this.Ya && (A(this.Ya), this.Ya = void 0), this.handleError(w(this.db)), za("/" + this.filename), this.db = null);
            };
            e.prototype.handleError = function(g) {
              if (0 === g) return null;
              g = tc(this.db);
              throw Error(g);
            };
            e.prototype.getRowsModified = function() {
              return C(this.db);
            };
            e.prototype.create_function = function(g, l) {
              Object.prototype.hasOwnProperty.call(
                this.Sa,
                g
              ) && (A(this.Sa[g]), delete this.Sa[g]);
              var n = Aa(function(r, t, y) {
                t = b(t, y);
                try {
                  var L = l.apply(null, t);
                } catch (J) {
                  va(r, J, -1);
                  return;
                }
                a(r, L);
              }, "viii");
              this.Sa[g] = n;
              this.handleError(tb(this.db, g, l.length, 1, 0, n, 0, 0, 0));
              return this;
            };
            e.prototype.create_aggregate = function(g, l) {
              var n = l.init || function() {
                return null;
              }, r = l.finalize || function(I) {
                return I;
              }, t = l.step;
              if (!t) throw "An aggregate function must have a step function in " + g;
              var y = {};
              Object.hasOwnProperty.call(this.Sa, g) && (A(this.Sa[g]), delete this.Sa[g]);
              l = g + "__finalize";
              Object.hasOwnProperty.call(this.Sa, l) && (A(this.Sa[l]), delete this.Sa[l]);
              var L = Aa(function(I, M, Ra) {
                var X = ub(I, 1);
                Object.hasOwnProperty.call(y, X) || (y[X] = n());
                M = b(M, Ra);
                M = [y[X]].concat(M);
                try {
                  y[X] = t.apply(null, M);
                } catch (Fc) {
                  delete y[X], va(I, Fc, -1);
                }
              }, "viii"), J = Aa(function(I) {
                var M = ub(I, 1);
                try {
                  var Ra = r(y[M]);
                } catch (X) {
                  delete y[M];
                  va(I, X, -1);
                  return;
                }
                a(I, Ra);
                delete y[M];
              }, "vi");
              this.Sa[g] = L;
              this.Sa[l] = J;
              this.handleError(tb(this.db, g, t.length - 1, 1, 0, 0, L, J, 0));
              return this;
            };
            e.prototype.updateHook = function(g) {
              this.Ya && (vb(this.db, 0, 0), A(this.Ya), this.Ya = void 0);
              g && (this.Ya = Aa(function(l, n, r, t, y) {
                switch (n) {
                  case 18:
                    l = "insert";
                    break;
                  case 23:
                    l = "update";
                    break;
                  case 9:
                    l = "delete";
                    break;
                  default:
                    throw "unknown operationCode in updateHook callback: " + n;
                }
                r = r ? B(x, r) : "";
                t = t ? B(x, t) : "";
                if (y > Number.MAX_SAFE_INTEGER) throw "rowId too big to fit inside a Number";
                g(l, r, t, Number(y));
              }, "viiiij"), vb(this.db, this.Ya, 0));
            };
            f.Database = e;
          };
          var Ba = { ...f }, Ca = "./this.program", Da = (a, b) => {
            throw b;
          }, D = "", Ea, Fa;
          if (ca) {
            var fs = require_stub();
            require_stub();
            D = __dirname + "/";
            Fa = (a) => {
              a = Ga(a) ? new URL(a) : a;
              return fs.readFileSync(a);
            };
            Ea = async (a) => {
              a = Ga(a) ? new URL(a) : a;
              return fs.readFileSync(a, void 0);
            };
            !f.thisProgram && 1 < process.argv.length && (Ca = process.argv[1].replace(/\\/g, "/"));
            process.argv.slice(2);
            "undefined" != typeof module && (module.exports = f);
            Da = (a, b) => {
              process.exitCode = a;
              throw b;
            };
          } else if (aa || ba) ba ? D = self.location.href : "undefined" != typeof document && document.currentScript && (D = document.currentScript.src), D = D.startsWith("blob:") ? "" : D.slice(0, D.replace(/[?#].*/, "").lastIndexOf("/") + 1), ba && (Fa = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), Ea = async (a) => {
            if (Ga(a)) return new Promise((c, d) => {
              var e = new XMLHttpRequest();
              e.open("GET", a, true);
              e.responseType = "arraybuffer";
              e.onload = () => {
                200 == e.status || 0 == e.status && e.response ? c(e.response) : d(e.status);
              };
              e.onerror = d;
              e.send(null);
            });
            var b = await fetch(a, { credentials: "same-origin" });
            if (b.ok) return b.arrayBuffer();
            throw Error(b.status + " : " + b.url);
          };
          var Ha = f.print || console.log.bind(console), Ia = f.printErr || console.error.bind(console);
          Object.assign(f, Ba);
          Ba = null;
          f.thisProgram && (Ca = f.thisProgram);
          var Ja = f.wasmBinary, Ka, La = false, Ma, p, x, Na, E, F, Oa, H, Pa, Ga = (a) => a.startsWith("file://");
          function Qa() {
            var a = Ka.buffer;
            f.HEAP8 = p = new Int8Array(a);
            f.HEAP16 = Na = new Int16Array(a);
            f.HEAPU8 = x = new Uint8Array(a);
            f.HEAPU16 = new Uint16Array(a);
            f.HEAP32 = E = new Int32Array(a);
            f.HEAPU32 = F = new Uint32Array(a);
            f.HEAPF32 = Oa = new Float32Array(a);
            f.HEAPF64 = Pa = new Float64Array(a);
            f.HEAP64 = H = new BigInt64Array(a);
            f.HEAPU64 = new BigUint64Array(a);
          }
          var K = 0, Sa = null;
          function Ta(a) {
            f.onAbort?.(a);
            a = "Aborted(" + a + ")";
            Ia(a);
            La = true;
            throw new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          }
          var Ua;
          async function Va(a) {
            if (!Ja) try {
              var b = await Ea(a);
              return new Uint8Array(b);
            } catch {
            }
            if (a == Ua && Ja) a = new Uint8Array(Ja);
            else if (Fa) a = Fa(a);
            else throw "both async and sync fetching of the wasm failed";
            return a;
          }
          async function Wa(a, b) {
            try {
              var c = await Va(a);
              return await WebAssembly.instantiate(c, b);
            } catch (d) {
              Ia(`failed to asynchronously prepare wasm: ${d}`), Ta(d);
            }
          }
          async function Xa(a) {
            var b = Ua;
            if (!Ja && "function" == typeof WebAssembly.instantiateStreaming && !Ga(b) && !ca) try {
              var c = fetch(b, { credentials: "same-origin" });
              return await WebAssembly.instantiateStreaming(c, a);
            } catch (d) {
              Ia(`wasm streaming compile failed: ${d}`), Ia("falling back to ArrayBuffer instantiation");
            }
            return Wa(b, a);
          }
          class Ya {
            name = "ExitStatus";
            constructor(a) {
              this.message = `Program terminated with exit(${a})`;
              this.status = a;
            }
          }
          var Za = (a) => {
            for (; 0 < a.length; ) a.shift()(f);
          }, $a = [], ab = [], bb = () => {
            var a = f.preRun.shift();
            ab.unshift(a);
          };
          function m(a, b = "i8") {
            b.endsWith("*") && (b = "*");
            switch (b) {
              case "i1":
                return p[a];
              case "i8":
                return p[a];
              case "i16":
                return Na[a >> 1];
              case "i32":
                return E[a >> 2];
              case "i64":
                return H[a >> 3];
              case "float":
                return Oa[a >> 2];
              case "double":
                return Pa[a >> 3];
              case "*":
                return F[a >> 2];
              default:
                Ta(`invalid type for getValue: ${b}`);
            }
          }
          var cb = f.noExitRuntime || true;
          function ta(a) {
            var b = "i32";
            b.endsWith("*") && (b = "*");
            switch (b) {
              case "i1":
                p[a] = 0;
                break;
              case "i8":
                p[a] = 0;
                break;
              case "i16":
                Na[a >> 1] = 0;
                break;
              case "i32":
                E[a >> 2] = 0;
                break;
              case "i64":
                H[a >> 3] = BigInt(0);
                break;
              case "float":
                Oa[a >> 2] = 0;
                break;
              case "double":
                Pa[a >> 3] = 0;
                break;
              case "*":
                F[a >> 2] = 0;
                break;
              default:
                Ta(`invalid type for setValue: ${b}`);
            }
          }
          var db = "undefined" != typeof TextDecoder ? new TextDecoder() : void 0, B = (a, b = 0, c = NaN) => {
            var d = b + c;
            for (c = b; a[c] && !(c >= d); ) ++c;
            if (16 < c - b && a.buffer && db) return db.decode(a.subarray(b, c));
            for (d = ""; b < c; ) {
              var e = a[b++];
              if (e & 128) {
                var h = a[b++] & 63;
                if (192 == (e & 224)) d += String.fromCharCode((e & 31) << 6 | h);
                else {
                  var k = a[b++] & 63;
                  e = 224 == (e & 240) ? (e & 15) << 12 | h << 6 | k : (e & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;
                  65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
                }
              } else d += String.fromCharCode(e);
            }
            return d;
          }, ua = (a, b) => a ? B(x, a, b) : "", eb = (a, b) => {
            for (var c = 0, d = a.length - 1; 0 <= d; d--) {
              var e = a[d];
              "." === e ? a.splice(d, 1) : ".." === e ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
            }
            if (b) for (; c; c--) a.unshift("..");
            return a;
          }, ka = (a) => {
            var b = "/" === a.charAt(0), c = "/" === a.slice(-1);
            (a = eb(a.split("/").filter((d) => !!d), !b).join("/")) || b || (a = ".");
            a && c && (a += "/");
            return (b ? "/" : "") + a;
          }, fb = (a) => {
            var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
            a = b[0];
            b = b[1];
            if (!a && !b) return ".";
            b &&= b.slice(0, -1);
            return a + b;
          }, gb = (a) => a && a.match(/([^\/]+|\/)\/*$/)[1], hb = () => {
            if (ca) {
              var a = require_stub();
              return (b) => a.randomFillSync(b);
            }
            return (b) => crypto.getRandomValues(b);
          }, ib = (a) => {
            (ib = hb())(a);
          }, jb = (...a) => {
            for (var b = "", c = false, d = a.length - 1; -1 <= d && !c; d--) {
              c = 0 <= d ? a[d] : "/";
              if ("string" != typeof c) throw new TypeError("Arguments to path.resolve must be strings");
              if (!c) return "";
              b = c + "/" + b;
              c = "/" === c.charAt(0);
            }
            b = eb(b.split("/").filter((e) => !!e), !c).join("/");
            return (c ? "/" : "") + b || ".";
          }, kb = [], ha = (a) => {
            for (var b = 0, c = 0; c < a.length; ++c) {
              var d = a.charCodeAt(c);
              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
            }
            return b;
          }, u = (a, b, c, d) => {
            if (!(0 < d)) return 0;
            var e = c;
            d = c + d - 1;
            for (var h = 0; h < a.length; ++h) {
              var k = a.charCodeAt(h);
              if (55296 <= k && 57343 >= k) {
                var q = a.charCodeAt(++h);
                k = 65536 + ((k & 1023) << 10) | q & 1023;
              }
              if (127 >= k) {
                if (c >= d) break;
                b[c++] = k;
              } else {
                if (2047 >= k) {
                  if (c + 1 >= d) break;
                  b[c++] = 192 | k >> 6;
                } else {
                  if (65535 >= k) {
                    if (c + 2 >= d) break;
                    b[c++] = 224 | k >> 12;
                  } else {
                    if (c + 3 >= d) break;
                    b[c++] = 240 | k >> 18;
                    b[c++] = 128 | k >> 12 & 63;
                  }
                  b[c++] = 128 | k >> 6 & 63;
                }
                b[c++] = 128 | k & 63;
              }
            }
            b[c] = 0;
            return c - e;
          }, ra = (a, b) => {
            var c = Array(ha(a) + 1);
            a = u(a, c, 0, c.length);
            b && (c.length = a);
            return c;
          }, mb = [];
          function nb(a, b) {
            mb[a] = { input: [], output: [], cb: b };
            wb(a, xb);
          }
          var xb = { open(a) {
            var b = mb[a.node.rdev];
            if (!b) throw new N(43);
            a.tty = b;
            a.seekable = false;
          }, close(a) {
            a.tty.cb.fsync(a.tty);
          }, fsync(a) {
            a.tty.cb.fsync(a.tty);
          }, read(a, b, c, d) {
            if (!a.tty || !a.tty.cb.xb) throw new N(60);
            for (var e = 0, h = 0; h < d; h++) {
              try {
                var k = a.tty.cb.xb(a.tty);
              } catch (q) {
                throw new N(29);
              }
              if (void 0 === k && 0 === e) throw new N(6);
              if (null === k || void 0 === k) break;
              e++;
              b[c + h] = k;
            }
            e && (a.node.atime = Date.now());
            return e;
          }, write(a, b, c, d) {
            if (!a.tty || !a.tty.cb.qb) throw new N(60);
            try {
              for (var e = 0; e < d; e++) a.tty.cb.qb(a.tty, b[c + e]);
            } catch (h) {
              throw new N(29);
            }
            d && (a.node.mtime = a.node.ctime = Date.now());
            return e;
          } }, yb = { xb() {
            a: {
              if (!kb.length) {
                var a = null;
                if (ca) {
                  var b = Buffer.alloc(256), c = 0, d = process.stdin.fd;
                  try {
                    c = fs.readSync(d, b, 0, 256);
                  } catch (e) {
                    if (e.toString().includes("EOF")) c = 0;
                    else throw e;
                  }
                  0 < c && (a = b.slice(0, c).toString("utf-8"));
                } else "undefined" != typeof window && "function" == typeof window.prompt && (a = window.prompt("Input: "), null !== a && (a += "\n"));
                if (!a) {
                  a = null;
                  break a;
                }
                kb = ra(a, true);
              }
              a = kb.shift();
            }
            return a;
          }, qb(a, b) {
            null === b || 10 === b ? (Ha(B(a.output)), a.output = []) : 0 != b && a.output.push(b);
          }, fsync(a) {
            0 < a.output?.length && (Ha(B(a.output)), a.output = []);
          }, Tb() {
            return { Ob: 25856, Qb: 5, Nb: 191, Pb: 35387, Mb: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
          }, Ub() {
            return 0;
          }, Vb() {
            return [24, 80];
          } }, zb = { qb(a, b) {
            null === b || 10 === b ? (Ia(B(a.output)), a.output = []) : 0 != b && a.output.push(b);
          }, fsync(a) {
            0 < a.output?.length && (Ia(B(a.output)), a.output = []);
          } }, O = { Wa: null, Xa() {
            return O.createNode(null, "/", 16895, 0);
          }, createNode(a, b, c, d) {
            if (24576 === (c & 61440) || 4096 === (c & 61440)) throw new N(63);
            O.Wa || (O.Wa = { dir: { node: { Ta: O.La.Ta, Ua: O.La.Ua, lookup: O.La.lookup, hb: O.La.hb, rename: O.La.rename, unlink: O.La.unlink, rmdir: O.La.rmdir, readdir: O.La.readdir, symlink: O.La.symlink }, stream: { Va: O.Ma.Va } }, file: { node: { Ta: O.La.Ta, Ua: O.La.Ua }, stream: { Va: O.Ma.Va, read: O.Ma.read, write: O.Ma.write, ib: O.Ma.ib, jb: O.Ma.jb } }, link: { node: { Ta: O.La.Ta, Ua: O.La.Ua, readlink: O.La.readlink }, stream: {} }, ub: { node: { Ta: O.La.Ta, Ua: O.La.Ua }, stream: Ab } });
            c = Bb(a, b, c, d);
            P(c.mode) ? (c.La = O.Wa.dir.node, c.Ma = O.Wa.dir.stream, c.Na = {}) : 32768 === (c.mode & 61440) ? (c.La = O.Wa.file.node, c.Ma = O.Wa.file.stream, c.Ra = 0, c.Na = null) : 40960 === (c.mode & 61440) ? (c.La = O.Wa.link.node, c.Ma = O.Wa.link.stream) : 8192 === (c.mode & 61440) && (c.La = O.Wa.ub.node, c.Ma = O.Wa.ub.stream);
            c.atime = c.mtime = c.ctime = Date.now();
            a && (a.Na[b] = c, a.atime = a.mtime = a.ctime = c.atime);
            return c;
          }, Sb(a) {
            return a.Na ? a.Na.subarray ? a.Na.subarray(0, a.Ra) : new Uint8Array(a.Na) : new Uint8Array(0);
          }, La: { Ta(a) {
            var b = {};
            b.dev = 8192 === (a.mode & 61440) ? a.id : 1;
            b.ino = a.id;
            b.mode = a.mode;
            b.nlink = 1;
            b.uid = 0;
            b.gid = 0;
            b.rdev = a.rdev;
            P(a.mode) ? b.size = 4096 : 32768 === (a.mode & 61440) ? b.size = a.Ra : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
            b.atime = new Date(a.atime);
            b.mtime = new Date(a.mtime);
            b.ctime = new Date(a.ctime);
            b.blksize = 4096;
            b.blocks = Math.ceil(b.size / b.blksize);
            return b;
          }, Ua(a, b) {
            for (var c of ["mode", "atime", "mtime", "ctime"]) null != b[c] && (a[c] = b[c]);
            void 0 !== b.size && (b = b.size, a.Ra != b && (0 == b ? (a.Na = null, a.Ra = 0) : (c = a.Na, a.Na = new Uint8Array(b), c && a.Na.set(c.subarray(0, Math.min(b, a.Ra))), a.Ra = b)));
          }, lookup() {
            throw O.vb;
          }, hb(a, b, c, d) {
            return O.createNode(a, b, c, d);
          }, rename(a, b, c) {
            try {
              var d = Q(b, c);
            } catch (h) {
            }
            if (d) {
              if (P(a.mode)) for (var e in d.Na) throw new N(55);
              Cb(d);
            }
            delete a.parent.Na[a.name];
            b.Na[c] = a;
            a.name = c;
            b.ctime = b.mtime = a.parent.ctime = a.parent.mtime = Date.now();
          }, unlink(a, b) {
            delete a.Na[b];
            a.ctime = a.mtime = Date.now();
          }, rmdir(a, b) {
            var c = Q(a, b), d;
            for (d in c.Na) throw new N(55);
            delete a.Na[b];
            a.ctime = a.mtime = Date.now();
          }, readdir(a) {
            return [".", "..", ...Object.keys(a.Na)];
          }, symlink(a, b, c) {
            a = O.createNode(a, b, 41471, 0);
            a.link = c;
            return a;
          }, readlink(a) {
            if (40960 !== (a.mode & 61440)) throw new N(28);
            return a.link;
          } }, Ma: { read(a, b, c, d, e) {
            var h = a.node.Na;
            if (e >= a.node.Ra) return 0;
            a = Math.min(a.node.Ra - e, d);
            if (8 < a && h.subarray) b.set(h.subarray(e, e + a), c);
            else for (d = 0; d < a; d++) b[c + d] = h[e + d];
            return a;
          }, write(a, b, c, d, e, h) {
            b.buffer === p.buffer && (h = false);
            if (!d) return 0;
            a = a.node;
            a.mtime = a.ctime = Date.now();
            if (b.subarray && (!a.Na || a.Na.subarray)) {
              if (h) return a.Na = b.subarray(c, c + d), a.Ra = d;
              if (0 === a.Ra && 0 === e) return a.Na = b.slice(c, c + d), a.Ra = d;
              if (e + d <= a.Ra) return a.Na.set(b.subarray(
                c,
                c + d
              ), e), d;
            }
            h = e + d;
            var k = a.Na ? a.Na.length : 0;
            k >= h || (h = Math.max(h, k * (1048576 > k ? 2 : 1.125) >>> 0), 0 != k && (h = Math.max(h, 256)), k = a.Na, a.Na = new Uint8Array(h), 0 < a.Ra && a.Na.set(k.subarray(0, a.Ra), 0));
            if (a.Na.subarray && b.subarray) a.Na.set(b.subarray(c, c + d), e);
            else for (h = 0; h < d; h++) a.Na[e + h] = b[c + h];
            a.Ra = Math.max(a.Ra, e + d);
            return d;
          }, Va(a, b, c) {
            1 === c ? b += a.position : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.Ra);
            if (0 > b) throw new N(28);
            return b;
          }, ib(a, b, c, d, e) {
            if (32768 !== (a.node.mode & 61440)) throw new N(43);
            a = a.node.Na;
            if (e & 2 || !a || a.buffer !== p.buffer) {
              e = true;
              d = 65536 * Math.ceil(b / 65536);
              var h = Db(65536, d);
              h && x.fill(0, h, h + d);
              d = h;
              if (!d) throw new N(48);
              if (a) {
                if (0 < c || c + b < a.length) a.subarray ? a = a.subarray(c, c + b) : a = Array.prototype.slice.call(a, c, c + b);
                p.set(a, d);
              }
            } else e = false, d = a.byteOffset;
            return { Kb: d, Ab: e };
          }, jb(a, b, c, d) {
            O.Ma.write(a, b, 0, d, c, false);
            return 0;
          } } }, la = (a, b) => {
            var c = 0;
            a && (c |= 365);
            b && (c |= 146);
            return c;
          }, Eb = null, Fb = {}, Gb = [], Hb = 1, R = null, Ib = false, Jb = true, Kb = {}, N = class {
            name = "ErrnoError";
            constructor(a) {
              this.Pa = a;
            }
          }, Lb = class {
            gb = {};
            node = null;
            get flags() {
              return this.gb.flags;
            }
            set flags(a) {
              this.gb.flags = a;
            }
            get position() {
              return this.gb.position;
            }
            set position(a) {
              this.gb.position = a;
            }
          }, Mb = class {
            La = {};
            Ma = {};
            ab = null;
            constructor(a, b, c, d) {
              a ||= this;
              this.parent = a;
              this.Xa = a.Xa;
              this.id = Hb++;
              this.name = b;
              this.mode = c;
              this.rdev = d;
              this.atime = this.mtime = this.ctime = Date.now();
            }
            get read() {
              return 365 === (this.mode & 365);
            }
            set read(a) {
              a ? this.mode |= 365 : this.mode &= -366;
            }
            get write() {
              return 146 === (this.mode & 146);
            }
            set write(a) {
              a ? this.mode |= 146 : this.mode &= -147;
            }
          };
          function S(a, b = {}) {
            if (!a) throw new N(44);
            b.nb ?? (b.nb = true);
            "/" === a.charAt(0) || (a = "//" + a);
            var c = 0;
            a: for (; 40 > c; c++) {
              a = a.split("/").filter((q) => !!q);
              for (var d = Eb, e = "/", h = 0; h < a.length; h++) {
                var k = h === a.length - 1;
                if (k && b.parent) break;
                if ("." !== a[h]) if (".." === a[h]) e = fb(e), d = d.parent;
                else {
                  e = ka(e + "/" + a[h]);
                  try {
                    d = Q(d, a[h]);
                  } catch (q) {
                    if (44 === q?.Pa && k && b.Jb) return { path: e };
                    throw q;
                  }
                  !d.ab || k && !b.nb || (d = d.ab.root);
                  if (40960 === (d.mode & 61440) && (!k || b.$a)) {
                    if (!d.La.readlink) throw new N(52);
                    d = d.La.readlink(d);
                    "/" === d.charAt(0) || (d = fb(e) + "/" + d);
                    a = d + "/" + a.slice(h + 1).join("/");
                    continue a;
                  }
                }
              }
              return { path: e, node: d };
            }
            throw new N(32);
          }
          function ja(a) {
            for (var b; ; ) {
              if (a === a.parent) return a = a.Xa.zb, b ? "/" !== a[a.length - 1] ? `${a}/${b}` : a + b : a;
              b = b ? `${a.name}/${b}` : a.name;
              a = a.parent;
            }
          }
          function Nb(a, b) {
            for (var c = 0, d = 0; d < b.length; d++) c = (c << 5) - c + b.charCodeAt(d) | 0;
            return (a + c >>> 0) % R.length;
          }
          function Cb(a) {
            var b = Nb(a.parent.id, a.name);
            if (R[b] === a) R[b] = a.bb;
            else for (b = R[b]; b; ) {
              if (b.bb === a) {
                b.bb = a.bb;
                break;
              }
              b = b.bb;
            }
          }
          function Q(a, b) {
            var c = P(a.mode) ? (c = Ob(a, "x")) ? c : a.La.lookup ? 0 : 2 : 54;
            if (c) throw new N(c);
            for (c = R[Nb(a.id, b)]; c; c = c.bb) {
              var d = c.name;
              if (c.parent.id === a.id && d === b) return c;
            }
            return a.La.lookup(a, b);
          }
          function Bb(a, b, c, d) {
            a = new Mb(a, b, c, d);
            b = Nb(a.parent.id, a.name);
            a.bb = R[b];
            return R[b] = a;
          }
          function P(a) {
            return 16384 === (a & 61440);
          }
          function Pb(a) {
            var b = ["r", "w", "rw"][a & 3];
            a & 512 && (b += "w");
            return b;
          }
          function Ob(a, b) {
            if (Jb) return 0;
            if (!b.includes("r") || a.mode & 292) {
              if (b.includes("w") && !(a.mode & 146) || b.includes("x") && !(a.mode & 73)) return 2;
            } else return 2;
            return 0;
          }
          function Qb(a, b) {
            if (!P(a.mode)) return 54;
            try {
              return Q(a, b), 20;
            } catch (c) {
            }
            return Ob(a, "wx");
          }
          function Rb(a, b, c) {
            try {
              var d = Q(a, b);
            } catch (e) {
              return e.Pa;
            }
            if (a = Ob(a, "wx")) return a;
            if (c) {
              if (!P(d.mode)) return 54;
              if (d === d.parent || "/" === ja(d)) return 10;
            } else if (P(d.mode)) return 31;
            return 0;
          }
          function Sb(a) {
            if (!a) throw new N(63);
            return a;
          }
          function T(a) {
            a = Gb[a];
            if (!a) throw new N(8);
            return a;
          }
          function Tb(a, b = -1) {
            a = Object.assign(new Lb(), a);
            if (-1 == b) a: {
              for (b = 0; 4096 >= b; b++) if (!Gb[b]) break a;
              throw new N(33);
            }
            a.fd = b;
            return Gb[b] = a;
          }
          function Ub(a, b = -1) {
            a = Tb(a, b);
            a.Ma?.Rb?.(a);
            return a;
          }
          function Vb(a, b, c) {
            var d = a?.Ma.Ua;
            a = d ? a : b;
            d ??= b.La.Ua;
            Sb(d);
            d(a, c);
          }
          var Ab = { open(a) {
            a.Ma = Fb[a.node.rdev].Ma;
            a.Ma.open?.(a);
          }, Va() {
            throw new N(70);
          } };
          function wb(a, b) {
            Fb[a] = { Ma: b };
          }
          function Wb(a, b) {
            var c = "/" === b;
            if (c && Eb) throw new N(10);
            if (!c && b) {
              var d = S(b, { nb: false });
              b = d.path;
              d = d.node;
              if (d.ab) throw new N(10);
              if (!P(d.mode)) throw new N(54);
            }
            b = { type: a, Wb: {}, zb: b, Ib: [] };
            a = a.Xa(b);
            a.Xa = b;
            b.root = a;
            c ? Eb = a : d && (d.ab = b, d.Xa && d.Xa.Ib.push(b));
          }
          function Xb(a, b, c) {
            var d = S(a, { parent: true }).node;
            a = gb(a);
            if (!a) throw new N(28);
            if ("." === a || ".." === a) throw new N(20);
            var e = Qb(d, a);
            if (e) throw new N(e);
            if (!d.La.hb) throw new N(63);
            return d.La.hb(d, a, b, c);
          }
          function ma(a, b = 438) {
            return Xb(a, b & 4095 | 32768, 0);
          }
          function U(a, b = 511) {
            return Xb(a, b & 1023 | 16384, 0);
          }
          function Yb(a, b, c) {
            "undefined" == typeof c && (c = b, b = 438);
            Xb(a, b | 8192, c);
          }
          function Zb(a, b) {
            if (!jb(a)) throw new N(44);
            var c = S(b, { parent: true }).node;
            if (!c) throw new N(44);
            b = gb(b);
            var d = Qb(c, b);
            if (d) throw new N(d);
            if (!c.La.symlink) throw new N(63);
            c.La.symlink(c, b, a);
          }
          function $b(a) {
            var b = S(a, { parent: true }).node;
            a = gb(a);
            var c = Q(b, a), d = Rb(b, a, true);
            if (d) throw new N(d);
            if (!b.La.rmdir) throw new N(63);
            if (c.ab) throw new N(10);
            b.La.rmdir(b, a);
            Cb(c);
          }
          function za(a) {
            var b = S(a, { parent: true }).node;
            if (!b) throw new N(44);
            a = gb(a);
            var c = Q(b, a), d = Rb(b, a, false);
            if (d) throw new N(d);
            if (!b.La.unlink) throw new N(63);
            if (c.ab) throw new N(10);
            b.La.unlink(b, a);
            Cb(c);
          }
          function ac(a, b) {
            a = S(a, { $a: !b }).node;
            return Sb(a.La.Ta)(a);
          }
          function bc(a, b, c, d) {
            Vb(a, b, { mode: c & 4095 | b.mode & -4096, ctime: Date.now(), Fb: d });
          }
          function na(a, b) {
            a = "string" == typeof a ? S(a, { $a: true }).node : a;
            bc(null, a, b);
          }
          function cc(a, b, c) {
            if (P(b.mode)) throw new N(31);
            if (32768 !== (b.mode & 61440)) throw new N(28);
            var d = Ob(b, "w");
            if (d) throw new N(d);
            Vb(a, b, { size: c, timestamp: Date.now() });
          }
          function oa(a, b, c = 438) {
            if ("" === a) throw new N(44);
            if ("string" == typeof b) {
              var d = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }[b];
              if ("undefined" == typeof d) throw Error(`Unknown file open mode: ${b}`);
              b = d;
            }
            c = b & 64 ? c & 4095 | 32768 : 0;
            if ("object" == typeof a) d = a;
            else {
              var e = a.endsWith("/");
              a = S(a, { $a: !(b & 131072), Jb: true });
              d = a.node;
              a = a.path;
            }
            var h = false;
            if (b & 64) if (d) {
              if (b & 128) throw new N(20);
            } else {
              if (e) throw new N(31);
              d = Xb(a, c | 511, 0);
              h = true;
            }
            if (!d) throw new N(44);
            8192 === (d.mode & 61440) && (b &= -513);
            if (b & 65536 && !P(d.mode)) throw new N(54);
            if (!h && (e = d ? 40960 === (d.mode & 61440) ? 32 : P(d.mode) && ("r" !== Pb(b) || b & 576) ? 31 : Ob(d, Pb(b)) : 44)) throw new N(e);
            b & 512 && !h && (e = d, e = "string" == typeof e ? S(e, { $a: true }).node : e, cc(null, e, 0));
            b &= -131713;
            e = Tb({ node: d, path: ja(d), flags: b, seekable: true, position: 0, Ma: d.Ma, Lb: [], error: false });
            e.Ma.open && e.Ma.open(e);
            h && na(d, c & 511);
            !f.logReadFiles || b & 1 || a in Kb || (Kb[a] = 1);
            return e;
          }
          function qa(a) {
            if (null === a.fd) throw new N(8);
            a.ob && (a.ob = null);
            try {
              a.Ma.close && a.Ma.close(a);
            } catch (b) {
              throw b;
            } finally {
              Gb[a.fd] = null;
            }
            a.fd = null;
          }
          function mc(a, b, c) {
            if (null === a.fd) throw new N(8);
            if (!a.seekable || !a.Ma.Va) throw new N(70);
            if (0 != c && 1 != c && 2 != c) throw new N(28);
            a.position = a.Ma.Va(a, b, c);
            a.Lb = [];
          }
          function Ec(a, b, c, d, e) {
            if (0 > d || 0 > e) throw new N(28);
            if (null === a.fd) throw new N(8);
            if (1 === (a.flags & 2097155)) throw new N(8);
            if (P(a.node.mode)) throw new N(31);
            if (!a.Ma.read) throw new N(28);
            var h = "undefined" != typeof e;
            if (!h) e = a.position;
            else if (!a.seekable) throw new N(70);
            b = a.Ma.read(a, b, c, d, e);
            h || (a.position += b);
            return b;
          }
          function pa(a, b, c, d, e) {
            if (0 > d || 0 > e) throw new N(28);
            if (null === a.fd) throw new N(8);
            if (0 === (a.flags & 2097155)) throw new N(8);
            if (P(a.node.mode)) throw new N(31);
            if (!a.Ma.write) throw new N(28);
            a.seekable && a.flags & 1024 && mc(a, 0, 2);
            var h = "undefined" != typeof e;
            if (!h) e = a.position;
            else if (!a.seekable) throw new N(70);
            b = a.Ma.write(a, b, c, d, e, void 0);
            h || (a.position += b);
            return b;
          }
          function ya(a) {
            var b = "binary";
            if ("utf8" !== b && "binary" !== b) throw Error(`Invalid encoding type "${b}"`);
            var c;
            var d = oa(a, d || 0);
            a = ac(a).size;
            var e = new Uint8Array(a);
            Ec(d, e, 0, a, 0);
            "utf8" === b ? c = B(e) : "binary" === b && (c = e);
            qa(d);
            return c;
          }
          function V(a, b, c) {
            a = ka("/dev/" + a);
            var d = la(!!b, !!c);
            V.yb ?? (V.yb = 64);
            var e = V.yb++ << 8 | 0;
            wb(e, { open(h) {
              h.seekable = false;
            }, close() {
              c?.buffer?.length && c(10);
            }, read(h, k, q, w) {
              for (var v = 0, C = 0; C < w; C++) {
                try {
                  var G = b();
                } catch (pb) {
                  throw new N(29);
                }
                if (void 0 === G && 0 === v) throw new N(6);
                if (null === G || void 0 === G) break;
                v++;
                k[q + C] = G;
              }
              v && (h.node.atime = Date.now());
              return v;
            }, write(h, k, q, w) {
              for (var v = 0; v < w; v++) try {
                c(k[q + v]);
              } catch (C) {
                throw new N(29);
              }
              w && (h.node.mtime = h.node.ctime = Date.now());
              return v;
            } });
            Yb(a, d, e);
          }
          var W = {};
          function Gc(a, b, c) {
            if ("/" === b.charAt(0)) return b;
            a = -100 === a ? "/" : T(a).path;
            if (0 == b.length) {
              if (!c) throw new N(44);
              return a;
            }
            return a + "/" + b;
          }
          function Hc(a, b) {
            E[a >> 2] = b.dev;
            E[a + 4 >> 2] = b.mode;
            F[a + 8 >> 2] = b.nlink;
            E[a + 12 >> 2] = b.uid;
            E[a + 16 >> 2] = b.gid;
            E[a + 20 >> 2] = b.rdev;
            H[a + 24 >> 3] = BigInt(b.size);
            E[a + 32 >> 2] = 4096;
            E[a + 36 >> 2] = b.blocks;
            var c = b.atime.getTime(), d = b.mtime.getTime(), e = b.ctime.getTime();
            H[a + 40 >> 3] = BigInt(Math.floor(c / 1e3));
            F[a + 48 >> 2] = c % 1e3 * 1e6;
            H[a + 56 >> 3] = BigInt(Math.floor(d / 1e3));
            F[a + 64 >> 2] = d % 1e3 * 1e6;
            H[a + 72 >> 3] = BigInt(Math.floor(e / 1e3));
            F[a + 80 >> 2] = e % 1e3 * 1e6;
            H[a + 88 >> 3] = BigInt(b.ino);
            return 0;
          }
          var Ic = void 0, Jc = () => {
            var a = E[+Ic >> 2];
            Ic += 4;
            return a;
          }, Kc = 0, Lc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Mc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Nc = {}, Oc = (a) => {
            Ma = a;
            cb || 0 < Kc || (f.onExit?.(a), La = true);
            Da(a, new Ya(a));
          }, Pc = (a) => {
            if (!La) try {
              if (a(), !(cb || 0 < Kc)) try {
                Ma = a = Ma, Oc(a);
              } catch (b) {
                b instanceof Ya || "unwind" == b || Da(1, b);
              }
            } catch (b) {
              b instanceof Ya || "unwind" == b || Da(1, b);
            }
          }, Qc = {}, Sc = () => {
            if (!Rc) {
              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: Ca || "./this.program" }, b;
              for (b in Qc) void 0 === Qc[b] ? delete a[b] : a[b] = Qc[b];
              var c = [];
              for (b in a) c.push(`${b}=${a[b]}`);
              Rc = c;
            }
            return Rc;
          }, Rc, xa = (a) => {
            var b = ha(a) + 1, c = z(b);
            u(a, x, c, b);
            return c;
          }, Tc = (a, b, c, d) => {
            var e = { string: (v) => {
              var C = 0;
              null !== v && void 0 !== v && 0 !== v && (C = xa(v));
              return C;
            }, array: (v) => {
              var C = z(v.length);
              p.set(v, C);
              return C;
            } };
            a = f["_" + a];
            var h = [], k = 0;
            if (d) for (var q = 0; q < d.length; q++) {
              var w = e[c[q]];
              w ? (0 === k && (k = sa()), h[q] = w(d[q])) : h[q] = d[q];
            }
            c = a(...h);
            return c = (function(v) {
              0 !== k && wa(k);
              return "string" === b ? v ? B(x, v) : "" : "boolean" === b ? !!v : v;
            })(c);
          }, ea = 0, da = (a, b) => {
            b = 1 == b ? z(a.length) : ia(a.length);
            a.subarray || a.slice || (a = new Uint8Array(a));
            x.set(a, b);
            return b;
          }, Uc, Vc = [], Y, A = (a) => {
            Uc.delete(Y.get(a));
            Y.set(a, null);
            Vc.push(a);
          }, Aa = (a, b) => {
            if (!Uc) {
              Uc = /* @__PURE__ */ new WeakMap();
              var c = Y.length;
              if (Uc) for (var d = 0; d < 0 + c; d++) {
                var e = Y.get(d);
                e && Uc.set(e, d);
              }
            }
            if (c = Uc.get(a) || 0) return c;
            if (Vc.length) c = Vc.pop();
            else {
              try {
                Y.grow(1);
              } catch (w) {
                if (!(w instanceof RangeError)) throw w;
                throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
              }
              c = Y.length - 1;
            }
            try {
              Y.set(c, a);
            } catch (w) {
              if (!(w instanceof TypeError)) throw w;
              if ("function" == typeof WebAssembly.Function) {
                var h = WebAssembly.Function;
                d = { i: "i32", j: "i64", f: "f32", d: "f64", e: "externref", p: "i32" };
                e = { parameters: [], results: "v" == b[0] ? [] : [d[b[0]]] };
                for (var k = 1; k < b.length; ++k) e.parameters.push(d[b[k]]);
                b = new h(e, a);
              } else {
                d = [1];
                e = b.slice(0, 1);
                b = b.slice(1);
                k = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
                d.push(96);
                var q = b.length;
                128 > q ? d.push(q) : d.push(q % 128 | 128, q >> 7);
                for (h of b) d.push(k[h]);
                "v" == e ? d.push(0) : d.push(1, k[e]);
                b = [0, 97, 115, 109, 1, 0, 0, 0, 1];
                h = d.length;
                128 > h ? b.push(h) : b.push(h % 128 | 128, h >> 7);
                b.push(...d);
                b.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
                b = new WebAssembly.Module(new Uint8Array(b));
                b = new WebAssembly.Instance(b, { e: { f: a } }).exports.f;
              }
              Y.set(c, b);
            }
            Uc.set(a, c);
            return c;
          };
          R = Array(4096);
          Wb(O, "/");
          U("/tmp");
          U("/home");
          U("/home/web_user");
          (function() {
            U("/dev");
            wb(259, { read: () => 0, write: (d, e, h, k) => k, Va: () => 0 });
            Yb("/dev/null", 259);
            nb(1280, yb);
            nb(1536, zb);
            Yb("/dev/tty", 1280);
            Yb("/dev/tty1", 1536);
            var a = new Uint8Array(1024), b = 0, c = () => {
              0 === b && (ib(a), b = a.byteLength);
              return a[--b];
            };
            V("random", c);
            V("urandom", c);
            U("/dev/shm");
            U("/dev/shm/tmp");
          })();
          (function() {
            U("/proc");
            var a = U("/proc/self");
            U("/proc/self/fd");
            Wb({ Xa() {
              var b = Bb(a, "fd", 16895, 73);
              b.Ma = { Va: O.Ma.Va };
              b.La = { lookup(c, d) {
                c = +d;
                var e = T(c);
                c = { parent: null, Xa: { zb: "fake" }, La: { readlink: () => e.path }, id: c + 1 };
                return c.parent = c;
              }, readdir() {
                return Array.from(Gb.entries()).filter(([, c]) => c).map(([c]) => c.toString());
              } };
              return b;
            } }, "/proc/self/fd");
          })();
          O.vb = new N(44);
          O.vb.stack = "<generic error, no stack>";
          var Xc = { a: (a, b, c, d) => Ta(`Assertion failed: ${a ? B(x, a) : ""}, at: ` + [b ? b ? B(x, b) : "" : "unknown filename", c, d ? d ? B(x, d) : "" : "unknown function"]), i: function(a, b) {
            try {
              return a = a ? B(x, a) : "", na(a, b), 0;
            } catch (c) {
              if ("undefined" == typeof W || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          }, L: function(a, b, c) {
            try {
              b = b ? B(x, b) : "";
              b = Gc(a, b);
              if (c & -8) return -28;
              var d = S(b, { $a: true }).node;
              if (!d) return -44;
              a = "";
              c & 4 && (a += "r");
              c & 2 && (a += "w");
              c & 1 && (a += "x");
              return a && Ob(d, a) ? -2 : 0;
            } catch (e) {
              if ("undefined" == typeof W || "ErrnoError" !== e.name) throw e;
              return -e.Pa;
            }
          }, j: function(a, b) {
            try {
              var c = T(a);
              bc(c, c.node, b, false);
              return 0;
            } catch (d) {
              if ("undefined" == typeof W || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          }, h: function(a) {
            try {
              var b = T(a);
              Vb(b, b.node, { timestamp: Date.now(), Fb: false });
              return 0;
            } catch (c) {
              if ("undefined" == typeof W || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          }, b: function(a, b, c) {
            Ic = c;
            try {
              var d = T(a);
              switch (b) {
                case 0:
                  var e = Jc();
                  if (0 > e) break;
                  for (; Gb[e]; ) e++;
                  return Ub(d, e).fd;
                case 1:
                case 2:
                  return 0;
                case 3:
                  return d.flags;
                case 4:
                  return e = Jc(), d.flags |= e, 0;
                case 12:
                  return e = Jc(), Na[e + 0 >> 1] = 2, 0;
                case 13:
                case 14:
                  return 0;
              }
              return -28;
            } catch (h) {
              if ("undefined" == typeof W || "ErrnoError" !== h.name) throw h;
              return -h.Pa;
            }
          }, g: function(a, b) {
            try {
              var c = T(a), d = c.node, e = c.Ma.Ta;
              a = e ? c : d;
              e ??= d.La.Ta;
              Sb(e);
              var h = e(a);
              return Hc(b, h);
            } catch (k) {
              if ("undefined" == typeof W || "ErrnoError" !== k.name) throw k;
              return -k.Pa;
            }
          }, H: function(a, b) {
            b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
            try {
              if (isNaN(b)) return 61;
              var c = T(a);
              if (0 > b || 0 === (c.flags & 2097155)) throw new N(28);
              cc(c, c.node, b);
              return 0;
            } catch (d) {
              if ("undefined" == typeof W || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          }, G: function(a, b) {
            try {
              if (0 === b) return -28;
              var c = ha("/") + 1;
              if (b < c) return -68;
              u("/", x, a, b);
              return c;
            } catch (d) {
              if ("undefined" == typeof W || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          }, K: function(a, b) {
            try {
              return a = a ? B(x, a) : "", Hc(b, ac(a, true));
            } catch (c) {
              if ("undefined" == typeof W || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          }, C: function(a, b, c) {
            try {
              return b = b ? B(x, b) : "", b = Gc(a, b), U(b, c), 0;
            } catch (d) {
              if ("undefined" == typeof W || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          }, J: function(a, b, c, d) {
            try {
              b = b ? B(x, b) : "";
              var e = d & 256;
              b = Gc(a, b, d & 4096);
              return Hc(c, e ? ac(b, true) : ac(b));
            } catch (h) {
              if ("undefined" == typeof W || "ErrnoError" !== h.name) throw h;
              return -h.Pa;
            }
          }, x: function(a, b, c, d) {
            Ic = d;
            try {
              b = b ? B(x, b) : "";
              b = Gc(a, b);
              var e = d ? Jc() : 0;
              return oa(b, c, e).fd;
            } catch (h) {
              if ("undefined" == typeof W || "ErrnoError" !== h.name) throw h;
              return -h.Pa;
            }
          }, v: function(a, b, c, d) {
            try {
              b = b ? B(x, b) : "";
              b = Gc(a, b);
              if (0 >= d) return -28;
              var e = S(b).node;
              if (!e) throw new N(44);
              if (!e.La.readlink) throw new N(28);
              var h = e.La.readlink(e);
              var k = Math.min(d, ha(h)), q = p[c + k];
              u(h, x, c, d + 1);
              p[c + k] = q;
              return k;
            } catch (w) {
              if ("undefined" == typeof W || "ErrnoError" !== w.name) throw w;
              return -w.Pa;
            }
          }, u: function(a) {
            try {
              return a = a ? B(x, a) : "", $b(a), 0;
            } catch (b) {
              if ("undefined" == typeof W || "ErrnoError" !== b.name) throw b;
              return -b.Pa;
            }
          }, f: function(a, b) {
            try {
              return a = a ? B(x, a) : "", Hc(b, ac(a));
            } catch (c) {
              if ("undefined" == typeof W || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          }, r: function(a, b, c) {
            try {
              return b = b ? B(x, b) : "", b = Gc(a, b), 0 === c ? za(b) : 512 === c ? $b(b) : Ta("Invalid flags passed to unlinkat"), 0;
            } catch (d) {
              if ("undefined" == typeof W || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          }, q: function(a, b, c) {
            try {
              b = b ? B(x, b) : "";
              b = Gc(a, b, true);
              var d = Date.now(), e, h;
              if (c) {
                var k = F[c >> 2] + 4294967296 * E[c + 4 >> 2], q = E[c + 8 >> 2];
                1073741823 == q ? e = d : 1073741822 == q ? e = null : e = 1e3 * k + q / 1e6;
                c += 16;
                k = F[c >> 2] + 4294967296 * E[c + 4 >> 2];
                q = E[c + 8 >> 2];
                1073741823 == q ? h = d : 1073741822 == q ? h = null : h = 1e3 * k + q / 1e6;
              } else h = e = d;
              if (null !== (h ?? e)) {
                a = e;
                var w = S(b, { $a: true }).node;
                Sb(w.La.Ua)(w, { atime: a, mtime: h });
              }
              return 0;
            } catch (v) {
              if ("undefined" == typeof W || "ErrnoError" !== v.name) throw v;
              return -v.Pa;
            }
          }, m: () => Ta(""), l: () => {
            cb = false;
            Kc = 0;
          }, A: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            a = new Date(1e3 * a);
            E[b >> 2] = a.getSeconds();
            E[b + 4 >> 2] = a.getMinutes();
            E[b + 8 >> 2] = a.getHours();
            E[b + 12 >> 2] = a.getDate();
            E[b + 16 >> 2] = a.getMonth();
            E[b + 20 >> 2] = a.getFullYear() - 1900;
            E[b + 24 >> 2] = a.getDay();
            var c = a.getFullYear();
            E[b + 28 >> 2] = (0 !== c % 4 || 0 === c % 100 && 0 !== c % 400 ? Mc : Lc)[a.getMonth()] + a.getDate() - 1 | 0;
            E[b + 36 >> 2] = -(60 * a.getTimezoneOffset());
            c = new Date(
              a.getFullYear(),
              6,
              1
            ).getTimezoneOffset();
            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            E[b + 32 >> 2] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
          }, y: function(a, b, c, d, e, h, k) {
            e = -9007199254740992 > e || 9007199254740992 < e ? NaN : Number(e);
            try {
              if (isNaN(e)) return 61;
              var q = T(d);
              if (0 !== (b & 2) && 0 === (c & 2) && 2 !== (q.flags & 2097155)) throw new N(2);
              if (1 === (q.flags & 2097155)) throw new N(2);
              if (!q.Ma.ib) throw new N(43);
              if (!a) throw new N(28);
              var w = q.Ma.ib(q, a, e, b, c);
              var v = w.Kb;
              E[h >> 2] = w.Ab;
              F[k >> 2] = v;
              return 0;
            } catch (C) {
              if ("undefined" == typeof W || "ErrnoError" !== C.name) throw C;
              return -C.Pa;
            }
          }, z: function(a, b, c, d, e, h) {
            h = -9007199254740992 > h || 9007199254740992 < h ? NaN : Number(h);
            try {
              var k = T(e);
              if (c & 2) {
                c = h;
                if (32768 !== (k.node.mode & 61440)) throw new N(43);
                if (!(d & 2)) {
                  var q = x.slice(a, a + b);
                  k.Ma.jb && k.Ma.jb(k, q, c, b, d);
                }
              }
            } catch (w) {
              if ("undefined" == typeof W || "ErrnoError" !== w.name) throw w;
              return -w.Pa;
            }
          }, n: (a, b) => {
            Nc[a] && (clearTimeout(Nc[a].id), delete Nc[a]);
            if (!b) return 0;
            var c = setTimeout(() => {
              delete Nc[a];
              Pc(() => Wc(a, performance.now()));
            }, b);
            Nc[a] = {
              id: c,
              Xb: b
            };
            return 0;
          }, B: (a, b, c, d) => {
            var e = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(e, 0, 1).getTimezoneOffset();
            e = new Date(e, 6, 1).getTimezoneOffset();
            F[a >> 2] = 60 * Math.max(h, e);
            E[b >> 2] = Number(h != e);
            b = (k) => {
              var q = Math.abs(k);
              return `UTC${0 <= k ? "-" : "+"}${String(Math.floor(q / 60)).padStart(2, "0")}${String(q % 60).padStart(2, "0")}`;
            };
            a = b(h);
            b = b(e);
            e < h ? (u(a, x, c, 17), u(b, x, d, 17)) : (u(a, x, d, 17), u(b, x, c, 17));
          }, d: () => Date.now(), s: () => 2147483648, c: () => performance.now(), o: (a) => {
            var b = x.length;
            a >>>= 0;
            if (2147483648 < a) return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var d = b * (1 + 0.2 / c);
              d = Math.min(d, a + 100663296);
              a: {
                d = (Math.min(2147483648, 65536 * Math.ceil(Math.max(a, d) / 65536)) - Ka.buffer.byteLength + 65535) / 65536 | 0;
                try {
                  Ka.grow(d);
                  Qa();
                  var e = 1;
                  break a;
                } catch (h) {
                }
                e = void 0;
              }
              if (e) return true;
            }
            return false;
          }, E: (a, b) => {
            var c = 0;
            Sc().forEach((d, e) => {
              var h = b + c;
              e = F[a + 4 * e >> 2] = h;
              for (h = 0; h < d.length; ++h) p[e++] = d.charCodeAt(h);
              p[e] = 0;
              c += d.length + 1;
            });
            return 0;
          }, F: (a, b) => {
            var c = Sc();
            F[a >> 2] = c.length;
            var d = 0;
            c.forEach((e) => d += e.length + 1);
            F[b >> 2] = d;
            return 0;
          }, e: function(a) {
            try {
              var b = T(a);
              qa(b);
              return 0;
            } catch (c) {
              if ("undefined" == typeof W || "ErrnoError" !== c.name) throw c;
              return c.Pa;
            }
          }, p: function(a, b) {
            try {
              var c = T(a);
              p[b] = c.tty ? 2 : P(c.mode) ? 3 : 40960 === (c.mode & 61440) ? 7 : 4;
              Na[b + 2 >> 1] = 0;
              H[b + 8 >> 3] = BigInt(0);
              H[b + 16 >> 3] = BigInt(0);
              return 0;
            } catch (d) {
              if ("undefined" == typeof W || "ErrnoError" !== d.name) throw d;
              return d.Pa;
            }
          }, w: function(a, b, c, d) {
            try {
              a: {
                var e = T(a);
                a = b;
                for (var h, k = b = 0; k < c; k++) {
                  var q = F[a >> 2], w = F[a + 4 >> 2];
                  a += 8;
                  var v = Ec(e, p, q, w, h);
                  if (0 > v) {
                    var C = -1;
                    break a;
                  }
                  b += v;
                  if (v < w) break;
                  "undefined" != typeof h && (h += v);
                }
                C = b;
              }
              F[d >> 2] = C;
              return 0;
            } catch (G) {
              if ("undefined" == typeof W || "ErrnoError" !== G.name) throw G;
              return G.Pa;
            }
          }, D: function(a, b, c, d) {
            b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
            try {
              if (isNaN(b)) return 61;
              var e = T(a);
              mc(e, b, c);
              H[d >> 3] = BigInt(e.position);
              e.ob && 0 === b && 0 === c && (e.ob = null);
              return 0;
            } catch (h) {
              if ("undefined" == typeof W || "ErrnoError" !== h.name) throw h;
              return h.Pa;
            }
          }, I: function(a) {
            try {
              var b = T(a);
              return b.Ma?.fsync ? b.Ma.fsync(b) : 0;
            } catch (c) {
              if ("undefined" == typeof W || "ErrnoError" !== c.name) throw c;
              return c.Pa;
            }
          }, t: function(a, b, c, d) {
            try {
              a: {
                var e = T(a);
                a = b;
                for (var h, k = b = 0; k < c; k++) {
                  var q = F[a >> 2], w = F[a + 4 >> 2];
                  a += 8;
                  var v = pa(e, p, q, w, h);
                  if (0 > v) {
                    var C = -1;
                    break a;
                  }
                  b += v;
                  if (v < w) break;
                  "undefined" != typeof h && (h += v);
                }
                C = b;
              }
              F[d >> 2] = C;
              return 0;
            } catch (G) {
              if ("undefined" == typeof W || "ErrnoError" !== G.name) throw G;
              return G.Pa;
            }
          }, k: Oc }, Z;
          (async function() {
            function a(c) {
              Z = c.exports;
              Ka = Z.M;
              Qa();
              Y = Z.O;
              K--;
              f.monitorRunDependencies?.(K);
              0 == K && Sa && (c = Sa, Sa = null, c());
              return Z;
            }
            K++;
            f.monitorRunDependencies?.(K);
            var b = { a: Xc };
            if (f.instantiateWasm) return new Promise((c) => {
              f.instantiateWasm(b, (d, e) => {
                a(d, e);
                c(d.exports);
              });
            });
            Ua ??= f.locateFile ? f.locateFile("sql-wasm.wasm", D) : D + "sql-wasm.wasm";
            return a((await Xa(b)).instance);
          })();
          f._sqlite3_free = (a) => (f._sqlite3_free = Z.P)(a);
          f._sqlite3_value_text = (a) => (f._sqlite3_value_text = Z.Q)(a);
          f._sqlite3_prepare_v2 = (a, b, c, d, e) => (f._sqlite3_prepare_v2 = Z.R)(a, b, c, d, e);
          f._sqlite3_step = (a) => (f._sqlite3_step = Z.S)(a);
          f._sqlite3_reset = (a) => (f._sqlite3_reset = Z.T)(a);
          f._sqlite3_exec = (a, b, c, d, e) => (f._sqlite3_exec = Z.U)(a, b, c, d, e);
          f._sqlite3_finalize = (a) => (f._sqlite3_finalize = Z.V)(a);
          f._sqlite3_column_name = (a, b) => (f._sqlite3_column_name = Z.W)(a, b);
          f._sqlite3_column_text = (a, b) => (f._sqlite3_column_text = Z.X)(a, b);
          f._sqlite3_column_type = (a, b) => (f._sqlite3_column_type = Z.Y)(a, b);
          f._sqlite3_errmsg = (a) => (f._sqlite3_errmsg = Z.Z)(a);
          f._sqlite3_clear_bindings = (a) => (f._sqlite3_clear_bindings = Z._)(a);
          f._sqlite3_value_blob = (a) => (f._sqlite3_value_blob = Z.$)(a);
          f._sqlite3_value_bytes = (a) => (f._sqlite3_value_bytes = Z.aa)(a);
          f._sqlite3_value_double = (a) => (f._sqlite3_value_double = Z.ba)(a);
          f._sqlite3_value_int = (a) => (f._sqlite3_value_int = Z.ca)(a);
          f._sqlite3_value_type = (a) => (f._sqlite3_value_type = Z.da)(a);
          f._sqlite3_result_blob = (a, b, c, d) => (f._sqlite3_result_blob = Z.ea)(a, b, c, d);
          f._sqlite3_result_double = (a, b) => (f._sqlite3_result_double = Z.fa)(a, b);
          f._sqlite3_result_error = (a, b, c) => (f._sqlite3_result_error = Z.ga)(a, b, c);
          f._sqlite3_result_int = (a, b) => (f._sqlite3_result_int = Z.ha)(a, b);
          f._sqlite3_result_int64 = (a, b) => (f._sqlite3_result_int64 = Z.ia)(a, b);
          f._sqlite3_result_null = (a) => (f._sqlite3_result_null = Z.ja)(a);
          f._sqlite3_result_text = (a, b, c, d) => (f._sqlite3_result_text = Z.ka)(a, b, c, d);
          f._sqlite3_aggregate_context = (a, b) => (f._sqlite3_aggregate_context = Z.la)(a, b);
          f._sqlite3_column_count = (a) => (f._sqlite3_column_count = Z.ma)(a);
          f._sqlite3_data_count = (a) => (f._sqlite3_data_count = Z.na)(a);
          f._sqlite3_column_blob = (a, b) => (f._sqlite3_column_blob = Z.oa)(a, b);
          f._sqlite3_column_bytes = (a, b) => (f._sqlite3_column_bytes = Z.pa)(a, b);
          f._sqlite3_column_double = (a, b) => (f._sqlite3_column_double = Z.qa)(a, b);
          f._sqlite3_bind_blob = (a, b, c, d, e) => (f._sqlite3_bind_blob = Z.ra)(a, b, c, d, e);
          f._sqlite3_bind_double = (a, b, c) => (f._sqlite3_bind_double = Z.sa)(a, b, c);
          f._sqlite3_bind_int = (a, b, c) => (f._sqlite3_bind_int = Z.ta)(a, b, c);
          f._sqlite3_bind_text = (a, b, c, d, e) => (f._sqlite3_bind_text = Z.ua)(a, b, c, d, e);
          f._sqlite3_bind_parameter_index = (a, b) => (f._sqlite3_bind_parameter_index = Z.va)(a, b);
          f._sqlite3_sql = (a) => (f._sqlite3_sql = Z.wa)(a);
          f._sqlite3_normalized_sql = (a) => (f._sqlite3_normalized_sql = Z.xa)(a);
          f._sqlite3_changes = (a) => (f._sqlite3_changes = Z.ya)(a);
          f._sqlite3_close_v2 = (a) => (f._sqlite3_close_v2 = Z.za)(a);
          f._sqlite3_create_function_v2 = (a, b, c, d, e, h, k, q, w) => (f._sqlite3_create_function_v2 = Z.Aa)(a, b, c, d, e, h, k, q, w);
          f._sqlite3_update_hook = (a, b, c) => (f._sqlite3_update_hook = Z.Ba)(a, b, c);
          f._sqlite3_open = (a, b) => (f._sqlite3_open = Z.Ca)(a, b);
          var ia = f._malloc = (a) => (ia = f._malloc = Z.Da)(a), fa = f._free = (a) => (fa = f._free = Z.Ea)(a);
          f._RegisterExtensionFunctions = (a) => (f._RegisterExtensionFunctions = Z.Fa)(a);
          var Db = (a, b) => (Db = Z.Ga)(a, b), Wc = (a, b) => (Wc = Z.Ha)(a, b), wa = (a) => (wa = Z.Ia)(a), z = (a) => (z = Z.Ja)(a), sa = () => (sa = Z.Ka)();
          f.stackSave = () => sa();
          f.stackRestore = (a) => wa(a);
          f.stackAlloc = (a) => z(a);
          f.cwrap = (a, b, c, d) => {
            var e = !c || c.every((h) => "number" === h || "boolean" === h);
            return "string" !== b && e && !d ? f["_" + a] : (...h) => Tc(a, b, c, h);
          };
          f.addFunction = Aa;
          f.removeFunction = A;
          f.UTF8ToString = ua;
          f.ALLOC_NORMAL = ea;
          f.allocate = da;
          f.allocateUTF8OnStack = xa;
          function Yc() {
            function a() {
              f.calledRun = true;
              if (!La) {
                if (!f.noFSInit && !Ib) {
                  var b, c;
                  Ib = true;
                  d ??= f.stdin;
                  b ??= f.stdout;
                  c ??= f.stderr;
                  d ? V("stdin", d) : Zb("/dev/tty", "/dev/stdin");
                  b ? V("stdout", null, b) : Zb("/dev/tty", "/dev/stdout");
                  c ? V("stderr", null, c) : Zb("/dev/tty1", "/dev/stderr");
                  oa("/dev/stdin", 0);
                  oa("/dev/stdout", 1);
                  oa("/dev/stderr", 1);
                }
                Z.N();
                Jb = false;
                f.onRuntimeInitialized?.();
                if (f.postRun) for ("function" == typeof f.postRun && (f.postRun = [f.postRun]); f.postRun.length; ) {
                  var d = f.postRun.shift();
                  $a.unshift(d);
                }
                Za($a);
              }
            }
            if (0 < K) Sa = Yc;
            else {
              if (f.preRun) for ("function" == typeof f.preRun && (f.preRun = [f.preRun]); f.preRun.length; ) bb();
              Za(ab);
              0 < K ? Sa = Yc : f.setStatus ? (f.setStatus("Running..."), setTimeout(() => {
                setTimeout(() => f.setStatus(""), 1);
                a();
              }, 1)) : a();
            }
          }
          if (f.preInit) for ("function" == typeof f.preInit && (f.preInit = [f.preInit]); 0 < f.preInit.length; ) f.preInit.pop()();
          Yc();
          return Module;
        });
        return initSqlJsPromise;
      };
      if (typeof exports === "object" && typeof module === "object") {
        module.exports = initSqlJs2;
        module.exports.default = initSqlJs2;
      } else if (typeof define === "function" && define["amd"]) {
        define([], function() {
          return initSqlJs2;
        });
      } else if (typeof exports === "object") {
        exports["Module"] = initSqlJs2;
      }
    }
  });

  // sqlite-shim.js
  var require_sqlite_shim = __commonJS({
    "sqlite-shim.js"(exports, module) {
      var SQL = null;
      function useSqlJs2(s) {
        SQL = s;
      }
      var Stmt = class {
        constructor(owner, sql) {
          this.o = owner;
          this.sql = sql;
          this.s = null;
          this.ep = -1;
        }
        prep(params) {
          if (!this.s || this.ep !== this.o.epoch) {
            this.s = this.o.db.prepare(this.sql);
            this.ep = this.o.epoch;
          }
          for (const v of params) {
            if (v === void 0) throw new TypeError("\uAC12\uC774 \uBE44\uC5B4 \uC788\uC5B4\uC694 (undefined).");
          }
          if (params.length) this.s.bind(params);
          else this.s.reset();
          return this.s;
        }
        get(...params) {
          const st = this.prep(params);
          try {
            return st.step() ? st.getAsObject() : void 0;
          } finally {
            st.reset();
          }
        }
        all(...params) {
          const st = this.prep(params);
          const rows = [];
          try {
            while (st.step()) rows.push(st.getAsObject());
          } finally {
            st.reset();
          }
          return rows;
        }
        run(...params) {
          const st = this.prep(params);
          try {
            while (st.step()) {
            }
          } finally {
            st.reset();
          }
          return { changes: this.o.db.getRowsModified(), lastInsertRowid: this.o.lastId() };
        }
      };
      var DatabaseSync = class {
        // bytes: 저장해 둔 DB (없으면 새로)
        constructor(bytes) {
          if (!SQL) throw new Error("sql.js \uB97C \uBA3C\uC800 \uBD88\uB7EC\uC640\uC57C \uD574\uC694.");
          this.db = new SQL.Database(bytes || void 0);
          this.epoch = 0;
        }
        // 지금 트랜잭션 안인지 SQLite 에 직접 묻는다 (글자로 짐작하면 COMMIT 실패·자동 롤백 때 어긋난다):
        // 트랜잭션 안에서는 BEGIN 이 거절된다.
        get isTransaction() {
          try {
            this.db.exec("BEGIN");
          } catch (err) {
            if (/within a transaction/i.test(String(err?.message))) return true;
            throw err;
          }
          this.db.exec("ROLLBACK");
          return false;
        }
        exec(sql) {
          this.db.exec(sql);
        }
        prepare(sql) {
          return new Stmt(this, sql);
        }
        lastId() {
          const r = this.db.exec("SELECT last_insert_rowid()");
          return r[0]?.values[0][0] ?? 0;
        }
        // 저장용 바이트. 트랜잭션 중에는 뽑지 않는다(반쯤 바뀐 내용이 저장되지 않게).
        export() {
          if (this.isTransaction) throw new Error("\uBC14\uAFB8\uB294 \uC911\uC5D0\uB294 \uC800\uC7A5\uD560 \uC218 \uC5C6\uC5B4\uC694.");
          this.epoch += 1;
          return this.db.export();
        }
        close() {
          this.db.close();
        }
      };
      module.exports = { DatabaseSync, useSqlJs: useSqlJs2 };
    }
  });

  // ../lib/db.js
  var require_db = __commonJS({
    "../lib/db.js"(exports, module) {
      var fs = require_stub();
      var { DatabaseSync } = require_sqlite_shim();
      var MIGRATIONS = [
        `CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
   INSERT INTO meta (key, value) VALUES ('version', '0');

   -- \uBE0C\uB77C\uC6B0\uC800 \uB85C\uADF8\uC778. id \uB294 \uCFE0\uD0A4 \uAC12\uC758 sha256 (\uC6D0\uB798 \uAC12\uC740 \uC800\uC7A5\uD558\uC9C0 \uC54A\uB294\uB2E4).
   CREATE TABLE sessions (
     id TEXT PRIMARY KEY,
     created_at INTEGER NOT NULL,
     expires_at INTEGER NOT NULL,
     last_seen_at INTEGER NOT NULL,
     user_agent TEXT NOT NULL DEFAULT ''
   );

   -- \uBE0C\uB77C\uC6B0\uC800 \uBC16 \uD504\uB85C\uADF8\uB7A8(\uD2B8\uB808\uC774 \uB3C4\uC6B0\uBBF8, \uB2E8\uCD95\uC5B4 \uB4F1)\uC6A9 \uAE30\uAE30\uBCC4 \uC5F4\uC1E0.
   CREATE TABLE device_tokens (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     token_hash TEXT NOT NULL UNIQUE,
     scopes TEXT NOT NULL,
     created_at INTEGER NOT NULL,
     last_used_at INTEGER,
     revoked_at INTEGER
   );`,
        // 2단계: 할 일, 공유 메모. rev = 항목별 버전(오래된 화면에서 온 수정을 거절하는 데 씀).
        `CREATE TABLE todos (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     title TEXT NOT NULL,
     done INTEGER NOT NULL DEFAULT 0,
     due TEXT,
     position REAL NOT NULL,
     rev INTEGER NOT NULL DEFAULT 1,
     created_at INTEGER NOT NULL,
     updated_at INTEGER NOT NULL,
     done_at INTEGER,
     updated_by TEXT NOT NULL DEFAULT ''
   );
   CREATE INDEX todos_open ON todos (done, position);

   CREATE TABLE memo (
     id INTEGER PRIMARY KEY CHECK (id = 1),
     body TEXT NOT NULL DEFAULT '',
     rev INTEGER NOT NULL DEFAULT 0,
     updated_at INTEGER,
     updated_by TEXT NOT NULL DEFAULT ''
   );
   INSERT INTO memo (id) VALUES (1);`,
        // 시간표: 매주 도는 기본 시간표 + 그날만 바뀐 칸 + 종 시간(설정 한 줄, JSON).
        // 칸 하나가 저장 단위다 (한 칸을 고쳐도 다른 칸은 건드리지 않음).
        `CREATE TABLE timetable_base (
     weekday INTEGER NOT NULL,
     period INTEGER NOT NULL,
     subject TEXT NOT NULL,
     klass TEXT NOT NULL DEFAULT '',
     room TEXT NOT NULL DEFAULT '',
     updated_at INTEGER NOT NULL,
     PRIMARY KEY (weekday, period)
   );
   -- off = 1 \uC774\uBA74 \uADF8\uB0A0 \uADF8 \uAD50\uC2DC\uB294 \uC218\uC5C5 \uC5C6\uC74C
   CREATE TABLE timetable_override (
     date TEXT NOT NULL,
     period INTEGER NOT NULL,
     off INTEGER NOT NULL DEFAULT 0,
     subject TEXT NOT NULL DEFAULT '',
     klass TEXT NOT NULL DEFAULT '',
     room TEXT NOT NULL DEFAULT '',
     updated_at INTEGER NOT NULL,
     PRIMARY KEY (date, period)
   );
   CREATE TABLE timetable_settings (
     id INTEGER PRIMARY KEY CHECK (id = 1),
     bells TEXT
   );
   INSERT INTO timetable_settings (id) VALUES (1);`,
        // 시간표 색: 같은 수업(과목+반)은 같은 색. { "수학|2-3": "c2", ... }
        `ALTER TABLE timetable_settings ADD COLUMN colors TEXT;`,
        // 포스트잇: 짧게 쓰고 지우는 메모 여러 장. 나중에 저장한 쪽이 이긴다(짧은 메모라 충돌 처리 없음).
        `CREATE TABLE stickies (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     body TEXT NOT NULL DEFAULT '',
     color TEXT NOT NULL DEFAULT 'y',
     position REAL NOT NULL,
     created_at INTEGER NOT NULL,
     updated_at INTEGER NOT NULL
   );`,
        // AI 대화: 기기들이 함께 보는 대화 하나. status: running | done | error | stopped
        `CREATE TABLE ai_messages (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     role TEXT NOT NULL,
     model TEXT NOT NULL DEFAULT '',
     body TEXT NOT NULL DEFAULT '',
     status TEXT NOT NULL DEFAULT 'done',
     created_at INTEGER NOT NULL,
     updated_at INTEGER NOT NULL
   );`,
        // AI 대화 칸을 뺐다 (사용자 결정, 2026-11-02). 저장된 대화도 지운다.
        `DROP TABLE ai_messages;`,
        // 수업 메모: 그날 그 교시에 있었던 일 (수행평가, 결석, 특이사항 등). 학생 이름이 들어갈 수 있어 M6 밖으로 내보내지 않는다.
        // subject·klass 는 적을 때의 수업 (나중에 시간표가 바뀌어도 무슨 수업의 메모였는지 알게).
        `CREATE TABLE timetable_note (
     date TEXT NOT NULL,
     period INTEGER NOT NULL,
     body TEXT NOT NULL,
     subject TEXT NOT NULL DEFAULT '',
     klass TEXT NOT NULL DEFAULT '',
     rev INTEGER NOT NULL DEFAULT 1,
     updated_at INTEGER NOT NULL,
     PRIMARY KEY (date, period)
   );`,
        // 배포판(선생님용) 설정: 학교·업무포털·바로가기 등 (key → JSON). 개인판은 비어 있음.
        `CREATE TABLE app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);`
      ];
      function open(file) {
        if (file !== ":memory:") fs.mkdirSync(require_stub().dirname(file), { recursive: true, mode: 448 });
        const db = new DatabaseSync(file);
        db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;");
        migrate(db);
        if (file !== ":memory:") {
          try {
            fs.chmodSync(file, 384);
          } catch {
          }
        }
        return db;
      }
      function migrate(db) {
        const current = db.prepare("PRAGMA user_version").get().user_version;
        for (let i = current; i < MIGRATIONS.length; i++) {
          tx(db, () => {
            db.exec(MIGRATIONS[i]);
            db.exec(`PRAGMA user_version = ${i + 1}`);
          });
        }
      }
      function tx(db, fn) {
        if (db.isTransaction) throw new Error("tx \uC548\uC5D0\uC11C tx \uB97C \uB2E4\uC2DC \uC5F4 \uC218 \uC5C6\uC5B4\uC694.");
        db.exec("BEGIN IMMEDIATE");
        try {
          const result = fn();
          db.exec("COMMIT");
          return result;
        } catch (err) {
          db.exec("ROLLBACK");
          throw err;
        }
      }
      module.exports = { open, tx, migrate, MIGRATIONS, SCHEMA_VERSION: MIGRATIONS.length };
    }
  });

  // ../lib/errors.js
  var require_errors = __commonJS({
    "../lib/errors.js"(exports, module) {
      var UserError2 = class extends Error {
      };
      var NotFound = class extends Error {
      };
      var Conflict = class extends Error {
        constructor(message, current) {
          super(message);
          this.current = current;
        }
      };
      module.exports = { UserError: UserError2, NotFound, Conflict };
    }
  });

  // ../lib/events.js
  var require_events = __commonJS({
    "../lib/events.js"(exports, module) {
      function createHub(db, auth, cfg) {
        const getVersion = db.prepare("SELECT value FROM meta WHERE key = 'version'");
        const setVersion = db.prepare("UPDATE meta SET value = ? WHERE key = 'version'");
        const providers = /* @__PURE__ */ new Map();
        const clients = /* @__PURE__ */ new Set();
        const attachHooks = [];
        function version() {
          return Number(getVersion.get().value);
        }
        function bump() {
          const v = version() + 1;
          setVersion.run(String(v));
          return v;
        }
        function register(name, fn, scope = "read") {
          providers.set(name, { fn, scope });
        }
        function canSee(client, name) {
          const scope = providers.get(name)?.scope ?? "session";
          if (client.kind === "session") return true;
          return scope !== "session" && client.scopes.includes(scope);
        }
        function snapshot(client) {
          const data = {};
          for (const [name, p] of providers) if (canSee(client, name)) data[name] = p.fn();
          return { version: version(), serverTime: Date.now(), data };
        }
        const MAX_BUFFER = 8 * 1024 * 1024;
        function write(client, chunk) {
          const { res } = client;
          try {
            const ok = res.write(chunk);
            if (res.writableLength > MAX_BUFFER) return drop(client);
            if (!ok && !client.drainTimer) {
              client.drainTimer = setTimeout(() => drop(client), (cfg.drainSeconds ?? 15) * 1e3);
              res.once("drain", () => {
                clearTimeout(client.drainTimer);
                client.drainTimer = null;
              });
            }
          } catch {
            drop(client);
          }
        }
        function publish(v, type, data) {
          const full = `id: ${v}
event: change
data: ${JSON.stringify({ version: v, type, data })}

`;
          const bare = `id: ${v}
event: change
data: ${JSON.stringify({ version: v, type: null })}

`;
          for (const c of [...clients]) write(c, canSee(c, type) ? full : bare);
        }
        function live(type, data) {
          const chunk = `event: live
data: ${JSON.stringify({ type, data })}

`;
          for (const c of [...clients]) if (canSee(c, type)) write(c, chunk);
        }
        function onAttach(fn) {
          attachHooks.push(fn);
        }
        function attach(req, res, who) {
          const client = { res, ...who };
          const snap = JSON.stringify(snapshot(client));
          res.writeHead(200, {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-store",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no"
          });
          clients.add(client);
          res.on("close", () => drop(client));
          write(client, `retry: 3000
event: snapshot
data: ${snap}

`);
          for (const fn of attachHooks) {
            try {
              fn(client);
            } catch {
            }
          }
          return client;
        }
        function drop(client) {
          if (!clients.delete(client)) return;
          clearTimeout(client.drainTimer);
          try {
            client.res.end();
          } catch {
          }
        }
        function closeWhere(pred) {
          for (const c of [...clients]) if (pred(c)) drop(c);
        }
        const beat = setInterval(() => {
          for (const c of [...clients]) {
            const alive = c.kind === "session" ? auth.sessionAlive(c.sessionId) : auth.tokenAlive(c.tokenId);
            if (!alive) {
              write(c, "event: logout\ndata: {}\n\n");
              drop(c);
            } else {
              write(c, ": ping\n\n");
            }
          }
        }, cfg.heartbeatSeconds * 1e3);
        beat.unref?.();
        function close() {
          clearInterval(beat);
          closeWhere(() => true);
        }
        return { version, bump, register, snapshot, publish, live, onAttach, attach, closeWhere, close, count: () => clients.size };
      }
      module.exports = { createHub };
    }
  });

  // ../lib/todos.js
  var require_todos = __commonJS({
    "../lib/todos.js"(exports, module) {
      var { tx } = require_db();
      var { UserError: UserError2, NotFound, Conflict } = require_errors();
      var MAX_TITLE = 300;
      var MAX_OPEN = 500;
      var DONE_VISIBLE_DAYS = 3;
      var DONE_DUE_DAYS = 400;
      function cleanTitle(v) {
        if (typeof v !== "string") throw new UserError2("\uD560 \uC77C\uC744 \uC801\uC5B4 \uC8FC\uC138\uC694.");
        const t = v.replace(/\s+/g, " ").trim();
        if (!t) throw new UserError2("\uD560 \uC77C\uC744 \uC801\uC5B4 \uC8FC\uC138\uC694.");
        if (t.length > MAX_TITLE) throw new UserError2(`\uD560 \uC77C\uC740 ${MAX_TITLE}\uC790\uAE4C\uC9C0 \uC801\uC744 \uC218 \uC788\uC5B4\uC694.`);
        return t;
      }
      function cleanDue(v) {
        if (v === null || v === void 0 || v === "") return null;
        if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new UserError2("\uB9C8\uAC10\uC77C \uD615\uC2DD\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
        const d = /* @__PURE__ */ new Date(`${v}T00:00:00Z`);
        if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) throw new UserError2("\uC5C6\uB294 \uB0A0\uC9DC\uC608\uC694.");
        return v;
      }
      function createTodos(db, hub) {
        const q = {
          get: db.prepare("SELECT * FROM todos WHERE id = ?"),
          list: db.prepare(`SELECT id, title, done, due, position, rev, updated_at, done_at, updated_by FROM todos
                      WHERE done = 0 OR done_at > ? OR (due IS NOT NULL AND due >= ?) ORDER BY done, CASE WHEN done = 0 THEN position END, done_at DESC`),
          countOpen: db.prepare("SELECT COUNT(*) n FROM todos WHERE done = 0"),
          maxPos: db.prepare("SELECT MAX(position) p FROM todos WHERE done = 0"),
          openOrdered: db.prepare("SELECT id, position FROM todos WHERE done = 0 ORDER BY position"),
          insert: db.prepare("INSERT INTO todos (title, due, position, created_at, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, ?)"),
          edit: db.prepare("UPDATE todos SET title = ?, due = ?, rev = rev + 1, updated_at = ?, updated_by = ? WHERE id = ?"),
          setDone: db.prepare("UPDATE todos SET done = ?, done_at = ?, position = ?, updated_at = ?, updated_by = ? WHERE id = ?"),
          setPos: db.prepare("UPDATE todos SET position = ?, updated_at = ?, updated_by = ? WHERE id = ?"),
          renumber: db.prepare("UPDATE todos SET position = ? WHERE id = ?"),
          remove: db.prepare("DELETE FROM todos WHERE id = ?"),
          clearDone: db.prepare("DELETE FROM todos WHERE done = 1")
        };
        function list() {
          const dueFrom = new Date(Date.now() - DONE_DUE_DAYS * 864e5).toISOString().slice(0, 10);
          return q.list.all(Date.now() - DONE_VISIBLE_DAYS * 864e5, dueFrom).map((r) => ({ ...r, done: r.done === 1 }));
        }
        hub.register("todos", list, "read");
        function change(fn) {
          const { result, v } = tx(db, () => ({ result: fn(), v: hub.bump() }));
          hub.publish(v, "todos", list());
          return result;
        }
        function mustGet(id) {
          const row = q.get.get(id);
          if (!row) throw new NotFound("\uC774\uBBF8 \uC9C0\uC6CC\uC9C4 \uD560 \uC77C\uC774\uC5D0\uC694.");
          return row;
        }
        function checkRev(row, rev) {
          if (!Number.isInteger(rev)) throw new UserError2("\uBC84\uC804 \uC815\uBCF4\uAC00 \uC5C6\uC5B4\uC694. \uD654\uBA74\uC744 \uC0C8\uB85C \uACE0\uCCD0 \uC8FC\uC138\uC694.");
          if (row.rev !== rev) throw new Conflict("\uB2E4\uB978 \uAE30\uAE30\uC5D0\uC11C \uBA3C\uC800 \uACE0\uCCE4\uC5B4\uC694.", { ...row, done: row.done === 1 });
        }
        function nextPos() {
          return (q.maxPos.get().p ?? 0) + 1;
        }
        return {
          // 하나 (D-day 맞추기용). 없으면 null
          get(id) {
            const r = q.get.get(id);
            return r ? { id: r.id, title: r.title, due: r.due, done: Boolean(r.done) } : null;
          },
          list,
          add(title, due, by) {
            const t = cleanTitle(title);
            const d = cleanDue(due);
            return change(() => {
              if (q.countOpen.get().n >= MAX_OPEN) throw new UserError2(`\uD560 \uC77C\uC774 ${MAX_OPEN}\uAC1C\uB97C \uB118\uC5C8\uC5B4\uC694. \uB05D\uB0B8 \uC77C\uC744 \uC815\uB9AC\uD574 \uC8FC\uC138\uC694.`);
              const now = Date.now();
              const info = q.insert.run(t, d, nextPos(), now, now, by);
              return { id: Number(info.lastInsertRowid) };
            });
          },
          edit(id, { rev, title, due }, by) {
            return change(() => {
              const row = mustGet(id);
              checkRev(row, rev);
              const t = title === void 0 ? row.title : cleanTitle(title);
              const d = due === void 0 ? row.due : cleanDue(due);
              q.edit.run(t, d, Date.now(), by, id);
              return { id, rev: row.rev + 1 };
            });
          },
          setDone(id, done, by) {
            if (typeof done !== "boolean") throw new UserError2("\uC644\uB8CC \uC5EC\uBD80\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            const row = mustGet(id);
            if (row.done === 1 === done) return { id, unchanged: true };
            return change(() => {
              if (!done && q.countOpen.get().n >= MAX_OPEN) throw new UserError2(`\uD560 \uC77C\uC774 ${MAX_OPEN}\uAC1C\uB97C \uB118\uC5C8\uC5B4\uC694. \uB05D\uB0B8 \uC77C\uC744 \uC815\uB9AC\uD574 \uC8FC\uC138\uC694.`);
              const now = Date.now();
              q.setDone.run(done ? 1 : 0, done ? now : null, done ? row.position : nextPos(), now, by, id);
              return { id };
            });
          },
          // beforeId 앞으로 옮긴다. null 이면 맨 아래로.
          move(id, beforeId, by) {
            return change(() => {
              const row = mustGet(id);
              if (row.done === 1) throw new UserError2("\uB05D\uB0B8 \uC77C\uC740 \uC62E\uAE38 \uC218 \uC5C6\uC5B4\uC694.");
              if (beforeId === id) return { id };
              const open = q.openOrdered.all().filter((r) => r.id !== id);
              let pos;
              if (beforeId === null) {
                pos = (open.at(-1)?.position ?? 0) + 1;
              } else {
                const i = open.findIndex((r) => r.id === beforeId);
                if (i < 0) throw new NotFound("\uC62E\uAE38 \uC790\uB9AC\uAC00 \uC5C6\uC5B4\uC84C\uC5B4\uC694. \uD654\uBA74\uC744 \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.");
                const prev = i > 0 ? open[i - 1].position : open[i].position - 2;
                pos = (prev + open[i].position) / 2;
                if (Math.abs(open[i].position - prev) < 1e-6) {
                  open.splice(i, 0, { id, position: 0 });
                  open.forEach((r, k) => q.renumber.run(k + 1, r.id));
                  pos = i + 1;
                }
              }
              q.setPos.run(pos, Date.now(), by, id);
              return { id };
            });
          },
          remove(id, rev) {
            return change(() => {
              const row = mustGet(id);
              checkRev(row, rev);
              q.remove.run(id);
              return { id };
            });
          },
          clearDone() {
            return change(() => ({ removed: q.clearDone.run().changes }));
          }
        };
      }
      module.exports = { createTodos, MAX_TITLE };
    }
  });

  // ../lib/school.js
  var require_school = __commonJS({
    "../lib/school.js"(exports, module) {
      var fs = require_stub();
      var { UserError: UserError2 } = require_errors();
      function validDate(s) {
        if (typeof s !== "string" || !DATE_RE.test(s)) return false;
        const d = /* @__PURE__ */ new Date(`${s}T00:00:00Z`);
        return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
      }
      var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
      var DATE = { test: validDate };
      function schoolYearOf(dateStr) {
        const [y, m] = dateStr.split("-").map(Number);
        return m >= 3 ? y : y - 1;
      }
      function addDays(dateStr, n) {
        const d = /* @__PURE__ */ new Date(`${dateStr}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() + n);
        return d.toISOString().slice(0, 10);
      }
      function parseHolidayTable(text) {
        const out = {};
        for (const m of text.matchAll(/"(\d{4}-\d{2}-\d{2})"\s*:\s*"([^"]{1,60})"/g)) out[m[1]] = m[2];
        return out;
      }
      function normalize(state, holidayNames) {
        const days = {};
        for (const d of Array.isArray(state?.days) ? state.days : []) {
          if (!d || !DATE.test(d.date) || typeof d.type !== "string") continue;
          days[d.date] = { type: d.type };
          if (d.type === "\uACF5\uD734\uC77C") days[d.date].name = holidayNames[d.date] || "\uACF5\uD734\uC77C";
          if (d.gradeOverride && typeof d.gradeOverride === "object") {
            const parts = Object.entries(d.gradeOverride).map(([g, t]) => `${g}\uD559\uB144 ${t}`);
            if (parts.length) days[d.date].note = parts.join(", ");
          }
        }
        for (const h of Array.isArray(state?.customHolidays) ? state.customHolidays : []) {
          if (h && DATE.test(h.date) && days[h.date]) days[h.date].name = String(h.name || "\uACF5\uD734\uC77C").slice(0, 60);
        }
        const events = [];
        for (const e of Array.isArray(state?.events) ? state.events : []) {
          if (!e || !DATE.test(e.date) || !e.title) continue;
          events.push({
            id: `school:${e.eventId || e.date + e.title}`,
            source: "school",
            date: e.date,
            end: e.date,
            title: String(e.title).slice(0, 100),
            detail: [e.dept, e.appliesTo && e.appliesTo !== "\uC804\uCCB4" ? `${e.appliesTo}\uD559\uB144` : null].filter(Boolean).join(" \xB7 ")
          });
        }
        for (const x of Array.isArray(state?.exams) ? state.exams : []) {
          if (!x || !DATE.test(x.start) || !DATE.test(x.end) || x.end < x.start) continue;
          events.push({ id: `exam:${x.id || x.start}`, source: "exam", date: x.start, end: x.end, title: String(x.name || "\uC2DC\uD5D8").slice(0, 100), detail: "" });
        }
        return { days, events };
      }
      function createSchool(cfg, deps = {}) {
        const off = cfg.plannerEnabled === false;
        const fetchState = deps.fetchState || (off ? async () => null : async (year2) => {
          const res = await fetch(`${cfg.plannerUrl}/api/state?year=${year2}`, { signal: AbortSignal.timeout(5e3) });
          if (res.status === 204) return null;
          if (!res.ok) throw new Error(`\uD559\uC0AC\uC77C\uC815 \uD50C\uB798\uB108 \uC751\uB2F5 ${res.status}`);
          return res.json();
        });
        const cache = /* @__PURE__ */ new Map();
        const keyOf = (y) => `${deps.cacheKey ? deps.cacheKey() : ""}:${y}`;
        const inflight = /* @__PURE__ */ new Map();
        let holidayNames = {};
        let holidayMtime = null;
        function holidays() {
          if (off) return holidayNames;
          try {
            const m = fs.statSync(cfg.plannerHolidaysFile).mtimeMs;
            if (m !== holidayMtime) {
              holidayNames = parseHolidayTable(fs.readFileSync(cfg.plannerHolidaysFile, "utf8"));
              holidayMtime = m;
              cache.clear();
            }
          } catch {
          }
          return holidayNames;
        }
        async function year(y) {
          holidays();
          const k = keyOf(y);
          const c = cache.get(k);
          if (c && Date.now() - c.at < cfg.plannerCacheSeconds * 1e3) return c;
          if (!inflight.has(k)) {
            inflight.set(k, (async () => {
              try {
                const state = await fetchState(y);
                const entry = { at: Date.now(), data: state ? normalize(state, holidays()) : { days: {}, events: [] }, error: null };
                cache.set(k, entry);
                return entry;
              } catch (err) {
                const entry = { at: Date.now() - (cfg.plannerCacheSeconds - 30) * 1e3, data: c?.data || { days: {}, events: [] }, error: err.message };
                cache.set(k, entry);
                return entry;
              } finally {
                inflight.delete(k);
              }
            })());
          }
          return inflight.get(k);
        }
        async function range(from, to) {
          if (!validDate(from) || !validDate(to) || to < from) throw new UserError2("\uB0A0\uC9DC \uBC94\uC704\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
          if ((new Date(to) - new Date(from)) / 864e5 > 62) throw new UserError2("\uD55C \uBC88\uC5D0 \uB450 \uB2EC\uAE4C\uC9C0\uB9CC \uBCFC \uC218 \uC788\uC5B4\uC694.");
          const years = /* @__PURE__ */ new Set([schoolYearOf(from), schoolYearOf(to)]);
          const parts = await Promise.all([...years].map(year));
          const days = {};
          const events = [];
          const errors = [];
          for (const p of parts) {
            if (p.error) errors.push(p.error);
            for (const [d, info] of Object.entries(p.data.days)) if (d >= from && d <= to) days[d] = info;
            for (const e of p.data.events) if (e.end >= from && e.date <= to) events.push(e);
          }
          events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
          return { from, to, days, events, errors };
        }
        async function today(dateStr) {
          const r = await range(dateStr, addDays(dateStr, 60));
          const day = r.days[dateStr] || null;
          const exam = r.events.find((e) => e.source === "exam" && e.end >= dateStr) || null;
          const todays = r.events.filter((e) => e.date <= dateStr && e.end >= dateStr && e.source === "school");
          return { day, events: todays, nextExam: exam && { title: exam.title, start: exam.date, end: exam.end }, errors: r.errors };
        }
        return { range, today };
      }
      module.exports = { createSchool, normalize, parseHolidayTable, schoolYearOf, addDays, validDate };
    }
  });

  // ../lib/neis-schedule.js
  var require_neis_schedule = __commonJS({
    "../lib/neis-schedule.js"(exports, module) {
      var URL_BASE = "https://open.neis.go.kr/hub/SchoolSchedule";
      var EXAM_RE = /고사|시험|학력평가|모의평가/;
      var NOT_EXAM_RE = /교원|수행|감독|연수|협의|평가회|채점|원서|접수|휴업/;
      var isExam = (name) => EXAM_RE.test(name) && !NOT_EXAM_RE.test(name);
      var DAY_RANK = { \uACF5\uD734\uC77C: 3, \uC7AC\uB7C9\uD734\uC5C5\uC77C: 2, \uBC29\uD559: 1 };
      var GRADES = [["ONE_GRADE_EVENT_YN", 1], ["TW_GRADE_EVENT_YN", 2], ["THREE_GRADE_EVENT_YN", 3], ["FR_GRADE_EVENT_YN", 4], ["FIV_GRADE_EVENT_YN", 5], ["SIX_GRADE_EVENT_YN", 6]];
      var ymd = (s) => /^\d{8}$/.test(String(s)) ? `${String(s).slice(0, 4)}-${String(s).slice(4, 6)}-${String(s).slice(6, 8)}` : null;
      var dayDiff = (a, b) => Math.round((/* @__PURE__ */ new Date(`${b}T00:00:00Z`) - /* @__PURE__ */ new Date(`${a}T00:00:00Z`)) / 864e5);
      function gradeNote(r) {
        const on = GRADES.filter(([k]) => r[k] === "Y").map(([, g]) => g);
        const top = GRADES.slice(3).some(([k]) => r[k] === "Y") ? 6 : 3;
        if (!on.length || on.length >= top) return "";
        return `${on.join("\xB7")}\uD559\uB144`;
      }
      function fewGradesOk(r) {
        const on = GRADES.filter(([k]) => r[k] === "Y").length;
        const top = GRADES.slice(3).some(([k]) => r[k] === "Y") ? 6 : 3;
        return !on || on * 2 > top;
      }
      function toState(rows) {
        const dayMap = /* @__PURE__ */ new Map();
        const eventMap = /* @__PURE__ */ new Map();
        const examDays = [];
        const seenExam = /* @__PURE__ */ new Set();
        const addEvent = (date, name, r) => {
          const k = `${date}:${name}`;
          const e = eventMap.get(k) || { date, name, flags: {} };
          for (const [g] of GRADES) if (r[g] === "Y") e.flags[g] = "Y";
          eventMap.set(k, e);
        };
        const list = Array.isArray(rows) ? rows : [];
        const offFlags = /* @__PURE__ */ new Map();
        for (const r of list) {
          if (r?.SBTR_DD_SC_NM !== "\uD734\uC5C5\uC77C") continue;
          const k = `${r.AA_YMD}:${String(r.EVENT_NM || "").trim()}`;
          const f = offFlags.get(k) || {};
          for (const [g] of GRADES) if (r[g] === "Y") f[g] = "Y";
          offFlags.set(k, f);
        }
        for (const r of list) {
          const date = ymd(r?.AA_YMD);
          const name = String(r?.EVENT_NM || "").trim().slice(0, 100);
          if (!date || !name || name === "\uD1A0\uC694\uD734\uC5C5\uC77C") continue;
          const kind = String(r.SBTR_DD_SC_NM || "");
          const weekend = [0, 6].includes((/* @__PURE__ */ new Date(`${date}T00:00:00Z`)).getUTCDay());
          if (isExam(name)) {
            if (!seenExam.has(`${date}:${name}`)) {
              seenExam.add(`${date}:${name}`);
              examDays.push({ date, name });
            }
          }
          if (kind === "\uD734\uC5C5\uC77C" && weekend && !/방학/.test(name)) {
            if (!isExam(name)) addEvent(date, name, r);
            continue;
          }
          if (kind === "\uD734\uC5C5\uC77C" && !fewGradesOk(offFlags.get(`${r.AA_YMD}:${String(r.EVENT_NM || "").trim()}`) || r)) {
            if (!isExam(name)) addEvent(date, name, r);
            continue;
          }
          if (kind === "\uACF5\uD734\uC77C" || kind === "\uD734\uC5C5\uC77C") {
            const type = kind === "\uACF5\uD734\uC77C" ? "\uACF5\uD734\uC77C" : /방학/.test(name) ? "\uBC29\uD559" : "\uC7AC\uB7C9\uD734\uC5C5\uC77C";
            const old = dayMap.get(date);
            if (!old || DAY_RANK[type] > DAY_RANK[old.type]) dayMap.set(date, { type, name });
            continue;
          }
          if (!isExam(name)) addEvent(date, name, r);
        }
        const days = [];
        const customHolidays = [];
        for (const [date, d] of [...dayMap].sort((x, y) => x[0].localeCompare(y[0]))) {
          days.push({ date, type: d.type });
          if (d.type !== "\uBC29\uD559") customHolidays.push({ date, name: d.name });
        }
        const events = [...eventMap.values()].map((e) => {
          const note = gradeNote(e.flags);
          return { eventId: `neis:${e.date}:${e.name}`, date: e.date, title: e.name, appliesTo: note ? note.replace("\uD559\uB144", "") : "\uC804\uCCB4" };
        });
        examDays.sort((a, b) => a.name.localeCompare(b.name) || a.date.localeCompare(b.date));
        const exams = [];
        for (const d of examDays) {
          const last = exams.at(-1);
          if (last && last.name === d.name && dayDiff(last.end, d.date) <= 4) last.end = d.date;
          else exams.push({ id: `neis:${d.name}:${d.date}`, name: d.name, start: d.date, end: d.date });
        }
        exams.sort((a, b) => a.start.localeCompare(b.start));
        return { days, customHolidays, events, exams };
      }
      function neisSchedule({ key, getSchool, getJson }) {
        return {
          cacheKey: () => {
            const s = getSchool();
            return s ? `${s.office}:${s.code}` : "none";
          },
          async fetchState(year) {
            const s = getSchool();
            if (!s || !s.office || !s.code) return null;
            const febEnd = new Date(Date.UTC(year + 1, 2, 0)).getUTCDate();
            const u = new URL(URL_BASE);
            u.search = new URLSearchParams({
              Type: "json",
              pIndex: "1",
              pSize: "1000",
              ...key ? { KEY: key } : {},
              ATPT_OFCDC_SC_CODE: s.office,
              SD_SCHUL_CODE: s.code,
              AA_FROM_YMD: `${year}0301`,
              AA_TO_YMD: `${year + 1}02${febEnd}`
            });
            const rows = [];
            for (let page = 1; page <= 5; page += 1) {
              u.searchParams.set("pIndex", String(page));
              const j = await getJson(u.toString());
              const block = j?.SchoolSchedule;
              if (!block) {
                const code = j?.RESULT?.CODE;
                if (code === "INFO-200" && page === 1) return { days: [], events: [], exams: [] };
                if (code === "INFO-200") break;
                throw new Error(j?.RESULT?.MESSAGE ? `\uB098\uC774\uC2A4: ${j.RESULT.MESSAGE}` : "\uB098\uC774\uC2A4 \uD559\uC0AC\uC77C\uC815\uC744 \uC77D\uC9C0 \uBABB\uD588\uC5B4\uC694.");
              }
              const got = block[1]?.row;
              if (!Array.isArray(got)) throw new Error("\uB098\uC774\uC2A4 \uD559\uC0AC\uC77C\uC815 \uC751\uB2F5 \uBAA8\uC591\uC774 \uC774\uC0C1\uD574\uC694.");
              rows.push(...got);
              const total = Number(block[0]?.head?.[0]?.list_total_count) || 0;
              if (got.length < 1e3 || rows.length >= total) break;
            }
            return toState(rows);
          }
        };
      }
      module.exports = { neisSchedule, toState };
    }
  });

  // ../lib/neis-timetable.js
  var require_neis_timetable = __commonJS({
    "../lib/neis-timetable.js"(exports, module) {
      var BASE = "https://open.neis.go.kr/hub/";
      var KINDS = { \uCD08\uB4F1\uD559\uAD50: "els", \uC911\uD559\uAD50: "mis", \uACE0\uB4F1\uD559\uAD50: "his", \uD2B9\uC218\uD559\uAD50: "sps" };
      function kindOf(name, knd = "") {
        if (KINDS[knd]) return KINDS[knd];
        const n = String(name || "");
        if (/초등학교$/.test(n)) return "els";
        if (/중학교$/.test(n)) return "mis";
        if (/고등학교$/.test(n)) return "his";
        return "sps";
      }
      var ymd = (s) => /^\d{8}$/.test(String(s)) ? `${String(s).slice(0, 4)}-${String(s).slice(4, 6)}-${String(s).slice(6, 8)}` : null;
      var clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
      function normalize(rows) {
        const out = [];
        for (const r of rows || []) {
          const date = ymd(r.ALL_TI_YMD);
          const period = Number(r.PERIO);
          const subject = clean(r.ITRT_CNTNT, 40).replace(/^-+$/, "");
          if (!date || !Number.isInteger(period) || period < 1 || period > 15 || !subject) continue;
          const track = [clean(r.SCHUL_CRSE_SC_NM, 10), clean(r.DGHT_CRSE_SC_NM, 6).replace(/^주간$/, ""), clean(r.DDDEP_NM, 20)].filter(Boolean).join(" ");
          out.push({
            date,
            term: r.AY && r.SEM ? `${clean(r.AY, 4)}-${clean(r.SEM, 2)}` : "",
            // 학년도-학기 (경계 주에 두 학기가 섞이지 않게)
            track,
            grade: clean(r.GRADE, 4),
            klass: clean(r.CLASS_NM, 10),
            period,
            subject,
            room: clean(r.CLRM_NM, 20)
          });
        }
        return out;
      }
      async function fetchTimetable({ key, school, from, to, getJson }) {
        if (!school || !school.office || !school.code) return null;
        const kind = kindOf(school.name, school.kind);
        const u = new URL(`${BASE}${kind}Timetable`);
        u.search = new URLSearchParams({
          Type: "json",
          pIndex: "1",
          pSize: "1000",
          ...key ? { KEY: key } : {},
          ATPT_OFCDC_SC_CODE: school.office,
          SD_SCHUL_CODE: school.code,
          TI_FROM_YMD: from.replaceAll("-", ""),
          TI_TO_YMD: to.replaceAll("-", "")
        });
        const PARTIAL = "\uB098\uC774\uC2A4 \uC2DC\uAC04\uD45C\uB97C \uB05D\uAE4C\uC9C0 \uBC1B\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC7A0\uC2DC \uB4A4 \uB2E4\uC2DC \uD574 \uC8FC\uC138\uC694.";
        const rows = [];
        let total = -1;
        let done = false;
        for (let page = 1; page <= 10 && !done; page += 1) {
          u.searchParams.set("pIndex", String(page));
          const j = await getJson(u.toString());
          const block = j?.[`${kind}Timetable`];
          if (!block) {
            const code = j?.RESULT?.CODE;
            if (code === "INFO-200" && page === 1) return { kind, rows: [] };
            if (code === "INFO-200" && total < 0 && rows.length % 1e3 === 0) {
              done = true;
              break;
            }
            if (code === "INFO-200") throw new Error(PARTIAL);
            throw new Error(j?.RESULT?.MESSAGE ? `\uB098\uC774\uC2A4: ${j.RESULT.MESSAGE}` : "\uB098\uC774\uC2A4 \uC2DC\uAC04\uD45C\uB97C \uC77D\uC9C0 \uBABB\uD588\uC5B4\uC694.");
          }
          const got = block[1]?.row;
          if (!Array.isArray(got)) throw new Error("\uB098\uC774\uC2A4 \uC2DC\uAC04\uD45C \uC751\uB2F5 \uBAA8\uC591\uC774 \uC774\uC0C1\uD574\uC694.");
          rows.push(...got);
          const n = Number(block[0]?.head?.[0]?.list_total_count);
          if (Number.isInteger(n) && n >= 0) total = n;
          if (total >= 0 ? rows.length >= total : got.length < 1e3) done = true;
        }
        if (!done || total >= 0 && rows.length < total) throw new Error(PARTIAL);
        return { kind, rows: normalize(rows) };
      }
      module.exports = { kindOf, normalize, fetchTimetable };
    }
  });

  // ../lib/today.js
  var require_today = __commonJS({
    "../lib/today.js"(exports, module) {
      var WEATHER = {
        0: ["\uB9D1\uC74C", "\u2600\uFE0F"],
        1: ["\uB300\uCCB4\uB85C \uB9D1\uC74C", "\u{1F324}\uFE0F"],
        2: ["\uAD6C\uB984 \uC870\uAE08", "\u26C5"],
        3: ["\uD750\uB9BC", "\u2601\uFE0F"],
        45: ["\uC548\uAC1C", "\u{1F32B}\uFE0F"],
        48: ["\uC548\uAC1C", "\u{1F32B}\uFE0F"],
        51: ["\uC774\uC2AC\uBE44", "\u{1F326}\uFE0F"],
        53: ["\uC774\uC2AC\uBE44", "\u{1F326}\uFE0F"],
        55: ["\uC774\uC2AC\uBE44", "\u{1F326}\uFE0F"],
        56: ["\uC5B4\uB294 \uBE44", "\u{1F327}\uFE0F"],
        57: ["\uC5B4\uB294 \uBE44", "\u{1F327}\uFE0F"],
        61: ["\uBE44", "\u{1F327}\uFE0F"],
        63: ["\uBE44", "\u{1F327}\uFE0F"],
        65: ["\uAC15\uD55C \uBE44", "\u{1F327}\uFE0F"],
        66: ["\uC5B4\uB294 \uBE44", "\u{1F327}\uFE0F"],
        67: ["\uC5B4\uB294 \uBE44", "\u{1F327}\uFE0F"],
        71: ["\uB208", "\u{1F328}\uFE0F"],
        73: ["\uB208", "\u{1F328}\uFE0F"],
        75: ["\uB9CE\uC740 \uB208", "\u2744\uFE0F"],
        77: ["\uC2F8\uB77D\uB208", "\u{1F328}\uFE0F"],
        80: ["\uC18C\uB098\uAE30", "\u{1F326}\uFE0F"],
        81: ["\uC18C\uB098\uAE30", "\u{1F326}\uFE0F"],
        82: ["\uAC15\uD55C \uC18C\uB098\uAE30", "\u26C8\uFE0F"],
        85: ["\uB208 \uC18C\uB098\uAE30", "\u{1F328}\uFE0F"],
        86: ["\uB208 \uC18C\uB098\uAE30", "\u{1F328}\uFE0F"],
        95: ["\uB1CC\uC6B0", "\u26C8\uFE0F"],
        96: ["\uB1CC\uC6B0", "\u26C8\uFE0F"],
        99: ["\uB1CC\uC6B0", "\u26C8\uFE0F"]
      };
      function localDate2(d = /* @__PURE__ */ new Date()) {
        const p = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
      }
      function parseWeather(j) {
        const code = j?.current?.weather_code;
        const [text, icon] = WEATHER[code] || ["", ""];
        const num = (v) => typeof v === "number" ? Math.round(v) : null;
        return {
          temp: num(j?.current?.temperature_2m),
          text,
          icon,
          max: num(j?.daily?.temperature_2m_max?.[0]),
          min: num(j?.daily?.temperature_2m_min?.[0]),
          rain: num(j?.daily?.precipitation_probability_max?.[0])
        };
      }
      function parseMeal(j) {
        const rows = j?.mealServiceDietInfo?.[1]?.row;
        const out = {};
        if (!Array.isArray(rows)) return out;
        for (const r of rows) {
          const key = r.MMEAL_SC_NM === "\uC870\uC2DD" ? "breakfast" : r.MMEAL_SC_NM === "\uC11D\uC2DD" ? "dinner" : "lunch";
          out[key] = String(r.DDISH_NM || "").split(/<br\s*\/?>/i).map((s) => s.trim()).filter(Boolean).map((s) => {
            const m = /^(.*?)\s*\(([\d.]+)\)\s*$/.exec(s);
            return m ? { name: m[1].trim(), allergy: m[2] } : { name: s, allergy: "" };
          }).slice(0, 15);
        }
        return out;
      }
      function createToday(cfg, deps = {}) {
        const where = deps.where || (() => ({ office: cfg.neisOffice, school: cfg.neisSchool, lat: cfg.lat, lon: cfg.lon }));
        const neisKey = deps.neisKey || (() => cfg.neisKey);
        const getJson = deps.getJson || (async (url) => {
          const res = await fetch(url, { signal: AbortSignal.timeout(6e3) });
          if (!res.ok) throw new Error(`\uC751\uB2F5 ${res.status}`);
          return res.json();
        });
        const cache = { weather: null, meal: null };
        const inflight = /* @__PURE__ */ new Map();
        function cached(name, key, maxAgeMs, load) {
          const c = cache[name];
          if (c && c.key === key && Date.now() - c.at < maxAgeMs) return Promise.resolve(c);
          const id = `${name}:${key}`;
          if (!inflight.has(id)) inflight.set(id, refresh(name, key, maxAgeMs, load).finally(() => inflight.delete(id)));
          return inflight.get(id);
        }
        async function refresh(name, key, maxAgeMs, load) {
          const c = cache[name];
          try {
            cache[name] = { at: Date.now(), key, data: await load(), error: null };
          } catch (err) {
            const keep = c && c.key === key ? c.data : null;
            cache[name] = { at: Date.now() - maxAgeMs + 6e4, key, data: keep, error: err.message };
          }
          return cache[name];
        }
        async function get(date = localDate2()) {
          const at = where();
          if (!at.school && !at.office) return { date, weather: null, meal: null, errors: [], needSetup: true };
          const noSchool = !at.school;
          const w = cached("weather", `${date}|${at.lat},${at.lon}`, cfg.weatherMinutes * 6e4, async () => {
            if (!at.lat || !at.lon) throw new Error("\uD559\uAD50 \uC704\uCE58\uB97C \uBAA8\uB984");
            const u = new URL("https://api.open-meteo.com/v1/forecast");
            u.search = new URLSearchParams({
              latitude: at.lat,
              longitude: at.lon,
              timezone: "Asia/Seoul",
              forecast_days: "1",
              current: "temperature_2m,weather_code",
              daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max"
            });
            return parseWeather(await getJson(u.toString()));
          });
          const m = noSchool ? Promise.resolve({ data: null }) : cached("meal", `${date}|${at.office}${at.school}`, cfg.mealMinutes * 6e4, async () => {
            const u = new URL("https://open.neis.go.kr/hub/mealServiceDietInfo");
            const key = neisKey();
            u.search = new URLSearchParams({
              Type: "json",
              ATPT_OFCDC_SC_CODE: at.office,
              SD_SCHUL_CODE: at.school,
              MLSV_YMD: date.replaceAll("-", ""),
              ...key ? { KEY: key } : {}
            });
            return parseMeal(await getJson(u.toString()));
          });
          const [weather, meal] = await Promise.all([w, m]);
          return {
            date,
            weather: weather.data,
            meal: meal.data,
            ...noSchool ? { noSchool: true } : {},
            errors: [weather.error && `\uB0A0\uC528: ${weather.error}`, meal.error && `\uAE09\uC2DD: ${meal.error}`].filter(Boolean)
          };
        }
        return { get };
      }
      module.exports = { createToday, parseWeather, parseMeal, localDate: localDate2 };
    }
  });

  // ../lib/timetable.js
  var require_timetable = __commonJS({
    "../lib/timetable.js"(exports, module) {
      var { tx } = require_db();
      var { UserError: UserError2, Conflict } = require_errors();
      var { validDate, addDays } = require_school();
      var DEFAULT_BELLS = {
        periods: [
          { start: "08:20", end: "09:10" },
          { start: "09:20", end: "10:10" },
          { start: "10:20", end: "11:10" },
          { start: "11:20", end: "12:10" },
          { start: "13:10", end: "14:00" },
          { start: "14:10", end: "15:00" },
          { start: "15:10", end: "16:00" }
        ],
        lunch: { start: "12:10", end: "13:10" }
      };
      var MAX_PERIODS = 10;
      var COLORS = ["c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9"];
      var MAX_COLOR_KEYS = 300;
      var colorKey = (l) => `${l.subject}|${l.klass || ""}`;
      var KEEP_PAST_DAYS = 30;
      var SEND_FUTURE_DAYS = 180;
      var MAX_OVERRIDES = 2e3;
      var TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
      var toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
      function cleanText(v, max, label, required = false) {
        if (v === void 0 || v === null) v = "";
        if (typeof v !== "string") throw new UserError2(`${label} \uD615\uC2DD\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.`);
        const s = v.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
        if (required && !s) throw new UserError2(`${label}\uC744 \uC801\uC5B4 \uC8FC\uC138\uC694.`);
        if (s.length > max) throw new UserError2(`${label}\uC740 ${max}\uC790\uAE4C\uC9C0\uC608\uC694.`);
        return s;
      }
      function cleanLesson(l) {
        if (!l || typeof l !== "object") throw new UserError2("\uC218\uC5C5 \uB0B4\uC6A9\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
        return {
          subject: cleanText(l.subject, 20, "\uACFC\uBAA9", true),
          klass: cleanText(l.klass, 20, "\uBC18"),
          room: cleanText(l.room, 20, "\uAD50\uC2E4")
        };
      }
      function validBells(b) {
        if (!b || typeof b !== "object" || !Array.isArray(b.periods)) throw new UserError2("\uC885 \uC2DC\uAC04 \uD615\uC2DD\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
        if (b.periods.length < 1 || b.periods.length > MAX_PERIODS) throw new UserError2(`\uAD50\uC2DC\uB294 1~${MAX_PERIODS}\uAC1C\uAE4C\uC9C0\uC608\uC694.`);
        const periods = b.periods.map((p, i) => {
          if (!p || !TIME_RE.test(p.start) || !TIME_RE.test(p.end)) throw new UserError2(`${i + 1}\uAD50\uC2DC \uC2DC\uAC04\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.`);
          if (toMin(p.start) >= toMin(p.end)) throw new UserError2(`${i + 1}\uAD50\uC2DC\uB294 \uB05D\uB098\uB294 \uC2DC\uAC04\uC774 \uC2DC\uC791\uBCF4\uB2E4 \uB2A6\uC5B4\uC57C \uD574\uC694.`);
          return { start: p.start, end: p.end };
        });
        for (let i = 1; i < periods.length; i++) {
          if (toMin(periods[i].start) < toMin(periods[i - 1].end)) throw new UserError2(`${i + 1}\uAD50\uC2DC\uAC00 ${i}\uAD50\uC2DC\uC640 \uACB9\uCCD0\uC694.`);
        }
        let lunch = null;
        if (b.lunch) {
          if (!TIME_RE.test(b.lunch.start) || !TIME_RE.test(b.lunch.end) || toMin(b.lunch.start) >= toMin(b.lunch.end)) {
            throw new UserError2("\uC810\uC2EC\uC2DC\uAC04\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
          }
          const overlaps = periods.some((p) => toMin(p.start) < toMin(b.lunch.end) && toMin(b.lunch.start) < toMin(p.end));
          if (overlaps) throw new UserError2("\uC810\uC2EC\uC2DC\uAC04\uC774 \uC218\uC5C5 \uC2DC\uAC04\uACFC \uACB9\uCCD0\uC694.");
          lunch = { start: b.lunch.start, end: b.lunch.end };
        }
        return { periods, lunch };
      }
      function checkWeekday(w) {
        if (!Number.isInteger(w) || w < 1 || w > 5) throw new UserError2("\uC694\uC77C\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
        return w;
      }
      function createTimetable(db, hub, opts = {}) {
        const today = opts.today || (() => require_today().localDate());
        const q = {
          bells: db.prepare("SELECT bells FROM timetable_settings WHERE id = 1"),
          setBells: db.prepare("UPDATE timetable_settings SET bells = ? WHERE id = 1"),
          colors: db.prepare("SELECT colors FROM timetable_settings WHERE id = 1"),
          setColors: db.prepare("UPDATE timetable_settings SET colors = ? WHERE id = 1"),
          base: db.prepare("SELECT weekday, period, subject, klass, room FROM timetable_base ORDER BY weekday, period"),
          putBase: db.prepare(`INSERT INTO timetable_base (weekday, period, subject, klass, room, updated_at) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (weekday, period) DO UPDATE SET subject = excluded.subject, klass = excluded.klass, room = excluded.room, updated_at = excluded.updated_at`),
          delBase: db.prepare("DELETE FROM timetable_base WHERE weekday = ? AND period = ?"),
          overrides: db.prepare("SELECT date, period, off, subject, klass, room FROM timetable_override WHERE date >= ? AND date <= ? ORDER BY date, period"),
          putOv: db.prepare(`INSERT INTO timetable_override (date, period, off, subject, klass, room, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (date, period) DO UPDATE SET off = excluded.off, subject = excluded.subject, klass = excluded.klass, room = excluded.room, updated_at = excluded.updated_at`),
          delOv: db.prepare("DELETE FROM timetable_override WHERE date = ? AND period = ?"),
          oldOv: db.prepare("DELETE FROM timetable_override WHERE date < ?"),
          countOv: db.prepare("SELECT COUNT(*) AS n FROM timetable_override"),
          hasOv: db.prepare("SELECT 1 FROM timetable_override WHERE date = ? AND period = ?"),
          dropBaseAfter: db.prepare("DELETE FROM timetable_base WHERE period > ?"),
          dropOvAfter: db.prepare("DELETE FROM timetable_override WHERE period > ?")
        };
        function bells() {
          const raw = q.bells.get()?.bells;
          if (!raw) return DEFAULT_BELLS;
          try {
            return validBells(JSON.parse(raw));
          } catch {
            return DEFAULT_BELLS;
          }
        }
        function colors() {
          try {
            const c = JSON.parse(q.colors.get()?.colors || "{}");
            return c && typeof c === "object" && !Array.isArray(c) ? c : {};
          } catch {
            return {};
          }
        }
        function current() {
          const t = today();
          const from = addDays(t, -KEEP_PAST_DAYS);
          const to = addDays(t, SEND_FUTURE_DAYS);
          return {
            bells: bells(),
            colors: colors(),
            // 직접 고른 색만. 없으면 화면이 과목+반으로 자동 색을 고른다
            base: q.base.all().map((r) => ({ ...r })),
            // range: 바뀐 칸을 보내는(=고칠 수 있는) 날짜 범위. 화면은 이 밖의 날을 "기록 범위 밖"으로 보여 준다.
            range: { from, to },
            overrides: q.overrides.all(from, to).map((r) => ({ ...r, off: Boolean(r.off) }))
          };
        }
        hub.register("timetable", current, "read");
        function checkPeriod(p) {
          if (!Number.isInteger(p) || p < 1 || p > bells().periods.length) throw new UserError2("\uAD50\uC2DC\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
          return p;
        }
        function checkDate(d) {
          if (!validDate(d)) throw new UserError2("\uB0A0\uC9DC\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
          const t = today();
          if (d < addDays(t, -KEEP_PAST_DAYS) || d > addDays(t, SEND_FUTURE_DAYS)) throw new UserError2("\uC9C0\uB09C 30\uC77C ~ \uC55E\uC73C\uB85C 180\uC77C \uC548\uC758 \uB0A0\uC9DC\uB9CC \uACE0\uCE60 \uC218 \uC788\uC5B4\uC694.");
          return d;
        }
        function change(fn) {
          const { data, v } = tx(db, () => {
            fn();
            return { data: current(), v: hub.bump() };
          });
          hub.publish(v, "timetable", data);
          return data;
        }
        return {
          current,
          // lesson = null 이면 그 칸을 비운다
          setBase(weekday, period, lesson) {
            checkWeekday(weekday);
            checkPeriod(period);
            const l = lesson === null ? null : cleanLesson(lesson);
            return change(() => {
              if (l) q.putBase.run(weekday, period, l.subject, l.klass, l.room, Date.now());
              else q.delBase.run(weekday, period);
            });
          },
          // 여러 칸 한꺼번에 (엑셀 붙여넣기). cells: [{ weekday, period, lesson|null }]. 하나라도 틀리면 아무것도 안 바꾼다.
          setBaseMany(cells) {
            if (!Array.isArray(cells) || cells.length === 0 || cells.length > 5 * MAX_PERIODS) throw new UserError2("\uB123\uC744 \uCE78\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            const clean = cells.map((c) => {
              if (!c || typeof c !== "object" || !("lesson" in c)) throw new UserError2("\uB123\uC744 \uCE78\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
              checkWeekday(c.weekday);
              checkPeriod(c.period);
              return { weekday: c.weekday, period: c.period, lesson: c.lesson === null ? null : cleanLesson(c.lesson) };
            });
            return change(() => {
              const now = Date.now();
              for (const c of clean) {
                if (c.lesson) q.putBase.run(c.weekday, c.period, c.lesson.subject, c.lesson.klass, c.lesson.room, now);
                else q.delBase.run(c.weekday, c.period);
              }
            });
          },
          // 같은 수업(과목+반)의 색. color = null 이면 자동 색으로
          setColor(lesson, color) {
            const l = cleanLesson(lesson);
            if (color !== null && !COLORS.includes(color)) throw new UserError2("\uC0C9\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            return change(() => {
              const c = colors();
              const key = colorKey(l);
              if (color === null) delete c[key];
              else {
                if (!(key in c) && Object.keys(c).length >= MAX_COLOR_KEYS) throw new UserError2("\uC0C9\uC744 \uC815\uD55C \uC218\uC5C5\uC774 \uB108\uBB34 \uB9CE\uC544\uC694.");
                c[key] = color;
              }
              q.setColors.run(JSON.stringify(c));
            });
          },
          // kind: 'lesson'(다른 수업) | 'off'(수업 없음) | 'reset'(기본으로)
          setDay(date, period, kind, lesson) {
            checkDate(date);
            checkPeriod(period);
            if (!["lesson", "off", "reset"].includes(kind)) throw new UserError2("\uBC14\uAFB8\uB294 \uBC29\uBC95\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            const l = kind === "lesson" ? cleanLesson(lesson) : null;
            return change(() => {
              q.oldOv.run(addDays(today(), -KEEP_PAST_DAYS));
              if (kind === "reset") return q.delOv.run(date, period);
              if (!q.hasOv.get(date, period) && q.countOv.get().n >= MAX_OVERRIDES) throw new UserError2("\uBC14\uB010 \uB0A0\uC774 \uB108\uBB34 \uB9CE\uC544\uC694.");
              if (kind === "off") q.putOv.run(date, period, 1, "", "", "", Date.now());
              else q.putOv.run(date, period, 0, l.subject, l.klass, l.room, Date.now());
            });
          },
          // expectPeriods: 편집을 시작할 때 본 교시 수. 그 사이 다른 기기가 교시 수를 바꿨으면 거절한다
          // (모르는 채로 저장해서 다른 기기가 넣은 교시·수업을 지우지 않게).
          setBells(input, expectPeriods) {
            const b = validBells(input);
            if (!Number.isInteger(expectPeriods)) throw new UserError2("\uD654\uBA74\uC744 \uC0C8\uB85C \uACE0\uCE5C \uB4A4 \uB2E4\uC2DC \uC800\uC7A5\uD574 \uC8FC\uC138\uC694.");
            return change(() => {
              if (bells().periods.length !== expectPeriods) throw new Conflict("\uB2E4\uB978 \uAE30\uAE30\uC5D0\uC11C \uC885 \uC2DC\uAC04\uC744 \uBA3C\uC800 \uBC14\uAFE8\uC5B4\uC694. \uB2E4\uC2DC \uC5F4\uC5B4\uC11C \uD655\uC778\uD574 \uC8FC\uC138\uC694.", current());
              q.setBells.run(JSON.stringify(b));
              q.dropBaseAfter.run(b.periods.length);
              q.dropOvAfter.run(b.periods.length);
            });
          }
        };
      }
      module.exports = { createTimetable, validBells, DEFAULT_BELLS, toMin, COLORS };
    }
  });

  // ../lib/ttnotes.js
  var require_ttnotes = __commonJS({
    "../lib/ttnotes.js"(exports, module) {
      var { tx } = require_db();
      var { UserError: UserError2, Conflict } = require_errors();
      var { validDate, addDays } = require_school();
      var MAX_BODY = 1e3;
      var SNAP_PAST_DAYS = 21;
      var SNAP_FUTURE_DAYS = 63;
      var FUTURE_DAYS = 365;
      var MAX_NOTES = 2e4;
      var MAX_PERIOD = 10;
      var MAX_SPAN_DAYS = 42;
      function short(v, label) {
        if (v === void 0 || v === null) return "";
        if (typeof v !== "string") throw new UserError2(`${label} \uD615\uC2DD\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.`);
        return v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 20);
      }
      function createTtNotes(db, hub, opts = {}) {
        const today = opts.today || (() => require_today().localDate());
        const periods = opts.periods || (() => MAX_PERIOD);
        const COLS = "date, period, body, subject, klass, rev, updated_at";
        const q = {
          list: db.prepare(`SELECT ${COLS} FROM timetable_note WHERE date >= ? AND date <= ? ORDER BY date, period`),
          get: db.prepare(`SELECT ${COLS} FROM timetable_note WHERE date = ? AND period = ?`),
          insert: db.prepare("INSERT INTO timetable_note (date, period, body, subject, klass, rev, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"),
          // 과목·반은 처음 적을 때의 수업으로 남긴다 (나중에 시간표가 바뀌어도)
          update: db.prepare("UPDATE timetable_note SET body = ?, rev = ?, updated_at = ? WHERE date = ? AND period = ?"),
          remove: db.prepare("DELETE FROM timetable_note WHERE date = ? AND period = ?"),
          count: db.prepare("SELECT COUNT(*) n FROM timetable_note")
        };
        const row = (r) => r ? { ...r } : null;
        const lastDay = () => addDays(today(), FUTURE_DAYS);
        function current() {
          const from = addDays(today(), -SNAP_PAST_DAYS);
          const to = addDays(today(), SNAP_FUTURE_DAYS);
          return { range: { from, to }, maxDate: lastDay(), notes: q.list.all(from, to).map(row) };
        }
        hub.register("ttnotes", current, "session");
        function checkDate(date) {
          if (!validDate(date) || date < "2000-01-01") throw new UserError2("\uB0A0\uC9DC\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
          if (date > lastDay()) throw new UserError2("\uC55E\uC73C\uB85C 1\uB144 \uC548\uC758 \uC218\uC5C5\uC5D0\uB9CC \uBA54\uBAA8\uD560 \uC218 \uC788\uC5B4\uC694.");
        }
        return {
          current,
          // 스냅샷 밖의 주(지난 기록)를 볼 때
          range(from, to) {
            if (!validDate(from) || !validDate(to) || from > to || to > addDays(from, MAX_SPAN_DAYS)) throw new UserError2("\uB0A0\uC9DC \uBC94\uC704\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            return { notes: q.list.all(from, to).map(row) };
          },
          // body 가 비면 지운다. rev: 화면이 알던 버전 (없던 메모는 0)
          save({ date, period, body, rev, subject, klass }) {
            checkDate(date);
            if (!Number.isInteger(period) || period < 1 || period > MAX_PERIOD) throw new UserError2("\uAD50\uC2DC\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            if (typeof body !== "string") throw new UserError2("\uBA54\uBAA8 \uB0B4\uC6A9\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            if (body.length > MAX_BODY) throw new UserError2(`\uC218\uC5C5 \uBA54\uBAA8\uB294 ${MAX_BODY}\uC790\uAE4C\uC9C0\uC608\uC694.`);
            if (!Number.isSafeInteger(rev) || rev < 0) throw new UserError2("\uBC84\uC804 \uC815\uBCF4\uAC00 \uC5C6\uC5B4\uC694. \uD654\uBA74\uC744 \uC0C8\uB85C \uACE0\uCCD0 \uC8FC\uC138\uC694.");
            const text = body.replace(/\s+$/, "");
            const s = short(subject, "\uACFC\uBAA9");
            const k = short(klass, "\uBC18");
            const { note, v } = tx(db, () => {
              const now = q.get.get(date, period);
              if ((now?.rev || 0) !== rev) throw new Conflict("\uB2E4\uB978 \uAE30\uAE30\uC5D0\uC11C \uBA3C\uC800 \uACE0\uCCE4\uC5B4\uC694.", row(now));
              if (!now && !text) return { note: null, v: null };
              if (now && now.body === text) return { note: row(now), v: null };
              if (!now) {
                if (period > periods()) throw new UserError2("\uC9C0\uAE08 \uC2DC\uAC04\uD45C\uC5D0 \uC5C6\uB294 \uAD50\uC2DC\uC608\uC694.");
                if (q.count.get().n >= MAX_NOTES) throw new UserError2("\uC218\uC5C5 \uBA54\uBAA8\uAC00 \uB108\uBB34 \uB9CE\uC544\uC694.");
              }
              const ver = hub.bump();
              if (!text) q.remove.run(date, period);
              else if (!now) q.insert.run(date, period, text, s, k, ver, Date.now());
              else q.update.run(text, ver, Date.now(), date, period);
              return { note: row(q.get.get(date, period)), v: ver };
            });
            if (v !== null) hub.publish(v, "ttnote", { date, period, note });
            return { note };
          }
        };
      }
      module.exports = { createTtNotes, MAX_BODY };
    }
  });

  // ../lib/stickies.js
  var require_stickies = __commonJS({
    "../lib/stickies.js"(exports, module) {
      var { tx } = require_db();
      var { UserError: UserError2, NotFound } = require_errors();
      var COLORS = ["y", "p", "b", "g", "o"];
      var MAX_BODY = 500;
      var MAX_COUNT = 40;
      function cleanBody(v) {
        if (typeof v !== "string") throw new UserError2("\uBA54\uBAA8 \uB0B4\uC6A9\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
        if (v.length > MAX_BODY) throw new UserError2(`\uD3EC\uC2A4\uD2B8\uC787\uC740 ${MAX_BODY}\uC790\uAE4C\uC9C0\uC608\uC694.`);
        return v;
      }
      function createStickies(db, hub) {
        const q = {
          list: db.prepare("SELECT id, body, color, updated_at FROM stickies ORDER BY position, id"),
          get: db.prepare("SELECT id FROM stickies WHERE id = ?"),
          count: db.prepare("SELECT COUNT(*) n FROM stickies"),
          minPos: db.prepare("SELECT MIN(position) p FROM stickies"),
          insert: db.prepare("INSERT INTO stickies (body, color, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"),
          body: db.prepare("UPDATE stickies SET body = ?, updated_at = ? WHERE id = ?"),
          color: db.prepare("UPDATE stickies SET color = ?, updated_at = ? WHERE id = ?"),
          remove: db.prepare("DELETE FROM stickies WHERE id = ?")
        };
        const list = () => q.list.all().map((r) => ({ ...r }));
        hub.register("stickies", list, "read");
        function change(fn) {
          const { result, v } = tx(db, () => ({ result: fn(), v: hub.bump() }));
          hub.publish(v, "stickies", list());
          return result;
        }
        const must = (id) => {
          if (!q.get.get(id)) throw new NotFound("\uC774\uBBF8 \uC9C0\uC6B4 \uBA54\uBAA8\uC608\uC694.");
        };
        const lastSeq = /* @__PURE__ */ new Map();
        const SEQ_MAX = 5e3;
        const TAB_RE = /^[A-Za-z0-9_-]{8,40}$/;
        return {
          list,
          // 새 장은 맨 앞에
          add(body = "", color = "y") {
            const b = cleanBody(body);
            if (!COLORS.includes(color)) throw new UserError2("\uC0C9\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            return change(() => {
              if (q.count.get().n >= MAX_COUNT) throw new UserError2(`\uD3EC\uC2A4\uD2B8\uC787\uC740 ${MAX_COUNT}\uC7A5\uAE4C\uC9C0\uC608\uC694. \uB2E4 \uC4F4 \uAC83\uC744 \uC9C0\uC6CC \uC8FC\uC138\uC694.`);
              const pos = (q.minPos.get().p ?? 1) - 1;
              const now = Date.now();
              return { id: Number(q.insert.run(b, color, pos, now, now).lastInsertRowid) };
            });
          },
          edit(id, { body, color, tab, seq }) {
            if (body === void 0 && color === void 0) throw new UserError2("\uBC14\uAFC0 \uB0B4\uC6A9\uC774 \uC5C6\uC5B4\uC694.");
            if (body !== void 0 && tab !== void 0) {
              if (typeof tab !== "string" || !TAB_RE.test(tab) || !Number.isSafeInteger(seq) || seq < 0) throw new UserError2("\uC800\uC7A5 \uC21C\uBC88\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
              const last = lastSeq.get(`${id}:${tab}`);
              if (last !== void 0 && last >= seq) return { id, skipped: true };
            }
            const b = body === void 0 ? void 0 : cleanBody(body);
            if (color !== void 0 && !COLORS.includes(color)) throw new UserError2("\uC0C9\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            return change(() => {
              must(id);
              if (b !== void 0) q.body.run(b, Date.now(), id);
              if (color !== void 0) q.color.run(color, Date.now(), id);
              if (b !== void 0 && tab !== void 0) {
                const k = `${id}:${tab}`;
                lastSeq.delete(k);
                lastSeq.set(k, seq);
                if (lastSeq.size > SEQ_MAX) lastSeq.delete(lastSeq.keys().next().value);
              }
              return { id };
            });
          },
          remove(id) {
            return change(() => {
              must(id);
              q.remove.run(id);
              for (const k of lastSeq.keys()) if (k.startsWith(`${id}:`)) lastSeq.delete(k);
              return { id };
            });
          }
        };
      }
      module.exports = { createStickies, COLORS };
    }
  });

  // ../lib/google.js
  var require_google = __commonJS({
    "../lib/google.js"(exports, module) {
      var fs = require_stub();
      var path = require_stub();
      var crypto2 = require_stub();
      var { UserError: UserError2, NotFound } = require_errors();
      var REDIRECT = "http://127.0.0.1:8765";
      var SCOPES2 = ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.calendarlist.readonly"];
      var AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
      var TOKEN_URL = "https://oauth2.googleapis.com/token";
      var API = "https://www.googleapis.com/calendar/v3";
      var PENDING_MS = 15 * 6e4;
      var CACHE_MS = 6e4;
      var GoogleError2 = class extends Error {
        constructor(message, status = 502) {
          super(message);
          this.status = status;
        }
      };
      var b64url = (buf) => buf.toString("base64url");
      var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
      var TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
      var EVENT_ID_RE = /^[a-v0-9]{20,64}$/;
      var SEOUL = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
      function seoul(iso) {
        const p = Object.fromEntries(SEOUL.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
        return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
      }
      function addDays(dateStr, n) {
        const d = /* @__PURE__ */ new Date(`${dateStr}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() + n);
        return d.toISOString().slice(0, 10);
      }
      function normalize(ev, cal) {
        if (!ev || ev.status === "cancelled" || !ev.start) return null;
        let date;
        let end;
        let time = null;
        let endTime = null;
        let endDate = null;
        if (ev.start.date) {
          date = ev.start.date;
          end = ev.end?.date ? addDays(ev.end.date, -1) : date;
          if (end < date) end = date;
          endDate = end;
        } else if (ev.start.dateTime) {
          const s = seoul(ev.start.dateTime);
          const e = seoul(ev.end?.dateTime || ev.start.dateTime);
          date = s.date;
          time = s.time;
          end = e.date < s.date ? s.date : e.date;
          endTime = e.time;
          endDate = end;
          if (end > date && endTime === "00:00") end = addDays(end, -1);
        } else return null;
        if (end < date) end = date;
        return {
          id: `google:${cal.id}:${ev.id}`,
          source: "google",
          calendarId: cal.id,
          eventId: String(ev.id),
          etag: typeof ev.etag === "string" ? ev.etag : null,
          // 고칠 때 '그 사이 바뀌었나' 확인용
          date,
          end,
          endDate,
          time,
          endTime,
          title: String(ev.summary || "(\uC81C\uBAA9 \uC5C6\uC74C)").slice(0, 200),
          detail: [cal.summary, ev.location].filter(Boolean).join(" \xB7 ").slice(0, 300),
          color: cal.color || null,
          editable: cal.writable
        };
      }
      function okEtag(v) {
        return typeof v === "string" && /^"[\x21\x23-\x7e]{1,120}"$/.test(v) ? v : null;
      }
      function clearOther(body) {
        for (const k of ["start", "end"]) {
          if (body[k].date) Object.assign(body[k], { dateTime: null, timeZone: null });
          else body[k].date = null;
        }
        return body;
      }
      function createGoogle(cfg, hub, db, deps = {}) {
        const fetchFn = deps.fetch || fetch;
        const web = deps.web || null;
        const bundled = Boolean(cfg.googleClientFile) || Boolean(web);
        const clientFile = web ? null : cfg.googleClientFile || path.join(cfg.secretsDir, "google-client.json");
        const redirectUri = cfg.googleRedirect || REDIRECT;
        const tokenFile = web ? null : path.join(cfg.secretsDir, "google-token.json");
        const getSetting = db.prepare("SELECT value FROM meta WHERE key = 'google'");
        const putSetting = db.prepare("INSERT INTO meta (key, value) VALUES ('google', ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value");
        let pending = null;
        let gen = 0;
        let evGen = 0;
        let access = null;
        let refreshing = null;
        let calCache = null;
        const evCache = /* @__PURE__ */ new Map();
        const evInflight = /* @__PURE__ */ new Map();
        const readJson = (f) => {
          try {
            return JSON.parse(fs.readFileSync(f, "utf8"));
          } catch {
            return null;
          }
        };
        function writeSecret(f, obj) {
          fs.mkdirSync(path.dirname(f), { recursive: true, mode: 448 });
          const tmp = `${f}.${process.pid}.tmp`;
          fs.writeFileSync(tmp, JSON.stringify(obj), { mode: 384 });
          fs.renameSync(tmp, f);
        }
        const client = () => web ? null : readJson(clientFile);
        const token = () => web ? null : readJson(tokenFile);
        const isLinked = () => web ? web.linked() : Boolean(token()?.refresh_token);
        const isConfigured = () => web ? web.configured() : Boolean(client());
        function settings() {
          try {
            return JSON.parse(getSetting.get()?.value || "{}");
          } catch {
            return {};
          }
        }
        function forget() {
          evGen += 1;
          calCache = null;
          evCache.clear();
        }
        const stale = (g) => {
          if (g !== gen) throw new GoogleError2("\uAD6C\uAE00 \uC5F0\uACB0\uC774 \uBC14\uB00C\uC5C8\uC5B4\uC694. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.", 409);
        };
        async function post(url, form) {
          let res;
          try {
            res = await fetchFn(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(form), signal: AbortSignal.timeout(1e4) });
          } catch {
            throw new GoogleError2("\uAD6C\uAE00\uC5D0 \uB2FF\uC9C0 \uC54A\uC544\uC694.");
          }
          const body = await res.json().catch(() => ({}));
          return { res, body };
        }
        async function accessToken() {
          if (web) return web.accessToken();
          if (access && access.exp - 6e4 > Date.now()) return access.token;
          if (refreshing) return refreshing;
          const g = gen;
          const p = (async () => {
            const c = client();
            const t = token();
            if (!c || !t?.refresh_token) throw new GoogleError2("\uAD6C\uAE00 \uCE98\uB9B0\uB354\uC640 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC5B4\uC694.", 409);
            const { res, body } = await post(TOKEN_URL, { client_id: c.client_id, client_secret: c.client_secret, refresh_token: t.refresh_token, grant_type: "refresh_token" });
            if (!res.ok) {
              if (body.error === "invalid_grant") throw new GoogleError2("\uAD6C\uAE00 \uB85C\uADF8\uC778\uC774 \uD480\uB838\uC5B4\uC694. \uB2E4\uC2DC \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694.", 409);
              throw new GoogleError2(`\uAD6C\uAE00 \uC5F4\uC1E0 \uAC31\uC2E0 \uC2E4\uD328 (${body.error || res.status})`);
            }
            stale(g);
            access = { token: body.access_token, exp: Date.now() + (Number(body.expires_in) || 3e3) * 1e3 };
            return access.token;
          })().finally(() => {
            if (refreshing === p) refreshing = null;
          });
          refreshing = p;
          return p;
        }
        async function gapi(method, url, body, g = gen, retry = true, ifMatch = null) {
          stale(g);
          const t = await accessToken();
          stale(g);
          let res;
          try {
            res = await fetchFn(API + url, {
              method,
              headers: { Authorization: `Bearer ${t}`, ...body ? { "Content-Type": "application/json" } : {}, ...ifMatch ? { "If-Match": ifMatch } : {} },
              body: body ? JSON.stringify(body) : void 0,
              signal: AbortSignal.timeout(1e4)
            });
          } catch {
            throw new GoogleError2("\uAD6C\uAE00\uC5D0 \uB2FF\uC9C0 \uC54A\uC544\uC694.");
          }
          stale(g);
          if (res.status === 401 && retry) {
            access = null;
            web?.invalidate();
            return gapi(method, url, body, g, false, ifMatch);
          }
          if (res.status === 204) return null;
          const data = await res.json().catch(() => ({}));
          if (res.status === 404 || res.status === 410) throw new NotFound("\uAD6C\uAE00\uC5D0 \uC5C6\uB294 \uC77C\uC815\uC774\uC5D0\uC694 (\uC774\uBBF8 \uC9C0\uC6CC\uC84C\uC744 \uC218 \uC788\uC5B4\uC694).");
          if (res.status === 412) {
            changed();
            const e = new GoogleError2("\uADF8 \uC0AC\uC774 \uB2E4\uB978 \uACF3\uC5D0\uC11C \uC774 \uC77C\uC815\uC744 \uACE0\uCCE4\uC5B4\uC694. \uC801\uC740 \uB0B4\uC6A9\uC744 \uB530\uB85C \uC62E\uACA8 \uB450\uACE0, \uCC3D\uC744 \uB2EB\uC558\uB2E4\uAC00 \uB2E4\uC2DC \uC5F4\uC5B4 \uC8FC\uC138\uC694.", 409);
            e.googleStatus = 412;
            throw e;
          }
          if (!res.ok) {
            const e = new GoogleError2(`\uAD6C\uAE00 \uC751\uB2F5 ${res.status}: ${data.error?.message || ""}`.trim(), res.status === 400 ? 400 : 502);
            e.googleStatus = res.status;
            throw e;
          }
          return data;
        }
        async function all(url, g = gen) {
          const items = [];
          let pageToken = null;
          for (let i = 0; i < 10; i += 1) {
            const d = await gapi("GET", pageToken ? `${url}&pageToken=${encodeURIComponent(pageToken)}` : url, null, g);
            items.push(...d.items || []);
            pageToken = d.nextPageToken || null;
            if (!pageToken) return items;
          }
          throw new GoogleError2("\uAD6C\uAE00 \uC77C\uC815\uC774 \uB108\uBB34 \uB9CE\uC544 \uB2E4 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694.");
        }
        async function calendars(cg = gen) {
          if (calCache && Date.now() - calCache.at < 5 * 6e4) return calCache.list;
          const g = evGen;
          const items = await all("/users/me/calendarList?maxResults=250", cg);
          const list = items.map((c) => ({
            id: String(c.id),
            summary: String(c.summaryOverride || c.summary || c.id).slice(0, 100),
            color: /^#[0-9a-f]{6}$/i.test(c.backgroundColor) ? c.backgroundColor : null,
            primary: Boolean(c.primary),
            writable: ["owner", "writer"].includes(c.accessRole)
          }));
          if (g === evGen) calCache = { at: Date.now(), list };
          return list;
        }
        async function shown(cg = gen) {
          const list = await calendars(cg);
          const s = settings();
          const ids = Array.isArray(s.show) ? s.show : list.filter((c) => c.primary).map((c) => c.id);
          return list.filter((c) => ids.includes(c.id));
        }
        function changed() {
          forget();
          hub.live("google", { changedAt: Date.now() });
        }
        return {
          async status() {
            const t = token();
            const out = { bundled, web: Boolean(web), configured: isConfigured(), linked: isLinked(), email: web ? web.email() : t?.email || null, calendars: [], settings: settings(), error: null };
            if (out.linked && web?.expired()) {
              out.relogin = true;
              out.error = "\uAD6C\uAE00 \uB85C\uADF8\uC778 \uC2DC\uAC04\uC774 \uB05D\uB0AC\uC5B4\uC694 (1\uC2DC\uAC04\uB9C8\uB2E4). [\uAD6C\uAE00 \uB2E4\uC2DC \uC5F0\uACB0]\uC744 \uB20C\uB7EC \uC8FC\uC138\uC694.";
            } else if (out.linked) {
              try {
                out.calendars = await calendars();
              } catch (err) {
                out.error = err.message;
                out.relogin = Boolean(err.relogin);
              }
            }
            return out;
          },
          // 데스크톱 앱 JSON ({"installed":{client_id, client_secret, ...}}) 붙여넣기
          saveClient(text) {
            if (bundled) throw new UserError2("\uC774 \uD504\uB85C\uADF8\uB7A8\uC5D0\uB294 \uAD6C\uAE00 \uC5F0\uACB0 \uC815\uBCF4\uAC00 \uC774\uBBF8 \uB4E4\uC5B4 \uC788\uC5B4\uC694.");
            let j;
            try {
              j = typeof text === "string" ? JSON.parse(text) : text;
            } catch {
              throw new UserError2("JSON \uD615\uC2DD\uC774 \uC544\uB2C8\uC5D0\uC694. \uBC1B\uC740 \uD30C\uC77C \uB0B4\uC6A9\uC744 \uADF8\uB300\uB85C \uBD99\uC5EC\uB123\uC5B4 \uC8FC\uC138\uC694.");
            }
            const c = j?.installed || j?.web || j;
            if (!c || typeof c.client_id !== "string" || typeof c.client_secret !== "string" || !c.client_id.endsWith(".apps.googleusercontent.com")) {
              throw new UserError2("\uAD6C\uAE00 OAuth \uD074\uB77C\uC774\uC5B8\uD2B8 JSON\uC774 \uC544\uB2C8\uC5D0\uC694.");
            }
            if (!j.installed) throw new UserError2('"\uB370\uC2A4\uD06C\uD1B1 \uC571" \uC720\uD615\uC73C\uB85C \uB9CC\uB4E0 \uD074\uB77C\uC774\uC5B8\uD2B8\uB97C \uC368 \uC8FC\uC138\uC694.');
            writeSecret(clientFile, { client_id: c.client_id, client_secret: c.client_secret });
            gen += 1;
            access = null;
            refreshing = null;
            return { ok: true };
          },
          start() {
            const c = client();
            if (!c) throw new UserError2("\uBA3C\uC800 \uAD6C\uAE00 \uD074\uB77C\uC774\uC5B8\uD2B8 JSON\uC744 \uB123\uC5B4 \uC8FC\uC138\uC694.");
            const verifier = b64url(crypto2.randomBytes(48));
            const state = b64url(crypto2.randomBytes(24));
            pending = { state, verifier, at: Date.now() };
            const u = new URL(AUTH_URL);
            u.search = new URLSearchParams({
              client_id: c.client_id,
              redirect_uri: redirectUri,
              response_type: "code",
              scope: SCOPES2.join(" "),
              access_type: "offline",
              prompt: "consent",
              state,
              code_challenge: b64url(crypto2.createHash("sha256").update(verifier).digest()),
              code_challenge_method: "S256"
            });
            return { url: u.toString(), redirect: redirectUri };
          },
          // 사용자가 붙여넣은 "연결할 수 없음" 페이지 주소 (http://127.0.0.1:8765/?state=…&code=…)
          async finish(pasted) {
            if (typeof pasted !== "string" || pasted.length > 4e3) throw new UserError2("\uC8FC\uC18C\uB97C \uBD99\uC5EC\uB123\uC5B4 \uC8FC\uC138\uC694.");
            let u;
            try {
              u = new URL(pasted.trim());
            } catch {
              throw new UserError2("\uC8FC\uC18C \uD615\uC2DD\uC774 \uC544\uB2C8\uC5D0\uC694. \uC8FC\uC18C\uCC3D\uC758 \uC8FC\uC18C\uB97C \uD1B5\uC9F8\uB85C \uBCF5\uC0AC\uD574 \uC8FC\uC138\uC694.");
            }
            const err = u.searchParams.get("error");
            if (err) throw new UserError2(err === "access_denied" ? "\uAD6C\uAE00\uC5D0\uC11C \uD5C8\uC6A9\uD558\uC9C0 \uC54A\uC558\uC5B4\uC694. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694." : `\uAD6C\uAE00 \uC624\uB958: ${err}`);
            const code = u.searchParams.get("code");
            const state = u.searchParams.get("state");
            if (!code || !state) throw new UserError2("\uC8FC\uC18C\uC5D0 code \uAC00 \uC5C6\uC5B4\uC694. \uB85C\uADF8\uC778\uC744 \uB9C8\uCE5C \uB4A4\uC758 \uC8FC\uC18C\uB97C \uBD99\uC5EC\uB123\uC5B4 \uC8FC\uC138\uC694.");
            if (!pending || Date.now() - pending.at > PENDING_MS) throw new UserError2('\uC2DC\uAC04\uC774 \uC9C0\uB0AC\uC5B4\uC694. "\uAD6C\uAE00 \uB85C\uADF8\uC778 \uC5F4\uAE30"\uBD80\uD130 \uB2E4\uC2DC \uD574 \uC8FC\uC138\uC694.');
            const a = Buffer.from(state);
            const b = Buffer.from(pending.state);
            if (a.length !== b.length || !crypto2.timingSafeEqual(a, b)) throw new UserError2("\uC774 \uC8FC\uC18C\uB294 \uBC29\uAE08 \uC5F0 \uB85C\uADF8\uC778\uACFC \uB9DE\uC9C0 \uC54A\uC544\uC694. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
            const { verifier } = pending;
            pending = null;
            const g = gen;
            const c = client();
            const { res, body } = await post(TOKEN_URL, { client_id: c.client_id, client_secret: c.client_secret, code, code_verifier: verifier, redirect_uri: redirectUri, grant_type: "authorization_code" });
            if (!res.ok || !body.refresh_token) throw new GoogleError2(`\uAD6C\uAE00 \uC5F0\uACB0 \uC2E4\uD328 (${body.error || res.status})`, 400);
            const granted = String(body.scope || "").split(" ");
            if (SCOPES2.some((x) => !granted.includes(x))) {
              post("https://oauth2.googleapis.com/revoke", { token: body.refresh_token }).catch(() => {
              });
              throw new UserError2('\uAD8C\uD55C \uB450 \uAC00\uC9C0(\uC77C\uC815 \uBCF4\uAE30\xB7\uC218\uC815, \uB2EC\uB825 \uBAA9\uB85D \uBCF4\uAE30)\uB97C \uBAA8\uB450 \uCCB4\uD06C\uD574\uC11C \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694. "\uAD6C\uAE00 \uB85C\uADF8\uC778 \uC5F4\uAE30"\uBD80\uD130 \uB2E4\uC2DC \uD574 \uC8FC\uC138\uC694.');
            }
            if (g !== gen) {
              await post("https://oauth2.googleapis.com/revoke", { token: body.refresh_token }).catch(() => {
              });
              stale(g);
            }
            let email = null;
            try {
              email = JSON.parse(Buffer.from(String(body.id_token || "").split(".")[1] || "", "base64url").toString()).email || null;
            } catch {
            }
            writeSecret(tokenFile, { refresh_token: body.refresh_token, email, linked_at: Date.now() });
            gen += 1;
            refreshing = null;
            access = { token: body.access_token, exp: Date.now() + (Number(body.expires_in) || 3e3) * 1e3 };
            changed();
            return { ok: true };
          },
          // 이 서버에서는 바로 끊고(열쇠 파일 지움), 구글 쪽 열쇠 취소는 결과를 알려 준다
          async disconnect() {
            if (web) {
              gen += 1;
              const revoked2 = await web.revoke().then(() => true, () => false);
              changed();
              return { ok: true, revoked: revoked2, message: revoked2 ? null : "\uB300\uC2DC\uBCF4\uB4DC\uC5D0\uC11C\uB294 \uB04A\uC5C8\uC9C0\uB9CC \uAD6C\uAE00 \uCABD \uCDE8\uC18C\uB294 \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694. \uAD6C\uAE00 \uACC4\uC815 \u2192 \uBCF4\uC548 \u2192 \uC11C\uB4DC\uD30C\uD2F0 \uC5F0\uACB0\uC5D0\uC11C \uC9C0\uC6CC \uC8FC\uC138\uC694." };
            }
            const t = token();
            gen += 1;
            pending = null;
            access = null;
            refreshing = null;
            fs.rmSync(tokenFile, { force: true });
            changed();
            let revoked = true;
            if (t?.refresh_token) {
              try {
                const { res } = await post("https://oauth2.googleapis.com/revoke", { token: t.refresh_token });
                revoked = res.ok;
              } catch {
                revoked = false;
              }
            }
            return { ok: true, revoked, message: revoked ? null : "\uB300\uC2DC\uBCF4\uB4DC\uC5D0\uC11C\uB294 \uB04A\uC5C8\uC9C0\uB9CC \uAD6C\uAE00 \uCABD \uCDE8\uC18C\uB294 \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694. \uAD6C\uAE00 \uACC4\uC815 \u2192 \uBCF4\uC548 \u2192 \uC11C\uB4DC\uD30C\uD2F0 \uC5F0\uACB0\uC5D0\uC11C \uC9C0\uC6CC \uC8FC\uC138\uC694." };
          },
          // 웹판: 화면에서 구글 로그인을 새로 마쳤을 때 (기억한 일정·오류를 비우고 화면에 다시 불러오라고 알림)
          linkedChanged() {
            gen += 1;
            changed();
          },
          saveSettings({ show, write }) {
            if (!Array.isArray(show) || show.length > 50 || show.some((x) => typeof x !== "string" || x.length > 300)) throw new UserError2("\uB2EC\uB825 \uBAA9\uB85D\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            if (write !== null && (typeof write !== "string" || write.length > 300)) throw new UserError2("\uC4F8 \uB2EC\uB825\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            putSetting.run(JSON.stringify({ show, write }));
            changed();
            return settings();
          },
          // from~to(포함) 일정. 연결 안 됐으면 빈 목록.
          async events(from, to) {
            if (!isLinked() || !isConfigured()) return { events: [], error: null, linked: false };
            const key = `${from}~${to}`;
            const c = evCache.get(key);
            if (c && Date.now() - c.at < CACHE_MS) return c.data;
            const g = evGen;
            const ikey = `${key}|${g}`;
            if (!evInflight.has(ikey)) {
              evInflight.set(ikey, (async () => {
                try {
                  const cg = gen;
                  const cals = await shown(cg);
                  const timeMin = (/* @__PURE__ */ new Date(`${from}T00:00:00+09:00`)).toISOString();
                  const timeMax = (/* @__PURE__ */ new Date(`${addDays(to, 1)}T00:00:00+09:00`)).toISOString();
                  const parts = await Promise.all(cals.map(async (cal) => {
                    const q = new URLSearchParams({ timeMin, timeMax, singleEvents: "true", orderBy: "startTime", maxResults: "250" });
                    const items = await all(`/calendars/${encodeURIComponent(cal.id)}/events?${q}`, cg);
                    return items.map((ev) => normalize(ev, cal)).filter(Boolean);
                  }));
                  const data = { events: parts.flat(), error: null, linked: true };
                  if (g === evGen) evCache.set(key, { at: Date.now(), data });
                  return data;
                } catch (err) {
                  const data = { events: c?.data.events || [], error: err.message, linked: true };
                  if (g === evGen) evCache.set(key, { at: Date.now() - CACHE_MS + 15e3, data });
                  return data;
                } finally {
                  evInflight.delete(ikey);
                }
              })());
            }
            return evInflight.get(ikey);
          },
          // 일정 하나 (D-day 맞추기용). 지워졌으면 null, 연결 안 됨·오류는 throw
          async eventById(calendarId, eventId) {
            if (!isLinked()) throw new GoogleError2("\uAD6C\uAE00 \uC5F0\uACB0 \uC548 \uB428", 409);
            if (typeof calendarId !== "string" || !calendarId || calendarId.length > 300 || !/^[A-Za-z0-9_@.-]{1,1024}$/.test(String(eventId))) return null;
            try {
              const ev = await gapi("GET", `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`);
              return normalize(ev, { id: calendarId });
            } catch (err) {
              if (err instanceof NotFound) return null;
              throw err;
            }
          },
          async writable(calendarId, g = gen) {
            const cal = (await calendars(g)).find((c) => c.id === calendarId);
            if (!cal) throw new UserError2("\uC5C6\uB294 \uB2EC\uB825\uC774\uC5D0\uC694.");
            if (!cal.writable) throw new UserError2("\uC774 \uB2EC\uB825\uC5D0\uB294 \uC4F8 \uC218 \uC5C6\uC5B4\uC694.");
            return cal;
          },
          // input: { calendarId?, title, date, end?, allDay, start?: 'HH:MM', endTime?: 'HH:MM', location? }
          toGoogle(input) {
            const title = typeof input.title === "string" ? input.title.trim() : "";
            if (!title || title.length > 200) throw new UserError2("\uC77C\uC815 \uC81C\uBAA9\uC744 \uC801\uC5B4 \uC8FC\uC138\uC694 (200\uC790\uAE4C\uC9C0).");
            const date = input.date;
            const end = input.end || date;
            const valid = (d) => typeof d === "string" && DATE_RE.test(d) && (/* @__PURE__ */ new Date(`${d}T00:00:00Z`)).toISOString().slice(0, 10) === d;
            if (!valid(date) || !valid(end) || end < date) throw new UserError2("\uB0A0\uC9DC\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            const body = { summary: title };
            if (typeof input.location === "string" && input.location.trim()) body.location = input.location.trim().slice(0, 200);
            if (input.allDay !== false) {
              body.start = { date };
              body.end = { date: addDays(end, 1) };
            } else {
              if (!TIME_RE.test(input.start || "") || !TIME_RE.test(input.endTime || "")) throw new UserError2("\uC2DC\uAC04\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
              if (end === date && input.endTime <= input.start) throw new UserError2("\uB05D\uB098\uB294 \uC2DC\uAC04\uC774 \uC2DC\uC791\uBCF4\uB2E4 \uB2A6\uC5B4\uC57C \uD574\uC694.");
              body.start = { dateTime: `${date}T${input.start}:00+09:00`, timeZone: "Asia/Seoul" };
              body.end = { dateTime: `${end}T${input.endTime}:00+09:00`, timeZone: "Asia/Seoul" };
            }
            return body;
          },
          async create(input) {
            const s = settings();
            const g = gen;
            const calendarId = input.calendarId || s.write || (await calendars(g)).find((c) => c.primary)?.id;
            const cal = await this.writable(calendarId, g);
            const body = this.toGoogle(input);
            if (input.newId !== void 0) {
              if (typeof input.newId !== "string" || !EVENT_ID_RE.test(input.newId)) throw new UserError2("\uC77C\uC815 id\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
              body.id = input.newId;
            }
            let ev;
            try {
              ev = await gapi("POST", `/calendars/${encodeURIComponent(cal.id)}/events`, body, g);
            } catch (err) {
              if (err.googleStatus !== 409 || !body.id) throw err;
              const { id, ...rest } = body;
              try {
                ev = await gapi("PATCH", `/calendars/${encodeURIComponent(cal.id)}/events/${id}`, clearOther(rest), g);
              } catch (e2) {
                if (e2 instanceof NotFound) ev = null;
                else throw e2;
              }
            }
            const out = ev && normalize(ev, cal);
            if (!out) throw new GoogleError2("\uC774\uBBF8 \uC9C0\uC6B4 \uC77C\uC815\uACFC \uBC88\uD638\uAC00 \uACB9\uCCE4\uC5B4\uC694. \uCC3D\uC744 \uB2EB\uACE0 \uB2E4\uC2DC \uB9CC\uB4E4\uC5B4 \uC8FC\uC138\uC694.", 409);
            changed();
            return out;
          },
          async update(calendarId, eventId, input, etag = null) {
            const g = gen;
            const cal = await this.writable(calendarId, g);
            if (typeof eventId !== "string" || !eventId || eventId.length > 1024) throw new NotFound("\uC5C6\uB294 \uC77C\uC815\uC774\uC5D0\uC694.");
            const body = clearOther(this.toGoogle(input));
            const ev = await gapi("PATCH", `/calendars/${encodeURIComponent(cal.id)}/events/${encodeURIComponent(eventId)}`, body, g, true, okEtag(etag));
            changed();
            return normalize(ev, cal);
          },
          async remove(calendarId, eventId, etag = null) {
            const g = gen;
            const cal = await this.writable(calendarId, g);
            if (typeof eventId !== "string" || !eventId || eventId.length > 1024) throw new NotFound("\uC5C6\uB294 \uC77C\uC815\uC774\uC5D0\uC694.");
            await gapi("DELETE", `/calendars/${encodeURIComponent(cal.id)}/events/${encodeURIComponent(eventId)}`, null, g, true, okEtag(etag));
            changed();
            return { ok: true };
          }
        };
      }
      module.exports = { createGoogle, normalize, GoogleError: GoogleError2, REDIRECT, SCOPES: SCOPES2 };
    }
  });

  // ../lib/settings.js
  var require_settings = __commonJS({
    "../lib/settings.js"(exports, module) {
      var { tx } = require_db();
      var { UserError: UserError2 } = require_errors();
      var OFFICES = {
        B10: ["\uC11C\uC6B8", "sen"],
        C10: ["\uBD80\uC0B0", "pen"],
        D10: ["\uB300\uAD6C", "dge"],
        E10: ["\uC778\uCC9C", "ice"],
        F10: ["\uAD11\uC8FC", "gen"],
        G10: ["\uB300\uC804", "dje"],
        H10: ["\uC6B8\uC0B0", "use"],
        I10: ["\uC138\uC885", "sje"],
        J10: ["\uACBD\uAE30", "goe"],
        K10: ["\uAC15\uC6D0", "gwe"],
        M10: ["\uCDA9\uBD81", "cbe"],
        N10: ["\uCDA9\uB0A8", "cne"],
        P10: ["\uC804\uBD81", "jbe"],
        Q10: ["\uC804\uB0A8", "jne"],
        R10: ["\uACBD\uBD81", "gbe"],
        S10: ["\uACBD\uB0A8", "gne"],
        T10: ["\uC81C\uC8FC", "jje"]
      };
      var OFFICE_AT = {
        B10: [37.5665, 126.978],
        C10: [35.1796, 129.0756],
        D10: [35.8714, 128.6014],
        E10: [37.4563, 126.7052],
        F10: [35.1595, 126.8526],
        G10: [36.3504, 127.3845],
        H10: [35.5384, 129.3114],
        I10: [36.48, 127.289],
        J10: [37.2636, 127.0286],
        K10: [37.8813, 127.7298],
        M10: [36.6424, 127.489],
        N10: [36.6588, 126.6728],
        P10: [35.8242, 127.148],
        Q10: [34.8161, 126.4629],
        R10: [36.5684, 128.7294],
        S10: [35.228, 128.6811],
        T10: [33.4996, 126.5312]
      };
      var portalUrl = (office) => OFFICES[office] ? `https://${OFFICES[office][1]}.eduptl.kr/bpm_lgn_lg00_001.do?noEpSession` : "";
      var neisUrl = (office) => OFFICES[office] ? `https://${OFFICES[office][1]}.neis.go.kr/` : "";
      var MAX_LINKS = 24;
      var MAX_FOLDERS = 12;
      var MAX_DDAYS = 8;
      var DDAY_REF = /^(google:[^\s]{1,300}:[A-Za-z0-9_@.-]{1,1024}|todo:\d{1,12})$/;
      var validDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
      var SEARCH = ["naver", "google"];
      function cleanUrl(v, label = "\uC8FC\uC18C") {
        if (typeof v !== "string") throw new UserError2(`${label}\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.`);
        let s = v.trim();
        if (s && !/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = `https://${s}`;
        let u;
        try {
          u = new URL(s);
        } catch {
          throw new UserError2(`${label}\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.`);
        }
        if (u.protocol !== "https:" && u.protocol !== "http:") throw new UserError2(`${label}\uB294 http \uB098 https \uB85C \uC2DC\uC791\uD574\uC57C \uD574\uC694.`);
        if (u.href.length > 500) throw new UserError2(`${label}\uAC00 \uB108\uBB34 \uAE38\uC5B4\uC694.`);
        return u.href;
      }
      function cleanFolder(v) {
        if (typeof v !== "string") throw new UserError2("\uD3F4\uB354 \uACBD\uB85C\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
        let s = v.trim().replace(/^"(.*)"$/, "$1").trim().replace(/\//g, "\\").replace(/\\{2,}/g, "\\");
        if (s.length > 3) s = s.replace(/\\+$/, "");
        if (/^[A-Za-z]:$/.test(s)) s += "\\";
        if (!/^[A-Za-z]:\\/.test(s) || /[\u0000-\u001f\u007f<>"|?*]/.test(s) || s.slice(2).includes(":") || s.length > 240) {
          throw new UserError2("\uD3F4\uB354 \uACBD\uB85C\uB294 C:\\ \uB098 D:\\ \uCC98\uB7FC \uB4DC\uB77C\uC774\uBE0C \uAE00\uC790\uB85C \uC2DC\uC791\uD574\uC57C \uD574\uC694. \uD0D0\uC0C9\uAE30 \uC8FC\uC18C\uCC3D\uC758 \uACBD\uB85C\uB97C \uBCF5\uC0AC\uD574 \uBD99\uC5EC\uB123\uC5B4 \uC8FC\uC138\uC694.");
        }
        return s;
      }
      function cleanTitle(v) {
        if (typeof v !== "string") throw new UserError2("\uC774\uB984\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
        const s = v.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
        if (!s) throw new UserError2("\uBC14\uB85C\uAC00\uAE30 \uC774\uB984\uC744 \uC801\uC5B4 \uC8FC\uC138\uC694.");
        if (s.length > 20) throw new UserError2("\uBC14\uB85C\uAC00\uAE30 \uC774\uB984\uC740 20\uC790\uAE4C\uC9C0\uC608\uC694.");
        return s;
      }
      function cleanSchoolName(v) {
        const s = String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 40);
        return s || "\uD559\uAD50";
      }
      var REGION = {
        \uC11C\uC6B8: ["\uC11C\uC6B8"],
        \uBD80\uC0B0: ["\uBD80\uC0B0"],
        \uB300\uAD6C: ["\uB300\uAD6C"],
        \uC778\uCC9C: ["\uC778\uCC9C"],
        \uAD11\uC8FC: ["\uAD11\uC8FC"],
        \uB300\uC804: ["\uB300\uC804"],
        \uC6B8\uC0B0: ["\uC6B8\uC0B0"],
        \uC138\uC885: ["\uC138\uC885"],
        \uACBD\uAE30: ["\uACBD\uAE30"],
        \uAC15\uC6D0: ["\uAC15\uC6D0"],
        \uCDA9\uCCAD\uBD81\uB3C4: ["\uCDA9\uCCAD\uBD81", "\uCDA9\uBD81"],
        \uCDA9\uBD81: ["\uCDA9\uCCAD\uBD81", "\uCDA9\uBD81"],
        \uCDA9\uCCAD\uB0A8\uB3C4: ["\uCDA9\uCCAD\uB0A8", "\uCDA9\uB0A8"],
        \uCDA9\uB0A8: ["\uCDA9\uCCAD\uB0A8", "\uCDA9\uB0A8"],
        \uC804\uB77C\uBD81\uB3C4: ["\uC804\uB77C\uBD81", "\uC804\uBD81"],
        \uC804\uBD81: ["\uC804\uB77C\uBD81", "\uC804\uBD81"],
        \uC804\uB77C\uB0A8\uB3C4: ["\uC804\uB77C\uB0A8", "\uC804\uB0A8"],
        \uC804\uB0A8: ["\uC804\uB77C\uB0A8", "\uC804\uB0A8"],
        \uACBD\uC0C1\uBD81\uB3C4: ["\uACBD\uC0C1\uBD81", "\uACBD\uBD81"],
        \uACBD\uBD81: ["\uACBD\uC0C1\uBD81", "\uACBD\uBD81"],
        \uACBD\uC0C1\uB0A8\uB3C4: ["\uACBD\uC0C1\uB0A8", "\uACBD\uB0A8"],
        \uACBD\uB0A8: ["\uACBD\uC0C1\uB0A8", "\uACBD\uB0A8"],
        \uC81C\uC8FC: ["\uC81C\uC8FC"]
      };
      function regionKeys(first) {
        const s = String(first || "");
        for (const k of Object.keys(REGION).sort((a, b) => b.length - a.length)) if (s.startsWith(k)) return REGION[k];
        return s ? [s.slice(0, 2)] : [];
      }
      var RIRO = { B10: { "7010216": "https://youngil.riroschool.kr/" } };
      function defaultLinks(school) {
        const riro = school ? RIRO[school.office]?.[school.code] : null;
        const seoul = school?.office === "B10";
        return [
          ...school?.homepage ? [{ title: "\uD559\uAD50 \uD648\uD398\uC774\uC9C0", url: school.homepage }] : [],
          ...riro ? [{ title: "\uB9AC\uB85C\uC2A4\uCFE8", url: riro }] : [],
          ...seoul ? [
            { title: "EVPN", url: "https://evpn.sen.go.kr/custom/index.html" },
            { title: "SEN GPT", url: "https://gov.wrks.ai/ko/chat" }
          ] : [],
          { title: "\uAD6C\uAE00", url: "https://www.google.com/" }
        ];
      }
      var PERSONAL_LINKS = [{ title: "\uC5C5\uBB34\uD3EC\uD138", url: "https://sen.eduptl.kr/bpm_lgn_lg00_001.do?noEpSession" }];
      function oldDefaultLinks(homepage) {
        return [
          ...homepage ? [{ title: "\uD559\uAD50 \uD648\uD398\uC774\uC9C0", url: homepage }] : [],
          { title: "\uB124\uC774\uBC84", url: "https://www.naver.com/" },
          { title: "\uAD6C\uAE00", url: "https://www.google.com/" },
          { title: "\uC720\uD29C\uBE0C", url: "https://www.youtube.com/" },
          { title: "\uAD6C\uAE00 \uD074\uB798\uC2A4\uB8F8", url: "https://classroom.google.com/" }
        ];
      }
      var sameLinks = (a, b) => Array.isArray(a) && a.length === b.length && a.every((l, i) => l?.title === b[i].title && l?.url === b[i].url);
      function createSettings(db, hub, deps = {}) {
        const getJson = deps.getJson || (async (url) => {
          const res = await fetch(url, { signal: AbortSignal.timeout(6e3) });
          if (!res.ok) throw new Error(`\uC751\uB2F5 ${res.status}`);
          return res.json();
        });
        const q = {
          get: db.prepare("SELECT value FROM app_settings WHERE key = ?"),
          del: db.prepare("DELETE FROM app_settings WHERE key = ?"),
          put: db.prepare("INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value")
        };
        function read(key, def) {
          try {
            const r = q.get.get(key);
            return r ? JSON.parse(r.value) : def;
          } catch {
            return def;
          }
        }
        const write = (key, v) => q.put.run(key, JSON.stringify(v));
        const followPortal = (before, office) => {
          if (!before.portal.url || before.portal.url === portalUrl(before.office)) write("portal", { url: portalUrl(office), auto: before.portal.auto });
        };
        const officeNow = () => {
          const s = read("school", null);
          const o = s?.office || read("office", "");
          return OFFICES[o] ? o : "";
        };
        function current() {
          const school = read("school", null);
          const office = officeNow();
          return {
            school,
            // { office, officeName, code, name, address, homepage, lat, lon } | null
            office,
            // 'B10' 처럼, 없으면 ''
            officeName: office ? OFFICES[office][0] : "",
            neis: neisUrl(office),
            portal: read("portal", { url: portalUrl(office), auto: false }),
            links: read("links", deps.personal ? PERSONAL_LINKS : defaultLinks(school)),
            search: read("search", "naver"),
            folders: read("folders", []),
            // [{ title, path }] 자주 가는 PC 폴더 (배포판, 윈도우)
            ddays: read("ddays", [])
            // [{ ref: 'google:달력:일정' | 'todo:번호', title, date }]
          };
        }
        hub.register("settings", current, "session");
        if (!deps.personal) {
          const school = read("school", null);
          if (sameLinks(read("links", null), oldDefaultLinks(school?.homepage))) write("links", defaultLinks(school));
        }
        function change(fn) {
          const { data, v } = tx(db, () => {
            fn();
            return { data: current(), v: hub.bump() };
          });
          hub.publish(v, "settings", data);
          return data;
        }
        async function locate(address) {
          const parts = String(address || "").split(/\s+/);
          const keys = regionKeys(parts[0]);
          for (const name of [parts[2], parts[1]].filter((p) => p && /[시군구]$/.test(p))) {
            try {
              const u = new URL("https://geocoding-api.open-meteo.com/v1/search");
              u.search = new URLSearchParams({ name, count: "10", language: "ko", countryCode: "KR" });
              const r = (await getJson(u.toString()))?.results || [];
              const hit = r.find((x) => keys.some((k) => String(x.admin1 || "").startsWith(k))) || null;
              if (hit) return { lat: String(hit.latitude), lon: String(hit.longitude) };
            } catch {
            }
          }
          return null;
        }
        return {
          current,
          // 학교 이름으로 찾기 (나이스, 열쇠 없이 5건까지라 고른 교육청 안에서만, 줄인 이름은 풀어서)
          async searchSchools(name, office = "") {
            let s = typeof name === "string" ? name.replace(/\s+/g, "") : "";
            if (s.length < 2 || s.length > 30) throw new UserError2("\uD559\uAD50 \uC774\uB984\uC744 \uB450 \uAE00\uC790 \uC774\uC0C1 \uC801\uC5B4 \uC8FC\uC138\uC694.");
            s = s.replace(/여고$/, "\uC5EC\uC790\uACE0\uB4F1\uD559\uAD50").replace(/여중$/, "\uC5EC\uC790\uC911\uD559\uAD50").replace(/고$/, "\uACE0\uB4F1\uD559\uAD50").replace(/중$/, "\uC911\uD559\uAD50").replace(/초$/, "\uCD08\uB4F1\uD559\uAD50");
            const u = new URL("https://open.neis.go.kr/hub/schoolInfo");
            u.search = new URLSearchParams({ Type: "json", SCHUL_NM: s, pSize: "20", ...OFFICES[office] ? { ATPT_OFCDC_SC_CODE: office } : {} });
            let j;
            try {
              j = await getJson(u.toString());
            } catch {
              throw new UserError2("\uD559\uAD50 \uCC3E\uAE30(\uB098\uC774\uC2A4 \uACF5\uAC1C \uC790\uB8CC)\uC5D0 \uC5F0\uACB0\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC704\uC5D0\uC11C \uAD50\uC721\uCCAD\uB9CC \uACE8\uB77C\uB3C4 \uB3FC\uC694.");
            }
            const rows = j?.schoolInfo?.[1]?.row || [];
            return rows.filter((r) => OFFICES[r.ATPT_OFCDC_SC_CODE] && /^\d{7}$/.test(r.SD_SCHUL_CODE)).map((r) => ({
              office: r.ATPT_OFCDC_SC_CODE,
              officeName: OFFICES[r.ATPT_OFCDC_SC_CODE][0],
              code: r.SD_SCHUL_CODE,
              name: String(r.SCHUL_NM || "").slice(0, 40),
              address: String(r.ORG_RDNMA || "").slice(0, 100),
              homepage: (() => {
                try {
                  return r.HMPG_ADRES ? cleanUrl(String(r.HMPG_ADRES)) : "";
                } catch {
                  return "";
                }
              })(),
              kind: String(r.SCHUL_KND_SC_NM || "").slice(0, 10)
              // 초등학교·중학교·고등학교·특수학교… (나이스 시간표 주소 고를 때)
            }));
          },
          // 고른 학교 저장 (검색 결과 하나를 그대로). 업무포털 주소는 바꾸지 않았다면 새 교육청 것으로
          async setSchool(pick) {
            if (!pick || !OFFICES[pick.office] || !/^\d{7}$/.test(String(pick.code))) throw new UserError2("\uD559\uAD50\uB97C \uB2E4\uC2DC \uACE8\uB77C \uC8FC\uC138\uC694.");
            const school = {
              office: pick.office,
              officeName: OFFICES[pick.office][0],
              code: String(pick.code),
              name: cleanSchoolName(pick.name),
              address: typeof pick.address === "string" ? pick.address.slice(0, 100) : "",
              kind: typeof pick.kind === "string" ? pick.kind.slice(0, 10) : "",
              homepage: (() => {
                try {
                  return pick.homepage ? cleanUrl(pick.homepage) : "";
                } catch {
                  return "";
                }
              })(),
              lat: null,
              lon: null
            };
            const at = await locate(school.address) || { lat: String(OFFICE_AT[school.office][0]), lon: String(OFFICE_AT[school.office][1]) };
            Object.assign(school, at);
            return change(() => {
              const before = current();
              write("school", school);
              write("office", school.office);
              followPortal(before, school.office);
              if (!q.get.get("links") || sameLinks(read("links", null), oldDefaultLinks(before.school?.homepage))) write("links", defaultLinks(school));
            });
          },
          // 교육청만 고르기. 다른 교육청으로 바꾸면 골라 둔 학교는 지운다 (급식이 엉뚱한 학교로 가지 않게)
          setOffice(code) {
            if (!OFFICES[code]) throw new UserError2("\uAD50\uC721\uCCAD\uC744 \uB2E4\uC2DC \uACE8\uB77C \uC8FC\uC138\uC694.");
            return change(() => {
              const before = current();
              if (before.school && before.school.office !== code) q.del.run("school");
              write("office", code);
              followPortal(before, code);
            });
          },
          setPortal({ url, auto }) {
            const p = { url: url === "" ? "" : cleanUrl(url, "\uC5C5\uBB34\uD3EC\uD138 \uC8FC\uC18C"), auto: Boolean(auto) };
            return change(() => write("portal", p));
          },
          setLinks(links) {
            if (!Array.isArray(links) || links.length > MAX_LINKS) throw new UserError2(`\uBC14\uB85C\uAC00\uAE30\uB294 ${MAX_LINKS}\uAC1C\uAE4C\uC9C0\uC608\uC694.`);
            const clean = links.map((l) => ({ title: cleanTitle(l?.title), url: cleanUrl(l?.url) }));
            return change(() => write("links", clean));
          },
          setFolders(folders) {
            if (!Array.isArray(folders) || folders.length > MAX_FOLDERS) throw new UserError2(`\uD3F4\uB354\uB294 ${MAX_FOLDERS}\uAC1C\uAE4C\uC9C0\uC608\uC694.`);
            const clean = folders.map((f) => ({ title: cleanTitle(f?.title), path: cleanFolder(f?.path) }));
            return change(() => write("folders", clean));
          },
          // D-day 켜고 끄기 (달력의 일정·할 일에서). 같은 ref 가 있으면 끔
          toggleDday({ ref, title, date } = {}) {
            if (typeof ref !== "string" || !DDAY_REF.test(ref)) throw new UserError2("D-day \uB85C \uC4F8 \uC218 \uC5C6\uB294 \uD56D\uBAA9\uC774\uC5D0\uC694.");
            const list = read("ddays", []);
            if (list.some((d) => d.ref === ref)) return change(() => write("ddays", list.filter((d) => d.ref !== ref)));
            if (list.length >= MAX_DDAYS) throw new UserError2(`D-day \uB294 ${MAX_DDAYS}\uAC1C\uAE4C\uC9C0\uC608\uC694.`);
            if (!validDate(date)) throw new UserError2("\uB0A0\uC9DC\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            const t = String(title ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 30) || "D-day";
            return change(() => write("ddays", [...list, { ref, title: t, date }]));
          },
          // 달력에서 다시 물어본 결과로 맞춘다. updates: Map(ref → {title, date} | null(뺌)).
          // 묻는 사이 사용자가 켜거나 끈 것은 지금 목록 그대로 둔다 (지금 목록에 있는 ref 만 고치거나 뺌)
          applyDdayUpdates(updates) {
            const now = read("ddays", []);
            const next = [];
            for (const d of now) {
              if (!updates.has(d.ref)) {
                next.push(d);
                continue;
              }
              const u = updates.get(d.ref);
              if (u) next.push({ ...d, title: u.title, date: u.date });
            }
            if (JSON.stringify(next) === JSON.stringify(now)) return null;
            return change(() => write("ddays", next));
          },
          setSearch(s) {
            if (!SEARCH.includes(s)) throw new UserError2("\uAC80\uC0C9 \uC0AC\uC774\uD2B8\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            return change(() => write("search", s));
          },
          // 날씨·급식 모듈이 쓰는 지금 학교
          where() {
            const s = read("school", null);
            if (s) return { office: s.office, school: s.code, lat: s.lat, lon: s.lon };
            const o = officeNow();
            return o ? { office: o, school: "", lat: String(OFFICE_AT[o][0]), lon: String(OFFICE_AT[o][1]) } : { office: "", school: "", lat: null, lon: null };
          }
        };
      }
      module.exports = { createSettings, cleanUrl, portalUrl, neisUrl, defaultLinks, OFFICES };
    }
  });

  // engine.js
  var require_engine = __commonJS({
    "engine.js"(exports, module) {
      var dbm = require_db();
      var { UserError: UserError2, NotFound, Conflict } = require_errors();
      var { createHub } = require_events();
      var { createTodos } = require_todos();
      var { createSchool } = require_school();
      var { neisSchedule } = require_neis_schedule();
      var { fetchTimetable } = require_neis_timetable();
      var { createToday, localDate: localDate2 } = require_today();
      var { createTimetable } = require_timetable();
      var { createTtNotes } = require_ttnotes();
      var { createStickies } = require_stickies();
      var { createGoogle, GoogleError: GoogleError2 } = require_google();
      var { createSettings, cleanUrl } = require_settings();
      var { DatabaseSync } = require_sqlite_shim();
      function parseId(v) {
        const id = Number(v);
        if (!Number.isInteger(id) || id <= 0) throw new UserError2("\uC798\uBABB\uB41C \uBC88\uD638\uC608\uC694.");
        return id;
      }
      function createEngine2(bytes, opts = {}) {
        const deps = opts.deps || {};
        const db = new DatabaseSync(bytes);
        const v = db.prepare("PRAGMA user_version").get().user_version;
        if (v > dbm.SCHEMA_VERSION) {
          db.close();
          throw new UserError2("\uB354 \uC0C8 \uD310\uC5D0\uC11C \uB9CC\uB4E0 \uC790\uB8CC\uC608\uC694. \uD654\uBA74\uC744 \uC0C8\uB85C\uACE0\uCE68\uD574\uC11C \uC0C8 \uD310\uC73C\uB85C \uC5F4\uC5B4 \uC8FC\uC138\uC694.");
        }
        dbm.migrate(db);
        const cfg = { edition: "teacher", heartbeatSeconds: 3600, drainSeconds: 15, weatherMinutes: 15, mealMinutes: 60, plannerEnabled: false, plannerCacheSeconds: 300 };
        const hub = createHub(db, { sessionAlive: () => true, tokenAlive: () => false }, cfg);
        const startedAt = Date.now();
        hub.register("server", () => ({ startedAt }), "read");
        const todos = createTodos(db, hub);
        const settings = createSettings(db, hub, deps.settings);
        const timetable = createTimetable(db, hub, { today: deps.todayDate });
        const ttnotes = createTtNotes(db, hub, { today: deps.todayDate, periods: () => timetable.current().bells.periods.length });
        const stickies = createStickies(db, hub);
        const google2 = createGoogle(cfg, hub, db, { ...deps.google, web: opts.googleWeb || offGoogle });
        hub.register("google", () => ({ changedAt: 0 }), "read");
        const neisGet = async (url) => {
          const res = await fetch(url, { signal: AbortSignal.timeout(1e4) });
          if (!res.ok) throw new Error(`\uB098\uC774\uC2A4 \uC751\uB2F5 ${res.status}`);
          try {
            return await res.json();
          } catch {
            throw new Error("\uB098\uC774\uC2A4\uAC00 \uC9C0\uAE08 \uC790\uB8CC\uB97C \uC8FC\uC9C0 \uC54A\uC544\uC694 (\uC810\uAC80 \uC911\uC77C \uC218 \uC788\uC5B4\uC694).");
          }
        };
        const schoolDeps = deps.school || (opts.neisKey ? neisSchedule({
          key: opts.neisKey,
          getSchool: () => settings.current().school,
          getJson: deps.neisGetJson || neisGet
        }) : void 0);
        const school = createSchool(cfg, schoolDeps);
        const today = createToday(cfg, { ...deps.today, where: () => settings.where() });
        const changed = opts.onChange || (() => {
        });
        let ddaySync = null;
        let ddaySyncedAt = 0;
        function syncDdays({ force = false } = {}) {
          if (ddaySync) return ddaySync;
          if (!force && Date.now() - ddaySyncedAt < 3 * 6e4) return Promise.resolve();
          const run = async () => {
            const list = settings.current().ddays;
            const now = localDate2();
            const updates = /* @__PURE__ */ new Map();
            const ask = async (d) => {
              try {
                let item;
                if (d.ref.startsWith("todo:")) {
                  const t = todos.get(Number(d.ref.slice(5)));
                  item = t && !t.done && t.due ? { title: String(t.title).slice(0, 30), date: t.due } : null;
                } else {
                  const rest = d.ref.slice("google:".length);
                  const i = rest.lastIndexOf(":");
                  const ev = await google2.eventById(rest.slice(0, i), rest.slice(i + 1));
                  item = ev ? { title: String(ev.title || d.title).slice(0, 30), date: ev.date } : null;
                }
                updates.set(d.ref, item && item.date >= now ? item : null);
              } catch {
              }
            };
            const limit = new Promise((r) => {
              setTimeout(r, 15e3);
            });
            await Promise.race([Promise.all(list.map(ask)), limit]);
            settings.applyDdayUpdates(updates);
            ddaySyncedAt = Date.now();
            changed();
          };
          ddaySync = run().catch(() => {
          }).finally(() => {
            ddaySync = null;
          });
          return ddaySync;
        }
        const routes = [];
        const on = (method, path, fn, opt = {}) => {
          const keys = [];
          const re = new RegExp(`^${path.replace(/:(\w+)/g, (_, k) => {
            keys.push(k);
            return "([^/]+)";
          })}$`);
          routes.push({ method, re, keys, fn, write: opt.write ?? method !== "GET" });
        };
        on("GET", "/api/health", () => ({ ok: true }));
        on("GET", "/api/me", () => ({ kind: "session" }));
        on("GET", "/api/today", async () => {
          syncDdays();
          const date = localDate2();
          const [t, s] = await Promise.all([today.get(date), school.today(date).catch((err) => ({ errors: [err.message] }))]);
          return { ...t, school: s, errors: [...t.errors, ...(s.errors || []).map((e) => `\uD559\uC0AC\uC77C\uC815: ${e}`)] };
        });
        on("GET", "/api/calendar", async (req) => {
          const r = await school.range(String(req.query.from || ""), String(req.query.to || ""));
          const g = req.query.google === "1" ? await google2.events(r.from, r.to) : { events: [], error: null, linked: null };
          r.events = [...r.events, ...g.events].sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || "") || a.title.localeCompare(b.title));
          if (g.error) r.errors = [...r.errors, `\uAD6C\uAE00: ${g.error}`];
          r.google = { linked: g.linked };
          return r;
        });
        on("POST", "/api/todos", (req) => [201, todos.add(req.body?.title, req.body?.due, "\uC774 PC")]);
        on("PATCH", "/api/todos/:id", (req) => {
          const id = parseId(req.params.id);
          const b = req.body || {};
          const editing = "title" in b || "due" in b;
          if (editing && "done" in b) throw new UserError2("\uC644\uB8CC \uCCB4\uD06C\uC640 \uB0B4\uC6A9 \uACE0\uCE58\uAE30\uB294 \uB530\uB85C \uBCF4\uB0B4 \uC8FC\uC138\uC694.");
          if (editing) return todos.edit(id, b, "\uC774 PC");
          if ("done" in b) return todos.setDone(id, b.done, "\uC774 PC");
          throw new UserError2("\uBC14\uAFC0 \uB0B4\uC6A9\uC774 \uC5C6\uC5B4\uC694.");
        });
        on("POST", "/api/todos/:id/move", (req) => {
          const before = req.body?.before === null || req.body?.before === void 0 ? null : parseId(req.body.before);
          return todos.move(parseId(req.params.id), before, "\uC774 PC");
        });
        on("DELETE", "/api/todos/:id", (req) => todos.remove(parseId(req.params.id), Number(req.query.rev)));
        on("POST", "/api/todos/clear-done", () => todos.clearDone());
        on("GET", "/api/google/status", () => google2.status());
        on("POST", "/api/google/open-login", async () => {
          if (!opts.googleWeb) throw new UserError2("\uC774 \uD310\uC5D0\uB294 \uAD6C\uAE00 \uC5F0\uACB0\uC774 \uC5C6\uC5B4\uC694.");
          await opts.googleWeb.login();
          google2.linkedChanged();
          return { ok: true };
        });
        on("POST", "/api/google/disconnect", () => google2.disconnect());
        on("PUT", "/api/google/settings", (req) => google2.saveSettings({ show: req.body?.show, write: req.body?.write ?? null }));
        on("POST", "/api/google/events", (req) => google2.create(req.body || {}));
        on("PUT", "/api/google/events", (req) => google2.update(req.body?.calendarId, req.body?.eventId, req.body || {}, req.body?.etag));
        on("DELETE", "/api/google/events", (req) => google2.remove(req.body?.calendarId, req.body?.eventId, req.body?.etag));
        on("GET", "/api/schools", async (req) => ({ schools: await settings.searchSchools(String(req.query.q || ""), settings.current().office) }));
        on("PUT", "/api/settings/school", (req) => settings.setSchool(req.body?.school));
        on("PUT", "/api/settings/office", (req) => settings.setOffice(req.body?.office));
        on("PUT", "/api/settings/portal", (req) => settings.setPortal({ url: req.body?.url ?? "", auto: false }));
        on("PUT", "/api/settings/links", (req) => settings.setLinks(req.body?.links));
        on("PUT", "/api/settings/folders", (req) => settings.setFolders(req.body?.folders));
        on("PUT", "/api/settings/search", (req) => settings.setSearch(req.body?.search));
        on("PUT", "/api/settings/dday", (req) => settings.toggleDday(req.body || {}));
        on("GET", "/api/settings", () => settings.current());
        on("POST", "/api/settings/dday/sync", async () => {
          await syncDdays({ force: true });
          return settings.current();
        });
        on("POST", "/api/open", (req) => {
          const url = cleanUrl(req.body?.url);
          if (!opts.openUrl) throw new UserError2("\uC5EC\uAE30\uC11C\uB294 \uC5F4 \uC218 \uC5C6\uC5B4\uC694.");
          opts.openUrl(url);
          return { ok: true };
        }, { write: false });
        on("POST", "/api/stickies", (req) => [201, stickies.add(req.body?.body ?? "", req.body?.color ?? "y")]);
        on("PATCH", "/api/stickies/:id", (req) => {
          const b = req.body || {};
          return stickies.edit(parseId(req.params.id), { body: b.body, color: b.color, tab: b.tab, seq: b.seq });
        });
        on("DELETE", "/api/stickies/:id", (req) => stickies.remove(parseId(req.params.id)));
        on("PUT", "/api/timetable/base", (req) => {
          const b = req.body || {};
          if (!("lesson" in b)) throw new UserError2("\uC218\uC5C5 \uB0B4\uC6A9(lesson)\uC774 \uC5C6\uC5B4\uC694.");
          return timetable.setBase(b.weekday, b.period, b.lesson);
        });
        on("PUT", "/api/timetable/base-many", (req) => timetable.setBaseMany(req.body?.cells));
        on("PUT", "/api/timetable/color", (req) => {
          const b = req.body || {};
          if (!("color" in b)) throw new UserError2("\uC0C9\uC774 \uC5C6\uC5B4\uC694.");
          return timetable.setColor(b.lesson, b.color);
        });
        on("PUT", "/api/timetable/day", (req) => {
          const b = req.body || {};
          return timetable.setDay(b.date, b.period, b.kind, b.lesson);
        });
        on("GET", "/api/timetable/notes", (req) => ttnotes.range(String(req.query.from || ""), String(req.query.to || "")));
        on("PUT", "/api/timetable/note", (req) => {
          const b = req.body || {};
          return ttnotes.save({ date: b.date, period: b.period, body: b.body, rev: b.rev, subject: b.subject, klass: b.klass });
        });
        {
          on("GET", "/api/neis/timetable", async (req) => {
            if (!opts.neisKey) throw new UserError2("\uC774 \uD310\uC5D0\uB294 \uB098\uC774\uC2A4 \uC5F0\uACB0\uC774 \uC5C6\uC5B4\uC694. [\uD45C \uBD99\uC5EC\uB123\uAE30]\uB098 \uD3B8\uC9D1\uC73C\uB85C \uB123\uC5B4 \uC8FC\uC138\uC694.");
            const from = String(req.query.from || "");
            const to = String(req.query.to || "");
            const ok = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`));
            if (!ok(from) || !ok(to) || from > to || (Date.parse(to) - Date.parse(from)) / 864e5 > 14) throw new UserError2("\uAE30\uAC04\uC774 \uB9DE\uC9C0 \uC54A\uC544\uC694.");
            const school2 = settings.current().school;
            if (!school2) throw new UserError2("\uBA3C\uC800 [\uC124\uC815]\uC5D0\uC11C \uD559\uAD50\uB97C \uACE8\uB77C \uC8FC\uC138\uC694.");
            try {
              return await fetchTimetable({ key: opts.neisKey, school: school2, from, to, getJson: deps.neisGetJson || neisGet });
            } catch (err) {
              throw new UserError2(err.message || "\uB098\uC774\uC2A4 \uC2DC\uAC04\uD45C\uB97C \uC77D\uC9C0 \uBABB\uD588\uC5B4\uC694.");
            }
          });
        }
        on("PUT", "/api/timetable/bells", (req) => timetable.setBells(req.body?.bells, req.body?.expectPeriods));
        async function handle(method, url, body) {
          let match = null;
          let query;
          try {
            const u = new URL(url, "http://local");
            const at = u.pathname.indexOf("/api/");
            const path = at >= 0 ? u.pathname.slice(at) : u.pathname;
            query = Object.fromEntries(u.searchParams);
            for (const r of routes) {
              if (r.method !== method) continue;
              const m = r.re.exec(path);
              if (m) {
                match = { r, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
                break;
              }
            }
          } catch {
            return { status: 400, data: { error: "\uC798\uBABB\uB41C \uC8FC\uC18C\uC608\uC694." } };
          }
          if (!match) return { status: 404, data: { error: "\uC5C6\uB294 \uC8FC\uC18C\uC608\uC694." } };
          try {
            const out = await match.r.fn({ params: match.params, query, body });
            if (match.r.write) changed();
            return Array.isArray(out) ? { status: out[0], data: out[1] } : { status: 200, data: out ?? {} };
          } catch (err) {
            if (match.r.write) changed();
            if (err instanceof UserError2) return { status: 400, data: { error: err.message } };
            if (err instanceof NotFound) return { status: 404, data: { error: err.message } };
            if (err instanceof Conflict) return { status: 409, data: { error: err.message, current: err.current } };
            if (err instanceof GoogleError2) return { status: err.status, data: { error: err.message } };
            console.error("[dashboard]", err);
            return { status: 500, data: { error: "\uCC98\uB9AC\uD558\uB2E4\uAC00 \uBB38\uC81C\uAC00 \uC0DD\uACBC\uC5B4\uC694." } };
          }
        }
        function attach(onEvent) {
          let closeFn = null;
          const res = {
            writableLength: 0,
            writeHead() {
            },
            write(chunk) {
              const ev = { type: "message", data: "" };
              const data = [];
              for (const line of String(chunk).split("\n")) {
                if (line.startsWith("event: ")) ev.type = line.slice(7);
                else if (line.startsWith("data: ")) data.push(line.slice(6));
              }
              if (data.length) {
                ev.data = data.join("\n");
                onEvent(ev);
              }
              return true;
            },
            end() {
            },
            on(name, fn) {
              if (name === "close") closeFn = fn;
            },
            once() {
            }
          };
          hub.attach({}, res, { kind: "session", sessionId: "local" });
          return () => closeFn?.();
        }
        return { handle, attach, db, hub, google: google2, settings, exportBytes: () => db.export(), close: () => {
          hub.close();
          db.close();
        } };
      }
      function checkBackup2(bytes) {
        let e = null;
        try {
          const raw = new DatabaseSync(bytes);
          let v;
          let got;
          try {
            v = raw.prepare("PRAGMA user_version").get().user_version;
            got = schemaOf(raw);
          } finally {
            raw.close();
          }
          if (v > dbm.SCHEMA_VERSION) throw new UserError2("\uB354 \uC0C8 \uD310\uC5D0\uC11C \uB9CC\uB4E0 \uC790\uB8CC\uC608\uC694. \uD654\uBA74\uC744 \uC0C8\uB85C\uACE0\uCE68\uD574\uC11C \uC0C8 \uD310\uC73C\uB85C \uC5F4\uC5B4 \uC8FC\uC138\uC694.");
          if (v < 1) throw new Error("\uD310 \uC5C6\uC74C");
          const ref = new DatabaseSync();
          for (let i = 0; i < v; i += 1) ref.exec(dbm.MIGRATIONS[i]);
          const want = schemaOf(ref);
          ref.close();
          if (got !== want) throw new Error("\uD45C \uAD6C\uC870\uAC00 \uB2E4\uB984");
          e = createEngine2(bytes, { deps: { today: { getJson: async () => null }, settings: { getJson: async () => null } } });
          const ok = e.db.prepare("PRAGMA integrity_check").get();
          if (Object.values(ok || {})[0] !== "ok") throw new Error("\uD30C\uC77C\uC774 \uAE68\uC838 \uC788\uC5B4\uC694.");
          e.hub.snapshot({ kind: "session" });
        } catch (err) {
          throw new UserError2(err instanceof UserError2 ? err.message : "\uD559\uAD50 \uB300\uC2DC\uBCF4\uB4DC \uBC31\uC5C5 \uD30C\uC77C\uC774 \uC544\uB2C8\uAC70\uB098 \uAE68\uC838 \uC788\uC5B4\uC694.");
        } finally {
          try {
            e?.close();
          } catch {
          }
        }
      }
      function schemaOf(d) {
        return JSON.stringify(d.prepare("SELECT type, name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name").all());
      }
      var offGoogle = {
        configured: () => false,
        expired: () => false,
        linked: () => false,
        email: () => null,
        accessToken: async () => {
          throw new GoogleError2("\uAD6C\uAE00 \uCE98\uB9B0\uB354\uC640 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC5B4\uC694.", 409);
        },
        invalidate() {
        },
        revoke: async () => {
        }
      };
      module.exports = { createEngine: createEngine2, checkBackup: checkBackup2 };
    }
  });

  // node_modules/sql.js/package.json
  var require_package = __commonJS({
    "node_modules/sql.js/package.json"(exports, module) {
      module.exports = {
        name: "sql.js",
        version: "1.13.0",
        description: "SQLite library with support for opening and writing databases, prepared statements, and more. This SQLite library is in pure javascript (compiled with emscripten).",
        keywords: [
          "sql",
          "sqlite",
          "stand-alone",
          "relational",
          "database",
          "RDBMS",
          "data",
          "query",
          "statement",
          "emscripten",
          "asm",
          "asm.js"
        ],
        license: "MIT",
        main: "./dist/sql-wasm.js",
        scripts: {
          build: "make",
          rebuild: "npm run clean && npm run build",
          clean: "make clean",
          test: "npm run lint && npm run test-asm && npm run test-asm-debug && npm run test-wasm && npm run test-wasm-debug && npm run test-asm-memory-growth",
          lint: "eslint .",
          prettify: "eslint . --fix",
          "test-asm": "node --unhandled-rejections=strict test/all.js asm",
          "test-asm-debug": "node --unhandled-rejections=strict test/all.js asm-debug",
          "test-asm-memory-growth": "node --unhandled-rejections=strict test/all.js asm-memory-growth",
          "test-wasm": "node --unhandled-rejections=strict test/all.js wasm",
          "test-wasm-debug": "node --unhandled-rejections=strict test/all.js wasm-debug",
          doc: "jsdoc -c .jsdoc.config.json"
        },
        homepage: "http://github.com/sql-js/sql.js",
        repository: {
          type: "git",
          url: "http://github.com/sql-js/sql.js.git"
        },
        bugs: {
          url: "https://github.com/sql-js/sql.js/issues"
        },
        devDependencies: {
          "clean-jsdoc-theme": "^4.2.0",
          eslint: "^8.54.0",
          "eslint-config-airbnb-base": "^15.0.0",
          "eslint-plugin-import": "^2.26.0",
          jsdoc: "^4.0.2",
          test: "=0.6.0"
        }
      };
    }
  });

  // boot.js
  var initSqlJs = require_sql_wasm();
  var { useSqlJs } = require_sqlite_shim();
  var { createEngine, checkBackup } = require_engine();
  var { GoogleError, SCOPES } = require_google();
  var { UserError } = require_errors();
  var { localDate } = require_today();
  var SQLJS_VERSION = require_package().version;
  var GOOGLE_CLIENT_ID = true ? "768383967666-motbdbd8334fvj06pe02cjn79aqjm4an.apps.googleusercontent.com" : "";
  var GOOGLE_API_KEY = true ? "AIzaSyCN1KSMKUwi5fEQ5UtZpFBmCPJwBzblSQA" : "";
  var NEIS_KEY = true ? "0240d4554c154347bafb6c95c26e202d" : "";
  var nativeFetch = window.fetch.bind(window);
  var kv = /* @__PURE__ */ (() => {
    let dbp = null;
    const open = () => dbp ||= new Promise((resolve, reject) => {
      const r = indexedDB.open("school-dashboard", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("kv");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const run = async (mode, fn) => {
      const db = await open();
      return new Promise((resolve, reject) => {
        const t = db.transaction("kv", mode);
        const req = fn(t.objectStore("kv"));
        t.oncomplete = () => resolve(req.result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error || new Error("\uC800\uC7A5\uC774 \uCDE8\uC18C\uB410\uC5B4\uC694."));
      });
    };
    return {
      get: (k) => run("readonly", (s) => s.get(k)),
      set: (k, v) => run("readwrite", (s) => s.put(v, k)),
      del: (k) => run("readwrite", (s) => s.delete(k)),
      keys: () => run("readonly", (s) => s.getAllKeys())
    };
  })();
  function createGoogleWeb(clientId, onExpired) {
    let st = { linked: false, email: null };
    let token = null;
    let gen = 0;
    let told = false;
    const save = () => kv.set("google", st).catch(() => {
    });
    const TOKEN_KEY = "dash-google-token";
    const keep = (t) => {
      try {
        if (t) sessionStorage.setItem(TOKEN_KEY, JSON.stringify(t));
        else sessionStorage.removeItem(TOKEN_KEY);
      } catch {
      }
    };
    const loaded = kv.get("google").then((v) => {
      if (v?.linked) st = { linked: true, email: v.email || null };
      if (v && "token" in v) save();
      if (st.linked) {
        try {
          const t = JSON.parse(sessionStorage.getItem(TOKEN_KEY));
          if (t && typeof t.value === "string" && Number.isFinite(t.exp) && t.exp - 6e4 > Date.now() && (t.email || null) === st.email) token = { value: t.value, exp: t.exp };
          else keep(null);
        } catch {
          keep(null);
        }
      } else keep(null);
    }, () => {
    });
    const valid = () => Boolean(token && token.exp - 6e4 > Date.now());
    const oauthApi = () => window.google?.accounts?.oauth2;
    const revokeAt = (t) => new Promise((resolve) => {
      const oauth = oauthApi();
      if (!oauth) return resolve(false);
      oauth.revoke(t, (r) => resolve(r?.successful !== false));
    });
    return {
      loaded,
      configured: () => Boolean(clientId),
      linked: () => st.linked,
      expired: () => st.linked && !valid(),
      email: () => st.email,
      async accessToken() {
        if (valid()) return token.value;
        if (!told) {
          told = true;
          setTimeout(onExpired, 0);
        }
        const e = new GoogleError("\uAD6C\uAE00 \uB85C\uADF8\uC778 \uC2DC\uAC04\uC774 \uB05D\uB0AC\uC5B4\uC694 (1\uC2DC\uAC04\uB9C8\uB2E4). \uB2EC\uB825 \uC704 [\uAD6C\uAE00 \uB2E4\uC2DC \uC5F0\uACB0]\uC744 \uB20C\uB7EC \uC8FC\uC138\uC694.", 409);
        e.relogin = true;
        throw e;
      },
      invalidate() {
        token = null;
        keep(null);
      },
      async revoke() {
        gen += 1;
        window.DashDrive?.forget();
        const t = valid() ? token.value : null;
        token = null;
        keep(null);
        st = { linked: false, email: null };
        await save();
        if (!t || !await revokeAt(t)) throw new Error("\uAD6C\uAE00 \uCABD \uCDE8\uC18C \uBABB \uD568");
      },
      login() {
        const g = gen;
        return new Promise((resolve, reject) => {
          const oauth = oauthApi();
          if (!oauth) return reject(new UserError("\uAD6C\uAE00 \uB85C\uADF8\uC778 \uB3C4\uAD6C\uB97C \uC544\uC9C1 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC778\uD130\uB137 \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uACE0 \uC7A0\uC2DC \uB4A4 \uB2E4\uC2DC \uB20C\uB7EC \uC8FC\uC138\uC694."));
          let done = false;
          const finish = (fn, v) => {
            if (!done) {
              done = true;
              clearTimeout(timer);
              fn(v);
            }
          };
          const timer = setTimeout(() => finish(reject, new UserError("\uAD6C\uAE00 \uB85C\uADF8\uC778 \uB2F5\uC744 \uBC1B\uC9C0 \uBABB\uD588\uC5B4\uC694. \uB2E4\uC2DC \uB20C\uB7EC \uC8FC\uC138\uC694.")), 12e4);
          const client = oauth.initTokenClient({
            client_id: clientId,
            scope: SCOPES.join(" "),
            include_granted_scopes: false,
            // 드라이브 권한을 캘린더 열쇠에 섞지 않음
            prompt: st.linked ? "" : "consent",
            // 한 번 허용했으면 다음부터는 창이 잠깐 떴다 닫힌다
            login_hint: st.email || void 0,
            callback: async (r) => {
              if (done) {
                if (r.access_token) revokeAt(r.access_token);
                return;
              }
              if (r.error) return finish(reject, new UserError(r.error === "access_denied" ? "\uAD6C\uAE00\uC5D0\uC11C \uD5C8\uC6A9\uD558\uC9C0 \uC54A\uC558\uC5B4\uC694. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694." : `\uAD6C\uAE00 \uC624\uB958: ${r.error}`));
              if (!oauth.hasGrantedAllScopes(r, ...SCOPES)) {
                revokeAt(r.access_token);
                return finish(reject, new UserError("\uAD8C\uD55C \uB450 \uAC00\uC9C0(\uC77C\uC815 \uBCF4\uAE30\xB7\uC218\uC815, \uB2EC\uB825 \uBAA9\uB85D \uBCF4\uAE30)\uB97C \uBAA8\uB450 \uCCB4\uD06C\uD574\uC11C \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694."));
              }
              let email = st.email;
              try {
                const res = await nativeFetch("https://www.googleapis.com/calendar/v3/users/me/calendarList/primary", { headers: { Authorization: `Bearer ${r.access_token}` } });
                if (res.ok) email = (await res.json()).id || email;
              } catch {
              }
              if (done) {
                revokeAt(r.access_token);
                return;
              }
              if (g !== gen) {
                revokeAt(r.access_token);
                return finish(reject, new UserError("\uADF8 \uC0AC\uC774 \uC5F0\uACB0\uC744 \uB04A\uC5C8\uC5B4\uC694. \uB2E4\uC2DC \uC5F0\uACB0\uD558\uB824\uBA74 \uB2E4\uC2DC \uB20C\uB7EC \uC8FC\uC138\uC694."));
              }
              token = { value: r.access_token, exp: Date.now() + (Number(r.expires_in) || 3600) * 1e3 };
              keep({ ...token, email });
              st = { linked: true, email };
              told = false;
              await save();
              finish(resolve);
            },
            error_callback: (e) => finish(reject, new UserError(
              e?.type === "popup_closed" ? "\uB85C\uADF8\uC778 \uCC3D\uC744 \uB2EB\uC558\uC5B4\uC694. \uB2E4\uC2DC \uB20C\uB7EC \uC8FC\uC138\uC694." : e?.type === "popup_failed_to_open" ? "\uD31D\uC5C5\uC774 \uB9C9\uD614\uC5B4\uC694. \uC8FC\uC18C\uCC3D \uC624\uB978\uCABD\uC758 \uD31D\uC5C5 \uCC28\uB2E8 \uD45C\uC2DC\uB97C \uB20C\uB7EC \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694." : "\uAD6C\uAE00 \uB85C\uADF8\uC778\uC744 \uD558\uC9C0 \uBABB\uD588\uC5B4\uC694."
            ))
          });
          client.requestAccessToken();
        });
      }
    };
  }
  var engine = null;
  var dirty = false;
  var saving = null;
  var restoring = false;
  var lastInput = 0;
  function warnSave(text) {
    let el = document.getElementById("w-save-warn");
    if (!el && text && document.body) {
      el = document.createElement("div");
      el.id = "w-save-warn";
      el.setAttribute("role", "alert");
      el.style.cssText = "position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9999;background:#d1242f;color:#fff;padding:8px 14px;border-radius:8px;font-size:14px";
      document.body.append(el);
    }
    if (!el) return;
    el.hidden = !text;
    el.textContent = text || "";
  }
  function persist() {
    dirty = true;
    if (!saving) {
      saving = (async () => {
        while (dirty && engine && !restoring) {
          dirty = false;
          try {
            await kv.set("db", engine.exportBytes());
            warnSave("");
          } catch (err) {
            dirty = true;
            warnSave("\uC800\uC7A5\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694 \xB7 \uBE0C\uB77C\uC6B0\uC800 \uC800\uC7A5 \uACF5\uAC04\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694 (\uC774 \uCC3D\uC744 \uB2EB\uC9C0 \uB9C8\uC138\uC694)");
            throw err;
          }
        }
      })().finally(() => {
        saving = null;
      });
    }
    return saving;
  }
  var onChange = () => {
    persist().catch(() => {
    });
  };
  document.addEventListener("input", () => {
    lastInput = Date.now();
  }, true);
  window.addEventListener("beforeunload", (e) => {
    if (restoring) return;
    if (dirty || saving || Date.now() - lastInput < 2e3) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  async function holdLock() {
    if (!navigator.locks) return true;
    for (let i = 0; i < 10; i += 1) {
      const got = await new Promise((resolve) => {
        navigator.locks.request("school-dashboard-db", { ifAvailable: true }, (lock) => {
          resolve(Boolean(lock));
          return lock ? new Promise(() => {
          }) : void 0;
        });
      });
      if (got) return true;
      await new Promise((r) => setTimeout(r, 250));
    }
    return false;
  }
  function stopScreen(text, action) {
    const show = () => {
      for (const el of document.body.children) el.style.display = "none";
      const p = document.createElement("p");
      p.className = "quit-msg";
      p.textContent = text;
      document.body.append(p);
      if (action) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = action.label;
        b.addEventListener("click", action.run);
        p.append(document.createElement("br"), b);
      }
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show);
    else show();
  }
  function createDriveWeb() {
    const SCOPE = "https://www.googleapis.com/auth/drive.file";
    const APP_ID = GOOGLE_CLIENT_ID.split("-")[0];
    let token = null;
    const valid = () => Boolean(token && token.exp - 6e4 > Date.now());
    const drop = (value) => {
      if (!value || token?.value === value) token = null;
    };
    let asking = null;
    function getToken() {
      if (valid()) return Promise.resolve(token.value);
      if (asking) return asking;
      let timer;
      asking = new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error("\uAD6C\uAE00 \uB85C\uADF8\uC778 \uB2F5\uC744 \uBC1B\uC9C0 \uBABB\uD588\uC5B4\uC694. \uB2E4\uC2DC \uB20C\uB7EC \uC8FC\uC138\uC694.")), 12e4);
        const oauth = window.google?.accounts?.oauth2;
        if (!oauth) return reject(new Error("\uAD6C\uAE00 \uB85C\uADF8\uC778 \uB3C4\uAD6C\uB97C \uC544\uC9C1 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC7A0\uC2DC \uB4A4 \uB2E4\uC2DC \uB20C\uB7EC \uC8FC\uC138\uC694."));
        let hint;
        try {
          hint = google?.email() || void 0;
        } catch {
        }
        const client = oauth.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPE,
          include_granted_scopes: false,
          // 캘린더 권한을 이 열쇠에 섞지 않음
          login_hint: hint,
          callback: (r) => {
            if (r.error) return reject(new Error(r.error === "access_denied" ? "\uAD6C\uAE00\uC5D0\uC11C \uD5C8\uC6A9\uD558\uC9C0 \uC54A\uC558\uC5B4\uC694." : `\uAD6C\uAE00 \uC624\uB958: ${r.error}`));
            if (!oauth.hasGrantedAllScopes(r, SCOPE)) return reject(new Error('"\uACE0\uB978 \uD30C\uC77C \uBCF4\uAE30" \uAD8C\uD55C\uC744 \uCCB4\uD06C\uD574\uC11C \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694.'));
            token = { value: r.access_token, exp: Date.now() + (Number(r.expires_in) || 3600) * 1e3 };
            resolve(token.value);
          },
          error_callback: (e) => reject(new Error(e?.type === "popup_closed" ? "\uAD6C\uAE00 \uB85C\uADF8\uC778 \uCC3D\uC744 \uB2EB\uC558\uC5B4\uC694." : e?.type === "popup_failed_to_open" ? "\uD31D\uC5C5\uC774 \uB9C9\uD614\uC5B4\uC694. \uC8FC\uC18C\uCC3D \uC624\uB978\uCABD\uC5D0\uC11C \uD31D\uC5C5\uC744 \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694." : "\uAD6C\uAE00 \uB85C\uADF8\uC778\uC744 \uB9C8\uCE58\uC9C0 \uBABB\uD588\uC5B4\uC694."))
        });
        client.requestAccessToken();
      }).finally(() => {
        clearTimeout(timer);
        asking = null;
      });
      return asking;
    }
    let pickerLoad = null;
    function loadPicker() {
      if (window.google?.picker) return Promise.resolve();
      pickerLoad ||= new Promise((resolve, reject) => {
        const fail = () => {
          pickerLoad = null;
          reject(new Error("\uAD6C\uAE00 \uD30C\uC77C \uACE0\uB974\uAE30 \uCC3D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC778\uD130\uB137 \uC5F0\uACB0\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694."));
        };
        const go = () => window.gapi.load("picker", { callback: resolve, onerror: fail, timeout: 15e3, ontimeout: fail });
        if (window.gapi) return go();
        const sc = document.createElement("script");
        sc.src = "https://apis.google.com/js/api.js";
        sc.onload = go;
        sc.onerror = fail;
        document.head.append(sc);
      });
      return pickerLoad;
    }
    async function pick() {
      const t = await getToken();
      await loadPicker();
      const P = window.google.picker;
      return new Promise((resolve) => {
        const mine = new P.DocsView(P.ViewId.DOCS).setIncludeFolders(true).setParent("root").setMode(P.DocsViewMode.LIST).setLabel("\uB0B4 \uB4DC\uB77C\uC774\uBE0C");
        const drives = new P.DocsView(P.ViewId.DOCS).setEnableDrives(true).setIncludeFolders(true).setMode(P.DocsViewMode.LIST).setLabel("\uACF5\uC720 \uB4DC\uB77C\uC774\uBE0C");
        const shared = new P.DocsView(P.ViewId.DOCS).setOwnedByMe(false).setIncludeFolders(true).setMode(P.DocsViewMode.LIST).setLabel("\uACF5\uC720 \uBB38\uC11C\uD568");
        new P.PickerBuilder().addView(mine).addView(shared).addView(drives).setOAuthToken(t).setDeveloperKey(GOOGLE_API_KEY).setAppId(APP_ID).setLocale("ko").setOrigin(location.origin).enableFeature(P.Feature.MULTISELECT_ENABLED).enableFeature(P.Feature.SUPPORT_DRIVES).setTitle("\uB300\uC2DC\uBCF4\uB4DC\uB85C \uAC00\uC838\uC62C \uD30C\uC77C \uACE0\uB974\uAE30").setCallback((d) => {
          if (d[P.Response.ACTION] === P.Action.PICKED) {
            resolve((d[P.Response.DOCUMENTS] || []).map((x) => ({
              id: String(x[P.Document.ID]),
              name: String(x[P.Document.NAME] || "\uC774\uB984 \uC5C6\uC74C"),
              mimeType: String(x[P.Document.MIME_TYPE] || ""),
              url: String(x[P.Document.URL] || ""),
              iconUrl: String(x[P.Document.ICON_URL] || "")
            })));
          } else if (d[P.Response.ACTION] === P.Action.CANCEL) resolve([]);
          else if (d[P.Response.ACTION] === "error") {
            drop(t);
            resolve([]);
          } else if (d[P.Response.ACTION] !== P.Action.LOADED) resolve([]);
        }).build().setVisible(true);
      });
    }
    const EXPORT = {
      "application/vnd.google-apps.document": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
      "application/vnd.google-apps.spreadsheet": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".xlsx"],
      "application/vnd.google-apps.presentation": ["application/vnd.openxmlformats-officedocument.presentationml.presentation", ".pptx"],
      "application/vnd.google-apps.drawing": ["application/pdf", ".pdf"]
    };
    const canDownload = (mime) => !mime.startsWith("application/vnd.google-apps.") || Boolean(EXPORT[mime]);
    async function download(file) {
      const ex = EXPORT[file.mimeType];
      if (!canDownload(file.mimeType)) throw new Error("\uC774 \uC885\uB958(\uD3F4\uB354\xB7\uC124\uBB38 \uB4F1)\uB294 \uBC1B\uC744 \uC218 \uC5C6\uC5B4\uC694. [\uC5F4\uAE30]\uB85C \uC5EC\uC138\uC694.");
      const id = encodeURIComponent(file.id);
      const url = ex ? `https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=${encodeURIComponent(ex[0])}` : `https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`;
      const t = await getToken();
      const res = await nativeFetch(url, { headers: { Authorization: `Bearer ${t}` } });
      if (res.status === 401) {
        drop(t);
        throw new Error("\uAD6C\uAE00 \uB85C\uADF8\uC778 \uC2DC\uAC04\uC774 \uB05D\uB0AC\uC5B4\uC694. [\uBC1B\uAE30]\uB97C \uD55C \uBC88 \uB354 \uB20C\uB7EC \uC8FC\uC138\uC694.");
      }
      if (Number(res.headers.get("content-length")) > 500 * 1024 * 1024) throw new Error("\uD30C\uC77C\uC774 \uB108\uBB34 \uCEE4\uC694 (500MB \uB118\uC74C). \uC774\uB984\uC744 \uB20C\uB7EC \uB4DC\uB77C\uC774\uBE0C\uC5D0\uC11C \uBC1B\uC544 \uC8FC\uC138\uC694.");
      if (res.status === 403 || res.status === 404) throw new Error("\uC774 \uD30C\uC77C\uC5D0 \uC811\uADFC\uD560 \uC218 \uC5C6\uC5B4\uC694. [\uD30C\uC77C \uACE0\uB974\uAE30]\uC5D0\uC11C \uB2E4\uC2DC \uACE8\uB77C \uC8FC\uC138\uC694. (\uAD6C\uAE00 \uBB38\uC11C\uB294 10MB \uB118\uC73C\uBA74 \uBC14\uAFD4 \uBC1B\uC744 \uC218 \uC5C6\uC5B4\uC694)");
      if (!res.ok) throw new Error(`\uBC1B\uC9C0 \uBABB\uD588\uC5B4\uC694. (${res.status})`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      let nm = String(file.name || "drive-file").normalize("NFC").trim().replace(/[<>:"/\\|?*~\u0000-\u001f\u007f\p{Cf}]/gu, "_");
      if (ex && !nm.toLowerCase().endsWith(ex[1])) nm += ex[1];
      const dot = nm.lastIndexOf(".");
      const ext = dot > 0 && nm.length - dot <= 6 ? nm.slice(dot) : "";
      const tidy = (x) => x.replace(/^[.\s]+/, "").replace(/[.\s]+$/, "");
      let stem = tidy(Array.from(tidy(ext ? nm.slice(0, dot) : nm)).slice(0, 120).join("")) || "drive-file";
      if (/^(con|prn|aux|nul|com\d|lpt\d)$/i.test(stem)) stem = `_${stem}`;
      a.download = stem + ext;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 6e4);
      return a.download;
    }
    return { configured: () => Boolean(GOOGLE_CLIENT_ID && GOOGLE_API_KEY), pick, download, canDownload, forget() {
      token = null;
    } };
  }
  window.DashDrive = createDriveWeb();
  var google = null;
  var SQLmod = null;
  var ready = (async () => {
    if (!await holdLock()) {
      stopScreen("\uD559\uAD50 \uB300\uC2DC\uBCF4\uB4DC\uAC00 \uC774\uBBF8 \uB2E4\uB978 \uCC3D(\uD0ED)\uC5D0\uC11C \uC5F4\uB824 \uC788\uC5B4\uC694. \uADF8 \uCC3D\uC744 \uC368 \uC8FC\uC138\uC694. (\uC774 \uD0ED\uC740 \uB2EB\uC544\uB3C4 \uB3FC\uC694)");
      throw new Error("\uB2E4\uB978 \uCC3D\uC5D0\uC11C \uC5F4\uB824 \uC788\uC5B4\uC694.");
    }
    let bytes;
    try {
      [SQLmod, bytes] = await Promise.all([
        initSqlJs({ locateFile: (f) => new URL(`${f}?v=${SQLJS_VERSION}`, document.baseURI).href }),
        kv.get("db")
      ]);
    } catch (err) {
      stopScreen("\uC800\uC7A5\uB41C \uC790\uB8CC\uB97C \uC77D\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC790\uB8CC\uB294 \uC9C0\uC6B0\uC9C0 \uC54A\uC558\uC5B4\uC694. \uCC3D\uC744 \uBAA8\uB450 \uB2EB\uC558\uB2E4\uAC00 \uB2E4\uC2DC \uC5F4\uC5B4 \uC8FC\uC138\uC694.");
      throw new Error(`\uC77D\uAE30 \uC2E4\uD328: ${err?.message || err}`);
    }
    useSqlJs(SQLmod);
    google = GOOGLE_CLIENT_ID ? createGoogleWeb(GOOGLE_CLIENT_ID, () => engine?.google.linkedChanged()) : null;
    await google?.loaded;
    try {
      engine = createEngine(bytes || null, {
        googleWeb: google,
        openUrl: (url) => window.open(url, "_blank", "noopener,noreferrer"),
        neisKey: NEIS_KEY,
        onChange
      });
    } catch (err) {
      const prev = await kv.get("db-before-restore").catch(() => null);
      stopScreen(`\uC800\uC7A5\uB41C \uC790\uB8CC\uB97C \uC5F4\uC9C0 \uBABB\uD588\uC5B4\uC694: ${err.message}`, prev ? {
        label: "\uBC31\uC5C5 \uBD88\uB7EC\uC624\uAE30 \uC804 \uC790\uB8CC\uB85C \uB418\uB3CC\uB9AC\uAE30",
        run: async () => {
          await kv.set("db", prev);
          location.reload();
        }
      } : null);
      throw new Error("\uC5F4\uAE30 \uC2E4\uD328");
    }
    if (bytes === void 0) persist().catch(() => {
    });
    engine.hub.register("clip", clipState, "read");
    clipStore.queue = loadClip().then(() => engine.hub.live("clip", clipState()));
    navigator.storage?.persist?.().catch(() => {
    });
    return engine;
  })();
  ready.catch((err) => {
    if (/다른 창|읽기 실패|열기 실패/.test(String(err?.message))) return;
    stopScreen(`\uC2DC\uC791\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694: ${err?.message || err}. \uD06C\uB86C\uC774\uB098 \uC5E3\uC9C0 \uCD5C\uC2E0 \uD310\uC5D0\uC11C \uC5F4\uC5B4 \uC8FC\uC138\uC694.`);
  });
  var CLIP = { maxFile: 50 * 1024 * 1024, maxTotal: 500 * 1024 * 1024, maxItems: 300, maxText: 256 * 1024, preview: 600 };
  var IMAGE_TYPES = /* @__PURE__ */ new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/bmp"]);
  var clipStore = {
    items: [],
    // 새것이 앞. { id, kind:'text'|'file', name, type, size, image, createdAt, preview, truncated, url }
    body: /* @__PURE__ */ new Map(),
    // id → 글(string) 또는 Blob
    error: null,
    queue: null
    // 처음 읽기가 끝나야 바꾸기를 시작한다 (아래 ready 에서 채움)
  };
  var clipState = () => ({ linked: true, error: clipStore.error, items: clipStore.items, maxFileBytes: CLIP.maxFile });
  var clipMeta = () => clipStore.items.map(({ url, ...m }) => m);
  async function loadClip() {
    try {
      const index = await kv.get("clip-index") || [];
      const bodies = await Promise.all(index.map((m) => kv.get(`clip:${m.id}`)));
      const keep = [];
      index.forEach((m, i) => {
        const b = bodies[i];
        if (b === void 0) return;
        clipStore.body.set(m.id, b);
        keep.push(m.kind === "file" ? { ...m, url: URL.createObjectURL(b) } : m);
      });
      clipStore.items = keep;
    } catch (err) {
      clipStore.error = `\uD074\uB9BD\uBCF4\uB4DC\uB97C \uC77D\uC9C0 \uBABB\uD588\uC5B4\uC694: ${err?.message || err}`;
      return;
    }
    try {
      const ids = new Set(clipStore.items.map((m) => m.id));
      for (const k of await kv.keys()) {
        if (typeof k === "string" && k.startsWith("clip:") && !ids.has(k.slice(5))) await kv.del(k).catch(() => {
        });
      }
    } catch {
    }
  }
  function clipChange(fn) {
    const run = clipStore.queue.then(async () => {
      if (clipStore.error) throw new UserError("\uD074\uB9BD\uBCF4\uB4DC\uB97C \uC77D\uC9C0 \uBABB\uD574\uC11C \uC9C0\uAE08\uC740 \uBC14\uAFC0 \uC218 \uC5C6\uC5B4\uC694. \uCC3D\uC744 \uB2E4\uC2DC \uC5F4\uC5B4 \uC8FC\uC138\uC694.");
      return fn();
    });
    clipStore.queue = run.catch(() => {
    });
    return run.finally(() => engine?.hub.live("clip", clipState()));
  }
  async function clipAdd(entries) {
    const total = clipStore.items.reduce((n, m) => n + m.size, 0) + entries.reduce((n, e) => n + e.meta.size, 0);
    if (total > CLIP.maxTotal) throw new UserError(`\uD074\uB9BD\uBCF4\uB4DC\uAC00 \uAC00\uB4DD \uCC3C\uC5B4\uC694 (\uCD5C\uB300 ${CLIP.maxTotal / 1024 / 1024}MB). \uC548 \uC4F0\uB294 \uAC83\uC744 \uC9C0\uC6CC \uC8FC\uC138\uC694.`);
    if (clipStore.items.length + entries.length > CLIP.maxItems) throw new UserError(`\uD074\uB9BD\uBCF4\uB4DC\uB294 ${CLIP.maxItems}\uAC1C\uAE4C\uC9C0 \uB2F4\uC744 \uC218 \uC788\uC5B4\uC694. \uC548 \uC4F0\uB294 \uAC83\uC744 \uC9C0\uC6CC \uC8FC\uC138\uC694.`);
    for (const e of entries) {
      if (e.body instanceof Blob) e.body = new Blob([await e.body.arrayBuffer()], { type: e.meta.type });
    }
    try {
      for (const e of entries) await kv.set(`clip:${e.meta.id}`, e.body);
      await kv.set("clip-index", [...entries.map((e) => e.meta), ...clipMeta()]);
    } catch {
      for (const e of entries) await kv.del(`clip:${e.meta.id}`).catch(() => {
      });
      throw new UserError("\uC774 PC\uC5D0 \uC800\uC7A5\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694. \uBE0C\uB77C\uC6B0\uC800 \uC800\uC7A5 \uACF5\uAC04\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.");
    }
    for (const e of entries.slice().reverse()) {
      clipStore.body.set(e.meta.id, e.body);
      clipStore.items.unshift(e.meta.kind === "file" ? { ...e.meta, url: URL.createObjectURL(e.body) } : e.meta);
    }
    return entries.map((e) => e.meta);
  }
  async function clipRemove(ids) {
    const drop = new Set(ids.filter((id) => clipStore.body.has(id)));
    if (!drop.size) return 0;
    await kv.set("clip-index", clipMeta().filter((m) => !drop.has(m.id)));
    for (const m of clipStore.items) if (drop.has(m.id) && m.url) URL.revokeObjectURL(m.url);
    clipStore.items = clipStore.items.filter((m) => !drop.has(m.id));
    for (const id of drop) {
      clipStore.body.delete(id);
      await kv.del(`clip:${id}`).catch(() => {
      });
    }
    return drop.size;
  }
  var jsonRes = (status, data) => status === 204 ? new Response(null, { status }) : new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
  async function clipFetch(method, path, init) {
    try {
      if (method === "GET" && path === "/api/clip") {
        await clipStore.queue;
        return jsonRes(200, clipState());
      }
      if (method === "POST" && path === "/api/clip/text") {
        const text = typeof init.body === "string" ? init.body : "";
        if (!text.trim()) throw new UserError("\uBCF4\uB0BC \uB0B4\uC6A9\uC774 \uC5C6\uC5B4\uC694.");
        const bytes = new TextEncoder().encode(text).length;
        if (bytes > CLIP.maxText) throw new UserError("\uAE00\uC774 \uB108\uBB34 \uAE38\uC5B4\uC694 (256KB\uAE4C\uC9C0).");
        const meta = { id: crypto.randomUUID(), kind: "text", size: bytes, createdAt: Date.now(), preview: text.slice(0, CLIP.preview), truncated: text.length > CLIP.preview };
        return jsonRes(201, (await clipChange(() => clipAdd([{ meta, body: text }])))[0]);
      }
      if (method === "POST" && path === "/api/clip/upload") {
        const files = init.body instanceof FormData ? init.body.getAll("files").filter((f) => f instanceof Blob) : [];
        if (!files.length) throw new UserError("\uC62C\uB9B4 \uD30C\uC77C\uC774 \uC5C6\uC5B4\uC694.");
        const big = files.find((f) => f.size > CLIP.maxFile);
        if (big) throw new UserError(`${big.name}: \uD30C\uC77C\uC740 \uCD5C\uB300 ${CLIP.maxFile / 1024 / 1024}MB\uAE4C\uC9C0 \uB2F4\uC744 \uC218 \uC788\uC5B4\uC694.`);
        const now = Date.now();
        const entries = files.map((f, i) => ({
          meta: { id: crypto.randomUUID(), kind: "file", name: String(f.name || "clipboard.png").slice(0, 200), type: f.type || "application/octet-stream", size: f.size, image: IMAGE_TYPES.has(f.type), createdAt: now - i },
          body: f
          // 한도를 본 뒤 clipAdd 에서 복사본으로 바꾼다
        }));
        return jsonRes(201, { items: await clipChange(() => clipAdd(entries)) });
      }
      if (method === "POST" && path === "/api/clip/clear") {
        let ids = [];
        try {
          ids = JSON.parse(init.body).ids;
        } catch {
        }
        if (!Array.isArray(ids)) throw new UserError("\uC9C0\uC6B8 \uD56D\uBAA9\uC744 \uC54C \uC218 \uC5C6\uC5B4\uC694.");
        const removed = await clipChange(() => clipRemove(ids.map(String)));
        return jsonRes(200, { removed, failed: 0 });
      }
      const m = path.match(/^\/api\/clip\/([0-9a-f-]{36})(?:\/(raw|download))?$/);
      if (m && method === "DELETE" && !m[2]) {
        const n = await clipChange(() => clipRemove([m[1]]));
        return n ? jsonRes(204) : jsonRes(404, { error: "\uC774\uBBF8 \uC9C0\uC6CC\uC84C\uC5B4\uC694." });
      }
      if (m && method === "GET" && m[2]) {
        await clipStore.queue;
        const b = clipStore.body.get(m[1]);
        if (b === void 0) return jsonRes(404, { error: "\uC774\uBBF8 \uC9C0\uC6CC\uC84C\uC5B4\uC694." });
        const meta = clipStore.items.find((x) => x.id === m[1]);
        return new Response(b, { status: 200, headers: { "Content-Type": typeof b === "string" ? "text/plain; charset=utf-8" : meta?.type || "application/octet-stream" } });
      }
      return jsonRes(404, { error: "\uC5C6\uB294 \uC8FC\uC18C\uC608\uC694." });
    } catch (err) {
      if (err instanceof UserError) return jsonRes(err.status || 400, { error: err.message });
      return jsonRes(500, { error: `\uD074\uB9BD\uBCF4\uB4DC \uC624\uB958: ${err?.message || err}` });
    }
  }
  window.fetch = async function localFetch(input, init = {}) {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    let u;
    try {
      u = new URL(url, location.href);
    } catch {
      return nativeFetch(input, init);
    }
    if (u.origin !== location.origin || !u.pathname.startsWith("/api/")) return nativeFetch(input, init);
    const eng = await ready;
    const method = String(init.method || "GET").toUpperCase();
    if (u.pathname === "/api/clip" || u.pathname.startsWith("/api/clip/")) return clipFetch(method, u.pathname, init);
    let body;
    if (typeof init.body === "string" && init.body) {
      try {
        body = JSON.parse(init.body);
      } catch {
        return new Response('{"error":"\uC694\uCCAD \uB0B4\uC6A9\uC744 \uC77D\uC744 \uC218 \uC5C6\uC5B4\uC694."}', { status: 400, headers: { "Content-Type": "application/json" } });
      }
    }
    const r = await eng.handle(method, u.pathname + u.search, body);
    if (method !== "GET" && saving) {
      try {
        await saving;
      } catch {
        return new Response(JSON.stringify({ error: "\uC774 PC\uC5D0 \uC800\uC7A5\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694. \uBE0C\uB77C\uC6B0\uC800 \uC800\uC7A5 \uACF5\uAC04\uC744 \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uD574 \uC8FC\uC138\uC694." }), { status: 503, headers: { "Content-Type": "application/json" } });
      }
    }
    return new Response(JSON.stringify(r.data), { status: r.status, headers: { "Content-Type": "application/json" } });
  };
  var LocalEventSource = class {
    constructor() {
      this.readyState = 0;
      this.onerror = null;
      this.ls = {};
      this.stop = null;
      ready.then((eng) => {
        if (this.readyState === 2) return;
        this.readyState = 1;
        this.stop = eng.attach((ev) => setTimeout(() => this.emit(ev), 0));
      }, () => {
        this.readyState = 2;
      });
    }
    emit(ev) {
      if (this.readyState !== 1) return;
      for (const fn of this.ls[ev.type] || []) fn({ type: ev.type, data: ev.data });
    }
    addEventListener(type, fn) {
      (this.ls[type] ||= []).push(fn);
    }
    removeEventListener(type, fn) {
      this.ls[type] = (this.ls[type] || []).filter((f) => f !== fn);
    }
    close() {
      this.readyState = 2;
      this.stop?.();
      this.stop = null;
    }
  };
  LocalEventSource.CONNECTING = 0;
  LocalEventSource.OPEN = 1;
  LocalEventSource.CLOSED = 2;
  window.EventSource = LocalEventSource;
  function wireBackup() {
    const $ = (id) => document.getElementById(id);
    if (!$("w-backup")) return;
    const msg = (t) => {
      $("w-backup-msg").textContent = t || "";
    };
    $("w-backup").addEventListener("click", async () => {
      try {
        const eng = await ready;
        const blob = new Blob([eng.exportBytes()], { type: "application/octet-stream" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `\uD559\uAD50\uB300\uC2DC\uBCF4\uB4DC-\uBC31\uC5C5-${localDate()}.db`;
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1e4);
        await kv.set("lastBackup", Date.now()).catch(() => {
        });
        msg("\uBC31\uC5C5 \uD30C\uC77C\uC744 \uBC1B\uC558\uC5B4\uC694. (\uB2E4\uC6B4\uB85C\uB4DC \uD3F4\uB354)");
      } catch (err) {
        msg(`\uBC1B\uC9C0 \uBABB\uD588\uC5B4\uC694: ${err.message}`);
      }
    });
    $("w-restore").addEventListener("click", () => {
      const b = $("w-restore");
      if (b.dataset.armed !== "1") {
        b.dataset.armed = "1";
        b.textContent = "\uC9C0\uAE08 \uC790\uB8CC\uAC00 \uBC31\uC5C5 \uB0B4\uC6A9\uC73C\uB85C \uBC14\uB00C\uC5B4\uC694. \uD55C \uBC88 \uB354 \uB204\uB974\uBA74 \uD30C\uC77C \uACE0\uB974\uAE30";
        setTimeout(() => {
          b.dataset.armed = "";
          b.textContent = "\uBC31\uC5C5 \uD30C\uC77C \uBD88\uB7EC\uC624\uAE30";
        }, 5e3);
        return;
      }
      b.dataset.armed = "";
      b.textContent = "\uBC31\uC5C5 \uD30C\uC77C \uBD88\uB7EC\uC624\uAE30";
      $("w-restore-file").click();
    });
    $("w-restore-file").addEventListener("change", async () => {
      const f = $("w-restore-file").files[0];
      $("w-restore-file").value = "";
      if (!f) return;
      try {
        if (f.size > 50 * 1024 * 1024) throw new Error("\uD30C\uC77C\uC774 \uB108\uBB34 \uCEE4\uC694.");
        const bytes = new Uint8Array(await f.arrayBuffer());
        await ready;
        checkBackup(bytes);
        const eng = await ready;
        restoring = true;
        await saving?.catch(() => {
        });
        await kv.set("db-before-restore", eng.exportBytes());
        await kv.set("db", bytes);
        msg("\uBD88\uB7EC\uC654\uC5B4\uC694. \uB2E4\uC2DC \uC5EC\uB294 \uC911\u2026");
        setTimeout(() => location.reload(), 300);
      } catch (err) {
        restoring = false;
        msg(`\uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694: ${err.message}`);
      }
    });
    kv.get("lastBackup").then((t) => {
      if (t) msg(`\uB9C8\uC9C0\uB9C9\uC73C\uB85C \uBC31\uC5C5 \uBC1B\uC740 \uB54C: ${new Date(t).toLocaleDateString("ko-KR")}`);
    }, () => {
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wireBackup);
  else wireBackup();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {
  });
  var installPrompt = null;
  var showInstall = () => {
  };
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installPrompt = e;
    showInstall();
  });
  function wireInstall() {
    const box = document.getElementById("w-install");
    if (!box) return;
    if (matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: window-controls-overlay)").matches) return;
    const KEY = "install-hint-closed";
    try {
      if (Date.now() - Number(localStorage.getItem(KEY) || 0) < 30 * 864e5) return;
    } catch {
    }
    const btn = document.getElementById("w-install-btn");
    const text = document.getElementById("w-install-text");
    showInstall = () => {
      btn.hidden = false;
      text.textContent = "\uC124\uCE58\uD574\uC11C \uC4F0\uBA74 \uD504\uB85C\uADF8\uB7A8\uCC98\uB7FC \uB530\uB85C \uC5F4\uB824\uC694.";
      box.hidden = false;
    };
    btn.addEventListener("click", async () => {
      const p = installPrompt;
      if (!p) return;
      installPrompt = null;
      await p.prompt();
      const { outcome } = await p.userChoice;
      if (outcome === "accepted") box.hidden = true;
    });
    window.addEventListener("appinstalled", () => {
      box.hidden = true;
    });
    document.getElementById("w-install-x").addEventListener("click", () => {
      box.hidden = true;
      try {
        localStorage.setItem(KEY, String(Date.now()));
      } catch {
      }
    });
    if (installPrompt) showInstall();
    else if (!("onbeforeinstallprompt" in window)) {
      btn.hidden = true;
      text.textContent = "\uD06C\uB86C\uC774\uB098 \uC5E3\uC9C0\uC5D0\uC11C \uC5F4\uBA74 \uC571\uC73C\uB85C \uC124\uCE58\uD574 \uC4F8 \uC218 \uC788\uC5B4\uC694.";
      box.hidden = false;
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wireInstall);
  else wireInstall();
})();
