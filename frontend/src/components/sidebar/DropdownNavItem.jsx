import { NavLink } from "react-router";

export default function DropdownNavItem({
  index,
  isOpen,
  toggleSubMenu,
  icon,
  label,
  arrowIcon,
  children,
}) {
  return (
    <li>
      <button
        onClick={() => toggleSubMenu(index)}
        className={`dropdown-btn ${isOpen ? "rotate" : ""}`}
      >
        <img src={icon} alt={`${label} Icon`} height="24" width="24" />
        <span>{label}</span>
        <img src={arrowIcon} alt="Arrow" height="20" width="20" />
      </button>
      <ul className={`sub-menu ${isOpen ? "show" : ""}`}>
        <div>{children}</div>
      </ul>
    </li>
  );
}
