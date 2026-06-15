import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  size?: number
}

export default function StarRating({ value, onChange, size = 28 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-all duration-200 hover:scale-110 focus:outline-none"
        >
          <Star
            size={size}
            className={cn(
              'transition-all duration-200',
              star <= value
                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                : 'fill-transparent text-slate-500 hover:text-amber-300'
            )}
          />
        </button>
      ))}
    </div>
  )
}
