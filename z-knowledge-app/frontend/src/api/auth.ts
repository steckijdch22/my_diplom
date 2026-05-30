import { AxiosResponse } from "axios";
import { api } from "./api";
import { JwtPayload } from "../types/user.types";

type RegistrationResponse = {
  user: {
    id: string;
    email: string;
    username: string;
  };
  accessToken: string;
};

export const registration = async (
  email: string,
  password: string,
  publicKey: string,
) => {
  const response: AxiosResponse<RegistrationResponse> = await api.post(
    "/auth/register",
    {
      email,
      password,
      username: "test_name",
      publicKey,
    },
  );
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response: AxiosResponse<{ user: JwtPayload }> = await api.post(
    "/auth/login",
    {
      email,
      password,
    },
  );
  return response.data;
};

export const logoutApi = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const checkProfileApi = async () => {
  const response: AxiosResponse<JwtPayload> = await api.get("/auth/profile");
  return response.data;
};
