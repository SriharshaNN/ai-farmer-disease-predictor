import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WeatherSnapshot {
    precipitation: number;
    temperature: number;
    weatherDescription: string;
    humidity: number;
}
export type Time = bigint;
export interface AddPredictionRecordRequest {
    farmerSessionId: bigint;
    weatherSnapshot: WeatherSnapshot;
    confidenceScore: number;
    diseaseName: string;
    cropType: string;
}
export interface PredictionRecord {
    id: bigint;
    farmerSessionId: bigint;
    weatherSnapshot: WeatherSnapshot;
    confidenceScore: number;
    diseaseName: string;
    timestamp: Time;
    cropType: string;
}
export interface backendInterface {
    addPredictionRecord(request: AddPredictionRecordRequest): Promise<bigint>;
    getPredictionRecordById(id: bigint): Promise<PredictionRecord>;
    getRecordsBySessionId(sessionId: bigint): Promise<Array<PredictionRecord>>;
}
