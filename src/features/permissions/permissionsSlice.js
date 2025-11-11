import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import APP_CONFIG from "../../config";

const { API_BASE_URL } = APP_CONFIG;

const initialState = {
  status: "idle",
  error: null,
  byId: {},
};

const normalizePermission = (permission) => {
  const id = permission.id;
  const key = permission.key || permission.name || id;
  return {
    id,
    key,
    name: permission.name || permission.key || id,
  };
};

export const fetchPermissions = createAsyncThunk(
  "permissions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/permissions`);
      if (!response.ok) {
        throw new Error("Permissions could not be fetched");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || "Permissions could not be fetched");
    }
  }
);

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        const permissions = action.payload.map(normalizePermission);
        state.byId = permissions.reduce((acc, permission) => {
          acc[permission.id] = permission;
          return acc;
        }, {});
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || null;
      });
  },
});

export const selectPermissionsState = (state) => state.permissions;

export const selectPermissionsStatus = createSelector(
  [selectPermissionsState],
  (permissions) => permissions.status
);

export const selectPermissionsError = createSelector(
  [selectPermissionsState],
  (permissions) => permissions.error
);

export const selectPermissionsById = createSelector(
  [selectPermissionsState],
  (permissions) => permissions.byId
);

export const selectPermissions = createSelector(
  [selectPermissionsById],
  (byId) => Object.values(byId)
);

export default permissionsSlice.reducer;
