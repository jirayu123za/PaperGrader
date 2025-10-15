"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Flex, Select, Title, MultiSelect, Loader, Text } from "@mantine/core";
import { useParams } from "next/navigation";
import { useFetchSections } from "../../../hooks/useFetchSelectSection";
import { useSectionsListStore, useSelectSectionStore } from "../../../store/useSectionStore";
import { useFetchAssignments } from "../../../hooks/Statistic/useFetchAssigmentStatistic";
import { useAssignmentStatisticStore, type AssignmentOption } from "../../../store/statistic/useAssignmentStatisticStore";

const ALL_SENTINEL = "all section";

export default function StatisticHeader({ title = "Assignment Statistics" }: { title?: string }) {
  const params = useParams();
  const course_id = params?.course_id as string;
  const assignmentIdFromParam = params?.assignment_id ? String(params.assignment_id) : null;

  const { isLoading: isLoadingSections, error: errorSections } = useFetchSections(course_id);
  const { sectionsList } = useSectionsListStore();
  const { selectedSections, setSelectedSections } = useSelectSectionStore();
  const [sectionSearch, setSectionSearch] = useState("");

  const baseSectionOptions = useMemo(
    () =>
      (sectionsList ?? []).map(
        (s: { section_id: string | number; section_name: string }) => ({
          value: String(s.section_id).trim(),
          label: String(s.section_name),
        })
      ),
    [sectionsList]
  );

  const hasSections = baseSectionOptions.length > 0;

  const sectionOptions = useMemo(
    () => (hasSections ? [{ value: ALL_SENTINEL, label: "All section" }, ...baseSectionOptions] : []),
    [hasSections, baseSectionOptions]
  );

  useEffect(() => {
    if (!hasSections) {
      if (selectedSections?.length) setSelectedSections([]);
      return;
    }
    if (!selectedSections || selectedSections.length === 0) {
      setSelectedSections([ALL_SENTINEL]);
    }
  }, [hasSections, selectedSections, setSelectedSections]);

  const handleSectionsChange = (next: string[]) => {
    if (!hasSections) return;

    const allowed = new Set(sectionOptions.map((o) => String(o.value)));
    const filtered = (next || []).map((v) => String(v).trim()).filter((v) => allowed.has(v));

    if (!filtered.length) {
      setSelectedSections([ALL_SENTINEL]);
      return;
    }

    const wasAllOnly = selectedSections?.length === 1 && selectedSections[0] === ALL_SENTINEL;

    if (wasAllOnly) {
      const chosen = filtered.filter((v) => v !== ALL_SENTINEL);
      setSelectedSections(chosen.length > 0 ? chosen : [ALL_SENTINEL]);
      return;
    }

    if (filtered.includes(ALL_SENTINEL)) {
      setSelectedSections([ALL_SENTINEL]);
      return;
    }

    setSelectedSections(filtered);
  };

  const hasAnySectionSelection = !!(selectedSections && selectedSections.length > 0);

  const {
    data: assignmentsRaw,
    isLoading: isLoadingAssignments,
    error: errorAssignments,
  } = useFetchAssignments(course_id);

  const assignmentsList = useAssignmentStatisticStore((s) => s.assignmentsList);
  const selectedAssignmentId = useAssignmentStatisticStore((s) => s.selectedAssignmentId);
  const setAssignmentsList = useAssignmentStatisticStore((s) => s.setAssignmentsList);
  const setSelectedAssignmentId = useAssignmentStatisticStore((s) => s.setSelectedAssignmentId);

  useEffect(() => {
    if (!assignmentsRaw) return;
    const mapped: AssignmentOption[] = (assignmentsRaw as any[]).map((a) => ({
      value: String(a.value ?? a.assignment_id ?? a.id),
      label: String(a.label ?? a.assignment_name ?? a.name ?? a.title ?? a.id),
    }));
    setAssignmentsList(mapped);
  }, [assignmentsRaw, setAssignmentsList]);

  const hasAssignments = assignmentsList.length > 0;
  const didInitFromParamRef = useRef(false);
  const didClearForNoParamRef = useRef(false);

  useEffect(() => {
    if (!hasAssignments) {
      setSelectedAssignmentId(null);
      didInitFromParamRef.current = false;
      didClearForNoParamRef.current = false;
      return;
    }

    if (assignmentIdFromParam && !didInitFromParamRef.current) {
      const exists = assignmentsList.some((opt) => String(opt.value) === assignmentIdFromParam);
      setSelectedAssignmentId(exists ? assignmentIdFromParam : null);
      didInitFromParamRef.current = true;
      didClearForNoParamRef.current = true;
      return;
    }

    if (!assignmentIdFromParam && !didClearForNoParamRef.current) {
      setSelectedAssignmentId(null);
      didClearForNoParamRef.current = true;
      return;
    }

  }, [
    hasAssignments,
    assignmentsList,
    assignmentIdFromParam,
    setSelectedAssignmentId,
  ]);

  if (isLoadingSections || isLoadingAssignments) {
    return (
      <div className="mt-3 pt-1">
        <Loader size="sm" />
      </div>
    );
  }

  if (errorSections) {
    return (
      <div className="mt-3 pt-1">
        <Text c="red">Error fetching sections</Text>
      </div>
    );
  }

  if (errorAssignments) {
    return (
      <div className="mt-3 pt-1">
        <Text c="red">Error fetching assignments</Text>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-1">
      <Flex justify="space-between" align="center" gap="md" wrap="wrap">
        <Title order={3}>{title}</Title>

        <Flex gap="sm" wrap="wrap">
          <Select
            data={hasAssignments ? assignmentsList : []}
            value={hasAssignments ? selectedAssignmentId : null}
            onChange={(v) => setSelectedAssignmentId(v)}
            checkIconPosition="right"
            size="sm"
            comboboxProps={{ withinPortal: true }}
            style={{ width: 320 }}
            placeholder={hasAssignments ? "Select assignment" : "No assignments"}
            aria-label="Select assignment"
            disabled={!hasAssignments}
            clearable={hasAssignments}
          />

          <MultiSelect
            data={sectionOptions}
            value={hasSections ? selectedSections : []}
            onChange={handleSectionsChange}
            label={hasAnySectionSelection ? undefined : "select section"}
            placeholder={hasSections ? "select section" : "No section"}
            maxDropdownHeight={160}
            comboboxProps={{ shadow: "md" }}
            searchable
            searchValue={sectionSearch}
            onSearchChange={setSectionSearch}
            style={{ width: 360 }}
            disabled={!hasSections}
            clearable
            styles={{
              pillsList: { display: "flex", flexWrap: "nowrap", overflowX: "auto", gap: 1 },
              pill: { whiteSpace: "nowrap", maxWidth: "unset" },
              input: { minWidth: 0 },
            }}
          />
        </Flex>
      </Flex>
    </div>
  );
}
