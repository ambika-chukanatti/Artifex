"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { v2 as cloudinary } from 'cloudinary'
import User from "../database/models/user.model";
import Image from "../database/models/image.model";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const populateUser = (query: any) => query.populate({
  path: 'author',
  model: User,
  select: '_id firstName lastName clerkId'
})

export async function addImage({ image, userId }: AddImageParams) {
  try {
    await connectToDatabase()

    const author = await User.findById(userId)
    if (!author) throw new Error("User not found")

    const cloudinaryImage = await cloudinary.uploader.upload(image.transformedImage.imageUrl)

    const newImage = await Image.create({
      ...image,
      transformedImage: {
        ...image.transformedImage,
        imageUrl: cloudinaryImage.url,
      },
      author: author._id,
    })

    revalidatePath("/")

    return JSON.parse(JSON.stringify(newImage))
  } catch (error) {
    handleError(error)
  }
}

export async function getImageById(imageId: string) {
  try {
    await connectToDatabase()

    const image = await populateUser(Image.findById(imageId))
    if (!image) throw new Error("Image not found")

    return JSON.parse(JSON.stringify(image))
  } catch (error) {
    handleError(error)
  }
}

export async function getAllImages() {
  try {
    await connectToDatabase()

    const images = await Image.find({})

    return JSON.parse(JSON.stringify(images))
  } catch (error) {
    handleError(error)
  }
}

export async function getUserImages(userId: string) {
  try {
    await connectToDatabase()

    const images = await populateUser(Image.find({ author: userId }))

    return JSON.parse(JSON.stringify(images))
  } catch (error) {
    handleError(error)
  }
}

export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase()

    const deletedImage = await Image.findByIdAndDelete(imageId)
    if (!deletedImage) throw new Error("No image found with the ID")

    revalidatePath("/")

    return JSON.parse(JSON.stringify(deletedImage))
  } catch (error) {
    handleError(error)
  }
}