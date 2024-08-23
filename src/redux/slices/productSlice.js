//productSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosConfig";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const response = await api.get("/api/products");
    return response.data;
  }
);

export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (product) => {
    const response = await api.post("/product/addProduct", product);
    return response.data;
  }
);

export const importProducts = createAsyncThunk(
  "product/importExcel",
  async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("product/importExcel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
);

export const addStyleProcesses = createAsyncThunk(
  "style/addStyleProcesses",
  async (styles) => {
    console.log(styles)
    const response = await api.post("product/addStyleProcesses", styles);
    return response.data;
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    newStyles: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(importProducts.fulfilled, (state, action) => {
        state.items = state.items.concat(action.payload.products || []);
        state.newStyles = action.payload.styles || [];
      })
      .addCase(addStyleProcesses.fulfilled, (state, action) => {
        state.newStyles = [];
      });
  },
});

export default productSlice.reducer;
