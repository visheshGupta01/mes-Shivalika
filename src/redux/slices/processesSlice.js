//processesSlice.js

import { createSlice } from "@reduxjs/toolkit";

// Define the initial state for processes
const initialState = {
  processes: [
    "Cutting",
    "Stitching",
    "Weaving",
    "Tufting",
    "Transfer Print",
    "Pile Print",
    "Breaded",
    "Latex",
    "Backing",
    "Filler",
  ],
};

// Create a slice of the Redux store
const processesSlice = createSlice({
  name: "processes",
  initialState,
  reducers: {
    // You can add reducers here if you need to modify the state later
  },
});

export default processesSlice.reducer;
