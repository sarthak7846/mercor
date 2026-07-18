import axios from "axios";

export const scrapeGithub = async (username: string) => {
  const userRepos = await axios.get(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
  );
  return userRepos.data.map((x: any) => ({
    description: x.description,
    name: x.name,
    fullName: x.full_name,
    starCount: x.stargazers_count,
  }));
};
