import Accordion from "./components/accordion.js";
import Drawer from "./components/drawer.js";
import Dropdown from "./components/dropdown.js";
import Modal from "./components/modal.js";
import Pagination from "./components/pagination.js";
import Tabs from "./components/tabs.js";
import Toast from "./components/toast.js";
import Tooltip from "./components/tooltip.js";
import "./features/icons.js";
import { ThemeToggle } from "./features/theme-toggle.js";

// Export all components for external use
export {
	Accordion,
	Drawer,
	Dropdown,
	Modal,
	Pagination,
	Tabs,
	ThemeToggle,
	Toast,
	Tooltip,
};

// Auto-init on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
	Accordion.autoInit(".accordion");
	Drawer.autoInit(".drawer");
	Dropdown.autoInit(".dropdown");
	Modal.autoInit("dialog.modal");
	Pagination.autoInit(".pagination");
	Tabs.autoInit(".tabs");
	Toast.autoInit("[data-toast-trigger]");
	Tooltip.autoInit("[data-tooltip]");
});
