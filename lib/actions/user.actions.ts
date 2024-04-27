"use server"

import { UserProfile } from "@/schema/types";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache";
import Community from "../models/community.models";

export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User.findOne({ id: userId }).populate({
            path: "communities",
            model: Community
        })
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}




export async function updateUser({
    userId,
    bio,
    name,
    path,
    username,
    image,
}: UserProfile): Promise<void> {
    try {
        connectToDB();

        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            { upsert: true }
        );

        if (path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }

}