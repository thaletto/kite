import { useWebHaptics } from "web-haptics/react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/haptics-test")({
  component: HapticsTestPage,
});

function HapticsTestPage() {
  const { trigger, isSupported } = useWebHaptics({ debug: true });

  const handleTrigger = async (type?: string) => {
    console.log("Triggering haptics with type:", type);
    await trigger(type ?? "medium");
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Haptics Test</h1>
      <p className="text-muted-foreground">
        Haptics supported: {isSupported ? "Yes" : "No"}
      </p>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Impact Types</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleTrigger("light")}>Light</Button>
          <Button onClick={() => handleTrigger("medium")}>Medium</Button>
          <Button onClick={() => handleTrigger("heavy")}>Heavy</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Notification Types</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleTrigger("success")}>Success</Button>
          <Button onClick={() => handleTrigger("warning")}>Warning</Button>
          <Button onClick={() => handleTrigger("error")}>Error</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Selection</h2>
        <Button onClick={() => handleTrigger("selection")}>Selection</Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Default (no type)</h2>
        <Button onClick={() => handleTrigger()}>Default</Button>
      </div>
    </div>
  );
}