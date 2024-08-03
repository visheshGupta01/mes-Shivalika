import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosConfig";

export const fetchOrders = createAsyncThunk("orders/fetchOrders", async () => {
  const response = await api.get("/product/orders");
  return response.data;
});

export const addOrder = createAsyncThunk("orders/addOrder", async (order) => {
  const response = await api.post("/product/addOrder", order);
  return response.data;
});

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default orderSlice.reducer;
