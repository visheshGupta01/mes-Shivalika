import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosConfig";

// Fetch all products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const response = await api.get("/productionData/products");
    console.log(response.data);
    return response.data;
  }
);
const updateProcessStatus = async (productId) => {
  console.log("Running updateProcessStatus");
  try {
    await api.post("/productionData/updateProcessStatus", { productId });
    console.log("Process status updated successfully");
  } catch (error) {
    console.error("Failed to update process status:", error);
    throw error; // Ensure the error propagates to the calling function
  }
};

const updateOrderStatus = async (productId) => {
  console.log("Running updateOrderStatus");
  try {
    await api.post("/productionData/updateOrderStatus", { productId });
    console.log("Order status updated successfully");
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw error; // Ensure the error propagates to the calling function
  }
};


// Update production entry for a specific product
export const updateProductionEntry = createAsyncThunk(
  "products/updateProductionEntry",
  async ({ id, processId, date, quantity }, { rejectWithValue }) => {
    try {
      console.log("updateProductionEntry thunk started");
      const response = await api.put(
        `/productionData/${id}/process/${processId}`,
        { date, quantity }
      );
      console.log(response.data);

      try {
        await updateProcessStatus(id);
      } catch (error) {
        console.error("Error updating process status:", error);
        throw error;
      }

      try {
        await updateOrderStatus(id);
        console.log("done");
      } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
      }

      console.log("exiting");
      return response.data;
    } catch (error) {
      console.error("Error in updateProductionEntry thunk:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    filteredProducts: [],
    loading: false,
    error: null,
  },
  reducers: {
    filterProductsByProcess: (state, action) => {
      const processName = action.payload;
      state.filteredProducts = state.products.filter((product) =>
        product.processes.some((process) => process.processName === processName)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload; // Initialize with all products
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateProductionEntry.fulfilled, (state, action) => {
          console.log("updateProductionEntry.fulfilled called");
        const updatedProduct = action.payload;
        state.products = state.products.map((product) =>
          product._id === updatedProduct._id
            ? { ...product, ...updatedProduct }
            : product
        );
        // Update filtered products as well
        state.filteredProducts = state.filteredProducts.map((product) =>
          product._id === updatedProduct._id
            ? { ...product, ...updatedProduct }
            : product
        );


      });
  },
});

export const { filterProductsByProcess } = productSlice.actions;
export default productSlice.reducer;
