function minDigit(x) {
  if (x === 0) {
    return 0;
  }

  let minFound = 9;

  while (x > 0) {
    const lastDigit = x % 10;

    if (lastDigit < minFound) {
      minFound = lastDigit;
    }
    
    if (minFound === 0) {
      return 0;
    }

    x = (x / 10) | 0;
  }

  return minFound;
}

console.log(`minDigit(5279) = ${minDigit(5279)}`);
console.log(`minDigit(111) = ${minDigit(111)}`);
console.log(`minDigit(90817) = ${minDigit(90817)}`);
console.log(`minDigit(5) = ${minDigit(5)}`);
console.log(`minDigit(0) = ${minDigit(0)}`);