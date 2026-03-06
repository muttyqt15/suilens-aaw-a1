import { createRouter, createWebHistory } from 'vue-router';
import CatalogView from '../views/CatalogView.vue';
import OrderView from '../views/OrderView.vue';

const routes = [
  { path: '/', name: 'catalog', component: CatalogView },
  { path: '/order/:lensId', name: 'order', component: OrderView },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
