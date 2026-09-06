export interface Vehicle {
    vehicleId: string;
    latitude: number;
    longitude: number;
    speed: number;
    status: "moving" | "stopped" | "alert";
}