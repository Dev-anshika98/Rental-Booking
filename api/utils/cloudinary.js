import {v2 as cloudinary} from "cloudinary";
// import { log } from 'console';
import fs from "fs"  
import "dotenv/config"





cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {

    try {
        if(!localFilePath) return null
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{resource_type : "auto"})
                         
        fs.unlinkSync(localFilePath)
        console.log("file uploaded");

        // file has been uploaded
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

const deleteFromCloudinary = async (publicId) =>{
    try {
        console.log("Old Url::",publicId)
        const arr = (publicId.split('/'))
        const arr2=arr[arr.length-1].split('.')[0]
        const resultt = await cloudinary.uploader.destroy(arr2,(error,result)=>{
            console.log(result ,"  deleted");
        });
        console.log(resultt);
        console.log('File deleted successfully.');
      } catch (error) {
        console.error('Error deleting file:', error);
      }
}



export {uploadOnCloudinary,deleteFromCloudinary};