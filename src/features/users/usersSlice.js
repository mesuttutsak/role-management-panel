import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import APP_CONFIG from "../../config";

const { API_BASE_URL } = APP_CONFIG;

const initialState = {
  records: [],
  status: "idle",
  error: null,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  hasMore: false,
  totalStatus: "idle",
  totalError: null,
  createStatus: "idle",
  createError: null,
  updateStatus: "idle",
  updateError: null,
  createStatus: "idle",
  createError: null,
  filters: {
    username: "",
    firstname: "",
    lastname: "",
    roleId: "",
  },
};

const STRING_FILTER_KEYS = new Set(["username", "firstname", "lastname"]);

const sanitizePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
};

const parseTotalCount = (headerValue, fallback) => {
  const parsed = Number.parseInt(headerValue ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveFilterParamKey = (key) =>
  (STRING_FILTER_KEYS.has(key) ? `${key}_like` : key);

const buildUserQueryParams = (
  state,
  {
    page,
    pageSize,
    includePagination = true,
    onlyTotalCount = false,
    filters = {},
  } = {}
) => {
  const resolvedPage = sanitizePositiveInteger(page, state.page);
  const resolvedPageSize = sanitizePositiveInteger(pageSize, state.pageSize);

  const params = new URLSearchParams();

  if (includePagination) {
    params.set("_page", String(resolvedPage));
    params.set("_limit", String(resolvedPageSize));
  }

  if (onlyTotalCount) {
    params.set("onlyTotalCount", "true");
  }

  Object.entries(state.filters || {}).forEach(([key, value]) => {
    if (value) {
      params.set(resolveFilterParamKey(key), value);
    }
  });
  if (state.roleFilter && state.roleFilter !== "all") {
    params.set("roleId", state.roleFilter);
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(resolveFilterParamKey(key), value);
    }
  });

  return { params, resolvedPage, resolvedPageSize };
};

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async ({ page, pageSize, filters } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().users || initialState;
      const { params, resolvedPage, resolvedPageSize } = buildUserQueryParams(
        state,
        { page, pageSize, filters }
      );

      const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Users could not be fetched");
      }

      const payload = await response.json();
      const records = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const headerTotal = parseTotalCount(
        response.headers.get("X-Total-Count"),
        null
      );

      const paginationInfo = payload?.pagination || {};

      const totalCount =
        headerTotal ??
        (typeof paginationInfo.totalCount === "number"
          ? paginationInfo.totalCount
          : undefined);

      const hasMore =
        typeof paginationInfo.hasMore === "boolean"
          ? paginationInfo.hasMore
          : records.length === resolvedPageSize;

      return {
        records,
        page: resolvedPage,
        pageSize: resolvedPageSize,
        totalCount,
        hasMore,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Users could not be fetched");
    }
  }
);

export const fetchUsersTotalCount = createAsyncThunk(
  "users/fetchTotalCount",
  async ({ filters } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().users || initialState;
      const { params } = buildUserQueryParams(state, {
        includePagination: false,
        onlyTotalCount: true,
        filters,
      });

      const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Total count could not be fetched");
      }

      const payload = await response.json();
      const totalCount =
        typeof payload?.pagination?.totalCount === "number"
          ? payload.pagination.totalCount
          : parseTotalCount(response.headers.get("X-Total-Count"), 0);

      return Number.isFinite(totalCount) ? totalCount : 0;
    } catch (error) {
      return rejectWithValue(error.message || "Total count could not be fetched");
    }
  }
);

export const createUser = createAsyncThunk(
  "users/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.error || "User could not be created";
        return rejectWithValue(message);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || "User could not be created");
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.error || "User could not be updated";
        return rejectWithValue(message);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || "User could not be updated");
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setPage(state, action) {
      const nextPage = sanitizePositiveInteger(action.payload, state.page);
      state.page = nextPage;
    },
    setPageSize(state, action) {
      const nextSize = sanitizePositiveInteger(action.payload, state.pageSize);
      if (nextSize === state.pageSize) {
        return;
      }
      state.pageSize = nextSize;
      state.page = 1;
    },
    setSearchFilters(state, action) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.records = action.payload.records;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.hasMore = action.payload.hasMore ?? false;
        if (typeof action.payload.totalCount === "number") {
          state.totalCount = action.payload.totalCount;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || null;
        state.hasMore = false;
      })
      .addCase(fetchUsersTotalCount.pending, (state) => {
        state.totalStatus = "loading";
        state.totalError = null;
      })
      .addCase(fetchUsersTotalCount.fulfilled, (state, action) => {
        state.totalStatus = "succeeded";
        state.totalError = null;
        state.totalCount = action.payload;
      })
      .addCase(fetchUsersTotalCount.rejected, (state, action) => {
        state.totalStatus = "failed";
        state.totalError = action.payload || action.error.message || null;
      })
      .addCase(createUser.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.createStatus = "succeeded";
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload || action.error.message || null;
      })
      .addCase(updateUser.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.updateStatus = "succeeded";
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload || action.error.message || null;
      });
  },
});

export const { setPage, setPageSize, setSearchFilters } = usersSlice.actions;

export const selectUsersState = (state) => state.users;

export const selectUsersStatus = createSelector(
  [selectUsersState],
  (users) => users.status
);

export const selectUsersError = createSelector(
  [selectUsersState],
  (users) => users.error
);

export const selectUsersRecords = createSelector(
  [selectUsersState],
  (users) => users.records
);

export const selectUsersPagination = createSelector(
  [selectUsersState],
  (users) => ({
    page: users.page,
    pageSize: users.pageSize,
    totalCount: users.totalCount,
    hasMore: users.hasMore,
  })
);

export const selectUsersHasMore = createSelector(
  [selectUsersState],
  (users) => users.hasMore
);

export const selectUsersTotalStatus = createSelector(
  [selectUsersState],
  (users) => users.totalStatus
);

export const selectUsersTotalError = createSelector(
  [selectUsersState],
  (users) => users.totalError
);

export default usersSlice.reducer;
