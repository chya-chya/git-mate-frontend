import { api } from "./api";

export interface DeactivateAccountResponse {
  success: boolean;
  status: "DEACTIVATED";
}

export const userService = {
  deactivateAccount: async () => {
    const { data } = await api.post<DeactivateAccountResponse>("/user/deactivate");
    return data;
  },
};
