import test from "node:test";
import assert from "node:assert";
import { Readable } from "node:stream";

process.env.NODE_ENV = "test";
const { default: app } = await import("./server.js");

function request(app, options = {}) {
  const { method = "GET", url = "/", body = null, headers = {} } = options;
  return new Promise((resolve, reject) => {
    const req = new Readable({
      read() {
        if (body) {
          this.push(typeof body === "string" ? body : JSON.stringify(body));
        }
        this.push(null);
      },
    });

    req.method = method;
    req.url = url;
    req.headers = {
      "content-type": "application/json",
      ...headers,
    };
    req.socket = { remoteAddress: "127.0.0.1" };
    req.connection = req.socket;

    let resStatusCode = 200;
    const resHeaders = {};
    let responseBody = "";

    const res = {
      statusCode: 200,
      setHeader(k, v) {
        resHeaders[k.toLowerCase()] = v;
      },
      getHeader(k) {
        return resHeaders[k.toLowerCase()];
      },
      writeHead(code, h) {
        resStatusCode = code;
        if (h) Object.assign(resHeaders, h);
      },
      status(code) {
        this.statusCode = code;
        resStatusCode = code;
        return this;
      },
      json(data) {
        this.setHeader("content-type", "application/json");
        responseBody = JSON.stringify(data);
        this.end(responseBody);
      },
      send(data) {
        responseBody = typeof data === "object" ? JSON.stringify(data) : String(data);
        this.end(responseBody);
      },
      end(chunk) {
        if (chunk) responseBody = chunk;
        resolve({
          status: this.statusCode || resStatusCode,
          headers: resHeaders,
          body: responseBody,
          json: () => JSON.parse(responseBody),
        });
      },
      on() {},
      emit() {},
    };

    app(req, res, (err) => {
      if (err) reject(err);
      else {
        resolve({
          status: res.statusCode || resStatusCode,
          headers: resHeaders,
          body: responseBody,
          json: () => JSON.parse(responseBody),
        });
      }
    });
  });
}

test("GET / returns 200 with success status", async () => {
  const res = await request(app, { method: "GET", url: "/" });
  assert.strictEqual(res.status, 200);
  const data = res.json();
  assert.strictEqual(data.status, "success");
  assert.strictEqual(data.message, "Welcome to Express Application API");
});

test("GET /api/health returns 200 healthy status", async () => {
  const res = await request(app, { method: "GET", url: "/api/health" });
  assert.strictEqual(res.status, 200);
  const data = res.json();
  assert.strictEqual(data.status, "healthy");
  assert.ok(typeof data.uptime === "number");
});

test("GET /api/v1/info returns endpoint metadata", async () => {
  const res = await request(app, { method: "GET", url: "/api/v1/info" });
  assert.strictEqual(res.status, 200);
  const data = res.json();
  assert.strictEqual(data.app, "express-app");
  assert.ok(Array.isArray(data.endpoints));
});

test("GET /api/nonexistent returns 404 Not Found", async () => {
  const res = await request(app, { method: "GET", url: "/api/nonexistent" });
  assert.strictEqual(res.status, 404);
  const data = res.json();
  assert.strictEqual(data.error, "Not Found");
});
