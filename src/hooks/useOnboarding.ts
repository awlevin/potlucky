import { useEffect } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { toaster } from "@/components/ui/toaster";

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

  useEffect(() => {
    if (isOnboardingComplete && !hasCompletedOnboardingBefore) {
      toaster.create({
        title: "Yay! You did it! 🎉",
        description: "You're a potlucking pro! Have fun! 🥳",
        type: "success",
        // isClosable: true,
        // position: "top",
      });
      setHasCompletedOnboardingBefore(true);
    }
  }, [isOnboardingComplete, hasCompletedOnboardingBefore, setHasCompletedOnboardingBefore]);

  return {
    hasCompletedOnboardingBefore,
    isOnboardingComplete,
  };
} 