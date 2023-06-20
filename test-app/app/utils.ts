// import { ethers, utils } from 'ethers'
// import omitDeep from 'omit-deep'
// import { basicClient } from '@/lensapi'
// import { gql } from 'urql'


// const refreshMutation = gql`
//   mutation Refresh(
//     $refreshToken: Jwt!
//   ) {
//     refresh(request: {
//       refreshToken: $refreshToken
//     }) {
//       accessToken
//       refreshToken
//     }
//   }
// `
// export const STORAGE_KEY = "LH_STORAGE_KEY"

// export function trimString(string, length) {
//     if (!string) return null
//     return string.length < length ? string : string.substr(0, length-1) + "..."
//   }
  
//   export function parseJwt (token) {
//     var base64Url = token.split('.')[1];
//     var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//     var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//     }).join(''));
  
//     return JSON.parse(jsonPayload);
//   };
  
//   export async function refreshAuthToken() {
//     const token = parseJwt(localStorage.getItem(STORAGE_KEY))
//     if (!token) return
//     try {
//       const authData = await basicClient.mutation(refreshMutation, {
//         refreshToken: token.refreshToken
//       }).toPromise()
  
//       if (!authData.data) return
  
//       const { accessToken, refreshToken } = authData.data.refresh
//       const exp = parseJwt(refreshToken).exp
  
//       localStorage.setItem(STORAGE_KEY, JSON.stringify({
//         accessToken, refreshToken, exp
//       }))
  
//       return {
//         accessToken
//       }
//     } catch (err) {
//       console.log('error:', err)
//     }
//   }
  