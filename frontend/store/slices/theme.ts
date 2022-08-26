import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Appearance } from "react-native"
import { ThemeState, ThemeStateRestore } from "../models/theme"

const initialState: ThemeState = {
  /** Appearance.getColorScheme() only gets initial value */
  deviceColorSchemeIsDark: Appearance.getColorScheme() === 'dark',
  selectedColorSchemeIsDark: null,
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: state => {
      state.selectedColorSchemeIsDark = !state.selectedColorSchemeIsDark
    },
    restoreTheme: (state, action: PayloadAction<ThemeStateRestore | null>) => {
      const restored = action.payload
      if (restored) {
        // TODO: Test automatically check to not miss restoring any property.
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
    },
  },
})

export const {
  toggleTheme,
  restoreTheme,
} = themeSlice.actions

export const selectColorScheme = (state: {theme: ThemeState}): 'light' | 'dark' =>
  state.theme.selectedColorSchemeIsDark ? 'dark' : 'light'

export default themeSlice.reducer
