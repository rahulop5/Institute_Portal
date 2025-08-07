import { useState } from "react";
import EvaluatorModal from "./EvaluatorModal"; // adjust path if needed

const DummyPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(true); // set to true for testing

  const dummyStudents = [
    {
      _id: "stu001",
      name: "Venkat Rahul Vempadapu",
      rollNumber: "S20230010257",
      binNumber: 1,
    },
    {
      _id: "stu002",
      name: "Reddi Abhiram Reddi",
      rollNumber: "S20230010203",
      binNumber: 2,
    },
    {
      _id: "stu003",
      name: "Sahal Ansar Theparambil",
      rollNumber: "S20230010210",
      binNumber: 3,
    },
  ];

  return (
    <>
      {isModalOpen && (
        <EvaluatorModal
          students={dummyStudents}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => {
            console.log("Submitted data:", data);
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default DummyPage;
