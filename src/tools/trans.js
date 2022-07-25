module.exports.maxPage = (length, npp) => {
  return parseInt(length / npp) + (length % npp > 0 ? 1 : 0) + (length == 0 ? 1 : 0)
}