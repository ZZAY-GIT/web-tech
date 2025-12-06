function getSortedArray(array, key) {
  const length = array.length;
  const sortedArray = new Array(length);
  for (let i = 0; i < length; i++) {
    sortedArray[i] = array[i];
  }

  for (let i = 0; i < length - 1; i++) {
    for (let j = 0; j < length - 1 - i; j++) {
      const valA = sortedArray[j][key];
      const valB = sortedArray[j + 1][key];

      if (valA > valB) {
        const temp = sortedArray[j];
        sortedArray[j] = sortedArray[j + 1];
        sortedArray[j + 1] = temp;
      }
    }
  }

  return sortedArray;
}

const users = [
  { name: 'John', age: 25 },
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 22 },
  { name: 'Charlie', age: 25 }
];

console.log('--- Исходный массив ---');
console.log(users);

console.log('\n--- Сортировка по имени ---');
const sortedByName = getSortedArray(users, 'name');
console.log(sortedByName);

console.log('\n--- Сортировка по возрасту ---');
const sortedByAge = getSortedArray(users, 'age');
console.log(sortedByAge);