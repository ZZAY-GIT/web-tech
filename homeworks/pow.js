function pow(x, n) {
  if (n < 0) {
    return "Ошибка: показатель степени n должен быть целым числом (n >= 0).";
  }

  if (n === 0) {
    return 1;
  }

  let result = 1;

  for (let i = 0; i < n; i++) {
    result *= x;
  }

  return result;
}

console.log(`pow(2, 3) = ${pow(2, 3)}`);
console.log(`pow(5, 2) = ${pow(5, 2)}`);
console.log(`pow(10, 1) = ${pow(10, 1)}`);
console.log(`pow(7, 0) = ${pow(7, 0)}`);
console.log(`pow(-3, 3) = ${pow(-3, 3)}`);
console.log(`pow(2, -2) = ${pow(2, -2)}`);