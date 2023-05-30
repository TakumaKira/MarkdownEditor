export default class OnExitManager {
  private callbackList: Array<() => Promise<void>> = []

  add(callback: () => Promise<void>) {
    this.callbackList.push(callback)
  }
  async execute() {
    await Promise.all(this.callbackList.map(fn => {return fn()}))
  }
}
