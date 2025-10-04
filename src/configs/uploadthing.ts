import { createUploadthing, type FileRouter } from "uploadthing/server";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing({
  token: process.env.UPLOADTHING_TOKEN,
});

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  storeIcon: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      // You can add authentication here if needed
      return { userId: "user" }; // Whatever is returned here is accessible in onUploadComplete as `metadata`
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      
      // Return data to send to client
      return { uploadedBy: metadata.userId, url: file.url };
    }),
    
  storeBanner: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      return { userId: "user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Banner upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;