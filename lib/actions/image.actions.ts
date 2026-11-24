"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const populateUser = (query: any) =>
  query.populate({
    path: "author",
    model: User,
    select: "_id firstName lastName clerkId",
  });

async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  await connectToDatabase();

  const user = await User.findOne({ clerkId });
  if (!user) throw new Error("User not found");

  return user;
}

export async function addImage({ image, userId }: AddImageParams) {
  try {
    const author = await getCurrentUser();

    if (author._id.toString() !== String(userId)) {
      throw new Error("Forbidden");
    }

    const cloudinaryImage = await cloudinary.uploader.upload(
      image.transformedImage.imageUrl
    );

    const newImage = await Image.create({
      ...image,
      transformedImage: {
        ...image.transformedImage,
        imageUrl: cloudinaryImage.url,
      },
      author: author._id,
    });

    revalidatePath("/");

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
  }
}

export async function getImageById(imageId: string) {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));
    if (!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
  }
}

export async function getAllImages() {
  try {
    await connectToDatabase();

    const images = await Image.find({});

    return JSON.parse(JSON.stringify(images));
  } catch (error) {
    handleError(error);
  }
}

export async function getUserImages(userId: string) {
  try {
    const user = await getCurrentUser();

    if (user._id.toString() !== String(userId)) {
      throw new Error("Forbidden");
    }

    const images = await populateUser(Image.find({ author: user._id }));

    return JSON.parse(JSON.stringify(images));
  } catch (error) {
    handleError(error);
  }
}

export async function deleteImage(imageId: string) {
  try {
    const user = await getCurrentUser();

    const image = await Image.findById(imageId);
    if (!image) throw new Error("No image found with the ID");

    if (image.author.toString() !== user._id.toString()) {
      throw new Error("Forbidden");
    }

    const deletedImage = await Image.findByIdAndDelete(imageId);

    revalidatePath("/");

    return JSON.parse(JSON.stringify(deletedImage));
  } catch (error) {
    handleError(error);
  }
}