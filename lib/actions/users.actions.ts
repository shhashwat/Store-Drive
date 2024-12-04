"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appWriteConfig } from "@/lib/appwrite/config";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";
import { error } from "console";

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
          avatar: avatarPlaceholderUrl,
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

export const getCurrentUser = async () => {
  const {databases, account} = await createSessionClient();

  const result = await account.get();

  const user = await databases.listDocuments(
    appWriteConfig.databaseId,
    appWriteConfig.usersCollectionId,
    [Query.equal("accountId", result.$id)],
  );

  if (user.total <= 0) return null;

  return parseStringify(user.documents[0]);
}

export const signOutUser = async () => {
  const {account} = await createSessionClient();
  try {
    await account.deleteSession('current');
    (await cookies()).delete('appwrite-session');
  } catch (error) {
    handleError(error, "Failed to Logout user");
  } finally{
    redirect('/sign-in');
  }
}

export const signInUser = async ({email}: {email:string}) => {
  try {
    const existingUser = await getUserByEmail(email);

    if(existingUser){
      await sendEmailOTP({ email });
      return parseStringify({accountId: existingUser.accountId});
    }

    return parseStringify({accountId: null, error: "User not found"});
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
}