"use server"

import { Account, Avatars, Client, Databases, Storage } from "node-appwrite"
import { appWriteConfig } from "./config"
import { cookies } from "next/headers";

export const createSessionClient = async () => {
    const client = new Client()
    .setEndpoint(appWriteConfig.endpointUrl)
    .setProject(appWriteConfig.projectId);

    const session = (await cookies()).get('apprite-session');

    if(!session || !session.value) throw new Error('No Session');

    client.setSession(session.value);

    return {
        get account(){
            return new Account(client);
        },
        get databases(){
            return new Databases(client);
        }
    }
}

export const createAdminClient = async () => {
    const client = new Client()
    .setEndpoint(appWriteConfig.endpointUrl)
    .setProject(appWriteConfig.projectId)
    .setKey(appWriteConfig.secretKey);
 
    return {
        get account(){
            return new Account(client);
        },
        get databases(){
            return new Databases(client);
        },
        get storage(){
            return new Storage(client);
        },
        get avatars(){
            return new Avatars(client);
        }
    }
}