import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { AddPredictionRecordRequest, PredictionRecord } from '../backend';
import { getFarmerSessionId } from '../utils/session';

export function useGetHistory() {
    const { actor, isFetching } = useActor();
    const sessionId = getFarmerSessionId();

    return useQuery<PredictionRecord[]>({
        queryKey: ['history', sessionId.toString()],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getRecordsBySessionId(sessionId);
        },
        enabled: !!actor && !isFetching,
    });
}

export function useAddPrediction() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: AddPredictionRecordRequest) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.addPredictionRecord(request);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['history'] });
        },
    });
}

export function useGetPredictionById(id: bigint | null) {
    const { actor, isFetching } = useActor();

    return useQuery<PredictionRecord>({
        queryKey: ['prediction', id?.toString()],
        queryFn: async () => {
            if (!actor || id === null) throw new Error('No actor or id');
            return actor.getPredictionRecordById(id);
        },
        enabled: !!actor && !isFetching && id !== null,
    });
}
