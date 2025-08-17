"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

interface ErrorResultProps {
  status: "404" | "500";
  back?: "prev" | "home";
}

const TipEnum = {
  404: {
    title: "页面未找到",
    tip: "您访问的页面可能已被移动或删除,请检查您的网址或返回首页。",
  },
  500: {
    title: "服务出错",
    tip: "服务器出错，请稍后再试。",
  },
};

export default function ErrorResult(props: ErrorResultProps) {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="p-4">
          <div className="font-bold text-6xl">{props.status}</div>
        </div>

        <h1 className="mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
          {TipEnum[props.status].title}
        </h1>

        <p className="mt-4 mb-6 text-muted-foreground text-sm">{TipEnum[props.status].tip}</p>

        {props.back === "prev" ? (
          <Button variant="secondary" onClick={router.back}>
            返回上一页
          </Button>
        ) : (
          <Button>
            <Link href="/">返回首页</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
