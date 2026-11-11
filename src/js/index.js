import Accordion from "./components/accordion.js";
import Drawer from "./components/drawer.js";
import Dropdown from "./components/dropdown.js";
import Modal from "./components/modal.js";
import Pagination from "./components/pagination.js";
import Tabs from "./components/tabs.js";
import Toast from "./components/toast.js";
import Tooltip from "./components/tooltip.js";
import { initIcons } from "./features/icons.js";

import { ThemeToggle } from "./features/theme-toggle.js";

// Export all components for external use
export {
	Accordion,
	Drawer,
	Dropdown,
	initIcons,
	Modal,
	Pagination,
	Tabs,
	ThemeToggle,
	Toast,
	Tooltip,
};

/** Initialize My UI on the current document. Safe to call more than once. */
export function initMyUI({
	root = document,
	theme = true,
	components = {},
} = {}) {
	Accordion.autoInit(".accordion", components.accordion, root);
	Drawer.autoInit(".drawer", components.drawer, root);
	Dropdown.autoInit(".dropdown", components.dropdown, root);
	Modal.autoInit("dialog.modal", components.modal, root);
	Pagination.autoInit(".pagination", components.pagination, root);
	Tabs.autoInit(".tabs", components.tabs, root);
	Toast.autoInit("[data-toast-trigger]", components.toast, root);
	Tooltip.autoInit("[data-tooltip]", components.tooltip, root);
	if (theme) ThemeToggle.init();
}
