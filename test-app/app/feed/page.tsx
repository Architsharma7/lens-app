"use client";
import { useEffect, useState } from "react";
import { client, explorePublications } from "../../lensapi";
import {
  LENS_CONTRACT_ADDRESS,
  LENS_CONTRACT_ABI,
} from "../constants/contract";
import { UseMirror } from "../hooks/mirror";
import { Web3Button } from "@thirdweb-dev/react";
import { useComment } from "../hooks/comment";

const Feed = () => {
  const [feeds, setFeeds] = useState<any>();
  const [comment, setComment] = useState<string>("");
  const { mutateAsync: createComment } = useComment();
  useEffect(() => {
    fetchFeed();
  }, []);
  async function fetchFeed() {
    try {
      let response = await client.query({ query: explorePublications });
      let feedData = await Promise.all(
        response.data.explorePublications.items.map(async (publicationInfo) => {
          let postData = await { ...publicationInfo };
          return postData;
        })
      );
      setFeeds(feedData);
      console.log(feedData);
    } catch (error) {
      console.log(error);
    }
  }

  const { mirror } = UseMirror();

  return (
    <div className="w-screen">
      <div className="w-2/3 mx-auto">
        <div className="flex flex-col justify-center">
          <div className="text-white">
            <p className="items-center flex justify-center mt-10 text-3xl text-green-500">
              Feed
            </p>
            {feeds &&
              feeds.map((feed) => {
                return (
                  <div key={feed.id} className="flex flex-col">
                    <div className="flex">
                      <p className="text-green-500 text-xl mt-5">
                        {feed.profile.handle}
                      </p>
                      {/* <p>{feed.createdAt}</p> */}
                    </div>
                    <div className="mt-2">
                      <p className="text-base text-white">
                        {feed.metadata.content}
                      </p>
                    </div>
                    <div className="w-full flex justify-between text-white">
                      <p>{feed.stats.totalAmountOfCollects} collects</p>
                      <p>{feed.stats.totalAmountOfComments} comments</p>
                      <p>{feed.stats.totalAmountOfMirrors} mirrors</p>
                      <Web3Button
                        contractAddress={LENS_CONTRACT_ADDRESS}
                        contractAbi={LENS_CONTRACT_ABI}
                        action={() => mirror(feed.profile.id, feed.id)}
                      >
                        mirror
                      </Web3Button>
                    </div>
                    <div className="flex flex-col">
                      <input
                        type="text"
                        onChange={(e) => setComment(e.target.value)}
                        value={comment}
                      ></input>
                      <Web3Button
                        contractAddress={LENS_CONTRACT_ADDRESS}
                        contractAbi={LENS_CONTRACT_ABI}
                        action={async () => {
                          return await createComment(
                            comment,
                            feed.profile.id,
                            feed.id
                          );
                        }}
                      >
                        Comment
                      </Web3Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
