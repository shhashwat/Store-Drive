'use server';

import { InputFile } from "node-appwrite/file";
import { createAdminClient } from "../appwrite";
import { appWriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./users.actions";

const handleError = (error: unknown, message: string) => {
    console.error(message, error);
    throw new Error(message);
  };
  
export const uploadFile = async ({file, ownerId, accountId, path}: UploadFileProps) => {
    const {storage, databases} = await createAdminClient();
    try {
        const inputFile = InputFile.fromBuffer(file, file.name);
        const bucketFile = await storage.createFile(appWriteConfig.bucketId,
            ID.unique(),
            inputFile);

        const fileDocument = {
            type: getFileType(bucketFile.name).type,
            name: bucketFile.name,
            url: constructFileUrl(bucketFile.$id),
            extension: getFileType(bucketFile.name).extension,
            size: bucketFile.sizeOriginal,
            owner: ownerId,
            accountId,
            users: [],
            bucketFileId: bucketFile.$id,
        }

        const newFile = await databases.createDocument(
           appWriteConfig.databaseId,
           appWriteConfig.filesCollectionId,
           ID.unique(),
           fileDocument,
        ).catch(async(error: unknown)=>{
            await storage.deleteFile(
                appWriteConfig.bucketId,
                bucketFile.$id
            );
            handleError(error, "Failed to upload file");
        });

        revalidatePath(path);
        return parseStringify(newFile);
    } catch (error) {
        handleError(error, "Failed to upload file");
    }
}

const createQueries = (currentUser: Models.Document, types: string[], searchText: string, sort: string, limit?: number)=>{
    const queries = [
        Query.or([
            Query.equal("owner", currentUser.$id),
            Query.contains("users", currentUser.email),
        ])
    ];

    if(types.length > 0) queries.push(Query.equal("type", types));
    if(searchText) queries.push(Query.contains("name", searchText));
    if(limit) queries.push(Query.limit(limit));

    if(sort){   
        const [sortBy, orderBy] = sort.split('-')
        
        queries.push(orderBy ===  'asc' ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy));
    }

    return queries;
};

export const getFiles = async ({types = [], searchText = '', sort = '$createdAt-desc', limit}: GetFilesProps)=>{
    const {databases} = await createAdminClient();
    try {
        const currentUser = await getCurrentUser();

        if(!currentUser) throw new Error('No user found');

        const queries = createQueries(currentUser, types, searchText, sort, limit);
        
        const files = await databases.listDocuments(
            appWriteConfig.databaseId,
            appWriteConfig.filesCollectionId,
            queries
        );

        return parseStringify({files});
    } catch (error) {
        handleError(error, "Failed to get files");
    }
};

export const renameFile = async ({fileId, name, extension, path}: RenameFileProps)=>{
    const {databases} = await createAdminClient();

    try {
        const newName = `${name}.${extension}`;
        const updatedFile = await databases.updateDocument(
            appWriteConfig.databaseId,
            appWriteConfig.filesCollectionId,
            fileId,
            {name: newName}
        );

        revalidatePath(path);
        return parseStringify(updatedFile);
    } catch (error) {
        handleError(error, "Failed to rename file");
    }
}

export const updateFileUsers = async ({fileId, emails, path}: UpdateFileUsersProps)=>{
    const {databases} = await createAdminClient();

    try {
        const updatedFile = await databases.updateDocument(
            appWriteConfig.databaseId,
            appWriteConfig.filesCollectionId,
            fileId,
            {users: emails}
        );

        revalidatePath(path);
        return parseStringify(updatedFile);
    } catch (error) {
        handleError(error, "Failed to update users");
    }
}

export const deleteFile = async ({fileId, bucketFileId, path}: DeleteFileProps)=>{
    const {databases,storage} = await createAdminClient();

    try {
        const deletedFile = await databases.deleteDocument(
            appWriteConfig.databaseId,
            appWriteConfig.filesCollectionId,
            fileId,
        );

        if(deletedFile){
            await storage.deleteFile(
                appWriteConfig.bucketId,
                bucketFileId
            )
        }

        revalidatePath(path);
        return parseStringify({staus: "success"});
    } catch (error) {
        handleError(error, "Failed to update users");
    }
}