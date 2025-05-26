import { cn } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  icon: string;
  color: "primary" | "secondary" | "accent" | "warning";
  isActive?: boolean;
  onClick: () => void;
}

export default function CategoryCard({ title, icon, color, isActive = false, onClick }: CategoryCardProps) {
  const colorStyles = {
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
    },
    secondary: {
      bg: "bg-secondary/10",
      text: "text-secondary",
    },
    accent: {
      bg: "bg-accent/10",
      text: "text-accent",
    },
    warning: {
      bg: "bg-warning/10",
      text: "text-warning",
    },
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-xl shadow-sm p-4 border text-center transition-all duration-200",
        isActive ? "border-2 border-primary" : "border-neutral-200",
        "cursor-pointer hover:shadow-md"
      )}
      onClick={onClick}
    >
      <div className={cn(
        colorStyles[color].bg,
        "rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2"
      )}>
        <span className={cn("material-icons text-3xl", colorStyles[color].text)}>
          {icon}
        </span>
      </div>
      <h3 className="font-bold">{title}</h3>
    </div>
  );
}
