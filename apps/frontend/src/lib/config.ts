declare const __BACKEND_URL__: string;

export const BACKEND_URL =
  typeof __BACKEND_URL__ !== "undefined"
    ? __BACKEND_URL__
    : process.env.BUN_PUBLIC_BACKEND_URL!;
