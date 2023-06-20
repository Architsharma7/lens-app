"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  client,
  getPublications,
  getProfile,
  isFollowedByMe,
  createUnfollowTypedData,
} from "../../../lensapi";
import { ethers } from "ethers";
import {
  LENS_CONTRACT_ADDRESS,
  LENS_CONTRACT_ABI,
} from "../../constants/contract";
import { LENS_FOLLOW_NFT_ABI } from "@/app/constants/followcontract";
// import { Web3Button } from "@thirdweb-dev/react";
// import { useFollow } from "../../hooks/follow";

export default function Profile() {
  const [profile, setProfile] = useState<any>();
  const [publications, setPublications] = useState<any>([]);

  const pathName = usePathname();
  const handle = pathName?.split("/")[2];
  const [isFollowing, setIsFollowing] = useState<any>();

  useEffect(() => {
    if (handle) {
      fetchProfile();
    }
    // checkIfFollowing()
  }, [handle]);

  async function fetchProfile() {
    try {
      const returnedProfile = await client.query({
        query: getProfile,
        variables: { handle },
      });
      const profileData = { ...returnedProfile.data.profile };

      const picture = profileData.picture;
      if (picture && picture.original && picture.original.url) {
        if (picture.original.url.startsWith("ipfs://")) {
          let result = picture.original.url.substring(
            7,
            picture.original.url.length
          );
          profileData.avatarUrl = `http://lens.infura-ipfs.io/ipfs/${result}`;
        } else {
          profileData.avatarUrl = profileData.picture.original.url;
        }
      }
      setProfile(profileData);
      checkIfFollowing(profileData.id);

      const pubs = await client.query({
        query: getPublications,
        variables: {
          id: profileData.id,
          limit: 50,
        },
      });
      setPublications(pubs.data.publications.items);
    } catch (err) {
      console.log("error fetching profile...", err);
    }
  }

  async function checkIfFollowing(id) {
    try {
      console.log(id);
      if (id != undefined) {
        let response = await client.query({
          query: isFollowedByMe,
          variables: { id },
        });
        // let check = await Promise.all(
        //   response.data.isFollowedByMe.map(async (checkInfo) => {
        //     let data = await { ...checkInfo };
        //     return data;
        //   })
        // );
        setIsFollowing(response);
        console.log(response);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function followUser() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      LENS_CONTRACT_ADDRESS,
      LENS_CONTRACT_ABI,
      signer
    );

    try {
      console.log("request to follow");
      const tx = await contract.follow([profile.id], [0x0]);
      await tx.wait();
      console.log(`successfully followed ... ${profile.handle}`);
      console.log(tx);
    } catch (err) {
      console.log("error: ", err);
    }
  }

  // const {mutate: followUser} = useFollow()

  //////// unfollow ///////

  // const unfollow = async () => {
  //   // hard coded to make the code example clear
  //   try {
  //     const unfollowRequest = {
  //       profile: [profile.id],
  //    };

  //    const createUnfollow = await client.mutate({
  //      mutation: createUnfollowTypedData,
  //      variables: { profile },
  //    });

  //    const provider = new ethers.providers.Web3Provider(window.ethereum);
  //    const signer = provider.getSigner();

  //    const result = await createUnfollow
  //    const typedData = result.data.createUnfollowTypedData.typedData;

  //    const signature = await signedTypeData(typedData.domain, typedData.types, typedData.value);
  //    const { v, r, s } = splitSignature(signature);

  //    // load up the follower nft contract
  //    const followNftContract = new ethers.Contract(
  //      typedData.domain.verifyingContract,
  //      LENS_FOLLOW_NFT_ABI,
  //      signer
  //    );

  //    const sig = {
  //        v,
  //        r,
  //        s,
  //        deadline: typedData.value.deadline,
  //     }

  //    const tx = await followNftContract.burnWithSig(typedData.value.tokenId, sig);
  //    console.log(tx.hash);
  //   } catch (error) {
  //     console.log(error)
  //   }

  //   // 0x64464dc0de5aac614a82dfd946fc0e17105ff6ed177b7d677ddb88ec772c52d3
  //   // you can look at how to know when its been indexed here:
  //   //   - https://docs.lens.dev/docs/has-transaction-been-indexed
  // }

  //////// unfollow ///////

  // async function unfollowUser() {
  //   try {
  //     const client = await createClient()
  //     const response = await client.mutation(createUnfollowTypedData, {
  //       request: { profile: profile.id }
  //     }).toPromise()
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     const typedData = response.data.createUnfollowTypedData.typedData
  //     const contract = new ethers.Contract(
  //       typedData.domain.verifyingContract,
  //       LENS_FOLLOW_NFT_ABI,
  //       signer
  //     )
  //     const tx = await contract.burn(typedData.value.tokenId)
  //     await tx.wait()
  //     console.log(`successfully unfollowed ... ${profile.handle}`)
  //     } catch (err) {
  //       console.log('error:', err)
  //     }
  // }

  //////// unfollow ///////

  //////// unfollow ///////

  async function unfollow() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      LENS_CONTRACT_ADDRESS,
      LENS_FOLLOW_NFT_ABI,
      signer
    );
    const createUnfollow = await client.mutate({
      mutation: createUnfollowTypedData,
      variables: { profile: profile.id },
    });

    const typedData = createUnfollow.data.createUnfollowTypedData.typedData;
    try {
      console.log("request to unfollow");
      const tx = await contract.burn(typedData.value.tokenId);
      await tx.wait();
      console.log(`successfully unfollowed ... ${profile.handle}`);
      console.log(tx);
    } catch (err) {
      console.log("error: ", err);
    }
  }

  //////// unfollow ///////

  async function unfollowUser(profileId: string) {}

  //////// unfollow ///////

  if (!profile) return null;

  return (
    <div className="pt-20">
      <div className="flex flex-col justify-center items-center">
        <img className="w-64 rounded-full" src={profile.avatarUrl} />
        <p className="text-4xl mt-8 mb-8">{profile.handle}</p>
        <p className="text-center text-xl font-bold mt-2 mb-2 w-1/2">
          {profile.bio}
        </p>
        <button
        onClick={followUser}
          className="mt-6 text-green-500 bg-white px-5 rounded-xl text-xl font-bold"
        >
          Follow
        </button>
        <button
          onClick={unfollow}
          className="mt-6 text-green-500 bg-white px-5 rounded-xl text-xl font-bold"
        >
          UnFollow
        </button>
        {publications.map((pub) => (
          <div key={pub.id} className="shadow p-10 rounded mb-8 w-2/3">
            <p>{pub.metadata.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
