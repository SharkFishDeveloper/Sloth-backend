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
    .min(6, { message: "Password must be at least 6 characters long" })
});

const preassignedUrlSchema = z.object({
  email: z.string().email(),        // Validates that email is a string and a valid email format
  password: z.string().min(6),      // Validates that password is a string with a minimum length of 6 characters
  reponame: z.string().min(6),      // Validates that reponame is a non-empty string
  id: z.string().nonempty("ID is required"),        // Validates that id is a string in UUID format
});

require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json())

app.post("/init",async(req,res)=>{
  try {
    const parsedBody = requestBodySchema.parse(req.body);
    const {email,password,reponame} = req.body;
    const user  = await prisma.user.findUnique({
      where:{
        email:email,
        password:password, // TODO : hash it, 
      },
      select:{
        id:true
      }
    })
    if(!user){
      return res.json({message:"No user found !!. Please fill correctly"}).status(403);
    }

    const newRepository = await prisma.repositories.create({
      data:{
        name:reponame,
        userId:user.id
      }
    });
    
    await prisma.user.update({
      where:{
        id: user.id,
        email:email
      },
      data:{
        repositories : {
          connect: { name: newRepository.name },
        }
      } 
    })
    const url = await getPreassignedUrl(user.id);
    return res.json({message:url}).status(200);
  } catch (error) { 
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Enter properly all fields"});
    } 
    //@ts-ignore
    if(error.code==="P2002"){
      return res.json({message:"Please enter a unique repo name"}).status(403);
    }
    return res.json({message:error}).status(500)
  }

})

app.post("/preassingedUrl",async(req,res)=>{
  try {
    const validatedData = preassignedUrlSchema.parse(req.body);
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
  const repositories = await prisma.repositories.findMany({
    where: {
      userId: id,
      name:reponame
    },
    select: {
      name: true,
    },
  });
  if(repositories.length>0){
    const url = await getPreassignedUrl(id);
    return res.json({message:url })
  }else if(repositories.length ===0){
    return res.json({message:`No repo found with name - ${reponame} found` }).status(400)
  }
  
} catch (error) {
  if (error instanceof z.ZodError) {
    return res.json({ message: "PLease fill all the fields properly" }).status(404);
  }
  
}
});



app.get("/",(req,res)=>{
  return res.json({message:"Hello"})
})
app.listen(3000,()=>console.log("Server started"))

