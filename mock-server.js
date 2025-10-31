const { randomUUID } = require("crypto");
const path = require("path");
const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    "permissionIds",
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

  if (
    !Array.isArray(req.body.permissionIds) ||
    req.body.permissionIds.some(
      (value) => typeof value !== "string" || !UUID_REGEX.test(value)
    )
  ) {
    res
      .status(400)
      .json({ error: "permissionIds must be an array of UUID strings" });
    return;
  }

  const invalidPermissions = req.body.permissionIds.filter((id) => {
    return !router.db.get("permissions").some({ id }).value();
  });
  if (invalidPermissions.length) {
    res.status(400).json({
      error: "permissionIds must reference existing permissions",
    });
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

server.use(router);

server.listen(3001, () => {});
