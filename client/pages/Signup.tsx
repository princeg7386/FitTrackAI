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

const schema = z
  .object({
    name: z.string().min(2, { message: "Enter your name" }),
    email: z.string().email({ message: "Enter a valid email" }),
    password: z.string().min(6, { message: "At least 6 characters" }),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords must match",
    path: ["confirm"],
  });

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      // Create auth user and store name in user_metadata so it can be used later
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { full_name: values.name } },
      });
      if (authError) throw authError;
      const user = authData?.user;
      const session = authData?.session;

      // If a session was created immediately (no email confirmation required), insert the profile now.
      if (user && session) {
        const { error: insertError } = await supabase.from("users").insert([{ id: user.id, name: values.name, email: values.email }]);
        if (insertError) throw insertError;

        // Update local auth context
        setUser({ id: user.id, name: values.name, email: values.email });
        toast.success("Account created", { description: `Welcome, ${values.name}` });
        navigate("/profile");
        return;
      }

      // No session (email confirmation likely required). Guide user to confirm and sign in.
      toast.success("Account created — check your email", { description: `A confirmation link was sent to ${values.email}. After confirming, sign in.` });
      navigate("/login");
    } catch (err: any) {
      toast.error("Error creating account", { description: err.message });
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border bg-card p-6 md:p-8">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-muted-foreground text-sm mt-1">Start your AI‑powered fitness journey.</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
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
            <FormField control={form.control} name="confirm" render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full">Create account</Button>
          </form>
        </Form>
        <p className="text-sm text-muted-foreground mt-4">
          Already have an account? <Link to="/login" className="text-primary underline-offset-4 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
