/* ==========================================
   EVOSEN PORTFOLIO - MAIN SCRIPT
   Funcionalidades y interactividad
   ========================================== */

// [INIT] Inicializando sistema de interactividad...

/**
 * [TYPEWRITER] Efecto máquina de escribir en bio
 * Escribe el contenido de Bio de forma gradual
 */
function initTypewriter() {
    const target = document.querySelector('[data-typewriter]');
    if (!target) return;

    const text = target.textContent || '';
    target.textContent = '';
    let index = 0;

    const typeInterval = setInterval(() => {
        if (index < text.length) {
            target.textContent += text[index];
            index++;
            return;
        }
        clearInterval(typeInterval);
    }, 20);
}

/**
 * [BYLINE-LOOP] Firma con escritura/borrado cíclico
 * Reglas: espera 5s al terminar de escribir, borra, espera 2s al quedar vacío
 */
function initBylineLoop() {
    const bylineText = document.getElementById('byline-text');
    if (!bylineText) return;

    const phrase = 'made by evosen. ;)';
    let index = 0;
    let deleting = false;

    const typeSpeed = 85;
    const deleteSpeed = 55;
    const holdAfterWrite = 5000;
    const holdAfterDelete = 2000;

    const tick = () => {
        if (!deleting) {
            index += 1;
            bylineText.textContent = phrase.slice(0, index);

            if (index === phrase.length) {
                deleting = true;
                setTimeout(tick, holdAfterWrite);
                return;
            }

            setTimeout(tick, typeSpeed);
            return;
        }

        index -= 1;
        bylineText.textContent = phrase.slice(0, index);

        if (index === 0) {
            deleting = false;
            setTimeout(tick, holdAfterDelete);
            return;
        }

        setTimeout(tick, deleteSpeed);
    };

    bylineText.textContent = '';
    setTimeout(tick, 300);
}

/**
 * [STARS] Sistema de estrellas interactivo
 * Permite hacer clic en estrellas para editar el nivel de habilidad
 */
function initStarRating() {
    document.querySelectorAll('.skill-stars').forEach(starContainer => {
        const stars = starContainer.querySelectorAll('.star');
        
        stars.forEach((star, index) => {
            // Click para seleccionar rating
            star.addEventListener('click', () => {
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.classList.add('filled');
                    } else {
                        s.classList.remove('filled');
                    }
                });
            });

            // Hover preview
            star.addEventListener('mouseover', () => {
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.style.opacity = '1';
                    } else {
                        s.style.opacity = '0.5';
                    }
                });
            });
        });

        // Reset hover
        starContainer.addEventListener('mouseleave', () => {
            stars.forEach(s => {
                s.style.opacity = '1';
            });
        });
    });
}

/**
 * [EDIT-MODE] Sistema de edición inline
 * Doble clic para editar cualquier elemento marcado con .editable
 */
function initEditableContent() {
    document.querySelectorAll('.editable').forEach(element => {
        element.addEventListener('dblclick', () => {
            // Evitar edición si ya está en modo edición
            if (element.querySelector('input') || element.querySelector('textarea')) return;

            const hasBlockChildren = element.querySelector('p, div, ul, ol, li') !== null;
            const originalText = element.textContent || '';
            const escapedValue = originalText
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');

            if (hasBlockChildren || originalText.length > 120) {
                element.innerHTML = `<textarea class="edit-input" rows="4">${escapedValue}</textarea>`;
            } else {
                element.innerHTML = `<input type="text" class="edit-input" value="${escapedValue}">`;
            }

            const editor = element.querySelector('input, textarea');
            if (!editor) return;
            editor.focus();

            const saveEdit = () => {
                const nextText = editor.value.trim();
                element.textContent = nextText || originalText;
            };

            editor.addEventListener('blur', saveEdit);
            editor.addEventListener('keydown', (e) => {
                const isTextarea = editor.tagName === 'TEXTAREA';
                if (e.key === 'Enter' && !isTextarea) {
                    saveEdit();
                }
                if (e.key === 'Enter' && isTextarea && e.ctrlKey) {
                    saveEdit();
                }
                if (e.key === 'Escape') {
                    element.textContent = originalText;
                }
            });
        });
    });
}

/**
 * [MUSIC-WIDGET] Actualizar widget de música
 * Reproductor nativo estable con MP3 reales y controles tipo Spotify
 */
function updateMusicWidget() {
    const tracks = [
        { label: 'After Dark x Sweater Weather', artist: 'The Neighbourhood x Owl City', src: 'assets/audio/After Dark x Sweater Weather.mp3' },
        { label: 'Betrayal of Fear', artist: 'Goukisan', src: 'assets/audio/Goukisan - Betrayal of Fear.mp3' },
        { label: 'Too Many Nights', artist: 'Future', src: 'assets/audio/Too Many Nights.mp3' },
        { label: 'Whispers in the Dark', artist: 'Skillet', src: 'assets/audio/Skillet - Whispers In The Dark (Official Video).mp3' },
        { label: 'Isolation', artist: 'Nighthawk22', src: 'assets/audio/Isolation.mp3' }
    ];

    const trackNameEl = document.getElementById('track-name');
    const trackArtistEl = document.getElementById('track-artist');
    const volumeControl = document.getElementById('volume-control');
    const volumeToggle = document.getElementById('volume-toggle');
    const volumeValue = document.getElementById('volume-value');
    const volumeState = document.getElementById('volume-state');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const progressFill = document.querySelector('.progress-fill');
    const progressBar = document.querySelector('.progress-bar');
    const prevBtn = document.getElementById('track-prev');
    const playBtn = document.getElementById('track-play');
    const nextBtn = document.getElementById('track-next');
    const repeatBtn = document.getElementById('track-repeat');
    const audioEl = document.getElementById('bg-audio');
    const musicWidget = document.querySelector('.music-widget');

    if (!trackNameEl || !trackArtistEl || !volumeControl || !volumeToggle || !progressBar || !playBtn || !prevBtn || !nextBtn || !audioEl) return;

    let currentTrack = 0;
    let previousVolume = 14;
    let isPlaying = false;
    let repeatOne = false;
    let seekTimer = null;

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds)) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    const mapVolume = (sliderValue) => {
        const x = Math.max(0, Math.min(100, Number(sliderValue) || 0));
        return Math.pow(x / 100, 2.2);
    };

    const setProgress = () => {
        if (!progressFill) return;
        const current = audioEl.currentTime || 0;
        const duration = audioEl.duration || 0;
        const percent = duration > 0 ? (current / duration) * 100 : 0;
        progressFill.style.animation = 'none';
        progressFill.style.width = `${Math.max(0, Math.min(percent, 100)).toFixed(2)}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
        if (totalTimeEl) totalTimeEl.textContent = formatTime(duration);
    };

    const updateUiFromTrack = () => {
        const current = tracks[currentTrack];
        trackNameEl.textContent = current.label;
        trackArtistEl.textContent = current.artist;
    };

    const applyTrack = (index, autoplay = true) => {
        currentTrack = (index + tracks.length) % tracks.length;
        const current = tracks[currentTrack];
        updateUiFromTrack();
        audioEl.src = current.src;
        audioEl.currentTime = 0;
        audioEl.load();
        setProgress();

        if (autoplay && Number(volumeControl.value) > 0) {
            audioEl.play().then(() => {
                isPlaying = true;
                playBtn.textContent = '⏸';
                if (musicWidget) musicWidget.classList.add('playing');
            }).catch(() => {
                isPlaying = false;
                playBtn.textContent = '▶';
            });
        }
    };

    const setVolumeUi = (value) => {
        const normalized = Math.max(0, Math.min(100, Number(value) || 0));
        const isMuted = normalized === 0;
        const mapped = mapVolume(normalized);

        volumeControl.value = String(normalized);
        volumeValue.textContent = `${normalized}%`;
        volumeToggle.textContent = isMuted ? '🔇' : normalized < 40 ? '🔉' : '🔊';
        volumeState.textContent = isMuted
            ? 'Volumen desactivado por defecto'
            : `Volumen activo: ${normalized}% (curva suave)`;

        audioEl.volume = mapped;
        audioEl.muted = isMuted;

        if (normalized > 0) {
            previousVolume = normalized;
            audioEl.play().then(() => {
                isPlaying = true;
                playBtn.textContent = '⏸';
                if (musicWidget) musicWidget.classList.add('playing');
            }).catch(() => {
                isPlaying = false;
                playBtn.textContent = '▶';
            });
        }

        if (isMuted) {
            audioEl.pause();
            isPlaying = false;
            playBtn.textContent = '▶';
            if (musicWidget) musicWidget.classList.remove('playing');
        }
    };

    applyTrack(0, false);
    setVolumeUi(0);

    audioEl.addEventListener('loadedmetadata', setProgress);
    audioEl.addEventListener('timeupdate', setProgress);
    audioEl.addEventListener('play', () => {
        isPlaying = true;
        playBtn.textContent = '⏸';
        if (musicWidget) musicWidget.classList.add('playing');
    });
    audioEl.addEventListener('pause', () => {
        isPlaying = false;
        playBtn.textContent = '▶';
        if (musicWidget) musicWidget.classList.remove('playing');
    });
    audioEl.addEventListener('ended', () => {
        if (repeatOne) {
            audioEl.currentTime = 0;
            audioEl.play();
            return;
        }
        applyTrack(currentTrack + 1, true);
    });

    if (seekTimer) clearInterval(seekTimer);
    seekTimer = setInterval(setProgress, 400);

    playBtn.addEventListener('click', () => {
        if (audioEl.paused) {
            if (Number(volumeControl.value) === 0) {
                setVolumeUi(previousVolume || 14);
            }
            audioEl.play().catch(() => {});
        } else {
            audioEl.pause();
        }
    });

    nextBtn.addEventListener('click', () => {
        applyTrack(currentTrack + 1, true);
    });

    prevBtn.addEventListener('click', () => {
        if (audioEl.currentTime > 3) {
            audioEl.currentTime = 0;
            setProgress();
            return;
        }

        applyTrack(currentTrack - 1, true);
    });

    if (repeatBtn) {
        repeatBtn.addEventListener('click', () => {
            repeatOne = !repeatOne;
            repeatBtn.classList.toggle('active', repeatOne);
            repeatBtn.textContent = repeatOne ? '1↻' : '↻';
        });
    }

    volumeControl.addEventListener('input', (event) => {
        setVolumeUi(event.target.value);
    });

    volumeToggle.addEventListener('click', () => {
        const currentValue = Number(volumeControl.value);
        if (currentValue === 0) {
            setVolumeUi(previousVolume || 12);
            return;
        }
        setVolumeUi(0);
    });

    progressBar.addEventListener('click', (event) => {
        const duration = audioEl.duration;
        if (!duration || !Number.isFinite(duration)) return;

        const rect = progressBar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const targetTime = ratio * duration;
        audioEl.currentTime = targetTime;
        setProgress();
    });

    audioEl.addEventListener('canplay', () => {
        volumeState.textContent = volumeControl.value === '0'
            ? 'Volumen desactivado por defecto'
            : `Listo para reproducir • volumen ${volumeControl.value}%`;
    });
}

/**
 * [SCROLL-ANIMATION] Animaciones en scroll
 * Observa elementos cuando entran al viewport
 */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `slideInUp 0.8s ease-out forwards`;
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

/**
 * [CURSOR-ANIMATION] Ciclo de fuentes en firma
 * Cambia la fuente de la firma cada 10 segundos
 */
function initCursorAnimation() {
    const signature = document.querySelector('.bio-signature');
    if (!signature) return;

    const fonts = ['JetBrains Mono', 'Fira Code', 'Anonymous Pro'];
    let fontIndex = 0;

    setInterval(() => {
        signature.style.fontFamily = `'${fonts[fontIndex]}', monospace`;
        fontIndex = (fontIndex + 1) % fonts.length;
    }, 10000);
}

/**
 * [PARALLAX] Efecto parallax suave al mover ratón
 * Base para posibles efectos parallax futuros
 */
function initParallax() {
    const handleMove = (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        const hub = document.querySelector('.profile-hub');
        if (!hub) return;
        hub.style.transform = `translate3d(${(x - 0.5) * 8}px, ${(y - 0.5) * 6}px, 0)`;
    };

    if (window._ && typeof window._.throttle === 'function') {
        document.addEventListener('mousemove', window._.throttle(handleMove, 16));
        return;
    }

    document.addEventListener('mousemove', handleMove);
}

/**
 * [MOUSE-FOLLOWER] Glow de fondo que sigue el mouse
 */
function initMouseFollower() {
    const follower = document.getElementById('mouse-follower');
    if (!follower) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    document.addEventListener('mousemove', (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
    });

    const animate = () => {
        currentX += (targetX - currentX) * 0.1;
        currentY += (targetY - currentY) * 0.1;
        follower.style.left = `${currentX}px`;
        follower.style.top = `${currentY}px`;
        requestAnimationFrame(animate);
    };

    animate();
}

/**
 * [LIBRARIES] Inicializa librerías externas cargadas por CDN
 */
function initLibraryStack() {
    const loaded = [];
    const runtimeBadge = document.getElementById('lib-runtime-badge');

    if (window.Vue) loaded.push('Vue');
    if (window.Alpine) loaded.push('Alpine');
    if (window.React && window.ReactDOM) loaded.push('React');

    if (window.gsap) {
        loaded.push('GSAP');
        const cards = document.querySelectorAll('.quick-link');
        window.gsap.from(cards, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out'
        });
    }

    if (window.AOS && typeof window.AOS.init === 'function') {
        loaded.push('AOS');
        document.querySelectorAll('section').forEach((section, idx) => {
            section.setAttribute('data-aos', idx % 2 === 0 ? 'fade-up' : 'fade-left');
        });
        window.AOS.init({ duration: 600, once: false, offset: 60 });
    }

    if (window.tippy) {
        loaded.push('Tippy');
        window.tippy('nav a', {
            animation: 'shift-away',
            theme: 'light-border',
            content(reference) {
                return `Ir a ${reference.textContent || 'sección'}`;
            }
        });
    }

    if (window.particlesJS) {
        loaded.push('Particles.js');
        window.particlesJS('particles-js', {
            particles: {
                number: { value: 35 },
                color: { value: '#a78bfa' },
                shape: { type: 'circle' },
                opacity: { value: 0.25 },
                size: { value: 2.2 },
                line_linked: { enable: true, distance: 130, color: '#4c1d95', opacity: 0.25, width: 1 },
                move: { enable: true, speed: 1 }
            },
            interactivity: {
                events: { onhover: { enable: true, mode: 'grab' }, resize: true }
            },
            retina_detect: true
        });
    }

    if (window.anime) {
        loaded.push('Anime.js');
        window.anime({
            targets: '.stack-chips span',
            translateY: [0, -3, 0],
            delay: window.anime.stagger(120),
            duration: 1600,
            loop: true,
            easing: 'easeInOutSine'
        });
    }

    if (window.CountUp) {
        loaded.push('CountUp');
        const memberEl = document.getElementById('preview-members');
        if (memberEl) {
            const c = new window.CountUp.CountUp('preview-members', 170, { duration: 1.8, separator: ',' });
            if (!c.error) c.start();
        }
    }

    if (window.dayjs) {
        loaded.push('dayjs');
        const footerText = document.querySelector('footer p');
        if (footerText) {
            footerText.textContent = footerText.textContent.replace('2026', String(window.dayjs().year()));
        }
    }

    if (runtimeBadge) {
        runtimeBadge.textContent = `runtime: ${loaded.length} libs activas`;
    }
}

/**
 * [SMOOTH-SCROLL] Enlaces suave a secciones
 */
function initSmoothScroll() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/**
 * [MOBILE-MENU] Mejorar experiencia móvil si es necesario
 */
function initMobileOptimizations() {
    // Detectar si es móvil
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    if (isMobile) {
        // Ajustes móviles si es necesario
        document.body.style.fontSize = '16px'; // Evitar zoom automático
    }
}

/**
 * [DROPDOWNS] Sistema de dropdowns desplegables
 * Permite expandir/contraer secciones con animación
 */
function initDropdowns() {
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const content = this.nextElementSibling;
            if (!content) return;

            // Toggle estado
            this.classList.toggle('active');
            content.classList.toggle('active');

            // Agregar animación
            if (content.classList.contains('active')) {
                content.style.animation = 'dropdownSlideDown 0.4s ease-out forwards';
            } else {
                content.style.animation = 'dropdownSlideUp 0.4s ease-out forwards';
            }
        });
    });
}

/**
 * [DISCORD-BUTTONS] Interactividad botones Discord
 * Copia invitación o abre en nueva pestaña
 */
function initDiscordButtons() {
    const joinBtn = document.getElementById('discord-join');
    const inviteLink = 'https://discord.gg/b2V7vu9vN5';

    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            joinBtn.classList.add('pulse-glow-effect');
            setTimeout(() => joinBtn.classList.remove('pulse-glow-effect'), 2000);
        });
    }

    const copyBtn = document.getElementById('discord-copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(inviteLink).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = '✓ Copiado!';
                copyBtn.classList.add('pulse-glow-effect');
                setTimeout(() => {
                    copyBtn.innerText = originalText;
                    copyBtn.classList.remove('pulse-glow-effect');
                }, 2000);
            });
        });
    }
}

/**
 * [DISCORD-PREVIEW] Obtiene preview de invitación de Discord
 * Usa API pública de invites con fallback visual
 */
async function initDiscordInvitePreview() {
    const inviteCode = 'b2V7vu9vN5';
    const activeMembersEl = document.getElementById('active-members-count');
    const serverEl = document.getElementById('preview-server');
    const onlineEl = document.getElementById('preview-online');
    const membersEl = document.getElementById('preview-members');
    const noteEl = document.getElementById('preview-note');

    if (!serverEl || !onlineEl || !membersEl || !noteEl || !activeMembersEl) return;

    const renderLoading = () => {
        serverEl.textContent = 'Cargando...';
        onlineEl.textContent = 'Cargando...';
        membersEl.textContent = 'Cargando...';
        activeMembersEl.textContent = 'Cargando...';
        noteEl.textContent = 'Consultando API en tiempo real...';
    };

    const fetchPreview = async () => {
        renderLoading();

        try {
            const response = await fetch(
                `https://discord.com/api/v9/invites/${inviteCode}?with_counts=true&with_expiration=true&_=${Date.now()}`,
                { cache: 'no-store' }
            );
            if (!response.ok) {
                throw new Error('invite_not_available');
            }

            const data = await response.json();
            serverEl.textContent = data.guild?.name || 'GD Uruguay';
            const onlineValue = typeof data.approximate_presence_count === 'number'
                ? String(data.approximate_presence_count)
                : '—';
            onlineEl.textContent = onlineValue;
            activeMembersEl.textContent = onlineValue;
            membersEl.textContent = typeof data.approximate_member_count === 'number'
                ? String(data.approximate_member_count)
                : '—';
            noteEl.textContent = 'Preview actualizada desde la API de Discord.';
        } catch (error) {
            noteEl.textContent = 'API no disponible en este momento. Reintentando...';
        }
    };

    await fetchPreview();
    setInterval(fetchPreview, 60000);
}

/**
 * [CARD-ENTRANCE] Animaciones de entrada para cards
 * Las cards entran con delay progresivo
 */
function initCardEntranceAnimations() {
    const cards = document.querySelectorAll('.project-card, .skill-card');
    cards.forEach((card, index) => {
        card.style.animationName = 'slideUp';
        card.style.animationDuration = '0.6s';
        card.style.animationDelay = `${index * 0.08}s`;
        card.style.animationFillMode = 'both';
        card.style.animationTimingFunction = 'ease-out';
    });
}

/**
 * [HOVER-ANIMATIONS] Agregar animaciones al hover
 * Efectos especiales cuando se hace hover en elementos
 */
function initHoverAnimations() {
    // Agregar efecto de brillo a elementos interactivos
    document.querySelectorAll('nav a, .discord-btn, .skill-card, .project-card').forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
}

/**
 * [PAGE-SCROLL-ANIMATIONS] Animaciones en scroll adicionales
 * Más efectos visuales mientras scrolleas
 */
function initAdvancedScrollAnimations() {
    window.addEventListener('scroll', () => {
        // Efecto parallax suave en header
        const header = document.querySelector('header');
        if (header) {
            const scrolled = window.pageYOffset;
            header.style.opacity = Math.max(0.7, 1 - scrolled / 800);
        }

        // Animación de elementos según scroll
        document.querySelectorAll('section').forEach(section => {
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.75;
            
            if (isVisible && !section.classList.contains('animated')) {
                section.classList.add('animated');
            }
        });
    });
}

/**
 * [INTERACTIVE-ELEMENTS] Agregar interactividad a elementos varios
 * Incluye efectos de click y hover
 */
function initInteractiveElements() {
    // Click feedback en botones
    document.querySelectorAll('button, .discord-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.add('pulse-glow-effect');
            setTimeout(() => this.classList.remove('pulse-glow-effect'), 600);
        });
    });

    // Hover effects en navegación
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.textShadow = '0 0 20px rgba(192, 132, 252, 0.8)';
        });
        link.addEventListener('mouseleave', function() {
            this.style.textShadow = '';
        });
    });
}

/**
 * [INIT-SEQUENCE] Ejecutar todas las inicializaciones
 * Se ejecuta cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[SYSTEM] Initializing EVOSEN Portfolio...');
    console.log('[SYSTEM] Loading typewriter effect...');
    initTypewriter();

    console.log('[SYSTEM] Loading byline loop effect...');
    initBylineLoop();
    
    console.log('[SYSTEM] Loading star rating system...');
    initStarRating();
    
    console.log('[SYSTEM] Loading editable content system...');
    initEditableContent();
    
    console.log('[SYSTEM] Loading music widget...');
    updateMusicWidget();
    
    console.log('[SYSTEM] Loading scroll animations...');
    initScrollAnimations();
    
    console.log('[SYSTEM] Loading cursor animation...');
    initCursorAnimation();
    
    console.log('[SYSTEM] Loading parallax system...');
    initParallax();

    console.log('[SYSTEM] Loading mouse follower...');
    initMouseFollower();
    
    console.log('[SYSTEM] Loading smooth scroll...');
    initSmoothScroll();
    
    console.log('[SYSTEM] Loading mobile optimizations...');
    initMobileOptimizations();

    console.log('[SYSTEM] Loading dropdowns system...');
    initDropdowns();

    console.log('[SYSTEM] Loading Discord integration...');
    initDiscordButtons();
    initDiscordInvitePreview();

    console.log('[SYSTEM] Loading card entrance animations...');
    initCardEntranceAnimations();

    console.log('[SYSTEM] Loading hover animations...');
    initHoverAnimations();

    console.log('[SYSTEM] Loading advanced scroll animations...');
    initAdvancedScrollAnimations();

    console.log('[SYSTEM] Loading interactive elements...');
    initInteractiveElements();

    console.log('[SYSTEM] Loading external library stack...');
    initLibraryStack();
    
    console.log('[SYSTEM] ✓ Portfolio loaded successfully');
});

/**
 * [ERROR-HANDLER] Manejo de errores global
 */
window.addEventListener('error', (e) => {
    console.error('[SYSTEM] Error detected:', e.message);
});
