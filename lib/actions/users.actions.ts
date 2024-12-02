"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";
import { appWriteConfig } from "@/lib/appwrite/config";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";

// Function to get a user by email
const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appWriteConfig.databaseId,
    appWriteConfig.usersCollectionId,
    [Query.equal("email", [email])],
  );

  return result.total > 0 ? result.documents[0] : null;
};

// Error handling helper
const handleError = (error: unknown, message: string) => {
  console.error(message, error);
  throw new Error(message);
};

// Function to send an email OTP
export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient(); // Use `createAdminClient` for admin-level operations

  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

// Function to create a user account
export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  try {
    const existingUser = await getUserByEmail(email);

    // Send OTP for account creation
    const accountId = await sendEmailOTP({ email });
    if (!accountId) throw new Error("Failed to send an OTP");

    // Create a new user if not already present
    if (!existingUser) {
      const { databases } = await createAdminClient();

      await databases.createDocument(
        appWriteConfig.databaseId,
        appWriteConfig.usersCollectionId,
        ID.unique(),
        {
          fullName,
          email,
          avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwdIVSqaMsmZyDbr9mDPk06Nss404fosHjLg&s",
          accountId,
        },
      );
    }

    return parseStringify({ accountId });
  } catch (error) {
    handleError(error, "Failed to create account");
  }
};

export const verifySecret = async({accountId,password}: {accountId:string,password:string})=>{
  try {
    const {account} = await createAdminClient();

    const session = await account.createSession(accountId,password);
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });
    
    return parseStringify({sessionId: session.$id});
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
}