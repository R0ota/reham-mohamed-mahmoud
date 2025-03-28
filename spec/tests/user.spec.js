const request = require("supertest");
const app = require("../..");
const { clearDatabase } = require("../../db.connection");

const req = request(app);

describe("Test User Routes", () => {
  let fakeUser;
  beforeAll(() => {
    fakeUser = { name: "ali", email: "ali@gmail.com", password: "asd123" };
  });
  afterAll(async () => {
    await clearDatabase();
  });
  it("test get req(/)", async () => {
    let res = await req.get("/user");
    expect(res.body.data).toEqual([]);
    expect(res.body.data).toHaveSize(0);
  });

  it("test req(/signup)", async () => {
    let res = await req.post("/user/signup").send(fakeUser);
     expect(res.statusCode).toBe(201)
     expect(res.body.data.email).toBe('ali@gmail.com')
     fakeUser._id=res.body.data._id
  });
  it('Test req(/login) with invalid creditional',async()=>{
    let res=await req.post('/user/login').send({email:fakeUser.email,password:"ewe22"})
    expect(res.statusCode).toBe(401)
    expect(res.body.message).toContain('Invalid email or password')
  })
  it('Test req(/login) with valid creditional',async()=>{
    let res=await req.post('/user/login').send(fakeUser)
    expect(res.statusCode).toBe(200)
    expect(res.body.data).toBeDefined()
  })

  it('test req(/:id)',async()=>{
    let res=await req.get('/user/'+fakeUser._id)
    expect(res.body.data._id).toBe(fakeUser._id)
    expect(res.body.data.email).toBe('ali@gmail.com')
  })
});
