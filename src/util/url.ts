const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

export async function getPreassignedUrl(){
   try {
    const s3Client = new S3Client({
         region: 'ap-south-1',
        credentials: {
          accessKeyId: process.env.AWS_SECRET,
          secretAccessKey: process.env.AWS_SECRET_KEY
        }})

    const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: 'git-bucket0',
    Key: `repos/${Math.ceil(Math.random()*10000)}/img.png`,
    Conditions: [
        ['content-length-range', 0, 5 * 1024 * 1024*10] // 50 MB max
    ],
    Expires: 60
    })
    console.log(url,fields);
    return {url};
   } catch (error) {
    console.log(error)
    return {error};
   }
}