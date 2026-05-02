import { Star } from 'lucide-react'

export default function StarRating({ value, onChange, readonly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`w-7 h-7 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  )
}
