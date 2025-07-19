import { CalendarIcon, Filter, HomeIcon, Plus } from "lucide-react";
import {
  ADD_BUTTON,
  EMPTY_STATE,
  FILTER_LABELS,
  FILTER_OPTIONS,
  FILTER_WRAPPER,
  HEADER,
  ICON_WRAPPER,
  LABEL_CLASS,
  SELECT_CLASSES,
  STAT_CARD,
  STATS,
  STATS_GRID,
  TAB_ACTIVE,
  TAB_BASE,
  TAB_INACTIVE,
  TABS_WRAPPER,
  VALUE_CLASS,
  WRAPPER,
} from "../dummy";
import { useCallback, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import TaskItem from "../components/TaskItem";
import TaskModel from "../components/TaskModel";
import axios from "axios";

const API_BASE = "http://localhost:4000/api/tasks";

const Dashboard = () => {
  const { tasks, refreshTasks } = useOutletContext();
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState("all");

  const stats = useMemo(
    () => ({
      total: tasks.length,
      lowPriority: tasks.filter((t) => t.priority?.toLowerCase() === "low").length,
      mediumPriority: tasks.filter((t) => t.priority?.toLowerCase() === "medium").length,
      highPriority: tasks.filter((t) => t.priority?.toLowerCase() === "high").length,
      completed: tasks.filter(
        (t) =>
          t.completed === true ||
          t.completed === 1 ||
          (typeof t.completed === "string" && t.completed.toLowerCase() === "yes")
      ).length,
    }),
    [tasks]
  );

  const filterTasks = useMemo(() => {
    return tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      switch (filter) {
        case "today":
          return dueDate.toDateString() === today.toDateString();
        case "week":
          return dueDate >= today && dueDate <= nextWeek;
        case "high":
        case "medium":
        case "low":
          return task.priority?.toLowerCase() === filter;
        default:
          return true;
      }
    });
  }, [tasks, filter]);

  const handleTaskSave = useCallback(
    async (taskData) => {
      try {
        if (taskData.id) {
          await axios.put(`${API_BASE}/${taskData.id}/gp`, taskData);
        }
        refreshTasks();
        setShowModal(false);
        setSelectedTask(null);
      } catch (error) {
        console.error("Error saving task:", error);
      }
    },
    [refreshTasks]
  );

  return (
    <div className={`${WRAPPER} p-4 md:p-6 text-base-content`}>
      <div className={`${HEADER} mb-6`}>
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
            <HomeIcon className="text-primary w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className="truncate">Task Overview</span>
          </h1>
          <p className="text-sm text-base-content/70 mt-1 ml-7 truncate">
            Manage your tasks efficiently
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className={ADD_BUTTON}>
          <Plus size={18} />
          Add New Task
        </button>
      </div>

      <div className="space-y-6">
        <div className={`${STATS_GRID} gap-4`}>
          {STATS.map(
            ({
              key,
              label,
              icon: Icon,
              iconColor,
              borderColor = "border-primary/20",
              valueKey,
              textColor,
              gradient,
            }) => (
              <div
                key={key}
                className={`${STAT_CARD} ${borderColor} bg-base-200`}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className={`${ICON_WRAPPER} ${iconColor}`}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`${VALUE_CLASS} ${
                        gradient
                          ? "bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent"
                          : textColor || "text-base-content"
                      }`}
                    >
                      {stats[valueKey]}
                    </p>
                    <p className={LABEL_CLASS}>{label}</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        <div className={FILTER_WRAPPER}>
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="w-5 h-5 text-primary shrink-0" />
            <h2 className="text-gray-800 md:text-lg font-semibold truncate">
              {FILTER_LABELS[filter]}
            </h2>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`${SELECT_CLASSES} bg-base-200 text-base-content`}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>

          <div className={TABS_WRAPPER}>
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`${TAB_BASE} ${
                  filter === opt ? TAB_ACTIVE : TAB_INACTIVE
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent">
          {filterTasks.length === 0 ? (
            <div className={EMPTY_STATE.wrapper}>
              <div className={EMPTY_STATE.iconWrapper}>
                <CalendarIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg text-gray-800 font-semibold mb-2">No Task Found</h3>
              <p className="text-sm text-gray-800 mb-4">
                {filter === "all"
                  ? "Create your first task!"
                  : "No task matches this filter"}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className={EMPTY_STATE.btn}
              >
                Add New Task
              </button>
            </div>
          ) : (
            filterTasks.map((task) => (
              <TaskItem
                key={task._id || task.id}
                task={task}
                onRefresh={refreshTasks}
                showCompleteCheckbox
                onEdit={() => {
                  setSelectedTask(task);
                  setShowModal(true);
                }}
              />
            ))
          )}
        </div>

        <div
          onClick={() => setShowModal(true)}
          className="hidden md:flex items-center justify-center p-4 border-2 border-dashed border-primary/30 rounded-xl hover:border-primary bg-base-200 cursor-pointer transition-colors"
        >
          <Plus className="w-5 h-5 text-primary mr-2" />
          <span className="text-base-content text-cene font-medium">Add New Task</span>
        </div>
      </div>

      <TaskModel
        isOpen={showModal || !!selectedTask}
        onClose={() => {
          setShowModal(false);
          setSelectedTask(null);
        }}
        taskToEdit={selectedTask}
        onSave={handleTaskSave}
      />
    </div>
  );
};

export default Dashboard;
