document.addEventListener('DOMContentLoaded', () => {
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
    });

    // --- High-End Scrolling Choreography Engine ---
    const heroVideo = document.getElementById('hero-videobg');
    const heroStickyContainer = document.querySelector('.hero-sticky-container');
    const bgImages = document.querySelectorAll('.bg-image');
    const logoMark = document.querySelector('.logo-mark');
    
    // Grab all elements that need to be wiped out initially
    const headerActions = document.querySelector('.header-actions');
    const sideNavLinks = document.querySelectorAll('.side-nav a');
    const bottomBrand = document.querySelector('.bottom-brand');
    const themeIndicator = document.querySelector('.theme-indicator');
    const carouselIndicators = document.querySelector('.carousel-indicators');
    const inlineElements = [headerActions, bottomBrand, themeIndicator, carouselIndicators];

    let lastProgress = 0;
    let isAutoScrolling = false;

    function updateScrollAnimation() {
        if (!heroStickyContainer) return;
        
        const rect = heroStickyContainer.getBoundingClientRect();
        const scrolled = -rect.top;
        const totalScrollable = rect.height - window.innerHeight;
        
        let progress = scrolled / totalScrollable;
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;

        const scrollingDown = progress > lastProgress;
        const scrollingUp = progress < lastProgress;

        if (progress > 0) {
            document.body.classList.add('is-scrolled');
        } else {
            document.body.classList.remove('is-scrolled');
        }

        // --- Auto Scroll Snapping Logic ---
        if (!isAutoScrolling) {
            if (scrollingDown) {
                if (lastProgress < 0.20 && progress >= 0.20 && progress < 0.28) {
                    scrollToProgress(0.31, '#about');
                } else if (lastProgress < 0.40 && progress >= 0.40 && progress < 0.48) {
                    scrollToProgress(0.51, '#design');
                } else if (lastProgress < 0.60 && progress >= 0.60 && progress < 0.68) {
                    scrollToProgress(0.71, '#code');
                } else if (lastProgress < 0.80 && progress >= 0.80 && progress < 0.88) {
                    scrollToProgress(1.0, '#solutions');
                }
            } else if (scrollingUp) {
                if (lastProgress > 0.20 && progress <= 0.20 && progress > 0.12) {
                    scrollToProgress(0, '#top');
                } else if (lastProgress > 0.40 && progress <= 0.40 && progress > 0.32) {
                    scrollToProgress(0.31, '#about');
                } else if (lastProgress > 0.60 && progress <= 0.60 && progress > 0.52) {
                    scrollToProgress(0.51, '#design');
                } else if (lastProgress > 0.80 && progress <= 0.80 && progress > 0.72) {
                    scrollToProgress(0.71, '#code');
                }
            }
        }

        // Activate hero video only when scrolling starts (0.05 to 0.20)
        if (progress > 0.05 && progress < 0.28) {
            heroVideo.classList.add('scrolling-active');
            bgImages.forEach(img => img.style.opacity = '0');
        } else {
            heroVideo.classList.remove('scrolling-active');
            if (progress <= 0.05) {
                bgImages.forEach(img => img.style.opacity = '');
            }
        }

        let videoProgress = progress / 0.28;
        if (videoProgress > 1) videoProgress = 1;
        
        if (heroVideo.duration && !isNaN(heroVideo.duration)) {
             heroVideo.currentTime = videoProgress * heroVideo.duration;
        } else if (heroVideo.readyState >= 1) {
             heroVideo.currentTime = videoProgress * heroVideo.duration;
        }

        const wipeStart = 0.10;
        const wipeEnd = 0.18;
        let wipeProgress = 0;
        if (progress > wipeStart) {
            wipeProgress = Math.min((progress - wipeStart) / (wipeEnd - wipeStart), 1);
        }

        inlineElements.forEach(el => {
            if (el) {
                el.style.opacity = 1 - wipeProgress;
                el.style.transform = `translateX(-${wipeProgress * 100}px)`;
            }
        });
        
        const sideNavLinks = document.querySelectorAll('.side-nav a');
        sideNavLinks.forEach(l => l.classList.remove('active'));

        const whiteOverlay = document.querySelector('.bg-white-overlay');
        if (whiteOverlay) {
            let whiteProgress = 0;
            if (progress > 0.16 && progress <= 0.20) {
                whiteProgress = (progress - 0.16) / 0.04;
            } else if (progress > 0.20) {
                whiteProgress = 1;
            }
            whiteOverlay.style.opacity = whiteProgress;
        }

        const navAboutLink = document.querySelector('.side-nav a[href="#about"]');
        const navDesignLink = document.querySelector('.side-nav a[href="#design"]');
        const navCodeLink = document.querySelector('.side-nav a[href="#code"]');
        const navSolutionsLink = document.querySelector('.side-nav a[href="#solutions"]');
        
        const aboutUsContent = document.querySelector('.about-us-content');
        const designContent = document.querySelector('.design-content');
        const codeContent = document.querySelector('.code-content');
        const solutionsContent = document.querySelector('.solutions-content');
        
        // About Us (0.20 to 0.40)
        if (aboutUsContent) {
            let aboutProgress = 0;
            let aboutTranslateY = 30;
            
            if (progress > 0.20 && progress <= 0.28) { // Entering
                aboutProgress = (progress - 0.20) / 0.08;
                aboutTranslateY = 30 - (aboutProgress * 30);
                aboutUsContent.classList.add('is-active');
            } else if (progress > 0.28 && progress <= 0.34) { // Resting
                aboutProgress = 1;
                aboutTranslateY = 0;
                aboutUsContent.classList.add('is-active');
                if (navAboutLink) navAboutLink.classList.add('active');
            } else if (progress > 0.34 && progress <= 0.40) { // Exiting
                const exitProgress = (progress - 0.34) / 0.06;
                aboutProgress = 1 - exitProgress;
                aboutTranslateY = -(exitProgress * 30);
                aboutUsContent.classList.add('is-active');
            } else {
                aboutUsContent.classList.remove('is-active');
            }
            
            aboutUsContent.style.translate = `0 ${aboutTranslateY}vh`;
            aboutUsContent.style.opacity = aboutProgress;
        }

        // Design Content (0.40 to 0.60)
        let isDesignActive = false;
        if (designContent) {
            let designProgress = 0;
            let designTranslateY = 30;
            
            if (progress > 0.40 && progress <= 0.48) { // Entering
                designProgress = (progress - 0.40) / 0.08;
                designTranslateY = 30 - (designProgress * 30);
                designContent.classList.add('is-active');
                isDesignActive = true;
            } else if (progress > 0.48 && progress <= 0.54) { // Resting
                designProgress = 1;
                designTranslateY = 0;
                designContent.classList.add('is-active');
                if (navDesignLink) navDesignLink.classList.add('active');
                isDesignActive = true;
            } else if (progress > 0.54 && progress <= 0.60) { // Exiting
                const exitProgress = (progress - 0.54) / 0.06;
                designProgress = 1 - exitProgress;
                designTranslateY = -(exitProgress * 30);
                designContent.classList.add('is-active');
                isDesignActive = true;
            } else {
                designContent.classList.remove('is-active');
            }
            
            designContent.style.translate = `0 ${designTranslateY}vh`;
            designContent.style.opacity = designProgress;
        }

        // Code Content (0.60 to 0.80)
        if (codeContent) {
            let codeProgress = 0;
            let codeTranslateY = 30;
            
            if (progress > 0.60 && progress <= 0.68) { // Entering
                codeProgress = (progress - 0.60) / 0.08;
                codeTranslateY = 30 - (codeProgress * 30);
                codeContent.classList.add('is-active');
            } else if (progress > 0.68 && progress <= 0.74) { // Resting
                codeProgress = 1;
                codeTranslateY = 0;
                codeContent.classList.add('is-active');
                if (navCodeLink) navCodeLink.classList.add('active');
            } else if (progress > 0.74 && progress <= 0.80) { // Exiting
                const exitProgress = (progress - 0.74) / 0.06;
                codeProgress = 1 - exitProgress;
                codeTranslateY = -(exitProgress * 30);
                codeContent.classList.add('is-active');
            } else {
                codeContent.classList.remove('is-active');
            }
            
            codeContent.style.translate = `0 ${codeTranslateY}vh`;
            codeContent.style.opacity = codeProgress;
        }

        // Solutions Content (0.80 to 1.0)
        let isSolutionsActive = false;
        if (solutionsContent) {
            let solProgress = 0;
            let solTranslateY = 30;
            
            if (progress > 0.80 && progress <= 0.88) { // Entering
                solProgress = (progress - 0.80) / 0.08;
                solTranslateY = 30 - (solProgress * 30);
                solutionsContent.classList.add('is-active');
                isSolutionsActive = true;
            } else if (progress > 0.88) { // Resting
                solProgress = 1;
                solTranslateY = 0;
                solutionsContent.classList.add('is-active');
                if (navSolutionsLink) navSolutionsLink.classList.add('active');
                isSolutionsActive = true;
            } else {
                solutionsContent.classList.remove('is-active');
            }
            
            solutionsContent.style.translate = `0 ${solTranslateY}vh`;
            solutionsContent.style.opacity = solProgress;
        }
            
        // Invert globally fixed items since background is light in Design and Solutions sections
        const sideNav = document.querySelector('.side-nav');
        if (isDesignActive || isSolutionsActive) {
            if (logoMark) logoMark.classList.add('invert');
            if (sideNav) sideNav.classList.add('invert');
        } else {
            if (progress < 0.20 && !hero.classList.contains('is-dark')) {
                if (logoMark) logoMark.classList.remove('invert');
                if (sideNav) sideNav.classList.remove('invert');
            } else if (progress >= 0.20) {
                if (logoMark) logoMark.classList.remove('invert');
                if (sideNav) sideNav.classList.remove('invert');
            }
        }

        lastProgress = progress;
    }

    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateScrollAnimation);
    });
    
    function scrollToProgress(targetProgress, sectionHash) {
        if (isAutoScrolling) return; 
        isAutoScrolling = true;
        
        const rect = heroStickyContainer.getBoundingClientRect();
        const containerTop = rect.top + window.scrollY; 
        const totalScrollable = rect.height - window.innerHeight;
        
        const startY = window.scrollY;
        const targetY = containerTop + (targetProgress * totalScrollable);
        const distance = targetY - startY;
        
        let startTime = null;
        const duration = Math.min(Math.max(Math.abs(distance) * 1.5, 1200), 3500);
        
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
        
        function animationStep(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            let p = timeElapsed / duration;
            if (p > 1) p = 1;
            
            const ease = easeInOutCubic(p);
            window.scrollTo(0, startY + distance * ease);
            
            if (timeElapsed < duration) {
                window.requestAnimationFrame(animationStep);
            } else {
                window.scrollTo(0, startY + distance);
                isAutoScrolling = false;
                if (sectionHash) {
                    window.history.pushState(null, null, sectionHash);
                }
            }
        }
        
        window.requestAnimationFrame(animationStep);
    }

    const aboutLink = document.querySelector('a[href="#about"]');
    if (aboutLink) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToProgress(0.31, '#about');
        });
    }

    const designLink = document.querySelector('a[href="#design"]');
    if (designLink) {
        designLink.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToProgress(0.51, '#design');
        });
    }

    const codeLink = document.querySelector('a[href="#code"]');
    if (codeLink) {
        codeLink.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToProgress(0.71, '#code');
        });
    }

    const solutionsLink = document.querySelector('a[href="#solutions"]');
    if (solutionsLink) {
        solutionsLink.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToProgress(1.0, '#solutions');
        });
    }

    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToProgress(0, '#top');
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
            
            // Explicitly start playing
            activeEl.play().catch(e => console.error("Error playing initial about video:", e));

            function handleVideoEnd() {
                inactiveEl.play().then(() => {
                    activeEl.style.opacity = '0';
                    inactiveEl.style.opacity = '1';
                    
                    const temp = activeEl;
                    activeEl = inactiveEl;
                    inactiveEl = temp;
                    
                    currentVideoIndex = (currentVideoIndex + 1) % videos.length;
                    const nextVideoIndex = (currentVideoIndex + 1) % videos.length;
                    
                    setTimeout(() => {
                        inactiveEl.src = videos[nextVideoIndex];
                        inactiveEl.currentTime = 0;
                        inactiveEl.load(); 
                    }, 1000);

                    activeEl.addEventListener('ended', handleVideoEnd, { once: true });
                }).catch(e => console.error("Error playing about video:", e));
            }

            activeEl.addEventListener('ended', handleVideoEnd, { once: true });
        }
    }

    // --- Language Switch Logic ---
    const langContainer = document.getElementById('lang-switch');
    if (langContainer) {
        const langBtns = langContainer.querySelectorAll('.lang-btn');
        
        langBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const selectedLang = btn.getAttribute('data-lang');
                
                langBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (selectedLang === 'en') {
                    langContainer.classList.remove('de-active');
                    langContainer.classList.add('en-active');
                    document.querySelectorAll('[data-i18n="true"]').forEach(el => {
                        el.innerHTML = el.getAttribute('data-en');
                    });
                } else {
                    langContainer.classList.remove('en-active');
                    langContainer.classList.add('de-active');
                    document.querySelectorAll('[data-i18n="true"]').forEach(el => {
                        el.innerHTML = el.getAttribute('data-de');
                    });
                }
            });
        });

        langContainer.addEventListener('click', () => {
            const currentDe = langContainer.classList.contains('de-active');
            const targetLang = currentDe ? 'en' : 'de';
            
            langBtns.forEach(b => {
                if (b.getAttribute('data-lang') === targetLang) {
                    b.click();
                }
            });
        });
    }
});
