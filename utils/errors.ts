import { Alert } from "react-native";
import { APIError } from "../services/api";

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof APIError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string" && error.length > 0) {
    return error;
  }
  return fallback;
}

export function alertError(title: string, error: unknown): void {
  Alert.alert(title, getErrorMessage(error));
}
