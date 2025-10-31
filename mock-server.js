const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post("/users", (req, res, next) => {
  req.body = {
    systemUser: false,
    ...req.body,
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
