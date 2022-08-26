import { UserInfoOnToken } from "@api/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import jwt from 'jsonwebtoken';
import { UserState, UserStateRestore } from "../models/user";

const initialState: UserState = {
  token: null,
  email: null,
}

// TODO: Add restoration.

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      const token = action.payload
      try {
        const { email } = jwt.decode(token) as UserInfoOnToken
        state.token = token
        state.email = email
      } catch (err) {
        console.log(err)
      }
    },
    logout: state => {
      state.token = null
      state.email = null
    },
    restoreUser: (state, action: PayloadAction<UserStateRestore | null>) => {
      const restored = action.payload
      if (restored) {
        try {
          // TODO: Test automatically check to not miss restoring any property.
          state.token = restored.token
          state.email = restored.email
        } catch (err) {
          console.error(err)
        }
      }
    },
  }
})

export const {
  login,
  logout,
  restoreUser,
} = userSlice.actions

export default userSlice.reducer
