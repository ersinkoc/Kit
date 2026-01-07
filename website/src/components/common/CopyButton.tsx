import { Copy, Check } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  showLabel?: boolean;
}

export function CopyButton({ text, className, showLabel = true }: CopyButtonProps) {
  const { copied, copy } = useClipboard();

  return (
    <button
      onClick={() => copy(text)}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs',
        'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
        'hover:bg-[hsl(var(--accent))] transition-colors',
        className
      )}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-500" />
          {showLabel && <span className="text-green-500">Copied!</span>}
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          {showLabel && <span>Copy</span>}
        </>
      )}
    </button>
  );
}
