const test = require("node:test");
const assert = require("node:assert/strict");
const { app, calculateTotal } = require("../src/app");

test("calculates the total for several items", () => {
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ];

  assert.equal(calculateTotal(items), 35);
});

test("returns zero for an empty basket", () => {
  assert.equal(calculateTotal([]), 0);
});

test("does not mutate the input items", () => {
  const items = [{ price: 4, quantity: 2 }];
  const copy = JSON.parse(JSON.stringify(items));

  calculateTotal(items);

  assert.deepEqual(items, copy);
});

test("GET /tasks returns 200 and a list of tasks", async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/tasks`);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.strictEqual(data[0].id, 1);
    assert.strictEqual(typeof data[0].title, "string");
    assert.strictEqual(typeof data[0].completed, "boolean");
  } finally {
    server.close();
  }
});

function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve(server);
    });
  });
}

test("POST /tasks creates a new task when title is provided", async (t) => {
  const server = await startServer();
  t.after(() => server.close());

  const port = server.address().port;

  const response = await fetch(`http://localhost:${port}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Faire les tests CI" })
  });

  const data = await response.json();

  assert.equal(response.status, 201);
  assert.equal(data.title, "Faire les tests CI");
  assert.equal(data.completed, false);
  assert.ok(data.id);
});

test("POST /tasks returns 400 Bad Request when title is missing", async (t) => {
  const server = await startServer();
  t.after(() => server.close());

  const port = server.address().port;

  const response = await fetch(`http://localhost:${port}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });

  const data = await response.json();

  assert.equal(response.status, 400);
  assert.equal(data.error, "Title is required");
});
