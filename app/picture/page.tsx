'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast, Toaster } from 'react-hot-toast';
import { Copy, CopyCheck, ImageUp, LucideProps } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { cn } from '~/lib/utils';
import { useSession } from 'next-auth/react';

interface UploadResult {
  url: string;
  size: number;
  fileName: string;
}

interface CopyStatus {
  mdCopy?: boolean;
  linkCopy?: boolean;
}

type ImageList = (UploadResult & CopyStatus)[];

export default function UploadPage() {
  const [imgList, setImgList] = useState<ImageList>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { status } = useSession();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (status !== 'authenticated') return toast.error('请登录后使用');

      const file = acceptedFiles[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      setIsUploading(true);

      const promise = async () => {
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) throw new Error(await response.text());

          const res: Promise<R<UploadResult>> = await response.json();
          return res;
        } catch (error) {
          throw new Error((error as Error).message);
        } finally {
          setIsUploading(false);
        }
      };

      toast.promise(promise(), {
        loading: '上传中...',
        success: (res) => {
          setImgList((prev) =>
            [...prev].concat([{ ...res.data, mdCopy: false, linkCopy: false }] as ImageList),
          );
          return <div className="line-clamp-2">{`${res.data?.fileName || ''}上传成功！`}</div>;
        },
        error: (res) => res.message,
      });
    },
    [status],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const checkCopyStatus = useCallback((copy?: boolean, props: LucideProps = {}) => {
    const { className, ...restProps } = props;
    return copy ? (
      <CopyCheck
        className={cn('pointer-events-none h-4 w-4 cursor-pointer text-blue-400', className)}
        {...restProps}
      />
    ) : (
      <Copy className={cn('h-4 w-4 cursor-pointer text-blue-400', className)} {...restProps} />
    );
  }, []);

  const onCopy = (field: 'mdCopy' | 'linkCopy', index: number) => {
    setImgList((prev) => {
      const newList = [...prev];
      newList[index][field] = true;
      return newList;
    });

    setTimeout(() => {
      setImgList((prev) => {
        const newList = [...prev];
        newList[index][field] = false;
        return newList;
      });
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem-1px)] bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Toaster />
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-center text-3xl font-bold">图片上传</h1>

        <div
          {...getRootProps()}
          className={clsx(
            'cursor-pointer rounded-2xl border-4 border-dashed p-8 text-center transition-colors duration-300',
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500',
            isUploading && 'pointer-events-none opacity-50',
          )}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            <ImageUp className="m-auto h-8 w-8 text-gray-400 dark:text-gray-500" />

            <div className="space-y-1">
              <p className="text-xl text-gray-600 transition-colors duration-300 dark:text-gray-300">
                {isDragActive ? '释放文件开始上传' : '拖放文件到这里，或点击选择'}
              </p>
              <p className="text-sm text-gray-500 transition-colors duration-300 dark:text-gray-400">
                支持 JPEG, PNG, GIF, WEBP (最大 10MB)
              </p>
            </div>

            {isUploading && (
              <div className="pt-4">
                <div className="h-2 animate-pulse overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="animate-scale-x h-full w-full origin-left bg-blue-500 dark:bg-blue-400" />
                </div>
                <p className="mt-2 text-sm text-gray-500 duration-300 dark:text-gray-400">
                  正在上传...
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 max-h-96 overflow-y-auto">
          {imgList.map((item, index) => (
            <div
              key={item.url}
              className="flex w-full items-center rounded border border-gray-300 p-1 dark:border-gray-600"
            >
              <Image
                src={item.url}
                width={0}
                height={0}
                alt={item.fileName}
                className="h-12 w-12"
                unoptimized
              />
              <div className="ml-2 flex flex-col gap-[2px] text-[12px] text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <span>{`[image](${item.url})`}</span>
                  <CopyToClipboard
                    text={`[image](${item.url})`}
                    onCopy={() => onCopy('mdCopy', index)}
                  >
                    {checkCopyStatus(item.mdCopy)}
                  </CopyToClipboard>
                </div>
                <div className="flex items-center gap-1">
                  <span>{item.url}</span>
                  <CopyToClipboard
                    text={`[image](${item.url})`}
                    onCopy={() => onCopy('linkCopy', index)}
                  >
                    {checkCopyStatus(item.linkCopy)}
                  </CopyToClipboard>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
