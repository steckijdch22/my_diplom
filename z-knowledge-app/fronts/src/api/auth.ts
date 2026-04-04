import { api } from "./api";

export const registration = async (email: string, password: string) => {
  const response = await api.post("/auth/register", {
    email,
    password,
    username: "test_name",
  });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};
