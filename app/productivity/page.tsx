// app/productivity/page.tsx

'use client';
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '@/lib/api';

// --- START: Data Structures ---
interface Task {
  _id: string;
  text: string;
  done: boolean;
  dueDate?: string; // ISO string
  priority: 'Low' | 'Medium' | 'High';
}

interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  date: string; // ISO string from backend
  type: 'ProjectDeadline' | 'NetworkEvent' | 'Personal';
}

type CalendarEventMap = { [dateKey: string]: string[] };

// --- END: Data Structures ---


// --- START: Static/Local Data and Helper Functions ---
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'] as const;

function getMonthMatrix(month: number, year: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const matrix: (number | null)[][] = [];
  let week: (number | null)[] = [];
  let day = 1;
  let firstDay = new Date(year, month, 1).getDay() === 0 ? 6 : new Date(year, month, 1).getDay() - 1;
  let daysInMonth = last.getDate();
  for (let x = 0; x < firstDay; x++) week.push(null);
  while (day <= daysInMonth) {
    week.push(day);
    if (week.length === 7) { matrix.push(week); week = []; }
    day++;
  }
  while (week.length > 0 && week.length < 7) week.push(null);
  if (week.length > 0) matrix.push(week);
  return matrix;
}

function dayKey(day: number, mon: number, yr: number) {
  return `${yr}-${('0' + (mon + 1)).slice(-2)}-${('0' + day).slice(-2)}`;
}

// Helper to format ISO date string to YYYY-MM-DD for input[type=date]
const formatDateForInput = (isoDate?: string) => {
  return isoDate ? isoDate.substring(0, 10) : '';
}

// --- END: Static/Local Data and Helper Functions ---


// --- Task Item Component (UPDATED) ---
interface TaskItemProps {
  task: Task;
  onToggle: (id: string, done: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Task>) => Promise<void>;
}

const TaskItem = React.memo(({ task, onToggle, onDelete, onUpdate }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editDueDate, setEditDueDate] = useState(formatDateForInput(task.dueDate));
  const [editPriority, setEditPriority] = useState(task.priority);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Sync local state when external task prop changes (e.g., after a successful update/sort)
  useEffect(() => {
    setEditText(task.text);
    setEditDueDate(formatDateForInput(task.dueDate));
    setEditPriority(task.priority);
    setIsEditing(false);
  }, [task.text, task.dueDate, task.priority, task.done]);

  const handleUpdate = async () => {
    if (!editText.trim()) return;

    setUpdateLoading(true);
    const updates: Partial<Task> = {
      text: editText.trim(),
      dueDate: editDueDate || undefined,
      priority: editPriority,
    };

    try {
      await onUpdate(task._id, updates);
      // State will be synced via useEffect after fetchTasks() runs
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const priorityClass = task.priority === 'High' ? 'text-red-400 font-bold' :
    task.priority === 'Medium' ? 'text-yellow-400' : 'text-gray-400';

  const dueDateText = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB') : 'No Deadline';
  const isOverdue = task.dueDate && !task.done && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className="flex flex-col gap-1 mb-2 group">
      <div className="flex items-center gap-3">
        <button
          className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 ${task.done ? 'border-[#66e36a] bg-[#19171c]' : 'border-gray-400 bg-[#19171c]'}`}
          onClick={() => onToggle(task._id, task.done)}
          disabled={updateLoading}
        >
          {task.done && <span className="text-[#66e36a] text-lg">✔️</span>}
        </button>

        {isEditing ? (
          <input
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={handleUpdate}
            onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); }}
            className="flex-1 px-2 py-1 rounded bg-[#29253b] text-white focus:outline-purple-500"
            disabled={updateLoading}
          />
        ) : (
          <span
            className={`flex-1 text-base transition-all cursor-pointer ${task.done ? 'line-through text-gray-500' : 'text-white'}`}
            onClick={() => setIsEditing(true)}
          >
            {task.text}
          </span>
        )}

        <button className="opacity-0 group-hover:opacity-100 text-[#b773f8] hover:text-white rounded p-1 transition"
          onClick={() => setIsEditing(true)}
          disabled={updateLoading}
        >
          📝
        </button>
        <button
          className="opacity-0 group-hover:opacity-100 text-[#b773f8] hover:text-red-500 rounded p-1 transition"
          onClick={() => onDelete(task._id)}
          disabled={updateLoading}
        >
          🗑️
        </button>
      </div>

      <div className='flex gap-4 text-xs ml-10'>
        <span className={priorityClass}>Priority: {task.priority}</span>
        <span className={isOverdue ? 'text-red-500' : 'text-gray-400'}>
          Due: {dueDateText}
        </span>
      </div>

      {isEditing && (
        <div className='flex gap-2 ml-10 mt-2 p-2 bg-[#29253b] rounded-lg items-center'>
          <select
            value={editPriority}
            onChange={e => setEditPriority(e.target.value as 'Low' | 'Medium' | 'High')}
            className="p-1 rounded-md bg-[#18141e] text-white text-xs"
            disabled={updateLoading}
          >
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input
            type="date"
            value={editDueDate}
            onChange={e => setEditDueDate(e.target.value)}
            className="p-1 rounded-md bg-[#18141e] text-white text-xs"
            disabled={updateLoading}
          />
          <button
            onClick={handleUpdate}
            className="bg-[#b773f8] px-2 py-1 rounded-md text-black text-xs font-semibold"
            disabled={updateLoading}
          >
            {updateLoading ? 'Saving...' : 'Done'}
          </button>
        </div>
      )}
    </div>
  );
});
TaskItem.displayName = 'TaskItem';
// --- END: Task Item Component ---

export default function ProductivityPage() {
  const { isLoggedIn } = useAuth();

  // --- Task Management (API Integrated - from Phase 2.4) ---
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [taskError, setTaskError] = useState<string | null>(null);

  // --- Event Management (API Integrated) ---
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [eventMap, setEventMap] = useState<CalendarEventMap>({});
  const [newEventTitle, setNewEventTitle] = useState("");
  const [eventError, setEventError] = useState<string | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState<string | null>(null);

  // --- Time Tracking & Calendar UI States (Unchanged) ---
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const today = new Date();
  const [cMonth, setCMonth] = useState(today.getMonth());
  const [cYear, setCYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState({ day: today.getDate(), month: today.getMonth(), year: today.getFullYear() });
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);


  // --- Core Fetching Logic ---
  const fetchTasks = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoadingTasks(true);
    setTaskError(null);
    try {
      const { tasks: fetchedTasks } = await apiFetch('/tasks', { method: 'GET' });
      // Sort tasks: Undone first, then by priority (High > Medium > Low), then by date
      const sortedTasks = fetchedTasks.sort((a: Task, b: Task) => {
        if (a.done !== b.done) return a.done ? 1 : -1;

        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        const pA = priorityOrder[a.priority] || 0;
        const pB = priorityOrder[b.priority] || 0;
        if (pA !== pB) return pB - pA; // High priority first

        return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
      });
      setTasks(sortedTasks || []);
    } catch (err) {
      setTaskError("Failed to load tasks.");
    } finally {
      setLoadingTasks(false);
    }
  }, [isLoggedIn]);

  const fetchEvents = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoadingEvents(true);
    setEventError(null);
    try {
      const { events: fetchedEvents } = await apiFetch('/events', { method: 'GET' });

      setCalendarEvents(fetchedEvents || []);

      const newEventMap: CalendarEventMap = {};
      (fetchedEvents || []).forEach((event: CalendarEvent) => {
        const dateKey = event.date.substring(0, 10);
        if (!newEventMap[dateKey]) {
          newEventMap[dateKey] = [];
        }
        newEventMap[dateKey].push(event.title);
      });
      setEventMap(newEventMap);
    } catch (err) {
      setEventError("Failed to load calendar events.");
    } finally {
      setLoadingEvents(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchTasks();
    fetchEvents();
  }, [fetchTasks, fetchEvents]);

  // --- API Integrated Task Handlers (UPDATED) ---

  async function handleAddTask() {
    if (!newTask.trim()) return;
    setTaskError(null);
    try {
      await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          text: newTask.trim(),
          priority: 'Medium',
          dueDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), // Default due date today
        }),
      });
      await fetchTasks(); // Re-fetch to ensure sorting consistency
      setNewTask("");
    } catch (err: any) {
      setTaskError(err.message || "Failed to add task.");
    }
  }

  // Toggling done status - uses the specific update handler
  const handleToggleTask = useCallback(async (taskId: string, currentDone: boolean) => {
    await handleUpdateTask(taskId, { done: !currentDone });
  }, [handleUpdateTask]);

  // Full update for editing priority/date/text
  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    setTaskError(null);

    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      await fetchTasks();
    } catch (err: any) {
      setTaskError(err.message || "Failed to save task edits.");
      throw err;
    }
  }, [fetchTasks]);


  // DELETE /api/tasks/:id 
  const handleDeleteTask = useCallback(async (taskId: string) => {
    setTaskError(null);
    const originalTasks = tasks;
    setTasks(tasks.filter(t => t._id !== taskId));
    try {
      await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
    } catch (err: any) {
      setTaskError(err.message || "Failed to delete task.");
      setTasks(originalTasks);
    }
  }, [tasks]);

  // --- API Integrated Event Handlers (Unchanged/Retained) ---

  async function handleAddEvent() {
    if (!newEventTitle.trim()) return;
    setEventError(null);
    const eventDate = new Date(selected.year, selected.month, selected.day);

    try {
      const payload = {
        title: newEventTitle.trim(),
        date: eventDate.toISOString(),
        type: 'Personal',
      };
      const { event: createdEvent } = await apiFetch('/events', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setCalendarEvents(prev => [...prev, createdEvent]);
      const dateKey = createdEvent.date.substring(0, 10);
      setEventMap(prevMap => ({
        ...prevMap,
        [dateKey]: [...(prevMap[dateKey] || []), createdEvent.title]
      }));
      setNewEventTitle("");
    } catch (err: any) {
      setEventError(err.message || "Failed to add event.");
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this event?")) {
      return;
    }

    setIsDeletingEvent(eventId);
    setEventError(null);

    try {
      await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
      await fetchEvents();

    } catch (err: any) {
      setEventError(err.message || "Failed to delete event.");
      await fetchEvents();
    } finally {
      setIsDeletingEvent(null);
    }
  };


  // --- Local State Logic (Unchanged) ---
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  // Calendar Helpers (Unchanged)
  const handleMonthChange = (delta: number) => {
    let m = cMonth + delta, y = cYear;
    if (m > 11) { m = 0; y++; }
    else if (m < 0) { m = 11; y--; }
    setCMonth(m); setCYear(y);
    const newLastDay = new Date(y, m + 1, 0).getDate();
    setSelected(prev => ({ ...prev, day: Math.min(prev.day, newLastDay), month: m, year: y }));
    setShowMonthSelector(false);
  };

  const handleYearChange = (delta: number) => {
    setCYear(cYear + delta);
    setSelected(prev => ({ ...prev, year: cYear + delta }));
    setShowYearSelector(false);
  };

  const handleSelectMonth = (newMonth: number) => {
    setCMonth(newMonth);
    setSelected(prev => ({ ...prev, month: newMonth, year: cYear }));
    setShowMonthSelector(false);
  };
  const handleSelectYear = (newYear: number) => {
    setCYear(newYear);
    setSelected(prev => ({ ...prev, year: newYear, month: cMonth }));
    setShowYearSelector(false);
  };

  const selectedDayKey = dayKey(selected.day, selected.month, selected.year);
  const selectedEventsDetails = calendarEvents
    .filter(event => event.date.startsWith(selectedDayKey))
    .map(event => ({ id: event._id, title: event.title }));

  const monthDays = getMonthMatrix(cMonth, cYear);
  const isTodayDate = (day: number) => {
    return day === today.getDate() && cMonth === today.getMonth() && cYear === today.getFullYear();
  }
  const currentYear = new Date().getFullYear();
  const yearList = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const Selector = ({ items, currentIdx, onSelect, visible, type }: { items: any[], currentIdx: number, onSelect: (idx: number) => void, visible: boolean, type: string }) => {
    if (!visible) return null;

    return (
      <div
        className="absolute z-10 top-full mt-1 bg-[#232027] border border-[#29253b] rounded-lg shadow-xl overflow-hidden"
        style={{ width: type === 'month' ? '140px' : '90px' }}
      >
        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-[#b773f8] scrollbar-track-[#29253b]">
          {items.map((item, idx) => (
            <button
              key={idx}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${idx === currentIdx ? 'bg-[#b773f8] text-black font-semibold' : 'text-white hover:bg-[#29253b]'
                }`}
              onClick={() => onSelect(idx)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const AllEventsList = () => {
    const allEvents = calendarEvents.map(event => ({
      date: new Date(event.date),
      event: event.title,
      _id: event._id,
    }));

    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    return (
      <section className="bg-[#232027] rounded-xl p-7 mt-6 shadow-md">
        <h3 className="text-lg font-bold mb-4">Upcoming Events & Deadlines</h3>

        {allEvents.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No events scheduled yet. Add some above!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {allEvents.map((item, idx) => (
              <div key={item._id} className={`flex justify-between items-center bg-[#1e1a2a] px-4 py-3 rounded-lg border border-[#29253b] transition ${isDeletingEvent === item._id ? 'opacity-50' : ''}`}>
                <span className="font-semibold text-white">{item.event}</span>
                <div className='flex items-center gap-3'>
                  <span className="text-sm text-gray-400 font-mono">{formatDate(item.date)}</span>
                  <button
                    className='text-red-500/80 hover:text-red-300'
                    onClick={() => handleDeleteEvent(item._id)}
                    disabled={!!isDeletingEvent}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }
  // --- Main Render ---
  return (
    <div className="min-h-screen flex flex-col bg-[#18141e] text-white px-0">
      <main className="max-w-[1400px] mx-auto w-full px-6 pb-16">
        <div className="pt-10 pb-6">
          <h1 className="text-3xl font-extrabold" style={{ color: "#b773f8" }}>Productivity Tools</h1>
        </div>

        {/* Task Management */}
        <section className="bg-[#232027] rounded-xl p-7 mb-6 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" style={{ color: "#66e36a" }}>✔️</span>
            <span className="text-lg font-bold">Task Management</span>
          </div>
          <div className="text-gray-400 mb-2 text-sm ml-7">
            Organize tasks, set deadlines, and track progress.
          </div>
          <div className="flex items-center gap-3 ml-7 mb-2">
            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              className="flex-1 px-4 py-3 rounded bg-[#19171c] text-white placeholder-gray-400 focus:outline-purple-500"
              placeholder="Add a new task..."
              onKeyDown={e => { if (e.key === "Enter") handleAddTask(); }}
            />
            <button className="bg-[#b773f8] px-4 py-2 rounded-lg font-semibold text-black" onClick={handleAddTask}>+ Add</button>
          </div>
          {taskError && <div className="ml-7 text-sm text-red-400 mt-2">{taskError}</div>}
          <div className="ml-7 pt-2">
            {loadingTasks ? (
              <div className="text-gray-400">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="text-gray-400 italic">No tasks found. Add a new one above!</div>
            ) : (
              tasks.map((task) =>
                <TaskItem
                  key={task._id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onUpdate={handleUpdateTask}
                />
              )
            )}
          </div>
        </section>

        {/* Time Tracking (Local Only) */}
        <section className="bg-[#232027] rounded-xl p-7 mb-6 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" style={{ color: "#6e98f6" }}>⏲️</span>
            <span className="text-lg font-bold">Time Tracking</span>
          </div>
          <div className="ml-7 text-gray-400 text-sm mb-2">Track working hours and productivity.</div>
          <div className="ml-7 text-lg font-bold">Time: <span className="font-mono text-white">{timer}s</span></div>
          <div className="ml-7 mt-3 flex gap-4">
            <button className="bg-[#b773f8] px-5 py-2 rounded font-semibold text-black hover:bg-[#a65df6] transition"
              onClick={() => setTimerActive(true)}
              disabled={timerActive}
            >Start Tracking</button>
            <button className="bg-red-500 px-5 py-2 rounded font-semibold text-white hover:bg-red-700 transition"
              onClick={() => { setTimer(0); setTimerActive(false); }}
            >Reset Timer</button>
          </div>
        </section>

        {/* Calendar & Scheduling */}
        <section className="bg-[#232027] rounded-xl p-7 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl" style={{ color: "#ff952a" }}>🗓️</span>
            <span className="text-lg font-bold">Calendar & Scheduling</span>
          </div>
          <div className="text-gray-400 text-sm mb-3 ml-7">Manage your schedule and gig bookings.</div>

          {eventError && <div className="ml-7 text-sm text-red-400 mt-2">{eventError}</div>}

          <div className="p-4 bg-[#1e1a2a] rounded-xl">
            {/* Calendar header for month/year switch (Unchanged) */}
            <div className="flex items-center mb-4 justify-between w-full text-white">

              {/* Left Arrows */}
              <div className="flex gap-2">
                <button onClick={() => handleMonthChange(-1)} className="text-2xl hover:text-[#b773f8] px-1 text-gray-400">&lt;</button>
                <button onClick={() => handleYearChange(-1)} className="text-2xl hover:text-[#b773f8] px-1 text-gray-400">&lt;</button>
              </div>

              {/* Center Month/Year Title - Clickable Dropdowns */}
              <div className="font-bold text-lg flex items-center gap-3">
                <div className='relative'>
                  <button
                    onClick={() => setShowMonthSelector(!showMonthSelector)}
                    className="hover:text-[#b773f8] cursor-pointer"
                  >
                    {MONTHS[cMonth]}
                  </button>
                  <Selector
                    items={MONTHS}
                    currentIdx={cMonth}
                    onSelect={handleSelectMonth}
                    visible={showMonthSelector}
                    type="month"
                  />
                </div>
                <div className='relative'>
                  <button
                    onClick={() => setShowYearSelector(!showYearSelector)}
                    className="hover:text-[#b773f8] cursor-pointer"
                  >
                    {cYear}
                  </button>
                  <Selector
                    items={yearList}
                    currentIdx={yearList.indexOf(cYear)}
                    onSelect={(idx) => handleSelectYear(yearList[idx])}
                    visible={showYearSelector}
                    type="year"
                  />
                </div>
              </div>

              {/* Right Arrows */}
              <div className="flex gap-2">
                <button onClick={() => handleYearChange(1)} className="text-2xl hover:text-[#b773f8] px-1 text-gray-400">&gt;</button>
                <button onClick={() => handleMonthChange(1)} className="text-2xl hover:text-[#b773f8] px-1 text-gray-400">&gt;</button>
              </div>
            </div>

            {/* Calendar grid wrapper */}
            <div className="grid grid-cols-7 border-t border-[#29253b] border-l border-r border-b-0 divide-x divide-[#29253b] text-center select-none">
              {/* Day Headers (Unchanged) */}
              {WEEK.map((d, idx) =>
                <div key={idx} className="text-sm p-2 text-gray-400 font-medium bg-[#18141e] border-b border-[#29253b]">
                  {d}
                </div>
              )}

              {/* Calendar Days (Unchanged) */}
              {loadingEvents ? (
                <div className="col-span-7 p-4 text-center text-gray-400">Loading Calendar Events...</div>
              ) : (
                monthDays.flat().map((d, i) => {
                  const day = d;
                  const isPrevNextMonth = d === null;
                  const isSelected = !isPrevNextMonth && d === selected.day && cMonth === selected.month && cYear === selected.year;
                  const isToday = !isPrevNextMonth && isTodayDate(d!);
                  const key = dayKey(day || 1, cMonth, cYear);
                  const hasEvents = !isPrevNextMonth && eventMap[key]?.length > 0;

                  let dayClasses = "text-white";
                  if (isSelected) {
                    dayClasses = "bg-[#4a86f2] text-white";
                  } else if (isToday) {
                    dayClasses = "bg-yellow-600/80 text-black font-bold";
                  } else if (i % 7 >= 5) {
                    dayClasses = "text-red-500/80 hover:bg-[#29253b]";
                  } else if (hasEvents) {
                    dayClasses = "text-gray-200 hover:bg-[#29253b]";
                  } else {
                    dayClasses = "text-gray-400 hover:bg-[#29253b]";
                  }

                  return (
                    <div
                      key={i}
                      className={`h-14 border-b border-[#29253b] flex items-center justify-center p-1 cursor-pointer transition 
                                ${isPrevNextMonth ? 'bg-[#1e1a2a]/50' : 'bg-[#1e1a2a]'} `}
                      onClick={() => {
                        if (day !== null) {
                          setSelected({ day: day, month: cMonth, year: cYear });
                        }
                      }}
                    >
                      {day !== null && (
                        <div className={`w-full h-full flex flex-col items-center justify-start rounded-md p-1 transition ${dayClasses}`}>
                          <span className="text-sm font-semibold">{day}</span>
                          {hasEvents && (
                            <span className={`w-1.5 h-1.5 mt-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#b773f8]'}`}></span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add event/Show selected date */}
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded bg-[#18141e] text-white placeholder-gray-400 border border-[#29253b] focus:border-[#b773f8] outline-none"
                  placeholder={`Add an event on ${MONTHS[selected.month]} ${selected.day}...`}
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddEvent(); }}
                />
                <button className="bg-[#b773f8] px-4 py-2 rounded-lg font-semibold text-black" onClick={handleAddEvent}>+ Add</button>
              </div>

              {/* Show events for the selected day */}
              <div className="mt-2">
                <span className="block text-sm text-gray-400 mb-2 font-semibold">
                  Events for {MONTHS[selected.month]} {selected.day}, {selected.year}
                </span>
                {(selectedEventsDetails).map((ev, idx) => (
                  <div key={ev.id} className={`flex items-center justify-between bg-[#1e1a2a] px-3 py-2 rounded-xl mb-2 text-white border border-[#29253b] transition ${isDeletingEvent === ev.id ? 'opacity-50' : ''}`}>
                    <span>{ev.title}</span>
                    <button
                      className='text-red-500/80 hover:text-red-300'
                      onClick={() => handleDeleteEvent(ev.id)}
                      disabled={!!isDeletingEvent}
                    >
                      <span className='text-xs'>🗑️</span>
                    </button>
                  </div>
                ))}
                {selectedEventsDetails.length === 0 && (
                  <div className="text-gray-500 text-sm italic p-2">No events scheduled.</div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* All Events List (Updated) */}
        <AllEventsList />

      </main>
    </div>
  );
}