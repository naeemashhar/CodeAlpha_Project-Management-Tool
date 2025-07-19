import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { Circle, Clock, TrendingUp, Zap } from "lucide-react";

const Layout = ({ onLogout, user }) => {
  const [task, setTask] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const { data } = await axios.get("http://localhost:4000/api/tasks/gp", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.task)
        ? data.task
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setTask(arr);
    } catch (error) {
      setError(error.message || "Could not load task");
      if (error.response?.status === 401) onLogout();
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stats = useMemo(() => {
    const completedTasks = task.filter(
      (t) =>
        t.completed === true ||
        t.completed === 1 ||
        (typeof t.completed === "string" && t.completed.toLowerCase() === "yes")
    ).length;

    const totalCount = task.length;
    const pendingCount = totalCount - completedTasks;
    const completionPercentage = totalCount
      ? Math.round((completedTasks / totalCount) * 100)
      : 0;

    return {
      totalCount,
      completedTasks,
      pendingCount,
      completionPercentage,
    };
  }, [task]);

  const StatCard = ({ title, value, icon }) => (
    <div className="p-2 rounded-xl">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 bg-clip-text text-transparent">
            {value}
          </p>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="bg-red-100 text-red-600 p-4 rounded-xl border border-red-200 max-w-md">
          <p className="font-medium mb-2">Error Loading Tasks.</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchTasks}
            className="mt-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      {/* Top Navbar */}
      <Navbar user={user} onLogout={onLogout} />

      {/* Layout Container */}
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* Sidebar (Hidden on mobile) */}
        <div className="lg:block w-full lg:w-64 bg-base-100 shadow-lg border-r border-base-content/10">
          <Sidebar user={user} tasks={task} />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 pt-20 pb-20 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            {/* Outlet for page content */}
            <div className="space-y-4">
              <Outlet context={{ tasks: task, refreshTasks: fetchTasks }} />
            </div>

            {/* Stats Section */}
            <div className="space-y-4">
              <div className="rounded-xl p-4 shadow-sm border border-purple-100">
                <h3 className="text-base font-semibold mb-3 text-gray-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  Task Statistics
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <StatCard
                    title="Total Tasks"
                    value={stats.totalCount}
                    icon={<Circle className="w-3.5 h-3.5 text-purple-500" />}
                  />
                  <StatCard
                    title="Completed"
                    value={stats.completedTasks}
                    icon={<Circle className="w-3.5 h-3.5 text-green-500" />}
                  />
                  <StatCard
                    title="Pending"
                    value={stats.pendingCount}
                    icon={<Circle className="w-3.5 h-3.5 text-fuchsia-500" />}
                  />
                  <StatCard
                    title="Completion Rate"
                    value={`${stats.completionPercentage}%`}
                    icon={<Zap className="w-3.5 h-3.5 text-purple-500" />}
                  />
                </div>

                <hr className="my-3 border-purple-100" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-xs font-medium flex items-center gap-1.5">
                      <Circle className="w-2.5 h-2.5 text-purple-500 fill-purple-500" />
                      Task Progress
                    </span>
                    <span className="text-xs text-purple-700 px-1.5 py-0.5 rounded-full">
                      {stats.completedTasks}/{stats.totalCount}
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex gap-1.5 items-center">
                      <div className="flex-1 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${stats.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-xl p-4 shadow-sm border border-purple-200">
                <h3 className="text-base font-semibold mb-3 text-gray-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  Recent Activity
                </h3>
                <div className="space-y-2">
                  {task.slice(0, 3).map((task) => (
                    <div
                      key={task._id || task.id}
                      className="flex items-center justify-between p-2 hover:bg-purple-500/50 rounded-lg transition-colors duration-200 border border-transparent hover:border-purple-800"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-300 break-words whitespace-normal">
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {task.createdAt
                            ? new Date(task.createdAt).toLocaleDateString()
                            : "No date"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full shrink-0 ml-2 ${
                          task.completed
                            ? "bg-green-100 text-green-700"
                            : "bg-fuchsia-100 text-fuchsia-700"
                        }`}
                      >
                        {task.completed ? "Done" : "Pending"}
                      </span>
                    </div>
                  ))}

                  {task.length === 0 && (
                    <div className="text-center py-4 px-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-purple-500" />
                      </div>
                      <p className="text-sm text-gray-400">No Recent Activity</p>
                      <p className="text-xs text-gray-400 mt-1">Tasks will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
    </div>
  );
};

export default Layout;
