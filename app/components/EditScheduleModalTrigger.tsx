"use client";

import { useState } from "react";
import EditScheduleModal from "@/app/components/EditScheduleModal";

interface EditScheduleModalTriggerProps {
  courseId: string;
  courseName: string;
  courseNumber: string;
  currentProfessorId: string | null;
  currentProfessorName: string | null;
  schoolId: string;
  entryId: string;
  term: string | null;
  meetingTimes: string | null;
}

export default function EditScheduleModalTrigger({
  courseId,
  courseName,
  courseNumber,
  currentProfessorId,
  currentProfessorName,
  schoolId,
  entryId,
  term,
  meetingTimes
}: EditScheduleModalTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="ghost-button button--sm"
        onClick={() => setOpen(true)}
      >
        Edit
      </button>
      <EditScheduleModal
        open={open}
        onClose={() => setOpen(false)}
        courseId={courseId}
        courseName={courseName}
        courseNumber={courseNumber}
        currentProfessorId={currentProfessorId}
        currentProfessorName={currentProfessorName}
        schoolId={schoolId}
        entryId={entryId}
        term={term}
        meetingTimes={meetingTimes}
      />
    </>
  );
}
