import { createSlice } from '@reduxjs/toolkit';
import { getCustomers, saveCustomers } from '../../services/storage';

const initialState = {
  list: getCustomers(),
  searchQuery: '',
  statusFilter: 'All',
  currentPage: 1,
};

export const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action) => {
      state.list = action.payload;
    },
    addCustomer: (state, action) => {
      const newCustomer = {
        id: action.payload.id || Date.now(),
        ...action.payload,
      };
      state.list.unshift(newCustomer);
      saveCustomers(state.list);
    },
    updateCustomer: (state, action) => {
      const { id, data } = action.payload;
      state.list = state.list.map((c) =>
        String(c.id) === String(id) ? { ...c, ...data, id } : c
      );
      saveCustomers(state.list);
    },
    deleteCustomer: (state, action) => {
      state.list = state.list.filter((c) => String(c.id) !== String(action.payload));
      saveCustomers(state.list);
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    resetCustomerFilters: (state) => {
      state.searchQuery = '';
      state.statusFilter = 'All';
      state.currentPage = 1;
    },
  },
});

export const {
  setCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  setSearchQuery,
  setStatusFilter,
  setCurrentPage,
  resetCustomerFilters,
} = customerSlice.actions;

export const selectCustomers = (state) => state.customers.list;
export const selectCustomerFilters = (state) => ({
  searchQuery: state.customers.searchQuery,
  statusFilter: state.customers.statusFilter,
  currentPage: state.customers.currentPage,
});

export default customerSlice.reducer;

