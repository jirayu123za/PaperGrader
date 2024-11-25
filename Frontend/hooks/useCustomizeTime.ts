import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCustomizeTimeStore } from '../store/useCustomizeTimeStore';

interface FetchResponse {
  sections: string[] | null;
  releaseDate: string | null;
  dueDate: string | null;
  cutOffDate: string | null;
}

interface UpdatePayload {
  sections: string[];
  releaseDate: string;
  dueDate: string;
  cutOffDate: string;
}

export const useCustomizeTime = (assignmentId: string) => {
  const { setSections, setDates } = useCustomizeTimeStore();
  const queryClient = useQueryClient();

  // Fetch data function
  const fetchCustomizeTime = async (): Promise<FetchResponse> => {
    if (!assignmentId) throw new Error('Invalid assignmentId');
    const response = await fetch(`/api/assignments/${assignmentId}/customize-time`);
    if (!response.ok) {
      throw new Error('Failed to fetch customize time');
    }
    const data = await response.json();
    return {
      sections: data.sections || null,
      releaseDate: data.releaseDate || null,
      dueDate: data.dueDate || null,
      cutOffDate: data.cutOffDate || null,
    };
  };

  // Update data function
  const updateCustomizeTimeApi = async (payload: UpdatePayload): Promise<FetchResponse> => {
    const response = await fetch(`/api/assignments/${assignmentId}/customize-time`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update customize time');
    }
    return response.json();
  };

  // UseQuery for fetching data
  const { data, isFetching, error } = useQuery<FetchResponse>({
    queryKey: ['customizeTime', assignmentId],
    queryFn: fetchCustomizeTime,
    enabled: Boolean(assignmentId),
  });

  // UseEffect to manage the query results
  useEffect(() => {
    if (data) {
      setSections(data.sections || []);
      setDates({
        releaseDate: data.releaseDate,
        dueDate: data.dueDate,
        cutOffDate: data.cutOffDate,
      });
    }
  }, [data, setSections, setDates]);

  // UseMutation for updating data
  const mutation = useMutation<FetchResponse, Error, UpdatePayload>({
    mutationFn: updateCustomizeTimeApi,
    onSuccess: (data: FetchResponse) => {
      setSections(data.sections || []);
      setDates({
        releaseDate: data.releaseDate,
        dueDate: data.dueDate,
        cutOffDate: data.cutOffDate,
      });
      queryClient.invalidateQueries({
        queryKey: ['customizeTime', assignmentId], // ใช้ queryKey ผ่าน object
      });
      console.log('Data updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating data:', error);
    },
  });

  return {
    data,
    isFetching, // ใช้ isFetching แทน isLoading
    error,
    isUpdating: mutation.status === 'pending', // แก้ไขจาก isLoading เป็น status === 'pending'
    updateCustomizeTime: mutation.mutate,
  };
};
