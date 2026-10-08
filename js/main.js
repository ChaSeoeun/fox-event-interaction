document.addEventListener('DOMContentLoaded', function () {
    const intro = document.querySelector('.event-intro');
    const parkStage = document.querySelector('.park-stage');
    const enterBtn = document.querySelector('.enter-btn');
    const introUi = document.querySelector('.intro-ui');
    const leftDoor = document.querySelector('.gate-door-left');
    const rightDoor = document.querySelector('.gate-door-right');
    const introFlash = document.querySelector('.intro-flash');
    const section01 = document.querySelector('.section01');
    const parkWorld = document.querySelector('.park-world');
    const mobileQuery = window.matchMedia('(max-width: 1025px)');

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

            layoutPark();
            startFreddy();
        });

        tl.to(introFlash, {
            opacity: 0,
            duration: .85,
            ease: 'power2.inOut',
            onComplete: showBubble
        });
    }

    // 배경 원본 크기
    const PARK_W = 1672;
    const PARK_H = 941;

    const attractions = [
        {
            el: document.querySelector('.class-att'),
            modal: document.querySelector('.class-modal'),
            area: { x: 320, y: 110, w: 350, h: 230 },
            areaMo: { x: 80, y: 500, w: 450, h: 300 }
        },
        {
            el: document.querySelector('.race-att'),
            modal: document.querySelector('.race-modal'),
            area: { x: 300, y: 390, w: 360, h: 240 },
            areaMo: { x: 102, y: 1280, w: 450, h: 300 },
            hit: { left: .2, top: .46, right: .2, bottom: .08 }
        },
        {
            el: document.querySelector('.speech-att'),
            modal: document.querySelector('.speech-modal'),
            area: { x: 990, y: 100, w: 350, h: 230 },
            areaMo: { x: 252, y: 930, w: 450, h: 300 }
        },
        {
            el: document.querySelector('.dub-att'),
            modal: document.querySelector('.dub-modal'),
            area: { x: 1000, y: 390, w: 350, h: 250 },
            areaMo: { x: 200, y: 1670, w: 450, h: 300 },
            hit: { left: .2, top: .46, right: .2, bottom: .08 }
        }
    ];

    const parkMap = document.querySelector('.park-map');
    const parkMapArea = { x: 730, y: 230, w: 230, h: 250 };
    const parkMapAreaMo = { x: 142, y: 110, w: 440, h: 209 };
    const MO_PARK_W = 724;
    const calendarBtn = document.querySelector('.calendar-btn');

    function syncMapImage() {
        const file = mobileQuery.matches ? 'mo-event-cont05.png' : 'event-cont05.png';
        if (parkMap.src.indexOf(file) !== -1) return;
        parkMap.src = './images/' + file;
    }

    syncMapImage();

    // 배경 cover랑 맞춰서 배치
    function placeOnPark(img, area) {
        const viewW = section01.clientWidth;
        const viewH = section01.clientHeight;
        if (!viewW || !img.naturalWidth) return;

        const scale = Math.max(viewW / PARK_W, viewH / PARK_H);
        const offsetX = (viewW - PARK_W * scale) / 2;
        const offsetY = (viewH - PARK_H * scale) / 2;
        const ratio = img.naturalWidth / img.naturalHeight;
        let w = area.w;
        let h = area.h;

        if (ratio > w / h) {
            h = w / ratio;
        } else {
            w = h * ratio;
        }

        img.style.left = offsetX + (area.x + (area.w - w) / 2) * scale + 'px';
        img.style.top = offsetY + (area.y + (area.h - h) / 2) * scale + 'px';
        img.style.width = w * scale + 'px';
    }

    // 모바일 배경은 화면 너비에 맞춘 원본 좌표
    function placeInWorld(img, area) {
        const worldW = parkWorld.clientWidth;
        if (!worldW || !img.naturalWidth) return;

        const scale = worldW / MO_PARK_W;
        const ratio = img.naturalWidth / img.naturalHeight;
        let w = area.w;
        let h = area.h;

        if (ratio > w / h) {
            h = w / ratio;
        } else {
            w = h * ratio;
        }

        img.style.left = (area.x + (area.w - w) / 2) * scale + 'px';
        img.style.top = (area.y + (area.h - h) / 2) * scale + 'px';
        img.style.width = w * scale + 'px';
    }

    function layoutPark() {
        syncMapImage();
        if (!parkMap.complete) return;

        attractions.forEach(function (item) {
            if (mobileQuery.matches) placeInWorld(item.el, item.areaMo);
            else placeOnPark(item.el, item.area);
        });

        if (mobileQuery.matches) {
            placeInWorld(parkMap, parkMapAreaMo);
            calendarBtn.style.width = parkMap.offsetWidth * .5 + 'px';
            calendarBtn.style.left = parkMap.offsetLeft + parkMap.offsetWidth / 2 + 'px';
            calendarBtn.style.top = parkMap.offsetTop + parkMap.offsetHeight * .68 + 'px';
            document.querySelectorAll('.mo-att').forEach(function (box) {
                const item = attractions.find(function (att) {
                    return att.el.classList.contains(box.dataset.att + '-att');
                });
                if (!item || !item.el.offsetWidth) return;
                const w = item.el.offsetWidth;
                box.style.left = item.el.offsetLeft + w / 2 + 'px';
                box.style.top = item.el.offsetTop + item.el.offsetHeight * .75 + 'px';
                box.style.width = w * .9 + 'px';
                box.style.fontSize = Math.max(12, w * .055) + 'px';
            });
        } else {
            placeOnPark(parkMap, parkMapArea);
            calendarBtn.style.width = parkMap.offsetWidth * .7 + 'px';
            calendarBtn.style.left = parkMap.offsetLeft + parkMap.offsetWidth / 2 + 'px';
            calendarBtn.style.top = parkMap.offsetTop + parkMap.offsetHeight * .7 + 'px';
        }
    }

    window.addEventListener('resize', layoutPark);
    attractions.forEach(function (item) {
        item.el.addEventListener('load', layoutPark);
    });
    parkMap.addEventListener('load', layoutPark);

    parkWorld.addEventListener('click', function (e) {
        const box = e.target.closest('.mo-att');
        if (!box) return;
        const item = attractions.find(function (att) {
            return att.el.classList.contains(box.dataset.att + '-att');
        });
        if (item) openModal(item);
    });

    const freddy = document.querySelector('.freddy');
    const bubble = document.querySelector('.freddy-bubble');
    const sprites = {
        up: ['./images/character-b.png', './images/character-b2.png'],
        down: ['./images/character-f.png', './images/character-f2.png'],
        left: ['./images/character-l.png', './images/character-l2.png'],
        right: ['./images/character-r.png', './images/character-r2.png']
    };
    const keyMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        a: 'left',
        s: 'down',
        d: 'right'
    };

    function directionOf(key) {
        return keyMap[key] || keyMap[key.toLowerCase()];
    }
    const held = { up: false, down: false, left: false, right: false };
    const SPEED = 340;
    const STEP_TIME = .16;

    let pos = { x: 0, y: 0 };
    let target = null;
    let facing = 'down';
    let frame = 0;
    let frameTime = 0;
    let modalOpen = false;

    Object.values(sprites).flat().forEach(function (src) {
        new Image().src = src;
    });

    function setSprite(dir, nextFrame) {
        if (dir === facing && nextFrame === frame) return;
        facing = dir;
        frame = nextFrame;
        freddy.src = sprites[dir][nextFrame];
    }

    function face(dx, dy) {
        if (Math.abs(dx) < .5 && Math.abs(dy) < .5) return;

        let dir;
        if (Math.abs(dx) > Math.abs(dy)) {
            dir = dx > 0 ? 'right' : 'left';
        } else {
            dir = dy > 0 ? 'down' : 'up';
        }

        if (dir !== facing) setSprite(dir, 0);
    }

    function animateWalk(moving, dt) {
        if (!moving) {
            frameTime = 0;
            setSprite(facing, 0);
            return;
        }

        frameTime += dt;
        if (frameTime < STEP_TIME) return;
        frameTime -= STEP_TIME;
        setSprite(facing, frame ? 0 : 1);
    }

    function releaseKeys() {
        held.up = held.down = held.left = held.right = false;
    }

    function showBubble() {
        bubble.hidden = false;
        drawFreddy();
    }

    function hideBubble() {
        bubble.hidden = true;
    }

    function drawFreddy() {
        freddy.style.left = pos.x + 'px';
        freddy.style.top = pos.y + 'px';

        if (!bubble.hidden) {
            bubble.style.left = pos.x + 'px';
            bubble.style.top = pos.y - freddy.offsetHeight + 'px';
        }
    }

    function startFreddy() {
        if (mobileQuery.matches && parkMap.offsetWidth) {
            pos.x = parkMap.offsetLeft + parkMap.offsetWidth / 2;
            pos.y = calendarBtn.offsetTop + calendarBtn.offsetHeight + freddy.offsetHeight + 10;
        } else {
            pos.x = section01.clientWidth * .5;
            pos.y = section01.clientHeight * .78;
        }
        cameraY = 0;
        drawFreddy();
        updateCamera();
        requestAnimationFrame(tick);
    }

    // 모바일은 프레디가 화면 55%보다 아래, 30%보다 위로 가면 배경이 따라감
    let cameraY = 0;

    function updateCamera() {
        if (!mobileQuery.matches) {
            cameraY = 0;
            parkWorld.style.transform = '';
            return;
        }

        const viewH = section01.clientHeight;
        const maxY = Math.max(0, parkWorld.offsetHeight - viewH);
        const screenY = pos.y - cameraY;

        if (screenY > viewH * .55) cameraY = pos.y - viewH * .55;
        if (screenY < viewH * .3) cameraY = pos.y - viewH * .3;
        cameraY = Math.min(maxY, Math.max(0, cameraY));
        parkWorld.style.transform = 'translateY(' + -cameraY + 'px)';
    }

    window.addEventListener('resize', updateCamera);

    // 입구는 이미지 아래쪽
    function entranceOf(item) {
        const el = item.el;
        return {
            x: el.offsetLeft + el.offsetWidth / 2,
            y: el.offsetTop + el.offsetHeight * .88
        };
    }

    function blockedByMap(x, y) {
        const left = parkMap.offsetLeft;
        const top = parkMap.offsetTop;
        const width = parkMap.offsetWidth;
        const height = parkMap.offsetHeight;
        if (!width || !height) return false;

        return x > left && x < left + width && y > top && y < top + height;
    }

    function isInside(item) {
        const el = item.el;
        const hit = item.hit || { left: 0, top: 0, right: 0, bottom: 0 };
        const left = el.offsetLeft + el.offsetWidth * hit.left;
        const right = el.offsetLeft + el.offsetWidth * (1 - hit.right);
        const top = el.offsetTop + el.offsetHeight * hit.top;
        const bottom = el.offsetTop + el.offsetHeight * (1 - hit.bottom);

        return pos.x >= left && pos.x <= right && pos.y >= top && pos.y <= bottom;
    }

    function openModal(item) {
        modalOpen = true;
        target = null;
        releaseKeys();
        const ticket = item.modal.querySelector('.ticket');
        if (ticket) resetTicket(ticketState(ticket));
        item.modal.hidden = false;
    }

    function closeModal(item) {
        modalOpen = false;
        item.modal.hidden = true;
    }

    attractions.forEach(function (item) {
        item.modal.querySelector('.modal-close').addEventListener('click', function () {
            closeModal(item);
        });

        item.modal.addEventListener('pointerdown', function (e) {
            if (e.target === item.modal) closeModal(item);
        });
    });

    const TEAR_ANGLE = 32;
    const ticketStates = new Map();

    function ticketState(ticket) {
        let state = ticketStates.get(ticket);
        if (state) return state;
        state = {
            main: ticket.querySelector('.ticket-main'),
            stub: ticket.querySelector('.ticket-stub'),
            link: ticket.parentElement.querySelector('.ticket-link'),
            tear: 0,
            done: false,
            drag: null,
            linkCall: null
        };
        ticketStates.set(ticket, state);
        return state;
    }

    // 0이면 붙은 상태, 1이면 다 찢김. 손 떼면 그 각도 유지
    function renderTear(state) {
        if (mobileQuery.matches) {
            gsap.set(state.main, {
                rotation: 16 * state.tear,
                x: 6 * state.tear,
                y: state.main.offsetHeight * .5 * state.tear
            });
            gsap.set(state.stub, { rotation: 0 });
            return;
        }

        gsap.set(state.main, {
            rotation: TEAR_ANGLE * state.tear,
            x: state.main.offsetWidth * .35 * state.tear,
            y: 8 * state.tear
        });
        gsap.set(state.stub, { rotation: -1.5 * state.tear });
    }

    function resetTicket(state) {
        gsap.killTweensOf([state.stub, state.main]);
        if (state.linkCall) state.linkCall.kill();
        state.tear = 0;
        state.done = false;
        state.drag = null;
        gsap.set(state.main, { autoAlpha: 1 });
        renderTear(state);
    }

    // 떨어지는 중에 열어야 새 탭이 막히지 않음
    function completeTear(state) {
        state.done = true;
        const mobile = mobileQuery.matches;
        gsap.to(state.main, {
            x: mobile ? '+=60' : '+=180',
            y: mobile ? '+=520' : '+=420',
            rotation: mobile ? 40 : TEAR_ANGLE + 40,
            autoAlpha: 0,
            duration: .8,
            ease: 'power2.in'
        });
        state.linkCall = gsap.delayedCall(.4, function () {
            state.link.click();
        });
        gsap.to(state.stub, { rotation: 0, duration: .5, ease: 'back.out(2)' });
    }

    document.querySelectorAll('.ticket').forEach(function (ticket) {
        const state = ticketState(ticket);

        state.main.addEventListener('pointerdown', function (e) {
            if (state.done) return;
            e.preventDefault();
            state.main.setPointerCapture(e.pointerId);
            state.main.classList.add('is-dragging');
            state.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, start: state.tear };
        });

        state.main.addEventListener('pointermove', function (e) {
            if (!state.drag || e.pointerId !== state.drag.id) return;
            const dx = e.clientX - state.drag.x;
            const dy = e.clientY - state.drag.y;
            const mobile = mobileQuery.matches;
            const pull = mobile ? dy + dx * .3 : dx + dy * .6;
            const span = mobile ? state.main.offsetWidth * .6 : state.main.offsetWidth * 1.4;
            const next = Math.max(0, Math.min(1, state.drag.start + pull / span));
            state.tear = next > .98 ? 1 : next;
            renderTear(state);
        });

        function endTearDrag(e) {
            if (!state.drag || e.pointerId !== state.drag.id) return;
            state.drag = null;
            state.main.classList.remove('is-dragging');
            if (state.tear >= 1 && !state.done) completeTear(state);
        }

        state.main.addEventListener('pointerup', endTearDrag);
        state.main.addEventListener('pointercancel', endTearDrag);
    });

    const calendarMap = document.getElementById('calendar-map');
    const mapBackdrop = calendarMap.querySelector('.map-backdrop');
    const mapSheet = calendarMap.querySelector('.map-sheet');
    const rollL = calendarMap.querySelector('.map-roll-l');
    const rollR = calendarMap.querySelector('.map-roll-r');
    const rolls = [rollL, rollR];
    const scheduleItems = calendarMap.querySelectorAll('.map-months li, .map-group');
    const mapDismiss = calendarMap.querySelector('.map-dismiss');

    // 롤에서 종이가 보이는 비율, 지도 좌우 여백
    const ROLL_L_VISIBLE = 197 / 455;
    const ROLL_R_VISIBLE = 202 / 510;
    const MAP_EDGE = 63 / 1442;

    const memo = calendarMap.querySelector('.map-memo');
    const memoPaper = memo.querySelector('.memo-paper');
    const memoTab = memo.querySelector('.memo-tab');
    const memoTable = memo.querySelector('.memo-table');
    const memoBack = memo.querySelector('.memo-back');
    const memoContent = [memoTable, memoBack];
    const MEMO_SMALL = .17;
    const MEMO_UPRIGHT = -5;

    const unfold = { p: 0, edge: 0 };
    let mapState = 'closed';
    let mapTween = null;
    let memoBig = false;
    let memoTween = null;
    let memoFlutter = null;

    // 메모 접혀 있을 때 위치 (지도 오른쪽 위)
    function memoSmallPos() {
        const stage = memo.parentElement;
        return {
            x: stage.offsetWidth * .42,
            y: -stage.offsetHeight * .42,
            scale: MEMO_SMALL,
            rotation: 0
        };
    }

    function startFlutter() {
        stopFlutter();
        memoFlutter = gsap.fromTo(memoPaper, {
            rotation: MEMO_UPRIGHT - 3,
            skewX: 1.5
        }, {
            rotation: MEMO_UPRIGHT + 3,
            skewX: -1.5,
            duration: .8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    function stopFlutter() {
        if (memoFlutter) memoFlutter.kill();
        memoFlutter = null;
    }

    function resetMemo() {
        stopFlutter();
        if (memoTween) memoTween.kill();
        memoBig = false;
        gsap.set(memo, Object.assign({ xPercent: -50, yPercent: -50, autoAlpha: 0 }, memoSmallPos()));
        gsap.set(memoPaper, { rotation: MEMO_UPRIGHT, skewX: 0, transformOrigin: '50% 50%' });
        gsap.set(memoTab, { autoAlpha: 1 });
        gsap.set(memoContent, { autoAlpha: 0 });
    }

    function showTable() {
        if (memoBig || mapState !== 'open') return;
        memoBig = true;
        stopFlutter();
        if (memoTween) memoTween.kill();

        memoTween = gsap.timeline();
        memoTween.to(memoPaper, { rotation: MEMO_UPRIGHT, skewX: 0, duration: .2 });
        memoTween.to(memoTab, { autoAlpha: 0, duration: .15 }, 0);
        memoTween.to(memo, {
            x: 0,
            y: 0,
            scale: 1,
            duration: .75,
            ease: 'power3.inOut'
        }, .1);
        memoTween.fromTo(memoContent, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .3 }, '-=.15');
    }

    function showCalendar() {
        if (!memoBig) return;
        memoBig = false;
        if (memoTween) memoTween.kill();

        memoTween = gsap.timeline({ onComplete: startFlutter });
        memoTween.to(memoContent, { autoAlpha: 0, duration: .2 });
        memoTween.to(memo, Object.assign({ duration: .6, ease: 'power3.inOut' }, memoSmallPos()));
        memoTween.to(memoTab, { autoAlpha: 1, duration: .2 }, '-=.15');
    }

    function renderUnfold() {
        const w = mapSheet.offsetWidth;
        const visL = rollL.offsetWidth * ROLL_L_VISIBLE;
        const visR = rollR.offsetWidth * ROLL_R_VISIBLE;
        const travelL = w / 2 - w * MAP_EDGE - visL;
        const travelR = w / 2 - w * MAP_EDGE - visR;
        const moveL = travelL * unfold.p;
        const moveR = travelR * unfold.p;

        gsap.set(rollL, { x: -moveL });
        gsap.set(rollR, { x: moveR });

        // 롤 사이로 열고, 마지막에 가장자리까지
        const halfL = Math.min(w / 2, unfold.p ? moveL + visL / 2 : 0);
        const halfR = Math.min(w / 2, unfold.p ? moveR + visR / 2 : 0);
        const insetL = (w / 2 - halfL) * (1 - unfold.edge);
        const insetR = (w / 2 - halfR) * (1 - unfold.edge);
        mapSheet.style.clipPath = 'inset(0 ' + insetR + 'px 0 ' + insetL + 'px)';
    }

    function openCalendarMap() {
        if (mapState !== 'closed') return;
        mapState = 'opening';
        modalOpen = true;
        target = null;
        releaseKeys();
        hideBubble();
        calendarBtn.setAttribute('aria-expanded', 'true');

        unfold.p = 0;
        unfold.edge = 0;
        calendarMap.hidden = false;
        gsap.set(mapBackdrop, { opacity: 0 });
        gsap.set(mapDismiss, { autoAlpha: 0 });
        gsap.set(scheduleItems, { autoAlpha: 1 });
        gsap.set(rolls, { autoAlpha: 0, y: 40, scale: .7, transformOrigin: '50% 50%' });
        renderUnfold();
        resetMemo();

        mapTween = gsap.timeline({
            onComplete: function () {
                mapState = 'open';
                mapDismiss.focus();
            }
        });

        mapTween.to(mapBackdrop, { opacity: 1, duration: .3, ease: 'power1.out' });

        mapTween.to(rolls, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: .55,
            ease: 'back.out(1.6)'
        }, .05);

        mapTween.to(unfold, {
            p: 1,
            duration: 1.1,
            ease: 'power2.inOut',
            onUpdate: renderUnfold
        }, .8);

        mapTween.to(unfold, {
            edge: 1,
            duration: .3,
            ease: 'power1.out',
            onUpdate: renderUnfold
        }, 1.85);

        mapTween.to(rolls, {
            autoAlpha: 0,
            duration: .3,
            ease: 'power1.out'
        }, 1.85);

        mapTween.to(mapDismiss, { autoAlpha: 1, duration: .25 }, 2.1);

        const small = memoSmallPos();
        mapTween.fromTo(memo, {
            autoAlpha: 0,
            y: small.y - 40,
            scale: MEMO_SMALL * 1.5,
            rotation: -20
        }, {
            autoAlpha: 1,
            y: small.y,
            scale: MEMO_SMALL,
            rotation: 0,
            duration: .5,
            ease: 'back.out(1.8)',
            onComplete: startFlutter
        });
    }

    function closeCalendarMap() {
        if (mapState === 'closed' || mapState === 'closing') return;
        mapState = 'closing';
        if (mapTween) mapTween.kill();

        mapTween = gsap.timeline({
            onComplete: function () {
                calendarMap.hidden = true;
                mapState = 'closed';
                modalOpen = false;
                calendarBtn.setAttribute('aria-expanded', 'false');
                calendarBtn.focus();
            }
        });

        stopFlutter();
        if (memoTween) memoTween.kill();
        mapTween.to([mapDismiss, scheduleItems, memo], { autoAlpha: 0, duration: .15 });
        mapTween.to(rolls, { autoAlpha: 1, y: 0, scale: 1, duration: .15 }, 0);
        mapTween.to(unfold, { edge: 0, duration: .15, onUpdate: renderUnfold }, 0);

        mapTween.to(unfold, {
            p: 0,
            duration: .55,
            ease: 'power2.inOut',
            onUpdate: renderUnfold
        }, .12);

        mapTween.to(rolls, {
            autoAlpha: 0,
            y: 30,
            scale: .7,
            duration: .25,
            ease: 'power2.in'
        }, .65);

        mapTween.to(mapBackdrop, { opacity: 0, duration: .25 }, .7);
    }

    calendarBtn.addEventListener('click', openCalendarMap);
    mapBackdrop.addEventListener('click', closeCalendarMap);
    mapDismiss.addEventListener('click', closeCalendarMap);
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeCalendarMap();
    });
    memoTab.addEventListener('click', showTable);
    memo.addEventListener('click', function (e) {
        if (e.target.closest('.memo-back')) showCalendar();
    });

    window.addEventListener('resize', function () {
        if (mapState === 'closed') return;
        renderUnfold();
        if (!memoBig) gsap.set(memo, memoSmallPos());
    });

    section01.addEventListener('pointerdown', function (e) {
        if (modalOpen || e.target.closest('button, a, .mo-att, .joystick')) return;
        hideBubble();

        const clicked = attractions.find(function (item) {
            return item.el === e.target;
        });

        if (clicked) {
            target = entranceOf(clicked);
            return;
        }

        const rect = parkWorld.getBoundingClientRect();
        const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        if (blockedByMap(point.x, point.y)) return;
        target = point;
    });

    window.addEventListener('keydown', function (e) {
        const dir = directionOf(e.key);
        if (!dir || !section01.classList.contains('is-active') || modalOpen) return;
        e.preventDefault();
        hideBubble();
        held[dir] = true;
        target = null;
    });

    window.addEventListener('keyup', function (e) {
        const dir = directionOf(e.key);
        if (dir) held[dir] = false;
    });

    window.addEventListener('blur', releaseKeys);

    const joystick = document.querySelector('.joystick');
    const joystickKnob = joystick.querySelector('.joystick-knob');
    const joy = { x: 0, y: 0, id: null };

    function moveJoystick(e) {
        const rect = joystick.getBoundingClientRect();
        const radius = rect.width / 2;
        let x = e.clientX - (rect.left + radius);
        let y = e.clientY - (rect.top + radius);
        const dist = Math.hypot(x, y);
        if (dist > radius) {
            x = x / dist * radius;
            y = y / dist * radius;
        }
        joy.x = x / radius;
        joy.y = y / radius;
        joystickKnob.style.transform = 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px))';
    }

    function releaseJoystick(e) {
        if (e.pointerId !== joy.id) return;
        joy.id = null;
        joy.x = joy.y = 0;
        joystickKnob.style.transform = '';
    }

    joystick.addEventListener('pointerdown', function (e) {
        if (modalOpen) return;
        e.preventDefault();
        e.stopPropagation();
        hideBubble();
        target = null;
        joy.id = e.pointerId;
        joystick.setPointerCapture(e.pointerId);
        moveJoystick(e);
    });

    joystick.addEventListener('pointermove', function (e) {
        if (e.pointerId === joy.id) moveJoystick(e);
    });

    joystick.addEventListener('pointerup', releaseJoystick);
    joystick.addEventListener('pointercancel', releaseJoystick);

    let lastTime = performance.now();

    function tick(now) {
        const dt = Math.min(.05, (now - lastTime) / 1000);
        lastTime = now;

        const prevX = pos.x;
        const prevY = pos.y;
        let dx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
        let dy = (held.down ? 1 : 0) - (held.up ? 1 : 0);

        const joyLen = Math.hypot(joy.x, joy.y);

        if (dx || dy) {
            const len = Math.hypot(dx, dy);
            pos.x += dx / len * SPEED * dt;
            pos.y += dy / len * SPEED * dt;
            face(dx, dy);
        } else if (joyLen > .2 && !modalOpen) {
            pos.x += joy.x * SPEED * dt;
            pos.y += joy.y * SPEED * dt;
            face(joy.x, joy.y);
        } else if (target) {
            dx = target.x - pos.x;
            dy = target.y - pos.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 4) {
                pos.x = target.x;
                pos.y = target.y;
                target = null;
            } else {
                const step = Math.min(dist, SPEED * dt);
                pos.x += dx / dist * step;
                pos.y += dy / dist * step;
                face(dx, dy);
            }
        }

        const nextX = pos.x;
        const nextY = pos.y;
        if (blockedByMap(nextX, prevY)) pos.x = prevX;
        if (blockedByMap(pos.x, nextY)) pos.y = prevY;
        if (target && pos.x === prevX && pos.y === prevY) target = null;

        pos.x = Math.min(parkWorld.offsetWidth - 12, Math.max(12, pos.x));
        const minY = mobileQuery.matches && parkMap.offsetHeight
            ? parkMap.offsetTop + parkMap.offsetHeight + freddy.offsetHeight
            : 12;
        pos.y = Math.min(parkWorld.offsetHeight - 12, Math.max(minY, pos.y));

        drawFreddy();
        updateCamera();
        animateWalk(Math.hypot(pos.x - prevX, pos.y - prevY) > .2, dt);

        attractions.forEach(function (item) {
            const inside = isInside(item);
            if (inside && !item.inside && !modalOpen && !mobileQuery.matches) openModal(item);
            item.inside = inside;
        });

        requestAnimationFrame(tick);
    }
});
