import Accordion from './components/accordion';
import Drawer from './components/drawer';
import Dropdown from './components/dropdown';
import Modal from './components/modal';
import Pagination from './components/pagination';
import Tabs from './components/tabs';
import Toast from './components/toast';
import Tooltip from './components/tooltip';
import './features/icons';

// Export all components for external use
export { Accordion, Drawer, Dropdown, Modal, Pagination, Tabs, Toast, Tooltip };

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  Accordion.autoInit('.accordion');
  Dropdown.autoInit('.dropdown');
  Pagination.autoInit('.pagination');
  Tooltip.autoInit('[data-tooltip]');
});
