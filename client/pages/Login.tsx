import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, { message: "At least 6 characters" }),
});

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const onSubmit = (values: z.infer<typeof schema>) => {
    (async () => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
        if (error) throw error;
        const user = data.user;
        if (!user) throw new Error('No user returned from Supabase');

        // Fetch or create profile row
        const { data: profiles } = await supabase.from('users').select('*').eq('id', user.id).limit(1);
        let profile = profiles && profiles[0];
        if (!profile) {
          const { data: inserted } = await supabase.from('users').insert([{ id: user.id, name: user.user_metadata?.full_name || 'User', email: user.email }]).select();
          profile = inserted?.[0];
        }

        // Update app auth context
        setUser({ id: user.id, name: profile?.name || user.user_metadata?.full_name || 'User', email: user.email || values.email });
        toast.success('Signed in', { description: `Welcome back, ${profile?.name || user.user_metadata?.full_name || 'User'}` });
        navigate('/profile');
      } catch (err: any) {
        toast.error('Sign in failed', { description: err?.message || String(err) });
      }
    })();
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border bg-card p-6 md:p-8">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-muted-foreground text-sm mt-1">Access your AI‑powered fitness dashboard.</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </Form>
        <p className="text-sm text-muted-foreground mt-4">Don't have an account? <Link to="/signup" className="text-primary underline-offset-4 hover:underline">Sign up</Link></p>
      </div>
    </div>
  );
}
