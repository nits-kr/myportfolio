import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

const mask = (str) =>
  str ? `${str[0]}****${str[str.length - 1]}` : "undefined";
console.log("Cloudinary Config Check:");
console.log("- Cloud Name:", mask(process.env.CLOUDINARY_CLOUD_NAME));
console.log("- API Key:", mask(process.env.CLOUDINARY_API_KEY));
console.log("- API Secret:", mask(process.env.CLOUDINARY_API_SECRET));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
