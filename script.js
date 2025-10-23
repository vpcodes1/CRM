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
                item.classList.remove('hide');
                setTimeout(() => {
                    item.style.display = 'block';
                }, 10);
            } else {
                if (item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('hide');
                    setTimeout(() => {
                        item.style.display = 'block';
                    }, 10);
                } else {
                    item.classList.add('hide');
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            }
        });
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

    // Show success message (you can replace this with actual form submission logic)
    showNotification('Hvala vam! Vaša poruka je uspešno poslata. Kontaktiraćemo vas uskoro.', 'success');

    // Reset form
    contactForm.reset();
});

// ===== NEWSLETTER FORM =====
const newsletterForm = document.querySelector('.newsletter-form');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Uspešno ste se prijavili na newsletter!', 'success');
        newsletterForm.reset();
    });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
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
                padding: 1rem 1.5rem;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                z-index: 9999;
                animation: slideIn 0.3s ease;
            }

            .notification-success {
                border-left: 4px solid #10b981;
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .notification-success i {
                color: #10b981;
                font-size: 1.5rem;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Add to body
    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// ===== SCROLL ANIMATIONS =====
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .portfolio-item, .about-feature');

    const observer = new IntersectionObserver((entries) => {
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

    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
    });
};

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
});

// ===== PARALLAX EFFECT FOR HERO =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero-content');
    if (parallax && scrolled < window.innerHeight) {
        parallax.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// ===== FORM INPUT ANIMATION =====
const formInputs = document.querySelectorAll('.form-input');

formInputs.forEach(input => {
    input.addEventListener('focus', (e) => {
        e.target.parentElement.querySelector('i').style.color = '#6366f1';
    });

    input.addEventListener('blur', (e) => {
        if (!e.target.value) {
            e.target.parentElement.querySelector('i').style.color = '#6b7280';
        }
    });
});

// ===== TYPING EFFECT FOR HERO (Optional Enhancement) =====
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    const originalText = heroTitle.innerHTML;
    const words = ['Moderne', 'Inovativne', 'Responzivne', 'Brze', 'Sigurne'];
    let wordIndex = 0;
    let isDeleting = false;
    let currentWord = words[0];
    let charIndex = 0;

    function typeEffect() {
        const gradientSpan = heroTitle.querySelector('.gradient-text');

        if (!isDeleting && charIndex <= words[wordIndex].length) {
            gradientSpan.textContent = words[wordIndex].substring(0, charIndex);
            charIndex++;
            setTimeout(typeEffect, 100);
        } else if (isDeleting && charIndex >= 0) {
            gradientSpan.textContent = words[wordIndex].substring(0, charIndex);
            charIndex--;
            setTimeout(typeEffect, 50);
        } else if (!isDeleting && charIndex > words[wordIndex].length) {
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

// ===== LAZY LOADING IMAGES =====
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

// ===== CURSOR EFFECT (Optional Enhancement) =====
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
        display: none;
    }

    @media (min-width: 1024px) {
        .custom-cursor {
            display: block;
        }
    }
`;
document.head.appendChild(cursorStyle);

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Enlarge cursor on hover over links and buttons
const interactiveElements = document.querySelectorAll('a, button, .service-card, .portfolio-item');
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

console.log('🚀 Landing page loaded successfully!');
