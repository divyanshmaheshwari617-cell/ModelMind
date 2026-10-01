"use client";

import SmartPreprocessingAdvisor from "./SmartPreprocessingAdvisor";
import { LearningLevel } from "@/types/learning";

interface Props {
  runtimeId: string;
  filename: string;
  learningLevel: LearningLevel;
  onInsertCode: (code: string) => void;
}

export default function PreprocessingAdvisorTest({
  runtimeId,
  filename,
  learningLevel,
  onInsertCode,
}: Props) {
  return (
    <SmartPreprocessingAdvisor
      runtimeId={runtimeId}
      filename={filename}
      learningLevel={learningLevel}
      onInsertCode={onInsertCode}
    />
  );
}