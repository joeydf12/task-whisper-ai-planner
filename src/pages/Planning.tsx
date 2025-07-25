import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TaskCreationModal } from '@/components/TaskCreationModal';
import { DayPlanningModal } from '@/components/DayPlanningModal';
import { CompletionCelebration } from '@/components/CompletionCelebration';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileNav } from '@/components/MobileNav';
import { useNavigate } from 'react-router-dom';
import { Task, Project } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  type: 'meeting' | 'deadline' | 'presentation';
}

const Planning = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [celebrationTask, setCelebrationTask] = useState<Task | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchEvents();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('planned_date', { ascending: true });

      if (error) throw error;

      console.log('Fetched tasks:', data);
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Fout bij ophalen taken',
        description: 'Er is een fout opgetreden bij het ophalen van de taken.',
        variant: 'destructive',
      });
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Fout bij ophalen projecten',
        description: 'Er is een fout opgetreden bij het ophalen van de projecten.',
        variant: 'destructive',
      });
    }
  };

  const fetchEvents = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Fout bij ophalen events',
        description: 'Er is een fout opgetreden bij het ophalen van de events.',
        variant: 'destructive',
      });
    }
  };

  const handleTaskCreate = async (newTask: any) => {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('No user logged in');

      // Add user_id to the task
      const taskWithUser = {
        ...newTask,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskWithUser])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [...prev, data]);
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Fout bij aanmaken taak',
        description: 'Er is een fout opgetreden bij het aanmaken van de taak.',
        variant: 'destructive',
      });
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const isCurrentlyCompleted = task.status === 'completed';
      const newStatus = isCurrentlyCompleted ? 'pending' : 'completed';
      const completedAt = isCurrentlyCompleted ? null : new Date().toISOString();

      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, completed_at: completedAt })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t =>
        t.id === taskId
          ? { ...t, status: newStatus, completed_at: completedAt }
          : t
      ));

      if (!isCurrentlyCompleted) {
        setCelebrationTask({ ...task, status: 'completed', completed_at: completedAt });
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: 'Fout bij voltooien taak',
        description: 'Er is een fout opgetreden bij het voltooien van de taak.',
        variant: 'destructive',
      });
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus as Task['status'] })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Fout bij bijwerken taak',
        description: 'Er is een fout opgetreden bij het bijwerken van de taak.',
        variant: 'destructive',
      });
    }
  };

  const handleTaskEdit = async (taskId: string, updatedTask: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, ...updatedTask } : t
      ));

      toast({
        title: "Taak bijgewerkt",
        description: "De taak is succesvol bijgewerkt.",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Fout bij bijwerken taak',
        description: 'Er is een fout opgetreden bij het bijwerken van de taak.',
        variant: 'destructive',
      });
    }
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getTasksForDate = (date: Date) => {
    const selectedDateString = date.toISOString().slice(0, 10);
    return tasks.filter(task => {
      if (!task.planned_date) return false;
      const plannedDateString = task.planned_date.slice(0, 10);
      return plannedDateString === selectedDateString;
    });
  };

  const getEventsForDate = (date: Date) => {
    const selectedDateString = date.toISOString().slice(0, 10);
    return events.filter(event => {
      const eventDateString = event.start_date;
      return eventDateString === selectedDateString;
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'presentation': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const weekDays = getWeekDays(currentWeek);
  const dayNames = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDayModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onCreateTask={() => setIsTaskModalOpen(true)} />

      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Planning</h1>
            <p className="text-slate-600">Bekijk je planning</p>
          </div>

          <div className="flex items-center justify-between mb-6 gap-4">
            <Button variant="outline" onClick={previousWeek} className="text-xs sm:text-sm">
              <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Vorige week</span>
              <span className="sm:hidden">Vorige</span>
            </Button>

            <h2 className="text-sm sm:text-xl font-semibold text-slate-700 text-center">
              <span className="hidden sm:inline">Week van </span>
              {weekDays[0].toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
            </h2>

            <Button variant="outline" onClick={nextWeek} className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Volgende week</span>
              <span className="sm:hidden">Volgende</span>
              <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {weekDays.map((day, index) => {
              const dayTasks = getTasksForDate(day);
              const dayEvents = getEventsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`bg-white rounded-lg border p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow ${isToday ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="mb-3">
                    <h3 className={`font-semibold text-sm sm:text-base ${isToday ? 'text-blue-800' : 'text-slate-800'}`}>
                      {dayNames[index]}
                    </h3>
                    <p className={`text-xs sm:text-sm ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                      {day.getDate()}/{day.getMonth() + 1}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {dayTasks.length === 0 && dayEvents.length === 0 ? (
                      <p className="text-slate-400 text-xs sm:text-sm italic">Geen taken of events</p>
                    ) : (
                      <>
                        {/* Tasks Section */}
                        {dayTasks.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-slate-600">Taken:</p>
                            {dayTasks.slice(0, 2).map(task => (
                              <div key={task.id} className="bg-slate-50 rounded p-2 text-xs sm:text-sm">
                                <h4 className="font-medium text-slate-800 mb-1 truncate">{task.title}</h4>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                    {task.priority}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {dayTasks.length > 2 && (
                              <p className="text-slate-500 text-xs text-center">
                                +{dayTasks.length - 2} meer taken
                              </p>
                            )}
                          </div>
                        )}

                        {/* Events Section */}
                        {dayEvents.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-slate-600">Events:</p>
                            {dayEvents.slice(0, 2).map(event => (
                              <div key={event.id} className="bg-blue-50 rounded p-2 text-xs sm:text-sm">
                                <h4 className="font-medium text-slate-800 mb-1 truncate flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {event.title}
                                </h4>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <Badge variant="outline" className={getEventTypeColor(event.type)}>
                                    {event.type}
                                  </Badge>
                                  <span className="text-xs text-slate-500">{event.start_time}</span>
                                </div>
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <p className="text-slate-500 text-xs text-center">
                                +{dayEvents.length - 2} meer events
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <TaskCreationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateTask={handleTaskCreate}
        projects={projects}
      />

      <DayPlanningModal
        date={selectedDate}
        tasks={tasks}
        projects={projects}
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        onTaskComplete={handleTaskComplete}
        onTaskStatusChange={handleTaskStatusChange}
        onEdit={handleTaskEdit}
      />

      <CompletionCelebration
        task={celebrationTask}
        onClose={() => setCelebrationTask(null)}
      />

      <MobileNav />
    </div>
  );
};

export default Planning;
