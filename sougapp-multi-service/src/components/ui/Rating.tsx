import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatNumber, cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  reviews?: number;
  className?: string;
}

/** Compact rating: one gold star + numeric value + optional review count. */
export function Rating({ value, reviews, className }: RatingProps) {
  const { i18n } = useTranslation();
  const intlLocale =
    i18n.language === "ar" ? "ar-MR" : i18n.language === "en" ? "en-US" : "fr-FR";
  const rating = new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);

  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="h-4 w-4 fill-gold text-gold" aria-hidden />
      <span className="font-semibold tabular-nums text-text">{rating}</span>
      {reviews !== undefined && (
        <span className="text-xs text-faint tnum">
          ({formatNumber(reviews, i18n.language)})
        </span>
      )}
    </span>
  );
}
