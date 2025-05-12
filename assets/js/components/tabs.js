export class Tabs {
	constructor() {
		this.tabGroups = [];

		const tabElements = document.querySelectorAll('.tabs');
		if (tabElements.length === 0) {
			console.warn('No tabs elements found.');
			return;
		}

		tabElements.forEach(tabElement => {
			const nav = tabElement.querySelector('.tabs__nav');
			const content = tabElement.querySelector('.tabs__content');

			if (!nav || !content) {
				console.warn('Tabs component is missing essential .tabs__nav or .tabs__content elements.', tabElement);
				return;
			}

			const buttons = Array.from(nav.querySelectorAll('.tabs__nav__button'));
			const panels = Array.from(content.querySelectorAll('.tabs__panel'));
			const tabsContainerId = tabElement.id || '';

			if (buttons.length === 0 || panels.length === 0) {
				console.warn('Tabs component is missing .tabs__nav__button or .tabs__panel elements.', tabElement);
				return;
			}
			
			buttons.forEach(btn => {
				if (!btn.id) {
					console.warn('A tab button is missing an ID, which is required for URL hash management.', btn);
				}
			});

			const groupData = {
				element: tabElement,
				nav,
				buttons,
				content,
				panels,
				tabsContainerId,
				activatedByCurrentHash: false
			};
			this.tabGroups.push(groupData);

			this._initSingleTabGroup(groupData);
		});

		if (this.tabGroups.length > 0) {
			this._handleHash(false);
			window.addEventListener('hashchange', () => this._handleHash(true), false);
		}
	}

	_initSingleTabGroup(groupData) {
		groupData.nav.addEventListener('click', (e) => {
			const button = e.target.closest('.tabs__nav__button');
			if (button && button.id) {
				this.activateTab(button, groupData, true, false);
			}
		});
	}

	activateTab(buttonToActivate, groupData, setFocus = true, isHashChange = false) {
		if (!buttonToActivate || !buttonToActivate.id) {
			console.warn('Attempted to activate a tab without a valid button or button ID.');
			return;
		}
		const { buttons, panels, tabsContainerId } = groupData;
		const targetPanelId = buttonToActivate.getAttribute('aria-controls');

		buttons.forEach(btn => {
			btn.setAttribute('aria-selected', 'false');
			btn.tabIndex = -1;
		});
		buttonToActivate.setAttribute('aria-selected', 'true');
		buttonToActivate.tabIndex = 0;
		if (setFocus) {
			buttonToActivate.focus();
		}

		panels.forEach(panel => {
			if (panel.id === targetPanelId) {
				panel.removeAttribute('hidden');
			} else {
				panel.setAttribute('hidden', '');
			}
		});

		if (!isHashChange) {
			const hashValue = tabsContainerId ? `${tabsContainerId}-${buttonToActivate.id}` : buttonToActivate.id;
			if (window.location.hash !== `#${hashValue}`) {
				history.replaceState(null, '', `#${hashValue}`);
			}
		}
	}

	_handleHash(setFocusOnActivation) {
		const hash = window.location.hash.substring(1);

		this.tabGroups.forEach(group => group.activatedByCurrentHash = false);

		if (hash) {
			for (const groupData of this.tabGroups) {
				const buttonToActivate = groupData.buttons.find(btn => {
					if (!btn.id) return false;
					const expectedHash = groupData.tabsContainerId ? `${groupData.tabsContainerId}-${btn.id}` : btn.id;
					return hash === expectedHash;
				});

				if (buttonToActivate) {
					this.activateTab(buttonToActivate, groupData, setFocusOnActivation, true);
					groupData.activatedByCurrentHash = true;
				}
			}
		}

		this.tabGroups.forEach(groupData => {
			if (groupData.activatedByCurrentHash) {
				return;
			}

			const preSelectedButton = groupData.buttons.find(btn => btn.getAttribute('aria-selected') === 'true' && btn.id);
			if (preSelectedButton) {
				this.activateTab(preSelectedButton, groupData, false, true);
			} else if (groupData.buttons.length > 0 && groupData.buttons[0].id) {
				this.activateTab(groupData.buttons[0], groupData, false, true);
			} else if (groupData.buttons.length > 0 && !groupData.buttons[0].id) {
                console.warn('Default tab for a group could not be activated as the first button has no ID.', groupData.element);
            }
		});
	}
}