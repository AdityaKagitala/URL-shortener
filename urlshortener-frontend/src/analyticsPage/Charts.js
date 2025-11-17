import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import "./Charts.css";

/* ------------------------------------
   PIE CHART – Platform Distribution
   ------------------------------------ */
export const PlatformPieChart = ({ data }) => {
  const platformCounts = data.reduce((acc, x) => {
    acc[x.platform] = (acc[x.platform] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(platformCounts).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F"];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius={85}
          dataKey="value"
          label
        >
          {pieData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

/* ------------------------------------
   BAR CHART – Device Breakdown
   ------------------------------------ */
export const DeviceBarChart = ({ data }) => {
  const deviceCounts = data.reduce((acc, x) => {
    acc[x.deviceType] = (acc[x.deviceType] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(deviceCounts).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ["#5AC8FA", "#34C759", "#FF9500", "#AF52DE", "#FF3B30"];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={barData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
          {barData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ------------------------------------
   AREA CHART – Engagement Over Time
   ------------------------------------ */
export const EngagementAreaChart = ({ data }) => {
  const clickData = data
    .filter((item) => item.clickedAt)
    .reduce((acc, item) => {
      const date = item.clickedAt.substring(0, 10);
      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing.clicks += 1;
      } else {
        acc.push({ date, clicks: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={clickData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34C759" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="clicks"
          stroke="#34C759"
          fill="url(#colorClicks)"
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};