"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import { connectToDB } from "../mongoose";
import Community from "../models/community.models";
import User from "../models/user.model";

interface CreateThread {
    text: string;
    media: Array<string>,
    author: string,
    communityId: string | null,
    path: string,

}


export async function createThread({ text, media, author, communityId, path }: CreateThread) {
    try {
        connectToDB();

        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );



        const createdThread = await Thread.create({
            text,
            media,
            author,
            community: communityIdObject,
        });

        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id },
        });

        if (communityId) {
            await Community.findByIdAndUpdate(communityIdObject, {
                $push: { threads: createdThread._id },
            });
        }

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to create thread: ${error.message}`);
    }

}