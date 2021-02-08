export const createTxError = (error: Error | any) => {
  if (error.code && error.code === 4001) {
    return new Error(`${error.message}`);
  } else {
    return new Error(`${error.code}, ${error.error.message}`);
  }
};
