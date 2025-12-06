function gcd(a, b) {
  while (b !== 0) {
    const temp = a % b;
    a = b;
    b = temp;
  }

  return a;
}

console.log(`gcd(48, 18) = ${gcd(48, 18)}`);
console.log(`gcd(54, 24) = ${gcd(54, 24)}`);
console.log(`gcd(101, 10) = ${gcd(101, 10)}`);
console.log(`gcd(0, 5) = ${gcd(0, 5)}`);
console.log(`gcd(12, 0) = ${gcd(12, 0)}`);
console.log(`gcd(0, 0) = ${gcd(0, 0)}`);