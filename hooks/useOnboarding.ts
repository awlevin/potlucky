import { useEffect } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useToast } from "@chakra-ui/react";

interface UseOnboardingProps {
  hasClaimedUserBefore: boolean;
  hasClaimedFoodBefore: boolean;
}

export function useOnboarding({
  hasClaimedUserBefore,
  hasClaimedFoodBefore,
}: UseOnboardingProps) {
  const [hasCompletedOnboardingBefore, setHasCompletedOnboardingBefore] =
    useLocalStorage("hasCompletedOnboardingBefore", false);
  const isOnboardingComplete = hasClaimedUserBefore && hasClaimedFoodBefore;
  const toast = useToast();

  useEffect(() => {
    if (isOnboardingComplete && !hasCompletedOnboardingBefore) {
      toast({
        title: "Yay! You did it! 🎉",
        description: "You're a potlucking pro! Have fun! 🥳",
        status: "success",
        isClosable: true,
        position: "top",
      });
      setHasCompletedOnboardingBefore(true);
    }
  }, [isOnboardingComplete, hasCompletedOnboardingBefore]);

  return {
    hasCompletedOnboardingBefore,
    isOnboardingComplete,
  };
} 