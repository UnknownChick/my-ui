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

	new Toast('#myToastFromTopRight', {
		title: 'Top right toast !',
		message: '<p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi, repellat!<p>',
		position: 'top right',
		showProgress: true,
	});

	new Toast('#myToastFromBottomRight', {
		title: 'Bottom right toast !',
		message: '<p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi, repellat!<p>',
		position: 'bottom right',
		showProgress: true,
	});

	new Toast('#myToastFromBottomLeft', {
		title: 'Bottom left toast !',
		message: '<p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi, repellat!<p>',
		position: 'bottom left',
		showProgress: true,
	});

	new Toast('#myToastFromTopLeft', {
		title: 'Top left toast !',
		message: '<p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi, repellat!<p>',
		position: 'top left',
		showProgress: true,
	});

	new Tooltip('#myTooltipFromTop', {
		message: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi, repellat!',
		position: 'top'
	});

	new Tooltip('#myTooltipFromRight', {
		message: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi, repellat!',
		position: 'right'
	});

	new Tooltip('#myTooltipFromBottom', {
		message: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi, repellat!',
		position: 'bottom'
	});

	new Tooltip('#myTooltipFromLeft', {
		message: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi, repellat!',
		position: 'left'
	});
	Pagination.initialize();
});
