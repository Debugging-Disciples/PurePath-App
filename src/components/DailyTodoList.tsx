
import React, { useState, useEffect } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from '../utils/auth';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from '../utils/firebase';
import { toast } from "sonner";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface DailyTodoListProps {
  className?: string;
}

const DailyTodoList: React.FC<DailyTodoListProps> = ({ className }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const { currentUser } = useAuth();
  const MAX_TODOS = 3;

  useEffect(() => {
    fetchTodos();
  }, [currentUser]);

  const fetchTodos = async () => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().dailyTodos) {
        setTodos(userDoc.data().dailyTodos);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error("Failed to load your daily tasks");
    }
  };

  const saveTodos = async (updatedTodos: Todo[]) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        dailyTodos: updatedTodos
      });
    } catch (error) {
      console.error("Error saving todos:", error);
      toast.error("Failed to save your changes");
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newTodo.trim() === "") return;
    if (todos.length >= MAX_TODOS) {
      toast.warning(`You can only add up to ${MAX_TODOS} daily tasks. Complete existing tasks first.`);
      return;
    }
    
    const newTodoItem: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false
    };
    
    const updatedTodos = [...todos, newTodoItem];
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
    setNewTodo("");
    toast.success("New task added");
  };

  const handleToggleTodo = async (id: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const handleRemoveTodo = async (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
    toast.success("Task removed");
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-md p-4", className)}>
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        Daily Focus
        <span className="ml-2 text-xs text-muted-foreground">
          ({todos.length}/{MAX_TODOS})
        </span>
      </h3>
      
      <div className="space-y-2 mb-4">
        {todos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">Add up to 3 priority tasks for today</p>
        ) : (
          todos.map((todo) => (
            <div 
              key={todo.id}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-md group"
            >
              <Button
                size="icon"
                variant={todo.completed ? "default" : "outline"}
                className={cn(
                  "h-6 w-6 p-0", 
                  todo.completed && "bg-primary text-primary-foreground"
                )}
                onClick={() => handleToggleTodo(todo.id)}
              >
                {todo.completed && <Check className="h-3.5 w-3.5" />}
              </Button>
              
              <span className={cn(
                "flex-1 text-sm transition-all",
                todo.completed && "line-through text-muted-foreground"
              )}>
                {todo.text}
              </span>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemoveTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
      
      {todos.length < MAX_TODOS && (
        <form onSubmit={handleAddTodo} className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="h-9 text-sm"
          />
          <Button type="submit" size="sm" variant="outline" className="h-9 px-2">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
};

export default DailyTodoList;
