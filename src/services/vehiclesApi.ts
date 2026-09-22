import type { CreateVehiclePayload, Vehicle } from "../types/telemetry";

const VEHICLES_API_URL = "http://localhost:5000/api/vehicles";

type ApiErrorResponse = {
  success?: boolean;
  message?: string;
};

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await fetch(VEHICLES_API_URL);
  const data = (await response.json()) as {
    success: boolean;
    vehicles?: Vehicle[];
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || "Unable to load vehicles.");
  }

  return data.vehicles || [];
}

export async function createVehicle(
  payload: CreateVehiclePayload
): Promise<Vehicle> {
  const response = await fetch(VEHICLES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = (await response.json()) as {
    success: boolean;
    vehicle?: Vehicle;
    message?: string;
  };

  if (!response.ok) {
    const errorResponse = data as ApiErrorResponse;
    throw new Error(errorResponse.message || "Unable to create vehicle.");
  }

  if (!data.vehicle) {
    throw new Error("Backend did not return the created vehicle.");
  }

  return data.vehicle;
}