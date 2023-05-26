export interface OnExit {
  add: (callback: () => Promise<void>) => void;
  execute: () => Promise<void>;
}

const callbackList: Array<() => Promise<void>> = []

const onExit: OnExit = {
  add: function (callback: () => Promise<void>) {
    callbackList.push(callback)
  },
  execute: async function () {
    await Promise.all(callbackList.map(fn => fn()))
  }
}
export default onExit
