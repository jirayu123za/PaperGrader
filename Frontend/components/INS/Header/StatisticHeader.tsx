"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Flex, Select, Title, MultiSelect, Skeleton, Text } from "@mantine/core";
import { useStatisticSectionsStore, type StatisticSection } from "@/store/statistic/useStatisticSectionsStore";
import { useFetchStatisticSections } from "@/hooks/Statistic/useFetchStatisticSections";
import { useFetchAssignments } from "@/hooks/Statistic/useFetchAssignmentStatistic";
import { useAssignmentStatisticStore, type AssignmentOption } from "@/store/statistic/useAssignmentStatisticStore";

const ALL_VALUE = "__ALL__";

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

  const { data: sectionsData, isFetching: isFetchingSections, isError: isErrorSections } = useFetchStatisticSections(course_id, currentAssignmentID);
  
  const handleAssignmentChange = (value: string | null) => {
    setSelectedAssignmentID(value);
  };

  const [sectionSearch, setSectionSearch] = useState("");
  const hasSections = sections.length > 0;
  const allSections = useMemo<StatisticSection | undefined>(() => sections.find((s) => s.is_all), [sections]);
  const allSectionIDs = allSections?.section_id ?? [];

  const sectionOptionsBase = useMemo(
    () =>
      sections
        .filter((s) => !s.is_all)
        .map((s) => ({
          value: String(s.section_id[0]),
          label: String(s.section_name),
        })),
    [sections]
  );

  const sectionOptions = useMemo(() => {
    if (!sections.length) return [];
    return allSections
      ? [{ value: ALL_VALUE, label: "All section" }, ...sectionOptionsBase]
      : sectionOptionsBase;
  }, [sections.length, allSections, sectionOptionsBase]);
  
  const msValue = useMemo(() => {
    if (!hasSections) return [];
    if (!selectedSectionIDs.length && allSections) {
      return [ALL_VALUE];
    }
    const a = new Set(selectedSectionIDs);
    const b = new Set(allSectionIDs);
    const isAllSelected = allSectionIDs.length > 0 && a.size === b.size && [...a].every((x) => b.has(x));
    if (isAllSelected) return [ALL_VALUE];
    const allowed = new Set(sectionOptionsBase.map((o) => o.value));

    return selectedSectionIDs.filter((id) => allowed.has(String(id)));
  }, [hasSections, selectedSectionIDs, allSectionIDs, allSections, sectionOptionsBase]);

  const valuesToSections = (vals: string[]) =>
      sections.filter(
        (row) =>
          !row.is_all &&
          row.section_id.length === 1 &&
          vals.includes(String(row.section_id[0]))
      );

  const handleSectionsChange = (next: string[]) => {
    if (!hasSections) return;

    if (next.length === 1 && next[0] === ALL_VALUE && allSections) {
      setSelectedSections([allSections]);
      return;
    }

    if (next.includes(ALL_VALUE)) {
      const withoutAll = next.filter((v) => v !== ALL_VALUE);
      const sections = valuesToSections(withoutAll);
      setSelectedSections(sections.length ? sections : allSections ? [allSections] : []);
      return;
    }

    const sections = valuesToSections(next);
    setSelectedSections(sections.length ? sections : allSections ? [allSections] : []);
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
            <MultiSelect
              data={sectionOptions}
              value={hasSections ? msValue : []}
              onChange={handleSectionsChange}
              placeholder=""
              disabled={!hasSections}
              maxDropdownHeight={160}
              comboboxProps={{ shadow: "md" }}
              searchable
              searchValue={sectionSearch}
              onSearchChange={setSectionSearch}
              style={{ width: 360 }}
              clearable
              styles={{
                pillsList: {
                  display: "flex",
                  flexWrap: "nowrap",
                  overflowX: "auto",
                  gap: 1,
                },
                pill: { whiteSpace: "nowrap", maxWidth: "unset" },
                input: { minWidth: 0 },
              }}
            />
          )}
        </Flex>
      </Flex>
    </div>
  );
}
