document.addEventListener('DOMContentLoaded', () => {

    /* --- TYPEWRITER EFFECT --- */
    const heroStatus = document.querySelector('.status');
    const textToType = "SYSTEM: ONLINE_";
    if (heroStatus) {
        heroStatus.textContent = "";
        let charIndex = 0;
        function typeWriter() {
            if (charIndex < textToType.length) {
                heroStatus.textContent += textToType.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 100);
            } else {
                setInterval(() => {
                    if (heroStatus.textContent.endsWith('_')) {
                        heroStatus.textContent = heroStatus.textContent.slice(0, -1);
                    } else {
                        heroStatus.textContent += '_';
                    }
                }, 800);
            }
        }
        setTimeout(typeWriter, 1000);
    }

    /* --- SCROLL OBSERVER (Animations) --- */
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
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

    document.querySelectorAll('section, .subsection, .spec-card, .timeline-item, .quest-card, .news-card, .skill-bar-container').forEach(el => {
        el.classList.add('hidden');
        observer.observe(el);
    });

    /* --- FORM HANDLING --- */
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('.btn-send');
            const originalText = btn.textContent;
            const username = document.getElementById('username').value;
            const msg = document.getElementById('message').value;
            const myEmail = "tina.hyh17@gmail.com";
            const subject = encodeURIComponent(`Contact Portfolio de ${username}`);
            const body = encodeURIComponent(`Nom: ${username}\n\nMessage:\n${msg}`);

            btn.textContent = "SENDING...";
            btn.disabled = true;
            window.location.href = `mailto:${myEmail}?subject=${subject}&body=${body}`;

            setTimeout(() => {
                btn.textContent = "MESSAGE SENT!";
                btn.style.background = "var(--sentinel-green)";
                const chatLog = document.querySelector('.chat-log');
                if (chatLog) {
                    const newLog = document.createElement('p');
                    newLog.style.color = "var(--text-main)";
                    newLog.innerHTML = `> <strong>${username}</strong>: ${msg}`;
                    chatLog.appendChild(newLog);
                    chatLog.scrollTop = chatLog.scrollHeight;
                }
                form.reset();
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = "";
                    btn.disabled = false;
                }, 3000);
            }, 1000);
        });
    }

    /* --- VEILLE DYNAMIQUE (Dev.to API + Google Alerts) --- */
    const veilleGrid = document.getElementById('veille-grid');
    const veilleTags = document.querySelectorAll('.veille-tag');
    let currentTag = 'ai';

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    }

    function truncateText(text, maxLen) {
        if (!text) return 'Cliquez pour lire l\'article complet...';
        return text.length > 120 ? text.substring(0, 120) + '...' : text;
    }

    async function fetchArticles(tag) {
        if (!veilleGrid) return;
        veilleGrid.innerHTML = `<div class="news-card"><h4>SCANNING [${tag.toUpperCase()}]...</h4></div>`;

        let url;
        let isGoogleAlert = false;

        try {
            if (tag === 'security-alerts') {
                const googleRssUrl = "https://www.google.fr/alerts/feeds/02188274778194179473/12106481984747642305";
                url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(googleRssUrl)}`;
                isGoogleAlert = true;
            } else {
                url = `https://dev.to/api/articles?tag=${tag}&per_page=6&top=7`;
                isGoogleAlert = false;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            
            const articles = isGoogleAlert ? data.items : data;

            veilleGrid.innerHTML = '';
            articles.forEach((article, index) => {
                const title = isGoogleAlert ? article.title : article.title;
                const link = isGoogleAlert ? article.link : article.url;
                const date = isGoogleAlert ? article.pubDate : article.published_at;
                const desc = isGoogleAlert ? article.description : article.description;
                const meta = isGoogleAlert ? '⚠️ GOOGLE_ALERT' : `👤 ${article.user.name} | ❤️ ${article.positive_reactions_count}`;

                const card = document.createElement('a');
                card.href = link;
                card.target = '_blank';
                card.rel = 'noopener noreferrer';
                card.className = 'news-card hidden';
                card.style.animationDelay = `${index * 0.1}s`;
                card.innerHTML = `
                    <div class="news-date">${formatDate(date)}</div>
                    <h4>${title}</h4>
                    <p>${truncateText(desc)}</p>
                    <div class="news-meta"><span>${meta}</span></div>`;
                veilleGrid.appendChild(card);
                observer.observe(card);
            });
        } catch (error) {
            veilleGrid.innerHTML = `<div class="news-card"><h4>ERROR</h4><p>Connexion échouée.</p></div>`;
        }
    }

    // MODIFICATION APPORTÉE ICI
    veilleTags.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tag = e.target.closest('.veille-tag').dataset.tag;
            console.log("Tag cliqué :", tag); // Vérifie ceci dans la console
            
            veilleTags.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            fetchArticles(tag);
        });
    });

    fetchArticles(currentTag);
});

/* --- Dynamic CSS --- */
const style = document.createElement('style');
style.innerHTML = `
    .hidden { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
    .visible { opacity: 1; transform: translateY(0); }
`;
document.head.appendChild(style);
