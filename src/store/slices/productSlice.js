import { createSlice } from '@reduxjs/toolkit';
import { getProducts, saveProducts } from '../../services/storage';

const initialState = {
  list: getProducts(),
  search: '',
  categoryFilter: 'All',
  typeFilter: 'All',
  stockFilter: 'All',
  gstFilter: 'All',
  sortBy: 'name-asc',
  currentPage: 1,
  viewMode: 'table',
};

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.list = action.payload;
    },
    addProduct: (state, action) => {
      const sku = action.payload.sku || action.payload.id || 'PROD-' + Date.now();
      const newItem = {
        ...action.payload,
        id: sku,
        sku: sku,
      };
      state.list.unshift(newItem);
      saveProducts(state.list);
    },
    updateProduct: (state, action) => {
      const { id, data } = action.payload;
      const targetId = String(id);
      const updatedSku = data.sku || data.id || targetId;
      state.list = state.list.map((item) =>
        String(item.id) === targetId
          ? { ...item, ...data, id: updatedSku, sku: updatedSku }
          : item
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
    setStockFilter: (state, action) => {
      state.stockFilter = action.payload;
      state.currentPage = 1;
    },
    setGstFilter: (state, action) => {
      state.gstFilter = action.payload;
      state.currentPage = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    resetFilters: (state) => {
      state.search = '';
      state.categoryFilter = 'All';
      state.typeFilter = 'All';
      state.stockFilter = 'All';
      state.gstFilter = 'All';
      state.sortBy = 'name-asc';
      state.currentPage = 1;
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
  setStockFilter,
  setGstFilter,
  setSortBy,
  setCurrentPage,
  setViewMode,
  resetFilters,
} = productSlice.actions;

export const selectProducts = (state) => state.products.list;
export const selectProductFilters = (state) => ({
  search: state.products.search,
  categoryFilter: state.products.categoryFilter,
  typeFilter: state.products.typeFilter,
  stockFilter: state.products.stockFilter || 'All',
  gstFilter: state.products.gstFilter || 'All',
  sortBy: state.products.sortBy,
  currentPage: state.products.currentPage,
  viewMode: state.products.viewMode || 'table',
});

export default productSlice.reducer;
