import { Hono } from "hono"

import { Prisma, PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { bodyLimit } from "hono/body-limit";

import {createBlogInput, updateBlogInput} from '@100xdevs/medium-common'


export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    },
    Variables:{
        userId:string;
    }
}>();

blogRouter.use('/*', async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    const user =await verify(authHeader, c.env.JWT_SECRET)
    if(user){
        c.set("userId",user.id as string)
    }
    else{
        c.status(403)
        return c.json({
            mmessage:"not authorized"
        })
    }
    await next();
})


blogRouter.get('/bulk',async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const blogs = await prisma.post.findMany({
        select: {
            content: true,
            title: true,
            id: true,
            author: {
                select: {
                    name: true
                }
            }
        }
    });

    return c.json({
        blogs
    })
})


blogRouter.get('/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const id = c.req.param("id");

    try {
        const post = await prisma.post.findFirst({
            where: {
                id: id
            }
        })

        return c.json({
            post
        })
    }
    catch (err) {
        c.status(400);
        return c.json({
            message: "Error while fetching blog"
        })
    }

})

blogRouter.post('/', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json();
    const authorId = c.get("userId");
    try {
        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: authorId,
            }
        })

        return c.json({
            id: post.id
        })
    }
    catch (err) {
        c.status(400);
        return c.json({
            message: "Error while posting blog"
        })
    }

})


blogRouter.put('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())


    const body = await c.req.json();

    const post = await prisma.post.update({
        where: {
            id: body.id,
        },
        data: {
            title: body.title,
            content: body.content,
        }

    })
    return c.json({
        msg:"success"
    })
})

