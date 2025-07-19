import { useCallback, useEffect, useState } from "react";
import { baseControlClasses, DEFAULT_TASK, priorityStyles } from "../dummy";
import {
  AlignLeft,
  Calendar,
  Calendar1,
  Check,
  CheckCircle,
  Flag,
  PlusCircle,
  Save,
  X,
} from "lucide-react";

const API_BASE = "https://codealpha-project-management-tool-backend.onrender.com/api/tasks";

const TaskModel = ({ isOpen, onClose, taskToEdit, onSave, onLogout }) => {
  const [taskData, setTaskData] = useState(DEFAULT_TASK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isOpen) return;
    if (taskToEdit) {
      const normalized =
        taskToEdit.completed === "Yes" || taskToEdit.completed === true
          ? "Yes"
          : "No";
      setTaskData({
        ...DEFAULT_TASK,
        title: taskToEdit.title || "",
        description: taskToEdit.description || "",
        priority: taskToEdit.priority || "",
        dueDate: taskToEdit.dueDate?.split("T")[0] || "",
        completed: normalized,
        id: taskToEdit._id || "",
      });
    } else {
      setTaskData(DEFAULT_TASK);
    }
    setError(null);
  }, [isOpen, taskToEdit]);

  const handelChange = useCallback(async (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token Found");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const handelSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (taskData.dueDate < today) {
        setError("Due date cannot be in the past");
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const isEdit = Boolean(taskData.id);
        const url = isEdit ? `${API_BASE}/${taskData.id}/gp` : `${API_BASE}/gp`;
        const res = await fetch(url, {
          method: isEdit ? "PUT" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(taskData),
        });
        if (!res.ok) {
          if (res.status === 401) return onLogout?.();
          const err = await res.json();
          throw new Error(err.message || "Failed to save task");
        }
        const saved = await res.json();
        onSave?.(saved);
        onClose();
      } catch (error) {
        console.error(error);
        setError(error.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
    [taskData, today, getHeaders, onLogout, onSave, onClose]
  );

  if(!isOpen) return null;

  return (
   <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
  <div className="bg-base-100 border border-base-300 rounded-xl max-w-md w-full shadow-xl p-6 animate-fadeIn">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold text-base-content flex items-center gap-2">
        {taskData.id ? (
          <Save className="text-primary w-5 h-5" />
        ) : (
          <PlusCircle className="text-primary w-5 h-5" />
        )}
        {taskData.id ? "Edit Task" : "Create Task"}
      </h2>

      <button
        onClick={onClose}
        className="p-2 hover:bg-base-200 rounded-lg text-base-content/70 hover:text-error transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    <form onSubmit={handelSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-error bg-error/10 p-3 rounded-lg border border-error">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-base-content mb-1">
          Task Title
        </label>
        <input
          type="text"
          name="title"
          required
          value={taskData.title}
          onChange={handelChange}
          className="input input-bordered w-full"
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label className="flex items-center gap-1 text-sm font-medium text-base-content mb-1">
          <AlignLeft className="w-4 h-4 text-primary" /> Description
        </label>
        <textarea
          name="description"
          rows="3"
          onChange={handelChange}
          value={taskData.description}
          className="textarea textarea-bordered w-full"
          placeholder="Add details about your task..."
        ></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-base-content mb-1">
            <Flag className="w-4 h-4 text-primary" /> Priority
          </label>
          <select
            name="priority"
            value={taskData.priority}
            onChange={handelChange}
            className={`select select-bordered w-full ${
              priorityStyles[taskData.priority]
            }`}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-base-content mb-1">
            <Calendar1 className="w-4 h-4 text-primary" /> Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            required
            min={today}
            value={taskData.dueDate}
            onChange={handelChange}
            className="input input-bordered w-full"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1 text-sm font-medium text-base-content mb-1">
          <CheckCircle className="w-4 h-4 text-primary" /> Status
        </label>
        <div className="flex gap-4">
          {[
            { val: "Yes", label: "Completed" },
            { val: "No", label: "In Progress" },
          ].map(({ val, label }) => (
            <label key={val} className="flex items-center gap-2 text-sm text-base-content">
              <input
                type="radio"
                name="completed"
                value={val}
                checked={taskData.completed === val}
                onChange={handelChange}
                className="radio radio-primary"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition"
      >
        {loading ? (
          "Saving..."
        ) : taskData.id ? (
          <>
            <Save className="w-4 h-4" /> Update Task
          </>
        ) : (
          <>
            <PlusCircle className="w-4 h-4" /> Create Task
          </>
        )}
      </button>
    </form>
  </div>
</div>

  );
};

export default TaskModel;
