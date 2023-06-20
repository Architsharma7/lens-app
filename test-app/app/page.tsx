"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { client, challenge, authenticate } from "../lensapi";

export default function Home() {
  const [address, setAddress] = useState();
  const [token, setToken] = useState();

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length) {
      setAddress(accounts[0]);
    }
  }
  async function connect() {
    const account = await window.ethereum.send("eth_requestAccounts");
    if (account.result.length) {
      setAddress(account.result[0]);
    }
  }
  async function login() {
    try {
      /* first request the challenge from the API server */
      const challengeInfo = await client.query({
        query: challenge,
        variables: { address },
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      /* ask the user to sign a message with the challenge info returned from the server */
      const signature = await signer.signMessage(
        challengeInfo.data.challenge.text
      );
      /* authenticate the user */
      const authData = await client.mutate({
        mutation: authenticate,
        variables: {
          address,
          signature,
        },
      });
      /* if user authentication is successful, you will receive an accessToken and refreshToken */
      const {
        data: {
          authenticate: { accessToken },
        },
      } = authData;
      console.log({ accessToken });
      setToken(accessToken);
    } catch (error) {
      console.log("Error signing in: ", error);
    }
  }

  return (
    <div>
      <div className="w-screen h-screen">
        <div className="flex justify-center items-center m-auto mt-36">
          {!address && (
            <div className="flex flex-col">
              <p className="text-white text-3xl">WELCOME TO LENS</p>
              <button
                className="mt-10 bg-white text-green-500 font-bold text-2xl rounded-xl"
                onClick={connect}
              >
                Connect
              </button>
            </div>
          )}
          {address && !token && (
            <div className="flex flex-col">
              <p className="text-white text-3xl">WELCOME TO LENS</p>
              <button
                onClick={login}
                className="mt-10 bg-white text-green-500 font-bold text-2xl rounded-xl px-10 items-center mx-auto"
              >
                Login
              </button>
            </div>
          )}
          {address && token && <h2>Successfully signed in!</h2>}
        </div>
      </div>
    </div>
  );
}
