import {
  Briefcase,
  CalendarDays,
  GraduationCap,
  HelpCircle,
  Inbox,
  Mail,
  Newspaper,
  Quote,
  Receipt,
  Scale,
  Trophy,
  UserRound,
  Users,
  Circle,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Briefcase,
  CalendarDays,
  GraduationCap,
  HelpCircle,
  Inbox,
  Mail,
  Newspaper,
  Quote,
  Receipt,
  Scale,
  Trophy,
  UserRound,
  Users,
};

import { createElement } from "react";

export function CollectionIcon({ name, className }: { name: string; className?: string }) {
  return createElement(MAP[name] ?? Circle, { className });
}

export function iconFor(name: string): LucideIcon {
  return MAP[name] ?? Circle;
}
