/**
 * script.js - Mikmedia Hero Section
 * Handles basic interactivity and micro-animations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Basic Carousel Dot Interaction (Mock functionality)
    const dots = document.querySelectorAll('.dot');
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            // Remove active class from all dots
            dots.forEach(d => {
                d.classList.remove('active');
                d.setAttribute('aria-selected', 'false');
            });
            
            // Add active class to clicked dot
            dot.classList.add('active');
            dot.setAttribute('aria-selected', 'true');
            
            // In a real application, this would trigger a background crossfade or slider movement
            console.log(`Slide ${index + 1} selected`);
            // Optional: add a slight CSS transform pulse to the image when switching dots
            const bgWrapper = document.querySelector('.bg-wrapper');
            bgWrapper.style.animation = 'none';
            void bgWrapper.offsetWidth; /* Trigger reflow */
            bgWrapper.style.animation = 'slightZoom 10s ease-out forwards';
        });
    });

    const hero = document.querySelector('.hero');

    // Pixel-perfect Lava Lamp Hitbox detection
    const hitboxImg = new Image();
    hitboxImg.src = 'assets/lavalampe-hitbox.jpg';
    
    // We create a tiny canvas just to read the pixel we hover/click
    const hitboxCanvas = document.createElement('canvas');
    hitboxCanvas.width = 1;
    hitboxCanvas.height = 1;
    const hitboxCtx = hitboxCanvas.getContext('2d', { willReadFrequently: true });

    // The visual indicator canvas that flashes every 7 seconds
    const indicatorCanvas = document.getElementById('lava-lamp-indicator');
    const indicatorCtx = indicatorCanvas ? indicatorCanvas.getContext('2d', { willReadFrequently: true }) : null;

    function updateIndicatorCanvas() {
        if (!indicatorCtx || !hitboxImg.complete || hitboxImg.naturalWidth === 0) return;
        
        const containerW = hero.offsetWidth;
        const containerH = hero.offsetHeight;
        
        indicatorCanvas.width = containerW;
        indicatorCanvas.height = containerH;
        
        const imgW = hitboxImg.naturalWidth;
        const imgH = hitboxImg.naturalHeight;
        const imgRatio = imgW / imgH;
        const containerRatio = containerW / containerH;
        
        let drawW, drawH, offsetX, offsetY;
        
        if (containerRatio > imgRatio) {
            drawW = containerW;
            drawH = containerW / imgRatio;
            offsetX = 0;
            offsetY = (containerH - drawH) / 2;
        } else {
            drawW = containerH * imgRatio;
            drawH = containerH;
            offsetX = (containerW - drawW) / 2;
            offsetY = 0;
        }
        
        indicatorCtx.clearRect(0, 0, containerW, containerH);
        indicatorCtx.drawImage(hitboxImg, offsetX, offsetY, drawW, drawH);
        
        // Process pixels to extract just the black lava lamp, making the white background transparent
        const imgData = indicatorCtx.getImageData(0, 0, containerW, containerH);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            
            // The black area (the lava lamp mask) -> turn into bright white
            if (r < 80 && g < 80 && b < 80) {
                data[i] = 255;   // R
                data[i+1] = 255; // G
                data[i+2] = 255; // B
                data[i+3] = 255; // Alpha
            } else {
                // Everything else (white background) -> turn fully transparent
                data[i+3] = 0;
            }
        }
        indicatorCtx.putImageData(imgData, 0, 0);
    }
    
    hitboxImg.onload = updateIndicatorCanvas;
    window.addEventListener('resize', updateIndicatorCanvas);

    function isOverHitbox(x, y) {
        if (!hitboxImg.complete || hitboxImg.naturalWidth === 0) return false;
        
        const imgW = hitboxImg.naturalWidth;
        const imgH = hitboxImg.naturalHeight;
        const containerW = hero.offsetWidth;
        const containerH = hero.offsetHeight;
        
        // cover math
        const imgRatio = imgW / imgH;
        const containerRatio = containerW / containerH;
        
        let drawW, drawH, offsetX, offsetY;
        
        if (containerRatio > imgRatio) {
            drawW = containerW;
            drawH = containerW / imgRatio;
            offsetX = 0;
            offsetY = (containerH - drawH) / 2;
        } else {
            drawW = containerH * imgRatio;
            drawH = containerH;
            offsetX = (containerW - drawW) / 2;
            offsetY = 0;
        }
        
        hitboxCtx.clearRect(0, 0, 1, 1);
        hitboxCtx.drawImage(hitboxImg, offsetX - x, offsetY - y, drawW, drawH);
        
        const pixel = hitboxCtx.getImageData(0, 0, 1, 1).data;
        // Black area is the hitbox mask (tolerance for slight compression artifacts)
        const isBlack = pixel[0] < 80 && pixel[1] < 80 && pixel[2] < 80 && pixel[3] > 0;
        return isBlack;
    }

    hero.addEventListener('mousemove', (e) => {
        // Prevent interfering with interactive elements
        if (e.target.closest('a, button, .dot')) {
            hero.style.cursor = '';
            return;
        }
        
        if (isOverHitbox(e.clientX, e.clientY)) {
            hero.style.cursor = 'pointer';
        } else {
            hero.style.cursor = '';
        }
    });

    hero.addEventListener('click', (e) => {
        if (e.target.closest('a, button, .dot')) return;
        
        if (isOverHitbox(e.clientX, e.clientY)) {
            hero.classList.toggle('is-dark');
        }
    }); // Close click listener

    // --- Scroll Animation Logic ---
    const heroStickyContainer = document.querySelector('.hero-sticky-container');
    const heroVideo = document.getElementById('hero-videobg');
    const elementsToWipe = document.querySelectorAll('.header .btn-join, .bottom-brand, .theme-indicator, .carousel-indicators');
    
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateScrollAnimation();
                ticking = false;
            });
            ticking = true;
        }
    });

    function updateScrollAnimation() {
        if (!heroStickyContainer || !heroVideo) return;

        const rect = heroStickyContainer.getBoundingClientRect();
        const maxScroll = rect.height - window.innerHeight;
        let progress = -rect.top / maxScroll;
        progress = Math.max(0, Math.min(1, progress));

        // Manage 'is-scrolled' state
        if (progress > 0) {
            heroStickyContainer.classList.add('is-scrolled');
        } else {
            heroStickyContainer.classList.remove('is-scrolled');
        }

        // Fade in video
        if (progress > 0.01) {
            heroVideo.classList.add('scrolling-active');
        } else {
            heroVideo.classList.remove('scrolling-active');
        }

        // Scrub video playback
        if (heroVideo.duration && !isNaN(heroVideo.duration)) {
            heroVideo.currentTime = progress * heroVideo.duration;
        } else if (heroVideo.readyState >= 1) {
             // Fallback if readyState is sufficient but duration was checked too early
             heroVideo.currentTime = progress * heroVideo.duration;
        }

        // Calculate wipe progress for the last 20%
        const wipeStart = 0.8;
        let wipeProgress = 0;
        if (progress > wipeStart) {
            wipeProgress = (progress - wipeStart) / (1 - wipeStart);
        }

        // Apply wipe transitions
        elementsToWipe.forEach(el => {
            if (wipeProgress > 0 || progress > 0) {
                // Disable transition during scroll to avoid lag
                el.style.transition = 'none';
            } else {
                el.style.transition = '';
            }
            
            el.style.translate = `0 -${wipeProgress * 10}vh`;
            el.style.opacity = 1 - wipeProgress;
        });

        // Fade background into white at the very end (90% to 100%)
        const whiteOverlay = document.querySelector('.bg-white-overlay');
        if (whiteOverlay) {
            let whiteProgress = 0;
            if (progress > 0.9) {
                whiteProgress = (progress - 0.9) / 0.1;
            }
            whiteOverlay.style.opacity = whiteProgress;
        }

        // Reveal About Us Content, highlight nav (92% to 100%)
        const aboutUsContent = document.querySelector('.about-us-content');
        const logoMark = document.querySelector('.logo-mark');
        const sideNav = document.querySelector('.side-nav');
        const navAboutLink = document.querySelector('.side-nav a[href="#about"]');
        
        if (aboutUsContent && logoMark) {
            let aboutProgress = 0;
            if (progress > 0.92) {
                aboutProgress = (progress - 0.92) / 0.08;
                aboutUsContent.classList.add('is-active');
                if (navAboutLink) navAboutLink.classList.add('active');
            } else {
                aboutUsContent.classList.remove('is-active');
                if (navAboutLink) navAboutLink.classList.remove('active');
            }
            
            // Slide up elegantly
            aboutUsContent.style.translate = `0 ${100 - (aboutProgress * 100)}px`;
            aboutUsContent.style.opacity = aboutProgress;
        }
    }
    
    // --- Smooth Scroll Navigation ---
    const aboutLink = document.querySelector('a[href="#about"]');
    if (aboutLink) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (!heroStickyContainer) return;

            const startY = window.scrollY;
            // The maximum we can scroll the container
            const maxScroll = heroStickyContainer.getBoundingClientRect().height - window.innerHeight;
            const targetY = maxScroll; 
            const distance = targetY - startY;
            const duration = 2500; // 2.5 seconds for a cinematic slow scrub
            let startTime = null;
            
            function easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }
            
            function animationStep(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                let progress = timeElapsed / duration;
                if (progress > 1) progress = 1;
                
                const ease = easeInOutCubic(progress);
                window.scrollTo(0, startY + distance * ease);
                
                if (timeElapsed < duration) {
                    window.requestAnimationFrame(animationStep);
                } else {
                    window.history.pushState(null, null, '#about');
                }
            }
            
            window.requestAnimationFrame(animationStep);
        });
    }

    // Initial call
    updateScrollAnimation();

    // --- About Us Video Looping Logic ---
    const aboutVideoContainer = document.querySelector('.about-us-video-container');
    if (aboutVideoContainer) {
        const videoElements = aboutVideoContainer.querySelectorAll('video');
        if (videoElements.length === 2) {
            const videos = ['assets/about-us-1.webm', 'assets/about-us-2.webm'];
            let currentVideoIndex = 0;
            let activeEl = videoElements[0];
            let inactiveEl = videoElements[1];
            
            // Preload second video
            inactiveEl.src = videos[1];
            
            // Explicitly start playing the first video
            activeEl.play().catch(e => console.error("Error playing initial about video:", e));

            function handleVideoEnd() {
                inactiveEl.play().then(() => {
                    // Start crossfade
                    activeEl.style.opacity = '0';
                    inactiveEl.style.opacity = '1';
                    
                    // Swap logic
                    const temp = activeEl;
                    activeEl = inactiveEl;
                    inactiveEl = temp;
                    
                    // Advance index
                    currentVideoIndex = (currentVideoIndex + 1) % videos.length;
                    const nextVideoIndex = (currentVideoIndex + 1) % videos.length;
                    
                    // Preload the next video into the new inactive element after the 1s fade is done
                    setTimeout(() => {
                        inactiveEl.src = videos[nextVideoIndex];
                        inactiveEl.currentTime = 0;
                        inactiveEl.load(); // Forces reset to play from beginning next time
                    }, 1000);

                    // Listen for the next end
                    activeEl.addEventListener('ended', handleVideoEnd, { once: true });
                }).catch(e => console.error("Error playing about video:", e));
            }

            activeEl.addEventListener('ended', handleVideoEnd, { once: true });
        }
    }
});
