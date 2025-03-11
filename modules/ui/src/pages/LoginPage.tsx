import LoginButton from "@/components/LoginButton";
import { Card, FlexBox, Page, Title } from "@ui5/webcomponents-react";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <Page noScrolling backgroundDesign="List" style={{ height: "100dvh", margin: 0, padding: 0 }}>
      <FlexBox alignItems="Center" style={{ height: "100%" }}>
        <img
          style={{ margin: 0, padding: 0 }}
          src={`https://picsum.photos/1000/${viewportHeight - 30}`}
        />
        <Card style={{ padding: "1rem" }}>
          <FlexBox style={{ padding: "1rem", gap: "1rem" }} direction="Column">
            <Title style={{ textAlign: "center" }} level="H4" size="H4">
              Login to Autoflow
            </Title>
            <LoginButton />
          </FlexBox>
        </Card>
      </FlexBox>
    </Page>
  );
};

export default LoginPage;
