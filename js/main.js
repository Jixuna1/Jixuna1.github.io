document.addEventListener('DOMContentLoaded', () => {

    /* --- TYPEWRITER EFFECT --- */
    const heroStatus = document.querySelector('.status');
    const textToType = "SYSTEM: ONLINE_";
    heroStatus.textContent = "";

    let charIndex = 0;
    function typeWriter() {
        if (charIndex < textToType.length) {
            heroStatus.textContent += textToType.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 100);
        } else {
            // Blink cursor effect at end
            setInterval(() => {
                if (heroStatus.textContent.endsWith('_')) {
                    heroStatus.textContent = heroStatus.textContent.slice(0, -1);
                } else {
                    heroStatus.textContent += '_';
                }
            }, 800);
        }
    }
    // Start typing after a small delay
    setTimeout(typeWriter, 1000);


    /* --- SCROLL OBSERVER (Animations) --- */
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate skills if this is a skill bar
                if (entry.target.classList.contains('skill-bar-container')) {
                    const bar = entry.target.querySelector('.fill');
                    if (bar) {
                        const width = bar.style.width;
                        bar.style.width = '0';
                        setTimeout(() => {
                            bar.style.width = width;
                        }, 100);
                    }
                }
            }
        });
    }, observerOptions);

    // Observe Sections for fade-in
    document.querySelectorAll('section, .subsection, .spec-card, .timeline-item, .quest-card, .news-card').forEach(el => {
        el.classList.add('hidden');
        observer.observe(el);
    });

    // Observer specifically for skill bars to trigger animation individually
    document.querySelectorAll('.skill-bar-container').forEach(el => {
        observer.observe(el);
    });

    /* --- SKILL BARS ANIMATION (Deprecated global function, handled by observer now) --- */



    /* --- FORM HANDLING --- */
    const form = document.querySelector('.contact-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('.btn-send');
        const originalText = btn.textContent;

        btn.textContent = "SENDING...";
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = "MESSAGE SENT!";
            btn.style.background = "var(--sentinel-green)";

            // Log to simulated chat
            const chatLog = document.querySelector('.chat-log');
            const username = document.getElementById('username').value;
            const msg = document.getElementById('message').value;

            const newLog = document.createElement('p');
            newLog.style.color = "var(--text-main)";
            newLog.innerHTML = `> <strong>${username}</strong>: ${msg}`;
            chatLog.appendChild(newLog);
            chatLog.scrollTop = chatLog.scrollHeight;

            form.reset();

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = "";
                btn.disabled = false;
            }, 3000);
        }, 1500);
    });


    /* --- VEILLE DYNAMIQUE (Dev.to API) --- */
    const veilleGrid = document.getElementById('veille-grid');
    const veilleTags = document.querySelectorAll('.veille-tag');
    let currentTag = 'ai';

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    }

    function truncateText(text, maxLen) {
        if (!text) return 'Cliquez pour lire l\'article complet...';
        return text.length > 120 ? text.substring(0, 120) + '...' : text;
    }

    async function fetchArticles(tag) {
        veilleGrid.innerHTML = `
            <div class="news-card loading-card">
                <div class="news-date">SCANNING...</div>
                <h4>Récupération des données...</h4>
                <p>Connexion au flux [${tag.toUpperCase()}]...</p>
            </div>
        `;

        try {
            const response = await fetch(`https://dev.to/api/articles?tag=${tag}&per_page=6&top=7`);
            if (!response.ok) throw new Error('Network error');
            const articles = await response.json();

            if (articles.length === 0) {
                veilleGrid.innerHTML = `
                    <div class="news-card">
                        <div class="news-date">ERROR</div>
                        <h4>Aucun article trouvé</h4>
                        <p>Aucun résultat pour le tag "${tag}".</p>
                    </div>
                `;
                return;
            }

            veilleGrid.innerHTML = '';

            articles.forEach((article, index) => {
                const card = document.createElement('a');
                card.href = article.url;
                card.target = '_blank';
                card.rel = 'noopener noreferrer';
                card.className = 'news-card';
                card.style.animationDelay = `${index * 0.1}s`;

                card.innerHTML = `
                    <div class="news-date">${formatDate(article.published_at)}</div>
                    <h4>${article.title}</h4>
                    <p>${truncateText(article.description)}</p>
                    <div class="news-meta">
                        <span class="news-author">👤 ${article.user.name}</span>
                        <span class="news-reactions">❤️ ${article.positive_reactions_count}</span>
                    </div>
                `;

                veilleGrid.appendChild(card);
            });

            // Re-observe new cards for scroll animation
            document.querySelectorAll('.news-card').forEach(el => {
                el.classList.add('hidden');
                observer.observe(el);
            });

        } catch (error) {
            veilleGrid.innerHTML = `
                <div class="news-card">
                    <div class="news-date">ERROR</div>
                    <h4>Connexion échouée</h4>
                    <p>Impossible de récupérer les articles. Vérifiez votre connexion internet.</p>
                </div>
            `;
        }
    }

    // Filter tag click handlers
    veilleTags.forEach(btn => {
        btn.addEventListener('click', () => {
            veilleTags.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTag = btn.dataset.tag;
            fetchArticles(currentTag);
        });
    });

    // Initial load
    fetchArticles(currentTag);

});

/* --- Add dynamic CSS for hidden sections --- */
const style = document.createElement('style');
style.innerHTML = `
    section.hidden, .subsection.hidden, .spec-card.hidden, .timeline-item.hidden, .quest-card.hidden, .news-card.hidden {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    section.visible, .subsection.visible, .spec-card.visible, .timeline-item.visible, .quest-card.visible, .news-card.visible {
        opacity: 1;
        transform: translateY(0);
    }

`;
document.head.appendChild(style);
