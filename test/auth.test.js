import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../src/server.js";
import UserModel from "../src/models/user.model.js";

describe("Authentication API", () => {
  /** @type {MongoMemoryServer} */
  let mongoServer;

  before(async () => {
    if (process.env.NODE_ENV !== "test") {
      process.env.NODE_ENV = "test";
    }

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await mongoose.connect(mongoUri);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  describe("POST /api/user/register", () => {
    it("should register a new user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "TestPass123!",
      };

      const res = await request(app)
        .post("/api/user/register")
        .send(userData)
        .expect(200);

      expect(res.body).to.have.property("token");
      expect(res.body).to.have.property("user");
      expect(res.body.user.email).to.equal(userData.email);
    });

    it("should return error for duplicate email", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "TestPass123!",
      };

      await request(app).post("/api/user/register").send(userData);

      const res = await request(app)
        .post("/api/user/register")
        .send(userData)
        .expect(400);

      expect(res.body).to.have.property("message");
      expect(res.body.message).to.equal("User already exists");
    });
  });

  describe("POST /api/user/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/user/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "TestPass123!",
      });
    });

    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/api/user/login")
        .send({
          email: "test@example.com",
          password: "TestPass123!",
        })
        .expect(200);

      expect(res.body).to.have.property("token");
      expect(res.body).to.have.property("user");
    });

    it("should return error for non-existent user", async () => {
      const res = await request(app)
        .post("/api/user/login")
        .send({
          email: "non-existent@example.com",
          password: "SomePass123!",
        })
        .expect(404);

      expect(res.body).to.have.property("message");
      expect(res.body.message).to.equal("User does not exist");
    });

    it("should return error for invalid credentials", async () => {
      const res = await request(app)
        .post("/api/user/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        })
        .expect(400);

      expect(res.body).to.have.property("message");
      expect(res.body.message).to.equal("Invalid email or password");
    });
  });

  describe("GET /api/user/getuser", () => {
    /** @type {string} */
    let token;

    beforeEach(async () => {
      const res = await request(app).post("/api/user/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "TestPass123!",
      });
      token = res.body.token;
    });

    it("should get user with valid token", async () => {
      const res = await request(app)
        .get("/api/user/getuser")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).to.have.property("user");
      expect(res.body.user.email).to.equal("test@example.com");
    });

    it("should return error without token", async () => {
      const res = await request(app).get("/api/user/getuser");
      expect(res.status).to.equal(403);
      expect(res.body).to.have.property("message");
    });
  });

  describe("POST /api/user/forgotPassword", () => {
    beforeEach(async () => {
      await request(app).post("/api/user/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "TestPass123!",
      });
    });

    it("should send password reset email for existing user", async () => {
      const res = await request(app)
        .post("/api/user/forgotPassword")
        .send({
          email: "test@example.com",
        })
        .expect(200);

      expect(res.body.message).to.include("reset your password");
    });

    it("should return error for non-existent user", async () => {
      await request(app)
        .post("/api/user/forgotPassword")
        .send({
          email: "nonexistent@example.com",
        })
        .expect(404);
    });
  });

  describe("POST /api/user/resetPassword", () => {
    /** @type {string} */
    let userId;
    /** @type {string} */
    let resetToken;

    beforeEach(async () => {
      await request(app).post("/api/user/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "TestPass123!",
      });

      await request(app).post("/api/user/forgotPassword").send({
        email: "test@example.com",
      });

      // Get user and manually set reset token for testing
      const user = await UserModel.findOne({ email: "test@example.com" });
      userId = user._id.toString();
      resetToken = "test-reset-token";

      const crypto = await import("node:crypto");
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.passwordResetTokenHash = resetTokenHash;
      user.passwordResetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
    });

    it("should reset password with valid token", async () => {
      const res = await request(app)
        .post("/api/user/resetPassword")
        .send({
          id: userId,
          resetToken: resetToken,
          newPassword: "NewTestPass123!",
        })
        .expect(200);

      expect(res.body.message).to.equal("Password reset successful");
    });

    it("should return error with invalid token", async () => {
      const res = await request(app).post("/api/user/resetPassword").send({
        id: userId,
        resetToken: "invalid-token",
        newPassword: "NewTestPass123!",
      });

      expect(res.status).to.be.oneOf([400, 500]);
      expect(res.body).to.have.property("message");
    });
  });
});
