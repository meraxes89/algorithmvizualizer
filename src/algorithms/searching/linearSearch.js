export async function linearSearch(array, target, setCurrentIndex, setFoundIndex, setSearchRange, speed = 200) {
  for (let i = 0; i < array.length; i++) {
    setSearchRange?.([i, array.length - 1]);
    setCurrentIndex(i);
    await new Promise(resolve => setTimeout(resolve, speed));

    if (array[i] === target) {
      setFoundIndex(i);
      await new Promise(resolve => setTimeout(resolve, speed));
      return i;
    }
  }

  setCurrentIndex(-1);
  return -1;
}

export const linearSearchInfo = {
  name: "Linear Search",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Linear Search sequentially checks each element of the array until the target is found or the array ends."
};
