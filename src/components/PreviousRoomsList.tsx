"use client"

import { useEffect, useState } from "react"
import { useLocalStorage } from "@uidotdev/usehooks"
import { useRouter } from "next/navigation"
import { Box, Grid, Heading, Text } from "@chakra-ui/react"
import { Skeleton } from "@/components/ui/skeleton"
import { IPrevRoom } from "@/utils/misc"
import { PotluckCard } from "@/components/PotluckCard"
import { AnimatePresence, motion } from "framer-motion"

export const PreviousRoomsList = () => {
  const [mounted, setMounted] = useState(false)
  const [prevRooms, setPrevRooms] = useLocalStorage<IPrevRoom[]>("prevRooms", [])
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleNavigate = (id: string) => {
    router.push(`/potlucks/${id}`)
  }

  const handleRemove = (id: string) => {
    setPrevRooms((rooms) => rooms.filter((r) => r.id !== id))
  }

  // Show rooms in reverse chronological order
  const sortedRooms = [...prevRooms].reverse()

  if (!mounted) {
    return (
      <Box maxW="3xl" mx="auto" py={8}>
        <Grid
          gridTemplateColumns={{ base: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }}
          gap={4}
        >
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height="100px" rounded="xl" />
          ))}
        </Grid>
      </Box>
    )
  }

  if (sortedRooms.length === 0) {
    return (
      <Box maxW="3xl" mx="auto" py={8}>
        <Box textAlign="center" py={12}>
          <Text fontSize="5xl" mb={4}>
            🍽️
          </Text>
          <Heading size="md" color="text.primary" mb={2}>
            No potlucks yet!
          </Heading>
          <Text color="text.muted">
            Start one above and it&apos;ll show up here.
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box maxW="3xl" mx="auto" py={8}>
      <Heading size="md" color="text.primary" mb={4}>
        Your Potlucks
      </Heading>
      <Grid
        gridTemplateColumns={{ base: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }}
        gap={4}
      >
        <AnimatePresence>
          {sortedRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <PotluckCard
                room={room}
                onNavigate={handleNavigate}
                onRemove={handleRemove}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Grid>
    </Box>
  )
}

// doing default export so next/dynamic will stop complaining
export default PreviousRoomsList
