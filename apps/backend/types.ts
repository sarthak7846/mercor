import z from "zod";

export const PreInterviewBody = z.object({
  github: z.string(),
});

const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.string(),
});

const followUpsSchema = z.object({
  topic: z.string(),
  reason: z.string(),
});

export const candidateProfileSchema = z.object({
  githubUrl: z.string(),
  githubSummary: z.string(),
  experienceLevel: z.enum(["junior", "mid", "senior"]),
  primarySkills: z.array(z.string()),
  secondarySkills: z.array(z.string()),
  projects: z.array(projectSchema),
  openingMessage: z.string(),
});

export const interviewMemorySchema = z.object({
  stage: z.enum(["introduction", "technical", "behavioral", "closing"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionsAsked: z.number(),
  currentTopic: z.string().nullable(),
  topicQuestionCount: z.number(),
  totalQuestionsAsked: z.number(),
  remainingTopics: z.array(z.string()),
  completedTopics: z.array(z.string()),
  followUps: z.array(followUpsSchema),
  observedStrengths: z.array(z.string()),
  observedWeaknesses: z.array(z.string()),
  interviewerNotes: z.array(z.string()),
});

export const interviewTurnSchema = z.object({
  assistantMessage: z.string(),
  interviewMemory: interviewMemorySchema,
});

export type CandidateProfile = z.infer<typeof candidateProfileSchema>;
export type InterviewMemory = z.infer<typeof interviewMemorySchema>;

export const interviewResultSchema = z.object({
  feedback: z.string().describe("Feedback for the user"),
  score: z.int().describe("Score out of 10 for their interview"),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});
