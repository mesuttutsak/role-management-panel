const { randomUUID } = require("crypto");
const path = require("path");
const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post("/auth/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  const user = router.db.get("users").find({ username }).value();

  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const role = router.db.get("roles").find({ id: user.roleId }).value();

  const { password: _password, ...userWithoutPassword } = user;

  res.json({
    ...userWithoutPassword,
    roleName: role?.name || "",
  });
});

server.post("/users", (req, res, next) => {
  if ("id" in req.body || "systemUser" in req.body) {
    res.status(400).json({ error: "id and systemUser cannot be set manually" });
    return;
  }

  const requiredFields = [
    "username",
    "password",
    "firstname",
    "lastname",
    "roleId",
  ];

  for (const field of requiredFields) {
    if (req.body[field] === undefined) {
      res.status(400).json({ error: `${field} is required` });
      return;
    }
  }

  if (typeof req.body.roleId !== "string" || !UUID_REGEX.test(req.body.roleId)) {
    res.status(400).json({ error: "roleId must be a UUID string" });
    return;
  }

  const roleExists = router.db
    .get("roles")
    .some({ id: req.body.roleId })
    .value();
  if (!roleExists) {
    res.status(400).json({ error: "roleId must reference an existing role" });
    return;
  }

  const allowedFields = [
    "username",
    "password",
    "firstname",
    "lastname",
    "roleId",
    "permissionIds",
  ];

  const sanitizedBody = allowedFields.reduce((acc, key) => {
    acc[key] = req.body[key];
    return acc;
  }, {});

  req.body = {
    id: randomUUID(),
    systemUser: false,
    ...sanitizedBody,
  };
  next();
});

server.delete("/users/:id", (req, res, next) => {
  const record = router.db.get("users").find({ id: req.params.id }).value();
  if (record && record.systemUser) {
    res.status(403).json({ error: "System user cannot be deleted" });
    return;
  }
  next();
});

server.delete("/roles/:id", (req, res, next) => {
  const record = router.db.get("roles").find({ id: req.params.id }).value();
  if (record && record.systemRole) {
    res.status(403).json({ error: "System role cannot be deleted" });
    return;
  }
  next();
});

router.render = (req, res) => {
  const host = req.headers?.host || "localhost";
  const url = new URL(req.originalUrl || req.url, `http://${host}`);
  const query = searchParamsToQueryObject(url.searchParams);

  const pageParam = query._page ?? query.page;
  const limitParam = query._limit ?? query.limit;
  const page = sanitizePositiveInteger(pageParam);
  const pageSize = sanitizePositiveInteger(limitParam);
  const withTotalCount = parseBooleanParam(query.withTotalCount);
  const onlyTotalCount = parseBooleanParam(query.onlyTotalCount);

  const resolvedPage = page ?? 1;
  const resolvedPageSize =
    pageSize ?? (Array.isArray(res.locals.data) ? res.locals.data.length : 0);

  const computeTotals = () => {
    const headerValue = res.getHeader("X-Total-Count");
    let totalCount = parseTotalCountHeader(headerValue);
    let hasMore = false;

    if (Number.isFinite(totalCount)) {
      if (page !== null && pageSize !== null && pageSize > 0) {
        hasMore = resolvedPage * resolvedPageSize < totalCount;
      }
      return { totalCount, hasMore };
    }

    const currentLength = Array.isArray(res.locals.data)
      ? res.locals.data.length
      : 0;

    if (page !== null && pageSize !== null && pageSize > 0) {
      const minimumTotal =
        (resolvedPage - 1) * resolvedPageSize + currentLength;
      totalCount = minimumTotal;
      hasMore = currentLength === resolvedPageSize;
    } else {
      totalCount = currentLength;
      hasMore = false;
    }

    return { totalCount, hasMore };
  };

  if (onlyTotalCount) {
    const { totalCount } = computeTotals();
    res.jsonp({
      pagination: {
        totalCount,
      },
    });
    return;
  }

  const isPaginatedRequest =
    Array.isArray(res.locals.data) && (page !== null || pageSize !== null);

  if (isPaginatedRequest) {
    const { totalCount, hasMore } = computeTotals();

    const pagination = {
      page: resolvedPage,
      pageSize: resolvedPageSize,
      hasMore,
    };

    if (withTotalCount) {
      pagination.totalCount = totalCount;
    }

    res.jsonp({
      data: res.locals.data,
      pagination,
    });
    return;
  }

  res.jsonp(res.locals.data);
};

server.use(router);

const PORT = Number.parseInt(process.env.PORT ?? "", 10) || 3001;

server.listen(PORT, () => {
  console.log(`Mock server listening on http://localhost:${PORT}`);
});

// server helpers fonksiyonlar

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const sanitizePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
};

const parseBooleanParam = (value) => {
  if (value === undefined || value === null) {
    return false;
  }
  if (value === "" || value === true) {
    return true;
  }
  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
};

const parseTotalCountHeader = (headerValue) => {
  if (typeof headerValue === "string") {
    const parsed = Number.parseInt(headerValue, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof headerValue === "number" && Number.isFinite(headerValue)) {
    return headerValue;
  }
  if (
    headerValue &&
    typeof headerValue === "object" &&
    typeof headerValue.value === "function"
  ) {
    const extracted = headerValue.value();
    if (Number.isFinite(extracted)) {
      return extracted;
    }
    const parsed = Number.parseInt(extracted, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const searchParamsToQueryObject = (searchParams) => {
  const query = {};

  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);
    if (values.length === 0) {
      continue;
    }
    query[key] = values.length === 1 ? values[0] : values;
  }
  
  return query;
};
