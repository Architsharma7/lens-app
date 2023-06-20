import { TypedDataDomain } from '@ethersproject/abstract-signer';
import { ethers, utils, Wallet } from 'ethers';
import { omit } from './helpers';

export const ethersProvider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/IpQGGBr2_thv6KAHEFTgsLyhBFBOQLVW');

export const getSigner = () => {
  const pk = `867848313c81495cdc7776fd60880a515e250df2cd26862a7c6fff1243d81825`
  return new Wallet(pk, ethersProvider);
};

export const getAddressFromSigner = () => {
  return getSigner().address;
};

export const signedTypeData = async (
  domain: TypedDataDomain,
  types: Record<string, any>,
  value: Record<string, any>
) => {
  const signer = getSigner();

  // remove the __typedname from the signature!
  const result = await signer._signTypedData(
    omit(domain, '__typename'),
    omit(types, '__typename'),
    omit(value, '__typename')
  );

  console.log('typed data - domain', omit(domain, '__typename'));
  console.log('typed data - types', omit(types, '__typename'));
  console.log('typed data - value', omit(value, '__typename'));
  console.log('typed data - signature', result);

  const whoSigned = utils.verifyTypedData(
    omit(domain, '__typename'),
    omit(types, '__typename'),
    omit(value, '__typename'),
    result
  );
  console.log('who signed', whoSigned);

  return result;
};

export const splitSignature = (signature: string) => {
  return utils.splitSignature(signature);
};

export const sendTx = (
  transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>
) => {
  const signer = getSigner();
  return signer.sendTransaction(transaction);
};

export const signText = (text: string) => {
  return getSigner().signMessage(text);
};