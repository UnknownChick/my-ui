import { Modal } from './components/modal';
import { Pagination } from './components/pagination';
import './features/icons';

document.addEventListener('DOMContentLoaded', () => {
	new Modal();
	Pagination.initialize();
});

console.log('Hello world');
