import { NavLink } from "react-router";

export default function SimpleNavItem({ to, icon, label }) {
  return (
    <li>
      <NavLink 
        to={to} 
        className={({ isActive }) => isActive ? "active" : ""}
      >
        <img src={icon} alt={`${label} Icon`} height="24" width="24" />
        <span>{label}</span>
      </NavLink>
    </li>
  );
}