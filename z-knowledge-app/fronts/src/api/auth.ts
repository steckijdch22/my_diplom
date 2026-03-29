import axios from "axios";

export const registration = async (email: string, password: string) => {
  const response = await axios.post("http://localhost:3000/auth/register", {
    email,
    password,
    username: "test_name",
  });
  return response.data;
};
