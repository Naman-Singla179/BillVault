import { createSlice } from '@reduxjs/toolkit';
import { getProducts, saveProducts } from '../../services/storage';

const initialState = {
  list: getProducts(),
  search: '',
  categoryFilter: 'All',
  typeFilter: 'All',
  sortBy: 'name-asc',
  currentPage: 1,
};

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.list = action.payload;
    },
    addProduct: (state, action) => {
      const newItem = {
        id: action.payload.id || 'PROD-' + Date.now(),
        ...action.payload,
      };
      state.list.unshift(newItem);
      saveProducts(state.list);
    },
    updateProduct: (state, action) => {
      const { id, data } = action.payload;
      state.list = state.list.map((item) =>
        String(item.id) === String(id) ? { ...item, ...data, id } : item
      );
      saveProducts(state.list);
    },
    deleteProduct: (state, action) => {
      state.list = state.list.filter((item) => String(item.id) !== String(action.payload));
      saveProducts(state.list);
    },
    setSearch: (state, action) => {
      state.search = action.payload;
      state.currentPage = 1;
    },
    setCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload;
      state.currentPage = 1;
    },
    setTypeFilter: (state, action) => {
      state.typeFilter = action.payload;
      state.currentPage = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setSearch,
  setCategoryFilter,
  setTypeFilter,
  setSortBy,
  setCurrentPage,
} = productSlice.actions;

export const selectProducts = (state) => state.products.list;
export const selectProductFilters = (state) => ({
  search: state.products.search,
  categoryFilter: state.products.categoryFilter,
  typeFilter: state.products.typeFilter,
  sortBy: state.products.sortBy,
  currentPage: state.products.currentPage,
});

export default productSlice.reducer;
