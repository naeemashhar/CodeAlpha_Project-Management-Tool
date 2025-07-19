import { useEffect, useState } from "react";
import {
  MENU_OPTIONS,
  TI_CLASSES,
  getPriorityBadgeColor,
  getPriorityColor,
} from "../dummy";
import { Calendar, CheckCircle2, Clock, MoreVertical } from "lucide-react";
import axios from "axios";
import { format, isToday } from "date-fns";
import TaskModel from "./TaskModel";

const API_BASE = "https://codealpha-project-management-tool-backend.onrender.com/api/tasks";

const TaskItem = ({
  task,
  onRefresh,
  onLogout,
  showCompletedCheckbox = true,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(
    [true, 1, "yes"].includes(
      typeof task.completed === "string"
        ? task.completed.toLowerCase()
        : task.completed
    )
  );
  const [showEditModel, setShowEditModel] = useState(false);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);

  useEffect(() => {
    setIsCompleted(
      [true, 1, "yes"].includes(
        typeof task.completed === "string"
          ? task.completed.toLowerCase()
          : task.completed
      )
    );
  }, [task.completed]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token Found");
    return { Authorization: `Bearer ${token}` };
  };

  const borderColor = isCompleted
    ? "border-green-500"
    : getPriorityColor(task.priority).split(" ")[0];

  const handleComplete = async () => {
    const newStatus = isCompleted ? "No" : "Yes";
    try {
      await axios.put(
        `${API_BASE}/${task._id}/gp`,
        { completed: newStatus },
        { headers: getAuthHeaders() }
      );
      setIsCompleted(!isCompleted);
      onRefresh?.();
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) onLogout?.();
    }
  };

  const handleAction = (action) => {
    setShowMenu(false);
    if (action === "edit") setShowEditModel(true);
    if (action === "delete") handleDelete();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${task._id}/gp`, {
        headers: getAuthHeaders(),
      });
      onRefresh?.();
    } catch (error) {
      if (error.response?.status === 401) onLogout?.();
    }
  };

  const handleSave = async (updateTask) => {
    try {
      const payload = (({
        title,
        description,
        priority,
        dueDate,
        completed,
      }) => ({ title, description, priority, dueDate, completed }))(updateTask);
      await axios.put(`${API_BASE}/${task._id}/gp`, payload, {
        headers: getAuthHeaders(),
      });
      setShowEditModel(false);
      onRefresh?.();
    } catch (error) {
      if (error.response?.status === 401) onLogout?.();
    }
  };

  const progress = subtasks.length
    ? (subtasks.filter((st) => st.completed).length / subtasks.length) * 100
    : 0;

  return (
    <>
      <div className={`${TI_CLASSES.wrapper} ${borderColor}`}>
        <div className={TI_CLASSES.leftContainer}>
          {showCompletedCheckbox && (
            <button
              onClick={handleComplete}
              className={`${TI_CLASSES.completeBtn} ${
                isCompleted ? "text-green-400" : "text-gray-400"
              }`}
            >
              <CheckCircle2
                size={18}
                className={`${TI_CLASSES.checkboxIconBase} ${
                  isCompleted ? "fill-green-500" : ""
                }`}
              />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <h3
                className={`${TI_CLASSES.titleBase} ${
                  isCompleted ? "text-gray-400 line-through" : "text-gray-800"
                }`}
              >
                {task.title}
              </h3>
              <span
                className={`${TI_CLASSES.priorityBadge} ${getPriorityBadgeColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>

            {task.description && (
              <p className={TI_CLASSES.description}>{task.description}</p>
            )}
          </div>
        </div>

        <div className={TI_CLASSES.rightContainer}>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={TI_CLASSES.menuButton}
            >
              <MoreVertical className="h-4 w-4 sm:w-5 sm:h-5" />
            </button>

            {showMenu && (
              <div className={TI_CLASSES.menuDropdown}>
                {MENU_OPTIONS.map((opt) => (
                  <button
                    key={opt.action}
                    onClick={() => handleAction(opt.action)}
                    className="w-full px-3 sm:px-4 py-2 text-gray-800 text-left text-xs sm:text-sm hover:bg-purple-50 flex items-center gap-2 transition-colors duration-200 "
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div
              className={`${TI_CLASSES.dateRow} ${
                task.dueDate && isToday(new Date(task.dueDate))
                  ? "text-fuchsia-500"
                  : "text-gray-600"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {task.dueDate
                ? isToday(new Date(task.dueDate))
                  ? "Today"
                  : format(new Date(task.dueDate), "MMM dd")
                : "-"}
            </div>

            <div className={TI_CLASSES.createdRow}>
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {task.createdAt
                ? `Created At ${format(new Date(task.createdAt), "MMM dd")}`
                : "No date"}
            </div>
          </div>
        </div>
      </div>

      <TaskModel
        isOpen={showEditModel}
        onClose={() => setShowEditModel(false)}
        taskToEdit={task}
        onSave={handleSave}
      />
    </>
  );
};

export default TaskItem;
