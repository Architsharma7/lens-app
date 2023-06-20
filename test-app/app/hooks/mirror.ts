import {
  useCreateMirrorTypedDataMutation,
} from "@/graphql/generated";
import {
  getAddressFromSigner,
  signedTypeData,
  splitSignature,
} from "../ethers.service";
import {
  LENS_CONTRACT_ADDRESS,
  LENS_CONTRACT_ABI,
} from "../constants/contract";
import { ethers } from "ethers";
import { getSigner } from "../ethers.service";
import { useMutation } from "@tanstack/react-query";
import useLogin from "./uselogin";

export const UseMirror = async () => {
  const { mutateAsync: requestTypedData } = useCreateMirrorTypedDataMutation();

  const { mutateAsync: loginUser } = useLogin();
//   await loginUser();

  async function mirrorpost(profileId: any, publicationId?: any) {
    const typedData = await requestTypedData({
      request: {
        profileId: profileId,
        publicationId: publicationId,
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      },
    });

    const { domain, types, value } = typedData.createMirrorTypedData.typedData;

    const signature = await signedTypeData(domain, types, value);

    const { v, r, s } = splitSignature(signature);

    const lensHub = new ethers.Contract(
      LENS_CONTRACT_ADDRESS,
      LENS_CONTRACT_ABI,
      getSigner()
    );

    const address = getAddressFromSigner();

    const result = await lensHub.call("mirrorWithSig", {
      profileId: profileId,
      pubIdPointed: publicationId,
      referenceModule: false,
      sig: {
        v,
        r,
        s,
        deadline: value.deadline,
      },
    });
    console.log(result);
  }

  return useMutation(mirrorpost);
};
