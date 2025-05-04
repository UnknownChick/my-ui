export class Toast {
	constructor(selector, options = {}) {
		this.selector = selector;
		this.positionMap = {
			'top left': 'tl',
			'top right': 'tr',
			'bottom left': 'bl',
			'bottom right': 'br'
		};
		this.options = {
			duration: 5000,
			message: 'Message par defaut',
			position: 'bottom right',
			showProgress: true,
			title: 'Titre par defaut',
			...options
		};
		this.activeToasts = [];

		if (!this.positionMap[this.options.position]) {
			console.warn(`Toast: Position "${this.options.position}" non valide. Utilisation de la position par défaut 'bottom right'.`);
		}

		this.init();
	}

	init() {
		const triggers = document.querySelectorAll(this.selector);

		if (!triggers.length) {
			console.warn(`Toast: Aucun élément trouvé pour le sélecteur "${this.selector}"`);
			return;
		}

		triggers.forEach(trigger => {
			trigger.addEventListener('click', () => {
				this.show(
					this.options.message,
					this.options.position,
					this.options.showProgress,
					this.options.title
				);
			});
		});
	}

	show(
		message = this.options.message,
		position = this.options.position,
		showProgress = this.options.showProgress,
		title = this.options.title,
	) {
		const positionClass = this.positionMap[position];

		// Toast creation
		const toastElement = document.createElement('div');
		toastElement.className = `toast toast--${positionClass}`;
		toastElement.setAttribute('role', 'alert');
		toastElement.setAttribute('aria-live', 'assertive');
		toastElement.setAttribute('aria-atomic', 'true');

		// Progress bar
		let progressBar;
		if (showProgress) {
			progressBar = document.createElement('div');
			progressBar.className = 'toast__progress';
			toastElement.appendChild(progressBar);
		}

		// Content
		const content = document.createElement('div');
		content.className = 'toast__content';
		content.innerHTML = message;

		// Title
		if (title) {
			const titleElement = document.createElement('b');
			titleElement.innerHTML = title;
			content.prepend(titleElement);
		}

		toastElement.appendChild(content);

		document.body.appendChild(toastElement);
		this.activeToasts.push(toastElement);

		// Check if there's an active toast and close it
		toastElement.offsetHeight;

		// Animation
		toastElement.classList.add('toast--active');
		if (showProgress && progressBar) {
			progressBar.style.animation = `toast-progress-decrease ${this.options.duration / 1000}s linear forwards`;
		}
		
		const timeoutId = setTimeout(() => {
			this.close(toastElement);
		}, this.options.duration);

		toastElement.dataset.timeoutId = timeoutId;
	}

	close(toastElement) {
		if (!toastElement || !document.body.contains(toastElement)) return;

		const timeoutId = toastElement.dataset.timeoutId;
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		toastElement.classList.remove('toast--active');

		toastElement.addEventListener('transitionend', () => {
			if (document.body.contains(toastElement)) {
				document.body.removeChild(toastElement);
			}
			this.activeToasts = this.activeToasts.filter(t => t !== toastElement);
		}, { once: true });

		setTimeout(() => {
			if (document.body.contains(toastElement)) {
				document.body.removeChild(toastElement);
			}
			this.activeToasts = this.activeToasts.filter(t => t !== toastElement);
		}, 500);
	}
}