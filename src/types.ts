export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
}