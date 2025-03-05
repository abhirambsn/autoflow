import { SidebarLinks } from "@/constants/sidebar-links";
import { useTheme } from "@/context/ThemeContext";
import { useNavState } from "@/store";
import { SideNavigation, SideNavigationItem } from "@ui5/webcomponents-react";
import { useNavigate } from "react-router";

type SidebarProps = {
  slot?: string;
};

function Sidebar({ slot }: SidebarProps) {
  const navState = useNavState();
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  const handleNavigation = (link: SidebarLink) => {
    if (link.type === "link" && link.href) {
      navigate(link.href);
    } else {
      if (link.action) {
        link.action();
      }
    }
  };

  return (
    <SideNavigation
      fixedItems={
        <>
          <SideNavigationItem
            icon="light-mode"
            design="Action"
            unselectable
            text="Toggle Theme"
            onClick={toggleTheme}
          />
          <SideNavigationItem
            icon="log"
            design="Action"
            unselectable
            text="Logout"
          />
        </>
      }
      onSelectionChange={(e) =>
        navState.setNavState({ currentPage: e.detail.item.text })
      }
      slot={slot}
    >
      {SidebarLinks.map((link, index) => (
        <SideNavigationItem
          key={index}
          slot=""
          icon={link.icon}
          text={link.title}
          unselectable={link.type === "action"}
          design={link.type === "action" ? "Action" : "Default"}
          onClick={() => handleNavigation(link)}
        />
      ))}
    </SideNavigation>
  );
}

export default Sidebar;
