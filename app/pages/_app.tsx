import "../styles/globals.css"
import type { AppProps } from "next/app"
import { ChakraProvider } from "@chakra-ui/react"
import WalletContextProvider from "../context/WalletContextProvider"
import { WorkspaceProvider } from "../context"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <WalletContextProvider>
        <WorkspaceProvider>
          <Component {...pageProps} />
        </WorkspaceProvider>
      </WalletContextProvider>
    </ChakraProvider>
  )
}

export default MyApp
