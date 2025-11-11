import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import APP_CONFIG from "../../config";
import { sessionManager } from "../../core/utils/session";

const { API_BASE_URL, loggedSession } = APP_CONFIG;
const session = sessionManager({
  durationMs: loggedSession?.durationMs,
  key: loggedSession?.key,
});

const formatUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, ...rest } = user;

  return rest
};

const saveSession = (user) => session.save(user);
const loadSession = () => session.load();
const clearSession = () => session.clear();

export const fetchAdminUser = createAsyncThunk(
  "auth/fetchAdminUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users?username=admin`);
      if (!response.ok) {
        throw new Error("Admin user could not be found");
      }

      const data = await response.json();

      return data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Admin details could not be loaded");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = errorBody?.error || "Login failed";
        return rejectWithValue(message);
      }

      const userRecord = await response.json();

      return userRecord;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

const storedUser = loadSession();

const initialState = {
  user: storedUser,
  loginStatus: storedUser ? "succeeded" : "idle",
  loginError: null,
  adminHint: null,
  hintStatus: "idle",
  hintError: null,
  activePage: "overview",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.loginStatus = "idle";
      state.loginError = null;
      state.activePage = "overview";
      clearSession();
    }
,
    clearLoginError(state) {
      state.loginError = null;
    },
    setActivePage(state, action) {
      state.activePage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUser.pending, (state) => {
        state.hintStatus = "loading";
        state.hintError = null;
      })
      .addCase(fetchAdminUser.fulfilled, (state, action) => {
        state.hintStatus = "succeeded";
        state.adminHint = action.payload;
      })
      .addCase(fetchAdminUser.rejected, (state, action) => {
        state.hintStatus = "failed";
        state.hintError = action.payload || action.error.message;
      })
      .addCase(login.pending, (state) => {
        state.loginStatus = "loading";
        state.loginError = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginStatus = "succeeded";
        const formatted = formatUser(action.payload);
        state.user = formatted;
        state.activePage = "overview";
        saveSession(formatted);
      })
      .addCase(login.rejected, (state, action) => {
        state.loginStatus = "failed";
        state.loginError = action.payload || action.error.message;
      });
  },
});

export const { logout, clearLoginError, setActivePage } = authSlice.actions;

export default authSlice.reducer;
