import express from "express";
import cors from "cors";
import { getPreassignedUrl } from "./util/url";
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json())

app.get("/preassingedUrl",async(req,res)=>{
  const url = await getPreassignedUrl();
});

app.get("/",(req,res)=>{
  return res.json({message:"Hello"})
})


app.listen(3000,()=>console.log("Server started"))

