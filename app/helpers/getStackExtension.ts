import { techStacks } from "@/constants/constants";

export function getStackExtension(stacks: string[]) {
  return techStacks.filter((stackObj) =>
    stacks.some(
      (input) => input.trim().toLowerCase() === stackObj.stack.toLowerCase()
    )
  );
}

