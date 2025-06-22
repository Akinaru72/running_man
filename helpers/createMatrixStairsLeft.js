// helpers/utils.js
export function createMatrixStairsLeft() {
  const rows = 21; // количество строк (0..20)
  const cols = 32; // количество столбцов (0..31)

  // Координаты кирпичей из твоего списка
  const stairsLeftCoords = [
    [3, 28],
    [6, 29],
    [10, 13],
    [15, 25],
    // -----------------------------------------------------
    [4, 27],
    [5, 26],
    [7, 28],
    [8, 27],
    [9, 26],
    [11, 12],
    [12, 11],
    [13, 10],
    [14, 9],
    [16, 24],
    [17, 23],
    [18, 22],
    [19, 21],
  ];

  // Создаем пустую матрицу, заполненную 0
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  // Заполняем 1 в местах кирпичей
  for (const [x, y] of stairsLeftCoords) {
    if (x >= 0 && x < rows && y >= 0 && y < cols) {
      matrix[x][y] = 1;
    }
  }

  // Можно проверить (вывести в консоль)
  console.log(matrix);
  return matrix;
}
