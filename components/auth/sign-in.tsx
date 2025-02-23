'use client';
import { useId, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn, /* signOut, */ useSession } from 'next-auth/react';
import bcrypt from 'bcryptjs';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { useIsMobile } from '~/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';

const formSchema = z.object({
  username: z.string().min(1, { message: '请输入账号' }),
  password: z.string().min(1, { message: '请输入密码' }),
});
export default function SignIn() {
  const formId = useId();
  const { status, data } = useSession();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: 'jsonq',
      password: '',
    },
  });

  if (isMobile) return null;

  if (status === 'authenticated') {
    return (
      <Avatar className="ml-1 h-6 w-6">
        <AvatarImage src={data.user?.image || ''} alt={data.user?.name || ''} />
        <AvatarFallback>{data.user?.name}</AvatarFallback>
      </Avatar>
    );
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const hash = '$2b$10$7H2tTcasdzMoeWj12En4iOU4MIfYGu1.SrZJ1xBTHC5jL0m8aazIW';
    const isMatch = bcrypt.compareSync(values.password, hash);
    if (isMatch) {
      setLoading(true);
      signIn('github');
    } else {
      toast.error('密码不匹配');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-1">Login</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>登录认证</DialogTitle>
          <DialogDescription>Github 认证之前，请先输入密码，验证登陆者身份</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>账号</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入账号" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入密码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          {/* https://github.com/shadcn-ui/ui/discussions/732 */}
          <Button form={formId} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} 认证
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
