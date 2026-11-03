import axios from "axios";
import { API_URL } from "./auth";

export type Iceberg = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  image_path?: string;
  mask_path?: string;
  status?: string;
  area?: number | null; // square nautical miles
};

export const SQ_NM_TO_KM2 = 3.429904;

export async function fetchIcebergs(): Promise<Iceberg[]> {
  const { data } = await axios.get<Iceberg[]>(`${API_URL}/icebergs`);
  return data;
}

export async function uploadImage(file: File): Promise<Iceberg> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await axios.post<Iceberg>(`${API_URL}/upload-image`, form);
  return data;
}

export async function loadDemo(): Promise<void> {
  await axios.post(`${API_URL}/seed-demo`);
}

export function fileUrl(path?: string): string | null {
  return path ? `${API_URL}/${path}` : null;
}
