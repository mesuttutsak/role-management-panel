import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import APP_CONFIG from "../../config";

const { API_BASE_URL } = APP_CONFIG;

const initialState = {
  status: "idle",
  error: null,
  byId: {},
};

export const fetchRoles = createAsyncThunk(
  "roles/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`);
      if (!response.ok) {
        throw new Error("Roles alınamadı");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || "Roles alınamadı");
    }
  }
);

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.byId = action.payload.reduce((acc, role) => {
          acc[role.id] = role;
          return acc;
        }, {});
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || null;
      });
  },
});

export const selectRolesState = (state) => state.roles;

export const selectRolesStatus = createSelector(
  [selectRolesState],
  (roles) => roles.status
);

export const selectRolesError = createSelector(
  [selectRolesState],
  (roles) => roles.error
);

export const selectRolesById = createSelector(
  [selectRolesState],
  (roles) => roles.byId
);

export const selectRoles = createSelector(
  [selectRolesById],
  (byId) => Object.values(byId)
);

export default rolesSlice.reducer;
