import { useState, useRef } from "react";
import SimpleNavItem from "./SimpleNavItem";
import DropdownNavItem from "./DropdownNavItem";
import { SubMenuItem } from "./SubmenuItem";

// Image imports
import peopleIcon from "../../assets/people.png";
import settingsIcon from "../../assets/settings.svg";
import studentIcon from "../../assets/student.svg";
import staffIcon from "../../assets/staff.svg";
import facultyIcon from "../../assets/facukty.svg";
import honorsIcon from "../../assets/person-rays.svg";
import btpIcon from "../../assets/BTP.svg";
import feedbackIcon from "../../assets/feedback-cycle-loop 1.svg";
import academicsIcon from "../../assets/book-open-cover 1.svg";
import homeIcon from "../../assets/home 2.svg";
import arrow from "../../assets/arrow.svg";
import LogoutButton from "./LogoutButton";

export default function Sidebar() {
  const [isSidebarClosed, setIsSidebarClosed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const toggleBtnRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarClosed(!isSidebarClosed);
    setOpenDropdown(null); // Close all submenus
  };

  const toggleSubMenu = (index) => {
    if (openDropdown === index) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(index);
    }

    if (isSidebarClosed) {
      setIsSidebarClosed(false);
    }
  };

  return (
    <nav id="sidebar" className={isSidebarClosed ? "close" : ""}>
      <ul>
        <SimpleNavItem to="/" icon={homeIcon} label="Home" />

        <DropdownNavItem
          index={0}
          isOpen={openDropdown === 0}
          toggleSubMenu={toggleSubMenu}
          icon={academicsIcon}
          label="Academics"
          arrowIcon={arrow}
        >
          <SubMenuItem to="/academics/honors" icon={honorsIcon} label="Honors" />
          <SubMenuItem to="/academics/btp" icon={btpIcon} label="BTP" />
          <SubMenuItem to="/academics/feedback" icon={feedbackIcon} label="Feedback Form" />
        </DropdownNavItem>

        <DropdownNavItem
          index={1}
          isOpen={openDropdown === 1}
          toggleSubMenu={toggleSubMenu}
          icon={peopleIcon}
          label="People"
          arrowIcon={arrow}
        >
          <SubMenuItem to="/people/student" icon={studentIcon} label="Student" />
          <SubMenuItem to="/people/staff" icon={staffIcon} label="Staff" />
          <SubMenuItem to="/people/faculty" icon={facultyIcon} label="Faculty" />
        </DropdownNavItem>

        <SimpleNavItem to="/settings" icon={settingsIcon} label="Settings" />
        <LogoutButton />
        
      </ul>
    </nav>
  );
}
