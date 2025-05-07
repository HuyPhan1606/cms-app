/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor() {
    const region = process.env.AWS_REGION as string;
    const accessKeyId = process.env.AWS_ACCESS_KEY as string;
    const secretAccessKey = process.env.AWS_SECRET_KEY as string;

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'AWS credentials not properly configured in environment variables',
      );
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  generateUploadUrl = async (fileName: string, fileType: string) => {
    const bucket = process.env.AWS_BUCKET_NAME!;
    const key = `${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300,
    });

    const fileUrl = `https://${bucket}.s3.ap-southeast-1.amazonaws.com/${key}`;
    return { uploadUrl, fileUrl };
  };
}
