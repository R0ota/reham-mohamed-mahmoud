const request = require("supertest");
const app = require("../..");
const {clearDatabase}=require('../../db.connection')

const req = request(app);

describe("Test ToDo Routes", () => {
  let fakeUser, userToken,toDoinDB;
  beforeAll(async () => {
    fakeUser = { name: "ali", email: "ali@gmail.com", password: "asd123" };
    await req.post("/user/signup").send(fakeUser);
    let res = await req.post("/user/login").send(fakeUser);
    userToken = res.body.data;
  });
  afterAll(async()=>{
   await clearDatabase()
  })
  it("test req(/todo)", async () => {
    let res = await req.get("/todo");
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('test post req(/todo) without authed user',async()=>{
      let res=await req.post('/todo').send({title:'do node js exam'})
      expect(res.statusCode).toBe(401)
      expect(res.body.message).toContain('please login first')
  })
  it('test post req(/todo) with authed user',async()=>{
      let res=await req.post('/todo').send({title:'do your assignments'}).set({authorization:userToken})
      expect(res.statusCode).toBe(201)
      expect(res.body.data.title).toBe('do your assignments')
      toDoinDB=res.body.data
  })

  it('Test get req(/:id)',async()=>{
      let res=await req.get('/todo/'+toDoinDB._id).set({authorization:userToken})
      expect(res.body.data).toEqual(toDoinDB)
  })
});
