import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Service } from '../../../Types';

const initialState: Service[] = [];

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    addService: (state, action: PayloadAction<Service>) => {
      state.push(action.payload);
    },
    // Add other reducers here...
  },
});

export const { addService } = serviceSlice.actions;

export default serviceSlice.reducer;