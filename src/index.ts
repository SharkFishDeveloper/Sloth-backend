import express from "express";
import cors from "cors";
import { getPreassignedUrl } from "./util/url";
import prisma from "./util/db";

import { z } from 'zod';

const requestBodySchema = z.object({
  reponame: z.string()
    .min(6, { message: "Repo name too short" }),
  email: z.string()
    .email({ message: "Invalid email address" }), 
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" }), 
  id: z.string().min(6, { message: "Id must be at least 8 characters long" })
});

require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json())

app.post("/init",async(req,res)=>{
  try {
    // await prisma.user.delete({
    //   where:{}z
    // })
    const parsedBody = requestBodySchema.parse(req.body);
    const {email,password,reponame,id} = req.body;
    const user  = await prisma.user.findUnique({
      where:{
        email:email,
        password:password, // TODO : hash it, 
      }
    })
    if(!user){
      return res.json({message:"No user found !!. Please fill correctly"}).status(403);
    }
    const newRepository = await prisma.repositories.create({
      data:{
        name:reponame,
        userId:id
      }
    });
    await prisma.user.update({
      where:{
        id: id,
        email:email
      },
      data:{
        repositories : {
          connect: { name: newRepository.name },
        }
      } 
    })
    return res.json({message:"Intialized repo successfully"}).status(200);
  } catch (error) { 
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    } 
    console.log(error)
    return res.json({message:error}).status(500)
  }

})

app.post("/preassingedUrl",async(req,res)=>{
  const {email,password,reponame} = req.body;
  const user  = await prisma.user.findUnique({
    where:{
      email:email,
      password:password, // TODO : hash it, 
    }
  })
  if(!user){
    return res.json({message:"No user found !!. Please fill correctly"}).status(403);
  }
  
  const url = await getPreassignedUrl();
  return res.json({message:url})
});

app.get("/",(req,res)=>{
  return res.json({message:"Hello"})
})


app.listen(3000,()=>console.log("Server started"))

