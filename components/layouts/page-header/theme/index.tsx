'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';

export function ThemeChanger() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div>
      当前主题是： {theme}
      <Button onClick={() => setTheme('light')}>亮色模式</Button>
      <Button onClick={() => setTheme('dark')}>暗色模式</Button>
    </div>
  );
}
