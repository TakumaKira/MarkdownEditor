import { createSlice } from "@reduxjs/toolkit"

const initialState: boolean = false

const storeInitializationIsDoneSlice = createSlice({
  name: 'storeInitializationIsDone',
  initialState,
  reducers: {
    storeInitializationDone: state => {
      return true
    },
  }
})

export const {
  storeInitializationDone,
} = storeInitializationIsDoneSlice.actions

export default storeInitializationIsDoneSlice.reducer
