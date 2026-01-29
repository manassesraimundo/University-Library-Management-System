import { ReactNode } from "react"
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from "./ui/card";

interface ICardResumeProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export function CardResume({ title, value, icon }: ICardResumeProps) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}