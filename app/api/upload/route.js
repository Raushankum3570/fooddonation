// app/api/upload/route.js
import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { data } = await request.json();
    const uploadResponse = await cloudinary.v2.uploader.upload(data, {
      folder: 'food_donations',
    });
    return NextResponse.json({ imageUrl: uploadResponse.secure_url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error uploading image' }, { status: 500 });
  }
}
