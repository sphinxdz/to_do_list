type Priority = 'high' | 'medium' | 'low';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
}