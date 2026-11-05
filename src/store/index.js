import { configureStore } from '@reduxjs/toolkit';
import productReducer, { setProducts } from './slices/productSlice';
import customerReducer, { setCustomers } from './slices/customerSlice';
import { KEYS, STORAGE_EVENT, getProducts, getCustomers } from '../services/storage';

export const store = configureStore({
  reducer: {
    products: productReducer,
    customers: customerReducer,
  },
  devTools: import.meta.env.DEV,
});

// Auto-sync Redux store with localStorage whenever products or customers change
if (typeof window !== 'undefined') {
  const handleStorageSync = (event) => {
    const key = event.detail?.key ?? event.key;
    if (!key || key === KEYS.products) {
      store.dispatch(setProducts(getProducts()));
    }
    if (!key || key === KEYS.customers) {
      store.dispatch(setCustomers(getCustomers()));
    }
  };

  window.addEventListener(STORAGE_EVENT, handleStorageSync);
  window.addEventListener('storage', handleStorageSync);
}

export default store;
