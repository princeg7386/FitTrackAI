import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Heart, Footprints, Flame, Moon, Watch, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { generateRecommendations } from "@/lib/ai";

type Workout = {
  id: number;
  user_id: string; // Supabase usually stores UUID as string
  steps: number;
  hr: number;
  calories: number;
  sleep: number; // in minutes
  created_at: string;
};

type Point = {
  label: string;
  steps: number;
  hr: number;
  calories: number;
  sleep: number;
};

export default function Dashboard() {
  const [data, setData] = useState<Point[]>([]);
  const [userId, setUserId] = useState<string | null>(null); // current logged-in user
  const hydration = 72;

  // Get logged-in user from Supabase Auth
  useEffect(() => {
    const fetchUser = async () => {
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  // Fetch workouts
  const fetchWorkouts = async () => {
    if (!userId) return;
    const { data: workouts, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return;
    }

    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekData: Point[] = labels.map((label, idx) => {
      const w = workouts?.[idx];
      return {
        label,
        steps: w?.steps || 0,
        hr: w?.hr || 0,
        calories: w?.calories || 0,
        sleep: w?.sleep || 0,
      };
    });
    setData(weekData);
  };

  // Fetch whenever userId changes
  useEffect(() => {
    if (userId) fetchWorkouts();
  }, [userId]);

  const avgHr = useMemo(() => Math.round(data.reduce((a, b) => a + b.hr, 0) / (data.length || 1)), [data]);
  const totalSteps = useMemo(() => data.reduce((a, b) => a + b.steps, 0), [data]);
  const avgSleep = useMemo(() => Math.round(data.reduce((a, b) => a + b.sleep, 0) / (data.length || 1)), [data]);
  const avgCalories = useMemo(() => Math.round(data.reduce((a, b) => a + b.calories, 0) / (data.length || 1)), [data]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Your Health Dashboard</h1>
          <p className="text-muted-foreground mt-1">Insights powered by AI: activity, heart rate, sleep, hydration.</p>
        </div>
        <Button variant="secondary" className="shrink-0"><Watch className="mr-2" /> Connect Wearable</Button>
      </div>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Footprints className="text-brand" />} label="Weekly Steps" value={Intl.NumberFormat().format(totalSteps)} sub="Goal 70k" />
        <StatCard icon={<Heart className="text-brand3" />} label="Avg Heart Rate" value={`${avgHr} bpm`} sub="Resting 58 bpm" />
        <StatCard icon={<Flame className="text-brand2" />} label="Calories / day" value={`${avgCalories} kcal`} sub="Target 2300 kcal" />
        <StatCard icon={<Moon className="text-accent" />} label="Avg Sleep" value={`${Math.floor(avgSleep / 60)}h ${avgSleep % 60}m`} sub="7–9h recommended" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-2">Steps (7 days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: 8, right: 8 }}>
                <defs>
                  <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--brand))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ReTooltip cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: 4 }} />
                <Area type="monotone" dataKey="steps" stroke="hsl(var(--brand))" fillOpacity={1} fill="url(#stepsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-2">Hydration</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="75%" outerRadius="100%" data={[{ name: "Hydration", value: hydration }]} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={8} fill="hsl(var(--brand-3))" />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-muted-foreground -mt-10 text-center">{hydration}% of daily goal</p>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><Brain className="text-brand" /> AI Coach Recommendations</h3>
          <Button variant="secondary" onClick={fetchWorkouts}>Refresh data</Button>
        </div>
        <AIPanel steps={totalSteps / 7} avgHr={avgHr} avgSleep={avgSleep} avgCalories={avgCalories} />
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </div>
      <div className="size-10 grid place-items-center rounded-lg bg-gradient-to-br from-brand to-brand3 text-white">
        {icon}
      </div>
    </div>
  );
}

function AIPanel({ steps, avgHr, avgSleep, avgCalories }: { steps: number; avgHr: number; avgSleep: number; avgCalories: number }) {
  const rec = generateRecommendations(
    { steps: Math.round(steps), avgHeartRate: avgHr, sleepMinutes: avgSleep, calories: avgCalories },
    { goal: "general_health" }
  );
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border p-4">
        <h4 className="font-semibold">Workouts</h4>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
          {rec.workouts.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>
      <div className="rounded-lg border p-4">
        <h4 className="font-semibold">Diet</h4>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
          {rec.diet.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </div>
      <div className="rounded-lg border p-4">
        <h4 className="font-semibold">Notes</h4>
        <p className="text-sm text-muted-foreground mt-2">Hydration target: <span className="font-medium text-foreground">{rec.hydrationLiters} L/day</span></p>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
          {rec.reasoning.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">Confidence: {(rec.confidence * 100).toFixed(0)}%</p>
      </div>
    </div>
  );
}
