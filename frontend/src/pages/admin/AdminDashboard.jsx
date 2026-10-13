import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, CheckCircle2 } from '../../components/icons';
import { adminAnalyticsService } from '../../services/adminServices';
import styles from './AdminDashboard.module.css';
import { formatPKR } from '../../utils/currency';
import { useAuthStore } from '../../context/authStore';

const GOLD = '#c7b58a';
const PIE_COLORS = ['#c7b58a', '#a9966a', '#6e7178', '#9b9da3', '#4a4d53'];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const user = useAuthStore((s) => s.user);
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    adminAnalyticsService.overview().then(({ stats }) => setStats(stats)).catch(() => {});
    adminAnalyticsService.charts().then(({ charts }) => setCharts(charts)).catch(() => {});
  }, []);

  const statCards = stats && [
    { label: 'Revenue', value: `${formatPKR(Number(stats.revenue))}`, icon: DollarSign },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart },
    { label: 'Customers', value: stats.users, icon: Users },
    { label: 'Products', value: stats.products, icon: Package },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: AlertTriangle },
    { label: 'Delivered', value: stats.deliveredOrders, icon: CheckCircle2 },
  ];

  return (
    <div>
      <div className={styles.greeting}>
        <h1 className={styles.title}>{getGreeting()}, {user?.full_name?.split(' ')[0] || 'Admin'}.</h1>
        <span className={styles.date}>{today}</span>
      </div>

      <div className={styles.statsGrid}>
        {statCards ? statCards.map((s) => (
          <div key={s.label} className={styles.stat}>
            <s.icon size={18} strokeWidth={1.5} className={styles.statIcon} />
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        )) : Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.stat}>
            <div className="skeleton" style={{ width: 18, height: 18, borderRadius: 4, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 20, width: '55%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 10, width: '70%' }} />
          </div>
        ))}
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Revenue (12 months)</h3>
          {charts ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={charts.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="skeleton" style={{ height: 240 }} />}
        </div>

        <div className={styles.chartCard}>
          <h3>Orders by Status</h3>
          {charts ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={charts.ordersByStatus} dataKey="count" nameKey="status" innerRadius={50} outerRadius={85}>
                  {charts.ordersByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="skeleton" style={{ height: 240 }} />}
        </div>

        <div className={styles.chartCard}>
          <h3>Sales by Category</h3>
          {charts ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts.salesByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: 12 }} />
                <Bar dataKey="revenue" fill={GOLD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="skeleton" style={{ height: 240 }} />}
        </div>

        <div className={styles.chartCard}>
          <h3>Top Products</h3>
          {charts ? (
            <div className={styles.topProducts}>
              {charts.topProducts.map((p, i) => (
                <div key={p.name} className={styles.topProduct}>
                  <span className={styles.rank}>{i + 1}</span>
                  <span className={styles.topName}>{p.name}</span>
                  <span className={styles.topUnits}>{p.units_sold} sold</span>
                  <span className={styles.topRevenue}>{formatPKR(Number(p.revenue))}</span>
                </div>
              ))}
            </div>
          ) : <div className="skeleton" style={{ height: 240 }} />}
        </div>
      </div>
    </div>
  );
}
