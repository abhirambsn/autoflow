import { Button } from "@ui5/webcomponents-react";

function LoginButton() {
  const loginWithGithub = async () => {
    const url = `${import.meta.env.VITE_API_URL}/api/v1/auth/github`;
    window.location.assign(url);
  };
  return (
    <Button onClick={loginWithGithub} design="Emphasized" icon="tnt/github">
      Login with Github
    </Button>
  );
}

export default LoginButton;
