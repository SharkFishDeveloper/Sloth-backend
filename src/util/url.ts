const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');


export async function getPreassignedUrl(){
   try {
    const client = new S3Client({
        region:"ap-south-1",
        credentials:{
            accessKeyId: process.env.AWS_SECRET,
            secretAccessKey: process.env.AWS_SECRET_KEY
        }
      });
      const command = new GetObjectCommand({
        Bucket: "git-bucket0",
        Key: "/"
      });
      const url = await getSignedUrl(client, command, { expiresIn: 60 }); 
      return {url};
   } catch (error) {
    return {};
   }
}