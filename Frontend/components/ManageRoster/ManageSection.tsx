"use client";

import React, { useMemo, useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Table, Text, Button, Paper, Pagination, Skeleton, Flex, Image } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useFetchSections } from '../../hooks/Roster/useFetchSections';
import { useSectionDetailsStore } from '../../store/useRosterStore';
import { useModalStore } from '../../store/modal/useRosterModalStore';
import { usePagination, useViewportSize } from '@mantine/hooks';
import ViewStudentLists from './ViewStudentList';
import CreateSection from '../Create/CreateSection';

const FALLBACK_ROW_H = 48;
const FALLBACK_THEAD_H = 40;
const FALLBACK_TFOOT_H = 56;
const BOTTOM_PADDING = 12;
const SAFETY_GAP = 20;   
const MIN_ROWS = 1;
const MAX_ROWS = 50;

const ManageSection: React.FC = () => {
  const params = useParams();
  const course_id = params?.course_id as string;

  const { isLoading } = useFetchSections(course_id as string);
  const { sectionDetails } = useSectionDetailsStore();
  const openModal = useModalStore((s) => s.openModal);

  const { height: viewportH } = useViewportSize();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);    
  const headerRef = useRef<HTMLDivElement | null>(null);
  const theadRef = useRef<HTMLTableSectionElement | null>(null);
  const tfootRef = useRef<HTMLTableSectionElement | null>(null);
  const sampleRowRef = useRef<HTMLTableRowElement | null>(null);

  const [rowsPerPage, setRowsPerPage] = useState<number>(8);

  const getPaperVerticalPadding = () => {
    if (!paperRef.current || typeof window === 'undefined') return 50; 
    const cs = window.getComputedStyle(paperRef.current);
    const pt = parseFloat(cs.paddingTop || '0');
    const pb = parseFloat(cs.paddingBottom || '0');
    const bt = parseFloat(cs.borderTopWidth || '0');
    const bb = parseFloat(cs.borderBottomWidth || '0');
    return pt + pb + bt + bb;
  };

  const measure = () => {
    const top = wrapperRef.current?.getBoundingClientRect().top ?? 0;
    const vh = typeof window !== 'undefined' ? window.innerHeight : viewportH;
    const availableViewport = Math.max(0, vh - top - BOTTOM_PADDING);

    const headerH = headerRef.current?.getBoundingClientRect().height ?? 0;

    let theadH = theadRef.current?.getBoundingClientRect().height ?? FALLBACK_THEAD_H;
    if (!Number.isFinite(theadH) || theadH <= 0) theadH = FALLBACK_THEAD_H;

    let tfootH = tfootRef.current?.getBoundingClientRect().height ?? FALLBACK_TFOOT_H;
    if (!Number.isFinite(tfootH) || tfootH <= 0) tfootH = FALLBACK_TFOOT_H;

    const measuredRowH = sampleRowRef.current?.getBoundingClientRect().height;
    const rowH =
      Number.isFinite(measuredRowH as number) && (measuredRowH as number) > 0
        ? (measuredRowH as number)
        : FALLBACK_ROW_H;

    const paperPadding = getPaperVerticalPadding();
    const availableForRows =
      availableViewport - headerH - theadH - tfootH - paperPadding - SAFETY_GAP;
    const rawFit = availableForRows / rowH;
    let fit = Number.isFinite(rawFit) ? Math.floor(rawFit) : 8;
    const remainder = availableForRows - fit * rowH;
    if (remainder < 8) fit = fit - 1;

    const clamped = Math.max(MIN_ROWS, Math.min(MAX_ROWS, fit));
    if (clamped !== rowsPerPage) setRowsPerPage(clamped);
  };

  useLayoutEffect(() => {
    measure();
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        measure();
        setTimeout(measure, 0);
      });
    }
  }, [viewportH, sectionDetails.length, isLoading]);

  useEffect(() => {
    if (!wrapperRef.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  const safeRows = Number.isFinite(rowsPerPage) && rowsPerPage > 0 ? Math.floor(rowsPerPage) : 8;

  const totalPages = useMemo(() => {
    const pages = Math.ceil(sectionDetails.length / (safeRows || 1));
    return Math.max(1, pages);
  }, [sectionDetails.length, safeRows]);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
    siblings: 1,
    boundaries: 1,
  });

  useEffect(() => {
    pagination.setPage(1);
  }, [safeRows, sectionDetails.length]);

  const start = (pagination.active - 1) * safeRows;
  const end = start + safeRows;
  const pageData = sectionDetails.slice(start, end);

  return (
    <>
      {sectionDetails.length > 0 || isLoading ? (
        <div ref={wrapperRef}>
          <Paper
            ref={paperRef}               
            shadow="sm"
            radius="md"
            withBorder
            p="xl"
            mt="md"
            style={{ overflow: 'hidden' }}
          >
            <Flex ref={headerRef} justify="flex-end" mb="md">
              <CreateSection />
            </Flex>

            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead ref={theadRef}>
                <Table.Tr>
                  <Table.Th>Section name</Table.Th>
                  <Table.Th ta="center">Students enrolled</Table.Th>
                  <Table.Th ta="center">View</Table.Th>
                  <Table.Th ta="center">Remove</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {isLoading
                  ? Array.from({ length: safeRows }).map((_, i) => (
                      <Table.Tr key={`skeleton-${i}`} ref={i === 0 ? sampleRowRef : undefined}>
                        <Table.Td><Skeleton visible height={20} width="80%" /></Table.Td>
                        <Table.Td><Skeleton visible height={20} width="50%" /></Table.Td>
                        <Table.Td><Skeleton visible height={20} width="40%" /></Table.Td>
                        <Table.Td><Skeleton visible height={20} width="40%" /></Table.Td>
                      </Table.Tr>
                    ))
                  : pageData.map((section, idx) => (
                      <Table.Tr key={section.section_id} ref={idx === 0 ? sampleRowRef : undefined}>
                        <Table.Td pl="xl">{section.section_name}</Table.Td>
                        <Table.Td ta="center">{section.total_students}</Table.Td>
                        <Table.Td ta="center">
                          <Button
                            variant="subtle"
                            size="xs"
                            onClick={() =>
                              openModal({ sectionName: section.section_name, section_id: section.section_id })
                            }
                          >
                            View Student List
                          </Button>
                        </Table.Td>
                        <Table.Td ta="center">
                          <Button
                            variant="outline"
                            color="red"
                            size="xs"
                            onClick={() => console.log(`Remove Section ${section.section_id}`)}
                          >
                            Remove
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))}
              </Table.Tbody>

              <Table.Tfoot ref={tfootRef}>
                <Table.Tr>
                  <Table.Td colSpan={4} className="border-t border-gray-300">
                    <Flex align="center" w="100%" justify="space-between">
                      <Text size="sm" c="dimmed">
                        {sectionDetails.length > 0 ? `(${sectionDetails.length} Sections)` : 'No sections'}
                      </Text>
                      <Pagination
                        size="sm"
                        total={totalPages}
                        siblings={1}
                        boundaries={1}
                        value={pagination.active}
                        onChange={pagination.setPage}
                      />
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            </Table>
          </Paper>
        </div>
      ) : (
        <Flex justify="center" gap="md" direction="column" align="center">
          <Image alt="No sections" src="/Image/table/empty.svg" w={200} h={200} mt="lg" />
          <Text ta="center" c="dimmed">This course has no sections created yet.</Text>
          <CreateSection />
        </Flex>
      )}

      <ViewStudentLists />
    </>
  );
};

export default ManageSection;
