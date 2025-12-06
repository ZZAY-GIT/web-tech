function pluralizeRecords(n) {
  let word;

  if (n % 100 >= 11 && n % 100 <= 14) {
    word = "записей";
  } else if (n % 10 === 1) {
    word = "запись";
  } else if (n % 10 >= 2 && n % 10 <= 4) {
    word = "записи";
  } else {
    word = "записей";
  }

  return `В результате выполнения запроса было найдено ${n} ${word}`;
}

console.log(pluralizeRecords(1));
console.log(pluralizeRecords(21));
console.log(pluralizeRecords(101));
console.log(pluralizeRecords(2));
console.log(pluralizeRecords(4));
console.log(pluralizeRecords(22));
console.log(pluralizeRecords(0));
console.log(pluralizeRecords(5));
console.log(pluralizeRecords(10));
console.log(pluralizeRecords(11));
console.log(pluralizeRecords(12));
console.log(pluralizeRecords(14));
console.log(pluralizeRecords(111));