import React from 'react';
import { useAssignments } from '../../hooks/useFetchSTD_Assignment';
import { useAssignmentStore } from '../../store/useSTD_AssignmentStore';
import { Card, Progress, Text, Checkbox , ScrollArea  } from '@mantine/core';
import dayjs from 'dayjs';


const convertToMMDDYYYY = (dateStr: string) => {
  const [day, month, year] = dateStr.split('-');
  return `${month}-${day}-${year}`;
};

const STD_Dashboard = () => {
  const { data: assignments, isLoading, error } = useAssignments();
  const { assignments: assignmentList } = useAssignmentStore();

  if (isLoading) return <div>Loading assignments...</div>;
  if (error) return <div>Error loading assignments: {error.message}</div>;


  const calculateProgress = (releaseDate: string, dueDate: string) => {
    const now = dayjs();
    

    const convertedReleaseDate = convertToMMDDYYYY(releaseDate);
    const convertedDueDate = convertToMMDDYYYY(dueDate);

    const release = dayjs(convertedReleaseDate, "MM-DD-YYYY");
    const due = dayjs(convertedDueDate, "MM-DD-YYYY");

    if (!release.isValid() || !due.isValid()) {
      return { diff: "Invalid date", progress: 0 };
    }

    const totalDuration = due.diff(release, 'day');
    const timePassed = now.diff(release, 'day');   

   
    const progress = totalDuration > 0 ? (timePassed / totalDuration) * 100 : 0;
    const diff = due.diff(now, 'day');

    return { diff, progress: progress > 100 ? 100 : progress };
  };


  const sortedAssignments = [...assignmentList].sort((a, b) => {
    const timeLeftA = dayjs(convertToMMDDYYYY(a.due_date), "MM-DD-YYYY").diff(dayjs(), 'day');
    const timeLeftB = dayjs(convertToMMDDYYYY(b.due_date), "MM-DD-YYYY").diff(dayjs(), 'day');
    return timeLeftA - timeLeftB;
  });

  return (
    <ScrollArea h={700} type="never">
    <div className="space-y-4 ">
      {sortedAssignments.map((assignment) => {
        const releaseDate = '1-10-2024';  
        const { diff, progress } = calculateProgress(releaseDate, assignment.due_date);

        return (
          <Card key={assignment.assignment_id} shadow="sm" padding="lg" radius="md" withBorder>
            <div className="flex justify-between items-center">
              <div className="w-1/4">
                <Text style={{ fontWeight: 500 }}>Course Code: {assignment.course_code}</Text>
                <Text size="sm" color="dimmed">
                  {assignment.course_name || "Unknown Course"}
                </Text>
              </div>

              <div className="w-2/4 flex items-center">
                <Checkbox />
                <Text size="sm" color="dimmed" className="ml-2">
                  {assignment.assignment_name}
                </Text>
              </div>

              <div className="w-1/4">
                <Text size="sm" color="dimmed">
                  Due in: {typeof diff === 'number' ? `${diff} Days` : diff}
                </Text>
                <Progress value={progress} />
              </div>
            </div>
          </Card>
          
        );
      })}
    </div>
    </ScrollArea>
  );
};

export default STD_Dashboard;
