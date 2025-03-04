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
      <SideNavigationItem
        icon="home"
        text="Home"
        onClick={() => navigate("/")}
      />
      <SideNavigationItem
        icon="list"
        text="Page 1"
        onClick={() => navigate("/page1")}
      />
      <SideNavigationItem
        icon="light-mode"
        text="Page 2"
        onClick={() => navigate("/page2")}
      />
    </SideNavigation>
  );
}

export default Sidebar;
