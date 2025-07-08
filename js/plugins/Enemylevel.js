/*:
 * @plugindesc Escala las stats base de todos los enemigos para simular un nivel fijo.
 * @author Joshua
 * @help
 * Cambia la variable 'nivelFijo' para ajustar el nivel deseado para todos los enemigos.
 */

(() => {
  const nivelFijo = 5;

  const escalarStatsEnemigos = () => {
    if (!$dataEnemies) {
      console.log("No se encontró $dataEnemies");
      return;
    }

    for (let i = 1; i < $dataEnemies.length; i++) {
      const enemy = $dataEnemies[i];
      if (!enemy) continue;

      const nivelOriginal = enemy.level || 1;
      const factor = nivelFijo / nivelOriginal;

      for (let j = 0; j < enemy.params.length; j++) {
        enemy.params[j] = Math.round(enemy.params[j] * factor);
      }

      enemy.level = nivelFijo;
    }
    console.log(`Stats base de enemigos escaladas para nivel ${nivelFijo}`);
  };

  const _Scene_Map_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function () {
    _Scene_Map_start.call(this);
    escalarStatsEnemigos();
  };
})();
