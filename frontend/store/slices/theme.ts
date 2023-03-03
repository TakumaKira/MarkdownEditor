import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { Appearance } from "react-native"
import { getData } from "../../services/asyncStorage"
import { ThemeState } from "../models/theme"

const initialState: ThemeState = {
  /** Appearance.getColorScheme() only gets initial value */
  deviceColorSchemeIsDark: Appearance.getColorScheme() === 'dark',
  selectedColorSchemeIsDark: null,
  restoreIsDone: false
}

export const restoreTheme = createAsyncThunk('theme/restoreTheme', () => {
  return getData('theme')
})

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: state => {
      state.selectedColorSchemeIsDark = !state.selectedColorSchemeIsDark
    },
  },
  extraReducers: builder => {
    builder.addCase(restoreTheme.fulfilled, (state, action) => {
      const restored = action.payload
      if (restored) {
        if (restored.deviceColorSchemeIsDark === state.deviceColorSchemeIsDark) {
          // If device color scheme is the same as the last time, then restore user selection.
          state.selectedColorSchemeIsDark = restored.selectedColorSchemeIsDark
        } else {
          // If device color scheme is changed, then reset selection to it.
          state.selectedColorSchemeIsDark = state.deviceColorSchemeIsDark
        }
      } else {
        // If no previous setting, then start from device setting.
        state.selectedColorSchemeIsDark = state.deviceColorSchemeIsDark
      }
      state.restoreIsDone = true
    })
  }
})

export const {
  toggleTheme,
} = themeSlice.actions

export const selectColorScheme = (state: {theme: ThemeState}): 'light' | 'dark' =>
  state.theme.selectedColorSchemeIsDark ? 'dark' : 'light'

export default themeSlice.reducer
