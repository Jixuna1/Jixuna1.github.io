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

    /* --- FORM HANDLING (CORRIGÉ POUR L'ENVOI) --- */
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Empêche le rechargement de la page

            const btn = form.querySelector('.btn-send');
            const originalText = btn.textContent;
            
            // Récupération des données
            const username = document.getElementById('username').value;
            const msg = document.getElementById('message').value;
            const myEmail = "tina.hyh17@gmail.com";

            // Préparation du mailto
            const subject = encodeURIComponent(`Contact Portfolio de ${username}`);
            const body = encodeURIComponent(`Nom: ${username}\n\nMessage:\n${msg}`);

            // Animation du bouton
            btn.textContent = "SENDING...";
            btn.disabled = true;

            // Déclenchement de l'envoi (ouvre le client mail)
            window.location.href = `mailto:${myEmail}?subject=${subject}&body=${body}`;

            setTimeout(() => {
                btn.textContent = "MESSAGE SENT!";
                btn.style.background = "var(--sentinel-green)";

                // Log dans le chat simulé
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

    /* --- VEILLE DYNAMIQUE (Dev.to API) --- */
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

        try {
            const response = await fetch(`https://dev.to/api/articles?tag=${tag}&per_page=6&top=7`);
            if (!response.ok) throw new Error('Network error');
            const articles = await response.json();

            veilleGrid.innerHTML = '';
            articles.forEach((article, index) => {
                const card = document.createElement('a');
                card.href = article.url;
                card.target = '_blank';
                card.rel = 'noopener noreferrer';
                card.className = 'news-card hidden';
                card.style.animationDelay = `${index * 0.1}s`;
                card.innerHTML = `
                    <div class="news-date">${formatDate(article.published_at)}</div>
                    <h4>${article.title}</h4>
                    <p>${truncateText(article.description)}</p>
                    <div class="news-meta">
                        <span>👤 ${article.user.name}</span>
                        <span>❤️ ${article.positive_reactions_count}</span>
                    </div>`;
                veilleGrid.appendChild(card);
                observer.observe(card);
            });
        } catch (error) {
            veilleGrid.innerHTML = `<div class="news-card"><h4>ERROR</h4><p>Connexion échouée.</p></div>`;
        }
    }

    veilleTags.forEach(btn => {
        btn.addEventListener('click', () => {
            veilleTags.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            fetchArticles(btn.dataset.tag);
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
