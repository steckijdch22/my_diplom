import { AxiosResponse } from "axios";
import { api } from "./api";
import { UserResponseDto } from "../types/user.types";

export const getUserByEmailAPI = async (email: string) => {
  const res: AxiosResponse<UserResponseDto> = await api.get(
    `/user/search?email=${email}`,
  );
  return res.data;
};
