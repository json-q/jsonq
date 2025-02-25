import { NextRequest, NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import * as Minio from 'minio';
import siteConfig from '~/config/siteConfig';
import mime from 'mime';
// import { NextApiRequest } from 'next';

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
      'Content-Type': mime.getType(file.name),
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
    console.log('Upload Catch Error', e);
    return NextResponse.json<R>({ code: -1, message: (e as Error).message });
  }
}

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json<R>({ code: -1, message: 'production is not allowed' });
  }

  const url = req.nextUrl.searchParams.get('imgUrl') as string;

  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const size = response.headers.get('content-length');

  const ext = url.split('.').pop();
  const filePath = genFilePath() + '.' + ext;
  const { minio } = siteConfig;
  try {
    await minioClient.putObject(minio.bucket, filePath, buffer, size ? Number(size) : undefined, {
      'Content-Type': mime.getType(url),
    });
    return NextResponse.json<R>({
      code: 0,
      data: `https://${minio.endPoint}/${minio.bucket}/${filePath}`,
      message: 'success',
    });
  } catch (e) {
    console.log('Batch Catch Error', e);
    return NextResponse.json<R>({ code: -1, message: (e as Error).message });
  }
}

function genFilePath() {
  const now = new Date();
  const dest = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate();
  const nanoid = customAlphabet('1234567890abcdefghigklmnopqrstuvwxyz', 8);
  const renameFileName = now.getTime() + '-' + nanoid();
  return dest + '/' + renameFileName;
}
