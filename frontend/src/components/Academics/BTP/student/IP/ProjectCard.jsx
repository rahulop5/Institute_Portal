import classes from "../../../../styles/Inprogress.module.css";

export default function ProjectCard({ name, about }) {
  return (
    <div className={classes["project-card"]}>
      <h2>{name}</h2>
      <p>{about}</p>
    </div>
  );
}
