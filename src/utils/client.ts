import { UserLimits } from "@/lib/types";
import axios, { AxiosError } from "axios";

export const fetchLimits = async (url: string) => {
  try {
    const response = await axios.request({
      method: "GET",
      url,
    });
    const limits = response.data as UserLimits;
    return { limits };
  } catch (err) {
    let error = "Something went wrong. Please try again.";
    if (err instanceof AxiosError) {
      if (typeof err.response?.data.error === "string") {
        err = err.response.data.error;
      }
    }
    return { error };
  }
};
