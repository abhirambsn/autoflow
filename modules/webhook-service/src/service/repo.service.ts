import axios from "axios";

export class RepoService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async createCommitRecord(commitData: any) {
        const repository = commitData?.repository;
        const commitDetail = commitData?.commits[0];
        const commitId = commitDetail?.id;
        const message = commitDetail?.message;
        const author = commitDetail?.author?.name;
        const email = commitDetail?.author?.email;
        const link = commitDetail?.url;
        const commitTime = commitDetail?.timestamp;
        const branch = commitData?.ref;

        const reqBody = {
            commitId,
            message,
            author,
            email,
            link,
            commitTime,
            branch,
            repoId: repository?.id,
        }

        try {
            const response = await axios.post(`${this.baseUrl}/api/v1/commits`, reqBody, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response?.status === 201 && response.data?.created) {
                console.log("Commit record created successfully:", commitId);
            } else {
                console.error("Failed to create commit record:", response.data);
            }
        } catch (error) {
            console.error("[WEBHOOK ERROR]", error);
        }
    }
}