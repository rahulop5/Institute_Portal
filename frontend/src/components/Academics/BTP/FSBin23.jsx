import ApprovedCard from "./ApprovedCard";
import studentIcon from '../../../assets/studenticon.svg';
import FSTeamthere from "./FSTeamshow"; 

export default function FSBin23({ data }) {
  const approvedRequest = data.outgoingRequests.find((r) => r.isapproved);

  return (
    <>
      {data.facultyassigned && approvedRequest ? (
        <ApprovedCard request={approvedRequest} />
      ) : (
        <></>
      )}
      <FSTeamthere teamData={data.team} studentIcon={studentIcon} />
    </>
  );
}
