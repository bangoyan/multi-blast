import { cn } from '@/lib/utils'

export function MultiBlastLogo({
  className = 'h-10 w-10',
  showText = false,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl bg-[#090B0E] p-1.5 shadow-md border border-white/10 transition-transform group-hover:scale-105',
          className
        )}
      >
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <defs>
            <linearGradient id="logoLimeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8FF82" />
              <stop offset="100%" stopColor="#B6EC1A" />
            </linearGradient>
          </defs>

          {/* Directional Wings */}
          <path d="M 256 100 L 296 172 L 256 160 L 216 172 Z" fill="#FF4343" />
          <path d="M 412 256 L 340 296 L 352 256 L 340 216 Z" fill="#FF44A8" />
          <path d="M 256 412 L 216 340 L 256 352 L 296 340 Z" fill="#00F2FE" />
          <path d="M 100 256 L 172 216 L 160 256 L 172 296 Z" fill="#1877F2" />

          {/* Central Core Diamond */}
          <polygon points="256,156 356,256 256,356 156,256" fill="url(#logoLimeGrad)" />

          {/* Inner Cutout */}
          <polygon points="256,204 308,256 288,256 256,224 224,256 204,256" fill="#090B0E" />
          <circle cx="256" cy="276" r="22" fill="#090B0E" />
          <circle cx="256" cy="276" r="12" fill="url(#logoLimeGrad)" />
        </svg>
      </div>

      {showText && (
        <div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white font-sans">
            MultiBlast
          </span>
          <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
            Omnichannel SaaS
          </span>
        </div>
      )}
    </div>
  )
}
