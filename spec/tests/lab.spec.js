const request = require('supertest');
const app = require('../..');
const jwt = require('jsonwebtoken');
const { clearDatabase } = require('../../db.connection');
const req = request(app);

describe("lab testing:", () => {
    let authToken;
    let userId;
    let todoId;

    beforeAll(async () => {
        // Create user
        const testUser = {
            name: "Test User",
            email: "test@example.com",
            password: "password123"
        };

        // Sign up and login
        await req.post('/user/signup').send(testUser);
        const loginRes = await req.post('/user/login').send({
            email: "test@example.com",
            password: "password123"
        });
        
        authToken = loginRes.body.data;
        const decoded = jwt.verify(authToken, process.env.SECRET);
        userId = decoded.id;

        // Create a todo
        const todoRes = await req.post('/todo')
            .set('Authorization', authToken)
            .send({ title: "Test Todo" });
        todoId = todoRes.body.data._id;
    });

    describe("users routes:", () => {
        it("req to get(/user/search) ,expect to get the correct user with his name", async () => {
            const res = await req.get('/user/search?name=Test User');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeDefined();
            expect(res.body.data.name).toBe("Test User");
        });

        it("req to get(/user/search) with invalid name ,expect res status and res message to be as expected", async () => {
            const res = await req.get('/user/search?name=InvalidName');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("There is no user with name: InvalidName");
        });
    });

    describe("todos routes:", () => {
        it("req to patch(/todo/:id) with id only ,expect res status and res message to be as expected", async () => {
            const res = await req.patch(/todo/${todoId})
                .set('Authorization', authToken)
                .send({});
            
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("must provide title and id to edit todo");
        });

        it("req to patch(/todo/:id) with id and title ,expect res status and res to be as expected", async () => {
            const newTitle = "Updated Todo Title";
            const res = await req.patch(/todo/${todoId})
                .set('Authorization', authToken)
                .send({ title: newTitle });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeDefined();
            expect(res.body.data.title).toBe(newTitle);
        });

        it("req to get(/todo/user) ,expect to get all user's todos", async () => {
            const res = await req.get('/todo/user')
                .set('Authorization', authToken);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data[0].userId).toBe(userId.toString());
        });

        it("req to get(/todo/user) ,expect to not get any todos for user hasn't any todo", async () => {
            // Create a new user with no todos
            const testUser2 = {
                name: "Test User 2",
                email: "test2@example.com",
                password: "password123"
            };
            
            await req.post('/user/signup').send(testUser2);
            const loginRes = await req.post('/user/login').send({
                email: "test2@example.com",
                password: "password123"
            });
            
            const newUserToken = loginRes.body.data;
            const newUserId = jwt.verify(newUserToken, process.env.SECRET).id;
            
            const res = await req.get('/todo/user')
                .set('Authorization', newUserToken);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe(Couldn't find any todos for ${newUserId});
        });
    });

    afterAll(async () => {
       clearDatabase()
    });
});