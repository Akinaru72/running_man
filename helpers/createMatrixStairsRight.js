// helpers/utils.js
export function createMatrixStairsRight() {
  const rows = 21; // количество строк (0..20)
  const cols = 32; // количество столбцов (0..31)

  // Координаты кирпичей из твоего списка
  const stairsRightCoords = [
    [3, 3],
    [6, 2],
    [10, 18],
    [15, 6],
    // ----------------------------------------
    [4, 4],
    [5, 5],
    [7, 3],
    [8, 4],
    [9, 5],
    [11, 19],
    [12, 20],
    [13, 21],
    [14, 22],
    [16, 7],
    [17, 8],
    [18, 9],
    [19, 10],
  ];

  // Создаем пустую матрицу, заполненную 0
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  // Заполняем 1 в местах кирпичей
  for (const [x, y] of stairsRightCoords) {
    if (x >= 0 && x < rows && y >= 0 && y < cols) {
      matrix[x][y] = 1;
    }
  }

  // Можно проверить (вывести в консоль)
  console.log(matrix);
  return matrix;
}
