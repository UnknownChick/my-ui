let tabsButtons = document.querySelectorAll('.tabs__nav ul li');
let tabsContents = document.querySelectorAll('.tabs__content');

if (tabsButtons.length > 0 && tabsContents.length > 0) {
    // Get the saved tab id from URL
    let savedTabId = new URLSearchParams(window.location.search).get('tab');

    // If there is no saved tab id, use the first tab as the default
    if (!savedTabId) {
        savedTabId = tabsButtons[0].getAttribute('data-tab');
        window.history.replaceState({}, '', '?tab=' + savedTabId);
    }

    setActiveTab(savedTabId);

    tabsButtons.forEach((button) => {
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
    tabsContents.forEach((content) => {
        if (content.getAttribute('data-tab') === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}