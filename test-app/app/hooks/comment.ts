import { useMutation } from "@tanstack/react-query";
import {
  PublicationMainFocus,
  useCreateCommentTypedDataMutation,
} from "@/graphql/generated";
import { signTypedDataWithOmmittedTypename, splitSignature } from "./helpers";
import { useAddress, useSDK, useStorageUpload } from "@thirdweb-dev/react";
import {
  LENS_CONTRACT_ADDRESS,
  LENS_CONTRACT_ABI,
} from "../constants/contract";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import { client, explorePublications } from "../../lensapi";

type Createcomment = {
  comment: string;
  profileId1: any;
  publicationId1: any;
};

export const useComment = () => {
  const { mutateAsync: requestTypedData } = useCreateCommentTypedDataMutation();
  const sdk = useSDK();
  const { mutateAsync: uploadToIpfs } = useStorageUpload();

  async function createComment({
    comment,
    profileId1,
    publicationId1,
  }: Createcomment) {
    const ipfsurl = (await uploadToIpfs({ data: [comment] }))[0];

    const metaData = {
      version: "2.0.0",
      mainContentFocus: PublicationMainFocus.TextOnly,
      metadata_id: uuidv4(),
      description: "Description",
      locale: "en-US",
      content: comment,
      external_url: null,
      image: null,
      imageMimeType: null,
      name: "Name",
      attributes: [],
      tags: [],
      appId: "",
    };

    const metadataUrl = await uploadToIpfs({ data: [metaData] });

    const typedData = await requestTypedData({
      request: {
        profileId: profileId1,
        collectModule: {
          freeCollectModule: {
            followerOnly: false,
          },
        },
        contentURI: metadataUrl,
        publicationId: publicationId1,
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      },
    });

    const { domain, types, value } = typedData.createCommentTypedData.typedData;

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

    const {
      profileId,
      contentURI,
      profileIdPointed,
      pubIdPointed,
      collectModule,
      collectModuleInitData,
      referenceModule,
    } = typedData.createCommentTypedData.typedData.value;

    const tx = await lensHubContract.call(
      "commentWithSig",
      {
        profileId: profileId,
        contentURI: contentURI,
        profileIdPointed: profileIdPointed,
        pubIdPointed: pubIdPointed,
        collectModule,
        collectModuleInitData,
        referenceModule,
        sig: {
          v,
          r,
          s,
          deadline: value.deadline,
        },
      },
      { gasLimit: 500000 }
    );

    console.log(tx);
  }

  return useMutation(createComment);
};
