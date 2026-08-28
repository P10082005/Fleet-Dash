export interface Vehicle {
    vehicles: string;
    latitude: number;
    longitude: number;
    speed: number;
    status: "moving" | "stopped" | "alert";
}