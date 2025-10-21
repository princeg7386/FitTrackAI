import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Flame, Heart, Moon, Droplets, Shield, Share2, BellRing, Watch } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
} from "recharts";

function useLiveStats() {
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [hr, setHr] = useState(72);
  const [sleep, setSleep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSteps((s) => s + Math.round(Math.random() * 20));
      setCalories((c) => c + Math.random() * 0.8);
      setHr(60 + Math.round(Math.random() * 40));
      setSleep((sl) => (sl < 480 ? sl + Math.round(Math.random() * 3) : sl));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return { steps, calories: Math.round(calories), hr, sleep };
}

function generatePreview() {
  const labels = Array.from({ length: 14 }).map((_, i) => `${i + 1}`);
  return labels.map((label) => ({ label, steps: Math.round(4000 + Math.random() * 7000) }));
}

export default function Index() {
  const { steps, calories, hr, sleep } = useLiveStats();
  const preview = useMemo(() => generatePreview(), []);

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-background to-background/60 p-8 md:p-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--brand-3)/0.16),transparent_60%),radial-gradient(40%_40%_at_100%_0%,hsl(var(--brand-2)/0.25),transparent_70%)]" />
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-full bg-accent/20 text-accent-foreground ring-1 ring-accent/30 mb-4">
            <Watch className="size-3.5" /> AI Integrated Fitness Track
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Smarter fitness with <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand via-brand2 to-brand3">AI‑driven</span> insights
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Real-time data from wearables and sensors. Personalized workouts and diet recommendations. Visual progress, reminders, and social motivation — all in one place.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg">
              <Link to="/dashboard">Get Started</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <a href="#features">Explore Features</a>
            </Button>
          </div>
        </div>

        {/* Live stats */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LiveStat icon={<Activity />} label="Steps" value={Intl.NumberFormat().format(steps)} suffix="today" />
          <LiveStat icon={<Flame />} label="Calories" value={`${calories}`} suffix="kcal" />
          <LiveStat icon={<Heart />} label="Heart rate" value={`${hr}`} suffix="bpm" />
          <LiveStat icon={<Moon />} label="Sleep" value={`${Math.floor(sleep/60)}h ${sleep%60}m`} suffix="/ 8h" />
        </div>

        {/* Preview chart */}
        <div className="mt-8 rounded-xl border bg-card/80 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Activity preview</h3>
            <span className="text-xs text-muted-foreground">AI adjusted plan based on your recovery</span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={preview} margin={{ left: 8, right: 8 }}>
                <defs>
                  <linearGradient id="homeSteps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-2))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--brand-2))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ReTooltip />
                <Area type="monotone" dataKey="steps" stroke="hsl(var(--brand-2))" fillOpacity={1} fill="url(#homeSteps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Everything you need to perform</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<Watch />} title="Wearable integration" desc="Connect smartwatches and fitness bands for real‑time steps, calories, heart rate, and sleep." />
          <Feature icon={<Activity />} title="Live activity tracking" desc="Monitor your movement throughout the day with adaptive goals that match your routine." />
          <Feature icon={<Heart />} title="AI recommendations" desc="Personalized workouts and diet plans that evolve with your goals and progress." />
          <Feature icon={<Droplets />} title="Smart reminders" desc="Hydration and workout nudges at the right time, on any device." />
          <Feature icon={<Share2 />} title="Social motivation" desc="Share progress, join challenges, and cheer friends to stay consistent." />
          <Feature icon={<Shield />} title="Security by design" desc="End‑to‑end encryption, fast response times, and a scalable, cross‑platform architecture." />
        </div>
      </section>

      {/* Security & Platform */}
      <section className="rounded-3xl border p-6 md:p-8 bg-card">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-2xl font-bold">Private, fast, and scalable</h3>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li>• Secure storage of user data with encryption</li>
              <li>• Cross‑platform: Android, iOS, and Web</li>
              <li>• Scalable architecture for growing user base</li>
              <li>• Low‑latency AI predictions and recommendations</li>
              <li>• Intuitive, accessible interface</li>
            </ul>
            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
              <Button variant="secondary" asChild>
                <a href="#">Docs</a>
              </Button>
            </div>
          </div>
          <div className="rounded-xl border p-4 bg-gradient-to-br from-brand/5 via-brand2/5 to-brand3/5">
            <div className="grid grid-cols-2 gap-4">
              <DeviceCard name="Apple Watch" connected />
              <DeviceCard name="Fitbit" />
              <DeviceCard name="Garmin" />
              <DeviceCard name="Oura Ring" />
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2"><BellRing className="size-4" /> Reminders enabled for workouts and hydration</p>
          </div>
        </div>
      </section>

      {/* AI pitch */}
      <section className="rounded-3xl border p-6 md:p-8 bg-gradient-to-br from-brand/10 via-brand2/10 to-brand3/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Meet your AI Coach</h3>
            <p className="text-muted-foreground mt-2 max-w-2xl">Get daily workout plans, diet suggestions, and hydration targets tuned to your recovery, sleep, and activity. The coach adapts with you.</p>
          </div>
          <Button asChild>
            <Link to="/dashboard">Generate today’s plan</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function LiveStat({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: string | number; suffix?: string }) {
  return (
    <div className="rounded-xl border bg-card/80 p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value} <span className="text-sm font-normal text-muted-foreground">{suffix}</span></p>
      </div>
      <div className="size-10 grid place-items-center rounded-lg bg-gradient-to-br from-brand to-brand3 text-white">
        {icon}
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border p-5 bg-card">
      <div className="size-10 grid place-items-center rounded-lg bg-gradient-to-br from-brand to-brand3 text-white mb-3">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}

function DeviceCard({ name, connected = false }: { name: string; connected?: boolean }) {
  return (
    <div className="rounded-xl border p-4 bg-background">
      <p className="font-medium">{name}</p>
      <p className={"text-xs mt-1 " + (connected ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>{connected ? "Connected" : "Not connected"}</p>
      <Button variant={connected ? "secondary" : "default"} className="mt-3 w-full" size="sm">
        {connected ? "Manage" : "Connect"}
      </Button>
    </div>
  );
}
