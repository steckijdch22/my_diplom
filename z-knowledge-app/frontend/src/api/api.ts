import axios from "axios";
import { BACKEND_URL } from "../utils/constans";

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});
