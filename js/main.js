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
            ease: 'power2.inOut',
            onComplete: showBubble
        });
    }

    const freddy = document.querySelector('.freddy');
    const freddyBubble = document.querySelector('.freddy-bubble');
    const sprites = {
        up: ['./images/character-b.png', './images/character-b2.png'],
        down: ['./images/character-f.png', './images/character-f2.png'],
        left: ['./images/character-l.png', './images/character-l2.png'],
        right: ['./images/character-r.png', './images/character-r2.png']
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
    let walkFrame = 0;
    let walkTime = 0;
    const speed = 340;
    const walkStep = 0.16;

    Object.keys(sprites).forEach(function (direction) {
        sprites[direction].forEach(function (src) {
            const image = new Image();
            image.src = src;
        });
    });

    function showSprite(frame) {
        const frames = sprites[facing];
        const nextFrame = frame % frames.length;
        const marker = facing + ':' + nextFrame;
        if (freddy.dataset.frame === marker) return;
        freddy.dataset.frame = marker;
        freddy.src = frames[nextFrame];
    }

    function setFacing(direction) {
        if (facing === direction) return;
        facing = direction;
        walkFrame = 0;
        walkTime = 0;
        showSprite(0);
    }

    function updateWalk(moving, dt) {
        if (!moving || sprites[facing].length < 2) {
            walkFrame = 0;
            walkTime = 0;
            showSprite(0);
            return;
        }

        walkTime += dt;
        if (walkTime < walkStep) return;
        walkTime -= walkStep;
        walkFrame = (walkFrame + 1) % sprites[facing].length;
        showSprite(walkFrame);
    }

    function faceBy(dx, dy) {
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
        if (Math.abs(dx) > Math.abs(dy)) {
            setFacing(dx > 0 ? 'right' : 'left');
        } else {
            setFacing(dy > 0 ? 'down' : 'up');
        }
    }

    function showBubble() {
        freddyBubble.hidden = false;
        placeFreddy();
    }

    function hideBubble() {
        freddyBubble.hidden = true;
    }

    function placeFreddy() {
        freddy.style.left = pos.x + 'px';
        freddy.style.top = pos.y + 'px';

        if (!freddyBubble.hidden) {
            freddyBubble.style.left = pos.x + 'px';
            freddyBubble.style.top = (pos.y - freddy.offsetHeight) + 'px';
        }
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

    let spotOpen = false;

    let parkWidth = 1774;
    let parkHeight = 998;
    const parkBackground = new Image();

    parkBackground.addEventListener('load', function () {
        parkWidth = parkBackground.naturalWidth;
        parkHeight = parkBackground.naturalHeight;
    });
    parkBackground.src = './images/event-park-bg02.png';

    const attractions = [
        {
            el: document.querySelector('.class-att'),
            modal: document.querySelector('.class-modal'),
            area: { x: 320, y: 110, w: 350, h: 230 },
            near: false
        },
        {
            el: document.querySelector('.race-att'),
            modal: document.querySelector('.race-modal'),
            area: { x: 300, y: 390, w: 360, h: 240 },
            hit: { left: 0.2, top: 0.46, right: 0.2, bottom: 0.08 },
            near: false
        },
        {
            el: document.querySelector('.speech-att'),
            modal: document.querySelector('.speech-modal'),
            area: { x: 990, y: 100, w: 350, h: 230 },
            near: false
        },
        {
            el: document.querySelector('.dub-att'),
            modal: document.querySelector('.dub-modal'),
            area: { x: 1000, y: 390, w: 350, h: 250 },
            hit: { left: 0.2, top: 0.46, right: 0.2, bottom: 0.08 },
            near: false
        }
    ];

    function placeAttraction(item) {
        const img = item.el;
        const viewW = section01.clientWidth;
        const viewH = section01.clientHeight;
        if (!viewW || !viewH || !img.naturalWidth) return;

        const area = item.area;
        const scale = Math.max(viewW / parkWidth, viewH / parkHeight);
        const offsetX = (viewW - parkWidth * scale) / 2;
        const offsetY = (viewH - parkHeight * scale) / 2;
        const imageRatio = img.naturalWidth / img.naturalHeight;
        let drawW = area.w;
        let drawH = area.h;

        if (imageRatio > area.w / area.h) {
            drawH = area.w / imageRatio;
        } else {
            drawW = area.h * imageRatio;
        }

        img.style.left = (offsetX + (area.x + (area.w - drawW) / 2) * scale) + 'px';
        img.style.top = (offsetY + (area.y + (area.h - drawH) / 2) * scale) + 'px';
        img.style.width = (drawW * scale) + 'px';
    }

    const parkMap = {
        el: document.querySelector('.park-map'),
        area: { x: 730, y: 230, w: 230, h: 250 }
    };
    const calendarBtn = document.querySelector('.calendar-btn');

    function placeParkMap() {
        placeAttraction(parkMap);

        const mapWidth = parkMap.el.offsetWidth;
        if (!mapWidth) return;

        calendarBtn.style.left = (parkMap.el.offsetLeft + mapWidth / 2) + 'px';
        calendarBtn.style.top = (parkMap.el.offsetTop + parkMap.el.offsetHeight * 0.7) + 'px';
        calendarBtn.style.width = (mapWidth * 0.7) + 'px';
    }

    function attractionEntrance(item) {
        const sectionRect = section01.getBoundingClientRect();
        const rect = item.el.getBoundingClientRect();
        const freddyRect = freddy.getBoundingClientRect();

        return {
            x: rect.left - sectionRect.left + rect.width / 2,
            y: rect.bottom - sectionRect.top - rect.height * 0.12,
            radiusX: Math.max(freddyRect.width * 0.65, rect.width * 0.1),
            radiusY: Math.max(freddyRect.height * 0.28, rect.height * 0.05)
        };
    }

    function isAtAttraction(item) {
        const sectionRect = section01.getBoundingClientRect();
        const rect = item.el.getBoundingClientRect();
        const hit = item.hit || { left: 0, top: 0, right: 0, bottom: 0 };
        const left = rect.left - sectionRect.left + rect.width * hit.left;
        const top = rect.top - sectionRect.top + rect.height * hit.top;
        const right = rect.left - sectionRect.left + rect.width * (1 - hit.right);
        const bottom = rect.top - sectionRect.top + rect.height * (1 - hit.bottom);

        return pos.x >= left && pos.x <= right && pos.y >= top && pos.y <= bottom;
    }

    function openSpot(item) {
        spotOpen = true;
        target = null;
        held.up = false;
        held.down = false;
        held.left = false;
        held.right = false;
        item.modal.hidden = false;
    }

    function closeSpot(item) {
        spotOpen = false;
        item.modal.hidden = true;
    }

    attractions.forEach(function (item) {
        item.modal.querySelector('.guide-close').addEventListener('click', function () {
            closeSpot(item);
        });

        item.modal.addEventListener('pointerdown', function (event) {
            if (event.target === item.modal) closeSpot(item);
        });
    });

    section01.addEventListener('pointerdown', function (event) {
        if (!section01.classList.contains('is-active') || spotOpen) return;
        if (event.target.closest('button, a')) return;
        hideBubble();

        const clicked = attractions.find(function (item) {
            return item.el === event.target;
        });

        if (clicked) {
            const entrance = attractionEntrance(clicked);
            section01.walkTo(entrance.x, entrance.y);
            return;
        }

        const rect = section01.getBoundingClientRect();
        section01.walkTo(event.clientX - rect.left, event.clientY - rect.top);
    });

    window.addEventListener('keydown', function (event) {
        const direction = keyMap[event.key];
        if (!direction || !section01.classList.contains('is-active') || spotOpen) return;
        event.preventDefault();
        hideBubble();
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
            attractions.forEach(placeAttraction);
            placeParkMap();

            let dx = 0;
            let dy = 0;
            let moving = false;
            const beforeX = pos.x;
            const beforeY = pos.y;
            if (held.left) dx -= 1;
            if (held.right) dx += 1;
            if (held.up) dy -= 1;
            if (held.down) dy += 1;

            if (dx || dy) {
                const length = Math.hypot(dx, dy);
                pos.x += (dx / length) * speed * dt;
                pos.y += (dy / length) * speed * dt;
                faceBy(dx, dy);
                moving = true;
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
                    moving = true;
                }
            }

            clampFreddy();
            if (Math.hypot(pos.x - beforeX, pos.y - beforeY) < 0.2) moving = false;
            placeFreddy();
            updateWalk(moving, dt);

            attractions.forEach(function (item) {
                const near = isAtAttraction(item);

                if (near && !item.near && !spotOpen) openSpot(item);
                item.near = near;
            });
        }

        requestAnimationFrame(moveFreddy);
    }

    requestAnimationFrame(moveFreddy);
});
