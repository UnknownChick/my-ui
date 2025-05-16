import { Accordion } from './components/accordion';
import { Dropdown } from './components/dropdown';
import { Modal } from './components/modal';
import { Pagination } from './components/pagination';
import { Tabs } from './components/tabs';
import { Toast } from './components/toast';
import { Tooltip } from './components/tooltip';
import './features/icons';

document.addEventListener('DOMContentLoaded', () => {
	new Accordion();
	new Dropdown();
	new Modal();
	new Tabs('#myTabs', {
		saveSelection: false
	});

	new Toast('#mytoast', {
		message: '<p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi, repellat!<p>',
		position: 'bottom right',
		showProgress: true,
		title: 'Mon titre'
	});

	new Tooltip('#mytooltip', {
		message: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi, repellat!',
		position: 'top'
	});
	Pagination.initialize();
});
