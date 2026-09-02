import "server-only";

import {
  getAdminChatSessionById as fetchSessionById,
  getAdminChatSessions as fetchSessions,
} from "@/features/chat/chat.repository";
import {
  getAdminJobApplicationById as fetchJobApplicationById,
  getAdminJobApplications as fetchJobApplications,
} from "@/features/job-applications/job-application.repository";
import { ensureStarterTopics } from "@/features/interview-prep/interview-prep.service";
import * as interviewPrepRepository from "@/features/interview-prep/interview-prep.repository";
import { requireAdmin } from "@/lib/auth/session";
import * as repository from "@/server/repositories/admin-content.repository";

async function authorized<T>(query: () => Promise<T>) {
  await requireAdmin();
  return query();
}

export function getAdminProfile() {
  return authorized(repository.getAdminProfile);
}

export function getAdminExperiences() {
  return authorized(repository.getAdminExperiences);
}

export function getAdminProjects() {
  return authorized(repository.getAdminProjects);
}

export function getAdminSkills() {
  return authorized(repository.getAdminSkills);
}

export function getAdminCertifications() {
  return authorized(repository.getAdminCertifications);
}

export function getAdminEducation() {
  return authorized(repository.getAdminEducation);
}

export function getAdminSocialLinks() {
  return authorized(repository.getAdminSocialLinks);
}

export function getAdminUseItems() {
  return authorized(repository.getAdminUseItems);
}

export function getAdminThemes() {
  return authorized(repository.getAdminThemes);
}

export function getAdminMessages() {
  return authorized(repository.getAdminMessages);
}

export function getAdminSettings() {
  return authorized(repository.getAdminSettings);
}

export function getAdminBlogPosts() {
  return authorized(repository.getAdminBlogPosts);
}

export function getAdminMedia() {
  return authorized(repository.getAdminMedia);
}

export function getAdminChatSessions(params: {
  search: string | undefined;
  status: string | undefined;
  page: number;
  pageSize: number;
}) {
  return authorized(() => fetchSessions(params));
}

export function getAdminChatSession(id: string) {
  return authorized(() => fetchSessionById(id));
}

export function getAdminJobApplications(params: {
  search: string | undefined;
  status: string | undefined;
  page: number;
  pageSize: number;
}) {
  return authorized(() => fetchJobApplications(params));
}

export function getAdminJobApplication(id: string) {
  return authorized(() => fetchJobApplicationById(id));
}

export async function getAdminInterviewPrepDashboard() {
  await requireAdmin();
  await ensureStarterTopics();
  return interviewPrepRepository.getDashboardStats();
}

export async function getAdminInterviewTopics() {
  await requireAdmin();
  await ensureStarterTopics();
  return interviewPrepRepository.listTopics();
}

export async function getAdminInterviewQuestions(
  filters: Parameters<typeof interviewPrepRepository.listQuestions>[0],
) {
  await requireAdmin();
  await ensureStarterTopics();
  return interviewPrepRepository.listQuestions(filters);
}

export async function getAdminInterviewQuestion(id: string) {
  await requireAdmin();
  return interviewPrepRepository.getQuestionById(id);
}

export async function getAdminInterviewExams(page: number, pageSize: number) {
  await requireAdmin();
  return interviewPrepRepository.listExams(page, pageSize);
}

export async function getAdminInterviewExam(id: string) {
  await requireAdmin();
  return interviewPrepRepository.getExamById(id);
}

export async function getAdminInterviewLearningItems(params: {
  status?: Parameters<typeof interviewPrepRepository.listLearningItems>[0]["status"];
  page: number;
  pageSize: number;
}) {
  await requireAdmin();
  return interviewPrepRepository.listLearningItems({
    page: params.page,
    pageSize: params.pageSize,
    ...(params.status ? { status: params.status } : {}),
  });
}

export async function getAdminInterviewLearningItem(id: string) {
  await requireAdmin();
  return interviewPrepRepository.getLearningItemById(id);
}

export async function getAdminInterviewPacks() {
  await requireAdmin();
  await ensureStarterTopics();
  return interviewPrepRepository.listPacks();
}

export async function getAdminInterviewPack(id: string) {
  await requireAdmin();
  return interviewPrepRepository.getPackById(id);
}

export async function getAdminInterviewQuestionPicker() {
  await requireAdmin();
  return interviewPrepRepository.listQuestionsForPicker();
}

export async function getAdminInterviewAnalytics() {
  await requireAdmin();
  await ensureStarterTopics();
  return interviewPrepRepository.getAnalytics();
}

export async function getAdminInterviewSkillCategories() {
  await requireAdmin();
  return interviewPrepRepository.listSkillCategories();
}
