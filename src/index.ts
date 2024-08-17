import express from "express";
import cors from "cors";
import { getPrDownloadUrl, getPrDownloadUrlFork, getPreassignedUrl, getPreassignedUrlForContributors, getPullRequestPreAssingedUrl } from "./util/url";
import prisma from "./util/db";

import { any, z } from 'zod';

const requestBodySchema = z.object({
  reponame: z.string()
    .min(6, { message: "Repo name too short" }),
  email: z.string()
    .email({ message: "Invalid email address" }), 
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" })
});

const requestBodySchemaInit = z.object({
  reponame: z.string()
    .min(6, { message: "Repo name too short" }),
  email: z.string()
    .email({ message: "Invalid email address" }), 
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  description : z.string().max(30,"Too long description").optional()
});


const pullrRequestBodySchema = z.object({
  email: z.string().email(),       
  password: z.string().min(6),      
  repoName: z.string().min(6), 
  totalCommits: z.number(),
  childBranch :z.string(),
  parentBranch: z.string()  ,
  message: z.string().min(8).max(50)
});


const mergeRequestBodySchema = z.object({
  // reponame: z.string()
  //   .min(6, { message: "Repo name too short" }),
  email: z.string()
    .email({ message: "Invalid email address" }), 
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  prid:z.string()
});

require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json())

app.post("/init",async(req,res)=>{
  try {
    const parsedBody = requestBodySchemaInit.parse(req.body);
    const {email,password,reponame,description} = req.body;
    const user  = await prisma.user.findUnique({
      where:{
        email:email,
        password:password,// TODO : hash it, 
      },
      select:{
        id:true,
        name:true
      }
    })
    if(!user){
      return res.json({message:"No user found !!. Please fill correctly"}).status(403);
    }
    await prisma.repositories.create({
      data:{
        name:reponame,
        userId:user.id,
        description,
        creatorName:user.name
      }
    })
    const url = await getPreassignedUrl(user.id,reponame);
    return res.json({message:url,id:user.id}).status(200);
  } catch (error) { 
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Enter properly all fields",status:400});
    } 
    //@ts-ignore
    if(error.code==="P2002"){
      return res.json({message:"Please enter a unique repo name",status:400}).status(500);
    }
    return res.json({message:error,status:400}).status(500)
  }

})

app.post("/push",async(req,res)=>{
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
    const reponameCheck = await prisma.repositories.findUnique({
      where:{
        name:reponame,
        userId:user.id,
      },
    })
    if(reponameCheck){
      const url = await getPreassignedUrl(user.id,reponame);
      return res.json({message:url,id:user.id}).status(200);
    }
    else {
      return res.json({message:"No such repository exists, please create a pull request or create origin"}).status(400);
    }
   
  } catch (error) { 
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Enter properly all fields"});
    } 
    //@ts-ignore
    if(error.code==="P2002"){
      return res.json({message:"Please enter a unique repo name"}).status(500);
    }
    return res.json({message:error}).status(500)
  }

})

app.post("/push-origin",async(req,res)=>{
  try {
    const parsedBody = pullrRequestBodySchema.parse(req.body);
    const {email,password,repoName,totalCommits,childBranch,parentBranch,message} = req.body;
    const user  = await prisma.user.findUnique({
      where:{
        email:email,
        password:password, // TODO : hash it, 
      },
      select:{
        id:true,
        name:true
      }
    })
    if(!user){
      return res.json({message:"No user found !!. Please fill correctly"}).status(403);
    }
    const reponameCheck = await prisma.repositories.findUnique({
      where:{
        name:repoName,
      },
      select:{
        userId:true,
        collaborationOption:true,
        contributors:true
      }
    })

    if(reponameCheck){
      if(reponameCheck.userId === user.id){
        return res.json({message:"Please use < push origin > command",status:400})
      }
     else{
      if(reponameCheck.collaborationOption){
        const collaborators = reponameCheck.contributors;
        const collaboratorExists = collaborators.find(collaborator => collaborator=== user.name);
        if(!collaboratorExists){
          return res.json({message:`You cannot contribute to - ${repoName}`,status:400})
        }
      }
      const randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);
      const randomPrId = randomSixDigitNumber.toString()
      await prisma.$transaction(async (prisma) => {
        await prisma.pullRequest.create({
          data: {
            id: randomPrId,
            parentBranch,
            childBranch,
            totalCommits,
            message,
            contributor: user.name,
            repositoryName: repoName,
            creatorId: reponameCheck.userId  
          },
        });

        await prisma.userPullRequest.create({
          data:{
            id:randomPrId,
            repoName:repoName,
            userName:user.name
          }
        })


      });
      const url = await getPreassignedUrlForContributors(reponameCheck.userId,repoName,randomPrId);
      return res.json({message:url,id:user.id}).status(200);
     }
    }
    else {
      return res.json({message:"No such repository exists, please create a pull request or create origin",status:400}).status(400);
    }
   
  } catch (error) { 
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: `--- Enter properly all fields ---
        ${error.errors[0].message}`,status:400});
    } 
     //@ts-ignore
    if(error.code==="P2002"){
      return res.json({message:"Please enter a unique repo name",status:400}).status(500);
    }
    return res.json({message:error}).status(500)
  }

})


app.post("/merge",async(req,res)=>{
  try {
    const parsedBody = mergeRequestBodySchema.parse(req.body);
    const {email,password,prid} = req.body;
    const user  = await prisma.user.findUnique({
      where:{
        email:email,
        password:password, // TODO : hash it, 
      },
      select:{
        id:true,
        name:true
      }
    })
    if(!user){
      return res.json({message:"No user found !!. Please fill correctly or sign up online"}).status(403);
    }
    
    const pr = await prisma.pullRequest.findUnique({
      where:{
        id:prid
      },
      select:{
        repositoryName:true,
        parentBranch:true,
        childBranch:true,
        creatorId:true
      }
    })
    
    if(!pr?.creatorId){
      return res.json({message:"No such user exists"})
    }
    else if(pr.creatorId !== user.id){
      return res.json({message:"You cannot merge it. Ask the administrator to merge it!!"})
    }
   else if(pr){
    const url = await getPrDownloadUrl(user.id,prid,pr.repositoryName);
    const parentBranch = pr.parentBranch;
    const childBranch = pr.childBranch;

    await prisma.pullRequest.delete({
      where: {
        id: prid
      }
    });
    return res.json({message:url,parentBranch,childBranch});
   }else{
    return res.json({message:`No pull request - ${prid} exists`,status:400});
   }

  } catch (error) { 
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Enter properly all fields"});
    } 
    //@ts-ignore
    if(error.code==="P2002"){
      return res.json({message:"Please enter a unique repo name"}).status(500);
    }
    return res.json({message:error,status:500}).status(500)
  }
})

app.post("/pull",async(req,res)=>{
  const {reponame} = req.body;
  if(!reponame || reponame.length < 6){
    return res.json({message:`Reponame - ${reponame} is too short`,status:400}).status(400);
  }
  const repository = await prisma.repositories.findUnique({
    where:{
      name : reponame
    },
    select:{
      userId : true
    }
  })
    if(repository){
    const url = await getPullRequestPreAssingedUrl(reponame,repository?.userId);
    return res.json({message:url})
  }
    return res.json({message:`No repository with name - ${reponame} found !! `,status:400}).status(400)
})

app.post("/fork",async(req,res)=>{
 try {
  const {userID,name} = req.body;
  const forkUrl = await getPrDownloadUrlFork(userID,name);
  return res.json({message:forkUrl,status:200})
 } catch (error) {
  return res.json({message:"error forking",status:500}) 
 }
})


app.get("/",(req,res)=>{
  return res.json({message:"Hello"})
})
app.listen(4000,()=>console.log("Server started"))

