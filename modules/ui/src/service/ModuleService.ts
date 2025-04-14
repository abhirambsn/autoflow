import axios from "axios";

export class ModuleService {
    private url: string = import.meta.env.VITE_API_URL as string;

    async createModule(access_token: string, data: ModuleData) {
        const url = `${this.url}/api/v1/modules/`;
        try {
          const res = await axios.post(url, data, {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
          });
          return res.data;
        } catch (err) {
          console.error("[REPO SVC ERROR]", err);
          throw err;
        }
      }
    
      async getModules(access_token: string, ownerId: string, refresh?: boolean) {
        let url = `${this.url}/api/v1/modules/${ownerId}/all`;
        if (refresh) {
          url += "?refresh=true";
        }
        try {
          const res = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });
          return res.data;
        } catch (err) {
          console.error("[REPO SVC ERROR]", err);
          throw err;
        }
      }
    
      async getModuleData(access_token: string, moduleId: string) {
        const url = `${this.url}/api/v1/modules/${moduleId}`;
        try {
          const res = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });
          return res.data;
        } catch (err) {
          console.error("[REPO SVC ERROR]", err);
          throw err;
        }
      }


      async generateFilesTrigger(access_token: string, moduleId: string) {
        const url = `${this.url}/api/v1/modules/${moduleId}/generate`;
        try {
          const res = await axios.post(url, null, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });
          return res.data;
        }
        catch (err) {
          console.error("[REPO SVC ERROR]", err);
          throw err;
        }
      }
}