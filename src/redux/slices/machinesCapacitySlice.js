//processesSlice.js

import { createSlice } from "@reduxjs/toolkit";

// Define the initial state for processes
const initialState = {
  machinesCapacity: {
    "Cutting": 200,
    "Stitching":125,
    "Weaving":45,
    "Tufting":42,
    "Transfer Print":356,
    "Pile Print":203,
    "Breaded":234,
    "Latex":346,
    "Backing":234,
    "Filler": 245,
    "Carpet Tufting":34
  },
};

// Create a slice of the Redux store
const machinesCapacitySlice = createSlice({
  name: "machinesCapacity",
  initialState,
  reducers: {
    // You can add reducers here if you need to modify the state later
  },
});

export default machinesCapacitySlice.reducer;
