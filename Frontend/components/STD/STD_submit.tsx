"use client";

import React, { useState } from "react";
import {
  Modal,
  Button,
  FileInput,
  Alert,
  Text as MantineText,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconDownload, IconFileText } from "@tabler/icons-react";
import { useFetchInstructorFile } from "@/hooks/Student/useFetchInstructorFile";
import { useUploadStudentFile } from "@/hooks/useUploadStudentFile";
import { useReceiveFileStore } from "@/store/Student/useReceiveFileStore";
import { useSubmitAndDownloadModalStore } from "@/store/modal/useSubmitAndDownloadModal";
import { notifications } from "@mantine/notifications";

const STDSubmit: React.FC = () => {
  const { assignment_id, course_id, opened, closeModal, files, fileNames } =
    useSubmitAndDownloadModalStore();
  const { isLoading } = useFetchInstructorFile();
  const { mutate: uploadStudentFile } = useUploadStudentFile();
  const { studentFile, setStudentFile } = useReceiveFileStore();

  const [submittedFileName, setSubmittedFileName] = useState<string | null>(
    null
  );

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
      console.log("No file selected");
      return;
    }

    if (submittedFileName && studentFile.name === submittedFileName) {
      notifications.show({
        title: "⚠️ Duplicate file",
        message: `ไฟล์ "${studentFile.name}" ถูกส่งไปแล้ว`,
        color: "yellow",
      });
      return;
    }

    uploadStudentFile(
      { course_id, assignment_id, file: studentFile },
      {
        onSuccess: () => {
          setSubmittedFileName(studentFile.name);
          closeModal(); // ✅ ปิด modal หลังอัปโหลด
        },
      }
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={closeModal}
      title="Submit Homework Assignment"
      size="lg"
    >
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {files.length && fileNames.length > 0 ? (
            <Alert
              title="Your Instructor has provided PDF files to help you complete your assignment"
              color="blue"
              radius="md"
            >
              {/* Template file box */}
              {files.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#E6F0FA",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <MantineText size="sm" color="blue" className="mb-2">
                    This is a template file.
                  </MantineText>
                  <div className="ml-2">
                    <Button
                      variant="light"
                      color="orange"
                      onClick={() => downloadFile(files[0], fileNames[0])}
                    >
                      <IconDownload size={18} className="inline-block mr-2" />
                      {fileNames[0]}
                    </Button>
                  </div>
                </div>
              )}

              {/* Additional files box */}
              {files.length > 1 && (
                <div
                  style={{
                    backgroundColor: "#E6F0FA",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <MantineText size="sm" color="blue" className="mb-2">
                    This is an additional file.
                  </MantineText>

                  {files.slice(1).map((fileUrl: string, index: number) => (
                    <div key={index} className="mb-2 ml-2">
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          downloadFile(fileUrl, fileNames[index + 1])
                        }
                      >
                        <IconDownload size={18} className="inline-block mr-2" />
                        {fileNames[index + 1]}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Alert>
          ) : (
            <Alert
              icon={<IconFileText size={16} />}
              title="No file available"
              color="red"
              radius="md"
            >
              No file uploaded by the instructor.
            </Alert>
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

export default STDSubmit;
