import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.coerce.number().min(1).max(120).optional(),
  heightCm: z.coerce.number().min(50).max(250).optional(),
  weightKg: z.coerce.number().min(20).max(400).optional(),
  goal: z.enum(["lose_weight", "build_muscle", "improve_endurance", "general_health"]).optional(),
});

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      age: user?.age,
      heightCm: user?.heightCm,
      weightKg: user?.weightKg,
      goal: user?.goal ?? "general_health",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);
  if (!user) return null;

  const onSubmit = (values: z.infer<typeof schema>) => {
    const updatedUser = {
      id: user.id,
      name: values.name ?? user.name ?? "",
      email: values.email ?? user.email ?? "",
      age: values.age,
      heightCm: values.heightCm,
      weightKg: values.weightKg,
      goal: values.goal ?? user.goal,
    };
    setUser(updatedUser);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border bg-card p-6">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal details and fitness goals.</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="heightCm" render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="weightKg" render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="goal" render={({ field }) => (
              <FormItem>
                <FormLabel>Goal</FormLabel>
                <FormControl>
                  <select className="h-10 w-full rounded-md border bg-background px-3" {...field}>
                    <option value="general_health">General health</option>
                    <option value="lose_weight">Lose weight</option>
                    <option value="build_muscle">Build muscle</option>
                    <option value="improve_endurance">Improve endurance</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex gap-3">
              <Button type="submit">Save</Button>
              <Button type="button" variant="secondary" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
              <Button type="button" variant="ghost" onClick={() => { setUser(null); navigate("/login"); }}>Logout</Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">Summary</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Info label="Name" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info label="Age" value={user.age ? String(user.age) : "—"} />
          <Info label="Height" value={user.heightCm ? `${user.heightCm} cm` : "—"} />
          <Info label="Weight" value={user.weightKg ? `${user.weightKg} kg` : "—"} />
          <Info label="Goal" value={user.goal?.replace("_"," ") ?? "general health"} />
        </div>
        <p className="text-xs text-muted-foreground mt-6">This profile is stored locally for demo purposes. Connect a database to persist accounts.</p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium mt-1">{value}</p>
    </div>
  );
}
