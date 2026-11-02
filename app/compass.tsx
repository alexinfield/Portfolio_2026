"use client";

// The pinned library entry is compiled without a client directive. Keep all
// consumption on its public exports so a later tarball swap stays independent.
export {
  Button, Card, DesignSystemBoundary, Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem, Slider,
} from "@alex-infield/compass-augmentation";
