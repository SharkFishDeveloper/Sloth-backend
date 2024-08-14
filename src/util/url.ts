const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

export async function getPreassignedUrl(id:string,reponame:string){
   try {
    const s3Client = new S3Client({
         region: 'ap-south-1',
        credentials: {
          accessKeyId: process.env.AWS_SECRET,
          secretAccessKey: process.env.AWS_SECRET_KEY
        }})

    const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: 'git-bucket0',
    Key: `repos/${id}/${reponame}/${reponame}.gz`,
    Conditions: [
        ['content-length-range', 0, 5 * 1024 * 1024*10] // 50 MB max
    ],
    Expires: 60
    })
    return {url,fields};
   } catch (error) {
    console.log(error)
    return {error};
   }
}