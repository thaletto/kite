import { useState } from "react";
import { Action, Actions } from "@/components/ai-elements/actions";
import { RefreshCcw, Copy, Check } from "lucide-react";

interface Props {
  className?: string;
  regenerate?: () => Promise<void>;
  copyContent?: string;
  size?: number;
}

export function ActionBar({
  className,
  regenerate,
  copyContent,
  size = 16,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyContent) return;
    await navigator.clipboard.writeText(copyContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // reset after 2s
  };

  return (
    <Actions className={className}>
      {regenerate && (
        <Action label="Retry" onClick={regenerate}>
          <RefreshCcw size={size} />
        </Action>
      )}

      {copyContent && (
        <Action label={copied ? "Copied!" : "Copy"} onClick={handleCopy}>
          {copied ? (
            <Check size={size} />
          ) : (
            <Copy size={size} />
          )}
        </Action>
      )}
    </Actions>
  );
}
