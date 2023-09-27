import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Center,
  Code,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { fetchDiscordMessages, fetchOpenAI, fetchStore } from "../utils/api";

const Home: NextPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { data: session } = useSession();
  const emailColor = useColorModeValue("gray.700", "gray.200");
  const boxBgColor = useColorModeValue("gray.100", "gray.900");
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  const minimizeEtherWallet = (wallet: string) => {
    return wallet.slice(0, 6) + "..." + wallet.slice(-4);
  };
  const [messages, setMessages] = useState([]);
  const [openAIres, setopenAIres] = useState();
  const [storeResult, setStoreResult] = useState();
  const handleExecuteEas = async () => {
    console.log("executing");
    const discordMessages = await fetchDiscordMessages(session);
    setMessages(discordMessages.messages);
    if (messages && messages.length > 0 && session && session.user) {
      console.log("openai");
      const openAIresponse = await fetchOpenAI(session, messages);
      console.log("openAIresponse", openAIresponse);
      const storeRes = await fetchStore(address, openAIresponse);

      setStoreResult(storeRes);
      console.log("storeRes", storeRes);
    }
  };

  useEffect(() => {
    if (session && session.user && address) handleExecuteEas();
  }, [session, address]);

  if (session) {
    const { user } = session;
    console.log(session);
    return (
      <>
        <Box bg={boxBgColor} px={4}>
          <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
            <Box>
              <Text fontSize="2xl" as="b">
                TheState Reputation
              </Text>
            </Box>

            <Flex alignItems={"center"}>
              <Stack direction={"row"} spacing={7}>
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={"full"}
                    variant={"link"}
                    cursor={"pointer"}
                    minW={0}
                    border="1px solid #B794F4"
                    p="2px"
                  >
                    <Avatar size={"sm"} src={user?.image || ""} />
                  </MenuButton>
                  <MenuList alignItems={"center"}>
                    <br />
                    <Center>
                      <Avatar size={"2xl"} src={user?.image || ""} />
                    </Center>
                    <br />
                    <Center>
                      <Text fontSize="22px" as="b">
                        {user?.name}
                      </Text>
                    </Center>
                    <center>
                      <Text fontSize="15px" color={emailColor}>
                        {user?.email}
                      </Text>
                    </center>
                    {isConnected && address ? (
                      <center>
                        <Code>{minimizeEtherWallet(address)}</Code>
                      </center>
                    ) : null}
                    <MenuDivider mt="12px" />

                    <center>
                      <MenuItem onClick={toggleColorMode}>
                        {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                        <Text ml="6px">Switch Color Theme</Text>
                      </MenuItem>
                    </center>
                    <MenuDivider />
                    {/* <MenuItem>Your Account</MenuItem> */}
                    {isConnected && (
                      <MenuItem onClick={() => disconnect()}>
                        <Text color={"tomato"}>Disconnect Wallet</Text>
                      </MenuItem>
                    )}
                    <MenuItem onClick={() => signOut()}>
                      <Text color={"tomato"}>Logout Discord</Text>
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Stack>
            </Flex>
          </Flex>
        </Box>
        <Flex flexDirection={"column"} alignItems={"center"}>
          {/* {openAIres && openAIres}
          {messages &&
            messages.length &&
            messages.map((message: any) => (
              <Box
                key={message.id}
                maxW={"3xl"}
                w={"full"}
                bg={boxBgColor}
                boxShadow={"2xl"}
                rounded={"md"}
                p={6}
                overflow={"hidden"}
                mb="20px"
              >
                {message.user}: {message.text}
              </Box>
            ))} */}
        </Flex>

        <Box m="30px auto">
          <Flex alignItems={"center"} justifyContent={"center"} mt="30px">
            {isConnected ? null : (
              <Flex flexDirection={"column"}>
                <Flex justifyContent={"center"} mb="20px">
                  Now, connect your wallet to Discord.
                </Flex>

                <Button bg="purple.500" color="white" onClick={() => connect()}>
                  Connect Wallet
                </Button>
              </Flex>
            )}
          </Flex>
        </Box>
      </>
    );
  }
  return (
    <>
      <Box bg={boxBgColor} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <Box>
            <Text fontSize="2xl" as="b">
              TheState Reputation
            </Text>
          </Box>

          <Flex alignItems={"center"}>
            <Stack direction={"row"} spacing={7}>
              <Button onClick={toggleColorMode}>
                {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              </Button>
              <Button
                onClick={() => signIn()}
                as={"a"}
                fontSize={"sm"}
                fontWeight={600}
                color={"white"}
                bg={"purple.600"}
                href={"#"}
                _hover={{
                  bg: "purple.300",
                }}
              >
                Sign in with Discord
              </Button>
            </Stack>
          </Flex>
        </Flex>
      </Box>
      <Flex
        w="100%"
        h="100%"
        justifyContent="center"
        alignItems="center"
        mt="100px"
      >
        <Heading as="h1" size="4xl" textAlign={"center"}>
          Analyze your Discord server
          <br />↓ <br />
          Know your reputation
          <br />↓ <br />
          Store it on the blockchain
          <br />↓ <br />
          Check attestation
        </Heading>
      </Flex>
    </>
  );
};

export default Home;
