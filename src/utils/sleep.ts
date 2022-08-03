export const sleep = async (ms: number, hideLog = false): Promise<void> => {
  return new Promise((resolve) => {
    if (!hideLog) console.log(`\n\tSleeping for ${ms / 1000} seconds\n`);
    setTimeout(resolve, ms);
  });
};

export default sleep;
