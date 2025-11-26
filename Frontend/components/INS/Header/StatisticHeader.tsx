"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Flex, Select, Title, MultiSelect, Skeleton, Text } from "@mantine/core";
import { useStatisticSectionsStore } from "@/store/statistic/useStatisticSectionsStore";
import { useFetchStatisticSections } from "@/hooks/Statistic/useFetchStatisticSections";
import { useFetchAssignments } from "@/hooks/Statistic/useFetchAssignmentStatistic";
import { useAssignmentStatisticStore, type AssignmentOption } from "@/store/statistic/useAssignmentStatisticStore";

export default function StatisticHeader({ title = "Assignment Statistics" }: { title?: string }) {
  const params = useParams();
  const course_id = params?.course_id as string;
  const assignmentIDParam = params?.assignment_id as string;
  const { data: assignmentsData, isLoading: isLoadingAssignments, error: errorAssignments } = useFetchAssignments(course_id);

  const {assignmentsList, selectedAssignmentID, setSelectedAssignmentID} = useAssignmentStatisticStore((s) => ({
    assignmentsList: s.assignmentsList,
    selectedAssignmentID: s.selectedAssignmentID,
    setSelectedAssignmentID: s.setSelectedAssignmentID,
  }));

  const { sections, selectedSectionIDs, setSelectedSections } = useStatisticSectionsStore((s) => ({
    sections: s.sections,
    selectedSectionIDs: s.selectedSectionIDs,
    setSelectedSections: s.setSelectedSections,
  }));

  const assignments = useMemo<AssignmentOption[]>(() => {
    if (!assignmentsList) return [];
    return (assignmentsList as AssignmentOption[]).map((a) => ({
      value: String(a.value),
      label: String(a.label),
    }));
  }, [assignmentsList]);
  
  const hasAssignments = assignments.length > 0;

  const currentAssignmentID = selectedAssignmentID ??
    (assignments.some((opt) => 
      opt.value === assignmentIDParam)
      ? assignmentIDParam!
      : null
    );

  const { isFetching: isFetchingSections, isError: isErrorSections } = useFetchStatisticSections(course_id, currentAssignmentID);
  
  const handleAssignmentChange = (value: string | null) => {
    setSelectedAssignmentID(value);
  };

  const [sectionSearch, setSectionSearch] = useState("");
  const hasSections = sections.length > 0;
 
  const sectionOptions = useMemo(
    () =>
      sections
        .filter((s) => !s.is_all)
        .map((s) => ({
          value: String(s.section_id[0]),
          label: String(s.section_name),
        })),
    [sections]
  );

  const msValue = useMemo(
    () => selectedSectionIDs.map(String),
    [selectedSectionIDs]
  );

  const handleSectionsChange = (values: string[]) => {
    const selectedRows = sections.filter(
      (row) =>
        !row.is_all &&
        row.section_id.length === 1 &&
        values.includes(String(row.section_id[0]))
    );

    setSelectedSections(selectedRows);
  };

  const handleSelectAllSections = () => {
    const allValues = sections.filter((s) => 
      !s.is_all && s.section_id.length === 1).map((s) => String(s.section_id[0]));
    const selectedRows = sections.filter((row) => 
      !row.is_all && row.section_id.length === 1 && allValues.includes(String(row.section_id[0]))
    );
    setSelectedSections(selectedRows);
  };

  if (errorAssignments) {
    return (
      <div className="mt-3 pt-1">
        <Text c="red">Error fetching assignments</Text>
      </div>
    );
  }

  const showSelectAssignmentFirst = !currentAssignmentID;

  return (
    <div className="mt-3 pt-1">
      <Flex justify="space-between" align="center" gap="md" wrap="wrap">
        <Title order={3}>{title}</Title>

        <Flex gap="sm" wrap="wrap">
          <Select
            data={hasAssignments ? assignmentsList : []}
            value={hasAssignments ? currentAssignmentID : null}
            onChange={handleAssignmentChange}
            checkIconPosition="right"
            size="sm"
            comboboxProps={{ withinPortal: true }}
            style={{ width: 320 }}
            placeholder={
              hasAssignments
                ? "Select assignment"
                : isLoadingAssignments
                ? "Loading..."
                : "No assignments"
            }
            aria-label="Select assignment"
            disabled={!hasAssignments || isLoadingAssignments || !!errorAssignments || assignmentsData?.length === 0}
            clearable={hasAssignments}
          />

          {showSelectAssignmentFirst ? (
            <MultiSelect
              data={[]}
              value={[]}
              placeholder="Select assignment first"
              disabled
              style={{ width: 360 }}
            />
          ) : isFetchingSections ? (
            <Skeleton height={36} width={360} radius="md" />
          ) : isErrorSections ? (
            <Text c="red" style={{ width: 360, lineHeight: "36px" }}>
              Error fetching sections
            </Text>
          ) : (
            <Flex gap="xs" wrap="wrap">
            <MultiSelect
              w={360}
              data={sectionOptions}
              value={hasSections ? msValue : []}
              onChange={handleSectionsChange}
              placeholder={hasSections ? "Select sections" : "No sections"}
              disabled={!hasSections}
              maxDropdownHeight={160}
              comboboxProps={{ shadow: "md" }}
              searchValue={sectionSearch}
              onSearchChange={setSectionSearch}
              nothingFoundMessage="Nothing found..."
              clearable
              searchable
            />

            <Text
              size="xs"
              c="blue"
              style={{ cursor: "pointer", alignSelf: "center", whiteSpace: "nowrap" }}
              onClick={handleSelectAllSections}
            >
              Select all
            </Text>
          </Flex>
          )}
        </Flex>
      </Flex>
    </div>
  );
}
