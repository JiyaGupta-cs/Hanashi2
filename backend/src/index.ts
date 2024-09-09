import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';


const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET:string
	}
}>();

// app.use('/api/v1/blog/*',async(c,next)=>{
//   const header = c.req.header("authorization") || "";
//   const token = header.split(" ")[1];
//   const response = await verify(token,c.env.JWT_SECRET)
//   if(response.id){
//     next()
//   }
//   else{
//     c.status(403)
//     return c.json({error:"Unautorised"})
//   }

// })

app.get('/', async (c) => {
  return c.text('Hello')

})

app.route('/api/v1/user',userRouter);
app.route('/api/v1/blog',blogRouter);


export default app
