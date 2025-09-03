import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAssignmentSettingFormStore } from '@/store/modal/useAssignmentSettingModal';

interface Assignment {
  assignment_id: string;
  assignment_name: string;
  assignment_description: string;
  group_submitted: boolean;
  late_submitted: boolean;
  regrades: boolean;
  submitted_by: string;
}

interface AssignmentSections {
  section_id: string;
  section_name: string;
  published: boolean;
  release_date: string | null;
  due_date: string | null;
  cut_off_date: string | null;
}

interface AssignmentSettingResponse {
  assignment: Assignment;
  assignmentSections: AssignmentSections[];
}

export const useFetchAssignmentSetting = (course_id: string, assignment_id: string) => {
  const { setAll, setAssignmentSections } = useAssignmentSettingFormStore.getState();

  return useQuery<AssignmentSettingResponse, Error>({
    queryKey: ['assignment_setting', course_id, assignment_id],
    queryFn: async (): Promise<AssignmentSettingResponse> => {
      const response = await axios.get('/api/api/instructor/assignment', {
        params: { course_id, assignment_id },
      });

      if (response.status !== 200) {
        throw new Error('Failed to fetch assignment setting');
      }

      const { assignment, assignment_sections } = response.data.assignment_setting;

      const assignmentSectionsData = assignment_sections.map((AssignmentSections: AssignmentSections) => ({
        section_id: AssignmentSections.section_id,
        section_name: AssignmentSections.section_name,
        published: AssignmentSections.published,
        release_date: AssignmentSections.release_date,
        due_date: AssignmentSections.due_date,
        cut_off_date: AssignmentSections.cut_off_date,
      }));

      const assignmentData: Assignment = {
        assignment_id: assignment.assignment_id,
        assignment_name: assignment.assignment_name,
        assignment_description: assignment.assignment_description,
        group_submitted: assignment.group_submitted,
        late_submitted: assignment.late_submitted,
        regrades: assignment.regrades,
        submitted_by: assignment.submitted_by,
      };

      const first = assignment_sections[0];
      const release = first?.release_date ? new Date(first.release_date) : null;
      const due = first?.due_date ? new Date(first.due_date) : null;
      const cutOff = first?.cut_off_date ? new Date(first.cut_off_date) : null;

      setAll({
        assignmentName: assignment.assignment_name,
        assignmentDescription: assignment.assignment_description,
        submittedBy: assignment.submitted_by,
        lateSubmitted: assignment.late_submitted,
        regrades: assignment.regrades,
        groupSubmitted: assignment.group_submitted,
        releaseDate: release ? release.toISOString() : null,
        dueDate: due ? due.toISOString() : null,
        cutOffDate: cutOff ? cutOff.toISOString() : null,
      });

      const assignmentSetting: AssignmentSettingResponse = {
        assignment: assignmentData,
        assignmentSections: assignmentSectionsData,
      };

      setAssignmentSections(assignmentSectionsData);
      return assignmentSetting;
    },
    enabled: !!course_id && !!assignment_id,
    refetchOnWindowFocus: false,
  });
};