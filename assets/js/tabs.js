let tabsButton = document.querySelectorAll('.tabs__nav ul li');
let tabsContent = document.querySelectorAll('.tabs__content');

if (tabsButton.length > 0 && tabsContent.length > 0) {
    // Get the saved tab id from URL
    let savedTabId = new URLSearchParams(window.location.search).get('tab');

    // If there is no saved tab id, use the first tab as the default
    if (!savedTabId) {
        savedTabId = tabsButton[0].getAttribute('data-tab');
        window.history.replaceState({}, '', '?tab=' + savedTabId);
    }

    setActiveTab(savedTabId);

    tabsButton.forEach((button) => {
        button.addEventListener('click', () => {
            // Add the data-tab of the clicked tab to the URL
            let tabId = button.getAttribute('data-tab');
            window.history.replaceState({}, '', '?tab=' + tabId);
            setActiveTab(tabId);
        });
    });
}

/**
 * @param {string} tabId - The id of the tab to be activated.
 */
function setActiveTab(tabId) {
    tabsButton.forEach((button) => {
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    tabsContent.forEach((content) => {
        if (content.getAttribute('data-tab') === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}