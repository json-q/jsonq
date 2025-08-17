"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 pt-24 text-black text-lg dark:text-white">
      <h1 className="text-xl">Oh no, something went wrong... maybe refresh?</h1>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
