import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  lookupPhone,
  updateProfilePicture,
  updateUser,
  validatePhone,
} from "./api";
import { IUserProfessionalClient } from "./types";
import { getComparablePhoneKey, normalizePhoneToE164 } from "@/utils/phone";

export const useUsers = () => {
  return useQuery<IUserProfessionalClient[], Error>({
    queryKey: ["users"],
    queryFn: getUsers,
  });
};

export const useUser = (id?: number) => {
  return useQuery<IUserProfessionalClient, Error>({
    queryKey: ["users", id],
    // @ts-ignore
    queryFn: () => getUserById(id!),
    enabled: !!id && id > 0,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["professional-clients"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IUserProfessionalClient> }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfilePicture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useValidatePhone = () => {
  const mutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const normalizedPhone = normalizePhoneToE164(phoneNumber);
      if (!normalizedPhone) {
        throw new Error("El telefono debe estar en formato E.164 (ej. +5218114684648).");
      }

      const users = await getUsers();
      const targetPhoneKey = getComparablePhoneKey(normalizedPhone);
      const exists = users.some((u) => {
        const currentPhoneKey = getComparablePhoneKey(u.phone_number);
        return Boolean(targetPhoneKey && currentPhoneKey && targetPhoneKey === currentPhoneKey);
      });

      if (exists) {
        throw new Error("El numero de telefono ya esta registrado con otro usuario.");
      }

      return validatePhone(normalizedPhone);
    },
  });

  return mutation;
};

export const useLookupPhone = () => {
  const mutation = useMutation({
    mutationFn: (phoneNumber: string) => lookupPhone(phoneNumber),
  });

  return mutation;
};

