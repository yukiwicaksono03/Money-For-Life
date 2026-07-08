import {
  Wallet,
  Gift,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Popcorn,
  HeartPulse,
  MoreHorizontal,
  Circle,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  wallet: Wallet,
  gift: Gift,
  utensils: Utensils,
  car: Car,
  "shopping-bag": ShoppingBag,
  receipt: Receipt,
  popcorn: Popcorn,
  "heart-pulse": HeartPulse,
  "more-horizontal": MoreHorizontal,
  circle: Circle,
};

export function CategoryIcon({
  icon,
  color,
  size = 18,
}: {
  icon: string;
  color: string;
  size?: number;
}) {
  const Icon = ICONS[icon] ?? Circle;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size + 18,
        height: size + 18,
        backgroundColor: `${color}1a`,
        color,
      }}
    >
      <Icon size={size} strokeWidth={2} />
    </div>
  );
}
