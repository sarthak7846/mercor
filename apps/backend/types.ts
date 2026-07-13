import z from "zod";

export const PreInterviewBody = z.object({
  github: z.string(),
});

const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.string(),
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
