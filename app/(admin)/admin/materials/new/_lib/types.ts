import type { Route } from "next";

export type MaterialForm = {
  courseId: string;
  title: string;
  module: string;
  pages: string[];
};

export type CourseOption = {
  id: string;
  code: string;
  title: string;
  status: string;
};

export type NoticeState = {
  open: boolean;
  title: string;
  message: string;
  redirectTo?: Route;
};

export type EditorInstance = HTMLDivElement;
