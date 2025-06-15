import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/types";

const f = createUploadthing();

// Authentication middleware
const auth = async () => {
  const session = await getServerSession(authOptions);
  if (!session) throw new UploadThingError("Unauthorized");
  return session.user as SessionUser;
};

// FileRouter for SmartClock app
export const ourFileRouter = {
  // Company Logo Upload - Only admins can upload
  companyLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await auth();
      
      // Only admins can upload company logos
      if (user.role !== "ADMIN") {
        throw new UploadThingError("Only administrators can upload company logos");
      }

      return { 
        userId: user.id, 
        organizationId: user.organizationId,
        fileType: "COMPANY_LOGO" as const
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Company logo upload complete for org:", metadata.organizationId);

      // Save file record to database
      const fileRecord = await prisma.file.create({
        data: {
          fileName: file.name,
          originalName: file.name,
          filePath: file.ufsUrl,
          fileType: "COMPANY_LOGO",
          fileSize: file.size,
          mimeType: file.type,
          description: "Company logo",
          uploadedById: metadata.userId,
          organizationId: metadata.organizationId
        }
      });

      // Update organization logo URL
      await prisma.organization.update({
        where: { id: metadata.organizationId },
        data: { logoUrl: file.ufsUrl }
      });

      return { 
        uploadedBy: metadata.userId,
        fileId: fileRecord.id,
        organizationId: metadata.organizationId
      };
    }),

  // Employee Avatar Upload - Any authenticated user
  employeeAvatar: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await auth();

      return { 
        userId: user.id, 
        organizationId: user.organizationId,
        fileType: "EMPLOYEE_AVATAR" as const
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar upload complete for user:", metadata.userId);

      // Save file record to database
      const fileRecord = await prisma.file.create({
        data: {
          fileName: file.name,
          originalName: file.name,
          filePath: file.ufsUrl,
          fileType: "EMPLOYEE_AVATAR",
          fileSize: file.size,
          mimeType: file.type,
          description: "Employee profile picture",
          uploadedById: metadata.userId,
          organizationId: metadata.organizationId
        }
      });

      // Update user avatar URL
      await prisma.user.update({
        where: { id: metadata.userId },
        data: { avatarUrl: file.ufsUrl }
      });

      return { 
        uploadedBy: metadata.userId,
        fileId: fileRecord.id
      };
    }),

  // Document Upload - Any authenticated user
  documentUpload: f({ 
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    text: { maxFileSize: "4MB", maxFileCount: 5 },
    "application/msword": { maxFileSize: "16MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB", maxFileCount: 5 }
  })
    .middleware(async () => {
      const user = await auth();

      return { 
        userId: user.id, 
        organizationId: user.organizationId,
        fileType: "DOCUMENT" as const
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Document upload complete for user:", metadata.userId);

      // Save file record to database
      const fileRecord = await prisma.file.create({
        data: {
          fileName: file.name,
          originalName: file.name,
          filePath: file.ufsUrl,
          fileType: "DOCUMENT",
          fileSize: file.size,
          mimeType: file.type,
          description: "Uploaded document",
          uploadedById: metadata.userId,
          organizationId: metadata.organizationId
        }
      });

      return { 
        uploadedBy: metadata.userId,
        fileId: fileRecord.id,
        fileName: file.name
      };
    }),

  // Join Page Avatar Upload - No authentication required
  joinAvatar: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      // No authentication required for join page uploads
      return { 
        fileType: "JOIN_AVATAR" as const,
        isTemporary: true
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Join avatar upload complete:", file.name);

      // Return file info without saving to database yet
      // This will be saved when the user completes registration
      return { 
        fileUrl: file.ufsUrl,
        fileName: file.name,
        fileSize: file.size,
        isTemporary: true
      };
    }),

  // Join Page Document Upload - No authentication required
  joinDocuments: f({ 
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    "application/msword": { maxFileSize: "16MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB", maxFileCount: 10 }
  })
    .middleware(async () => {
      // No authentication required for join page uploads
      return { 
        fileType: "JOIN_DOCUMENT" as const,
        isTemporary: true
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Join document upload complete:", file.name);

      // Return file info without saving to database yet
      // This will be saved when the user completes registration
      return { 
        fileUrl: file.ufsUrl,
        fileName: file.name,
        fileSize: file.size,
        isTemporary: true
      };
    }),

  // Onboarding Documents - For HR and new employee paperwork
  onboardingDocuments: f({ 
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    "application/msword": { maxFileSize: "16MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB", maxFileCount: 10 }
  })
    .middleware(async () => {
      const user = await auth();

      // Only managers and admins can upload onboarding documents
      if (!["MANAGER", "ADMIN"].includes(user.role)) {
        throw new UploadThingError("Only managers and administrators can upload onboarding documents");
      }

      return { 
        userId: user.id, 
        organizationId: user.organizationId,
        fileType: "ONBOARDING_DOCUMENT" as const
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Onboarding document upload complete for org:", metadata.organizationId);

      // Save file record to database
      const fileRecord = await prisma.file.create({
        data: {
          fileName: file.name,
          originalName: file.name,
          filePath: file.ufsUrl,
          fileType: "ONBOARDING_DOCUMENT",
          fileSize: file.size,
          mimeType: file.type,
          description: "Onboarding document",
          uploadedById: metadata.userId,
          organizationId: metadata.organizationId
        }
      });

      return { 
        uploadedBy: metadata.userId,
        fileId: fileRecord.id,
        fileName: file.name
      };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 