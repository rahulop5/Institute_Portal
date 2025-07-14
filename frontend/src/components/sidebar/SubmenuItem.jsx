import { NavLink } from "react-router";

export function SubMenuItem({ to, icon, label }) {
  return (
    <li>
      <NavLink 
        to={to} 
        className={({ isActive }) => isActive ? "active" : ""}
      >
        <img src={icon} alt={`${label} Icon`} height="20" width="20" />
        <span>{label}</span>
      </NavLink>
    </li>
  );
}