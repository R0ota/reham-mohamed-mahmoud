const request = require('supertest');
const app=require('../..')

const req=request(app)

describe('Test Root Routes',()=>{
    it('get req(/):should get todo=[]',async()=>{
      let res= await req.get('/')
      expect(res.body.data).toHaveSize(0)
    })
    it('get req(/abc):should get 404 not found',async()=>{
      let res= await req.get('/abc')
      expect(res.statusCode).toBe(404)
      expect(res.body.message).toContain('Not found')
    })

})