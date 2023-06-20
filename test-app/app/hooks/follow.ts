import { useCreateFollowTypedDataMutation } from "../../graphql/generated";
import omit from "omit-deep";
import { signTypedDataWithOmmittedTypename, splitSignature } from "./helpers";
import { useAddress, useSDK } from "@thirdweb-dev/react";
import {
  LENS_CONTRACT_ADDRESS,
  LENS_CONTRACT_ABI,
} from "../constants/contract";
import { useMutation } from "@tanstack/react-query";
import useLogin from "./uselogin";

export const useFollow = async () => {
  const { mutateAsync: requestTypedData } = useCreateFollowTypedDataMutation();
  const sdk = useSDK();
  const address = useAddress();
  const {mutateAsync: loginUser} = useLogin();

  async function follow(userId: string) {

    await loginUser();

    const typedData = await requestTypedData({
      request: {
        follow: [
          {
            profile: userId,
          },
        ],
      },
    });

    const { domain, types, value } = typedData.createFollowTypedData.typedData;

    if (!sdk) return;
    const signature = await signTypedDataWithOmmittedTypename(
      sdk,
      domain,
      types,
      value
    );

    const { v, r, s } = splitSignature(signature.signature);

    const lensHubContract = await sdk.getContractFromAbi(
      LENS_CONTRACT_ADDRESS,
      LENS_CONTRACT_ABI
    );

    const result = await lensHubContract.call("followWithSig", {
      follower: address,
      profileIds: [userId],
      datas: value.datas,
      sig: {
        v,
        r,
        s,
        deadline: value.deadline,
      },
    });
  }


    return useMutation(follow);
};
