import { useAuthState, useNavState } from "@/store";
import { ShellBarProfileClickEventDetail } from "@ui5/webcomponents-fiori/dist/ShellBar.js";
import {
  Avatar,
  Button,
  FlexBox,
  List,
  ListDomRef,
  ListItemStandard,
  Popover,
  PopoverDomRef,
  ShellBar,
  ShellBarDomRef,
  Text,
  Title,
  Ui5CustomEvent,
} from "@ui5/webcomponents-react";
import { ListItemClickEventDetail } from "@ui5/webcomponents/dist/List.js";
import { useRef, useState } from "react";

type Props = {
  toggleSidebar: () => void;
  slot?: string;
};

function Navbar({ toggleSidebar, slot }: Props) {
  const primaryTitle = "Autoflow";

  const userData = useAuthState((authState: AuthState) => authState.user);
  const setAuthState = useAuthState((state) => state.setAuthState);

  const secondaryTitle = useNavState((state) => state.currentPage);
  const userPopoverRef = useRef<PopoverDomRef>(null);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  const openUserPopover = (
    e: Ui5CustomEvent<ShellBarDomRef, ShellBarProfileClickEventDetail>
  ) => {
    userPopoverRef.current!.opener = e.detail.targetRef;
    setUserPopoverOpen((prev) => !prev);
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, user: {} as User });
    window.location.assign("http://localhost:3000/api/v1/auth/logout");
  };

  function handleItemClick(
    e: Ui5CustomEvent<ListDomRef, ListItemClickEventDetail>
  ) {
    switch (e.detail.item.textContent) {
      case "Logout":
        console.log("Logging out...");
        logout();
        break;
      default:
        console.log(
          "Default case, you clicked on: ",
          e.detail.item.textContent
        );
        break;
    }
  }

  return (
    <>
      <ShellBar
        primaryTitle={primaryTitle}
        slot={slot}
        showNotifications
        notificationsCount="4"
        showSearchField
        secondaryTitle={secondaryTitle}
        profile={
          <Avatar>
            <img src={userData.avatarUrl} />
          </Avatar>
        }
        onProfileClick={openUserPopover}
        startButton={
          <Button
            icon="menu"
            onClick={toggleSidebar}
            tooltip="Collapse Side-bar"
          />
        }
      ></ShellBar>
      <Popover
        open={userPopoverOpen}
        ref={userPopoverRef}
        onClose={() => setUserPopoverOpen(false)}
        placement="Bottom"
        verticalAlign="Center"
      >
        {/* User Avatar */}
        <FlexBox gap={"0.8rem"} direction="Column" alignItems="Center">
          <Avatar size="L">
            <img src={userData.avatarUrl} />
          </Avatar>

          <Title level="H5" size="H5">
            {userData.displayName}
          </Title>
          <Text style={{ opacity: 0.5 }} emptyIndicatorMode="On">
            &#64;{userData.username}
          </Text>

          <hr style={{ width: "100%", opacity: 0.6 }} />

          <List separators="None" onItemClick={handleItemClick}>
            <ListItemStandard icon="account">Profile</ListItemStandard>
            <ListItemStandard icon="action-settings">Settings</ListItemStandard>
            <ListItemStandard icon="log" style={{ color: "red" }}>
              Logout
            </ListItemStandard>
          </List>
        </FlexBox>
      </Popover>
    </>
  );
}

export default Navbar;
