"use client";

import { useEffect } from 'react';
import { useForm, UseFormReturnType } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { useSubmissionFileStore } from '../store/useINS_SubmissionStore';
import axios from 'axios';

interface FetchFileParams {
  course_id: string | undefined;
  assignment_id: string | undefined;
}

interface UseFetchFileReturn {
  form: UseFormReturnType<{ pdfUrl: string; loading: boolean }>;
  refetch: () => Promise<void>;
}

export const useFetchFile = ({ course_id, assignment_id }: FetchFileParams): UseFetchFileReturn => {
  const form = useForm<{ pdfUrl: string; loading: boolean }>({
    initialValues: {
      pdfUrl: '',
      loading: true,
    },
  });

  const fetchFileUrl = async () => {
    if (!course_id || !assignment_id) return;

    try {
      form.setFieldValue('loading', true);
      const response = await axios.get('/api/api/instructor/template/url', {
        params: { course_id: course_id, assignment_id: assignment_id },
      });

      form.setFieldValue('pdfUrl', response.data.url || '');
    } catch (error) {
      console.error('Error fetching PDF URL:', error);
      alert('Failed to load PDF. Please try again.');
    } finally {
      form.setFieldValue('loading', false);
    }
  };

  useEffect(() => {
    fetchFileUrl();
  }, [course_id, assignment_id]);

  return {
    form,
    refetch: fetchFileUrl,
  };
};

interface SubmissionFileResponse {
  message: string;
  submission_file_url: string;
}

export const useFetchSubmissionFile = (course_id: string, assignment_id: string, submission_id: string) => {
  const setSubmissionFile = useSubmissionFileStore((state) => state.setSubmissionFile);

  return useQuery<SubmissionFileResponse>({
    queryKey: ['submission_file_url', course_id, assignment_id, submission_id],
    queryFn: async () => {
      const response = await axios.get('/api/api/instructor/submission/fileURL', {
        params: {
          course_id: course_id,
          assignment_id: assignment_id,
          submission_id: submission_id,
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to fetch submission file');
      }
      if (response.data.submission_file_url) {
        setSubmissionFile({ submission_file_url: response.data.submission_file_url });
      }
      return response.data;
    },
    enabled: !!course_id && !!assignment_id && !!submission_id,
  });
};