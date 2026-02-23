import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

process.env.DATABASE_URL ||= "mysql://root:password@localhost:3306/student_management";
process.env.JWT_ACCESS_SECRET ||= "test_access_secret";
process.env.JWT_REFRESH_SECRET ||= "test_refresh_secret";

const { app } = await import("./app.js");

test("GET /health returns ok", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
});

test("GET /api/student/profile without token returns 401", async () => {
  const response = await request(app).get("/api/student/profile");

  assert.equal(response.status, 401);
});
