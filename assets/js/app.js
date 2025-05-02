import { Modal } from './components/modal';
import { Pagination } from './components/pagination';
import { Toast } from './components/toast';
import './features/icons';

document.addEventListener('DOMContentLoaded', () => {
	new Modal();
	new Toast('#mytoast', {
		message: '<p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi, repellat!<p>',
		position: 'bottom right',
		showProgress: true,
		title: 'Mon titre'
	});
	Pagination.initialize();
});
