import { Pause, Play } from "lucide-react";
import { Button } from "./compass";

export default function MediaToggle({ label }: { label: string }) {
  return <Button type="button" variant="secondary" size="icon-sm"
    data-video-toggle data-playing="false" aria-label={`Play ${label}`}
    suppressHydrationWarning>
    <Play data-play-icon aria-hidden="true" />
    <Pause data-pause-icon aria-hidden="true" />
  </Button>;
}
