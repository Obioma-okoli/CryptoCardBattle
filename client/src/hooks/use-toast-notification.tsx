import { useToast } from "@/hooks/use-toast";

export const useToastNotification = () => {
  const { toast } = useToast();
  
  const showNotification = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    const variant = type === "success" ? "default" : type === "error" ? "destructive" : "default";
    
    toast({
      title,
      description: message,
      variant,
    });
  };
  
  return { showNotification };
};
