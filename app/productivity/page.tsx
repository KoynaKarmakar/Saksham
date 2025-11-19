'use client';
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '@/lib/api';

// Define the shape of data expected from the backend for a Task
interface Task {
  _id: string;
  text: string;
  done: boolean;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High';
}

// --- START: Static/Local Data and Helper Functions (No API Change) ---

// Constants (Moved inside the component) ---
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
// We use the WEEK array for day headers, starting Monday (MON, TUE, WED, THU, FRI, SAT, SUN)
const WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// --- Helper: returns [weeks[day, day,...]]
function getMonthMatrix(month: number, year: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const matrix: (number | null)[][] = [];
  let week: (number | null)[] = [];
  let day = 1;
  let daysInMonth = last.getDate();
  // Monday start: getDay() returns 0 (Sunday) to 6 (Saturday). We shift it so 0 is Monday.
  let firstDay = first.getDay() === 0 ? 6 : first.getDay() - 1;

  for (let x = 0; x < firstDay; x++) week.push(null);
  while (day <= daysInMonth) {
    week.push(day);
    if (week.length === 7) { matrix.push(week); week = []; }
    day++;
  }
  // Pad the last week
  while (week.length > 0 && week.length < 7) week.push(null);
  if (week.length > 0) matrix.push(week);
  return matrix;
}

function dayKey(day: number, mon: number, yr: number) {
  // Returns YYYY-MM-DD
  return `${yr}-${('0' + (mon + 1)).slice(-2)}-${('0' + day).slice(-2)}`;
}

// --- END: Static/Local Data and Helper Functions ---


export default function ProductivityPage() {
  const { isLoggedIn } = useAuth();

  // --- API & Loading States ---
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [taskError, setTaskError] = useState<string | null>(null);

  // --- Timer State (Local Only) ---
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Calendar/Event States (Local Only) ---
  const today = new Date();
  const [cMonth, setCMonth] = useState(today.getMonth());
  const [cYear, setCYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState({ day: today.getDate(), month: today.getMonth(), year: today.getFullYear() });
  const [events, setEvents] = useState<{ [key: string]: string[] }>({
    '2025-11-04': ["amey bday"]
  });
  const [newEvent, setNewEvent] = useState("");
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);

  // Timer logic (Local Only)
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  // --- Data Fetching Effect: GET /api/tasks ---
  const fetchTasks = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoadingTasks(true);
    setTaskError(null);
    try {
      const { tasks: fetchedTasks } = await apiFetch('/tasks', { method: 'GET' });
      setTasks(fetchedTasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTaskError("Failed to load tasks.");
    } finally {
      setLoadingTasks(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);


  // --- Task Handlers (API Integrated) ---

  // POST /api/tasks
  async function handleAddTask() {
    if (!newTask.trim()) return;

    setTaskError(null);
    try {
      const { task: createdTask } = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({ text: newTask.trim(), priority: 'Medium' }),
      });
      setTasks(prev => [createdTask, ...prev]);
      setNewTask("");
    } catch (err: any) {
      setTaskError(err.message || "Failed to add task.");
    }
  }

  // PUT /api/tasks/:id
  async function handleToggleTask(taskId: string, currentDone: boolean) {
    setTaskError(null);
    // Optimistic UI Update
    setTasks(tasks.map(t => t._id === taskId ? { ...t, done: !currentDone } : t));

    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ done: !currentDone }),
      });
    } catch (err: any) {
      setTaskError(err.message || "Failed to update task status.");
      // Rollback optimistic update on failure
      setTasks(tasks.map(t => t._id === taskId ? { ...t, done: currentDone } : t));
    }
  }

  // DELETE /api/tasks/:id
  async function handleDeleteTask(taskId: string) {
    setTaskError(null);
    const originalTasks = tasks;
    // Optimistic UI Update: Remove task instantly
    setTasks(tasks.filter(t => t._id !== taskId));

    try {
      // Note: DELETE returns 204 No Content
      await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
    } catch (err: any) {
      setTaskError(err.message || "Failed to delete task.");
      // Rollback optimistic deletion on failure
      setTasks(originalTasks);
    }
  }

  // --- Calendar Helpers (Local Only) ---
  function handleMonthChange(delta: number) {
    let m = cMonth + delta, y = cYear;
    if (m > 11) { m = 0; y++; }
    else if (m < 0) { m = 11; y--; }
    setCMonth(m); setCYear(y);
    const newLastDay = new Date(y, m + 1, 0).getDate();
    setSelected(prev => ({ ...prev, day: Math.min(prev.day, newLastDay), month: m, year: y }));
    setShowMonthSelector(false);
  }
  function handleYearChange(delta: number) {
    setCYear(cYear + delta);
    setSelected(prev => ({ ...prev, year: cYear + delta }));
    setShowYearSelector(false);
  }
  function handleSelectMonth(newMonth: number) {
    setCMonth(newMonth);
    setSelected(prev => ({ ...prev, month: newMonth, year: cYear }));
    setShowMonthSelector(false);
  }
  function handleSelectYear(newYear: number) {
    setCYear(newYear);
    setSelected(prev => ({ ...prev, year: newYear, month: cMonth }));
    setShowYearSelector(false);
  }
  function handleAddEvent() {
    if (!newEvent.trim()) return;
    const k = dayKey(selected.day, selected.month, selected.year);
    setEvents({ ...events, [k]: [...(events[k] || []), newEvent] });
    setNewEvent("");
  }

  const selectedDayKey = dayKey(selected.day, selected.month, selected.year);
  const selectedEvents = events[selectedDayKey] || [];
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
    // 1. Convert events map into a sortable array
    const allEvents: { date: Date, event: string }[] = [];

    for (const dateKey in events) {
      const [year, month, day] = dateKey.split('-').map(Number);
      events[dateKey].forEach(event => {
        // Note: Month in JS Date is 0-indexed, so subtract 1
        allEvents.push({ date: new Date(year, month - 1, day), event });
      });
    }

    // 2. Sort events by date in ascending order
    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Date formatter for display
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
              <div key={idx} className="flex justify-between items-center bg-[#1e1a2a] px-4 py-3 rounded-lg border border-[#29253b]">
                <span className="font-semibold text-white">{item.event}</span>
                <span className="text-sm text-gray-400 font-mono">{formatDate(item.date)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }
  // --- END: Calendar Helpers (Local Only) ---

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
              tasks.map((task, idx) =>
                <div key={task._id} className="flex items-center gap-3 mb-2 group">
                  <button className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 ${task.done ? 'border-[#66e36a] bg-[#19171c]' : 'border-gray-400 bg-[#19171c]'}`}
                    onClick={() => handleToggleTask(task._id, task.done)}>
                    {task.done && <span className="text-[#66e36a] text-lg">✔️</span>}
                  </button>
                  <span className={`flex-1 text-base transition-all select-none ${task.done ? 'line-through text-gray-500' : 'text-white'}`}>{task.text}</span>
                  <button className="opacity-70 group-hover:opacity-100 text-[#b773f8] hover:text-red-500 rounded p-1"
                    onClick={() => handleDeleteTask(task._id)}>
                    🗑️
                  </button>
                </div>
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

        {/* Calendar & Scheduling (Local Only) */}
        <section className="bg-[#232027] rounded-xl p-7 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl" style={{ color: "#ff952a" }}>🗓️</span>
            <span className="text-lg font-bold">Calendar & Scheduling</span>
          </div>
          <div className="text-gray-400 text-sm mb-3 ml-7">Manage your schedule and gig bookings.</div>

          <div className="p-4 bg-[#1e1a2a] rounded-xl">
            {/* Calendar header for month/year switch */}
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
              {/* Day Headers */}
              {WEEK.map((d, idx) =>
                <div key={idx} className="text-sm p-2 text-gray-400 font-medium bg-[#18141e] border-b border-[#29253b]">
                  {d}
                </div>
              )}

              {/* Calendar Days */}
              {monthDays.flat().map((d, i) => {
                const day = d;
                const isPrevNextMonth = d === null;
                const isSelected = !isPrevNextMonth && d === selected.day && cMonth === selected.month && cYear === selected.year;
                const isToday = !isPrevNextMonth && isTodayDate(d!);
                const isWeekend = i % 7 >= 5; // Saturday/Sunday indices
                const key = dayKey(day || 1, cMonth, cYear);
                const hasEvents = !isPrevNextMonth && events[key]?.length > 0;

                // Styling precedence: Selected > Today > Weekend/Event > Default
                let dayClasses = "text-white";
                if (isSelected) {
                  dayClasses = "bg-[#4a86f2] text-white"; // Blue selected color from screenshot
                } else if (isToday) {
                  dayClasses = "bg-yellow-600/80 text-black font-bold"; // Yellow today color from screenshot
                } else if (isWeekend) {
                  dayClasses = "text-red-500/80 hover:bg-[#29253b]"; // Red weekend color
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
              })}
            </div>

            {/* Add event/Show selected date */}
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded bg-[#18141e] text-white placeholder-gray-400 border border-[#29253b] focus:border-[#b773f8] outline-none"
                  placeholder={`Add an event...`}
                  value={newEvent}
                  onChange={e => setNewEvent(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddEvent(); }}
                />
                <button className="bg-[#b773f8] px-4 py-2 rounded-lg font-semibold text-black hover:bg-[#a65df6] transition" onClick={handleAddEvent}>+ Add</button>
              </div>

              {/* Show events for the selected day */}
              <div className="mt-2">
                <span className="block text-sm text-gray-400 mb-2 font-semibold">
                  {MONTHS[selected.month]} {selected.day}, {selected.year}
                </span>
                {(selectedEvents).map((ev, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#1e1a2a] px-3 py-2 rounded-xl mb-2 text-white border border-[#29253b]">
                    <span>{ev}</span>
                  </div>
                ))}
                {selectedEvents.length === 0 && (
                  <div className="text-gray-500 text-sm italic p-2">No events scheduled.</div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* All Events List (NEW SECTION) */}
        <AllEventsList />

      </main>
    </div>
  );
}