"use client";

import React from "react";
import { useFetchInstructorFile } from "@/hooks/Student/useFetchInstructorFile";
import { useUploadStudentFile } from "@/hooks/Student/useUploadStudentFile";
import { useReceiveFileStore } from "@/store/Student/useReceiveFileStore";
import { useSubmitAndDownloadModalStore } from "@/store/modal/useSubmitAndDownloadModal";
import { Alert, Button, FileInput, Flex, Loader, Modal, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconFileText } from "@tabler/icons-react";
import { FaInfoCircle } from "react-icons/fa";

export const AssignmentFilesModal: React.FC = () => {
  const { assignment_id, course_id, opened, closeModal, files, fileNames } = useSubmitAndDownloadModalStore();
  const { isLoading } = useFetchInstructorFile();
  const { mutate: uploadStudentFile } = useUploadStudentFile();
  const { studentFile, setStudentFile } = useReceiveFileStore();
  const hasFiles = files.length > 0 && fileNames.length > 0;
  const templateFileText = "TemplateFile";
  const additionalFilesText = "AdditionalFiles";

  const form = useForm({
    initialValues: { file: null },
    validate: {
      file: (value) => (value ? null : "You must upload a PDF"),
    },
  });

  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = () => {
    if (!studentFile) {
      return;
    }
    uploadStudentFile(
      { course_id, assignment_id, file: studentFile }
    );
    closeModal();
  };

  return (
    <Modal
      opened={opened}
      onClose={closeModal}
      title="Submit Homework Assignment"
      size="lg"
    >
      {isLoading ? (
        <Flex justify="center" align="center" h="200px">
          <Loader/>
        </Flex>
      ) : (
        <>
          {hasFiles ? (
            <Alert
              title="Template and Additional files"
              color="blue"
              icon={<FaInfoCircle />}
              radius="md"
            >
              <Text size="sm">
                Instructor has provided the following files for this assignment:{" "}
                <Text span fw={600} c="orange">
                  {templateFileText}
                </Text>{" "}
                and{" "}
                <Text span fw={600} c="green">
                  {additionalFilesText}
                </Text>
                .
              </Text>
            </Alert>
          ) : (
            <Alert
              icon={<FaInfoCircle />}
              title="Template and Additional files"
              color="red"
              radius="md"
            >
              No file uploaded by the instructor.
            </Alert>
          )}

          {hasFiles && (
            <div className="my-4 space-y-3">
              {files[0] && fileNames[0] && (
                <Button
                  variant="light"
                  color="orange"
                  leftSection={<IconFileText size={18} />}
                  onClick={() => downloadFile(files[0], fileNames[0])}
                >
                  {fileNames[0]}
                </Button>
              )}

              {files.length > 1 && (
                <div className="space-y-1">
                  <Text size="xs" c="dimmed">
                    Additional files
                  </Text>
                  <div className="space-y-2">
                    {files.slice(1).map((fileUrl, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        color="green"
                        leftSection={<IconFileText size={18} />}
                        onClick={() => downloadFile(fileUrl, fileNames[index + 1])}
                      >
                        {fileNames[index + 1]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="my-4">
              <FileInput
                placeholder="Select PDF"
                label="Upload a PDF containing your responses to the assignment."
                value={studentFile}
                onChange={setStudentFile}
                accept="application/pdf"
                required
              />
            </div>
            {studentFile && (
              <div
                className="mb-4 text-sm text-gray-700 cursor-pointer underline"
                onClick={() => {
                  const fileUrl = URL.createObjectURL(studentFile);
                  window.open(fileUrl, "_blank");
                  setTimeout(() => URL.revokeObjectURL(fileUrl), 10000);
                }}
                title="Click to preview selected file"
              >
                <IconFileText className="inline-block mr-2" />
                Selected file: <strong>{studentFile.name}</strong>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={() => {
                  form.reset();
                  setStudentFile(null);
                  closeModal();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" color="blue" className="ml-2">
                Submit
              </Button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
};