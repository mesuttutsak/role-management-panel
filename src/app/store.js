import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import permissionsReducer from "../features/permissions/permissionsSlice";
import permissionGroupsReducer from "../features/permissionGroups/permissionGroupsSlice";
import rolesReducer from "../features/roles/rolesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    permissions: permissionsReducer,
    permissionGroups: permissionGroupsReducer,
    roles: rolesReducer,
  },
});
