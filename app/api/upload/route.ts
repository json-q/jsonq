import { NextRequest, NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import * as Minio from 'minio';
import siteConfig from '~/config/siteConfig';

const minioClient = new Minio.Client({
  accessKey: siteConfig.minio.accessKey,
  secretKey: siteConfig.minio.secretKey,
  endPoint: siteConfig.minio.endPoint,
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file = (formData.get('file') as File) || null;
  if (!file) {
    return NextResponse.json<R>({ code: -1, message: 'File is empty' });
  }
  if (!/^image\/(png|jpg|jpeg|gif)$/.test(file.type)) {
    return NextResponse.json<R>({ code: -1, message: 'Must be image' });
  }

  if (file.size > 1024 * 1024 * 10) {
    return NextResponse.json<R>({ code: -1, message: 'File size too large' });
  }

  const ext = file.name.split('.').pop();
  const filePath = genFilePath() + '.' + ext;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const { minio } = siteConfig;
    await minioClient.putObject(minio.bucket, filePath, buffer, file.size, {
      'Content-Type': file.type,
    });

    return NextResponse.json<R>({
      code: 0,
      data: {
        url: `https://${minio.endPoint}/${minio.bucket}/${filePath}`,
        size: file.size,
        fileName: file.name,
      },
      timestamp: Date.now(),
    });
  } catch (e) {
    console.log('Catch Error', e);
    return NextResponse.json<R>({ code: -1, message: (e as Error).message });
  }
}

export function GET() {
  return NextResponse.json<R>({ code: -1, message: 'Method not allowed' });
}

function genFilePath() {
  const now = new Date();
  const dest = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate();
  const nanoid = customAlphabet('1234567890abcdefghigklmnopqrstuvwxyz', 6);
  const renameFileName = now.getTime() + '-' + nanoid();
  return dest + '/' + renameFileName;
}
