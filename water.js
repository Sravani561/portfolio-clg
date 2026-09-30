/* =========================================================
   WATER THEME ANIMATION  —  "From a Droplet to Hard Work"
   - Rain drops fall from the top
   - Ripples + splashes where they land
   - Shiny bubbles rise from the water
   - Water level RISES as you scroll (top = droplets, bottom = full ocean)
========================================================= */
(function () {
    "use strict";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* ---------- canvas setup ---------- */
    var canvas = document.createElement("canvas");
    canvas.id = "water-canvas";
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext("2d");

    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * DPR;
        canvas.height = H * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    window.addEventListener("resize", resize);
    resize();

    /* ---------- story indicator ---------- */
    var story = document.createElement("div");
    story.id = "water-story";
    story.innerHTML = '<span class="ring"></span><span class="label">Droplet · Small start</span>';
    document.body.appendChild(story);
    var storyLabel = story.querySelector(".label");

    var stages = [
        [0.00, "Droplet · Small start"],
        [0.18, "Stream · Learning"],
        [0.45, "River · Projects & work"],
        [0.75, "Sea · Consistency"],
        [0.95, "Ocean · Hard work pays"]
    ];
    var lastStage = "";

    /* ---------- scroll progress (0 -> 1) ---------- */
    var target = 0, progress = 0;

    function readScroll() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    }
    window.addEventListener("scroll", readScroll, { passive: true });
    readScroll();

    /* ---------- helpers ---------- */
    function rand(a, b) { return a + Math.random() * (b - a); }

    var drops = [];     // rain
    var ripples = [];   // rings on the surface
    var splashes = [];  // tiny particles
    var bubbles = [];   // rising shiny bubbles
    var t = 0;

    /* water surface y at x, with layered waves */
    function surfaceY(x, base, amp, phase) {
        return base
            + Math.sin(x * 0.008 + t * 1.2 + phase) * amp
            + Math.sin(x * 0.017 - t * 0.9 + phase * 2) * amp * 0.5;
    }

    /* ---------- spawners ---------- */
    function spawnDrop(p) {
        var big = Math.random() < 0.12;
        drops.push({
            x: rand(0, W),
            y: rand(-60, -5),
            len: big ? rand(16, 24) : rand(8, 16),
            r: big ? rand(2.2, 3.2) : rand(1, 1.8),
            vy: big ? rand(9, 13) : rand(11, 17),
            alpha: rand(0.25, 0.6)
        });
    }

    function spawnBubble(base) {
        var r = Math.random() < 0.18 ? rand(14, 26) : rand(4, 12);
        bubbles.push({
            x: rand(0, W),
            y: rand(Math.min(H + 10, base + 20), H + 30),
            r: r,
            vy: rand(0.35, 1.1) + (26 - r) * 0.02,
            wob: rand(0, 6.28),
            wobSpeed: rand(0.8, 2),
            wobAmp: rand(0.2, 0.8),
            popY: rand(H * 0.08, H * 0.85)
        });
    }

    function addRipple(x, y, big, circ) {
        ripples.push({ x: x, y: y, r: 2, max: circ ? rand(10, 18) : (big ? rand(40, 70) : rand(18, 34)), a: big ? 0.55 : 0.4, circ: !!circ });
        for (var i = 0; i < (big ? 6 : 3); i++) {
            splashes.push({
                x: x, y: y,
                vx: rand(-1.6, 1.6),
                vy: rand(-3.4, -1.2),
                life: 1
            });
        }
    }

    /* click / tap = extra ripple + bubbles (nice touch) */
    window.addEventListener("pointerdown", function (e) {
        addRipple(e.clientX, e.clientY, true);
        for (var i = 0; i < 4; i++) {
            bubbles.push({
                x: e.clientX + rand(-14, 14), y: e.clientY + rand(-6, 10),
                r: rand(4, 10), vy: rand(0.6, 1.4), wob: rand(0, 6), wobSpeed: rand(1, 2), wobAmp: 0.5, popY: rand(H * 0.05, e.clientY)
            });
        }
    });

    /* ---------- drawing ---------- */
    function drawDrop(d) {
        // streak
        var g = ctx.createLinearGradient(d.x, d.y - d.len, d.x, d.y);
        g.addColorStop(0, "rgba(186,230,253,0)");
        g.addColorStop(1, "rgba(200,240,255," + d.alpha + ")");
        ctx.strokeStyle = g;
        ctx.lineWidth = d.r * 0.9;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(d.x, d.y - d.len);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
        // shiny droplet head
        ctx.beginPath();
        ctx.fillStyle = "rgba(225,248,255," + Math.min(0.9, d.alpha + 0.25) + ")";
        ctx.arc(d.x, d.y, d.r, 0, 6.283);
        ctx.fill();
    }

    function drawBubble(b) {
        var x = b.x, y = b.y, r = b.r;
        // body (almost transparent, brighter at rim)
        var g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
        g.addColorStop(0, "rgba(165,243,252,0.03)");
        g.addColorStop(0.75, "rgba(125,211,252,0.14)");
        g.addColorStop(1, "rgba(200,245,255,0.55)");
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(x, y, r, 0, 6.283);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(220,250,255,0.55)";
        ctx.stroke();
        // shine (big highlight, top-left)
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.ellipse(x - r * 0.38, y - r * 0.4, r * 0.22, r * 0.13, -0.7, 0, 6.283);
        ctx.fill();
        // small glint (bottom-right)
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.arc(x + r * 0.42, y + r * 0.42, Math.max(1, r * 0.07), 0, 6.283);
        ctx.fill();
    }

    function drawWater(base, amp) {
        if (base >= H - 1) return;
        // back layer
        var layers = [
            { off: -10, phase: 1.5, a0: "rgba(34,211,238,0.16)", a1: "rgba(14,165,233,0.30)" },
            { off: 0,   phase: 0,   a0: "rgba(56,189,248,0.22)", a1: "rgba(3,105,161,0.42)" }
        ];
        for (var li = 0; li < layers.length; li++) {
            var L = layers[li];
            var top = base + L.off;
            var grad = ctx.createLinearGradient(0, top - amp, 0, H);
            grad.addColorStop(0, L.a0);
            grad.addColorStop(1, L.a1);
            ctx.beginPath();
            ctx.moveTo(0, H);
            for (var x = 0; x <= W; x += 8) {
                ctx.lineTo(x, surfaceY(x, top, amp, L.phase));
            }
            ctx.lineTo(W, H);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
        }
        // shiny surface line
        ctx.beginPath();
        for (var x2 = 0; x2 <= W; x2 += 8) {
            var yy = surfaceY(x2, base, amp, 0);
            if (x2 === 0) ctx.moveTo(x2, yy); else ctx.lineTo(x2, yy);
        }
        ctx.strokeStyle = "rgba(200,248,255,0.55)";
        ctx.lineWidth = 1.6;
        ctx.stroke();
    }

    /* ---------- main loop ---------- */
    var last = performance.now();
    var running = true;

    document.addEventListener("visibilitychange", function () {
        running = !document.hidden;
        if (running) { last = performance.now(); requestAnimationFrame(frame); }
    });

    function updateStory() {
        var label = stages[0][1];
        for (var i = 0; i < stages.length; i++) if (progress >= stages[i][0]) label = stages[i][1];
        if (label !== lastStage) { storyLabel.textContent = label; lastStage = label; }
        story.style.setProperty("--p", (progress * 100).toFixed(1));
    }

    function frame(now) {
        if (!running) return;
        var dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        t += dt;

        // smooth the scroll progress so the water rises gently
        progress += (target - progress) * Math.min(1, dt * 3);

        // water level: 0 -> ~94% of the screen height
        var level = progress * H * 0.94;
        var base = H - level;
        var amp = 5 + 9 * Math.sin(Math.min(1, progress * 2) * 1.57);

        ctx.clearRect(0, 0, W, H);

        // light rays in deeper water
        if (progress > 0.3) {
            var rayA = Math.min(0.10, (progress - 0.3) * 0.2);
            for (var k = 0; k < 4; k++) {
                var rx = (W * (0.15 + k * 0.25) + Math.sin(t * 0.3 + k) * 40);
                var rg = ctx.createLinearGradient(rx, base, rx + 120, H);
                rg.addColorStop(0, "rgba(186,240,255," + rayA + ")");
                rg.addColorStop(1, "rgba(186,240,255,0)");
                ctx.fillStyle = rg;
                ctx.beginPath();
                ctx.moveTo(rx - 30, base);
                ctx.lineTo(rx + 30, base);
                ctx.lineTo(rx + 200, H);
                ctx.lineTo(rx + 60, H);
                ctx.closePath();
                ctx.fill();
            }
        }

        drawWater(base, amp);

        /* --- rain: a few droplets at top, heavier as you go down --- */
        var rainRate = 14 + progress * 70;          // drops per second
        if (Math.random() < rainRate * dt) spawnDrop(progress);
        if (Math.random() < rainRate * dt * 0.5) spawnDrop(progress);

        for (var i = drops.length - 1; i >= 0; i--) {
            var d = drops[i];
            d.y += d.vy * dt * 60;
            var sy = surfaceY(d.x, base, amp, 0);
            if (d.y >= sy) {
                if (sy < H - 2 || Math.random() < 0.4) addRipple(d.x, Math.min(sy, H - 4), d.r > 2.1);
                drops.splice(i, 1);
                continue;
            }
            drawDrop(d);
        }

        /* --- ripples --- */
        for (var r = ripples.length - 1; r >= 0; r--) {
            var rp = ripples[r];
            rp.r += dt * 55;
            rp.a -= dt * 0.55;
            if (rp.a <= 0 || rp.r > rp.max) { ripples.splice(r, 1); continue; }
            ctx.beginPath();
            ctx.strokeStyle = "rgba(200,245,255," + rp.a.toFixed(3) + ")";
            ctx.lineWidth = 1.2;
            ctx.ellipse(rp.x, rp.y, rp.r, rp.r * (rp.circ ? 1 : 0.32), 0, 0, 6.283);
            ctx.stroke();
        }

        /* --- splash particles --- */
        for (var s = splashes.length - 1; s >= 0; s--) {
            var sp = splashes[s];
            sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.22; sp.life -= dt * 2.2;
            if (sp.life <= 0) { splashes.splice(s, 1); continue; }
            ctx.beginPath();
            ctx.fillStyle = "rgba(225,248,255," + (sp.life * 0.7).toFixed(3) + ")";
            ctx.arc(sp.x, sp.y, 1.4, 0, 6.283);
            ctx.fill();
        }

        /* --- bubbles: more as the water fills (hard work = more energy) --- */
        var bubbleRate = 0.6 + progress * 5;        // per second
        if (bubbles.length < 70 && Math.random() < bubbleRate * dt) spawnBubble(base);

        for (var b = bubbles.length - 1; b >= 0; b--) {
            var bb = bubbles[b];
            bb.y -= bb.vy * dt * 60;
            bb.wob += bb.wobSpeed * dt;
            bb.x += Math.sin(bb.wob) * bb.wobAmp;
            // little water: bubbles float freely and pop at a random height.
            // deep water: bubbles rise to the surface and pop there.
            var surf = surfaceY(bb.x, base, amp, 0);
            var inWater = progress > 0.22;
            var popLine = inWater ? surf : (bb.popY || 0);
            if (bb.y - bb.r <= popLine || bb.y < -40) {
                if (bb.y > 0) addRipple(bb.x, Math.max(popLine, 0), false, !inWater);
                bubbles.splice(b, 1);
                continue;
            }
            drawBubble(bb);
        }

        updateStory();
        requestAnimationFrame(frame);
    }

    // seed a few bubbles so the page never looks empty
    for (var n = 0; n < 6; n++) {
        bubbles.push({
            x: rand(0, W), y: rand(H * 0.3, H), r: rand(5, 14),
            vy: rand(0.3, 0.9), wob: rand(0, 6), wobSpeed: rand(1, 2), wobAmp: 0.5, popY: rand(H * 0.1, H * 0.7)
        });
    }
    requestAnimationFrame(frame);
})();
