import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import APP_CONFIG from "../../config";

const { API_BASE_URL } = APP_CONFIG;

const initialState = {
  status: "idle",
  error: null,
  byId: {},
};

const normalizePermissionGroup = (group) => {
  const id = group.id;
  const key = (group.key || group.name || id || "").toUpperCase();
  return {
    id,
    key,
    name: group.name || group.key || id,
  };
};

export const fetchPermissionGroups = createAsyncThunk(
  "permissionGroups/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/permissionGroups`);
      if (!response.ok) {
        throw new Error("Permission groups could not be fetched");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || "Permission groups could not be fetched");
    }
  }
);

const permissionGroupsSlice = createSlice({
  name: "permissionGroups",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissionGroups.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPermissionGroups.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        const groups = action.payload.map(normalizePermissionGroup);
        state.byId = groups.reduce((acc, group) => {
          acc[group.id] = group;
          return acc;
        }, {});
      })
      .addCase(fetchPermissionGroups.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || null;
      });
  },
});

export const selectPermissionGroupsState = (state) => state.permissionGroups;

export const selectPermissionGroupsStatus = createSelector(
  [selectPermissionGroupsState],
  (groups) => groups.status
);

export const selectPermissionGroupsError = createSelector(
  [selectPermissionGroupsState],
  (groups) => groups.error
);

export const selectPermissionGroupsById = createSelector(
  [selectPermissionGroupsState],
  (groups) => groups.byId
);

export const selectPermissionGroups = createSelector(
  [selectPermissionGroupsById],
  (byId) => Object.values(byId)
);

export default permissionGroupsSlice.reducer;
