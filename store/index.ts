import { configureStore } from '@reduxjs/toolkit'
import documentReducer from './document'

const store = configureStore({
  reducer: {
    document: documentReducer,
  }
})
export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
