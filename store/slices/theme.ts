import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { Appearance } from "react-native"
import { getData, storeData } from "../../helpers/asyncStorage"

export interface ThemeState {
  deviceColorSchemeIsDark: boolean
  selectedColorSchemeIsDark: boolean | null
}

const initialState: ThemeState = {
  /** Appearance.getColorScheme() only gets initial value */
  deviceColorSchemeIsDark: Appearance.getColorScheme() === 'dark',
  selectedColorSchemeIsDark: null,
}

export const getThemeStateFromAsyncStorage = createAsyncThunk(
  'theme/getThemeStateFromAsyncStorage',
  async() => getData('theme')
)

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: state => {
      state.selectedColorSchemeIsDark = !state.selectedColorSchemeIsDark
    }
  },
  extraReducers: builder => {
    builder.addCase(getThemeStateFromAsyncStorage.fulfilled, (state, action) => {
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
      storeData('theme', state)
    })
  }
})

export const {
  toggleTheme,
} = themeSlice.actions

export const selectColorScheme = (state: {theme: ThemeState}): 'light' | 'dark' =>
  state.theme.selectedColorSchemeIsDark ? 'dark' : 'light'

export default themeSlice.reducer
