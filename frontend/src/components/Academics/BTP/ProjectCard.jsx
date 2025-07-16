export default function ProjectCard({ name, about }) {
  return (
    <div className="project-card">
      <h2>▸ {name}</h2>
      <p>{about}</p>
    </div>
  );
}
