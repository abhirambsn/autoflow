import { DeploymentService } from "@/service/DeploymentService";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const deploymentService = new DeploymentService();

export const useDeploymentState = create<DeploymentState>()(
  devtools(
    persist(
      (set, get) => ({
        status: null,
        runId: null,
        type: null,

        startDeployment: async (access_token, type, config) => {
          set({
            status: { status: "starting", loading: true },
            type,
          });

          const res = await deploymentService.triggerDeployment(
            access_token,
            type,
            config
          );
          const runId = type === "github" ? res.runId : res.buildNumber;
          set({ runId });

          setTimeout(
            () => get().pollStatus(access_token, { ...config, runId }),
            5000
          );
        },
        pollStatus: async (access_token: string, config: any) => {
          const { runId, type } = get();
          if (!runId || !type) return;

          let payload;
          if (type === "jenkins") {
            payload = {
              jenkinsJobName: config.jenkinsJobName,
              buildNumber: runId,
            };
          } else if (type === "github") {
            payload = {
              repo: config.repo,
              runId,
            };
          }

          const status = await deploymentService.getDeploymentStatus(
            access_token,
            type,
            payload
          );

          set({
            status: status as DeploymentStatus,
          });

          if (
            status.status !== "completed" &&
            status.conclusion !== "failure" &&
            status.conclusion !== "success"
          ) {
            setTimeout(() => get().pollStatus(access_token, config), 5000);
          }
        },
      }),
      {
        name: "deploymentState",
      }
    ),
    { enabled: true }
  )
);
