"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Flex, Select, Title, MultiSelect, Skeleton, Text } from "@mantine/core";
import { useParams } from "next/navigation";
import { useStatisticSectionsStore, type StatisticSection } from "@/store/statistic/useStatisticSectionsStore";
import { useFetchStatisticSections } from "@/hooks/Statistic/useFetchStatisticSections";
import { useFetchAssignments } from "@/hooks/Statistic/useFetchAssigmentStatistic";
import { useAssignmentStatisticStore, type AssignmentOption } from "@/store/statistic/useAssignmentStatisticStore";
import { useStatisticsStore } from "@/store/statistic/useStatisticsStore";

const ALL_VALUE = "__ALL__";

export default function StatisticHeader({ title = "Assignment Statistics" }: { title?: string }) {
  const [sectionSearch, setSectionSearch] = useState("");

  const params = useParams();
  const course_id = params?.course_id as string;
  const assignmentIdFromParam = params?.assignment_id ? String(params.assignment_id) : null;

  const selectedAssignmentId = useAssignmentStatisticStore((s) => s.selectedAssignmentId);
  const {
    data: assignmentsRaw,
    isLoading: isLoadingAssignments,
    error: errorAssignments,
  } = useFetchAssignments(course_id);

  const assignmentsList = useAssignmentStatisticStore((s) => s.assignmentsList);
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
    }
  }, [hasAssignments, assignmentsList, assignmentIdFromParam, setSelectedAssignmentId]);

  const setCourseIdForSections = useStatisticSectionsStore((s) => s.setCourseId);
  const setAssignmentIdForSections = useStatisticSectionsStore((s) => s.setAssignmentId);

  useEffect(() => {
    setCourseIdForSections(course_id ?? null);
  }, [course_id, setCourseIdForSections]);

  useEffect(() => {
    if (selectedAssignmentId) setAssignmentIdForSections(selectedAssignmentId);
    else if (assignmentIdFromParam) setAssignmentIdForSections(assignmentIdFromParam);
    else setAssignmentIdForSections(null);
  }, [selectedAssignmentId, assignmentIdFromParam, setAssignmentIdForSections]);

  const { isFetching: isFetchingSections, isError: isErrorSections } = useFetchStatisticSections();

  const sections = useStatisticSectionsStore((s) => s.sections);
  const selectedSectionIds = useStatisticSectionsStore((s) => s.selectedSectionIds);
  const setSelectedByRows = useStatisticSectionsStore((s) => s.setSelectedByRows);

  const allRow = useMemo<StatisticSection | undefined>(() => sections.find((s) => s.is_all), [sections]);
  const allIds = allRow?.section_id ?? [];
  const hasSections = sections.length > 0;

  const sectionOptionsBase = useMemo(
    () =>
      sections
        .filter((s) => !s.is_all)
        .map((s) => ({ value: String(s.section_id[0]), label: String(s.section_name) })),
    [sections]
  );
  const sectionOptions = useMemo(() => {
    if (!sections.length) return [];
    return allRow ? [{ value: ALL_VALUE, label: "All section" }, ...sectionOptionsBase] : sectionOptionsBase;
  }, [sections.length, allRow, sectionOptionsBase]);

  const msValue = useMemo(() => {
    if (!hasSections) return [];
    const a = new Set(selectedSectionIds);
    const b = new Set(allIds);
    const isAllSelected = allIds.length > 0 && a.size === b.size && [...a].every((x) => b.has(x));
    if (isAllSelected) return [ALL_VALUE];
    const allowed = new Set(sectionOptionsBase.map((o) => o.value));
    return selectedSectionIds.filter((id) => allowed.has(String(id)));
  }, [hasSections, selectedSectionIds, allIds, sectionOptionsBase]);

  useEffect(() => {
    if (!hasSections) return;
    if (!selectedSectionIds.length && allRow) setSelectedByRows([allRow]);
  }, [hasSections, selectedSectionIds.length, allRow, setSelectedByRows]);

  const valuesToRows = (vals: string[]) =>
    sections.filter(
      (row) => !row.is_all && row.section_id.length === 1 && vals.includes(String(row.section_id[0]))
    );

  const handleSectionsChange = (next: string[]) => {
    if (!hasSections) return;
    if (next.length === 1 && next[0] === ALL_VALUE && allRow) {
      setSelectedByRows([allRow]);
      return;
    }
    if (next.includes(ALL_VALUE)) {
      const withoutAll = next.filter((v) => v !== ALL_VALUE);
      const rows = valuesToRows(withoutAll);
      setSelectedByRows(rows.length ? rows : allRow ? [allRow] : []);
      return;
    }
    const rows = valuesToRows(next);
    setSelectedByRows(rows.length ? rows : allRow ? [allRow] : []);
  };

  const setStatsCourseId = useStatisticsStore((s) => s.setCourseId);
  const setStatsAssignmentId = useStatisticsStore((s) => s.setAssignmentId);
  const setStatsSectionIds = useStatisticsStore((s) => s.setSectionIds);

  useEffect(() => {
    setStatsCourseId(course_id ?? null);
  }, [course_id, setStatsCourseId]);

  useEffect(() => {
    setStatsAssignmentId(selectedAssignmentId ?? assignmentIdFromParam ?? null);
  }, [selectedAssignmentId, assignmentIdFromParam, setStatsAssignmentId]);

  useEffect(() => {
    setStatsSectionIds(selectedSectionIds);
  }, [selectedSectionIds, setStatsSectionIds]);

  if (errorAssignments) {
    return (
      <div className="mt-3 pt-1">
        <Text c="red">Error fetching assignments</Text>
      </div>
    );
  }

  const showSelectAssignmentFirst = !selectedAssignmentId && !assignmentIdFromParam;

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
