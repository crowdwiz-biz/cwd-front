class AnimateManager {
    constructor() {
        this.observer = null;
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };
        this.init();
    }

    init() {
        // Создаем MutationObserver для автоматического отслеживания новых элементов
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Проверяем, что это элемент
                        const animateElements = node.hasAttribute("data-animate")
                            ? [node]
                            : node.querySelectorAll("[data-animate]");

                        if (animateElements.length > 0) {
                            this.observeElements(animateElements);
                        }
                    }
                });
            });
        });

        // Начинаем наблюдать за всем документом
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Инициализируем IntersectionObserver
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animated");
                    if (entry.target.dataset.once === "true") {
                        this.observer.unobserve(entry.target);
                    }
                } else if (entry.target.dataset.once !== "true") {
                    entry.target.classList.remove("animated");
                }
            });
        }, this.observerOptions);

        // Начальное сканирование страницы
        this.observeElements(document.querySelectorAll("[data-animate]"));
    }

    observeElements(elements) {
        elements.forEach(el => {
            if (!el.dataset.animateObserved) {
                this.observer.observe(el);
                el.dataset.animateObserved = "true";
            }
        });
    }
}

// Автоматическая инициализация при загрузке
if (typeof window !== "undefined") {
    window.animateManager = new AnimateManager();
}
