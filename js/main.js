document.addEventListener('DOMContentLoaded', function () {
    const intro = document.querySelector('.event-intro');
    const parkStage = document.querySelector('.park-stage');
    const enterBtn = document.querySelector('.enter-btn');
    const introUi = document.querySelector('.intro-ui');
    const leftDoor = document.querySelector('.gate-door-left');
    const rightDoor = document.querySelector('.gate-door-right');
    const introFlash = document.querySelector('.intro-flash');
    const section01 = document.querySelector('.section01');

    const DESIGN_WIDTH = 3438;
    const DESIGN_HEIGHT = 2077;
    const FOCAL_X = 1742;
    const FOCAL_Y = 1200;

    let isEntering = false;

    function coverScale() {
        const viewW = window.innerWidth;
        const viewH = window.innerHeight;

        return Math.max(
            viewW / (2 * FOCAL_X),
            viewW / (2 * (DESIGN_WIDTH - FOCAL_X)),
            viewH / (2 * FOCAL_Y),
            viewH / (2 * (DESIGN_HEIGHT - FOCAL_Y))
        );
    }

    function resizePark() {
        gsap.set(parkStage, {
            scale: coverScale(),
            xPercent: 0,
            yPercent: 0,
            x: -FOCAL_X,
            y: -FOCAL_Y,
            transformOrigin: FOCAL_X + 'px ' + FOCAL_Y + 'px'
        });
    }

    resizePark();
    window.addEventListener('resize', resizePark);

    gsap.to('.enter-btn-arrow', {
        x: 4,
        duration: .65,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
    });

    gsap.to('.enter-btn', {
        y: -3,
        duration: 1.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });

    enterBtn.addEventListener('click', enterPark);

    function enterPark() {
        if (isEntering) return;
        isEntering = true;

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        gsap.killTweensOf('.enter-btn');

        const tl = gsap.timeline({
            defaults: { overwrite: 'auto' }
        });

        tl.to(introUi, {
            autoAlpha: 0,
            y: 25,
            duration: .35,
            ease: 'power2.in'
        });

        tl.to('.gate-door', {
            scale: 1.015,
            duration: .18,
            ease: 'power1.out'
        });

        tl.to(leftDoor, {
            rotationY: 92,
            x: -24,
            duration: 1.25,
            ease: 'power3.inOut'
        });

        tl.to(rightDoor, {
            rotationY: -92,
            x: 24,
            duration: 1.25,
            ease: 'power3.inOut'
        }, '<');

        tl.to(parkStage, {
            scale: function () {
                return coverScale() * 2.7;
            },
            duration: 1.45,
            ease: 'power3.in'
        }, '-=.15');

        tl.to(introFlash, {
            opacity: 1,
            duration: .7,
            ease: 'power2.in'
        }, '-=.45');

        tl.to(introFlash, {
            opacity: 1,
            duration: .4
        });

        tl.add(function () {
            intro.style.display = 'none';
            section01.classList.add('is-active');
            window.scrollTo(0, 0);

            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        });

        tl.to(introFlash, {
            opacity: 0,
            duration: .85,
            ease: 'power2.inOut'
        });
    }

    const freddy = document.querySelector('.freddy');
    const sprites = {
        up: './images/character-b.png',
        down: './images/character-f.png',
        left: './images/character-l.png',
        right: './images/character-r.png'
    };
    const held = { up: false, down: false, left: false, right: false };
    const keyMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right'
    };

    let pos = { x: 0, y: 0 };
    let target = null;
    let facing = 'down';
    let placed = false;
    const speed = 340;

    function setFacing(direction) {
        if (facing === direction) return;
        facing = direction;
        freddy.src = sprites[direction];
    }

    function faceBy(dx, dy) {
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
        if (Math.abs(dx) > Math.abs(dy)) {
            setFacing(dx > 0 ? 'right' : 'left');
        } else {
            setFacing(dy > 0 ? 'down' : 'up');
        }
    }

    function placeFreddy() {
        freddy.style.left = pos.x + 'px';
        freddy.style.top = pos.y + 'px';
    }

    function clampFreddy() {
        pos.x = Math.min(section01.clientWidth - 12, Math.max(12, pos.x));
        pos.y = Math.min(section01.clientHeight - 12, Math.max(12, pos.y));
    }

    function ensureFreddy() {
        if (placed || !section01.clientWidth) return;
        pos.x = section01.clientWidth * 0.5;
        pos.y = section01.clientHeight * 0.78;
        placed = true;
        placeFreddy();
    }

    section01.walkTo = function (x, y) {
        target = { x: x, y: y };
    };

    section01.addEventListener('pointerdown', function (event) {
        if (!section01.classList.contains('is-active')) return;
        if (event.target.closest('button, a')) return;

        const rect = section01.getBoundingClientRect();
        section01.walkTo(event.clientX - rect.left, event.clientY - rect.top);
    });

    window.addEventListener('keydown', function (event) {
        const direction = keyMap[event.key];
        if (!direction || !section01.classList.contains('is-active')) return;
        event.preventDefault();
        held[direction] = true;
        target = null;
    });

    window.addEventListener('keyup', function (event) {
        const direction = keyMap[event.key];
        if (!direction) return;
        held[direction] = false;
    });

    window.addEventListener('blur', function () {
        held.up = false;
        held.down = false;
        held.left = false;
        held.right = false;
    });

    let lastTime = performance.now();

    function moveFreddy(now) {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        if (section01.classList.contains('is-active')) {
            ensureFreddy();

            let dx = 0;
            let dy = 0;
            if (held.left) dx -= 1;
            if (held.right) dx += 1;
            if (held.up) dy -= 1;
            if (held.down) dy += 1;

            if (dx || dy) {
                const length = Math.hypot(dx, dy);
                pos.x += (dx / length) * speed * dt;
                pos.y += (dy / length) * speed * dt;
                faceBy(dx, dy);
            } else if (target) {
                dx = target.x - pos.x;
                dy = target.y - pos.y;
                const distance = Math.hypot(dx, dy);

                if (distance < 4) {
                    pos.x = target.x;
                    pos.y = target.y;
                    target = null;
                } else {
                    const step = Math.min(distance, speed * dt);
                    pos.x += (dx / distance) * step;
                    pos.y += (dy / distance) * step;
                    faceBy(dx, dy);
                }
            }

            clampFreddy();
            placeFreddy();
        }

        requestAnimationFrame(moveFreddy);
    }

    requestAnimationFrame(moveFreddy);
});
