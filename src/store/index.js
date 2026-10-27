import { configureStore } from '@reduxjs/toolkit';
import productReducer, { setProducts } from './slices/productSlice';
import { KEYS, STORAGE_EVENT, getProducts } from '../services/storage';

export const store = configureStore({
  reducer: {
    products: productReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Auto-sync Redux store with localStorage whenever products change
if (typeof window !== 'undefined') {
  const handleStorageSync = (event) => {
    const key = event.detail?.key ?? event.key;
    if (!key || key === KEYS.products) {
      store.dispatch(setProducts(getProducts()));
    }
  };

  window.addEventListener(STORAGE_EVENT, handleStorageSync);
  window.addEventListener('storage', handleStorageSync);
}

export default store;
