import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Payment screenshots
  paymentScreenshot: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Payment screenshot uploaded:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),

  // Content images
  contentImage: f({ image: { maxFileSize: "16MB", maxFileCount: 10 } })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Content image uploaded:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),

  // Content videos
  contentVideo: f({ video: { maxFileSize: "512MB", maxFileCount: 1 } })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Content video uploaded:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
