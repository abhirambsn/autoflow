import { useAuthState, useNavState } from "@/store";
import { useNotificationState } from "@/store/notificationState";
import { ShellBarProfileClickEventDetail } from "@ui5/webcomponents-fiori/dist/ShellBar.js";
import {
  Avatar,
  Bar,
  Button,
  FlexBox,
  FlexBoxAlignItems,
  FlexBoxJustifyContent,
  List,
  ListDomRef,
  ListItemStandard,
  MessageItem,
  MessageView,
  MessageViewDomRef,
  Popover,
  PopoverDomRef,
  ResponsivePopover,
  ShellBar,
  ShellBarDomRef,
  Text,
  Title,
  Ui5CustomEvent,
} from "@ui5/webcomponents-react";
import { ListItemClickEventDetail } from "@ui5/webcomponents/dist/List.js";
import ButtonDesign from "@ui5/webcomponents/dist/types/ButtonDesign.js";
import TitleLevel from "@ui5/webcomponents/dist/types/TitleLevel.js";
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

  const notifications = useNotificationState((state) => state.notifications);
  const notificationPopoverRef = useRef<PopoverDomRef>(null);
  const notificationMessageViewPopoverRef = useRef<MessageViewDomRef>(null);
  const [notificationsPopoverOpen, setNotificationsPopoverOpen] =
    useState(false);
  const [isOnNotificationDetailsPage, setIsOnNotificationDetailsPage] =
    useState(false);

  const openUserPopover = (
    e: Ui5CustomEvent<ShellBarDomRef, ShellBarProfileClickEventDetail>
  ) => {
    userPopoverRef.current!.opener = e.detail.targetRef;
    setUserPopoverOpen((prev) => !prev);
  };

  const openNotificationPopover = (
    e: Ui5CustomEvent<ShellBarDomRef, ShellBarProfileClickEventDetail>
  ) => {
    notificationPopoverRef.current!.opener = e.detail.targetRef;
    setNotificationsPopoverOpen((prev) => !prev);
  }

  const logout = () => {
    setAuthState({ isAuthenticated: false, user: {} as User });
    window.location.assign(
      `${import.meta.env.VITE_API_URL}/api/v1/auth/logout`
    );
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

  function getNotificationType(notification: NotificationMessage) {
    switch(notification.type) {
      case "SUCCESS":
        return "Positive";
      case "ERROR":
        return "Critical";
      case "WARN":
        return "Negative";
      case "INFO":
        return "Information";
    }
  }

  return (
    <>
      <ShellBar
        primaryTitle={primaryTitle}
        slot={slot}
        showNotifications
        notificationsCount={notifications.length.toString()}
        onNotificationsClick={openNotificationPopover}
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
      <ResponsivePopover
        ref={notificationPopoverRef}
        open={notificationsPopoverOpen}
        headerText="Notifications"
        className="contentPartNoPadding headerPartNoPadding"
        onClose={() => {
          notificationMessageViewPopoverRef.current?.navigateBack();
          setNotificationsPopoverOpen(false);
        }}
        header={
          <Bar
            startContent={
              <FlexBox alignItems={FlexBoxAlignItems.Center}>
                {isOnNotificationDetailsPage && (
                  <Button
                    design={ButtonDesign.Transparent}
                    icon="slim-arrow-left"
                    onClick={() => {
                      setIsOnNotificationDetailsPage(false);
                      notificationMessageViewPopoverRef.current?.navigateBack();
                    }}
                    style={{ marginInline: "0 0.5rem" }}
                  />
                )}

                <Title level={TitleLevel.H4}>Notifications</Title>
              </FlexBox>
            }
          />
        }
        footer={
          <FlexBox
            alignItems={FlexBoxAlignItems.Center}
            justifyContent={FlexBoxJustifyContent.End}
            style={{
              paddingBlock: "0.25rem",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Button
              design={ButtonDesign.Transparent}
              onClick={() => {
                setNotificationsPopoverOpen(false);
              }}
            >
              Close
            </Button>
          </FlexBox>
        }
      >
        <MessageView
          style={{
            maxWidth: "400px",
            height: "350px",
            width: "400px",
          }}
          ref={notificationMessageViewPopoverRef}
          showDetailsPageHeader={false}
          onItemSelect={() => {
            console.log("Item selected");
            setIsOnNotificationDetailsPage(true);
          }}
        >
          {notifications.map((notification) => (
            <MessageItem
              key={notification._id}
              titleText={notification.title}
              type={getNotificationType(notification)}
            >{notification.message}</MessageItem>
          ))}
        </MessageView>
      </ResponsivePopover>
    </>
  );
}

export default Navbar;
