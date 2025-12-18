"use client";

// import Sidebar from "@/components/admin/Sidebar";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-[#f6f8fb] text-[14px] text-gray-700">
      

      {/* MAIN */}
      <main className="flex-1 ml-4 p-6 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Today’s deliveries, bay utilization, tenant performance, and exceptions at a glance.
          </p>
        </div>

        {/* TOP METRICS */}
        <div className="grid grid-cols-3 gap-6">
          <MetricCard
            title="Total Deliveries Today"
            subtitle="Cut-off at 23:59 · Includes all tenants and categories"
          />
          <MetricCard
            title="Total Pull-Out Today"
            subtitle="Monitored exits and returns · Compared with 7-day average"
          />
          <ChampionCard />
        </div>

        {/* BAYS + COMPANIES */}
        <div className="grid grid-cols-2 gap-6">
          <Card title="Busiest Loading Bays Today" subtitle="Ranked A–C · Last 24 hours">
            {/* DB-driven bars */}
            <EmptyState text="Bay activity data will appear here" />
          </Card>

          <Card title="Most Frequent Delivery Companies (Top 5)" subtitle="Includes scheduled and walk-in arrivals">
            {/* DB-driven list */}
            <EmptyState text="Company visit data will appear here" />
          </Card>
        </div>

        {/* TENANTS */}
        <div className="grid grid-cols-2 gap-6">
          <Card title="Top Tenants (All Deliveries)">
            <EmptyState text="Tenant delivery statistics will appear here" />
          </Card>

          <Card title="Top Tenants (Food & Beverage)">
            <EmptyState text="Food & Beverage tenant data will appear here" />
          </Card>
        </div>

        {/* STAFF FLOW + ALERTS */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white border rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold text-lg">Staff Activity Flow</h3>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>● Entries processed</span>
                <span>● Avg handling time</span>
              </div>
            </div>

            {/* Chart placeholder */}
            <div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg text-gray-400">
              Staff activity chart will be rendered here
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-semibold text-lg mb-2">Alerts & Exceptions</h3>

            {/* Static alert titles – data later from DB */}
            <AlertItem title="High queue length at loading bay" />
            <AlertItem title="Unmatched pull-out record" />
            <AlertItem title="High pull-out ratio for F&B" />
          </div>
        </div>

      </main>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function MetricCard({ title, subtitle }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        {/* % change comes from DB later */}
        <span className="text-sm text-gray-400">vs yesterday</span>
      </div>

      {/* DB value */}
      <div className="text-3xl font-bold text-gray-300 mt-3">
        —
      </div>

      <p className="text-sm text-gray-400 mt-2">{subtitle}</p>
    </div>
  );
}

function ChampionCard() {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold text-lg">Data Entry Champion</h3>
        <span className="text-sm text-gray-400">Updated every 15 minutes</span>
      </div>

      {/* Static layout, dynamic data later */}
      <div className="mt-4 space-y-2">
        <p className="text-gray-400">Top contributor will appear here</p>
        <div className="h-10 bg-gray-100 rounded-md" />
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        {subtitle && <span className="text-sm text-gray-400">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="h-[120px] flex items-center justify-center text-gray-400 text-sm border border-dashed rounded-lg">
      {text}
    </div>
  );
}

function AlertItem({ title }) {
  return (
    <div className="bg-green-50 rounded-md p-3 mb-3">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-gray-500 mt-1">
        Real-time alert data will be populated from system logs
      </p>
    </div>
  );
}
