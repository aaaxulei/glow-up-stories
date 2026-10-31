System.register("chunks:///_virtual/Clock.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './ui.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, Vec3, UIOpacity, W, H;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      Vec3 = module.Vec3;
      UIOpacity = module.UIOpacity;
    }, function (module) {
      W = module.W;
      H = module.H;
    }],
    execute: function () {
      exports({
        kfAt: kfAt,
        op: op,
        play: play
      });
      cclegacy._RF.push({}, "ee3312hlXhOQ48ZQ0gz87Pw", "Clock", undefined);
      var Clock = exports('Clock', /*#__PURE__*/function () {
        function Clock() {
          this.now = 0;
          // ms since the run started
          this.timers = [];
          this.anims = [];
        }
        var _proto = Clock.prototype;
        /** fn after ms */
        _proto.after = function after(ms, fn) {
          var t = {
            at: this.now + Math.max(0, ms),
            fn: fn
          };
          this.timers.push(t);
          return {
            stop: function stop() {
              return t.dead = true;
            }
          };
        }
        /** fn every ms (first call after ms) */;
        _proto.every = function every(ms, fn) {
          var t = {
            at: this.now + ms,
            fn: fn,
            every: Math.max(1, ms)
          };
          this.timers.push(t);
          return {
            stop: function stop() {
              return t.dead = true;
            }
          };
        }
        /** step(k) with k 0..1 over ms (looping if loop); done at the end */;
        _proto.anim = function anim(ms, step, done, loop) {
          if (loop === void 0) {
            loop = false;
          }
          var a = {
            t0: this.now,
            dur: Math.max(1, ms),
            step: step,
            done: done,
            loop: loop
          };
          this.anims.push(a);
          step(0);
          return {
            stop: function stop() {
              return a.dead = true;
            }
          };
        };
        _proto.tick = function tick(dtMs) {
          var _this = this;
          this.now += dtMs;
          // timers due now, in order; ones added meanwhile wait for the next tick
          var due = this.timers.filter(function (t) {
            return !t.dead && t.at <= _this.now;
          });
          for (var _iterator = _createForOfIteratorHelperLoose(due), _step; !(_step = _iterator()).done;) {
            var _t = _step.value;
            if (_t.dead) continue;
            if (_t.every) _t.at += _t.every * Math.max(1, Math.ceil((this.now - _t.at) / _t.every) || 1);else _t.dead = true;
            try {
              _t.fn();
            } catch (e) {
              console.error('[clock] timer', e);
            }
          }
          this.timers = this.timers.filter(function (t) {
            return !t.dead;
          });
          for (var _iterator2 = _createForOfIteratorHelperLoose(this.anims.slice()), _step2; !(_step2 = _iterator2()).done;) {
            var a = _step2.value;
            if (a.dead) continue;
            var _k = (this.now - a.t0) / a.dur;
            if (a.loop) _k = _k % 1;else if (_k >= 1) {
              a.dead = true;
              _k = 1;
            }
            try {
              a.step(_k);
              if (a.dead && a.done) a.done();
            } catch (e) {
              a.dead = true;
              console.error('[clock] anim', e);
            }
          }
          this.anims = this.anims.filter(function (a) {
            return !a.dead;
          });
        };
        _proto.clear = function clear() {
          for (var _iterator3 = _createForOfIteratorHelperLoose(this.timers), _step3; !(_step3 = _iterator3()).done;) {
            var _t2 = _step3.value;
            _t2.dead = true;
          }
          for (var _iterator4 = _createForOfIteratorHelperLoose(this.anims), _step4; !(_step4 = _iterator4()).done;) {
            var a = _step4.value;
            a.dead = true;
          }
          this.timers = [];
          this.anims = [];
        };
        return Clock;
      }());

      // ---------------------------------------------------------------- easing and keyframes (CSS-like)
      var ease = exports('ease', {
        linear: function linear(t) {
          return t;
        },
        "in": function _in(t) {
          return t * t * t * 0.6 + t * t * 0.4;
        },
        // ~ CSS ease-in
        out: function out(t) {
          return 1 - Math.pow(1 - t, 2.2);
        },
        // ~ CSS ease-out
        inOut: function inOut(t) {
          return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        },
        css: function css(t) {
          // CSS "ease" ≈ cubic-bezier(.25,.1,.25,1)
          return 1 - Math.pow(1 - t, 2.6) * (1 - 0.15 * t);
        }
      });

      /** one keyframe: offset 0..1 and any of: tx/ty (stage px, y down), sx/sy (scale), r (deg, clockwise like CSS), o (0..1) */

      var PROPS = ['tx', 'ty', 'sx', 'sy', 'r', 'o'];
      var DEF = {
        tx: 0,
        ty: 0,
        sx: 1,
        sy: 1,
        r: 0,
        o: 1
      };

      /** the value of every property at k, interpolating between the keyframes that set it */
      function kfAt(kfs, k, e) {
        if (e === void 0) {
          e = ease.linear;
        }
        var out = {};
        var _loop = function _loop() {
            var p = _step5.value;
            var ks = kfs.filter(function (f) {
              return f[p] !== undefined;
            });
            if (!ks.length) {
              out[p] = DEF[p];
              return 0; // continue
            }

            if (k <= ks[0].k) {
              out[p] = ks[0][p];
              return 0; // continue
            }

            var i = 0;
            while (i < ks.length - 1 && ks[i + 1].k < k) i++;
            var a = ks[i],
              b = ks[Math.min(i + 1, ks.length - 1)];
            if (a === b || b.k === a.k) {
              out[p] = a[p];
              return 0; // continue
            }

            var f = (a.e || e)((k - a.k) / (b.k - a.k));
            out[p] = a[p] + (b[p] - a[p]) * f;
          },
          _ret;
        for (var _iterator5 = _createForOfIteratorHelperLoose(PROPS), _step5; !(_step5 = _iterator5()).done;) {
          _ret = _loop();
          if (_ret === 0) continue;
        }
        return out;
      }

      /** stage point (top-left origin, y down) → node position under a full-stage parent */
      var at = exports('at', function at(x, y) {
        return new Vec3(x - W / 2, H / 2 - y, 0);
      });
      function op(n) {
        return n.getComponent(UIOpacity) || n.addComponent(UIOpacity);
      }

      /** run keyframes on a node whose resting stage position is (x, y): offsets, scale, rotation and opacity */
      function play(clock, n, x, y, kfs, ms, e, done, loop) {
        if (e === void 0) {
          e = ease.linear;
        }
        if (loop === void 0) {
          loop = false;
        }
        var o = kfs.some(function (f) {
          return f.o !== undefined;
        }) ? op(n) : null;
        return clock.anim(ms, function (k) {
          if (!n.isValid) return;
          var v = kfAt(kfs, k, e);
          n.setPosition(x + v.tx - W / 2, H / 2 - (y + v.ty), 0);
          n.setScale(v.sx, v.sy, 1);
          n.angle = -v.r;
          if (o) o.opacity = Math.max(0, Math.min(255, Math.round(v.o * 255)));
        }, done, loop);
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Cover.ts", ['cc'], function (exports) {
  var cclegacy, Texture2D, Material;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Texture2D = module.Texture2D;
      Material = module.Material;
    }],
    execute: function () {
      cclegacy._RF.push({}, "29c30OP8jpBgqQE+Q7qAAnZ", "Cover", undefined);
      var Cover = exports('Cover', /*#__PURE__*/function () {
        /** px, py, pw, ph: where the picture sits on the stage (its contain-fit rect) */
        function Cover(sprite, effect, px, py, pw, ph, revealed) {
          this.tex = void 0;
          this.data = void 0;
          this.mw = void 0;
          this.mh = void 0;
          this.dirty = true;
          this.finished = false;
          this.sprite = sprite;
          this.px = px;
          this.py = py;
          this.pw = pw;
          this.ph = ph;
          this.mw = Math.max(8, Math.round(pw / 5));
          this.mh = Math.max(8, Math.round(ph / 5));
          this.data = new Uint8Array(this.mw * this.mh * 4);
          for (var i = 0; i < this.mw * this.mh; i++) {
            this.data[i * 4] = revealed ? 255 : 0;
            this.data[i * 4 + 3] = 255;
          }
          this.tex = new Texture2D();
          this.tex.reset({
            width: this.mw,
            height: this.mh,
            format: Texture2D.PixelFormat.RGBA8888
          });
          this.tex.setFilters(Texture2D.Filter.LINEAR, Texture2D.Filter.LINEAR);
          this.tex.setWrapMode(Texture2D.WrapMode.CLAMP_TO_EDGE, Texture2D.WrapMode.CLAMP_TO_EDGE);
          var mat = new Material();
          mat.initialize({
            effectAsset: effect
          });
          sprite.customMaterial = mat;
          sprite.getMaterialInstance(0).setProperty('coverMask', this.tex);
          this.upload();
        }

        /** soft stamp at a stage point. wipe: the editor's destination-out radial gradient (.9 from 35% of the radius,
         *  fading to 0 at the edge); reveal: a feathered blob of the picture (1 at the centre, .85 at 60%, 0 at the edge) */
        var _proto = Cover.prototype;
        _proto.stamp = function stamp(x, y, rad, mode, strength) {
          if (strength === void 0) {
            strength = 1;
          }
          var cx = (x - this.px) / this.pw * this.mw,
            cy = (y - this.py) / this.ph * this.mh,
            R = rad / this.pw * this.mw;
          var x0 = Math.max(0, Math.floor(cx - R)),
            x1 = Math.min(this.mw - 1, Math.ceil(cx + R)),
            y0 = Math.max(0, Math.floor(cy - R)),
            y1 = Math.min(this.mh - 1, Math.ceil(cy + R));
          var d = this.data;
          for (var j = y0; j <= y1; j++) for (var i = x0; i <= x1; i++) {
            var r = Math.hypot(i + 0.5 - cx, j + 0.5 - cy) / R;
            if (r >= 1) continue;
            var o = (j * this.mw + i) * 4;
            if (mode === 'wipe') {
              var a = (r < 0.35 ? 0.9 : 0.9 * (1 - (r - 0.35) / 0.65)) * strength;
              d[o + 1] = Math.round(255 - (255 - d[o + 1]) * (1 - a));
            } else {
              var _a = (r < 0.6 ? 1 - r / 0.6 * 0.15 : 0.85 * (1 - (r - 0.6) / 0.4)) * strength;
              d[o] = Math.round(d[o] + (255 - d[o]) * _a);
            }
          }
          this.dirty = true;
        }
        /** spray everywhere a little more (whatever the passes missed fades in rather than popping); 1 = all of it */;
        _proto.revealAll = function revealAll(a) {
          for (var i = 0; i < this.mw * this.mh; i++) this.data[i * 4] = Math.round(this.data[i * 4] + (255 - this.data[i * 4]) * a);
          this.dirty = true;
        };
        _proto.upload = function upload() {
          if (!this.dirty) return;
          this.dirty = false;
          this.tex.uploadData(this.data);
        }
        /** back to a plain sprite (the cover is gone / the wall is clean) */;
        _proto.dispose = function dispose() {
          this.sprite.customMaterial = null;
          this.tex.destroy();
        };
        return Cover;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Ending.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './ui.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, _asyncToGenerator, _regeneratorRuntime, cclegacy, Color, UITransform, Sprite, Graphics, Tween, tween, Vec3, AudioSource, Node, Label, sprite, node2D, H, W, fadeTo, opacity, text, pos, AMBER, button, ROSE, breathe, INK, CREAM, LAV;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      UITransform = module.UITransform;
      Sprite = module.Sprite;
      Graphics = module.Graphics;
      Tween = module.Tween;
      tween = module.tween;
      Vec3 = module.Vec3;
      AudioSource = module.AudioSource;
      Node = module.Node;
      Label = module.Label;
    }, function (module) {
      sprite = module.sprite;
      node2D = module.node2D;
      H = module.H;
      W = module.W;
      fadeTo = module.fadeTo;
      opacity = module.opacity;
      text = module.text;
      pos = module.pos;
      AMBER = module.AMBER;
      button = module.button;
      ROSE = module.ROSE;
      breathe = module.breathe;
      INK = module.INK;
      CREAM = module.CREAM;
      LAV = module.LAV;
    }],
    execute: function () {
      cclegacy._RF.push({}, "16989s3VYVMxa+wyaWDDky+", "Ending", undefined);

      /** sprite heights and resting x (stage px); feet stand on bottom: 90. src: the picture it shows */
      var SPR = {
        'chloe-gown': {
          h: 740,
          left: 70,
          src: 'chloe-pose'
        },
        // the in-room final look, hand on the hip
        'chloe-sass': {
          h: 740,
          left: 81,
          src: 'chloe-turn'
        },
        // turned to Ryan, raised-brow smirk
        'chloe-walkaway': {
          h: 740,
          left: 35,
          src: 'chloe-walkaway'
        },
        'ryan-smitten': {
          h: 770,
          left: 375,
          src: 'ryan-smitten'
        },
        'ryan-burned': {
          h: 770,
          left: 345,
          src: 'ryan-burned'
        }
      };
      /** the carpet's ground plane: someone standing with feet at y is k*(y - HORIZON) tall */
      var HORIZON = 571,
        NEAR_Y = 1190,
        FAR_Y = 680,
        WALK_H = 740,
        FAR_X = 384,
        NEAR_X = 242;
      var LINES = {
        'ryan-dance': ['Ryan', 'Whoa... hey, gorgeous. Wanna dance?'],
        'chloe-mirror': ['Chloe', 'Hm. Have you even looked in a mirror... lately?']
      };
      var END_IMAGES = exports('END_IMAGES', ['bg-carpet', 'crowd-L', 'crowd-R', 'chloe-pose', 'chloe-turn', 'chloe-walkaway', 'ryan-smitten', 'ryan-burned', 'ryan-burned-frozen', 'glint', 'cam', 'vig', 'card-grad']);
      var END_SOUNDS = exports('END_SOUNDS', ['crowd-cheer', 'crowd-ooh', 'v-ryan-dance', 'v-chloe-mirror']);
      /** phone flashes and shouted words over both rows of classmates: x0, x1, y0, y1 of each side */
      var CROWD = {
        L: [10, 270, 520, 930],
        R: [480, 710, 520, 940]
      };
      var CHEERS = ['OMG!', 'WOW!', 'CHLOE?!', 'QUEEN!', 'STUNNING!', 'NO WAY!'];
      var WHITE = Color.WHITE,
        GOLD = new Color(255, 216, 77, 255),
        BLUSH = new Color(255, 143, 184, 255);
      var rnd = function rnd(a, b) {
        return a + Math.random() * (b - a);
      };
      var easeInOut = function easeInOut(t) {
        return 0.5 - 0.5 * Math.cos(Math.PI * t);
      };
      var Ending = exports('Ending', /*#__PURE__*/function () {
        function Ending(parent, host, img, sfx, onAgain) {
          var _this = this;
          this.root = void 0;
          this.crowd = void 0;
          this.fxBack = void 0;
          this.walker = void 0;
          this.slots = void 0;
          this.vig = void 0;
          this.bubble = null;
          this.flashNode = void 0;
          this.fxG = void 0;
          this.starRoot = void 0;
          this.cover = void 0;
          this.skipBtn = void 0;
          this.parts = [];
          this.anims = [];
          this.now = 0;
          this.hurry = null;
          this.skipTyping = false;
          this.fast = false;
          this.dead = false;
          this.state = 'idle';
          this.cheering = false;
          this.crowdTick = null;
          this.voice = void 0;
          this.sfxSrc = void 0;
          this.cheerSrc = void 0;
          this.SFX = {
            whoosh: function whoosh() {
              return _this.play('whoosh', 0.7);
            },
            shutter: function shutter() {
              return _this.play('shutter', 0.9);
            },
            burn: function burn() {
              _this.play('hit', 0.8);
              _this.play('break', 0.6, 0.05);
            },
            heart: function heart() {
              return _this.play('heart', 0.6);
            }
          };
          this.host = host;
          this.img = img;
          this.sfx = sfx;
          this.onAgain = onAgain;
          this.root = node2D('Ending', parent, W, H);
          sprite('bg', this.root, img.get('bg-carpet'), W, H);
          this.crowd = ['crowd-L', 'crowd-R'].map(function (k) {
            return sprite(k, _this.root, img.get(k), W, H).node;
          });
          this.fxBack = node2D('fxBack', this.root, W, H);
          this.walker = this.figure('walker', 'chloe-pose');
          this.walker.node.active = false;
          this.slots = {
            R: this.figure('R', 'chloe-pose'),
            L: this.figure('L', 'chloe-pose')
          };
          for (var _i = 0, _Object$values = Object.values(this.slots); _i < _Object$values.length; _i++) {
            var s = _Object$values[_i];
            opacity(s.node).opacity = 0;
          }
          this.vig = sprite('vig', this.root, img.get('vig'), W, H).node;
          opacity(this.vig).opacity = 0;
          this.flashNode = this.fill('flash', WHITE);
          opacity(this.flashNode).opacity = 0;
          this.fxG = node2D('fx', this.root, W, H).addComponent(Graphics);
          this.starRoot = node2D('stars', this.root, W, H);
          this.cover = this.fill('cover', WHITE);
          this.skipBtn = button(this.root, 'Skip ››', 150, 48, function () {
            return _this.skip();
          }, new Color(32, 16, 40, 200), 22);
          this.skipBtn.setPosition(pos(548, 22, 150, 48));
          this.voice = node2D('voice', this.root).addComponent(AudioSource);
          this.sfxSrc = node2D('sfx', this.root).addComponent(AudioSource);
          this.cheerSrc = node2D('cheer', this.root).addComponent(AudioSource);
          // a tap anywhere hurries the current line / beat along
          this.root.on(Node.EventType.TOUCH_START, function (e) {
            if (_this.state === 'end' || _this.state === 'idle') return;
            _this.skipTyping = true;
            _this.hurry == null || _this.hurry();
          });
        }
        var _proto = Ending.prototype;
        _proto.destroy = function destroy() {
          this.dead = true;
          this.stopCrowd();
          this.voice.stop();
          this.cheerSrc.stop();
          this.root.destroy();
        }

        // ---------------------------------------------------------------- building blocks

        /** a standing figure: bottom-centre anchor, with the CSS drop-shadow (the same silhouette 10px lower, plum at .18) */;
        _proto.figure = function figure(name, key) {
          var s = sprite(name, this.root, this.img.get(key), 10, 10);
          s.node.getComponent(UITransform).setAnchorPoint(0.5, 0);
          var sh = sprite('shadow', s.node, this.img.get(key), 10, 10);
          sh.node.getComponent(UITransform).setAnchorPoint(0.5, 0);
          sh.color = new Color(43, 22, 48, 46);
          sh.node.setPosition(0, -10);
          sh.node.setSiblingIndex(0);
          return s;
        };
        _proto.setFigure = function setFigure(s, key, h) {
          var f = this.img.get(key),
            w = h * f.width / f.height;
          s.spriteFrame = f;
          s.node.getComponent(UITransform).setContentSize(w, h);
          var sh = s.node.getChildByName('shadow').getComponent(Sprite);
          sh.spriteFrame = f;
          sh.node.getComponent(UITransform).setContentSize(w, h);
          return w;
        };
        _proto.fill = function fill(name, c) {
          var n = node2D(name, this.root, W, H);
          var g = n.addComponent(Graphics);
          g.fillColor = c;
          g.rect(-W / 2, -H / 2, W, H);
          g.fill();
          return n;
        }

        // ---------------------------------------------------------------- timing & audio

        /** ?fast: a tenth of the time. Torn down, the sequence just stops here */;
        _proto.wait = function wait(ms) {
          var _this2 = this;
          return new Promise(function (res) {
            if (_this2.dead) return;
            var over = false;
            var fin = function fin() {
              if (over) return;
              over = true;
              _this2.host.unschedule(fin);
              _this2.hurry = null;
              if (!_this2.dead) res();
            };
            _this2.host.scheduleOnce(fin, (_this2.fast ? ms / 10 : ms) / 1000);
            _this2.hurry = fin;
          });
        };
        _proto.anim = function anim(ms, step, done) {
          var a = {
            t0: this.now,
            ms: Math.max(1, ms),
            step: step,
            done: done
          };
          this.anims.push(a);
          step(0);
          return a;
        };
        _proto.play = function play(name, vol, delay) {
          var _this3 = this;
          if (vol === void 0) {
            vol = 1;
          }
          if (delay === void 0) {
            delay = 0;
          }
          var clip = this.sfx.get(name);
          if (!clip || this.dead) return;
          var go = function go() {
            return !_this3.dead && _this3.sfxSrc.playOneShot(clip, vol);
          };
          delay ? this.host.scheduleOnce(go, delay) : go();
        };
        _proto.fadeVol = function fadeVol(src, sec, to) {
          var from = src.volume;
          this.anim(sec * 1000, function (k) {
            return src.volume = from + (to - from) * k;
          });
        };
        // ---------------------------------------------------------------- layers
        _proto.show = function show(slot, key, from, pop) {
          if (pop === void 0) {
            pop = true;
          }
          var s = this.slots[slot],
            cfg = SPR[key];
          var w = this.setFigure(s, cfg.src, cfg.h);
          var y = -H / 2 + 90;
          Tween.stopAllByTarget(s.node);
          if (from !== undefined) s.node.setPosition(from + w / 2 - W / 2, y);
          fadeTo(s.node, 255, 0.25);
          tween(s.node).to(0.55, {
            position: new Vec3(cfg.left + w / 2 - W / 2, y, 0)
          }, {
            easing: 'quartOut'
          }).start();
          if (pop) {
            s.node.setScale(0.92, 1.06, 1);
            tween(s.node).to(0.32, {
              scale: Vec3.ONE
            }, {
              easing: 'backOut'
            }).start();
          }
        }
        /** pose change in place: the old picture fades out over the new one */;
        _proto.swapFade = function swapFade(slot, key, ms) {
          if (ms === void 0) {
            ms = 220;
          }
          var s = this.slots[slot],
            cfg = SPR[key];
          var old = sprite('old', this.root, s.spriteFrame, 10, 10);
          var t = s.node.getComponent(UITransform);
          old.node.getComponent(UITransform).setAnchorPoint(0.5, 0);
          old.node.getComponent(UITransform).setContentSize(t.width, t.height);
          old.node.setPosition(s.node.position);
          old.node.setSiblingIndex(s.node.getSiblingIndex() + 1);
          var w = this.setFigure(s, cfg.src, cfg.h);
          Tween.stopAllByTarget(s.node);
          s.node.setPosition(cfg.left + w / 2 - W / 2, -H / 2 + 90);
          var o = opacity(old.node);
          this.anim(ms, function (k) {
            return o.opacity = Math.round(255 * (1 - k));
          }, function () {
            return old.node.destroy();
          });
        }

        /** speech bubble: cream panel, coloured name tag, tail towards the speaker; typed in step with the voice */;
        _proto.say = /*#__PURE__*/
        function () {
          var _say = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(side, key, ms) {
            var _LINES$key, name, line, clip, b, lb, tw, th, bw, bh, left, g, tx, ty, tag, nl, nw, tg, dur, t0, step, shown, _iterator, _step, ch;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  if (ms === void 0) {
                    ms = 600;
                  }
                  if (!this.dead) {
                    _context.next = 3;
                    break;
                  }
                  return _context.abrupt("return");
                case 3:
                  _LINES$key = LINES[key], name = _LINES$key[0], line = _LINES$key[1], clip = this.sfx.get('v-' + key);
                  this.unsay();
                  b = node2D('bubble', this.root);
                  this.bubble = b;
                  b.setSiblingIndex(this.flashNode.getSiblingIndex()); // under the flash, the glints and the cover, like the page
                  lb = text(b, line, {
                    size: 29,
                    color: INK,
                    align: 'left',
                    lineHeight: 40
                  });
                  lb.overflow = Label.Overflow.NONE;
                  lb.updateRenderData(true);
                  tw = lb.node.getComponent(UITransform).width;
                  if (tw > 464) {
                    lb.overflow = Label.Overflow.RESIZE_HEIGHT;
                    lb.node.getComponent(UITransform).width = tw = 464;
                    lb.updateRenderData(true);
                  }
                  th = lb.node.getComponent(UITransform).height;
                  bw = tw + 56, bh = th + 38;
                  left = side === 'L' ? 30 : W - 30 - bw;
                  b.setPosition(pos(left, 120, bw, bh));
                  g = b.addComponent(Graphics);
                  g.fillColor = new Color(0, 0, 0, 60);
                  g.roundRect(-bw / 2, -bh / 2 - 18, bw, bh, 30);
                  g.fill();
                  g.fillColor = INK;
                  g.roundRect(-bw / 2, -bh / 2 - 8, bw, bh, 30);
                  g.fill();
                  g.fillColor = CREAM;
                  g.roundRect(-bw / 2, -bh / 2, bw, bh, 30);
                  g.fill();
                  g.lineWidth = 5;
                  g.strokeColor = INK;
                  g.stroke();
                  tx = side === 'L' ? -bw / 2 + 83 : bw / 2 - 83, ty = -bh / 2;
                  g.fillColor = CREAM;
                  g.moveTo(tx - 18, ty + 3);
                  g.lineTo(tx, ty - 19);
                  g.lineTo(tx + 18, ty + 3);
                  g.close();
                  g.fill();
                  g.moveTo(tx - 18, ty);
                  g.lineTo(tx, ty - 19);
                  g.lineTo(tx + 18, ty);
                  g.stroke();
                  lb.node.setSiblingIndex(99);
                  lb.node.getComponent(UITransform).setAnchorPoint(0, 1);
                  lb.node.setPosition(-bw / 2 + 28, bh / 2 - 18);
                  tag = node2D('tag', b);
                  nl = text(tag, name, {
                    size: 22,
                    color: side === 'L' ? INK : WHITE
                  });
                  nl.updateRenderData(true);
                  nw = nl.node.getComponent(UITransform).width + 36;
                  tg = tag.addComponent(Graphics);
                  tg.fillColor = side === 'L' ? LAV : ROSE;
                  tg.roundRect(-nw / 2, -17, nw, 34, 17);
                  tg.fill();
                  tg.lineWidth = 4;
                  tg.strokeColor = INK;
                  tg.stroke();
                  nl.node.setSiblingIndex(99);
                  nl.verticalAlign = Label.VerticalAlign.CENTER; // centred in the pill
                  nl.node.setPosition(0, 0);
                  tag.setPosition(-bw / 2 + 22 + nw / 2, bh / 2 + 2);
                  b.setScale(0.6, 0.6, 1);
                  opacity(b).opacity = 0;
                  tween(b).to(0.22, {
                    scale: Vec3.ONE
                  }, {
                    easing: 'backOut'
                  }).start();
                  fadeTo(b, 255, 0.12);
                  // typed out in step with the voice clip
                  lb.string = '';
                  this.skipTyping = false;
                  dur = clip ? clip.getDuration() * 1000 : line.length * 38, t0 = Date.now();
                  this.voice.stop();
                  if (clip && !this.fast) {
                    this.voice.clip = clip;
                    this.voice.volume = 1;
                    this.voice.play();
                  }
                  step = dur * 0.85 / line.length;
                  shown = '';
                  _iterator = _createForOfIteratorHelperLoose(line);
                case 71:
                  if ((_step = _iterator()).done) {
                    _context.next = 81;
                    break;
                  }
                  ch = _step.value;
                  if (!(this.skipTyping || this.dead)) {
                    _context.next = 75;
                    break;
                  }
                  return _context.abrupt("break", 81);
                case 75:
                  shown += ch;
                  lb.string = shown;
                  _context.next = 79;
                  return this.wait(step);
                case 79:
                  _context.next = 71;
                  break;
                case 81:
                  lb.string = line;
                  if (!(!this.skipTyping && !this.fast)) {
                    _context.next = 85;
                    break;
                  }
                  _context.next = 85;
                  return this.wait(Math.max(0, dur - (Date.now() - t0)));
                case 85:
                  this.skipTyping = false;
                  _context.next = 88;
                  return this.wait(ms);
                case 88:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function say(_x, _x2, _x3) {
            return _say.apply(this, arguments);
          }
          return say;
        }();
        _proto.unsay = function unsay() {
          if (this.bubble) this.bubble.destroy();
          this.bubble = null;
        }

        // ---------------------------------------------------------------- fx
        ;

        _proto.hearts = function hearts(x, y, n) {
          if (n === void 0) {
            n = 8;
          }
          for (var i = 0; i < n; i++) this.parts.push({
            x: x + (Math.random() - 0.5) * 120,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 3,
            life: 1,
            s: 18 + Math.random() * 16,
            heart: true,
            rot: 0
          });
        }
        /** gold glints around her */;
        _proto.stars = function stars(cx, cy, n) {
          if (n === void 0) {
            n = 26;
          }
          for (var i = 0; i < n; i++) {
            var a = Math.random() * 6.28,
              r = 60 + Math.random() * 220;
            var s = sprite('glint', this.starRoot, this.img.get('glint'), 64, 64);
            this.parts.push({
              x: cx + Math.cos(a) * r * 0.7,
              y: cy + Math.sin(a) * r,
              vx: (Math.random() - 0.5) * 0.8,
              vy: -0.4 - Math.random() * 0.8,
              life: 0.8 + Math.random() * 0.7,
              s: 8 + Math.random() * 14,
              heart: false,
              rot: Math.random(),
              n: s.node
            });
          }
        }
        /** particles step at 60 fps like the canvas version; crowd hop; small animations */;
        _proto.tick = function tick(dt) {
          var _this4 = this;
          if (this.dead) return;
          this.now += dt * 1000;
          for (var _iterator2 = _createForOfIteratorHelperLoose(this.anims.slice()), _step2; !(_step2 = _iterator2()).done;) {
            var a = _step2.value;
            var _k = Math.min(1, (this.now - a.t0) / a.ms);
            a.step(_k);
            if (_k >= 1) {
              this.anims.splice(this.anims.indexOf(a), 1);
              a.done == null || a.done();
            }
          }
          // the rows hop while they cheer (CSS: .42s / .37s alternate, the right row half a beat behind)
          this.crowd.forEach(function (n, i) {
            if (!_this4.cheering) return n.setPosition(0, 0);
            var per = i ? 370 : 420,
              p = (_this4.now + (i ? 200 : 0)) / per % 2;
            n.setPosition(0, 7 * easeInOut(p < 1 ? p : 2 - p));
          });
          var g = this.fxG;
          g.clear();
          var k = dt * 60;
          this.parts = this.parts.filter(function (p) {
            var _p$n;
            if ((p.life -= 0.016 * k) > 0) return true;
            (_p$n = p.n) == null || _p$n.destroy();
            return false;
          });
          for (var _iterator3 = _createForOfIteratorHelperLoose(this.parts), _step3; !(_step3 = _iterator3()).done;) {
            var p = _step3.value;
            p.x += p.vx * k;
            p.y += p.vy * k;
            var _a = Math.min(1, p.life * 1.5);
            var X = p.x - W / 2,
              Y = H / 2 - p.y;
            if (p.heart) {
              var s = p.s;
              g.fillColor = new Color(255, 95, 143, Math.round(_a * 255));
              g.strokeColor = new Color(43, 22, 48, Math.round(_a * 255));
              g.lineWidth = 3;
              g.moveTo(X, Y - s * 0.3);
              g.bezierCurveTo(X - s, Y + s * 0.5, X - s * 0.4, Y + s, X, Y + s * 0.45);
              g.bezierCurveTo(X + s * 0.4, Y + s, X + s, Y + s * 0.5, X, Y - s * 0.3);
              g.fill();
              g.stroke();
            } else if (p.n) {
              var _s = p.s * (0.6 + 0.4 * Math.sin(p.life * 12 + p.rot * 6));
              p.n.setPosition(X, Y);
              p.n.setScale(_s / 22, _s / 22, 1);
              opacity(p.n).opacity = Math.round(_a * 255);
            }
          }
        };
        _proto.shake = function shake(mag, dur) {
          if (mag === void 0) {
            mag = 12;
          }
          if (dur === void 0) {
            dur = 350;
          }
          var t = tween(this.root);
          for (var i = 0; i < 8; i++) t.to(dur / 9000, {
            position: new Vec3((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2, 0)
          });
          t.to(dur / 9000, {
            position: Vec3.ZERO
          }).start();
        };
        _proto.flash = function flash(peak, dur) {
          if (peak === void 0) {
            peak = 0.8;
          }
          if (dur === void 0) {
            dur = 220;
          }
          var o = opacity(this.flashNode);
          Tween.stopAllByTarget(o);
          o.opacity = peak * 255;
          tween(o).to(dur / 1000, {
            opacity: 0
          }).start();
        }
        /** a word that pops, tilts and floats up (BURN!) */;
        _proto.fxText = function fxText(s, x, y, color) {
          var n = text(this.root, s, {
            size: 58,
            color: color,
            outline: 5,
            drop: true
          }).node;
          n.getComponent(UITransform).setAnchorPoint(0.5, 0.5);
          n.setPosition(pos(x, y));
          n.setScale(0.3, 0.3, 1);
          n.angle = 10;
          opacity(n).opacity = 0;
          tween(n).to(0.33, {
            scale: new Vec3(1.15, 1.15, 1),
            angle: -4
          }, {
            easing: 'quadOut'
          }).to(0.97, {
            scale: Vec3.ONE,
            angle: 0,
            position: pos(x, y - 30)
          }).call(function () {
            return n.destroy();
          }).start();
          tween(opacity(n)).to(0.33, {
            opacity: 255
          }).to(0.97, {
            opacity: 0
          }).start();
        }

        // ---------------------------------------------------------------- crowd life
        ;

        _proto.camFlash = function camFlash(side) {
          var _CROWD$side = CROWD[side],
            x0 = _CROWD$side[0],
            x1 = _CROWD$side[1],
            y0 = _CROWD$side[2],
            y1 = _CROWD$side[3];
          var n = sprite('cam', this.fxBack, this.img.get('cam'), 90, 90).node;
          n.setPosition(pos(rnd(x0, x1), rnd(y0, y1 - 120)));
          var o = opacity(n);
          this.anim(380, function (k) {
            var s = k < 0.2 ? 0.3 + 0.7 * k / 0.2 : 1 - 0.4 * (k - 0.2) / 0.8;
            n.setScale(s, s, 1);
            o.opacity = Math.round(255 * (k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8));
          }, function () {
            return n.destroy();
          });
        }
        /** a shouted word over a row (high: above the heads of whoever is talking) */;
        _proto.cheerText = function cheerText(txt, side, color, high) {
          var _CROWD$side2 = CROWD[side],
            x0 = _CROWD$side2[0],
            x1 = _CROWD$side2[1],
            y0 = _CROWD$side2[2];
          var n = text(this.root, txt, {
            size: 34,
            color: color,
            outline: 5,
            drop: true
          }).node;
          n.getComponent(UITransform).setAnchorPoint(0.5, 0.5);
          var x = rnd(x0 + 40, x1 - 40),
            y = high ? rnd(250, 360) : rnd(y0 - 90, y0 + 40);
          var o = opacity(n);
          this.anim(1100, function (k) {
            var e = 1 - (1 - k) * (1 - k); // ease-out
            var s = e < 0.2 ? 0.3 + 0.8 * e / 0.2 : 1.1 - 0.1 * (e - 0.2) / 0.8;
            n.setScale(s, s, 1);
            n.setPosition(pos(x, y - (e < 0.2 ? 0 : 26 * (e - 0.2) / 0.8)));
            o.opacity = Math.round(255 * (e < 0.2 ? e / 0.2 : 1 - (e - 0.2) / 0.8));
          }, function () {
            return n.destroy();
          });
        };
        _proto.crowdOn = function crowdOn(words, colors, high) {
          var _this5 = this;
          if (words === void 0) {
            words = CHEERS;
          }
          if (colors === void 0) {
            colors = [WHITE, GOLD, BLUSH];
          }
          if (high === void 0) {
            high = false;
          }
          this.stopCrowd();
          this.cheering = true;
          var n = 0;
          this.crowdTick = function () {
            var side = n++ % 2 ? 'L' : 'R';
            _this5.camFlash(side);
            if (n % 3 === 0) {
              _this5.camFlash(side === 'L' ? 'R' : 'L');
              if (Math.random() < 0.5) _this5.SFX.shutter();
            }
            if (n % 4 === 1) _this5.cheerText(words[(n >> 2) % words.length], side, colors[n % colors.length], high);
          };
          this.host.schedule(this.crowdTick, 0.17);
        };
        _proto.stopCrowd = function stopCrowd() {
          if (this.crowdTick) this.host.unschedule(this.crowdTick);
          this.crowdTick = null;
          this.cheering = false;
        }

        // ---------------------------------------------------------------- entrance

        /** she glides from the far arch down the carpet to her spot: size follows the carpet's perspective, eased to a soft stop */;
        _proto.walk = function walk(ms) {
          var _this6 = this;
          var w = this.walker,
            s0 = (FAR_Y - HORIZON) / (NEAR_Y - HORIZON);
          w.node.active = true;
          return new Promise(function (done) {
            return _this6.anim(_this6.fast ? ms / 10 : ms, function (t) {
              var u = 1 - Math.pow(1 - t, 2);
              var s = 1 / (1 / s0 + (1 - 1 / s0) * u),
                h = WALK_H * s,
                y = HORIZON + (NEAR_Y - HORIZON) * s;
              var x = FAR_X + (NEAR_X - FAR_X) * (s - s0) / (1 - s0);
              var wd = _this6.setFigure(w, 'chloe-pose', h);
              w.node.setPosition(x - h * 0.2322 + wd / 2 - W / 2, H / 2 - y);
            }, done);
          });
        };
        _proto.walkerCentre = function walkerCentre() {
          var t = this.walker.node.getComponent(UITransform),
            p = this.walker.node.position;
          return [p.x + W / 2, H / 2 - p.y - t.height * 0.55];
        }

        // ---------------------------------------------------------------- sequence
        ;

        _proto.skip = function skip() {
          var _this$hurry;
          this.fast = true;
          this.skipBtn.active = false;
          this.voice.stop();
          this.skipTyping = true;
          (_this$hurry = this.hurry) == null || _this$hurry.call(this);
        };
        _proto.run = /*#__PURE__*/function () {
          var _run = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            var _this7 = this;
            var cheer, sparkle, L, w, R, fr, rt;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  // 1. white from the room's gown sparkle opens on the red carpet: she is far away at the arch, the rows go wild
                  this.state = 'walk';
                  cheer = this.sfx.get('crowd-cheer');
                  if (cheer) {
                    this.cheerSrc.clip = cheer;
                    this.cheerSrc.volume = 0.9;
                    this.cheerSrc.play();
                  }
                  this.crowdOn();
                  fadeTo(this.cover, 0, 0.7);
                  sparkle = function sparkle() {
                    return _this7.stars.apply(_this7, _this7.walkerCentre().concat([2]));
                  };
                  this.host.schedule(sparkle, 0.26);
                  _context2.next = 9;
                  return this.walk(1800);
                case 9:
                  this.host.unschedule(sparkle);
                  if (!this.dead) {
                    _context2.next = 12;
                    break;
                  }
                  return _context2.abrupt("return");
                case 12:
                  // 2. she stops and poses (same picture, same spot: swapped without a blink); the noise settles
                  L = this.slots.L;
                  w = this.setFigure(L, 'chloe-pose', SPR['chloe-gown'].h);
                  L.node.setPosition(SPR['chloe-gown'].left + w / 2 - W / 2, -H / 2 + 90);
                  opacity(L.node).opacity = 255;
                  this.walker.node.active = false;
                  this.stars(250, 760, 18);
                  this.flash(0.5, 200);
                  this.SFX.shutter();
                  this.stopCrowd();
                  this.fadeVol(this.cheerSrc, 1.2, 0.12);
                  _context2.next = 24;
                  return this.wait(700);
                case 24:
                  // 3. Ryan pushes out of the crowd and asks her to dance
                  this.state = 'flirt';
                  this.show('R', 'ryan-smitten', 760);
                  this.SFX.whoosh();
                  this.hearts(520, 330, 8);
                  this.SFX.heart();
                  _context2.next = 31;
                  return this.say('R', 'ryan-dance', 450);
                case 31:
                  // 4. his own words, handed back in front of everyone
                  this.state = 'burn';
                  this.swapFade('L', 'chloe-sass');
                  _context2.next = 35;
                  return this.wait(300);
                case 35:
                  _context2.next = 37;
                  return this.say('L', 'chloe-mirror', 200);
                case 37:
                  this.unsay();
                  this.fadeVol(this.cheerSrc, 0.2, 0);
                  this.show('L', 'chloe-walkaway');
                  this.show('R', 'ryan-burned');
                  this.SFX.burn();
                  this.shake(12, 320);
                  this.play('crowd-ooh', 1);
                  this.crowdOn(['OOOH!', 'HAHAHA!', 'OUCH!'], [GOLD, WHITE], true);
                  this.host.scheduleOnce(function () {
                    return !_this7.dead && _this7.fxText('BURN!', 470, 190, new Color(255, 106, 61, 255));
                  }, 0.15);
                  _context2.next = 48;
                  return this.wait(400);
                case 48:
                  // 5. he freezes cold under everyone's laughter: the hook's last frame, reversed
                  this.state = 'freeze';
                  R = this.slots.R;
                  fr = sprite('frozen', R.node, this.img.get('ryan-burned-frozen'), 10, 10);
                  fr.node.getComponent(UITransform).setAnchorPoint(0.5, 0);
                  rt = R.node.getComponent(UITransform);
                  fr.node.getComponent(UITransform).setContentSize(rt.width, rt.height);
                  opacity(fr.node).opacity = 0;
                  fadeTo(fr.node, 255, 0.6);
                  fadeTo(this.vig, 255, 0.6);
                  tween(L.node).to(0.9, {
                    scale: new Vec3(1.04, 1.04, 1)
                  }, {
                    easing: 'quadOut'
                  }).start();
                  _context2.next = 60;
                  return this.wait(2200);
                case 60:
                  this.stopCrowd();
                  this.state = 'end';
                  this.skipBtn.active = false;
                  this.endCard();
                case 64:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function run() {
            return _run.apply(this, arguments);
          }
          return run;
        }();
        _proto.endCard = function endCard() {
          var _this8 = this;
          var c = node2D('end', this.root, W, H);
          sprite('grad', c, this.img.get('card-grad'), W, H);
          // laid out like the page's bottom-aligned column: title, two lines, the button (tops in stage px)
          var put = function put(lb, top) {
            lb.node.getComponent(UITransform).setAnchorPoint(0.5, 1);
            lb.node.setPosition(pos(360, top));
          };
          put(text(c, 'Glow Up Complete!', {
            size: 64,
            outline: 6,
            drop: true,
            width: 640
          }), 821);
          put(text(c, '"See you at prom, piggy"?', {
            size: 32,
            width: 640,
            lineHeight: 48
          }), 918);
          put(text(c, "Who's laughing now.", {
            size: 32,
            color: AMBER,
            width: 640,
            lineHeight: 48
          }), 966);
          var btn = button(c, 'Play Again', 420, 106, function () {
            return _this8.onAgain();
          }, ROSE, 40);
          btn.setPosition(pos(150, 1064, 420, 106));
          breathe(btn);
          opacity(c).opacity = 0;
          fadeTo(c, 255, 0.5);
        };
        return Ending;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Fx.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Clock.ts', './ui.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, Color, Sprite, UITransform, Graphics, UIOpacity, at, play, ease, op, node2D;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      Sprite = module.Sprite;
      UITransform = module.UITransform;
      Graphics = module.Graphics;
      UIOpacity = module.UIOpacity;
    }, function (module) {
      at = module.at;
      play = module.play;
      ease = module.ease;
      op = module.op;
      var _setter = {};
      _setter.at = module.at;
      _setter.ease = module.ease;
      _setter.op = module.op;
      _setter.play = module.play;
      exports(_setter);
    }, function (module) {
      node2D = module.node2D;
    }],
    execute: function () {
      exports({
        bubble: bubble,
        drop: drop,
        dryerGust: dryerGust,
        fxGfx: fxGfx,
        fxSprite: fxSprite,
        mist: mist,
        repairCloud: repairCloud,
        ring: ring,
        salonCloud: salonCloud,
        smashFx: smashFx,
        sparkle: sparkle,
        sparkleOver: sparkleOver,
        steamPuff: steamPuff,
        streak: streak,
        twinkles: twinkles
      });
      cclegacy._RF.push({}, "ba936ce8lZNg6yuVacwlxig", "Fx", undefined);
      var INK2 = exports('INK2', new Color(59, 43, 43, 255)); // #3b2b2b, the level's outline colour

      /** a picture centred on a stage point */
      function fxSprite(c, frame, x, y, w, h, parent) {
        if (h === void 0) {
          h = w;
        }
        if (parent === void 0) {
          parent = c.root;
        }
        var n = node2D('fx', parent, w, h);
        n.setPosition(at(x, y));
        if (frame) {
          var s = n.addComponent(Sprite);
          s.sizeMode = Sprite.SizeMode.CUSTOM;
          s.spriteFrame = frame;
          n.getComponent(UITransform).setContentSize(w, h);
        }
        return n;
      }
      /** a Graphics node centred on a stage point */
      function fxGfx(c, x, y, parent) {
        if (parent === void 0) {
          parent = c.root;
        }
        var n = node2D('fx', parent);
        n.setPosition(at(x, y));
        return {
          n: n,
          g: n.addComponent(Graphics)
        };
      }
      var kill = function kill(n) {
        return function () {
          return n.isValid && n.destroy();
        };
      };

      // ---------------------------------------------------------------- small particles
      /** soap bubble drifting up (scrubbing, the washer, the bath) */
      function bubble(c, x, y) {
        var r = 8 + Math.random() * 14,
          bx = x + (Math.random() - 0.5) * 30,
          by = y + (Math.random() - 0.5) * 20;
        var n = fxSprite(c, c.fx.get('bubble'), bx, by, r);
        play(c.clock, n, bx, by, [{
          k: 0,
          sx: 0.3,
          sy: 0.3,
          o: 1
        }, {
          k: 1,
          tx: (Math.random() - 0.5) * 30,
          ty: -20 - Math.random() * 30,
          sx: 1,
          sy: 1,
          o: 0
        }], 500 + Math.random() * 300, ease.out, kill(n));
      }

      /** thin twinkles blinking in place over a box (the soft "done" feedback) */
      function twinkles(c, b, n, spread, test, size, vary, big) {
        if (size === void 0) {
          size = 12;
        }
        if (vary === void 0) {
          vary = 10;
        }
        if (big === void 0) {
          big = false;
        }
        var _loop = function _loop(_k) {
          var x = b.x + Math.random() * b.w,
            y = b.y + Math.random() * b.h;
          if (test && !test(x, y)) {
            k = _k;
            return 1;
          } // continue
          _k++;
          var s = size + Math.random() * vary,
            rot = Math.random() * 40 - 20;
          c.clock.after(Math.random() * spread, function () {
            var e = fxSprite(c, c.fx.get(big ? 'star-big' : 'star'), x, y, big ? s * 1.6 : s);
            play(c.clock, e, x, y, [{
              k: 0,
              sx: 0,
              sy: 0,
              r: rot,
              o: 0
            }, {
              k: 0.4,
              sx: 1,
              sy: 1,
              r: rot + 20,
              o: 0.85
            }, {
              k: 1,
              sx: 0.2,
              sy: 0.2,
              r: rot + 45,
              o: 0
            }], 650 + Math.random() * 350, ease.inOut, kill(e));
          });
          k = _k;
        };
        for (var i = 0, k = 0; i < n * 20 && k < n; i++) {
          if (_loop(k)) continue;
        }
      }
      /** a few twinkles over a thing; big: the gown moment (waves of larger, brighter stars) */
      function sparkle(c, l, big) {
        if (big === void 0) {
          big = false;
        }
        var b = {
          x: l.x + l.w * 0.1,
          y: l.y + l.h * 0.05,
          w: l.w * 0.8,
          h: l.h * 0.9
        };
        if (!big) return twinkles(c, b, 3 + Math.round(Math.random() * 2 + l.h / 160), 700);
        twinkles(c, {
          x: b.x - b.w * 0.15,
          y: b.y,
          w: b.w * 1.3,
          h: b.h
        }, 30, 2200, undefined, 20, 18, true);
        twinkles(c, b, 8, 1800, undefined, 40, 20, true);
      }
      /** a big surface just cleaned: a soft light sweeps over it, with gentle twinkles where it is painted */
      function sparkleOver(c, bb, test, ms) {
        if (ms === void 0) {
          ms = 1800;
        }
        // the light: a wide soft band crossing the box (the editor's diagonal sheen at half strength)
        var w = bb.w * 0.6,
          n = fxSprite(c, c.fx.get('glow'), bb.x, bb.y + bb.h / 2, w, bb.h * 1.1);
        n.angle = -15;
        play(c.clock, n, bb.x - w * 0.3, bb.y + bb.h / 2, [{
          k: 0,
          o: 0
        }, {
          k: 0.3,
          tx: bb.w * 0.4,
          o: 0.5
        }, {
          k: 1,
          tx: bb.w * 1.3,
          o: 0
        }], ms * 0.8, ease.inOut, kill(n));
        var want = Math.min(18, Math.max(6, Math.round(bb.w * bb.h / 22000)));
        twinkles(c, bb, want, ms - 900, test);
      }
      /** spray mist puff leaving a nozzle up and to the left */
      function mist(c, x, y) {
        var r = 14 + Math.random() * 22,
          a = -Math.PI * 0.8 + (Math.random() - 0.5) * 0.9,
          d = 30 + Math.random() * 45;
        var n = fxSprite(c, c.fx.get('mist'), x, y, r);
        play(c.clock, n, x, y, [{
          k: 0,
          sx: 0.3,
          sy: 0.3,
          o: 0.95
        }, {
          k: 1,
          tx: Math.cos(a) * d,
          ty: Math.sin(a) * d,
          sx: 1.6,
          sy: 1.6,
          o: 0
        }], 450 + Math.random() * 250, ease.out, kill(n));
      }
      /** a water drop / splash bit */
      function drop(c, x, y, size, kfs, ms) {
        var n = fxSprite(c, c.fx.get('drop'), x, y, size);
        play(c.clock, n, x, y, kfs, ms, ease.linear, kill(n));
        return n;
      }
      /** a streak of water along a path (jets): the capsule picture, rotated along its motion */
      function streak(c, x, y, len, thick) {
        return fxSprite(c, c.fx.get('jet'), x, y, len, thick);
      }
      /** hot steam over a tub: a soft puff or a thin wavy wisp rising and fading */
      function steamPuff(c, l, big) {
        if (big === void 0) {
          big = 1;
        }
        var _ref = l.steamSpan ? String(l.steamSpan).split(',').map(Number) : [0.15, 0.85],
          s0 = _ref[0],
          s1 = _ref[1];
        var x = l.x + l.w * (s0 + Math.random() * (s1 - s0)),
          y = l.y + l.h * 0.1,
          dx = (Math.random() - 0.5) * 26,
          rise = (45 + Math.random() * 30) * big,
          dur = 2400 + Math.random() * 1200;
        var n;
        if (Math.random() < 0.45) {
          // a thin wavy wisp (white, fading at both ends)
          var h = (28 + Math.random() * 18) * big,
            flip = Math.random() < 0.5 ? -1 : 1;
          var _fxGfx = fxGfx(c, x, y - h / 2),
            wn = _fxGfx.n,
            g = _fxGfx.g;
          g.lineWidth = 3;
          g.lineCap = Graphics.LineCap.ROUND;
          var pts = [];
          for (var i = 0; i <= 12; i++) {
            var t = i / 12;
            pts.push([Math.sin(t * Math.PI * 2) * 4 * flip, -h / 2 + t * h]);
          }
          for (var _i = 0; _i < pts.length - 1; _i++) {
            var _t = _i / (pts.length - 1),
              a = _t < 0.35 ? _t / 0.35 * 0.9 : 0.9 * (1 - (_t - 0.35) / 0.65);
            g.strokeColor = new Color(255, 255, 255, Math.round(a * 255));
            g.moveTo(pts[_i][0], pts[_i][1]);
            g.lineTo(pts[_i + 1][0], pts[_i + 1][1]);
            g.stroke();
          }
          n = wn;
        } else {
          var s = (22 + Math.random() * 18) * big;
          n = fxSprite(c, c.fx.get('steam'), x, y, s);
        }
        var bx = n.position.x + 360,
          by = 640 - n.position.y; // where it was placed (the wisp is centred above its foot)
        play(c.clock, n, bx, by, [{
          k: 0,
          sx: 0.7,
          sy: 0.7,
          o: 0
        }, {
          k: 0.35,
          tx: dx * 0.35,
          ty: -rise * 0.3,
          sx: 1,
          sy: 1,
          o: 0.85
        }, {
          k: 1,
          tx: dx,
          ty: -rise,
          sx: 1.5,
          sy: 1.8,
          o: 0
        }], dur, ease.inOut, kill(n));
      }

      // ---------------------------------------------------------------- clouds and tools at work
      /** a puffy cloud drawn as overlapping circles with one dark outline around the whole: the ink circles first
       *  (each a little bigger), then the fills on top */
      function cloudPuffs(g, puffs, fill, line, lw, lite) {
        g.clear();
        g.fillColor = line;
        for (var _iterator = _createForOfIteratorHelperLoose(puffs), _step; !(_step = _iterator()).done;) {
          var _step$value = _step.value,
            _x2 = _step$value[0],
            _y2 = _step$value[1],
            _r = _step$value[2];
          g.circle(_x2, _y2, _r + lw);
          g.fill();
        }
        g.fillColor = fill;
        for (var _iterator2 = _createForOfIteratorHelperLoose(puffs), _step2; !(_step2 = _iterator2()).done;) {
          var _step2$value = _step2.value,
            _x3 = _step2$value[0],
            _y3 = _step2$value[1],
            _r2 = _step2$value[2];
          g.circle(_x3, _y3, _r2);
          g.fill();
        }
        if (lite) {
          g.fillColor = lite;
          for (var _iterator3 = _createForOfIteratorHelperLoose(puffs), _step3; !(_step3 = _iterator3()).done;) {
            var _step3$value = _step3.value,
              _x = _step3$value[0],
              _y = _step3$value[1],
              r = _step3$value[2];
            g.circle(_x - r * 0.16, _y + r * 0.2, r * 0.74);
            g.fill();
          }
        }
      }

      /** cartoon repair scuffle: a bouncing white smoke ball hides the spot, the tool and stars pop out of it while it
       *  shakes, then it bursts into wisps and the spot is fixed underneath */
      function repairCloud(c, tool, bb, ms) {
        var cx = bb.x + bb.w / 2,
          cy = bb.y + bb.h / 2,
          R = Math.max(48, Math.max(bb.w, bb.h) * 0.62);
        var wrap = node2D('cloud', c.root);
        wrap.setPosition(at(cx, cy));
        var body = node2D('body', wrap),
          g = body.addComponent(Graphics);
        var P_ = [[0, 0, 1], [-0.55, -0.18, 0.72], [0.55, -0.14, 0.74], [-0.28, -0.52, 0.64], [0.3, -0.5, 0.62], [-0.62, 0.3, 0.62], [0.6, 0.32, 0.64], [0, 0.46, 0.72], [0.02, -0.72, 0.5]];
        var ph = P_.map(function () {
          return [220 + Math.random() * 160, Math.random() * 300];
        });
        var bursting = 0;
        var draw = c.clock.anim(100000, function () {
          var t = c.clock.now;
          var puffs = P_.map(function (_ref2, i) {
            var ox = _ref2[0],
              oy = _ref2[1],
              f = _ref2[2];
            var _ph$i = ph[i],
              d = _ph$i[0],
              dl = _ph$i[1],
              u = (t + dl) % (2 * d) / d,
              s = 0.86 + 0.28 * ease.inOut(u < 1 ? u : 2 - u);
            var b = bursting ? Math.min(1, (t - bursting) / 380) : 0;
            return [ox * R + ox * R * 0.9 * b, -(oy * R + (oy * R * 0.9 - 10) * b), R * 0.62 * f * s * (1 + 0.35 * b)];
          });
          cloudPuffs(g, puffs, new Color(248, 248, 250, 255), INK2, 3);
          // the shake
          if (!bursting) body.setPosition([-3, 3, -2, 0][Math.floor(t / 40) % 4], [2, -2, -3, 0][Math.floor(t / 40) % 4]);
        }, undefined);
        play(c.clock, wrap, cx, cy, [{
          k: 0,
          sx: 0,
          sy: 0
        }, {
          k: 0.7,
          sx: 1.15,
          sy: 1.15
        }, {
          k: 1,
          sx: 1,
          sy: 1
        }], 220, ease.out);
        var pop = c.clock.every(130, function () {
          var a = Math.random() * Math.PI * 2,
            isTool = Math.random() < 0.45,
            s = isTool ? 42 : 18 + Math.random() * 12;
          var x0 = cx + Math.cos(a) * R * 0.5,
            y0 = cy + Math.sin(a) * R * 0.5;
          var e = fxSprite(c, isTool ? tool : c.fx.get('star'), x0, y0, s);
          var d = R * (0.75 + Math.random() * 0.35),
            spin = (Math.random() < 0.5 ? -1 : 1) * (200 + Math.random() * 200);
          play(c.clock, e, x0, y0, [{
            k: 0,
            sx: 0.6,
            sy: 0.6,
            o: 1
          }, {
            k: 0.7,
            tx: Math.cos(a) * d * 0.7,
            ty: Math.sin(a) * d * 0.7,
            r: spin * 0.7,
            sx: 1,
            sy: 1,
            o: 1
          }, {
            k: 1,
            tx: Math.cos(a) * d,
            ty: Math.sin(a) * d,
            r: spin,
            sx: 0.8,
            sy: 0.8,
            o: 0
          }], 380, ease.out, kill(e));
        });
        c.clock.after(Math.max(600, ms - 420), function () {
          pop.stop();
          bursting = c.clock.now;
          play(c.clock, body, 0, 0, [{
            k: 0,
            o: 1
          }, {
            k: 1,
            o: 0
          }], 380, ease.out);
          body.setPosition(0, 0);
          c.clock.after(400, function () {
            draw.stop();
            wrap.destroy();
          });
          sparkle(c, {
            x: cx - 40,
            y: cy - 30,
            w: 80,
            h: 60
          });
        });
      }
      var heartPath = function heartPath(g, s) {
        // the editor's heart (20x18 viewBox) scaled to s, centred
        var k = s / 20;
        var P = function P(x, y) {
          return [(x - 10) * k, -(y - 9) * k];
        };
        g.moveTo.apply(g, P(10, 17));
        g.bezierCurveTo.apply(g, P(-6, 7).concat(P(3, -4), P(10, 4)));
        g.bezierCurveTo.apply(g, P(17, -4).concat(P(26, 7), P(10, 17)));
        g.close();
      };

      /** salon cloud: a soft pink-white cel-shaded cloud breathes over the head while the comb brushes down its side and
       *  the scissors snip on the other; hearts, sparkles and little curls drift up; it melts away on the new hairdo */
      function salonCloud(c, comb, scissors, bb, ms, onEnd) {
        var cx = bb.x + bb.w / 2,
          cy = bb.y + bb.h * 0.4,
          R = Math.max(50, Math.max(bb.w, bb.h) * 0.54);
        var wrap = node2D('salon', c.root);
        wrap.setPosition(at(cx, cy));
        var body = node2D('body', wrap),
          g = body.addComponent(Graphics);
        var swirlN = node2D('swirl', body),
          sg = swirlN.addComponent(Graphics);
        var P_ = [[0, 0, 1], [-0.58, -0.12, 0.7], [0.58, -0.1, 0.72], [-0.3, -0.5, 0.66], [0.32, -0.48, 0.64], [-0.6, 0.32, 0.6], [0.6, 0.34, 0.62], [0, 0.46, 0.7], [0, -0.72, 0.5], [-0.82, 0.1, 0.42], [0.84, 0.12, 0.44]];
        var ph = P_.map(function () {
          return [800 + Math.random() * 500, Math.random() * 900];
        });
        var melting = 0;
        var SHADE = new Color(249, 225, 235, 255),
          LINE = new Color(233, 143, 178, 255),
          LITE = new Color(255, 250, 252, 255);
        var draw = c.clock.anim(100000, function () {
          var t = c.clock.now,
            m = melting ? Math.min(1, (t - melting) / 700) : 0;
          var puffs = P_.map(function (_ref3, i) {
            var ox = _ref3[0],
              oy = _ref3[1],
              f = _ref3[2];
            var _ph$i2 = ph[i],
              d = _ph$i2[0],
              dl = _ph$i2[1],
              u = (t + dl) % (2 * d) / d,
              s = 0.93 + 0.14 * ease.inOut(u < 1 ? u : 2 - u);
            return [ox * R + ox * R * 0.45 * m, -(oy * R + (oy * R * 0.45 - 14) * m), R * 0.6 * f * s * (1 + 0.3 * m)];
          });
          cloudPuffs(g, puffs, SHADE, LINE, 2, LITE);
          // two slow swirls drawn on the smoke
          sg.clear();
          sg.lineWidth = 1.5;
          sg.strokeColor = new Color(243, 195, 213, 150);
          for (var _i2 = 0, _arr = [[-0.28, -0.05, 0.3, 1], [0.3, 0.2, 0.24, -1]]; _i2 < _arr.length; _i2++) {
            var _arr$_i = _arr[_i2],
              sx = _arr$_i[0],
              sy = _arr$_i[1],
              sz = _arr$_i[2],
              dir = _arr$_i[3];
            var w = R * sz,
              a0 = t / 2400 * Math.PI * 2 * dir % (Math.PI * 2),
              x0 = sx * R,
              y0 = -sy * R;
            for (var i = 0; i < 24; i++) {
              var a = a0 + i / 24 * Math.PI * 1.6,
                r = w * (1 - i / 24 * 0.55);
              var px = x0 + Math.cos(a) * r,
                py = y0 + Math.sin(a) * r;
              if (i === 0) sg.moveTo(px, py);else sg.lineTo(px, py);
            }
            sg.stroke();
          }
          if (!melting) {
            body.setPosition(0, Math.sin(t / 900 * Math.PI * 2) * 3);
            body.angle = Math.sin(t / 900 * Math.PI * 2 + 1) * 1.5;
          }
        });
        play(c.clock, wrap, cx, cy, [{
          k: 0,
          sx: 0,
          sy: 0,
          o: 0
        }, {
          k: 0.7,
          sx: 1.06,
          sy: 1.06,
          o: 1
        }, {
          k: 1,
          sx: 1,
          sy: 1,
          o: 1
        }], 380, ease.out);
        var wisp = function wisp(big) {
          if (big === void 0) {
            big = 1;
          }
          // a little two-tone smoke puff leaves the edge and fades
          var a = Math.random() * Math.PI * 2,
            r = R * (0.14 + Math.random() * 0.1) * big;
          var x0 = Math.cos(a) * R * 0.8,
            y0 = Math.sin(a) * R * 0.75;
          var n = node2D('wisp', c.root),
            wg = n.addComponent(Graphics);
          n.setSiblingIndex(wrap.getSiblingIndex()); // behind the cloud
          wg.fillColor = LINE;
          wg.circle(0, 0, r + 1.5);
          wg.fill();
          wg.fillColor = SHADE;
          wg.circle(0, 0, r);
          wg.fill();
          wg.fillColor = LITE;
          wg.circle(-r * 0.1, r * 0.2, r * 0.68);
          wg.fill();
          var d = R * (0.35 + Math.random() * 0.35) * big;
          play(c.clock, n, cx + x0, cy + y0, [{
            k: 0,
            sx: 0.6,
            sy: 0.6,
            o: 0.95
          }, {
            k: 1,
            tx: Math.cos(a) * d,
            ty: Math.sin(a) * d - 14,
            sx: 1.3,
            sy: 1.3,
            o: 0
          }], 900 + Math.random() * 400, ease.out, kill(n));
        };
        var wisps = c.clock.every(160, function () {
          return wisp();
        });
        var T = R * 0.92;
        var toolNode = function toolNode(f, w, kfs, dur, delay) {
          if (!f) return null;
          var n = fxSprite(c, f, cx, cy, w),
            o = op(n);
          o.opacity = 0;
          c.clock.after(delay, function () {
            c.clock.anim(250, function (k) {
              return o.opacity = Math.round(255 * k);
            });
            play(c.clock, n, cx, cy, kfs, dur, ease.inOut, undefined, true);
          });
          return n;
        };
        var comb2 = toolNode(comb, 64, [{
          k: 0,
          tx: T,
          ty: -R * 0.45,
          r: -30
        }, {
          k: 0.5,
          tx: T * 0.9,
          ty: R * 0.35,
          r: -10
        }, {
          k: 1,
          tx: T,
          ty: -R * 0.45,
          r: -30
        }], 650, 120);
        var sc = toolNode(scissors, 56, [{
          k: 0,
          tx: -T,
          ty: -R * 0.25,
          r: 20
        }, {
          k: 0.5,
          tx: -T * 1.02,
          ty: -R * 0.22,
          r: -6
        }, {
          k: 1,
          tx: -T,
          ty: -R * 0.25,
          r: 20
        }], 300, 300);
        var _float = c.clock.every(140, function () {
          // hearts, sparkles and a little curl drift up out of the cloud
          var kind = Math.random(),
            x = cx + (Math.random() - 0.5) * R * 1.4,
            y = cy - R * 0.4 + (Math.random() - 0.5) * R * 0.4;
          var n;
          var sz = kind < 0.45 ? 14 + Math.random() * 8 : 12 + Math.random() * 8;
          if (kind < 0.8 && kind >= 0.45) n = fxSprite(c, c.fx.get('star'), x, y, sz);else {
            var f = fxGfx(c, x, y);
            n = f.n;
            if (kind < 0.45) {
              f.g.fillColor = new Color(255, 143, 184, 255);
              f.g.strokeColor = new Color(224, 98, 143, 255);
              f.g.lineWidth = 1.3;
              heartPath(f.g, sz);
              f.g.fill();
              heartPath(f.g, sz);
              f.g.stroke();
            } else {
              f.g.strokeColor = new Color(232, 130, 63, 255);
              f.g.lineWidth = 1.8;
              var k = sz / 12;
              f.g.arc(0, 0, 4 * k, 0, Math.PI * 1.6, false);
              f.g.stroke();
            }
          }
          var dx = (Math.random() - 0.5) * 30,
            rise = 40 + Math.random() * 30;
          play(c.clock, n, x, y, [{
            k: 0,
            sx: 0.4,
            sy: 0.4,
            o: 0
          }, {
            k: 0.35,
            tx: dx * 0.4,
            ty: -rise * 0.4,
            sx: 1,
            sy: 1,
            o: 1
          }, {
            k: 1,
            tx: dx,
            ty: -rise,
            sx: 0.9,
            sy: 0.9,
            r: dx,
            o: 0
          }], 1100 + Math.random() * 400, ease.out, kill(n));
        });
        c.clock.after(Math.max(800, ms - 700), function () {
          // melt away softly onto the new hairdo
          _float.stop();
          wisps.stop();
          var _loop2 = function _loop2() {
            var t = _arr2[_i3];
            if (t) {
              var _o = op(t);
              c.clock.anim(300, function (k) {
                return _o.opacity = Math.round(255 * (1 - k));
              });
            }
          };
          for (var _i3 = 0, _arr2 = [comb2, sc]; _i3 < _arr2.length; _i3++) {
            _loop2();
          }
          melting = c.clock.now;
          var o = op(body);
          c.clock.anim(700, function (k) {
            return o.opacity = Math.round(255 * (1 - ease["in"](k)));
          });
          for (var k = 0; k < 10; k++) wisp(1.5);
          sparkle(c, {
            x: bb.x,
            y: bb.y - 10,
            w: bb.w,
            h: bb.h
          });
          c.clock.after(680, function () {
            draw.stop();
            wrap.destroy();
            for (var _i4 = 0, _arr3 = [comb2, sc]; _i4 < _arr3.length; _i4++) {
              var t = _arr3[_i4];
              if (t && t.isValid) t.destroy();
            }
            onEnd == null || onEnd();
          });
        });
      }

      /** hammer smash: a big copy of the hammer pivots on its grip so the head lands on the spot, winds up and hits it
       *  twice — the first hit shakes the target and chips a few shards off, the second breaks it: an impact star, glass
       *  shards and pink splinters fly out and fall. The broken picture itself comes from the step's "sets". */
      function smashFx(c, hammer, lw, lh, grip, face, bb, ms, target) {
        var I = [bb.x + bb.w / 2, bb.y + bb.h * 0.4];
        var w = lw * 1.5,
          h = lh * 1.5,
          gx = grip[0],
          gy = grip[1],
          fx = face[0],
          fy = face[1];
        var hit = -8,
          rad = function rad(d) {
            return d * Math.PI / 180;
          },
          vx = (fx - gx) * w,
          vy = (fy - gy) * h;
        var Gx = I[0] - (vx * Math.cos(rad(hit)) - vy * Math.sin(rad(hit))),
          Gy = I[1] - (vx * Math.sin(rad(hit)) + vy * Math.cos(rad(hit)));
        // pivot node at the grip; the picture inside is offset so the grip sits on the pivot
        var piv = node2D('hammer', c.root);
        var pic = fxSprite(c, hammer, 0, 0, w, h, piv);
        pic.setPosition((0.5 - gx) * w, -(0.5 - gy) * h);
        var t1 = ms * 0.34,
          t2 = ms * 0.56;
        play(c.clock, piv, Gx, Gy, [{
          k: 0,
          r: 40,
          sx: 0,
          sy: 0
        }, {
          k: 0.08,
          r: 46,
          sx: 1.08,
          sy: 1.08
        }, {
          k: 0.26,
          r: 62,
          sx: 1,
          sy: 1,
          e: function e(t) {
            return t * t * t;
          }
        }, {
          k: t1 / ms,
          r: hit
        }, {
          k: (t1 + 90) / ms,
          r: 18,
          e: ease.out
        }, {
          k: (t2 - 80) / ms,
          r: 55,
          e: function e(t) {
            return t * t * t;
          }
        }, {
          k: t2 / ms,
          r: hit - 4
        }, {
          k: (t2 + 110) / ms,
          r: 10,
          e: ease.out
        }, {
          k: 0.86,
          r: 22,
          sx: 0.9,
          sy: 0.9,
          o: 1
        }, {
          k: 1,
          r: 30,
          sx: 0.7,
          sy: 0.7,
          o: 0
        }], ms, ease.linear, kill(piv));
        var shake = function shake(big) {
          if (!target || !target.isValid) return;
          var p = target.position.clone(),
            a0 = target.angle;
          var seq = big ? [[-5, 2, -3], [4, -1, 2.5], [-2, 1, -1], [0, 0, 0]] : [[-3, 2, -1.5], [2, -1, 1], [-2, 1, -1], [0, 0, 0]];
          seq.forEach(function (_ref4, i) {
            var x = _ref4[0],
              y = _ref4[1],
              r = _ref4[2];
            return c.clock.after((i + 1) * (big ? 320 : 220) / 5, function () {
              if (!target.isValid) return;
              target.setPosition(p.x + x, p.y - y);
              target.angle = a0 - r;
            });
          });
        };
        var shard = function shard(glass) {
          var s = glass ? 7 + Math.random() * 10 : 5 + Math.random() * 6,
            x0 = I[0] + (Math.random() - 0.5) * 20,
            y0 = I[1] + (Math.random() - 0.5) * 20;
          var _fxGfx2 = fxGfx(c, x0, y0),
            n = _fxGfx2.n,
            g = _fxGfx2.g;
          var k = s / 12,
            P = function P(x, y) {
              return [(x - 6) * k, -(y - 6) * k];
            };
          var pts = glass ? [P(Math.random() * 4, 2 + Math.random() * 6), P(10 + Math.random() * 2, 0), P(4 + Math.random() * 8, 12)] : [P(0, 4), P(12, 0), P(12, 3), P(1, 7)];
          g.fillColor = glass ? new Color(230, 246, 255, 255) : new Color(242, 163, 189, 255);
          g.strokeColor = INK2;
          g.lineWidth = 1.3;
          g.lineJoin = Graphics.LineJoin.ROUND;
          g.moveTo.apply(g, pts[0]);
          for (var _iterator4 = _createForOfIteratorHelperLoose(pts.slice(1)), _step4; !(_step4 = _iterator4()).done;) {
            var p = _step4.value;
            g.lineTo.apply(g, p);
          }
          g.close();
          g.fill();
          g.stroke();
          var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6,
            v = 60 + Math.random() * 90,
            spin = (Math.random() - 0.5) * 900,
            dur = 650 + Math.random() * 350;
          var kfs = [];
          for (var i = 0; i <= 6; i++) {
            var u = i / 6;
            kfs.push({
              k: u,
              tx: Math.cos(a) * v * u * 1.2,
              ty: Math.sin(a) * v * u + 260 * u * u,
              r: spin * u,
              o: u > 0.8 ? (1 - u) * 5 : 1
            });
          }
          play(c.clock, n, x0, y0, kfs, dur, ease.linear, kill(n));
        };
        var pow = function pow(size) {
          // a white spiky impact star with little speed lines around it
          var _fxGfx3 = fxGfx(c, I[0], I[1]),
            n = _fxGfx3.n,
            g = _fxGfx3.g;
          var k = size / 100;
          g.fillColor = Color.WHITE;
          g.strokeColor = INK2;
          g.lineWidth = 4 * k;
          g.lineJoin = Graphics.LineJoin.ROUND;
          for (var i = 0; i < 20; i++) {
            var ang = i / 20 * Math.PI * 2,
              rr = (i % 2 ? 22 : 48 + Math.random() * 10) * k;
            if (i) g.lineTo(Math.cos(ang) * rr, -Math.sin(ang) * rr);else g.moveTo(Math.cos(ang) * rr, -Math.sin(ang) * rr);
          }
          g.close();
          g.fill();
          g.stroke();
          g.fillColor = new Color(255, 246, 194, 255);
          g.circle(0, 0, 13 * k);
          g.fill();
          g.lineWidth = 4 * k;
          g.lineCap = Graphics.LineCap.ROUND;
          for (var _i5 = 0; _i5 < 8; _i5++) {
            var _ang = _i5 / 8 * Math.PI * 2 + 0.2;
            g.moveTo(Math.cos(_ang) * 62 * k, -Math.sin(_ang) * 62 * k);
            g.lineTo(Math.cos(_ang) * 78 * k, -Math.sin(_ang) * 78 * k);
            g.stroke();
          }
          play(c.clock, n, I[0], I[1], [{
            k: 0,
            sx: 0.2,
            sy: 0.2,
            o: 1
          }, {
            k: 0.35,
            sx: 1.1,
            sy: 1.1,
            r: 8,
            o: 1
          }, {
            k: 1,
            sx: 1.25,
            sy: 1.25,
            r: 12,
            o: 0
          }], 300, ease.out, kill(n));
        };
        c.clock.after(t1, function () {
          shake(false);
          pow(44);
          for (var i = 0; i < 4; i++) shard(true);
        });
        c.clock.after(t2, function () {
          shake(true);
          pow(76);
          for (var i = 0; i < 14; i++) shard(true);
          for (var _i6 = 0; _i6 < 5; _i6++) shard(false);
          twinkles(c, {
            x: I[0] - 50,
            y: I[1] - 40,
            w: 100,
            h: 70
          }, 4, 150, undefined, 16, 8);
        });
      }

      /** hair dryer at work: wavy warm gusts and little heat curls blowing out of the nozzle (called every ~55 ms) */
      function dryerGust(c, px, py) {
        var _loop3 = function _loop3() {
          var len = 46 + Math.random() * 30,
            x0 = px - len / 2,
            y0 = py + (Math.random() - 0.5) * 26;
          var _fxGfx5 = fxGfx(c, x0, y0),
            n = _fxGfx5.n,
            g = _fxGfx5.g;
          g.lineWidth = 3.6;
          g.lineCap = Graphics.LineCap.ROUND;
          // a gradient stroke: fades in from the left, strong at 40%, a little weaker at the right
          var seg = 14;
          for (var s = 0; s < seg; s++) {
            var t0 = s / seg,
              t1 = (s + 1) / seg,
              a = t0 < 0.4 ? t0 / 0.4 : 1 - (t0 - 0.4) / 0.6 * 0.65;
            g.strokeColor = new Color(255, 255, 255, Math.round(a * 255));
            var X = function X(t) {
                return -len / 2 + t * len;
              },
              Y = function Y(t) {
                return Math.sin(t * Math.PI * 4) * 2.5;
              };
            g.moveTo(X(t0), Y(t0));
            g.lineTo(X(t1), Y(t1));
            g.stroke();
          }
          // a warm glow under it, like the editor's orange drop-shadow
          n.setSiblingIndex(n.parent.children.length - 1);
          var dy = (Math.random() - 0.5) * 16;
          play(c.clock, n, x0, y0, [{
            k: 0,
            tx: 20,
            sx: 0.4,
            o: 0
          }, {
            k: 0.3,
            tx: -10,
            ty: dy * 0.4,
            sx: 1,
            o: 1
          }, {
            k: 1,
            tx: -45 - Math.random() * 30,
            ty: dy,
            sx: 1.15,
            o: 0
          }], 420 + Math.random() * 120, ease.out, kill(n));
        };
        for (var i = 0; i < 3; i++) {
          _loop3();
        }
        if (Math.random() < 0.5) {
          var x0 = px - 10,
            y0 = py + (Math.random() - 0.5) * 20;
          var _fxGfx4 = fxGfx(c, x0, y0),
            n = _fxGfx4.n,
            g = _fxGfx4.g;
          g.strokeColor = Color.WHITE;
          g.lineWidth = 2;
          g.arc(0, 0, 4, 0, Math.PI * 1.6, false);
          g.stroke();
          play(c.clock, n, x0, y0, [{
            k: 0,
            sx: 0.5,
            sy: 0.5,
            o: 0
          }, {
            k: 0.4,
            tx: -24,
            ty: -6 - Math.random() * 8,
            r: -200,
            sx: 1,
            sy: 1,
            o: 0.9
          }, {
            k: 1,
            tx: -55,
            ty: -14 - Math.random() * 10,
            r: -420,
            sx: 1.2,
            sy: 1.2,
            o: 0
          }], 600, ease.out, kill(n));
        }
      }

      /** a progress ring (the bath tap held down): white rim, blue arc filling clockwise */
      function ring(c, x, y, size) {
        var _fxGfx6 = fxGfx(c, x, y),
          n = _fxGfx6.n,
          g = _fxGfx6.g;
        var draw = function draw(p) {
          var r = size / 2;
          g.clear();
          g.fillColor = new Color(255, 255, 255, 153);
          g.circle(0, 0, r);
          g.fill();
          if (p > 0) {
            g.fillColor = new Color(79, 179, 240, 255);
            g.moveTo(0, 0);
            g.arc(0, 0, r, Math.PI / 2, Math.PI / 2 - p * Math.PI * 2, false);
            g.close();
            g.fill();
          }
          g.lineWidth = 3;
          g.strokeColor = Color.WHITE;
          g.circle(0, 0, r);
          g.stroke();
        };
        draw(0);
        return {
          n: n,
          draw: draw
        };
      }
      var destroyLater = exports('destroyLater', kill);
      var uiOpacity = exports('uiOpacity', function uiOpacity(n) {
        return n.getComponent(UIOpacity) || n.addComponent(UIOpacity);
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GfxOpacity.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function () {
  var _createForOfIteratorHelperLoose, cclegacy, Graphics, director, Director, Mask, Color, UIOpacity;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      Graphics = module.Graphics;
      director = module.director;
      Director = module.Director;
      Mask = module.Mask;
      Color = module.Color;
      UIOpacity = module.UIOpacity;
    }],
    execute: function () {
      cclegacy._RF.push({}, "2fe0ftFec9Ac7WTA5Nl9b+a", "GfxOpacity", undefined);
      var P = Graphics.prototype;
      var PATH = ['moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo', 'arc', 'ellipse', 'circle', 'rect', 'roundRect', 'close'];
      var live = new Set();
      var depth = 0; // a shape built from other path calls is recorded once
      var _loop = function _loop() {
        var m = _arr[_i];
        var orig = P[m];
        P[m] = function () {
          for (var _len = arguments.length, a = new Array(_len), _key = 0; _key < _len; _key++) {
            a[_key] = arguments[_key];
          }
          if (!depth && !this.__replay) {
            var rec = m === 'fill' ? this.fillColor.clone() : m === 'stroke' ? [this.strokeColor.clone(), this.lineWidth, this.lineCap, this.lineJoin] : null;
            (this.__cmds || (this.__cmds = [])).push([m, a, rec]);
            if (!this.__alpha) this.__alpha = 1;
            live.add(this);
          }
          depth++;
          try {
            return orig.apply(this, a);
          } finally {
            depth--;
          }
        };
      };
      for (var _i = 0, _arr = [].concat(PATH, ['fill', 'stroke']); _i < _arr.length; _i++) {
        _loop();
      }
      var clear = P.clear;
      P.clear = function () {
        if (!this.__replay) {
          this.__cmds = [];
          this.__alpha = 1;
        }
        for (var _len2 = arguments.length, a = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          a[_key2] = arguments[_key2];
        }
        return clear.apply(this, a);
      };
      var scaled = function scaled(c, k) {
        return new Color(c.r, c.g, c.b, Math.round(c.a * k));
      };
      function replay(g, k) {
        g.__replay = true;
        clear.call(g);
        for (var _iterator = _createForOfIteratorHelperLoose(g.__cmds), _step; !(_step = _iterator()).done;) {
          var _step$value = _step.value,
            m = _step$value[0],
            a = _step$value[1],
            rec = _step$value[2];
          if (m === 'fill') {
            g.fillColor = scaled(rec, k);
            g.fill();
          } else if (m === 'stroke') {
            g.strokeColor = scaled(rec[0], k);
            g.lineWidth = rec[1];
            g.lineCap = rec[2];
            g.lineJoin = rec[3];
            g.stroke();
          } else g[m].apply(g, a);
        }
        g.__replay = false;
        g.__alpha = k;
      }
      function opacityOf(n) {
        var k = 1;
        for (; n; n = n.parent) {
          var o = n.getComponent(UIOpacity);
          if (o) k *= o.opacity / 255;
        }
        return k;
      }
      director.on(Director.EVENT_AFTER_UPDATE, function () {
        for (var _iterator2 = _createForOfIteratorHelperLoose(live), _step2; !(_step2 = _iterator2()).done;) {
          var _g$__cmds;
          var g = _step2.value;
          if (!g.isValid) {
            live["delete"](g);
            continue;
          }
          if (!g.node.activeInHierarchy || !((_g$__cmds = g.__cmds) != null && _g$__cmds.length) || g.node.getComponent(Mask)) continue;
          var k = opacityOf(g.node);
          if (Math.abs(k - g.__alpha) * 255 >= 1) replay(g, k);
        }
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Hook.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './ui.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, _asyncToGenerator, _regeneratorRuntime, cclegacy, UITransform, Tween, tween, Vec3, Color, Node, Graphics, AudioSource, Label, W, fadeTo, ROSE, H, opacity, text, pos, node2D, sprite, button, breathe, AMBER, INK, CREAM, LAV, PINK;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      UITransform = module.UITransform;
      Tween = module.Tween;
      tween = module.tween;
      Vec3 = module.Vec3;
      Color = module.Color;
      Node = module.Node;
      Graphics = module.Graphics;
      AudioSource = module.AudioSource;
      Label = module.Label;
    }, function (module) {
      W = module.W;
      fadeTo = module.fadeTo;
      ROSE = module.ROSE;
      H = module.H;
      opacity = module.opacity;
      text = module.text;
      pos = module.pos;
      node2D = module.node2D;
      sprite = module.sprite;
      button = module.button;
      breathe = module.breathe;
      AMBER = module.AMBER;
      INK = module.INK;
      CREAM = module.CREAM;
      LAV = module.LAV;
      PINK = module.PINK;
    }],
    execute: function () {
      cclegacy._RF.push({}, "39ffeS3OIJAYJTZjZQfWl41", "Hook", undefined);

      /** sprite heights and resting x (stage px); feet stand on bottom: 90 */
      var SPR = {
        'chloe-confess': {
          h: 600,
          left: 10
        },
        'chloe-rejected': {
          h: 600,
          left: 30
        },
        'chloe-empty': {
          h: 600,
          left: 30
        },
        'chloe-crying': {
          h: 600,
          left: 30
        },
        'ryan-phone': {
          h: 760,
          left: 430
        },
        'ryan-sneer': {
          h: 760,
          left: 420
        },
        'tiffany-strut': {
          h: 740,
          left: 385
        },
        'couple-hug': {
          h: 760,
          left: 205
        },
        'couple-mock': {
          h: 760,
          left: 215
        }
      };
      var LINES = {
        'chloe-confess': "R-Ryan... I've liked you for a really long time! I baked these heart cookies myself... would you try one?",
        'ryan-reject': 'You? Ha. Have you even looked in a mirror lately?',
        'tiffany-enter': "Babe, who are you even talking to? Ew, isn't that the fat girl?",
        'tiffany-mock1': "Homemade cookies? No wonder you're so fat!",
        'ryan-mock': "Even a dog wouldn't eat this junk.",
        'tiffany-mock2': "See you at prom, piggy! Don't forget to eat up!",
        'chloe-cry': 'Why... I just... I just liked you...'
      };
      var HOOK_IMAGES = exports('HOOK_IMAGES', [].concat(Object.keys(SPR), ['box-closed', 'cookies-spilled', 'bg', 'bg-cold', 'vignette', 'grad-end']));
      var HOOK_SOUNDS = exports('HOOK_SOUNDS', ['whoosh', 'snatch', 'blip', 'heart', 'break', 'hit', 'crash', 'thud', 'shutter', 'sting', 'tap', 'chloe-gasp', 'chloe-sob', 'ryan-laugh', 'tiffany-laugh'].concat(Object.keys(LINES).map(function (k) {
        return 'v-' + k;
      })));
      var Hook = exports('Hook', /*#__PURE__*/function () {
        function Hook(parent, host, img, sfx, onDone) {
          var _this = this;
          this.root = void 0;
          this.slots = void 0;
          this.bg = void 0;
          this.bgCold = void 0;
          this.vig = void 0;
          this.bubble = null;
          this.flashNode = void 0;
          this.fxG = void 0;
          this.parts = [];
          this.box = void 0;
          this.spill = void 0;
          this.skipBtn = void 0;
          this.hurry = null;
          this.skipTyping = false;
          this.aborted = false;
          this.voice = void 0;
          this.laughs = [];
          this.SFX = {
            blip: function blip() {
              return _this.play('blip', 0.25);
            },
            whoosh: function whoosh() {
              return _this.play('whoosh', 0.7);
            },
            heart: function heart() {
              return _this.play('heart', 0.6);
            },
            "break": function _break() {
              _this.play('hit', 0.8);
              _this.play('break', 0.7, 0.05);
              _this.play('chloe-gasp', 1, 0.1);
            },
            snatch: function snatch() {
              return _this.play('snatch', 0.9);
            },
            crash: function crash() {
              _this.play('thud', 1);
              _this.play('crash', 0.8, 0.04);
            },
            shutter: function shutter() {
              return _this.play('shutter', 0.9);
            },
            laugh: function laugh() {
              _this.play('ryan-laugh', 0.85, 0, 4.5, _this.laughs[0]);
              _this.play('tiffany-laugh', 0.8, 0.15, 3.3, _this.laughs[1]);
            },
            sob: function sob() {
              return _this.play('chloe-sob', 0.7, 0.3);
            },
            sting: function sting() {
              return _this.play('sting', 0.8);
            }
          };
          this.leaving = false;
          this.host = host;
          this.img = img;
          this.sfx = sfx;
          this.onDone = onDone;
          this.root = node2D('Hook', parent, W, H);
          this.bg = sprite('bg', this.root, img.get('bg'), W, H);
          this.bgCold = sprite('bgCold', this.root, img.get('bg-cold'), W, H);
          opacity(this.bgCold.node).opacity = 0;
          this.spill = sprite('spill', this.root, img.get('cookies-spilled'), 440, 198);
          opacity(this.spill.node).opacity = 0;
          var slot = function slot(n) {
            var s = sprite(n, _this.root, img.get('chloe-confess'), 10, 10);
            s.node.getComponent(UITransform).setAnchorPoint(0.5, 0);
            opacity(s.node).opacity = 0;
            return s;
          };
          var R = slot('R'),
            R2 = slot('R2');
          this.box = sprite('box', this.root, img.get('box-closed'), 170, 163);
          opacity(this.box.node).opacity = 0;
          this.slots = {
            R: R,
            R2: R2,
            L: slot('L')
          };
          this.vig = sprite('vig', this.root, img.get('vignette'), W, H).node;
          opacity(this.vig).opacity = 0;
          this.fxG = node2D('fx', this.root, W, H).addComponent(Graphics);
          this.flashNode = node2D('flash', this.root, W, H);
          var fg = this.flashNode.addComponent(Graphics);
          fg.fillColor = Color.WHITE;
          fg.rect(-W / 2, -H / 2, W, H);
          fg.fill();
          opacity(this.flashNode).opacity = 0;
          this.skipBtn = button(this.root, 'Skip ››', 150, 48, function () {
            return _this.skip();
          }, new Color(32, 16, 40, 200), 22);
          this.skipBtn.setPosition(pos(548, 22, 150, 48)); // top right, above the bubbles (hook.html #skip)
          var vn = node2D('voice', this.root);
          this.voice = vn.addComponent(AudioSource);
          for (var i = 0; i < 2; i++) this.laughs.push(node2D('laugh', this.root).addComponent(AudioSource));
        }
        var _proto = Hook.prototype;
        _proto.destroy = function destroy() {
          this.aborted = true;
          this.voice.stop();
          this.laughs.forEach(function (l) {
            return l.stop();
          });
          this.root.destroy();
        }

        // ---------------------------------------------------------------- timing & audio
        ;

        _proto.wait = function wait(ms) {
          var _this2 = this;
          // once skipped the sequence just stops here (the screen is torn down after the fade)
          return new Promise(function (res) {
            if (_this2.aborted) return;
            var over = false;
            var fin = function fin() {
              if (over) return;
              over = true;
              _this2.host.unschedule(fin);
              _this2.hurry = null;
              if (!_this2.aborted) res();
            };
            _this2.host.scheduleOnce(fin, ms / 1000);
            _this2.hurry = fin;
          });
        };
        _proto.play = function play(name, vol, delay, maxDur, src) {
          var _this3 = this;
          if (vol === void 0) {
            vol = 1;
          }
          if (delay === void 0) {
            delay = 0;
          }
          if (maxDur === void 0) {
            maxDur = 0;
          }
          var clip = this.sfx.get(name);
          if (!clip || this.aborted) return;
          var go = function go() {
            if (_this3.aborted) return;
            if (src) {
              src.stop();
              src.clip = clip;
              src.volume = vol;
              src.play();
              if (maxDur) _this3.host.scheduleOnce(function () {
                return src.stop();
              }, maxDur);
            } else _this3.voice.playOneShot(clip, vol);
          };
          delay ? this.host.scheduleOnce(go, delay) : go();
        };
        // ---------------------------------------------------------------- layers
        _proto.show = function show(slot, key, from, pop) {
          if (pop === void 0) {
            pop = true;
          }
          var s = this.slots[slot],
            cfg = SPR[key],
            f = this.img.get(key);
          var h = cfg.h,
            w = h * f.width / f.height;
          s.spriteFrame = f;
          s.node.getComponent(UITransform).setContentSize(w, h);
          var y = -H / 2 + 90;
          Tween.stopAllByTarget(s.node);
          if (from !== undefined) s.node.setPosition(from + w / 2 - W / 2, y);
          fadeTo(s.node, 255, 0.25);
          var t = tween(s.node).to(0.55, {
            position: new Vec3(cfg.left + w / 2 - W / 2, y, 0)
          }, {
            easing: 'quartOut'
          });
          if (pop) {
            s.node.setScale(0.92, 1.06, 1);
            tween(s.node).to(0.32, {
              scale: Vec3.ONE
            }, {
              easing: 'backOut'
            }).start();
          }
          t.start();
        };
        _proto.moveTo = function moveTo(slot, left) {
          var n = this.slots[slot].node,
            w = n.getComponent(UITransform).width;
          tween(n).to(0.55, {
            position: new Vec3(left + w / 2 - W / 2, n.position.y, 0)
          }, {
            easing: 'quartOut'
          }).start();
        };
        _proto.hide = function hide(slot) {
          fadeTo(this.slots[slot].node, 0, 0.25);
        }

        /** speech bubble: cream panel, coloured name tag, tail towards the speaker; typed in step with the voice */;
        _proto.say = /*#__PURE__*/
        function () {
          var _say = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(side, name, key, ms, pink) {
            var line, clip, b, lb, tw, th, bw, bh, left, g, tx, ty, tag, nl, nw, tg, dur, t0, step, shown, _iterator, _step, ch;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  if (ms === void 0) {
                    ms = 600;
                  }
                  if (pink === void 0) {
                    pink = false;
                  }
                  if (!this.aborted) {
                    _context.next = 4;
                    break;
                  }
                  return _context.abrupt("return");
                case 4:
                  line = LINES[key], clip = this.sfx.get('v-' + key);
                  this.unsay();
                  b = node2D('bubble', this.root);
                  this.bubble = b;
                  this.skipBtn.setSiblingIndex(this.root.children.length - 1); // Skip stays above every bubble
                  // measure the whole line first so the bubble doesn't grow while typing
                  lb = text(b, line, {
                    size: 29,
                    color: INK,
                    align: 'left',
                    lineHeight: 40
                  });
                  lb.overflow = Label.Overflow.NONE;
                  lb.updateRenderData(true);
                  tw = lb.node.getComponent(UITransform).width;
                  if (tw > 464) {
                    lb.overflow = Label.Overflow.RESIZE_HEIGHT;
                    lb.node.getComponent(UITransform).width = tw = 464;
                    lb.updateRenderData(true);
                  }
                  th = lb.node.getComponent(UITransform).height;
                  bw = tw + 56, bh = th + 38;
                  left = side === 'L' ? 30 : W - 30 - bw;
                  b.setPosition(pos(left, 120, bw, bh));
                  g = b.addComponent(Graphics);
                  g.fillColor = new Color(0, 0, 0, 60);
                  g.roundRect(-bw / 2, -bh / 2 - 18, bw, bh, 30);
                  g.fill();
                  g.fillColor = INK;
                  g.roundRect(-bw / 2, -bh / 2 - 8, bw, bh, 30);
                  g.fill();
                  g.fillColor = CREAM;
                  g.roundRect(-bw / 2, -bh / 2, bw, bh, 30);
                  g.fill();
                  g.lineWidth = 5;
                  g.strokeColor = INK;
                  g.stroke();
                  tx = side === 'L' ? -bw / 2 + 83 : bw / 2 - 83, ty = -bh / 2;
                  g.fillColor = CREAM;
                  g.moveTo(tx - 18, ty + 3);
                  g.lineTo(tx, ty - 19);
                  g.lineTo(tx + 18, ty + 3);
                  g.close();
                  g.fill();
                  g.moveTo(tx - 18, ty);
                  g.lineTo(tx, ty - 19);
                  g.lineTo(tx + 18, ty);
                  g.stroke();
                  lb.node.setSiblingIndex(99);
                  lb.node.getComponent(UITransform).setAnchorPoint(0, 1);
                  lb.node.setPosition(-bw / 2 + 28, bh / 2 - 18);
                  // name tag
                  tag = node2D('tag', b);
                  nl = text(tag, name, {
                    size: 22,
                    color: side === 'L' ? INK : Color.WHITE
                  });
                  nl.updateRenderData(true);
                  nw = nl.node.getComponent(UITransform).width + 36;
                  tg = tag.addComponent(Graphics);
                  tg.fillColor = side === 'L' ? LAV : pink ? PINK : ROSE;
                  tg.roundRect(-nw / 2, -17, nw, 34, 17);
                  tg.fill();
                  tg.lineWidth = 4;
                  tg.strokeColor = INK;
                  tg.stroke();
                  nl.node.setSiblingIndex(99);
                  nl.node.setPosition(0, 15);
                  tag.setPosition(-bw / 2 + 22 + nw / 2, bh / 2 + 2);
                  b.setScale(0.6, 0.6, 1);
                  opacity(b).opacity = 0;
                  tween(b).to(0.22, {
                    scale: Vec3.ONE
                  }, {
                    easing: 'backOut'
                  }).start();
                  fadeTo(b, 255, 0.12);
                  // type it out in step with the voice clip
                  this.skipTyping = false;
                  dur = clip ? clip.getDuration() * 1000 : line.length * 38;
                  t0 = Date.now();
                  this.voice.stop();
                  if (clip && !this.aborted) {
                    this.voice.clip = clip;
                    this.voice.volume = 1;
                    this.voice.play();
                  }
                  step = dur * 0.85 / line.length;
                  shown = '';
                  _iterator = _createForOfIteratorHelperLoose(line);
                case 71:
                  if ((_step = _iterator()).done) {
                    _context.next = 82;
                    break;
                  }
                  ch = _step.value;
                  if (!(this.skipTyping || this.aborted)) {
                    _context.next = 75;
                    break;
                  }
                  return _context.abrupt("break", 82);
                case 75:
                  shown += ch;
                  lb.string = shown;
                  if (!clip && ch.trim()) this.SFX.blip();
                  _context.next = 80;
                  return this.wait(step);
                case 80:
                  _context.next = 71;
                  break;
                case 82:
                  lb.string = line;
                  if (this.skipTyping) {
                    _context.next = 86;
                    break;
                  }
                  _context.next = 86;
                  return this.wait(Math.max(0, dur - (Date.now() - t0)));
                case 86:
                  this.skipTyping = false;
                  _context.next = 89;
                  return this.wait(ms);
                case 89:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function say(_x, _x2, _x3, _x4, _x5) {
            return _say.apply(this, arguments);
          }
          return say;
        }();
        _proto.unsay = function unsay() {
          if (this.bubble) this.bubble.destroy();
          this.bubble = null;
        }

        // ---------------------------------------------------------------- fx
        ;

        _proto.hearts = function hearts(x, y, n) {
          if (n === void 0) {
            n = 8;
          }
          for (var i = 0; i < n; i++) this.parts.push({
            x: x + (Math.random() - 0.5) * 120,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 3,
            life: 1,
            s: 18 + Math.random() * 16,
            c: new Color(255, 95, 143),
            heart: true,
            g: false
          });
        };
        _proto.crumbs = function crumbs(x, y, n) {
          if (n === void 0) {
            n = 30;
          }
          var cs = [new Color(247, 169, 196), ROSE, Color.WHITE, new Color(217, 160, 102)];
          for (var i = 0; i < n; i++) {
            var a = -Math.PI * Math.random();
            this.parts.push({
              x: x,
              y: y,
              vx: Math.cos(a) * 9 * Math.random(),
              vy: Math.sin(a) * 10 * Math.random(),
              life: 1,
              s: 4 + Math.random() * 6,
              c: cs[i % 4],
              heart: false,
              g: true
            });
          }
        }
        /** particles step at 60 fps like the canvas version; drawn in stage coordinates (y down) */;
        _proto.tick = function tick(dt) {
          var g = this.fxG;
          g.clear();
          var k = dt * 60;
          this.parts = this.parts.filter(function (p) {
            return (p.life -= 0.016 * k) > 0;
          });
          for (var _iterator2 = _createForOfIteratorHelperLoose(this.parts), _step2; !(_step2 = _iterator2()).done;) {
            var p = _step2.value;
            p.x += p.vx * k;
            p.y += p.vy * k;
            if (p.g) p.vy += 0.5 * k;
            var a = Math.round(Math.min(1, p.life * 1.5) * 255);
            var X = p.x - W / 2,
              Y = H / 2 - p.y;
            if (p.heart) {
              var s = p.s;
              g.fillColor = new Color(p.c.r, p.c.g, p.c.b, a);
              g.strokeColor = new Color(43, 22, 48, a);
              g.lineWidth = 3;
              g.moveTo(X, Y - s * 0.3);
              g.bezierCurveTo(X - s, Y + s * 0.5, X - s * 0.4, Y + s, X, Y + s * 0.45);
              g.bezierCurveTo(X + s * 0.4, Y + s, X + s, Y + s * 0.5, X, Y - s * 0.3);
              g.fill();
              g.stroke();
            } else {
              g.fillColor = new Color(p.c.r, p.c.g, p.c.b, a);
              g.circle(X, Y, p.s);
              g.fill();
            }
          }
        };
        _proto.shake = function shake(mag, dur) {
          if (mag === void 0) {
            mag = 12;
          }
          if (dur === void 0) {
            dur = 350;
          }
          var t = tween(this.root);
          for (var i = 0; i < 8; i++) t.to(dur / 9000, {
            position: new Vec3((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2, 0)
          });
          t.to(dur / 9000, {
            position: Vec3.ZERO
          }).start();
        };
        _proto.flash = function flash(peak, dur) {
          if (peak === void 0) {
            peak = 0.8;
          }
          if (dur === void 0) {
            dur = 220;
          }
          var o = opacity(this.flashNode);
          Tween.stopAllByTarget(o);
          o.opacity = peak * 255;
          tween(o).to(dur / 1000, {
            opacity: 0
          }).start();
        };
        _proto.fxText = function fxText(s, x, y, color) {
          var lb = text(this.root, s, {
            size: 58,
            color: color,
            outline: 5,
            drop: true
          });
          var n = lb.node;
          n.getComponent(UITransform).setAnchorPoint(0.5, 0.5);
          n.setPosition(pos(x, y));
          n.setScale(0.3, 0.3, 1);
          n.angle = 10;
          opacity(n).opacity = 0;
          tween(n).to(0.33, {
            scale: new Vec3(1.15, 1.15, 1),
            angle: -4
          }, {
            easing: 'quadOut'
          }).to(0.97, {
            scale: Vec3.ONE,
            angle: 0,
            position: pos(x, y - 30)
          }).call(function () {
            return n.destroy();
          }).start();
          tween(opacity(n)).to(0.33, {
            opacity: 255
          }).to(0.97, {
            opacity: 0
          }).start();
        }

        // ---------------------------------------------------------------- sequence
        ;

        _proto.skip = function skip() {
          var _this$hurry;
          if (this.leaving) return;
          this.aborted = true;
          this.voice.stop();
          this.laughs.forEach(function (l) {
            return l.stop();
          });
          (_this$hurry = this.hurry) == null || _this$hurry.call(this);
          this.leave();
        };
        /** into the level (the host fades the screen) */
        _proto.leave = function leave() {
          if (this.leaving) return;
          this.leaving = true;
          this.skipBtn.active = false;
          this.onDone();
        };
        _proto.run = /*#__PURE__*/function () {
          var _run = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            var _this4 = this;
            var box, sp;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  this.show('R', 'ryan-phone', 760);
                  this.SFX.whoosh();
                  _context2.next = 4;
                  return this.wait(450);
                case 4:
                  this.show('L', 'chloe-confess', -400);
                  this.SFX.whoosh();
                  _context2.next = 8;
                  return this.wait(500);
                case 8:
                  if (!this.aborted) this.hearts(240, 640, 10);
                  this.SFX.heart();
                  _context2.next = 12;
                  return this.say('L', 'Chloe', 'chloe-confess', 500);
                case 12:
                  // rejection
                  this.show('R', 'ryan-sneer');
                  _context2.next = 15;
                  return this.say('R', 'Ryan', 'ryan-reject', 200);
                case 15:
                  this.show('L', 'chloe-rejected');
                  this.SFX["break"]();
                  if (!this.aborted) this.shake(10, 300);
                  _context2.next = 20;
                  return this.wait(1100);
                case 20:
                  // Tiffany walks in and snatches the box
                  this.unsay();
                  this.moveTo('R', 250); // Ryan steps aside so she fits on screen
                  this.show('R2', 'tiffany-strut', 760);
                  this.SFX.whoosh();
                  _context2.next = 26;
                  return this.say('R', 'Tiffany', 'tiffany-enter', 300, true);
                case 26:
                  this.show('L', 'chloe-empty');
                  this.SFX.snatch();
                  box = this.box.node;
                  box.setPosition(pos(230, 700, 170, 163));
                  box.angle = 0;
                  opacity(box).opacity = 255;
                  _context2.next = 34;
                  return new Promise(function (res) {
                    if (_this4.aborted) return;
                    tween(box).to(0.38, {
                      position: pos(560, 640, 170, 163),
                      angle: -25
                    }, {
                      easing: 'cubicInOut'
                    }).call(function () {
                      return !_this4.aborted && res();
                    }).start();
                  });
                case 34:
                  opacity(box).opacity = 0;
                  this.hide('R');
                  this.hide('R2');
                  this.show('R', 'couple-hug');
                  _context2.next = 40;
                  return this.say('R', 'Tiffany', 'tiffany-mock1', 200, true);
                case 40:
                  _context2.next = 42;
                  return this.say('R', 'Ryan', 'ryan-mock', 100);
                case 42:
                  // cookies dumped, both laugh, she breaks down
                  sp = this.spill.node;
                  sp.setPosition(pos(200, 1085 - 260, 440, 198));
                  sp.setScale(0.6, 0.6, 1);
                  opacity(sp).opacity = 0;
                  tween(sp).to(0.3, {
                    position: pos(200, 1085, 440, 198),
                    scale: Vec3.ONE
                  }, {
                    easing: 'quadIn'
                  }).start();
                  fadeTo(sp, 255, 0.3);
                  _context2.next = 50;
                  return this.wait(260);
                case 50:
                  this.SFX.crash();
                  if (!this.aborted) {
                    this.crumbs(420, 1215);
                    this.shake(14, 350);
                  }
                  this.show('R', 'couple-mock');
                  this.show('L', 'chloe-crying');
                  this.SFX.laugh();
                  this.SFX.sob();
                  if (!this.aborted) {
                    this.fxText('HAHAHA!', 520, 300, new Color(255, 216, 77));
                    [0, 0.28, 0.56].forEach(function (t) {
                      return _this4.host.scheduleOnce(function () {
                        _this4.flash(0.55, 160);
                        _this4.SFX.shutter();
                      }, t);
                    });
                  }
                  _context2.next = 59;
                  return this.wait(3000);
                case 59:
                  _context2.next = 61;
                  return this.say('R', 'Tiffany', 'tiffany-mock2', 500, true);
                case 61:
                  _context2.next = 63;
                  return this.say('L', 'Chloe', 'chloe-cry', 600);
                case 63:
                  // freeze on her humiliation, then the call to action
                  this.unsay();
                  this.SFX.sting();
                  fadeTo(this.bgCold.node, 255, 0.6);
                  this.slots.R.color = new Color(150, 140, 150, 255);
                  this.slots.R2.color = new Color(150, 140, 150, 255);
                  fadeTo(this.vig, 255, 0.6);
                  tween(this.slots.L.node).to(0.9, {
                    scale: new Vec3(1.08, 1.08, 1)
                  }, {
                    easing: 'quadOut'
                  }).start();
                  _context2.next = 72;
                  return this.wait(900);
                case 72:
                  this.skipBtn.active = false;
                  _context2.next = 75;
                  return this.wait(900);
                case 75:
                  this.leave();
                case 76:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function run() {
            return _run.apply(this, arguments);
          }
          return run;
        }();
        _proto.endCard = function endCard() {
          var _this5 = this;
          var card = node2D('end', this.root, W, H);
          card.on(Node.EventType.TOUCH_START, function (e) {
            return e.propagationStopped = true;
          });
          sprite('grad', card, this.img.get('grad-end'), W, H);
          var btn = button(card, 'Help Her Glow Up', 420, 106, function () {
            return _this5.onDone();
          });
          btn.setPosition(pos(150, H - 150 - 106, 420, 106));
          breathe(btn);
          // three centred lines; the promise of the game in amber (no RichText: that engine module is off)
          var lines = [['Prom is in 30 days.', Color.WHITE], ['Give Chloe a total makeover', AMBER], ['and make them regret it!', Color.WHITE]];
          var y = btn.position.y + 53 + 50;
          for (var i = lines.length - 1; i >= 0; i--) {
            var lb = text(card, lines[i][0], {
              size: 30,
              color: lines[i][1],
              outline: i === 1 ? 3 : 0
            });
            lb.node.getComponent(UITransform).setAnchorPoint(0.5, 0);
            lb.node.setPosition(0, y);
            y += 45;
          }
          var h2 = text(card, 'Humiliated in front of everyone...', {
            size: 58,
            outline: 5,
            drop: true,
            width: 640,
            lineHeight: 75
          });
          h2.node.getComponent(UITransform).setAnchorPoint(0.5, 0);
          h2.node.setPosition(0, y + 20);
          opacity(card).opacity = 0;
          fadeTo(card, 255, 0.5);
        };
        return Hook;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Hud.ts", ['cc', './Clock.ts', './ui.ts'], function (exports) {
  var cclegacy, Color, Node, Sprite, UITransform, Graphics, Label, op, at, ease, Clock, node2D, H, W;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      Node = module.Node;
      Sprite = module.Sprite;
      UITransform = module.UITransform;
      Graphics = module.Graphics;
      Label = module.Label;
    }, function (module) {
      op = module.op;
      at = module.at;
      ease = module.ease;
      Clock = module.Clock;
    }, function (module) {
      node2D = module.node2D;
      H = module.H;
      W = module.W;
    }],
    execute: function () {
      cclegacy._RF.push({}, "dced4SO+bdBXakHJ37U3dec", "Hud", undefined);
      var INK = new Color(59, 43, 43, 255),
        CREAM = new Color(255, 246, 234, 255),
        GOLD = new Color(255, 200, 61, 255),
        GOLD_HI = new Color(255, 226, 138, 255),
        GOLD_LO = new Color(226, 154, 18, 255),
        ROSE = new Color(232, 67, 111, 255),
        ROSE_HI = new Color(255, 143, 174, 255),
        LOWPILL = new Color(255, 107, 143, 255);
      function label(parent, s, size, color, stroke) {
        if (stroke === void 0) {
          stroke = 0;
        }
        var n = node2D('t', parent);
        var lb = n.addComponent(Label);
        lb.string = s;
        lb.fontSize = size;
        lb.lineHeight = Math.round(size * 1.25);
        lb.isBold = true;
        lb.color = color;
        lb.horizontalAlign = Label.HorizontalAlign.CENTER;
        lb.verticalAlign = Label.VerticalAlign.CENTER;
        if (stroke) {
          lb.enableOutline = true;
          lb.outlineColor = INK;
          lb.outlineWidth = stroke / 2;
        }
        return lb;
      }
      var width = function width(lb) {
        lb.updateRenderData(true);
        return lb.node.getComponent(UITransform).width;
      };
      /** a rounded box with the ink border and a hard drop below (CSS: border, box-shadow 0 Npx 0 ink) */
      function box(g, w, h, r, fill, line, drop) {
        if (line === void 0) {
          line = 5;
        }
        if (drop === void 0) {
          drop = 5;
        }
        g.clear();
        if (drop) {
          g.fillColor = INK;
          g.roundRect(-w / 2, -h / 2 - drop, w, h, r);
          g.fill();
        }
        g.fillColor = fill;
        g.roundRect(-w / 2, -h / 2, w, h, r);
        g.fill();
        g.lineWidth = line;
        g.strokeColor = INK;
        g.roundRect(-w / 2 + line / 2, -h / 2 + line / 2, w - line, h - line, Math.max(0, r - line / 2));
        g.stroke();
      }
      /** the round gold / cream buttons: a radial-ish fill (highlight up-left, darker rim) */
      function roundBtn(g, d, hi, mid, lo) {
        var r = d / 2;
        g.clear();
        g.fillColor = INK;
        g.circle(0, -5, r);
        g.fill();
        g.fillColor = lo;
        g.circle(0, 0, r);
        g.fill();
        g.fillColor = mid;
        g.circle(-r * 0.06, r * 0.06, r * 0.86);
        g.fill();
        g.fillColor = hi;
        g.circle(-r * 0.18, r * 0.24, r * 0.5);
        g.fill();
        g.lineWidth = 5;
        g.strokeColor = INK;
        g.circle(0, 0, r - 2.5);
        g.stroke();
      }
      var Hud = exports('Hud', /*#__PURE__*/function () {
        function Hud(parent, ui, fx, data, cb) {
          var _this = this;
          this.root = void 0;
          this.clock = new Clock();
          this.els = {};
          this.timerLb = void 0;
          this.timerG = void 0;
          this.timerW = 150;
          this.progLb = void 0;
          this.progG = void 0;
          this.tipBox = void 0;
          this.tipLb = void 0;
          this.tipBg = void 0;
          this.over = void 0;
          this.urgent = void 0;
          this.left = 0;
          this.running = false;
          this.overShown = false;
          this.lowPulse = 0;
          this.acc = 0;
          this.tipT = null;
          this.ui = ui;
          this.data = data;
          this.cb = cb;
          this.root = node2D('Hud', parent, W, H);
          // the red edge glow (under the buttons, never takes touches)
          this.urgent = node2D('urgent', this.root, W, H);
          var us = this.urgent.addComponent(Sprite);
          us.sizeMode = Sprite.SizeMode.CUSTOM;
          us.spriteFrame = fx.get('vignette-red') || null;
          this.urgent.getComponent(UITransform).setContentSize(W, H);
          op(this.urgent).opacity = 0;
          var add = data.addTime || 60;
          this.roundButton('hBack', 'back', '', GOLD_HI, GOLD, GOLD_LO, function () {
            return cb.back();
          });
          this.timerPill();
          this.progPill();
          this.roundButton('hTips', 'tips', 'Tips', new Color(255, 255, 255, 255), CREAM, new Color(246, 220, 182, 255), function () {
            return _this.showTip();
          });
          this.roundButton('hAdd', 'addtime', "+" + add + "s", new Color(255, 255, 255, 255), CREAM, new Color(246, 220, 182, 255), function () {
            return _this.addTime(add);
          });
          this.tipText();
          this.overPanel(add);
          this.applyLayout();
        }

        // ---------------------------------------------------------------- pieces
        var _proto = Hud.prototype;
        _proto.piece = function piece(id, w, h) {
          var n = node2D(id, this.root, w, h);
          this.els[id] = {
            n: n,
            w: w,
            h: h
          };
          return n;
        };
        _proto.tappable = function tappable(n, fn) {
          var stop = function stop(e) {
            return e.propagationStopped = true;
          };
          var p0 = function p0() {
            return n.position.clone();
          };
          var rest = p0();
          n.on(Node.EventType.TOUCH_START, function (e) {
            stop(e);
            rest = p0();
            n.setPosition(rest.x, rest.y - 3);
          });
          n.on(Node.EventType.TOUCH_MOVE, stop);
          n.on(Node.EventType.TOUCH_CANCEL, function (e) {
            stop(e);
            n.setPosition(rest);
          });
          n.on(Node.EventType.TOUCH_END, function (e) {
            stop(e);
            n.setPosition(rest);
            fn();
          });
        };
        _proto.icon = function icon(parent, name, size) {
          var n = node2D('icon', parent, size, size);
          var s = n.addComponent(Sprite);
          s.sizeMode = Sprite.SizeMode.CUSTOM;
          s.spriteFrame = this.ui.get(name) || null;
          n.getComponent(UITransform).setContentSize(size, size);
          return n;
        };
        _proto.roundButton = function roundButton(id, iconName, caption, hi, mid, lo, fn) {
          var n = this.piece(id, 84, 84);
          roundBtn(n.addComponent(Graphics), 84, hi, mid, lo);
          this.icon(n, iconName, 55);
          if (caption) {
            var lb = label(n, caption, 26, Color.WHITE, 6);
            lb.node.setPosition(0, -42 - 14);
          }
          this.tappable(n, fn);
        };
        _proto.timerPill = function timerPill() {
          var n = this.piece('hTimer', 150, 58);
          this.timerG = n.addComponent(Graphics);
          var ic = this.icon(n, 'clock', 72);
          ic.setPosition(-75 + 20, 2);
          ic.name = 'clockIcon';
          this.timerLb = label(n, '120s', 32, INK);
          this.drawTimer();
        };
        _proto.drawTimer = function drawTimer() {
          var low = this.left <= 10 && this.left > 0 && this.running && !this.overShown;
          var tw = width(this.timerLb);
          this.timerW = Math.max(150, 58 + tw + 22);
          var n = this.els.hTimer.n;
          n.getComponent(UITransform).setContentSize(this.timerW, 58);
          this.els.hTimer.w = this.timerW;
          box(this.timerG, this.timerW, 58, 29, low ? LOWPILL : CREAM);
          this.timerLb.color = low ? Color.WHITE : INK;
          this.timerLb.node.setPosition(-this.timerW / 2 + 58 + tw / 2, 0);
          n.getChildByName('clockIcon').setPosition(-this.timerW / 2 + 20, 2);
        };
        _proto.progPill = function progPill() {
          var n = this.piece('hProg', 120, 58);
          this.progG = n.addComponent(Graphics);
          this.progLb = label(n, '0/0', 32, INK);
        };
        _proto.progress = function progress(d, total) {
          this.progLb.string = d + "/" + total;
          var w = width(this.progLb) + 54;
          this.els.hProg.w = w;
          this.els.hProg.n.getComponent(UITransform).setContentSize(w, 58);
          box(this.progG, w, 58, 29, CREAM);
          if (d >= total && total) this.timerStop(); // finished: the clock stops where it is
          this.applyLayout();
        };
        _proto.tipText = function tipText() {
          var n = this.piece('hTipText', 500, 70);
          this.tipBox = n;
          this.tipBg = n.addComponent(Graphics);
          this.tipLb = label(n, '', 28, INK);
          this.tipLb.overflow = Label.Overflow.RESIZE_HEIGHT;
          this.tipLb.node.getComponent(UITransform).width = 456;
          op(n).opacity = 0;
        };
        _proto.overPanel = function overPanel(add) {
          var _this2 = this;
          var o = node2D('hOver', this.root, W, H);
          this.over = o;
          var dim = o.addComponent(Graphics);
          dim.fillColor = new Color(59, 43, 43, 153);
          dim.rect(-W / 2, -H / 2, W, H);
          dim.fill();
          o.on(Node.EventType.TOUCH_START, function (e) {
            return e.propagationStopped = true;
          });
          o.on(Node.EventType.TOUCH_END, function (e) {
            return e.propagationStopped = true;
          });
          var p = node2D('panel', o, 520, 260);
          box(p.addComponent(Graphics), 520, 260, 28, CREAM, 6, 8);
          var t = label(p, "Time's Up!", 64, Color.WHITE, 10);
          t.node.setPosition(0, 58);
          var btn = function btn(txt, x, fill, hi, iconName, fn) {
            var b = node2D('b', p, 220, 84);
            var g = b.addComponent(Graphics);
            box(g, 220, 84, 42, fill);
            g.fillColor = hi;
            g.roundRect(-96, 8, 192, 26, 13);
            g.fill();
            var lb = label(b, txt, 36, Color.WHITE, 6);
            if (iconName) {
              var ic = _this2.icon(b, iconName, 60);
              var tw = width(lb);
              ic.setPosition(-(tw + 68) / 2 + 30, 0);
              lb.node.setPosition((60 + 8) / 2, 0);
            }
            b.setPosition(x, -52);
            _this2.tappable(b, fn);
          };
          btn("+" + add + "s", -121, GOLD, GOLD_HI, 'addtime', function () {
            return _this2.addTime(add);
          });
          btn('Retry', 121, ROSE, ROSE_HI, null, function () {
            return _this2.cb.retry();
          });
          o.active = false;
          o.setSiblingIndex(this.root.children.length - 1);
          // back stays on top of the panel: leaving is always possible
          this.els.hBack.n.setSiblingIndex(this.root.children.length - 1);
        }

        /** where each piece goes: the designer's layout or the editor's default spot (CSS defaults) */;
        _proto.applyLayout = function applyLayout() {
          var def = {
            hBack: function hBack() {
              return [16, 16];
            },
            hTimer: function hTimer() {
              return [112, 28];
            },
            hProg: function hProg(w) {
              return [720 - 16 - w, 28];
            },
            hTips: function hTips() {
              return [20, 1162];
            },
            hAdd: function hAdd(w) {
              return [720 - 20 - w, 1162];
            },
            hTipText: function hTipText() {
              return [110, 112];
            }
          };
          for (var _i = 0, _Object$entries = Object.entries(this.els); _i < _Object$entries.length; _i++) {
            var _this$data$hud;
            var _Object$entries$_i = _Object$entries[_i],
              id = _Object$entries$_i[0],
              e = _Object$entries$_i[1];
            var v = (_this$data$hud = this.data.hud) == null ? void 0 : _this$data$hud[id];
            var _ref = v && v.x != null ? [v.x, v.y] : def[id](e.w, e.h),
              x = _ref[0],
              y = _ref[1];
            var s = (v == null ? void 0 : v.s) || 1;
            e.n.setPosition(at(x + e.w / 2, y + e.h / 2));
            e.n.setScale(s, s, 1);
            e.n.active = !(v && v.hide) && (id !== 'hTipText' || true);
          }
        }

        // ---------------------------------------------------------------- timer
        ;

        _proto.timerStart = function timerStart() {
          this.left = this.data.timeLimit || 300;
          this.running = true;
          this.overShown = false;
          this.over.active = false;
          this.draw();
        };
        _proto.timerStop = function timerStop() {
          this.running = false;
          this.draw();
        };
        _proto.tick = function tick(dt) {
          var _this3 = this,
            _this$data$hud2;
          this.clock.tick(dt * 1000);
          if (this.running && !this.overShown) {
            this.acc += dt;
            while (this.acc >= 1) {
              this.acc -= 1;
              this.left--;
              this.draw();
              if (this.left <= 0) {
                this.overShown = true; // time's up: everything stops under the panel
                this.over.active = true;
                op(this.over).opacity = 0;
                this.clock.anim(250, function (k) {
                  return op(_this3.over).opacity = Math.round(255 * k);
                });
                this.cb.timeUp();
                this.draw();
                break;
              }
            }
          } else this.acc = 0;
          // the low-time pulse and the red edge glow, brighter and faster towards 0
          var urgent = this.running && this.left > 0 && this.left <= 10 && !this.overShown;
          var u = op(this.urgent),
            tn = this.els.hTimer.n,
            s = ((_this$data$hud2 = this.data.hud) == null || (_this$data$hud2 = _this$data$hud2.hTimer) == null ? void 0 : _this$data$hud2.s) || 1;
          if (urgent) {
            var a = 0.4 + 0.5 * (10 - this.left) / 10,
              per = this.left <= 3 ? 500 : 1000;
            var k = (1 - Math.cos(this.clock.now % per / per * Math.PI * 2)) / 2;
            u.opacity = Math.round(255 * a * (1 - 0.65 * k));
            this.lowPulse += dt;
            var pk = (1 - Math.cos(this.lowPulse % 1.2 / 1.2 * Math.PI * 2)) / 2;
            tn.setScale(s * (1 + 0.07 * pk), s * (1 + 0.07 * pk), 1);
          } else {
            u.opacity = Math.max(0, u.opacity - Math.round(dt * 640));
            tn.setScale(s, s, 1);
          }
        };
        _proto.draw = function draw() {
          this.timerLb.string = Math.max(0, this.left) + "s";
          this.drawTimer();
          this.applyLayout();
        };
        _proto.blocking = function blocking() {
          return this.overShown;
        };
        _proto.addTime = function addTime(sec) {
          var keep = Math.max(0, this.left) + sec;
          this.over.active = false;
          this.overShown = false;
          this.running = true;
          this.left = keep;
          this.draw();
          var f = label(this.root, "+" + sec + "s", 34, new Color(123, 227, 107, 255), 6);
          var p = at(150 + 30, 90 + 20);
          f.node.setPosition(p);
          var o = op(f.node);
          this.clock.anim(900, function (k) {
            var kk = ease.out(k),
              s = k < 0.3 ? 0.6 + (1.1 - 0.6) * (k / 0.3) : 1.1 - 0.1 * ((k - 0.3) / 0.7);
            f.node.setPosition(p.x, p.y + (k < 0.3 ? 10 * (k / 0.3) : 10 + 30 * ((k - 0.3) / 0.7)));
            f.node.setScale(s, s, 1);
            o.opacity = Math.round(255 * (k < 0.3 ? k / 0.3 : 1 - (kk - 0.3) / 0.7));
          }, function () {
            return f.node.destroy();
          });
        };
        _proto.showTip = function showTip() {
          var _this$tipT,
            _this4 = this;
          var t = this.cb.tip();
          if (!t) return;
          this.tipLb.string = t;
          this.tipLb.updateRenderData(true);
          var h = Math.max(46, this.tipLb.node.getComponent(UITransform).height) + 24;
          this.els.hTipText.h = h;
          this.tipBox.getComponent(UITransform).setContentSize(500, h);
          box(this.tipBg, 500, h, 22, CREAM);
          this.applyLayout();
          var o = op(this.tipBox);
          (_this$tipT = this.tipT) == null || _this$tipT.stop();
          this.clock.anim(300, function (k) {
            return o.opacity = Math.max(o.opacity, Math.round(255 * k));
          });
          this.tipT = this.clock.after(4000, function () {
            return _this4.clock.anim(300, function (k) {
              return o.opacity = Math.round(255 * (1 - k));
            });
          });
        };
        _proto.destroy = function destroy() {
          this.clock.clear();
          if (this.root.isValid) this.root.destroy();
        };
        return Hud;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Level.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Clock.ts', './Cover.ts', './Fx.ts', './Hud.ts', './ui.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, _extends, cclegacy, Sprite, UITransform, Color, Mask, Graphics, Label, AudioSource, at, op, ease, play, Clock, Cover, fxSprite, sparkle, drop, bubble, repairCloud, salonCloud, smashFx, dryerGust, twinkles, mist, sparkleOver, ring, steamPuff, INK2, streak, Hud, node2D, H, W;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _extends = module.extends;
    }, function (module) {
      cclegacy = module.cclegacy;
      Sprite = module.Sprite;
      UITransform = module.UITransform;
      Color = module.Color;
      Mask = module.Mask;
      Graphics = module.Graphics;
      Label = module.Label;
      AudioSource = module.AudioSource;
      var _setter = {};
      _setter.UIOpacity = module.UIOpacity;
      _setter.Vec3 = module.Vec3;
      exports(_setter);
    }, function (module) {
      at = module.at;
      op = module.op;
      ease = module.ease;
      play = module.play;
      Clock = module.Clock;
      exports('op', module.op);
    }, function (module) {
      Cover = module.Cover;
    }, function (module) {
      fxSprite = module.fxSprite;
      sparkle = module.sparkle;
      drop = module.drop;
      bubble = module.bubble;
      repairCloud = module.repairCloud;
      salonCloud = module.salonCloud;
      smashFx = module.smashFx;
      dryerGust = module.dryerGust;
      twinkles = module.twinkles;
      mist = module.mist;
      sparkleOver = module.sparkleOver;
      ring = module.ring;
      steamPuff = module.steamPuff;
      INK2 = module.INK2;
      streak = module.streak;
    }, function (module) {
      Hud = module.Hud;
    }, function (module) {
      node2D = module.node2D;
      H = module.H;
      W = module.W;
    }],
    execute: function () {
      cclegacy._RF.push({}, "1073ae474NONJ9bXfzJXtrY", "Level", undefined);

      // texture name, original width, original height

      var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      function unb64(s) {
        var out = new Uint8Array(Math.floor(s.replace(/=+$/, '').length * 3 / 4));
        var buf = 0,
          n = 0,
          o = 0;
        for (var _iterator = _createForOfIteratorHelperLoose(s), _step; !(_step = _iterator()).done;) {
          var ch = _step.value;
          var v = B64.indexOf(ch);
          if (v < 0) continue;
          buf = buf << 6 | v;
          n += 6;
          if (n >= 8) {
            n -= 8;
            out[o++] = buf >> n & 0xff;
          }
        }
        return out;
      }
      var ids = exports('ids', function ids(s) {
        return String(s || '').split(',').map(function (x) {
          return x.trim();
        }).filter(Boolean);
      });
      var num = function num(v, d) {
        if (d === void 0) {
          d = 0;
        }
        return v == null || v === '' || isNaN(+v) ? d : +v;
      };
      var Level = exports('Level', /*#__PURE__*/function () {
        function Level(env) {
          var _this = this;
          this.clock = new Clock();
          this.fx = void 0;
          this.layerRoot = void 0;
          this.fxRoot = void 0;
          this.sayRoot = void 0;
          this.hud = void 0;
          this.L = [];
          this.done = new Set();
          this.fired = new Set();
          this.used = new Set();
          this.said = new Set();
          this.sayQ = [];
          this.saying = false;
          this.sayGen = 0;
          this.busy = false;
          this.held = null;
          this.away = new Set();
          this.hp = {};
          this.lookBase = {};
          this.blinkAt = {};
          this.instant = false;
          this.total = 0;
          this.voiceSrc = void 0;
          this.sfx = void 0;
          this.grab = null;
          // the press in progress (drag / hold / swipe)
          this.ended = false;
          this.find = function (id) {
            return _this.L.find(function (t) {
              return t.id === id;
            });
          };
          // ---------------------------------------------------------------- rules (the editor's, one to one)
          this.counted = function (t) {
            return ['drag', 'scrub', 'wipe', 'toggle', 'act', 'hold', 'swipe'].includes(t.role);
          };
          this.phaseOf = function (t) {
            return num(t.phase);
          };
          this.reqMet = function (l) {
            return ids(l.req).every(function (r) {
              return _this.isMet(r);
            });
          };
          /** hideUntil: true = hidden until its prerequisites are met; a list of layer names = hidden until those are */
          this.unseen = function (l) {
            return !!l.hideUntil && !(typeof l.hideUntil === 'string' ? ids(l.hideUntil).every(function (r) {
              return _this.isMet(r);
            }) : _this.reqMet(l));
          };
          this.phaseOpen = function (l) {
            return !_this.phaseOf(l) || !!l.anytime || _this.L.every(function (t) {
              return !_this.counted(t) || !_this.phaseOf(t) || _this.phaseOf(t) >= _this.phaseOf(l) || _this.done.has(t.id);
            });
          };
          /** prerequisites and phase met: an item may always be picked up, but only takes effect when ready */
          this.ready = function (l) {
            return _this.phaseOpen(l) && ids(l.req).every(function (r) {
              return _this.isMet(r);
            });
          };
          this.blocked = function (l) {
            return !_this.ready(l);
          };
          /** a tool whose every job is done (the rag once the wall is clean) is put away */
          this.retired = function (l) {
            return l.role === 'tool' && _this.L.some(function (t) {
              return ids(t.tool).includes(l.id);
            }) && _this.L.filter(function (t) {
              return ids(t.tool).includes(l.id);
            }).every(function (t) {
              return _this.done.has(t.id);
            });
          };
          this.met = function (cond) {
            return !cond || cond.split('&').map(function (v) {
              return v.trim();
            }).filter(Boolean).every(function (id) {
              return _this.done.has(id);
            });
          };
          // ---------------------------------------------------------------- outfits (looks)
          this.looksOf = function (a) {
            return String(a.looks || '').split(';').map(function (e) {
              return e.trim();
            }).filter(Boolean).map(function (e) {
              var _e$split = e.split(':'),
                k = _e$split[0],
                st = _e$split[1];
              return {
                off: k.split('+').map(function (v) {
                  return v.trim();
                }).sort().join('+'),
                st: +st
              };
            });
          };
          this.env = env;
          var s = env.root;
          this.layerRoot = node2D('Layers', s, W, H);
          this.fxRoot = node2D('Fx', s, W, H);
          this.sayRoot = node2D('Say', s, W, H);
          this.fx = {
            root: this.fxRoot,
            clock: this.clock,
            fx: env.fx
          };
          this.voiceSrc = node2D('voice', s).addComponent(AudioSource);
          this.sfx = node2D('sfx', s).addComponent(AudioSource);
          this.hud = new Hud(s, env.ui, env.fx, env.data, {
            back: function back() {
              return env.onHome();
            },
            tip: function tip() {
              return _this.tip();
            },
            retry: function retry() {
              return _this.start();
            },
            timeUp: function timeUp() {
              return _this.hush();
            },
            lang: env.lang
          });
          this.start();
        }

        // ---------------------------------------------------------------- run
        var _proto = Level.prototype;
        _proto.start = function start() {
          var _this2 = this;
          this.hush();
          this.clock.clear();
          this.grab = null;
          this.layerRoot.removeAllChildren();
          this.fxRoot.removeAllChildren();
          this.sayRoot.removeAllChildren();
          this.done.clear();
          this.fired.clear();
          this.used.clear();
          this.said.clear();
          this.away.clear();
          this.hp = {};
          this.blinkAt = {};
          this.busy = false;
          this.held = null;
          this.ended = false;
          var bg = node2D('bg', this.layerRoot, W, H).addComponent(Sprite);
          bg.sizeMode = Sprite.SizeMode.CUSTOM;
          bg.spriteFrame = this.env.frames.get(this.env.data.bg[0]);
          bg.node.getComponent(UITransform).setContentSize(W, H);
          this.L = JSON.parse(JSON.stringify(this.env.data.layers)).map(function (d) {
            return _this2.make(d);
          });
          this.total = this.L.filter(this.counted).length;
          this.lookBase = Object.fromEntries(this.L.filter(function (t) {
            return t.looks;
          }).map(function (t) {
            return [t.id, num(t.state)];
          }));
          this.render();
          this.updHud();
          this.hud.timerStart();
          this.clock.after(600, function () {
            return _this2.sayCheck();
          });
          // idle life, water and steam: the editor's background intervals
          this.clock.every(100, function () {
            return _this2.blinkTick();
          });
          this.clock.every(220, function () {
            return _this2.steamTick();
          });
          this.clock.every(45, function () {
            return _this2.leakTick();
          });
          this.clock.every(260, function () {
            return _this2.wetTick();
          });
        };
        _proto.tick = function tick(dt) {
          this.clock.tick(dt * 1000);
          this.hud.tick(dt);
          var t = this.clock.now;
          for (var _iterator2 = _createForOfIteratorHelperLoose(this.L), _step2; !(_step2 = _iterator2()).done;) {
            var _l$cover;
            var _l = _step2.value;
            // breathing: a slow chest rise around the feet ("soft": a person, just a hint)
            if (_l.breathe && !_l.acting && !_l.swinging && _l.node.active) {
              var soft = _l.breathe === 'soft',
                per = soft ? 3000 : 2800,
                _k = (1 - Math.cos(t % per / per * Math.PI * 2)) / 2;
              _l.pic.setScale(1 + (soft ? 0.01 : 0.012) * _k, 1 + (soft ? 0.022 : 0.03) * _k, 1);
            }
            if (_l.acting) {
              // rocking while it acts (Chloe mopping without frames): ±7 px and ±2.5° around her feet, 0.55 s
              var _k2 = Math.sin(t % 550 / 550 * Math.PI * 2);
              _l.pic.setPosition(_k2 * 7, -_l.h / 2);
              _l.pic.angle = -_k2 * 2.5;
            }
            (_l$cover = _l.cover) == null || _l$cover.upload();
          }
        }

        // ---------------------------------------------------------------- layers on screen
        ;

        _proto.make = function make(d) {
          var node = node2D(d.id, this.layerRoot, d.w, d.h);
          var shadowN;
          if (d.shadow) {
            // the editor's contact shadow: a soft ellipse 92% wide, 14% high, centred 4% above the bottom edge
            shadowN = fxSprite(this.fx, this.env.fx.get('shadow'), 0, 0, d.w * 0.92, d.h * 0.14, node);
            shadowN.setPosition(0, -d.h / 2 + d.h * 0.04);
          }
          var pic = node2D('pic', node, d.w, d.h);
          pic.getComponent(UITransform).setAnchorPoint(0.5, 0);
          pic.setPosition(0, -d.h / 2);
          var base = node2D('img', pic).addComponent(Sprite);
          base.sizeMode = Sprite.SizeMode.CUSTOM;
          base.node.getComponent(UITransform).setAnchorPoint(0.5, 0);
          var bits = (d.masks || []).map(function (m) {
            return m ? unb64(m.b) : null;
          });
          var l = _extends({}, d, {
            x: num(d.x),
            y: num(d.y),
            state: num(d.state),
            op: num(d.op, 1),
            node: node,
            pic: pic,
            base: base,
            bits: bits,
            shadowN: shadowN
          });
          this.layout(l);
          this.showState(l);
          return l;
        }
        /** the layer box on the stage */;
        _proto.layout = function layout(l) {
          l.node.getComponent(UITransform).setContentSize(l.w, l.h);
          l.node.setPosition(at(l.x + l.w / 2, l.y + l.h / 2));
          l.node.angle = -num(l.rot);
          l.node.setScale(l.flip ? -1 : 1, 1, 1);
          l.pic.getComponent(UITransform).setContentSize(l.w, l.h);
          l.pic.setPosition(0, -l.h / 2);
          if (l.shadowN) {
            l.shadowN.getComponent(UITransform).setContentSize(l.w * 0.92, l.h * 0.14);
            l.shadowN.setPosition(0, -l.h / 2 + l.h * 0.04);
          }
        }
        /** object-fit contain, bottom-centred in the layer box (or fill when stretched) — like the editor */;
        _proto.fit = function fit(l, st) {
          var _ref = l.states[st] || l.states[0],
            iw = _ref[1],
            ih = _ref[2];
          var s = Math.min(l.w / iw, l.h / ih);
          var dw = l.stretch ? l.w : iw * s,
            dh = l.stretch ? l.h : ih * s;
          return {
            dw: dw,
            dh: dh,
            ox: (l.w - dw) / 2,
            oy: l.h - dh
          };
        };
        _proto.place = function place(sp, l, st) {
          var _ref2 = l.states[st] || l.states[0],
            name = _ref2[0];
          sp.spriteFrame = this.env.frames.get(name) || null;
          var _this$fit = this.fit(l, st),
            dw = _this$fit.dw,
            dh = _this$fit.dh;
          sp.node.getComponent(UITransform).setContentSize(dw, dh);
          sp.node.setPosition(0, 0);
        };
        _proto.showState = function showState(l) {
          this.place(l.base, l, l.state);
        };
        /** what the editor's renderStage shows: hidden / waiting / done / away / retired layers are off; worn pieces stay
         *  as invisible grab areas on her */
        _proto.visible = function visible(l) {
          return !(l.hidden || this.unseen(l) || this.done.has(l.id) && l.role !== 'toggle' && !l.keep && !l.stay || this.away.has(l.id) || this.retired(l));
        };
        _proto.render = function render() {
          for (var _iterator3 = _createForOfIteratorHelperLoose(this.L), _step3; !(_step3 = _iterator3()).done;) {
            var _l2 = _step3.value;
            var v = this.visible(_l2);
            _l2.node.active = v;
            if (!v) continue;
            if (!_l2.moving && !(this.grab && this.grab.l === _l2)) {
              this.layout(_l2);
              op(_l2.node).opacity = Math.round(_l2.op * 255);
            }
            if (!_l2.xf && !_l2.swinging) this.showState(_l2);
            op(_l2.pic).opacity = this.isWorn(_l2) && this.held !== _l2.id ? 0 : 255;
          }
        };
        _proto.orderOf = function orderOf(l) {
          return this.L.indexOf(l) + 1; // +1: the background is child 0
        };
        /** a requirement is met when that layer is done; a toggle (the fridge) only while it is in its last state (open) */
        _proto.isMet = function isMet(id) {
          var t = this.find(id);
          return this.done.has(id) && !(t && t.role === 'toggle' && t.state !== t.states.length - 1);
        };
        /** counted steps by phase, each after the steps it needs (req / hideUntil / after), else layer order */
        _proto.stepOrder = function stepOrder() {
          var _this3 = this;
          var steps = this.L.filter(this.counted),
            byId = new Map(steps.map(function (l) {
              return [l.id, l];
            })),
            out = [],
            seen = new Set();
          var deps = function deps(l) {
            return [].concat(ids(l.req), ids(l.after), typeof l.hideUntil === 'string' ? ids(l.hideUntil) : []).filter(function (id) {
              return byId.has(id);
            });
          };
          var visit = function visit(l) {
            if (seen.has(l.id)) return;
            seen.add(l.id);
            deps(l).forEach(function (id) {
              return visit(byId.get(id));
            });
            out.push(l);
          };
          [].concat(steps).sort(function (a, b) {
            return _this3.phaseOf(a) - _this3.phaseOf(b);
          }).forEach(visit);
          return out;
        };
        /** "layer:state[@delay][~fade] [if a&b], …" */
        _proto.effects = function effects(str, sep) {
          var _this4 = this;
          return String(str || '').split(sep).map(function (e) {
            return e.trim();
          }).filter(Boolean).map(function (e) {
            var _e$split2 = e.split(/\s+if\s+/),
              main = _e$split2[0],
              cond = _e$split2[1],
              m = main.match(/^(.+?):(\w+)(?:@(\d+))?(?:~(\d+))?$/);
            return m ? {
              id: m[1].trim(),
              st: m[2],
              at: +(m[3] || 0),
              dur: +(m[4] || 0),
              ok: _this4.met(cond)
            } : null;
          }).filter(function (e) {
            return !!e && e.ok;
          });
        };
        _proto.setNow = function setNow(e) {
          var t = this.find(e.id);
          if (!t) return;
          if (e.st === 'hide') t.hidden = true;else if (e.st === 'show') t.hidden = false;else if (t.states[+e.st]) t.state = +e.st;
        };
        _proto.isWorn = function isWorn(l) {
          if (!l.on || this.done.has(l.id)) return false;
          var a = this.find(l.on);
          return !!a && this.looksOf(a).some(function (x) {
            return x.off.split('+').includes(l.id);
          });
        };
        _proto.applyLooks = function applyLooks() {
          var _this5 = this;
          var _loop = function _loop() {
              var _this5$lookBase$a$id, _this5$lookBase$a$id2;
              var a = _step4.value;
              var ls = _this5.looksOf(a),
                mine = new Set(ls.flatMap(function (x) {
                  return x.off.split('+');
                }));
              var states = new Set([(_this5$lookBase$a$id = _this5.lookBase[a.id]) != null ? _this5$lookBase$a$id : 0].concat(ls.map(function (x) {
                return x.st;
              })));
              if (!states.has(a.state)) return 0; // continue
              // she has moved on (bath, towel…): outfits no longer apply
              var off = Array.from(mine).filter(function (id) {
                return _this5.done.has(id) || _this5.held === id;
              }).sort().join('+');
              var st = off ? (ls.find(function (x) {
                return x.off === off;
              }) || {}).st : (_this5$lookBase$a$id2 = _this5.lookBase[a.id]) != null ? _this5$lookBase$a$id2 : 0;
              if (st == null || st === a.state || !a.states[st]) return 0; // continue
              a.state = st;
              if (!a.xf) _this5.showState(a);
            },
            _ret;
          for (var _iterator4 = _createForOfIteratorHelperLoose(this.L.filter(function (t) {
              return t.looks;
            })), _step4; !(_step4 = _iterator4()).done;) {
            _ret = _loop();
            if (_ret === 0) continue;
          }
        }

        // ---------------------------------------------------------------- hit tests
        /** pixel-accurate: inside the layer box AND on an opaque part of its picture ("tap": only that box in that state) */;
        _proto.opaque = function opaque(l, x, y) {
          var _l$masks;
          if (l.tap) {
            var r = String(l.tap).split(';').map(function (v) {
              return v.split(':');
            }).find(function (_ref3) {
              var st = _ref3[0];
              return +st === l.state;
            });
            if (r) {
              var _r$1$split$map = r[1].split(',').map(Number),
                rx = _r$1$split$map[0],
                ry = _r$1$split$map[1],
                rw = _r$1$split$map[2],
                rh = _r$1$split$map[3];
              if (!(x >= rx && x <= rx + rw && y >= ry && y <= ry + rh)) return false;
            }
          }
          var m = (_l$masks = l.masks) == null ? void 0 : _l$masks[l.state],
            bits = l.bits[l.state];
          if (!m || !bits) return true;
          var lx = x - l.x;
          if (l.flip) lx = l.w - lx;
          var cx = Math.floor(lx / l.w * m.cw),
            cy = Math.floor((y - l.y) / l.h * m.ch);
          if (cx < 0 || cy < 0 || cx >= m.cw || cy >= m.ch) return false;
          var i = cy * m.cw + cx;
          return (bits[i >> 3] & 0x80 >> (i & 7)) !== 0;
        }
        /** stage-space box around the opaque part of a layer's picture */;
        _proto.opaqueBox = function opaqueBox(l) {
          var _l$masks2;
          var m = (_l$masks2 = l.masks) == null ? void 0 : _l$masks2[l.state],
            bits = l.bits[l.state];
          if (!m || !bits) return {
            x: l.x,
            y: l.y,
            w: l.w,
            h: l.h
          };
          var x0 = m.cw,
            y0 = m.ch,
            x1 = 0,
            y1 = 0;
          for (var y = 0; y < m.ch; y++) for (var x = 0; x < m.cw; x++) {
            var i = y * m.cw + x;
            if (bits[i >> 3] & 0x80 >> (i & 7)) {
              x0 = Math.min(x0, x);
              x1 = Math.max(x1, x);
              y0 = Math.min(y0, y);
              y1 = Math.max(y1, y);
            }
          }
          if (x1 < x0) return {
            x: l.x,
            y: l.y,
            w: l.w,
            h: l.h
          };
          var sx = l.w / m.cw,
            sy = l.h / m.ch;
          return {
            x: l.x + x0 * sx,
            y: l.y + y0 * sy,
            w: (x1 - x0 + 1) * sx,
            h: (y1 - y0 + 1) * sy
          };
        };
        _proto.hitLayer = function hitLayer(x, y, pred) {
          for (var i = this.L.length - 1; i >= 0; i--) {
            var _l3 = this.L[i];
            if (_l3.hidden || this.unseen(_l3) || this.done.has(_l3.id) && _l3.role !== 'toggle' || !pred(_l3)) continue;
            if (x >= _l3.x && x <= _l3.x + _l3.w && y >= _l3.y && y <= _l3.y + _l3.h && this.opaque(_l3, x, y)) return _l3;
          }
          return null;
        }
        /** containers (a bin, the hamper): anything let go over the opening counts too — their box, a little wider, a bit above */;
        _proto.dropInto = function dropInto(x, y, l) {
          for (var i = this.L.length - 1; i >= 0; i--) {
            var t = this.L[i];
            if (t.role !== 'target' || t.hidden || this.unseen(t) || !ids(l.target).includes(t.id)) continue;
            if (x >= t.x - t.w * 0.1 && x <= t.x + t.w * 1.1 && y >= t.y - t.h * 0.15 && y <= t.y + t.h) return t;
          }
          return null;
        }

        // ---------------------------------------------------------------- touch
        ;

        _proto.onDown = function onDown(x, y) {
          if (this.grab || this.busy || this.hud.blocking()) return;
          var l = this.hitLayer(x, y, function (t) {
            return ['drag', 'tool', 'toggle', 'act', 'hold', 'swipe'].includes(t.role);
          });
          if (!l) return;
          this.press(l, x, y);
        };
        _proto.press = function press(l, x, y) {
          if (this.done.has(l.id) && l.role !== 'toggle') return;
          if (['toggle', 'act', 'hold', 'swipe'].includes(l.role) && this.blocked(l)) return; // taps change nothing until ready
          if (l.role === 'act') return this.useOn(l, null, x, y);
          if (l.role === 'hold') return this.holdDown(l);
          if (l.role === 'swipe') return this.swipeDown(l, x);
          if (l.role === 'toggle') {
            if (l.once && l.state === l.states.length - 1) return;
            l.state = (l.state + 1) % l.states.length;
            this.showState(l);
            if (l.state === l.states.length - 1) this.markDone(l);
            if (this.L.some(function (t) {
              return t.hideUntil && ids(t.req).includes(l.id);
            })) this.render();
            return;
          }
          if (this.isWorn(l) && !this.opaque(l, x, y)) {
            // worn pieces overlap: the press goes to whatever is really under the finger
            var t = this.hitLayer(x, y, function (t) {
              return t !== l && ['drag', 'tool', 'toggle', 'act'].includes(t.role);
            });
            if (t) this.press(t, x, y);
            return;
          }
          if (l.sound) {
            var c = this.env.sounds.get(l.sound);
            if (c) this.sfx.playOneShot(c, 0.9);
          }
          var home = this.grabHold(l, x, y);
          if (this.isWorn(l)) {
            this.held = l.id;
            op(l.pic).opacity = 255;
            this.applyLooks();
          }
          // "growW": an item carried toward its target grows to that width as it closes in, scaling around the finger
          var gt = l.growW ? this.L.find(function (t) {
            return ids(l.target).includes(t.id);
          }) : null;
          var gc = gt ? [gt.x + gt.w / 2, gt.y + gt.h * 0.45] : null;
          this.grab = {
            l: l,
            sx: x,
            sy: y,
            ox: l.x,
            oy: l.y,
            last: [x, y],
            rubOn: null,
            home: home,
            gt: gt,
            gc: gc,
            gd0: gc ? Math.max(1, Math.hypot(gc[0] - x, gc[1] - y)) : 1,
            scale: 1
          };
          l.node.setSiblingIndex(this.layerRoot.children.length - 1); // dragged items ride on top
          this.dragShadow(l, true);
        }
        /** the editor's drop-shadow under a dragged item */;
        _proto.dragShadow = function dragShadow(l, on) {
          var old = l.pic.getChildByName('dragShadow');
          if (old) old.destroy();
          if (!on || !l.base.spriteFrame) return;
          var s = node2D('dragShadow', l.pic).addComponent(Sprite);
          s.sizeMode = Sprite.SizeMode.CUSTOM;
          s.spriteFrame = l.base.spriteFrame;
          s.color = new Color(0, 0, 0, 90);
          var tr = l.base.node.getComponent(UITransform);
          s.node.getComponent(UITransform).setAnchorPoint(0.5, 0);
          s.node.getComponent(UITransform).setContentSize(tr.width, tr.height);
          s.node.setPosition(0, -12);
          s.node.setSiblingIndex(0);
        };
        _proto.onMove = function onMove(x, y) {
          var g = this.grab;
          if (!g || !g.l) return g == null || g.move == null ? void 0 : g.move(x, y);
          var l = g.l;
          var nx = g.ox + x - g.sx,
            ny = g.oy + y - g.sy;
          // growW: scale around the finger, smoothly toward the target
          var sc = 1;
          if (g.gt) {
            var _k3 = Math.min(1, Math.max(0, 1 - Math.hypot(g.gc[0] - x, g.gc[1] - y) / g.gd0)),
              f = _k3 * _k3 * (3 - 2 * _k3);
            sc = 1 + (num(l.growW) / l.w - 1) * f;
          }
          g.scale = sc;
          var cxs = nx + l.w / 2,
            cys = ny + l.h / 2; // centre at scale 1; scaling around the finger moves the centre
          l.node.setPosition(at(x + (cxs - x) * sc, y + (cys - y) * sc));
          l.node.setScale((l.flip ? -1 : 1) * sc, sc, 1);
          if (l.role === 'tool') {
            // rubbing the tool's working end (the rag) over a matching cover wipes it off
            var _ref4 = l.hot || [0.5, 0.5],
              hx = _ref4[0],
              hy = _ref4[1],
              px = nx + l.w * hx,
              py = ny + l.h * hy;
            var w = this.hitLayer(px, py, function (t) {
              return t.role === 'wipe' && ids(t.tool).includes(l.id);
            });
            if (w && this.ready(l) && !this.blocked(w)) this.wipeAt(w, px, py, num(l.brush) || Math.max(70, Math.max(l.w, l.h) * 1.4), Math.hypot(x - g.last[0], y - g.last[1]));
          }
          g.last = [x, y];
        };
        _proto.onUp = function onUp(x, y) {
          var _this6 = this;
          var g = this.grab;
          if (!g) return;
          this.grab = null;
          if (!g.l) return g.up == null ? void 0 : g.up(x, y);
          var l = g.l;
          this.dragShadow(l, false);
          if (this.held === l.id) this.held = null;
          var tgt = l.role === 'drag' ? this.hitLayer(x, y, function (t) {
            return t !== l && ids(l.target).includes(t.id);
          }) || this.dropInto(x, y, l) : null;
          if (tgt && !this.ready(l)) tgt = null; // right place, not yet: it goes back
          var dropped = {
            x: g.ox + x - g.sx,
            y: g.oy + y - g.sy
          };
          if (tgt && l.stay) {
            // put it down on the target (the cat on the bed), settling on its proper spot
            var _ref5 = l.stayAt ? String(l.stayAt).split(',').map(Number) : [dropped.x, dropped.y];
            l.x = _ref5[0];
            l.y = _ref5[1];
            l.moving = true;
            var from = l.node.position.clone(),
              to = at(l.x + l.w / 2, l.y + l.h / 2);
            this.clock.anim(300, function (k) {
              return l.node.setPosition(from.lerp(to, ease.out(k)));
            }, function () {
              l.moving = false;
              _this6.layout(l);
            });
            if (l.states[1] && l.stayState !== false) {
              l.state = 1;
              this.showState(l);
            }
            this.bounce(l.node, l.flip ? -1 : 1);
            this.markDone(l);
            sparkle(this.fx, l);
          } else if (tgt && l.wash) this.dumpWash(l);else if (tgt && (l.pose || l.sets || l.ms)) this.useOn(l, tgt, x, y, g.scale);else if (tgt) {
            // shrink into the target
            var cx = tgt.x + tgt.w / 2,
              cy = tgt.y + tgt.h / 2,
              _from = l.node.position.clone(),
              s0 = g.scale;
            l.moving = true;
            var o = op(l.node);
            this.markDone(l);
            this.clock.anim(250, function (k) {
              l.node.setPosition(_from.clone().lerp(at(cx, cy), k));
              var s = s0 + (0.2 - s0) * k;
              l.node.setScale((l.flip ? -1 : 1) * s, s, 1);
              o.opacity = Math.round(255 * (1 - k));
            }, function () {
              l.moving = false;
              l.node.active = false;
              _this6.fillTarget(tgt);
            });
          } else {
            // wrong place or not yet: it just goes back, no hint
            l.node.setSiblingIndex(this.orderOf(l));
            if (this.retired(l)) {
              var _o = op(l.node);
              this.clock.anim(350, function (k) {
                _o.opacity = Math.round(255 * (1 - k));
                l.node.setScale(1 - 0.4 * k, 1 - 0.4 * k, 1);
              }, function () {
                return _this6.render();
              });
            } else if (this.isWorn(l)) {
              // back on her: the whole garment flies onto its spot, then she is dressed again in one swap
              this.held = l.id;
              Object.assign(l, g.home);
              this.flyHome(l, 220, function () {
                if (_this6.held === l.id) _this6.held = null;
                op(l.pic).opacity = 0;
                _this6.showState(l);
                _this6.applyLooks();
              });
            } else if (g.home) {
              Object.assign(l, g.home);
              this.flyHome(l, 250, function () {
                return _this6.showState(l);
              });
            } else this.flyHome(l, 250);
          }
        };
        _proto.flyHome = function flyHome(l, ms, done) {
          var _this7 = this;
          var from = l.node.position.clone(),
            to = at(l.x + l.w / 2, l.y + l.h / 2),
            s0 = Math.abs(l.node.scale.x);
          l.moving = true;
          this.clock.anim(ms, function (k) {
            l.node.setPosition(from.clone().lerp(to, ease.out(k)));
            var s = s0 + (1 - s0) * k;
            l.node.setScale((l.flip ? -1 : 1) * s, s, 1);
          }, function () {
            l.moving = false;
            _this7.layout(l);
            done == null || done();
          });
        };
        _proto.bounce = function bounce(n, sx) {
          this.clock.anim(250, function (k) {
            var s = 1 + 0.08 * (1 - k);
            n.setScale(sx * s, s, 1);
          });
        }
        /** held look: an item with "hold" (a state) and "holdW" (stage px) changes into that picture in the hand (the
         *  folded rag opens up, a worn piece shows the whole garment), centred on the finger */;
        _proto.grabHold = function grabHold(l, px, py) {
          if (l.hold == null || l.hold === '' || !l.states[+l.hold] || !num(l.holdW)) return null;
          var home = {
            x: l.x,
            y: l.y,
            w: l.w,
            h: l.h,
            state: l.state
          };
          var _l$states$l$hold = l.states[+l.hold],
            iw = _l$states$l$hold[1],
            ih = _l$states$l$hold[2],
            w = num(l.holdW),
            h = w * ih / iw;
          Object.assign(l, {
            x: px - w / 2,
            y: py - h / 2,
            w: w,
            h: h,
            state: +l.hold
          });
          this.layout(l);
          this.showState(l);
          return home;
        }

        // ---------------------------------------------------------------- steps done
        ;

        _proto.markDone = function markDone(l) {
          var _this8 = this;
          if (this.done.has(l.id)) return;
          var waiting = this.L.filter(function (x) {
            return x.hideUntil && _this8.unseen(x);
          });
          this.done.add(l.id);
          this.updHud();
          this.sayCheck();
          if (l.on) this.applyLooks();
          // rules: a layer with "when" (ids, all done) applies its "then" effects once
          for (var _iterator5 = _createForOfIteratorHelperLoose(this.L.filter(function (t) {
              return t.when && !_this8.fired.has(t.id) && ids(String(t.when).replace(/&/g, ',')).every(function (id) {
                return _this8.done.has(id);
              });
            })), _step5; !(_step5 = _iterator5()).done;) {
            var r = _step5.value;
            this.fired.add(r.id);
            var _loop3 = function _loop3() {
              var e = _step7.value;
              _this8.instant ? _this8.setNow(e) : _this8.clock.after(300 + e.at, function () {
                return _this8.setState(e.id, e.st, 700);
              });
            };
            for (var _iterator7 = _createForOfIteratorHelperLoose(this.effects(r.then, ',')), _step7; !(_step7 = _iterator7()).done;) {
              _loop3();
            }
          }
          var shown = waiting.filter(function (x) {
            return !_this8.unseen(x);
          });
          if (shown.length) {
            // already showing (the washer the tub slid off) or "swap" (the same picture taking over): no fade-in
            var fade = shown.filter(function (x) {
              return !(x.node.active && op(x.node).opacity > 128) && !x.swap;
            });
            this.render();
            var _loop2 = function _loop2() {
              var x = _step6.value;
              if (!x.node.active) return 1; // continue
              var o = op(x.node);
              o.opacity = 0;
              _this8.clock.anim(450, function (k) {
                return o.opacity = Math.round(255 * x.op * ease.out(k));
              });
            };
            for (var _iterator6 = _createForOfIteratorHelperLoose(fade), _step6; !(_step6 = _iterator6()).done;) {
              if (_loop2()) continue;
            }
          }
          if (this.done.size >= this.total && this.L.filter(this.counted).every(function (t) {
            return _this8.done.has(t.id);
          })) this.goEnding();
        }
        /** a target with several states fills up as its items arrive ("vol": how much room each takes, default 2) */;
        _proto.fillTarget = function fillTarget(t) {
          var _this9 = this;
          var items = this.L.filter(function (x) {
            return x.role === 'drag' && ids(x.target).includes(t.id);
          });
          if (t.states.length < 2 || !items.length) return;
          var vol = function vol(x) {
              return num(x.vol) || 2;
            },
            last = t.states.length - 1;
          var n = items.filter(function (x) {
              return _this9.done.has(x.id);
            }).reduce(function (a, x) {
              return a + vol(x);
            }, 0),
            total = items.reduce(function (a, x) {
              return a + vol(x);
            }, 0);
          var s = !n ? 0 : n >= total ? last : Math.min(last - 1, 1 + Math.floor(n / total * last));
          if (s === t.state) return;
          t.state = s;
          if (this.instant) {
            if (t.vanish && s === last) t.hidden = true;
            return;
          }
          this.showState(t);
          this.bounce(t.node, t.flip ? -1 : 1);
          if (t.vanish && s === last) this.clock.after(700, function () {
            // full: taken out of the room (the trash bag)
            var o = op(t.node),
              p = t.node.position.clone();
            _this9.clock.anim(600, function (k) {
              o.opacity = Math.round(255 * t.op * (1 - k));
              t.node.setPosition(p.x, p.y + 30 * k);
              t.node.setScale(1 - 0.2 * k, 1 - 0.2 * k, 1);
            }, function () {
              t.hidden = true;
              _this9.render();
            });
          });
        }
        /** change a layer's state (or hide / show it) with a cross-fade: the new picture fades in on top while the old one
         *  fades out in the second half, then the new picture simply replaces the old */;
        _proto.setState = function setState(id, st, dur) {
          var _this10 = this;
          var t = this.find(id);
          if (!t) return;
          if (st === 'hide' || st === 'show') {
            var show = st === 'show';
            t.hidden = !show;
            if (show) this.render();
            if (!t.node.active && !show) return;
            t.node.active = true;
            var o = op(t.node);
            this.clock.anim(Math.max(1, dur), function (k) {
              return o.opacity = Math.round(255 * t.op * (show ? k : 1 - k));
            }, function () {
              return !show && _this10.render();
            });
            return;
          }
          if (!t.states[+st]) return;
          t.state = +st;
          if (t.wet && !ids(String(t.wet).split('|')[0]).map(Number).includes(t.state)) {
            for (var _iterator8 = _createForOfIteratorHelperLoose(this.fxRoot.children.filter(function (c) {
                return c.name === 'drip';
              })), _step8; !(_step8 = _iterator8()).done;) {
              var d = _step8.value;
              d.destroy();
            }
          } // dry now: no more drops
          if (!t.node.active) return;
          var tok = t.xf = Math.random();
          var ov = node2D('xf', t.pic).addComponent(Sprite);
          ov.sizeMode = Sprite.SizeMode.CUSTOM;
          ov.node.getComponent(UITransform).setAnchorPoint(0.5, 0);
          this.place(ov, t, +st);
          var oo = op(ov.node),
            bo = op(t.base.node);
          oo.opacity = 0;
          this.clock.anim(Math.max(1, dur), function (k) {
            oo.opacity = Math.round(255 * ease.inOut(k));
            bo.opacity = Math.round(255 * (k < 0.45 ? 1 : 1 - (k - 0.45) / 0.55));
          }, function () {
            if (t.xf !== tok) return ov.node.destroy();
            t.xf = undefined;
            _this10.showState(t);
            bo.opacity = 255;
            ov.node.destroy();
          });
        }

        // ---------------------------------------------------------------- use-effects
        /** an item dropped on its target (or an act layer tapped) makes the target act while other layers change.
         *  pose: "layer:state [if a&b]; …" — the actor shows that state (rocking, or playing "frames") for "ms";
         *  sets: "layer:state[@delay][~fade] [if a&b], …" — cross-faded changes at their delays */;
        _proto.useOn = function useOn(l, tgt, x, y, sc) {
          var _this11 = this;
          if (sc === void 0) {
            sc = 1;
          }
          this.busy = true;
          this.used.add(l.id);
          this.sayCheck(); // "use:id" lines start with the action itself
          var ms = num(l.ms, 1200);
          var el = l.role === 'act' ? null : l;
          if (el) {
            if (l.sweep || l.fx || l.area) el.node.active = false; // its working copy takes over on the spot
            else if (l.pose) el.node.active = false; // handed over: in her hand in the very same frame
          }

          var pose = this.effects(l.pose, ';')[0],
            actor = pose ? this.find(pose.id) : undefined;
          var prev = null,
            cyc = null;
          if (actor && actor.states[+pose.st]) {
            prev = actor.state;
            actor.state = +pose.st;
            if (l.frames) {
              // "frames": the actor plays these states as a loop (a dumbbell curl) — "a,b,c", or per pose "1>1,30|2>2,32"
              var fsrc = String(l.frames).includes('>') ? (String(l.frames).split('|').map(function (e) {
                return e.split('>');
              }).find(function (_ref6) {
                var k = _ref6[0];
                return +k === +pose.st;
              }) || [, ''])[1] : l.frames;
              var fr = ids(fsrc).map(Number).filter(function (i) {
                return actor.states[i];
              });
              if (!fr.length) fr.push(+pose.st);
              var fms = num(l.frameMs, 200),
                blend = num(l.frameBlend);
              var i = 0;
              actor.swinging = true;
              actor.pic.setScale(1, 1, 1);
              this.place(actor.base, actor, fr[0]);
              cyc = this.clock.every(fms, function () {
                if (l.frameOnce && i === fr.length - 1) return; // play through once and hold the last frame
                var old = fr[i];
                i = (i + 1) % fr.length;
                if (blend && old !== fr[i]) {
                  var g = node2D('ghost', actor.pic).addComponent(Sprite);
                  g.sizeMode = Sprite.SizeMode.CUSTOM;
                  g.node.getComponent(UITransform).setAnchorPoint(0.5, 0);
                  _this11.place(g, actor, old);
                  var go = op(g.node);
                  _this11.clock.anim(blend, function (k) {
                    return go.opacity = Math.round(255 * (1 - ease.out(k)));
                  }, function () {
                    return g.node.destroy();
                  });
                }
                _this11.place(actor.base, actor, fr[i]);
                if (l.sweat && fr[i] === +pose.st && fr[(i + fr.length - 1) % fr.length] !== fr[i]) {
                  // top of the rep: a little lift and a sweat drop
                  _this11.clock.anim(fms * 2, function (k) {
                    return actor.pic.setPosition(0, -actor.h / 2 + 3 * Math.sin(k * Math.PI));
                  });
                  if (Math.random() < 0.7) {
                    var sx = actor.x + actor.w * (Math.random() < 0.5 ? 0.36 : 0.64),
                      sy = actor.y + actor.h * 0.1;
                    drop(_this11.fx, sx, sy, 6, [{
                      k: 0,
                      o: 0.9
                    }, {
                      k: 1,
                      tx: (Math.random() - 0.5) * 20,
                      ty: 26,
                      o: 0
                    }], 600);
                  }
                }
              });
            } else {
              this.showState(actor);
              actor.acting = true;
            }
            if (l.path) {
              // "path": the actor moves around while acting (mopping the back of the room, then the front): "dx,dy,scale,stay; …"
              var pts = String(l.path).split(';').map(function (e) {
                return e.split(',').map(Number);
              }).filter(function (e) {
                return e.length >= 3;
              });
              var setAt = function setAt(dx, dy, s) {
                actor.pic.setPosition(dx, -actor.h / 2 - dy);
                actor.pic.setScale(s, s, 1);
              };
              if (l.pathCut) {
                // time-lapse: straight from spot to spot, each held for its stay
                var t0 = 0;
                var _loop4 = function _loop4() {
                  var _arr$_i = _arr[_i],
                    dx = _arr$_i[0],
                    dy = _arr$_i[1],
                    s = _arr$_i[2],
                    stay = _arr$_i[3];
                  _this11.clock.after(t0, function () {
                    return setAt(dx, dy, s);
                  });
                  t0 += stay || 0;
                };
                for (var _i = 0, _arr = [].concat(pts, [[0, 0, 1, 0]]); _i < _arr.length; _i++) {
                  _loop4();
                }
              } else {
                var move = 600,
                  kf = [{
                    t: 0,
                    v: [0, 0, 1]
                  }];
                var tt = 0;
                for (var _iterator9 = _createForOfIteratorHelperLoose(pts), _step9; !(_step9 = _iterator9()).done;) {
                  var _step9$value = _step9.value,
                    dx = _step9$value[0],
                    dy = _step9$value[1],
                    s = _step9$value[2],
                    stay = _step9$value[3];
                  tt += move;
                  kf.push({
                    t: tt,
                    v: [dx, dy, s]
                  });
                  tt += stay || 0;
                  kf.push({
                    t: tt,
                    v: [dx, dy, s]
                  });
                }
                tt += move;
                kf.push({
                  t: tt,
                  v: [0, 0, 1]
                });
                this.clock.anim(tt, function (k) {
                  var now = k * tt;
                  var i = 0;
                  while (i < kf.length - 2 && kf[i + 1].t < now) i++;
                  var a = kf[i],
                    b = kf[i + 1],
                    f = ease.inOut(b.t > a.t ? (now - a.t) / (b.t - a.t) : 1);
                  setAt(a.v[0] + (b.v[0] - a.v[0]) * f, a.v[1] + (b.v[1] - a.v[1]) * f, a.v[2] + (b.v[2] - a.v[2]) * f);
                });
              }
            }
          } else if (el && (l.sweep || l.fx || l.area)) this.selfAct(l, ms, tgt);else if (el && tgt) {
            // it goes into its target (put on, unlocked)
            var from = l.node.position.clone(),
              to = at(tgt.x + tgt.w / 2, tgt.y + tgt.h * 0.35),
              o = op(l.node);
            l.moving = true;
            this.clock.anim(300, function (k) {
              l.node.setPosition(from.clone().lerp(to, k));
              var s = sc + (0.3 * sc - sc) * k;
              l.node.setScale((l.flip ? -1 : 1) * s, s, 1);
              o.opacity = Math.round(255 * (1 - k));
            }, function () {
              l.moving = false;
              l.node.active = false;
            });
          }
          var last = 0;
          var list = this.effects(l.sets, ','),
            timed = list.some(function (e) {
              return e.at;
            });
          var ar = String(l.area || '').split(',').map(Number),
            lit = new Set();
          var _loop5 = function _loop5() {
            var e = _step10.value;
            last = Math.max(last, e.at);
            _this11.clock.after(e.at, function () {
              _this11.setState(e.id, e.st, e.dur || (timed ? 450 : ms * 0.9));
              // twinkles with the change itself (once per layer): where the tool worked, or over the whole changing thing
              var t = _this11.find(e.id);
              if (l.quiet || !t || t.hidden || lit.has(t.id) || isNaN(+e.st) || t.role === 'toggle') return;
              lit.add(t.id);
              if (ar.length === 4 && !ar.some(isNaN)) sparkle(_this11.fx, {
                x: ar[0],
                y: ar[1],
                w: ar[2],
                h: ar[3]
              });else if (t.w * t.h > 200000) sparkleOver(_this11.fx, _this11.opaqueBox(t), function (px, py) {
                return _this11.opaque(t, px, py);
              });else sparkle(_this11.fx, _this11.opaqueBox(t), !!l.shine);
            });
          };
          for (var _iterator10 = _createForOfIteratorHelperLoose(list), _step10; !(_step10 = _iterator10()).done;) {
            _loop5();
          }
          if (l.bubbles) {
            // "x,y,w,from,to": soap bubbles drift up from the foam between those ms (the soak)
            var _String$split$map = String(l.bubbles).split(',').map(Number),
              bx = _String$split$map[0],
              by = _String$split$map[1],
              bw = _String$split$map[2],
              b0 = _String$split$map[3],
              b1 = _String$split$map[4];
            this.clock.after(b0 || 0, function () {
              var iv = _this11.clock.every(170, function () {
                return bubble(_this11.fx, bx + Math.random() * bw, by);
              });
              _this11.clock.after((b1 || ms) - (b0 || 0), function () {
                return iv.stop();
              });
            });
          }
          var end = Math.max(ms, last + 520);
          this.clock.after(end, function () {
            var _cyc;
            (_cyc = cyc) == null || _cyc.stop();
            if (actor) {
              actor.swinging = false;
              actor.acting = false;
              actor.pic.angle = 0;
              actor.pic.setPosition(0, -actor.h / 2);
              actor.pic.setScale(1, 1, 1);
              if (prev != null && !list.some(function (e) {
                return e.id === actor.id;
              })) actor.state = prev; // unless the effects changed the actor itself
              actor.xf = undefined;
              _this11.showState(actor);
            }
            _this11.busy = false;
            _this11.markDone(l);
            _this11.render();
          });
        }

        /** an item acting by itself (spray bottle, dryer, wrench, comb, hammer): a copy of it works over its area while
         *  the covers that wait for it (the foam) are sprayed in along its path */;
        _proto.selfAct = function selfAct(l, ms, tgt) {
          var _this12 = this;
          var _ref7 = l.hot || [0.5, 0.05],
            hx = _ref7[0],
            hy = _ref7[1];
          var t0 = tgt || this.L.find(function (t) {
            return ids(l.target).includes(t.id);
          }) || null;
          var ar = String(l.area || '').split(',').map(Number).filter(function (v) {
            return !isNaN(v);
          });
          var bb = ar.length === 4 ? {
            x: ar[0],
            y: ar[1],
            w: ar[2],
            h: ar[3]
          } : t0 ? this.opaqueBox(t0) : {
            x: l.x - 80,
            y: l.y,
            w: 160,
            h: l.h
          };
          var x0 = bb.x + Math.min(40, bb.w * 0.1),
            x1 = bb.x + bb.w - Math.min(40, bb.w * 0.1);
          var rows = [bb.y + bb.h * 0.28, bb.y + bb.h * 0.74],
            rad = Math.max(90, bb.h * 0.42);
          var covers = this.L.filter(function (t) {
            return t.role === 'wipe' && t.hideUntil && ids(t.req).includes(l.id);
          });
          this.away.add(l.id);
          this.markDone(l); // the covers become visible…
          for (var _iterator11 = _createForOfIteratorHelperLoose(covers), _step11; !(_step11 = _iterator11()).done;) {
            var c = _step11.value;
            this.coverOf(c, false);
          } // …but empty
          var frame = this.env.frames.get((l.states[l.state] || l.states[0])[0]);
          if (l.fx === 'cloud') return repairCloud(this.fx, frame, bb, ms);
          if (l.fx === 'salon') return salonCloud(this.fx, frame, l.fxImgs ? this.env.frames.get(l.fxImgs[0]) : undefined, bb, ms);
          if (l.fx === 'smash') {
            var tn = this.find(ids(l.target)[0] || '');
            return smashFx(this.fx, frame, l.w, l.h, l.grip || [0.88, 0.76], l.face || [0.07, 0.43], bb, ms, tn ? tn.node : null);
          }
          // the working copy: tilted, pulsing like the trigger is squeezed, pivoting on its working end
          var piv = node2D('worker', this.fxRoot);
          var pic = fxSprite(this.fx, undefined, 0, 0, l.w, l.h, piv);
          var sp = pic.addComponent(Sprite);
          sp.sizeMode = Sprite.SizeMode.CUSTOM;
          sp.spriteFrame = frame;
          var f = this.fit(l, l.state);
          pic.getComponent(UITransform).setContentSize(f.dw, f.dh);
          // the picture's centre relative to the working end ("hot", fractions of the layer box)
          pic.setPosition(f.ox + f.dw / 2 - l.w * hx, -(f.oy + f.dh / 2 - l.h * hy));
          var sm = function sm(v) {
            return v < 0 ? 0 : v > 1 ? 1 : v * v * (3 - 2 * v);
          };
          var pathAt = function pathAt(t) {
            var half = t < 0.5,
              u = half ? t * 2 : (t - 0.5) * 2;
            return [half ? x0 + (x1 - x0) * u : x1 - (x1 - x0) * u, rows[0] + (rows[1] - rows[0]) * sm((t - 0.45) / 0.1)];
          };
          var lastPuff = 0;
          this.clock.anim(ms, function (t) {
            var _pathAt = pathAt(t),
              px = _pathAt[0],
              py = _pathAt[1],
              k = Math.sin(t * Math.PI * 6),
              now = _this12.clock.now;
            piv.setPosition(at(px, py));
            piv.angle = -(-12 + k * 5);
            piv.setScale(1.25, 1.25 * (1 - 0.06 * Math.abs(Math.sin(now / 70))), 1);
            for (var _iterator12 = _createForOfIteratorHelperLoose(covers), _step12; !(_step12 = _iterator12()).done;) {
              var c = _step12.value;
              _this12.revealAt(c, px - 25, py - 20, rad);
            }
            if (l.fx === 'air' && now - lastPuff > 55) {
              lastPuff = now;
              dryerGust(_this12.fx, px, py);
            } else if (l.fx === 'sparkle' && now - lastPuff > 160) {
              lastPuff = now;
              twinkles(_this12.fx, {
                x: px - 30,
                y: py - 20,
                w: 60,
                h: 40
              }, 1, 0);
            } else if (!l.fx && now - lastPuff > 35) {
              lastPuff = now;
              for (var i = 0; i < 3; i++) mist(_this12.fx, px, py);
            }
          }, function () {
            var _loop6 = function _loop6() {
              var c = _step13.value;
              var _loop7 = function _loop7(i) {
                _this12.clock.after(i * 60, function () {
                  var _c$cover, _c$cover2;
                  return i === 6 ? (_c$cover = c.cover) == null ? void 0 : _c$cover.revealAll(1) : (_c$cover2 = c.cover) == null ? void 0 : _c$cover2.revealAll(0.3);
                });
              };
              for (var i = 1; i <= 6; i++) {
                _loop7(i);
              }
            };
            for (var _iterator13 = _createForOfIteratorHelperLoose(covers), _step13; !(_step13 = _iterator13()).done;) {
              _loop6();
            }
            var o = op(piv);
            _this12.clock.anim(250, function (k) {
              return o.opacity = Math.round(255 * (1 - k));
            }, function () {
              return piv.destroy();
            });
          });
        }

        // ---------------------------------------------------------------- covers (wipe)
        /** the soft mask of a cover (and of the layers it takes along: "with"); revealed: shown at once (the wall) */;
        _proto.coverOf = function coverOf(l, revealed) {
          if (l.cover) return l.cover;
          var f = this.fit(l, l.state);
          l.cover = new Cover(l.base, this.env.effect, l.x + f.ox, l.y + f.oy, f.dw, f.dh, revealed);
          var host = l.role === 'wipe' ? l : null;
          if (host) {
            for (var _iterator14 = _createForOfIteratorHelperLoose(ids(l["with"])), _step14; !(_step14 = _iterator14()).done;) {
              var id = _step14.value;
              var w = this.find(id);
              if (w) this.coverOf(w, true);
            }
            // coverage grid (10 px cells) over the opaque part
            var cells = new Map();
            for (var y = l.y + 5; y < l.y + l.h; y += 10) for (var x = l.x + 5; x < l.x + l.w; x += 10) if (this.opaque(l, x, y)) cells.set(Math.round(x) + ',' + Math.round(y), [x, y]);
            l.cells = cells;
            l.totalCells = cells.size || 1;
          }
          return l.cover;
        }
        /** paint the cover's picture in around a point: a few feathered blobs (a soft, puffy edge) */;
        _proto.revealAt = function revealAt(l, x, y, rad) {
          var c = this.coverOf(l, false);
          for (var i = 0; i < 4; i++) {
            var br = rad * (0.35 + Math.random() * 0.4),
              bx = x + (Math.random() - 0.5) * rad * 1.1,
              by = y + (Math.random() - 0.5) * rad * 1.1;
            c.stamp(bx, by, br, 'reveal');
          }
        };
        _proto.wipeAt = function wipeAt(w, x, y, rad, moved) {
          var _this13 = this;
          var cells = w.cells;
          if (!w.cover || !cells || this.done.has(w.id)) return;
          for (var _i2 = 0, _arr2 = [w.id].concat(ids(w["with"])); _i2 < _arr2.length; _i2++) {
            var id = _arr2[_i2];
            var _l4 = this.find(id);
            if (_l4 != null && _l4.cover && !_l4.cover.finished) _l4.cover.stamp(x, y, rad, 'wipe');
          }
          for (var _iterator15 = _createForOfIteratorHelperLoose(cells), _step15; !(_step15 = _iterator15()).done;) {
            var _step15$value = _step15.value,
              _k4 = _step15$value[0],
              _step15$value$ = _step15$value[1],
              cx = _step15$value$[0],
              cy = _step15$value$[1];
            if (Math.hypot(cx - x, cy - y) < rad * 0.8) cells["delete"](_k4);
          }
          if (moved > 3 && Math.random() < 0.35) bubble(this.fx, x, y);
          if (cells.size / w.totalCells < 0.15) {
            // close enough: the rest fades away; the layers taken along end on their last (clean) state
            this.markDone(w);
            var _loop8 = function _loop8() {
              var id = _arr3[_i3];
              var l = _this13.find(id);
              if (!(l != null && l.cover)) return 1; // continue
              l.cover.finished = true;
              var o = op(l.base.node);
              _this13.clock.anim(500, function (k) {
                return o.opacity = Math.round(255 * (1 - k));
              }, function () {
                if (id === w.id) return;
                l.state = l.states.length - 1;
                l.cover.dispose();
                l.cover = undefined;
                o.opacity = 255;
                _this13.showState(l);
              });
            };
            for (var _i3 = 0, _arr3 = [w.id].concat(ids(w["with"])); _i3 < _arr3.length; _i3++) {
              if (_loop8()) continue;
            }
            sparkleOver(this.fx, this.opaqueBox(w), function (px, py) {
              return _this13.opaque(w, px, py);
            });
          }
        }

        // ---------------------------------------------------------------- press and hold (the bath tap)
        /** water runs from "leak" while held; the first "sets" change fades in with the time held ("ms" in all) and is
         *  applied when full; letting go pauses it where it is */;
        _proto.holdDown = function holdDown(l) {
          var _this14 = this;
          var ms = num(l.ms, 2000),
            fill = this.effects(l.sets, ',')[0],
            tgt = fill ? this.find(fill.id) : null;
          var prog = this.hp[l.id] || 0,
            on = true,
            lastDrop = 0;
          var ov = null;
          if (tgt && tgt.states[+fill.st]) {
            var _tgt$pic$getChildByNa;
            ov = ((_tgt$pic$getChildByNa = tgt.pic.getChildByName('fillov')) == null ? void 0 : _tgt$pic$getChildByNa.getComponent(Sprite)) || null;
            if (!ov) {
              ov = node2D('fillov', tgt.pic).addComponent(Sprite);
              ov.sizeMode = Sprite.SizeMode.CUSTOM;
              ov.node.getComponent(UITransform).setAnchorPoint(0.5, 0);
              this.place(ov, tgt, +fill.st);
              op(ov.node).opacity = 0;
            }
          }
          var _String$split$map2 = String(l.leak || '').split(',').map(Number),
            sx = _String$split$map2[0],
            sy = _String$split$map2[1],
            floor = tgt ? tgt.y + tgt.h * 0.12 : sy + 30;
          var rg = ring(this.fx, l.x + l.w / 2, l.y - 14, 26);
          var stopAll = function stopAll() {
            on = false;
          };
          this.grab = {
            up: stopAll,
            move: function move() {}
          };
          var run = this.clock.anim(100000, function () {
            var _ov;
            if (!on) {
              _this14.hp[l.id] = prog;
              rg.n.destroy();
              run.stop();
              return;
            }
            prog = Math.min(1, prog + 1000 / 60 / ms);
            rg.draw(prog);
            if (ov) op(ov.node).opacity = Math.round(255 * prog);
            var now = _this14.clock.now;
            if (!isNaN(sx) && now - lastDrop > 40) {
              // the stream falls from the spout into the tub
              lastDrop = now;
              var _loop9 = function _loop9() {
                var x = sx + (Math.random() - 0.5) * 3,
                  n = streak(_this14.fx, x, sy, 9 + Math.random() * 6, 3 + Math.random() * 2);
                n.angle = -90;
                play(_this14.clock, n, x, sy, [{
                  k: 0,
                  o: 0.95
                }, {
                  k: 0.92,
                  ty: floor - sy,
                  o: 0.9
                }, {
                  k: 1,
                  ty: floor - sy,
                  o: 0
                }], 260 + Math.random() * 60, ease["in"], function () {
                  return n.destroy();
                });
                n.angle = -90;
              };
              for (var i = 0; i < 2; i++) {
                _loop9();
              }
              if (Math.random() < 0.4) drop(_this14.fx, sx + (Math.random() - 0.5) * 14, floor, 3 + Math.random() * 3, [{
                k: 0,
                o: 0.9
              }, {
                k: 1,
                tx: (Math.random() - 0.5) * 18,
                ty: -(5 + Math.random() * 7),
                o: 0
              }], 260);
            }
            if (prog < 1) return;
            on = false;
            run.stop();
            rg.n.destroy();
            if (_this14.grab && _this14.grab.up === stopAll) _this14.grab = null;
            _this14.hp[l.id] = 1;
            for (var _iterator16 = _createForOfIteratorHelperLoose(_this14.effects(l.sets, ',')), _step16; !(_step16 = _iterator16()).done;) {
              var e = _step16.value;
              _this14.setNow(e);
            }
            (_ov = ov) == null || _ov.node.destroy();
            _this14.markDone(l);
            _this14.render();
            if (tgt) for (var _i4 = 0; _i4 < 6; _i4++) _this14.clock.after(_i4 * 70, function () {
              return steamPuff(_this14.fx, tgt, 1.3);
            }); // a first cloud of steam
          });
        }

        // ---------------------------------------------------------------- swipe right (the tub)
        /** the picture switches to its cut-out and follows the finger to the right, hidden past "clip" (the doorway); the
         *  "reveal" layer behind it shows meanwhile. Far enough → it slides away and its "sets" apply */;
        _proto.swipeDown = function swipeDown(l, sx) {
          var _this15 = this;
          var cr = String(l.clip || '').split(',').map(Number);
          var rv = l.reveal ? this.find(l.reveal) : null;
          if (rv) {
            rv.node.active = true;
            op(rv.node).opacity = 255;
          }
          if (l.states[1]) this.place(l.base, l, 1);
          // a clip box (the doorway) the tub may not show past: the layer moves into a masked holder meanwhile
          var holder = null;
          if (cr.length === 4) {
            holder = node2D('clip', this.layerRoot, W, H);
            holder.setSiblingIndex(l.node.getSiblingIndex());
            var m = holder.addComponent(Mask);
            m.type = Mask.Type.GRAPHICS_STENCIL;
            var g = holder.getComponent(Graphics);
            g.clear();
            g.rect(cr[0] - W / 2, H / 2 - cr[1] - cr[3], cr[2], cr[3]);
            g.fill();
            l.node.setParent(holder);
          }
          l.moving = true;
          var dx = 0;
          var place = function place(d) {
            dx = d;
            l.node.setPosition(at(l.x + d + l.w / 2, l.y + l.h / 2));
          };
          var unclip = function unclip() {
            if (!holder) return;
            l.node.setParent(_this15.layerRoot);
            l.node.setSiblingIndex(_this15.orderOf(l));
            holder.destroy();
            holder = null;
          };
          this.grab = {
            move: function move(x) {
              return place(Math.max(-4, x - sx));
            },
            up: function up() {
              var from = dx;
              if (dx > l.w * 0.22) {
                // pushed far enough: it slides away behind the door frame
                _this15.busy = true;
                _this15.clock.anim(320, function (k) {
                  return place(from + (l.w + 8 - from) * k * k);
                }, function () {
                  l.node.active = false;
                  unclip();
                  l.moving = false;
                  _this15.busy = false;
                  for (var _iterator17 = _createForOfIteratorHelperLoose(_this15.effects(l.sets, ',')), _step17; !(_step17 = _iterator17()).done;) {
                    var x = _step17.value;
                    _this15.setState(x.id, x.st, x.dur || 300);
                  }
                  _this15.markDone(l);
                });
              } else _this15.clock.anim(220, function (k) {
                return place(from * (1 - k));
              }, function () {
                unclip();
                l.moving = false;
                _this15.showState(l);
                if (rv && _this15.unseen(rv)) rv.node.active = false;
              });
            }
          };
        }

        // ---------------------------------------------------------------- the washer
        /** a full laundry basket dropped on the washer: it tips over the porthole and the clothes go in, then the wash runs */;
        _proto.dumpWash = function dumpWash(l) {
          var _this16 = this;
          var w = this.find(l.wash),
            _String$split$map3 = String((w == null ? void 0 : w.drum) || '').split(',').map(Number),
            dx = _String$split$map3[0],
            dy = _String$split$map3[1];
          this.busy = true;
          var cx = isNaN(dx) ? w.x + w.w / 2 : dx,
            cy = isNaN(dy) ? w.y + w.h / 2 : dy;
          var from = l.node.position.clone(),
            s0 = Math.abs(l.node.scale.x),
            to = at(cx, cy - l.h * 0.25); // the basket's lower middle over the drum
          l.moving = true;
          this.clock.anim(320, function (k) {
            return l.node.setPosition(from.clone().lerp(to, ease.out(k)));
          }, function () {
            var o = op(l.node);
            _this16.clock.anim(650, function (k) {
              var r = k < 0.45 ? -35 * k / 0.45 : -35,
                s = s0 * (k < 0.45 ? 1 - 0.05 * (k / 0.45) : 0.95 - 0.35 * ((k - 0.45) / 0.55));
              l.node.angle = -r;
              l.node.setScale(s, s, 1);
              o.opacity = Math.round(255 * (k < 0.45 ? 1 : 1 - (k - 0.45) / 0.55));
            });
            for (var i = 0; i < 6; i++) _this16.clock.after(i * 80, function () {
              return bubble(_this16.fx, cx + (Math.random() - 0.5) * 30, cy + l.h * 0.05);
            });
            _this16.clock.after(650, function () {
              l.node.active = false;
              l.moving = false;
              _this16.washRun(l, function () {
                for (var _iterator18 = _createForOfIteratorHelperLoose(_this16.effects(l.sets, ',')), _step18; !(_step18 = _iterator18()).done;) {
                  var x = _step18.value;
                  _this16.setState(x.id, x.st, 300);
                }
                _this16.busy = false;
                _this16.markDone(l);
              });
            });
          });
        };
        _proto.washRun = function washRun(l, done) {
          var _this17 = this;
          var w = this.find(l.wash);
          var _String$split$map4 = String((w == null ? void 0 : w.drum) || '').split(',').map(Number),
            dx = _String$split$map4[0],
            dy = _String$split$map4[1],
            dr = _String$split$map4[2];
          if (!w || isNaN(dr)) return done();
          var p0 = w.node.position.clone();
          var SH = [[0, 0], [-1.5, 0.5], [1.5, -0.5], [-1, -0.5], [0, 0]];
          var drum = node2D('drum', this.fxRoot);
          drum.setPosition(at(dx, dy));
          var spin = fxSprite(this.fx, this.env.fx.get('drum'), 0, 0, dr * 2.2, dr * 2.2, drum);
          spin.setPosition(0, 0);
          // the porthole: a round mask so the swirl never leaves the glass
          var mask = drum.addComponent(Mask);
          mask.type = Mask.Type.GRAPHICS_STENCIL;
          var mg = drum.getComponent(Graphics);
          mg.clear();
          mg.circle(0, 0, dr);
          mg.fill();
          var gloss = fxSprite(this.fx, this.env.fx.get('drum-gloss'), 0, 0, dr * 2, dr * 2, drum);
          gloss.setPosition(0, 0);
          var dop = op(drum);
          this.clock.anim(300, function (k) {
            return dop.opacity = Math.round(255 * k);
          });
          var run = this.clock.anim(100000, function () {
            var t = _this17.clock.now,
              _SH = SH[Math.floor(t / 28) % 5],
              sx = _SH[0],
              sy = _SH[1];
            w.node.setPosition(p0.x + sx, p0.y - sy); // the machine rattles…
            drum.setPosition(at(dx + sx, dy + sy)); // …and the drum stays in its porthole
            spin.angle = -(t / 520 * 360) % 360;
          });
          var bub = this.clock.every(90, function () {
            // suds foam out around the porthole
            var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4,
              r = dr * (1.05 + Math.random() * 0.3);
            bubble(_this17.fx, dx + Math.cos(a) * r, dy + Math.sin(a) * r * 0.9);
          });
          this.clock.after(2200, function () {
            bub.stop();
            run.stop();
            w.node.setPosition(p0);
            _this17.clock.anim(250, function (k) {
              return dop.opacity = Math.round(255 * (1 - k));
            }, function () {
              return drum.destroy();
            });
            var g = _this17.find(l.gives);
            if (!g) return done();
            // the gown flies out of the drum and lands on the washer
            var fly = fxSprite(_this17.fx, undefined, g.x + g.w / 2, g.y + g.h / 2, g.w, g.h);
            var fs = fly.addComponent(Sprite);
            fs.sizeMode = Sprite.SizeMode.CUSTOM;
            _this17.place(fs, g, g.state);
            fs.node.getComponent(UITransform).setAnchorPoint(0.5, 0);
            fs.node.setPosition(0, -g.h / 2);
            var ox = dx - (g.x + g.w / 2),
              oy = dy - (g.y + g.h / 2),
              mx = ox * 0.5,
              my = Math.min(oy, 0) - 70;
            play(_this17.clock, fly, g.x + g.w / 2, g.y + g.h / 2, [{
              k: 0,
              tx: ox,
              ty: oy,
              sx: 0.25,
              sy: 0.25,
              r: -20,
              o: 0
            }, {
              k: 0.2,
              tx: ox,
              ty: oy - 18,
              sx: 0.45,
              sy: 0.45,
              r: -10,
              o: 1
            }, {
              k: 0.6,
              tx: mx,
              ty: my,
              sx: 0.85,
              sy: 0.85,
              r: 8
            }, {
              k: 1,
              sx: 1,
              sy: 1,
              o: 1
            }], 900, ease.inOut);
            _this17.clock.after(920, function () {
              done();
              sparkle(_this17.fx, {
                x: g.x - 10,
                y: g.y,
                w: g.w + 20,
                h: g.h
              });
              _this17.clock.after(60, function () {
                return fly.destroy();
              });
            });
          });
        }

        // ---------------------------------------------------------------- idle life, water, steam (background loops)
        ;

        _proto.blinkTick = function blinkTick() {
          var _this18 = this;
          if (this.busy) return;
          var now = this.clock.now;
          var _loop10 = function _loop10() {
              var l = _step19.value;
              var m = String(l.blink).split(',').map(function (v) {
                return v.split(':').map(Number);
              }).find(function (_ref8) {
                var a = _ref8[0];
                return a === l.state;
              });
              if (!m || l.xf || l.swinging) return 0; // continue
              if (!_this18.blinkAt[l.id]) {
                _this18.blinkAt[l.id] = now + 1500 + Math.random() * 2500;
                return 0; // continue
              }

              if (now < _this18.blinkAt[l.id]) return 0; // continue
              var twice = Math.random() < 0.25;
              _this18.blinkAt[l.id] = now + 2200 + Math.random() * 3000 + (twice ? 400 : 0);
              if (!l.states[m[1]]) return 0; // continue
              var shut = function shut() {
                if (l.state !== m[0] || l.xf || l.swinging) return;
                _this18.place(l.base, l, m[1]);
                _this18.clock.after(130, function () {
                  if (l.state === m[0] && !l.xf && !l.swinging) _this18.showState(l);
                });
              };
              shut();
              if (twice) _this18.clock.after(280, shut);
            },
            _ret2;
          for (var _iterator19 = _createForOfIteratorHelperLoose(this.L.filter(function (t) {
              return t.blink && t.node.active;
            })), _step19; !(_step19 = _iterator19()).done;) {
            _ret2 = _loop10();
            if (_ret2 === 0) continue;
          }
        };
        _proto.steamTick = function steamTick() {
          for (var _iterator20 = _createForOfIteratorHelperLoose(this.L.filter(function (t) {
              return t.steam != null && ids(String(t.steam)).map(Number).includes(t.state);
            })), _step20; !(_step20 = _iterator20()).done;) {
            var _l5 = _step20.value;
            if (_l5.node.active && !_l5.hidden && Math.random() < 0.8) steamPuff(this.fx, _l5);
          }
        }
        /** a burst pipe: a layer with "leak" ("x,y") sprays a dense arc of water while it is visible */;
        _proto.leakTick = function leakTick() {
          var _this19 = this;
          if (this.fxRoot.children.length > 260) return; // never pile up
          var _loop11 = function _loop11() {
            var l = _step21.value;
            if (!l.node.active || l.hidden || _this19.done.has(l.id)) return 1; // continue
            var _String$split$map5 = String(l.leak).split(',').map(Number),
              lx = _String$split$map5[0],
              ly = _String$split$map5[1];
            var _loop12 = function _loop12() {
              var isStreak = i < 4,
                r = isStreak ? 3 + Math.random() * 2 : 3 + Math.random() * 4;
              var vx = 85 + Math.random() * (isStreak ? 15 : 40),
                up = 8 + Math.random() * 8,
                fall = 92 + Math.random() * (isStreak ? 12 : 30),
                dur = 480 + Math.random() * 120;
              var P = function P(t) {
                return [vx * t, -up * 4 * t * (1 - t) + fall * t * t];
              };
              var y0 = ly + (Math.random() - 0.5) * 4;
              var n = isStreak ? streak(_this19.fx, lx, y0, 10 + Math.random() * 8, r) : drop(_this19.fx, lx, y0, r, [], 1);
              var kfs = [0, 0.2, 0.4, 0.6, 0.8, 1].map(function (t) {
                var _P = P(t),
                  x = _P[0],
                  y = _P[1],
                  _P2 = P(Math.min(1, t + 0.05)),
                  x2 = _P2[0],
                  y2 = _P2[1];
                return {
                  k: t,
                  tx: x,
                  ty: y,
                  r: isStreak ? Math.atan2(y2 - y, x2 - x) * 180 / Math.PI : 0,
                  o: t < 0.9 ? 0.95 : 0
                };
              });
              play(_this19.clock, n, lx, y0, kfs, dur, ease.linear, function () {
                if (Math.random() < 0.15) {
                  var _P3 = P(1),
                    x = _P3[0],
                    y = _P3[1];
                  drop(_this19.fx, lx + x, ly + y, 3 + Math.random() * 3, [{
                    k: 0,
                    o: 0.9
                  }, {
                    k: 1,
                    tx: (Math.random() - 0.3) * 16,
                    ty: -(6 + Math.random() * 8),
                    o: 0
                  }], 260);
                }
                n.destroy();
              });
            };
            for (var i = 0; i < 6; i++) {
              _loop12();
            }
            if (Math.random() < 0.35) {
              var s = 14 + Math.random() * 10,
                m = fxSprite(_this19.fx, _this19.env.fx.get('mist'), lx + 6, ly, s);
              play(_this19.clock, m, lx + 6, ly, [{
                k: 0,
                sx: 0.4,
                sy: 0.4,
                o: 0.9
              }, {
                k: 1,
                tx: 10 + Math.random() * 14,
                ty: (Math.random() - 0.5) * 12,
                sx: 1.3,
                sy: 1.3,
                o: 0
              }], 380, ease.linear, function () {
                return m.destroy();
              });
            }
          };
          for (var _iterator21 = _createForOfIteratorHelperLoose(this.L.filter(function (t) {
              return t.leak && t.role !== 'hold';
            })), _step21; !(_step21 = _iterator21()).done;) {
            if (_loop11()) continue;
          }
        }
        /** wet hair: "wet" ("states|x,y x,y …") — now and then a small drop gathers at a hair tip and falls */;
        _proto.wetTick = function wetTick() {
          var _this20 = this;
          var _loop13 = function _loop13() {
            var l = _step22.value;
            var _String$split = String(l.wet).split('|'),
              sts = _String$split[0],
              pts = _String$split[1];
            if (!ids(sts).map(Number).includes(l.state) || !l.node.active || l.hidden || l.acting) return 1; // continue
            var tips = pts.trim().split(/\s+/).map(function (p) {
              return p.split(',').map(Number);
            });
            if (Math.random() < 0.3) {
              var _tips$Math$floor = tips[Math.floor(Math.random() * tips.length)],
                x = _tips$Math$floor[0],
                y = _tips$Math$floor[1],
                r = 3 + Math.random() * 1.5,
                fall = 22 + Math.random() * 18;
              var d = fxSprite(_this20.fx, _this20.env.fx.get('drip'), x, y, r, r * 1.2);
              d.name = 'drip';
              play(_this20.clock, d, x, y, [{
                k: 0,
                sx: 0.2,
                sy: 0.2,
                o: 0
              }, {
                k: 0.55,
                sx: 1,
                sy: 1,
                o: 0.8
              }, {
                k: 0.7,
                ty: 2,
                sx: 0.95,
                sy: 1.2,
                o: 0.8
              }, {
                k: 1,
                ty: fall,
                sx: 0.8,
                sy: 1.4,
                o: 0
              }], 1600, ease["in"], function () {
                return d.destroy();
              });
            }
          };
          for (var _iterator22 = _createForOfIteratorHelperLoose(this.L.filter(function (t) {
              return t.wet;
            })), _step22; !(_step22 = _iterator22()).done;) {
            if (_loop13()) continue;
          }
        }

        // ---------------------------------------------------------------- Chloe's lines
        /** a layer with "lines" ("when|中文|English" per line) speaks in a bubble above its head. when = "start" | a layer id
         *  (that step done) | "use:a" (the moment a is used) | "any:a,b" | "all:a,b" | "phase:1"; each line once, in order */;
        _proto.sayRules = function sayRules() {
          return this.L.filter(function (t) {
            return t.lines;
          }).flatMap(function (t) {
            return String(t.lines).split('\n').map(function (r) {
              return r.trim();
            }).filter(Boolean).map(function (r, i) {
              var _r$split$map = r.split('|').map(function (v) {
                  return (v || '').trim();
                }),
                when = _r$split$map[0],
                zh = _r$split$map[1],
                en = _r$split$map[2];
              return {
                who: t.id,
                key: t.id + ':' + i,
                when: when,
                text: zh,
                en: en,
                voice: t.voices && en ? t.voices[en] : undefined
              };
            });
          });
        };
        _proto.sayMet = function sayMet(w) {
          var _this21 = this;
          if (w === 'start') return true;
          var _ref9 = w.includes(':') ? [w.slice(0, w.indexOf(':')), w.slice(w.indexOf(':') + 1)] : ['one', w],
            kind = _ref9[0],
            rest = _ref9[1];
          if (kind === 'use') return ids(rest).some(function (id) {
            return _this21.done.has(id) || _this21.used.has(id);
          });
          if (kind === 'any') return ids(rest).some(function (id) {
            return _this21.done.has(id);
          });
          if (kind === 'all') return ids(rest).every(function (id) {
            return _this21.done.has(id);
          });
          if (kind === 'phase') return this.L.filter(function (t) {
            return _this21.counted(t) && _this21.phaseOf(t) === +rest;
          }).every(function (t) {
            return _this21.done.has(t.id);
          });
          return this.done.has(rest);
        };
        _proto.sayCheck = function sayCheck() {
          if (this.instant) return;
          for (var _iterator23 = _createForOfIteratorHelperLoose(this.sayRules()), _step23; !(_step23 = _iterator23()).done;) {
            var r = _step23.value;
            if (!this.said.has(r.key) && this.sayMet(r.when)) {
              this.said.add(r.key);
              this.sayQ.push(r);
            }
          }
          if (!this.saying) this.sayNext();
        }
        /** stop her talking now: the voice, any bubble on screen and the queue */;
        _proto.hush = function hush() {
          var _this$voiceSrc, _this$sayRoot;
          this.sayGen++;
          (_this$voiceSrc = this.voiceSrc) == null || _this$voiceSrc.stop();
          (_this$sayRoot = this.sayRoot) == null || _this$sayRoot.removeAllChildren();
          this.sayQ = [];
          this.saying = false;
        };
        _proto.sayNext = function sayNext() {
          var _this22 = this;
          var r = this.sayQ.shift();
          if (!r) {
            this.saying = false;
            return;
          }
          this.saying = true;
          var gen = this.sayGen;
          var go = function go() {
            if (gen !== _this22.sayGen) return;
            var who = _this22.find(r.who);
            if (!who || who.hidden || !who.node.active || _this22.busy && !r.when.startsWith('use:')) return _this22.clock.after(300, go); // wait while she is off stage / busy
            var bb = _this22.opaqueBox(who);
            var en = _this22.env.lang === 'en' && r.en,
              text = en ? r.en : r.text;
            var clip = en && r.voice ? _this22.env.voices.get(r.voice) : undefined;
            if (clip) {
              _this22.voiceSrc.stop();
              _this22.voiceSrc.clip = clip;
              _this22.voiceSrc.play();
            }
            var b = _this22.bubbleBox(text, bb);
            var stay = Math.max(1600 + text.length * (en ? 45 : 90), clip ? clip.getDuration() * 1000 + 500 : 0);
            _this22.clock.after(stay, function () {
              var o = op(b),
                p = b.position.clone();
              _this22.clock.anim(320, function (k) {
                o.opacity = Math.round(255 * (1 - k));
                b.setPosition(p.x, p.y + 6 * k);
              }, function () {
                b.destroy();
                if (gen === _this22.sayGen) _this22.clock.after(250, function () {
                  return _this22.sayNext();
                });
              });
            });
          };
          this.clock.after(350, go);
        }
        /** the speech bubble: cream rounded box, ink outline, a tail pointing at her head (the editor's .fx.say) */;
        _proto.bubbleBox = function bubbleBox(text, bb) {
          var root = node2D('say', this.sayRoot);
          var lbN = node2D('t', root);
          var lb = lbN.addComponent(Label);
          lb.string = text;
          lb.fontSize = 27;
          lb.lineHeight = 35;
          lb.isBold = true;
          lb.color = INK2;
          lb.horizontalAlign = Label.HorizontalAlign.CENTER;
          lb.verticalAlign = Label.VerticalAlign.CENTER;
          lb.overflow = Label.Overflow.NONE;
          lb.updateRenderData(true);
          var tw = lbN.getComponent(UITransform).width;
          if (tw > 520) {
            lb.overflow = Label.Overflow.RESIZE_HEIGHT;
            lbN.getComponent(UITransform).width = 520;
            lb.updateRenderData(true);
            tw = 520;
          }
          var th = lbN.getComponent(UITransform).height;
          var w = tw + 40,
            h = th + 20;
          var x = Math.max(8, Math.min(720 - w - 8, bb.x + bb.w * 0.58 - w / 2)),
            y = Math.max(8, bb.y - h - 14);
          var tail = Math.max(14, Math.min(w - 14, bb.x + bb.w * 0.5 - x));
          root.setPosition(at(x + tail, y + h)); // pivot at the tail (it pops out of there)
          var bgN = node2D('bg', root),
            g = bgN.addComponent(Graphics);
          bgN.setSiblingIndex(0);
          var L = -tail;
          // box in root space: x from L to L+w, y from 0 (bottom) to T (top)
          g.fillColor = new Color(59, 43, 43, 34);
          g.roundRect(L, -3, w, h, 18);
          g.fill();
          g.fillColor = new Color(255, 253, 248, 255);
          g.strokeColor = INK2;
          g.lineWidth = 3;
          g.roundRect(L, 0, w, h, 18);
          g.fill();
          g.stroke();
          // the tail: a small rotated square below the box, its inner part painted over the box edge
          g.moveTo(-9, 1);
          g.lineTo(0, -12);
          g.lineTo(9, 1);
          g.fill();
          g.moveTo(-9, 0);
          g.lineTo(0, -12);
          g.lineTo(9, 0);
          g.stroke();
          g.fillColor = new Color(255, 253, 248, 255);
          g.rect(-8, 0, 16, 4);
          g.fill();
          lbN.setPosition(L + w / 2, h / 2);
          play(this.clock, root, x + tail, y + h, [{
            k: 0,
            sx: 0.4,
            sy: 0.4,
            o: 0
          }, {
            k: 0.6,
            sx: 1.08,
            sy: 1.08,
            o: 1
          }, {
            k: 1,
            sx: 1,
            sy: 1,
            o: 1
          }], 260, ease.out);
          return root;
        }

        // ---------------------------------------------------------------- the bar
        ;

        _proto.updHud = function updHud() {
          var _this23 = this;
          var steps = this.L.filter(this.counted),
            d = steps.filter(function (t) {
              return _this23.done.has(t.id);
            }).length;
          this.hud.progress(d, steps.length);
        }
        /** the first step that can be done now: its hint text (layer "tip": 中文|English) */;
        _proto.tip = function tip() {
          for (var _iterator24 = _createForOfIteratorHelperLoose(this.stepOrder()), _step24; !(_step24 = _iterator24()).done;) {
            var _l6 = _step24.value;
            if (this.done.has(_l6.id) || !this.ready(_l6)) continue;
            var _String$split$map6 = String(_l6.tip || '').split('|').map(function (v) {
                return (v || '').trim();
              }),
              zh = _String$split$map6[0],
              en = _String$split$map6[1];
            return this.env.lang === 'en' ? en || zh || 'Look around — something still needs doing.' : zh || en || '看看四周，还有事情没做完';
          }
          return '';
        }
        /** level finished (the gown is on): let the change land, white out, then the ending */;
        _proto.goEnding = function goEnding() {
          var _this24 = this;
          if (this.instant || this.ended) return;
          this.ended = true;
          this.hud.timerStop();
          this.clock.after(2600, function () {
            var w = node2D('white', _this24.env.root, W, H),
              g = w.addComponent(Graphics);
            g.fillColor = Color.WHITE;
            g.rect(-W / 2, -H / 2, W, H);
            g.fill();
            var o = op(w);
            _this24.clock.anim(600, function (k) {
              return o.opacity = Math.round(255 * k);
            }, function () {
              return _this24.env.onFinished();
            });
          });
        }

        // ---------------------------------------------------------------- testing: finish every step before one at once
        ;

        _proto.jumpTo = function jumpTo(id) {
          var _this25 = this;
          this.start();
          var order = this.stepOrder(),
            i = order.findIndex(function (l) {
              return l.id === id;
            });
          if (i < 0) return;
          this.instant = true;
          for (var _iterator25 = _createForOfIteratorHelperLoose(order.slice(0, i)), _step25; !(_step25 = _iterator25()).done;) {
            var _l7 = _step25.value;
            this.completeStep(_l7);
          }
          this.instant = false;
          for (var _iterator26 = _createForOfIteratorHelperLoose(this.sayRules()), _step26; !(_step26 = _iterator26()).done;) {
            var r = _step26.value;
            if (r.when === 'start' || this.sayMet(r.when)) this.said.add(r.key);
          }
          this.sayQ = [];
          for (var _iterator27 = _createForOfIteratorHelperLoose(this.L.filter(function (t) {
              return t.role === 'wipe' && _this25.done.has(t.id);
            })), _step27; !(_step27 = _iterator27()).done;) {
            var _l8 = _step27.value;
            for (var _iterator28 = _createForOfIteratorHelperLoose(ids(_l8["with"])), _step28; !(_step28 = _iterator28()).done;) {
              var id2 = _step28.value;
              var w = this.find(id2);
              if (w) w.state = w.states.length - 1;
            }
          }
          this.render();
          this.updHud();
        };
        _proto.completeStep = function completeStep(l) {
          var _this26 = this;
          if (this.done.has(l.id)) return;
          var tgt = this.L.find(function (t) {
            return ids(l.target).includes(t.id);
          });
          if (l.role === 'toggle') l.state = l.states.length - 1;
          if (l.role === 'drag' && l.stay && tgt) {
            var _ref10 = l.stayAt ? String(l.stayAt).split(',').map(Number) : [tgt.x + tgt.w / 2 - l.w / 2, tgt.y + tgt.h * 0.35 - l.h / 2];
            l.x = _ref10[0];
            l.y = _ref10[1];
            if (l.states[1]) l.state = 1;
          }
          if (l.sets && ['act', 'drag', 'hold', 'swipe'].includes(l.role)) this.effects(l.sets, ',').sort(function (a, b) {
            return a.at - b.at;
          }).forEach(function (e) {
            return _this26.setNow(e);
          });
          this.markDone(l);
          if (l.role === 'drag' && !l.stay && tgt && !(l.pose || l.sets || l.ms)) this.fillTarget(tgt);
        };
        _proto.destroy = function destroy() {
          this.hush();
          this.clock.clear();
          this.hud.destroy();
        };
        return Level;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./Clock.ts', './Cover.ts', './Ending.ts', './Fx.ts', './GfxOpacity.ts', './Hook.ts', './Hud.ts', './Level.ts', './StoryEntry.ts', './ui.ts'], function () {
  return {
    setters: [null, null, null, null, null, null, null, null, null, null],
    execute: function () {}
  };
});

System.register("chunks:///_virtual/StoryEntry.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './GfxOpacity.ts', './Clock.ts', './Ending.ts', './Hook.ts', './Level.ts', './ui.ts'], function (exports) {
  var _inheritsLoose, _createForOfIteratorHelperLoose, cclegacy, _decorator, Color, profiler, view, ResolutionPolicy, Canvas, Node, Camera, Layers, Graphics, resources, JsonAsset, AudioClip, EffectAsset, Label, Sprite, UITransform, ImageAsset, SpriteFrame, Component, at, op, ease, Clock, Ending, END_IMAGES, END_SOUNDS, Hook, HOOK_IMAGES, HOOK_SOUNDS, Level, W, H, node2D;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Color = module.Color;
      profiler = module.profiler;
      view = module.view;
      ResolutionPolicy = module.ResolutionPolicy;
      Canvas = module.Canvas;
      Node = module.Node;
      Camera = module.Camera;
      Layers = module.Layers;
      Graphics = module.Graphics;
      resources = module.resources;
      JsonAsset = module.JsonAsset;
      AudioClip = module.AudioClip;
      EffectAsset = module.EffectAsset;
      Label = module.Label;
      Sprite = module.Sprite;
      UITransform = module.UITransform;
      ImageAsset = module.ImageAsset;
      SpriteFrame = module.SpriteFrame;
      Component = module.Component;
    }, null, function (module) {
      at = module.at;
      op = module.op;
      ease = module.ease;
      Clock = module.Clock;
    }, function (module) {
      Ending = module.Ending;
      END_IMAGES = module.END_IMAGES;
      END_SOUNDS = module.END_SOUNDS;
    }, function (module) {
      Hook = module.Hook;
      HOOK_IMAGES = module.HOOK_IMAGES;
      HOOK_SOUNDS = module.HOOK_SOUNDS;
    }, function (module) {
      Level = module.Level;
    }, function (module) {
      W = module.W;
      H = module.H;
      node2D = module.node2D;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "e0228dtm4pKs5EmiunaKsek", "StoryEntry", undefined);
      var ccclass = _decorator.ccclass;
      var LEVEL = 'level01-room';
      var INK = new Color(59, 43, 43, 255),
        BG = new Color(251, 233, 207, 255),
        GOLD = new Color(255, 200, 61, 255),
        GOLD2 = new Color(255, 215, 106, 255);
      function label(parent, s, size, color, stroke) {
        if (stroke === void 0) {
          stroke = 0;
        }
        var n = node2D('t', parent);
        var lb = n.addComponent(Label);
        lb.string = s;
        lb.fontSize = size;
        lb.lineHeight = Math.round(size * 1.2);
        lb.isBold = true;
        lb.color = color;
        lb.horizontalAlign = Label.HorizontalAlign.CENTER;
        lb.verticalAlign = Label.VerticalAlign.CENTER;
        if (stroke) {
          lb.enableOutline = true;
          lb.outlineColor = INK;
          lb.outlineWidth = stroke / 2;
        }
        return lb;
      }
      function pic(parent, f, w, h) {
        var n = node2D('pic', parent, w, h);
        var s = n.addComponent(Sprite);
        s.sizeMode = Sprite.SizeMode.CUSTOM;
        s.spriteFrame = f || null;
        n.getComponent(UITransform).setContentSize(w, h);
        return n;
      }
      var StoryEntry = exports('StoryEntry', (_dec = ccclass('StoryEntry'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(StoryEntry, _Component);
        function StoryEntry() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.stage = void 0;
          _this.clock = new Clock();
          _this.home$ = new Map();
          _this.hookImg = new Map();
          _this.endImg = new Map();
          _this.sounds = new Map();
          _this.frames = new Map();
          _this.fx = new Map();
          _this.ui = new Map();
          _this.voices = new Map();
          _this.effect = null;
          _this.data = null;
          _this.loaded = false;
          _this.screen = null;
          _this.hook = null;
          _this.end = null;
          _this.level = null;
          return _this;
        }
        var _proto = StoryEntry.prototype;
        _proto.start = function start() {
          var _this2 = this;
          profiler.hideStats();
          view.setDesignResolutionSize(W, H, ResolutionPolicy.SHOW_ALL);
          var root = node2D('StoryCanvas', this.node, W, H);
          var canvas = root.addComponent(Canvas);
          var camNode = new Node('UICamera');
          root.addChild(camNode);
          camNode.setPosition(0, 0, 1000);
          var cam = camNode.addComponent(Camera);
          cam.projection = Camera.ProjectionType.ORTHO;
          cam.orthoHeight = H / 2;
          cam.near = 1;
          cam.far = 2000;
          cam.clearColor = new Color(0, 0, 0, 255);
          cam.visibility = Layers.Enum.UI_2D;
          canvas.cameraComponent = cam;
          this.stage = node2D('Stage', root, W, H);
          globalThis.__story = this; // testing hook
          // the home page needs only its own pictures
          var names = ['cover-01', 'mood-1', 'mood-2', 'mood-3', 'mood-4', 'mood-5'];
          var left = names.length;
          var _loop = function _loop() {
            var n = _names[_i];
            resources.load('home/' + n, ImageAsset, function (e, a) {
              if (!e && a) _this2.home$.set(n, SpriteFrame.createWithImage(a));
              if (--left === 0) _this2.home();
            });
          };
          for (var _i = 0, _names = names; _i < _names.length; _i++) {
            _loop();
          }
        };
        _proto.update = function update(dt) {
          var _this$hook, _this$end, _this$level;
          this.clock.tick(dt * 1000);
          (_this$hook = this.hook) == null || _this$hook.tick(dt);
          (_this$end = this.end) == null || _this$end.tick(dt);
          (_this$level = this.level) == null || _this$level.tick(dt);
        };
        _proto.clearScreen = function clearScreen() {
          var _this$hook2, _this$end2, _this$level2, _this$screen;
          (_this$hook2 = this.hook) == null || _this$hook2.destroy();
          this.hook = null;
          (_this$end2 = this.end) == null || _this$end2.destroy();
          this.end = null;
          (_this$level2 = this.level) == null || _this$level2.destroy();
          this.level = null;
          this.clock.clear();
          (_this$screen = this.screen) == null || _this$screen.destroy();
          this.screen = node2D('Screen', this.stage, W, H);
          return this.screen;
        }

        // ---------------------------------------------------------------- home: the level list (prototype/home.html)
        ;

        _proto.home = function home() {
          var _this3 = this;
          var s = this.clearScreen();
          var g = node2D('bg', s, W, H).addComponent(Graphics);
          g.fillColor = BG;
          g.rect(-W / 2, -H / 2, W, H);
          g.fill();
          // the paper's soft dots
          for (var _i2 = 0, _arr = [[90, 0.2, 0.15, 0.18, new Color(255, 244, 224, 255)], [120, 0.7, 0.6, 0.12, new Color(248, 225, 192, 255)]]; _i2 < _arr.length; _i2++) {
            var _arr$_i = _arr[_i2],
              step = _arr$_i[0],
              cx = _arr$_i[1],
              cy = _arr$_i[2],
              r = _arr$_i[3],
              col = _arr$_i[4];
            g.fillColor = col;
            for (var y = 0; y < H + step; y += step) for (var x = 0; x < W + step; x += step) {
              g.circle(x + step * cx - W / 2, H / 2 - (y + step * cy), step * r);
              g.fill();
            }
          }
          var t = label(s, 'Glow-Up Stories', 62, Color.WHITE, 12);
          t.node.setPosition(at(360, 112));
          var sub = label(s, 'Help her turn her life around', 28, INK);
          sub.node.setPosition(at(360, 176));
          op(sub.node).opacity = 178;
          var LEVELS = [{
            title: "Chloe's Glow-Up",
            cover: 'cover-01',
            isNew: true
          }].concat([1, 2, 3, 4, 5].map(function (i) {
            return {
              title: 'Coming Soon',
              mood: 'mood-' + i
            };
          }));
          var cw = 270,
            ch = 318,
            gapX = 40,
            x0 = (W - cw * 2 - gapX) / 2;
          LEVELS.forEach(function (lv, i) {
            var x = x0 + i % 2 * (cw + gapX),
              y = 226 + Math.floor(i / 2) * (ch + 32);
            var card = node2D('card' + i, s, cw, ch);
            card.setPosition(at(x + cw / 2, y + ch / 2));
            var cg = card.addComponent(Graphics);
            cg.fillColor = INK;
            cg.roundRect(-cw / 2 + 5, -ch / 2 - 6, cw, ch, 18);
            cg.fill();
            cg.fillColor = Color.WHITE;
            cg.roundRect(-cw / 2, -ch / 2, cw, ch, 18);
            cg.fill();
            cg.lineWidth = 5;
            cg.strokeColor = INK;
            cg.roundRect(-cw / 2 + 2.5, -ch / 2 + 2.5, cw - 5, ch - 5, 16);
            cg.stroke();
            // notebook rings over the top edge
            for (var _i3 = 0, _arr2 = [-30, 0, 30]; _i3 < _arr2.length; _i3++) {
              var rx = _arr2[_i3];
              cg.fillColor = new Color(191, 227, 240, 255);
              cg.roundRect(rx - 8, ch / 2 - 22, 16, 40, 8);
              cg.fill();
              cg.lineWidth = 4;
              cg.strokeColor = INK;
              cg.roundRect(rx - 8, ch / 2 - 22, 16, 40, 8);
              cg.stroke();
            }
            var cs = cw - 32,
              cover = pic(card, _this3.home$.get(lv.cover || lv.mood), cs, cs);
            cover.setPosition(0, ch / 2 - 16 - cs / 2);
            var fr = node2D('frame', card).addComponent(Graphics);
            fr.lineWidth = 4;
            fr.strokeColor = INK;
            fr.roundRect(-cs / 2, ch / 2 - 16 - cs, cs, cs, 8);
            fr.stroke();
            var tl = label(card, lv.title, 28, Color.WHITE, 7);
            tl.node.setPosition(0, -ch / 2 + 30);
            if (lv.mood) {
              var q = label(card, '?', 150, new Color(255, 255, 255, 128));
              q.node.setPosition(0, ch / 2 - 16 - cs / 2);
              _this3.padlock(card, cs / 2 - 40, ch / 2 - 16 - cs + 40);
            }
            if (lv.isNew) {
              var nw = node2D('new', card, 84, 36);
              nw.setPosition(cw / 2 - 10, ch / 2 - 4);
              nw.angle = -12;
              var ng = nw.addComponent(Graphics);
              ng.fillColor = new Color(255, 92, 138, 255);
              ng.roundRect(-42, -18, 84, 36, 18);
              ng.fill();
              ng.lineWidth = 4;
              ng.strokeColor = INK;
              ng.roundRect(-42, -18, 84, 36, 18);
              ng.stroke();
              label(nw, 'NEW', 22, Color.WHITE);
            }
            card.on(Node.EventType.TOUCH_END, function (e) {
              if (!lv.mood) return _this3.openLevel(card);
              // locked: a little shake, no message
              var p = card.position.clone();
              _this3.clock.anim(380, function (k) {
                var v = Math.sin(k * Math.PI * 4) * (1 - k);
                card.setPosition(p.x + 8 * v, p.y);
                card.angle = -2 * v;
              }, function () {
                card.setPosition(p);
                card.angle = 0;
              });
            });
          });
        }
        /** the gold padlock of a locked card (the home page's SVG) */;
        _proto.padlock = function padlock(parent, x, y) {
          var n = node2D('lock', parent, 72, 72);
          n.setPosition(x, y);
          var g = n.addComponent(Graphics),
            k = 72 / 60,
            P = function P(px, py) {
              return [(px - 30) * k, -(py - 30) * k];
            };
          g.fillColor = Color.WHITE;
          g.circle(0, 0, 27 * k);
          g.fill();
          g.lineWidth = 4 * k;
          g.strokeColor = INK;
          g.circle(0, 0, 27 * k);
          g.stroke();
          for (var _i4 = 0, _arr3 = [[8, INK], [4, new Color(201, 206, 214, 255)]]; _i4 < _arr3.length; _i4++) {
            var _arr3$_i = _arr3[_i4],
              lw = _arr3$_i[0],
              col = _arr3$_i[1];
            g.lineWidth = lw * k;
            g.strokeColor = col;
            g.lineCap = Graphics.LineCap.ROUND;
            g.moveTo.apply(g, P(21, 27));
            g.lineTo.apply(g, P(21, 21));
            g.arc(0, P(30, 21)[1], 9 * k, Math.PI, 0, false);
            g.lineTo.apply(g, P(39, 27));
            g.stroke();
          }
          g.fillColor = GOLD;
          g.roundRect.apply(g, P(15, 48).concat([30 * k, 22 * k, 6 * k]));
          g.fill();
          g.lineWidth = 4 * k;
          g.strokeColor = INK;
          g.roundRect.apply(g, P(15, 48).concat([30 * k, 22 * k, 6 * k]));
          g.stroke();
          g.fillColor = new Color(255, 226, 138, 255);
          g.roundRect.apply(g, P(18, 35).concat([24 * k, 6 * k, 3 * k]));
          g.fill();
          g.fillColor = INK;
          g.circle.apply(g, P(30, 36).concat([3.4 * k]));
          g.fill();
          g.roundRect.apply(g, P(28.4, 44).concat([3.2 * k, 7 * k, 1.6 * k]));
          g.fill();
        }

        // ---------------------------------------------------------------- loading: everything the story and the level need
        ;

        _proto.openLevel = function openLevel(card) {
          var _this$screen2,
            _this4 = this;
          if ((_this$screen2 = this.screen) != null && _this$screen2.getChildByName('loading')) return;
          var s = this.screen;
          var ov = node2D('loading', s, W, H);
          var dim = ov.addComponent(Graphics);
          dim.fillColor = new Color(59, 43, 43, 179);
          dim.rect(-W / 2, -H / 2, W, H);
          dim.fill();
          ov.on(Node.EventType.TOUCH_START, function (e) {
            return e.propagationStopped = true;
          });
          var cw = 460,
            ch = 560;
          var c = node2D('card', ov, cw, ch);
          var cg = c.addComponent(Graphics);
          cg.fillColor = INK;
          cg.roundRect(-cw / 2 + 6, -ch / 2 - 7, cw, ch, 24);
          cg.fill();
          cg.fillColor = Color.WHITE;
          cg.roundRect(-cw / 2, -ch / 2, cw, ch, 24);
          cg.fill();
          cg.lineWidth = 5;
          cg.strokeColor = INK;
          cg.roundRect(-cw / 2 + 2.5, -ch / 2 + 2.5, cw - 5, ch - 5, 22);
          cg.stroke();
          var cs = cw - 40,
            cover = pic(c, this.home$.get('cover-01'), cs, cs);
          cover.setPosition(0, ch / 2 - 20 - cs / 2);
          var fr = node2D('f', c).addComponent(Graphics);
          fr.lineWidth = 4;
          fr.strokeColor = INK;
          fr.roundRect(-cs / 2, ch / 2 - 20 - cs, cs, cs, 12);
          fr.stroke();
          var bw = cs,
            bh = 44,
            by = -ch / 2 + 50;
          var bar = node2D('bar', c).addComponent(Graphics),
            pct = label(c, '0%', 26, Color.WHITE, 7);
          pct.node.setPosition(0, by);
          var p = 0;
          var drawBar = function drawBar() {
            bar.clear();
            bar.fillColor = BG;
            bar.roundRect(-bw / 2, by - bh / 2, bw, bh, bh / 2);
            bar.fill();
            var fw = Math.max(0, (bw - 8) * p);
            if (fw > 2) {
              // gold stripes sliding along
              var off = _this4.clock.now / 600 * 34;
              bar.fillColor = GOLD;
              bar.roundRect(-bw / 2 + 4, by - bh / 2 + 4, fw, bh - 8, (bh - 8) / 2);
              bar.fill();
              bar.fillColor = GOLD2;
              for (var sx = -bw / 2 + 4 - 34 + off % 34; sx < -bw / 2 + 4 + fw; sx += 34) {
                var _a = Math.max(-bw / 2 + 4, sx),
                  b = Math.min(-bw / 2 + 4 + fw, sx + 12);
                if (b > _a + 1) {
                  bar.moveTo(_a, by - bh / 2 + 4);
                  bar.lineTo(b, by - bh / 2 + 4);
                  bar.lineTo(Math.min(-bw / 2 + 4 + fw, b + 10), by + bh / 2 - 4);
                  bar.lineTo(Math.min(-bw / 2 + 4 + fw, _a + 10), by + bh / 2 - 4);
                  bar.close();
                  bar.fill();
                }
              }
            }
            bar.lineWidth = 5;
            bar.strokeColor = INK;
            bar.roundRect(-bw / 2, by - bh / 2, bw, bh, bh / 2);
            bar.stroke();
            pct.string = Math.round(p * 100) + '%';
          };
          var anim = this.clock.anim(100000, drawBar);
          op(ov).opacity = 0;
          this.clock.anim(250, function (k) {
            return op(ov).opacity = Math.round(255 * k);
          });
          this.loadAll(function (v) {
            return p = Math.max(p, v);
          }, function () {
            p = 1;
            _this4.clock.after(250, function () {
              anim.stop();
              _this4.startHook();
            });
          });
        }

        /** the story's pictures and sounds, the level, its pictures, voices, effects and the bar's icons */;
        _proto.loadAll = function loadAll(progress, done) {
          var _this5 = this;
          if (this.loaded) return done();
          var total = 0,
            got = 0;
          var tick = function tick() {
            return progress(total ? got / total : 0);
          };
          var one = function one(path, type, put) {
            total++;
            return new Promise(function (ok) {
              return resources.load(path, type, function (e, a) {
                if (!e && a) put(a);else console.warn('[story] missing', path);
                got++;
                tick();
                ok();
              });
            });
          };
          var img = function img(path, into, key) {
            return one(path, ImageAsset, function (a) {
              return into.set(key, SpriteFrame.createWithImage(a));
            });
          };
          return new Promise(function (ok) {
            return resources.load('level/' + LEVEL, JsonAsset, function (e, a) {
              return _this5.data = (a == null ? void 0 : a.json) || null, ok();
            });
          }).then(function () {
            var d = _this5.data;
            var tex = new Set([d.bg[0]]);
            for (var _iterator = _createForOfIteratorHelperLoose(d.layers), _step; !(_step = _iterator()).done;) {
              var l = _step.value;
              for (var _iterator8 = _createForOfIteratorHelperLoose(l.states), _step8; !(_step8 = _iterator8()).done;) {
                var s = _step8.value;
                tex.add(s[0]);
              }
              if (Array.isArray(l.fxImgs)) tex.add(l.fxImgs[0]);
            }
            var ps = [];
            for (var _iterator2 = _createForOfIteratorHelperLoose(tex), _step2; !(_step2 = _iterator2()).done;) {
              var n = _step2.value;
              ps.push(img('level/tex/' + n, _this5.frames, n));
            }
            for (var _i5 = 0, _arr4 = [].concat(HOOK_IMAGES); _i5 < _arr4.length; _i5++) {
              var k = _arr4[_i5];
              ps.push(img('hook/' + k, _this5.hookImg, k));
            }
            var _loop2 = function _loop2() {
              var k = _step3.value;
              ps.push(one('hook/audio/' + k, AudioClip, function (a) {
                return _this5.sounds.set(k, a);
              }));
            };
            for (var _iterator3 = _createForOfIteratorHelperLoose(HOOK_SOUNDS), _step3; !(_step3 = _iterator3()).done;) {
              _loop2();
            }
            for (var _iterator4 = _createForOfIteratorHelperLoose(END_IMAGES), _step4; !(_step4 = _iterator4()).done;) {
              var _k3 = _step4.value;
              ps.push(img('end/' + _k3, _this5.endImg, _k3));
            }
            var _loop3 = function _loop3() {
              var k = _step5.value;
              ps.push(one('end/' + k, AudioClip, function (a) {
                return _this5.sounds.set(k, a);
              }));
            };
            for (var _iterator5 = _createForOfIteratorHelperLoose(END_SOUNDS), _step5; !(_step5 = _iterator5()).done;) {
              _loop3();
            }
            for (var _i6 = 0, _arr5 = ['bubble', 'mist', 'steam', 'drop', 'drip', 'jet', 'star', 'star-big', 'glow', 'brush', 'drum', 'drum-gloss', 'vignette-red', 'shadow']; _i6 < _arr5.length; _i6++) {
              var _k = _arr5[_i6];
              ps.push(img('fx/' + _k, _this5.fx, _k));
            }
            ps.push(one('fx/meow', AudioClip, function (a) {
              return _this5.sounds.set('meow', a);
            }));
            for (var _i7 = 0, _arr6 = ['back', 'clock', 'tips', 'addtime']; _i7 < _arr6.length; _i7++) {
              var _k2 = _arr6[_i7];
              ps.push(img('ui/' + _k2, _this5.ui, _k2));
            }
            var vs = new Set();
            for (var _iterator6 = _createForOfIteratorHelperLoose(d.layers), _step6; !(_step6 = _iterator6()).done;) {
              var _l = _step6.value;
              if (_l.voices) for (var _i8 = 0, _arr7 = Object.values(_l.voices); _i8 < _arr7.length; _i8++) {
                var v = _arr7[_i8];
                vs.add(v);
              }
            }
            var _loop4 = function _loop4() {
              var v = _step7.value;
              ps.push(one('level/voice/' + v, AudioClip, function (a) {
                return _this5.voices.set(v, a);
              }));
            };
            for (var _iterator7 = _createForOfIteratorHelperLoose(vs), _step7; !(_step7 = _iterator7()).done;) {
              _loop4();
            }
            ps.push(one('effects/cover-mask', EffectAsset, function (a) {
              return _this5.effect = a;
            }));
            return Promise.all(ps).then(function () {
              _this5.loaded = true;
              done();
            });
          });
        }

        // ---------------------------------------------------------------- story → level → ending
        ;

        _proto.startHook = function startHook() {
          var _this6 = this;
          var s = this.clearScreen();
          this.hook = new Hook(s, this, this.hookImg, this.sounds, function () {
            return _this6.fadeTo(function () {
              return _this6.startLevel();
            });
          });
          this.hook.run();
        }
        /** a short fade to black between screens */;
        _proto.fadeTo = function fadeTo(next) {
          var _this7 = this;
          var n = node2D('fade', this.stage, W, H),
            g = n.addComponent(Graphics);
          g.fillColor = new Color(20, 11, 24, 255);
          g.rect(-W / 2, -H / 2, W, H);
          g.fill();
          var o = op(n);
          o.opacity = 0;
          var c = new Clock();
          var step = function step(dt) {
            return c.tick(dt * 1000);
          };
          this.schedule(step, 0);
          c.anim(450, function (k) {
            return o.opacity = Math.round(255 * k);
          }, function () {
            next();
            n.setSiblingIndex(_this7.stage.children.length - 1);
            c.anim(300, function (k) {
              return o.opacity = Math.round(255 * (1 - ease.out(k)));
            }, function () {
              _this7.unschedule(step);
              n.destroy();
            });
          });
        };
        _proto.startLevel = function startLevel() {
          var _this8 = this;
          var s = this.clearScreen();
          this.level = new Level({
            root: s,
            data: this.data,
            frames: this.frames,
            fx: this.fx,
            ui: this.ui,
            voices: this.voices,
            sounds: this.sounds,
            effect: this.effect,
            lang: 'en',
            onHome: function onHome() {
              return _this8.home();
            },
            onFinished: function onFinished() {
              return _this8.ending();
            }
          });
          var xy = function xy(e) {
            var p = e.getUILocation();
            return [p.x, H - p.y];
          };
          s.on(Node.EventType.TOUCH_START, function (e) {
            var _this8$level;
            return (_this8$level = _this8.level) == null ? void 0 : _this8$level.onDown.apply(_this8$level, xy(e));
          });
          s.on(Node.EventType.TOUCH_MOVE, function (e) {
            var _this8$level2;
            return (_this8$level2 = _this8.level) == null ? void 0 : _this8$level2.onMove.apply(_this8$level2, xy(e));
          });
          s.on(Node.EventType.TOUCH_END, function (e) {
            var _this8$level3;
            return (_this8$level3 = _this8.level) == null ? void 0 : _this8$level3.onUp.apply(_this8$level3, xy(e));
          });
          s.on(Node.EventType.TOUCH_CANCEL, function (e) {
            var _this8$level4;
            return (_this8$level4 = _this8.level) == null ? void 0 : _this8$level4.onUp.apply(_this8$level4, xy(e));
          });
        }
        /** the prom-night ending (prototype/ending.html); Play Again replays the story */;
        _proto.ending = function ending() {
          var _this9 = this;
          var s = this.clearScreen();
          this.end = new Ending(s, this, this.endImg, this.sounds, function () {
            return _this9.fadeTo(function () {
              return _this9.startHook();
            });
          });
          this.end.run();
        };
        return StoryEntry;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ui.ts", ['cc'], function (exports) {
  var cclegacy, Color, Node, Layers, UITransform, Vec3, UIOpacity, Sprite, Label, Vec2, Graphics, Tween, tween;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      Node = module.Node;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Vec3 = module.Vec3;
      UIOpacity = module.UIOpacity;
      Sprite = module.Sprite;
      Label = module.Label;
      Vec2 = module.Vec2;
      Graphics = module.Graphics;
      Tween = module.Tween;
      tween = module.tween;
    }],
    execute: function () {
      exports({
        breathe: breathe,
        button: button,
        fadeTo: fadeTo,
        node2D: node2D,
        opacity: opacity,
        panel: panel,
        sprite: sprite,
        text: text
      });
      cclegacy._RF.push({}, "b9a57JqDnxOrZ3YcIQe1rTP", "ui", undefined);
      var W = exports('W', 720),
        H = exports('H', 1280);
      var INK = exports('INK', new Color(43, 22, 48, 255)),
        CREAM = exports('CREAM', new Color(255, 246, 234, 255)),
        ROSE = exports('ROSE', new Color(232, 67, 111, 255)),
        AMBER = exports('AMBER', new Color(255, 182, 72, 255)),
        LAV = exports('LAV', new Color(195, 176, 255, 255)),
        PINK = exports('PINK', new Color(255, 95, 176, 255));
      function node2D(name, parent, w, h, x, y) {
        if (w === void 0) {
          w = 0;
        }
        if (h === void 0) {
          h = 0;
        }
        if (x === void 0) {
          x = 0;
        }
        if (y === void 0) {
          y = 0;
        }
        var n = new Node(name);
        n.layer = Layers.Enum.UI_2D;
        parent.addChild(n);
        n.addComponent(UITransform).setContentSize(w, h);
        n.setPosition(x, y);
        return n;
      }

      /** stage rect (top-left origin, y down, like the editor / CSS) → centre position (centre origin, y up) */
      var pos = exports('pos', function pos(x, y, w, h) {
        if (w === void 0) {
          w = 0;
        }
        if (h === void 0) {
          h = 0;
        }
        return new Vec3(x + w / 2 - W / 2, H / 2 - (y + h / 2), 0);
      });
      function opacity(n) {
        return n.getComponent(UIOpacity) || n.addComponent(UIOpacity);
      }
      function sprite(name, parent, frame, w, h) {
        var n = node2D(name, parent, w, h);
        var s = n.addComponent(Sprite);
        s.sizeMode = Sprite.SizeMode.CUSTOM;
        s.spriteFrame = frame;
        n.getComponent(UITransform).setContentSize(w, h);
        return s;
      }
      function text(parent, s, o) {
        var n = node2D('text', parent, o.width || 0, 0);
        var lb = n.addComponent(Label);
        lb.string = s;
        lb.fontSize = o.size;
        lb.lineHeight = o.lineHeight || Math.round(o.size * 1.3);
        lb.isBold = true;
        lb.color = o.color || Color.WHITE;
        lb.horizontalAlign = o.align === 'left' ? Label.HorizontalAlign.LEFT : Label.HorizontalAlign.CENTER;
        lb.verticalAlign = Label.VerticalAlign.TOP;
        if (o.width) {
          lb.overflow = Label.Overflow.RESIZE_HEIGHT;
          n.getComponent(UITransform).width = o.width;
        }
        if (o.outline) {
          lb.enableOutline = true;
          lb.outlineColor = INK;
          lb.outlineWidth = o.outline;
        }
        if (o.drop) {
          lb.enableShadow = true;
          lb.shadowColor = INK;
          lb.shadowOffset = new Vec2(0, -Math.max(3, Math.round(o.size / 12)));
          lb.shadowBlur = 0;
        }
        return lb;
      }

      /** rounded box with the plum outline and hard drop shadow */
      function panel(g, x, y, w, h, r, fill, line, drop) {
        if (line === void 0) {
          line = 5;
        }
        if (drop === void 0) {
          drop = 8;
        }
        if (drop) {
          g.fillColor = INK;
          g.roundRect(x, y - drop, w, h, r);
          g.fill();
        }
        g.fillColor = fill;
        g.roundRect(x, y, w, h, r);
        g.fill();
        if (line) {
          g.lineWidth = line;
          g.strokeColor = INK;
          g.roundRect(x, y, w, h, r);
          g.stroke();
        }
      }

      /** pill button (rose by default); onTap fires on release. Touches never reach the screen behind it. */
      function button(parent, label, w, h, onTap, fill, size) {
        if (fill === void 0) {
          fill = ROSE;
        }
        if (size === void 0) {
          size = Math.round(h * 0.38);
        }
        var n = node2D('btn-' + label, parent, w, h);
        var g = n.addComponent(Graphics);
        panel(g, -w / 2, -h / 2, w, h, h / 2, fill);
        // glossy top band + darker bottom, like the CSS insets
        g.fillColor = new Color(255, 255, 255, 80);
        g.roundRect(-w / 2 + 14, h / 2 - 22, w - 28, 12, 6);
        g.fill();
        g.fillColor = new Color(0, 0, 0, 40);
        g.roundRect(-w / 2 + 10, -h / 2 + 6, w - 20, 10, 5);
        g.fill();
        var lb = text(n, label, {
          size: size,
          outline: 4,
          drop: true
        });
        lb.verticalAlign = Label.VerticalAlign.CENTER;
        lb.node.getComponent(UITransform).setContentSize(w, h);
        lb.overflow = Label.Overflow.NONE;
        var stop = function stop(e) {
          return e.propagationStopped = true;
        };
        n.on(Node.EventType.TOUCH_START, function (e) {
          stop(e);
          Tween.stopAllByTarget(n);
          n.setScale(0.94, 0.94, 1);
        });
        n.on(Node.EventType.TOUCH_MOVE, stop);
        n.on(Node.EventType.TOUCH_CANCEL, function (e) {
          stop(e);
          n.setScale(1, 1, 1);
        });
        n.on(Node.EventType.TOUCH_END, function (e) {
          stop(e);
          n.setScale(1, 1, 1);
          onTap();
        });
        return n;
      }

      /** gentle pulse that invites a tap */
      function breathe(n) {
        tween(n).to(0.7, {
          scale: new Vec3(1.06, 1.06, 1)
        }, {
          easing: 'sineInOut'
        }).to(0.7, {
          scale: Vec3.ONE
        }, {
          easing: 'sineInOut'
        }).union().repeatForever().start();
      }
      function fadeTo(n, to, t) {
        var o = opacity(n);
        Tween.stopAllByTarget(o);
        return tween(o).to(t, {
          opacity: to
        }).start();
      }
      cclegacy._RF.pop();
    }
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});
