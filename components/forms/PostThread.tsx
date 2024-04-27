"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { ThreadValidation } from "@/lib/validations/thread";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import Image from "next/image";
import { Input } from "../ui/input";
import { useUploadThing } from "@/lib/uploadthing";
import { ChangeEvent, useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { createThread } from "@/lib/actions/thread.actions";


interface Props {
    userId: string;
}

function PostThread({ userId }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    console.log(userId);

    const { organization } = useOrganization();

    const [files, setFiles] = useState<File[]>([]);
    const { startUpload } = useUploadThing("media");

    const handleImage = (
        e: ChangeEvent<HTMLInputElement>,
        fieldChange: (value: string[]) => void
    ) => {
        e.preventDefault();

        const fileReader = new FileReader();
        const uploadedImages: string[] = []; 

        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files); 
            setFiles(files);

            files.forEach((file) => {
                if (!file.type.includes("image")) return;

                const reader = new FileReader();

                reader.onload = async (event) => {
                    const imageDataUrl = event.target?.result?.toString() || "";
                    uploadedImages.push(imageDataUrl); 
                    if (uploadedImages.length === files.length) {
                        fieldChange(uploadedImages);
                    }
                };

                reader.readAsDataURL(file);
            });
        }
    };

    console.log(files);

    


    const form = useForm<z.infer<typeof ThreadValidation>>({
        resolver: zodResolver(ThreadValidation),
        defaultValues: {
            thread: "",
            media: [],
            accountId: userId,
        },
    })

    const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
        const blob = values.media;

        const hasImageChanged = Array.isArray(blob) && blob.length > 0;
        if (hasImageChanged) {
            const imgRes = await startUpload(files);

            if (imgRes && imgRes.length > 0) {
                // values.media[] = imgRes.map((img) => img.url);
                values.media = imgRes.map((img) => img.url);
            }
        }

        await createThread({
            text: values.thread,
            media: values.media || [],
            author: userId,
            communityId: organization ? organization.id : null,
            path: pathname,
        });

        router.push("/");
    }


    return (
        <Form {...form}>
            <form className="mt-10 flex flex-col justify-start gap-10"
                onSubmit={form.handleSubmit(onSubmit)}>

                <FormField
                    control={form.control}
                    name="thread"
                    render={({ field }) => (
                        <FormItem className='flex w-full flex-col gap-3'>
                            <FormLabel className='text-base-semibold text-light-2'>
                                Content
                            </FormLabel>
                            <FormControl className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                                <Textarea rows={15} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="media"
                    render={({ field }) => (
                        <FormItem className='flex w-full flex-col gap-4'>
                            <FormLabel className='text-base-semibold text-light-2'>
                                Media
                            </FormLabel>
                            <FormControl className='flex-1 text-base-semibold text-gray-200'>
                                <Input
                                    multiple
                                    type='file'
                                    accept='image/*'
                                    placeholder='Add profile photo'
                                    className='account-form_image-input'
                                    onChange={(e) => handleImage(e, field.onChange)}
                                />
                            </FormControl>

                            <Carousel className="w-full">
                                <CarouselContent className="-ml-1">
                                    {Array.isArray(field.value) && field.value.length > 0 ? (
                                        field.value.map((imageUrl: any, index: number) => (
                                            <CarouselItem key={index} className="pl-2 md:basis-1/2 lg:basis-1/3">
                                                <div key={index} className="relative w-full h-48">
                                                    <Image
                                                        src={imageUrl}
                                                        alt={`image_${index}`}
                                                        width={196}
                                                        height={196}
                                                        priority
                                                        className="rounded-sm object-cover w-full h-full"
                                                    />
                                                    {/* <button
                                                        className="absolute top-1 right-2 bg-red-400 rounded-full shadow-md h-6 w-6 text-center text-white justify-center"
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        X
                                                    </button> */}
                                                </div>
                                            </CarouselItem>
                                        ))
                                    ) : (
                                        <Image
                                            src="/assets/profile.svg"
                                            alt="profile_icon"
                                            width={24}
                                            height={24}
                                            className="object-contain"
                                        />
                                    )}
                                </CarouselContent>
                            </Carousel>

                            <FormMessage />

                        </FormItem>
                    )}
                />


                <Button type='submit' className='bg-primary-500'>
                    Post Thread
                </Button>
            </form>
        </Form>
    )

}


export default PostThread;