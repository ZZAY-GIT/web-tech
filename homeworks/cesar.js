function cesar(str, shift, action) {
  const alphabetLower = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
  const alphabetUpper = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
  const alphabetLength = 33;

  let effectiveShift = 0;
  if (action === 'encode') {
    effectiveShift = shift;
  } else if (action === 'decode') {
    effectiveShift = -shift;
  } else {
    return 'Ошибка: неверное действие. Используйте "encode" или "decode".';
  }

  let result = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    let index = -1;
    let isUpperCase = false;

    for (let j = 0; j < alphabetLength; j++) {
      if (char === alphabetLower[j]) {
        index = j;
        break;
      }
    }

    if (index === -1) {
      isUpperCase = true;
      for (let j = 0; j < alphabetLength; j++) {
        if (char === alphabetUpper[j]) {
          index = j;
          break;
        }
      }
    }

    if (index === -1) {
      result += char;
    } else {
      let newIndex = (index + effectiveShift) % alphabetLength;
      if (newIndex < 0) {
        newIndex += alphabetLength;
      }

      if (isUpperCase) {
        result += alphabetUpper[newIndex];
      } else {
        result += alphabetLower[newIndex];
      }
    }
  }

  return result;
}

const originalString = 'Хорошо, это 7-ая задача!';
const shiftValue = 7;

const encodedString = cesar(originalString, shiftValue, 'encode');
console.log('Оригинал: ', originalString);
console.log('Зашифровано:', encodedString);

const decodedString = cesar(encodedString, shiftValue, 'decode');
console.log('Расшифровано:', decodedString);