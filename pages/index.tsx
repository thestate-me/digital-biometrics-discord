import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import {
  Avatar,
  Box,
  Button,
  Center,
  Code,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useEffect } from 'react'

const Home: NextPage = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const { data: session } = useSession()
  const emailColor = useColorModeValue('gray.700', 'gray.200')
  const boxBgColor = useColorModeValue('gray.100', 'gray.900')
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector()
  })
  const { disconnect } = useDisconnect()

  const minimizeEtherWallet = (wallet: string) => {
    return wallet.slice(0, 6) + '...' + wallet.slice(-4)
  }
  useEffect(() => {
    if (session && session.user) {
      fetch('/api/check-is-in-server', {
        method: 'POST',
        body: JSON.stringify({
          session
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((res) => res.json())
        .then((json) => console.log(json))
    }
  }, [session])
  if (session) {
    const { user } = session
    console.log(session)
    return (
      <>
        <Box bg={boxBgColor} px={4}>
          <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
            <Box>
              <Text fontSize="2xl" as="b">
                TheState Reputation
              </Text>
            </Box>

            <Flex alignItems={'center'}>
              <Stack direction={'row'} spacing={7}>
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={'full'}
                    variant={'link'}
                    cursor={'pointer'}
                    minW={0}
                    border="1px solid #B794F4"
                    p="2px"
                  >
                    <Avatar size={'sm'} src={user?.image || ''} />
                  </MenuButton>
                  <MenuList alignItems={'center'}>
                    <br />
                    <Center>
                      <Avatar size={'2xl'} src={user?.image || ''} />
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
                    {isConnected && address
                      ? (
                      <center>
                        <Code>{minimizeEtherWallet(address)}</Code>
                      </center>
                        )
                      : null}
                    <MenuDivider mt="12px" />

                    <center>
                      <MenuItem onClick={toggleColorMode}>
                        {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                        <Text ml="6px">Switch Color Theme</Text>
                      </MenuItem>
                    </center>
                    <MenuDivider />
                    {/* <MenuItem>Your Account</MenuItem> */}
                    {isConnected && (
                      <MenuItem onClick={() => disconnect()}>
                        <Text color={'tomato'}>Disconnect Wallet</Text>
                      </MenuItem>
                    )}
                    <MenuItem onClick={() => signOut()}>
                      <Text color={'tomato'}>Logout Discord</Text>
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Stack>
            </Flex>
          </Flex>
        </Box>
        <Box m="30px auto">
          <Flex alignItems={'center'} justifyContent={'center'} mt="30px">
            {isConnected
              ? null
              : (
              <Flex flexDirection={'column'}>
                <Flex justifyContent={'center'} mb="20px">
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
    )
  }
  return (
    <>
      <Box bg={boxBgColor} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Box>
            <Text fontSize="2xl" as="b">
              TheState Reputation
            </Text>
          </Box>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Button onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>
              <Button
                onClick={() => signIn()}
                as={'a'}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'purple.600'}
                href={'#'}
                _hover={{
                  bg: 'purple.300'
                }}
              >
                Sign in with Discord
              </Button>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  )
}

export default Home
