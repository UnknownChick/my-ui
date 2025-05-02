import { Modal } from './components/modal';
import { Pagination } from './components/pagination';
import { Toast } from './components/toast';
import { Tooltip } from './components/tooltip';
import './features/icons';

document.addEventListener('DOMContentLoaded', () => {
	new Modal();

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
