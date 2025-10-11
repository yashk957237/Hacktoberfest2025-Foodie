/* ========================================
   INTERACTIVE CURSOR ANIMATION SCRIPT
   ======================================== */

(function () {
    'use strict';

    // Check if device supports hover (desktop only)
    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (!isDesktop) {
        return; // Exit early on touch devices
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create cursor elements
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';

    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';

    const cursorRing = document.createElement('div');
    cursorRing.className = 'cursor-ring';

    cursor.appendChild(cursorDot);
    cursor.appendChild(cursorRing);
    document.body.appendChild(cursor);

    // Cursor position variables
    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let ringX = 0;
    let ringY = 0;

    // Smooth follow settings
    const dotSpeed = prefersReducedMotion ? 1 : 0.15;
    const ringSpeed = prefersReducedMotion ? 1 : 0.08;

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor animation
    function animateCursor() {
        // Calculate distance
        const distX = mouseX - dotX;
        const distY = mouseY - dotY;

        // Smooth follow with easing
        dotX += distX * dotSpeed;
        dotY += distY * dotSpeed;

        ringX += (mouseX - ringX) * ringSpeed;
        ringY += (mouseY - ringY) * ringSpeed;

        // Apply transforms
       cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;


        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // Interactive elements selector
    const interactiveElements = 'a, button, [role="button"], input[type="submit"], input[type="button"], .clickable, .card, [onclick]';

    // Hover effect on interactive elements
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveElements)) {
            cursor.classList.add('hover');

            // Magnetic effect (optional enhancement)
            if (!prefersReducedMotion) {
                applyMagneticEffect(e.target.closest(interactiveElements));
            }
        }

        // Text selection highlight
        if (e.target.tagName === 'P' || e.target.tagName === 'H1' ||
            e.target.tagName === 'H2' || e.target.tagName === 'H3' ||
            e.target.tagName === 'SPAN') {
            cursor.classList.add('text');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveElements)) {
            cursor.classList.remove('hover');
            removeMagneticEffect();
        }

        cursor.classList.remove('text');
    });

    // Click animation
    document.addEventListener('mousedown', () => {
        cursor.classList.add('click');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('click');

        // Create ripple effect
        if (!prefersReducedMotion) {
            createRipple(mouseX, mouseY);
        }
    });

    // Hide cursor on input fields
    document.addEventListener('mouseover', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            cursor.classList.add('hidden');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            cursor.classList.remove('hidden');
        }
    });

    // Magnetic hover effect
    let magneticElement = null;

    function applyMagneticEffect(element) {
        magneticElement = element;

        element.addEventListener('mousemove', magneticMove);
        element.addEventListener('mouseleave', magneticReset);
    }

    function magneticMove(e) {
        if (!magneticElement) return;

        const rect = magneticElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate pull strength (max 15px)
        const deltaX = (e.clientX - centerX) * 0.3;
        const deltaY = (e.clientY - centerY) * 0.3;

        mouseX = centerX + deltaX;
        mouseY = centerY + deltaY;
    }

    function magneticReset() {
        if (magneticElement) {
            magneticElement.removeEventListener('mousemove', magneticMove);
            magneticElement.removeEventListener('mouseleave', magneticReset);
            magneticElement = null;
        }
    }

    function removeMagneticEffect() {
        magneticReset();
    }

    // Ripple effect on click
    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'cursor-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        document.body.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Handle page visibility (pause animation when tab is hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cursor.style.opacity = '0';
        } else {
            cursor.style.opacity = '1';
        }
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });

})();