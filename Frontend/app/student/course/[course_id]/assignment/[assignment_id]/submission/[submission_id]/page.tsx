import React from "react";
import { SubmissionPDFViewer } from "@/components/STD/SubmissionPDFViewer";
import { Container } from "@mantine/core";

export const metadata = {
  title: " Review Submission ",
  description: " Review Submission ",
};

const SubmissionPage = () => {
  return (
    <Container fluid mih="100vh" p={0}>
        <SubmissionPDFViewer />
    </Container>
  );
};

export default SubmissionPage;
