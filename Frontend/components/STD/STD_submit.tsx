import React from 'react';
import { Modal, Button, FileInput, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDownload, IconFileText } from '@tabler/icons-react';
import { useFetchInstructorFile } from '../../hooks/useFetchInstructorFile';
import { useUploadStudentFile } from '../../hooks/useUploadStudentFile';
import { useFileStore } from '../../store/useSTDFileStore';
import { useSubmitAndDownloadModalStore } from '../../store/modal/useSubmitAndDownloadModal';

const STDSubmit: React.FC = () => {
  const { assignment_id, course_id, opened, closeModal, files, fileNames } = useSubmitAndDownloadModalStore();
  const { isLoading } = useFetchInstructorFile();
  const { mutate: uploadStudentFile } = useUploadStudentFile();
  const { studentFile, setStudentFile } = useFileStore();

  const form = useForm({
    initialValues: { file: null },
    validate: {
      file: (value) => (value ? null : 'You must upload a PDF'),
    },
  });

  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = () => {
    console.log('Selected file before submit:', studentFile);
    if (studentFile) {
      uploadStudentFile(
        { course_id, assignment_id, file: studentFile }, 
        { onSuccess: (data) => {
            console.log('Upload successful:', data);
            closeModal();
          },
          onError: (error) => {
            console.error('Upload failed:', error);
          },
        });
      } else {
    console.log('No file selected');
    }
  };

  return (
    <Modal opened={opened} onClose={closeModal} title="Submit Homework Assignment" size="lg">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {files.length && fileNames.length > 0 ? (
            <Alert title="Your Instructor has provided PDF files to help you complete your assignment" color="blue" radius="md">
              {/* แสดงรายการไฟล์ทั้งหมด */}
              {files.map((fileUrl: string, index: number) => (
                <Button
                  key={index}
                  variant="light"
                  onClick={() => downloadFile(fileUrl, fileNames[index])}
                  className="text-blue-500 hover:underline block"
                >
                  <IconDownload size={18} className="inline-block mr-2" />
                  {fileNames[index]}
                </Button>
              ))}
            </Alert>
          ) : (
            <Alert icon={<IconFileText size={16} />} title="No file available" color="red" radius="md">
              No file uploaded by the instructor.
            </Alert>
          )}

          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(); 
          }}>
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
              <div className="mb-4">
                <IconFileText className="inline-block mr-2" />
                {studentFile.name}
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                variant="default"
                onClick={() => {
                form.reset();
                setStudentFile(null);
                closeModal(); }}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                color="blue" 
                className="ml-2"
              >
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
