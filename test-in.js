const a = { 1: 1, 2: 2 }
console.log((() => ({
  ...a,
})).toString())
