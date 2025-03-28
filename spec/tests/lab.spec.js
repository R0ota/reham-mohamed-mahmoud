const request = require("supertest");
const app = require("../..");
const jwt = require("jsonwebtoken");
const { clearDatabase } = require("../../db.connection");

const req = request(app);

describe("Lab Testing", () => {
  let authToken;
  let userId;
  let todoId;

  beforeAll(async () => {
    // Create test user
    const testUser = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    // Signup and login
    await req.post("/user/signup").send(testUser);
    const loginRes = await req.post("/user/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    authToken = loginRes.body.data;
    const decoded = jwt.verify(authToken, process.env.SECRET);
    userId = decoded.id;

    // Create a todo
    const todoRes = await req
      .post("/todo")
      .set("Authorization", authToken)
      .send({ title: "Test Todo" });

    todoId = todoRes.body.data._id;
  });

  describe("User Routes", () => {
    it("GET /user/search with valid name should return correct user", async () => {
      const res = await req.get("/user/search?name=Test User");

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.name).toBe("Test User");
    });

    it("GET /user/search with invalid name should return message", async () => {
      const res = await req.get("/user/search?name=InvalidName");

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("There is no user with name: InvalidName");
    });
  });

  describe("Todo Routes", () => {
    it("PATCH /todo/:id with no title should return 400", async () => {
      const res = await req
        .patch(`/todo/${todoId}`)
        .set("Authorization", authToken)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("must provide title and id to edit todo");
    });

    it("PATCH /todo/:id with valid title should update and return todo", async () => {
      const newTitle = "Updated Todo Title";
      const res = await req
        .patch(`/todo/${todoId}`)
        .set("Authorization", authToken)
        .send({ title: newTitle });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toBe(newTitle);
    });

    it("GET /todo/user should return user's todos", async () => {
      const res = await req.get("/todo/user").set("Authorization", authToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].userId).toBe(userId.toString());
    });

    it("GET /todo/user for user with no todos should return message", async () => {
      const testUser2 = {
        name: "Test User 2",
        email: "test2@example.com",
        password: "password123",
      };

      await req.post("/user/signup").send(testUser2);
      const loginRes = await req.post("/user/login").send({
        email: testUser2.email,
        password: testUser2.password,
      });

      const newUserToken = loginRes.body.data;
      const newUserId = jwt.verify(newUserToken, process.env.SECRET).id;

      const res = await req
        .get("/todo/user")
        .set("Authorization", newUserToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe(`Couldn't find any todos for ${newUserId}`);
    });
  });

  afterAll(async () => {
    await clearDatabase();
  });
});
