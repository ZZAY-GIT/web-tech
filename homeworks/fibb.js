function fibb(n) {
  let a = 0n;
  let b = 1n;

  if (n === 0) {
    return a;
  }

  for (let i = 2; i <= n; i++) {
    const next = a + b;
    a = b;
    b = next;
  }

  return b;
}

console.log(`fibb(0) = ${fibb(0)}`);
console.log(`fibb(1) = ${fibb(1)}`);
console.log(`fibb(10) = ${fibb(10)}`);
console.log(`fibb(20) = ${fibb(20)}`);
console.log(`fibb(93) = ${fibb(93)}`);
console.log(`fibb(1000) = ${fibb(1000)}`);