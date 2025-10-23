// ===== INIT AOS (Animate On Scroll) =====
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });
});

// ===== PARTICLES.JS INIT =====
if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#6366f1'
            },
            shape: {
                type: 'circle'
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#6366f1',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'repulse'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                repulse: {
                    distance: 100,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });
}

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});

// ===== MOBILE MENU TOGGLE =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== ANIMATED COUNTER =====
const counters = document.querySelectorAll('.stat-number');
let counterAnimated = false;

const animateCounters = () => {
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    });
};

// Trigger counter animation when in viewport
const observerOptions = {
    threshold: 0.5
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !counterAnimated) {
            animateCounters();
            counterAnimated = true;
        }
    });
}, observerOptions);

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    counterObserver.observe(heroStats);
}

// ===== COUNTDOWN TIMER =====
function initCountdown() {
    // Set countdown to 7 days from now
    const countDownDate = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);

    const x = setInterval(function() {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById("days");
        const hoursEl = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");
        const secondsEl = document.getElementById("seconds");

        if (daysEl) daysEl.innerHTML = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.innerHTML = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.innerHTML = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.innerHTML = String(seconds).padStart(2, '0');

        if (distance < 0) {
            clearInterval(x);
            if (daysEl) daysEl.innerHTML = "00";
            if (hoursEl) hoursEl.innerHTML = "00";
            if (minutesEl) minutesEl.innerHTML = "00";
            if (secondsEl) secondsEl.innerHTML = "00";
        }
    }, 1000);
}

initCountdown();

// ===== PORTFOLIO FILTER =====
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        portfolioItems.forEach(item => {
            if (filterValue === 'all') {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 10);
            } else {
                if (item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            }
        });
    });
});

// ===== PRICING TOGGLE =====
const pricingToggle = document.getElementById('pricingToggle');
const priceAmounts = document.querySelectorAll('.price-amount');

if (pricingToggle) {
    pricingToggle.addEventListener('change', function() {
        priceAmounts.forEach(amount => {
            const annual = amount.getAttribute('data-annual');
            const monthly = amount.getAttribute('data-monthly');

            if (this.checked && monthly) {
                amount.textContent = monthly;
                amount.parentElement.querySelector('.price-period').textContent = '/mesečno';
            } else if (annual) {
                amount.textContent = annual;
                amount.parentElement.querySelector('.price-period').textContent = '/jednokratno';
            }
        });
    });
}

// ===== TESTIMONIALS CAROUSEL =====
const testimonialCards = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.carousel-dots .dot');
let currentTestimonial = 0;

function showTestimonial(index) {
    testimonialCards.forEach(card => card.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    testimonialCards[index].classList.add('active');
    dots[index].classList.add('active');
}

function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
    showTestimonial(currentTestimonial);
}

// Auto-rotate testimonials every 5 seconds
let testimonialInterval = setInterval(nextTestimonial, 5000);

// Dot click handlers
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentTestimonial = index;
        showTestimonial(index);
        // Reset interval
        clearInterval(testimonialInterval);
        testimonialInterval = setInterval(nextTestimonial, 5000);
    });
});

// ===== FAQ ACCORDION =====
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
        // Close other items
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });

        // Toggle current item
        item.classList.toggle('active');
    });
});

// ===== SCROLL TO TOP BUTTON =====
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== FORM SUBMISSION =====
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);

    // Show success message
    showNotification('Hvala vam! Vaša poruka je uspešno poslata. Kontaktiraćemo vas u najkraćem roku.', 'success');

    // Reset form
    contactForm.reset();

    // You can add actual form submission logic here (e.g., send to backend)
    // fetch('/api/contact', {
    //     method: 'POST',
    //     body: formData
    // })
});

// ===== NEWSLETTER FORM =====
const newsletterForms = document.querySelectorAll('.newsletter-form');

newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Uspešno ste se prijavili na newsletter!', 'success');
        form.reset();
    });
});

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add styles if not already in CSS
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.innerHTML = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 1.25rem 1.5rem;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                z-index: 9999;
                animation: slideInRight 0.3s ease;
                max-width: 400px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }

            .notification-success {
                border-left: 4px solid #10b981;
            }

            .notification-error {
                border-left: 4px solid #ef4444;
            }

            .notification-info {
                border-left: 4px solid #3b82f6;
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                flex: 1;
            }

            .notification-success i {
                color: #10b981;
                font-size: 1.5rem;
            }

            .notification-error i {
                color: #ef4444;
                font-size: 1.5rem;
            }

            .notification-info i {
                color: #3b82f6;
                font-size: 1.5rem;
            }

            .notification-content span {
                color: #1f2937;
                line-height: 1.5;
            }

            .notification-close {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 0.25rem;
                font-size: 1.2rem;
                transition: color 0.3s ease;
            }

            .notification-close:hover {
                color: #1f2937;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }

            @media (max-width: 576px) {
                .notification {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Add to body
    document.body.appendChild(notification);

    // Close button handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// ===== FORM INPUT ANIMATION =====
const formInputs = document.querySelectorAll('.form-input');

formInputs.forEach(input => {
    input.addEventListener('focus', (e) => {
        const icon = e.target.parentElement.querySelector('i');
        if (icon) {
            icon.style.color = '#6366f1';
        }
    });

    input.addEventListener('blur', (e) => {
        if (!e.target.value) {
            const icon = e.target.parentElement.querySelector('i');
            if (icon) {
                icon.style.color = '#6b7280';
            }
        }
    });
});

// ===== TYPING EFFECT FOR HERO =====
const typingText = document.querySelector('.typing-text');
if (typingText) {
    const words = ['Profitabilne', 'Inovativne', 'Moderne', 'Responzivne', 'Brze'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentWord = words[wordIndex];

        if (!isDeleting && charIndex <= currentWord.length) {
            typingText.textContent = currentWord.substring(0, charIndex);
            charIndex++;
            setTimeout(typeEffect, 150);
        } else if (isDeleting && charIndex >= 0) {
            typingText.textContent = currentWord.substring(0, charIndex);
            charIndex--;
            setTimeout(typeEffect, 75);
        } else if (!isDeleting && charIndex > currentWord.length) {
            isDeleting = true;
            setTimeout(typeEffect, 2000);
        } else if (isDeleting && charIndex < 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            charIndex = 0;
            setTimeout(typeEffect, 500);
        }
    }

    // Start typing effect after a short delay
    setTimeout(() => {
        typeEffect();
    }, 1000);
}

// ===== PARALLAX EFFECT FOR HERO =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-content');

    parallaxElements.forEach(element => {
        if (scrolled < window.innerHeight) {
            element.style.transform = `translateY(${scrolled * 0.15}px)`;
        }
    });
});

// ===== LAZY LOADING OPTIMIZATION =====
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// ===== SCROLL PROGRESS INDICATOR =====
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';

    const style = document.createElement('style');
    style.innerHTML = `
        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: rgba(99, 102, 241, 0.1);
            z-index: 9999;
        }

        .scroll-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            width: 0%;
            transition: width 0.1s ease;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(progressBar);

    const progressBarFill = progressBar.querySelector('.scroll-progress-bar');

    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.pageYOffset;
        const progress = (scrolled / documentHeight) * 100;

        progressBarFill.style.width = `${progress}%`;
    });
}

createScrollProgress();

// ===== MOUSE CURSOR EFFECT (Desktop only) =====
if (window.innerWidth > 1024) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const cursorStyle = document.createElement('style');
    cursorStyle.innerHTML = `
        .custom-cursor {
            width: 20px;
            height: 20px;
            border: 2px solid #6366f1;
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            transition: all 0.1s ease;
            transform: translate(-50%, -50%);
            mix-blend-mode: difference;
        }
    `;
    document.head.appendChild(cursorStyle);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Enlarge cursor on hover over links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .service-card, .portfolio-item, .benefit-card');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.width = '40px';
            cursor.style.height = '40px';
            cursor.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
        });

        element.addEventListener('mouseleave', () => {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.backgroundColor = 'transparent';
        });
    });
}

// ===== REVEAL ANIMATIONS ON SCROLL =====
const revealElements = document.querySelectorAll('.service-card, .benefit-card, .portfolio-item, .pricing-card, .faq-item');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, {
    threshold: 0.1
});

revealElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'all 0.6s ease';
    revealObserver.observe(element);
});

// ===== ENHANCED SCROLL ANIMATIONS =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    // Animate special offer banner
    const specialOffer = document.querySelector('.special-offer');
    if (specialOffer && scrolled > 100) {
        specialOffer.style.transform = `translateY(${Math.min(scrolled * 0.3, 20)}px)`;
    }
});

// ===== PAGE LOAD ANIMATION =====
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ===== PERFORMANCE OPTIMIZATION =====
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll-heavy functions
const debouncedScroll = debounce(() => {
    // Any expensive scroll operations can go here
}, 100);

window.addEventListener('scroll', debouncedScroll);

// ===== IMAGE LAZY LOADING WITH BLUR =====
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserverBlur = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.addEventListener('load', () => {
                img.classList.add('loaded');
                img.removeAttribute('data-src');
            });
            observer.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserverBlur.observe(img));

// ===== CONSOLE MESSAGE =====
console.log('%c🚀 Landing Page Loaded Successfully!', 'color: #6366f1; font-size: 20px; font-weight: bold;');
console.log('%cMade with ❤️ using modern web technologies', 'color: #6b7280; font-size: 12px;');
console.log('%c- PWA Support (installable app)', 'color: #10b981;');
console.log('%c- Particles.js for background effects', 'color: #10b981;');
console.log('%c- AOS for scroll animations', 'color: #10b981;');
console.log('%c- Custom JavaScript for interactivity', 'color: #10b981;');
console.log('%c- Service Worker for offline support', 'color: #10b981;');

// ===== EASTER EGG =====
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-konamiPattern.length);

    if (konamiCode.join('') === konamiPattern.join('')) {
        showNotification('🎉 Konami Code Activated! You found the easter egg!', 'success');
        document.body.style.animation = 'rainbow 2s linear';
    }
});
